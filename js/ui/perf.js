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
save=function(){if(!S||!svValid(S))return;SVP.dirty=false;clearTimeout(SVP.tm);let j;try{S._ts=Date.now();S._sv=SAVE_V;j=JSON.stringify(S)}catch(e){SV.lastErr='The game state could not be saved: '+e.message;console.error(e);return}
 let ok=false;if(!SVP.lsOff){try{localStorage.setItem(KEY,j);ok=true}catch(e){ok=false}}
 SV.idbMain=j;SVP.n++;clearTimeout(SV.t);const put=()=>svPut('main',j).then(r=>{
  if(r){if(!ok&&!SVP.lsOff){SVP.lsOff=true;try{localStorage.removeItem(KEY)}catch(e){}try{localStorage.setItem('iv48_lsoff','1')}catch(e){}}if(SV.warn){SV.warn=null;if(S&&!ui.t)render()}}
  else if(!ok){SV.warn='Your browser refused to store the game. Export a save file now (Management › Save & Load) to keep your progress.';if(S&&!ui.t)render()}});if(SVP.lsOff||!ok||SVP.now)put();else SV.t=setTimeout(put,250);
 if(ok)SV.warn=null;else if(!SV.db)SV.warn='Browser storage is full and the game could not be saved. Export a save file from Management › Save & Load now.'};
// autosave from a screen update: once, shortly after the last action
function svAuto(){if(!S)return;SVP.dirty=true;clearTimeout(SVP.tm);SVP.tm=setTimeout(()=>{if(SVP.dirty)save()},800)}
// leaving the page: write now (IndexedDB too), not after a delay
const svNow=()=>{try{if(S&&!ui.t){SVP.now=1;try{save()}finally{SVP.now=0}}}catch(e){}};
window.addEventListener('pagehide',svNow);window.addEventListener('beforeunload',svNow);document.addEventListener('visibilitychange',()=>{if(document.visibilityState=='hidden')svNow()});
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persisted().then(p=>{if(!p)navigator.storage.persist()}).catch(()=>{})}catch(e){}
