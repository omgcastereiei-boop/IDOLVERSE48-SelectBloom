// =====================================================================================
//  IDOLVERSE48: Select Bloom! — CD Cover Studio, Canva-style editor (upgrade of the
//  existing studio; same data: ui.cd = {bg, layers[]}, same S.cov storage, same undo
//  history ui.hu/ui.hr, same production functions: confirmCov, saveDraft, copyCover…)
//
//  · Interaction: geometric + painted-pixel hit testing, selection box with 8 resize
//    handles and a rotation handle, drag from inside the box, threshold before a drag
//    starts (taps never move things), snapping + guides, pinch / two-finger gestures,
//    zoom & fit, lock, select-below for overlapping objects, keyboard shortcuts.
//  · Layers panel: thumbnails, visibility, lock, delete, drag-to-reorder, multi-select,
//    group / ungroup, front / back / forward / backward.
//  · Members: only the single's main-song Senbatsu (cvPool), wearing the confirmed
//    single costume — no costume controls in the cover editor any more.
//  · Text: font library by style, gradient, outline, shadow, glow, curve, spacing,
//    opacity, background. Export embeds the web fonts so the PNG matches the canvas.
//  · Members can be cropped non-destructively (l.crop = rectangle in figure units).
//  · Backgrounds: graphic library (unchanged) + location scenes (cover-locs.js) and
//    framing (bx, by, bz) that never changes the background asset itself.
//  New fields are optional; covers saved before this update render exactly as before.
// =====================================================================================
const CVX={bb:{},hits:[],hp:null,css:{},fd:{},fontsOn:0,lastTap:{t:0,id:null},img:{}};
const CVF=[// [family, style group, supports Thai, css2 weights or '' for regular only]
 ['M PLUS Rounded 1c','Rounded',0,null],['Zen Maru Gothic','Rounded',0,null],['Mitr','Rounded',1,null],['Quicksand','Rounded',0,null],['Fredoka','Rounded',0,'400;700'],['Kosugi Maru','Rounded',0,''],['Mali','Rounded',1,'400;700'],
 ['Kanit','Sans Serif',1,'400;700;800'],['Prompt','Sans Serif',1,'400;700;800'],['Noto Sans Thai Looped','Sans Serif',1,null],['Montserrat','Sans Serif',0,'400;700;800'],['Poppins','Sans Serif',0,'400;700;800'],['Bai Jamjuree','Sans Serif',1,'400;700'],
 ['Shippori Mincho','Serif',0,null],['Playfair Display','Serif',0,'400;700;800'],['Trirong','Serif',1,'400;700;800'],['Pridi','Serif',1,'400;700'],['Kaisei Decol','Serif',0,'400;700'],
 ['Itim','Handwriting',1,''],['Sriracha','Handwriting',1,''],['Caveat','Handwriting',0,'400;700'],['Yomogi','Handwriting',0,''],['Dancing Script','Handwriting',0,'400;700'],['Yusei Magic','Handwriting',0,''],
 ['Charm','Elegant',1,'400;700'],['Charmonman','Elegant',1,'400;700'],['Great Vibes','Elegant',0,''],['Cinzel','Elegant',0,'400;700;800'],['Fahkwang','Elegant',1,'400;700'],
 ['DotGothic16','Retro',0,null],['Press Start 2P','Retro',0,''],['Righteous','Retro',0,''],['Monoton','Retro',0,''],
 ['Dela Gothic One','Display',0,null],['Bebas Neue','Display',0,''],['Bungee','Display',0,''],['Chonburi','Display',1,''],['RocknRoll One','Display',0,''],['Abril Fatface','Display',0,''],
 ['Pacifico','Decorative',0,null],['Lobster','Decorative',0,''],['Pattaya','Decorative',1,''],['Hachi Maru Pop','Decorative',0,''],['Mochiy Pop One','Decorative',0,''],['Rampart One','Decorative',0,''],['Reggae One','Decorative',0,'']];
const CVF_CATS=['Sans Serif','Serif','Rounded','Handwriting','Elegant','Retro','Display','Decorative'];
function cvFontsLoad(){if(CVX.fontsOn)return;CVX.fontsOn=1;try{CVF.filter(f=>f[3]!=null).forEach(([n,,,w])=>{const l=document.createElement('link');l.rel='stylesheet';l.href=`https://fonts.googleapis.com/css2?family=${n.replace(/ /g,'+')}${w?':wght@'+w:''}&display=swap`;l.dataset.cvf=n;document.head.appendChild(l)})}catch(e){}}
// text style presets with effects (added next to the original typography presets)
const CVPRE=[['Gradient pop',{font:'Kanit',fw:800,col:'#ffffff',gr:{on:1,c:['#ff7eb6','#ffb86b'],a:90},ol:4,olc:'#ffffff',sh:1,shc:'#7a2a5a',sho:.35,shb:3,shd:4,sha:90}],
 ['Neon glow',{font:'Mitr',fw:700,col:'#ffffff',gr:null,ol:0,gw:{on:1,c:'#ff4fd8',r:6},sh:0}],['Rainbow',{font:'Mochiy Pop One',fw:400,col:'#fff',gr:{on:1,c:['#ff6b6b','#ffd166','#6bd68a','#5ab0ff','#a58df0'],a:0},ol:4,olc:'#ffffff',sh:1}],
 ['Arch title',{font:'Chonburi',fw:400,col:'#fff6d0',ol:5,olc:'#c0446a',cv:45,sh:1}],['Elegant shadow',{font:'Cinzel',fw:700,col:'#ffffff',ol:0,sh:1,shc:'#2a1a3a',sho:.55,shb:6,shd:5,sha:110,ls:4}],
 ['Retro arcade',{font:'Press Start 2P',fw:400,col:'#ffe066',ol:3,olc:'#3a2a6a',sh:1,shc:'#ff4f9a',sho:1,shb:0,shd:4,sha:45}],['Handwritten',{font:'Itim',fw:400,col:'#ffffff',ol:3,olc:'#ff8fb5',sh:0}],
 ['Label tag',{font:'Prompt',fw:700,col:'#ffffff',ol:0,sh:0,bgx:{on:1,c:'#ff5f8f',o:1,p:.12}}]];
// ---------------------------------------------------------------- helpers
const cvL=id=>ui.cd&&ui.cd.layers.find(l=>l.id==id);
const cvSelIds=()=>{if(!ui.cd)return[];if(ui.cvMulti&&ui.cvMulti.length>1)return ui.cvMulti.filter(id=>cvL(id));return ui.sel&&ui.sel!='bg'&&cvL(ui.sel)?[ui.sel]:[]};
const cvClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const cvK=l=>l.t=='m'?[(l.fl?-1:1)*l.s,l.s]:l.t=='s'?[l.s*(l.sx||1),l.s*(l.sy||1)]:[l.sx||1,l.sy||1];
function cvTf(l){const[kx,ky]=cvK(l);return`translate(${+(+l.x).toFixed(2)} ${+(+l.y).toFixed(2)}) rotate(${+(+(l.r||0)).toFixed(2)})${kx==1&&ky==1?'':` scale(${+kx.toFixed(4)} ${+ky.toFixed(4)})`}`}
function cvToLocal(l,p){const[kx,ky]=cvK(l),a=-(l.r||0)*Math.PI/180,dx=p.x-l.x,dy=p.y-l.y;return{x:(dx*Math.cos(a)-dy*Math.sin(a))/kx,y:(dx*Math.sin(a)+dy*Math.cos(a))/ky}}
function cvToCv(l,q){const[kx,ky]=cvK(l),a=(l.r||0)*Math.PI/180,x=q.x*kx,y=q.y*ky;return{x:l.x+x*Math.cos(a)-y*Math.sin(a),y:l.y+x*Math.sin(a)+y*Math.cos(a)}}
function cvBB(l){if(l.t=='m'&&l.crop)return{x:l.crop.x-50,y:l.crop.y-100,w:l.crop.w,h:l.crop.h};return CVX.bb[l.id]||(l.t=='m'?{x:-28,y:-100,w:56,h:196}:l.t=='s'?{x:-24,y:-24,w:48,h:48}:{x:-(String(l.txt||'').length*(l.size||30)*.3),y:-(l.size||30)*.6,w:String(l.txt||'').length*(l.size||30)*.6||20,h:(l.size||30)*1.2})}
function cvCorners(l){const b=cvBB(l);return[[b.x,b.y],[b.x+b.w,b.y],[b.x+b.w,b.y+b.h],[b.x,b.y+b.h]].map(([x,y])=>cvToCv(l,{x,y}))}
function cvAABB(ids){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;ids.forEach(id=>{const l=cvL(id);if(!l)return;cvCorners(l).forEach(p=>{x0=Math.min(x0,p.x);y0=Math.min(y0,p.y);x1=Math.max(x1,p.x);y1=Math.max(y1,p.y)})});return{x:x0,y:y0,w:x1-x0,h:y1-y0,cx:(x0+x1)/2,cy:(y0+y1)/2}}
const cvSvgEl=()=>document.querySelector('#cvw svg#cv');
function cvPt(e){const s=cvSvgEl();if(!s)return null;const r=s.getBoundingClientRect(),k=512/r.width;return{x:(e.clientX-r.left)*k,y:(e.clientY-r.top)*k,k}}
const cvPx=()=>{const s=cvSvgEl();return s?512/s.getBoundingClientRect().width:1};// canvas units per screen pixel
const cvBgH=b=>b&&b.type=='loc'?CVLOC.H:CVH;
function cvBgClamp(b){b.bz=cvClamp(+b.bz||1,1,3);const mx=(512*b.bz-512)/2,my=Math.max(0,(cvBgH(b)*b.bz-CVH)/2);b.bx=cvClamp(+b.bx||0,-mx,mx);b.by=cvClamp(+b.by||0,-my,my)}
// ---------------------------------------------------------------- rendering (extends the existing renderer)
{const f=bgSvg;bgSvg=function(b){if(!b)return'';const inner=b.type=='loc'?`<rect width="512" height="${CVH}" fill="#cfd8e8"/><g transform="translate(0 ${((CVH-CVLOC.H)/2).toFixed(1)})">${CVLOC.svg(b.loc||'school',b.lv|0,b.tod||'a','bl'+(++PTC[0]))}</g>`:f(b);
 const z=+b.bz||1,x=+b.bx||0,y=+b.by||0;if(z==1&&!x&&!y)return inner;return`<g transform="translate(${(256+x).toFixed(1)} ${(CVH/2+y).toFixed(1)}) scale(${z}) translate(-256 ${-CVH/2})">${inner}</g>`}}
