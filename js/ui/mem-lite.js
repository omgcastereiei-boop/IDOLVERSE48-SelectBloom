// =====================================================================================
//  Low memory (phones): save slots are no longer kept in memory as full copies of the game. Only a small summary
//  (company, day, fans) is kept; the slot itself is read from storage only when it is loaded. A big main save is not
//  kept as an extra copy in memory once it is stored.
// =====================================================================================
const SV_SLOTM={};
const mlMeta=s=>s&&Array.isArray(s.members)?{co:s.co||'',day:s.day,fans:s.fans|0,members:[],ok:1}:null;
async function mlSlotMeta(n,raw){let m=null;try{const t=await svGet('slotmeta'+n);if(t)m=JSON.parse(t)}catch(e){}
 if(!m){let r=raw;if(r==null)r=await svGet('slot'+n);if(r==null){try{r=localStorage.getItem(slotKey(n))}catch(e){}}if(r){let s=null;try{s=JSON.parse(r)}catch(e){}m=mlMeta(s);s=null;if(m)svPut('slotmeta'+n,JSON.stringify(m))}}
 SV_SLOTM[n]=m;SV_SLOT[n]=m?1:null;return m}
svSlotsLoad=async function(){for(let n=1;n<=FB_SLOTS;n++){try{await mlSlotMeta(n,null)}catch(e){}}};
// in case the slots were already read as full strings: turn them into summaries
(function(){let k=0;const t=setInterval(()=>{k++;if(!SV.ready&&k<120)return;clearInterval(t);for(let n=1;n<=FB_SLOTS;n++){if(typeof SV_SLOT[n]=='string'){const raw=SV_SLOT[n];SV_SLOT[n]=null;mlSlotMeta(n,raw)}}},500)})();
slotInfo=function(n){const m=SV_SLOTM[n];if(m)return m;if(typeof SV_SLOT[n]=='string'){const raw=SV_SLOT[n];SV_SLOT[n]=null;mlSlotMeta(n,raw).then(()=>{try{render()}catch(e){}})}return null};
slotSave=function(n){if(!S)return;const go=()=>{try{fbSync&&fbSync()}catch(e){}save();const j=JSON.stringify(S),meta=mlMeta(S);toast(`Saved to slot ${n}.`);
  svPut('slot'+n,j).then(ok=>{if(!ok)return toast('Could not store the slot (browser storage unavailable). Export a save file instead.','err');SV_SLOTM[n]=meta;SV_SLOT[n]=1;svPut('slotmeta'+n,JSON.stringify(meta));try{localStorage.removeItem(slotKey(n))}catch(e){}render()})};
 if(slotInfo(n))ask(`Overwrite save slot ${n}?`,go,'Overwrite');else go()};
slotLoad=function(n){if(!slotInfo(n))return toast('That slot is empty.','err');ask(`Load slot ${n}? The current game is replaced (it stays in the autosave backup).`,async()=>{let raw=await svGet('slot'+n);if(raw==null){try{raw=localStorage.getItem(slotKey(n))}catch(e){}}
  const s=svParse(raw);raw=null;if(!s)return toast('That slot could not be read.','err');try{await svPut('bak_newgame',JSON.stringify(S))}catch(e){}S=s;try{migrate()}catch(e){console.error(e)}ui.mod=null;ui.t=false;view='dash';try{FBC={s:null,v:-1,val:null}}catch(e){}try{SO.raw=null;SO.val=null}catch(e){}toast(`Slot ${n} loaded.`);render()},'Load')};
slotDel=function(n){if(!slotInfo(n))return;ask(`Delete save slot ${n}?`,()=>{Promise.all([svDel('slot'+n),svDel('slotmeta'+n)]).then(()=>{SV_SLOT[n]=null;SV_SLOTM[n]=null;try{localStorage.removeItem(slotKey(n))}catch(e){}render()})},'Delete')};
// a big main save: once IndexedDB holds it, do not keep another copy of the text in memory
{const f=svPut;svPut=function(k,v){const p=f.apply(this,arguments);try{if(k=='main'&&typeof v=='string'&&v.length>4.5e6)p.then(ok=>{if(ok&&SV.idbMain===v)SV.idbMain=null})}catch(e){}return p}}
// the title screen / Continue while a game is open: the game in memory is the newest copy
{const f=load;load=function(){const r=f.apply(this,arguments);if(r)return r;try{if(S&&svValid(S))return S}catch(e){}return r}}
try{SO.keep=20}catch(e){} // older Theater performances keep their results but not the full per-member detail (smaller save, less memory)
