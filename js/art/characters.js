// =====================================================================================
//  IDOLVERSE48: Select Bloom!  —  Character Art Engine v4 ("Bloom Idol")
// -------------------------------------------------------------------------------------
//  A from-scratch 2D anime idol illustration engine (SVG, drawn at runtime), modelled on
//  the project's art reference: clean thin line art, large glossy anime eyes, soft
//  voluminous hair with long side locks, slim long-legged idols in layered costumes.
//
//  Public contract (unchanged, so no game code changes):
//    pt(m, size, noBg, viewBox, expr)   -> <svg> portrait (bust)   frame 0..100 x 0..120
//    fig(m, layer)                      -> inner SVG full body     frame 0..100 x 0..200
//    CHAR_ASSETS.{portrait,bust,face,half,full,entry}, EXN, SKN, ART, NPOSE
//
//  Identity = the member's saved appearance record (m.ap) + stable traits from her member
//  ID. Nothing is random at draw time: the same idol looks the same on every screen.
// =====================================================================================

// ---- palette extensions (same entries & order: saved indices keep their meaning)
HC.push(['Ash blonde','#ddd2b0','#a99d78'],['White','#f7f5fa','#cdc8dd'],['Navy','#45558a','#27315c'],['Chestnut','#8f4c33','#5c2c1d'],['Lavender','#cdb6f2','#9a82cc']);
EC.push(['Amber','#a8650f','#ffd47a'],['Ruby','#a3293b','#ff9aa8'],['Teal','#17807f','#8ee6de'],['Violet gray','#5a4a6e','#c7b9dc']);
BKN.push('Hime cut','Wolf cut','Layered','Pixie');

const EXN=['Neutral','Happy','Smiling','Excited','Shy','Surprised','Sad','Determined','Confident','Embarrassed','Pouting','Cheerful'];
const MO2EX=[2,11,0,10,3];
const ART={v:4,cache:new Map()};
const SKN=[['#fff4ee','#fbdcd0','#d9a294'],['#ffefe6','#f8d3c2','#d39684'],['#fde6d6','#f2c6aa','#c98b6d'],['#f5d7bd','#e5b18e','#b47a5a'],['#e6c0a0','#cf9a74','#9c6a4a']];

// ---------------------------------------------------------------- colour helpers
const hx=h=>{h=String(h).replace('#','');if(h.length==3)h=h.split('').map(c=>c+c).join('');return[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)||0)};
const mixc=(a,b,t)=>{const A=hx(a),B=hx(b);return'#'+A.map((v,i)=>Math.max(0,Math.min(255,Math.round(v+(B[i]-v)*t))).toString(16).padStart(2,'0')).join('')};
const hslx=(h,s,l)=>{h=((h%360)+360)%360;s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return'#'+[f(0),f(8),f(4)].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('')};
const P_=(d,f,o='')=>`<path d="${d}" fill="${f}" ${o}/>`,mir=s=>`<g transform="translate(100 0) scale(-1 1)">${s}</g>`;
const N2=n=>Math.round(n*100)/100;

// ---------------------------------------------------------------- geometry helpers
function crSeg(P){let d='';for(let i=0;i<P.length-1;i++){const p0=P[i-1]||P[i],p1=P[i],p2=P[i+1],p3=P[i+2]||p2;
 const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];d+=`C${N2(c1[0])} ${N2(c1[1])} ${N2(c2[0])} ${N2(c2[1])} ${N2(p2[0])} ${N2(p2[1])}`}return d}
const crPath=(P,close)=>`M${N2(P[0][0])} ${N2(P[0][1])}`+crSeg(P)+(close?'Z':'');
function symShape(L){const R=[...L].reverse().map(([x,y])=>[100-x,y]);return crPath([...L,...R],1)}
function limbPts(J,prof,n=12){const seg=[];let tot=0;for(let i=0;i<J.length-1;i++){const l=Math.hypot(J[i+1][0]-J[i][0],J[i+1][1]-J[i][1]);seg.push(l);tot+=l}
 const out=[];for(let k=0;k<=n;k++){let t=k/n,d=t*tot,i=0;while(i<seg.length-1&&d>seg[i]){d-=seg[i];i++}const u=seg[i]?Math.min(1,d/seg[i]):0;out.push({p:[J[i][0]+(J[i+1][0]-J[i][0])*u,J[i][1]+(J[i+1][1]-J[i][1])*u],t,w:prof(t)})}return out}
function limbPath(S,t0=0,t1=1,grow=0,cap=1){const Q=S.filter(s=>s.t>=t0-1e-6&&s.t<=t1+1e-6);if(Q.length<2)return'';const L=[],R=[];
 Q.forEach((s,i)=>{const a=Q[Math.max(0,i-1)].p,b=Q[Math.min(Q.length-1,i+1)].p,dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,w=s.w/2+grow;L.push([s.p[0]+nx*w,s.p[1]+ny*w]);R.push([s.p[0]-nx*w,s.p[1]-ny*w])});
 const e=Q[Q.length-1],e2=Q[Q.length-2],ex=e.p[0]-e2.p[0],ey=e.p[1]-e2.p[1],el=Math.hypot(ex,ey)||1,s0=Q[0],s1=Q[1],sx=s0.p[0]-s1.p[0],sy=s0.p[1]-s1.p[1],sl=Math.hypot(sx,sy)||1;
 const ce=[e.p[0]+ex/el*(e.w/2+grow)*1.25*cap,e.p[1]+ey/el*(e.w/2+grow)*1.25*cap],cs=[s0.p[0]+sx/sl*(s0.w/2+grow)*1.1,s0.p[1]+sy/sl*(s0.w/2+grow)*1.1],RR=[...R].reverse();
 return crPath(L)+`Q${N2(ce[0])} ${N2(ce[1])} ${N2(RR[0][0])} ${N2(RR[0][1])}`+crSeg(RR)+`Q${N2(cs[0])} ${N2(cs[1])} ${N2(L[0][0])} ${N2(L[0][1])}Z`}
const rad=d=>d*Math.PI/180,ep=(x,y,L,ang)=>[+(x+L*Math.sin(rad(ang))).toFixed(2),+(y+L*Math.cos(rad(ang))).toFixed(2)];
// anime hair clump edge: alternating notch / tip points -> soft rounded clumps with sharp tips
function clumpEdge(pts){let d='';for(let i=1;i<pts.length;i++){const P=pts[i-1],Q=pts[i],tp=Q[2]=='t';
 if(tp)d+=`C${N2(P[0]+(Q[0]-P[0])*.04)} ${N2(P[1]+(Q[1]-P[1])*.7)} ${N2(Q[0]+(P[0]-Q[0])*.4)} ${N2(Q[1]-(Q[1]-P[1])*.12)} ${N2(Q[0])} ${N2(Q[1])}`;
 else d+=`C${N2(P[0]+(Q[0]-P[0])*.4)} ${N2(P[1]-(P[1]-Q[1])*.12)} ${N2(Q[0]+(P[0]-Q[0])*.04)} ${N2(Q[1]+(P[1]-Q[1])*.7)} ${N2(Q[0])} ${N2(Q[1])}`}return d}
// row of hanging hair tips across the bottom of a hair mass, right -> left
function tipsRow(x0,x1,y,n,dp,seed,curve=0){const r=mulb(seed),P=[[x0,y-dp*.2]];for(let i=0;i<n;i++){const t=(i+.5)/n,t2=(i+1)/n,xa=x0+(x1-x0)*t,xb=x0+(x1-x0)*t2,arc=Math.sin(t*Math.PI)*curve;P.push([xa+(r()-.5)*2,y+arc+dp*(.7+r()*.5),'t']);if(i<n-1)P.push([xb,y+Math.sin(t2*Math.PI)*curve-dp*(.15+r()*.3)])}P.push([x1,y-dp*.2]);return P}

// ---------------------------------------------------------------- stable per-ID design traits
function dz(m){const r=mulb(((m.id|0)+1)*9973+((m.hue|0)*7)),p=()=>r();const sk=p();
 return{face:Math.floor(p()*4),es:.96+p()*.1,lash:Math.floor(p()*3),nose:Math.floor(p()*2),
  skin:m.ap&&m.ap.sk!=null?m.ap.sk:sk<.32?0:sk<.68?1:sk<.86?2:sk<.96?3:4,
  lf:.97+p()*.06,er:p()<.35,mw:.92+p()*.18,sp:Math.round((p()-.5)*2*10)/10,blush:.45+p()*.3,
  mole:p()<.12?(p()<.5?1:2):0,hl:Math.floor(p()*3),ahoge:p()<.4?1+Math.floor(p()*2):0,
  fr:p()<.08,pupil:p()<.1?1:0,rib:Math.floor(p()*360),ring:.5+p()*.3,vol:p()*4-1,wrist:p()<.6,bl:p()<.5}}

function ocol(a){const h=a.oh|0;return{h,c1:hslx(h,78,88),c2:hslx(h,62,72),c3:hslx(h,50,58),c4:hslx(h+25,72,92),dk:hslx(h,42,32),ln:hslx(h,30,44),w:'#fffefc',wl:'#d8cede',g:'#efcf7c',gl:'#b88f35'}}

// =====================================================================================
//  HEAD (frame 0..100 x 0..120): crown y4, brows y46, eyes y61, mouth y76, chin y85
// =====================================================================================
const FACES=[[60,12,85],[58,9.5,86],[57,7,86.5],[62,13.5,84]];
const facePath=f=>{const[cy,cw,ch]=FACES[f]||FACES[0];return`M21.6 46C21.4 ${cy} ${50-cw-11} ${ch-7} ${50-cw*.4} ${ch-1}Q50 ${ch+.8} ${50+cw*.4} ${ch-1}C${50+cw+11} ${ch-7} 78.6 ${cy} 78.4 46C78.4 27 66 18 50 18C34 18 21.6 27 21.6 46Z`};

// ---- back hair silhouettes ---------------------------------------------------------
function longBack(len,fl,seed,wave=0,n=8,dp=6){const w=wave?(i)=>Math.sin(i*1.7)*wave:()=>0;
 const R=[[50,3.6],[74,6],[87,22],[89,44],[89.5+fl*.3+w(1),66],[89+fl*.65+w(2),(66+len)/2],[87+fl+w(3),len-4]];
 const L=[...R].reverse().map(([x,y])=>[100-x,y]);
 return crPath(R)+clumpEdge(tipsRow(R[R.length-1][0],L[0][0],len-4,n,dp,seed,4))+crSeg(L)+'Z'}
