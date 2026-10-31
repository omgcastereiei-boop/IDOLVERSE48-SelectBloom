// =====================================================================================
//  IDOLVERSE48: Select Bloom!  —  Character Art Engine v3 ("Bloom Illustration")
// -------------------------------------------------------------------------------------
//  Pure 2D anime vector illustration, drawn in SVG at runtime.
//
//  Public contract (identical to the engine it replaces, so the game code is untouched):
//    pt(m, size, noBg, viewBox, expr)   -> <svg> portrait (bust)   frame 0..100 x 0..120
//    fig(m, layer)                      -> inner SVG full body     frame 0..100 x 0..200
//    CHAR_ASSETS.{portrait,bust,half,full,entry}
//    EXN (12 expression names), SKN (skin tones), ART (cache), HC/EC/BKN extensions
//
//  Identity: every idol's look comes ONLY from her saved appearance record (m.ap: hair
//  style/colour, bangs, eyes, brows, mouth, outfit, accessory, skin) plus stable traits
//  derived from her member ID (face shape, eye size, lashes, highlights, freckles...).
//  Nothing is random at draw time, so she looks the same on every screen and every visit.
// =====================================================================================

// ---- palette extensions (same entries & order as before: saved indices keep their meaning)
HC.push(['Ash blonde','#ddd2b0','#a99d78'],['White','#f7f5fa','#cdc8dd'],['Navy','#45558a','#27315c'],['Chestnut','#8f4c33','#5c2c1d'],['Lavender','#cdb6f2','#9a82cc']);
EC.push(['Amber','#a8650f','#ffd47a'],['Ruby','#a3293b','#ff9aa8'],['Teal','#17807f','#8ee6de'],['Violet gray','#5a4a6e','#c7b9dc']);
BKN.push('Hime cut','Wolf cut','Layered','Pixie');

const EXN=['Neutral','Happy','Smiling','Excited','Shy','Surprised','Sad','Determined','Confident','Embarrassed','Pouting','Cheerful'];
const MO2EX=[2,11,0,10,3];
const ART={v:3,cache:new Map()};
const SKN=[['#fff3ec','#f6d2c3','#d99a86'],['#ffeadf','#f3c6b0','#d39078'],['#fde2cf','#eebb9b','#c98868'],['#f3d4b8','#dfa985','#b37656'],['#e2bb98','#c8926b','#9a6442']];

// ---------------------------------------------------------------- colour helpers
const hx=h=>{h=String(h).replace('#','');if(h.length==3)h=h.split('').map(c=>c+c).join('');return[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)||0)};
const mixc=(a,b,t)=>{const A=hx(a),B=hx(b);return'#'+A.map((v,i)=>Math.max(0,Math.min(255,Math.round(v+(B[i]-v)*t))).toString(16).padStart(2,'0')).join('')};
const hslx=(h,s,l)=>{h=((h%360)+360)%360;s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return'#'+[f(0),f(8),f(4)].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('')};
const P_=(d,f,o='')=>`<path d="${d}" fill="${f}" ${o}/>`,mir=s=>`<g transform="translate(100 0) scale(-1 1)">${s}</g>`;
const N2=n=>Math.round(n*100)/100;
const pts=a=>a.map(p=>N2(p[0])+' '+N2(p[1]));

// ---------------------------------------------------------------- geometry helpers
// Catmull-Rom spline through points -> SVG cubic segments (without the initial M)
function crSeg(P){let d='';for(let i=0;i<P.length-1;i++){const p0=P[i-1]||P[i],p1=P[i],p2=P[i+1],p3=P[i+2]||p2;
 const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];d+=`C${N2(c1[0])} ${N2(c1[1])} ${N2(c2[0])} ${N2(c2[1])} ${N2(p2[0])} ${N2(p2[1])}`}return d}
const crPath=(P,close)=>`M${N2(P[0][0])} ${N2(P[0][1])}`+crSeg(P)+(close?'Z':'');
// closed smooth shape from a left-half outline mirrored around x=50
function symShape(L){const R=[...L].reverse().map(([x,y])=>[100-x,y]);return crPath([...L,...R],1)}
// tapered hair lock: root centre (x0,y0) width w, tip (x1,y1), bend b (perpendicular offset)
function lockP(x0,y0,x1,y1,w,b=0){const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,mx=(x0+x1)/2+nx*b,my=(y0+y1)/2+ny*b;
 return`M${N2(x0+nx*w/2)} ${N2(y0+ny*w/2)}Q${N2(mx+nx*w*.36)} ${N2(my+ny*w*.36)} ${N2(x1)} ${N2(y1)}Q${N2(mx-nx*w*.36)} ${N2(my-ny*w*.36)} ${N2(x0-nx*w/2)} ${N2(y0-ny*w/2)}Z`}
// limb outline from joint polyline + width profile (smooth, tapered, rounded ends)
function limbPts(J,prof,n=12){const seg=[];let tot=0;for(let i=0;i<J.length-1;i++){const l=Math.hypot(J[i+1][0]-J[i][0],J[i+1][1]-J[i][1]);seg.push(l);tot+=l}
 const out=[];for(let k=0;k<=n;k++){let t=k/n,d=t*tot,i=0;while(i<seg.length-1&&d>seg[i]){d-=seg[i];i++}const u=seg[i]?Math.min(1,d/seg[i]):0;out.push({p:[J[i][0]+(J[i+1][0]-J[i][0])*u,J[i][1]+(J[i+1][1]-J[i][1])*u],t,w:prof(t)})}return out}
function limbPath(S,t0=0,t1=1,grow=0){const Q=S.filter(s=>s.t>=t0-1e-6&&s.t<=t1+1e-6);if(Q.length<2)return'';const L=[],R=[];
 Q.forEach((s,i)=>{const a=Q[Math.max(0,i-1)].p,b=Q[Math.min(Q.length-1,i+1)].p,dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,w=s.w/2+grow;L.push([s.p[0]+nx*w,s.p[1]+ny*w]);R.push([s.p[0]-nx*w,s.p[1]-ny*w])});
 const e=Q[Q.length-1],e2=Q[Q.length-2],ex=e.p[0]-e2.p[0],ey=e.p[1]-e2.p[1],el=Math.hypot(ex,ey)||1,s0=Q[0],s1=Q[1],sx=s0.p[0]-s1.p[0],sy=s0.p[1]-s1.p[1],sl=Math.hypot(sx,sy)||1;
 const ce=[e.p[0]+ex/el*(e.w/2+grow)*1.25,e.p[1]+ey/el*(e.w/2+grow)*1.25],cs=[s0.p[0]+sx/sl*(s0.w/2+grow)*1.1,s0.p[1]+sy/sl*(s0.w/2+grow)*1.1],RR=[...R].reverse();
 return crPath(L)+`Q${N2(ce[0])} ${N2(ce[1])} ${N2(RR[0][0])} ${N2(RR[0][1])}`+crSeg(RR)+`Q${N2(cs[0])} ${N2(cs[1])} ${N2(L[0][0])} ${N2(L[0][1])}Z`}
const rad=d=>d*Math.PI/180,ep=(x,y,L,ang)=>[+(x+L*Math.sin(rad(ang))).toFixed(2),+(y+L*Math.cos(rad(ang))).toFixed(2)];

// ---------------------------------------------------------------- stable per-ID design traits
function dz(m){const r=mulb(((m.id|0)+1)*9973+((m.hue|0)*7)),p=()=>r();const sk=p();
 return{face:Math.floor(p()*4),es:1+p()*.12,lash:Math.floor(p()*3),nose:Math.floor(p()*3),
  skin:m.ap&&m.ap.sk!=null?m.ap.sk:sk<.32?0:sk<.68?1:sk<.86?2:sk<.96?3:4,
  lf:.97+p()*.06,crease:p()<.55,er:p()<.4,mw:.9+p()*.22,sp:Math.round((p()-.5)*2*8)/10,blush:.3+p()*.3,
  mole:p()<.14?(p()<.5?1:2):0,hl:Math.floor(p()*3),ahoge:p()<.38?1+Math.floor(p()*2):0,
  fr:p()<.1,pupil:p()<.12?1:0,tone:p()*1,rib:Math.floor(p()*360),ring:.5+p()*.35,
  // body & bearing
  sh:p()*1.4-.7,leg:Math.floor(p()*3)}}

// ---------------------------------------------------------------- outfit colours
function ocol(a){const h=a.oh|0;return{h,c1:hslx(h,74,88),c2:hslx(h,58,70),c3:hslx(h+30,70,93),c4:hslx(h-25,62,78),dk:hslx(h,40,34),ln:hslx(h,34,42),w:'#fffdfb',wl:'#d9cfe2',g:'#efcf7c',gl:'#b88f35',pearl:'#fff8f2'}}

// =====================================================================================
//  HEAD  (frame 0..100 x 0..120: crown ~y10, eyes y56, mouth y72, chin y83)
// =====================================================================================
const HAIRLINE=x=>23+Math.pow((x-50)/29,2)*15;
const HAIRCAP='M18.6 52C15.6 26 30 9.5 50 9.5C70 9.5 84.4 26 81.4 52C80 44 77.6 36 72 31.6C66 27 58 25.4 50 25.4C42 25.4 34 27 28 31.6C22.4 36 20 44 18.6 52Z';
const FACES=[[69,11,83],[68,9,84],[66,6.4,84.6],[72,12.5,82.4]];
const facePath=f=>{const[cy,cw,ch]=FACES[f]||FACES[0];return`M21.4 44C21.6 ${cy} ${50-cw-8} ${ch-4.5} ${50-cw*.38} ${ch-.7}Q50 ${ch+.7} ${50+cw*.38} ${ch-.7}C${50+cw+8} ${ch-4.5} 78.4 ${cy} 78.6 44C78.6 26 66 17 50 17C34 17 21.4 26 21.4 44Z`};

// ---- back hair silhouettes --------------------------------------------------------
// returns {b:path(s) behind body, f:front pieces (over shoulders), tails:[...], sk:side-lock kind, s:side-lock length, ears, bun, top}
function tipRow(x0,x1,y,n,dp,seed){let s='',r=mulb(seed);for(let i=1;i<=n;i++){const x=x0+(x1-x0)*i/n,xm=x0+(x1-x0)*(i-.5)/n,j=(r()-.5)*dp*.7;s+=`Q${N2(xm)} ${N2(y+dp+j)} ${N2(x)} ${N2(y+(i<n?(r()-.5)*dp*.5:0))}`}return s}
function longMass(len,flare,seed,wave=0){const y=len;let L=`M19 48C16 25 30 9.5 50 9.5C70 9.5 84 25 81 48`;
 L+=wave?`C${86+flare} 64 ${80+flare} 80 ${86+flare} ${(48+y)/2}C${92+flare} ${y-24} ${82+flare} ${y-12} ${84+flare*.6} ${y}`:`C${83+flare*.4} 70 ${85+flare} ${y*.55+30} ${84+flare*.7} ${y}`;
 L+=tipRow(84+flare*.7,16-flare*.7,y,7,5,seed);
 L+=wave?`C${18-flare} ${y-12} ${8-flare} ${y-24} ${14-flare} ${(48+y)/2}C${20-flare} 80 ${14-flare} 64 19 48Z`:`C${15-flare} ${y*.55+30} ${17-flare*.4} 70 19 48Z`;return L}
