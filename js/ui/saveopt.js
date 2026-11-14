// =====================================================================================
//  Long-game performance: smaller saves and faster loading
// -------------------------------------------------------------------------------------
//  · Startup reads the save ONCE: only the newer copy (localStorage or IndexedDB, compared by the
//    save timestamp without parsing) is parsed, and the result is reused by the title screen and
//    "Continue" (before: every title-screen render parsed both copies, Continue parsed them again
//    and re-serialized the save for the backup).
//  · Large saves (> 512 KB) are written to IndexedDB only (asynchronous); the big synchronous
//    localStorage write — slow on phones — is skipped and the old localStorage copy is freed once
//    IndexedDB holds the newest save. Small saves keep both copies.
//  · Old Theater performance records are archived: the newest 60 per theater keep every detail;
//    older ones keep their results (date, Stage, members, tickets, revenue, satisfaction, audience
//    totals) but drop the per-member fan breakdown and stat-change lists (substitutions are kept for member statistics). Finished / cancelled
//    performance slots older than 120 days are removed from the schedule. Runs on load and monthly.
// =====================================================================================
const SO={raw:null,val:null,lsBig:512*1024,keep:60,shKeep:120};
const soTs=raw=>{if(!raw)return-1;const m=/"_ts":(\d+)/.exec(raw);return m?+m[1]:0};
load=function(){let ls=null;try{ls=localStorage.getItem(KEY)}catch(e){}const idb=SV.idbMain; // both copies: the newer one (by _ts) wins
 const pick=soTs(idb)>soTs(ls)?[idb,ls]:[ls,idb];for(const raw of pick){if(!raw)continue;if(raw===SO.raw&&SO.val)return SO.val;const s=svParse(raw);if(s){SO.raw=raw;SO.val=s;SV.bad=null;return s}if(raw===ls)SV.bad=ls}return null};
cont=function(){const s=load();if(!s){if(SV.bad)return svRecover();return toast('No saved game was found in this browser. Start a New Game or import a save file.','err')}
 const raw=SO.raw;if(raw)svPut('bak_load',raw);SO.raw=null;SO.val=null;S=s;try{migrate()}catch(e){console.error('migrate',e);SV.lastErr='Part of the save could not be updated ('+e.message+'). Your data was kept and a backup was stored.'}
 try{ui.g=S.groups[0]?.id}catch(e){}ui.t=false;ui.recov=null;view='dash';toast('Save loaded.');render()};
// a new game / import replaces S: forget the cached title-screen copy
['startNew','uiImport','slotLoad'].forEach(n=>{const f=window[n];if(typeof f=='function')window[n]=function(){SO.raw=null;SO.val=null;return f.apply(this,arguments)}});
// large saves: IndexedDB only
{const f=save;save=function(){const big=SVP.last>SO.lsBig&&SV.db;if(big&&!SVP.lsOff){SVP.lsOff=true;try{localStorage.setItem('iv48_lsoff','1')}catch(e){}}const r=f.apply(this,arguments);
 try{SVP.last=(SV.idbMain||'').length;if(SVP.last>SO.lsBig&&SV.db&&!SVP.lsOff){SVP.lsOff=true;try{localStorage.setItem('iv48_lsoff','1')}catch(e){}}if(SVP.lsOff&&!SVP.freed&&SV.db){SVP.freed=1;const j=SV.idbMain;svPut('main',j).then(ok=>{if(ok)try{localStorage.removeItem(KEY)}catch(e){}else SVP.freed=0})}}catch(e){}return r}}
// ---- archive old Theater detail --------------------------------------------------------------------------------------
function soCompact(){if(!S||!S.th)return{pf:0,sh:0};let a=0,d=0;const H=S.th,by={};(H.pf||[]).forEach(p=>{(by[p.k]=by[p.k]||[]).push(p)});
 Object.values(by).forEach(L=>{L.sort((x,y)=>(y.day-x.day)||0);L.slice(SO.keep).forEach(p=>{if(p.arc)return;const A=p.aud;if(A&&typeof A=='object'){for(const k in A)if(A[k]&&typeof A[k]=='object')delete A[k];A.mfv=0}p.fx=[];if(Array.isArray(p.notes)&&p.notes.length>3)p.notes=p.notes.slice(0,3);p.arc=1;a++})});
 const keep=new Set();Object.values(H.T||{}).forEach(T=>{[T.trans&&T.trans.final,T.trans&&T.trans.debut].forEach(i=>i&&keep.add(i));const rx=T.rx;if(rx){rx.final&&keep.add(rx.final.id);rx.first&&keep.add(rx.first.id)}});
 if(Array.isArray(H.sh)){const n=H.sh.length;H.sh=H.sh.filter(x=>!(x.st!='sched'&&x.day<S.day-SO.shKeep&&!x.pin&&!x.sp&&!keep.has(x.id)));d=n-H.sh.length}return{pf:a,sh:d}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{soCompact()}catch(e){console.error(e)}return r}}
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{if(S&&S.day%30==0)soCompact()}catch(e){console.error(e)}return r}}
{const f=thOpenPerf;thOpenPerf=function(id){f.apply(this,arguments);try{const p=thS().pf.find(z=>z.id==id);if(p&&p.arc&&ui.mod&&ui.mod.t=='html'&&!ui.mod.h.includes('soarc'))ui.mod.h=ui.mod.h.replace('</h2>','</h2><p class="st soarc">Archived performance: results are kept; the per-member fan breakdown of older performances is no longer stored.</p>')}catch(e){}}}

// large saves live in IndexedDB, whose write can be cut short when the page is closed or refreshed right after a save:
// keep a synchronous emergency copy in localStorage on page hide (the newer copy wins at load; it is removed again
// after the next successful IndexedDB save of the following session)
window.addEventListener('pagehide',()=>{try{if(S&&!ui.t&&SVP.lsOff&&SV.idbMain)localStorage.setItem(KEY,SV.idbMain)}catch(e){}});
