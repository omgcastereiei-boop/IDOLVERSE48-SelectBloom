// =====================================================================================
//  IDOLVERSE48: Select Bloom! — General Election: realistic voters & votes (extends election2.js)
// -------------------------------------------------------------------------------------
//  What was wrong: every buying fan received the full quantity of her category (Hardcore up to ~40 CDs,
//  ×1.5 for a Kami Oshi), and the daily volume was then scaled to the CD sales by e.k2. When k2 < 1 the
//  scaling removed BUYERS but kept the per-buyer quantity, so a few hundred voters produced tens of
//  thousands of votes (averages of 30–400 votes per voter). Casual fans could also buy voting CDs.
//  Now (same fan segments, same timing, motivation, graduation, budget and allocation logic):
//   · Casual fans never buy voting CDs. Regular / Dedicated / Hardcore fans take part with their own
//     probability (category × loyalty × engagement × Kami Oshi tie), modified by the existing systems
//     (motivation, preliminary reactions, fatigue, pairing, budget left) — as before, but bounded.
//   · A participating fan buys a number of codes drawn from a heavy-tailed distribution for her
//     category: most buy 1–3, fewer 4–10, a small minority 10+, very few 50+. The scale follows the
//     segment's spending power (existing fan budget fxBud, willingness to spend) and the hard ceiling is
//     what she can afford during the voting period (budget left + monthly budget × months, ÷ ¥300).
//   · The volume is the fans' own purchases — no scaling to the CD sales. Release-day CDs from the
//     existing sales system carry voting codes; codes nobody plans to use simply expire (tokens ≥ cast).
//     If fans want more on release day than were sold, the rest is bought in the following days.
//   · Unique voters, votes and "heavy voter" shares are recorded from the same distribution, so
//     Average = Total Votes ÷ Unique Voters is consistent with the purchases. Supporters, eligible
//     supporters (non-Casual) and group-level unique voters (a fan counted once) are recorded too.
//  Elections already finished keep their archived statistics. A running election switches on the next day.
// =====================================================================================
const GV4={BASE:{oshi:.09,dedicated:.28,hardcore:.52,collector:.52},MED:{oshi:1.1,dedicated:1.9,hardcore:3.3,collector:3.3},SIG:{oshi:.5,dedicated:.72,hardcore:.95,collector:.95},
 CAP:{oshi:12,dedicated:60,hardcore:250,collector:250},Q:[1,2,3,4,5,6,8,10,12,15,20,25,30,40,50,60,80,100,120,150,200,250],HEAVY:10,MAXMED:{oshi:2,dedicated:4,hardcore:6.5,collector:6.5}};
