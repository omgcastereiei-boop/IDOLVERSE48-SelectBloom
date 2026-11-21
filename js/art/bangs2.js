// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Bangs redesign (front hair built from real hair locks)
//                               + Ahoge grown out of the bangs
// -------------------------------------------------------------------------------------
//  Every bangs style is a set of individual hair locks (root → tip) with their own width,
//  curve and layer, drawn over a crown. Back locks are a shade darker, front locks carry a
//  highlight and an inner shadow line, tips are tapered. All front-hair pieces share ONE
//  gradient in head space (the selected hair colour, custom colours included), so locks,
//  crown and ahoge read as one hairstyle. The crown cap is drawn last without an edge line,
//  so the locks visibly grow out from under it (no sticker edge on the forehead).
//
//  Ahoge: a tapered lock whose root sits on the crown outline at the attachment point of the
//  chosen bangs style (e.g. at the parting). Its base covers the crown line, its outline is
//  drawn only outside the crown, and a strand line runs from its root into the bangs — it
//  grows out of the hair instead of floating. It mirrors with the bangs.
//
//  Character accessories (m.ap.ac) were removed from the Character Creator and are no longer drawn;
//  head accessories of a stage / single costume still are.
//  Back hair is untouched and still chosen separately (m.ap.bk); bangs stay m.ap.ft and the
//  ahoge m.ap.ah. Old saves keep their numbers: every old bangs index now shows the new design
//  of the same kind (index 7 Blunt → new straight fringe, 5 Curtain → new curtain bangs, …).
// =====================================================================================
const BG_CAP=[[83,46],[78,33],[70,25.4],[60,21.6],[50,20.6],[40,21.6],[30,25.4],[22,33],[17,46]];
// y of the cap's lower edge at x (the hairline the locks grow from)
function bgCapY(x){const P=BG_CAP;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];if((x<=a[0]&&x>=b[0])){const t=(a[0]-x)/(a[0]-b[0]);return a[1]+(b[1]-a[1])*t}}return 46}
// crown top y at x (outer outline of the head)
const bgTopY=x=>6.6+.0105*(x-50)*(x-50);
const BG_CAPD='M12.4 46C11.4 21 27 6.6 50 6.6C73 6.6 88.6 21 87.6 46L'+BG_CAP[0].join(' ')+crSeg(BG_CAP)+'L12.4 46Z';
const BG_CROWN_OUT='M12.6 52C11.4 21 27 6.6 50 6.6C73 6.6 88.6 21 87.4 52';
const BG_BASE='M50 6.6C73 6.6 88.6 21 87.6 46C87.4 54 86.4 60 85 66L81 60L80 46'+crSeg([[80,46],...BG_CAP.slice(1,-1),[20,46]])+'L19 60L15 66C13.6 60 12.6 54 12.4 46C11.4 21 27 6.6 50 6.6Z';
// one lock: centre line points root → tip, root width, layer (0 back, 1 front)
const bgL=(p,w,f=1,o={})=>({p,w,f,...o});
// fringe generator: n locks rooted along the hairline between x0 and x1
function bgFringe(n,o={}){const x0=o.x0??24,x1=o.x1??76,out=[];
 for(let i=0;i<n;i++){if(o.skip&&o.skip(i,n))continue;const t=(i+.5)/n,rx=x0+(x1-x0)*t,ry=bgCapY(rx)-3.2,ty=o.tip?o.tip(t,i):50,sw=o.sweep?o.sweep(t,i):0,tx=rx+sw+(rx-50)*(o.spread??.12),bend=o.bend?o.bend(t,i):(rx-50)*.06;
  const dx=tx-rx,dy=ty-ry,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,P=k=>[rx+dx*k+nx*bend*Math.sin(Math.PI*k),ry+dy*k+ny*bend*Math.sin(Math.PI*k)];
  const p=[[rx,ry],P(.36),P(.72),[tx,ty]];if(o.flip){const out_=tx<50?-1:1,f=o.flip(t,i)||0;if(f)p.push([tx+out_*f,ty-f*.9])}
  out.push(bgL(p,((x1-x0)/n)*1.9*(o.w?o.w(t,i):1),o.layer?o.layer(t,i):i%2,{cap:o.cap,split:o.split}))}return out}
