// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Shared Background Library (CD Cover Studio ⇄ MV Mode)
//  One registry for every background asset. Each asset is registered ONCE and referenced by id from
//  both editors; nothing is copied. Existing assets keep their original identifiers and renderers:
//   · cover graphic types (BGT, game-systems.js)      → 'cg:<type>'   (cover keeps {type:<type>})
//   · cover location backgrounds (CVLOC, cover-locs)  → 'cl:<key>'    (cover keeps {type:'loc'})
//   · MV scene library (MVX: real places + studio sets)→ 'mx:<id>'    (MV keeps scene id 'x_<id>')
//   · classic MV locations (MV_LOC, mv.js)            → 'mc:<id>'    (MV keeps scene id '<id>')
//   · new assets (bg-locs.js, bg-gfx.js)              → 'nl:…' / 'ng:…'
//  BGLIB.add(def) registers an asset and notifies every subscriber (BGLIB.on), so an asset added from
//  either side — including future MVX.add() scenes — becomes selectable in both modes automatically.
//  BGLIB.render(id, state, W, H) draws the asset into any canvas: state = {v, tod, wx, lt, fr:{z,x,y,fit}}.
//  Fixed-size art is fitted without stretching (fill = crop, fit = contain over a soft blurred fill);
//  zoom / pan only move the view. Graphic designs flagged `adapt` are re-composed for the canvas ratio.
//  Framing lives in each mode's own data (cover d.bg, MV scene sc.fr) — the asset never changes.
// =====================================================================================
const BG_TODL={m:'Morning',a:'Afternoon',e:'Evening'};
const BG_CATS=[['school','School & Education'],['urban','Japanese City & Urban'],['nature','Nature & Outdoor'],['trad','Japanese Traditional'],['indoor','Indoor & Lifestyle'],['ent','Entertainment & Special'],
 ['s_fan','Studio · Fantasy & Dreamy'],['s_lux','Studio · Luxury & Elegant'],['s_ret','Studio · Retro & Vintage'],['s_dark','Studio · Dark & Gothic'],['s_fut','Studio · Modern & Futuristic'],['s_art','Studio · Artistic & Creative'],['s_sea','Studio · Seasonal & Festival'],
 ['classic','Classic MV locations'],['venue','Venues & Attractions'],
 ['g_classic','Classic cover graphics'],['g_tech','Design techniques'],['g_akb','AKB48 Original Style'],['g_48g','48G Variety Style'],['g_pro','Professional CD Design'],['g_fmt','Frames, borders & textures'],['g_event','Event designs']];
const BG_COLS=[['cute','Cute Collection'],['retro','Retro Collection'],['summer','Summer Collection'],['elegant','Elegant Collection'],['cool','Cool Collection'],['japanese','Japanese Collection'],['luxury','Luxury Collection'],
 ['election','Election Collection'],['graduation','Graduation Collection'],['anniversary','Anniversary Collection'],['spring','Spring Collection'],['autumn','Autumn Collection'],['winter','Winter Collection'],
 ['fantasy','Fantasy Collection'],['dark','Dark Collection'],['school','School Collection'],['city','City Collection'],['nature','Nature Collection'],['stage','Stage & Live Collection']];
