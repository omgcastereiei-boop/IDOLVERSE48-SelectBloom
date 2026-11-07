// =====================================================================================
//  General Election — fan-behaviour voting (extends js/ui/election.js)
// -------------------------------------------------------------------------------------
//  · Votes come from simulated CD purchases of the EXISTING aggregate fan segments
//    (S.fb.segs). No election fanbase is created and no fan record is copied or changed.
//  · Each segment buys CDs from its own buying probability (fan type, loyalty, engagement,
//    Kami Oshi tie), quantity per buyer (spending power, loyalty, Kami Oshi) and timing
//    style (early / steady / late). The CDs a segment buys are split between its Kami Oshi
//    (priority) and its other Oshi, so one fan is never counted twice: the segment's
//    purchases are generated once and then divided.
//  · 1 CD = 1 vote token, tied to this election and to one candidate (e.pend[id]) until
//    cast. Tokens not cast when voting closes expire.
//  · The release-day CDs come from the existing CD sales system; they are attributed to
//    segments by their release-day buying, and that real number sets the sales scale (e.k2)
//    used by the daily simulation, so the existing CD economy is unchanged.
//  · Exactly two preliminary results: 01 the day after release (ranking + votes),
//    02 one calendar month after voting starts (ranking only, scores hidden).
//    They change segment motivation (e.mot[segmentId]) for FUTURE buying only.
//  · Six-month cooldown from the day the ceremony is completed (S.ge.cool).
// =====================================================================================
const GE2={BUY:{casual:.12,dedicated:.42,oshi:.55,hardcore:.86,collector:.8},QTY:{casual:1.2,dedicated:4,oshi:7,hardcore:28,collector:40},MOT:[.55,2.2],R0:20,COOL:6};
const geH2=s=>{let h=2166136261;s=String(s);for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h/4294967296};
const geCl2=(v,a,b)=>Math.max(a,Math.min(b,v));
function geAddMon(d,n){const a=dayDate(d),t=new Date(a.getFullYear(),a.getMonth()+n,1),last=new Date(t.getFullYear(),t.getMonth()+1,0).getDate();t.setDate(Math.min(a.getDate(),last));return dateDay(t)}
function geSpanTxt(d0,d1){if(d1<=d0)return'0 days';let m=0;while(geAddMon(d0,m+1)<=d1)m++;const d=d1-geAddMon(d0,m);return[m?`${m} month${m!=1?'s':''}`:'',d?`${d} day${d!=1?'s':''}`:''].filter(Boolean).join(' ')||'0 days'}
const geSegs=()=>{const L=(S.fb&&Array.isArray(S.fb.segs))?S.fb.segs:[];return L.length?L:[{id:'g0',n:Math.max(0,S.fans|0),ft:'casual',k:null,o:{},pat:'multi',loy:35,eng:45,sp:35,born:0}]};
// one fan segment's election buying profile (computed from the live fanbase each day)
function geProf(e,s,PS){if(!s||!(s.n>0))return null;const kc=s.k!=null&&PS.has(s.k)?s.k:null,sh={};let os=0;
 for(const j in s.o)if(PS.has(+j)&&s.o[j]>0)os+=Math.min(s.o[j],s.n);
 if(kc!=null){const sk=os>0?Math.min(.97,((FB_PAT[s.pat]||[.75])[0])+.06):1;sh[kc]=sk;if(os>0)for(const j in s.o)if(PS.has(+j)&&s.o[j]>0)sh[j]=(sh[j]||0)+(1-sk)*Math.min(s.o[j],s.n)/os}
 else if(os>0){for(const j in s.o)if(PS.has(+j)&&s.o[j]>0)sh[j]=Math.min(s.o[j],s.n)/os}else sh._f=1;
 const fl=s.ft=='casual'?.1:s.pat=='multi'?.06:.03;if(!sh._f){for(const j in sh)sh[j]*=1-fl;sh._f=fl}
 const loy=(s.loy??40)/100,eng=(s.eng??50)/100,sp=(s.sp??40)/100,tie=kc!=null?1.25:os>0?.8:.45,age=1+Math.min(.15,Math.max(0,S.day-(s.born||0))/365*.1);
 const p=Math.min(.97,(GE2.BUY[s.ft]||.2)*(.4+.6*loy)*(.6+.8*eng)*tie*age);
 const q=1+(GE2.QTY[s.ft]||2)*Math.pow(sp,1.6)*(.5+loy)*(kc!=null?1.5:.6);
 let mk=1;if(kc!=null){const m=get(kc);if(m){const w=wlOf(m);mk=(.85+m.pop/300)*(1+(m.buzz||0)/400)*(w&&w.leave?.9:1);const sg=e.surge&&e.surge[kc];if(sg&&sg.until>=S.day)mk*=sg.f}}
 const mot=(e.mot&&e.mot[s.id])||1;return{s,n:s.n,kc,sh,p,q,mk,mot,st:geStyle(e,s)}}
