// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Character Appearance expansion
// -------------------------------------------------------------------------------------
//  Extends the existing character art engine (characters.js); nothing is replaced.
//  New optional fields of a member's appearance record (m.ap). A record without them draws
//  exactly as before, so every existing character keeps her look.
//    fs   face shape (index into AP_FACES)            · old records: the member's own face
//    ft   bangs / front hair (BANGS, more styles)     · bk  back hair (backHair, more styles)
//    ah   ahoge (0 none, 1..7 shapes)                 · old records: the member's own ahoge
//    ey   eye shape (EYG, more silhouettes)           · br  eyebrow shape (APBR)
//    mt   mouth shape (APMT)                          · used when no expression is forced
//    hcx  custom hair colour  hc2x custom hair shadow colour
//    skx  custom skin colour  ecx custom eye colour  bcx custom eyebrow colour  lcx custom eyelash colour
//  Custom colours are exact "#rrggbb" strings; the palette indices (hc, ec, sk, bc) stay as they were.
// =====================================================================================
const apOkHex=v=>typeof v=='string'&&/^#[0-9a-f]{6}$/i.test(v);

// ---- colours --------------------------------------------------------------------------
// shading keeps working: the renderer builds its gradients, highlights and line colours from these
function apHairC(a){if(apOkHex(a.hcx))return['Custom',a.hcx,apOkHex(a.hc2x)?a.hc2x:mixc(a.hcx,'#140c1c',.38)];return HC[a.hc]||HC[0]}
function apEyeC(a){if(apOkHex(a.ecx))return['Custom',a.ecx,mixc(a.ecx,'#ffffff',.55)];return EC[a.ec]||EC[0]}
function apSkinC(a,D){if(apOkHex(a.skx))return[a.skx,mixc(a.skx,'#c46a5c',.16),mixc(a.skx,'#4f241c',.45)];return SKN[D.skin]||SKN[1]}

// ---- face shapes: genuinely different outlines (cheeks, jaw, chin), features stay aligned ---------
// t temple x · sb cheek bulge · cy cheek control y · jx/jy jaw control · cw chin half width · ch chin y · cr chin roundness
const AP_FACES=[
 ['Round face',{t:21.4,sb:1.4,cy:62,jx:12,jy:6,cw:14,ch:84,cr:1.2}],
 ['Oval face',{t:21.6,sb:.2,cy:58,jx:11,jy:7,cw:9.5,ch:86,cr:.8}],
 ['Soft oval face',{t:21.6,sb:.6,cy:60,jx:12,jy:7,cw:11,ch:85.5,cr:1}],
 ['Heart-shaped face',{t:21,sb:1,cy:55,jx:8,jy:10,cw:6,ch:87,cr:.4}],
 ['V-shaped face',{t:21.6,sb:0,cy:55,jx:7,jy:12,cw:4.5,ch:88,cr:.2}],
 ['Narrow face',{t:22.4,sb:-.6,cy:58,jx:9,jy:8,cw:7,ch:87,cr:.6}],
 ['Wide face',{t:20.6,sb:1.6,cy:64,jx:13,jy:5,cw:15,ch:83.5,cr:1.2}],
 ['Short face',{t:21.4,sb:.8,cy:59,jx:11,jy:5,cw:12.5,ch:82.4,cr:1}],
 ['Long face',{t:21.8,sb:0,cy:60,jx:10,jy:10,cw:9,ch:90,cr:.8}],
 ['Soft jawline',{t:21.4,sb:.8,cy:61,jx:14,jy:8,cw:12,ch:85,cr:1.4}],
 ['Defined jawline',{t:21.6,sb:0,cy:67,jx:3.6,jy:9,cw:10,ch:86,cr:.3}],
 ['Small chin',{t:21.6,sb:.6,cy:60,jx:13,jy:7,cw:5,ch:85,cr:.6}],
 ['Rounded chin',{t:21.6,sb:.4,cy:59,jx:10,jy:7,cw:12,ch:86,cr:2.2}],
 ['Pointed chin',{t:21.6,sb:.2,cy:57,jx:9,jy:11,cw:3,ch:88.6,cr:0}],
 ['Mature proportions',{t:22.2,sb:-.2,cy:60,jx:10,jy:9,cw:8,ch:88,cr:.6}],
 ['Youthful proportions',{t:21.2,sb:1.4,cy:63,jx:13,jy:5,cw:13,ch:83.6,cr:1.4}]];
function apFacePath(P){const{t,sb,cy,jx,jy,cw,ch,cr}=P,r=100-t;
 return`M${t} 46C${N2(t-sb)} ${cy} ${N2(50-cw-jx)} ${N2(ch-jy)} ${N2(50-cw*.4)} ${N2(ch-1)}Q50 ${N2(ch+cr)} ${N2(50+cw*.4)} ${N2(ch-1)}C${N2(50+cw+jx)} ${N2(ch-jy)} ${N2(r+sb)} ${cy} ${r} 46C${r} 27 66 18 50 18C34 18 ${t} 27 ${t} 46Z`}
