// =====================================================================================
//  Concert System — tickets, sales, performances, fan response, fan growth, reports
// -------------------------------------------------------------------------------------
//  Extends the concert records of concert.js (one data structure for the whole system).
//  · Ticket types per venue configuration (GA / Reserved / Premium / VIP) + online (General /
//    Premium). Physical quantities never exceed the venue capacity; online has no seats.
//  · Demand is simulated per fan SEGMENT of the existing fanbase (S.fb.segs): every fan is in
//    one segment, so a fan who supports several participants is counted once. Price response
//    depends on each segment's category, spending power and willingness to spend.
//  · Forecast = expected demand; the sale draws its own random result (it can differ).
//  · Energy: 20 per performing member per performance (existing Energy / Stamina, m.en). A member
//    without 20 Energy sits that performance out (no deduction, no automatic replacement).
//  · Performance Efficiency from Vocal, Dance, Passion, Energy, Physical / Mental Health, song
//    intensity, member–song compatibility, positions, number of songs and coordination
//    (probabilistic mistakes).
//  · Fan response per segment (song / member / position / performance / venue / online), kept
//    per fan category and per member fandom; fan growth works on the existing segments
//    (casual → regular, new Oshi, new Kami Oshi with the existing change rule, fans lost) and
//    new fans arrive through the existing acquisition (fbAcquire).
//  · Money: venue rental is paid at confirmation; ticket revenue is booked per performance;
//    the other expenses are booked once when the concert ends. The report never books twice.
// =====================================================================================
const CC_TIX={ga:'General Admission',rs:'Reserved Seat',pr:'Premium Seat',vip:'VIP Ticket'},CC_OTIX={og:'Online General',op:'Online Premium'};
const CC_TBASE={ga:7500,rs:9000,pr:14000,vip:25000,og:3500,op:6000};
const CC_TMUL={ga:.8,rs:1,pr:1.45,vip:2.3,og:1,op:1.8};
const CC_WILL={casual:8500,oshi:12000,dedicated:16000,hardcore:26000,dormant:5000,collector:16000};
const CC_RATE={casual:.035,oshi:.13,dedicated:.24,hardcore:.42,dormant:.004,collector:.24};
const CC_ORATE={casual:.015,oshi:.045,dedicated:.08,hardcore:.12,dormant:.002,collector:.08};
const CC_REP={casual:.05,oshi:.15,dedicated:.3,hardcore:.55,dormant:0,collector:.3};
const CC_TAFF={casual:{ga:1.3,rs:1,pr:.4,vip:.12},oshi:{ga:1,rs:1.1,pr:.8,vip:.35},dedicated:{ga:.8,rs:1,pr:1.2,vip:.8},hardcore:{ga:.6,rs:.8,pr:1.3,vip:1.6},dormant:{ga:1,rs:1,pr:.3,vip:.1},collector:{ga:.8,rs:1,pr:1.2,vip:.8}};
// ticket types offered by a venue configuration
function ccTiers(C){const V=ccV(C.vid);if(!V)return[];if(V.cat=='lh')return C.vcfg=='stand'?['ga','vip']:['rs','pr','vip'];if(V.cat=='hall'||V.cat=='lhall')return['rs','pr','vip'];return['ga','rs','pr','vip']}
const CC_ALLOC={ga:{ga:.95,vip:.05},sea:{rs:.75,pr:.2,vip:.05},big:{ga:.3,rs:.5,pr:.15,vip:.05}};
function ccTixDef(C,p,force){const T=ccTiers(C),cap=ccCap(C),rec=ccRec(C);const A=T.includes('ga')&&T.length==2?CC_ALLOC.ga:T.includes('ga')?CC_ALLOC.big:CC_ALLOC.sea;
 if(!p.tix||force){p.tix={};let left=cap;T.forEach((k,i)=>{const q=i==T.length-1?left:Math.floor(cap*(A[k]||0));left-=q;p.tix[k]={on:1,price:rec[k],qty:q}})}else{Object.keys(p.tix).forEach(k=>{if(!T.includes(k))delete p.tix[k]});T.forEach(k=>{if(!p.tix[k])p.tix[k]={on:0,price:rec[k],qty:0}})}
 if(!p.on||force)p.on={og:{on:0,price:rec.og},op:{on:0,price:rec.op}};return p.tix}
const ccPhysQty=p=>Object.values(p.tix||{}).reduce((a,t)=>a+(t.on?t.qty|0:0),0);
// ---- popularity & history ------------------------------------------------------------------------------------------------
const ccTrust=gid=>{const X=ccS();return X.trust[gid]!=null?X.trust[gid]:60};
function ccHist(gid){const L=ccS().list.filter(c=>c.status=='done'&&c.host==gid&&c.fin);if(!L.length)return{n:0,st:null};const st=avg(L.slice(-4).map(c=>c.fin.st||0));return{n:L.length,st}}
function ccPopIdx(C){const M=C.parts.map(get).filter(Boolean).sort((a,b)=>b.pop-a.pop);if(!M.length)return 40;const top=M.slice(0,5);return avg(top.map(m=>m.pop))*.7+avg(M.map(m=>m.pop))*.3}
// recommended prices (rounded to ¥500)
function ccRec(C){const V=ccV(C.vid),pi=ccPopIdx(C),h=ccHist(C.host),np=C.pf.length;const f=(V?(.85+V.prest/400):1)*(C.type=='anni'?1.08:C.type=='grad'?1.1:1)*(.8+pi/250)*(h.st==null?1:h.st>.95?1.05:h.st<.6?.92:1)*(np>=4?.97:1)*(V?(CC_ACC[V.pref]||.8)*.15+.85:1);
 const r={};for(const k in CC_TBASE)r[k]=Math.max(1000,Math.round(CC_TBASE[k]*(k[0]=='o'?(.9+f*.1)*Math.min(1.2,f):f)/500)*500);return r}