function backHair(bk,D,seed){const v=D.vol;switch(bk){
 case 0:return{b:`M50 3.6C73 3.6 88 20 88 42C88 58 90 70 86 82`+clumpEdge(tipsRow(86,14,82,6,3.6,seed,3))+`C10 70 12 58 12 42C12 20 27 3.6 50 3.6Z`,sk:0,s:84};
 case 1:return{b:longBack(110+v,1,seed),sk:1,s:112};
 case 2:return{b:longBack(162+v*2,3,seed),sk:1,s:140};
 case 3:return{b:longBack(152,6,seed,3,7,8),sk:2,s:132};
 case 4:{let c='';[[12,70],[9,90],[11,110],[9,130],[14,146],[88,70],[91,90],[89,110],[91,130],[86,146],[26,152],[74,152],[39,156],[61,156],[50,157]].forEach(([x,y])=>c+=`M${x+9.5} ${y}a9.5 9.5 0 1 0 0 .1Z`);
  return{b:`M50 3.6C73 3.6 88 20 88 44C92 74 92 116 88 146L12 146C8 116 8 74 12 44C12 20 27 3.6 50 3.6Z`+c,curl:1,sk:2,s:120}}
 case 5:return{b:`M50 5C72 5 86 21 86 44C86 58 82 68 76 74L24 74C18 68 14 58 14 44C14 21 28 5 50 5Z`,tails:[[[62,9],[80,-2],[97,24],[98,70],[92,118],[86,150],13,3]],tie:[[63,10]],sk:0,s:76,ears:1};
 case 6:return{b:`M50 4C73 4 88 20 88 44C88 60 85 74 78 82L22 82C15 74 12 60 12 44C12 20 27 4 50 4Z`,ftails:[[[30,80],[20,96],[20,122],[24,146],[22,162],10,3]],tie:[[30,82]],sk:0,s:76};
 case 7:return{b:`M50 4C73 4 88 20 88 44C88 60 85 72 78 80L22 80C15 72 12 60 12 44C12 20 27 4 50 4Z`,tails:[[[80,28],[98,32],[103,70],[97,112],[92,148],12,3]],tie:[[81,29]],sk:1,s:100};
 case 8:return{b:`M50 4C73 4 88 20 88 44C88 60 85 72 78 80L22 80C15 72 12 60 12 44C12 20 27 4 50 4Z`,tails:[[[19,25],[-2,30],[-6,76],[0,122],[-2,164],13,3],[[81,25],[102,30],[106,76],[100,122],[102,164],13,3]],tie:[[19,26],[81,26]],sk:1,s:96};
 case 9:return{b:`M50 4C73 4 88 20 88 44C88 60 85 74 78 82L22 82C15 74 12 60 12 44C12 20 27 4 50 4Z`,braid:[30,80,24,156],tie:[[24,152]],sk:0,s:78};
 case 10:return{b:`M50 5C72 5 86 21 86 44C86 58 82 68 76 74L24 74C18 68 14 58 14 44C14 21 28 5 50 5Z`,bun:1,sk:0,s:76,ears:1};
 case 11:return{b:longBack(154,2,seed),top:1,sk:1,s:128};
 case 12:return{b:longBack(164,1,seed,0,9,4),sk:3,s:86};
 case 13:return{b:`M50 3.6C73 3.6 88 20 88 42C90 56 94 66 98 76L89 78L95 90L84 87L88 99L77 92L73 100L68 91L32 91L27 100L23 92L12 99L16 87L5 90L11 78L2 76C6 66 10 56 12 42C12 20 27 3.6 50 3.6Z`,sk:4,s:98};
 case 14:return{b:`M50 3.6C73 3.6 88 20 88 44C90 62 93 76 91 92L96 102L88 103L93 120L84 117L86 136`+clumpEdge(tipsRow(86,14,136,5,6,seed,3))+`L16 117L7 120L12 103L4 102L9 92C7 76 10 62 12 44C12 20 27 3.6 50 3.6Z`,sk:2,s:118,layer:1};
 case 15:return{b:`M50 5C71 5 85 21 85 44C85 54 84 60 81 65L19 65C16 60 15 54 15 44C15 21 29 5 50 5Z`,sk:5,s:64,ears:1};
 default:return backHair(2,D,seed)}}
// long locks in front of the face sides / shoulders (pairs)
function sideLocks(kind,len,seed){const r=mulb(seed+7),j=()=>(r()-.5)*2,lock=(P,w0,w1)=>`<path d="${limbPath(limbPts(P,t=>w0+(w1-w0)*Math.pow(t,1.1),14),0,1,0,.6)}"/>`;
 const pair=s=>s+mir(s);
 if(kind==0)return pair(lock([[21,40],[17.6,56],[17.4,70],[19.6,82+j()]],8.6,1.2));
 if(kind==3)return pair(`<path d="M15.6 40C14.6 56 15 70 16 86L27.4 86C26 70 25.4 56 26.6 42Z"/>`);
 if(kind==5)return pair(lock([[21,42],[18.6,54],[19.8,66]],7,1));
 if(kind==4)return pair(lock([[21,40],[15,60],[11,80],[12,94+j()*2]],9,1)+lock([[24,48],[21,66],[20,82]],5,1));
 if(kind==2)return pair(lock([[21,40],[15,58],[17,76],[12,94],[16,112],[12,len]],9.6,1.4));
 return pair(lock([[21,40],[16.4,58],[15.4,80],[16.4,len*.75],[18.4,len]],9.6,1.4))}

// ---- bangs: hand-designed edges (right temple -> left temple), 't' marks a tip ------
const BANGS=[
 /*0 No bangs*/   {e:[[84,64,'t'],[81,42],[72,28],[60,23],[51,26],[49,26],[40,23],[28,28],[19,42],[16,64,'t']],part:1},
 /*1 Middle*/     {e:[[85,66,'t'],[80,44],[75,56,'t'],[69,38],[64,51,'t'],[58,32],[53,46,'t'],[50,25],[47,46,'t'],[42,32],[36,51,'t'],[31,38],[25,56,'t'],[20,44],[15,66,'t']]},
 /*2 Side L*/     {e:[[85,68,'t'],[80,46],[77,57,'t'],[72,40],[68,53,'t'],[62,36],[57,50,'t'],[51,33],[45,49,'t'],[39,30],[33,45,'t'],[30,28],[25,48,'t'],[21,40],[15,66,'t']]},
 null,
 /*4 Swept*/      {e:[[85,68,'t'],[81,44],[78,58,'t'],[73,38],[70,52,'t'],[64,34],[60,49,'t'],[54,31],[50,47,'t'],[44,29],[40,44,'t'],[35,29],[30,42,'t'],[25,34],[22,47,'t'],[19,42],[15,64,'t']]},
 /*5 Curtain*/    {e:[[85,66,'t'],[79,42],[73,54,'t'],[67,35],[61,46,'t'],[55,27],[50,30],[45,27],[39,46,'t'],[33,35],[27,54,'t'],[21,42],[15,66,'t']]},
 /*6 Wispy*/      {e:[[85,64,'t'],[81,44],[78,53,'t'],[74,43],[70,51,'t'],[66,42],[62,50,'t'],[58,41],[54,50,'t'],[50,41],[46,50,'t'],[42,41],[38,50,'t'],[34,42],[30,51,'t'],[26,43],[22,53,'t'],[19,44],[15,64,'t']],thin:1},
 /*7 Blunt*/      {e:[[85,66,'t'],[81,46],[77,50.5,'t'],[72,47.6],[67,50,'t'],[62,47.4],[57,50,'t'],[52,47.4],[47,50,'t'],[42,47.4],[37,50,'t'],[32,47.6],[27,50.5,'t'],[20,46],[15,66,'t']]},
 /*8 Asym*/       {e:[[85,64,'t'],[81,40],[76,46,'t'],[71,34],[66,42,'t'],[60,32],[55,46,'t'],[49,33],[44,52,'t'],[38,36],[32,56,'t'],[26,40],[21,58,'t'],[18,44],[15,66,'t']]},
 /*9 Short fringe*/{e:[[85,64,'t'],[80,40],[76,40,'t'],[71,34],[66,39,'t'],[61,33],[56,38,'t'],[51,33],[46,38,'t'],[41,33],[36,39,'t'],[30,34],[25,40,'t'],[20,40],[15,64,'t']]},
 /*10 Framing*/   {e:[[85,72,'t'],[80,42],[75,76,'t'],[70,34],[62,40,'t'],[56,25],[50,28],[44,25],[38,40,'t'],[30,34],[25,76,'t'],[20,42],[15,72,'t']],part:1}];
BANGS[3]={...BANGS[2],flip:1};
const CROWN='M50 6.6C73 6.6 88.6 21 87.6 46C87.4 54 86.4 60 85 66';
const bangD=F=>CROWN+clumpEdge(F.e)+'C13.6 60 12.6 54 12.4 46C11.4 21 27 6.6 50 6.6Z';

// ---- expressions ------------------------------------------------------------------
const EXS={0:{e:'o',bi:0,bo:0,mo:'flat',bl:0},1:{e:'h',bi:-1,bo:-1,mo:'open',bl:1},2:{e:'o',bi:-.6,bo:-.6,mo:'smile',bl:1},3:{e:'w',bi:-2,bo:-2,mo:'big',bl:1,x:'spark'},4:{e:'d',bi:-1.4,bo:1.2,mo:'shy',bl:2},5:{e:'s',bi:-3.4,bo:-3,mo:'o',bl:0,x:'exc'},6:{e:'sad',bi:-3,bo:2.2,mo:'sad',bl:0,x:'tear'},7:{e:'f',bi:2.2,bo:-1.4,mo:'firm',bl:0,x:'fire'},8:{e:'half',bi:.4,bo:-1.4,mo:'smirk',bl:1,x:'wink'},9:{e:'d',bi:-2,bo:1.6,mo:'wavy',bl:2,x:'sweat'},10:{e:'o',bi:1.2,bo:-.6,mo:'pout',bl:1,x:'puff'},11:{e:'h',bi:-1.4,bo:-1.4,mo:'big',bl:1,x:'note'}};
function exOf(m,ex){if(ex!=null&&ex!==''&&EXS[+ex])return+ex;const a=ap(m);return MO2EX[a.mo]??2}