// face shapes were removed from the editor: every character uses her own face again (a saved 'fs' is ignored)
function apFaceD(a,D){return facePath(D.face)}

// ---- bangs: more hand-tuned edges (right temple -> left temple, 't' = strand tip) --------------
function apBangGen(n,tip,root,side=66,xs=x=>x){const e=[[85,side,'t'],[81,44]];for(let i=0;i<n;i++){const t=(i+.5)/n,x=78-56*t,tr=(i+1)/n;e.push([N2(xs(x)),N2(tip(t,i)),'t']);if(i<n-1)e.push([N2(78-56*tr),N2(root(tr,i))])}e.push([19,44],[15,side,'t']);return{e}}
const AP_UNEVEN=[48,53.4,44,55,46.6,51.6,43,52.6,47];
BANGS.push(
 /*11 Straight*/   apBangGen(9,()=>51,()=>44),
 /*12 Thin*/       {...apBangGen(12,()=>50,()=>40,64),thin:1},
 /*13 Diagonal*/   apBangGen(8,t=>40+16*t,t=>33+14*t),
 /*14 Split*/      apBangGen(9,(t,i)=>i==4?30:50,(t,i)=>i==3||i==4?30:38),
 /*15 Rounded*/    apBangGen(9,t=>44+8*Math.sin(Math.PI*t),t=>37+6*Math.sin(Math.PI*t),62),
 /*16 Long*/       apBangGen(7,t=>55+3*Math.sin(Math.PI*t),()=>42,70),
 /*17 Layered*/    apBangGen(12,(t,i)=>i%2?54:45,()=>38),
 /*18 Fluffy*/     apBangGen(6,()=>48,()=>40,64),
 /*19 Uneven*/     apBangGen(9,(t,i)=>AP_UNEVEN[i],()=>37),
 /*20 Curved*/     apBangGen(8,t=>49+2*Math.sin(Math.PI*t),()=>38,66,x=>x+(50-x)*.18),
 /*21 Anime*/      apBangGen(5,(t,i)=>[46,54,62,54,46][i],(t,i)=>[34,32,32,34][i]||34,70));
FTN[7]='Blunt bangs';
FTN.push('Straight bangs','Thin bangs','Diagonal bangs','Split bangs','Rounded bangs','Long bangs','Layered bangs','Fluffy bangs','Uneven bangs','Curved bangs','Anime decorative bangs');

// ---- back hair: more silhouettes (cases 16..24) --------------------------------------------------
BKN[3]='Long wavy';BKN[9]='Side braid';BKN[15]='Short layered';
BKN.push('Short wavy','Shoulder-length','Waist-length','Shaggy','Half-down','Braided hair','Double braids','Double buns','Voluminous');
const AP_MED='M50 4C73 4 88 20 88 44C88 60 85 74 78 82L22 82C15 74 12 60 12 44C12 20 27 4 50 4Z';
{const f=backHair;backHair=function(bk,D,seed){const v=D.vol;switch(bk){
 case 16:return{b:`M50 3.6C73 3.6 88 20 88 42C90 54 86 62 90 70C86 74 88 80 84 84`+clumpEdge(tipsRow(84,16,84,7,3,seed,3))+`C12 80 14 74 10 70C14 62 10 54 12 42C12 20 27 3.6 50 3.6Z`,sk:5,s:84};
 case 17:return{b:longBack(98+v,1,seed,0,7,5),sk:0,s:96};
 case 18:return{b:longBack(176+v*2,2,seed,0,9,6),sk:1,s:150};
 case 19:return{b:longBack(126,5,seed,2,10,10),sk:4,s:110};
 case 20:return{b:longBack(146,3,seed,2),tie:[[74,22]],sk:1,s:124};
 case 21:return{b:longBack(150+v,1,seed),cbraid:1,sk:1,s:128};
 case 22:return{b:AP_MED,braids:[[30,80,24,156],[30,80,24,156,1]],tie:[[24,152],[76,152]],sk:0,s:78};
 case 23:return{b:`M50 5C72 5 86 21 86 44C86 58 82 68 76 74L24 74C18 68 14 58 14 44C14 21 28 5 50 5Z`,bun2:1,sk:0,s:76,ears:1};
 case 24:return{b:`M50 2C76 2 94 20 95 46C97 76 99 104 94 128`+clumpEdge(tipsRow(94,6,128,9,7,seed,4))+`C1 104 3 76 5 46C6 20 24 2 50 2Z`,sk:2,s:124}}
 return f.apply(this,arguments)}}
