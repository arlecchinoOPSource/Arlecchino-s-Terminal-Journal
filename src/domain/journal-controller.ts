import { createDraft } from './draft.ts';
import type { DraftDocument } from './draft.ts';
import type { Entry, EntrySummary, JournalRepository, SaveDraft } from '../persistence/repository.ts';
export interface JournalState { draft: SaveDraft; entry: Entry | null; entries: EntrySummary[]; status: 'Loading…' | 'Unsaved changes' | 'Saving…' | 'Saved' | 'Empty draft' | 'Save failed' | 'Storage unavailable'; error: string | null; busy: boolean; ready: boolean }
const message = (error: unknown) => error instanceof Error ? error.message : typeof error === 'string' ? error : 'Storage is unavailable. Your writing remains in this window.';
export class JournalController {
  private state: JournalState = { draft: {...createDraft(),id:crypto.randomUUID(),revision:0}, entry:null,entries:[],status:'Loading…',error:null,busy:true,ready:false };
  private listeners = new Set<()=>void>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  private generation=0;
  private savedGeneration=0;
  private writing: Promise<void> | null=null;
  private repo: JournalRepository;
  private delay: number;
  constructor(repo: JournalRepository, delay=400) {this.repo=repo;this.delay=delay;}
  snapshot = (): JournalState => this.state;
  subscribe = (listener:()=>void):(()=>void) => {this.listeners.add(listener);return ()=>{this.listeners.delete(listener);};};
  private publish(patch:Partial<JournalState>) {this.state={...this.state,...patch};this.listeners.forEach(l=>l());}
  async initialize() {
    try {const [entry,entries]=await Promise.all([this.repo.last(),this.repo.list()]);this.activate(entry);this.publish({entries,ready:true,busy:false,error:null});}
    catch(error){this.publish({error:message(error),busy:false,status:'Storage unavailable'});}
  }
  private activate(entry:Entry|null) {
    this.generation=0;this.savedGeneration=0;
    this.publish({entry,draft:entry ? {...entry} : {...createDraft(),id:crypto.randomUUID(),revision:0},status:entry?'Saved':'Empty draft',error:null});
  }
  edit(patch:Partial<Pick<DraftDocument,'title'|'content'>>) {
    if (!this.state.ready || this.state.busy) return;
    this.generation++;
    this.publish({draft:{...this.state.draft,...patch},status:'Unsaved changes'});
    clearTimeout(this.timer);
    this.timer=setTimeout(()=>{void this.flush().catch(()=>{});},this.delay);
  }
  async flush():Promise<void> {
    clearTimeout(this.timer);
    if (this.writing) {await this.writing;return this.flush();}
    if (this.generation===this.savedGeneration) return;
    this.writing=this.writePending();
    try {await this.writing;} finally {this.writing=null;}
  }
  private async writePending() {
    while(this.generation!==this.savedGeneration) {
      const version=this.generation;const draft=this.state.draft;
      this.publish({status:'Saving…',error:null});
      try {
        const entry=await this.repo.save(draft);
        this.savedGeneration=version;
        this.publish({entry,draft:{...this.state.draft,revision:entry?.revision??0},status:this.generation===version?(entry?'Saved':'Empty draft'):'Unsaved changes'});
      } catch(error) {this.publish({status:'Save failed',error:message(error)});throw error;}
    }
    // Listing failure must not misrepresent a successful commit as an unsaved one.
    try {this.publish({entries:await this.repo.list()});} catch {this.publish({error:'Writing was saved, but the entry list could not refresh. Retry navigation.'});}
  }
  async switchTo(id:string|null) {
    if(this.state.busy || !this.state.ready)return;
    this.publish({busy:true});
    try {await this.flush();const entry=await this.repo.select(id);this.activate(entry);this.publish({entries:await this.repo.list()});}
    catch(error){this.publish({error:message(error)});} finally {this.publish({busy:false});}
  }
  async prepareClose() {
    this.publish({busy:true});
    try {await this.flush();} catch(error) {this.publish({busy:false});throw error;}
  }
  async remove() {
    if(this.state.busy || !this.state.entry)return;
    this.publish({busy:true});
    try {await this.flush();const entry=this.state.entry;if(!entry)return;await this.repo.delete(entry.id,entry.revision);this.activate(null);this.publish({entries:await this.repo.list()});}
    catch(error){this.publish({error:message(error)});} finally {this.publish({busy:false});}
  }
}
