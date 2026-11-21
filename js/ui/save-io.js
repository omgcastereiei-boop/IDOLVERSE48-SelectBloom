// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Export / Import save file (reliable on phones)
// -------------------------------------------------------------------------------------
//  Export: iPhone / iPad use the share sheet ("Save to Files"); everywhere else a normal
//  download whose link stays valid long enough for the browser to finish saving it.
//  Import: accepts .json (and .txt if a phone renamed it); the imported game replaces the current
//  one immediately — a pending autosave can no longer write the old game back over it, and the
//  imported data gets a fresh save time so it always wins over the older copy in the browser.
// =====================================================================================
function svExpName(){return`IDOLVERSE48_${(S.co||'save').replace(/[^\w-]+/g,'_')}_day${S.day}.json`}
uiExport=function(){if(!S)return;let raw;try{raw=JSON.stringify(S)}catch(e){return toast('Export failed: the game data could not be written.','err')}
 const name=svExpName(),ios=typeof PT_WK!='undefined'&&PT_WK&&/iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent||'');
 try{if(ios&&navigator.canShare&&typeof File=='function'){const f=new File([raw],name,{type:'application/json'});if(navigator.canShare({files:[f]})){navigator.share({files:[f],title:name}).then(()=>toast('Save file exported.')).catch(e=>{if(e&&e.name!='AbortError')svDl(raw,name)});return}}}catch(e){}
 svDl(raw,name)};
function svDl(raw,name){try{const b=new Blob([raw],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;a.rel='noopener';document.body.appendChild(a);a.click();setTimeout(()=>{try{URL.revokeObjectURL(u);a.remove()}catch(e){}},60000);toast('Save file exported.')}catch(e){toast('Export failed.','err')}}
uiImport=function(inp){const f=inp.files&&inp.files[0];if(!f)return;const r=new FileReader();r.onerror=()=>toast('The file could not be read.','err');
 r.onload=()=>{let txt=String(r.result||'').replace(/^﻿/,'').trim();const s=svParse(txt);if(!s)return toast('That file is not a valid IDOLVERSE48 save.','err');
  ask(`Import "${s.co||'save'}" (day ${s.day})? Your current progress in this browser will be replaced (a backup is kept).`,()=>svImportNow(s),'Import')};r.readAsText(f);inp.value=''};
async function svImportNow(s){try{
 // stop any pending autosave of the current game first
 try{clearTimeout(SVP.tm);SVP.dirty=false}catch(e){}try{clearTimeout(SV.t)}catch(e){}
 if(S){try{svPut('bak_newgame',JSON.stringify(S))}catch(e){}}
 s._ts=Date.now();const raw=JSON.stringify(s);SV.idbMain=raw;try{SO.raw=null;SO.val=null}catch(e){}try{localStorage.setItem(KEY,raw)}catch(e){}try{await svPut('main',raw)}catch(e){}
 S=s;try{migrate()}catch(e){console.error('migrate',e)}ui.t=false;ui.mod=null;ui.asid=null;view='dash';try{SVP.now=1;save()}finally{SVP.now=0}render();toast(`Imported “${S.co||'save'}” (day ${S.day}).`)}catch(e){console.error(e);toast('Import failed: '+(e&&e.message||e),'err')}}
// the file picker also accepts files a phone saved as .txt
{const f=V.manage;V.manage=function(){return f.apply(this,arguments).replace('accept="application/json,.json"','accept="application/json,.json,text/plain,.txt"')}}
