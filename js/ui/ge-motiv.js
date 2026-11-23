// =====================================================================================
//  IDOLVERSE48: Select Bloom! — General Election: fan motivation, election goals, rivalries & memory
// -------------------------------------------------------------------------------------
//  An expansion of the existing election (election2.js / ge-vote3.js) and fan system (fan3.js / faneco.js).
//  Nothing here creates votes, fans or fan categories:
//   · Every vote is still a CD bought by an existing fan segment (S.fb.segs) and paid from its wallet (faneco).
//   · Motivation only changes REAL buying decisions of those segments:
//       p  (does a fan buy at all)  ·  q (codes per buyer — never above what her wallet allows, never for Casual fans)
//       sh (how a fan with several Oshi divides her budget)  ·  e.mot (reaction to the preliminary results)
//     and organised campaigns that change only WHEN a community buys (each curve stays normalised).
//   · Motivations come from the member's actual election history (m.geRec + the stored final results):
//     crown, Top 3, Senbatsu, Top 10, group Center, first Senbatsu, first ranking, personal best, return to the top,
//     last chance (graduation), close the gap (exact vote difference at a cutoff), recovery after a fall, team /
//     generation pride, rivalries. Fans react differently: some rally, some are complacent, some lose heart.
//     Fatigue after intense campaigns and divided goals limit motivation over many elections.
//   · Memory: per-member election career (firsts, streaks, best / worst, comebacks, declines, near misses) and
//     group records, all computed from stored results — never invented.
// =====================================================================================
const GMT=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
const gmH=s=>{let h=2166136261;s=String(s);for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h};
const gmCl=(v,a,b)=>Math.max(a,Math.min(b,v));
// ---- 1. election memory --------------------------------------------------------------------------------------------------------
function gmAllE(){const L=[];try{(typeof gsAllGE=='function'?gsAllGE():[{g:{id:null},G:geS()}]).forEach(({g,G})=>((G&&G.list)||[]).forEach(e=>L.push({g,e})))}catch(x){}return L}
function gmE(eid){const z=gmAllE().find(z=>z.e.id==eid);return z?z.e:null}
const gmCut=e=>Math.max(1,+((e&&e.groups&&e.groups[0])||{size:16}).size||16);
// the cutoffs that matter in an election: champion, Top 3, Top 10, Senbatsu, every ranking-group border, the last ranked place
function gmCuts(e){const C=new Map([[1,'crown'],[3,'top3']]);const tot=geTotal(e);if(tot>=12)C.set(10,'top10');const cut=gmCut(e);if(cut>3&&cut<tot)C.set(cut,'sen');geRanges(e).forEach(([a,b],i)=>{if(i>0&&!C.has(b)&&b<tot)C.set(b,'group')});C.set(tot,'rank');return C}
// exact vote gaps of one member in a finished election
function gmGaps(e,id){if(!e||!e.final)return null;const R=e.final.rows.filter(r=>!r.withdrawn).slice().sort((a,b)=>b.votes-a.votes),i=R.findIndex(r=>r.id==id);if(i<0)return null;const me=R[i],pos=i+1,out={pos,votes:me.votes,miss:null,above:null,below:null};
 if(i>0)out.above={id:R[i-1].id,by:R[i-1].votes-me.votes};if(R[i+1])out.below={id:R[i+1].id,by:me.votes-R[i+1].votes};
 // a missed cutoff: she finished just below it (the member at the cutoff is the one she had to beat)
 const C=gmCuts(e);for(const[c,k]of C){if(pos==c+1&&R[c-1]){const by=R[c-1].votes-me.votes;out.miss={c,k,by,rel:by/Math.max(1,R[c-1].votes)};break}}return out}
// the member's elections in order (any group), each with the facts needed by the motivations and records
function gmRecs(m,before){const L=(m&&m.geRec||[]).map(h=>{const e=gmE(h.eid);return{h,e,end:e?(e.vEnd||e.doneDay||0):(h.ed||0)}}).filter(z=>before==null||z.end<before).sort((a,b)=>a.end-b.end);
 return L.map(({h,e})=>{const cut=e?gmCut(e):16,tot=e?geTotal(e):48;return{eid:h.eid,name:h.name,e,rank:h.rank||null,votes:h.votes||0,cut,tot,sen:!!(h.rank&&h.rank<=cut),top10:!!(h.rank&&h.rank<=10&&tot>=12),top3:!!(h.rank&&h.rank<=3),win:h.rank==1,center:!!h.center,gaps:e?gmGaps(e,m.id):null,grad:!!h.gradAnn||!!h.gs}})}
function gmCareer(m,before){const R=gmRecs(m,before),C={n:R.length,ranked:0,sen:0,top10:0,top3:0,wins:0,best:null,worst:null,first:{},streak:{rank:0,sen:0,top3:0},long:{sen:0,top3:0,rank:0},moves:[],last:R[R.length-1]||null,recs:R};
 let cur={rank:0,sen:0,top3:0};R.forEach((r,i)=>{if(r.rank){C.ranked++;C.best=C.best==null?r.rank:Math.min(C.best,r.rank);C.worst=C.worst==null?r.rank:Math.max(C.worst,r.rank)}
  [['rank',!!r.rank],['sen',r.sen],['top10',r.top10],['top3',r.top3],['win',r.win]].forEach(([k,ok])=>{if(ok&&!C.first[k])C.first[k]=r.name});if(r.sen)C.sen++;if(r.top10)C.top10++;if(r.top3)C.top3++;if(r.win)C.wins++;
  ['rank','sen','top3'].forEach(k=>{const ok=k=='rank'?!!r.rank:r[k];cur[k]=ok?cur[k]+1:0;C.long[k]=Math.max(C.long[k],cur[k])});
  const p=R[i-1];if(p&&(p.rank||r.rank)){const a=p.rank||p.tot+1,b=r.rank||r.tot+1;if(a!=b)C.moves.push({from:p.rank,to:r.rank,d:a-b,name:r.name})}});
 C.streak=cur;C.comeback=C.moves.filter(z=>z.d>0).sort((a,b)=>b.d-a.d)[0]||null;C.decline=C.moves.filter(z=>z.d<0).sort((a,b)=>a.d-b.d)[0]||null;
 C.slump=R.length>=3&&R.slice(-3).every((r,i,a)=>i==0||((r.rank||r.tot+1)>(a[i-1].rank||a[i-1].tot+1)));return C}