const gv4Phi=x=>{const t=1/(1+.2316419*Math.abs(x)),d=.3989423*Math.exp(-x*x/2),p=d*t*(.3193815+t*(-.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return x>0?1-p:p};
const GV4_D={};
// codes per participating voter: discrete heavy-tailed distribution, truncated at what she can afford
function gv4Dist(ft,med,cap){med=Math.max(.6,Math.min(med,cap*.6));const k=ft+'|'+med.toFixed(2)+'|'+Math.round(cap);if(GV4_D[k])return GV4_D[k];const s=GV4.SIG[ft]||.6,Q=GV4.Q.filter(q=>q<=cap);if(!Q.length)Q.push(1);
 const P=Q.map((q,i)=>{const lo=i?Math.sqrt(Q[i-1]*q):0,hi=i<Q.length-1?Math.sqrt(q*Q[i+1]):Infinity;const a=lo>0?gv4Phi((Math.log(lo)-Math.log(med))/s):0,b=hi==Infinity?1:gv4Phi((Math.log(hi)-Math.log(med))/s);return Math.max(0,b-a)});
 const t=P.reduce((x,y)=>x+y,0)||1;for(let i=0;i<P.length;i++)P[i]/=t;const mean=Q.reduce((a,q,i)=>a+q*P[i],0);if(Object.keys(GV4_D).length>4000)for(const z in GV4_D)delete GV4_D[z];return GV4_D[k]={Q,P,mean}}
// share of voters giving at least one code to a member they give `a` of each code to, and codes from heavy givers
const gv4Give=(D,a)=>D.Q.reduce((x,q,i)=>x+D.P[i]*Math.min(1,q*a),0);
const gv4Heavy=(D,a)=>{let h=0;D.Q.forEach((q,i)=>{if(q*a>=GV4.HEAVY)h+=D.P[i]*q*a});const t=D.mean*a;return t>0?h/t:0};
const gv4FtOf=ft=>ft=='collector'?'hardcore':ft;
// what election2 would have used (to keep the relative changes made by motivation / fatigue / budget wrappers)
function gv4Old(s,kc,os){const loy=(s.loy??40)/100,eng=(s.eng??50)/100,sp=(s.sp??40)/100,tie=kc!=null?1.25:os>0?.8:.45,age=1+Math.min(.15,Math.max(0,S.day-(s.born||0))/365*.1);
 return{p:Math.min(.97,(GE2.BUY[s.ft]||.2)*(.4+.6*loy)*(.6+.8*eng)*tie*age),q:1+(GE2.QTY[s.ft]||2)*Math.pow(sp,1.6)*(.5+loy)*(kc!=null?1.5:.6)}}
function gv4On(e){if(!e||e.st!='voting')return!!(e&&e.v4);if(!e.v4){e.v4=S.day;e.k2=1}return true}
// election-wide reference for the motivation / community multipliers (so a multiplier means "relative to a normal fan")
function gv4Ref(e){if(e.mvRef)return e.mvRef;GV4.busy=1;let w=0,l=0;try{geProfs(e).forEach(P=>{const m=(P.mk||1)*(P.mot||1);if(P.n>0&&m>0){w+=P.n;l+=P.n*Math.log(m)}})}finally{GV4.busy=0}return e.mvRef=+(w?Math.exp(l/w):1).toFixed(4)}
{const f=geProf;geProf=function(e,s,PS){const P=f.apply(this,arguments);try{if(GV4.busy||!P||!e||!gv4On(e)||!s)return P;const ref=gv4Ref(e);const ft=gv4FtOf(s.ft);
  if(!GV4.BASE[ft]){P.p=0;P.q=1;P.mk=1;P.mot=1;P.v4=1;P.d=gv4Dist('oshi',1,1);return P}
  let os=0;for(const j in s.o)if(PS.has(+j)&&s.o[j]>0)os++;const O=gv4Old(s,P.kc,os),loy=(s.loy??40)/100,eng=(s.eng??50)/100,tie=P.kc!=null?1:os>0?.72:.35;
  const rp=geCl2(O.p>0?P.p/O.p:1,.25,2.6),rq=geCl2(O.q>1?(P.q-1)/(O.q-1):1,.3,2.4),gg=P.kc!=null&&e.gs&&e.gs[P.kc],gf=gg&&((typeof GV3!='undefined'&&GV3.day!=null?GV3.day:S.day)>=gg.day)?Math.max(1,+gg.f||1):1,MvRaw=(P.mk||1)*(P.mot||1)/ref/gf,Mv=geCl2(MvRaw,.2,5),half=Math.sqrt(Mv)*Math.sqrt(gf);P.mvRaw=+MvRaw.toFixed(3);P.rp=+rp.toFixed(3);
  let p=GV4.BASE[ft]*(.6+.4*loy)*(.7+.6*eng)*tie*rp*half,qx=1;if(p>.95){qx=Math.sqrt(p/.95);p=.95}
  // spending power: the segment's monthly budget relative to its category, and what is affordable during the voting period
  let rel=1,cap=GV4.CAP[ft];try{if(typeof fxBud=='function'){fxSeg(s);const b=fxBud(s)||FX_BUD[ft]||900,mon=Math.max(.5,(e.vEnd-Math.max(S.day,e.vStart))/30);rel=geCl2(Math.pow(b/(FX_BUD[ft]||900),.35),.5,1.6);cap=Math.max(1,Math.min(GV4.CAP[ft],Math.floor((Math.max(0,s.bl||0)+b*mon)/SE_PRICE)))}}catch(x){}
  const med=Math.min(GV4.MAXMED[ft],GV4.MED[ft]*rel*(.85+.3*loy)*geCl2(rq,.5,1.8)*geCl2(half*qx/Math.sqrt(gf),.6,2)*Math.pow(gf,.3)),D=gv4Dist(ft,med,cap);
  // an Oshi who announced her graduation during the voting: fans move part of their (same) budget to her and some join in
  if(P.sh&&e.gs){const day=(typeof GV3!='undefined'&&GV3.day!=null)?GV3.day:S.day;let moved=0;for(const j in P.sh){if(j=='_f'||+j===P.kc)continue;const g=e.gs[j];if(!g||day<g.day||!(g.f>1.2))continue;
   const from=P.kc!=null&&P.sh[P.kc]>0?String(P.kc):null;if(!from)continue;const aff=geCl2(((P.s.af||{})[j]??50)/100,0,1),d=Math.min(P.sh[from]*.08,P.sh[from]*.015*(g.f-1)*aff);if(d>0){if(!moved)P.sh={...P.sh};P.sh[from]-=d;P.sh[j]+=d;moved=Math.max(moved,g.f)}}
   if(moved)P.gshift=1}
  P.p=+p.toFixed(4);P.q=D.mean;P.d=D;P.mk=1;P.mot=1;P.v4=1;P.cap=cap}catch(x){console.error(x)}return P}}
// release day: fans' own release-day purchases (no scaling to the CD sales)
{const f=geRelAttr;geRelAttr=function(e,units){if(!e||!gv4On(e))return f.apply(this,arguments);e.k2=1;const T=Math.max(1,e.vEnd-e.vStart),PR=geProfs(e),W={};let R=0;
 PR.forEach((P,i)=>{const w=P.n*P.p*P.q*GE2.R0*geR0f(P.st)/geZ(P.st,T);W[i]=w;R+=w});const give=Math.min(units,Math.round(R)),sp=geSplit(give,W),FW=geFloatW(e);PR.forEach((P,i)=>geGive(e,P,sp[i]||0,FW));
 e.rc=R>units?{left:Math.round(R-units),days:7}:null;e.unused=(e.unused||0)+Math.max(0,units-give);return units}}
// release-day demand that exceeded the CDs sold is bought over the following week
{const f=geBuyDay;geBuyDay=function(e,x,d){const u=f.apply(this,arguments);try{if(e&&e.v4&&e.rc&&e.rc.left>0&&e.rc.days>0){const c=Math.ceil(e.rc.left/e.rc.days);e.rc.left-=c;e.rc.days--;const PR=geProfs(e),W={};PR.forEach((P,i)=>W[i]=P.n*P.p*P.q);const sp=geSplit(c,W),FW=geFloatW(e);let g=0;PR.forEach((P,i)=>{if(sp[i])g+=geGive(e,P,sp[i],FW)});return u+g}}catch(z){console.error(z)}return u}}
// ---- statistics recording (replaces the class pool estimate for v4 elections) ---------------------------------------------
{const f=geVxRec;geVxRec=function(e,P,b0,FW){if(!e||!e.v4||!P||!P.d)return f.apply(this,arguments);if(e.final||e.st=='done')return;
 const X=e.vx=e.vx||{from:S.day,c:{}},s=P.s,ft=gv4FtOf(s.ft||'casual'),n=s.n||0,V=n*P.p,D=P.d;X.v4=1;X.sv=X.sv||{};X.sv[s.id]=Math.max(X.sv[s.id]||0,V);
 let fw=null,fwT=0;const FWx=()=>{if(!fw){fw=FW||geFloatW(e);for(const k in fw)fwT+=fw[k]}return fw};
 for(const k in e.buy){const d=(e.buy[k]||0)-(b0[k]||0);if(d<=0)continue;const mid=+k,shm=(P.sh&&P.sh[k])||0,rel=P.kc==mid?'k':shm>0?'o':'f';let pool,a;
  if(rel=='k'){pool=V;a=shm}else if(rel=='o'){const oj=Math.max(1,Math.min(n,(s.o||{})[mid]||0));pool=oj*P.p;a=Math.min(1,shm*n/oj)}else{const F=FWx(),sh=fwT?(F[mid]||0)/fwT:0,fl=(P.sh&&P.sh._f)||0;pool=V;a=fl*sh}
  const g=gv4Give(D,a),E=pool*g,per=g>0?D.mean*a/g:1,hv=gv4Heavy(D,a);const M=X.c[mid]=X.c[mid]||{},key=ft+'|'+rel,c=M[key]=M[key]||{T:0,Aw:0,E:0,Ed:0,d:S.day,H:0};
  if(c.d!=S.day){c.E=Math.max(c.E,c.Ed);c.Ed=0;c.d=S.day}c.Ed+=E;c.T+=d;c.Aw+=d*Math.max(1,per);c.H=(c.H||0)+d*hv}}}
const gv4Sup=e=>{const live=new Set(geLive(e)),M={};let all=0,el=0;geSegs().forEach(s=>{if(!(s.n>0))return;const ft=gv4FtOf(s.ft),elig=!!GV4.BASE[ft];let any=false;const add=(id,n)=>{const r=M[id]=M[id]||{sup:0,el:0};r.sup+=n;if(elig)r.el+=n;any=true};
 if(s.k!=null&&live.has(s.k))add(s.k,s.n);for(const j in s.o)if(+j!==s.k&&live.has(+j))add(+j,Math.min(s.n,s.o[j]));if(any){all+=s.n;if(elig)el+=s.n}});return{M,all,el}};
{const f=geVsBuild;geVsBuild=function(e){const F=e&&e.final,X=e&&e.vx;if(!F||F.vs||!X||!X.v4)return f.apply(this,arguments);const SU=gv4Sup(e);
 const rows=F.rows.map(r=>{const C=X.c[r.id]||{},votes=r.votes||0,buy=(e.buy||{})[r.id]||0,cf=buy>0?Math.min(1,votes/buy):0;let uv=0,heavyV=0;const mixV={},mixU={};
  Object.entries(C).forEach(([key,c])=>{const E=Math.max(c.E,c.Ed),a=c.T>0?c.Aw/c.T:1,U=Math.min(E,c.T/a),Uc=U*(1-Math.pow(1-cf,Math.max(1,a))),Vc=c.T*cf;uv+=Uc;heavyV+=(c.H||0)*cf;const[ft,rel]=key.split('|');
   mixV[rel]=(mixV[rel]||0)+Vc;mixU[rel]=(mixU[rel]||0)+Uc;const g=ft=='oshi'?'regular':ft;mixV[g]=(mixV[g]||0)+Vc;mixU[g]=(mixU[g]||0)+Uc});
  uv=votes>0?Math.max(1,Math.min(votes,Math.round(uv))):0;const R=o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,Math.round(v)]));const su=SU.M[r.id]||{sup:0,el:0};
  return{id:r.id,name:r.name,stage:r.stage,rank:r.rank,wd:r.withdrawn?1:0,votes,uv,avg:uv?Math.round(votes/uv*100)/100:0,heavy:votes?Math.round(Math.min(votes,heavyV)/votes*1000)/10:0,mv:R(mixV),mu:R(mixU),sup:Math.round(su.sup),el:Math.round(su.el)}});
 const tv=rows.reduce((a,r)=>a+r.votes,0),gu=Object.values(X.sv||{}).reduce((a,v)=>a+v,0),cfAll=e.cast>0&&e.tokens>0?Math.min(1,e.cast/Math.max(1,Object.values(e.buy||{}).reduce((a,v)=>a+v,0))):1;
 return F.vs={v:2,day:S.day,partial:X.from>e.vStart?X.from:null,rows,grp:{sup:Math.round(SU.all),el:Math.round(SU.el),uv:Math.min(tv,Math.round(gu*Math.min(1,cfAll*1.02))),votes:tv,unused:Math.max(0,(e.tokens||0)-(e.cast||0))}}}}