// ---- demand simulation over fan segments -----------------------------------------------------------------------------------
const ccPGroups=C=>[...new Set(C.parts.map(id=>{const m=get(id);return m?gsGid(m):null}).filter(x=>x!=null))];
const ccSig=x=>1/(1+Math.exp(4*(x-1)));
function ccGauss(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
// one performance: demand per physical tier / online tier, plus the per-segment buyers and a breakdown
function ccDemand(C,p,opt={}){const fb=fbState(),V=ccV(C.vid);const out={phys:{},on:{og:0,op:0},seg:[],br:{group:0,member:0,multi:0,casual:0,general:0},gen:0,genOn:0};if(!V||!fb)return out;
 const P=new Set(C.parts),G=ccPGroups(C),grad=new Set(C.grad||[]),np=C.pf.length,day=ccPfDay(C,p),T=ccTiers(C).filter(k=>p.tix&&p.tix[k]&&p.tix[k].on&&p.tix[k].qty>0),OT=['og','op'].filter(k=>p.on&&p.on[k]&&p.on[k].on);
 const acc=CC_ACC[V.pref]||.75,trust=.75+ccTrust(C.host)/240,h=ccHist(C.host),hf=h.st==null?1:.85+.2*h.st,slotF=(ccWE(day)?1.15:1)*(p.sl=='e'?1.05:1)*(p.no==C.pf.length&&np>1?1.1:1),pres=.9+V.prest/500;
 const gm=new Map();C.parts.forEach(id=>{const m=get(id);if(m)gm.set(id,m)});
 T.forEach(k=>out.phys[k]=0);
 fb.segs.forEach(s=>{if(!(s.n>0))return;let wg=0;G.forEach(g=>{const w=typeof fxGrpOk=='function'?fxGrpOk(s,g):1;if(w>wg)wg=w});const km=s.k!=null&&gm.get(s.k);let os=0,on=0;for(const j in s.o)if(P.has(+j)){os+=s.o[j];on++}const osh=Math.min(1,os/s.n);
  if(!km&&!osh&&!wg)return;const kp=km?.7+km.pop/150:0;let A=Math.min(1.25,(km?.75*kp:0)+osh*.45+wg*.4);if(A<=0)return;
  let tf=C.type=='anni'?1.25:1;if(C.type=='grad'){if(km&&grad.has(km.id))tf=2.2;else if([...grad].some(id=>s.o[id]))tf=1.5;else tf=1.1}
  const ft=s.ft||'casual',abroad=s.reg&&s.reg!='Japan',ac=abroad?.12:acc;const base=(CC_RATE[ft]||.01)*(.6+(s.et??50)/100*.8)*(.5+(s.eng??50)/100)*A*tf*trust*hf;
  const perf=s.n*base*(1+.25*(np-1))*(1+(np-1)*(CC_REP[ft]||0))/np*slotF*ac;
  const W=(CC_WILL[ft]||9000)*(.6+(s.ws??50)/100*.8)*(.7+(s.sp??50)/100*.6)*(km?1.25:1)*pres;let pb=0,phys=0;
  if(T.length&&perf>0){const b={},pr={};let sw=0;T.forEach(k=>{b[k]=ccSig(p.tix[k].price/(W*CC_TMUL[k]));pr[k]=b[k]*((CC_TAFF[ft]||CC_TAFF.casual)[k]||1);sw+=pr[k]});pb=Math.max(...T.map(k=>b[k]));phys=perf*pb;if(sw>0)T.forEach(k=>out.phys[k]+=phys*pr[k]/sw)}
  // online: mostly fans who cannot come (distance, abroad) or want both
  let onl=0;if(OT.length){const orate=s.n*(CC_ORATE[ft]||.01)*A*tf*trust*(abroad?2.2:1+(1-acc)*1.5)*(1+.15*(np-1))/np,Wo=W*.35;const b={};let sw=0;OT.forEach(k=>{b[k]=ccSig(p.on[k].price/(Wo*CC_TMUL[k]));sw+=b[k]*(k=='op'?(ft=='hardcore'||ft=='dedicated'?1.2:.5):1)});const mb=Math.max(...OT.map(k=>b[k]));onl=orate*mb;if(sw>0)OT.forEach(k=>out.on[k]+=onl*b[k]*(k=='op'?(ft=='hardcore'||ft=='dedicated'?1.2:.5):1)/sw)}
  if(phys+onl<=0)return;out.seg.push([s.id,phys,onl,ft]);
  const tot=phys+onl;if(km)out.br.member+=tot;else if(on>=2)out.br.multi+=tot;else if(ft=='casual')out.br.casual+=tot;else out.br.group+=tot});
 // general idol music audience (not in the fanbase yet)
 const pi=ccPopIdx(C),cap=ccCap(C),gT=T.filter(k=>k=='ga'||k=='rs');if(gT.length){const W=CC_WILL.casual*pres,gp=Math.max(...gT.map(k=>ccSig(p.tix[k].price/(W*CC_TMUL[k])))),g=cap*.05*(pi/60)*pres*acc*gp*slotF*(C.type=='reg'?1:.8);out.gen=g;gT.forEach(k=>out.phys[k]+=g/gT.length);out.br.general+=g}
 if(OT.includes('og')){const g=(S.fans||0)*.0015*(pi/60)*ccSig(p.on.og.price/(CC_WILL.casual*.35))/Math.max(1,np);out.genOn=g;out.on.og+=g;out.br.general+=g}
 // unmet premium demand moves partly down to cheaper tiers
 const order=['vip','pr','rs','ga'].filter(k=>T.includes(k));order.forEach((k,i)=>{const over=out.phys[k]-(p.tix[k].qty|0);if(over>0&&order[i+1]){out.phys[order[i+1]]+=over*.4}});
 return out}
function ccForecast(C,p){const D=ccDemand(C,p),R={phys:{},on:{},rev:0,buyers:0,obuy:0,cap:ccCap(C),avail:ccPhysQty(p)};
 Object.keys(D.phys).forEach(k=>{const t=p.tix[k],n=Math.min(t.qty|0,Math.round(D.phys[k]));R.phys[k]={dem:Math.round(D.phys[k]),sold:n,st:t.qty?n/t.qty:0,rev:n*t.price};R.rev+=n*t.price;R.buyers+=n});
 Object.keys(D.on).forEach(k=>{if(!(p.on&&p.on[k]&&p.on[k].on))return;const n=Math.round(D.on[k]);R.on[k]={dem:n,sold:n,rev:n*p.on[k].price};R.rev+=n*p.on[k].price;R.obuy+=n});R.st=R.avail?R.buyers/R.avail:0;R.br=D.br;return R}
// risk messages for ticket prices and the whole concert (never blocking)
function ccPriceRisk(C,p){const rec=ccRec(C),W=[];Object.entries(p.tix||{}).forEach(([k,t])=>{if(!t.on)return;const r=t.price/rec[k];if(r>=1.8)W.push(`${CC_TIX[k]}: ${Math.round(r*100)}% of the recommended price — demand will fall sharply and fans may react badly.`);else if(r>=1.3)W.push(`${CC_TIX[k]}: priced well above the recommendation — some fans will not buy.`);else if(r<=.6)W.push(`${CC_TIX[k]}: very cheap — high demand but low revenue per ticket.`)});
 Object.entries(p.on||{}).forEach(([k,t])=>{if(t.on&&t.price/rec[k]>=1.8)W.push(`${CC_OTIX[k]}: priced far above the recommendation.`)});return W}
// ---- streaming & fees ---------------------------------------------------------------------------------------------------
function ccStreamCost(C){const V=ccV(C.vid);const n=C.pf.filter(p=>p.on&&(p.on.og.on||p.on.op.on)).length;if(!n||!V)return{rows:[],a:0,n:0};const sc={lh:1,hall:1.2,lhall:1.4,arena:1.8,stad:2.2,dome:2.4}[V.cat]||1;
 const rows=[['sinf','Streaming infrastructure',400000*n],['sbp','Broadcast production',800000*sc*n],['scam','Camera operators',Math.round(4+2*sc)*60000*n],['stech','Technical staff (streaming)',4*50000*n]].map(([k,nm,a])=>({k,n:nm,a:Math.round(a)}));return{rows,a:rows.reduce((x,r)=>x+r.a,0),n}}
const CC_FEE_TIX=.07,CC_FEE_ON=.12;
// ---- confirmation, sales, cancellation -----------------------------------------------------------------------------------
function ccConfirm(){const C=ccCur();if(!ccEdit(C))return;const E=ccErrs(C);if(E.length)return toast(E[0],'err');C.pf.forEach(p=>ccTixDef(C,p));
 const bad=C.pf.find(p=>ccPhysQty(p)>ccCap(C));if(bad)return toast(`Performance ${bad.no}: ticket quantities exceed the venue capacity (${ccCap(C).toLocaleString()}).`,'err');
 const K=ccCost(C),open=ui.ccopen!=null?+ui.ccopen:S.day+1,first=C.start;if(open>=first)return toast('The ticket sale must open before the first performance.','err');if(open<=S.day)return toast('The ticket sale opens tomorrow at the earliest.','err');
 const conf=ccConf(C),en=ccEnWarn(C),risk=ccRisk(C);
 ask(`Confirm “${C.name}” at ${ccV(C.vid).n}? The venue rental ${yen(K.rent.total)} is paid now; the other expenses (${yen(K.total-K.rent.total)} estimated, plus streaming and ticketing fees) are booked when the concert ends. Tickets go on sale ${jd(open)}.${conf.length?` ⚠ ${conf.length} schedule conflict(s).`:''}${en.length?` ⚠ ${en.length} Energy warning(s).`:''}${risk.length?' ⚠ '+risk[0]:''}`,()=>{
  if(!spend(K.rent.total,`Concert venue rental: ${C.name} (${ccV(C.vid).n})`))return;ccSnap(C);C.status='conf';C.conf=S.day;C.sale={open,close:first-1};C.est={G:JSON.parse(JSON.stringify(K.G)),total:K.total,rent:K.rent.total,sched:K.sched,stream:ccStreamCost(C)};C.paid={venue:K.rent.total};
  C.pf.forEach(p=>{p.sold={};p.fc=ccForecast(C,p)});ccLog(C,`Confirmed. Venue rental ${yen(K.rent.total)} paid.`);toast(`“${C.name}” confirmed. Tickets go on sale ${jd(open)}.`);ui.cct='sales';render()},'Confirm concert')}
function ccCancel(id){const C=ccGet(id);if(!C||!['plan','conf','sales'].includes(C.status))return;const paid=(C.paid||{}).venue||0,Sd=ccSched(C),early=Sd.prepFrom-S.day>=30,ref=C.status=='plan'?0:Math.round(paid*(early?.5:0));
 ask(C.status=='plan'?`Delete the plan “${C.name}”? (Plans are not kept in the history.)`:`Cancel “${C.name}”? ${ref?`50% of the venue rental is refunded (${yen(ref)}) because the preparation starts in 30 days or more.`:'The venue rental is not refunded.'} Tickets sold so far are refunded (no ticket money has been booked yet).`,()=>{
  if(C.status=='plan'){ccS().list=ccS().list.filter(c=>c!==C);ui.cc=null}else{C.status='cancel';C.cancelDay=S.day;if(ref)earn(ref,`Concert venue refund: ${C.name}`);C.fin={cancel:1,refund:ref,paid};ccLog(C,`Cancelled.${ref?' Refund '+yen(ref)+'.':''}`)}render()},C.status=='plan'?'Delete plan':'Cancel concert')}
function ccLog(C,t){C.log=C.log||[];C.log.unshift({day:S.day,t})}
// sales curve: share of the final demand sold by the end of day i of n
function ccCurve(i,n){if(n<=1)return 1;const tau=Math.max(1.5,n/4);let a=0,b=0;for(let j=0;j<n;j++){const w=Math.exp(-j/tau)+(j==n-1?.3:0);b+=w;if(j<=i)a+=w}return a/b}
function ccSalesOpen(C){const common=Math.exp(ccGauss()*.1);C.pf.forEach(p=>{const D=ccDemand(C,p);p.dem={};Object.entries(D.phys).forEach(([k,v])=>p.dem[k]=Math.max(0,Math.round(v*common*Math.exp(ccGauss()*.12))));Object.entries(D.on).forEach(([k,v])=>{if(p.on[k]&&p.on[k].on)p.dem[k]=Math.max(0,Math.round(v*common*Math.exp(ccGauss()*.15)))});p.sold={}});C.status='sales';ccLog(C,'Ticket sale opened.')}
function ccSalesDay(C){const n=C.sale.close-C.sale.open+1,i=Math.min(n-1,S.day-C.sale.open);const F=ccCurve(i,n);C.pf.forEach(p=>{for(const k in p.dem){const cap=k in CC_TIX?(p.tix[k].qty|0):Infinity;p.sold[k]=Math.min(cap,Math.round(p.dem[k]*F))}})}
function ccSalesClose(C){C.pf.forEach(p=>{for(const k in p.dem){const cap=k in CC_TIX?(p.tix[k].qty|0):Infinity;p.sold[k]=Math.min(cap,p.dem[k])}})}
// ---- daily processing ------------------------------------------------------------------------------------------------------
let CC_REP_Q=[];
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{ccDaily()}catch(e){console.error(e)}return r}}
function ccDaily(){const X=ccS();X.list.forEach(C=>{if(C.status=='conf'&&S.day>=C.sale.open)ccSalesOpen(C);if(C.status=='sales'){if(S.day<C.start)ccSalesDay(C);else{ccSalesClose(C);C.status='live';ccLog(C,'Concert started.')}}
  if(C.status=='live'){ccPfOrder(C).forEach(p=>{if(!p.res&&ccPfDay(C,p)<=S.day){try{ccPerform(C,p)}catch(e){console.error(e);p.res={err:1,day:S.day}}}});if(C.pf.every(p=>p.res))ccFinish(C)}});
 if(CC_REP_Q.length&&!ui.mod){ui.mod={t:'html',h:CC_REP_Q.join('<hr>')+'<div class="row"><button class="b p" onclick="ui.mod=null;render()">Close</button></div>',cc:1};CC_REP_Q=[]}}