const bgJ=(i,s)=>{const x=Math.sin((i+1)*12.9898*(s||1)+78.233)*43758.5453;return x-Math.floor(x)};
// side locks framing the face (hang in front of the temples)
const bgSide=(len,o={})=>[bgL([[25,30],[21.6,42],[19.6,52],[18.8,len]],o.w||6.4,1,{cap:o.cap}),bgL([[75,30],[78.4,42],[80.4,52],[81.2,len]],o.w||6.4,1,{cap:o.cap})];
const bgHime=len=>[bgL([[24,30],[22,46],[21.4,58],[21.4,len]],8.6,1,{cap:.15}),bgL([[76,30],[78,46],[78.6,58],[78.6,len]],8.6,1,{cap:.15})];
const bgCurl=len=>[bgL([[25,30],[21,46],[19.4,60],[20.6,len],[24.4,len+1.6],[25,len-2.4]],6.6,1),bgL([[75,30],[79,46],[80.6,60],[79.4,len],[75.6,len+1.6],[75,len-2.4]],6.6,1)];
// ---- the styles (index = m.ap.ft) ----------------------------------------------------------------
const BG=[];const BGN=[];const bgAdd=(name,L,o={})=>{BGN.push(name);BG.push({L,ax:o.ax??50,part:o.part?1:0,flip:o.flip?1:0})};
bgAdd('No bangs',[bgL([[49,21],[40,24],[30,32],[24,44]],9,0),bgL([[51,21],[60,24],[70,32],[76,44]],9,0),bgL([[46,21],[34,27],[26,38],[21.6,52]],7),bgL([[54,21],[66,27],[74,38],[78.4,52]],7)],{part:1,ax:50});
bgAdd('Center-parted bangs',[...bgFringe(4,{x0:22,x1:49,tip:t=>44+t*6,sweep:t=>-3-3*(1-t),bend:()=>-1.6}),...bgFringe(4,{x0:51,x1:78,tip:t=>50-t*6,sweep:t=>3+3*t,bend:()=>1.6})],{part:1});
bgAdd('Side-swept bangs (left)',bgFringe(8,{x0:24,x1:72,tip:t=>56-t*12,sweep:t=>-7+t*2,bend:(t)=>-2.2,spread:0}),{ax:60});
null;
bgAdd('Side-swept bangs',bgFringe(9,{x0:22,x1:76,tip:t=>54-t*10,sweep:()=>-6,bend:()=>-2.6,spread:0,layer:(t,i)=>i%3?1:0}),{ax:58});
bgAdd('Curtain bangs',[...bgFringe(4,{x0:22,x1:46,tip:t=>56-t*10,sweep:t=>-2-6*t,bend:()=>-2.4}),...bgFringe(4,{x0:54,x1:78,tip:t=>46+t*10,sweep:t=>2+6*(1-t),bend:()=>2.4})],{part:1});
bgAdd('Wispy bangs',bgFringe(11,{tip:(t,i)=>48+bgJ(i,3)*4,w:()=>.62,bend:(t,i)=>(i%2?1:-1)*.8,skip:(i)=>i==5}),{});
bgAdd('Straight bangs (blunt)',bgFringe(9,{tip:(t,i)=>50.4+(i%2)*.6,w:()=>1.05,bend:()=>0,spread:.04,cap:.25}),{});
bgAdd('Asymmetrical bangs',bgFringe(8,{tip:t=>57-t*17,sweep:t=>-2,bend:(t,i)=>-1.2-(i%2)}),{ax:56});
bgAdd('Short bangs',bgFringe(9,{tip:(t,i)=>37+(i%2)*1.4,bend:()=>.3,w:()=>1.05}),{});
bgAdd('Face-framing bangs',[...bgFringe(3,{x0:30,x1:46,tip:t=>46-t*4,sweep:()=>-3,bend:()=>-1.4}),...bgFringe(3,{x0:54,x1:70,tip:t=>42+t*4,sweep:()=>3,bend:()=>1.4}),...bgSide(74,{w:7.4})],{part:1});
bgAdd('Straight bangs',bgFringe(11,{tip:(t,i)=>49+(i%3==1?1.8:0)-(i%4==0?1.2:0),bend:(t,i)=>(i%2?.6:-.6)}),{});
bgAdd('See-through bangs',bgFringe(9,{tip:(t,i)=>47+bgJ(i,5)*3,w:()=>.5,bend:(t,i)=>(i%2?1:-1)*.5}),{});
bgAdd('Long side-swept bangs',bgFringe(8,{x0:26,x1:78,tip:t=>60-t*16,sweep:t=>-10+t*3,bend:()=>-3,spread:0,layer:(t,i)=>i%2}),{ax:62});
bgAdd('Split bangs',[...bgFringe(4,{x0:24,x1:45,tip:t=>48+t*3,sweep:()=>-1.6,bend:()=>-.8}),...bgFringe(4,{x0:55,x1:76,tip:t=>51-t*3,sweep:()=>1.6,bend:()=>.8}),bgL([[50,21],[49.6,32],[50,42],[50.4,52]],5.4,1)],{});
bgAdd('Rounded bangs',bgFringe(9,{tip:t=>42+9*Math.sin(Math.PI*t),bend:(t)=>(t-.5)*-3,spread:-.06}),{});
bgAdd('Long bangs',bgFringe(8,{tip:(t,i)=>57+2*Math.sin(Math.PI*t)-(i%2)*1.6,bend:(t,i)=>(i%2?.8:-.8)}),{});
bgAdd('Layered bangs',[...bgFringe(7,{tip:(t,i)=>53+(i%2)*1.6,layer:()=>0,w:()=>1.1}),...bgFringe(8,{x0:28,x1:72,tip:(t,i)=>43+(i%2)*2,layer:()=>1,w:()=>.85,bend:(t,i)=>(i%2?1:-1)})],{});
bgAdd('Fluffy bangs',bgFringe(6,{tip:(t,i)=>47+(i%2)*2,w:()=>1.08,bend:(t,i)=>(t-.5)*7,cap:1.4,spread:.2}),{});
bgAdd('Choppy bangs',bgFringe(10,{tip:(t,i)=>42+bgJ(i,7)*12,bend:(t,i)=>(bgJ(i,9)-.5)*3,w:(t,i)=>.8+bgJ(i,11)*.5}),{});
bgAdd('Soft curved bangs',bgFringe(8,{tip:t=>48+2*Math.sin(Math.PI*t),bend:t=>(t-.5)*-5,spread:-.1}),{});
bgAdd('Anime decorative bangs',[...bgFringe(3,{x0:24,x1:42,tip:t=>48+t*6,sweep:()=>-2,bend:()=>-1.8}),...bgFringe(3,{x0:58,x1:76,tip:t=>54-t*6,sweep:()=>2,bend:()=>1.8}),bgL([[47,21],[46.4,34],[48,46],[50,60]],6.4,1),bgL([[53,21],[54,30],[53.4,40],[52,48]],4.2,0)],{ax:47});
bgAdd('Feathered bangs',bgFringe(7,{tip:(t,i)=>47+(i%2)*3,bend:(t,i)=>(t-.5)*4,split:1,w:()=>1.15}),{});
bgAdd('Airy bangs',bgFringe(7,{tip:(t,i)=>43+bgJ(i,13)*4,w:()=>.42,bend:(t,i)=>(i%2?1.2:-1.2),skip:i=>i==3}),{});
bgAdd('Shaggy bangs',bgFringe(12,{tip:(t,i)=>40+bgJ(i,17)*10,sweep:(t,i)=>(bgJ(i,19)-.5)*5,bend:(t,i)=>(bgJ(i,23)-.5)*4,w:(t,i)=>.7+bgJ(i,29)*.4}),{});
bgAdd('Piecey bangs',bgFringe(6,{tip:(t,i)=>46+(i%2)*4,w:()=>.62,bend:(t,i)=>(t-.5)*3}),{});
bgAdd('Hime bangs',[...bgFringe(9,{x0:28,x1:72,tip:()=>50,bend:()=>0,spread:0,cap:.2,w:()=>1.05}),...bgHime(74)],{});
bgAdd('Princess bangs',[...bgFringe(8,{x0:27,x1:73,tip:t=>44+6*Math.sin(Math.PI*t),bend:t=>(t-.5)*-4}),...bgCurl(70)],{});
bgAdd('Idol-style bangs',[...bgFringe(7,{x0:30,x1:70,tip:(t,i)=>47+bgJ(i,31)*3,w:()=>.55,bend:(t,i)=>(i%2?.8:-.8)}),...bgSide(68,{w:6})],{});
bgAdd('Flipped bangs',bgFringe(8,{tip:(t,i)=>45+(i%2)*2,flip:(t)=>Math.abs(t-.5)>.18?3:0,bend:t=>(t-.5)*4}),{});
bgAdd('Spiky bangs',bgFringe(7,{tip:(t,i)=>44+(i%2)*8,sweep:(t,i)=>(i%2?2:-2),bend:()=>0,w:()=>.9,cap:.2}),{});
bgAdd('Multiple-lock bangs',[bgL([[30,25],[28,36],[26,46],[25,54]],10,0),bgL([[42,21.5],[40,34],[38,44],[37,52]],10.4,1),bgL([[56,21.4],[57,32],[58.4,42],[60,50]],10.4,1),bgL([[70,25],[72,36],[74,46],[75,54]],10,0)],{});
// index 3 = the right-side version of index 2 (old saves: Side part R)
BG.splice(3,0,{...BG[2],flip:1});BGN.splice(3,0,'Side-swept bangs (right)');
// replace the old designs and names (old indices keep a design of the same kind)
BG.forEach((b,i)=>{b.e=(BANGS[i]&&BANGS[i].e)||BANGS[0].e});BANGS.length=0;BG.forEach(b=>BANGS.push(b));FTN.length=0;BGN.forEach(n=>FTN.push(n));

