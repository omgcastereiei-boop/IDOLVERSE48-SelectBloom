// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Idol Pairings (fan-driven "ships")
// -------------------------------------------------------------------------------------
//  There are NO official pairs, NO company-made pairings and NO pairing activities. Fans notice two
//  members through what already happens in the game — shared Theater performances, Theater Units /
//  duets, shared singles, variety appearances (External Events), social-media moments and backstage
//  moments that grow out of real friendships (rel.js), Request Hour duets, General Election results and
//  GL Series (Drama Studio). Every moment adds fan "interest"; a pairing only appears once enough
//  interest has built up, and its numbers keep moving afterwards (they rise, fade and can recover).
//
//  Data: S.pairs = { v, p:{ "a-b": pair }, c:{ "a-b": {i (interest), d (last), n (moments)} }, wk }
//   pair = { a, b, born, why (first spark), chem, pop, tr (trend), sb (short-term ship boost),
//            pf (Pair Fans, derived), pfu, wk:{...shared work counters}, works:[{d,k,t}], h:[{d,t,x}],
//            hist:[[day,pop,pf,tr,chem]], gl:[prodId], last }
//  Pair Fans are NOT extra people: they are counted inside the existing unique fan database
//  (S.fb.segs). For each fan cohort the fans who already support both members are estimated from the
//  cohort's Kami Oshi / Oshi / supporter counts, and the share of them who "ship" the two depends on the
//  pairing's popularity. Fans who came from a GL Series for the couple are tagged on their cohort (s.pr).
//  General Election: Pair Fans only redistribute their own cohort's existing votes between the two
//  members (no bonus votes, no special ballots, the token system is untouched).
//  Request Hour: only songs performed by exactly two members who are an existing pairing affect it,
//  after the results are final, through the song's real placing. The Request Hour pages are unchanged.
// =====================================================================================
const PR_BORN=100,PR_MAXC=600;
function prS(){if(!S)return null;if(!S.pairs||typeof S.pairs!='object')S.pairs={v:1,p:{},c:{},wk:null};const P=S.pairs;P.p=P.p||{};P.c=P.c||{};return P}
const prKey=(a,b)=>a<b?a+'-'+b:b+'-'+a;
const prM=id=>get(id)||(S.alumni||[]).find(m=>m.id==id)||null;
const prNm=m=>m?(m.stage||m.name):'?';
const prAct=m=>!!m&&S.members.includes(m)&&isAct(m);
const prCl=v=>Math.max(0,Math.min(100,v));
function prGet(a,b){return prS().p[prKey(a,b)]||null}
function prOf(id){return Object.values(prS().p).filter(p=>p.a==id||p.b==id)}
function prBond(a,b){try{const R=typeof relGet=='function'?relGet(a,b):null;return R?Math.min(...R.x):null}catch(e){return null}}
function prHist(P,t,x){P.h=P.h||[];P.h.push({d:S.day,t,x:x||''});if(P.h.length>40)P.h=[P.h[0],...P.h.slice(-39)]}
// appeal of a moment: popular members and visible chemistry make fans notice more
function prAppeal(A,B,chem){return(.55+((A.pop||0)+(B.pop||0))/220)*(.55+(chem||30)/110)}
// ---- one moment between two members -------------------------------------------------------------------------------------
// kind: theater · unit · duet · song · variety · social · backstage · concert · gl · rh · ge
const PR_KIND={theater:['Shared Theater performance',.6,.2],unit:['Theater Unit together',4,1],duet:['Duet together',9,2.4],song:['Shared song',.8,.3],variety:['Variety show together',7,2],social:['Photos together on social media',6,1.6],backstage:['Backstage moment',5,1.4],concert:['Concert interaction',4,1.2],gl:['GL Series',30,8],rh:['Request Hour',0,0],ge:['General Election',0,0]};
function prSpark(a,b,kind,mult,txt){if(a==b||a==null||b==null)return null;const A=prM(a),B=prM(b);if(!prAct(A)||!prAct(B))return null;const K=PR_KIND[kind]||['Moment',3,1],R=prS(),k=prKey(a,b);let P=R.p[k];
 const chem=P?P.chem:prChemGuess(a,b),amt=K[1]*(mult==null?1:mult)*prAppeal(A,B,chem);if(!(amt>0))return P;
 if(P){P.tr=prCl(P.tr+amt*1.1);P.pop=prCl(P.pop+K[2]*(mult==null?1:mult)*(1-P.pop/110));P.sb=Math.min(40,(P.sb||0)+amt*.25);P.last=S.day;P.mom=(P.mom||0)+1;
  if(amt>=4||kind=='duet'||kind=='gl'||kind=='variety')prHist(P,kind,txt||K[0]);prWork(P,kind,txt);return P}
 const c=R.c[k]=R.c[k]||{i:0,d:S.day,n:0,s:{}};c.i+=amt;c.d=S.day;c.n++;c.s[kind]=(c.s[kind]||0)+1;if(txt)c.t=txt;
 if(c.i>=PR_BORN&&(chem>=30||kind=='gl'))return prBirth(a,b,kind,txt);
 const ks=Object.keys(R.c);if(ks.length>PR_MAXC){ks.sort((x,y)=>R.c[x].i-R.c[y].i).slice(0,ks.length-PR_MAXC).forEach(x=>delete R.c[x])}return null}