function geStyle(e,s){const h=geH2(e.id+':'+s.id),b=s.ft=='hardcore'||s.ft=='collector'?.15:0;return h<.3+b?'early':h<.72?'steady':'late'}
function geTw(st,t,T){const x=t/T;return st=='early'?1.5*Math.exp(-t/10)+.3+.6*x**4:st=='late'?.2+2.4*x**3:.65+.7*x*x}
const GE_Z={};function geZ(st,T){const k=st+T;if(GE_Z[k])return GE_Z[k];let z=GE2.R0*geR0f(st);for(let t=1;t<=T;t++)z+=geTw(st,t,T);return GE_Z[k]=z}
const geR0f=st=>st=='early'?1.4:st=='late'?.5:1;
// split an integer number of CDs between weighted keys (exact sum)
function geSplit(u,W){const K=Object.keys(W).filter(k=>W[k]>0),tot=K.reduce((a,k)=>a+W[k],0),out={};if(!u||!K.length)return out;let used=0;const fr=[];
 K.forEach(k=>{const q=u*W[k]/tot,f=Math.floor(q);out[k]=f;used+=f;fr.push([k,q-f+Math.random()*1e-6])});fr.sort((a,b)=>b[1]-a[1]);for(let i=0;used<u;i=(i+1)%fr.length){out[fr[i][0]]++;used++}return out}
function geFloatW(e){const W={};geLive(e).forEach(id=>{const m=get(id);W[id]=Math.pow(Math.max(1,m.fans||1),.8)*(.75+m.pop/200)*(1+(m.buzz||0)/250)});return W}
// give a segment's CDs to candidates (Kami Oshi first, then Oshi; floating fans by popularity)
function geGive(e,P,u,FW){if(u<=0)return 0;const sp=geSplit(u,P.sh);let f=sp._f||0;delete sp._f;if(f>0){const g=geSplit(f,FW||geFloatW(e));for(const k in g)sp[k]=(sp[k]||0)+g[k]}
 e.pend=e.pend||{};e.buy=e.buy||{};for(const k in sp){if(!sp[k])continue;e.pend[k]=(e.pend[k]||0)+sp[k];e.buy[k]=(e.buy[k]||0)+sp[k]}
 if(P.kc!=null){e.kb=e.kb||{};e.kb[P.kc]=(e.kb[P.kc]||0)+(sp[P.kc]||0)}return u}
function geProfs(e){const PS=new Set(geLive(e));return geSegs().map(s=>geProf(e,s,PS)).filter(Boolean)}
// release day: the CDs sold by the existing system are attributed to the segments that bought them
function geRelAttr(e,units){const T=Math.max(1,e.vEnd-e.vStart),PR=geProfs(e),W={};let tot=0;
 PR.forEach((P,i)=>{const w=P.n*P.p*P.q*P.mk*GE2.R0*geR0f(P.st)/geZ(P.st,T);W[i]=w;tot+=w});
 e.k2=+geCl2(tot>0?units/tot:1,.02,25).toFixed(4);const sp=geSplit(units,W),FW=geFloatW(e);PR.forEach((P,i)=>geGive(e,P,sp[i]||0,FW));return units}