// ---- statistics UI: fan-category mix, supporters / turnout, average change, group totals ------------------------------------
{const f=geVsHtml;geVsHtml=function(e){let h=f.apply(this,arguments);try{const V=e&&e.final&&e.final.vs;if(!V||V.v!=2)return h;const N=x=>Math.round(x||0).toLocaleString(),A=x=>(x||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}),P=geVsPrev(e),G=V.grp||{};
  // the bar under each name: votes by fan category (Hardcore / Dedicated / Regular); Casual fans never vote
  const byId=new Map(V.rows.map(r=>[r.id,r]));h=h.replace(/Bar under each name: votes from <b style="color:#d6457f">heavy<\/b> · <b style="color:#9b7fe0">regular &amp; dedicated<\/b> · <b style="color:#5aa9e6">casual<\/b> voters\./,'Bar under each name: votes from <b style="color:#d6457f">Hardcore</b> · <b style="color:#9b7fe0">Dedicated</b> · <b style="color:#5aa9e6">Regular</b> fans (Casual fans do not buy voting CDs).');
  h=h.replace(/% of her votes from heavy voters \(10\+ votes each\)/g,'% of her votes came from voters who cast 10+ votes for her');
  h=h.replace(/<span class="gevmix">[\s\S]*?<\/span>(?=<\/div><\/td><td>)/g,(m)=>m);
  const sum=`<div class="gevgrp"><div><small>Total valid votes</small><b>${N(G.votes)}</b></div><div><small>Unique voters (group, each fan once)</small><b>${N(G.uv)}</b></div><div><small>Average votes per voter (group)</small><b>${A(G.uv?G.votes/G.uv:0)}</b></div><div><small>Supporters of the candidates</small><b>${N(G.sup)}</b></div><div><small>Eligible supporters (not Casual)</small><b>${N(G.el)}</b></div><div><small>Turnout of eligible supporters</small><b>${G.el?(G.uv/G.el*100).toFixed(1):'0.0'}%</b></div></div>`;
  h=h.replace('<div class="gevhl">',sum+'<div class="gevhl">');
  h=h.replace('<th><button class="gevsb','<th>Supporters</th><th>Turnout</th><th><button class="gevsb').replace(/(<th><button class="gevsb[^"]*" onclick="geVsSort\('avg'\)">[^<]*<\/button><\/th>)/,'$1');
  // rows: insert supporters / turnout cells and the average-per-voter change
  h=h.replace(/<tr class="([^"]*)"><td class="gevm">([\s\S]*?)<\/tr>/g,(m,cls,body)=>{const nm=body.match(/<b>([^<]*)<\/b>/);const r=V.rows.find(z=>esc(z.stage||z.name)==(nm&&nm[1]));if(!r)return m;const pv=P&&P.get(r.id);
   const cells=body.split('</td><td>');if(cells.length<5)return m;const turn=r.el?(r.uv/r.el*100).toFixed(1)+'%':'—';
   const mix=`<span class="gevmix">${[['hardcore','#d6457f'],['dedicated','#b28be8'],['regular','#9fd3ff']].map(([k,c])=>`<i style="width:${((r.mv[k]||0)/Math.max(1,r.votes)*100).toFixed(1)}%;background:${c}" title="${k}: ${N(r.mv[k])} votes · ${N(r.mu[k])} voters"></i>`).join('')}</span>`;
   cells[0]=cells[0].replace(/<span class="gevmix">[\s\S]*?<\/span>/,mix);
   const avgD=pv&&pv.uv?`<small class="${r.avg>=pv.avg?'up':'dn'}">${r.avg>=pv.avg?'+':'−'}${A(Math.abs(r.avg-pv.avg))}</small>`:'';
   cells[4]=cells[4].replace(/<\/td>$/,'')+avgD+'</td>';cells.splice(1,0,N(r.sup),turn);return`<tr class="${cls}"><td class="gevm">${cells.join('</td><td>')}</tr>`});
  h=h.replace('Unique Voters count each fan once per member (a fan who supported several members counts once for each).','Supporters are the unique fans who support a member (Kami Oshi or Oshi); only Regular, Dedicated and Hardcore fans buy voting CDs. Unique Voters count each fan once per member (a fan who voted for several members counts once for each; the group total counts her once). Turnout = Unique Voters ÷ eligible supporters.');
 }catch(x){console.error(x)}return h}}