// ---- 2. rivalries (from repeated competition, close margins and swapped places) -------------------------------------------------
function gmRivals(e){const G=geS().list.filter(z=>z!==e&&z.final&&z.st=='done'&&(z.vEnd||0)<(e.vStart??1e9)).sort((a,b)=>b.vEnd-a.vEnd).slice(0,3),live=new Set(geLive(e)),P={};
 const add=(a,b,s,why)=>{if(a==b||!live.has(a)||!live.has(b))return;const k=a<b?a+'|'+b:b+'|'+a;const z=P[k]=P[k]||{a:Math.min(a,b),b:Math.max(a,b),s:0,why:{}};z.s+=s;z.why[why]=(z.why[why]||0)+s};
 G.forEach((z,gi)=>{const R=z.final.rows.filter(r=>r.rank).sort((a,b)=>a.rank-b.rank),w=gi==0?1:.6,cut=gmCut(z);
  for(let i=0;i<R.length-1;i++){const a=R[i],b=R[i+1],rel=(a.votes-b.votes)/Math.max(1,a.votes);if(rel<.08)add(a.id,b.id,w*(1-rel/.08)*1.2,'close');if(a.rank==1)add(a.id,b.id,w*1.6,'crown');if(a.rank==cut)add(a.id,b.id,w*1.2,'cut');if(a.center||b.center)add(a.id,b.id,w*.6,'center')}
  // swapped places between two elections
  const nx=G[gi-1];if(nx){const r0=new Map(z.final.rows.filter(r=>r.rank).map(r=>[r.id,r.rank])),r1=new Map(nx.final.rows.filter(r=>r.rank).map(r=>[r.id,r.rank]));
   [...r1.keys()].forEach(a=>[...r1.keys()].forEach(b=>{if(a>=b||!r0.has(a)||!r0.has(b))return;const x0=r0.get(a)-r0.get(b),x1=r1.get(a)-r1.get(b);if(Math.sign(x0)!=Math.sign(x1)&&Math.abs(x1)<=3&&Math.abs(x0)<=4)add(a,b,1.5,'swap')}))}});
 const L=Object.values(P).filter(z=>z.s>=1.8).sort((a,b)=>b.s-a.s),taken=new Set(),out=[];
 L.forEach(z=>{if(taken.has(z.a)||taken.has(z.b))return;const ma=get(z.a),mb=get(z.b);if(!ma||!mb)return;if(ma.tid&&ma.tid==mb.tid)z.s*=1.15;if(Math.abs((ma.gen||1)-(mb.gen||1))>=2)z.why.gen=1;taken.add(z.a);taken.add(z.b);out.push({a:z.a,b:z.b,s:+Math.min(1,z.s/5).toFixed(3),why:Object.keys(z.why).sort((p,q)=>z.why[q]-z.why[p])[0]})});
 return out}
// ---- 3. motivations of every candidate at the start of voting ------------------------------------------------------------------
const GM_W={crown:.5,top3:.45,sen:.5,top10:.5,center:.45,firstSen:.7,firstRank:.6,pb:.4,ret:.6,last:.85,gap:.75,recover:.5,team:.25,gen:.3,rival:.45};
const GM_N={crown:['Protect the Crown','ปกป้องมงกุฎ'],top3:['Defend the Top 3','รักษาท็อป 3'],sen:['Protect Senbatsu','รักษาเซ็มบัตสึ'],top10:['Reach the Top 10','เข้าท็อป 10'],center:['Become Center','ขึ้นเป็นเซ็นเตอร์'],firstSen:['First Senbatsu','เซ็มบัตสึครั้งแรก'],firstRank:['First Ranking','ติดอันดับครั้งแรก'],pb:['Break Her Personal Best','ทำลายสถิติตัวเอง'],ret:['Return to the Top','กลับสู่จุดสูงสุด'],last:['The Last Chance','โอกาสสุดท้าย'],gap:['Close the Gap','ปิดช่องว่าง'],recover:['Recovery','กู้คืนอันดับ'],team:['Team Pride','ศักดิ์ศรีของทีม'],gen:['Generation Pride','ศักดิ์ศรีของรุ่น'],rival:['The Rivalry','คู่แข่ง']};
function gmMotivate(e){if(!e||e.mv&&e.mv.v==1)return e&&e.mv;const live=geLive(e),cut=gmCut(e),tot=geTotal(e),Rg=geRanges(e),pe=gePrevDone(e),M={};
 const rv=gmRivals(e),rvOf=new Map();rv.forEach(z=>{rvOf.set(z.a,z);rvOf.set(z.b,z)});
 // team / generation pride from real representation in the last elections of this group
 const done=geS().list.filter(z=>z!==e&&z.final&&z.st=='done'&&(z.vEnd||0)<(e.vStart??1e9)).sort((a,b)=>b.vEnd-a.vEnd),senOf=z=>z?z.final.rows.filter(r=>r.rank&&r.rank<=gmCut(z)):[];
 const tCnt=(z,t)=>senOf(z).filter(r=>{const m=get(r.id);return m&&m.tid==t}).length,lostTeam=new Set();
 if(done[0]&&done[1])new Set(live.map(id=>(get(id)||{}).tid).filter(Boolean)).forEach(t=>{if(tCnt(done[0],t)<tCnt(done[1],t))lostTeam.add(t)});
 const gens=live.map(id=>(get(id)||{}).gen||1),newest=Math.max(...gens,1),newGenNoSen=done.length&&!done.some(z=>senOf(z).some(r=>(r.gen||1)==newest))&&live.filter(id=>((get(id)||{}).gen||1)==newest).length>=2;
 live.forEach(id=>{const m=get(id);if(!m)return;const C=gmCareer(m,e.vStart??S.day),last=pe?C.recs.find(r=>r.eid==pe.id)||null:C.last,L=[],add=(k,s,d)=>{if(s>.05)L.push({k,s:+gmCl(s,0,1).toFixed(3),d:d||null})},lr=last&&last.rank;
  if(lr==1)add('crown',.95,{n:C.wins});else if(lr&&lr<=3)add('top3',.75,{r:lr});else if(lr&&lr<=cut)add('sen',.55+(lr>cut-3?.25:0),{r:lr});
  if(lr&&lr>1){const gi=Rg.findIndex(([a,b])=>lr>=a&&lr<=b);if(gi>=0&&lr-Rg[gi][0]<=2&&lr!=Rg[gi][0])add('center',.45,{g:gi})}
  if(!C.ranked)add('firstRank',C.n?.75:.35,{n:C.n});
  if(C.ranked&&!C.sen&&(lr?lr<=cut+14:true))add('firstSen',lr?.85-Math.max(0,lr-cut)/30:.45,{r:lr});
  if(tot>=12&&!C.top10&&lr&&lr>10&&lr<=22)add('top10',.65-(lr-11)/30,{r:lr});
  if(C.ranked&&C.best>1&&lr&&lr-C.best<=3)add('pb',.45,{best:C.best});
  if(C.best&&C.best<=3&&(!lr||lr-C.best>=4))add('ret',Math.min(1,.45+((lr||tot+1)-C.best)/12),{best:C.best,r:lr});else if(C.sen&&lr&&lr>cut&&C.best<=cut)add('ret',.55,{best:C.best,r:lr});else if(C.sen&&!lr)add('ret',.6,{best:C.best});
  if(m.grad&&m.grad.kind!='dismiss'&&m.grad.ann!=null&&m.grad.ann<(e.vStart??S.day)){const lead=Math.max(0,(e.vEnd||S.day)-m.grad.ann);add('last',.55+Math.min(.35,lead/200),{ann:m.grad.ann,best:C.best})}
  const g=last&&last.gaps&&last.gaps.miss;if(g&&g.rel<=.15)add('gap',(1-g.rel/.15)*(g.k=='crown'?1:g.k=='sen'||g.k=='top3'?.95:g.k=='rank'?.85:.75),{c:g.c,k:g.k,by:g.by});
  const dec=C.moves.length&&C.moves[C.moves.length-1];if(dec&&dec.d<=-5&&last&&dec.name==last.name)add('recover',Math.min(1,-dec.d/14),{from:dec.from,to:dec.to});
  if(m.tid&&lostTeam.has(m.tid))add('team',.4,{t:m.tid});if(newGenNoSen&&(m.gen||1)==newest)add('gen',.45,{g:newest});
  const r=rvOf.get(id);if(r)add('rival',.35+.5*r.s,{vs:r.a==id?r.b:r.a,why:r.why});
  L.sort((a,b)=>b.s*GM_W[b.k]-a.s*GM_W[a.k]);const top=L.slice(0,3),I=gmCl(top.reduce((a,z)=>a+z.s*GM_W[z.k],0),0,1.2);
  // limits: complacency of established members, divided goals, fatigue after intense campaigns
  const comp=+gmCl((C.wins?.12:0)+(lr&&lr<=3?.08:0)+.06*Math.max(0,C.streak.top3-1)+(lr&&lr<=cut&&!L.some(z=>z.k=='gap'||z.k=='rival')?.05:0),0,.4).toFixed(3);
  const dirs=new Set(top.filter(z=>z.s>=.5).map(z=>({crown:'defend',top3:'defend',sen:'defend',center:'climb',firstSen:'climb',top10:'climb',pb:'climb',ret:'climb',gap:'climb',last:'farewell'})[z.k]).filter(Boolean)),frag=+gmCl((dirs.size-1)*.15+(C.slump?.1:0),0,.35).toFixed(3);
  const fat=+gmCl(m.geFat||0,0,.6).toFixed(3);
  M[id]={mot:top,I:+I.toFixed(3),comp,frag,fat,slump:C.slump?1:0}});
 e.mv={v:1,day:S.day,m:M,rv,react:{}};return e.mv}
