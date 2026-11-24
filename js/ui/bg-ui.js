// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Shared Background Library: integration with CD Cover Studio and MV Mode
//  · Both editors browse BGLIB (bg-lib.js) with the same picker: Location / Graphic backgrounds,
//    categories, collections, setting filter, search, favorites, recently used, thumbnails, a large
//    preview that compares every variation / time of day, and a clear selected state.
//  · Every BGLIB asset is also an MV location (MV_LOC) — registered automatically through BGLIB.on, so an
//    asset added later (from either side) appears in MV Mode by itself. MV assets keep their old scene ids.
//  · Cover: assets that came from the cover keep their original storage ({type:'loc'} / {type:<graphic>});
//    any other asset is stored as {type:'lib', lib:<id>, v, tod, wx, lt, bz, bx, by, fit} — a reference.
//  · Framing is stored per mode (cover d.bg.bz/bx/by/fit, MV scene sc.fr) and never touches the asset.
//  · MV costs only use the existing cost formula with the new location's tier; nothing else changes.
// =====================================================================================
const bgSafe=id=>String(id).replace(/[^a-z0-9]/gi,'_');
function bgOfMv(locId){const L=mvLoc(locId);if(!L)return null;if(L.lib)return L.lib;if(L.x&&L.x.lib)return L.x.lib;if(L.x)return'mx:'+L.x.id;return BGLIB.by['mc:'+L.id]?'mc:'+L.id:null}
function mvOfBg(id){const d=BGLIB.by[id];if(!d)return null;return d.mv||('bl_'+bgSafe(id))}
function bgOfCover(b){if(!b)return null;if(b.type=='lib')return b.lib;if(b.type=='loc')return'cl:'+(b.loc||'school');if(BGT.includes(b.type))return'cg:'+b.type;return null}
// every library asset is selectable as an MV location (existing ones are already there)
BGLIB.on(d=>{const mid=mvOfBg(d.id);if(!mid||MV_LOC.some(l=>l.id==mid))return;
 if(d.id.startsWith('mx:')){const x=MVX.by[d.id.slice(3)];if(!x)return;const c=MVX_COST[x.cost]||MVX_COST.tk;MV_LOC.push({id:mid,n:x.n,city:x.city||'Tokyo',country:'Japan',kind:'x:'+x.id,rent:c[0],trav:c[1],hotel:c[2],coord:c[3],build:c[4]||0,ovs:false,x});return}
 if(d.src=='mv')return;const gfx=d.kind=='gfx',c=gfx?[35000,0,0,0,60000]:(MVX_COST[d.tier||'tk']||MVX_COST.tk);
 MV_LOC.push({id:mid,n:d.n,city:gfx?'Tokyo studio lot':(d.city||'Tokyo'),country:'Japan',kind:'b:'+d.id,rent:c[0],trav:c[1],hotel:c[2],coord:c[3],build:c[4]||0,ovs:false,lib:d.id,
  x:{id:d.id,lib:d.id,n:d.n,cat:d.cat,type:gfx?'studio':d.setting,tod:d.tods,wx:d.wxs,lt:gfx?(d.lts||MVX_LT.map(x=>x[0])):d.lts}})});
// ---- player state (favorites / recently used are shared by both modes) -----------------------------------------
function bgS(){if(!S)return{fav:[],rec:[]};if(!S.bglib||typeof S.bglib!='object'){S.bglib={fav:[],rec:[]};try{const m=S.mvx||{};(m.fav||[]).forEach(i=>{const b=bgOfMv(i);if(b&&!S.bglib.fav.includes(b))S.bglib.fav.push(b)});(m.rec||[]).forEach(i=>{const b=bgOfMv(i);if(b&&!S.bglib.rec.includes(b))S.bglib.rec.push(b)})}catch(e){}}
 S.bglib.fav=S.bglib.fav||[];S.bglib.rec=S.bglib.rec||[];return S.bglib}