// braid over the shoulder: [x0,y0,x1,y1,mirror]; drawn exactly like the original side braid
function apBraidG(B,HF,hs){const[x0,y0,x1,y1]=B;let br='';for(let i=0;i<10;i++){const t=i/9,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t,w=5.6-t*1.6;br+=`<ellipse cx="${N2(x-1.7)}" cy="${N2(y)}" rx="${N2(w)}" ry="${N2(w*1.1)}" transform="rotate(-24 ${N2(x)} ${N2(y)})"/><ellipse cx="${N2(x+1.7)}" cy="${N2(y+4.2)}" rx="${N2(w)}" ry="${N2(w*1.1)}" transform="rotate(24 ${N2(x)} ${N2(y+4.2)})"/>`}
 return`<g fill="${HF}" ${hs}><path d="M33 72C29 78 27 82 28 88L32 88C33 82 35 78 37 74Z"/>${br}<path d="M${x1-3} ${y1+2}L${x1-2} ${y1+12}L${x1} ${y1+4}L${x1+2} ${y1+13}L${x1+3} ${y1+3}Z"/></g>`}
// braid across the crown (Braided hair)
function apCrownBraid(HF,hs){let s='';const N=13;for(let i=0;i<N;i++){const a=Math.PI*(1.12+.76*i/(N-1)),x=50+Math.cos(a)*31,y=40+Math.sin(a)*28,r=a*180/Math.PI+90;
 s+=`<ellipse cx="${N2(x)}" cy="${N2(y)}" rx="3.4" ry="2.3" transform="rotate(${N2(r+28)} ${N2(x)} ${N2(y)})"/>`}return`<g fill="${HF}" ${hs}>${s}</g>`}

// ---- ahoge: part of the bangs. Its base sits inside the crown (filled with the crown colour, no
//      outline across the base), so it grows out of the hair; it follows the bangs when they flip --
const AP_AHN=['None','Single curved strand','Double strands','Short curved strand','Long curved strand','Heart-shaped curve','Small upward curl','Side-curved strand'];
const AP_AHO={
 1:['M47.6 10C47 2 49 -5 56 -7C53 -3 52 2 52.4 10'],
 2:['M46.8 10.4C45 3 45 -3 49.6 -6.4C47.6 -2 48.4 3 49.6 10','M50.4 10C51.4 3 54 -2 59 -2.6C55 0 53 4 53.2 10.4'],
 3:['M48 10C48 5 50 1 54.6 0C52 3 51.6 6 52 10'],
 4:['M47.6 10C46 0 50 -11 60.4 -11C54 -8 52.2 -1 52.4 10'],
 5:['M48 10C47 3 41.6 -1 43.6 -6C45.6 -10.6 50 -7.4 50 -3.4C50 -7.4 54.4 -10.6 56.4 -6C58.4 -1 53 3 52 10'],
 6:['M48.4 10C48 6 49 3 51 1C53.4 -1 55.6 1.2 54.4 3.4C53.4 2.2 51.8 3 51.6 6C51.6 8 51.8 9 52 10'],
 7:['M38.4 11.6C36 4 31 0 25.6 1.2C31 -1.8 38.4 2 42.6 10.6']};
function apAhoge(k,hb,hl,hlite){const P=AP_AHO[k];if(!P)return'';const fill=mixc(hb[1],'#ffffff',.16);
 return P.map(d=>`<path d="${d}Z" fill="${fill}"/><path d="${d}" fill="none" stroke="${hl}" stroke-width=".7" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${hlite}" stroke-width=".5" opacity=".45" transform="translate(.5 .6) scale(.99)"/>`).join('')}

// ---- eyes: new silhouettes [halfWidth, height, tilt, iris, peak shift, lower-lid roundness, lash style, inner drop, lid openness]
EYG.push(
 [11,13,-4.6,.9,.6,.8,2],      // Cat-like
 [11.4,10.6,-2.8,.9,.4,.7,1],  // Sharp
 [10.6,15.4,1.2,1,-.2,1.15,0], // Soft
 [10.8,14,3.8,1,-.5,1,1,1.2],  // Droopy
 [10,18,0,1.04,0,1.25,0],      // Innocent
 [11.6,12.6,-2.4,.92,.5,.85,2],// Elegant
 [11.8,11.6,-1.4,.9,.3,.8,1],  // Mature
 [10.2,16.6,.4,1.06,-.1,1.2,3],// Cute
 [11,13,1.6,.98,0,1,1,0,.7],   // Sleepy
 [10.8,17.6,-1.2,1.02,.2,1.1,3]); // Expressive
EYN.push('Cat-like','Sharp','Soft','Droopy','Innocent','Elegant','Mature','Cute','Sleepy','Expressive');