// ---- performance -----------------------------------------------------------------------------------------------------------
const ccSongIt=set=>set.items.filter(i=>i.k=='song');
function ccPerform(C,p){const set=ccSetOf(C,p),V=ccV(C.vid),day=ccPfDay(C,p);if(!set)return p.res={err:1};const items=set.items,songs=ccSongIt(set);
 // performers: members of at least one song of this setlist; Energy 20 each, never below the limit
 const need=new Set();songs.forEach(it=>ccPerf(it).forEach(id=>need.add(id)));const out={},ok=new Set();need.forEach(id=>{const m=get(id);if(!m||m.status=='graduated')out[id]='Left the group';else if(wlAway(m))out[id]='On leave';else if((m.en|0)<20)out[id]=`Not enough Energy (${m.en|0}/20)`;else ok.add(id)});
 const en={};ok.forEach(id=>{const m=get(id);en[id]=m.en;m.en=Math.max(0,m.en-20)});
 try{wlWork([...ok],{load:6,str:1},'concert performance')}catch(e){}
 // per-member counts and efficiency
 const MR={};const mr=id=>MR[id]=MR[id]||{songs:0,center:0,front:0,middle:0,back:0,mc:0,en:ok.has(id)?20:0,eff:[],sc:0};C.parts.forEach(id=>mr(id));
 const seen={},songRes=[];let vS=0,dS=0,pS=0,w0=0,mistakes=0;
 items.forEach((it,i)=>{if(it.k=='mc'){ccMcMem(C,it).filter(id=>ok.has(id)||!need.has(id)).forEach(id=>mr(id).mc++);return}const o=ccSong(it.gid,it.song),L=ccPerf(it).filter(id=>ok.has(id));const gi=o&&MUI.g[o.genre]||{vw:.5,int:5};const vw=gi.vw??.5,inten=gi.int??5;
  let sv=0,sd=0,sp=0,n=0,miss=0;L.forEach(id=>{const m=get(id),R=mr(id);R.songs++;const pc=ccPosCls(it,id);R[pc]++;const W=wlOf(m),cond=(.5+.5*Math.min(100,en[id]-R.songs*inten*.15)/100)*(.6+.4*W.ph/100)*(.7+.3*W.mh/100);const comp=o?seComp(m,o.concept):50,fat=Math.max(0,R.songs-10)*.006;
   const v=(m.sing||0)*(.85+.15*comp/100)*cond*(1-fat),d=(m.dance||0)*(.85+.15*comp/100)*cond*(1-fat),ps=((m.pas||50)*.6+(m.cha||0)*.4)*cond;let sc=vw*v+(1-vw)*d;
   const pm=Math.max(.01,Math.min(.45,.02+(1-cond)*.35+inten*.006-((vw*(m.sing||0)+(1-vw)*(m.dance||0))-50)/400));if(Math.random()<pm){sc-=8+Math.random()*7;miss++}
   R.eff.push(sc*.85+ps*.15);sv+=v;sd+=d;sp+=ps;n++});
  if(n){const coord=Math.max(0,8-(n>1?Math.sqrt(L.map(id=>get(id).dance||0).reduce((a,x,_,A)=>a+(x-avg(A))**2,0)/n)/4:0));vS+=sv/n*(1+inten/40);dS+=(sd/n+coord)*(1+inten/40);pS+=sp/n;w0+=1+inten/40;mistakes+=miss}
  const rep=seen[it.song]?1:0;seen[it.song]=(seen[it.song]||0)+1;songRes.push({i,id:it.song,gid:it.gid,title:it.title,n:L.length,miss,rep,genre:o?o.genre:'',concept:o?o.concept:'',ly:o?o.lyT:'',role:o?o.role:''})});
 const vocal=w0?Math.round(fbCl(vS/w0)):0,dance=w0?Math.round(fbCl(dS/w0)):0,pas=songs.length?Math.round(fbCl(pS/Math.max(1,songRes.filter(s=>s.n).length))):0,eff=Math.round(fbCl(.38*vocal+.38*dance+.24*pas-mistakes*.6));
 Object.values(MR).forEach(R=>{R.e=R.eff.length?Math.round(fbCl(avg(R.eff))):null;delete R.eff});
 // tickets & revenue
 const sold={...(p.sold||{})},phys=Object.keys(CC_TIX).reduce((a,k)=>a+(sold[k]|0),0),onl=(sold.og|0)+(sold.op|0);const revP=Object.keys(CC_TIX).reduce((a,k)=>a+(sold[k]|0)*((p.tix[k]||{}).price||0),0),revO=['og','op'].reduce((a,k)=>a+(sold[k]|0)*((p.on[k]||{}).price||0),0);
 if(revP)earn(revP,`Concert tickets: ${C.name} · Performance ${p.no}`);if(revO)earn(revO,`Concert online tickets: ${C.name} · Performance ${p.no}`);
 const res={day,phys,onl,sold,revP,revO,cap:ccCap(C),vocal,dance,pas,eff,mistakes,out,mem:MR,songs:songRes,sid:p.set,setName:set.name};
 p.res=res;try{ccResponse(C,p,res)}catch(e){console.error(e)}try{ccGrowth(C,p,res)}catch(e){console.error(e)}
 C.hist=C.hist||{};CC_REP_Q.push(ccRepHtml(C,p,true));ccLog(C,`Performance ${p.no}: ${phys.toLocaleString()} in the venue, ${onl.toLocaleString()} online · efficiency ${eff}.`);return res}