function bgRec(id){const R=bgS().rec,i=R.indexOf(id);if(i>=0)R.splice(i,1);R.unshift(id);R.length=Math.min(R.length,30)}
function bgFav(id){const F=bgS().fav,i=F.indexOf(id);if(i>=0)F.splice(i,1);else F.unshift(id);try{if(S.mvx)S.mvx.fav=F.map(mvOfBg).filter(Boolean)}catch(e){}if(ui.bgpv&&ui.mod&&ui.mod.t=='html'&&ui.mod.bgpv)ui.mod.h=bgPvHtml();render()}
mvxFav=function(locId){const b=bgOfMv(locId);if(b)bgFav(b)};
{const f=mvxS;mvxS=function(){const r=f.apply(this,arguments);try{r.fav=bgS().fav.map(mvOfBg).filter(Boolean)}catch(e){}return r}}
// ---- thumbnails ---------------------------------------------------------------------------------------------------
const bgDims=mode=>mode=='cover'?[512,(typeof cvHt=='function'&&ui.cd)?cvHt(ui.cd):CVH]:[320,180];
function bgThumb(mode,id,st,cls){const[W,H]=bgDims(mode),s=st||{},k=`bgl:${mode}:${W}x${H}:${id}:${s.v|0}:${s.tod||''}:${s.wx||''}:${s.lt||''}`;return`<span class="bgth ${cls||''}" style="aspect-ratio:${W}/${H}">${cvImg(k,()=>BGLIB.render(id,s,W,H),W,H)}</span>`}
// ---- the shared picker -------------------------------------------------------------------------------------------
function bgLibUI(mode,o){const U=ui.bgf=ui.bgf||{},F=U[mode]=U[mode]||{q:'',k:'all',cat:'all',col:'all',set:'all',n:48},st=bgS(),fav=new Set(st.fav),cur=o&&o.cur;let L=BGLIB.list.slice();
 if(F.k=='loc')L=L.filter(d=>d.kind=='loc');else if(F.k=='gfx')L=L.filter(d=>d.kind=='gfx');else if(F.k=='fav')L=L.filter(d=>fav.has(d.id));else if(F.k=='rec')L=st.rec.map(id=>BGLIB.by[id]).filter(Boolean);
 const cats=BG_CATS.filter(c=>L.some(d=>d.cat==c[0])),cols=BG_COLS.filter(c=>L.some(d=>d.col.includes(c[0])));if(F.cat!='all'&&!cats.some(c=>c[0]==F.cat))F.cat='all';if(F.col!='all'&&!cols.some(c=>c[0]==F.col))F.col='all';
 if(F.set!='all')L=L.filter(d=>d.setting==F.set);if(F.cat!='all')L=L.filter(d=>d.cat==F.cat);if(F.col!='all')L=L.filter(d=>d.col.includes(F.col));
 if(F.q){const q=F.q.toLowerCase();L=L.filter(d=>[d.n,bgCatN(d.cat),bgFmtN(d.fmt),d.city||'',...d.col.map(bgColN),...d.vars].join(' ').toLowerCase().includes(q))}
 const tot=L.length,set=(k,v)=>`ui.bgf.${mode}.${k}=${typeof v=='string'?`'${v}'`:v};ui.bgf.${mode}.n=48;render()`,chip=(k,v,n,on)=>`<button class="cvchip ${on?'on':''}" onclick="${set(k,v)}">${n}</button>`;
 return`<div class="bglib" data-mode="${mode}"><div class="row"><input class="bgq" data-mode="${mode}" placeholder="Search backgrounds by name, category or collection" value="${esc(F.q)}" oninput="bgQ('${mode}',this.value)">${o&&o.close?`<button class="b s" onclick="${o.close}">Close</button>`:''}</div>
 <div class="cvchips">${[['all','All'],['loc','📍 Location backgrounds'],['gfx','🎨 Graphic backgrounds'],['fav','★ Favorites'],['rec','🕘 Recently used']].map(([k,n])=>chip('k',k,n,F.k==k)).join('')}</div>
 <div class="cvchips cvscroll">${chip('set','all','Any setting',F.set=='all')}${[['out','Outdoor'],['in','Indoor'],['studio','Studio set'],['gfx','Graphic design']].map(([k,n])=>chip('set',k,n,F.set==k)).join('')}</div>
 <div class="cvchips cvscroll">${chip('cat','all','All categories',F.cat=='all')}${cats.map(([k,n])=>chip('cat',k,n,F.cat==k)).join('')}</div>
 <div class="cvchips cvscroll">${chip('col','all','All collections',F.col=='all')}${cols.map(([k,n])=>chip('col',k,n,F.col==k)).join('')}</div>
 <p class="st">${tot} background(s) · shared by CD Cover Studio and MV Mode</p><div class="bggrid m-${mode}">${L.slice(0,F.n).map(d=>`<div class="bgcard ${cur==d.id?'on':''}"><button class="bgpick" onclick="bgPick('${mode}','${d.id}')">${bgThumb(mode,d.id,{})}<b>${esc(d.n)}</b><small>${esc(bgCatN(d.cat))}${d.vars.length>1?` · ${d.vars.length} variations`:''}</small></button>${cur==d.id?'<span class="bgsel">✓ Selected</span>':''}<button class="bgfav ${fav.has(d.id)?'on':''}" title="Favorite" onclick="bgFav('${d.id}')">${fav.has(d.id)?'★':'☆'}</button><button class="bgzoom" title="Large preview" onclick="bgPv('${mode}','${d.id}')">⤢</button></div>`).join('')||'<p class="st">No background matches.</p>'}</div>
 ${tot>F.n?`<button class="b s" onclick="ui.bgf.${mode}.n+=48;render()">Show more (${tot-F.n})</button>`:''}</div>`}