// eye geometry: [halfWidth, height, outerTilt (neg = upturned), irisScale]
const EYG=[[10.4,17,-.4,1],[11,14.6,-2,.97],[11.4,12,-1.4,.94],[10.6,15,-3.6,.98],[10.4,15.6,2.6,1],[10.2,16,1.2,1]];
function eyes(a,D,X,ec,id,hb){const g=EYG[a.ey]||EYG[0],w=g[0]*D.es,h=g[1]*D.es,t=g[2],ir=g[3],y=61.5,lc=mixc('#2b1a26',hb[2],.2);let o='';
 const one=(c,d,k)=>{const st=X.e;
  if(st=='h'||(st=='half'&&k==1&&X.x=='wink')){return`<path d="M${N2(c-d*w*.85)} ${N2(y+1.5)}Q${N2(c)} ${N2(y-h*.62)} ${N2(c+d*w*.95)} ${N2(y+1+t*.3)}" stroke="${lc}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M${N2(c+d*w*.95)} ${N2(y+1+t*.3)}l${N2(d*2.4)} -1.4" stroke="${lc}" stroke-width="1.3" stroke-linecap="round"/>`}
  const op=st=='half'?.62:st=='d'?.8:st=='w'||st=='s'?1.08:st=='f'?.76:1,irs=st=='s'?.68:1,dy=st=='sad'?1:0;
  const ix=c-d*w*.86,iy=y+h*.02,ox=c+d*w,oy=y-h*.18+t,topY=y-h*.56*op+dy;
  const top=`M${N2(ix)} ${N2(iy)}C${N2(c-d*w*.8)} ${N2(topY-h*.02)} ${N2(c+d*w*.55)} ${N2(topY-h*.06+t*.4)} ${N2(ox)} ${N2(oy+(1-op)*h*.5)}`;
  const bot=`C${N2(c+d*w*.75)} ${N2(y+h*.42)} ${N2(c+d*w*.2)} ${N2(y+h*.56)} ${N2(c-d*w*.2)} ${N2(y+h*.54)}C${N2(c-d*w*.6)} ${N2(y+h*.5)} ${N2(ix-d*.6)} ${N2(y+h*.32)} ${N2(ix)} ${N2(iy)}Z`,cid=`${id}c${k}`;
  const icx=c+d*w*.04,icy=y+h*.04+(1-op)*h*.12,rx=w*.8*ir*irs,ry=h*.66*ir*irs,dk=mixc(ec[1],'#120818',.6);
  let s=`<clipPath id="${cid}"><path d="${top}${bot}"/></clipPath><path d="${top}${bot}" fill="#fff"/><g clip-path="url(#${cid})">`;
  s+=`<ellipse cx="${N2(icx)}" cy="${N2(icy)}" rx="${N2(rx)}" ry="${N2(ry)}" fill="url(#${id}ir)"/>`;
  s+=`<ellipse cx="${N2(icx)}" cy="${N2(icy-ry*.12)}" rx="${N2(rx*.46)}" ry="${N2(ry*.52)}" fill="${dk}" opacity=".85"/>`;
  if(D.pupil)s+=`<path d="M${N2(icx)} ${N2(icy-ry*.3)}l${N2(rx*.14)} ${N2(ry*.24)} ${N2(rx*.28)} 0-${N2(rx*.22)} ${N2(ry*.18)} ${N2(rx*.1)} ${N2(ry*.3)}-${N2(rx*.3)}-${N2(ry*.18)}-${N2(rx*.3)} ${N2(ry*.18)} ${N2(rx*.1)}-${N2(ry*.3)}-${N2(rx*.22)}-${N2(ry*.18)} ${N2(rx*.28)} 0z" fill="${mixc(ec[2],'#fff',.5)}" opacity=".9"/>`;
  s+=`<path d="M${N2(icx-rx*.82)} ${N2(icy+ry*.18)}Q${N2(icx)} ${N2(icy+ry*1.1)} ${N2(icx+rx*.82)} ${N2(icy+ry*.18)}Q${N2(icx)} ${N2(icy+ry*.62)} ${N2(icx-rx*.82)} ${N2(icy+ry*.18)}Z" fill="${mixc(ec[2],'#fff',.25)}" opacity=".9"/>`;
  s+=`<path d="${top}L${N2(ox)} ${N2(y-h*.12)}Q${N2(c)} ${N2(y-h*.3)} ${N2(ix)} ${N2(y-h*.08)}Z" fill="${dk}" opacity=".35"/>`;
  // highlights: light from the upper left on both eyes
  s+=`<ellipse cx="${N2(icx-rx*.36)}" cy="${N2(icy-ry*.42)}" rx="${N2(rx*.3)}" ry="${N2(ry*.24)}" fill="#fff"/><circle cx="${N2(icx+rx*.38)}" cy="${N2(icy+ry*.28)}" r="${N2(rx*.13)}" fill="#fff" opacity=".95"/>`;
  if(D.hl==1)s+=`<circle cx="${N2(icx+rx*.3)}" cy="${N2(icy-ry*.5)}" r="${N2(rx*.09)}" fill="#fff"/>`;
  if(D.hl==2||st=='w')s+=`<path d="M${N2(icx+rx*.28)} ${N2(icy-ry*.66)}l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5z" fill="#fff"/>`;
  s+=`</g>`;
  // upper lash: filled, thicker toward the outer corner, small wing
  const lw=[1.5,1.9,2.3][D.lash];
  s+=`<path d="${top}L${N2(ox+d*.4)} ${N2(oy+(1-op)*h*.5+lw*1.1)}C${N2(c+d*w*.35)} ${N2(topY-h*.04+t*.4+lw)} ${N2(c-d*w*.6)} ${N2(topY+h*.04+lw*.7)} ${N2(ix+d*.6)} ${N2(iy+.5)}Z" fill="${lc}" stroke="${lc}" stroke-width=".7" stroke-linejoin="round"/>`;
  s+=`<path d="M${N2(ox-d*1.4)} ${N2(oy+(1-op)*h*.5-.2)}l${N2(d*3.6)} ${N2(-1.8+(D.lash==2?-.6:0))}l${N2(-d*1.2)} 2.8Z" fill="${lc}"/>`;
  if(D.lash==2)s+=`<path d="M${N2(c+d*w*.55)} ${N2(topY+t*.45)}l${N2(d*1.5)} -2" stroke="${lc}" stroke-width=".8" stroke-linecap="round"/>`;
  s+=`<path d="M${N2(ox-d*1.2)} ${N2(y+h*.3)}Q${N2(c+d*w*.55)} ${N2(y+h*.5)} ${N2(c+d*w*.25)} ${N2(y+h*.53)}" stroke="${lc}" stroke-width=".7" fill="none" opacity=".55" stroke-linecap="round"/>`;
  if(X.x=='tear'&&k==1)s+=`<path d="M${N2(ox-d*1)} ${N2(y+h*.5)}q-1.4 3 0 3.8q1.4 -.8 0 -3.8z" fill="#d6efff" stroke="#8cc8ef" stroke-width=".4"/>`;
  return s};
 return one(35.4-D.sp,-1,0)+one(64.6+D.sp,1,1)}
function brows(a,D,X,bc){const by=45.6-(EYG[a.ey]||EYG[0])[1]*.08,sp=D.sp;
 const b=(c,d)=>{const i=c-d*6,u=c+d*8.4,yi=by+X.bi,yo=by+X.bo+(a.br==3?-1:0),arch=[-.8,-2,-3.2,-1][a.br]||0,th=[.8,.9,.75,1][a.br]||.8;
  return`<path d="M${N2(i)} ${N2(yi)}Q${N2((i+u)/2)} ${N2(Math.min(yi,yo)+arch)} ${N2(u)} ${N2(yo+.9)}Q${N2((i+u)/2)} ${N2(Math.min(yi,yo)+arch+th)} ${N2(i)} ${N2(yi+th)}Z" fill="${bc}"/>`};
 return b(35.4-sp,-1)+b(64.6+sp,1)}
function mouthX(X,D){const w=D.mw,lc='#a8455c',fill='#a33a55',tg='#f490a8',L=x=>N2(50+(x-50)*w),y=76;switch(X.mo){
 case'flat':return`<path d="M${L(48)} ${y}Q50 ${y+.6} ${L(52)} ${y}" stroke="${lc}" stroke-width="1" fill="none" stroke-linecap="round"/>`;
 case'smile':return`<path d="M${L(46.6)} ${y-.8}Q50 ${y+2.6} ${L(53.4)} ${y-.8}" stroke="${lc}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
 case'open':return`<path d="M${L(46)} ${y-1.4}Q50 ${y-.6} ${L(54)} ${y-1.4}Q${L(53.4)} ${y+4.6} 50 ${y+4.8}Q${L(46.6)} ${y+4.6} ${L(46)} ${y-1.4}Z" fill="${fill}" stroke="${lc}" stroke-width=".55"/><path d="M${L(47.4)} ${y+2.8}Q50 ${y+1.2} ${L(52.6)} ${y+2.8}Q50 ${y+4.8} ${L(47.4)} ${y+2.8}Z" fill="${tg}"/>`;
 case'big':return`<path d="M${L(44.6)} ${y-2}Q50 ${y-.8} ${L(55.4)} ${y-2}Q${L(54.6)} ${y+6.6} 50 ${y+6.8}Q${L(45.4)} ${y+6.6} ${L(44.6)} ${y-2}Z" fill="${fill}" stroke="${lc}" stroke-width=".55"/><path d="M${L(46.6)} ${y+4.2}Q50 ${y+1.8} ${L(53.4)} ${y+4.2}Q50 ${y+6.8} ${L(46.6)} ${y+4.2}Z" fill="${tg}"/><path d="M${L(45.6)} ${y-1.6}Q50 ${y-.4} ${L(54.4)} ${y-1.6}L${L(54)} ${y-.6}Q50 ${y+.4} ${L(46)} ${y-.6}Z" fill="#fff"/>`;
 case'shy':return`<path d="M${L(47.6)} ${y+.3}Q48.8 ${y-.6} 50 ${y+.3}Q51.2 ${y+1.1} ${L(52.4)} ${y+.2}" stroke="${lc}" stroke-width=".95" fill="none" stroke-linecap="round"/>`;
 case'o':return`<ellipse cx="50" cy="${y+1.2}" rx="${N2(2.1*w)}" ry="2.6" fill="${fill}" stroke="${lc}" stroke-width=".55"/><ellipse cx="50" cy="${y+2.4}" rx="${N2(1.3*w)}" ry=".9" fill="${tg}"/>`;
 case'sad':return`<path d="M${L(47.2)} ${y+1.2}Q50 ${y-1} ${L(52.8)} ${y+1.2}" stroke="${lc}" stroke-width="1" fill="none" stroke-linecap="round"/>`;
 case'firm':return`<path d="M${L(46.8)} ${y+.2}Q50 ${y-.5} ${L(53.2)} ${y+.2}" stroke="${lc}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
 case'smirk':return`<path d="M${L(46.6)} ${y}Q50.6 ${y+1.8} ${L(54)} ${y-1.6}" stroke="${lc}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
 case'wavy':return`<path d="M${L(46.2)} ${y+.4}l1.3 -1.1 1.3 1.1 1.3 -1.1 1.3 1.1 1.3 -1.1 1.3 1.1" stroke="${lc}" stroke-width=".9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
 case'pout':return`<path d="M${L(47.8)} ${y-.2}Q50 ${y-1.8} ${L(52.2)} ${y-.2}Q50 ${y+2.3} ${L(47.8)} ${y-.2}Z" fill="#ee8098" stroke="${lc}" stroke-width=".5"/>`}return''}

