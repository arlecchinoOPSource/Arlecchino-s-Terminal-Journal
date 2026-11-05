# Terminal by Arlecchino

A private desktop journal for macOS and Windows. Write in rich text, find an older entry by title, and take your journal with you as a backup. Terminal saves to your device and works offline.

**[Download Terminal 2.0.1](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/releases/tag/v2.0.1)**

| Your computer | Choose this download | Install |
| --- | --- | --- |
| Mac with Apple silicon or Intel | Universal `.dmg` | Open the disk image and drag Terminal to Applications. |
| Windows 10 or 11, x64 | `-setup.exe` | Run the installer for your Windows account. An `.msi` is also available for managed installations. |

Downloads are under **Assets** on the release page. The source archives are for development. The Windows installer may download WebView2 once if it is missing. See the [platform and signing notes](docs/RELEASE.md) for first-open prompts and the [release checklist](docs/RELEASE-CHECKLIST-v1.0.md) for verification limits.

## Your first entry

1. Open Terminal, give the draft a title, and start writing. Use the toolbar for headings, lists, tables, and text formatting.
2. Wait for **Saved** before quitting. The last entry reopens when you return. Use **New entry** for a fresh page.
3. Use **Archives** to browse recent entries or **Search** to find a title. To take a copy elsewhere, export an entry as HTML or plain text, or export a JSON backup of the whole journal.

## Where your writing lives

Terminal stores entries in a local SQLite database. There are no accounts, analytics, ads, or cloud sync. On Windows, Terminal's interface runs in Microsoft Edge WebView2, a system component. WebView2 can make its own connections to Microsoft, which Terminal doesn't control ([details](docs/RELEASE.md#what-gets-built)). The journal relies on your operating system’s account permissions and disk encryption. Exported backups contain readable writing. Keep them somewhere you control. Uninstalling Terminal leaves your journal on the device. [Storage locations and uninstall details](docs/RELEASE.md#clean-machine-checklist)

## Development

**Next release: Terminal 2.0.1** (bug fixes; in review, not yet published). See the [changelog](CHANGELOG.md) for what changes. The 2.0 specification, [ordered backlog](docs/BACKLOG-v2.0.md), and [development guide](docs/DEVELOPMENT-v2.0.md) describe the 2.0 release; Word/DOCX support is deferred to 3.0.

Install the [development prerequisites](docs/DEVELOPMENT.md), run `npm ci`, then `npm run dev` to open the desktop app. Run `npm run check` for the regression suite. Use synthetic entries for testing and bug reports.

[Architecture](docs/ARCHITECTURE.md) · [Design system](docs/UI-DESIGN-SYSTEM-v0.3.md) · [Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md) · [MIT license](LICENSE)