function prWork(P,kind,txt){if(!txt||!['unit','duet','song','gl','variety'].includes(kind))return;P.works=P.works||[];if(P.works.some(w=>w.t==txt&&w.k==kind))return;P.works.push({d:S.day,k:kind,t:txt});if(P.works.length>60)P.works.shift()}
function prChemGuess(a,b){const bd=prBond(a,b);return bd==null?28:Math.round(.75*bd+10)}
function prBirth(a,b,kind,txt){const R=prS(),k=prKey(a,b),c=R.c[k]||{i:PR_BORN,n:1,s:{}},A=prM(a),B=prM(b);delete R.c[k];
 const P=R.p[k]={a:Math.min(a,b),b:Math.max(a,b),born:S.day,why:txt||(PR_KIND[kind]||['Fan discussions'])[0],kind,chem:prChemGuess(a,b),pop:prCl(12+Math.min(30,c.n*1.5)+((A.pop||0)+(B.pop||0))/10),tr:prCl(35+Math.min(40,c.i/6)),sb:6,pf:0,wk:{},works:[],h:[],hist:[],gl:[],last:S.day,mom:c.n};
 prHist(P,'born',`Fans started shipping ${prNm(A)} × ${prNm(B)} (${P.why})`);prWork(P,kind,txt);prFans(P);P.hist.push([S.day,Math.round(P.pop),P.pf,Math.round(P.tr),Math.round(P.chem)]);
 try{if(typeof nwPublish=='function')nwPublish({cat:'fanbase',type:'pairing',src:'fans',sent:'pos',att:35+Math.round(P.pop/3),imp:2,refs:{mids:[P.a,P.b]},img:{k:'edit',th:'fanbase'},
  en:{h:`Fans are shipping ${prNm(A)} × ${prNm(B)}`,b:`After “${P.why}”, fan discussions about ${prNm(A)} and ${prNm(B)} took off. The pairing was named by fans, not by the company.`},
  th:{h:`แฟน ๆ เริ่มชิป ${prNm(A)} × ${prNm(B)}`,b:`หลังจาก “${P.why}” แฟน ๆ พูดถึง ${prNm(A)} กับ ${prNm(B)} กันมากขึ้น คู่นี้เกิดจากแฟน ๆ ไม่ใช่บริษัทเป็นผู้กำหนด`}})}catch(e){}
 return P}