// ---- song popularity -----------------------------------------------------------------------------------------------------
function ccSongPop(gid,id){const o=ccSong(gid,id);if(!o)return 40;let p=40+(o.role=='Main'?14:0)+(o.pref&&o.pref.s?(o.pref.s-50)*.4:0)+Math.min(10,(o.thBuzz||0)*2);const SG=gsCtx(gid,'singles')||[];const x=SG.find(z=>z.mainId==id);if(x&&x.sales){const mx=Math.max(...SG.map(z=>z.sales||0),1);p+=12*x.sales/mx}return fbCl(p)}
// ---- fan response ----------------------------------------------------------------------------------------------------------
function ccSegBuyers(C,p,res){const D=ccDemand(C,p);let tp=0,to=0;D.seg.forEach(z=>{tp+=z[1];to+=z[2]});const fp=tp+D.gen>0?Math.max(0,res.phys)*(tp/(tp+D.gen))/tp:0,fo=to+D.genOn>0?Math.max(0,res.onl)*(to/(to+D.genOn))/(to||1):0;
 return{seg:D.seg.map(z=>({sid:z[0],ph:z[1]*fp,on:z[2]*fo,ft:z[3]})).filter(z=>z.ph+z.on>.05),gen:res.phys*(D.gen/(tp+D.gen||1)),genOn:res.onl*(D.genOn/(to+D.genOn||1))}}