const gmOf=(e,id)=>e&&e.mv&&e.mv.m&&e.mv.m[id]||null;
const gmHas=(v,k)=>v&&v.mot.find(z=>z.k==k)||null;
// fatigue: an intense campaign this election tires the community a little for the next ones; it fades with time
{const f=geClose;geClose=function(e){const was=e&&e.st;const r=f.apply(this,arguments);try{if(was=='voting'&&e.final&&e.mv)geLive(e).forEach(id=>{const m=get(id),v=gmOf(e,id);if(!m)return;m.geFat=+gmCl((m.geFat||0)*.55+(v?Math.max(0,v.I-.45)*.35:0),0,.6).toFixed(3)})}catch(x){console.error(x)}return r}}
// ---- 4. real buying decisions of each fan segment -------------------------------------------------------------------------------
const GM_SEG=new Map();
const GM_DEV={hardcore:1,dedicated:.8,oshi:.55,casual:.2,dormant:.35,collector:1};
function gmSegType(e,s,v,mid){const k=e.id+'|'+s.id+'|'+mid;let z=GM_SEG.get(k);if(z)return z;const r=mulb(gmH('gm|'+k)),loy=(s.loy??40)/100,dev=GM_DEV[s.ft]??.5;
 const last=gmHas(v,'last'),rec=gmHas(v,'recover')||gmHas(v,'ret');
 const pR=gmCl(v.I*.6*(.45+loy*.7)*(.55+dev*.6)*(1-v.fat*.7)*(1-v.frag*.6),0,.88),pC=gmCl(v.comp*(1.1-loy*.6),0,.5),pD=gmCl((rec?rec.s*.25*(1-loy):0)+(v.slump?.15*(1-loy):0)+v.fat*.12,0,.4);
 const x=r();z=x<pR?'rally':x<pR+pC?'comp':x<pR+pC+pD?'down':'steady';if(last&&s.ft=='dormant'&&r()<.35+.4*last.s)z='return';GM_SEG.set(k,z);if(GM_SEG.size>60000)GM_SEG.clear();return z}
{const f=geProf;geProf=function(e,s,PS){const P=f.apply(this,arguments);try{if(!P||!e||!s||s.id=='g0'||!e.v2)return P;if(!e.mv&&e.st=='voting')gmMotivate(e);if(!e.mv)return P;
  // 4a. her Kami Oshi's community
  if(P.kc!=null){const v=gmOf(e,P.kc);if(v){const t=gmSegType(e,s,v,P.kc),I=v.I,cas=s.ft=='casual',bud=typeof fxBud=='function'&&s.bl!=null?gmCl(s.bl/Math.max(1,fxBud(s)),0,1):.6;
   if(t=='rally'){P.p=Math.min(.97,P.p*(cas?1.05+.1*I:1.12+.3*I));if(!cas)P.q=1+(P.q-1)*(1+(.15+.4*I)*bud)}
   else if(t=='comp')P.p*=.78;else if(t=='down')P.p*=.72;else if(t=='return')P.p=Math.min(.9,P.p*(1.6+.8*I));
   P.gm=t}}
  // 4b. a fan with several Oshi divides one budget: a favourite in danger can take part of it
  if(P.sh&&P.kc!=null){const ks=Object.keys(P.sh).filter(j=>j!='_f'&&j!=String(P.kc));if(ks.length){const vk=gmOf(e,P.kc),r=mulb(gmH('sh|'+e.id+'|'+s.id))();let best=null,bs=0;
    ks.forEach(j=>{const v=gmOf(e,+j);if(!v)return;const u=Math.max(...['gap','firstSen','sen','last','firstRank'].map(k=>{const z=gmHas(v,k);return z?z.s:0}));if(u>bs){bs=u;best=j}});
    const calm=vk?(vk.comp+(gmHas(vk,'crown')||gmHas(vk,'top3')?.15:0)-((vk.I||0)*.3)):0;if(best&&bs>=.6&&r<.25+calm){const d=Math.min(P.sh[P.kc]*.3,(.08+.2*bs)*P.sh[P.kc]);P.sh={...P.sh};P.sh[P.kc]-=d;P.sh[best]=(P.sh[best]||0)+d;P.shift=best}}}
 }catch(x){console.error(x)}return P}}