function backHair(bk,D,seed){switch(bk){
 case 0:return{b:`M18.4 48C15.6 25 30 9.5 50 9.5C70 9.5 84.4 25 81.6 48C82.6 62 84.6 74 81.6 84`+tipRow(81.6,18.4,84,6,3.2,seed)+`C15.4 74 17.4 62 18.4 48Z`,sk:0,s:80};
 case 1:return{b:longMass(106,1,seed),sk:1,s:100};
 case 2:return{b:longMass(162,3,seed),sk:1,s:128};
 case 3:return{b:longMass(150,5,seed,1),sk:2,s:118,wave:1};
 case 4:{let c='';[[15,66],[11,84],[13,102],[10,120],[14,136],[85,66],[89,84],[87,102],[90,120],[86,136],[24,146],[76,146],[37,150],[63,150],[50,151]].forEach(([x,y])=>c+=`M${x+9} ${y}a9 9 0 1 0 0 .1Z`);
  return{b:`M19 48C16 25 30 9.5 50 9.5C70 9.5 84 25 81 48C85 74 87 112 82 142L18 142C13 112 15 74 19 48Z`+c,curl:1,sk:2,s:108}}
 case 5:return{b:`M20 48C18 27 31.5 11 50 11C68.5 11 82 27 80 48C80 58 77 65 71 69L29 69C23 65 20 58 20 48Z`,tails:[[[63,15],[84,4],[98,40],[95,92],[88,150],12,6]],tie:[[64,16]],sk:0,s:72,ears:1};
 case 6:return{b:`M20 48C18 27 31.5 11 50 11C68.5 11 82 27 80 48C80 58 77 65 71 69L29 69C23 65 20 58 20 48Z`,ftails:[[[34,80],[22,96],[24,128],[30,152],[29,160],9,5]],tie:[[34,82]],sk:0,s:72};
 case 7:return{b:`M20 48C18 27 31.5 11 50 11C68.5 11 82 27 80 48C80 58 77 65 71 69L29 69C23 65 20 58 20 48Z`,tails:[[[77,30],[96,36],[100,78],[93,118],[90,146],11,6]],tie:[[78,31]],sk:0,s:72};
 case 8:return{b:`M20 48C18 27 31.5 11 50 11C68.5 11 82 27 80 48C80 58 77 65 71 69L29 69C23 65 20 58 20 48Z`,tails:[[[23,27],[2,34],[-2,80],[5,120],[4,156],11,6],[[77,27],[98,34],[102,80],[95,120],[96,156],11,6]],tie:[[22,28],[78,28]],sk:0,s:74};
 case 9:return{b:`M20 48C18 27 31.5 11 50 11C68.5 11 82 27 80 48C80 58 77 65 71 69L29 69C23 65 20 58 20 48Z`,braid:[33,78,28,152],tie:[[28,148]],sk:0,s:74};
 case 10:return{b:`M20 48C18 27 31.5 11 50 11C68.5 11 82 27 80 48C80 58 77 65 71 69L29 69C23 65 20 58 20 48Z`,bun:1,sk:0,s:74,ears:1};
 case 11:return{b:longMass(152,2,seed),top:1,sk:1,s:112};
 case 12:return{b:longMass(160,1,seed),sk:3,s:78};
 case 13:return{b:`M18.4 48C15.4 25 30 9.5 50 9.5C70 9.5 84.6 25 81.6 48C83 60 88 70 93 79L85 80L91 92L81 89L85 101L75 93L71 100L67 91L33 91L29 100L25 93L15 101L19 89L9 92L15 80L7 79C12 70 17 60 18.4 48Z`,sk:4,s:94};
 case 14:return{b:`M18.6 48C16 25 30 9.5 50 9.5C70 9.5 84 25 81.4 48C83 66 87 80 85 96L90 106L83 107L88 124L79 120L81 138`+tipRow(81,19,138,5,5,seed)+`L21 120L12 124L17 107L10 106L15 96C13 80 17 66 18.6 48Z`,sk:2,s:106,layer:1};
 case 15:return{b:`M20.4 48C18 26 31.5 10.5 50 10.5C68.5 10.5 82 26 79.6 48C80 56 79 61 77 65L23 65C21 61 20 56 20.4 48Z`,sk:5,s:58,ears:1};
 default:return backHair(2,D,seed)}}

// side locks in front of the face/shoulders
function sideLocks(kind,len,seed){const r=mulb(seed),j=()=>(r()-.5)*2;
 const pair=s=>s+mir(s);
 if(kind==0)return pair(`<path d="${lockP(25,34,23.4,74+j(),7.6,-1.4)}"/>`);
 if(kind==3)return pair(`<path d="M20.6 34C19.4 50 19.6 64 20.4 79L31.6 79C30.2 64 29.6 50 30.6 37Z"/>`);
 if(kind==5)return pair(`<path d="${lockP(24.6,38,23.6,61,5.6,-1)}"/>`);
 if(kind==4)return pair(`<path d="${lockP(25,34,19,82+j()*2,8,-2.4)}"/><path d="${lockP(27,40,24,92,5,-1)}"/>`);
 if(kind==2)return pair(`<path d="M24.6 32C17 50 22 64 16.6 80C12 96 20 ${len-14} 16 ${len}C24 ${len-10} 25 ${len-28} 23 ${len*.62}C27 66 25.4 52 30.4 38Z"/>`);
 return pair(`<path d="M24.4 32C18.6 48 18 64 18.2 ${N2(len*.55+22)}C18.4 ${N2(len*.8)} 17.6 ${N2(len*.92)} 18.6 ${len}C22.6 ${N2(len*.84)} 25.4 ${N2(len*.62)} 26 ${N2(len*.46+18)}C26.6 62 27.6 48 30.6 37Z"/>`)}

// ---- bangs (front hair) -------------------------------------------------------------
// each lock: [rootX, tipX, tipY, width, bend]
const BANGS=[
 /*0 No bangs*/   {locks:[],part:1,cap:'M18.6 52C15.6 26 30 9.5 50 9.5C70 9.5 84.4 26 81.4 52C79 40 74 31 64 27C58 24.6 54 25 50 26C46 25 42 24.6 36 27C26 31 21 40 18.6 52Z'},
 /*1 Middle part*/ {locks:[[46,26,52,10,-3],[40,24,48,8,-2],[34,22,46,7,-1],[54,74,52,10,3],[60,76,48,8,2],[66,78,46,7,1]],strand:[[48,20,30,48],[52,20,70,48]]},
 /*2 Side L*/     {locks:[[36,22,48,8,-2],[42,30,47,9,-2],[48,40,45,10,-1],[54,52,46,11,1],[60,64,45,10,2],[67,74,47,9,2],[73,79,52,7,2]],strand:[[40,20,58,44]]},
 /*3 Side R*/     null,
 /*4 Side-swept*/ {locks:[[26,30,40,7,1],[33,40,42,9,2],[40,50,45,10,3],[48,61,47,11,3],[56,71,50,10,3],[64,78,54,9,2],[72,81,58,6,1]],strand:[[36,21,48,44],[56,22,68,48]]},
 /*5 Curtain*/    {locks:[[48,32,47,9,-3],[44,24,50,9,-3],[38,23,44,6,-1],[52,68,47,9,3],[56,76,50,9,3],[62,77,44,6,1]],strand:[[47,22,32,46],[53,22,68,46]]},
 /*6 Wispy*/      {locks:[[24,26,47,5,0],[30,32,44,6,0],[36,37,47,6,-.5],[42,43,43,6,0],[48,49,46,6,0],[54,55,43,6,0],[60,61,47,6,.5],[66,68,44,6,0],[73,75,47,5,0]],strand:[[40,21,41,42],[60,21,60,42]],thin:1},
 /*7 Full straight*/{locks:[[24,24.6,46,8.4,0],[31,31.5,45.2,8.4,0],[38,38.2,45.6,8.4,0],[44.5,44.6,45.2,8.4,0],[50.5,50.5,45.6,8.4,0],[56.5,56.4,45.2,8.4,0],[63,62.8,45.6,8.4,0],[69,68.5,45.2,8.4,0],[76,75.4,46,8.4,0]],blunt:45,strand:[[36,21,36,44],[50,20,50,44],[64,21,64,44]]},
 /*8 Asymmetric*/ {locks:[[24,22,56,8,-2],[31,31,52,8,-1],[38,40,49,9,-1],[46,50,40,9,1],[54,60,37,9,1],[62,68,36,8,1],[70,77,39,7,1]],strand:[[34,20,32,50],[60,20,62,36]]},
 /*9 Short fringe*/{locks:[[25,27,35,7,0],[32,33,33,7.6,0],[39,40,34,7.6,0],[46,47,33,7.6,0],[53,54,34,7.6,0],[60,61,33,7.6,0],[67,68,34,7.6,0],[74,74,35,6,0]],strand:[[42,20,42,32],[58,20,58,32]]},
 /*10 Face-framing*/{locks:[[44,40,30,7,-1],[56,60,30,7,1],[36,30,72,6,-2],[64,70,72,6,2]],part:1,cap:'M18.6 52C15.6 26 30 9.5 50 9.5C70 9.5 84.4 26 81.4 52C79 40 74 31 64 27C58 24.6 54 25 50 27C46 25 42 24.6 36 27C26 31 21 40 18.6 52Z',strand:[[50,16,50,27]]}];
BANGS[3]={...BANGS[2],flip:1};

// ---- expressions: eye mode, brow inner/outer offsets, mouth, blush, extra --------------
const EXS={0:{e:'o',bi:0,bo:0,mo:'flat',bl:0},1:{e:'h',bi:-1,bo:-1,mo:'open',bl:1},2:{e:'o',bi:-.6,bo:-.6,mo:'smile',bl:1},3:{e:'w',bi:-2,bo:-2,mo:'big',bl:1,x:'spark'},4:{e:'d',bi:-1.6,bo:1.2,mo:'shy',bl:2},5:{e:'s',bi:-3.4,bo:-3,mo:'o',bl:0},6:{e:'sad',bi:-3,bo:2.2,mo:'sad',bl:0,x:'tear'},7:{e:'f',bi:2.4,bo:-1.2,mo:'firm',bl:0,x:'fire'},8:{e:'half',bi:.6,bo:-1.6,mo:'smirk',bl:0,x:'wink'},9:{e:'d',bi:-2,bo:1.6,mo:'wavy',bl:2,x:'sweat'},10:{e:'o',bi:1.2,bo:-.6,mo:'pout',bl:1,x:'puff'},11:{e:'h',bi:-1.4,bo:-1.4,mo:'big',bl:1,x:'note'}};
function exOf(m,ex){if(ex!=null&&ex!==''&&EXS[+ex])return+ex;const a=ap(m);return MO2EX[a.mo]??2}