function bgQ(mode,v){ui.bgf[mode].q=v;ui.bgf[mode].n=48;clearTimeout(window.__bgq);window.__bgq=setTimeout(()=>{render();const i=document.querySelector(`.bgq[data-mode="${mode}"]`);if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},250)}
function bgPick(mode,id,st,explicit){const d=BGLIB.by[id];if(!d)return;if(mode=='cover')bgCoverPick(id,st||{},explicit);else bgMvPick(id,st||{})}
// ---- large preview with variation comparison ----------------------------------------------------------------------
function bgPv(mode,id,st){ui.bgpv={mode,id,st:st||{}};ui.mod={t:'html',bgpv:1,h:bgPvHtml()};render()}
function bgPvSet(k,v){if(!ui.bgpv)return;ui.bgpv.st[k]=v;ui.mod={t:'html',bgpv:1,h:bgPvHtml()};render()}
function bgPvUse(){const P=ui.bgpv;if(!P)return;ui.mod=null;ui.bgpv=null;bgPick(P.mode,P.id,P.st,1)}
function bgPvHtml(){const P=ui.bgpv,d=P&&BGLIB.by[P.id];if(!d)return'';const n=BGLIB.norm(d,P.st),[W,H]=bgDims(P.mode),fav=bgS().fav.includes(d.id),showLt=d.lts&&(P.mode=='mv'||d.kind=='loc');
 const big=`<svg viewBox="0 0 ${W} ${H}" class="bgbig m-${P.mode}" xmlns="http://www.w3.org/2000/svg">${BGLIB.render(d.id,n,W,H)}</svg>`;
 const cmp=(lab,arr,key,name)=>arr&&arr.length>1?`<h4>${lab}</h4><div class="bgcmp m-${P.mode}">${arr.map(k=>{const s2={...n,[key]:k};return`<button class="bgvar ${n[key]==k?'on':''}" onclick="bgPvSet('${key}',${typeof k=='number'?k:`'${k}'`})">${bgThumb(P.mode,d.id,s2)}<small>${esc(name(k))}</small></button>`}).join('')}</div>`:'';
 const chips=(lab,arr,key,name)=>arr&&arr.length>1?`<h4>${lab}</h4><div class="cvchips">${arr.map(k=>`<button class="cvchip ${n[key]==k?'on':''}" onclick="bgPvSet('${key}','${k}')">${esc(name(k))}</button>`).join('')}</div>`:'';
 return`<h2 class="ht">${esc(d.n)}</h2><p class="st">${esc(bgCatN(d.cat))} · ${d.kind=='loc'?'Location background':'Graphic background'} · ${esc(bgFmtN(d.fmt))}${d.kind=='gfx'?' · '+esc(BG_SPACE[d.space]||''):''}${d.col.length?' · '+d.col.map(c=>esc(bgColN(c))).join(', '):''}</p>
 <div class="bgpvw">${big}</div><div class="row"><button class="b p" onclick="bgPvUse()">Use this background</button><button class="cvchip ${fav?'on':''}" onclick="bgFav('${d.id}')">${fav?'★ Favorite':'☆ Add to favorites'}</button></div>
 ${cmp('Compare variations',d.vars.map((_,i)=>i),'v',i=>d.vars[i])}${d.tods&&d.tods.length<=3?cmp('Time of day',d.tods,'tod',bgTodN):chips('Time of day',d.tods,'tod',bgTodN)}${chips('Weather',d.wxs,'wx',bgWxN)}${showLt?chips('Lighting',d.lts,'lt',bgLtN):''}
 <p class="st">This asset is shared: the same background is available in CD Cover Studio and in MV Mode. Each keeps its own framing; the original is never changed.</p>`}