// 4c. organised campaigns of strongly motivated communities (timing only: each community's buying curve stays normalised)
{const f=gv3Init;gv3Init=function(e){if(e.vp)return e.vp;try{gmMotivate(e)}catch(x){console.error(x)}const vp=f.apply(this,arguments);try{const T=Math.max(1,e.vEnd-e.vStart);
  Object.keys(vp).forEach(id=>{const v=gmOf(e,+id);if(!v||v.I<.55)return;const r=mulb(gmH('gc|'+e.id+'|'+id));if(r()>.35+.5*v.I-v.fat)return;const last=gmHas(v,'last'),gap=gmHas(v,'gap'),len=4+Math.floor(r()*6),from=last||gap?Math.max(2,T-len-2-Math.floor(r()*6)):2+Math.floor(r()*Math.max(1,T-len-3));
   vp[id].camp=(vp[id].camp||[]).concat([{from,len,f:+(1.6+r()*1.4+v.I).toFixed(2),why:(last||gap||v.mot[0]||{}).k||'goal'}])})}catch(x){console.error(x)}return vp}}
// ---- 5. preliminary results: fans react to what the game announced -------------------------------------------------------------
function gmReact(e,P){if(!e.mv)gmMotivate(e);const mv=e.mv;if(!mv)return[];const n=P.n2||1,two=n==2,R=new Map(P.rows.map(r=>[r.id,r.rank])),prev=gePre2(e).filter(z=>z.n2<n).at(-1),P0=prev?new Map(prev.rows.map(r=>[r.id,r.rank])):null,cut=gmCut(e),tot=geTotal(e),pe=gePrevDone(e),peR=new Map(pe?pe.final.rows.map(r=>[r.id,r.rank]):[]),out=[];
 const nm=id=>{const m=get(id);return m?(m.stage||m.name):''},push=(id,k,f,en,th)=>{out.push({id,k,f,t:GMT(en,th)})};
 geLive(e).forEach(id=>{const v=gmOf(e,id);if(!v)return;const rk=R.get(id)||null,p0=P0?P0.get(id)||null:null,ex=peR.get(id)||null;
  const near=c=>rk&&(rk==c+1||rk==c+2||rk==c),rival=gmHas(v,'rival'),rvk=rival?R.get(rival.d.vs)||null:null,rv0=rival&&P0?P0.get(rival.d.vs)||null:null;
  if(rival&&rk&&rvk&&rvk<rk&&(!rv0||!p0||rv0>p0))push(id,'rival',two?1.22:1.12,`${nm(rival.d.vs)} is ahead of ${nm(id)} — her fans are determined to take the place back.`,`${nm(rival.d.vs)} แซงหน้า ${nm(id)} อยู่ — แฟนๆ ตั้งใจจะทวงตำแหน่งคืน`);
  else if((gmHas(v,'sen')||gmHas(v,'firstSen')||gmHas(v,'gap'))&&near(cut)&&rk>cut)push(id,'cut',two?1.25:1.12,`${nm(id)} is TOP ${rk}, just outside Senbatsu. Her supporters are organising${two?' an emergency campaign':''}.`,`${nm(id)} อยู่ TOP ${rk} ห่างเซ็มบัตสึนิดเดียว แฟนๆ กำลังรวมตัวกัน${two?'ทำแคมเปญฉุกเฉิน':''}`);
  else if(gmHas(v,'firstRank')&&rk)push(id,'under',two?1.15:1.1,`${nm(id)} appears in the ranking — her small fanbase is overjoyed and pushing on.`,`${nm(id)} โผล่ในอันดับแล้ว แฟนกลุ่มเล็กของเธอดีใจสุดๆ และสู้ต่อ`);
  else if(gmHas(v,'last')&&(!rk||rk>(v.mot.find(z=>z.k=='last').d.best||cut)))push(id,'last',two?1.25:1.12,`This may be ${nm(id)}'s final election, and she is ${rk?'TOP '+rk:'outside the ranking'}. Her supporters want an unforgettable farewell.`,`นี่อาจเป็นเลือกตั้งครั้งสุดท้ายของ ${nm(id)} ตอนนี้${rk?'อยู่ TOP '+rk:'ยังไม่ติดอันดับ'} แฟนๆ อยากให้การอำลาน่าจดจำ`);
  else if(rk&&rk<=3&&(ex&&ex<=3||v.comp>.1))push(id,'safe',two?.95:.92,`${nm(id)} is TOP ${rk}. Some of her fans think she is already safe.`,`${nm(id)} อยู่ TOP ${rk} แฟนบางส่วนคิดว่าเธอปลอดภัยแล้ว`);
  else if(two&&p0&&(!rk||rk-p0>=5))push(id,'fall',v.I>.4?1.18:.9,v.I>.4?`${nm(id)} fell from TOP ${p0}${rk?' to TOP '+rk:' out of the ranking'}. Her most loyal fans refuse to give up.`:`${nm(id)} fell from TOP ${p0}${rk?' to TOP '+rk:''}. Some of her supporters are losing confidence.`,v.I>.4?`${nm(id)} ร่วงจาก TOP ${p0}${rk?' ไป TOP '+rk:' หลุดอันดับ'} แฟนตัวจริงไม่ยอมแพ้`:`${nm(id)} ร่วงจาก TOP ${p0}${rk?' ไป TOP '+rk:''} แฟนบางส่วนเริ่มหมดกำลังใจ`);
  else if(ex&&rk&&ex-rk>=6)push(id,'rise',1.06,`${nm(id)} is far above her last result (TOP ${ex} → TOP ${rk}). Her fans are excited.`,`${nm(id)} สูงกว่าผลครั้งก่อนมาก (TOP ${ex} → TOP ${rk}) แฟนๆ ตื่นเต้น`)});
 // the reaction changes how much each of her Kami Oshi segments will still buy (never votes already cast); loyal fans react most
 const F=new Map(out.map(z=>[z.id,z.f]));e.mot=e.mot||{};geSegs().forEach(s=>{if(!(s.n>0)||s.k==null||!F.has(s.k))return;const f=F.get(s.k),loy=(s.loy??40)/100,w=f>=1?.4+loy*.8:1.2-loy*.6,mm=1+(f-1)*w*(.75+mulb(gmH('pr|'+e.id+n+s.id))()*.5);e.mot[s.id]=+gmCl((e.mot[s.id]||1)*mm,GE2.MOT[0],GE2.MOT[1]).toFixed(4)});
 mv.react[n]=out.sort((a,b)=>Math.abs(b.f-1)-Math.abs(a.f-1)).slice(0,10).map(z=>({id:z.id,k:z.k,t:z.t}));return mv.react[n]}
{const f=gePrelimN;gePrelimN=function(e,n){const p=f.apply(this,arguments);try{if(p&&e.v2){const L=gmReact(e,p);if(L.length)geN(`<li>💬 ${esc(L[0].t)}${L[1]?' '+esc(L[1].t):''}</li>`)}}catch(x){console.error(x)}return p}}
// ---- 6. the members' own feelings about the result (existing mental health / passion / emotion log) ---------------------------
function gmFinalStory(e,r){const m=get(r.id);if(!m||!r)return null;const C=gmCareer(m,e.vStart??S.day),v=gmOf(e,r.id),g=gmGaps(e,r.id),cut=gmCut(e),rk=r.rank,pe=gePrevDone(e),prevRec=pe?C.recs.find(z=>z.eid==pe.id):C.last,pr=prevRec&&prevRec.rank,pmiss=prevRec&&prevRec.gaps&&prevRec.gaps.miss;
 const S2=[];const s=(k,w)=>S2.push({k,w});
 if(rk==1&&!C.wins&&(!C.best||C.best>cut))s('underdogCrown',10);if(rk==1&&C.wins)s('defend',8);if(rk==1&&!C.wins&&C.best)s('firstCrown',9);
 if(C.wins&&pr==1&&rk!=1)s('lostCrown',8);if(rk&&rk<=cut&&!C.sen&&pmiss&&pmiss.k=='sen')s('nearMissDone',9);if(rk&&rk<=cut&&!C.sen&&C.ranked)s('firstSen',7);
 if(rk&&!C.ranked)s('firstRank',6);if(rk&&C.best&&rk<C.best)s('pb',5);if(C.best&&C.best<=3&&pr&&pr>3&&rk&&rk<=3)s('backTop',8);if(pr&&rk&&pr-rk>=8)s('bigUp',5);if(pr&&(!rk||rk-pr>=8))s('bigDown',5);
 if(g&&g.miss&&g.miss.rel<=.06)s('nearMiss',7);if(v&&gmHas(v,'last'))s('lastElection',6);if(m.grad&&m.grad.ann!=null)s('grad',4);
 const rv=v&&gmHas(v,'rival');if(rv&&rk){const o=e.final.rows.find(z=>z.id==rv.d.vs);if(o&&o.rank&&rk<o.rank)s('beatRival',6)}
 S2.sort((a,b)=>b.w-a.w);return{top:S2[0]?S2[0].k:null,all:S2.map(z=>z.k),C,g,pr,pmiss,v}}
{const f=geReact;geReact=function(e,r){const had=e.fx&&e.fx[r.id];const fx=f.apply(this,arguments);if(had)return fx;try{const m=get(r.id);if(!m||!fx||fx.skip)return fx;const st=gmFinalStory(e,r),h=(m.geRec||[]).find(z=>z.eid==e.id);
  if(h){const g=gmGaps(e,r.id);h.gi=r.gi;h.sen=!!(r.rank&&r.rank<=gmCut(e));h.cut=gmCut(e);if(g&&g.miss)h.miss={c:g.miss.c,k:g.miss.k,by:g.miss.by};h.gradAnn=!!(m.grad&&m.grad.ann!=null);const v=gmOf(e,r.id);if(v)h.mot=v.mot.map(z=>z.k);if(st&&st.top)h.story=st.top}
  if(!st||!st.top)return fx;const w=wlOf(m),J=(a,b)=>a+Math.random()*(b-a);let d={},line='';
  if(st.all.includes('nearMiss')){d.mh=-J(.5,2);m.pas=cl(m.pas+2);line=GMT(`So close… ${st.g.miss.by.toLocaleString()} votes. I'll remember that number.`,`เกือบแล้ว… ห่างแค่ ${st.g.miss.by.toLocaleString()} คะแนน ฉันจะจำตัวเลขนี้ไว้`)}
  else if(['nearMissDone','backTop','firstCrown','underdogCrown'].includes(st.top)){d.mh=J(1.5,3);m.pas=cl(m.pas+1);line=GMT('Everyone who believed in me… we did it together.','ทุกคนที่เชื่อในฉัน… เราทำได้แล้วนะ')}
  else if(st.top=='pb'){d.mh=J(.5,1.5);line=GMT('My best result ever!','ผลที่ดีที่สุดในชีวิตเลย!')}
  else if(st.top=='defend'){d.str=4;line=GMT('Defending the crown is heavier than winning it.','การรักษามงกุฎหนักกว่าการได้มันมาอีก')}
  else if(st.top=='lostCrown'){d.mh=-J(.5,1.5);m.pas=cl(m.pas+1);line=GMT('I lost the crown… but I am not finished.','ฉันเสียมงกุฎไป… แต่ฉันยังไม่จบแค่นี้')}
  if(st.all.includes('beatRival')&&!line)line=GMT('This time I came out ahead.','รอบนี้ฉันแซงได้แล้ว');
  if(d.mh||d.str)wlAdj(m,d,'General Election story');if(line){fx.story=st.top;fx.storyLine=line;wlLog(m,{t:'ge2',txt:`${e.name}: ${gmStoryTxt(st.top)}`,line})}}catch(x){console.error(x)}return fx}}