// ---- ahoge: tapered locks relative to the attachment point (x right, y down) -----------------------------
const BG_AH=[null,
 {n:'Small curved ahoge',L:[[[0,3],[0,-2],[2,-6],[6,-7.6]]],w:3},
 {n:'Large curved ahoge',L:[[[0,3],[-1,-4],[2,-12],[9,-15.4],[12,-12]]],w:3.8},
 {n:'Double ahoge',L:[[[-1.4,3],[-2,-4],[-4.4,-9],[-8,-10.6]],[[1.4,3],[2.2,-3],[5,-8],[8.6,-8.6]]],w:2.9},
 {n:'Short ahoge lock',L:[[[0,3],[.4,-2],[2.6,-4.6]]],w:3.2},
 {n:'Single upward ahoge',L:[[[0,3],[0,-4],[.8,-10],[2,-14.6]]],w:3.4},
 {n:'Soft rounded ahoge',L:[[[0,3],[-1,-4],[1.6,-9],[6,-8.4],[5.4,-4.6]]],w:3.4},
 {n:'Wavy ahoge',L:[[[0,3],[-1.2,-3],[1.6,-7],[-1,-11],[2,-15]]],w:3.2},
 {n:'Twisted ahoge',L:[[[0,3],[1,-3],[-2,-7],[1,-10.4],[5,-11],[4,-8]]],w:3}];
