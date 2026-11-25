// =====================================================================================
//  Save performance
// -------------------------------------------------------------------------------------
//  · Autosave is debounced: a screen update no longer serializes and writes the whole save.
//    The game is saved ~0.8 s after the last action, and at once when the page is hidden or
//    closed (pagehide / visibilitychange), on the Save button, slots and export.
//  · When the save outgrows localStorage, the game switches to IndexedDB only (much larger
//    quota): it stops retrying localStorage on every save (each failed write was slow) and
//    frees the old localStorage copy once IndexedDB holds the newest one. No warning is shown
//    while IndexedDB works.
//  · The browser is asked to keep the game's storage persistent (not cleared under pressure).
// =====================================================================================
const SVP={lsOff:false,tm:null,dirty:false,n:0};
try{SVP.lsOff=localStorage.getItem('iv48_lsoff')=='1'}catch(e){}
save=function(){try{moneyOk()}catch(e){}if(!S||!svValid(S)){if(S)SV.warn='The game could not be saved because part of the game state is invalid. Export a save file from Management › Save & Load and report this.';return}SVP.dirty=false;clearTimeout(SVP.tm);SVP.tm=null;SVP.at=Date.now();let j;try{S._ts=Date.now();S._sv=SAVE_V;j=JSON.stringify(S);SVP.sz=j.length}catch(e){SV.lastErr='The game state could not be saved: '+e.message;console.error(e);return}
 let ok=false;const skip=!SVP.lsOff&&SV.dbOk&&!SVP.now&&SVP.n%10!=9;if(skip)ok=true;else if(!SVP.lsOff){try{localStorage.setItem(KEY,j);ok=true}catch(e){ok=false}}
 SV.idbMain=j;SVP.n++;clearTimeout(SV.t);const put=()=>svPut('main',j).then(r=>{
  SV.dbOk=!!r;if(!r&&skip){try{localStorage.setItem(KEY,j)}catch(e){}}
  if(r){if(!ok&&!SVP.lsOff){SVP.lsOff=true;try{localStorage.removeItem(KEY)}catch(e){}try{localStorage.setItem('iv48_lsoff','1')}catch(e){}}if(SV.warn){SV.warn=null;if(S&&!ui.t)render()}}
  else if(!ok){SV.warn='Your browser refused to store the game. Export a save file now (Management › Save & Load) to keep your progress.';if(S&&!ui.t)render()}});if(SVP.lsOff||!ok||SVP.now||skip)put();else SV.t=setTimeout(put,250);
 if(ok)SV.warn=null;else if(!SV.db)SV.warn='Browser storage is full and the game could not be saved. Export a save file from Management › Save & Load now.'};
// autosave from a screen update: once, shortly after the last action
// a big save takes a long time to write (it blocks the screen on phones), so it is written at most every 15 s while
// you keep playing (and right away when the page is hidden / closed, and ~1.5 s after a new day); small saves as before
function svAuto(){if(!S)return;SVP.dirty=true;const big=(SVP.sz||0)>3e6;if(!big){clearTimeout(SVP.tm);SVP.tm=setTimeout(()=>{if(SVP.dirty)save()},800);return}
 if(SVP.tm&&!SVP.soon)return;clearTimeout(SVP.tm);const wait=SVP.soon?1500:Math.max(2000,15000-(Date.now()-(SVP.at||0)));SVP.soon=0;
 SVP.tm=setTimeout(()=>{SVP.tm=null;const go=()=>{if(SVP.dirty)save()};if(window.requestIdleCallback)requestIdleCallback(go,{timeout:4000});else go()},wait)}
{const f=adv;adv=function(){const r=f.apply(this,arguments);try{SVP.soon=1;svAuto()}catch(e){}return r}}
// leaving the page: write now (IndexedDB too), not after a delay
const svNow=()=>{try{if(S&&!ui.t){SVP.now=1;try{save()}finally{SVP.now=0}}}catch(e){}};
// (no save when the page is hidden or closed: autosave runs on Next day / +7 only — save-nextday.js)
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persisted().then(p=>{if(!p)navigator.storage.persist()}).catch(()=>{})}catch(e){}

// money is checked every day and on load, so an invalid amount from any calculation can never stop autosave
{const f=tick;tick=function(){try{moneyOk()}catch(e){}const r=f.apply(this,arguments);try{moneyOk()}catch(e){}return r}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{moneyOk()}catch(e){}return r}}
// phones may stop the page right after it is hidden, before the IndexedDB write finishes: keep a synchronous copy too
document.addEventListener('visibilitychange',()=>{if(document.visibilityState!='hidden')return;try{if(S&&!ui.t&&SVP.lsOff&&SV.idbMain)localStorage.setItem(KEY,SV.idbMain)}catch(e){}});