// ---- CD Cover Studio ----------------------------------------------------------------------------------------------
function bgCoverPick(id,st,explicit){const d=BGLIB.by[id];if(!d||!ui.cd)return;snap();const n=BGLIB.norm(d,st),old=ui.cd.bg;let nb=d.cover?d.cover(n,explicit?null:old):{type:'lib',lib:id,v:n.v,tod:n.tod,wx:n.wx,lt:n.lt,fit:'fill'};
 nb.bz=1;nb.bx=0;nb.by=0;ui.cd.bg=nb;cvBgClamp(nb);ui.sel='bg';ui.cvMulti=null;bgRec(id);render()}
function bgCoverSet(k,val){const b=ui.cd&&ui.cd.bg;if(!b)return;const id=bgOfCover(b),d=BGLIB.by[id];snap();
 if(b.type=='lib')b[k]=val;else if(b.type=='loc'){if(k=='v')b.lv=val;if(k=='tod')b.tod=val}else if(d&&k=='v'&&d.cover)Object.assign(b,d.cover({v:val},null),{bz:b.bz,bx:b.bx,by:b.by});cvBgClamp(b);render()}
{const f=bgSvg;bgSvg=function(b){if(b&&b.type=='lib'){if(!BGLIB.by[b.lib])return`<rect width="512" height="${CVH}" fill="#e6e0ea" data-bg="1"/>`;return BGLIB.render(b.lib,{v:b.v,tod:b.tod,wx:b.wx,lt:b.lt,fr:{z:b.bz,x:b.bx,y:b.by,fit:b.fit}},512,CVH)}return f.apply(this,arguments)}}
{const f=cvBgClamp;cvBgClamp=function(b){if(b&&b.type=='lib'){b.bz=Math.max(1,Math.min(3,+b.bz||1));const B=BGLIB.bounds(b.lib,{fr:{z:b.bz,fit:b.fit}},512,CVH);b.bx=Math.max(-B.ox,Math.min(B.ox,+b.bx||0));b.by=Math.max(-B.oy,Math.min(B.oy,+b.by||0));return}return f.apply(this,arguments)}}
{const f=cvBgFrame;cvBgFrame=function(d){const b=d&&d.bg;if(!b||b.type!='lib')return f.apply(this,arguments);cvBgClamp(b);const B=BGLIB.bounds(b.lib,{fr:{z:b.bz,fit:b.fit}},512,CVH);
 return`<div class="cvsec"><h4>Background framing</h4><p class="st">Drag on an empty part of the cover (or pinch) to move and zoom. The shared background itself is never changed, and the MV keeps its own framing.</p><div class="cvchips"><button class="cvchip ${b.fit!='fit'?'on':''}" onclick="bgCoverSet('fit','fill')">Fill canvas</button><button class="cvchip ${b.fit=='fit'?'on':''}" onclick="bgCoverSet('fit','fit')">Fit whole picture</button></div>${(cvRg('Zoom','bz',1,3,.01,b.bz,'×')+(B.ox?cvRg('Move left / right','bx',-Math.round(B.ox),Math.round(B.ox),1,b.bx):'')+(B.oy?cvRg('Move up / down','by',-Math.round(B.oy),Math.round(B.oy),1,b.by):'')).replace(/cvLive\(/g,'cvLiveB(')}<button class="b s" onclick="cvBgReset()">Reset position</button></div>`}}