function gePromo(e,x,d){return 1+((S.cal||[]).some(c=>c.rid==x.rid&&(c.type=='handshake'||c.type=='road'||c.type=='concert')&&evDays(c).some(z=>z==d||z==d-1))?.35:0)+(geIsWE(d)?.12:0)}
// one day of CD buying by every segment
function geBuyDay(e,x,d){const t=d-e.vStart,T=Math.max(1,e.vEnd-e.vStart),pm=gePromo(e,x,d),FW=geFloatW(e);let u=0;
 geProfs(e).forEach(P=>{const ex=(e.k2||1)*P.n*P.p*P.q*P.mk*P.mot*pm*geTw(P.st,t,T)/geZ(P.st,T)*Math.exp(geRandN()*.25);const c=fbRound(Math.max(0,ex));if(c>0)u+=geGive(e,P,c,FW)});return u}
// fans cast part of the tokens they hold each day; ties go to the member whose token arrived first
function geCast2(e,d){const t=d-e.vStart,T=Math.max(1,e.vEnd-e.vStart),fr=Math.min(.9,.32+.42*Math.pow(t/T,2)+(d==e.vEnd?.1:0)),ids=geLive(e).slice().sort(()=>Math.random()-.5);let V=0;
 ids.forEach(id=>{const h=e.pend[id]||0;if(!h)return;const c=Math.min(h,fbRound(h*fr));if(c>0){e.pend[id]=h-c;e.votes[id]=(e.votes[id]||0)+c;e.last[id]=++e.ts;V+=c}});e.cast+=V;return V}
// ---- preliminary results (exactly two) ----------------------------------------------------------
const gePre2=e=>(e.prelim||[]).filter(p=>p.v2);
function gePrelimN(e,n){if(gePre2(e).some(p=>p.n2==n))return null;const R=geSorted(e),cap=geTotal(e),prev=gePre2(e).at(-1),hide=n==2;
 const rows=R.map((r,i)=>({id:r.id,v:hide?null:r.v,rank:i<cap&&r.v>0?i+1:null}));
 const p={v2:1,n2:n,n:(e.prelim||[]).length+1,day:S.day,label:n==1?'Preliminary Result 01':'Preliminary Result 02',hidden:hide?1:0,cast:hide?null:e.cast,tokens:hide?null:e.tokens,rows};
 if(prev){const P0=new Map(prev.rows.map(r=>[r.id,r.rank]));p.inn=rows.filter(r=>r.rank&&!P0.get(r.id)).map(r=>r.id);p.out=rows.filter(r=>!r.rank&&P0.get(r.id)).map(r=>r.id)}
 e.prelim=e.prelim||[];e.prelim.push(p);p.mot=geMotivate(e,p,prev);
 const top=Object.entries(p.mot).sort((a,b)=>b[1].up-a[1].up)[0],tm=top&&top[1].up>0?get(+top[0]):null;
 geN(`<li>📊 <b>${esc(e.name)}</b> — ${esc(p.label)} announced${hide?' (ranking only — vote totals are hidden)':''}. 1st: <b>${esc((get(rows[0]&&rows[0].id)||{}).name||'—')}</b>.${tm?` Fans of <b>${esc(tm.name)}</b> are rallying behind her.`:''} Rankings can still change until voting closes on ${longDate(e.vEnd)}.</li>`);return p}
