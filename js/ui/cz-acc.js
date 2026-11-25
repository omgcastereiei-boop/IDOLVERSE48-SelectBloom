// =====================================================================================
//  Costume Studio — move & resize the original accessories
//  The expansion components (cz-core.js) already carry their own size / position / rotation. The original accessory
//  set (hair bow, headband, clips, crown, hat, hair ribbon, earrings, necklace, choker, graduation flowers / cap) now
//  stores the same fields on its own piece:  piece.s (size), piece.dx / piece.dy (offset).  Every accessory keeps its
//  own values, so moving one never moves another. Pieces without these fields draw exactly as before.
//  Gloves, arm and leg accessories and shoe decorations are drawn as part of the arm / leg / shoe and follow the pose,
//  so they keep their style options instead.
// =====================================================================================
const CZA_DEF={hribbon:{ax:82,ay:56},headband:{ax:50,ay:22},crown:{ax:50,ay:8},hat:{ax:64,ay:11},clip:{ax:26,ay:29},hbow:{ax:76,ay:22},earrings:{ax:50,ay:72},
 fhair:{ax:28,ay:24},mortar:{ax:50,ay:6},necklace:{ax:50,ay:48,neck:1},choker:{ax:50,ay:42,neck:1}};
Object.values(CZA_DEF).forEach(D=>{D.sc=[.5,1.8];D.mv=D.neck?8:14;D.rot=0});
const czaHas=P=>!!P&&((P.s!=null&&+P.s!=1)||+P.dx||+P.dy);
const czaV=(P,D)=>({s:czxC(P.s??1,D.sc[0],D.sc[1]),dx:czxC(P.dx,-D.mv,D.mv),dy:czxC(P.dy,-D.mv,D.mv)});
const czaTf=(P,D,svg,ax=D.ax,ay=D.ay)=>{const v=czaV(P,D);return`<g transform="translate(${N2(v.dx+ax)} ${N2(v.dy+ay)}) scale(${N2(v.s)}) translate(${-ax} ${-ay})">${svg}</g>`};
// head accessories: adjusted pieces are drawn one by one (each with its own transform), the rest exactly as before
{const f=czHeadAcc;czHeadAcc=function(cd){const A=cd&&cd.a;if(!A)return f.apply(this,arguments);
 try{const adj=Object.keys(CZA_DEF).filter(k=>!CZA_DEF[k].neck&&A[k]&&czaHas(A[k]));if(!adj.length)return f.apply(this,arguments);
  if(adj.includes('hribbon')&&A.hbow&&!adj.includes('hbow'))adj.push('hbow'); // the bow sits beside the ribbon
  const rest={...A};adj.forEach(k=>delete rest[k]);let s=f.call(this,{...cd,a:rest});
  adj.forEach(k=>{const P=A[k],D=CZA_DEF[k];let one;
   if(k=='hbow'&&A.hribbon){const two=f.call(this,{a:{hribbon:A.hribbon,hbow:P}}),rib=f.call(this,{a:{hribbon:A.hribbon}});one=two.slice(rib.length);s+=czaTf(P,D,one,24,22);return}
   if(k=='earrings'){const v=czaV(P,D);s+=[20.6,79.4].map(x=>`<g transform="translate(${N2(v.dx+x)} ${N2(v.dy+72)}) scale(${N2(v.s)}) translate(${-x} -72)"><path d="M${x} 68v3" stroke="${P.c2}" stroke-width=".5"/><circle cx="${x}" cy="73" r="1.5" fill="${P.c1}" stroke="${czLine(P.c1)}" stroke-width=".4"/></g>`).join('');return}
   one=f.call(this,{a:{[k]:P}});s+=czaTf(P,D,one)});return s}catch(e){console.error(e);return f.apply(this,arguments)}}}
