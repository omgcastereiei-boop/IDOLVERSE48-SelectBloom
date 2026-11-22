// =====================================================================================
//  Costume Designer expansion — core
// -------------------------------------------------------------------------------------
//  Adds new component categories to the existing modular costume renderer (costume-parts.js)
//  without replacing anything. A component is a normal costume piece stored in the same design
//  object as every other piece:  design[categoryKey][componentKey] = piece
//  piece = { t, c1, c2, c3, pc, dc, pat, ps, pd, fab,           (existing fields)
//            sd:'B'|'L'|'R'   side (left / right / both) for side-able parts,
//            z:'back'|'mid'|'front'   layer, where the part allows it,
//            s, dx, dy, r     scale, offset and rotation (clamped per part),
//            ar               placement area (trims, embroidery),
//            op               opacity for sheer parts }
//  Old designs have none of these keys, so they draw exactly as before.
// =====================================================================================
const CZX={},CZX_CAT=[],CZX_TOP={},CZX_BOT={},CZX_COL={},CZX_OUT={},CZX_SLV={},CZX_DR={},CZX_PAT={};
const czxC=(v,a,b)=>Math.max(a,Math.min(b,+v||0));
function czxCat(k,n,jp,o={}){const c={k,n,jp,multi:1,grp:'more',items:[],...o};CZX_CAT.push(c);return c}
// def: {z:'mid'|'back'|'front'|'arm'|'head', zs:[allowed layers], lr:1 side-able, ax,ay anchor, mv:offset range, sc:[min,max], rot:max deg,
//       ar:[[area,name]...], col:[c1,c2,c3] default colours, tags:[...], draw(E,G) | arm(J,a1,a2,E,side) | head(E)}
function czxAdd(catK,key,n,def){const c=CZX_CAT.find(x=>x.k==catK);CZX[key]={cat:catK,n,mv:6,sc:[.7,1.4],rot:20,ax:50,ay:60,tags:[],...def};if(c&&!c.items.some(i=>i[0]==key))c.items.push([key,n]);return CZX[key]}
// ---- drawing helpers (figure frame 0..100 × 0..200) ---------------------------------------------------------------------------
const Q=N2;
const czxL=c=>czLine(c);
const czxGem=(x,y,r,c,f)=>`<path d="M${Q(x)} ${Q(y-r)}L${Q(x+r*.82)} ${Q(y-r*.2)}L${Q(x+r*.5)} ${Q(y+r)}H${Q(x-r*.5)}L${Q(x-r*.82)} ${Q(y-r*.2)}Z" fill="${f||c}" stroke="${czxL(c)}" stroke-width=".25"/><path d="M${Q(x-r*.82)} ${Q(y-r*.2)}H${Q(x+r*.82)}M${Q(x)} ${Q(y-r)}L${Q(x-r*.35)} ${Q(y-r*.2)}L${Q(x)} ${Q(y+r)}L${Q(x+r*.35)} ${Q(y-r*.2)}Z" stroke="#fff" stroke-width=".15" fill="none" opacity=".7"/>`;
const czxOval=(x,y,rx,ry,c)=>`<ellipse cx="${Q(x)}" cy="${Q(y)}" rx="${rx}" ry="${ry}" fill="${c}" stroke="${czxL(c)}" stroke-width=".25"/><ellipse cx="${Q(x-rx*.3)}" cy="${Q(y-ry*.35)}" rx="${Q(rx*.35)}" ry="${Q(ry*.25)}" fill="#fff" opacity=".6"/>`;
const czxPearl=(x,y,r,c='#fbf6ee')=>`<circle cx="${Q(x)}" cy="${Q(y)}" r="${r}" fill="${c}" stroke="${czxL(c)}" stroke-width=".12"/><circle cx="${Q(x-r*.3)}" cy="${Q(y-r*.3)}" r="${Q(r*.35)}" fill="#fff" opacity=".85"/>`;
function czxStar(x,y,r,c,n=5,ir=.45){let d='';for(let i=0;i<n*2;i++){const a=Math.PI*i/n-Math.PI/2,rr=i%2?r*ir:r;d+=(i?'L':'M')+Q(x+Math.cos(a)*rr)+' '+Q(y+Math.sin(a)*rr)}return`<path d="${d}Z" fill="${c}" stroke="${czxL(c)}" stroke-width=".2" stroke-linejoin="round"/>`}
const czxHeart=(x,y,s,c,st=1)=>`<path d="M${Q(x)} ${Q(y+2.6*s)}C${Q(x-3.4*s)} ${Q(y)} ${Q(x-2.6*s)} ${Q(y-2.6*s)} ${Q(x)} ${Q(y-1*s)}C${Q(x+2.6*s)} ${Q(y-2.6*s)} ${Q(x+3.4*s)} ${Q(y)} ${Q(x)} ${Q(y+2.6*s)}Z" fill="${c}" ${st?`stroke="${czxL(c)}" stroke-width=".22"`:''}/>`;
function czxFlower(x,y,r,n,c,cc,shape='round'){let s='';for(let i=0;i<n;i++){const a=360*i/n;s+=shape=='sakura'?`<path d="M0 0C${Q(-r*.55)} ${Q(-r*.5)} ${Q(-r*.45)} ${Q(-r*1.05)} ${Q(-r*.12)} ${Q(-r*1.05)}L0 ${Q(-r*.82)}L${Q(r*.12)} ${Q(-r*1.05)}C${Q(r*.45)} ${Q(-r*1.05)} ${Q(r*.55)} ${Q(-r*.5)} 0 0Z" fill="${c}" stroke="${czxL(c)}" stroke-width=".12" transform="rotate(${a})"/>`
 :shape=='pointed'?`<path d="M0 0Q${Q(-r*.35)} ${Q(-r*.6)} 0 ${Q(-r*1.1)}Q${Q(r*.35)} ${Q(-r*.6)} 0 0Z" fill="${c}" stroke="${czxL(c)}" stroke-width=".12" transform="rotate(${a})"/>`
 :`<ellipse cy="${Q(-r*.55)}" rx="${Q(r*.36)}" ry="${Q(r*.55)}" fill="${c}" stroke="${czxL(c)}" stroke-width=".12" transform="rotate(${a})"/>`}
 return`<g transform="translate(${Q(x)} ${Q(y)})">${s}<circle r="${Q(r*.28)}" fill="${cc}"/></g>`}