// the announcement changes how much each fan segment will buy from now on (never the votes already cast)
function geMotivate(e,p,prev){e.mot=e.mot||{};const live=geLive(e),PS=new Set(live),RK=new Map(p.rows.map(r=>[r.id,r])),P0=prev?new Map(prev.rows.map(r=>[r.id,r.rank])):null,cap=geTotal(e),hiN=Math.max(3,Math.ceil(cap*.25)),Rg=geRanges(e),pe=gePrevDone(e);
 const peR=new Map(pe?pe.final.rows.map(r=>[r.id,r.rank]):[]),exp=new Map(live.map(get).sort((a,b)=>b.pop-a.pop||b.fans-a.fans).map((m,i)=>[m.id,peR.get(m.id)||i+1]));
 const byRank=p.rows.filter(r=>r.rank),edge=rk=>Rg.some(([a,b])=>Math.abs(rk-a)<=1||Math.abs(rk-b)<=1),close=r=>{if(p.hidden||!r.rank)return edge(r.rank||cap);const i=r.rank-1,a=byRank[i-1],b=byRank[i+1];return edge(r.rank)||(a&&a.v-r.v<=Math.max(5,a.v*.06))||(b&&r.v-b.v<=Math.max(5,r.v*.06))};
 const fr=pb=>geCl2(pb+geRandN()*.08,0,.95),log={};
 geSegs().forEach(s=>{if(!(s.n>0)||s.k==null||!PS.has(s.k))return;const r=RK.get(s.k)||{rank:null},rk=r.rank,ex=exp.get(s.k)||cap,pr=P0?P0.get(s.k):null,loy=(s.loy??40)/100,eng=(s.eng??50)/100,sp=(s.sp??40)/100;
  let m=e.mot[s.id]||1;const L=log[s.k]=log[s.k]||{n:0,up:0,dn:0};L.n+=s.n;
  if(rk&&rk<=hiN&&(!pr||rk<=pr)){const f=fr(.45*(1-loy)*(1.25-eng));m*=1-f*(.2+Math.random()*.25);L.dn+=Math.round(s.n*f)}
  if(!rk||rk>ex+2||(pr&&rk>pr)){const f=fr(Math.min(.85,.15+.6*loy*(.5+eng)*(.6+sp*.6)));m*=1+f*(.25+Math.random()*.4);L.up+=Math.round(s.n*f)}
  else if(pr&&rk<pr){const f=fr(.3*eng);m*=1+f*(.05+Math.random()*.15);L.up+=Math.round(s.n*f)}
  if(close(r)){const f=fr(.35*loy);m*=1+f*(.1+Math.random()*.2);L.up+=Math.round(s.n*f*.5)}
  e.mot[s.id]=+geCl2(m,GE2.MOT[0],GE2.MOT[1]).toFixed(4)});
 for(const k in log){log[k].up=Math.min(log[k].up,log[k].n);log[k].dn=Math.min(log[k].dn,log[k].n)}return log}
// ---- voting lifecycle overrides ---------------------------------------------------------------
{const f=geStartVoting;geStartVoting=function(e,x){if(e.st!='producing')return f.apply(this,arguments);
 e.parts=e.parts.filter(id=>{const m=get(id);return m&&m.status!='graduated'});Object.assign(e,{v2:1,rid:x.rid,title:x.title,vStart:S.day,vEnd:geEnd(S.day),st:'voting',votes:{},last:{},ts:0,tokens:0,cast:0,daily:[],prelim:[],wd:[],fans0:Math.max(1,S.fans),first:Math.max(1,x.cd.units),mot:{},pend:{},buy:{},kb:{},surge:{}});
 e.p1=e.vStart+1;e.p2=geAddMon(e.vStart,1);e.lockedGroups=JSON.parse(JSON.stringify(e.groups));x.ge=e.id;
 const u=x.cd.units;geRelAttr(e,u);e.tokens=u;e.salesDay=S.day;const v=geCast2(e,S.day);e.daily.push({day:S.day,sales:u,cum:u,tok:e.tokens,votes:v});
 S.cal=S.cal||[];S.cal.push({id:'e'+(++S.sid),type:'gevote',ge:e.id,title:`${e.name} — voting closes`,day:e.vEnd,members:[],done:false})}}
{const f=geDay;geDay=function(e){if(!e||!e.v2)return f.apply(this,arguments);const x=geSingleOf(e);if(!x||e.st!='voting')return;
 while(e.salesDay<Math.min(S.day,e.vEnd)){const d=++e.salesDay;geSurgeDay(e);for(const k in e.mot)e.mot[k]=+(1+(e.mot[k]-1)*.985).toFixed(4);
  const u=geBuyDay(e,x,d);x.sales=(x.sales||0)+u;x.cd.units+=u;x.cd.orders=(x.cd.orders||0)+Math.round(u/1.05);const rev=u*300;x.rev=(x.rev||0)+rev;if(rev)earn(rev,`Election CD sales: ${x.title}`);e.tokens+=u;
  const v=geCast2(e,d);e.daily.push({day:d,sales:u,cum:x.cd.units,tok:e.tokens,votes:v});if(d==e.p1)gePrelimN(e,1);if(d==e.p2)gePrelimN(e,2)}
 if(e.salesDay>=e.vEnd)geClose(e)}}