function cvTextSvg(l,u){const lines=String(l.txt==null?'':l.txt).split('\n'),sz=+l.size||30,lh=(+l.lh||1.15)*sz,fw=l.fw||800;let defs='',fill=l.col||'#fff',filt='';
 if(l.gr&&l.gr.on&&l.gr.c&&l.gr.c.length>1){const a=(+l.gr.a||0)*Math.PI/180,cx=Math.cos(a)/2,cy=Math.sin(a)/2;defs+=`<linearGradient id="${u}g" x1="${(.5-cx).toFixed(3)}" y1="${(.5-cy).toFixed(3)}" x2="${(.5+cx).toFixed(3)}" y2="${(.5+cy).toFixed(3)}">${l.gr.c.map((c,i)=>`<stop offset="${(i/(l.gr.c.length-1)).toFixed(3)}" stop-color="${c}"/>`).join('')}</linearGradient>`;fill=`url(#${u}g)`}
 const sh=l.sh?{c:l.shc||'#000000',o:l.sho!=null?+l.sho:.4,b:l.shb!=null?+l.shb:2,d:l.shd!=null?+l.shd:3.6,a:l.sha!=null?+l.sha:56}:null,gw=l.gw&&l.gw.on?l.gw:null;
 if(sh||gw){let p='',m=[];if(gw){p+=`<feGaussianBlur in="SourceAlpha" stdDeviation="${+gw.r||5}" result="gb"/><feFlood flood-color="${gw.c||'#ff4fd8'}"/><feComposite in2="gb" operator="in" result="gl"/>`;m.push('gl','gl')}
  if(sh){const r=sh.a*Math.PI/180;p+=`<feDropShadow dx="${(Math.cos(r)*sh.d).toFixed(2)}" dy="${(Math.sin(r)*sh.d).toFixed(2)}" stdDeviation="${sh.b}" flood-color="${sh.c}" flood-opacity="${sh.o}" result="sd"/>`;m.unshift('sd')}
  defs+=`<filter id="${u}f" x="-50%" y="-80%" width="200%" height="260%">${p}<feMerge>${m.map(r=>`<feMergeNode in="${r}"/>`).join('')}<feMergeNode in="SourceGraphic"/></feMerge></filter>`;filt=` filter="url(#${u}f)"`}
 const at=`text-anchor="middle" font-family="'${l.font||'M PLUS Rounded 1c'}',sans-serif" font-size="${sz}" font-weight="${fw}" letter-spacing="${+l.ls||0}"`;
 let body,tx;const cv=+l.cv||0;
 if(cv&&lines.length==1){const t=lines[0],w=Math.max(sz,t.length*sz*.62+t.length*(+l.ls||0)),th=Math.abs(cv)/100*Math.PI*1.5,R=w/Math.max(.05,th),ps=Math.min(Math.PI*.98,th/2+.7),up=cv>0;
  const x1=-R*Math.sin(ps),x2=R*Math.sin(ps),y=up?R-R*Math.cos(ps):-(R-R*Math.cos(ps));defs+=`<path id="${u}p" d="M${x1.toFixed(1)} ${y.toFixed(1)}A${R.toFixed(1)} ${R.toFixed(1)} 0 ${2*ps>Math.PI?1:0} ${up?1:0} ${x2.toFixed(1)} ${y.toFixed(1)}"/>`;
  tx=a=>`<text ${at} ${a} transform="translate(0 ${(up?sz*.36:-sz*.1).toFixed(1)})"><textPath href="#${u}p" startOffset="50%">${esc(t)}</textPath></text>`}
 else{const y0=-(lines.length-1)*lh/2;tx=a=>`<text ${at} dominant-baseline="central" ${a}>${lines.map((t,i)=>`<tspan x="0" ${i?`dy="${lh.toFixed(1)}"`:`y="${y0.toFixed(1)}"`}>${esc(t)||' '}</tspan>`).join('')}</text>`}
 let bgc='';if(l.bgx&&l.bgx.on){const p=+l.bgx.p||.1;defs+=`<filter id="${u}b" x="${-p}" y="${-p*2}" width="${1+2*p}" height="${1+4*p}"><feFlood flood-color="${l.bgx.c||'#ff5f8f'}" flood-opacity="${l.bgx.o!=null?l.bgx.o:1}"/></filter>`;bgc=tx(`fill="#000" filter="url(#${u}b)"`)}
 body=tx(`fill="${fill}" stroke="${l.ol?l.olc||'#ff7eb6':'none'}" stroke-width="${(+l.ol||0)*2}" paint-order="stroke" stroke-linejoin="round"${filt}`);
 return(defs?`<defs>${defs}</defs>`:'')+bgc+body}
lyr=function(l){if(!l)return'';const u='cq'+(++PTC[0]),op=l.op!=null&&+l.op<1?` opacity="${+l.op}"`:'';
 if(l.t=='m'){const m=get(l.mid);if(!m)return'';const art=fig(m,l),crop=l.crop,cm=ui.cvCrop&&ui.cvCrop.id==l.id;
  let inner=art;if(crop){inner=`<defs><clipPath id="${u}c"><rect x="${(+crop.x).toFixed(2)}" y="${(+crop.y).toFixed(2)}" width="${(+crop.w).toFixed(2)}" height="${(+crop.h).toFixed(2)}"/></clipPath></defs>${cm?`<g opacity=".28" pointer-events="none">${art}</g>`:''}<g clip-path="url(#${u}c)">${art}</g>`}
  return`<g data-id="${l.id}" transform="${cvTf(l)}"${op}><g transform="translate(-50 -100)">${inner}</g></g>`}
 if(l.t=='s')return`<g data-id="${l.id}" transform="${cvTf(l)}"${op}>${cvElSvg(l,u)}</g>`;
 return`<g data-id="${l.id}" transform="${cvTf(l)}"${op}>${cvTextSvg(l,u)}</g>`};
// the editing overlay lives in its own SVG on top of the cover (see cvOverlay)
ovl=function(){return''};
// ---------------------------------------------------------------- costumes & members (rules)
function cvSingleCtx(){return ui.cvCtx!='album'&&!!S.pj&&!(typeof RCCV!='undefined'&&RCCV)}
function cvForceCz(d){if(!d||!cvSingleCtx())return;try{const o=S.songs[S.pj.mainId];if(!o)return;d.useCz=true;d.cmode='shared';delete d.sc;const ci=COS.findIndex(c=>c[3]==o.costume);d.cid=ci<0?(d.cid|0):ci;d.layers.forEach(l=>{if(l.t!='m')return;delete l.czSrc;inh(l,d)});if(typeof czLib=='function')czLib();if(typeof czCoverSync=='function')czCoverSync()}catch(e){console.error(e)}}
function cvPoolList(){const PL=cvPool();if(!PL.ok)return{PL,ids:[]};let ids=PL.list&&PL.list.length?PL.list.slice():null;
 if(!ids){const g=typeof gsCur=='function'?null:null;ids=(S.members||[]).filter(m=>isAct(m)&&(!S.pj||!ui.gid||m.group==ui.gid)).sort((a,b)=>(b.pop||0)-(a.pop||0)).map(m=>m.id)}
 if(PL.map)ids.sort((a,b)=>((PL.map.get(a)||{}).n||99)-((PL.map.get(b)||{}).n||99));return{PL,ids:ids.filter(id=>get(id)&&PL.has(id))}}
// ---------------------------------------------------------------- measuring & overlay
function cvMeasure(){const s=cvSvgEl();if(!s)return;CVX.bb={};s.querySelectorAll(':scope > [data-id]').forEach(el=>{try{const id=el.dataset.id,l=cvL(id);if(!l)return;let b;
 if(l.t=='m'){const g=el.firstElementChild;const bx=g.getBBox();b={x:bx.x-50,y:bx.y-100,w:bx.width,h:bx.height}}else{const bx=el.getBBox();b={x:bx.x,y:bx.y,w:bx.width,h:bx.height}}
 if(!(b.w>0&&b.h>0))b={x:-20,y:-20,w:40,h:40};CVX.bb[id]=b}catch(e){}})}
function cvHandles(ids){const px=cvPx(),H=[];if(!ids.length)return{H,poly:null};
 if(ids.length==1){const l=cvL(ids[0]),C=cvCorners(l),ed=l.t!='m',mid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});C.forEach((p,i)=>H.push({k:'c'+i,x:p.x,y:p.y}));
  if(ed)[['t',C[0],C[1]],['r',C[1],C[2]],['b',C[2],C[3]],['l',C[3],C[0]]].forEach(([k,a,b])=>H.push({k,...mid(a,b)}));
  const tm=mid(C[0],C[1]),ce=mid(C[0],C[2]),dx=tm.x-ce.x,dy=tm.y-ce.y,d=Math.hypot(dx,dy)||1;H.push({k:'rot',x:tm.x+dx/d*28*px,y:tm.y+dy/d*28*px,fx:tm.x,fy:tm.y});return{H,poly:C}}
 const A=cvAABB(ids),C=[{x:A.x,y:A.y},{x:A.x+A.w,y:A.y},{x:A.x+A.w,y:A.y+A.h},{x:A.x,y:A.y+A.h}];C.forEach((p,i)=>H.push({k:'c'+i,x:p.x,y:p.y}));H.push({k:'rot',x:A.cx,y:A.y-28*px,fx:A.cx,fy:A.y});return{H,poly:C}}
function cvOverlay(){const o=document.getElementById('cvov');if(!o||!ui.cd)return;o.setAttribute('viewBox',`0 0 512 ${CVH}`);const px=cvPx(),sw=1.6*px,hr=7*px;let s='';
 const poly=C=>C.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
 if(ui.cvCrop){const l=cvL(ui.cvCrop.id);if(l&&l.crop){const C=cvCorners(l);s+=`<path d="M-2000 -2000H3000V3000H-2000ZM${poly(C).replace(/ /g,'L')}Z" fill="#14102a" fill-opacity=".42" fill-rule="evenodd"/><polygon points="${poly(C)}" fill="none" stroke="#fff" stroke-width="${sw*1.4}"/>`;
  const mid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});[...C,mid(C[0],C[1]),mid(C[1],C[2]),mid(C[2],C[3]),mid(C[3],C[0])].forEach((p,i)=>{s+=i<4?`<path d="M${p.x} ${p.y}m${-hr} 0h${2*hr}M${p.x} ${p.y}m0 ${-hr}v${2*hr}" stroke="#fff" stroke-width="${sw*2.6}"/>`:`<circle cx="${p.x}" cy="${p.y}" r="${hr*.8}" fill="#fff" stroke="#7a5ad8" stroke-width="${sw}"/>`})}
  o.innerHTML=s;return}
 if(ui.cvHover&&!cvSelIds().includes(ui.cvHover)){const l=cvL(ui.cvHover);if(l&&!l.hide)s+=`<polygon points="${poly(cvCorners(l))}" fill="none" stroke="#a58df0" stroke-width="${sw}" opacity=".8"/>`}
 const ids=cvSelIds();if(ids.length){const{H,poly:P}=cvHandles(ids),lk=ids.some(id=>(cvL(id)||{}).lock);
  if(ids.length>1)ids.forEach(id=>{const l=cvL(id);if(l)s+=`<polygon points="${poly(cvCorners(l))}" fill="none" stroke="#ff3d97" stroke-width="${sw*.7}" stroke-dasharray="${3*px} ${3*px}"/>`});
  s+=`<polygon points="${poly(P)}" fill="none" stroke="${lk?'#8a8a9a':'#ff3d97'}" stroke-width="${sw}"/>`;
  if(!lk&&!(CVX.drag&&CVX.drag.type=='move'&&CVX.drag.on))H.forEach(h=>{if(h.k=='rot')s+=`<line x1="${h.fx}" y1="${h.fy}" x2="${h.x}" y2="${h.y}" stroke="#ff3d97" stroke-width="${sw}"/><circle cx="${h.x}" cy="${h.y}" r="${hr*1.05}" fill="#fff" stroke="#ff3d97" stroke-width="${sw}"/><path d="M${h.x-hr*.45} ${h.y}a${hr*.45} ${hr*.45} 0 1 1 ${hr*.45} ${hr*.45}" fill="none" stroke="#ff3d97" stroke-width="${sw*.8}"/>`;
   else if(h.k[0]=='c')s+=`<circle cx="${h.x}" cy="${h.y}" r="${hr}" fill="#fff" stroke="#ff3d97" stroke-width="${sw}"/>`;else s+=`<rect x="${h.x-hr*.55}" y="${h.y-hr*.55}" width="${hr*1.1}" height="${hr*1.1}" rx="${hr*.3}" fill="#fff" stroke="#ff3d97" stroke-width="${sw}"/>`});
  if(lk){const p=P[1];s+=`<g transform="translate(${p.x+4*px} ${p.y-16*px}) scale(${px})"><rect width="18" height="18" rx="4" fill="#5a5a6a"/><path d="M5 9V6a4 4 0 0 1 8 0v3" stroke="#fff" stroke-width="1.8" fill="none"/><rect x="4" y="8.5" width="10" height="6.5" rx="1.5" fill="#fff"/></g>`}}
 else if(ui.sel=='bg'&&ui.cd.bg){s+=`<rect x="${px}" y="${px}" width="${512-2*px}" height="${CVH-2*px}" fill="none" stroke="#a58df0" stroke-width="${sw*1.4}" stroke-dasharray="${6*px} ${4*px}"/>`}
 const D=CVX.drag;if(D&&D.guides)D.guides.forEach(g=>{s+=g.v?`<line x1="${g.v}" y1="0" x2="${g.v}" y2="${CVH}" stroke="#00b8ff" stroke-width="${sw*.8}"/>`:`<line x1="0" y1="${g.h}" x2="512" y2="${g.h}" stroke="#00b8ff" stroke-width="${sw*.8}"/>`});
 if(D&&D.type=='rot'&&D.on){const l=cvL(D.items[0].id);if(l)s+=`<g transform="translate(${D.c.x} ${D.c.y-40*px}) scale(${px})"><rect x="-22" y="-11" width="44" height="22" rx="11" fill="#2a2440" opacity=".85"/><text text-anchor="middle" y="5" font-size="13" fill="#fff" font-family="sans-serif">${Math.round(((l.r%360)+540)%360-180)}°</text></g>`}
 o.innerHTML=s}