AP_AHN.length=0;['None',...BG_AH.slice(1).map(x=>x.n)].forEach(n=>AP_AHN.push(n));

// ---- drawing --------------------------------------------------------------------------------------------------
// stays full most of the way, then narrows to a pointed tip (clump-like, not comb-like)
const bgProf=(w,cap)=>t=>{const u=Math.max(0,(t-.08)/.92);return w*(1-Math.pow(u,1.7))*(1+.12*Math.sin(Math.PI*Math.min(1,t*1.6)))+(cap!=null?cap:.25)};
function bgLockD(L){const S=limbPts(L.p,bgProf(L.w,L.cap),12);return limbPath(S,0,1,0,.95)}
function bgLockSvg(L,C){const d=bgLockD(L),fill=L.f?C.HU:C.HD,P=L.p,last=P[P.length-1],first=P[0];
 let s=`<path d="${d}" fill="${fill}" stroke="${C.hl}" stroke-width=".55" stroke-linejoin="round"/>`;
 // inner shadow line along the lock, highlight on the upper part (front locks)
 const S=limbPts(P,()=>0,10),pt_=k=>S[Math.round(k*10)].p,off=(k,o)=>{const a=S[Math.max(0,Math.round(k*10)-1)].p,b=S[Math.min(10,Math.round(k*10)+1)].p,dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;const q=pt_(k);return[q[0]-dy/l*o,q[1]+dx/l*o]};
 const side=first[0]<50?1:-1;
 s+=`<path d="${crPath([off(.3,side*L.w*.18),off(.6,side*L.w*.14),off(.85,side*L.w*.06)])}" fill="none" stroke="${C.hl}" stroke-width=".42" opacity=".42" stroke-linecap="round"/>`;
 if(L.f)s+=`<path d="${crPath([off(.18,-side*L.w*.12),off(.34,-side*L.w*.1),off(.5,-side*L.w*.06)])}" fill="none" stroke="${C.hlite}" stroke-width="${N2(Math.min(1.1,L.w*.14))}" opacity=".55" stroke-linecap="round"/>`;
 if(L.split){const a=off(.62,0),b=[last[0]+(last[0]<50?-.8:.8),last[1]-3.4];s+=`<path d="M${N2(a[0])} ${N2(a[1])}Q${N2((a[0]+b[0])/2)} ${N2((a[1]+b[1])/2+1.4)} ${N2(b[0])} ${N2(b[1])}" fill="none" stroke="${C.hl}" stroke-width=".5" opacity=".7"/>`}
 return s}