const geSup=id=>{let k=0,o=0;geSegs().forEach(s=>{if(!(s.n>0))return;if(s.k==id)k+=s.n;else if(s.o&&s.o[id])o+=Math.min(s.o[id],s.n)});return{k,o,u:k+o}};
{const f=geClose;geClose=function(e){const was=e.st;f.apply(this,arguments);try{if(e.v2&&was=='voting'&&e.final){e.pendExp={...e.pend};e.final.rows.forEach(r=>{const s=geSup(r.id);r.fans=s.u;r.kami=s.k})}}catch(x){console.error(x)}}}
{const f=geFinish;geFinish=function(e){const was=e&&e.st;f.apply(this,arguments);try{if(was=='ceremony'&&e.st=='done'){const G=geS();G.cool={eid:e.id,from:e.doneDay,until:geAddMon(e.doneDay,GE2.COOL)}}}catch(x){console.error(x)}}}
function geCool(){const G=geS();if(!G.cool){const D=G.list.filter(z=>z.st=='done'&&z.doneDay!=null).sort((a,b)=>b.doneDay-a.doneDay)[0];if(D)G.cool={eid:D.id,from:D.doneDay,until:geAddMon(D.doneDay,GE2.COOL)}}return G.cool||null}
const geCoolLeft=()=>{const c=geCool();return c&&S.day<c.until?c.until-S.day:0};
{const f=geNew;geNew=function(){if(!geActive()&&geCoolLeft()){const c=geCool();return toast(`Elections need a ${GE2.COOL}-month break. The next General Election can start on ${longDate(c.until)} (${geSpanTxt(S.day,c.until)} left).`,'err')}return f.apply(this,arguments)}}
// old saves: an election already in voting keeps every vote; its unused tokens get owners in proportion to the votes
function geMig2(){const G=geS();geCool();G.list.forEach(e=>{if(e.st=='voting'&&!e.v2){e.v2=1;e.mot=e.mot||{};e.kb=e.kb||{};e.buy={...e.votes};const live=geLive(e),W={};live.forEach(id=>W[id]=(e.votes[id]||0)+1);
  e.pend=geSplit(Math.max(0,e.tokens-e.cast),W);for(const k in e.pend)e.buy[k]=(e.buy[k]||0)+e.pend[k];(e.prelim||[]).forEach(p=>{if(!p.v2)p.legacy=1});
  e.p1=e.vStart+1;e.p2=geAddMon(e.vStart,1);if(!e.k2){const T=Math.max(1,e.vEnd-e.vStart);let tot=0;geProfs(e).forEach(P=>tot+=P.n*P.p*P.q*P.mk*GE2.R0*geR0f(P.st)/geZ(P.st,T));e.k2=+geCl2(tot>0?(e.first||1)/tot:1,.02,25).toFixed(4)}}
  if(e.v2){e.pend=e.pend||{};e.mot=e.mot||{}}})}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{geMig2()}catch(x){console.error(x)}return r}}