drawCv=function(){const e=document.getElementById('cvw');if(!e||!ui.cd)return;const s=cvSvgEl();if(s)s.outerHTML=coverSvg(ui.cd,{ed:1});else e.insertAdjacentHTML('afterbegin',coverSvg(ui.cd,{ed:1}));const n=cvSvgEl();if(n)n.removeAttribute('onpointerdown');cvMeasure();cvOverlay()};
function cvRedrawLayer(l){const s=cvSvgEl();if(!s)return;const el=s.querySelector(`:scope > [data-id="${l.id}"]`);if(!el)return drawCv();try{el.outerHTML=lyr(l)}catch(e){drawCv()}}
function cvMoveDom(l){const s=cvSvgEl(),el=s&&s.querySelector(`:scope > [data-id="${l.id}"]`);if(el)el.setAttribute('transform',cvTf(l))}
// ---------------------------------------------------------------- hit testing
function cvInBB(l,p,padPx){const b=cvBB(l),q=cvToLocal(l,p),[kx,ky]=cvK(l),px=cvPx(),ex=Math.max(padPx*px/Math.abs(kx),0),ey=Math.max(padPx*px/Math.abs(ky),0);
 const mx=Math.max(0,(36*px/Math.abs(kx)-b.w)/2),my=Math.max(0,(36*px/Math.abs(ky)-b.h)/2),gx=padPx?Math.max(ex,mx):0,gy=padPx?Math.max(ey,my):0;return q.x>=b.x-gx&&q.x<=b.x+b.w+gx&&q.y>=b.y-gy&&q.y<=b.y+b.h+gy}
function cvHits(e,p){const L=ui.cd.layers,vis=L.filter(l=>!l.hide),order=id=>L.findIndex(l=>l.id==id),out=[],seen=new Set(),add=id=>{if(!seen.has(id)){seen.add(id);out.push(id)}};
 const pre=new Set();try{document.elementsFromPoint(e.clientX,e.clientY).forEach(el=>{const g=el.closest&&el.closest('#cv > [data-id]');if(g)pre.add(g.dataset.id)})}catch(x){}
 vis.forEach(l=>{if(l.t=='m'&&l.crop&&cvInBB(l,p,0))pre.add(l.id);if(l.t=='x'&&cvInBB(l,p,0))pre.add(l.id);if(l.t=='s'&&cvElInfo(l.k,l.ev).hit!='frame'&&cvInBB(l,p,0))pre.add(l.id)});
 vis.filter(l=>pre.has(l.id)).sort((a,b)=>order(b.id)-order(a.id)).forEach(l=>add(l.id));
 vis.filter(l=>!seen.has(l.id)&&!(l.t=='s'&&cvElInfo(l.k,l.ev).hit=='frame')&&cvInBB(l,p,10)).sort((a,b)=>{const A=cvBB(a),B=cvBB(b),[ka,kb]=[cvK(a),cvK(b)];return Math.abs(A.w*A.h*ka[0]*ka[1])-Math.abs(B.w*B.h*kb[0]*kb[1])}).forEach(l=>add(l.id));
 const un=out.filter(id=>!cvL(id).lock);return un.length?un.concat(out.filter(id=>cvL(id).lock)):out}
function cvInSel(p){const ids=cvSelIds();if(!ids.length)return false;if(ids.length==1)return cvInBB(cvL(ids[0]),p,8);const A=cvAABB(ids),px=cvPx()*8;return p.x>=A.x-px&&p.x<=A.x+A.w+px&&p.y>=A.y-px&&p.y<=A.y+A.h+px}
function cvHandleAt(p){const ids=cvSelIds();if(!ids.length||ids.some(id=>cvL(id).lock))return null;const{H}=cvHandles(ids),r=16*cvPx();let best=null,bd=r;H.forEach(h=>{const d=Math.hypot(h.x-p.x,h.y-p.y);if(d<=bd){bd=d;best=h}});return best}
function cvSelect(id,add){const l=cvL(id);if(!l){ui.sel='bg';ui.cvMulti=null;return}
 if(add){const cur=new Set(cvSelIds());cur.has(id)?cur.delete(id):cur.add(id);const a=[...cur];ui.cvMulti=a.length>1?a:null;ui.sel=a[a.length-1]||'bg';return}
 if(l.gid){const g=ui.cd.layers.filter(x=>x.gid==l.gid&&!x.hide).map(x=>x.id);ui.cvMulti=g.length>1?g:null}else ui.cvMulti=null;ui.sel=id}
// ---------------------------------------------------------------- pointer interaction
const CVP=new Map();
function cvxDown(e){if(!ui.cd)return;const p=cvPt(e);if(!p)return;e.preventDefault();CVP.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(CVP.size==2&&CVX.drag){cvPinchStart();return}if(CVP.size>2)return;
 window.addEventListener('pointermove',cvxMove);window.addEventListener('pointerup',cvxUp);window.addEventListener('pointercancel',cvxUp);
 const st=document.getElementById('cvstage');
 if(ui.cvCrop){const l=cvL(ui.cvCrop.id);if(!l)return;const C=cvCorners(l),mid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2}),hs=[...C.map((c,i)=>({k:'c'+i,...c})),{k:'t',...mid(C[0],C[1])},{k:'r',...mid(C[1],C[2])},{k:'b',...mid(C[2],C[3])},{k:'l',...mid(C[3],C[0])}],r=18*cvPx();
  const h=hs.find(h=>Math.hypot(h.x-p.x,h.y-p.y)<=r);CVX.drag={type:h?'cropr':'cropm',k:h&&h.k,p0:p,cx:e.clientX,cy:e.clientY,c0:{...l.crop},x0:l.x,y0:l.y,on:0};return}
 const h=cvHandleAt(p);if(h){CVX.drag={type:h.k=='rot'?'rot':h.k[0]=='c'?'scale':'stretch',k:h.k,p0:p,cx:e.clientX,cy:e.clientY,on:0};cvOpInit(CVX.drag,p);return}
 const hits=cvHits(e,p);CVX.hits=hits;CVX.hp={x:e.clientX,y:e.clientY};
 if(e.altKey&&hits.length>1){const i=hits.indexOf(ui.sel);cvSelect(hits[(i+1)%hits.length]);CVX.drag={type:'tap',cx:e.clientX,cy:e.clientY,p0:p,on:0,re:1};cvOverlay();return}
 if((e.shiftKey||e.ctrlKey||e.metaKey)&&hits.length){cvSelect(hits[0],1);CVX.drag={type:'tap',cx:e.clientX,cy:e.clientY,p0:p,on:0,re:1};cvOverlay();return}
 if(cvInSel(p)){const t=hits[0]&&!cvSelIds().includes(hits[0])?hits[0]:null,ids=cvSelIds();CVX.drag={type:'move',p0:p,cx:e.clientX,cy:e.clientY,on:0,tap:t,sid:ids.length==1?ids[0]:null};cvOpInit(CVX.drag,p);return}
 if(hits.length){const id=hits[0],was=ui.sel;cvSelect(id);CVX.drag={type:'move',p0:p,cx:e.clientX,cy:e.clientY,on:0,re:1,sid:id};cvOpInit(CVX.drag,p);cvOverlay();return}
 if(ui.sel=='bg'&&!cvSelIds().length&&ui.cd.bg)CVX.drag={type:'pan',p0:p,cx:e.clientX,cy:e.clientY,on:0,bx0:+ui.cd.bg.bx||0,by0:+ui.cd.bg.by||0,tapbg:1};
 else CVX.drag={type:(ui.cvZ||1)>1?'view':'tap',p0:p,cx:e.clientX,cy:e.clientY,on:0,tapbg:1,sl:st?st.scrollLeft:0,stp:st?st.scrollTop:0}}
function cvOpInit(D,p){const ids=cvSelIds();D.items=ids.map(id=>{const l=cvL(id);return{id,x0:l.x,y0:l.y,s0:l.s,size0:l.size,r0:l.r||0,sx0:l.sx||1,sy0:l.sy||1}});
 if(!ids.length)return;const A=cvAABB(ids);D.A0=A;
 if(D.type=='scale'){const i=+D.k[1],P=ids.length==1?cvCorners(cvL(ids[0])):[{x:A.x,y:A.y},{x:A.x+A.w,y:A.y},{x:A.x+A.w,y:A.y+A.h},{x:A.x,y:A.y+A.h}];D.anc=P[(i+2)%4];D.cor=P[i]}
 if(D.type=='rot'){const l=cvL(ids[0]);D.c=ids.length==1?(()=>{const b=cvBB(l);return cvToCv(l,{x:b.x+b.w/2,y:b.y+b.h/2})})():{x:A.cx,y:A.cy};D.a0=Math.atan2(p.y-D.c.y,p.x-D.c.x)}
 if(D.type=='stretch'){const l=cvL(ids[0]),b=cvBB(l),loc={t:{x:b.x+b.w/2,y:b.y+b.h},b:{x:b.x+b.w/2,y:b.y},l:{x:b.x+b.w,y:b.y+b.h/2},r:{x:b.x,y:b.y+b.h/2}}[D.k];D.bb=b;D.al=loc;D.ac=cvToCv(l,loc);D.l0={...l}}
 if(D.type=='move'){const sel=new Set(ids),px=cvPx();D.tx=[0,256,512];D.ty=[0,CVH/2,CVH];ui.cd.layers.forEach(l=>{if(sel.has(l.id)||l.hide)return;const B=cvAABB([l.id]);if(!(B.w>0))return;D.tx.push(B.x,B.cx,B.x+B.w);D.ty.push(B.y,B.cy,B.y+B.h)});D.thr=6*px}}