// neck accessories (drawn with the collar layer)
{const f=modOutfit;modOutfit=function(cd,id,D0,sk){const A=cd&&cd.a;if(!A||!['choker','necklace'].some(k=>A[k]&&czaHas(A[k])))return f.apply(this,arguments);
 const adj=['choker','necklace'].filter(k=>A[k]&&czaHas(A[k])),rest={...A};adj.forEach(k=>delete rest[k]);const O=f.call(this,{...cd,a:rest},id,D0,sk);
 try{let add='';adj.forEach(k=>{const P=A[k],D=CZA_DEF[k];const svg=k=='choker'?`<path d="M47.2 40.6Q50 42 52.8 40.6V42Q50 43.4 47.2 42Z" fill="${P.c1}"/><circle cx="50" cy="43.6" r=".8" fill="${P.c3}"/>`
   :[...Array(9)].map((_,i)=>`<circle cx="${N2(45.6+i*1.1)}" cy="${N2(46+Math.sin(i/8*Math.PI)*3)}" r=".45" fill="${P.c1}" stroke="${czLine(P.c1)}" stroke-width=".12"/>`).join('')+`<path d="M50 49.4l1 1.4-1 1.4-1-1.4z" fill="${P.c3}"/>`;add+=czaTf(P,D,svg)});O.collar=(O.collar||'')+add}catch(e){console.error(e)}return O}}