// ---- UI --------------------------------------------------------------------------------------
function geTimeline(e){const it=[[e.vStart,'🗳 Voting opens','Election Single released'],[e.p1,'📊 Preliminary Result 01','ranking + vote totals'],[e.p2,'📊 Preliminary Result 02','ranking only · scores hidden'],[e.vEnd,'🔒 Voting closes','unused tokens expire']];
 if(e.cer)it.push([e.cer.day,'👑 Results ceremony',esc(e.cer.vn||'')]);else it.push([null,'👑 Results ceremony','a Saturday or Sunday after voting closes']);
 const cu=e.cer?geAddMon(e.cer.day,GE2.COOL):null;it.push([cu,'⏳ Next election possible',`${GE2.COOL} months after the ceremony ends`]);
 return`<div class="c getl"><h3>Election timeline</h3><div class="getli">${it.map(([d,a,b])=>`<div class="${d!=null&&d<=S.day?'ok':''} ${d!=null&&d>S.day&&!it.some(([z])=>z!=null&&z>S.day&&z<d)?'on':''}"><b>${a}</b><span>${d!=null?longDate(d):'to be scheduled'}</span><small>${b}</small></div>`).join('')}</div></div>`}
const geLvl=r=>r>=1.6?['Very high','vh']:r>=1.15?['High','hi']:r>=.75?['Normal','nm']:['Low','lo'];
function geSupHtml(e){const live=geLive(e),PS=new Set(live),T=Math.max(1,e.vEnd-e.vStart),t=Math.min(S.day,e.vEnd)-e.vStart,A={};live.forEach(id=>A[id]={k:0,o:0,b:0,q:0,qn:0,a:0,mk:0,mn:0});
 geSegs().forEach(s=>{if(!(s.n>0))return;const P=geProf(e,s,PS);for(const j in s.o)if(A[j]&&+j!=s.k)A[j].o+=Math.min(s.o[j],s.n);if(!P||P.kc==null)return;const a=A[P.kc];a.k+=s.n;a.b+=s.n*P.p*P.mot;a.q+=P.q*s.n*P.p;a.qn+=s.n*P.p;a.a+=s.n*P.p*P.q*P.mot*P.mk*geTw(P.st,Math.max(1,t),T)/geZ(P.st,T);a.mk+=(P.mot)*s.n;a.mn+=s.n});
 const AV=live.map(id=>A[id].a).filter(v=>v>0).sort((a,b)=>a-b),avgA=AV.length?AV[Math.floor(AV.length/2)]:0,last=gePre2(e).at(-1)||(e.prelim||[]).at(-1),RK=new Map(last?last.rows.map(r=>[r.id,r.rank]):[]);
 const rows=live.map(id=>({id,m:get(id),...A[id]})).sort((a,b)=>(RK.get(a.id)||999)-(RK.get(b.id)||999)||(b.k+b.o)-(a.k+a.o));
 const mx=Math.max(1,...rows.map(r=>r.k+r.o)),row=r=>{const L=geLvl(avgA?r.a/avgA:1),mot=r.mn?r.mk/r.mn:1,cpb=r.qn?r.q/r.qn:0;return`<div class="gesr"><span class="geprk">${RK.get(r.id)?ordN(RK.get(r.id)):'—'}</span>${ptc(r.m,32)}<b>${esc(r.m.stage||r.m.name)}</b>
  <span class="gesfan" title="Unique supporters (people), not votes"><i style="width:${Math.round(100*(r.k+r.o)/mx)}%"></i><em><span class="gek2">♥ ${(r.k+r.o).toLocaleString()}</span><span> · Kami Oshi ${r.k.toLocaleString()}</span></em></span>
  <span class="gesbuy">${r.k?`~${Math.min(97,Math.round(100*r.b/Math.max(1,r.k)))}% buy · ≈${cpb<1.5?'1':cpb<10?cpb.toFixed(1):Math.round(cpb)} CDs each over the election`:'no Kami Oshi fans'}</span><span class="gelvl ${L[1]}">${L[0]}</span><span class="gemot">${mot>1.08?'🔥 Rallying':mot<.92?'😌 Confident':'Steady'}</span></div>`};
 return`<div class="c gesup"><h3>Fan support &amp; buying behaviour</h3><p class="st">♥ Fanbase = unique supporters (Kami Oshi and Oshi fans, each person counted once). It is not a vote count: votes come only from the CDs those fans actually buy. Activity and CDs per buyer are estimates from loyalty, engagement and spending power.</p>
  <div class="gesr gesh"><span>Rank</span><span></span><span>Member</span><span>♥ Fanbase · Kami Oshi</span><span>Kami Oshi fans buying</span><span>Activity</span><span>Fan mood</span></div>${rows.slice(0,24).map(row).join('')}${rows.length>24?`<details><summary class="st">More members (${rows.length-24})</summary>${rows.slice(24).map(row).join('')}</details>`:''}<p class="st">Rank = latest preliminary result. Exact vote totals stay hidden until the ceremony.</p></div>`}
{const f=gePrelimHtml;gePrelimHtml=function(e){const PL=e.prelim||[];if(!e.v2||!PL.length)return f.apply(this,arguments);const k=Math.min(PL.length-1,ui.gep==null?PL.length-1:ui.gep),P=PL[k];if(!P.v2)return f.apply(this,arguments);
 const prev=gePre2(e).filter(z=>z.n2<P.n2).at(-1),P0=new Map(prev?prev.rows.map(r=>[r.id,r.rank]):[]),R=geRanges(e),rk=P.rows.filter(r=>r.rank),mo=P.mot||{};
 const row=r=>{const m=get(r.id),o=P0.get(r.id),d=prev&&o&&r.rank?o-r.rank:null,i=r.rank?r.rank-1:-1,ab=i>0?rk[i-1]:null,M=mo[r.id];
  // rank · face · name (group · team below) · votes · rank change — nothing else
  const val=P.hidden?`<span class="gepv hid" title="Hidden in Preliminary Result 02">？？？</span>`:`<span class="gepv">${r.v.toLocaleString()}</span>`,g0=m&&(S.groups||[]).find(x=>x.id==m.group),t0=m&&teamOf(m),aff=m?[g0&&g0.name,m.status=='trainee'?TL():t0&&t0.name].filter(Boolean).join(' · '):'';
  const chg=!prev?'':d==null?(r.rank&&!o?'NEW':o&&!r.rank?'OUT':''):d>0?'▲'+d:d<0?'▼'+(-d):'—';
  return`<div class="gepr gepr2 ${r.rank&&R.some(z=>z[0]==r.rank)?'cen':''}"><span class="geprk">${r.rank?ordN(r.rank):'—'}</span>${m?ptc(m,36):''}<span class="geprn"><b>${esc(m?m.stage||m.name:'#'+r.id)}</b>${aff?`<small>${esc(aff)}</small>`:''}</span>${val}<span class="gechg ${d>0?'up':d<0?'dn':chg=='NEW'?'new':''}">${chg}</span></div>`};
 const grp=e.groups.map((g,i)=>{const rs=P.rows.filter(r=>r.rank>=R[i][0]&&r.rank<=R[i][1]);return`<div class="gepgh"><b>${esc(g.name)}</b><span>${ordN(R[i][0])} – ${ordN(R[i][1])}</span></div>${rs.map(row).join('')||'<p class="st">No members in this range yet.</p>'}`}).join('');
 const un=P.rows.filter(r=>!r.rank),next=!gePre2(e).some(z=>z.n2==2)&&e.st=='voting'?`<p class="st">Preliminary Result 02 (ranking only) on ${longDate(e.p2)}.</p>`:'';
 return`<div class="c geprel ${P.hidden?'hid':''}"><div class="row"><span class="geprb big">PRELIMINARY RESULTS</span><b>${esc(P.label)}</b><span class="st">${longDate(P.day)} · ${P.hidden?'vote totals hidden · ranking only':P.cast.toLocaleString()+' votes counted'} · not final</span><span style="flex:1"></span>${PL.length>1?`<select onchange="ui.gep=+this.value;render()">${PL.map((x,i)=>`<option value="${i}" ${i==k?'selected':''}>${esc(x.label)}</option>`).join('')}</select>`:''}</div>
 ${P.hidden?`<p class="st gehidn">Scores are hidden in Preliminary Result 02. Arrows compare with Preliminary Result 01.</p>`:''}${P.inn&&P.inn.length?`<p class="st">Newly in the ranking: ${P.inn.map(id=>esc((get(id)||{}).name||'')).join(', ')}</p>`:''}${P.out&&P.out.length?`<p class="st">Left the ranking: ${P.out.map(id=>esc((get(id)||{}).name||'')).join(', ')}</p>`:''}
 <div class="geprg">${grp}</div>${un.length?`<details><summary class="st">Outside the ranked positions (${un.length})</summary>${un.map(row).join('')}</details>`:''}<p class="st">Final results are revealed only at the ceremony.</p>${next}</div>`}}
{const f=geDashHtml;geDashHtml=function(e){const h=f.apply(this,arguments);if(!e.v2)return h;return(e.st=='voting'?geSupHtml(e):'')+h}}
{const f=geHero;geHero=function(e,sub){const h=f.apply(this,arguments);return e&&e.v2&&e.vStart!=null&&e.st!='done'?h+geTimeline(e):h}}
{const f=geMeta;geMeta=function(r){const h=f.apply(this,arguments);return r&&r.fans!=null?h+` · <span class="gek2">♥ ${r.fans.toLocaleString()} supporters</span>`:h}}
{const f=V.ge;V.ge=function(){let h=f.apply(this,arguments);const e=geCur();if(!e||e.st=='done'){const c=geCool(),L=geCoolLeft();if(c){const card=`<div class="c gecool ${L?'':'ok'}"><span class="geprb">${L?'COOLDOWN':'READY'}</span><div><b>${L?`Next General Election possible on ${longDate(c.until)}`:'A new General Election can be organized'}</b><span class="st">${L?`${geSpanTxt(S.day,c.until)} left · `:''}Elections are held at least ${GE2.COOL} months apart, counted from the end of the last ceremony (${longDate(c.from)}).</span></div></div>`;
  h=h.replace('<div class="c gestart">',card+'<div class="c gestart">');if(L)h=h.replace(/<button class="b p" onclick="geNew\(\)">/,'<button class="b p" disabled onclick="geNew()">')}}return h}}