function cvxMove(e){const D=CVX.drag;if(!D)return;if(CVP.has(e.pointerId))CVP.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(D.type=='pinch')return cvPinchMove();const p=cvPt(e);if(!p)return;
 if(!D.on){if(Math.hypot(e.clientX-D.cx,e.clientY-D.cy)<5)return;if(D.type=='tap')return;D.on=1;if(D.type!='view')snap();if(D.type=='move'&&D.items&&D.items.some(it=>cvL(it.id).lock)){D.type='tap';D.on=0;toast('This object is locked. Unlock it in the Layers panel to move it.','err');return}}
 const dx=p.x-D.p0.x,dy=p.y-D.p0.y;
 if(D.type=='view'){const st=document.getElementById('cvstage');if(st){st.scrollLeft=D.sl-(e.clientX-D.cx);st.scrollTop=D.stp-(e.clientY-D.cy)}return}
 if(D.type=='pan'){const b=ui.cd.bg;b.bx=D.bx0+dx;b.by=D.by0+dy;cvBgClamp(b);const s=cvSvgEl();if(s){drawCv()}return}
 if(D.type=='move'){let ox=dx,oy=dy;D.guides=[];if(!e.altKey&&D.A0){const A=D.A0,xs=[A.x+ox,A.cx+ox,A.x+A.w+ox],ys=[A.y+oy,A.cy+oy,A.y+A.h+oy];let bx=null,by=null;
   xs.forEach(v=>D.tx.forEach(t=>{const d=t-v;if(Math.abs(d)<=D.thr&&(bx==null||Math.abs(d)<Math.abs(bx.d)))bx={d,t}}));ys.forEach(v=>D.ty.forEach(t=>{const d=t-v;if(Math.abs(d)<=D.thr&&(by==null||Math.abs(d)<Math.abs(by.d)))by={d,t}}));
   if(bx){ox+=bx.d;D.guides.push({v:bx.t})}if(by){oy+=by.d;D.guides.push({h:by.t})}}
  D.items.forEach(it=>{const l=cvL(it.id);l.x=Math.round((it.x0+ox)*10)/10;l.y=Math.round((it.y0+oy)*10)/10;cvMoveDom(l)});cvOverlay();return}
 if(D.type=='scale'){const A=D.anc,C=D.cor,vx=C.x-A.x,vy=C.y-A.y,f=Math.max(.04,((p.x-A.x)*vx+(p.y-A.y)*vy)/((vx*vx+vy*vy)||1));
  D.items.forEach(it=>{const l=cvL(it.id);l.x=A.x+(it.x0-A.x)*f;l.y=A.y+(it.y0-A.y)*f;if(l.t=='x')l.size=cvClamp(Math.round(it.size0*f*10)/10,4,400);else l.s=cvClamp(+(it.s0*f).toFixed(3),.04,14);l.t=='x'?cvRedrawLayer(l):cvMoveDom(l)});cvMeasure();cvOverlay();return}
 if(D.type=='stretch'){const l=cvL(D.items[0].id),q=cvToLocal(D.l0,p),b=D.bb;let f;
  if(D.k=='r')f=(q.x-b.x)/b.w;else if(D.k=='l')f=(b.x+b.w-q.x)/b.w;else if(D.k=='b')f=(q.y-b.y)/b.h;else f=(b.y+b.h-q.y)/b.h;f=Math.max(.08,f);
  if(D.k=='l'||D.k=='r')l.sx=+(D.items[0].sx0*f).toFixed(3);else l.sy=+(D.items[0].sy0*f).toFixed(3);l.x=D.l0.x;l.y=D.l0.y;const a=cvToCv(l,D.al);l.x+=D.ac.x-a.x;l.y+=D.ac.y-a.y;cvMoveDom(l);cvOverlay();return}
 if(D.type=='rot'){let da=(Math.atan2(p.y-D.c.y,p.x-D.c.x)-D.a0)*180/Math.PI;if(D.items.length==1&&!e.altKey){const t=D.items[0].r0+da,n=Math.round(t/45)*45;if(Math.abs(t-n)<4)da+=n-t}
  const rad=da*Math.PI/180;D.items.forEach(it=>{const l=cvL(it.id),vx=it.x0-D.c.x,vy=it.y0-D.c.y;l.x=D.c.x+vx*Math.cos(rad)-vy*Math.sin(rad);l.y=D.c.y+vx*Math.sin(rad)+vy*Math.cos(rad);l.r=Math.round((it.r0+da)*10)/10;cvMoveDom(l)});cvOverlay();return}
 if(D.type=='cropm'){const l=cvL(ui.cvCrop.id),[kx,ky]=cvK(l),a=-(l.r||0)*Math.PI/180,lx=(dx*Math.cos(a)-dy*Math.sin(a))/kx,ly=(dx*Math.sin(a)+dy*Math.cos(a))/ky;l.x=D.x0+dx;l.y=D.y0+dy;l.crop.x=D.c0.x-lx;l.crop.y=D.c0.y-ly;cvRedrawLayer(l);cvOverlay();return}
 if(D.type=='cropr'){const l=cvL(ui.cvCrop.id),q=cvToLocal(l,p),fx=q.x+50,fy=q.y+100,c={...D.c0},R=c.x+c.w,B=c.y+c.h,k=D.k,m=8;
  const Lf=k=='c0'||k=='c3'||k=='l',Rf=k=='c1'||k=='c2'||k=='r',Tf=k=='c0'||k=='c1'||k=='t',Bf=k=='c2'||k=='c3'||k=='b';
  if(Lf){c.x=Math.min(fx,R-m);c.w=R-c.x}if(Rf)c.w=Math.max(m,fx-c.x);if(Tf){c.y=Math.min(fy,B-m);c.h=B-c.y}if(Bf)c.h=Math.max(m,fy-c.y);l.crop=c;cvRedrawLayer(l);cvOverlay();return}}
function cvxUp(e){CVP.delete(e.pointerId);const D=CVX.drag;if(D&&D.type=='pinch'){if(CVP.size==0){CVX.drag=null;cvxOff();if(ui.cvCrop){ui.cvCrop.base=null;ui.cvCrop.z=1}render()}return}
 if(CVP.size>0)return;cvxOff();CVX.drag=null;if(!D)return;
 if(!D.on){if(D.tap){cvSelect(D.tap)}else if(D.tapbg&&!ui.cvCrop){ui.sel='bg';ui.cvMulti=null}
  else if(D.sid){const now=Date.now(),l=cvL(D.sid);if(l&&l.t=='x'&&CVX.lastTap.id==D.sid&&now-CVX.lastTap.t<450){CVX.lastTap={t:0,id:null};render();setTimeout(()=>{const t=document.getElementById('cvtxt');if(t){t.scrollIntoView({block:'center'});t.focus();t.select()}},30);return}CVX.lastTap={t:now,id:D.sid}}
  render();return}
 if(ui.cvCrop){ui.cvCrop.base=null;ui.cvCrop.z=1}
 if(D.type=='view')return;render()}
function cvxOff(){window.removeEventListener('pointermove',cvxMove);window.removeEventListener('pointerup',cvxUp);window.removeEventListener('pointercancel',cvxUp)}
function cvPinchStart(){const P=[...CVP.values()].slice(0,2),D0=CVX.drag,s=document.getElementById('cvstage'),r=cvSvgEl().getBoundingClientRect(),k=512/r.width,c={x:((P[0].x+P[1].x)/2-r.left)*k,y:((P[0].y+P[1].y)/2-r.top)*k};
 const D={type:'pinch',d0:Math.hypot(P[0].x-P[1].x,P[0].y-P[1].y)||1,a0:Math.atan2(P[1].y-P[0].y,P[1].x-P[0].x),c0:c,cs:{x:(P[0].x+P[1].x)/2,y:(P[0].y+P[1].y)/2},on:1};
 if(ui.cvCrop){const l=cvL(ui.cvCrop.id);snap();D.mode='crop';D.l0={...l,crop:{...l.crop}}}
 else if(D0&&(D0.type=='move'||D0.type=='scale'||D0.type=='rot')&&cvSelIds().length&&!cvSelIds().some(id=>cvL(id).lock)){if(!D0.on)snap();D.mode='obj';D.items=cvSelIds().map(id=>{const l=cvL(id);return{id,x0:l.x,y0:l.y,s0:l.s,size0:l.size,r0:l.r||0}});
  if(D0.on&&D0.items)D0.items.forEach(it=>{const l=cvL(it.id),j=D.items.find(z=>z.id==it.id);if(j){j.x0=l.x;j.y0=l.y}})}
 else if(ui.sel=='bg'&&!cvSelIds().length){snap();D.mode='bg';D.bz0=+ui.cd.bg.bz||1}
 else{D.mode='view';D.z0=ui.cvZ||1;D.sl=s?s.scrollLeft:0;D.stp=s?s.scrollTop:0}
 CVX.drag=D}
function cvPinchMove(){const D=CVX.drag,P=[...CVP.values()].slice(0,2);if(P.length<2)return;const d=Math.hypot(P[0].x-P[1].x,P[0].y-P[1].y),f=d/D.d0,da=(Math.atan2(P[1].y-P[0].y,P[1].x-P[0].x)-D.a0),s=cvSvgEl();if(!s)return;const r=s.getBoundingClientRect(),k=512/r.width,cx=((P[0].x+P[1].x)/2-r.left)*k,cy=((P[0].y+P[1].y)/2-r.top)*k;
 if(D.mode=='obj'){D.items.forEach(it=>{const l=cvL(it.id),vx=(it.x0-D.c0.x)*f,vy=(it.y0-D.c0.y)*f;l.x=cx+vx*Math.cos(da)-vy*Math.sin(da);l.y=cy+vx*Math.sin(da)+vy*Math.cos(da);l.r=Math.round((it.r0+da*180/Math.PI)*10)/10;if(l.t=='x'){l.size=cvClamp(Math.round(it.size0*f),4,400);cvRedrawLayer(l)}else{l.s=cvClamp(+(it.s0*f).toFixed(3),.04,14);cvMoveDom(l)}});cvMeasure();cvOverlay()}
 else if(D.mode=='bg'){ui.cd.bg.bz=D.bz0*f;cvBgClamp(ui.cd.bg);drawCv()}
 else if(D.mode=='crop'){cvCropZoomTo(D.l0,f)}
 else{const z=cvClamp(D.z0*f,1,4);if(Math.abs(z-(ui.cvZ||1))>.01){ui.cvZ=z;cvApplyZoom(D.cs)}}}
function cvApplyZoom(cs){const w=document.getElementById('cvwrap'),st=document.getElementById('cvstage');if(!w||!st)return;const z=ui.cvZ||1,r0=w.getBoundingClientRect(),c=cs||{x:st.getBoundingClientRect().left+st.clientWidth/2,y:st.getBoundingClientRect().top+st.clientHeight/2},fx=(c.x-r0.left)/r0.width,fy=(c.y-r0.top)/r0.height;
 w.style.width=(z*100)+'%';const r1=w.getBoundingClientRect(),sr=st.getBoundingClientRect();st.scrollLeft+=r1.left+fx*r1.width-c.x;st.scrollTop+=r1.top+fy*r1.height-c.y;const zl=document.getElementById('cvzl');if(zl)zl.textContent=Math.round(z*100)+'%';cvOverlay()}
function cvZoom(f){ui.cvZ=f==0?1:cvClamp((ui.cvZ||1)*f,1,4);cvApplyZoom();if(f==0){const st=document.getElementById('cvstage');if(st){st.scrollLeft=0;st.scrollTop=0}}}
// ---------------------------------------------------------------- crop tool
function cvCropStart(){const l=SEL();if(!l||l.t!='m')return toast('Select a member on the cover first.','err');if(l.lock)return toast('Unlock this member first.','err');snap();
 const b=CVX.bb[l.id]||{x:-28,y:-100,w:56,h:196};ui.cvCrop={id:l.id,o:{x:l.x,y:l.y,s:l.s,crop:l.crop?{...l.crop}:null},z:1};if(!l.crop)l.crop={x:+(b.x+50).toFixed(2),y:+(b.y+100).toFixed(2),w:+b.w.toFixed(2),h:+b.h.toFixed(2)};ui.cvMulti=null;render()}
function cvCropDone(ok){const c=ui.cvCrop;if(!c)return;const l=cvL(c.id);if(l&&!ok){l.x=c.o.x;l.y=c.o.y;l.s=c.o.s;if(c.o.crop)l.crop=c.o.crop;else delete l.crop;if(ui.hu.length)ui.hu.pop()}
 if(l&&ok&&l.crop&&!c.o.crop){const b=CVX.bb[l.id];if(b&&Math.abs(l.crop.w-b.w)<.5&&Math.abs(l.crop.h-b.h)<.5&&Math.abs(l.crop.x-(b.x+50))<.5&&Math.abs(l.crop.y-(b.y+100))<.5&&l.s==c.o.s)delete l.crop}
 ui.cvCrop=null;toast(ok?'Crop applied. The original picture is kept — reopen Crop to change it.':'Crop cancelled.');render()}
function cvCropReset(){const l=SEL();if(!l||l.t!='m')return;snap();if(ui.cvCrop){const c=ui.cvCrop;l.x=c.o.x;l.y=c.o.y;l.s=c.o.s;delete l.crop;ui.cvCrop=null;drawCv();cvCropStart();ui.hu.pop();return}delete l.crop;toast('Crop removed — the full picture is shown again.');render()}
function cvCropZoomTo(l0,f){const l=cvL(ui.cvCrop.id);if(!l||!l0.crop)return;const s1=cvClamp(l0.s*f,.1,14),c0=l0.crop,cl={x:c0.x+c0.w/2-50,y:c0.y+c0.h/2-100},C=cvToCv(l0,cl),g=l0.s/s1;
 l.s=+s1.toFixed(3);l.crop={x:cl.x+50-c0.w*g/2,y:cl.y+100-c0.h*g/2,w:c0.w*g,h:c0.h*g};l.x=l0.x;l.y=l0.y;const a=cvToCv(l,cl);l.x+=C.x-a.x;l.y+=C.y-a.y;cvRedrawLayer(l);cvOverlay()}