// ---- Pair Fans: a category inside the existing unique fans ---------------------------------------------------------------
function prShip(P){return Math.min(.75,.05+P.pop/100*.45+(P.tr/100)*.12+(P.sb||0)/200)}
function prBoth(s,a,b){if(!s||!(s.n>0)||s.ft=='dormant')return 0;const o=s.o||{},u=s.u||{},sa=s.k==a?s.n:(o[a]||0)+(u[a]||0),sb=s.k==b?s.n:(o[b]||0)+(u[b]||0);if(!sa||!sb)return 0;if(s.k==a)return Math.min(s.n,sb);if(s.k==b)return Math.min(s.n,sa);return Math.min(s.n,sa,sb,sa*sb/s.n)}
function prSegPF(s,P){const k=prKey(P.a,P.b);if(s.pr==k)return s.n;return prBoth(s,P.a,P.b)*prShip(P)}
function prFans(P){let n=0;((S.fb&&S.fb.segs)||[]).forEach(s=>{n+=prSegPF(s,P)});P.pf=Math.round(n);return P.pf}
// unique Pair Fans across all pairings (a fan who ships several pairs is counted once)
function prUniqueFans(list){const L=list||Object.values(prS().p);let n=0;((S.fb&&S.fb.segs)||[]).forEach(s=>{if(!(s.n>0)||s.ft=='dormant')return;let keep=1;L.forEach(P=>{const f=Math.min(1,prSegPF(s,P)/s.n);if(f>0)keep*=1-f});n+=s.n*(1-keep)});return Math.round(n)}
// ---- weekly life of every pairing ---------------------------------------------------------------------------------------
function prWeekly(){const R=prS();if(!R)return;R.wk=S.day;
 // social media / backstage moments grow out of real friendships (rel.js)
 try{Object.values((typeof relS=='function'&&relS().p)||{}).forEach(Q=>{const A=get(Q.a),B=get(Q.b);if(!prAct(A)||!prAct(B))return;const bd=Math.min(...Q.x);if(bd<55)return;const h=mulb((Q.a*7919+Q.b*104729+S.day)|0),r=h();
  const sameG=(typeof gsGid=='function'?gsGid(A)==gsGid(B):A.group==B.group);const p=(bd-50)/260*(sameG?1:.5);if(r<p)prSpark(Q.a,Q.b,'social',.6+bd/120,`${prNm(A)} posted photos with ${prNm(B)}`);else if(h()<p*.6)prSpark(Q.a,Q.b,'backstage',.5+bd/140,`Backstage moment: ${prNm(A)} & ${prNm(B)}`)})}catch(e){console.error(e)}
 Object.entries(R.c).forEach(([k,c])=>{c.i*=.86;if(c.i<1.5)delete R.c[k]});
 Object.values(R.p).forEach(P=>{const A=prM(P.a),B=prM(P.b),live=prAct(A)&&prAct(B);const bd=prBond(P.a,P.b);
  const works=(P.works||[]).length,shared=Math.min(100,18*Math.log2(1+works+(P.mom||0)/4));P.chem=prCl(P.chem+((bd==null?P.chem:.6*bd+.25*shared+.15*Math.min(100,P.pop+10))-P.chem)*.12);
  const quiet=S.day-(P.last||P.born)>45;const tgt=live?.45*P.chem+.2*((A.pop||0)+(B.pop||0))/2+.35*Math.min(100,works*7+(P.gl||[]).length*18):P.pop*.9;
  P.pop=prCl(P.pop+(tgt-P.pop)*.06-(quiet?.8:0));if(P.pop<3)P.pop=3;P.tr=prCl(P.tr*.8);P.sb=(P.sb||0)*.85;prFans(P);
  const L=P.hist=P.hist||[];if(!L.length||S.day-L[L.length-1][0]>=7)L.push([S.day,Math.round(P.pop),P.pf,Math.round(P.tr),Math.round(P.chem)]);if(L.length>110)L.splice(1,1)})}