// ---- accessories ---------------------------------------------------------------------
function bowSvg(x,y,s,rot,f,l){return`<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 0C-4 -9 -14 -8.4 -13 -1C-12 5.6 -5 4.4 0 0Z" fill="${f}" stroke="${l}" stroke-width=".7"/><path d="M0 0C4 -9 14 -8.4 13 -1C12 5.6 5 4.4 0 0Z" fill="${f}" stroke="${l}" stroke-width=".7"/><path d="M-1 1L-5.4 13L-2.2 11L-.4 14ZM1 1L5.4 13L2.2 11L.4 14Z" fill="${f}" stroke="${l}" stroke-width=".6"/><path d="M-10 -3.6Q-6 -1.8 -2.4 -.8M10 -3.6Q6 -1.8 2.4 -.8" stroke="#fff" stroke-width=".8" fill="none" opacity=".75"/><ellipse rx="2.6" ry="3" fill="${mixc(f,'#fff',.35)}" stroke="${l}" stroke-width=".6"/></g>`}
function accSvg(ac,a,D,hb){const rc=hslx(D.rib,72,76),rl=hslx(D.rib,50,44);switch(ac){
 case 1:return`<g transform="translate(74 26) rotate(14)"><path d="M0 -6.6l1.9 4 4.4.6-3.2 3.1.9 4.4L0 2.4-4 4.5l.9-4.4-3.2-3.1 4.4-.6z" fill="#ffe28e" stroke="#c99a34" stroke-width=".7"/></g><g transform="translate(80 34) rotate(-10)"><path d="M0 -3.4l1 2.2 2.4.3-1.8 1.7.5 2.4L0 2-2.1 3.2l.5-2.4-1.8-1.7 2.4-.3z" fill="#bfe3ff" stroke="#6fa8d6" stroke-width=".5"/></g>`;
 case 2:return bowSvg(76,22,.95,18,rc,rl);
 case 3:{const pet=f=>[0,72,144,216,288].map(r=>`<path d="M0 0C-3.4 -4.4 -2.8 -8.6 0 -8.8C2.8 -8.6 3.4 -4.4 0 0Z" transform="rotate(${r})" fill="${f}" stroke="#ea9cbc" stroke-width=".5"/>`).join('');return`<g transform="translate(25 27)">${pet('#ffe0ec')}<circle r="2" fill="#ffd36a"/></g><g transform="translate(19 35) scale(.6)">${pet('#fff')}<circle r="2" fill="#ffd36a"/></g>`}
 case 4:{const hd=hb[1],hl=mixc(hb[2],'#000',.3);return`<path d="M17 26L16 1L38 13Z" fill="${hd}" stroke="${hl}" stroke-width=".8"/><path d="M83 26L84 1L62 13Z" fill="${hd}" stroke="${hl}" stroke-width=".8"/><path d="M21 19.6L20.6 8.4L30 14ZM79 19.6L79.4 8.4L70 14Z" fill="#ffc6dc"/>`}
 case 5:return`<path d="M33 16L36 4.6L41.6 11.6L50 -.4L58.4 11.6L64 4.6L67 16Q50 12 33 16Z" fill="#f6da80" stroke="#c39b3c" stroke-width=".8"/><circle cx="50" cy="6" r="2.1" fill="#f58fb5" stroke="#fff" stroke-width=".5"/><circle cx="41.4" cy="11.8" r="1.2" fill="#a6dbff"/><circle cx="58.6" cy="11.8" r="1.2" fill="#a6dbff"/>`;
 case 6:return`<g fill="#ffffff22" stroke="#6b5a7a" stroke-width="1"><rect x="22" y="52" width="26" height="18" rx="7"/><rect x="52" y="52" width="26" height="18" rx="7"/></g><path d="M48 58Q50 56.4 52 58" stroke="#6b5a7a" stroke-width="1" fill="none"/><path d="M25 55l4.6 -1.6M55 55l4.6 -1.6" stroke="#fff" stroke-width=".9" opacity=".85"/>`}return''}