const czxLeaf=(x,y,s,a,c)=>`<path d="M0 0Q${Q(1.4*s)} ${Q(-1.4*s)} 0 ${Q(-3.4*s)}Q${Q(-1.4*s)} ${Q(-1.4*s)} 0 0Z" fill="${c}" stroke="${czxL(c)}" stroke-width=".15" transform="translate(${Q(x)} ${Q(y)}) rotate(${a})"/>`;
// beads / pearls / chain links along a polyline
function czxAlong(pts,step,fn){let out='',acc=0,k=0;for(let i=0;i<pts.length-1;i++){const[a,b]=[pts[i],pts[i+1]],L=Math.hypot(b[0]-a[0],b[1]-a[1]);let t=(step-acc)/L;while(t<=1){out+=fn(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,k++,Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI);t+=step/L}acc=(acc+L)%step}return out}
const czxCurve=(x0,y0,x1,y1,sag,n=12)=>[...Array(n+1)].map((_,i)=>{const t=i/n;return[x0+(x1-x0)*t,y0+(y1-y0)*t+Math.sin(t*Math.PI)*sag]});
const czxChain=(pts,c,step=1.1)=>czxAlong(pts,step,(x,y,k,a)=>`<ellipse cx="${Q(x)}" cy="${Q(y)}" rx=".55" ry=".32" fill="none" stroke="${c}" stroke-width=".26" transform="rotate(${Q(a+(k%2?90:0))} ${Q(x)} ${Q(y)})"/>`);
const czxPearls=(pts,c,r=.55,step=1.15)=>czxAlong(pts,step,(x,y)=>czxPearl(x,y,r,c));
function czxTassel(x,y,len,c,c2){const l=czxL(c);return`<path d="M${Q(x)} ${Q(y)}v1.6" stroke="${c2||c}" stroke-width=".5"/><circle cx="${Q(x)}" cy="${Q(y+2)}" r=".9" fill="${c2||c}" stroke="${czxL(c2||c)}" stroke-width=".15"/><path d="M${Q(x-1)} ${Q(y+2.8)}L${Q(x-1.4)} ${Q(y+2.8+len)}H${Q(x+1.4)}L${Q(x+1)} ${Q(y+2.8)}Z" fill="${c}" stroke="${l}" stroke-width=".18"/>${[-.8,-.3,.2,.7].map(o=>`<path d="M${Q(x+o)} ${Q(y+3.2)}V${Q(y+2.6+len)}" stroke="${l}" stroke-width=".1"/>`).join('')}`}
const czxRib=(x0,y0,x1,y1,w,c,l)=>`<path d="M${Q(x0-w/2)} ${Q(y0)}Q${Q((x0+x1)/2-w)} ${Q((y0+y1)/2)} ${Q(x1-w/2)} ${Q(y1)}L${Q(x1)} ${Q(y1-1.2)}L${Q(x1+w/2)} ${Q(y1)}Q${Q((x0+x1)/2+w*.2)} ${Q((y0+y1)/2)} ${Q(x0+w/2)} ${Q(y0)}Z" fill="${c}" stroke="${l}" stroke-width=".25"/>`;
const czxBow=(x,y,s,c,l,tails=1)=>bowS(Q(x),Q(y),s,c,l,tails);
const czxFur=(pts,c='#ffffff',r=1.3)=>czxAlong(pts,r*1.05,(x,y,k)=>`<circle cx="${Q(x)}" cy="${Q(y+(k%2?.3:-.2))}" r="${r}" fill="${c}"/>`)+czxAlong(pts,r*1.05,(x,y,k)=>`<circle cx="${Q(x+.3)}" cy="${Q(y+.5)}" r="${Q(r*.5)}" fill="#e6e1ee" opacity=".5"/>`);
// limb point at t (0 shoulder .. 1 hand) with its direction
function czxLimb(J,t){const S=limbPts(J,armProf,24);let q=S.find(z=>z.t>=t)||S[S.length-1];const i=S.indexOf(q),a=S[Math.max(0,i-1)],b=S[Math.min(S.length-1,i+1)];return{x:q.p[0],y:q.p[1],w:q.w,ang:Math.atan2(b.p[1]-a.p[1],b.p[0]-a.p[0])*180/Math.PI}}