// ---- bootstrap from what already happened in this save ------------------------------------------------------------------
function prSeed(){const R=prS();if(R.seeded)return;R.seeded=1;const cnt={},add=(a,b,kind,t,w)=>{if(a==b)return;const k=prKey(a,b),c=cnt[k]=cnt[k]||{a,b,u:0,d:0,s:0,t:0,last:null};c[kind]+=w||1;if(t)c.last=t};
 try{(S.groups||[]).forEach(g=>gsWith(g.id,()=>{const H=S.th;if(!H)return;(H.pf||[]).slice(-400).forEach(rec=>{(H.snap&&H.snap[rec.snap]||[]).forEach(z=>{if(z.k=='song'&&z.pt=='unit'&&(z.mem||[]).length>1&&(z.mem||[]).length<=4){const M=z.mem;for(let i=0;i<M.length;i++)for(let j=i+1;j<M.length;j++)add(M[i],M[j],M.length==2?'d':'u',`“${z.title}”${z.unit?' · '+z.unit.name:''}`,1/ (M.length-1))}})})}))}catch(e){console.error(e)}
 try{(S.groups||[]).forEach(g=>gsWith(g.id,()=>{(S.singles||[]).forEach(x=>{[x.mainId,...(x.coup||[])].forEach(id=>{const o=S.songs[id];const M=(o&&o.slots||[]).filter(Boolean);if(M.length==2)add(M[0],M[1],'d',`“${o.title}”`,3)})})}))}catch(e){}
 Object.values(cnt).forEach(c=>{const A=get(c.a),B=get(c.b);if(!prAct(A)||!prAct(B))return;const bd=prBond(c.a,c.b)||30;const score=(c.d*9+Math.min(40,c.u*1.4))*(.5+bd/100)*prAppeal(A,B,bd)/1.2;
  if(score>=PR_BORN*.8&&bd>=35){const P=prBirth(c.a,c.b,c.d?'duet':'unit',c.last);if(P){P.born=S.day;P.pop=prCl(P.pop+Math.min(25,score/12));P.tr=prCl(20+Math.min(30,score/10));prFans(P);P.hist=[[S.day,Math.round(P.pop),P.pf,Math.round(P.tr),Math.round(P.chem)]]}}
  else if(score>8){R.c[prKey(c.a,c.b)]={i:Math.min(PR_BORN*.7,score),d:S.day,n:Math.round(c.d+c.u),s:{},t:c.last}}})}
// ---- hooks: shared activities ---------------------------------------------------------------------------------------------
{const f=relShare;relShare=function(ids,kind,ctx){const r=f.apply(this,arguments);try{if(kind=='tm')return r;const L=[...new Set(ids)].filter(id=>prAct(get(id)));const n=L.length;if(n<2||n>24)return r;
  const k=kind=='u'?(n==2?'duet':'unit'):kind=='t'?'theater':kind=='s'?(n==2?'duet':'song'):null;if(!k)return r;const w=k=='duet'?1:k=='unit'?1.6/(n-1):1.2/Math.max(1,n-1);const t=(String(ctx||'').match(/“([^”]+)”/)||[])[0]||'';
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)prSpark(L[i],L[j],k,w,t||null)}catch(e){console.error(e)}return r}}
// variety shows and other media appearances (External Events)
{const f=xeRun;xeRun=function(r){const was=r&&r.status;const out=f.apply(this,arguments);try{if(r&&was=='accepted'&&r.status!='accepted'&&r.status!='cancelled'){const sub=String(r.type||''),media=r.cat=='media'||/variety|television|tv|online|radio/i.test(sub);const ids=(r.sel||[]).filter(id=>prAct(get(id)));
  if(ids.length>=2&&ids.length<=8)for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const h=mulb((ids[i]*31+ids[j]*17+S.day)|0)();if(h<(media?.55:.25))prSpark(ids[i],ids[j],media?'variety':'concert',(media?1:.6)*(2/ids.length),`${r.name||sub||'Appearance'}`)}}}catch(e){console.error(e)}return out}}