function bgSelCard(mode,id,b){const d=BGLIB.by[id];if(!d)return'';const st=b.type=='lib'?{v:b.v,tod:b.tod,wx:b.wx,lt:b.lt}:b.type=='loc'?{v:b.lv|0,tod:b.tod||'a'}:{v:Math.max(0,(BGLIB.by[id].vars||[]).findIndex((_,i)=>{const c=d.cover({v:i},null);return c.c1==b.c1&&c.c2==b.c2}))},n=BGLIB.norm(d,st);
 const ch=(lab,arr,key,name)=>arr&&arr.length>1?`<small>${lab}</small><div class="cvchips">${arr.map(k=>`<button class="cvchip ${n[key]==k?'on':''}" onclick="bgCoverSet('${key}','${k}')">${esc(name(k))}</button>`).join('')}</div>`:'';
 return`<div class="cvsec bgcur"><h4>Selected background</h4><div class="bgcurrow">${bgThumb('cover',id,n,'cur')}<div><b>${esc(d.n)}</b><small class="st">${esc(bgCatN(d.cat))} · ${d.kind=='loc'?'Location':'Graphic'}${d.src=='mv'?' · from MV Mode':''}</small><button class="b s" onclick="bgPv('cover','${id}',${esc(JSON.stringify(n)).replace(/"/g,'&quot;')})">⤢ Large preview</button></div></div>
 ${d.vars.length>1?`<small>Variation</small><div class="bgcmp m-cover">${d.vars.map((vn,i)=>`<button class="bgvar ${n.v==i?'on':''}" onclick="bgCoverSet('v',${i})">${bgThumb('cover',id,{...n,v:i})}<small>${esc(vn)}</small></button>`).join('')}</div>`:''}
 ${ch('Time of day',d.tods,'tod',bgTodN)}${b.type=='lib'?ch('Weather',d.wxs,'wx',bgWxN)+(d.kind=='loc'?ch('Lighting',d.lts,'lt',bgLtN):''):''}</div>`}