function ccResponse(C,p,res){const fb=fbState(),V=ccV(C.vid),SB=ccSegBuyers(C,p,res),byId=new Map(fb.segs.map(s=>[s.id,s])),songs=res.songs.filter(s=>s.n>0),tot=songs.length||1,rec=ccRec(C);
 const pop={};C.parts.forEach(id=>{const m=get(id);pop[id]=m?m.pop:0});
 const sc={};songs.forEach((s,k)=>{sc[k]={pop:ccSongPop(s.gid,s.id),w:(k==0?1.3:k==songs.length-1?1.4:1)*(s.role=='Main'?1.15:1)*(s.rep?.5:1),pen:s.rep?8:0,q:fbCl(res.eff-s.miss*6)}});
 const fill=res.cap?res.phys/res.cap:0,phEx=fbCl(50+V.prest*.3+12*(fill-.6)),stream=Math.random()<(V.cat=='lh'?.07:.03)?-25:0,onEx=fbCl(({lh:60,hall:70,lhall:74,arena:78,stad:78,dome:80}[V.cat]||70)+stream+(V.inc||[]).includes('sound')*4-Math.max(0,avg(songs.map(s=>s.n))-12)*.6);
 const agg={},add=(k,w,v)=>{const a=agg[k]=agg[k]||{w:0,song:0,mem:0,pos:0,perf:0,ph:0,on:0,all:0,wp:0,wo:0};a.w+=w;for(const f of['song','mem','pos','perf','all'])a[f]+=w*v[f];if(v.ph!=null){a.ph+=v.wp*v.ph;a.wp+=v.wp}if(v.on!=null){a.on+=v.wo*v.on;a.wo+=v.wo}};
 const priceR=(()=>{let a=0,b=0;Object.entries(p.tix||{}).forEach(([k,t])=>{if(t.on){a+=t.price*(res.sold[k]|0);b+=rec[k]*(res.sold[k]|0)}});return b?a/b:1})(),priceRO=(()=>{let a=0,b=0;['og','op'].forEach(k=>{const t=p.on[k];if(t&&t.on){a+=t.price*(res.sold[k]|0);b+=rec[k]*(res.sold[k]|0)}});return b?a/b:1})();
 const memSat=(mid,s)=>{const R=res.mem[mid];if(!R||!C.parts.includes(mid))return null;const x=Math.min(.95,.35+(pop[mid]||0)/140),e=R.songs/tot;let v=50+60*(e-x)+Math.min(6,R.mc*2);if(!R.songs)v=Math.min(v,20);return fbCl(v)},posSat=mid=>{const R=res.mem[mid];if(!R||!R.songs)return null;const f=(R.center*1.5+R.front)/R.songs,xf=Math.min(.9,(pop[mid]||0)/110);return fbCl(55+50*(f-xf)-R.back/R.songs*8)};
 const per=[];SB.seg.forEach(z=>{const s=byId.get(z.sid);if(!s)return;let sw=0,sv=0;songs.forEach((x,k)=>{const t=(muVal(s,'g',x.genre)+muVal(s,'c',x.concept)+muVal(s,'l',x.ly))/3;const v=.45*t+.3*sc[k].pop+.25*sc[k].q-sc[k].pen;sv+=v*sc[k].w;sw+=sc[k].w});const song=sw?sv/sw:50;
  const sup=[];if(s.k!=null)sup.push([s.k,1]);for(const j in s.o)if(C.parts.includes(+j))sup.push([+j,(s.k!=null?.2:.5)*s.o[j]/s.n]);let mw=0,mv=0,pw=0,pv=0;sup.forEach(([mid,w])=>{const a=memSat(mid,s),b=posSat(mid);if(a!=null){mv+=a*w;mw+=w}if(b!=null){pv+=b*w;pw+=w}});
  let mem=mw?mv/mw:(s.k!=null&&!C.parts.includes(s.k)?44:55),pos=pw?pv/pw:55;const perf=fbCl(30+.7*res.eff);const W=(CC_WILL[s.ft]||9000)*(.6+(s.ws??50)/100*.8);
  const ph=fbCl(phEx+6-Math.max(0,priceR*rec.rs/W-1)*25),on=fbCl(onEx-Math.max(0,priceRO*rec.og/(W*.35)-1)*25);const ex=(z.ph*ph+z.on*on)/(z.ph+z.on);
  const kami=s.k!=null&&C.parts.includes(s.k),wt=s.ft=='casual'?[.3,.08,.04,.28,.3]:kami?[.2,.3,.2,.15,.15]:[.26,.22,.12,.2,.2];const all=fbCl(wt[0]*song+wt[1]*mem+wt[2]*pos+wt[3]*perf+wt[4]*ex);
  const v={song,mem,pos,perf,all,ph:z.ph?ph:null,on:z.on?on:null,wp:z.ph,wo:z.on},w=z.ph+z.on;per.push({s,z,v,kami});add('all',w,v);add('ft:'+s.ft,w,v);if(kami)add('m:'+s.k,w,v)});
 // general audience (non-fans): entertainment + performance
 if(SB.gen+SB.genOn>0){const g=SB.gen+SB.genOn,songAvg=avg(songs.map((x,k)=>sc[k].pop*.6+sc[k].q*.4))||50,v={song:songAvg,mem:55,pos:55,perf:fbCl(30+.7*res.eff),all:fbCl(.35*songAvg+.35*fbCl(30+.7*res.eff)+.3*(SB.gen?phEx+6:onEx)),ph:SB.gen?phEx:null,on:SB.genOn?onEx:null,wp:SB.gen,wo:SB.genOn};add('all',g,v);add('gen',g,v)}
 const fin=a=>({n:Math.round(a.w),song:Math.round(a.song/a.w),mem:Math.round(a.mem/a.w),pos:Math.round(a.pos/a.w),perf:Math.round(a.perf/a.w),all:Math.round(a.all/a.w),ph:a.wp?Math.round(a.ph/a.wp):null,on:a.wo?Math.round(a.on/a.wo):null});
 const R={};for(const k in agg)if(agg[k].w>0)R[k]=fin(agg[k]);res.resp=R;res.onEx={stream:stream<0?'Streaming interruptions':'Stable stream',q:Math.round(onEx)};res.priceR=Math.round(priceR*100)/100;
 // negative reactions of specific fan groups (kept even when the overall score is good)
 const neg=[];Object.entries(R).forEach(([k,v])=>{if(k=='all'||v.n<5)return;const who=k.startsWith('m:')?`Fans of ${ccNm(C,+k.slice(2))}`:k.startsWith('ft:')?`${FX_CN&&FX_CN[k.slice(3)]||k.slice(3)} fans`:'General audience';if(v.all<45)neg.push(`${who}: unhappy overall (${v.all}).`);else if(k.startsWith('m:')&&(v.mem<40||v.pos<40))neg.push(`${who}: wanted more stage time${v.pos<40?' and better positions':''} for her (member ${v.mem}, position ${v.pos}).`);else if(v.song<42)neg.push(`${who}: disliked the song selection (${v.song}).`)});
 if(priceR>1.4)neg.push(`Ticket prices were ${Math.round(priceR*100)}% of the recommended level — many fans call them too expensive.`);if(stream<0&&res.onl)neg.push('Online viewers complained about streaming interruptions.');res.neg=neg;res._per=per;res._SB=SB}