const BG_FMT=[['scene','Location'],['full','Full Graphic'],['pattern','Pattern'],['frame','Frame'],['border','Border'],['texture','Texture'],['composition','Composition'],['decorative','Decorative']];
const BG_SPACE={center:'Space in the centre',left:'Space on the left',right:'Space on the right',dist:'Distributed space',top:'Space at the top',bottom:'Space at the bottom'};
const BGLIB=(()=>{const list=[],by={},subs=[];let U=0;
 function add(d){if(!d||!d.id||by[d.id])return by[d.id]||null;d.kind=d.kind||'gfx';d.vars=d.vars&&d.vars.length?d.vars:['Default'];d.col=d.col||[];d.fmt=d.fmt||(d.kind=='loc'?'scene':'full');d.setting=d.setting||(d.kind=='gfx'?'gfx':'out');d.space=d.space||'center';
  list.push(d);by[d.id]=d;subs.forEach(f=>{try{f(d)}catch(e){console.error('bg lib subscriber',e)}});return d}
 function on(f){subs.push(f);list.slice().forEach(d=>{try{f(d)}catch(e){console.error('bg lib subscriber',e)}})}
 const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
 function norm(d,st){st=st||{};const o={v:cl(st.v|0,0,d.vars.length-1),tod:null,wx:null,lt:null};
  if(d.tods)o.tod=d.tods.includes(st.tod)?st.tod:(d.tods.includes('afternoon')?'afternoon':d.tods.includes('a')?'a':d.tods[0]);
  if(d.wxs)o.wx=d.wxs.includes(st.wx)?st.wx:'sunny';if(d.lts)o.lt=d.lts.includes(st.lt)?st.lt:'std';return o}
 // size of the drawn art at zoom z and the pan room it leaves (canvas px)
 function geo(d,W,H,fr){const z=cl(+((fr||{}).z)||1,1,4),fit=(fr||{}).fit=='fit';if(d.adapt)return{s:1,nw:W,nh:H,w:W*z,h:H*z,ox:(W*z-W)/2,oy:(H*z-H)/2,z,fit:false};
  const nw=d.W||320,nh=d.H||180,s=(fit?Math.min(W/nw,H/nh):Math.max(W/nw,H/nh))*z,w=nw*s,h=nh*s;return{s,nw,nh,w,h,ox:Math.max(0,(w-W)/2),oy:Math.max(0,(h-H)/2),z,fit}}
 function bounds(id,st,W,H){const d=by[id];if(!d)return{ox:0,oy:0};const g=geo(d,W,H,st&&st.fr);return{ox:g.ox,oy:g.oy}}
 function art(d,o,W,H){try{return d.draw({...o,u:'bg'+(++U)+'_'},W,H)||''}catch(e){console.error('bg asset',d.id,e);return`<rect width="${W}" height="${H}" fill="#ccc"/>`}}
 function render(id,st,W,H){const d=by[id];if(!d)return`<rect width="${W}" height="${H}" fill="#ddd"/>`;st=st||{};const o=norm(d,st),fr=st.fr||{},g=geo(d,W,H,fr),x=cl(+fr.x||0,-g.ox,g.ox),y=cl(+fr.y||0,-g.oy,g.oy);let body;
  if(d.adapt){const a=art(d,o,W,H);body=g.z==1&&!x&&!y?a:`<g transform="translate(${(W/2+x).toFixed(1)} ${(H/2+y).toFixed(1)}) scale(${g.z.toFixed(3)}) translate(${-W/2} ${-H/2})">${a}</g>`}
  else{const tx=(W-g.w)/2+x,ty=(H-g.h)/2+y,a=art(d,o,g.nw,g.nh);body=`<g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${g.s.toFixed(4)})">${a}</g>`;
   if(g.fit&&(g.w<W-1||g.h<H-1)){const s2=Math.max(W/g.nw,H/g.nh),u='bgf'+(++U);body=`<defs><filter id="${u}" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${(Math.max(W,H)/40).toFixed(1)}"/></filter></defs><g filter="url(#${u})" opacity=".85"><g transform="translate(${((W-g.nw*s2)/2).toFixed(1)} ${((H-g.nh*s2)/2).toFixed(1)}) scale(${s2.toFixed(4)})">${art(d,o,g.nw,g.nh)}</g></g><rect width="${W}" height="${H}" fill="#fff" opacity=".18"/>`+body}}
  let lt='';if(d.lts&&!d.ltIn&&o.lt&&o.lt!='std'&&typeof MVX!='undefined'&&MVX.over)lt=`<g transform="scale(${(W/320).toFixed(4)} ${(H/180).toFixed(4)})">${MVX.over('studio','afternoon','sunny',o.lt)}</g>`;
  return`<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" overflow="hidden">${body}${lt}</svg>`}
 return{add,on,list,by,render,bounds,norm,geo}})();
// labels for times / weather / lighting across both vocabularies
function bgTodN(k){return BG_TODL[k]||((typeof MVX_TOD!='undefined'&&MVX_TOD.find(x=>x[0]==k))||[k,k])[1]}
function bgWxN(k){return((typeof MVX_WX!='undefined'&&MVX_WX.find(x=>x[0]==k))||[k,k])[1]}
function bgLtN(k){return((typeof MVX_LT!='undefined'&&MVX_LT.find(x=>x[0]==k))||[k,k])[1]}
const bgCatN=k=>(BG_CATS.find(c=>c[0]==k)||[k,k])[1],bgColN=k=>(BG_COLS.find(c=>c[0]==k)||[k,k])[1],bgFmtN=k=>(BG_FMT.find(c=>c[0]==k)||[k,k])[1];

