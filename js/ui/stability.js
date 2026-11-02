// =====================================================================================
//  IDOLVERSE48: Select Bloom! — stability & data-safety layer
// -------------------------------------------------------------------------------------
//  SAVE SAFETY
//  · Every autosave is written to localStorage AND mirrored to IndexedDB (much larger
//    quota). A full localStorage no longer loses progress silently; a banner explains it.
//  · Loading picks the newest valid copy (localStorage or IndexedDB), repairs missing
//    fields instead of rejecting the save, and never starts a new game on its own.
//  · Refreshing the page resumes the existing save directly.
//  · A save that cannot be read shows a recovery screen (backup, download raw data).
//  · Before a migration on load and before "New Game" replaces a save, a backup copy
//    of the previous save is kept in IndexedDB.
//  · Save slots are stored in IndexedDB (moved out of localStorage, which they filled).
//  RUNTIME SAFETY
//  · A broken screen shows an error panel with a way back instead of freezing.
//  · Each scheduled event of a day runs in isolation, so one faulty event can no longer
//    stop "Next Day" from advancing and saving.
//  · References to graduated members are removed from upcoming schedules.
// =====================================================================================
const SAVE_V=2;
const SV={db:null,ready:false,idbMain:null,warn:null,lastErr:null,t:null,bad:null};
function svOpen(){return new Promise(res=>{try{const r=indexedDB.open('idolverse48',1);r.onupgradeneeded=()=>{try{r.result.createObjectStore('kv')}catch(e){}};r.onsuccess=()=>{SV.db=r.result;res(true)};r.onerror=()=>res(false);r.onblocked=()=>res(false)}catch(e){res(false)}})}
function svGet(k){return new Promise(res=>{if(!SV.db)return res(null);try{const q=SV.db.transaction('kv','readonly').objectStore('kv').get(k);q.onsuccess=()=>res(q.result??null);q.onerror=()=>res(null)}catch(e){res(null)}})}
function svPut(k,v){return new Promise(res=>{if(!SV.db)return res(false);try{const tx=SV.db.transaction('kv','readwrite');tx.objectStore('kv').put(v,k);tx.oncomplete=()=>res(true);tx.onerror=()=>res(false);tx.onabort=()=>res(false)}catch(e){res(false)}})}
function svDel(k){return new Promise(res=>{if(!SV.db)return res(false);try{const tx=SV.db.transaction('kv','readwrite');tx.objectStore('kv').delete(k);tx.oncomplete=()=>res(true);tx.onerror=()=>res(false)}catch(e){res(false)}})}
const svValid=s=>!!(s&&typeof s=='object'&&Array.isArray(s.members)&&Array.isArray(s.groups)&&typeof s.money=='number'&&isFinite(s.money));
// fill in missing structural fields instead of rejecting a save
function svRepair(s){if(!Array.isArray(s.led))s.led=[];if(!s.sen||!Array.isArray(s.sen.slots))s.sen={slots:Array(16).fill(null),center:null};if(s.sen.slots.length!=16)s.sen.slots=[...s.sen.slots,...Array(16).fill(null)].slice(0,16);
 if(typeof s.day!='number'||!isFinite(s.day))s.day=0;if(typeof s.fans!='number'||!isFinite(s.fans))s.fans=0;['singles','albums','cal'].forEach(k=>{if(!Array.isArray(s[k]))s[k]=[]});if(!s.songs||typeof s.songs!='object')s.songs={};if(typeof s.sid!='number')s.sid=1000;return s}
function svParse(raw){if(!raw)return null;try{const s=JSON.parse(raw);return svValid(s)?svRepair(s):null}catch(e){return null}}
const svNewer=(a,b)=>!b||((a._ts||0)!=(b._ts||0)?(a._ts||0)>(b._ts||0):(a.day||0)>(b.day||0));
load=function(){let ls=null;try{ls=localStorage.getItem(KEY)}catch(e){}const A=svParse(ls),B=svParse(SV.idbMain);SV.bad=(ls&&!A)?ls:null;if(A&&B)return svNewer(B,A)?B:A;return A||B||null};
save=function(){if(!S||!svValid(S))return;let j;try{S._ts=Date.now();S._sv=SAVE_V;j=JSON.stringify(S)}catch(e){SV.lastErr='The game state could not be saved: '+e.message;console.error(e);return}
 let ok=true;try{localStorage.setItem(KEY,j)}catch(e){ok=false}SV.idbMain=j;clearTimeout(SV.t);SV.t=setTimeout(()=>{svPut('main',j).then(r=>{if(!r&&!ok)SV.warn='Your browser refused to store the game. Export a save file now (Management › Save & Load) to keep your progress.'})},250);
 SV.warn=ok?null:(SV.db?'Browser storage is almost full, so the game is now saved in the larger IndexedDB backup storage. To be safe, export a save file from Management › Save & Load.':'Browser storage is full and the game could not be saved. Export a save file from Management › Save & Load now.')};