// ---- Preliminary Result pop-up: the results page opens by itself on the day it is announced --------------------------
// If another results window opens the same day, it follows when the pop-up is closed.
{const f=gePrelimN;gePrelimN=function(e,n){const p=f.apply(this,arguments);try{if(p&&e&&!ui.t){const g0=ui.gep;ui.gep=null;let h;try{h=gePrelimHtml(e)}finally{ui.gep=g0}
  const gn=S.groups.length>1?((grp(gsAg())||{}).name||''):'';ui.gePopQ=ui.gePopQ||[];ui.gePopQ.push(`<h2 class="ht">${esc(e.name)}${gn?` · ${esc(gn)}`:''}</h2>${h}<div class="row"><button class="b p" onclick="ui.mod=null;ui.modNext=null;${S.groups.length>1?`gsSelect(${gsAg()});`:''}goView('ge')">Open General Election</button></div>`)}}catch(err){console.error(err)}return p}}
{const f=adv;adv=function(){const r=f.apply(this,arguments);try{const Q=ui.gePopQ;if(Q&&Q.length){ui.gePopQ=[];if(ui.mod&&!ui.mod.gePop)ui.modNext=ui.mod;ui.mod={t:'html',gePop:1,h:Q.join('<hr>')};render()}}catch(e){console.error(e)}return r}}
{const f=render;render=function(){try{if(S&&!ui.t&&!ui.mod&&ui.modNext){ui.mod=ui.modNext;ui.modNext=null}}catch(e){}return f.apply(this,arguments)}}