const GM_ST={underdogCrown:['Underdog champion','แชมป์ม้ามืด'],defend:['Defended the crown','ป้องกันแชมป์สำเร็จ'],firstCrown:['First championship','แชมป์ครั้งแรก'],lostCrown:['Lost the crown','เสียมงกุฎ'],nearMissDone:['Broke into Senbatsu after a near miss','ฝ่าเข้าเซ็มบัตสึหลังเฉียดไปครั้งก่อน'],firstSen:['First Senbatsu','เซ็มบัตสึครั้งแรก'],firstRank:['First ranking','ติดอันดับครั้งแรก'],pb:['Personal best','ทำลายสถิติตัวเอง'],backTop:['Back in the Top 3','กลับสู่ท็อป 3'],bigUp:['Big comeback','พลิกกลับครั้งใหญ่'],bigDown:['Big fall','ร่วงครั้งใหญ่'],nearMiss:['Near miss','พลาดอย่างเฉียดฉิว'],lastElection:['Final election','เลือกตั้งครั้งสุดท้าย'],grad:['Graduating','ประกาศจบการศึกษา'],beatRival:['Beat her rival','เอาชนะคู่แข่ง']};
const gmStoryTxt=k=>GMT(...(GM_ST[k]||[k,k]));
// ---- 7. ceremony commentary: one line about her real story when a result is revealed ------------------------------------------
function gmLine(e,r){const st=gmFinalStory(e,r);if(!st||!st.top)return null;const n=r.stage||r.name,pm=st.pmiss,pr=st.pr;
 const T={underdogCrown:[`From the edge of the ranking to the throne — ${n} is an underdog champion!`,`จากขอบอันดับสู่บัลลังก์ — ${n} คือแชมป์ม้ามืด!`],defend:[`${n} defends her crown${st.C.wins>1?` — her ${ordN(st.C.wins+1)} championship`:''}!`,`${n} ป้องกันมงกุฎได้สำเร็จ${st.C.wins>1?` — แชมป์ครั้งที่ ${st.C.wins+1}`:''}!`],
  firstCrown:[`${n} wins her first championship!`,`${n} คว้าแชมป์ครั้งแรก!`],lostCrown:[`Last time's champion, ${n}, is TOP ${r.rank||'—'} tonight. A new era begins.`,`แชมป์ครั้งก่อน ${n} คืนนี้อยู่ TOP ${r.rank||'—'} ยุคใหม่เริ่มแล้ว`],
  nearMissDone:[`Last time she missed Senbatsu by just ${pm?pm.by.toLocaleString():''} votes. Tonight ${n} finally breaks in!`,`ครั้งก่อนเธอพลาดเซ็มบัตสึแค่ ${pm?pm.by.toLocaleString():''} คะแนน คืนนี้ ${n} ทำได้แล้ว!`],firstSen:[`${n} enters Senbatsu for the first time!`,`${n} ติดเซ็มบัตสึเป็นครั้งแรก!`],
  firstRank:[`Her first ranking ever — ${n}, TOP ${r.rank}!`,`ติดอันดับครั้งแรก — ${n} TOP ${r.rank}!`],pb:[`A new personal best for ${n}!`,`${n} ทำสถิติใหม่ของตัวเอง!`],backTop:[`${n} is back in the Top 3!`,`${n} กลับเข้าท็อป 3 อีกครั้ง!`],
  bigUp:[`From TOP ${pr} to TOP ${r.rank} — what a climb for ${n}!`,`จาก TOP ${pr} ขึ้นมา TOP ${r.rank} — ${n} ไต่ขึ้นมาไกลมาก!`],bigDown:[`${n} was TOP ${pr} last time. Tonight is a hard night for her.`,`ครั้งก่อน ${n} อยู่ TOP ${pr} คืนนี้เป็นคืนที่ยากสำหรับเธอ`],
  nearMiss:[`So close — ${n} missed TOP ${st.g&&st.g.miss?st.g.miss.c:''} by only ${st.g&&st.g.miss?st.g.miss.by.toLocaleString():''} votes.`,`เฉียดฉิว — ${n} พลาด TOP ${st.g&&st.g.miss?st.g.miss.c:''} ไปแค่ ${st.g&&st.g.miss?st.g.miss.by.toLocaleString():''} คะแนน`],
  lastElection:[`This is ${n}'s final election. Her supporters made it unforgettable.`,`นี่คือเลือกตั้งครั้งสุดท้ายของ ${n} แฟนๆ ทำให้มันน่าจดจำ`],grad:[`${n} will graduate — and she leaves the stage of her last election at TOP ${r.rank||'—'}.`,`${n} กำลังจะจบการศึกษา และลาเวทีเลือกตั้งครั้งสุดท้ายที่ TOP ${r.rank||'—'}`],beatRival:[`${n} finishes ahead of her rival this time.`,`${n} แซงคู่แข่งได้ในครั้งนี้`]}[st.top];
 return T?{h:'lucia',t:GMT(T[0],T[1])}:null}
{const f=gxLines;gxLines=function(e,St,i,s){const L=f.apply(this,arguments);try{if(s&&s.k=='r'&&e.cp&&e.cp.rv){const r=geRow(e,s.id),x=r&&gmLine(e,r);if(x&&!L.some(z=>z.t==x.t))L.push(x)}}catch(x){console.error(x)}return L}}
// ---- 8. UI: motivations during voting, fan stories in the preliminary results, career & records -----------------------------
function gmMotHtml(e){if(!e||!e.mv)return'';const M=e.mv.m,ids=Object.keys(M).filter(id=>M[id].mot.length&&get(+id)).sort((a,b)=>M[b].I-M[a].I).slice(0,14);if(!ids.length)return'';
 const nm=id=>{const m=get(+id);return m?(m.stage||m.name):''};
 return`<div class="c gmmot"><h3>🔥 ${GMT('Fan motivation this election','แรงจูงใจของแฟนๆ ในการเลือกตั้งนี้')}</h3><p class="st">${GMT('Goals her supporters care about, from her real election history. Motivation changes how fans spend — it never adds votes.','เป้าหมายที่แฟนๆ ให้ความสำคัญ มาจากประวัติเลือกตั้งจริง แรงจูงใจเปลี่ยนการใช้จ่ายของแฟน ไม่ได้เพิ่มคะแนนให้เอง')}</p><div class="gmlist">${ids.map(id=>{const v=M[id],m=get(+id);return`<div class="gmrow">${ptc(m,34)}<div><b>${esc(nm(id))}</b><div class="gmchips">${v.mot.map(z=>`<span class="gmchip k-${z.k}" title="${esc(gmMotTxt(z))}">${esc(GMT(...GM_N[z.k]))}</span>`).join('')}${v.comp>=.15?`<span class="gmchip soft">${GMT('Some fans complacent','แฟนบางส่วนชะล่าใจ')}</span>`:''}${v.fat>=.15?`<span class="gmchip soft">${GMT('Campaign fatigue','เหนื่อยจากแคมเปญ')}</span>`:''}${v.frag>=.15?`<span class="gmchip soft">${GMT('Divided goals','เป้าหมายแตกกัน')}</span>`:''}</div><small class="st">${esc(v.mot.map(gmMotTxt).filter(Boolean)[0]||'')}</small></div></div>`}).join('')}</div>
 ${e.mv.rv.length?`<h3>⚔️ ${GMT('Rivalries','คู่แข่ง')}</h3><div class="gmlist">${e.mv.rv.slice(0,6).map(z=>`<div class="gmrow">${ptc(get(z.a),30)}${ptc(get(z.b),30)}<div><b>${esc(nm(z.a))} × ${esc(nm(z.b))}</b><small class="st">${esc(GMT(...({crown:['Champion and runner-up','แชมป์กับรองแชมป์'],close:['Separated by a handful of votes','ห่างกันแค่ไม่กี่คะแนน'],swap:['They keep exchanging places','สลับอันดับกันไปมา'],cut:['Fighting over the last Senbatsu place','แย่งที่สุดท้ายของเซ็มบัตสึ'],center:['Competing for a Center position','ชิงตำแหน่งเซ็นเตอร์']}[z.why]||['Rivals','คู่แข่ง'])))}</small></div></div>`).join('')}</div>`:''}</div>`}