// ---- applying the components to an outfit -------------------------------------------------------------------------------------
function czxPieces(cd){const out=[];if(!cd)return out;CZX_CAT.forEach(c=>{const M=cd[c.k];if(!M||typeof M!='object')return;Object.keys(M).forEach(t=>{const P=M[t],D=CZX[t];if(P&&D&&D.cat==c.k)out.push([P,D,t])})});return out}
function czxE(P,D,id,key,defsOut){const E={P,c1:P.c1||'#f7a8c8',c2:P.c2||'#ffffff',c3:P.c3||'#f3c35c',pc:P.pc||'#ffffff',dc:P.dc||'#ffffff',op:P.op==null?(D.op??1):+P.op,ar:P.ar||(D.ar?D.ar[0][0]:null),v:P.v|0,id:id+'X'+key};
 const r=czPat(E.id+'p',P);if(r.d)defsOut.push(r.d);E.f=r.f;E.l=czxL(E.c1);return E}
function czxTf(P,D,svg){const s=czxC(P.s??1,D.sc[0],D.sc[1]),dx=czxC(P.dx,-D.mv,D.mv);let dy=czxC(P.dy,-D.mv,D.mv);const r=czxC(P.r,-D.rot,D.rot);
 if(D.miny!=null&&D.ay+dy<D.miny)dy=D.miny-D.ay;if(!dx&&!dy&&s==1&&!r)return svg;
 return`<g transform="translate(${Q(dx+D.ax)} ${Q(dy+D.ay)}) rotate(${Q(r)}) scale(${Q(s)}) translate(${-D.ax} ${-D.ay})">${svg}</g>`}