// eye geometry: [halfWidth, openHeight, outerTilt(neg = upturned), irisScale]
const EYG=[[10,12.4,-.6,1],[10.6,9.8,-2.2,.97],[10.8,7.6,-1.6,.93],[10.2,10,-4.4,.98],[10,10.8,3.4,1],[9.8,11.2,1.2,1]];
function eyes(a,D,X,ec,id,hb){const g=EYG[a.ey]||EYG[0],w=g[0]*D.es,h=g[1]*D.es,t=g[2],ir=g[3],y=56.5,lashC=mixc('#2a1622',hb[2],.3);let o='';
 const one=(c,d,k)=>{const st=X.e,ix=c-d*w*.9,iy=y-h*.04,ox=c+d*w,oy=y-h*.3+t;
  if(st=='h'||(st=='half'&&k==1&&X.x=='wink')){return`<path d="M${N2(ix)} ${N2(y+1.6)}Q${N2(c)} ${N2(y-h*.72)} ${N2(ox)} ${N2(y+1.2+t*.3)}" stroke="${lashC}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M${N2(ox)} ${N2(y+1.2+t*.3)}l${N2(d*2.6)} -1.6M${N2(ox-d*1)} ${N2(y-.4+t*.3)}l${N2(d*2.2)} -2.2" stroke="${lashC}" stroke-width="1.1" stroke-linecap="round"/>`}
  const op=st=='half'?.6:st=='d'?.8:st=='w'||st=='s'?1.1:st=='f'?.78:st=='sad'?.9:1,irs=st=='s'?.7:st=='w'?1.04:1,dy=st=='sad'?1:0;
  const top=`M${N2(ix)} ${N2(iy)}C${N2(c-d*w*.52)} ${N2(y-h*1.06*op+dy)} ${N2(c+d*w*.42)} ${N2(y-h*1.1*op+t*.5+dy)} ${N2(ox)} ${N2(oy+(1-op)*h*.62)}`,bot=`C${N2(c+d*w*.66)} ${N2(y+h*.66)} ${N2(c-d*w*.4)} ${N2(y+h*.76)} ${N2(ix)} ${N2(iy)}Z`,cid=`${id}c${k}`;
  const icx=c-d*.25,icy=y+h*.1,rx=w*.68*ir*irs,ry=h*.84*ir*irs,pc=mixc(ec[1],'#0b0512',.66);
  let s=`<clipPath id="${cid}"><path d="${top}${bot}"/></clipPath><path d="${top}${bot}" fill="#fffefe"/><g clip-path="url(#${cid})">`;
  s+=`<path d="${top}L${N2(ox)} ${N2(y-h*.05)}L${N2(ix)} ${N2(y-h*.05)}Z" fill="#c9b6d6" opacity=".45"/>`;
  s+=`<ellipse cx="${N2(icx)}" cy="${N2(icy)}" rx="${N2(rx)}" ry="${N2(ry)}" fill="url(#${id}ir)"/>`;
  s+=`<ellipse cx="${N2(icx)}" cy="${N2(icy+ry*.16)}" rx="${N2(rx*.72)}" ry="${N2(ry*.62)}" fill="none" stroke="${mixc(ec[2],'#fff',.2)}" stroke-width=".55" opacity=".55"/>`;
  s+=D.pupil?`<path d="M${N2(icx)} ${N2(icy-ry*.36)}l${N2(rx*.13)} ${N2(ry*.26)} ${N2(rx*.3)} .3-${N2(rx*.24)} ${N2(ry*.18)} .1 ${N2(ry*.34)}-${N2(rx*.29)}-${N2(ry*.2)}-${N2(rx*.29)} ${N2(ry*.2)} .1-${N2(ry*.34)}-${N2(rx*.24)}-${N2(ry*.18)} ${N2(rx*.3)}-.3z" fill="${pc}"/>`:`<ellipse cx="${N2(icx)}" cy="${N2(icy+.4)}" rx="${N2(rx*.4)}" ry="${N2(ry*.5)}" fill="${pc}"/>`;
  s+=`<path d="M${N2(icx-rx*.86)} ${N2(icy+ry*.3)}Q${N2(icx)} ${N2(icy+ry*1.12)} ${N2(icx+rx*.86)} ${N2(icy+ry*.3)}Q${N2(icx)} ${N2(icy+ry*.66)} ${N2(icx-rx*.86)} ${N2(icy+ry*.3)}Z" fill="${ec[2]}" opacity=".9"/>`;
  s+=`<ellipse cx="${N2(icx)}" cy="${N2(icy)}" rx="${N2(rx)}" ry="${N2(ry)}" fill="none" stroke="${mixc(ec[1],'#120818',.5)}" stroke-width=".7"/>`;
  s+=`<path d="${top}L${N2(ox)} ${N2(y-h*.25)}Q${N2(c)} ${N2(y-h*.5)} ${N2(ix)} ${N2(y-h*.2)}Z" fill="${mixc(ec[1],'#1a0a20',.5)}" opacity=".38"/>`;
  const hs=[[-.4,-.44,.4,.3],[.44,.36,.16,.16]];if(D.hl==1)hs.push([.32,-.5,.13,.13]);
  s+=hs.map(([fx,fy,sx,sy],i)=>`<ellipse cx="${N2(icx+d*fx*rx*(i?1:-1)*d)}" cy="${N2(icy+fy*ry)}" rx="${N2(rx*sx)}" ry="${N2(ry*sy)}" fill="#fff" ${i==0?`transform="rotate(-22 ${N2(icx+d*fx*rx*(i?1:-1)*d)} ${N2(icy+fy*ry)})"`:'opacity=".95"'}/>`).join('');
  if(D.hl==2||st=='w')s+=`<path d="M${N2(icx+rx*.3)} ${N2(icy-ry*.62)}l.55 1.5 1.5.55-1.5.55-.55 1.5-.55-1.5-1.5-.55 1.5-.55z" fill="#fff"/>`;
  s+=`</g>`;
  // lashes
  s+=`<path d="${top}" stroke="${lashC}" stroke-width="${D.lash==2?2.4:2.05}" fill="none" stroke-linecap="round"/>`;
  s+=`<path d="M${N2(ox-d*1.2)} ${N2(oy+(1-op)*h*.62-.6)}l${N2(d*4)} ${N2(-2.2+(D.lash==1?-.8:0))}l${N2(-d*1.8)} 3.6Z" fill="${lashC}"/>`;
  if(D.lash>=1)s+=`<path d="M${N2(c+d*w*.6)} ${N2(y-h*1.02*op+t*.45)}l${N2(d*1.8)} -2.2M${N2(c+d*w*.25)} ${N2(y-h*1.1*op+t*.3)}l${N2(d*1)} -2.4" stroke="${lashC}" stroke-width=".85" stroke-linecap="round"/>`;
  s+=`<path d="M${N2(ox-d*.6)} ${N2(oy+h*.62)}Q${N2(c+d*w*.62)} ${N2(y+h*.78)} ${N2(c+d*w*.3)} ${N2(y+h*.8)}" stroke="${lashC}" stroke-width="${D.lash==2?.85:.6}" fill="none" opacity=".45" stroke-linecap="round"/>`;
  if(D.crease&&op>.7)s+=`<path d="M${N2(ix+d*1.6)} ${N2(iy-3.4)}C${N2(c-d*w*.3)} ${N2(y-h*1.22-2.2)} ${N2(c+d*w*.4)} ${N2(y-h*1.2-1.8+t*.4)} ${N2(ox-d*.4)} ${N2(oy-2.4)}" stroke="${lashC}" stroke-width=".6" fill="none" opacity=".42"/>`;
  if(X.x=='tear'&&k==1)s+=`<path d="M${N2(ox-d*1)} ${N2(oy+h*.75)}q-1.3 2.8 0 3.6q1.3 -.8 0 -3.6z" fill="#cfeaff" stroke="#8cc8ef" stroke-width=".4"/>`;
  return s};
 return one(37.2-D.sp,-1,0)+one(62.8+D.sp,1,1)}
function brows(a,D,X,bc){const by=41.2-(EYG[a.ey]||EYG[0])[1]*D.es*.18,sp=D.sp;
 const b=(c,d)=>{const i=c-d*6.8,u=c+d*8.6,yi=by+X.bi,yo=by+X.bo+(a.br==3?-1.2:0),arch=[-.6,-2.2,-3.8,-1.2][a.br]||0,th=[.85,.95,.8,1.05][a.br]||.9;
  return`<path d="M${N2(i)} ${N2(yi)}Q${N2((i+u)/2)} ${N2(Math.min(yi,yo)+arch)} ${N2(u)} ${N2(yo+.8)}Q${N2((i+u)/2)} ${N2(Math.min(yi,yo)+arch+th)} ${N2(i)} ${N2(yi+th)}Z" fill="${bc}"/>`};
 return b(37.2-sp,-1)+b(62.8+sp,1)}
function mouthX(X,D){const w=D.mw,lc='#b04a62',fill='#93324c',tg='#f28aa2',L=x=>N2(50+(x-50)*w),y=72;switch(X.mo){
 case'flat':return`<path d="M${L(47.6)} ${y}Q50 ${y+.7} ${L(52.4)} ${y}" stroke="${lc}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
 case'smile':return`<path d="M${L(46)} ${y-.9}Q50 ${y+3.1} ${L(54)} ${y-.9}" stroke="${lc}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
 case'open':return`<path d="M${L(45.4)} ${y-1.4}Q50 ${y-.4} ${L(54.6)} ${y-1.4}Q${L(54)} ${y+5.6} 50 ${y+5.8}Q${L(46)} ${y+5.6} ${L(45.4)} ${y-1.4}Z" fill="${fill}" stroke="${lc}" stroke-width=".6"/><path d="M${L(47)} ${y+3.6}Q50 ${y+1.6} ${L(53)} ${y+3.6}Q50 ${y+5.8} ${L(47)} ${y+3.6}Z" fill="${tg}"/>`;
 case'big':return`<path d="M${L(44.2)} ${y-2}Q50 ${y-.6} ${L(55.8)} ${y-2}Q${L(55)} ${y+7.4} 50 ${y+7.6}Q${L(45)} ${y+7.4} ${L(44.2)} ${y-2}Z" fill="${fill}" stroke="${lc}" stroke-width=".6"/><path d="M${L(46.4)} ${y+4.8}Q50 ${y+2.2} ${L(53.6)} ${y+4.8}Q50 ${y+7.6} ${L(46.4)} ${y+4.8}Z" fill="${tg}"/><path d="M${L(45.2)} ${y-1.6}Q50 ${y-.3} ${L(54.8)} ${y-1.6}L${L(54.4)} ${y-.4}Q50 ${y+.6} ${L(45.6)} ${y-.4}Z" fill="#fff"/>`;
 case'shy':return`<path d="M${L(47.2)} ${y+.3}Q48.6 ${y-.7} 49.8 ${y+.3}Q51.2 ${y+1.2} ${L(52.6)} ${y+.2}" stroke="${lc}" stroke-width="1" fill="none" stroke-linecap="round"/>`;
 case'o':return`<ellipse cx="50" cy="${y+1.4}" rx="${N2(2.3*w)}" ry="2.9" fill="${fill}" stroke="${lc}" stroke-width=".6"/><ellipse cx="50" cy="${y+2.7}" rx="${N2(1.4*w)}" ry="1" fill="${tg}"/>`;
 case'sad':return`<path d="M${L(46.8)} ${y+1.4}Q50 ${y-1.2} ${L(53.2)} ${y+1.4}" stroke="${lc}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
 case'firm':return`<path d="M${L(46.4)} ${y+.2}Q50 ${y-.6} ${L(53.6)} ${y+.2}" stroke="${lc}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
 case'smirk':return`<path d="M${L(46.2)} ${y}Q50.6 ${y+1.8} ${L(54.4)} ${y-1.8}" stroke="${lc}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
 case'wavy':return`<path d="M${L(45.8)} ${y+.4}l1.4 -1.2 1.4 1.2 1.4 -1.2 1.4 1.2 1.4 -1.2 1.4 1.2" stroke="${lc}" stroke-width="1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
 case'pout':return`<path d="M${L(47.4)} ${y-.2}Q50 ${y-2} ${L(52.6)} ${y-.2}Q50 ${y+2.6} ${L(47.4)} ${y-.2}Z" fill="#e8768f" stroke="${lc}" stroke-width=".55"/>`}return''}