function gmMotTxt(z){const d=z.d||{},nm=id=>{const m=get(id);return m?(m.stage||m.name):''};switch(z.k){case'crown':return GMT(`Reigning champion${d.n>1?` (${d.n} titles)`:''}.`,`แชมป์ปัจจุบัน${d.n>1?` (${d.n} สมัย)`:''}`);case'top3':return GMT(`TOP ${d.r} last time.`,`ครั้งก่อน TOP ${d.r}`);case'sen':return GMT(`TOP ${d.r} last time — inside Senbatsu.`,`ครั้งก่อน TOP ${d.r} อยู่ในเซ็มบัตสึ`);
 case'gap':return GMT(`Missed TOP ${d.c} by ${(+d.by||0).toLocaleString()} votes last time.`,`ครั้งก่อนพลาด TOP ${d.c} ไป ${(+d.by||0).toLocaleString()} คะแนน`);case'firstSen':return d.r?GMT(`TOP ${d.r} last time — never in Senbatsu yet.`,`ครั้งก่อน TOP ${d.r} ยังไม่เคยติดเซ็มบัตสึ`):'';case'firstRank':return d.n?GMT(`${d.n} election(s) without a ranking.`,`ลงเลือกตั้ง ${d.n} ครั้งยังไม่เคยติดอันดับ`):GMT('Her first election.','เลือกตั้งครั้งแรกของเธอ');
 case'ret':return GMT(`Best ever TOP ${d.best}${d.r?`, TOP ${d.r} last time`:', unranked last time'}.`,`ดีที่สุด TOP ${d.best}${d.r?` ครั้งก่อน TOP ${d.r}`:' ครั้งก่อนไม่ติดอันดับ'}`);case'last':return GMT('Graduation announced — this may be her final election.','ประกาศจบการศึกษาแล้ว อาจเป็นเลือกตั้งครั้งสุดท้าย');case'recover':return GMT(`Fell from TOP ${d.from||'—'} to ${d.to?'TOP '+d.to:'unranked'}.`,`ร่วงจาก TOP ${d.from||'—'} ไป ${d.to?'TOP '+d.to:'ไม่ติดอันดับ'}`);
 case'rival':return GMT(`Rivalry with ${nm(d.vs)}.`,`ชิงกับ ${nm(d.vs)}`);case'pb':return GMT(`Personal best: TOP ${d.best}.`,`สถิติดีที่สุด TOP ${d.best}`);case'top10':return GMT(`TOP ${d.r} last time.`,`ครั้งก่อน TOP ${d.r}`);case'team':return GMT('Her team lost Senbatsu places last time.','ทีมของเธอเสียที่นั่งเซ็มบัตสึครั้งก่อน');case'gen':return GMT(`Generation ${d.g} has never reached Senbatsu.`,`รุ่น ${d.g} ยังไม่เคยมีใครติดเซ็มบัตสึ`);case'center':return GMT('Close to a Center position last time.','ครั้งก่อนเกือบได้ตำแหน่งเซ็นเตอร์');}return''}