function cvCropZoom(v){const c=ui.cvCrop;if(!c)return;if(!c.base){const l=cvL(c.id);c.base={...l,crop:{...l.crop}}}c.z=+v;cvCropZoomTo(c.base,c.z)}
// ---------------------------------------------------------------- object commands
function cvDo(fn,msg){const ids=cvSelIds();if(!ids.length)return toast('Select an object first.','err');snap();fn(ids);if(msg)toast(msg);render()}
function cvDup(){cvDo(ids=>{const A=ui.cd.layers,gm={},nw=[];ids.forEach(id=>{const i=A.findIndex(l=>l.id==id),l=A[i],c=JSON.parse(JSON.stringify(l));c.id=uid();c.name=(l.name||'Layer')+' copy';c.x=l.x+18;c.y=l.y+18;c.lock=0;if(l.gid){gm[l.gid]=gm[l.gid]||('G'+uid());c.gid=gm[l.gid]}A.push(c);nw.push(c.id)});ui.cvMulti=nw.length>1?nw:null;ui.sel=nw[nw.length-1]},'Duplicated.')}
function cvDel(){const ids=cvSelIds();if(!ids.length)return;snap();ui.cd.layers=ui.cd.layers.filter(l=>!ids.includes(l.id));ui.cvMulti=null;ui.sel='bg';toast(ids.length>1?`${ids.length} objects deleted.`:'Deleted.');render()}
function cvLock(){const ids=cvSelIds();if(!ids.length)return;const on=!ids.every(id=>cvL(id).lock);snap();ids.forEach(id=>cvL(id).lock=on?1:0);toast(on?'Locked — it can no longer be moved by accident.':'Unlocked.');render()}
function cvHide(){const ids=cvSelIds();if(!ids.length)return;snap();ids.forEach(id=>cvL(id).hide=1);ui.cvMulti=null;ui.sel='bg';toast('Hidden. Show it again from the Layers panel.');render()}
function cvOrder(op){cvDo(ids=>{const A=ui.cd.layers,set=new Set(ids),sel=A.filter(l=>set.has(l.id)),rest=A.filter(l=>!set.has(l.id));
 if(op=='front')ui.cd.layers=rest.concat(sel);else if(op=='back')ui.cd.layers=sel.concat(rest);
 else if(op=='fwd'){for(let i=A.length-2;i>=0;i--)if(set.has(A[i].id)&&!set.has(A[i+1].id))[A[i],A[i+1]]=[A[i+1],A[i]]}
 else if(op=='bwd'){for(let i=1;i<A.length;i++)if(set.has(A[i].id)&&!set.has(A[i-1].id))[A[i],A[i-1]]=[A[i-1],A[i]]}})}
function cvGroup(){const ids=cvSelIds();if(ids.length<2)return toast('Select two or more objects to group them (Layers → Select several).','err');snap();const g='G'+uid();ids.forEach(id=>cvL(id).gid=g);toast('Grouped — they now move together.');render()}
function cvUngroup(){const ids=cvSelIds();if(!ids.some(id=>cvL(id).gid))return toast('Nothing to ungroup.','err');snap();ids.forEach(id=>delete cvL(id).gid);ui.cvMulti=null;toast('Ungrouped.');render()}
function cvAlign(k){cvDo(ids=>{const one=ids.length==1,A=one?{x:0,y:0,w:512,h:CVH,cx:256,cy:CVH/2}:cvAABB(ids);ids.forEach(id=>{const l=cvL(id);if(l.lock)return;const B=cvAABB([id]);
 if(k=='l')l.x+=A.x-B.x;if(k=='r')l.x+=A.x+A.w-(B.x+B.w);if(k=='c')l.x+=A.cx-B.cx;if(k=='t')l.y+=A.y-B.y;if(k=='b')l.y+=A.y+A.h-(B.y+B.h);if(k=='m')l.y+=A.cy-B.cy})})}
function cvBelow(){const H=CVX.hits||[];if(H.length<2)return toast('Tap the place where objects overlap first.','err');const i=H.indexOf(ui.sel);cvSelect(H[(i+1)%H.length]);ui.cvMulti=null;ui.sel=H[(i+1)%H.length];render()}
function cvSelAll(){const v=ui.cd.layers.filter(l=>!l.hide&&!l.lock).map(l=>l.id);if(!v.length)return;ui.cvMulti=v.length>1?v:null;ui.sel=v[v.length-1];render()}
function cvNudge(dx,dy){const ids=cvSelIds().filter(id=>!cvL(id).lock);if(!ids.length)return;if(!CVX.nudge){snap();CVX.nudge=1}clearTimeout(CVX.nt);CVX.nt=setTimeout(()=>{CVX.nudge=0;render()},600);ids.forEach(id=>{const l=cvL(id);l.x+=dx;l.y+=dy;cvMoveDom(l)});cvOverlay()}
// adding things
function cvAddEl(k){snap();const info=cvElInfo(k,1),fr=info.hit=='frame',l={t:'s',id:uid(),name:info.n||k,k,ev:1,col:info.c1||'#ffd966',col2:info.c2||info.c1||'#ffffff',x:256,y:CVH/2,s:fr?4.6:1.8,r:0,sx:1,sy:1,op:1,hide:0,lock:0};
 if(k.startsWith('stk:')){l.col='#ffd966'}ui.cd.layers.push(l);ui.sel=l.id;ui.cvMulti=null;render()}
function cvAddTxt(k){addT(k);const l=SEL();if(l&&l.t=='x'){l.fw=800;render()}}
function cvPre(i,all){const p=CVPRE[i][1];snap();const ap=l=>{['gr','gw','bgx','cv','shc','sho','shb','shd','sha'].forEach(k=>delete l[k]);Object.assign(l,JSON.parse(JSON.stringify(p)))};if(all)ui.cd.layers.filter(l=>l.t=='x').forEach(ap);else{const l=SEL();if(l&&l.t=='x')ap(l);else return toast('Select a text first.','err')}render()}
// generic property setters (k can be 'gr.a', 'bgx.c' …)
function cvSetK(t,k,v){const ks=k.split('.');let o=t;for(let i=0;i<ks.length-1;i++){o[ks[i]]=o[ks[i]]&&typeof o[ks[i]]=='object'?o[ks[i]]:{};o=o[ks[i]]}o[ks[ks.length-1]]=v}
function cvGetK(t,k){return k.split('.').reduce((o,x)=>o==null?o:o[x],t)}
function cvLive(k,v){const t=TG();if(!t)return;cvSetK(t,k,v);if(ui.sel=='bg')cvBgClamp(ui.cd.bg);if(t.t&&t.t!='bg'&&SEL())cvRedrawLayer(t);else drawCv();cvMeasure();cvOverlay()}
function cvLiveB(k,v){const b=ui.cd.bg;cvSetK(b,k,v);cvBgClamp(b);drawCv()}
function cvChgB(k,v){snap();const b=ui.cd.bg;cvSetK(b,k,v);cvBgClamp(b);render()}
function cvChg(k,v){snap();const t=TG();if(!t)return;cvSetK(t,k,v);if(ui.sel=='bg')cvBgClamp(ui.cd.bg);render()}
function cvGrStop(i,v,del){snap();const l=SEL();if(!l)return;l.gr=l.gr||{on:1,c:['#ff7eb6','#a58df0'],a:90};if(del){if(l.gr.c.length>2)l.gr.c.splice(i,1)}else if(i<0){if(l.gr.c.length<5)l.gr.c.push(l.gr.c[l.gr.c.length-1])}else l.gr.c[i]=v;render()}
function cvBg(k,v){snap();const b=ui.cd.bg;if(k=='loc'){b.type='loc';b.loc=v;b.lv=b.lv|0;if(b.lv>2)b.lv=0;b.tod=b.tod||'a';b.bz=1;b.bx=0;b.by=0}else if(k=='graphic'){b.type=v;}else b[k]=v;cvBgClamp(b);ui.sel='bg';ui.cvMulti=null;render()}
function cvBgReset(){snap();const b=ui.cd.bg;b.bx=0;b.by=0;b.bz=1;toast('Background framing reset.');render()}
// cached <img> previews for heavy art (location thumbnails)
function cvImg(key,mk,w,h){let u=CVX.img[key];if(!u){try{u=URL.createObjectURL(new Blob([`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${mk()}</svg>`],{type:'image/svg+xml'}));CVX.img[key]=u}catch(e){return''}}return`<img src="${u}" alt="" loading="lazy" draggable="false">`}
const cvLocThumb=(k,v,t)=>cvImg(`loc:${k}:${v}:${t}`,()=>CVLOC.svg(k,v,t,'th'+k+v+t),512,683);
// ---------------------------------------------------------------- layers panel drag & drop
function cvLyDown(e,id){e.preventDefault();e.stopPropagation();const row=e.currentTarget.closest('.cvly'),list=row&&row.parentElement;if(!list)return;const rows=[...list.querySelectorAll('.cvly[data-lid]')],start=rows.indexOf(row),y0=e.clientY,hgt=row.getBoundingClientRect().height;
 row.classList.add('drag');let tgt=start;const mv=ev=>{const dy=ev.clientY-y0;row.style.transform=`translateY(${dy}px)`;tgt=cvClamp(start+Math.round(dy/hgt),0,rows.length-1);rows.forEach((r,i)=>{if(r===row)return;r.style.transform=i>start&&i<=tgt?`translateY(${-hgt}px)`:i<start&&i>=tgt?`translateY(${hgt}px)`:''})};
 const up=()=>{window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);rows.forEach(r=>r.style.transform='');row.classList.remove('drag');if(tgt==start)return;
  snap();const A=ui.cd.layers,disp=A.slice().reverse(),[it]=disp.splice(start,1);disp.splice(tgt,0,it);ui.cd.layers=disp.reverse();render()};
 window.addEventListener('pointermove',mv);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up)}
