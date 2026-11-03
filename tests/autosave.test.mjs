import test from 'node:test';
import assert from 'node:assert/strict';
import { JournalController } from '../src/domain/journal-controller.ts';
function fixture() {
  const rows=new Map();let number=0;const writes=[];
  const repo={last:async()=>null,list:async()=>[...rows.values()],select:async id=>rows.get(id)??null,delete:async id=>{rows.delete(id);},save:async d=>{writes.push({...d});const old=rows.get(d.id);const e={...d,revision:(old?.revision??0)+1,entry_number:old?.entry_number??++number,created_at:1,updated_at:1};rows.set(d.id,e);return e;}};
  return {repo,rows,writes};
}
test('edits during a slow write are serialized and latest content wins',async()=>{
  const {repo,writes}=fixture();const save=repo.save;let release;let entered;
  const started=new Promise(resolve=>{entered=resolve;});
  repo.save=async d=>{if(!writes.length){entered();await new Promise(resolve=>{release=resolve;});}return save(d);};
  const c=new JournalController(repo,60000);await c.initialize();c.edit({title:'First'});const pending=c.flush();await started;
  c.edit({title:'Latest'});assert.equal(c.snapshot().status,'Unsaved changes');release();await pending;await c.flush();
  assert.equal(writes.length,2);assert.equal(writes[1].revision,1);assert.equal(c.snapshot().draft.title,'Latest');assert.equal(c.snapshot().status,'Saved');
});
test('save failure retains dirty draft and blocks navigation and closing; retry succeeds',async()=>{
  const {repo}=fixture();const save=repo.save;repo.save=async()=>{throw new Error('Synthetic disk error');};
  const c=new JournalController(repo,60000);await c.initialize();const id=c.snapshot().draft.id;c.edit({title:'Keep this'});
  await c.switchTo(null);assert.equal(c.snapshot().draft.id,id);assert.equal(c.snapshot().draft.title,'Keep this');assert.equal(c.snapshot().status,'Save failed');
  await assert.rejects(c.prepareClose());assert.equal(c.snapshot().busy,false);
  repo.save=save;await c.flush();assert.equal(c.snapshot().status,'Saved');
});
test('entry switch flushes before selecting and starts isolated draft',async()=>{
  const {repo,writes}=fixture();const c=new JournalController(repo,60000);await c.initialize();const id=c.snapshot().draft.id;c.edit({title:'Original'});await c.switchTo(null);
  assert.equal(writes.length,1);assert.notEqual(c.snapshot().draft.id,id);await c.switchTo(id);assert.equal(c.snapshot().draft.title,'Original');
});
test('save does not show Saved while native commit is pending',async()=>{
 const {repo}=fixture();const save=repo.save;let release;repo.save=async d=>{await new Promise(resolve=>{release=resolve;});return save(d);};
 const c=new JournalController(repo,60000);await c.initialize();c.edit({title:'Synthetic'});const p=c.flush();assert.equal(c.snapshot().status,'Saving…');release();await p;assert.equal(c.snapshot().status,'Saved');
});
test('rapid entry switching keeps every pending edit',async()=>{
  const {repo,rows}=fixture();const c=new JournalController(repo,60000);await c.initialize();
  const a=c.snapshot().draft.id;c.edit({title:'Entry A'});
  const first=c.switchTo(null);const ignored=c.switchTo(a);await Promise.all([first,ignored]);
  const b=c.snapshot().draft.id;assert.notEqual(b,a);c.edit({title:'Entry B'});
  await c.switchTo(a);assert.equal(c.snapshot().draft.title,'Entry A');
  assert.equal(rows.get(a).title,'Entry A');assert.equal(rows.get(b).title,'Entry B');
});
test('debounced autosave commits without manual saving',async()=>{
  const {repo,rows}=fixture();const c=new JournalController(repo,10);await c.initialize();
  const id=c.snapshot().draft.id;c.edit({title:'Auto'});
  await new Promise(r=>setTimeout(r,60));await c.flush();
  assert.equal(rows.get(id)?.title,'Auto');assert.equal(c.snapshot().status,'Saved');
});
test('closing flushes pending edits before exit is allowed',async()=>{
  const {repo,rows}=fixture();const c=new JournalController(repo,60000);await c.initialize();
  const id=c.snapshot().draft.id;c.edit({title:'Before close'});await c.prepareClose();
  assert.equal(rows.get(id).title,'Before close');
});
test('opening and switching untouched entries does not write',async()=>{
  const {repo,writes}=fixture();const c=new JournalController(repo,60000);await c.initialize();
  const id=c.snapshot().draft.id;c.edit({title:'One'});await c.switchTo(null);const count=writes.length;
  await c.switchTo(id);await c.switchTo(null);await c.switchTo(id);assert.equal(writes.length,count);
});
test('storage startup failure is reported and editing stays disabled',async()=>{
  const {repo}=fixture();repo.last=async()=>{throw 'Could not open journal database';};
  const c=new JournalController(repo,60000);await c.initialize();
  assert.equal(c.snapshot().status,'Storage unavailable');assert.equal(c.snapshot().error,'Could not open journal database');
  c.edit({title:'ignored'});assert.equal(c.snapshot().draft.title,'');
});