// voting page: the motivation card (history-based; it never shows live votes or ranks)
{const f=V.ge;V.ge=function(){let h=f.apply(this,arguments);try{const e=geCur();if(e&&['voting','closed','scheduled'].includes(e.st)&&e.v2){if(!e.mv&&e.st=='voting')gmMotivate(e);const c=gmMotHtml(e);if(c)h+=c}}catch(x){console.error(x)}return h}}
// preliminary results: the fans' reactions
{const f=gePrelimHtml;gePrelimHtml=function(e){let h=f.apply(this,arguments);try{const PL=e.prelim||[];if(e.v2&&e.mv&&PL.length){const P=PL[Math.min(PL.length-1,ui.gep==null?PL.length-1:ui.gep)],L=(e.mv.react||{})[P.n2]||[];if(L.length){const c=`<div class="c gmrea"><h3>💬 ${GMT('Fan reactions','ปฏิกิริยาของแฟนๆ')}</h3>${L.map(z=>`<div class="gmrow">${ptc(get(z.id),30)}<p>${esc(z.t)}</p></div>`).join('')}</div>`;const i=h.indexOf('<div class="geprg">');h=i>=0?h.slice(0,i)+c+h.slice(i):h+c}}}catch(x){console.error(x)}return h}}
// member profile: election career
function gmCareerHtml(m){const C=gmCareer(m);if(!C.n)return'';const f=(k,en,th)=>C.first[k]?`<li><b>${GMT(en,th)}</b>: ${esc(C.first[k])}</li>`:'';
 return`<div class="c gmcar"><h3>${GMT('Election career','เส้นทางการเลือกตั้ง')}</h3><div class="gekpi">${[[GMT('Elections','ลงเลือกตั้ง'),C.n],[GMT('Ranked','ติดอันดับ'),C.ranked],['Senbatsu',C.sen],['Top 10',C.top10],['Top 3',C.top3],[GMT('Championships','แชมป์'),C.wins],[GMT('Best','ดีที่สุด'),C.best?'TOP '+C.best:'—'],[GMT('Lowest ranked','ต่ำสุด'),C.worst?'TOP '+C.worst:'—']].map(([a,b])=>`<div><small>${a}</small><b>${b}</b></div>`).join('')}</div>
 <ul class="wll">${f('rank','First ranking','ติดอันดับครั้งแรก')}${f('sen','First Senbatsu','เซ็มบัตสึครั้งแรก')}${f('top10','First Top 10','ท็อป 10 ครั้งแรก')}${f('top3','First Top 3','ท็อป 3 ครั้งแรก')}${f('win','First championship','แชมป์ครั้งแรก')}
 ${C.long.sen>=2?`<li><b>${GMT('Longest Senbatsu streak','ติดเซ็มบัตสึต่อเนื่องนานสุด')}</b>: ${C.long.sen}</li>`:''}${C.long.top3>=2?`<li><b>${GMT('Consecutive Top 3','ท็อป 3 ติดต่อกัน')}</b>: ${C.long.top3}</li>`:''}${C.comeback&&C.comeback.d>=5?`<li><b>${GMT('Greatest comeback','พลิกกลับมากที่สุด')}</b>: ${C.comeback.from?'TOP '+C.comeback.from:GMT('Unranked','ไม่ติดอันดับ')} → TOP ${C.comeback.to} (${esc(C.comeback.name)})</li>`:''}${C.decline&&C.decline.d<=-5?`<li><b>${GMT('Biggest decline','ร่วงมากที่สุด')}</b>: TOP ${C.decline.from} → ${C.decline.to?'TOP '+C.decline.to:GMT('Unranked','ไม่ติดอันดับ')} (${esc(C.decline.name)})</li>`:''}
 ${C.recs.filter(r=>r.gaps&&r.gaps.miss&&r.gaps.miss.rel<=.08).map(r=>`<li><b>${GMT('Near miss','เฉียดฉิว')}</b>: ${esc(r.name)} — ${GMT(`missed TOP ${r.gaps.miss.c} by ${r.gaps.miss.by.toLocaleString()} votes`,`พลาด TOP ${r.gaps.miss.c} ไป ${r.gaps.miss.by.toLocaleString()} คะแนน`)}</li>`).join('')}</ul></div>`}
{const f=profHtml;profHtml=function(m,cand){let h=f.apply(this,arguments);try{if(cand||!m||!(m.geRec||[]).length)return h;const a=h.indexOf('<div class="c gerec">');if(a<0)return h;const b=h.indexOf('</ul></div>',a);if(b<0)return h;const c=gmCareerHtml(m);if(c)h=h.slice(0,b+11)+c+h.slice(b+11)}catch(x){console.error(x)}return h}}
// election records of this group (from stored results only)
function gmRecords(){const ids=typeof geIdsHere=='function'?geIdsHere():new Set(geS().list.map(z=>z.id)),E=geS().list.filter(z=>z.st=='done'&&z.final&&ids.has(z.id));if(!E.length)return[];
 const pool=[...S.members,...(S.alumni||[])].filter(m=>(m.geRec||[]).some(h=>ids.has(h.eid)));const C=pool.map(m=>{const all=m.geRec;m.geRec=all.filter(h=>ids.has(h.eid));try{return{m,C:gmCareer(m)}}finally{m.geRec=all}});
 const best=(fn,min,txt)=>{const L=C.map(z=>({z,v:fn(z.C,z.m)})).filter(x=>x.v!=null&&x.v>=min).sort((a,b)=>b.v-a.v);if(!L.length)return null;const top=L.filter(x=>x.v==L[0].v).slice(0,3);return{who:top.map(x=>x.z.m),v:L[0].v,txt:txt(L[0].v,L[0].z)}};
 const R=[[GMT('Most championships','แชมป์มากที่สุด'),best(c=>c.wins,1,v=>GMT(`${v} title(s)`,`${v} สมัย`))],[GMT('Most consecutive Top 3','ท็อป 3 ติดต่อกันมากที่สุด'),best(c=>c.long.top3,2,v=>GMT(`${v} in a row`,`${v} ครั้งติด`))],[GMT('Longest Senbatsu streak','ติดเซ็มบัตสึต่อเนื่องนานที่สุด'),best(c=>c.long.sen,2,v=>GMT(`${v} in a row`,`${v} ครั้งติด`))],
  [GMT('Most Senbatsu appearances','ติดเซ็มบัตสึมากที่สุด'),best(c=>c.sen,2,v=>GMT(`${v} times`,`${v} ครั้ง`))],[GMT('Most Top 10','ติดท็อป 10 มากที่สุด'),best(c=>c.top10,2,v=>GMT(`${v} times`,`${v} ครั้ง`))],[GMT('Most Top 3','ติดท็อป 3 มากที่สุด'),best(c=>c.top3,2,v=>GMT(`${v} times`,`${v} ครั้ง`))],
  [GMT('Greatest comeback','พลิกกลับมากที่สุด'),best(c=>c.comeback?c.comeback.d:null,5,(v,z)=>`${z.C.comeback.from?'TOP '+z.C.comeback.from:GMT('Unranked','ไม่ติดอันดับ')} → TOP ${z.C.comeback.to} (${z.C.comeback.name})`)],[GMT('Biggest decline','ร่วงมากที่สุด'),best(c=>c.decline?-c.decline.d:null,5,(v,z)=>`TOP ${z.C.decline.from} → ${z.C.decline.to?'TOP '+z.C.decline.to:GMT('Unranked','ไม่ติดอันดับ')} (${z.C.decline.name})`)],
  [GMT('Most votes in one election','คะแนนสูงสุดในครั้งเดียว'),best(c=>Math.max(0,...c.recs.map(r=>r.votes||0)),1,v=>GMT(`${v.toLocaleString()} votes`,`${v.toLocaleString()} คะแนน`))],
  [GMT('First underdog champion','แชมป์ม้ามืดคนแรก'),(()=>{for(const e of E.slice().sort((a,b)=>a.vEnd-b.vEnd)){const w=e.final.rows.find(r=>r.rank==1);if(!w)continue;const m=get(w.id)||(S.alumni||[]).find(a=>a.id==w.id);if(!m)continue;const all=m.geRec||[];m.geRec=all.filter(h=>ids.has(h.eid));let c;try{c=gmCareer(m,e.vStart)}finally{m.geRec=all}if(c.n&&(!c.best||c.best>gmCut(e)))return{who:[m],txt:esc(e.name)}}return null})()],
  [GMT('Highest ranking before graduation','อันดับสูงสุดก่อนจบการศึกษา'),best((c,m)=>m.status=='graduated'||(S.alumni||[]).includes(m)||(m.grad&&m.grad.ann!=null)?(c.last&&c.last.rank?100-c.last.rank:null):null,1,(v,z)=>`TOP ${100-v} (${z.C.last.name})`)]];
 return R.filter(x=>x[1])}
function gmRecordsHtml(){const R=gmRecords();if(!R.length)return'';return`<div class="c gmrecs"><h3>🏆 ${GMT('Election records','สถิติการเลือกตั้ง')}</h3><div class="gmlist">${R.map(([t,x])=>`<div class="gmrow">${x.who.slice(0,3).map(m=>ptc(m,30)).join('')}<div><b>${esc(t)}</b><small class="st">${x.who.map(m=>esc(m.stage||m.name)).join(', ')} · ${esc(String(x.txt))}</small></div></div>`).join('')}</div></div>`}
{const f=V.gearch;V.gearch=function(){let h=f.apply(this,arguments);try{const r=gmRecordsHtml();if(r){const i=h.indexOf('<div class="c');h=i>=0?h.slice(0,i)+r+h.slice(i):h+r}}catch(x){console.error(x)}return h}}