function cvLyTap(e,id){if(ui.cvLyMulti||e.shiftKey||e.ctrlKey||e.metaKey){cvSelect(id,1)}else{ui.cvMulti=null;ui.sel=id}render()}
function cvLyOp(id,op){const l=cvL(id);if(!l)return;snap();if(op=='hide'){l.hide=l.hide?0:1;if(l.hide&&cvSelIds().includes(id)){ui.cvMulti=null;ui.sel='bg'}}else if(op=='lock')l.lock=l.lock?0:1;else if(op=='del'){ui.cd.layers=ui.cd.layers.filter(x=>x.id!=id);if(cvSelIds().includes(id)){ui.cvMulti=null;ui.sel='bg'}}render()}
function cvLyMany(op){const ids=cvSelIds();if(!ids.length)return toast('Select layers first.','err');snap();ids.forEach(id=>{const l=cvL(id);if(op=='lock')l.lock=1;if(op=='unlock')l.lock=0;if(op=='hide')l.hide=1;if(op=='show')l.hide=0});if(op=='hide'){ui.cvMulti=null;ui.sel='bg'}render()}
function cvThumb(l){const A=cvAABB([l.id]);if(!(A.w>0))return'<span class="cvth"></span>';const p=Math.max(A.w,A.h)*.08,s=Math.max(A.w,A.h)+2*p;return`<span class="cvth"><svg viewBox="${(A.cx-s/2).toFixed(1)} ${(A.cy-s/2).toFixed(1)} ${s.toFixed(1)} ${s.toFixed(1)}" width="34" height="34">${lyr(l).replace(/data-id="[^"]+"/,'')}</svg></span>`}
// ---------------------------------------------------------------- panels (HTML)
const cvIc={undo:'<path d="M9 7L4 12l5 5M4 12h10a6 6 0 0 1 0 12h-3" transform="translate(0 -3)"/>',redo:'<path d="M15 7l5 5-5 5M20 12H10a6 6 0 0 0 0 12h3" transform="translate(0 -3)"/>',bg:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 16l5-5 4 4 3-3 6 6"/><circle cx="16" cy="9" r="1.6"/>',el:'<path d="M12 3l2.6 5.6 6 .7-4.5 4 1.3 6-5.4-3-5.4 3 1.3-6-4.5-4 6-.7Z"/>',tx:'<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',mem:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 5-7 8-7s7 2 8 7"/>',ly:'<path d="M12 3l9 5-9 5-9-5Z"/><path d="M3 13l9 5 9-5"/>',crop:'<path d="M7 2v15h15M2 7h15v15"/>',zin:'<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5M8 11h6M11 8v6"/>',zout:'<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5M8 11h6"/>',fit:'<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/>',dup:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V4h12"/>',up:'<path d="M12 19V5M6 11l6-6 6 6"/>',dn:'<path d="M12 5v14M6 13l6 6 6-6"/>',grip:'<path d="M8 6h.01M16 6h.01M8 12h.01M16 12h.01M8 18h.01M16 18h.01"/>',below:'<path d="M4 8l8-4 8 4-8 4Z"/><path d="M4 14l8 4 8-4" stroke-dasharray="2 2"/><path d="M12 12v8"/>'};
const cvI=k=>`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${cvIc[k]||''}</svg>`;
function cvRg(lb,k,a,b,st,v,unit){const T=TG()||{},val=v!=null?v:cvGetK(T,k);return`<label class="cvrg"><span>${lb}<b>${val==null?'':Math.round(val*100)/100}${unit||''}</b></span><input type="range" min="${a}" max="${b}" step="${st||1}" value="${val==null?a:val}" onpointerdown="snap()" oninput="this.previousElementSibling.lastChild.textContent=this.value;cvLive('${k}',+this.value)" onchange="render()"></label>`}
function cvCol(lb,k,v){const T=TG()||{},val=v||cvGetK(T,k)||'#ffffff';return`<label class="cvcol"><input type="color" value="${val}" onfocus="snap()" oninput="cvLive('${k}',this.value)" onchange="render()"><span>${lb}</span></label>`}
function cvTog(lb,k,on){return`<label class="cvtog"><input type="checkbox" ${on?'checked':''} onchange="cvChg('${k}',this.checked?1:0)"> ${lb}</label>`}
function cvBgPanel(d){return cvBgPanel0(d).replace(/cvLive\(/g,'cvLiveB(')}
function cvBgPanel0(d){const b=d.bg,loc=b.type=='loc',LO=CVLOC.LOCS.find(x=>x[0]==b.loc)||CVLOC.LOCS[0];
 let h=`<div class="cvsec"><h4>Location backgrounds</h4><div class="cvlocs">${CVLOC.LOCS.map(([k,n])=>`<button class="cvloc ${loc&&b.loc==k?'on':''}" onclick="cvBg('loc','${k}')">${cvLocThumb(k,0,'a')}<small>${n}</small></button>`).join('')}</div>`;
 if(loc)h+=`<h4>${LO[1]} · View</h4><div class="cvvars">${LO[2].map((n,i)=>`<button class="cvloc ${(b.lv|0)==i?'on':''}" onclick="cvBg('lv',${i})">${cvLocThumb(LO[0],i,b.tod||'a')}<small>${n}</small></button>`).join('')}</div><h4>Time of day</h4><div class="cvchips">${[['m','Morning'],['a','Afternoon'],['e','Evening']].map(([k,n])=>`<button class="cvchip ${(b.tod||'a')==k?'on':''}" onclick="cvBg('tod','${k}')">${{m:'🌅',a:'☀️',e:'🌇'}[k]} ${n}</button>`).join('')}</div>`;
 h+=`</div><div class="cvsec"><h4>Graphic backgrounds</h4><div class="cvchips">${BGT.map(t=>`<button class="cvchip ${b.type==t?'on':''}" onclick="cvBg('graphic','${t}')">${t}</button>`).join('')}</div>${loc?'':`<div class="cvrow2">${cvCol('Color 1','c1',b.c1)}${b.type=='solid'?'':cvCol('Color 2','c2',b.c2)}${cvCol('Pattern','pc',b.pc)}</div>${cvRg('Pattern amount','int',0,1,.05,b.int)}<button class="b s" onclick="cvBg('seed',Math.floor(Math.random()*9999))">Shuffle decorations</button>`}</div>`;
 return h}
function cvBgFrame(d){return cvBgFrame0(d).replace(/cvLive\(/g,'cvLiveB(')}
function cvBgFrame0(d){const b=d.bg;cvBgClamp(b);return`<div class="cvsec"><h4>Background framing</h4><p class="st">Drag on an empty part of the cover (or pinch) to move and zoom the background. The picture itself is never changed.</p>${cvRg('Zoom','bz',1,3,.01,b.bz,'×')}${cvRg('Move left / right','bx',-Math.round((512*b.bz-512)/2),Math.round((512*b.bz-512)/2),1,b.bx)}${cvRg('Move up / down','by',-Math.round(Math.max(0,(cvBgH(b)*b.bz-CVH)/2)),Math.round(Math.max(0,(cvBgH(b)*b.bz-CVH)/2)),1,b.by)}<button class="b s" onclick="cvBgReset()">Reset position</button></div>`}
function cvElPanel(){const c=ui.cvElCat||'nature';return`<div class="cvchips cvscroll">${CVEL_CATS.map(([k,n])=>`<button class="cvchip ${c==k?'on':''}" onclick="ui.cvElCat='${k}';render()">${n}</button>`).join('')}</div><div class="cvels">${CVEL.list(c).map(({k,n})=>{const l={k,ev:1,col:null};return`<button class="cvel" title="${esc(n)}" onclick="cvAddEl('${k}')"><svg viewBox="-26 -26 52 52" width="44" height="44">${k.startsWith('stk:')?`<g fill="#ffb24d">${STK[k.slice(4)]}</g>`:cvElSvg(l,'t'+k)}</svg><small>${esc(n)}</small></button>`}).join('')}</div>`}
function cvTxPanel(){return`<div class="cvsec"><h4>Add text</h4><div class="cvchips">${['Title','Group Name','Center Name','Edition Label','Release Number','Subtitle','Text'].map(k=>`<button class="cvchip" onclick="cvAddTxt('${k}')">＋ ${k}</button>`).join('')}</div></div><div class="cvsec"><h4>Text styles</h4><p class="st">Select a text, then tap a style.</p><div class="cvchips">${CVPRE.map((p,i)=>`<button class="cvchip" onclick="cvPre(${i},0)">${p[0]}</button>`).join('')}${PRE.map((p,i)=>`<button class="cvchip" onclick="applyPre(${i},0)">${p[0]}</button>`).join('')}</div></div>`}
function cvMemPanel(d){const{PL,ids}=cvPoolList(),q=(ui.rq||'').toLowerCase(),on=new Set(d.layers.filter(l=>l.t=='m').map(l=>l.mid));const list=ids.filter(id=>{const m=get(id);return!q||m.name.toLowerCase().includes(q)});
 return`<div class="cvsec">${cvSingleCtx()?`<p class="st">Only members of this single's Senbatsu can be on the cover. They wear the single's confirmed costume.</p>`:''}${PL.ok?'':`<p style="color:var(--err)">${PL.msg}</p>`}<input class="cvq" placeholder="Search name" value="${esc(ui.rq||'')}" oninput="ui.rq=this.value;clearTimeout(CVX.qt);CVX.qt=setTimeout(()=>{render();const i=document.querySelector('.cvq');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},250)">
 <div class="cvmems">${list.map(id=>{const m=get(id);return`<button class="cvmem ${on.has(id)?'on':''}" onclick="addM(${id})" style="${cardSt(m)}">${ptc(m,46)}<small>${esc(m.name.split(' ')[0])}</small><em>${PL.tag(id)||''}</em></button>`}).join('')||'<p class="st">No member to show.</p>'}</div>
 <div class="cvchips" style="margin-top:6px">${cvSingleCtx()?`<button class="cvchip" onclick="incAll()">＋ All Senbatsu members</button><button class="cvchip" onclick="autoArr()">Auto arrange by position</button>`:''}${[['solo','Solo'],['duo','Duo'],['tri','Trio'],['five','Five'],['full','Senbatsu 16']].map(([k,n])=>`<button class="cvchip" onclick="layout('${k}')">Layout: ${n}</button>`).join('')}</div></div>`}
function cvLyPanel(d){const sel=new Set(cvSelIds()),PL=cvPool(),rows=[...d.layers].reverse().map(l=>{const bad=l.t=='m'&&cvSingleCtx()&&PL.ok&&!PL.has(l.mid);return`<div class="cvly ${sel.has(l.id)?'on':''} ${l.hide?'hid':''}" data-lid="${l.id}"><span class="cvgrip" onpointerdown="cvLyDown(event,'${l.id}')" title="Drag to reorder">${cvI('grip')}</span><button class="cvlyn" onclick="cvLyTap(event,'${l.id}')">${ui.cvLyMulti?`<input type="checkbox" tabindex="-1" ${sel.has(l.id)?'checked':''}>`:''}${cvThumb(l)}<span>${l.gid?'🔗 ':''}${bad?'⚠ ':''}${esc(l.name||'Layer')}</span></button><button class="cvib ${l.hide?'off':''}" title="Show / hide" onclick="cvLyOp('${l.id}','hide')">${cvI('eye')}</button><button class="cvib ${l.lock?'act':''}" title="Lock / unlock" onclick="cvLyOp('${l.id}','lock')">${cvI('lock')}</button><button class="cvib" title="Delete" onclick="cvLyOp('${l.id}','del')">${cvI('trash')}</button></div>`}).join('');
 return`<div class="cvsec"><div class="cvchips"><button class="cvchip ${ui.cvLyMulti?'on':''}" onclick="ui.cvLyMulti=!ui.cvLyMulti;render()">☑ Select several</button><button class="cvchip" onclick="cvSelAll()">Select all</button><button class="cvchip" onclick="cvGroup()">Group</button><button class="cvchip" onclick="cvUngroup()">Ungroup</button><button class="cvchip" onclick="cvDup()">Duplicate</button><button class="cvchip" onclick="cvLyMany('lock')">Lock</button><button class="cvchip" onclick="cvLyMany('unlock')">Unlock</button><button class="cvchip" onclick="cvLyMany('hide')">Hide</button><button class="cvchip" onclick="cvLyMany('show')">Show</button></div>
 <div class="cvchips"><button class="cvchip" onclick="cvOrder('front')">Bring to front</button><button class="cvchip" onclick="cvOrder('fwd')">Bring forward</button><button class="cvchip" onclick="cvOrder('bwd')">Send backward</button><button class="cvchip" onclick="cvOrder('back')">Send to back</button></div>
 <p class="st">Top of the list = front of the cover. Drag ⠿ to reorder.</p><div class="cvlys">${rows}<div class="cvly bgrow ${ui.sel=='bg'&&!sel.size?'on':''}"><span class="cvgrip"></span><button class="cvlyn" onclick="ui.sel='bg';ui.cvMulti=null;render()"><span class="cvth" style="background:${d.bg.type=='loc'?'#9cc4e8':d.bg.c1}"></span><span>Background (always at the back)</span></button></div></div></div>`}
function cvFontPicker(l){const cat=ui.cvFc||(CVF.find(f=>f[0]==l.font)||['','Rounded'])[1];return`<div class="cvsec"><h4>Font</h4><div class="cvchips cvscroll">${CVF_CATS.map(c=>`<button class="cvchip ${cat==c?'on':''}" onclick="ui.cvFc='${c}';render()">${c}</button>`).join('')}</div><div class="cvfonts">${CVF.filter(f=>f[1]==cat).map(([n,,th])=>`<button class="cvfont ${l.font==n?'on':''}" onclick="cvChg('font','${n}')" style="font-family:'${n}',sans-serif"><span data-notr>${esc(String(l.txt||n).split('\n')[0].slice(0,14)||n)}</span><small data-notr>${n}${th?' · ไทย':''}</small></button>`).join('')}</div></div>`}
function cvProps(d){if(ui.cvCrop){const l=cvL(ui.cvCrop.id);return`<div class="cvsec"><h4>Crop ${esc(l?l.name:'')}</h4><p class="st">Drag the white corners or edges to change the frame. Drag inside the frame (or pinch) to move and zoom the picture. Nothing is cut away from the original.</p>${cvRg('Zoom picture','',.5,3,.01,ui.cvCrop.z||1).replace(`cvLive('',+this.value)`,'cvCropZoom(this.value)').replace('onpointerdown="snap()"','')}<div class="cvchips"><button class="b p" onclick="cvCropDone(1)">✓ Done</button><button class="b s" onclick="cvCropDone(0)">Cancel</button><button class="b s" onclick="cvCropReset()">Remove crop</button></div></div>`}
 const ids=cvSelIds();if(ids.length>1)return`<div class="cvsec"><h4>${ids.length} objects selected</h4><div class="cvchips">${[['l','Align left'],['c','Align center'],['r','Align right'],['t','Align top'],['m','Align middle'],['b','Align bottom']].map(([k,n])=>`<button class="cvchip" onclick="cvAlign('${k}')">${n}</button>`).join('')}</div><div class="cvchips"><button class="cvchip" onclick="cvGroup()">Group</button><button class="cvchip" onclick="cvUngroup()">Ungroup</button><button class="cvchip" onclick="cvLock()">Lock / unlock</button><button class="cvchip" onclick="cvDup()">Duplicate</button><button class="cvchip" onclick="cvDel()">Delete</button></div><p class="st">Drag inside the pink box to move them together; corner handles resize them together.</p></div>`;
 const l=SEL();if(!l)return cvBgFrame(d)+`<div class="cvsec"><p class="st">Tap an object on the cover to edit it. Tap an empty part to select the background.</p></div>`;
 const nm=`<label class="cvname"><span>Name</span><input value="${esc(l.name||'')}" onfocus="snap()" oninput="live('name',this.value)" onchange="render()"></label>`,pos=`<details class="cvdet"><summary>Position & size</summary>${cvRg('X','x',0,512,1)}${cvRg('Y','y',0,CVH,1)}${l.t=='x'?cvRg('Size','size',6,300,1):cvRg('Scale','s',.1,l.t=='m'?6:12,.01)}${cvRg('Rotation','r',-180,180,1,null,'°')}${cvRg('Transparency','op',.05,1,.01,l.op==null?1:l.op)}${l.t!='m'?cvRg('Stretch width','sx',.2,4,.01,l.sx||1)+cvRg('Stretch height','sy',.2,4,.01,l.sy||1):''}</details>`;
 if(l.t=='m'){const m=get(l.mid);return`<div class="cvsec"><h4>${esc(m?m.name:'Member')}</h4>${nm}<div class="cvchips"><button class="b s p" onclick="cvCropStart()">${cvI('crop')} ${l.crop?'Edit crop':'Crop'}</button>${l.crop?`<button class="b s" onclick="cvCropReset()">Remove crop</button>`:''}<button class="b s" onclick="chg('fl',${l.fl?0:1})">⇋ Flip</button></div>${pos}
  <details class="cvdet"><summary>Pose & expression</summary><div class="th cvposes">${POSES.map((p,i)=>`<button class="tb ${l.pose==i?'on':''}" onclick="setPose(${i})"><svg viewBox="-12 0 124 200" width="46">${fig(m,{...l,pose:i})}</svg><small>${p[0]}</small></button>`).join('')}</div><label class="st">Expression <select onchange="chg('ex',this.value)"><option value="" ${l.ex==null||l.ex===''?'selected':''}>Her usual expression</option>${EXN.map((n,i)=>`<option value="${i}" ${String(l.ex)===String(i)?'selected':''}>${n}</option>`).join('')}</select></label><label class="st">Prop <select onchange="chg('prop',+this.value)">${['None','Microphone','Light stick'].map((n,i)=>`<option value="${i}" ${l.prop==i?'selected':''}>${n}</option>`).join('')}</select></label></details>${cvSingleCtx()?`<p class="st">👗 Costume: the confirmed costume of this single (set in Costume Production).</p>`:''}</div>`}
 if(l.t=='s'){const info=cvElInfo(l.k,l.ev);return`<div class="cvsec"><h4>${esc(l.name||info.n||'Element')}</h4>${nm}${info.rc!==0?`<div class="cvrow2">${cvCol(info.rc==2?'Main color':'Color','col',l.col)}${info.rc==2&&l.ev?cvCol('Second color','col2',l.col2||info.c2):''}</div>`:''}${cvRg('Transparency','op',.05,1,.01,l.op==null?1:l.op)}${cvRg('Scale','s',.1,12,.01)}${cvRg('Rotation','r',-180,180,1,null,'°')}<div class="cvchips"><button class="b s" onclick="cvChg('sx',-(${l.sx||1}))">⇋ Flip</button><button class="b s" onclick="cvDup()">Duplicate</button></div>${pos}</div>`}
 // text
 const gr=l.gr&&l.gr.on,grc=(l.gr&&l.gr.c)||['#ff7eb6','#a58df0'];
 return`<div class="cvsec"><h4>Text</h4><textarea id="cvtxt" rows="2" onfocus="snap()" oninput="live('txt',this.value);cvMeasure();cvOverlay()" onchange="render()">${esc(l.txt||'')}</textarea>${nm}</div>${cvFontPicker(l)}
 <div class="cvsec">${cvRg('Size','size',6,300,1)}<div class="cvchips"><button class="cvchip ${(l.fw||800)>=700?'on':''}" onclick="cvChg('fw',${(l.fw||800)>=700?400:800})"><b>B</b> Bold</button></div>${cvRg('Letter spacing','ls',-5,40,.5)}${cvRg('Line spacing','lh',.7,2.5,.05,l.lh||1.15)}${cvRg('Transparency','op',.05,1,.01,l.op==null?1:l.op)}${cvRg('Curve','cv',-100,100,1,l.cv||0)}</div>
 <div class="cvsec"><h4>Color</h4><div class="cvchips"><button class="cvchip ${gr?'':'on'}" onclick="cvChg('gr.on',0)">Solid</button><button class="cvchip ${gr?'on':''}" onclick="snap();const l=SEL();l.gr=l.gr||{c:['#ff7eb6','#a58df0'],a:90};l.gr.on=1;render()">Gradient</button></div>${gr?`<div class="cvrow2">${grc.map((c,i)=>`<span class="cvstop"><input type="color" value="${c}" onchange="cvGrStop(${i},this.value)">${grc.length>2?`<button class="cvx0" onclick="cvGrStop(${i},0,1)">×</button>`:''}</span>`).join('')}${grc.length<5?`<button class="cvchip" onclick="cvGrStop(-1)">＋ color</button>`:''}</div>${cvRg('Direction','gr.a',0,360,5,l.gr.a||0,'°')}`:cvCol('Text color','col',l.col)}</div>
 <details class="cvdet" ${l.ol?'open':''}><summary>Outline</summary>${cvTog('Outline on','ol',l.ol).replace(`cvChg('ol',this.checked?1:0)`,`cvChg('ol',this.checked?4:0)`)}${l.ol?cvCol('Outline color','olc',l.olc)+cvRg('Thickness','ol',1,14,.5):''}</details>
 <details class="cvdet" ${l.sh?'open':''}><summary>Shadow</summary>${cvTog('Shadow on','sh',l.sh)}${l.sh?cvCol('Shadow color','shc',l.shc||'#000000')+cvRg('Blur','shb',0,20,.5,l.shb!=null?l.shb:2)+cvRg('Distance','shd',0,30,.5,l.shd!=null?l.shd:3.6)+cvRg('Direction','sha',0,360,5,l.sha!=null?l.sha:56,'°')+cvRg('Opacity','sho',0,1,.05,l.sho!=null?l.sho:.4):''}</details>
 <details class="cvdet" ${l.gw&&l.gw.on?'open':''}><summary>Glow</summary>${cvTog('Glow on','gw.on',l.gw&&l.gw.on)}${l.gw&&l.gw.on?cvCol('Glow color','gw.c',l.gw.c||'#ff4fd8')+cvRg('Glow size','gw.r',1,20,.5,l.gw.r||5):''}</details>
 <details class="cvdet" ${l.bgx&&l.bgx.on?'open':''}><summary>Text background</summary>${cvTog('Background on','bgx.on',l.bgx&&l.bgx.on)}${l.bgx&&l.bgx.on?cvCol('Background color','bgx.c',l.bgx.c||'#ff5f8f')+cvRg('Background opacity','bgx.o',.1,1,.05,l.bgx.o!=null?l.bgx.o:1)+cvRg('Padding','bgx.p',.02,.4,.01,l.bgx.p||.1):''}</details>
 ${pos}<div class="cvsec"><button class="b s" onclick="cvPreAll()">Apply this style to all texts</button></div>`}
function cvPreAll(){const l=SEL();if(!l||l.t!='x')return;snap();const K=['font','fw','col','gr','ol','olc','sh','shc','sho','shb','shd','sha','gw','bgx','ls','lh','op'];ui.cd.layers.filter(x=>x.t=='x'&&x!==l).forEach(x=>K.forEach(k=>{if(l[k]===undefined)delete x[k];else x[k]=JSON.parse(JSON.stringify(l[k]))}));toast('Style applied to every text.');render()}
function cvActBar(){if(ui.cvCrop)return`<div class="cvact"><button class="cvab p" onclick="cvCropDone(1)">✓ Done</button><button class="cvab" onclick="cvCropDone(0)">✕ Cancel</button><button class="cvab" onclick="cvCropReset()">Remove crop</button></div>`;
 const ids=cvSelIds();if(!ids.length)return`<div class="cvact cvhint">${ui.sel=='bg'?'Background selected — drag on an empty spot or pinch to move / zoom it.':'Tap an object to select it · drag the handles to resize or rotate.'}</div>`;
 const l=cvL(ids[0]),lk=ids.every(id=>cvL(id).lock),many=(CVX.hits||[]).length>1;
 return`<div class="cvact"><button class="cvab" onclick="cvDup()">${cvI('dup')}<small>Copy</small></button><button class="cvab" onclick="cvDel()">${cvI('trash')}<small>Delete</small></button><button class="cvab ${lk?'act':''}" onclick="cvLock()">${cvI('lock')}<small>${lk?'Unlock':'Lock'}</small></button><button class="cvab" onclick="cvOrder('fwd')">${cvI('up')}<small>Forward</small></button><button class="cvab" onclick="cvOrder('bwd')">${cvI('dn')}<small>Backward</small></button>${many?`<button class="cvab" onclick="cvBelow()">${cvI('below')}<small>Select below</small></button>`:''}${ids.length==1&&l.t=='m'?`<button class="cvab" onclick="cvCropStart()">${cvI('crop')}<small>Crop</small></button>`:''}<button class="cvab" onclick="ui.sel='bg';ui.cvMulti=null;render()">✕<small>Deselect</small></button></div>`}
function cvProdTools(d){const stat=e=>S.cov[e]?(S.cov[e].status=='confirmed'?' ✔':' ✎'):'',rc=typeof RCCV!='undefined'&&RCCV;
 return`<details class="c cvprod" ${ui.cvProdOpen?'open':''} ontoggle="ui.cvProdOpen=this.open"><summary><b>Cover tools</b> · random, copy, export, layouts</summary>
 ${typeof cvRandMem=='function'?`<div class="cvchips"><button class="cvchip" onclick="cvRandMem()">🎲 Random members</button><button class="cvchip" onclick="cvRandPos()">🎲 Random positions</button><button class="cvchip" onclick="cvRandPose()">🎲 Random poses</button><button class="cvchip" onclick="cvRandText()">🎲 Move texts</button></div>`:''}
 <div class="cvchips"><button class="cvchip" onclick="loadDraft()">Load saved draft</button><button class="cvchip" onclick="resetCov()">Reset layout</button><button class="cvchip" onclick="doExport(512)">Export 512px</button><button class="cvchip" onclick="doExport(1024)">Export 1024px</button></div>
 ${EDS.length>1?`<div class="cvchips"><select onchange="dupTo(this.value);this.value=''"><option value="">Duplicate to…</option>${EDS.filter(e=>e!=ui.ed).map(e=>`<option>${e}</option>`).join('')}</select></div><div class="cvchips"><span class="st">Copy CD cover:</span><select id="cs1">${EDS.map(e=>`<option ${e==ui.ed?'selected':''}>${e}</option>`).join('')}</select>→<select id="cs2">${EDS.map(e=>`<option ${e!=ui.ed&&EDS.filter(x=>x!=ui.ed)[0]==e?'selected':''}>${e}</option>`).join('')}</select><button class="cvchip" onclick="copyCover($('#cs1').value,$('#cs2').value)">Copy CD Cover</button></div>`:''}
 </details>`}
// ---------------------------------------------------------------- the page
V.cover=function(){if(!S.pj&&ui.cvCtx!='album')newPj();syncEds();{const LK=coverLock();if(LK)return`<h2 class="ht">Single Cover Studio</h2><div class="c"><h3>Locked</h3><p>${esc(LK)}</p><button class="b" onclick="view='music';render()">Back to the single plan</button></div>`}
 if(!ui.cd)initCov(EDS[0]);cvFontsLoad();const d=ui.cd;if(!ui.sel)ui.sel='bg';cvForceCz(d);if(!d.bg)d.bg={type:'grad',c1:'#ff8fbf',c2:'#b9a6f0',pc:'#fff',int:.5,seed:7};
 if(ui.cvMulti)ui.cvMulti=ui.cvMulti.filter(id=>cvL(id));if(ui.sel&&ui.sel!='bg'&&!cvL(ui.sel))ui.sel='bg';if(ui.cvCrop&&!cvL(ui.cvCrop.id))ui.cvCrop=null;
 const rc=typeof RCCV!='undefined'&&RCCV,stat=e=>S.cov[e]?(S.cov[e].status=='confirmed'?' ✔':' ✎'):'',tab=ui.cvTab||'mem';let head=`<h2 class="ht">${rc?'🎙 Studio Recording Cover':ui.cvCtx=='album'?'Album Cover Studio':'CD Cover Studio'}</h2>`;
 if(rc){try{const p=srGet(RCCV.pid);head+=`<div class="c rccvh"><b>${esc(p?p.name:'')}</b><span class="st">Members wear the costumes of the recorded Stage songs.</span><div class="row"><button class="b s" onclick="rcCvExit(1);render()">◀ Back to Studio Recording</button><button class="b s" onclick="rcCvStageCz()">👗 Stage costumes for everyone</button><button class="b s" onclick="ui.cd=rcCvDesign(srGet(RCCV.pid),rcS().fps[srGet(RCCV.pid).sid],true);render()">🎲 Random cover</button></div></div>`}catch(e){}}
 else head+=`<div class="cvtypes">${EDS.map(e=>`<button class="b s ${e==ui.ed?'on':''}" onclick="switchEd('${esc(e)}')">${esc(e)}${stat(e)}</button>`).join('')}</div>`;
 const tabs=[['bg','Background'],['el','Elements'],['tx','Text'],['mem','Members'],['ly','Layers']],drawer={bg:()=>cvBgPanel(d),el:()=>cvElPanel(),tx:()=>cvTxPanel(),mem:()=>cvMemPanel(d),ly:()=>cvLyPanel(d)}[tab]||(()=>'');const z=ui.cvZ||1;
 return head+`<div class="cvxw"><div class="cvx">
 <div class="cvtop"><button class="cvtb" title="Undo (Ctrl+Z)" onclick="undo()" ${ui.hu&&ui.hu.length?'':'disabled'}>${cvI('undo')}</button><button class="cvtb" title="Redo (Ctrl+Y)" onclick="redo()" ${ui.hr&&ui.hr.length?'':'disabled'}>${cvI('redo')}</button><span class="cvsp"></span><button class="cvtb" title="Zoom out" onclick="cvZoom(1/1.25)">${cvI('zout')}</button><span id="cvzl" class="cvzl">${Math.round(z*100)}%</span><button class="cvtb" title="Zoom in" onclick="cvZoom(1.25)">${cvI('zin')}</button><button class="cvtb" title="Fit to screen" onclick="cvZoom(0)">${cvI('fit')}</button><span class="cvsp"></span><button class="cvtb t" onclick="showPrev()">Preview</button><button class="cvtb t" onclick="saveDraft()">Save</button><button class="cvtb t p" onclick="confirmCov()">Confirm</button></div>
 <nav class="cvrail">${tabs.map(([k,n])=>`<button class="${tab==k?'on':''}" onclick="ui.cvTab='${k}';ui.cvDrawer=1;render()">${cvI(k)}<small>${n}</small></button>`).join('')}<button class="${ui.cvCrop?'on':''}" onclick="ui.cvCrop?cvCropDone(1):cvCropStart()">${cvI('crop')}<small>Crop</small></button></nav>
 <aside class="cvdrawer cvkeep" data-k="dr">${drawer()}</aside>
 <div class="cvmain"><div id="cvstage" class="cvstage cvkeep" data-k="st" onpointerdown="cvxDown(event)" onpointermove="cvHover(event)" onpointerleave="cvHover(null)" onwheel="cvWheel(event)" oncontextmenu="return false"><div id="cvwrap" class="cvwrap" style="width:${z*100}%"><div id="cvw" class="cvw">${coverSvg(d,{ed:1}).replace(' onpointerdown="cvDown(event)"','')}<svg id="cvov" class="cvov" viewBox="0 0 512 ${CVH}" xmlns="http://www.w3.org/2000/svg"></svg></div></div></div>${cvActBar()}</div>
 <aside class="cvprops cvkeep" data-k="pr">${cvProps(d)}</aside></div></div>${cvProdTools(d)}`};
function cvHover(e){if(!e||e.pointerType!='mouse'||CVX.drag||!ui.cd){if(ui.cvHover){ui.cvHover=null;cvOverlay()}return}const p=cvPt(e);if(!p)return;const h=cvHits(e,p)[0]||null;if(h!==ui.cvHover){ui.cvHover=h;cvOverlay()}const st=document.getElementById('cvstage');if(st)st.style.cursor=cvHandleAt(p)?'grab':h?'move':''}
function cvWheel(e){if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();ui.cvZ=cvClamp((ui.cvZ||1)*(e.deltaY<0?1.1:1/1.1),1,4);cvApplyZoom({x:e.clientX,y:e.clientY})}
// after every render of the studio: measure, overlay, keep scroll positions of the panels
{const f=render;render=function(){const keep={};if(view=='cover')document.querySelectorAll('.cvkeep').forEach(el=>keep[el.dataset.k]=[el.scrollTop,el.scrollLeft]);const r=f.apply(this,arguments);
 if(view=='cover'&&document.getElementById('cvw')){document.querySelectorAll('.cvkeep').forEach(el=>{const k=keep[el.dataset.k];if(k){el.scrollTop=k[0];el.scrollLeft=k[1]}});try{cvMeasure();cvOverlay()}catch(e){console.error(e)}}return r}}
// keyboard shortcuts in the studio
document.addEventListener('keydown',e=>{try{if(view!='cover'||!ui.cd||!document.getElementById('cvw'))return;const t=e.target,tag=(t&&t.tagName)||'';if(/INPUT|TEXTAREA|SELECT/.test(tag)||(t&&t.isContentEditable))return;const k=e.key,c=e.ctrlKey||e.metaKey;
 if(c&&k.toLowerCase()=='z'){e.preventDefault();e.shiftKey?redo():undo();return}if(c&&k.toLowerCase()=='y'){e.preventDefault();redo();return}if(c&&k.toLowerCase()=='d'){e.preventDefault();cvDup();return}if(c&&k.toLowerCase()=='a'){e.preventDefault();cvSelAll();return}
 if(ui.cvCrop){if(k=='Enter')cvCropDone(1);if(k=='Escape')cvCropDone(0);return}
 if((k=='Delete'||k=='Backspace')&&cvSelIds().length){e.preventDefault();cvDel();return}if(k=='Escape'){ui.sel='bg';ui.cvMulti=null;render();return}
 const n=e.shiftKey?10:1,m={ArrowLeft:[-n,0],ArrowRight:[n,0],ArrowUp:[0,-n],ArrowDown:[0,n]}[k];if(m&&cvSelIds().length){e.preventDefault();cvNudge(...m)}}catch(x){}});
// keep selection state sane after history jumps / layout changes
{const fu=undo,fr=redo;undo=function(){ui.cvCrop=null;const r=fu.apply(this,arguments);return r};redo=function(){ui.cvCrop=null;return fr.apply(this,arguments)}}
{const f=initCov;initCov=function(){ui.cvMulti=null;ui.cvCrop=null;ui.cvZ=1;return f.apply(this,arguments)}}
// addM / addT / addS select the new layer the old way; clear multi-selection with it
['addM','addT','addS','layout','incAll','autoArr'].forEach(n=>{try{const f=window[n];if(typeof f=='function')window[n]=function(){ui.cvMulti=null;return f.apply(this,arguments)}}catch(e){}});
// ---------------------------------------------------------------- export with embedded fonts (falls back to the old exporter)
async function cvFontFaceCss(fams,chars){const links=[...document.querySelectorAll('link[href*="fonts.googleapis.com/css"]')].map(l=>l.href),need=new Set(fams),cps=[...new Set([...chars].map(c=>c.codePointAt(0)))];let out='';
 for(const h of links){let css=CVX.css[h];if(css==null){try{css=await(await fetch(h)).text()}catch(e){css=''}CVX.css[h]=css}
  for(const blk of css.match(/@font-face\s*{[^}]*}/g)||[]){const fm=(blk.match(/font-family:\s*['"]?([^;'"]+)/)||[])[1];if(!fm||!need.has(fm))continue;const ur=(blk.match(/unicode-range:\s*([^;]+)/)||[])[1];
   if(ur){const ok=ur.split(',').some(r=>{const m=r.trim().replace(/U\+/i,'').split('-'),a=parseInt(m[0].replace(/\?/g,'0'),16),b=m[1]?parseInt(m[1],16):parseInt(m[0].replace(/\?/g,'F'),16);return cps.some(c=>c>=a&&c<=b)});if(!ok)continue}
   const url=(blk.match(/url\(([^)]+)\)/)||[])[1];if(!url)continue;const u=url.replace(/['"]/g,'');let data=CVX.fd[u];
   if(!data){try{const buf=new Uint8Array(await(await fetch(u)).arrayBuffer());let bin='';for(let i=0;i<buf.length;i+=32768)bin+=String.fromCharCode.apply(null,buf.subarray(i,i+32768));data=CVX.fd[u]='data:font/woff2;base64,'+btoa(bin)}catch(e){continue}}
   out+=blk.replace(/url\([^)]+\)/,`url(${data})`)}}return out}
{const old=exportCov;exportCov=async function(d,sz){try{const T=(d.layers||[]).filter(l=>l.t=='x'&&!l.hide),fams=[...new Set(T.map(l=>l.font||'M PLUS Rounded 1c'))],chars=T.map(l=>String(l.txt||'')).join('')+' ';
  const css=T.length?await cvFontFaceCss(fams,chars):'';const h=Math.round(sz*cvHt(d)/512);let svg=coverSvg(d,{size:sz});svg=svg.replace(/<svg([^>]*)>/,(m,a)=>`<svg${a.replace(/style="[^"]*"/,'')}><defs><style>${css}</style></defs>`);
  const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await img.decode();const cv=document.createElement('canvas');cv.width=sz;cv.height=h;cv.getContext('2d').drawImage(img,0,0,sz,h);return cv.toDataURL('image/png')}catch(e){console.warn('cover export fallback',e);return old.apply(this,arguments)}}}