// ---- existing CD Cover Studio graphic types (unchanged renderer; the cover keeps {type:t} + its colours) -------
(function(){const N={solid:'Solid Color',grad:'Soft Gradient',dots:'Polka Dots',stars:'Starry Sparkle',hearts:'Hearts & Bows',geo:'Geometric Confetti',prism:'Prism Light',stage:'Stage Lights',school:'School Windows',city:'City Silhouette',floral:'Floral Scatter',music:'Music Notes'};
 const C={solid:['cute'],grad:['cute','elegant'],dots:['cute','retro'],stars:['fantasy','stage'],hearts:['cute'],geo:['cool'],prism:['fantasy','cool'],stage:['stage'],school:['school'],city:['city','cool'],floral:['elegant','spring'],music:['stage','cute']};
 const PAL=[['#ff8fbf','#b9a6f0','#ffffff'],['#7ec8ff','#3a5bd9','#fff6c8'],['#ffd27a','#ff7a9a','#ffffff']];
 BGT.forEach(t=>BGLIB.add({id:'cg:'+t,n:N[t]||t,kind:'gfx',src:'cover',cat:'g_classic',col:C[t]||[],fmt:t=='solid'||t=='grad'?'full':'pattern',adapt:true,vars:['Pink lilac','Ocean blue','Sunny peach'],
  draw:(o,W,H)=>{const p=PAL[o.v]||PAL[0],prev=CVH;CVH=Math.round(H*512/W);try{return`<g transform="scale(${(W/512).toFixed(4)})">${bgSvg({type:t,c1:p[0],c2:p[1],pc:p[2],int:.5,seed:7})}</g>`}finally{CVH=prev}},
  cover:(st,b)=>{const p=PAL[st.v|0]||PAL[0];const keep=b&&BGT.includes(b.type);return{type:t,c1:keep?b.c1:p[0],c2:keep?b.c2:p[1],pc:keep?b.pc:p[2],int:keep&&b.int!=null?b.int:.5,seed:keep&&b.seed!=null?b.seed:7}}}))})();
// ---- existing CD Cover Studio locations (CVLOC) ----------------------------------------------------------------------
(function(){const CAT={school:'school',classroom:'school',rooftop:'school',corridor:'school',street:'urban',shopping:'urban',park:'nature',garden:'nature',beach:'nature',studio:'ent',hall:'ent'},IN={classroom:1,corridor:1,studio:1,hall:1};
 const COL={school:['school'],classroom:['school'],rooftop:['school','city'],corridor:['school'],street:['city'],shopping:['city','cute'],park:['nature','spring'],garden:['nature','spring','elegant'],beach:['summer','nature'],studio:['stage'],hall:['stage','elegant']};
 CVLOC.LOCS.forEach(([k,n,views])=>BGLIB.add({id:'cl:'+k,n,kind:'loc',src:'cover',cat:CAT[k]||'urban',setting:IN[k]?'in':'out',col:COL[k]||[],vars:views,tods:['m','a','e'],W:CVLOC.W,H:CVLOC.H,
  draw:(o)=>CVLOC.svg(k,o.v,o.tod,o.u),cover:(st)=>({type:'loc',loc:k,lv:st.v|0,tod:st.tod||'a'})}))})();
// ---- MV scene library (MVX) — existing and every future MVX.add() ---------------------------------------------------
const BG_MVCOL={school:['school'],urban:['city'],nature:['nature'],trad:['japanese'],indoor:[],ent:['stage'],s_fan:['fantasy','cute'],s_lux:['luxury','elegant'],s_ret:['retro'],s_dark:['dark'],s_fut:['cool'],s_art:['cool'],s_sea:[]};
function bgFromMvx(d){const extra=/sakura|cherry|spring|flower/i.test(d.n)?['spring']:/autumn|maple/i.test(d.n)?['autumn']:/snow|christmas|winter/i.test(d.n)?['winter']:/beach|summer|sunflower|pool|festival|firework/i.test(d.n)?['summer']:[];
 return BGLIB.add({id:'mx:'+d.id,n:d.n,kind:'loc',src:'mv',cat:d.cat,setting:d.type,col:[...(BG_MVCOL[d.cat]||[]),...extra],tods:d.tod||null,wxs:d.wx||null,lts:d.lt||null,ltIn:true,W:MVX.W,H:MVX.H,city:d.city,draw:(o)=>MVX.svg(d.id,o.tod,o.wx,o.lt),mv:'x_'+d.id})}
MVX.list.forEach(bgFromMvx);
{const f=MVX.add;MVX.add=function(d){const r=f.apply(this,arguments);try{bgFromMvx(r||d)}catch(e){console.error(e)}return r}}
// ---- classic MV locations (MV_LOC) ---------------------------------------------------------------------------------------
const bgMvxScene0=typeof mvxSceneSvg=='function'?mvxSceneSvg:null;
function bgFromClassic(L){if(!L||L.x||L.lib||String(L.kind).startsWith('b:'))return;const t=(typeof MVX_KIND_TYPE!='undefined'&&MVX_KIND_TYPE[L.kind])||'out',op=typeof mvxOpts=='function'?mvxOpts(L.id):{};
 BGLIB.add({id:'mc:'+L.id,n:L.n,kind:'loc',src:'mv',cat:'classic',setting:t,col:L.ovs?['city']:[],tods:op.tod||null,wxs:op.wx||null,lts:op.lt||null,ltIn:true,W:320,H:180,city:L.city+(L.ovs?' · '+L.country:''),draw:(o)=>bgMvxScene0?bgMvxScene0({id:L.id,tod:o.tod,wx:o.wx,lt:o.lt}):'',mv:L.id})}
MV_LOC.forEach(bgFromClassic);