// ---- head assembly -------------------------------------------------------------------
function headParts(m,ex,id,opt={}){const a=opt.a||apEff(m),D=dz(m),X=EXS[exOf(m,ex)],hb=HC[a.hc]||HC[0],ec=EC[a.ec]||EC[0],sk=SKN[D.skin]||SKN[1],seed=((m.id|0)+1)*131;
 const bc=a.bc<0||a.bc==null?mixc(hb[2],'#2a1622',.25):(HC[a.bc]||hb)[2],hl=mixc(hb[2],'#22121e',.4),hlite=mixc(hb[1],'#ffffff',.6),hdark=mixc(hb[1],hb[2],.7);
 const B=backHair(a.bk,D,seed),F=BANGS[a.ft]||BANGS[0],hs=`stroke="${hl}" stroke-width=".7" stroke-linejoin="round"`,HF=`url(#${id}hf)`,HB=`url(#${id}hb)`;
 const defs=`<linearGradient id="${id}hf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mixc(hb[1],'#fff',.18)}"/><stop offset=".35" stop-color="${hb[1]}"/><stop offset="1" stop-color="${mixc(hb[1],hb[2],.55)}"/></linearGradient><linearGradient id="${id}hb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hdark}"/><stop offset=".55" stop-color="${mixc(hb[1],hb[2],.45)}"/><stop offset="1" stop-color="${mixc(hb[1],hb[2],.25)}"/></linearGradient><linearGradient id="${id}ir" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mixc(ec[1],'#120818',.55)}"/><stop offset=".45" stop-color="${ec[1]}"/><stop offset="1" stop-color="${mixc(ec[2],'#fff',.15)}"/></linearGradient><radialGradient id="${id}bl"><stop offset="0" stop-color="#ff8eaa" stop-opacity=".75"/><stop offset="1" stop-color="#ff8eaa" stop-opacity="0"/></radialGradient>`;
 // back hair
 let back=`<path d="${B.b}" fill="${HB}" ${hs}/>`;
 if(B.curl)back+=`<g fill="none" stroke="${hlite}" stroke-width=".8" opacity=".5">${[[12,70],[9,110],[14,146],[88,70],[91,110],[86,146],[39,156],[61,156]].map(([x,y])=>`<path d="M${x-4} ${y}a4 4 0 1 1 4 4"/>`).join('')}</g>`;
 else if(B.s>=100)back+=`<g fill="none" stroke="${hl}" stroke-width=".55" opacity=".3"><path d="M20 70C16 92 16 116 19 140M80 70C84 92 84 116 81 140M30 84C28 104 29 124 31 144M70 84C72 104 71 124 69 144"/></g>`;
 const tail=T=>{const w1=T[T.length-1],w0=T[T.length-2],P=T.slice(0,-2),S=limbPts(P,t=>t<.1?w1*2+(w0-w1*2)*t/.1:w0*(1-Math.pow((t-.1)/.9,1.6))+1,18);return`<path d="${limbPath(S,0,1,0,.5)}" fill="${HB}" ${hs}/><path d="${crPath(P.slice(1).map(([x,y])=>[x+1.4,y]))}" stroke="${hlite}" stroke-width="1.6" fill="none" opacity=".35" stroke-linecap="round"/><path d="${crPath(P.slice(1,-1).map(([x,y])=>[x-2,y]))}" stroke="${hl}" stroke-width=".55" fill="none" opacity=".45"/>`};
 (B.tails||[]).forEach(T=>back=tail(T)+back);
 if(B.bun)back+=`<circle cx="50" cy="5" r="12" fill="${HF}" ${hs}/><path d="M42 3Q50 -4 58 3M43 9Q50 4 57 9" stroke="${hl}" stroke-width=".6" fill="none" opacity=".55"/>`;
 if(B.top)back+=`<path d="M56 7C62 -2 73 0 71 9C67 6 62 6 59 9Z" fill="${HF}" ${hs}/>`;
 const ties=(B.tie||[]).map(([x,y])=>bowSvg(x,y,.6,0,hslx(D.rib,72,76),hslx(D.rib,50,44))).join('');
 let over='';(B.ftails||[]).forEach(T=>over+=tail(T));
 if(B.braid){const[x0,y0,x1,y1]=B.braid;let br='';for(let i=0;i<10;i++){const t=i/9,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t,w=5.6-t*1.6;br+=`<ellipse cx="${N2(x-1.7)}" cy="${N2(y)}" rx="${N2(w)}" ry="${N2(w*1.1)}" transform="rotate(-24 ${N2(x)} ${N2(y)})"/><ellipse cx="${N2(x+1.7)}" cy="${N2(y+4.2)}" rx="${N2(w)}" ry="${N2(w*1.1)}" transform="rotate(24 ${N2(x)} ${N2(y+4.2)})"/>`}
  over+=`<g fill="${HF}" ${hs}><path d="M33 72C29 78 27 82 28 88L32 88C33 82 35 78 37 74Z"/>${br}<path d="M${x1-3} ${y1+2}L${x1-2} ${y1+12}L${x1} ${y1+4}L${x1+2} ${y1+13}L${x1+3} ${y1+3}Z"/></g>`}
 // face
 let face='';
 if(B.ears)face+=`<path d="M22.4 55C17 52 16.4 64 22 68Z" fill="${sk[0]}" stroke="${sk[2]}" stroke-width=".6"/><path d="M77.6 55C83 52 83.6 64 78 68Z" fill="${sk[0]}" stroke="${sk[2]}" stroke-width=".6"/>`;
 face+=`<path d="${facePath(D.face)}" fill="${sk[0]}" stroke="${sk[2]}" stroke-width=".7"/>`;
 
 if(B.ears&&D.er)face+=`<circle cx="20.4" cy="69" r="1.4" fill="#ffe28e" stroke="#c8a040" stroke-width=".4"/><circle cx="79.6" cy="69" r="1.4" fill="#ffe28e" stroke="#c8a040" stroke-width=".4"/>`;
 const bx=28-D.sp*.5,bx2=72+D.sp*.5,bop=X.bl==2?1:X.bl?D.blush+.15:D.blush*.7,bl=`<ellipse cx="${bx}" cy="70.5" rx="7" ry="3.6" fill="url(#${id}bl)" opacity="${N2(bop)}"/><ellipse cx="${bx2}" cy="70.5" rx="7" ry="3.6" fill="url(#${id}bl)" opacity="${N2(bop)}"/>`+((X.bl==2||(X.bl&&D.bl))?`<path d="M${bx-3} 69.4l-1.2 2.4M${bx} 69.4l-1.2 2.4M${bx+3} 69.4l-1.2 2.4M${bx2-3} 69.4l-1.2 2.4M${bx2} 69.4l-1.2 2.4M${bx2+3} 69.4l-1.2 2.4" stroke="#ef8aa2" stroke-width=".55" stroke-linecap="round" opacity=".8"/>`:'');
 const nose=[`<path d="M50.4 69.4l-.7 1.4" stroke="${sk[2]}" stroke-width=".6" stroke-linecap="round" opacity=".7"/>`,`<ellipse cx="50.2" cy="70.4" rx=".6" ry=".4" fill="${sk[2]}" opacity=".55"/>`][D.nose];
 const mole=D.mole==1?`<circle cx="${45.4+D.sp}" cy="79.6" r=".5" fill="${sk[2]}"/>`:D.mole==2?`<circle cx="${72+D.sp}" cy="66" r=".5" fill="${sk[2]}"/>`:'';
 const fr=D.fr?[[26,68],[29,69.6],[31.4,67.6],[68.6,67.6],[71,69.6],[74,68]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".38" fill="${sk[2]}" opacity=".55"/>`).join(''):'';
 let feat=bl+fr+eyes(a,D,X,ec,id,hb)+nose+mouthX(X,D)+mole;
 if(X.x=='sweat')feat+=`<path d="M80 40q-2.4 4 0 5.6q2.4 -1.6 0 -5.6z" fill="#d6edff" stroke="#8cc8ef" stroke-width=".5"/>`;
 if(X.x=='spark')feat+=`<path d="M90 26l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z M10 34l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" fill="#ffd96a"/>`;
 if(X.x=='fire')feat+=`<path d="M88 44l4 -3M89 48l5 0M88 52l4 3" stroke="#ff8a8a" stroke-width="1.2" stroke-linecap="round"/>`;
 if(X.x=='exc')feat+=`<path d="M86 22l1.4 8M91 23l-1 7" stroke="#ff6f8e" stroke-width="1.6" stroke-linecap="round"/>`;
 if(X.x=='puff')feat+=`<path d="M80 74q3 -2 4 1" stroke="#ef9fb8" stroke-width=".8" fill="none"/>`;
 if(X.x=='note')feat+=`<path d="M88 24v7.4a2 1.6 0 1 1-1-1.3V24l4 -1v2z" fill="#f59ac0"/>`;
 // front hair (crown + bangs) with soft shading, strands and highlight
 const bd=bangD(F);
 let bangs=`<path d="${bd}" fill="${HF}" ${hs}/>`;
 const tips=F.e.filter(p=>p[2]=='t');
 bangs+=`<g fill="none" stroke="${hl}" stroke-width=".5" opacity=".38">${tips.map(([x,y])=>`<path d="M${N2(50+(x-50)*.35)} ${N2(14+Math.abs(x-50)*.1)}Q${N2(50+(x-50)*.8)} ${N2((y+20)/2)} ${N2(x+(x<50?.8:-.8))} ${N2(y-5)}"/>`).join('')}</g>`;
 bangs+=`<g fill="${mixc(hb[1],hb[2],.35)}" opacity=".45">${tips.filter(([x])=>x>18&&x<82).map(([x,y])=>`<path d="M${N2(x-2.2)} ${N2(y-9)}Q${N2(x)} ${N2(y-3)} ${N2(x)} ${N2(y-.6)}Q${N2(x+.6)} ${N2(y-4)} ${N2(x+2.2)} ${N2(y-9)}Z"/>`).join('')}</g>`;
 bangs+=`<path d="M24 24Q37 12.4 50 12.2Q63 12.4 76 24L74.4 26.6L71.6 23.6L69 26.4L66 22.4L62.6 25L60 21.2L56.6 23.6L53.4 20.4L50 22.6L46.6 20.4L43.4 23.6L40 21.2L37.4 25L34 22.4L31 26.4L28.4 23.6L25.6 26.6Z" fill="${hlite}" opacity="${N2(D.ring*.55)}"/>`;
 if(D.ahoge)bangs+=D.ahoge==1?`<path d="M50 5C47 -5 57 -9 61 -4C55 -5 52 -1 51.6 5Z" fill="${HF}" ${hs}/>`:`<path d="M48 5C43 -2 45 -8 50 -7C47 -4 48 0 50 5ZM51 5C55 -2 61 -3 63 0C58 -1 54 1 52.6 5Z" fill="${HF}" ${hs}/>`;
 if(F.flip)bangs=mir(bangs);
 // shadow of the bangs on the forehead
 const shadow=`<clipPath id="${id}fc"><path d="${facePath(D.face)}"/></clipPath><g clip-path="url(#${id}fc)"><path d="${bd}" transform="translate(0 2.4)${F.flip?' translate(100 0) scale(-1 1)':''}" fill="${sk[1]}" opacity=".9"/></g>`;
 const sl=`<g fill="${HF}" ${hs}>${sideLocks(B.sk,B.s,seed)}</g>`;
 const browL=`<g opacity="${F.part?'.95':'.5'}">${brows(a,D,X,bc)}</g>`;
 return{defs,back,over,face:face+shadow,feat,sl,bangs,brow:browL,acc:accSvg(a.ac,a,D,hb),ties,a,D,sk}}

// =====================================================================================
//  BODY (figure frame 0..100 x 0..200; head drawn at scale HK)
// =====================================================================================
const HK=.42,HTX=50-50*HK,HTY=3;
const SHL=[37.4,49.4],SHR=[62.6,49.4];
const TORSO_L=[[47.6,44.8],[43.6,46],[40,47.2],[38,49],[37.8,52],[38.6,55.6],[39.2,59.6],[41,63.6],[42.8,67.8],[42.4,71.4],[41.2,75.4],[40.8,79.4],[41.6,83.4]];
const torsoD=symShape(TORSO_L.map(([x,y])=>[50+(x-50)*1.16,y]));
const armProf=t=>t<.5?5.4-t*2.6:t<.85?4.1-(t-.5)*1.4:3.6-(t-.85)*3.4;
const legProf=t=>t<.45?12.2-t*13:t<.52?6.2:t<.66?6.2+(t-.52)*8:t<.92?7.3-(t-.66)*12:4.1;
function legJ(st,lf){const k=v=>80+(v-80)*lf;switch(st){
 case 1:return[[[45.6,80],[43,k(127)],[40,k(174)]],[[54.4,80],[57,k(127)],[60,k(174)]]];
 case 2:return[[[45.8,80],[47.6,k(127)],[51.6,k(174)]],[[54.2,80],[54.6,k(127)],[55.4,k(174)]]];
 case 3:return[[[45.8,80],[45,124],[42,136]],[[54.2,80],[55,124],[58,136]]];
 case 4:return[[[45.8,80],[45.2,96],[44.2,142]],[[54.2,80],[54.8,96],[55.8,142]]];
 case 5:return[[[45.6,80],[45.6,k(127)],[45.8,k(174)]],[[54.4,80],[62,108],[71,126]]];
 default:return[[[45.8,80],[46.2,k(127)],[46.6,k(174)]],[[54.2,80],[53.8,k(127)],[53.4,k(174)]]]}}
const NPOSE=[[0,[-6,-3],[6,3],0],[4,[-10,-5],[118,172],0,'wave'],[0,[-10,-5],[30,200],0,'peace'],[0,[-16,108],[16,-108],0,'heart'],[0,[-10,-5],[60,92],1,'point'],[0,[-38,52],[38,-52],1],[0,[-10,-5],[152,178],0],[-8,[-8,52],[8,-52],2],[4,[-10,-2],[22,-38],2],[8,[-6,28],[22,-34],2],[0,[-6,18],[6,-18],4],[0,[-8,22],[8,-22],3],[-6,[-128,-160],[58,28],5],[0,[-10,-5],[26,-158],0,'',1],[3,[-28,-20],[30,-150],2,'kiss'],[0,[-118,-122],[118,122],1]];

// ---- costume parts ----
const plaidDef=(id,a,b,ln)=>`<pattern id="${id}" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="${a}"/><rect width="5" height="1.6" fill="${b}" opacity=".55"/><rect width="1.6" height="5" fill="${b}" opacity=".45"/><rect x="3.2" width=".35" height="5" fill="${ln}" opacity=".7"/><rect y="3.2" width="5" height=".35" fill="${ln}" opacity=".6"/></pattern>`;
function skirtD(yT,wT,yB,wB,n=9,dp=1.6,arc=2.4){wT*=1.12;wB*=1.3;yB+=(yB-yT)*.18;let d=`M${N2(50-wT)} ${yT}L${N2(50+wT)} ${yT}Q${N2(50+wB*.92)} ${N2(yT+(yB-yT)*.55)} ${N2(50+wB)} ${N2(yB)}`;for(let i=0;i<n;i++){const x1=50+wB-(2*wB)*(i+1)/n,xm=50+wB-(2*wB)*(i+.5)/n,yy=yB+Math.sin((i+1)/n*Math.PI)*arc,ym=yB+Math.sin((i+.5)/n*Math.PI)*arc+dp;d+=`Q${N2(xm)} ${N2(ym+dp)} ${N2(x1)} ${N2(i==n-1?yB:yy)}`}return d+`Q${N2(50-wB*.92)} ${N2(yT+(yB-yT)*.55)} ${N2(50-wT)} ${yT}Z`}
const pleats=(yT,wT,yB,wB,n,c,o=.5)=>{wT*=1.12;wB*=1.3;yB+=(yB-yT)*.18;let s='';for(let i=1;i<n;i++){const t=i/n;s+=`<path d="M${N2(50-wT+2*wT*t)} ${yT}L${N2(50-wB+2*wB*t)} ${N2(yB+Math.sin(t*Math.PI)*2.2)}" stroke="${c}" stroke-width=".35" opacity="${o}"/>`}return s};
const lay=(yT,wT,yB,wB,fill,ln,n=9,extra='')=>`<path d="${skirtD(yT,wT,yB,wB,n)}" fill="${fill}" stroke="${ln}" stroke-width=".35" stroke-linejoin="round"/>${extra}`;
function bowS(x,y,s,f,l,tails=1){return`<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0C-3 -3.8 -7.6 -3 -7 .6C-6.4 3.6 -2.6 2.2 0 0ZM0 0C3 -3.8 7.6 -3 7 .6C6.4 3.6 2.6 2.2 0 0Z" fill="${f}" stroke="${l}" stroke-width=".45"/>${tails?`<path d="M-.8 .6L-3.4 8.4L-1.2 7.2L0 8.6L1.2 7.2L3.4 8.4L.8 .6Z" fill="${f}" stroke="${l}" stroke-width=".4"/>`:''}<ellipse rx="1.4" ry="1.6" fill="${mixc(f,'#fff',.3)}" stroke="${l}" stroke-width=".35"/></g>`}
function outfit(o,C,id,D){const ln=C.ln,LN=`stroke="${ln}" stroke-width=".35" stroke-linejoin="round"`,W='#fffefc',WL='#d6cdde';
 const clipTop=(sx=1.05)=>`<clipPath id="${id}tc"><path d="${torsoD}" transform="translate(50 0) scale(${sx} 1) translate(-50 0)"/></clipPath>`;
 const top=(fill,hem,inner='',sx=1.05)=>clipTop(sx)+`<g clip-path="url(#${id}tc)"><rect x="20" y="38" width="60" height="${hem-38}" fill="${fill}"/><path d="M57 44L66 48L64 ${hem}L57 ${hem}Z" fill="#3a2a4a" opacity=".07"/>${inner}<path d="${torsoD}" transform="translate(50 0) scale(${sx} 1) translate(-50 0)" fill="none" stroke="${ln}" stroke-width=".7" clip-path="url(#${id}hm)"/></g><clipPath id="${id}hm"><rect width="100" height="${hem}"/></clipPath><path d="M${N2(50-(hem>74?9.6:7.6)*sx)} ${hem}Q50 ${hem+1.2} ${N2(50+(hem>74?9.6:7.6)*sx)} ${hem}" stroke="${ln}" stroke-width=".35" fill="none"/>`;
 const blouse=(hem=72,sx=1.04)=>top(W,hem,`<path d="M50 46V${hem}" stroke="${WL}" stroke-width=".35"/>${[52,57,62,67].map(y=>`<circle cx="50.8" cy="${y}" r=".45" fill="${WL}"/>`).join('')}`,sx);
 const collar=(c=W,l=WL)=>`<path d="M45.2 45.2L50 48.6L46.6 51.4L43.6 47.2ZM54.8 45.2L50 48.6L53.4 51.4L56.4 47.2Z" fill="${c}" stroke="${l}" stroke-width=".35" stroke-linejoin="round"/>`;
 const vest=(f,l,hem=71,deco='')=>`<g clip-path="url(#${id}tc)"><path d="M41 44L47.6 46.4L50 58L52.4 46.4L59 44L64 50L62 ${hem}Q56 ${hem+2.4} 50 ${hem+3.4}Q44 ${hem+2.4} 38 ${hem}L36 50Z" fill="${f}" stroke="${l}" stroke-width=".4" stroke-linejoin="round"/>${deco}${[61,64.6,68].map(y=>`<circle cx="48.4" cy="${y}" r=".55" fill="${C.g}" stroke="${C.gl}" stroke-width=".2"/><circle cx="51.6" cy="${y}" r=".55" fill="${C.g}" stroke="${C.gl}" stroke-width=".2"/>`).join('')}</g>`;
 const frillBand=(y,w,n,f=W,l=WL,dp=1.5)=>`<path d="${skirtD(y-2.2,w*.97,y,w,n,dp,2.2)}" fill="${f}" stroke="${l}" stroke-width=".3"/>`;
 switch(o){
 case 0:// Casual: oversized hoodie, denim mini skirt, striped knee socks, sneakers
  return{skirt:lay(76,9.4,92,13.6,'#7f93c9','#56679b',6,`<path d="M50 76.6V90" stroke="#56679b" stroke-width=".35"/><path d="M41 79.4H59" stroke="#a8b8e2" stroke-width=".35" stroke-dasharray="1 .7"/>`),
   top:top(C.c1,83,`<path d="M41 45L50 53L59 45L57.4 43.6L50 49.4L42.6 43.6Z" fill="${C.c2}"/><path d="M47 52L46.6 61M53 52L53.4 61" stroke="#fff" stroke-width=".55"/><circle cx="46.6" cy="61.4" r=".7" fill="#fff"/><circle cx="53.4" cy="61.4" r=".7" fill="#fff"/><path d="M42 70L58 70L57 78L43 78Z" fill="${C.c2}" opacity=".5"/><path d="M38 81Q50 83.4 62 81" stroke="${C.c2}" stroke-width="2.4" fill="none"/><path d="M45 64.6l1 -1.4 1 1.4M51 64.6l1 -1.4 1 1.4" stroke="${C.dk}" stroke-width=".35" fill="none" opacity=".45"/>`,1.15),cover:1,
   collar:`<path d="M39.6 46.6C41 42 46 40.6 50 40.6C54 40.6 59 42 60.4 46.6L56.4 47.4Q50 44.4 43.6 47.4Z" fill="${C.c2}" ${LN}/>`,
   sleeve:'long',sc:C.c1,cuff:C.c2,leg:{t:'sock',c:W,from:.6,band:C.c2},shoe:{t:'sneaker',c:W,a:C.c2}};
 case 1:// School sailor uniform
  {const sc=hslx(C.h,46,30),rb=hslx(C.h+170,72,62);return{skirt:lay(69,8.6,95,16,sc,mixc(sc,'#000',.3),10)+pleats(69,8.6,95,16,10,mixc(sc,'#000',.35),.6)+`<path d="${skirtD(93.6,15.6,95,16,10,0,2.2).replace(/Z$/,'')}" fill="none" stroke="#fff" stroke-width=".5" opacity=".9"/>`,
   top:top(W,71,`<path d="M57 44L66 50L64 71L57 71Z" fill="#a9b6d8" opacity=".15"/>`,1.05),
   collar:`<path d="M43.2 45.4L50 57L56.8 45.4L63.8 49.4L60 55.4L50 60L40 55.4L36.2 49.4Z" fill="${sc}" ${LN}/><path d="M37.6 50.2L41 54.4L50 58.6L59 54.4L62.4 50.2" stroke="#fff" stroke-width=".5" fill="none"/>${bowS(50,56.4,1.05,rb,mixc(rb,'#000',.35))}`,
   sleeve:'long',sc:W,cuff:sc,leg:{t:'sock',c:mixc(sc,'#1a1a2a',.25),from:.56},shoe:{t:'loafer',c:'#4a3438'}}}
 case 2:// Debut: white blouse, pastel vest, three frilly tiers, lace-up boots
  return{skirt:frillBand(97,19,13)+lay(70,8.4,94.6,18,C.c4,C.c2,11)+frillBand(94.6,18,12,W,WL)+lay(70,8.4,87,15.2,C.c1,C.c2,9)+frillBand(87,15.2,10,W,WL)+lay(70,8.4,79,11.6,C.c4,C.c2,7)+bowS(58,71,.9,C.c2,ln),
   top:blouse(71),vestL:vest(C.c2,ln,70,`<path d="M43 60H57" stroke="#fff" stroke-width=".35" opacity=".6"/>`),
   collar:collar()+bowS(50,49.4,.85,C.c3,ln),
   sleeve:'puff',sc:W,cuff:C.c2,leg:{t:'boot',c:W,from:.6,lace:C.c2,frill:1},shoe:{t:'boot',c:W},wrist:C.c2};
 case 3:// Stage: plaid vest & tiered plaid skirt, bow tie, petticoat, knee socks, sneakers
  {const pid=id+'pa';return{defs:plaidDef(pid,C.c2,C.dk,'#fff'),
   skirt:frillBand(96,18.6,12)+lay(70,8.4,94,17.6,`url(#${pid})`,C.dk,11)+frillBand(94,17.6,11,C.dk,C.dk,1.2)+lay(70,8.4,84,13.8,`url(#${pid})`,C.dk,8)+frillBand(84,13.8,9,W,WL)+`<path d="M41.6 70.6H58.4" stroke="${C.dk}" stroke-width="1.2"/>`+bowS(58.6,72,1.1,W,WL),
   top:blouse(71),vestL:vest(`url(#${pid})`,C.dk,70),
   collar:collar()+bowS(50,49.2,.8,C.dk,mixc(C.dk,'#000',.3)),
   sleeve:'puff',sc:W,cuff:C.dk,leg:{t:'sock',c:C.dk,from:.6},shoe:{t:'sneaker',c:C.dk,a:'#fff'},wrist:C.c2}}
 case 4:// Summer: bright vest dress with ruffles, short puff sleeves, white boots
  return{skirt:lay(70,8.4,93,17,W,WL,11)+lay(70,8.4,89,15.6,C.c1,C.c2,10)+frillBand(89,15.6,10,C.c4,C.c2)+lay(70,8.4,80,11.6,C.c1,C.c2,7)+frillBand(80,11.6,7,W,WL)+`<path d="M40 70.6H60" stroke="${C.c3}" stroke-width="1.6"/>`,
   top:blouse(71),vestL:vest(C.c1,C.c3,70,`<path d="M47.6 47L50 57.6L52.4 47" stroke="${C.c3}" stroke-width=".4" fill="none"/>`),
   collar:collar()+`<path d="M47.6 49.6L50 52L52.4 49.6L50 55.6Z" fill="#3a2a40"/>`+bowS(50,49.6,.75,'#3a2a40','#1a1020',0),
   sleeve:'puff',sc:W,cuff:C.c2,leg:{t:'boot',c:W,from:.7,lace:C.c2},shoe:{t:'boot',c:W},wrist:W};
 case 5:// Cute idol: pink plaid layered dress, big bows, ribbon tails, knee socks, sneakers
  {const pid=id+'pb';return{defs:plaidDef(pid,C.c1,C.c2,'#fff'),
   skirt:frillBand(98,20,14)+lay(69,8.6,96,19,`url(#${pid})`,C.c3,12)+frillBand(96,19,12,W,WL)+lay(69,8.6,85,14.4,C.c2,C.c3,9)+frillBand(85,14.4,9,W,WL)+`<path d="M58 71Q66 82 63 100L60.6 99Q62 84 56 73Z" fill="${C.c2}" stroke="${C.c3}" stroke-width=".35"/>`+bowS(58,71,1.3,C.c2,C.c3,0),
   top:top(`url(#${pid})`,71,`<path d="M44 45C46 49 54 49 56 45L55 51Q50 53 45 51Z" fill="${W}" stroke="${WL}" stroke-width=".3"/>`),
   collar:collar()+bowS(50,51,1.15,C.c2,C.c3),
   sleeve:'puff',sc:W,cuff:C.c2,leg:{t:'sock',c:W,from:.58,frill:1},shoe:{t:'sneaker',c:C.c2,a:'#fff'},wrist:C.c2}}
 case 6:// Cool: dark corset vest, asymmetric layered skirt with sheer tails, lace-up boots
  {const jk=C.dk,j2=mixc(jk,'#000',.3);return{back:`<path d="M42 72Q30 92 34 116L44 106L46 80ZM58 72Q72 94 68 122L57 108L54 80Z" fill="${C.c2}" opacity=".55" stroke="${C.c3}" stroke-width=".3"/>`,
   skirt:lay(70,8.4,93,16,'#2b2436','#120d1a',10)+frillBand(93,16,10,C.c3,j2)+lay(70,8.4,84,13,jk,j2,8)+pleats(70,8.4,84,13,8,'#000',.35)+`<path d="M41.6 70.8H58.4" stroke="${C.g}" stroke-width=".6"/>`,
   top:blouse(71),vestL:`<g clip-path="url(#${id}tc)"><path d="M41 52L59 52L60 71Q50 74 40 71Z" fill="${jk}" stroke="${j2}" stroke-width=".4"/>${[55,59,63,67].map(y=>`<path d="M48 ${y}L52 ${y+2}M52 ${y}L48 ${y+2}" stroke="${C.c1}" stroke-width=".35"/>`).join('')}</g>`,
   collar:collar()+bowS(50,49.4,.9,jk,j2),
   sleeve:'puff',sc:W,cuff:jk,leg:{t:'sock',c:'#2b2436',from:.48,over:{t:'boot',c:'#2b2433',from:.62,lace:C.c1}},shoe:{t:'boot',c:'#2b2433'},wrist:jk}}}
 return outfit(0,C,id,D)}

// ---- limbs ---------------------------------------------------------------------------
function armBuild(sh,a1,a2,sk,O){const[e1,e2]=ep(sh[0],sh[1],18.6,a1),[h1,h2]=ep(e1,e2,17,a2),J=[sh,[e1,e2],[h1,h2]],S=limbPts(J,armProf,12);
 const dx=h1-e1,dy=h2-e2,dl=Math.hypot(dx,dy)||1,hx_=h1+dx/dl*1.4,hy_=h2+dy/dl*1.4,ang=Math.atan2(dy,dx)*180/Math.PI-90;
 let s=`<path d="${limbPath(S)}" fill="${sk[0]}" stroke="${sk[2]}" stroke-width=".32"/><path d="M-1.7 -1.4C-2.4 .6 -1.8 3.4 0 3.6C1.9 3.4 2.4 .6 1.7 -1.4C.9 -2 -.9 -2 -1.7 -1.4Z" transform="translate(${N2(hx_)} ${N2(hy_)}) rotate(${N2(ang)})" fill="${sk[0]}" stroke="${sk[2]}" stroke-width=".3"/>`;
 const sc=O.sc,sl=sc?mixc(sc,'#3a2a4a',.35):'';
 if(O.wrist){const q=S.find(z=>z.t>=.9);s+=`<ellipse cx="${N2(q.p[0])}" cy="${N2(q.p[1])}" rx="2.2" ry="1.3" fill="${O.wrist}" stroke="${mixc(O.wrist,'#3a2a4a',.35)}" stroke-width=".3" transform="rotate(${N2(-a2)} ${N2(q.p[0])} ${N2(q.p[1])})"/>`}
 if(O.sleeve=='long'){s+=`<path d="${limbPath(S,0,.86,.7)}" fill="${sc}" stroke="${sl}" stroke-width=".32"/>`;const c=S.find(q=>q.t>=.83);s+=`<ellipse cx="${N2(c.p[0])}" cy="${N2(c.p[1])}" rx="2.6" ry="1.3" fill="${O.cuff||sc}" stroke="${sl}" stroke-width=".3" transform="rotate(${N2(-a2)} ${N2(c.p[0])} ${N2(c.p[1])})"/>`}
 else if(O.sleeve=='puff'){const c=S.find(q=>q.t>=.1),r=`rotate(${N2(-a1)} ${N2(c.p[0])} ${N2(c.p[1])})`;s+=`<ellipse cx="${N2(c.p[0])}" cy="${N2(c.p[1])}" rx="4.4" ry="5" fill="${sc}" stroke="${sl}" stroke-width=".32" transform="${r}"/><path d="M${N2(c.p[0]-2)} ${N2(c.p[1]-3.6)}q-.6 3 0 6M${N2(c.p[0]+1.6)} ${N2(c.p[1]-3.8)}q.8 3 0 6.2" stroke="${sl}" stroke-width=".25" fill="none" opacity=".6" transform="${r}"/><path d="M${N2(c.p[0]-3.4)} ${N2(c.p[1]+3.4)}q3.4 1.6 6.8 0" stroke="${O.cuff||sc}" stroke-width="1" fill="none" transform="${r}"/>`}
 return{s,h:[hx_,hy_],e:[e1,e2]}}
function legBuild(J,sk,O,left){const S=limbPts(J,legProf,16),L=O.leg||{};
 const layer=spec=>{if(!spec)return'';const lnc=mixc(spec.c,'#3a2a4a',.45),f=spec.from||.6;let r=`<path d="${limbPath(S,f,1,spec.t=='boot'?.5:.16)}" fill="${spec.c}" stroke="${lnc}" stroke-width=".32"/>`;const top=S.find(q=>q.t>=f)||S[0];
  r+=`<path d="M${N2(top.p[0]-top.w/2-.4)} ${N2(top.p[1])}q${N2(top.w/2+.4)} ${spec.t=='boot'?1.3:.8} ${N2(top.w+.8)} 0" stroke="${spec.frill?'#fff':spec.band||spec.lace||lnc}" stroke-width="${spec.frill?1.4:.6}" fill="none"/>`;
  if(spec.band)r+=`<path d="M${N2(top.p[0]-top.w/2)} ${N2(top.p[1]+1.8)}h${N2(top.w)}" stroke="${spec.band}" stroke-width=".6"/>`;
  if(spec.lace&&spec.t=='boot')for(let k=1;k<5;k++){const q=S.find(z=>z.t>=f+(1-f)*k/5.4);if(q)r+=`<path d="M${N2(q.p[0]-1.3)} ${N2(q.p[1])}l2.6 .9M${N2(q.p[0]+1.3)} ${N2(q.p[1])}l-2.6 .9" stroke="${spec.lace}" stroke-width=".32"/>`}
  return r+(spec.over?layer(spec.over):'')};
 let s=`<path d="${limbPath(S)}" fill="${sk[0]}" stroke="${sk[2]}" stroke-width=".32"/><path d="${limbPath(S,.47,.53,-.8)}" fill="${sk[1]}" opacity=".45"/>`+layer(L);
 const A=J[2],K=J[1],dir=Math.atan2(A[1]-K[1],A[0]-K[0])*180/Math.PI-90,sh=O.shoe||{t:'sneaker',c:'#fff'},sc=sh.c,sl=mixc(sc,'#3a2a3a',.5),fl=left?-1:1;
 let shoe='';
 if(sh.t=='boot')shoe=`<path d="M-2.4 -1H2.4L3.2 4.2Q3.6 6.6 1.2 6.6H-1.8Q-3.6 6.6 -3.2 4.2Z" fill="${sc}" stroke="${sl}" stroke-width=".35"/><path d="M-3.1 6H3.3" stroke="${sl}" stroke-width=".7"/>`;
 else if(sh.t=='loafer')shoe=`<path d="M-2.3 0H2.3L3 4.2Q3.2 6.4 1 6.4H-1.6Q-3.4 6.4 -3 4.2Z" fill="${sc}" stroke="${sl}" stroke-width=".35"/><path d="M-1.5 2.2h3" stroke="#ffffff66" stroke-width=".5"/>`;
 else shoe=`<path d="M-2.5 -.3H2.5L3.6 4Q4 6.6 1.3 6.6H-1.8Q-4 6.6 -3.6 4Z" fill="${sc}" stroke="${sl}" stroke-width=".35"/><path d="M-3.6 5.2H3.8" stroke="${sh.a||'#fff'}" stroke-width="1"/><path d="M-1.4 1.2l2.8.8M-1.4 2.6l2.8.8" stroke="${sh.a||'#fff'}" stroke-width=".4"/><path d="M${fl*2.6} 1.6l${fl*1} 1.6" stroke="${sl}" stroke-width=".3"/>`;
 return s+`<g transform="translate(${N2(A[0])} ${N2(A[1]-.6)}) rotate(${N2(dir*.6)}) scale(1.4)">${shoe}</g>`}

function bodyParts(m,a,pose,id,D,sk){const Pz=NPOSE[pose|0]||NPOSE[0],C=ocol(a),o=a.of|0,O=outfit(o,C,id,D);
 const LJ=legJ(Pz[3],D.lf),legs=legBuild(LJ[0],sk,O,1)+legBuild(LJ[1],sk,O,0);
 const neck=`<path d="M47.6 34L52.4 34L53 46L47 46Z" fill="${sk[0]}" stroke="${sk[2]}" stroke-width=".28"/><path d="M47.4 37Q50 41.6 52.6 37L52.8 41Q50 44 47.2 41Z" fill="${sk[1]}"/>`;
 const torsoSkin=`<path d="${torsoD}" fill="${sk[0]}" stroke="${sk[2]}" stroke-width=".32"/>`;
 const body=torsoSkin+(O.cover?(O.skirt||'')+(O.top||''):(O.top||'')+(O.vestL||'')+(O.skirt||''));
 const L=armBuild(SHL,Pz[1][0],Pz[1][1],sk,O),R=armBuild(SHR,Pz[2][0],Pz[2][1],sk,O);
 let g='';const hR=R.h;
 if(Pz[4]=='wave')g=`<path d="M${N2(hR[0]+4)} ${N2(hR[1]-3)}q2 -2 4 0M${N2(hR[0]+5)} ${N2(hR[1]+1)}q2 -2 4 0" stroke="#f58fb5" stroke-width=".7" fill="none"/>`;
 if(Pz[4]=='peace')g=`<g stroke-linecap="round"><path d="M${N2(hR[0]-.3)} ${N2(hR[1]-.6)}l-1.6 -4.6M${N2(hR[0]+.6)} ${N2(hR[1]-.6)}l1.4 -4.6" stroke="${sk[2]}" stroke-width="1.55"/><path d="M${N2(hR[0]-.3)} ${N2(hR[1]-.6)}l-1.6 -4.6M${N2(hR[0]+.6)} ${N2(hR[1]-.6)}l1.4 -4.6" stroke="${sk[0]}" stroke-width="1.05"/></g>`;
 if(Pz[4]=='heart')g=`<path d="M50 66C45 61 46 57 50 60C54 57 55 61 50 66Z" fill="#ff7eaa" stroke="#fff" stroke-width=".6"/>`;
 if(Pz[4]=='point')g=`<path d="M${N2(hR[0])} ${N2(hR[1])}l4.6 -1" stroke="${sk[0]}" stroke-width="1.3" stroke-linecap="round"/>`;
 if(Pz[4]=='kiss')g=`<path d="M${N2(hR[0]+6)} ${N2(hR[1]-6)}c-3 -3 -1 -5 1 -3c2 -2 4 0 1 3l-1 1z" fill="#ff8fb7"/><path d="M${N2(hR[0]+11)} ${N2(hR[1]-12)}c-2 -2 -.6 -3.4.7 -2c1.4 -1.4 2.8 0 .7 2l-.7.7z" fill="#ffc2da"/>`;
 return{Pz,O,C,legs,neck,torso:body,collar:O.collar||'',back:(O.defs?`<defs>${O.defs}</defs>`:'')+(O.back||''),arms:L.s+R.s,g,hR}}
function figBuild(m,l,id){const a={...ap(m),of:l.of,oh:l.oh,ac:l.ac},mm={...m,_x:1,ap:a},D=dz(m),sk=SKN[D.skin]||SKN[1];
 const H=headParts(mm,l.ex,id,{a}),B=bodyParts(m,a,l.pose,id,D,sk),tilt=B.Pz[0],HT=`translate(${N2(HTX)} ${HTY}) scale(${HK})`,G=s=>`<g transform="rotate(${tilt} 50 40)"><g transform="${HT}">${s}</g></g>`;
 const pr=(l.prop==1||B.Pz[5]==1)?`<g transform="translate(${N2(B.hR[0])} ${N2(B.hR[1])}) rotate(-20)"><rect x="-1.2" y="-8.6" width="2.4" height="9.6" rx="1" fill="#3b3346"/><circle cy="-10" r="2.8" fill="#d6dbe4" stroke="#8a8f9a" stroke-width=".45"/><path d="M-2 -11h4M-2 -9.2h4" stroke="#a7acb6" stroke-width=".35"/></g>`:l.prop==2?`<g transform="translate(${N2(B.hR[0])} ${N2(B.hR[1])}) rotate(-12)"><rect x="-.9" y="-20" width="1.8" height="21" rx=".9" fill="#ff9ec4"/><rect x="-1.4" y="-2" width="2.8" height="5" rx="1" fill="#555"/><circle cy="-20" r="2.2" fill="#fff6c0" opacity=".9"/></g>`:'';
 const ear=l.ear?`<circle cx="20.4" cy="69" r="1.8" fill="#ffd966"/><circle cx="79.6" cy="69" r="1.8" fill="#ffd966"/>`:'',nk=l.neck?`<path d="M46.6 45.6Q50 50 53.4 45.6" stroke="#ffd966" stroke-width=".7" fill="none"/><circle cx="50" cy="48.6" r="1.1" fill="#ff7eb6"/>`:'';
 return`<defs>${H.defs}</defs>${G(H.back)}${B.back}${B.legs}${B.neck}${B.torso}${B.collar}${nk}${G(H.face+H.feat+H.brow+H.bangs+H.acc+H.ties+ear)}${B.arms}${G(H.sl+H.over)}${B.g}${pr}`}
function fig(m,l){const a={...ap(m),of:l.of,oh:l.oh,ac:l.ac},k=JSON.stringify(['f4',m.id|0,m.hue|0,a,l.pose|0,l.prop|0,l.ear|0,l.neck|0,l.ex==null?'':l.ex]);let t=ART.cache.get(k);if(!t){t=figBuild(m,l,'§');if(ART.cache.size>3000)ART.cache.clear();ART.cache.set(k,t)}return t.split('§').join('f'+(++PTC[0]))}

// ---- portrait (bust): same head + same costume, magnified ------------------------------
function ptBuild(m,s,nb,vb,ex,id){const H=headParts(m,ex,id),a=H.a,h=m.hue|0,D=H.D,sk=H.sk,B=bodyParts(m,a,0,id+'b',D,sk),inv=1/HK;
 const c1=m.bgc?tint(m.bgc,.25):hslx(h,80,95),c2=m.bgc?tint(m.bgc,.55):hslx(h+50,70,88);
 const bgd=nb?'':`<linearGradient id="${id}bg" x1="0" y1="0" x2=".5" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><radialGradient id="${id}bk"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
 const bg=nb?'':`<rect width="100" height="120" fill="url(#${id}bg)"/><circle cx="78" cy="26" r="30" fill="url(#${id}bk)" opacity=".6"/><circle cx="14" cy="98" r="20" fill="url(#${id}bk)" opacity=".45"/><g fill="#fff" opacity=".85"><path d="M12 16l1.5 3.7 3.7 1.5-3.7 1.5-1.5 3.7-1.5-3.7-3.7-1.5 3.7-1.5z"/><path d="M90 78l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z"/><circle cx="86" cy="12" r="1.2"/><circle cx="20" cy="40" r=".9"/></g>`;
 const T=`<g transform="scale(${N2(inv)}) translate(${N2(-HTX)} ${-HTY})">`;
 return`<svg viewBox="${vb||'0 0 100 120'}" ${s?`width="${s}"`:''} overflow="hidden" xmlns="http://www.w3.org/2000/svg"><defs>${H.defs}${bgd}<clipPath id="${id}fr"><rect width="100" height="120"/></clipPath></defs><g clip-path="url(#${id}fr)">${bg}${H.back}${T}${B.back}${B.neck}${B.torso}${B.collar}${B.arms}</g>${H.face}${H.feat}${H.brow}${H.bangs}${H.acc}${H.ties}${H.sl}${H.over}</g></svg>`}
function pt(m,s,nb,vb,ex){const a=apEff(m),k=JSON.stringify(['p4',m.id|0,m.hue|0,a,m.bgc||0,s||0,nb?1:0,vb||0,ex==null?'':ex]);let t=ART.cache.get(k);if(!t){t=ptBuild(m,s,nb,vb,ex,'§');if(ART.cache.size>3000)ART.cache.clear();ART.cache.set(k,t)}return t.split('§').join('p'+(++PTC[0]))}

// ---- asset registry: one entry per member ID, every screen draws from it ---------------
const CHAR_ASSETS={
 portrait:(m,s,ex)=>pt(m,s,0,null,ex),
 bust:(m,s,ex)=>pt(m,s,1,null,ex),
 face:(m,s,ex)=>pt(m,s,0,'16 26 68 62',ex),
 half:(m,w,ex,pose=0)=>{const e=apEff(m),a=ap(m);return`<svg viewBox="20 0 60 84" ${w?`width="${w}"`:''} class="chh" xmlns="http://www.w3.org/2000/svg">${fig(m,{pose,of:e.of,oh:e.oh,ac:a.ac,ex})}</svg>`},
 full:(m,w,ex,pose=0,of)=>{const e=apEff(m),a=ap(m);return`<svg class="chf" viewBox="10 -2 80 200" ${w?`width="${w}"`:''} role="img" aria-label="${esc(m.name||'Idol')}" xmlns="http://www.w3.org/2000/svg">${fig(m,{pose,of:of!=null?of[0]:e.of,oh:of!=null?of[1]:e.oh,ac:a.ac,ex})}</svg>`},
 entry:m=>({id:m.id,name:m.name,assets:{portrait:`char/${m.id}/portrait`,half:`char/${m.id}/half`,full:`char/${m.id}/full`,expressions:EXN.map((n,i)=>`char/${m.id}/expr/${i}`),costumes:OFN.map((n,i)=>`char/${m.id}/costume/${i}`)},design:{...ap(m),...dz(m)}})};