const czxSides=(P,D)=>!D.lr?[0]:P.sd=='R'?[1]:P.sd=='L'||D.one?[0]:[0,1];
const czxMir=s=>`<g transform="translate(100 0) scale(-1 1)">${s}</g>`;
function czxLayer(P,D){const z=P.z&&(D.zs||[D.z]).includes(P.z)?P.z:D.z;return z}
function czxApply(cd,id,O,sk){const L=czxPieces(cd);if(!L.length)return;const defs=[],G={hem:O.topHem||71,sk:O.hemY||0,skin:sk[0],bot:O.bot};G.hw=G.sk?Math.min(30,13+(G.sk-69)*.42):0;if(O.skB&&O.skB.w>4&&O.skB.y>72){G.sk=(O.skB.y+69*.18)/1.18;G.hw=O.skB.w/1.18}O.armx=[];
 L.forEach(([P,D,key])=>{if(D.z=='head')return;const E=czxE(P,D,id,key,defs),sides=czxSides(P,D);
  if(D.z=='arm'||(D.armAr&&D.armAr.includes(E.ar))){O.armx.push({D,E,sides});return}
  let g='';try{const one=D.draw(E,G);if(!one)return;sides.forEach(sd=>{const t=czxTf(P,D,one);g+=sd?czxMir(t):t})}catch(e){console.error(e);return}
  if(E.op<1)g=`<g opacity="${Q(E.op)}">${g}</g>`;
  const z=czxLayer(P,D);if(z=='back')O.back=(O.back||'')+g;else if(z=='mid')O.mid=(O.mid||'')+g;else if(z=='over')O.over=(O.over||'')+g;else O.collar=(O.collar||'')+g});
 if(defs.length)O.defs=(O.defs||'')+defs.join('')}
{const f=modOutfit;modOutfit=function(cd,id,D,sk){let c2=cd;try{c2=czxPrep(cd)}catch(e){console.error(e)}const O=f.call(this,c2,id,D,sk);try{czxApply(c2,id,O,sk)}catch(e){console.error(e)}return O}}
// dresses and traditional base pieces are turned into existing base types before drawing (the original design is never changed)
function czxPrep(cd){if(!cd)return cd;let c=cd;const T=cd.top;
 if(cd.dr&&cd.dr.t&&cd.dr.t!='none'&&CZX_DR[cd.dr.t]){const R=CZX_DR[cd.dr.t],d=cd.dr;c={...cd,top:{...d,t:R.base||'blouse',_x:R.top||null,_dr:d.t},bottom:{...d,t:'__dr',_dr:d.t}};
  if(R.sl&&(!cd.sleeve||cd.sleeve.t=='none'))c.sleeve={...d,t:R.sl};if(R.col&&(!cd.collar||cd.collar.t=='none'))c.collar={...d,t:R.col,c1:R.colC?d[R.colC]:d.c1};if(R.noSl)c.sleeve={t:'none'}}
 else if(T&&CZX_TOP[T.t]&&CZX_TOP[T.t].base){c={...cd,top:{...T,t:CZX_TOP[T.t].base,_x:T.t}}}
 return c}
// arms: new sleeve types and arm components
{const f=armBuild;armBuild=function(sh,a1,a2,sk,O){const X=O&&CZX_SLV[O.sleeve];const r=f.call(this,sh,a1,a2,sk,X?{...O,sleeve:'none'}:O);
 try{const side=sh===SHL?0:1;if(X||(O.armx&&O.armx.length)){const[e1,e2]=ep(sh[0],sh[1],18.6,a1),[h1,h2]=ep(e1,e2,17,a2),J=[sh,[e1,e2],[h1,h2]];let add='';
  if(X)add+=X(J,a1,a2,O,side);(O.armx||[]).forEach(z=>{if(z.sides.includes(side))add+=z.D.arm(J,a1,a2,z.E,side)});r.s+=add}}catch(e){console.error(e)}return r}}
// head components (head frame 0..100 × 0..120)
function czxHasHead(cd){return czxPieces(cd).some(([,D])=>D.z=='head')}
function czxHeadTop(cd){let s='';try{const defs=[];czxPieces(cd).forEach(([P,D,key])=>{if(D.z!='head')return;const E=czxE(P,D,'§h',key,defs),sides=czxSides(P,D);let g='';const one=D.head(E);sides.forEach(sd=>{const t=czxTf(P,D,one);g+=sd?czxMir(t):t});if(E.op<1)g=`<g opacity="${Q(E.op)}">${g}</g>`;s+=g});if(defs.length)s=`<defs>${defs.join('')}</defs>`+s}catch(e){console.error(e)}return s}
// new head pieces are drawn above the hair (after the side locks), in the full figure and in portraits
{const f=headParts;headParts=function(){const r=f.apply(this,arguments);try{if(r&&r.a&&r.a.cd)r.top=czxHeadTop(r.a.cd)}catch(e){console.error(e)}return r}}
// dress / traditional skirt hook
CZX_BOT.__dr=(BO,fB,lB,id,pat,cd)=>{const R=CZX_DR[BO._dr];if(!R)return{svg:'',hem:90};return R.sk(BO,fB,lB,id,pat,cd)};
