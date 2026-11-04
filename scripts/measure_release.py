"""Measure a release build of Terminal with synthetic, disposable profiles (macOS).

Build first:  npm run tauri -- build --no-bundle --features startup-metrics
Then:         python3 -I scripts/measure_release.py src-tauri/target/release/terminal-journal \
                  src-tauri/migrations/0001_initial.sql tests/fixtures/formatted-entry.json <empty scratch folder> 5

Each run launches the binary with HOME pointed at a throwaway profile (never the
real journal), records the startup milestones printed by the measurement build,
samples memory of the app and the WebKit helper processes it started, lists any
network sockets, then kills the app abruptly and checks database integrity and
file permissions. See docs/PERFORMANCE.md.
"""
import json, os, select, shutil, signal, sqlite3, statistics, subprocess, sys, time

binary, migration, fixture, workdir, runs = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], int(sys.argv[5])
APP_ID = 'com.arlecchino.terminal'


def data_dir(home):
    return os.path.join(home, 'Library', 'Application Support', APP_ID)


def make_profile(name, entries):
    home = os.path.join(workdir, name)
    shutil.rmtree(home, ignore_errors=True)
    os.makedirs(data_dir(home))
    if entries:
        db = sqlite3.connect(os.path.join(data_dir(home), 'journal.sqlite3'))
        db.executescript(open(migration).read())
        db.execute('PRAGMA user_version=1')
        content = open(fixture).read()
        db.executemany(
            'INSERT INTO entries(id,entry_number,title,content,schema_version,created_at,updated_at) VALUES (?,?,?,?,1,?,?)',
            [(f'00000000-0000-4000-b000-{n:012d}', n, f'Synthetic measurement {n}', content, 1_700_000_000_000, 1_700_000_000_000 + n) for n in range(1, entries + 1)])
        db.execute('UPDATE entry_sequence SET next_number=?', (entries + 1,))
        db.execute("INSERT INTO settings VALUES ('last_entry', ?)", (json.dumps(f'00000000-0000-4000-b000-{entries:012d}'),))
        db.commit()
        db.close()
    return home


def webkit_pids():
    out = subprocess.run(['ps', '-axo', 'pid=,comm='], capture_output=True, text=True).stdout
    return {int(l.split()[0]) for l in out.splitlines() if 'com.apple.WebKit' in l}


def rss_kb(pids):
    if not pids:
        return {}
    out = subprocess.run(['ps', '-o', 'pid=,rss=,comm=', '-p', ','.join(map(str, pids))], capture_output=True, text=True).stdout
    return {int(l.split()[0]): (int(l.split()[1]), l.split(None, 2)[2].rsplit('/', 1)[-1]) for l in out.splitlines() if l.strip()}


def sockets(pids):
    if not pids:
        return ''
    return subprocess.run(['lsof', '-nP', '-a', '-i', '-p', ','.join(map(str, pids))], capture_output=True, text=True).stdout.strip()


def run_once(home):
    before = webkit_pids()
    env = dict(os.environ, HOME=home)
    start = time.monotonic()
    proc = subprocess.Popen([binary], env=env, stderr=subprocess.PIPE, stdout=subprocess.DEVNULL, text=True)
    marks, stderr_lines = {}, []
    deadline = start + 30
    while time.monotonic() < deadline and 'journal-requested' not in marks:
        ready, _, _ = select.select([proc.stderr], [], [], 0.5)
        if ready:
            line = proc.stderr.readline()
            if not line:
                break
            stderr_lines.append(line.rstrip())
            parts = line.split()
            if len(parts) == 4 and parts[0] == 'startup-metrics':
                marks[parts[1]] = int(parts[2])
    wall_ready = (time.monotonic() - start) * 1000
    time.sleep(5)
    helpers = webkit_pids() - before
    memory = rss_kb({proc.pid} | helpers)
    net = sockets({proc.pid} | helpers)
    proc.send_signal(signal.SIGKILL)
    proc.wait()
    rest = proc.stderr.read()
    stderr_lines += rest.splitlines()
    db_path = os.path.join(data_dir(home), 'journal.sqlite3')
    db = sqlite3.connect(db_path)
    integrity = db.execute('PRAGMA integrity_check').fetchone()[0]
    count = db.execute('SELECT count(*) FROM entries').fetchone()[0]
    db.close()
    mode = {p: oct(os.stat(p).st_mode & 0o777) for p in (data_dir(home), db_path)}
    return dict(marks=marks, wall_ready_ms=round(wall_ready), memory=memory, sockets=net, integrity=integrity, entries=count,
                modes=mode, other_stderr=[l for l in stderr_lines if not l.startswith('startup-metrics')])


results = {}
for name, entries in (('empty', 0), ('archive-5000', 5000)):
    home = make_profile(name, entries)
    rows = [run_once(home) for _ in range(runs)]
    results[name] = rows
    ready = [r['marks'].get('journal-requested') for r in rows if 'journal-requested' in r['marks']]
    page = [r['marks'].get('page-loaded') for r in rows if 'page-loaded' in r['marks']]
    main = [r['memory'].get(min(r['memory']), (0,))[0] for r in rows if r['memory']]
    print(f'== {name}: {runs} runs')
    print(f'   page-loaded ms: {page}  median {statistics.median(page) if page else None}')
    print(f'   journal-requested ms: {ready}  median {statistics.median(ready) if ready else None}')
    for r in rows:
        total = sum(v[0] for v in r['memory'].values())
        detail = ', '.join(f"{v[1]} {v[0] // 1024} MB" for v in r['memory'].values())
        print(f"   rss total {total // 1024} MB ({detail}); sockets: {r['sockets'] or 'none'}; integrity {r['integrity']}; entries {r['entries']}; modes {list(r['modes'].values())}")
    print(f"   unexpected stderr: {sorted(set(l for r in rows for l in r['other_stderr']))[:5]}")
json.dump(results, open(os.path.join(workdir, 'results.json'), 'w'), indent=1)