// ---- fan growth (existing fanbase segments only) -----------------------------------------------------------------------------
function ccExpo(res,mid){const R=res.mem[mid];if(!R||!R.songs)return 0;const m=get(mid);return(R.center*2+R.front+R.songs*.5+R.mc*.3)*((R.e||50)/70)*(.5+(m?m.pop:0)/60)}
function ccGrowth(C,p,res){const fb=fbState();if(!fb)return;const per=res._per||[],G={newCas:0,newReg:0,newOshi:0,newKami:0,kch:0,lost:0,loyUp:0,mem:{}},gm=id=>G.mem[id]=G.mem[id]||{kg:0,og:0,cas:0,lost:0};
 const X=ccS();X.seen=X.seen||{};const seen=X.seen[C.id]=X.seen[C.id]||{};const ex={};let exT=0;C.parts.forEach(id=>{const e=ccExpo(res,id);if(e>0){ex[id]=e;exT+=e}});const pickM=()=>{let r=Math.random()*exT;for(const id in ex){r-=ex[id];if(r<=0)return+id}return+Object.keys(ex)[0]};
 per.forEach(({s,z,v})=>{if(!fb.segs.includes(s)||!(s.n>0))return;const b=Math.min(s.n,z.ph+z.on),prev=seen[s.id]||0,fresh=Math.max(0,b-prev*(.6+(CC_REP[s.ft]||0)));seen[s.id]=Math.max(prev,b);const sh=Math.min(1,b/s.n),sat=v.all;
  // loyalty & engagement of everyone who came
  s.loy=fbCl(s.loy+(sat-55)*.08*sh);s.eng=fbCl(s.eng+(sat-50)*.12*sh);if(sat>55)G.loyUp+=Math.round(b);
  if(sat<40){const l=Math.min(s.n,fbRound(b*(40-sat)/100*.3));if(l>0){s.n-=l;fbFix(s);G.lost+=l;fb.acc.lost=(fb.acc.lost||0)+l;fb.acc.lossBy['Concert']=(fb.acc.lossBy['Concert']||0)+l;if(s.k!=null)gm(s.k).lost+=l}return}
  if(!exT||fresh<=0)return;
  // casual → regular
  if(s.ft=='casual'&&sat>54){const c=Math.min(s.n-1,fbRound(fresh*Math.min(.25,(sat-50)/100)));if(c>0){const t=fbSplit(s,c);t.ft='oshi';t.org='Concert: '+C.name;G.newReg+=c}}
  // new Kami Oshi for fans without one
  if(s.k==null&&sat>58&&s.n>1){const c=Math.min(s.n-1,fbRound(fresh*(sat-55)/100*.25));if(c>0){const mid=pickM(),t=fbSplit(s,c),had=t.o[mid]||0;t.k=mid;delete t.o[mid];t.pat=fbPick();t.org='Concert: '+C.name;if(had)fbLife(mid,'ol',had);fbLife(mid,'kg',c);G.newKami+=c;gm(mid).kg+=c}}
  // Kami Oshi change (existing rule: uncommon, loyalty lowers it, the previous Kami Oshi often stays as an Oshi)
  else if(s.k!=null&&s.n>=2){const km=get(s.k),kin=C.parts.includes(s.k),to=pickM();if(km&&to!=s.k&&ex[to]>(ex[s.k]||0)*1.6){const r=Math.min(.03,(.004+.008*Math.min(1,ex[to]/8)+(kin?0:.006))*(1.4-s.loy/100)*(sat/70)),n=fbRound(fresh*r);if(n>0&&n<s.n){const t=fbSplit(s,n),had=t.o[to]||0;t.k=to;delete t.o[to];if(had)fbLife(to,'ol',had);const keep=fbRound(n*.6);if(keep>0){t.o[km.id]=keep;fbLife(km.id,'og',keep)}t.loy=fbCl(t.loy*.97);t.org='Kami Oshi change';fbLife(km.id,'kl',n);fbLife(to,'kg',n);fb.acc.kch+=n;const key=km.id+'>'+to;fb.acc.kmove[key]=(fb.acc.kmove[key]||0)+n;G.kch+=n;gm(to).kg+=n}}}
  // new Oshi (an additional favourite)
  if(sat>55){const c=fbRound(fresh*(sat-55)/100*.3);for(let i=0;i<Math.min(3,c);i++){const mid=pickM();if(mid==s.k)continue;const room=s.n-(s.o[mid]||0),a=Math.min(room,fbRound(c/Math.min(3,c)));if(a>0){s.o[mid]=(s.o[mid]||0)+a;fbLife(mid,'og',a);G.newOshi+=a;gm(mid).og+=a}}}
  fbFix(s)});
 // new fans: general audience who enjoyed it (part found the group, part a member)
 const SB=res._SB||{gen:0,genOn:0},sat=(res.resp.gen||res.resp.all||{all:50}).all,nN=fbRound((SB.gen+SB.genOn)*Math.max(0,Math.min(.35,(sat-48)/100*.7)));
 if(nN>0){const org='Concert: '+C.name,nm=fbRound(nN*.6);if(exT)for(let i=0;i<5&&nm>0;i++){const ids=Object.keys(ex).sort((a,b)=>ex[b]-ex[a]),mid=+ids[i%ids.length],c=i==4?nm-Math.round(nm*.8):Math.round(nm*ex[mid]/exT*1.2);if(c>0){fbAcquire(Math.min(c,nm),{via:'member',mid,org});gm(mid).cas+=Math.min(c,nm)}}fbAcquire(nN-nm,{via:'group',org});G.newCas+=nN}
 // recognition (member fan counts) and exposure, without creating extra supporters
 C.parts.forEach(id=>{const m=get(id),e=ex[id]||0;if(!m||!e)return;const g=Math.round(e*(res.phys+res.onl)/Math.max(1,C.parts.length)*.02);m.fans=(m.fans||0)+g;m.pop=popOf(m);if(fb.mf)fb.mf[id]=m.fans;fbExp(id,Math.min(3,e/4));(gm(id)).rec=g});
 try{fbMerge()}catch(e){}fbApply();res.growth=G;delete res._per;delete res._SB}