// weekly tick (after the game's own day)
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{if(S&&S.members&&S.members.length){const R=prS();if(!R.seeded)prSeed();if(R.wk==null||S.day-R.wk>=7)prWeekly()}}catch(e){console.error(e)}return r}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{if(S&&S.members&&S.members.length){prS();if(!S.pairs.seeded){prSeed();prWeekly()}}}catch(e){console.error(e)}return r}}
// ---- General Election: Pair Fans only re-split their own cohort's votes --------------------------------------------------
// fan styles inside a cohort's Pair Fans: member-focused (unchanged), equal split, pair-focused (help the one who needs it)
{const f=geProf;geProf=function(e,s,PS){const P=f.apply(this,arguments);try{if(!P||!P.sh||P.kc==null||!s||!(s.n>0))return P;const R=prS();if(!R)return P;const kc=P.kc;
  const L=Object.values(R.p).filter(p=>(p.a==kc||p.b==kc)&&P.sh[p.a==kc?p.b:p.a]!=null&&p.pop>=8);if(!L.length)return P;
  const sh={...P.sh};let moved=0;L.forEach(p=>{const j=p.a==kc?p.b:p.a,fr=Math.min(.9,prSegPF(s,p)/s.n);if(!(fr>0))return;const pop=p.pop/100;
   const eq=fr*(.22+.12*pop),pf=fr*(.08+.14*pop),gap=sh[kc]-sh[j];let d=0;if(gap>0)d+=eq*gap/2;
   // pair-focused fans coordinate: lean towards whichever of the two ranked lower last time (or is less supported)
   const prev=x=>{try{const H=((get(x)||{}).geRec||[]).filter(h=>h.eid!=e.id&&h.rank);return H.length?+H[H.length-1].rank:99}catch(_){return 99}};const weak=prev(j)>prev(kc)||sh[j]<sh[kc];if(weak)d+=pf*sh[kc]*.35;
   d=Math.min(d,sh[kc]*.45);if(d>0){sh[kc]-=d;sh[j]+=d;moved+=d}});if(moved>0){P.sh=sh;P.pair=1}}catch(x){console.error(x)}return P}}
// after the results: what fans of a pairing feel
{const f=geClose;geClose=function(e){const was=e&&e.st;const r=f.apply(this,arguments);try{if(was=='voting'&&e&&e.final&&!e.prDone){e.prDone=1;const rows=new Map(e.final.rows.filter(x=>x.rank&&!x.withdrawn).map(x=>[x.id,x]));
  Object.values(prS().p).forEach(P=>{const A=rows.get(P.a),B=rows.get(P.b);if(!A&&!B)return;const sen=x=>x&&x.gi==0,cen=x=>x&&(x.center||x.rank==1),na=prNm(prM(P.a)),nb=prNm(prM(P.b)),en=e.name||'General Election';let t=null,dt=0,dp=0;
   if(A&&B&&sen(A)&&sen(B)){t=`${en}: ${na} and ${nb} both entered Senbatsu`;dt=18;dp=3}else if(A&&B&&A.rank<=12&&B.rank<=12){t=`${en}: both ranked high (#${A.rank} & #${B.rank})`;dt=14;dp=2}
   else if((cen(A)&&!sen(B))||(cen(B)&&!sen(A))){const c=cen(A)?na:nb,o=cen(A)?nb:na;t=`${en}: ${c} became Center while ${o} missed Senbatsu`;dt=12;dp=1}
   else if(sen(A)!=sen(B)&&A&&B){const i=sen(A)?na:nb,o=sen(A)?nb:na;t=`${en}: only ${i} entered Senbatsu — fans rally for ${o}`;dt=8;dp=.5}
   if(t){P.tr=prCl(P.tr+dt*(.6+P.pop/100));P.pop=prCl(P.pop+dp);P.last=S.day;prHist(P,'ge',t)}})}}catch(x){console.error(x)}return r}}