// ---- eyebrows: li/lo inner & outer reach · arch · th thickness · tilt (outer end, + = down) · pk arch position
const APBR=[
 {li:6,lo:8.4,arch:-.8,th:.8,tilt:0,pk:.5},{li:6,lo:8.4,arch:-2,th:.9,tilt:0,pk:.5},{li:6,lo:8.4,arch:-3.2,th:.75,tilt:0,pk:.5},{li:6,lo:8.4,arch:-1,th:1,tilt:-1,pk:.5},
 {li:6,lo:8.4,arch:-1.2,th:.45,tilt:0,pk:.5},   // Thin
 {li:6,lo:8.4,arch:-1,th:1.6,tilt:0,pk:.5},     // Thick
 {li:5,lo:7.4,arch:-2.6,th:1,tilt:0,pk:.45},    // Rounded
 {li:6,lo:8.4,arch:-2.4,th:.9,tilt:.6,pk:.72},  // Sharp
 {li:6,lo:8.4,arch:-1,th:.9,tilt:1.8,pk:.4},    // Downturned
 {li:6,lo:8.4,arch:-1.4,th:.9,tilt:-2.2,pk:.6}, // Upturned
 {li:3.6,lo:5.6,arch:-.8,th:.95,tilt:0,pk:.5},  // Short
 {li:7,lo:10,arch:-1.6,th:.85,tilt:.2,pk:.5},   // Long
 {li:6,lo:8.6,arch:-1.4,th:1.1,tilt:.2,pk:.6},  // Natural
 {li:6.4,lo:9,arch:-3.4,th:1.2,tilt:-1.2,pk:.4}]; // Expressive anime
BRN.push('Thin','Thick','Rounded','Sharp','Downturned','Upturned','Short','Long','Natural','Expressive anime');

// ---- mouth shapes ------------------------------------------------------------------------------
const APMT=[
 ['Small smile',D=>mouthX({mo:'smile'},{...D,mw:D.mw*.78})],
 ['Wide smile',D=>mouthX({mo:'smile'},{...D,mw:D.mw*1.38})],
 ['Closed smile',D=>{const L=x=>N2(50+(x-50)*D.mw),y=76;return`<path d="M${L(45.8)} ${y-1.2}Q50 ${y+2.4} ${L(54.2)} ${y-1.2}" stroke="#a8455c" stroke-width="1.15" fill="none" stroke-linecap="round"/><path d="M${L(45.2)} ${y-1.8}l.8 .9M${L(54.8)} ${y-1.8}l-.8 .9" stroke="#a8455c" stroke-width=".7" stroke-linecap="round"/>`}],
 ['Open smile',D=>mouthX({mo:'open'},D)],
 ['Slightly open mouth',D=>{const L=x=>N2(50+(x-50)*D.mw),y=76;return`<path d="M${L(47.6)} ${y-.4}Q50 ${y-.1} ${L(52.4)} ${y-.4}Q${L(52)} ${y+2.2} 50 ${y+2.3}Q${L(48)} ${y+2.2} ${L(47.6)} ${y-.4}Z" fill="#a33a55" stroke="#a8455c" stroke-width=".5"/>`}],
 ['Neutral mouth',D=>mouthX({mo:'flat'},D)],
 ['Small rounded mouth',D=>`<ellipse cx="50" cy="76.8" rx="${N2(1.4*D.mw)}" ry="1.6" fill="#a33a55" stroke="#a8455c" stroke-width=".5"/>`],
 ['Cat-like mouth',D=>{const y=76;return`<path d="M46.2 ${y-.6}Q48.1 ${y+1.8} 50 ${y-.2}Q51.9 ${y+1.8} 53.8 ${y-.6}" stroke="#a8455c" stroke-width="1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`}],
 ['Pout',D=>mouthX({mo:'pout'},D)],
 ['Slight frown',D=>mouthX({mo:'sad'},D)],
 ['Laughing mouth',D=>mouthX({mo:'big'},D)],
 ['Cute anime mouth',D=>{const y=76;return`<path d="M48 ${y-.8}L52 ${y-.8}L50 ${y+2.2}Z" fill="#a33a55" stroke="#a8455c" stroke-width=".55" stroke-linejoin="round"/><path d="M49 ${y+.8}L51 ${y+.8}L50 ${y+2}Z" fill="#f490a8"/>`}],
 ['Elegant smile',D=>{const L=x=>N2(50+(x-50)*D.mw),y=76;return`<path d="M${L(45.4)} ${y-1.4}C${L(47.4)} ${y+.6} ${L(52.6)} ${y+.6} ${L(54.6)} ${y-1.4}" stroke="#a8455c" stroke-width=".9" fill="none" stroke-linecap="round"/><path d="M49 ${y+1.9}Q50 ${y+2.4} 51 ${y+1.9}" stroke="#c97a8c" stroke-width=".5" fill="none" stroke-linecap="round"/>`}],
 ['Asymmetrical smile',D=>mouthX({mo:'smirk'},D)]];