// ---- accessories ---------------------------------------------------------------------
function accSvg(ac,a,D,hb){const rc=hslx(D.rib,70,74),rl=hslx(D.rib,50,46);switch(ac){
 case 1:return`<g transform="translate(71 25) rotate(14)"><path d="M0 -7l2 4.3 4.7.6-3.4 3.3.9 4.7L0 2.6-4.2 4.9l.9-4.7-3.4-3.3 4.7-.6z" fill="#ffe28e" stroke="#c99a34" stroke-width=".7"/><path d="M-1.2 -3.4l.7 1.5" stroke="#fff" stroke-width=".9" stroke-linecap="round"/></g><g transform="translate(77.5 33) rotate(-10)"><path d="M0 -3.6l1 2.4 2.6.3-1.9 1.8.5 2.6L0 2.2-2.2 3.5l.5-2.6-1.9-1.8 2.6-.3z" fill="#bfe3ff" stroke="#6fa8d6" stroke-width=".5"/></g>`;
 case 2:return`<g transform="translate(70 18) rotate(16)"><path d="M0 0C-4 -9.5 -14 -8.5 -13 -1C-12 5.5 -5 4.5 0 0Z" fill="${rc}" stroke="${rl}" stroke-width=".7"/><path d="M0 0C4 -9.5 14 -8.5 13 -1C12 5.5 5 4.5 0 0Z" fill="${rc}" stroke="${rl}" stroke-width=".7"/><path d="M-1 1L-6 13L-2.4 11L-.6 14ZM1 1L6 13L2.4 11L.6 14Z" fill="${rc}" stroke="${rl}" stroke-width=".6"/><path d="M-10 -4Q-6 -2 -2.4 -1M10 -4Q6 -2 2.4 -1" stroke="#fff" stroke-width=".8" fill="none" opacity=".75"/><ellipse cx="0" cy=".2" rx="2.6" ry="3" fill="${mixc(rc,'#fff',.4)}" stroke="${rl}" stroke-width=".6"/></g>`;
 case 3:{const pet=(s,f)=>[0,72,144,216,288].map(r=>`<path d="M0 0C-3.2 -4.2 -2.6 -8.2 0 -8.4C2.6 -8.2 3.2 -4.2 0 0Z" transform="rotate(${r})" fill="${f}" stroke="#ec9cbc" stroke-width="${s}"/>`).join('');return`<g transform="translate(29 26)">${pet(.5,'#ffd8e8')}<circle r="1.9" fill="#ffd36a"/></g><g transform="translate(22.6 33.6) scale(.62)">${pet(.7,'#fff')}<circle r="1.9" fill="#ffd36a"/></g><path d="M34.4 30.6q3 -1.4 4.6 1.2" stroke="#8fcf9c" stroke-width="1.2" fill="none" stroke-linecap="round"/>`}
 case 4:{const hd=hb[1],hl=mixc(hb[2],'#000',.3);return`<path d="M20.6 28L21.4 3.6L42 17.4Z" fill="${hd}" stroke="${hl}" stroke-width=".8"/><path d="M79.4 28L78.6 3.6L58 17.4Z" fill="${hd}" stroke="${hl}" stroke-width=".8"/><path d="M24.6 21L25.2 10.4L34.4 16.8ZM75.4 21L74.8 10.4L65.6 16.8Z" fill="#ffc6dc"/>`}
 case 5:return`<path d="M33 21.6L36 10L41.6 17.2L50 4.6L58.4 17.2L64 10L67 21.6Q50 17.4 33 21.6Z" fill="#f6da80" stroke="#c39b3c" stroke-width=".8"/><circle cx="50" cy="11" r="2.1" fill="#f58fb5" stroke="#fff" stroke-width=".5"/><circle cx="41.4" cy="17.2" r="1.2" fill="#a6dbff"/><circle cx="58.6" cy="17.2" r="1.2" fill="#a6dbff"/><path d="M35 20.4Q50 16.9 65 20.4" stroke="#fff" stroke-width=".7" fill="none" opacity=".85"/>`;
 case 6:return`<g fill="#ffffff26" stroke="#6b5a7a" stroke-width="1.05"><rect x="25.6" y="48.6" width="22" height="15.2" rx="6"/><rect x="52.4" y="48.6" width="22" height="15.2" rx="6"/></g><path d="M47.6 54.4Q50 52.8 52.4 54.4" stroke="#6b5a7a" stroke-width="1" fill="none"/><path d="M28.4 51.4l4.4 -1.6M55.2 51.4l4.4 -1.6" stroke="#fff" stroke-width=".9" opacity=".85"/>`}return''}