function svFlush(){if(!S)return Promise.resolve();save();clearTimeout(SV.t);return svPut('main',SV.idbMain)}
window.addEventListener('pagehide',()=>{try{if(S&&!ui.t)save()}catch(e){}});
document.addEventListener('visibilitychange',()=>{try{if(document.visibilityState=='hidden'&&S)svFlush()}catch(e){}});
// load an existing save: back it up first, then migrate; a migration problem never drops the save
cont=function(){const s=load();if(!s){if(SV.bad)return svRecover();return toast('No saved game was found in this browser. Start a New Game or import a save file.','err')}
 const raw=JSON.stringify(s);svPut('bak_load',raw);S=s;try{migrate()}catch(e){console.error('migrate',e);SV.lastErr='Part of the save could not be updated ('+e.message+'). Your data was kept and a backup was stored.'}
 try{ui.g=S.groups[0]?.id}catch(e){}ui.t=false;ui.recov=null;view='dash';toast('Save loaded.');render()};
function svRecover(){ui.recov=1;ui.t=true;render()}
function svDownloadRaw(raw,name){try{const b=new Blob([raw],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}catch(e){toast('Download failed.','err')}}
async function svTryBackup(){for(const k of ['bak_load','bak_newgame','main']){const raw=await svGet(k),s=svParse(raw);if(s){S=s;try{migrate()}catch(e){console.error(e)}ui.t=false;ui.recov=null;view='dash';save();toast('Backup restored.');return render()}}toast('No usable backup was found.','err')}
// New Game never silently replaces an existing save
const _svStart=startNew;startNew=function(){const ex=load();if(ex&&!ui.ngOk){ask(`Start a new game? Your current save “${ex.co||'Agency'}” (day ${ex.day}) will be replaced. A backup copy is kept and can be restored from the title screen.`,()=>{svPut('bak_newgame',JSON.stringify(ex)).then(()=>{ui.ngOk=1;try{startNew()}finally{ui.ngOk=0}})},'Start new game');return}return _svStart.apply(this,arguments)};
// title screen: recovery panel / backup restore
const _svTitle=titleScreen;titleScreen=function(ok){let h=_svTitle.apply(this,arguments);if(ui.recov&&SV.bad){h=h.replace('<div class="tbtn">',`<div class="c svrec"><h3>⚠ Your save could not be read</h3><p class="st">The saved data in this browser is damaged or incomplete. Nothing was deleted. You can restore the latest backup or download the raw data.</p><div class="row"><button class="b p" onclick="svTryBackup()">Restore backup</button><button class="b" onclick="svDownloadRaw(SV.bad,'IDOLVERSE48_raw_save.json')">Download raw save data</button></div></div><div class="tbtn">`)}
 return h.replace('</div>\n <details class="c newg"',`<button class="b s" onclick="svTryBackup()">Restore a backup</button></div>\n <details class="c newg"`)};
const _svImport=uiImport;uiImport=function(inp){const f=inp.files&&inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const s=svParse(r.result);if(!s)return toast('That file is not a valid IDOLVERSE48 save.','err');ask(`Import "${s.co||'save'}" (day ${s.day})? Your current progress in this browser will be replaced (a backup is kept).`,()=>{if(S)svPut('bak_newgame',JSON.stringify(S));SV.idbMain=JSON.stringify(s);try{localStorage.setItem(KEY,SV.idbMain)}catch(e){}svPut('main',SV.idbMain).then(()=>cont())},'Import')};r.readAsText(f);inp.value=''};