// ---- Request Hour: only exact two-member songs of an existing pairing ------------------------------------------------------
{const f=rhClose;rhClose=function(E){const was=E&&E.status;const r=f.apply(this,arguments);try{if(was=='voting'&&E&&E.rank&&!E.prDone){E.prDone=1;const N=Math.max(1,E.rank.length);
  E.rank.forEach(z=>{const M=[...new Set((z.mem||[]).filter(x=>x!=null))];if(M.length!=2)return;const P=prGet(M[0],M[1]);if(!P)return;const perf=Math.max(0,1-(z.r-1)/N),top=z.r<=10?1:z.r<=30?.5:0;
   const dp=perf*perf*6+top*3,dt=perf*18+top*10;P.pop=prCl(P.pop+dp);P.tr=prCl(P.tr+dt);P.sb=Math.min(40,(P.sb||0)+dt*.6);P.last=S.day;prWork(P,'duet',`“${z.title}”`);
   prHist(P,'rh',`${E.name||'Request Hour'}: “${z.title}” placed #${z.r}`);try{if(z.r<=20&&typeof fbAcquire=='function'){const n=Math.round((z.v||0)*.02*perf);if(n>0)fbAcquire(n,{org:`Request Hour duet: ${z.title}`,mid:Math.random()<.5?P.a:P.b})}}catch(_){}prFans(P)})}}catch(x){console.error(x)}return r}}
// ---- UI: Members → Pairing ------------------------------------------------------------------------------------------------
(function(){const M=SECS.find(s=>s.k=='members');if(!M)return;const i=M.v.findIndex(x=>x[0]=='members');if(!M.v.some(x=>x[0]=='pairs'))M.v.splice(i+1,0,['pairs','Pairing']);M.hid=[...(M.hid||[]),'pair'];Object.assign(SUBLOC,{pairs:'Members’ Lounge · Pairing',pair:'Members’ Lounge · Pairing'})})();
function prFmt(n){n=Math.round(n||0);return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e4?(n/1e3).toFixed(1)+'K':n.toLocaleString()}
function prBar(v,c){return`<span class="prbar"><i style="width:${Math.round(prCl(v))}%;background:${c}"></i></span>`}
function prFaces(P,s){const A=prM(P.a),B=prM(P.b);return`<span class="prfaces">${A?pt({...A,bgc:bgOf(A)},s):''}${B?pt({...B,bgc:bgOf(B)},s):''}<b class="prheart">♥</b></span>`}
function prTrendLbl(P){return P.tr>=60?'🔥 Trending':P.tr>=30?'Rising':P.tr>=12?'Steady':'Quiet'}
function prCard(P){const A=prM(P.a),B=prM(P.b);return`<button class="c prcard ${P.tr>=60?'hot':''}" onclick="ui.prk='${prKey(P.a,P.b)}';goView('pair')">${prFaces(P,74)}<div class="prnm">${esc(prNm(A))} <span>×</span> ${esc(prNm(B))}</div><div class="prst"><span>Popularity</span>${prBar(P.pop,'#ff7eb6')}<b>${Math.round(P.pop)}</b></div><div class="prst"><span>Trend</span>${prBar(P.tr,'#ffb24d')}<b>${Math.round(P.tr)}</b></div><div class="prmeta"><span>💞 ${prFmt(P.pf)} Pair Fans</span><span class="prtag">${prTrendLbl(P)}</span></div>${!prAct(A)||!prAct(B)?'<div class="st">Former member · history kept</div>':''}</button>`}
V.pairs=function(){const R=prS();if(!R.seeded){prSeed();prWeekly()}const F=ui.prf=ui.prf||{q:'',t:'all',s:'pop'};const all=Object.values(R.p);
 const vis=all.filter(P=>{const A=prM(P.a),B=prM(P.b);if(!A||!B)return false;if(F.q){const q=F.q.toLowerCase();if(!prNm(A).toLowerCase().includes(q)&&!prNm(B).toLowerCase().includes(q)&&!A.name.toLowerCase().includes(q)&&!B.name.toLowerCase().includes(q))return false}if(F.t!='all'&&!(teamMatch(A,F.t)||teamMatch(B,F.t)))return false;return true});
 const key={pop:P=>P.pop,fans:P=>P.pf,trend:P=>P.tr}[F.s]||(P=>P.pop);vis.sort((a,b)=>key(b)-key(a));
 const live=all.filter(P=>prAct(prM(P.a))&&prAct(prM(P.b))),topP=live.slice().sort((a,b)=>b.pop-a.pop).slice(0,3),topT=live.slice().sort((a,b)=>b.tr-a.tr).filter(P=>P.tr>=20).slice(0,3);
 return`<h2 class="ht">Pairing</h2><p class="st">Pairings are created by fans — from shared stages, duets, variety shows, social media moments and dramas. The company does not create or announce pairs.</p>
 <div class="g4 prsum"><div class="c"><small>Total Pairings</small><b>${live.length}</b></div><div class="c"><small>Total Pair Fans (unique)</small><b>${prFmt(prUniqueFans(live))}</b></div><div class="c"><small>Most popular</small><b>${topP[0]?esc(prNm(prM(topP[0].a))+' × '+prNm(prM(topP[0].b))):'—'}</b></div><div class="c"><small>Trending now</small><b>${topT[0]?esc(prNm(prM(topT[0].a))+' × '+prNm(prM(topT[0].b))):'—'}</b></div></div>
 ${topP.length?`<h3 class="prh">💗 Popular Pairings</h3><div class="prrow">${topP.map(prCard).join('')}</div>`:''}${topT.length?`<h3 class="prh">🔥 Trending Pairings</h3><div class="prrow">${topT.map(prCard).join('')}</div>`:''}
 <h3 class="prh">All Pairings</h3><div class="row prf"><input placeholder="Search member name" value="${esc(F.q)}" onchange="ui.prf.q=this.value;render()"><select onchange="ui.prf.t=this.value;render()">${teamOpts().map(([k,n])=>`<option value="${esc(k)}" ${k==F.t?'selected':''}>${esc(n)}</option>`).join('')}</select><select onchange="ui.prf.s=this.value;render()">${[['pop','Sort: Pair Popularity'],['fans','Sort: Pair Fans'],['trend','Sort: Pair Trend']].map(([k,n])=>`<option value="${k}" ${F.s==k?'selected':''}>${n}</option>`).join('')}</select></div>
 <div class="prgrid">${vis.map(prCard).join('')||'<div class="c"><p class="st">No pairing yet. Fans start shipping members after memorable moments together — duets, Theater Units, variety shows, social media or a GL Series.</p></div>'}</div>`};