// the placement controls in the editor (same controls as the expansion components)
const czaKey=()=>{const E=ui.czE;if(!E||!E.sel)return null;const[c,k]=E.sel.split('.');return c=='a'&&CZA_DEF[k]&&!CZX[k]?k:null};
{const f=czGridHtml;czGridHtml=function(E){let h=f.apply(this,arguments);try{const k=czaKey(),P=k&&czGetSlot(E.p,E.sel);if(P&&P.t){const i=h.indexOf('<div class="czsub">Pattern</div>');if(i>=0)h=h.slice(0,i)+czxPlaceHtml(CZA_DEF[k],P)+h.slice(i)}}catch(e){console.error(e)}return h}}
// ---- drag the selected accessory on the preview (expansion components and original accessories) ---------------------------
function czaDragDef(){const E=ui.czE;if(!E||!E.sel)return null;const P=czGetSlot(E.p,E.sel);if(!P||!P.t||P.t=='none')return null;const k=czaKey();if(k)return{P,D:CZA_DEF[k]};const D=CZX[P.t];return D&&D.mv?{P,D}:null}
function czaDragInit(){const st=document.getElementById('czstage');if(!st||st.dataset.drag)return;st.dataset.drag=1;let g=null;
 st.addEventListener('pointerdown',e=>{const X=czaDragDef();if(!X||!czCanEdit())return;const svg=st.querySelector('svg');if(!svg)return;const r=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal;
  g={x:e.clientX,y:e.clientY,dx:+X.P.dx||0,dy:+X.P.dy||0,k:vb.width/r.width,id:e.pointerId,mv:0};try{st.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()});
 st.addEventListener('pointermove',e=>{if(!g||e.pointerId!==g.id)return;const X=czaDragDef();if(!X){g=null;return}const D=X.D,ddx=(e.clientX-g.x)*g.k,ddy=(e.clientY-g.y)*g.k;if(Math.abs(ddx)+Math.abs(ddy)>.3)g.mv=1;
  X.P.dx=N2(czxC(g.dx+ddx,-D.mv,D.mv));X.P.dy=N2(czxC(g.dy+ddy,-D.mv,D.mv));czLive();e.preventDefault()});
 const end=e=>{if(!g)return;const moved=g.mv;g=null;if(moved){czMark();render()}};st.addEventListener('pointerup',end);st.addEventListener('pointercancel',end)}
{const f=render;render=function(){const r=f.apply(this,arguments);try{if(document.getElementById('czstage')){czaDragInit();const X=czaDragDef();document.getElementById('czstage').classList.toggle('czdrag',!!X)}}catch(e){console.error(e)}return r}}
// ---- Random colours: many colour styles (one colour in several tones, two colours, multicolour, pastel, black & white + accent…) ----
czRandColors=function(){const E=czEdP();if(!E)return;const R=a=>a[Math.floor(Math.random()*a.length)],rn=(a,b)=>a+Math.random()*(b-a),H=(h,s,l)=>czHsl(((h%360)+360)%360,s,l),th=typeof UIP!='undefined'&&UIP.lang=='th';
 const st=R(['mono','mono','analog','comp','triad','duo','duo','multi','multi','pastel','pastel','neutral']),L=czPieces(E.p),shuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 const h=rn(0,360),s=rn(55,88),gold=R(['#f3c35c','#ffffff','#e9b949','#cfd4dc']);
 if(st=='mono'||st=='analog'||st=='comp'||st=='triad'){const off=st=='comp'?180:st=='triad'?120:st=='analog'?35:0;czPaint(E.p,{base:H(h,s,rn(58,80)),light:H(h,s*.6,90),dark:H(h,s*.7,22),acc:H(h+off,s,58),acc2:H(h-(off||-20),s*.9,72),gold})}
 else if(st=='duo'){const h2=h+R([60,120,150,180,210]),A={base:H(h,s,rn(55,75)),light:H(h,s*.5,92),acc:H(h,s,40)},B={base:H(h2,s,rn(50,72)),light:H(h2,s*.5,92),acc:H(h2,s,38)};
  L.forEach(([k,P])=>{const X=['bottom','shoes','legs','over'].includes(k)?B:['top','outer','collar','sleeve'].includes(k)?A:R([A,B]),Y=X===A?B:A;P.c1=X.base;P.c2=R([Y.base,X.light,'#ffffff']);P.c3=R([Y.acc,X.acc,gold]);P.pc=R([Y.base,X.light,'#ffffff']);P.dc=R([gold,Y.base])})}
 else if(st=='multi'||st=='pastel'){const n=Math.floor(rn(4,7)),pal=[...Array(n)].map((_,i)=>st=='pastel'?H(h+i*360/n+rn(-15,15),rn(55,80),rn(78,88)):H(h+i*360/n+rn(-15,15),rn(65,92),rn(50,68))),bag=shuf(pal.slice());let i=0;
  L.forEach(([k,P])=>{const c=bag[i++%bag.length],o=pal.filter(x=>x!=c);P.c1=c;P.c2=R([...o,'#ffffff']);P.c3=R(o);P.pc=R([...o,'#ffffff']);P.dc=R([...o,gold])})}
 else{const dk=Math.random()<.5,acc=H(h,s,rn(48,62)),base=dk?R(['#1d1b26','#2a2838','#111111']):R(['#ffffff','#f6f3ee','#eceef2']),mid=dk?'#ffffff':'#24222e';
  L.forEach(([k,P])=>{const main=['top','bottom','outer'].includes(k);P.c1=main?base:R([acc,mid,base]);P.c2=R([acc,mid]);P.c3=R([acc,gold]);P.pc=R([acc,mid]);P.dc=R([acc,gold])})}
 E.dirty=1;const N={mono:['one colour, several tones','สีเดียวหลายโทน'],analog:['neighbouring colours','สีใกล้เคียง'],comp:['contrasting colours','สีตัดกัน'],triad:['three colours','สามสี'],duo:['two colours','ทูโทน'],multi:['multicolour','หลากสี'],pastel:['pastel multicolour','พาสเทลหลากสี'],neutral:['black & white + accent','ขาวดำ + สีเน้น']}[st];
 toast(th?`สีใหม่ (${N[1]}) — กดบันทึกเพื่อเก็บไว้`:`New colours (${N[0]}). Save to keep them.`);render()};
// ---- colour picker: "Colours in this costume" (every colour the costume being edited uses) ----
function czUsedColors(p){const S0=new Set(),walk=o=>{if(!o||typeof o!='object')return;for(const k in o){const v=o[k];if(typeof v=='string'){const h=typeof cpHex=='function'?cpHex(v):(/^#[0-9a-f]{6}$/i.test(v)?v.toLowerCase():null);if(h&&/^#[0-9a-f]{6}$/i.test(v.trim()))S0.add(h)}else if(v&&typeof v=='object')walk(v)}};walk(p);return[...S0].slice(0,36)}
if(typeof cpDraw=='function'){const f=cpDraw;cpDraw=function(){const r=f.apply(this,arguments);try{const E=ui.czE,o=document.getElementById('cpov');if(E&&E.p&&o&&(document.getElementById('czstage')||document.querySelector('.czz'))){const L=czUsedColors(E.p);if(L.length){const th=typeof UIP!='undefined'&&UIP.lang=='th',lab=o.querySelector('.cplab');
 const d=document.createElement('div');d.innerHTML=`<div class="cplab">${th?'สีในชุดนี้':'Colours in this costume'}</div><div class="cpgrid">${L.map(c=>`<button class="cpsw" data-c="${c}" style="background:${c}" title="${c}" onclick="cpSet('${c}')"></button>`).join('')}</div>`;
 if(lab)lab.before(...d.childNodes);if(typeof cpPaint=='function')cpPaint()}}}catch(e){console.error(e)}return r}}