// ---- full head assembly -------------------------------------------------------------
function headParts(m,ex,id,opt={}){const a=opt.a||apEff(m),D=dz(m),X=EXS[exOf(m,ex)],hb=HC[a.hc]||HC[0],ec=EC[a.ec]||EC[0],sk=SKN[D.skin]||SKN[1],seed=((m.id|0)+1)*131;
 const bc=a.bc<0||a.bc==null?mixc(hb[2],'#1a0f1f',.18):(HC[a.bc]||hb)[2],hl=mixc(hb[2],'#1b1020',.45),hlite=mixc(hb[1],'#ffffff',.55),hshade=mixc(hb[1],hb[2],.75);
 const B=backHair(a.bk,D,seed),F=BANGS[a.ft]||BANGS[0],hs=`stroke="${hl}" stroke-width=".8" stroke-linejoin="round"`,HF=`url(#${id}hf)`,HB=`url(#${id}hb)`;
 const defs=`<linearGradient id="${id}hf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mixc(hb[1],'#fff',.12)}"/><stop offset=".45" stop-color="${hb[1]}"/><stop offset="1" stop-color="${mixc(hb[1],hb[2],.8)}"/></linearGradient><linearGradient id="${id}hb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mixc(hb[1],hb[2],.6)}"/><stop offset="1" stop-color="${mixc(hb[2],'#000',.15)}"/></linearGradient><linearGradient id="${id}ir" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mixc(ec[1],'#120818',.6)}"/><stop offset=".5" stop-color="${ec[1]}"/><stop offset="1" stop-color="${mixc(ec[2],'#fff',.2)}"/></linearGradient><radialGradient id="${id}bl"><stop offset="0" stop-color="#ff8aa6" stop-opacity=".8"/><stop offset="1" stop-color="#ff8aa6" stop-opacity="0"/></radialGradient><linearGradient id="${id}fs" x1="0" y1="0" x2="0" y2="1"><stop offset=".3" stop-color="${sk[1]}" stop-opacity=".0"/><stop offset="1" stop-color="${sk[1]}" stop-opacity=".55"/></linearGradient>`;
 // ---------- back hair layer
 let back=`<g fill="${HB}" ${hs}><path d="${B.b}"/></g>`;
 if(B.layer)back+=`<g fill="none" stroke="${hshade}" stroke-width="1.2" opacity=".5"><path d="M16 96Q22 110 18 124M84 96Q78 110 82 124"/></g>`;
 if(B.curl)back+=`<g fill="none" stroke="${mixc(hb[1],'#fff',.3)}" stroke-width=".8" opacity=".55">${[[15,66],[11,102],[14,136],[85,66],[89,102],[86,136],[37,150],[63,150]].map(([x,y])=>`<path d="M${x-4} ${y}a4 4 0 1 1 4 4"/>`).join('')}</g>`;
 else if(B.s>=100)back+=`<g fill="none" stroke="${hl}" stroke-width=".55" opacity=".32"><path d="M24 60C20 82 20 104 22 130M76 60C80 82 80 104 78 130M34 70C32 90 33 110 35 128M66 70C68 90 67 110 65 128"/></g>`;
 const tail=([r,c1,c2,c3,tip,w0,w1])=>{const P=[r,c1,c2,c3,tip],S=limbPts(P,t=>t<.12?w1+(w0-w1)*t/.12:w0*Math.pow(1-(t-.12)/.88,.75)+.4,16);return`<path d="${limbPath(S)}" fill="${HB}" ${hs}/><path d="${crPath(P.map(([x,y])=>[x+.6,y]))}" stroke="${hlite}" stroke-width="1.4" fill="none" opacity=".35" stroke-linecap="round"/><path d="${crPath(P.map(([x,y],i)=>[x-(i?1.8:0),y]))}" stroke="${hl}" stroke-width=".55" fill="none" opacity=".5"/>`};
 (B.tails||[]).forEach(T=>back=tail(T)+back);
 if(B.bun)back+=`<circle cx="50" cy="9" r="11.5" fill="${HF}" ${hs}/><path d="M42.6 6Q50 -.4 57.4 6M43.6 12.4Q50 7 56.4 12.4" stroke="${hl}" stroke-width=".6" fill="none" opacity=".6"/><path d="M44 4.6Q48 1.6 53 2.4" stroke="${hlite}" stroke-width="1.4" fill="none" opacity=".6" stroke-linecap="round"/>`;
 if(B.top)back+=`<path d="M57.6 10C63 1.6 72.4 3.6 70.4 12.4C67 9.4 62.6 9.4 59.6 12.4Z" fill="${HF}" ${hs}/>`;
 const ties=(B.tie||[]).map(([x,y])=>`<g transform="translate(${x} ${y})"><ellipse rx="4.4" ry="3.1" fill="${hslx(D.rib,70,74)}" stroke="${hslx(D.rib,50,46)}" stroke-width=".6"/><path d="M-1 0C-6.4 -6.4 -9.6 -1 -6.2 2.2ZM1 0C6.4 -6.4 9.6 -1 6.2 2.2Z" fill="${hslx(D.rib,80,86)}" stroke="${hslx(D.rib,50,46)}" stroke-width=".5"/><circle r="1.3" fill="#fff" opacity=".8"/></g>`).join('');
 // front pieces (over shoulders)
 let over='';(B.ftails||[]).forEach(T=>over+=tail(T));
 if(B.braid){const[x0,y0,x1,y1]=B.braid;let br='';for(let i=0;i<10;i++){const t=i/9,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t,w=5.2-t*1.4;br+=`<ellipse cx="${N2(x-1.6)}" cy="${N2(y)}" rx="${N2(w)}" ry="${N2(w*1.1)}" transform="rotate(-24 ${N2(x)} ${N2(y)})"/><ellipse cx="${N2(x+1.6)}" cy="${N2(y+4)}" rx="${N2(w)}" ry="${N2(w*1.1)}" transform="rotate(24 ${N2(x)} ${N2(y+4)})"/>`}
  over+=`<g fill="${HF}" ${hs}><path d="M36 72C32 78 30 82 31 88L35 88C36 82 38 78 40 74Z"/>${br}<path d="M${x1-3} ${y1+2}L${x1-2} ${y1+12}L${x1} ${y1+4}L${x1+2} ${y1+13}L${x1+3} ${y1+3}Z"/></g>`}
 // ---------- face
 let face=`<path d="M44.6 70L55.4 70L55.8 96L44.2 96Z" fill="${sk[0]}"/><path d="M44.4 79Q50 87 55.6 79L55.8 86Q50 91 44.2 86Z" fill="${sk[1]}" opacity=".85"/>`;
 const earsVis=B.ears;
 if(earsVis)face+=`<path d="M22.6 52C17.4 49.6 17 60 22.4 64Z" fill="${sk[0]}" stroke="${sk[2]}" stroke-width=".6"/><path d="M77.4 52C82.6 49.6 83 60 77.6 64Z" fill="${sk[0]}" stroke="${sk[2]}" stroke-width=".6"/><path d="M21.6 55Q19.8 57 21.6 60M78.4 55Q80.2 57 78.4 60" stroke="${sk[2]}" stroke-width=".5" fill="none" opacity=".6"/>`;
 face+=`<path d="${facePath(D.face)}" fill="${sk[0]}" stroke="${sk[2]}" stroke-width=".7"/><path d="${facePath(D.face)}" fill="url(#${id}fs)" opacity=".7"/>`;
 if(earsVis&&D.er)face+=`<circle cx="20.8" cy="65.4" r="1.4" fill="#ffe28e" stroke="#c8a040" stroke-width=".4"/><circle cx="79.2" cy="65.4" r="1.4" fill="#ffe28e" stroke="#c8a040" stroke-width=".4"/>`;
 const bx=31.6-D.sp,bx2=68.4+D.sp,bl=X.bl?`<ellipse cx="${bx}" cy="66" rx="6.4" ry="3.4" fill="url(#${id}bl)" opacity="${X.bl==2?1:D.blush+.15}"/><ellipse cx="${bx2}" cy="66" rx="6.4" ry="3.4" fill="url(#${id}bl)" opacity="${X.bl==2?1:D.blush+.15}"/>${X.bl==2?`<path d="M${bx-3} 65l-1.4 2.6M${bx} 65l-1.4 2.6M${bx+3} 65l-1.4 2.6M${bx2-3} 65l-1.4 2.6M${bx2} 65l-1.4 2.6M${bx2+3} 65l-1.4 2.6" stroke="#ef7f9a" stroke-width=".6" stroke-linecap="round"/>`:''}`:`<ellipse cx="${bx}" cy="66" rx="5.6" ry="2.8" fill="url(#${id}bl)" opacity="${N2(D.blush)}"/><ellipse cx="${bx2}" cy="66" rx="5.6" ry="2.8" fill="url(#${id}bl)" opacity="${N2(D.blush)}"/>`;
 const nose=[`<path d="M50.5 63.4l-.9 2.3 1.4.1" stroke="${sk[2]}" stroke-width=".55" fill="none" stroke-linecap="round" opacity=".8"/>`,`<ellipse cx="50.4" cy="65.2" rx=".75" ry=".45" fill="${sk[2]}" opacity=".6"/>`,`<path d="M49.4 65.4q.9 .6 1.8 0" stroke="${sk[2]}" stroke-width=".55" fill="none" opacity=".75"/>`][D.nose];
 const mole=D.mole==1?`<circle cx="${45+D.sp}" cy="75" r=".5" fill="${sk[2]}"/>`:D.mole==2?`<circle cx="${71+D.sp}" cy="61" r=".5" fill="${sk[2]}"/>`:'';
 const fr=D.fr?[[30,64],[33,65.6],[35.4,63.8],[64.6,63.8],[67,65.6],[70,64]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".38" fill="${sk[2]}" opacity=".55"/>`).join(''):'';
 let feat=bl+fr+eyes(a,D,X,ec,id,hb)+nose+mouthX(X,D)+mole;
 if(X.x=='sweat')feat+=`<path d="M77 36q-2.4 4 0 5.6q2.4 -1.6 0 -5.6z" fill="#d6edff" stroke="#8cc8ef" stroke-width=".5"/>`;
 if(X.x=='spark')feat+=`<path d="M87 24l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z M13 32l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" fill="#ffd96a"/>`;
 if(X.x=='fire')feat+=`<path d="M85 40l4 -3M86 44l5 0M85 48l4 3" stroke="#ff8a8a" stroke-width="1.2" stroke-linecap="round"/>`;
 if(X.x=='puff')feat+=`<path d="M78 70q3 -2 4 1" stroke="#ef9fb8" stroke-width=".8" fill="none"/>`;
 if(X.x=='note')feat+=`<path d="M86 22v7.4a2 1.6 0 1 1-1-1.3V22l4 -1v2z" fill="#f59ac0"/>`;
 // ---------- front hair
 const sl=`<g fill="${HF}" ${hs}>${sideLocks(B.sk,B.s,seed)}</g>`;
 const LK=(F.locks||[]).map(([x0,x1,ty,w,b])=>lockP(x0,HAIRLINE(x0)-4,x1,ty,w*(F.thin?1.15:1.35),b));
 const capD=F.cap||HAIRCAP;
 let bangs=`<path d="${capD}" fill="${HF}" ${hs}/>`;
 if(F.blunt)bangs+=`<path d="M21.6 ${F.blunt}C22 30 34 22.6 50 22.6C66 22.6 78 30 78.4 ${F.blunt}Z" fill="${HF}" ${hs}/>`;
 bangs+=`<g fill="${HF}" ${hs}>${LK.map(d=>`<path d="${d}"/>`).join('')}</g>`;
 bangs+=`<g fill="none" stroke="${hl}" stroke-width=".55" opacity=".45">${(F.strand||[]).map(([x0,y0,x1,y1])=>`<path d="M${x0} ${y0}Q${(x0+x1)/2+2} ${(y0+y1)/2} ${x1} ${y1}"/>`).join('')}</g>`;
 // angel-ring highlight
 const rg=`<path d="M27.6 30.6Q38 19.4 50 19.2Q62 19.4 72.4 30.6L70.6 32.4L68.4 30.2L66 32L63.6 29L60.6 30.8L58 27.8L55 29.4L52.4 26.8L50 28.4L47.6 26.8L45 29.4L42 27.8L39.4 30.8L36.4 29L34 32L31.6 30.2L29.4 32.4Z" fill="${hlite}" opacity="${N2(D.ring*.85)}"/>`;
 bangs+=rg;
 if(D.ahoge)bangs+=D.ahoge==1?`<path d="M50 11C48 2 56 -2 60 2C55 1 52 4 51.4 11Z" fill="${HF}" ${hs}/>`:`<path d="M48 11C44 4 46 -1 50 0C47 2 48 6 50 11Z M51 11C55 4 60 3 62 6C57 5 54 7 52.4 11Z" fill="${HF}" ${hs}/>`;
 if(F.flip)bangs=mir(bangs);
 // hair shadow cast on forehead
 const shadow=LK.length?`<clipPath id="${id}fc"><path d="${facePath(D.face)}"/></clipPath><g clip-path="url(#${id}fc)" fill="${sk[1]}" opacity=".85"><g transform="translate(0 2.6)${F.flip?' translate(100 0) scale(-1 1)':''}">${LK.map(d=>`<path d="${d}"/>`).join('')}${F.blunt?`<path d="M21.6 ${F.blunt}C22 30 34 22.6 50 22.6C66 22.6 78 30 78.4 ${F.blunt}Z"/>`:''}<path d="${capD}"/></g></g>`:`<clipPath id="${id}fc"><path d="${facePath(D.face)}"/></clipPath><g clip-path="url(#${id}fc)"><path d="${capD}" transform="translate(0 2.2)" fill="${sk[1]}" opacity=".8"/></g>`;
 const browL=`<g opacity="${LK.length&&!F.part?'.6':'.9'}">${brows(a,D,X,bc)}</g>`;
 return{defs,back,over,face:face+shadow,feat,sl,bangs,brow:browL,acc:accSvg(a.ac,a,D,hb),ties,a,D,sk}}

// =====================================================================================
//  BODY  (figure frame 0..100 x 0..200; head drawn at scale K)
// =====================================================================================
const HK=.46,HTX=50-50*HK,HTY=4.2;          // head transform inside the figure frame
const SHL=[35.4,53.4],SHR=[64.6,53.4];
const TORSO_L=[[47,47.6],[41,49.4],[36.6,51.2],[34.2,54.4],[35,58.6],[35.6,62.6],[37.4,66.2],[41.2,72.4],[40.4,77.6],[38.8,83.6],[39.6,90]];
const torsoD=symShape(TORSO_L);
const armProf=t=>t<.5?5.3-t*2.8:t<.8?3.9-(t-.5)*1.2:3.5-(t-.8)*3.6;
const legProf=t=>t<.48?9.6-t*8.4:t<.54?5.6:t<.68?5.6+(t-.54)*4:t<.92?6.16-(t-.68)*10.6:3.6;
// leg joints per stance: [hipL,kneeL,ankleL],[hipR,kneeR,ankleR]
function legJ(st,lf){const k=v=>86+(v-86)*lf;switch(st){
 case 1:return[[[45.4,86],[42,k(133)],[39,k(180)]],[[54.6,86],[58,k(133)],[61,k(180)]]];
 case 2:return[[[45.6,86],[47,k(133)],[51.4,k(180)]],[[54.4,86],[55.4,k(133)],[56,k(180)]]];
 case 3:return[[[45.6,86],[44.2,128],[41,140]],[[54.4,86],[55.8,128],[59,140]]];
 case 4:return[[[45.6,86],[44.4,100],[43.4,146]],[[54.4,86],[55.6,100],[56.6,146]]];
 case 5:return[[[45.4,86],[44.8,k(133)],[44.8,k(180)]],[[54.6,86],[63,116],[72,134]]];
 default:return[[[45.6,86],[45.4,k(133)],[45.8,k(180)]],[[54.4,86],[54.6,k(133)],[54.2,k(180)]]]}}
// 16 poses (same order & names as the CD Cover Studio pose list): [headTilt, leftArm[a1,a2], rightArm[a1,a2], legStance, gesture, prop]
const NPOSE=[[0,[-12,-6],[12,6],0],[4,[-12,-6],[118,172],0,'wave'],[0,[-12,-6],[28,208],0,'peace'],[0,[-16,108],[16,-108],0,'heart'],[0,[-12,-6],[60,92],1,'point'],[0,[-38,52],[38,-52],1],[0,[-12,-6],[152,178],0],[-9,[-8,52],[8,-52],2],[4,[-10,-2],[22,-38],2],[9,[-6,28],[22,-34],2],[0,[-6,18],[6,-18],4],[0,[-8,22],[8,-22],3],[-6,[-128,-160],[58,28],5],[0,[-12,-6],[26,-158],0,'',1],[3,[-28,-20],[30,-150],2,'kiss'],[0,[-118,-122],[118,122],1]];

// ---- outfits: 7 designs (indices match the saved outfit / costume data) --------------
// Each returns layer strings + descriptors used by the body renderer.
function outfit(o,C,id,D){const ln=`stroke="${C.ln}" stroke-width=".38" stroke-linejoin="round"`,wl=`stroke="${C.wl}" stroke-width=".32"`;
 const clipT=(inner,sx=1.04)=>`<g clip-path="url(#${id}tc)">${inner}</g>`;
 const top=(fill,hem,sx=1.04,extra='')=>`<clipPath id="${id}tc"><path d="${torsoD}" transform="translate(50 0) scale(${sx} 1) translate(-50 0)"/></clipPath>`+clipT(`<rect x="20" y="40" width="60" height="${hem-40}" fill="${fill}"/><path d="M58 46L68 50L66 ${hem}L58 ${hem}Z" fill="#000" opacity=".07"/>${extra}`)+clipT(`<path d="${torsoD}" fill="none" ${ln} transform="translate(50 0) scale(${sx} 1) translate(-50 0)"/>`.replace('<path',`<path clip-path="url(#${id}hm)"`))+`<clipPath id="${id}hm"><rect x="0" y="0" width="100" height="${hem}"/></clipPath>`;
 const frills=(x0,x1,y,n,r,f,st)=>{let s='';for(let i=0;i<n;i++){const x=x0+(x1-x0)*(i+.5)/n,yy=y+Math.sin(i/(n-1||1)*Math.PI)*r*.6;s+=`<path d="M${N2(x-(x1-x0)/n/2)} ${N2(yy)}q${N2((x1-x0)/n/2)} ${N2(r*1.5)} ${N2((x1-x0)/n)} 0" fill="${f}" ${st}/>`}return s};
 const pleats=(x0,x1,yT,xb0,xb1,yB,n,c)=>{let s='';for(let i=1;i<n;i++)s+=`<path d="M${N2(x0+(x1-x0)*i/n)} ${yT}L${N2(xb0+(xb1-xb0)*i/n)} ${yB}" stroke="${c}" stroke-width=".35"/>`;return s};
 const bow=(x,y,s,f,l,tails=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0C-3 -4 -8 -3 -7.2 .6C-6.4 3.6 -2.6 2.2 0 0ZM0 0C3 -4 8 -3 7.2 .6C6.4 3.6 2.6 2.2 0 0Z" fill="${f}" stroke="${l}" stroke-width=".5"/>${tails?`<path d="M-.8 .6L-3.6 8L-1.2 6.8L0 8.4L1.2 6.8L3.6 8L.8 .6Z" fill="${f}" stroke="${l}" stroke-width=".45"/>`:''}<ellipse rx="1.5" ry="1.7" fill="${mixc(f,'#fff',.35)}" stroke="${l}" stroke-width=".4"/></g>`;
 switch(o){
 case 0:// Casual hoodie: oversized hoodie, denim mini skirt, knee socks, sneakers
  return{under:`<path d="M41.6 82L58.4 82L61.6 97Q50 99.4 38.4 97Z" fill="#7b8fc4" ${ln}/><path d="M50 82.4V94" stroke="#55689d" stroke-width=".4"/><path d="M41.2 85L58.8 85" stroke="#9fb0de" stroke-width=".4" stroke-dasharray="1 .6"/>`,
   top:top(C.c1,87,1.12,`<path d="M42 47L50 55L58 47L56 45.6L50 51L44 45.6Z" fill="${C.c2}"/><path d="M46.4 53L46 62M53.6 53L54 62" stroke="#fff" stroke-width=".6"/><circle cx="46" cy="62.4" r=".7" fill="#fff"/><circle cx="54" cy="62.4" r=".7" fill="#fff"/><path d="M41 72L59 72L58 80L42 80Z" fill="${C.c2}" opacity=".55"/><path d="M38 84Q50 86.6 62 84" stroke="${C.c2}" stroke-width="2.4" fill="none"/><path d="M48 66l1 -1.6 1 1.6 1-1.6 1 1.6" stroke="${C.dk}" stroke-width=".4" fill="none" opacity=".5"/>`),
   hood:`<path d="M38.6 49C40 44 46 42.4 50 42.4C54 42.4 60 44 61.4 49L57 50Q50 46.6 43 50Z" fill="${C.c2}" ${ln}/>`,
   sleeve:'long',sc:C.c1,cuff:C.c2,leg:{t:'sock',c:'#fff',from:.6,stripe:C.c2},shoe:{t:'sneaker',c:'#fff',a:C.c2}};
 case 1:// School / sailor uniform
  {const sc=hslx(C.h,44,32);return{under:`<path d="M42.4 71L57.6 71L65.6 99Q50 103 34.4 99Z" fill="${sc}" ${ln}/>`+pleats(42.4,57.6,71,34.4,65.6,99.6,8,mixc(sc,'#000',.3))+`<path d="M34.6 98.2Q50 102.2 65.4 98.2" stroke="#fff" stroke-width=".55" fill="none"/>`,
   top:top('#fffefb',73,1.05,`<path d="M58 46L68 52L66 73L58 73Z" fill="#a9b6d8" opacity=".18"/>`),
   collar:`<path d="M42.6 47.4L50 60L57.4 47.4L65.4 51.4L61 57.6L50 62.4L39 57.6L34.6 51.4Z" fill="${sc}" ${ln}/><path d="M36 52.2L40 56.6L50 61L60 56.6L64 52.2" stroke="#fff" stroke-width=".55" fill="none"/>${bow(50,59.6,1,hslx(C.h+180,70,62),hslx(C.h+180,50,40))}`,
   sleeve:'long',sc:'#fffefb',cuff:sc,leg:{t:'sock',c:mixc(sc,'#222',.3),from:.56},shoe:{t:'loafer',c:'#4a3438'}}}
 case 2:// Debut costume: white ruffle dress, pearls, plaid ribbon, tiered lace skirt
  return{under:`<defs>${plaidDef(id,C)}</defs><path d="M40 71L60 71L72.6 100Q50 106 27.4 100Z" fill="#fffdfb" stroke="#dcd1e2" stroke-width=".4"/><path d="M28.4 99Q50 105 71.6 99L74 104Q50 111 26 104Z" fill="url(#${id}pl)" ${ln}/>`+frills(25.6,74.4,104,12,2.4,'#fff',wl),
   top:top('#fffdfb',73,1.04,`<path d="M42 72L58 72L58 75L42 75Z" fill="${C.c2}"/>${[...Array(9)].map((_,i)=>`<circle cx="${N2(43.2+i*1.7)}" cy="${N2(50.6+Math.sin(i/8*Math.PI)*2)}" r=".9" fill="${C.pearl}" stroke="#e0d0d8" stroke-width=".25"/>`).join('')}<path d="M44 64Q50 66 56 64" stroke="#e4d8e8" stroke-width=".45" fill="none"/><path d="M44 68Q50 70 56 68" stroke="#e4d8e8" stroke-width=".45" fill="none"/>`),
   collar:bow(50,57,.9,`url(#${id}pl)`,C.ln)+`<circle cx="50" cy="57" r="1.1" fill="${C.g}" stroke="${C.gl}" stroke-width=".3"/>`,
   sleeve:'puff',sc:'#fffdfb',cuff:'#fff',leg:{t:'boot',c:'#fffdfb',from:.6,lace:C.c2},shoe:{t:'boot',c:'#fffdfb'},glove:'#fff'};
 case 3:// Stage costume: marching jacket, gold braid & epaulettes, plaid pleats, tall boots
  return{under:`<defs>${plaidDef(id,C)}</defs><path d="M41.6 72L58.4 72L68 99Q50 103.4 32 99Z" fill="url(#${id}pl)" ${ln}/>`+pleats(41.6,58.4,72,32,68,100,7,C.dk)+frills(31,69,99.4,10,2,'#fff',wl),
   top:top(C.c2,75,1.06,`<path d="M47 47L50 52L53 47L52.4 75L47.6 75Z" fill="#fffdfb"/><path d="M47 47L47.6 75M53 47L52.4 75" stroke="${C.g}" stroke-width=".9"/>${[56,61,66,71].map(y=>`<circle cx="45.6" cy="${y}" r=".75" fill="${C.g}" stroke="${C.gl}" stroke-width=".25"/><circle cx="54.4" cy="${y}" r=".75" fill="${C.g}" stroke="${C.gl}" stroke-width=".25"/><path d="M45.6 ${y}H38.6M54.4 ${y}H61.4" stroke="${C.g}" stroke-width=".45" opacity=".8"/>`).join('')}<path d="M40 74.6H60" stroke="${C.g}" stroke-width="1.2"/>`),
   collar:`<path d="M33.6 52.4Q36 49.4 41 49.6L40 54.4Q36.4 53.6 33.6 55.6Z" fill="${C.g}" stroke="${C.gl}" stroke-width=".35"/><path d="M66.4 52.4Q64 49.4 59 49.6L60 54.4Q63.6 53.6 66.4 55.6Z" fill="${C.g}" stroke="${C.gl}" stroke-width=".35"/>${[0,1,2,3].map(i=>`<path d="M${34.4+i*1.4} ${55.4-i*.3}l-.2 2.2M${65.6-i*1.4} ${55.4-i*.3}l.2 2.2" stroke="${C.g}" stroke-width=".4"/>`).join('')}<path d="M48.4 49.6l1.6 2 1.6-2 -1.6 2.6z" fill="#a8d8ff" stroke="${C.gl}" stroke-width=".3"/>`,
   sleeve:'long',sc:C.c2,cuff:C.g,leg:{t:'boot',c:C.dk,from:.52,lace:C.g},shoe:{t:'boot',c:C.dk},glove:'#fff'};
 case 4:// Summer / sporty: sleeveless top, flower-print flare skirt, ankle socks, sneakers
  {const fl=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})">${[0,72,144,216,288].map(r=>`<ellipse cy="-1.5" rx="1.1" ry="1.6" fill="#fff" transform="rotate(${r})"/>`).join('')}<circle r=".8" fill="#ffd96a"/></g>`;
  return{under:`<path d="M42 72L58 72L70 99Q50 104 30 99Z" fill="${C.c3}" ${ln}/>${[[40,82,1],[55,88,1.1],[47,95,1],[62,97,.9],[35,96,.9],[51,79,.8]].map(([x,y,s])=>fl(x,y,s).replace(/#fff"/g,C.c2+'"')).join('')}<path d="M42 72.6L58 72.6" stroke="${C.c2}" stroke-width="1.8"/>`,
   top:top('#fffefb',73,1.02,`<path d="M40 64L60 64L60 73L40 73Z" fill="${C.c2}" opacity=".9"/><path d="M40 64L60 64" stroke="#fff" stroke-width=".8"/>${fl(50,58,1.1).replace(/#fff"/g,C.c2+'"')}`),
   neck:'tank',collar:`<path d="M43.4 47.2L44.6 52M56.6 47.2L55.4 52" stroke="${C.c2}" stroke-width="1.4"/>`,
   sleeve:'none',leg:{t:'sock',c:'#fff',from:.9},shoe:{t:'sneaker',c:'#fff',a:C.c2},band:C.c2}}
 case 5:// Cute idol dress: corset bodice, giant bow, petticoat tiers, puff sleeves, mary-janes
  return{under:`<path d="M39.6 70L60.4 70L77 103Q50 111 23 103Z" fill="${C.c3}" ${ln}/>`+frills(22,78,103,15,2.6,'#fff','stroke="#e8d7e4" stroke-width=".3"')+`<path d="M40.4 70L59.6 70L71.6 96Q50 102 28.4 96Z" fill="${C.c1}" ${ln}/>`+frills(27.6,72.4,96,12,2.2,C.c3,wl)+[[34,92],[42,95],[50,96],[58,95],[66,92]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".75" fill="#fff"/>`).join(''),
   top:top(C.c1,72,1.03,`<path d="M44 47.2C46 51.4 54 51.4 56 47.2L55 54Q50 56 45 54Z" fill="#fff" ${wl}/>`+frills(45,55,54,5,1.4,'#fff',wl)+`<path d="M45.6 60L54.4 60L53.4 72L46.6 72Z" fill="#fff" opacity=".9"/>${[62,65,68].map(y=>`<path d="M46.4 ${y}L53.6 ${y+1.8}M53.6 ${y}L46.4 ${y+1.8}" stroke="${C.c2}" stroke-width=".4"/>`).join('')}`),
   collar:bow(50,58,1.25,C.c2,C.ln)+`<path d="M50 56.4C49 55 47.4 56.4 50 58.6C52.6 56.4 51 55 50 56.4Z" fill="#ff8fb7"/>`,
   waist:bow(50,72,1.05,C.c2,C.ln,0),
   sleeve:'puff',sc:C.c1,cuff:'#fff',leg:{t:'sock',c:'#fff',from:.58,frill:1},shoe:{t:'mary',c:C.c2},glove:'#fff'};
 case 6:// Cool idol outfit: long-tail jacket, tie, belted shorts, tights, boots
  {const jk=C.dk;return{back:`<path d="M37.4 66L33 104L44 100L45 74ZM62.6 66L67 104L56 100L55 74Z" fill="${mixc(jk,'#000',.15)}" ${ln}/>`,
   under:`<path d="M41.4 76L58.6 76L60 90L51.6 90L50 86L48.4 90L40 90Z" fill="${mixc(jk,'#000',.25)}" ${ln}/><path d="M40.8 77.6H59.2" stroke="${C.g}" stroke-width=".8"/><path d="M44 78.6Q48 83 52 79.4" stroke="#cfd4dc" stroke-width=".35" fill="none"/>`,
   top:top(jk,78,1.07,`<path d="M45.6 47L50 58L54.4 47Z" fill="#fff"/><path d="M49.2 49.6H50.8L51.4 60L50 62L48.6 60Z" fill="${C.c2}" stroke="${C.ln}" stroke-width=".25"/><path d="M45.4 47L47.6 56L45 77M54.6 47L52.4 56L55 77" stroke="${mixc(jk,'#fff',.3)}" stroke-width=".5" fill="none"/>${[62,67,72].map(y=>`<circle cx="47.4" cy="${y}" r=".55" fill="#d6dbe6"/><circle cx="52.6" cy="${y}" r=".55" fill="#d6dbe6"/>`).join('')}<path d="M53.6 62Q58 66 61 63" stroke="${C.g}" stroke-width=".45" fill="none"/><path d="M38 52L44 50" stroke="${C.c2}" stroke-width=".7"/>`),
   sleeve:'long',sc:jk,cuff:C.c2,leg:{t:'tights',c:'#3a3346',over:{t:'boot',c:'#2b2433',from:.5,lace:C.g}},shoe:{t:'boot',c:'#2b2433'}}}}
 return outfit(0,C,id,D)}
const plaidDef=(id,C)=>`<pattern id="${id}pl" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="3" fill="${C.c2}"/><rect width="3" height="1" fill="${C.dk}" opacity=".4"/><rect width="1" height="3" fill="${C.dk}" opacity=".3"/><rect x="2" width=".3" height="3" fill="#fff" opacity=".55"/></pattern>`;

// ---- limbs ---------------------------------------------------------------------------
function armBuild(sh,a1,a2,sk,O,side){const[e1,e2]=ep(sh[0],sh[1],20.5,a1),[h1,h2]=ep(e1,e2,18.6,a2),J=[sh,[e1,e2],[h1,h2]],S=limbPts(J,armProf,12);
 const dx=h1-e1,dy=h2-e2,dl=Math.hypot(dx,dy)||1,hx_=h1+dx/dl*1.6,hy_=h2+dy/dl*1.6,ang=Math.atan2(dy,dx)*180/Math.PI-90;
 let s=`<path d="${limbPath(S)}" fill="${sk[0]}" stroke="${sk[2]}" stroke-width=".38"/><path d="M-1.9 -1.6C-2.7 .6 -2 3.6 0 3.9C2.1 3.7 2.7 .6 1.9 -1.6C1 -2.3 -1 -2.3 -1.9 -1.6Z" transform="translate(${N2(hx_)} ${N2(hy_)}) rotate(${N2(ang)})" fill="${O.glove||sk[0]}" stroke="${O.glove?'#ddd0e0':sk[2]}" stroke-width=".35"/>`;
 // glove frill (short glove)
 if(O.glove)s+=`<path d="${limbPath(S,.8,1,.25)}" fill="${O.glove}" stroke="#ddd0e0" stroke-width=".3"/>`;
 const sc=O.sc,sl=sc?mixc(sc,'#3a2a4a',.4):'';
 if(O.sleeve=='long'){s+=`<path d="${limbPath(S,0,.86,.75)}" fill="${sc}" stroke="${sl}" stroke-width=".38"/>`;const c=S.find(q=>q.t>=.83)||S[S.length-2];s+=`<ellipse cx="${N2(c.p[0])}" cy="${N2(c.p[1])}" rx="2.8" ry="1.4" fill="${O.cuff||sc}" stroke="${sl}" stroke-width=".3" transform="rotate(${N2(-a2)} ${N2(c.p[0])} ${N2(c.p[1])})"/>`}
 else if(O.sleeve=='puff'){const c=S.find(q=>q.t>=.08);s+=`<ellipse cx="${N2(c.p[0])}" cy="${N2(c.p[1])}" rx="5" ry="5.6" fill="${sc}" stroke="${sl}" stroke-width=".38" transform="rotate(${N2(-a1)} ${N2(c.p[0])} ${N2(c.p[1])})"/><path d="M${N2(c.p[0]-3.4)} ${N2(c.p[1]+1.6)}q3.4 1.8 6.8 0" stroke="${O.cuff||'#fff'}" stroke-width=".9" fill="none" transform="rotate(${N2(-a1)} ${N2(c.p[0])} ${N2(c.p[1])})"/>`}
 return{s,h:[hx_,hy_],e:[e1,e2]}}
function legBuild(J,sk,O,side,leftFoot){const S=limbPts(J,legProf,14),L=O.leg||{};let s='';
 const lay=(spec)=>{if(!spec)return'';let r='';const ln=mixc(spec.c,'#3a2a4a',.45);
  if(spec.t=='tights')r+=`<path d="${limbPath(S,0,1,.08)}" fill="${spec.c}" stroke="${ln}" stroke-width=".3" opacity=".92"/>`;
  else{const f=spec.from||.6;r+=`<path d="${limbPath(S,f,1,spec.t=='boot'?.55:.18)}" fill="${spec.c}" stroke="${ln}" stroke-width=".35"/>`;const top=S.find(q=>q.t>=f)||S[0];
   r+=`<path d="M${N2(top.p[0]-top.w/2-(spec.t=='boot'?.6:.2))} ${N2(top.p[1])}q${N2(top.w/2+.4)} ${spec.t=='boot'?1.4:.9} ${N2(top.w+(spec.t=='boot'?1.2:.4))} 0" stroke="${spec.frill?'#fff':spec.lace||spec.stripe||ln}" stroke-width="${spec.frill?1.4:.6}" fill="none"/>`;
   if(spec.stripe)r+=`<path d="M${N2(top.p[0]-top.w/2)} ${N2(top.p[1]+2)}h${N2(top.w)}" stroke="${spec.stripe}" stroke-width=".7"/>`;
   if(spec.lace&&spec.t=='boot')for(let k=1;k<5;k++){const q=S.find(z=>z.t>=f+(1-f)*k/5.6);if(q)s+='',r+=`<path d="M${N2(q.p[0]-1.4)} ${N2(q.p[1])}l2.8 1M${N2(q.p[0]+1.4)} ${N2(q.p[1])}l-2.8 1" stroke="${spec.lace}" stroke-width=".35"/>`}}
  return r+(spec.over?lay(spec.over):'')};
 s+=`<path d="${limbPath(S)}" fill="${sk[0]}" stroke="${sk[2]}" stroke-width=".38"/><path d="${limbPath(S,.5,.56,-.6)}" fill="${sk[1]}" opacity=".5"/>`+lay(L);
 // shoe
 const A=J[2],K=J[1],dir=Math.atan2(A[1]-K[1],A[0]-K[0])*180/Math.PI-90,sh=O.shoe||{t:'sneaker',c:'#fff'},sc=sh.c,sl=mixc(sc,'#3a2a3a',.45);
 let shoe='';if(sh.t=='boot')shoe=`<path d="M-2.6 -1L2.6 -1L3.4 4.6Q3.6 7 1.2 7L-1.8 7Q-3.8 7 -3.4 4.6Z" fill="${sc}" stroke="${sl}" stroke-width=".38"/><path d="M-3 6.6H3.2" stroke="${sl}" stroke-width=".7"/>`;
 else if(sh.t=='mary')shoe=`<path d="M-2.4 0L2.4 0L3.2 4.6Q3.4 6.6 1.2 6.6L-1.6 6.6Q-3.6 6.6 -3.2 4.6Z" fill="${sc}" stroke="${sl}" stroke-width=".38"/><path d="M-2.4 2.2H2.6" stroke="${sl}" stroke-width=".6"/><circle cx="${leftFoot?-1.6:1.6}" cy="2.2" r=".5" fill="#fff"/>`;
 else if(sh.t=='loafer')shoe=`<path d="M-2.4 0L2.4 0L3.2 4.4Q3.4 6.6 1 6.6L-1.6 6.6Q-3.6 6.6 -3.2 4.4Z" fill="${sc}" stroke="${sl}" stroke-width=".38"/><path d="M-1.6 2.4h3.2" stroke="#ffffff55" stroke-width=".5"/>`;
 else shoe=`<path d="M-2.6 -.2L2.6 -.2L3.6 4.4Q3.8 6.8 1.2 6.8L-1.8 6.8Q-4 6.8 -3.6 4.4Z" fill="${sc}" stroke="${sl}" stroke-width=".38"/><path d="M-3.5 5.4H3.6" stroke="${sh.a||'#cfd4dc'}" stroke-width=".9"/><path d="M-1.4 1.6l2.8 .8M-1.4 2.8l2.8 .8" stroke="${sh.a||'#cfd4dc'}" stroke-width=".35"/>`;
 s+=`<g transform="translate(${N2(A[0])} ${N2(A[1]-.6)}) rotate(${N2(dir*.6)})">${shoe}</g>`;
 return s}

// ---- full figure ---------------------------------------------------------------------
function bodyParts(m,a,pose,id,D,sk){const Pz=NPOSE[pose|0]||NPOSE[0],C=ocol(a),o=a.of|0,O=outfit(o,C,id,D);
 const LJ=legJ(Pz[3],D.lf);
 const legs=legBuild(LJ[0],sk,O,-1,1)+legBuild(LJ[1],sk,O,1,0);
 const neck=`<path d="M47 37L53 37L53.6 49.4L46.4 49.4Z" fill="${sk[0]}" stroke="${sk[2]}" stroke-width=".3"/><path d="M46.8 40.6Q50 45.4 53.2 40.6L53.4 45.4Q50 48.4 46.6 45.4Z" fill="${sk[1]}"/>`;
 const torsoSkin=`<path d="${torsoD}" fill="${sk[0]}" stroke="${sk[2]}" stroke-width=".38"/><path d="M45 49.6Q50 52 55 49.6" stroke="${sk[2]}" stroke-width=".3" fill="none" opacity=".5"/>`;
 const L=armBuild(SHL,Pz[1][0],Pz[1][1],sk,O,-1),R=armBuild(SHR,Pz[2][0],Pz[2][1],sk,O,1);
 let g='';const hR=R.h;
 if(Pz[4]=='wave')g=`<path d="M${N2(hR[0]+4)} ${N2(hR[1]-3)}q2 -2 4 0M${N2(hR[0]+5)} ${N2(hR[1]+1)}q2 -2 4 0" stroke="#f58fb5" stroke-width=".7" fill="none"/>`;
 if(Pz[4]=='peace')g=`<path d="M${N2(hR[0])} ${N2(hR[1])}l-1.4 -4.6M${N2(hR[0]+.6)} ${N2(hR[1])}l1.4 -4.6" stroke="${sk[0]}" stroke-width="1.3" stroke-linecap="round"/><path d="M${N2(hR[0])} ${N2(hR[1])}l-1.4 -4.6M${N2(hR[0]+.6)} ${N2(hR[1])}l1.4 -4.6" stroke="${sk[2]}" stroke-width=".25" stroke-linecap="round" opacity=".6"/>`;
 if(Pz[4]=='heart')g=`<path d="M50 70.6C45 65.4 46 61.4 50 64.4C54 61.4 55 65.4 50 70.6Z" fill="#ff7eaa" stroke="#fff" stroke-width=".6"/>`;
 if(Pz[4]=='point')g=`<path d="M${N2(hR[0])} ${N2(hR[1])}l5 -1" stroke="${sk[0]}" stroke-width="1.4" stroke-linecap="round"/>`;
 if(Pz[4]=='kiss')g=`<path d="M${N2(hR[0]+6)} ${N2(hR[1]-6)}c-3 -3 -1 -5 1 -3c2 -2 4 0 1 3l-1 1z" fill="#ff8fb7"/><path d="M${N2(hR[0]+11)} ${N2(hR[1]-12)}c-2 -2 -.6 -3.4.7 -2c1.4 -1.4 2.8 0 .7 2l-.7.7z" fill="#ffc2da"/>`;
 const cover=o==0||o==6,body=torsoSkin+(cover?(O.under||'')+(O.top||''):(O.top||'')+(O.under||''));
 return{Pz,O,C,legs,neck,torso:body,collar:(O.hood||'')+(O.collar||'')+(O.waist||''),under:'',back:O.back||'',arms:L.s+R.s,g,hR}}
function figBuild(m,l,id){const a={...ap(m),of:l.of,oh:l.oh,ac:l.ac},mm={...m,_x:1,ap:a},D=dz(m),sk=SKN[D.skin]||SKN[1];
 const H=headParts(mm,l.ex,id,{a}),B=bodyParts(m,a,l.pose,id,D,sk),tilt=B.Pz[0],HT=`translate(${HTX} ${HTY}) scale(${HK})`;
 const pr=(l.prop==1||B.Pz[5]==1)?`<g transform="translate(${N2(B.hR[0])} ${N2(B.hR[1])}) rotate(-20)"><rect x="-1.3" y="-9" width="2.6" height="10" rx="1.1" fill="#3b3346"/><circle cy="-10.4" r="2.9" fill="#d6dbe4" stroke="#8a8f9a" stroke-width=".45"/><path d="M-2 -11.4h4M-2 -9.6h4" stroke="#a7acb6" stroke-width=".35"/></g>`:l.prop==2?`<g transform="translate(${N2(B.hR[0])} ${N2(B.hR[1])}) rotate(-12)"><rect x="-.9" y="-20" width="1.8" height="21" rx=".9" fill="#ff9ec4"/><rect x="-1.4" y="-2" width="2.8" height="5" rx="1" fill="#555"/><circle cy="-20" r="2.2" fill="#fff6c0" opacity=".9"/></g>`:'';
 const ear=l.ear?`<circle cx="22" cy="65" r="1.8" fill="#ffd966"/><circle cx="78" cy="65" r="1.8" fill="#ffd966"/>`:'',nk=l.neck?`<path d="M46 49.6Q50 54.6 54 49.6" stroke="#ffd966" stroke-width=".8" fill="none"/><circle cx="50" cy="53" r="1.2" fill="#ff7eb6"/>`:'';
 const headBack=`<g transform="rotate(${tilt} 50 44)"><g transform="${HT}">${H.back}</g></g>`,headFront=`<g transform="rotate(${tilt} 50 44)"><g transform="${HT}">${H.face.replace(/<path d="M44\.6 70[^>]*\/><path d="M44\.4 79[^>]*\/>/,'')}${H.feat}${H.brow}${H.sl}${H.bangs}${H.acc}${H.ties}${ear}</g></g>`,headOver=H.over?`<g transform="rotate(${tilt} 50 44)"><g transform="${HT}">${H.over}</g></g>`:'';
 return`<defs>${H.defs}</defs>${headBack}${B.back}${B.legs}${B.under}${B.neck}${B.torso}${B.collar}${nk}${headFront}${headOver}${B.arms}${B.g}${pr}`}
function fig(m,l){const a={...ap(m),of:l.of,oh:l.oh,ac:l.ac},k=JSON.stringify(['f3',m.id|0,m.hue|0,a,l.pose|0,l.prop|0,l.ear|0,l.neck|0,l.ex==null?'':l.ex]);let t=ART.cache.get(k);if(!t){t=figBuild(m,l,'§');if(ART.cache.size>3000)ART.cache.clear();ART.cache.set(k,t)}return t.split('§').join('f'+(++PTC[0]))}

// ---- portrait (bust): same head + the same costume body, magnified --------------------
function ptBuild(m,s,nb,vb,ex,id){const H=headParts(m,ex,id),a=H.a,h=m.hue|0,D=H.D,sk=H.sk,B=bodyParts(m,a,0,id+'b',D,sk),inv=1/HK;
 const c1=m.bgc?tint(m.bgc,.2):hslx(h,80,94),c2=m.bgc?tint(m.bgc,.5):hslx(h+50,70,86);
 const bgd=nb?'':`<linearGradient id="${id}bg" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><radialGradient id="${id}bk"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
 const bg=nb?'':`<rect width="100" height="120" fill="url(#${id}bg)"/><circle cx="76" cy="30" r="30" fill="url(#${id}bk)" opacity=".55"/><circle cx="16" cy="96" r="18" fill="url(#${id}bk)" opacity=".4"/><g fill="#fff" opacity=".8"><path d="M13 18l1.5 3.7 3.7 1.5-3.7 1.5-1.5 3.7-1.5-3.7-3.7-1.5 3.7-1.5z"/><path d="M88 80l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z"/><circle cx="84" cy="14" r="1.2"/><circle cx="22" cy="40" r=".9"/></g><path d="M0 108Q50 98 100 108V120H0Z" fill="#fff" opacity=".18"/>`;
 const body=`<g transform="scale(${N2(inv)}) translate(${-HTX} ${-HTY})">${B.back}${B.under}${B.neck}${B.torso}${B.collar}</g>`,arms=`<g transform="scale(${N2(inv)}) translate(${-HTX} ${-HTY})">${B.arms}</g>`;
 return`<svg viewBox="${vb||'0 0 100 120'}" ${s?`width="${s}"`:''} overflow="hidden" xmlns="http://www.w3.org/2000/svg"><defs>${H.defs}${bgd}<clipPath id="${id}fr"><rect width="100" height="120"/></clipPath></defs><g clip-path="url(#${id}fr)">${bg}${H.back}${body}${arms}${H.face.replace(/<path d="M44\.6 70[^>]*\/><path d="M44\.4 79[^>]*\/>/,'')}${H.feat}${H.brow}${H.sl}${H.bangs}${H.acc}${H.ties}${H.over}</g></svg>`}
function pt(m,s,nb,vb,ex){const a=apEff(m),k=JSON.stringify(['p3',m.id|0,m.hue|0,a,m.bgc||0,s||0,nb?1:0,vb||0,ex==null?'':ex]);let t=ART.cache.get(k);if(!t){t=ptBuild(m,s,nb,vb,ex,'§');if(ART.cache.size>3000)ART.cache.clear();ART.cache.set(k,t)}return t.split('§').join('p'+(++PTC[0]))}

// ---- asset registry: one entry per member ID, every screen draws from it ---------------
const CHAR_ASSETS={
 portrait:(m,s,ex)=>pt(m,s,0,null,ex),
 bust:(m,s,ex)=>pt(m,s,1,null,ex),
 face:(m,s,ex)=>pt(m,s,0,'16 26 68 62',ex),
 half:(m,w,ex,pose=0)=>{const e=apEff(m),a=ap(m);return`<svg viewBox="18 0 64 88" ${w?`width="${w}"`:''} class="chh" xmlns="http://www.w3.org/2000/svg">${fig(m,{pose,of:e.of,oh:e.oh,ac:a.ac,ex})}</svg>`},
 full:(m,w,ex,pose=0,of)=>{const e=apEff(m),a=ap(m);return`<svg class="chf" viewBox="10 0 80 198" ${w?`width="${w}"`:''} role="img" aria-label="${esc(m.name||'Idol')}" xmlns="http://www.w3.org/2000/svg">${fig(m,{pose,of:of!=null?of[0]:e.of,oh:of!=null?of[1]:e.oh,ac:a.ac,ex})}</svg>`},
 entry:m=>({id:m.id,name:m.name,assets:{portrait:`char/${m.id}/portrait`,half:`char/${m.id}/half`,full:`char/${m.id}/full`,expressions:EXN.map((n,i)=>`char/${m.id}/expr/${i}`),costumes:OFN.map((n,i)=>`char/${m.id}/costume/${i}`)},design:{...ap(m),...dz(m)}})};