function prChart(P){const L=(P.hist||[]).slice(-40);if(L.length<2)return'<p class="st">History appears after a few weeks.</p>';const W=520,H=150,x=i=>18+i*(W-36)/(L.length-1),mxF=Math.max(1,...L.map(z=>z[2]));
 const line=(k,mx,c)=>`<polyline points="${L.map((z,i)=>`${x(i).toFixed(1)},${(H-16-(z[k]/mx)*(H-34)).toFixed(1)}`).join(' ')}" fill="none" stroke="${c}" stroke-width="2.4" stroke-linejoin="round"/>`;
 return`<svg viewBox="0 0 ${W} ${H}" class="prchart"><rect width="${W}" height="${H}" rx="10" fill="#fff7fb"/>${[0,1,2,3].map(i=>`<line x1="18" x2="${W-18}" y1="${18+i*(H-34)/3}" y2="${18+i*(H-34)/3}" stroke="#f0dde8"/>`).join('')}${line(1,100,'#ff6fa8')}${line(3,100,'#ffb24d')}${line(2,mxF,'#8a6fe0')}</svg><div class="prleg"><span style="color:#ff6fa8">● Popularity</span><span style="color:#ffb24d">● Trend</span><span style="color:#8a6fe0">● Pair Fans</span></div>`}