// ---- runtime guards ------------------------------------------------------------------------
const _svRender=render;render=function(){try{return _svRender.apply(this,arguments)}catch(e){console.error('render',e);SV.lastErr=e.message;const a=$('#app');if(a)a.innerHTML=`<div class="c svcrash"><h2 class="ht">Something went wrong on this screen</h2><p class="st">Your game is safe and was saved. Error: ${esc(String(e.message||e))}</p><div class="row"><button class="b p" onclick="ui.mod=null;view='dash';render()">Back to the Office</button><button class="b" onclick="ui.mod=null;render()">Try again</button></div></div>`}};
// one faulty scheduled event must not stop the day from advancing
promoDay=function(){(S.cal||[]).forEach(ev=>{if(ev.done)return;try{if(ev.type=='handshake'){if(!ev.rid)return;const fn=ev.v==2?hsRun2:hsRun;if(S.day>=ev.day&&!ev.r1)fn(ev,1);if(S.day>=ev.day2&&!ev.r2)fn(ev,2)}else if(ev.type=='road'){if(ev.v==2){if(S.day>=ev.day&&!ev.d1)rsRun(ev,1);if(S.day>=ev.day+1&&!ev.d2)rsRun(ev,2);return}if(S.day>=ev.day&&!ev.res)roadRun(ev);if(S.day>=ev.day+(ev.dur||1)-1&&ev.res)ev.done=true}}catch(e){console.error('event',ev.id,e);ev.err=(ev.err||0)+1;if(ev.err>=3){ev.done=true;ev.failed=e.message;toast(`An event could not run and was skipped: ${ev.title||ev.type}.`,'err')}}});calTrim()};
const _svAdv=adv;adv=function(){if(ui.advBusy)return;ui.advBusy=1;try{return _svAdv.apply(this,arguments)}catch(e){console.error('adv',e);toast('The day advanced, but something failed: '+e.message,'err');render()}finally{ui.advBusy=0}};
// graduated members: remove them from upcoming schedules and plans
function svCleanRefs(){if(!S||!(S.alumni||[]).length)return;const gone=new Set(S.alumni.map(m=>m.id)),f=a=>Array.isArray(a)?a.filter(id=>!gone.has(id)):a;
 (S.cal||[]).forEach(e=>{if(e.done)return;if(Array.isArray(e.members))e.members=f(e.members);if(e.plan&&Array.isArray(e.plan.rows))e.plan.rows=e.plan.rows.filter(r=>!gone.has(r.mid))});
 [...S.singles,S.pj].filter(Boolean).forEach(x=>{if(x.hs){if(Array.isArray(x.hs.members))x.hs.members=f(x.hs.members);(x.hs.groups||[]).forEach(g=>{if(Array.isArray(g.members))g.members=f(g.members);if(Array.isArray(g.ids))g.ids=f(g.ids)})}});if(ui.rsp&&Array.isArray(ui.rsp.sel))ui.rsp.sel=f(ui.rsp.sel)}
const _svMig=migrate;migrate=function(){const r=_svMig.apply(this,arguments);try{svCleanRefs();svSlotsMove()}catch(e){console.error(e)}return r};
const _svGrad=graduateMember;graduateMember=function(mid){const r=_svGrad.apply(this,arguments);const t=setInterval(()=>{if(!S||!get(mid)){clearInterval(t);try{svCleanRefs()}catch(e){}}},150);setTimeout(()=>clearInterval(t),60000);return r};

// ---- save slots live in IndexedDB (localStorage keeps only the autosave) ------------------------------
const SV_SLOT={};
async function svSlotsLoad(){for(let n=1;n<=FB_SLOTS;n++){SV_SLOT[n]=await svGet('slot'+n)}}
async function svSlotsMove(){if(!SV.db)return;for(let n=1;n<=FB_SLOTS;n++){let raw=null;try{raw=localStorage.getItem(slotKey(n))}catch(e){}if(raw&&!SV_SLOT[n]){const ok=await svPut('slot'+n,raw);if(ok){SV_SLOT[n]=raw;try{localStorage.removeItem(slotKey(n))}catch(e){}}}}}
slotInfo=function(n){const s=svParse(SV_SLOT[n]||(()=>{try{return localStorage.getItem(slotKey(n))}catch(e){return null}})());return s};
slotSave=function(n){if(!S)return;const go=()=>{try{fbSync&&fbSync()}catch(e){}save();const j=JSON.stringify(S),prev=SV_SLOT[n];SV_SLOT[n]=j;toast(`Saved to slot ${n}.`);svPut('slot'+n,j).then(ok=>{if(!ok){SV_SLOT[n]=prev;toast('Could not store the slot (browser storage unavailable). Export a save file instead.','err')}render()})};if(slotInfo(n))ask(`Overwrite save slot ${n}?`,go,'Overwrite');else go()};
slotLoad=function(n){const s=slotInfo(n);if(!s)return toast('That slot is empty.','err');ask(`Load slot ${n}? The current game is replaced (it stays in the autosave backup).`,()=>{svPut('bak_newgame',JSON.stringify(S));S=s;try{migrate()}catch(e){console.error(e)}ui.mod=null;ui.t=false;view='dash';FBC={s:null,v:-1,val:null};toast(`Slot ${n} loaded.`);render()},'Load')};
slotDel=function(n){if(!slotInfo(n))return;ask(`Delete save slot ${n}?`,()=>{svDel('slot'+n).then(()=>{SV_SLOT[n]=null;try{localStorage.removeItem(slotKey(n))}catch(e){}render()})},'Delete')};

// ---- storage warning banner ------------------------------------------------------------------------
const _svChrome=chrome;chrome=function(h){const w=SV.warn||SV.lastErr;return _svChrome.call(this,(w?`<div class="svwarn" role="alert">⚠ ${esc(w)} <button class="b s" onclick="uiExport()">Export save</button><button class="b s" onclick="SV.warn=null;SV.lastErr=null;render()">Dismiss</button></div>`:'')+h)};

// ---- startup: read IndexedDB, then resume the existing save ------------------------------------------
(async function svBoot(){await svOpen();SV.idbMain=await svGet('main');await svSlotsLoad();SV.ready=true;
 const s=load();if(s&&ui.t&&!S){cont();return}if(!s&&SV.bad&&!S){svRecover();return}if(ui.t)render()})();