function bgAhogeSvg(k,F,C,id){const A=BG_AH[k];if(!A)return'';const ax=F.ax??50,ay=bgTopY(ax);let fill='',line='';
 A.L.forEach(P=>{const p=P.map(([x,y])=>[ax+x,ay+y]),d=bgLockD({p,w:A.w,cap:.25});fill+=`<path d="${d}" fill="${C.HU}"/>`;line+=`<path d="${d}" fill="none" stroke="${C.hl}" stroke-width=".6" stroke-linejoin="round"/>`;
  const q=limbPts(p,()=>0,8);line+=`<path d="${crPath([q[3].p,q[5].p,q[7].p].map(([x,y])=>[x-.5,y]))}" fill="none" stroke="${C.hlite}" stroke-width=".7" opacity=".5" stroke-linecap="round"/>`});
 // the strand the ahoge grows from: root inside the crown, running into the bangs
 const root=`<path d="M${N2(ax)} ${N2(ay+2)}Q${N2(ax+(ax<50?-2:2))} ${N2(ay+8)} ${N2(ax+(ax-50)*.4+(ax<50?-3:3))} ${N2(ay+14)}" fill="none" stroke="${C.hl}" stroke-width=".5" opacity=".45" stroke-linecap="round"/>`;
 return`<mask id="${id}am" maskUnits="userSpaceOnUse" x="-20" y="-40" width="140" height="120"><rect x="-20" y="-40" width="140" height="120" fill="#fff"/><path d="${BG_CAPD}" fill="#000"/></mask>${fill}<g mask="url(#${id}am)">${line}</g>${root}`}