V.pair=function(){const R=prS(),P=R.p[ui.prk];if(!P)return V.pairs();const A=prM(P.a),B=prM(P.b),W=P.works||[],gl=(P.gl||[]).map(id=>typeof drGet=='function'?drGet(id):null).filter(Boolean);
 const by=k=>W.filter(w=>w.k==k);const lst=(L,emp)=>L.length?`<ul class="wll">${L.slice().reverse().map(w=>`<li>${esc(w.t)} <span class="st">${jd(w.d)}</span></li>`).join('')}</ul>`:`<p class="st">${emp}</p>`;
 return`<button class="b s" onclick="goView('pairs')">◀ All pairings</button><div class="c prhero"><div class="prhf">${A?`<div>${CHAR_ASSETS.half(A,150)}<b>${esc(prNm(A))}</b><small>${esc(A.name)}</small></div>`:''}<div class="prx">♥</div>${B?`<div>${CHAR_ASSETS.half(B,150)}<b>${esc(prNm(B))}</b><small>${esc(B.name)}</small></div>`:''}</div>
 <div class="g4 prsum"><div><small>Pair Chemistry</small><b>${Math.round(P.chem)}</b>${prBar(P.chem,'#8fd3a0')}</div><div><small>Pair Popularity</small><b>${Math.round(P.pop)}</b>${prBar(P.pop,'#ff7eb6')}</div><div><small>Pair Fans</small><b>${prFmt(P.pf)}</b><span class="st">inside the group's unique fans</span></div><div><small>Pair Trend</small><b>${Math.round(P.tr)}</b>${prBar(P.tr,'#ffb24d')}<span class="st">${prTrendLbl(P)}</span></div></div>
 <p class="st">Fans began shipping them on ${jd(P.born)} — ${esc(P.why||'')}. ${!prAct(A)||!prAct(B)?'One of them has left; the history is kept.':''}</p></div>
 <div class="g2"><div class="c"><h3>Popularity over time</h3>${prChart(P)}</div><div class="c"><h3>Pair history</h3>${(P.h||[]).length?`<ul class="wll">${P.h.slice().reverse().slice(0,18).map(x=>`<li>${esc(x.x)} <span class="st">${jd(x.d)}</span></li>`).join('')}</ul>`:'<p class="st">No moments yet.</p>'}</div></div>
 <div class="g2"><div class="c"><h3>Duet songs</h3>${lst(by('duet'),'No duet yet.')}<h3>Unit songs</h3>${lst(by('unit'),'No shared unit yet.')}</div><div class="c"><h3>GL Series</h3>${gl.length?`<ul class="wll">${gl.map(d=>`<li><a href="#" onclick="ui.drd='${d.id}';goView('drdet');return false">${esc(d.title)}</a> <span class="st">${d.res?esc(d.res.grade||''):esc(d.status)}</span></li>`).join('')}</ul>`:'<p class="st">No GL Series together.</p>'}<h3>Shared works</h3>${lst(W.filter(w=>w.k=='song'||w.k=='variety'),'—')}</div></div>`};
// member profile: quick overview only
{const f=profHtml;profHtml=function(m,cand){let h=f.apply(this,arguments);try{if(cand||!m||(ui.ptab||'stats')!='stats')return h;const L=prOf(m.id).filter(P=>prM(P.a)&&prM(P.b)).sort((a,b)=>b.pop-a.pop).slice(0,6);
  h+=`<div class="c prprof"><h3>💞 Pairings</h3>${L.length?`<div class="prpl">${L.map(P=>{const o=prM(P.a==m.id?P.b:P.a);return`<button class="prpi" onclick="ui.mod=null;ui.prk='${prKey(P.a,P.b)}';goView('pair')">${pt({...o,bgc:bgOf(o)},42)}<span><b>× ${esc(prNm(o))}</b><small>Popularity ${Math.round(P.pop)} · ${prFmt(P.pf)} fans · ${prTrendLbl(P)}</small></span></button>`}).join('')}</div>`:'<p class="st">Fans have not paired her with anyone yet.</p>'}<button class="b s" onclick="ui.mod=null;goView('pairs')">All pairings</button></div>`}catch(x){console.error(x)}return h}}