cvBgPanel=function(d){const b=d.bg,id=bgOfCover(b);let h='';try{if(id)h+=bgSelCard('cover',id,b)}catch(e){console.error(e)}
 if(BGT.includes(b.type))h+=`<div class="cvsec"><h4>Colors</h4><div class="cvrow2">${cvCol('Color 1','c1',b.c1)}${b.type=='solid'?'':cvCol('Color 2','c2',b.c2)}${cvCol('Pattern','pc',b.pc)}</div>${cvRg('Pattern amount','int',0,1,.05,b.int)}<button class="b s" onclick="cvBg('seed',Math.floor(Math.random()*9999))">Shuffle decorations</button></div>`.replace(/cvLive\(/g,'cvLiveB(');
 return h+`<div class="cvsec"><h4>Background library</h4>${bgLibUI('cover',{cur:id})}</div>`};
// ---- MV Mode -----------------------------------------------------------------------------------------------------
{const f=mvxSceneSvg;mvxSceneSvg=function(sc){const b=sc&&bgOfMv(sc.id);if(b&&BGLIB.by[b])return BGLIB.render(b,sc,320,180);return f.apply(this,arguments)}}
{const f=mvScene;mvScene=function(kind,c1,c2,w){if(typeof kind=='string'&&(kind.startsWith('b:')||kind.startsWith('x:'))){const id=kind.startsWith('b:')?kind.slice(2):'mx:'+kind.slice(2),sc=(typeof MVX_HINT!='undefined'&&MVX_HINT)||{};if(BGLIB.by[id])return`<svg viewBox="0 0 320 180" width="${w||160}" xmlns="http://www.w3.org/2000/svg">${BGLIB.render(id,sc,320,180)}</svg>`}return f.apply(this,arguments)}}
function bgMvPick(id,st){const mid=mvOfBg(id);if(!mid||!mvLoc(mid))return toast('This background is not available as an MV location.','err');const n=BGLIB.norm(BGLIB.by[id],st);
 mvxDo(v=>{const sc=v.scenes[ui.mvxi|0];if(!sc)return;sc.id=mid;sc.v=n.v;if(n.tod)sc.tod=n.tod;if(n.wx)sc.wx=n.wx;if(n.lt)sc.lt=n.lt;delete sc.fr;mvxFix(sc);ui.mvxLib=0});bgRec(id);try{const R=mvxS().rec,i=R.indexOf(mid);if(i>=0)R.splice(i,1);R.unshift(mid)}catch(e){}}
mvxLib=function(o,v){const sc=mvxScenes(v)[ui.mvxi|0]||{};return`<div class="mvxlib">${bgLibUI('mv',{cur:bgOfMv(sc.id),close:'ui.mvxLib=0;render()'})}</div>`};
function mvxVarHtml(sc,dis){const b=bgOfMv(sc.id),d=b&&BGLIB.by[b];if(!d||d.vars.length<2)return'';const n=BGLIB.norm(d,sc);
 return`<div class="mvxvar"><small>Variation</small><div class="bgcmp m-mv">${d.vars.map((vn,i)=>`<button class="bgvar ${n.v==i?'on':''}" ${dis} onclick="mvxSet('v',${i})">${bgThumb('mv',b,{...n,v:i})}<small>${esc(vn)}</small></button>`).join('')}</div></div>`}
function mvxFr(k,val){mvxDo(v=>{const sc=v.scenes[ui.mvxi|0];if(!sc)return;const fr=sc.fr={...(sc.fr||{})};if(k=='reset'){delete sc.fr;return}fr[k]=val;const b=bgOfMv(sc.id),B=b?BGLIB.bounds(b,{fr},320,180):{ox:0,oy:0};fr.x=Math.max(-B.ox,Math.min(B.ox,+fr.x||0));fr.y=Math.max(-B.oy,Math.min(B.oy,+fr.y||0))})}
function mvxFrameHtml(sc,ed){const b=bgOfMv(sc.id);if(!b)return'';const fr=sc.fr||{},z=+fr.z||1,B=BGLIB.bounds(b,{fr},320,180),dis=ed?'':'disabled';
 const rg=(lab,k,a,c,s,val)=>`<label class="cvrg"><span>${lab}<b>${Math.round(val*100)/100}</b></span><input type="range" min="${a}" max="${c}" step="${s}" value="${val}" ${dis} onchange="mvxFr('${k}',+this.value)"></label>`;
 return`<details class="cvdet mvxfr" ${sc.fr?'open':''}><summary>Background framing (this MV scene only)</summary><div class="cvchips"><button class="cvchip ${fr.fit!='fit'?'on':''}" ${dis} onclick="mvxFr('fit','fill')">Fill frame</button><button class="cvchip ${fr.fit=='fit'?'on':''}" ${dis} onclick="mvxFr('fit','fit')">Fit whole picture</button></div>
 ${rg('Zoom','z',1,3,.05,z)}${B.ox?rg('Move left / right','x',-Math.round(B.ox),Math.round(B.ox),1,+fr.x||0):''}${B.oy?rg('Move up / down','y',-Math.round(B.oy),Math.round(B.oy),1,+fr.y||0):''}<button class="b s" ${dis} onclick="mvxFr('reset')">Reset framing</button></details>`}