function bgBangs(F,a,D,id,hb,ex){const hl=mixc(hb[2],'#22121e',.4),hlite=mixc(hb[1],'#ffffff',.6),C={HU:`url(#${id}hu)`,HD:`url(#${id}hd)`,hl,hlite};
 const L=F.L,back=L.filter(z=>!z.f),front=L.filter(z=>z.f);
 let s=`<path d="${BG_BASE}" fill="${C.HD}" stroke="${hl}" stroke-width=".7" stroke-linejoin="round"/>`;
 s+=back.map(z=>bgLockSvg(z,C)).join('')+front.map(z=>bgLockSvg(z,C)).join('');
 // crown cap over the lock roots (no edge line on its lower side) + outer outline + parting / flow lines
 s+=`<path d="${BG_CAPD}" fill="${C.HU}"/><path d="${BG_CROWN_OUT}" fill="none" stroke="${hl}" stroke-width=".7"/>`;
 s+=`<g fill="none" stroke="${hl}" stroke-width=".45" opacity=".35" stroke-linecap="round">${L.filter((z,i)=>i%2==0).map(z=>{const r=z.p[0];return`<path d="M${N2(50+(r[0]-50)*.25)} ${N2(9+Math.abs(r[0]-50)*.06)}Q${N2(50+(r[0]-50)*.75)} ${N2((r[1]+10)/2)} ${N2(r[0])} ${N2(r[1]+1.6)}"/>`}).join('')}</g>`;
 s+=`<path d="M25 25Q37.4 13.6 50 13.4Q62.6 13.6 75 25L73.4 27.4L70.6 24.4L68 27L65 23.4L61.6 25.8L59 22.2L55.6 24.4L52.4 21.4L50 23.4L47.6 21.4L44.4 24.4L41 22.2L38.4 25.8L35 23.4L32 27L29.4 24.4L26.6 27.4Z" fill="${hlite}" opacity="${N2((D.ring||.6)*.5)}"/>`;
 const ahk=a.ah!=null?a.ah:D.ahoge;if(ahk)s+=bgAhogeSvg(ahk,F,C,id);
 return F.flip?mir(s):s}
function bgShadow(F,id,sk,faceD){const d=F.L.map(bgLockD).join('');return`<clipPath id="${id}fc"><path d="${faceD}"/></clipPath><g clip-path="url(#${id}fc)"><g transform="translate(0 2.2)${F.flip?' translate(100 0) scale(-1 1)':''}" fill="${sk[1]}" opacity=".85"><path d="${d}"/><path d="${BG_CAPD}"/></g></g>`}
// ---- hook into the head renderer: replace the bangs layer and the forehead shadow ---------------------------------
{const f=headParts;headParts=function(m,ex,id,opt={}){const r=f.apply(this,arguments);try{const cd=r.a&&r.a.cd;r.acc=cd&&((typeof czHasHead=='function'&&czHasHead(cd))||(cd.a&&cd.a.earrings))?czHeadAcc(cd):''}catch(e){}try{const a=r.a,F=BANGS[a.ft]||BANGS[0];if(!F||!F.L)return r;const D=r.D,hb=apHairC(a);
  r.defs+=`<linearGradient id="${id}hu" gradientUnits="userSpaceOnUse" x1="0" y1="2" x2="0" y2="66"><stop offset="0" stop-color="${mixc(hb[1],'#fff',.22)}"/><stop offset=".3" stop-color="${hb[1]}"/><stop offset="1" stop-color="${mixc(hb[1],hb[2],.6)}"/></linearGradient><linearGradient id="${id}hd" gradientUnits="userSpaceOnUse" x1="0" y1="2" x2="0" y2="66"><stop offset="0" stop-color="${mixc(hb[1],hb[2],.25)}"/><stop offset=".45" stop-color="${mixc(hb[1],hb[2],.5)}"/><stop offset="1" stop-color="${mixc(hb[1],hb[2],.78)}"/></linearGradient>`;
  let nb=bgBangs(F,a,D,id,hb,ex);const B=backHair(a.bk,D,((m.id|0)+1)*131);if(B&&B.cbraid)nb+=apCrownBraid(`url(#${id}hf)`,`stroke="${mixc(hb[2],'#22121e',.4)}" stroke-width=".7" stroke-linejoin="round"`);r.bangs=nb;
  const i=r.face.indexOf(`<clipPath id="${id}fc">`);if(i>=0)r.face=r.face.slice(0,i)+bgShadow(F,id,r.sk,apFaceD(a,D))}catch(e){console.error(e)}return r}}