// ---- completion: expenses, trust, member treatment, history ---------------------------------------------------------------
function ccPay(a,l){a=Math.round(a);if(!(a>0))return;S.money-=a;S.exp+=a;S.led.unshift({d:S.day,l,a:-a});S.led.length=Math.min(S.led.length,80);try{if(typeof gsLedTag=='function')gsLedTag()}catch(e){}}
function ccFinish(C){const E=C.est,rows={},line=(g,n,a)=>{rows[g]=rows[g]||{n,a:0};rows[g].a+=Math.round(a)};
 const revP=C.pf.reduce((a,p)=>a+((p.res||{}).revP||0),0),revO=C.pf.reduce((a,p)=>a+((p.res||{}).revO||0),0);
 Object.entries(E.G).forEach(([k,g])=>{let a=g.a;if(k=='misc')a=Math.round(g.rows[0].a*(.5+Math.random())+g.rows[1].a);line(k,g.n,a)});
 const st=E.stream||{a:0};line('stream','Streaming',st.a+revO*CC_FEE_ON);line('tixfee','Ticketing fees',revP*CC_FEE_TIX);
 Object.entries(rows).forEach(([k,r])=>{if(k=='venue')return;ccPay(r.a,`Concert ${r.n}: ${C.name}`)});
 const exp=Object.values(rows).reduce((a,r)=>a+r.a,0),phys=C.pf.reduce((a,p)=>a+((p.res||{}).phys||0),0),on=C.pf.reduce((a,p)=>a+((p.res||{}).onl||0),0),avail=C.pf.reduce((a,p)=>a+ccPhysQty(p),0);
 C.fin={rev:{phys:revP,on:revO,total:revP+revO},exp:rows,expTotal:exp,net:revP+revO-exp,phys,on,st:avail?phys/avail:0};
 // fan trust (prices, satisfaction) and member treatment across concerts
 const X=ccS(),sat=avg(C.pf.map(p=>(((p.res||{}).resp||{}).all||{all:55}).all)),pr=avg(C.pf.map(p=>(p.res||{}).priceR||1));let t=ccTrust(C.host);t+=(sat-60)*.08;if(pr>1.35)t-=(pr-1.35)*30;X.trust[C.host]=Math.round(fbCl(t)*10)/10;
 const notes=[];if(pr>1.35)notes.push(`Ticket prices (${Math.round(pr*100)}% of the recommendation) lowered fan trust.`);
 const tot=C.pf.reduce((a,p)=>a+(((p.res||{}).songs||[]).filter(s=>s.n).length),0)||1;
 C.parts.forEach(id=>{const m=get(id);if(!m)return;const R=C.pf.map(p=>((p.res||{}).mem||{})[id]).filter(Boolean),songs=R.reduce((a,r)=>a+r.songs,0),front=R.reduce((a,r)=>a+r.center+r.front,0),back=R.reduce((a,r)=>a+r.back,0);
  const exp=Math.min(.95,.35+m.pop/140),def=Math.max(0,exp-songs/tot)+(songs?Math.max(0,Math.min(.9,m.pop/110)-front/songs)*.5+back/songs*.2:.4);const T=X.mt[id]=X.mt[id]||{d:0,n:0,cc:0};T.cc++;T.d=T.d*.6+(m.pop>=55?def:def*.3);T.n=def>.3&&m.pop>=55?T.n+1:0;
  if(T.n>=2&&T.d>.35){const k=Math.min(4,T.d*5);fbBoost(s=>s.k==id,-k,-k*.6);fbExp(id,-Math.min(2,k/2));X.trust[C.host]=Math.round(fbCl(X.trust[C.host]-T.d*3)*10)/10;notes.push(`Fans of ${m.name} are frustrated: she received little stage time / poor positions in ${T.n} concerts in a row.`)}});
 C.notes=notes;C.status='done';C.done=S.day;ccLog(C,`Completed. Net ${yen(C.fin.net)}.`);CC_REP_Q.push(ccFinHtml(C,true))}
