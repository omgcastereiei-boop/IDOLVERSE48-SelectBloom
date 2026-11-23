// =====================================================================================
//  IDOLVERSE48: Select Bloom! — General Election voting timeline (community behaviour)
// -------------------------------------------------------------------------------------
//  Why the preliminary results used to equal the final results: every fan segment drew its own timing style
//  (early / steady / late) independently, so across a member's many segments the styles averaged out and every
//  member received her votes on the same curve. Ranks at day 1 and day 31 were the final ranks in miniature, and
//  votes followed the size of the fanbase.
//  Now each member's fan COMMUNITY has its own behaviour for this election (e.vp[id]), built from the existing
//  fanbase (her Kami Oshi segments, fan types, loyalty, spending) — no new fans, no election fan category:
//   · timing: an early wave, steady buying or a late push (mixed), a release-day wave of its own size, and
//     0–3 organised voting campaigns (short windows when her fans buy much more of what they planned);
//   · code holding: strategic communities keep their voting codes and cast them in the last days, so their
//     votes are invisible in the preliminary results although the CDs were already bought;
//   · devotion: how much an active fan spends depends on the community (share of Dedicated / Hardcore fans, a
//     persistent "community spending" trait of the member that drifts between elections, and this election's
//     mood). A small devoted fanbase can therefore out-vote a large casual one — never guaranteed.
//   · graduation announced during voting: her supporters buy more from the announcement day on (strength from
//     her fans' dedication, loyalty and the time left), stop holding codes and vote at once. Real purchases only:
//     nothing is added to her votes directly. The turning point is recorded (e.gs, final rows, member record).
//  Timing changes only WHEN a community buys (each community's curve is normalised), devotion and graduation
//  change HOW MUCH it buys. Votes are still CDs → tokens → cast votes; preliminary results read only the votes
//  cast up to their day; the final result counts every vote cast by the close. Totals never decrease.
// =====================================================================================
const GV3={day:null};
const gv3H=s=>{let h=2166136261;s=String(s);for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h};
const gv3N=r=>{let u=0,v=0;while(!u)u=r();while(!v)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const gv3Key=(e,id)=>'m|'+e.id+'|'+id;
// her Kami Oshi community: size and composition, from the existing fan segments
function gv3Comm(e){const live=new Set(geLive(e)),C={};live.forEach(id=>C[id]={n:0,h:0,d:0,loy:0,sp:0});
 geSegs().forEach(s=>{if(!(s.n>0)||s.k==null||!C[s.k])return;const c=C[s.k];c.n+=s.n;if(s.ft=='hardcore'||s.ft=='collector')c.h+=s.n;else if(s.ft=='dedicated')c.d+=s.n;c.loy+=(s.loy??40)*s.n;c.sp+=(s.sp??40)*s.n});
 for(const id in C){const c=C[id],n=Math.max(1,c.n);c.hs=c.h/n;c.ds=c.d/n;c.loy=c.loy/n/100;c.sp=c.sp/n/100}return C}
// the member's persistent community spending trait (drifts a little between elections)
function gv3Trait(m,e){if(m.geDev==null){const r=mulb(gv3H('dev'+m.id));m.geDev=+Math.exp(gv3N(r)*.38).toFixed(3)}
 if(m.geDevE!=e.id){const r=mulb(gv3H('drift'+m.id+e.id));m.geDev=+Math.min(6,Math.max(.18,Math.exp(.75*Math.log(m.geDev)+gv3N(r)*.25))).toFixed(3);m.geDevE=e.id}return m.geDev}
function gv3Init(e){if(e.vp)return e.vp;const C=gv3Comm(e),T=Math.max(1,e.vEnd-e.vStart),ids=Object.keys(C),vp={};
 const comp=id=>{const c=C[id];return .55+3*(c.hs+.5*c.ds)+.6*Math.max(0,c.sp-.4)},mc=ids.length?ids.reduce((a,id)=>a+comp(id),0)/ids.length:1;
 // a very large community holds more light supporters: spending per fan thins out as it grows (relative to the typical Senbatsu-level community)
 const NS=ids.map(id=>C[id].n).sort((a,b)=>b-a),ref=Math.max(50,NS[Math.min(NS.length-1,15)]||1),dil=id=>Math.pow(Math.max(1,C[id].n)/ref,-.35);
 ids.forEach(id=>{const m=get(+id);if(!m)return;const c=C[id],r=mulb(gv3H(e.id+'|vp|'+id)),hard=c.hs+.5*c.ds;
  // timing mix (dominant style) and the release-day wave
  const u=r(),dom=u<.36+.15*hard?'early':u<.66?'steady':'late',wd=.5+.45*r(),rest=(1-wd)/2,tw={early:rest,steady:rest,late:rest};tw[dom]=wd;
  const wave=+Math.exp(gv3N(r)*.55+(dom=='early'?.25:dom=='late'?-.3:0)).toFixed(3);
  // organised campaigns
  const nc=r()<.3-.2*hard?0:r()<.55?1:r()<.8+.1*hard?2:3,camp=[];for(let k=0;k<nc;k++){const len=4+Math.floor(r()*7),from=2+Math.floor(r()*Math.max(1,T-len-3));camp.push({from,len,f:+(1.8+r()*2.4+hard*1.5).toFixed(2)})}
  // code holding (strategic late casting)
  const hold=+Math.min(.95,r()*.8+(dom=='late'?.2:0)+hard*.2).toFixed(3);
  // spending devotion: composition × persistent trait × this election's mood
  const dev=+(comp(id)/mc*gv3Trait(m,e)*dil(id)*Math.exp(gv3N(r)*.55)).toFixed(3);
  vp[id]={tw,wave,camp,hold,dev,dom}});
 e.vp=vp;e.vpT=T;return vp}
const gv3Of=key=>{const p=String(key).split('|');if(p[0]!='m')return null;const e=GV3.e&&GV3.e.id==p[1]?GV3.e:geS().list.find(z=>z.id==p[1]);if(e)GV3.e=e;return e&&e.vp?e.vp[p[2]]:null};
const GV3_STY=['early','steady','late'],gv3Base=(st,t,T)=>({early:1.5*Math.exp(-t/10)+.3+.6*(t/T)**4,late:.2+2.4*(t/T)**3,steady:.65+.7*(t/T)**2})[st];
// unnormalised daily weight of a community and its release-day weight
function gv3Cv(v,t,T){let c=0;GV3_STY.forEach(s=>{c+=v.tw[s]*gv3Base(s,t,T)});(v.camp||[]).forEach(k=>{if(t>=k.from&&t<k.from+k.len)c*=k.f});return c}
function gv3R0(v){let r=0;GV3_STY.forEach(s=>{r+=v.tw[s]*GE2.R0*(s=='early'?1.4:s=='late'?.5:1)});return r*v.wave}
{const f=geTw;geTw=function(st,t,T){const v=typeof st=='string'&&st[0]=='m'?gv3Of(st):null;return v?gv3Cv(v,t,T):f.apply(this,arguments)}}
{const f=geR0f;geR0f=function(st){const v=typeof st=='string'&&st[0]=='m'?gv3Of(st):null;return v?gv3R0(v)/GE2.R0:f.apply(this,arguments)}}
{const f=geZ;geZ=function(st,T){const v=typeof st=='string'&&st[0]=='m'?gv3Of(st):null;if(!v)return f.apply(this,arguments);const k='v3'+st+'|'+T;if(GE_Z[k])return GE_Z[k];let z=gv3R0(v);for(let t=1;t<=T;t++)z+=gv3Cv(v,t,T);return GE_Z[k]=z}}
// graduation announced during voting: her supporters buy more from that day on
function gv3GradCheck(e,d){e.gs=e.gs||{};geLive(e).forEach(id=>{if(e.gs[id])return;const m=get(id);const g=m&&m.grad;if(!g||g.kind=='dismiss'||g.ann==null||g.ann<e.vStart||g.ann>d||g.ann>e.vEnd)return;
 const C=gv3Comm(e)[id]||{hs:0,ds:0,loy:.4},T=Math.max(1,e.vEnd-e.vStart),rem=Math.max(0,(e.vEnd-g.ann)/T),r=mulb(gv3H(e.id+'|gs|'+id)),commit=C.hs+.6*C.ds+.3*C.loy;
 const will=r(),f=will<.12?1+.15*r():+Math.min(5,(1+(.4+2.6*commit)*(.55+.9*r()))*(1+.7*(1-rem))).toFixed(3);
 const last=gePre2(e).at(-1),pr=last?(last.rows.find(z=>z.id==id)||{}).rank||null:null;
 e.gs[id]={day:g.ann,t:g.ann-e.vStart,T,f,preRank:pr,preLabel:last?last.label:null,surge:f>=1.5};
 geN(`<li>🎓 <b>${esc(m.name)}</b> announced her graduation while the ${esc(e.name)} voting is open (${longDate(g.ann)}). ${f>=1.5?'Her supporters are rallying to give her a memorable final election.':'Her supporters are moved, but most were already giving all they can.'}</li>`)})}
// community behaviour on every buying profile (Kami Oshi segments follow their member's community)
{const f=geProf;geProf=function(e,s,PS){const P=f.apply(this,arguments);try{if(P&&P.kc!=null&&e&&e.vp){const v=e.vp[P.kc];if(v){P.st=gv3Key(e,P.kc);P.mk*=v.dev;const g=e.gs&&e.gs[P.kc],d=GV3.day??S.day;if(g&&d>=g.day)P.mk*=g.f}}}catch(x){console.error(x)}return P}}
// the community behaviour exists from voting day 1 (an election already in progress gets it for its remaining days)
{const f=geRelAttr;geRelAttr=function(e){try{GV3.e=e;gv3Init(e)}catch(x){console.error(x)}return f.apply(this,arguments)}}
{const f=geBuyDay;geBuyDay=function(e,x,d){try{GV3.e=e;GV3.day=d;gv3Init(e);gv3GradCheck(e,d)}catch(z){console.error(z)}try{return f.apply(this,arguments)}finally{GV3.day=null}}}
// casting: communities that hold their codes cast them in the last days; campaigns and graduation cast at once
geCast2=function(e,d){const t=d-e.vStart,T=Math.max(1,e.vEnd-e.vStart),x=t/T,last=d>=e.vEnd,ids=geLive(e).slice().sort(()=>Math.random()-.5);let V=0;
 const fr0=Math.min(.9,.32+.42*x*x),frH=x<.8?.015:Math.min(.95,.2+.75*Math.pow((x-.8)/.2,1.3));
 ids.forEach(id=>{const h=e.pend[id]||0;if(!h)return;const v=e.vp&&e.vp[id];let fr=fr0;
  if(v){const g=e.gs&&e.gs[id],hold=g&&d>=g.day?0:v.hold;fr=(1-hold)*fr0+hold*frH;if((v.camp||[]).some(k=>t>=k.from&&t<k.from+k.len))fr=Math.max(fr,(1-hold)*.75+hold*frH);if(g&&d>=g.day)fr=Math.max(fr,.8)}
  if(last)fr=.985;const c=Math.min(h,fbRound(h*fr));if(c>0){e.pend[id]=h-c;e.votes[id]=(e.votes[id]||0)+c;e.last[id]=++e.ts;V+=c}});e.cast+=V;return V};
// the graduation turning point in the final rows and in the member's election record
{const f=geClose;geClose=function(e){const was=e&&e.st;const r=f.apply(this,arguments);try{if(was=='voting'&&e.final&&e.gs)e.final.rows.forEach(row=>{const g=e.gs[row.id];if(g){g.fin=row.rank||null;const p2=gePre2(e).find(p=>p.n2==2);g.after=p2&&g.day<e.p2?(p2.rows.find(z=>z.id==row.id)||{}).rank||null:null;row.gs={...g}}})}catch(x){console.error(x)}return r}}
{const f=geReact;geReact=function(e,r){const fx=f.apply(this,arguments);try{const m=get(r.id);if(m&&r.gs&&m.geRec){const h=m.geRec.find(z=>z.eid==e.id);if(h&&!h.gs)h.gs={day:r.gs.day,pre:r.gs.preRank,after:r.gs.after,fin:r.rank||null,surge:!!r.gs.surge}}}catch(x){}return fx}}
// ---- preliminary announcements: the hosts' commentary and the members' reactions ----------------------------------------------
const GV3_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
function gv3Story(e,P){const R=P.rows.filter(r=>r.rank),rk=new Map(R.map(r=>[r.id,r.rank])),prevP=gePre2(e).filter(z=>z.n2<P.n2).at(-1),P0=prevP?new Map(prevP.rows.filter(r=>r.rank).map(r=>[r.id,r.rank])):null,cap=geTotal(e),sen=(e.groups[0]||{size:16}).size;
 const pe=gePrevDone(e),peR=pe?new Map(pe.final.rows.filter(r=>r.rank).map(r=>[r.id,r.rank])):new Map(),champ=pe?(pe.final.rows.find(r=>r.rank==1)||{}).id:null;
 const live=geLive(e).map(get).filter(Boolean),fanRk=new Map(live.slice().sort((a,b)=>sv(b,'fans')-sv(a,'fans')).map((m,i)=>[m.id,i+1]));
 const ever=id=>{const m=get(id);return(m&&(m.geRec||[]).some(h=>h.eid!=e.id&&h.rank))};
 const st={leader:R[0]&&R[0].id,P0,prevP,rk,peR,champ,sen};
 st.lead0=prevP?(prevP.rows.find(r=>r.rank==1)||{}).id:null;
 st.moves=P0?R.map(r=>({id:r.id,d:(P0.get(r.id)||cap+10)-r.rank,from:P0.get(r.id)||null,to:r.rank})).filter(z=>z.from):[];
 st.riser=st.moves.slice().sort((a,b)=>b.d-a.d)[0];st.faller=P0?[...P0.entries()].map(([id,f])=>({id,from:f,to:rk.get(id)||null,d:f-(rk.get(id)||cap+5)})).sort((a,b)=>a.d-b.d)[0]:null;
 st.newIn=R.filter(r=>r.rank<=sen&&(!P0||!P0.get(r.id)||P0.get(r.id)>sen)).map(r=>r.id);
 st.dark=R.filter(r=>r.rank<=10&&(fanRk.get(r.id)||99)>=r.rank+8).sort((a,b)=>a.rank-b.rank)[0];
 st.slow=live.filter(m=>(fanRk.get(m.id)||99)<=3&&(rk.get(m.id)||999)>Math.max(8,(fanRk.get(m.id)||1)+6)).map(m=>m.id)[0];
 st.trainee=R.find(r=>r.rank<=sen&&(get(r.id)||{}).status=='trainee');st.firstTime=R.find(r=>r.rank<=sen&&!ever(r.id)&&pe);
 st.champ=champ&&get(champ)?{id:champ,now:rk.get(champ)||null}:null;st.back=pe?R.find(r=>r.rank<=sen&&(peR.get(r.id)||999)>sen&&ever(r.id)):null;
 st.grad=Object.values(e.gs||{}).length?Object.entries(e.gs).filter(([id,g])=>g.day<=P.day).map(([id,g])=>({id:+id,g,now:rk.get(+id)||null}))[0]:null;
 if(!P.hidden&&R[1])st.gap=(R[0].v-R[1].v)/Math.max(1,R[0].v);return st}
function gv3Talk(e,P){const st=gv3Story(e,P),nm=id=>{const m=get(id);return m?(m.stage||m.name):''},L=[],seed=gv3H(e.id+P.n2),pk=(a,k)=>a[(seed+k)%a.length],T=GV3_T,two=P.n2==2;
 const say=(h,en,th)=>L.push({h,t:T(en,th)});
 // opening line
 say('mix',...pk([[two?`Preliminary Result 02 — and this time only the ranks! No vote totals until the ceremony.`:`Preliminary Result 01 is here! These are only the votes cast so far — so much can still change!`,two?`ผลด่วนรอบที่ 2 — รอบนี้ประกาศแค่อันดับนะคะ คะแนนต้องรอวันประกาศผล!`:`ผลด่วนรอบที่ 1 มาแล้วค่ะ! นี่เป็นแค่คะแนนที่โหวตเข้ามาจนถึงตอนนี้ ยังเปลี่ยนได้อีกเยอะ!`],[two?`Halfway there! Let's see who is climbing — and who is under pressure.`:`The first count is in! Some fanbases came out swinging on day one.`,two?`มาครึ่งทางแล้ว! มาดูกันว่าใครกำลังไต่ขึ้น และใครกำลังโดนกดดัน`:`ผลนับรอบแรกออกแล้ว! บางแฟนด้อมบุกตั้งแต่วันแรกเลย`]],0));
 if(st.leader){const lead=nm(st.leader);if(two&&st.lead0&&st.lead0!=st.leader)say('lucia',`A new name at the top: ${lead} has taken the lead from ${nm(st.lead0)}. A crown is never safe until the last vote.`,`มีชื่อใหม่ขึ้นนำแล้ว: ${lead} แซง ${nm(st.lead0)} ขึ้นอันดับ 1 มงกุฎไม่เคยปลอดภัยจนกว่าคะแนนสุดท้ายจะเข้ามา`);
  else if(st.gap!=null&&st.gap<.05)say('lucia',`${lead} leads — but only just. The top three are separated by a breath.`,`${lead} นำอยู่ แต่แค่นิดเดียว สามอันดับแรกห่างกันแค่ลมหายใจ`);
  else say('lucia',...pk([[`${lead} is first for now. Can she hold on until the final day? I've seen leaders fall in the last week.`,`ตอนนี้ ${lead} อยู่อันดับ 1 จะรักษาไว้ได้ถึงวันสุดท้ายไหมนะ ฉันเคยเห็นคนนำร่วงในสัปดาห์สุดท้ายมาแล้ว`],[`${lead} on top. Early leads are lovely… and heavy.`,`${lead} อยู่บนสุด การนำตั้งแต่ต้นมันน่ายินดี… แต่ก็หนักนะ`]],1))}
 if(st.grad)say('lucia',`Since ${nm(st.grad.id)} announced her graduation, her fans have been voting like never before${st.grad.g.preRank?` — TOP ${st.grad.g.preRank} before the announcement`:''}${st.grad.now?`, TOP ${st.grad.now} now`:''}. A final election means everything.`,`ตั้งแต่ ${nm(st.grad.id)} ประกาศจบการศึกษา แฟนๆ ของเธอโหวตกันไม่หยุด${st.grad.g.preRank?` ก่อนประกาศอยู่ TOP ${st.grad.g.preRank}`:''}${st.grad.now?` ตอนนี้ TOP ${st.grad.now}`:''} เลือกตั้งครั้งสุดท้ายมีความหมายกับทุกคน`);
 if(st.dark)say('mix',`Did anyone expect ${nm(st.dark.id)} in TOP ${st.dark.rank}?! Her supporters are small in number but unbelievably passionate!`,`มีใครคาดว่า ${nm(st.dark.id)} จะอยู่ TOP ${st.dark.rank} บ้างคะ?! แฟนเธอไม่เยอะ แต่ทุ่มเทสุดๆ!`);
 if(two&&st.riser&&st.riser.d>=5)say('mix',`The biggest climb: ${nm(st.riser.id)}, from TOP ${st.riser.from} to TOP ${st.riser.to}!`,`ไต่ขึ้นมากที่สุด: ${nm(st.riser.id)} จาก TOP ${st.riser.from} ขึ้นมา TOP ${st.riser.to}!`);
 if(two&&st.faller&&st.faller.d<=-5)say('lucia',st.faller.to?`${nm(st.faller.id)} slipped from TOP ${st.faller.from} to TOP ${st.faller.to}. Her fans may be holding their votes… or she needs them now.`:`${nm(st.faller.id)} was TOP ${st.faller.from} — and now she is outside the ranking. There is still time.`,st.faller.to?`${nm(st.faller.id)} ร่วงจาก TOP ${st.faller.from} ไป TOP ${st.faller.to} แฟนเธออาจเก็บโค้ดไว้… หรือเธอต้องการพวกเขาตอนนี้แหละ`:`${nm(st.faller.id)} เคยอยู่ TOP ${st.faller.from} ตอนนี้หลุดอันดับไปแล้ว แต่ยังมีเวลา`);
 if(st.slow)say('lucia',`And ${nm(st.slow)}, one of the most loved members, is only ${st.rk.get(st.slow)?'TOP '+st.rk.get(st.slow):'outside the ranking'}. A slow start — or a fandom waiting for the last days?`,`และ ${nm(st.slow)} หนึ่งในเมมที่มีแฟนมากที่สุด ตอนนี้แค่ ${st.rk.get(st.slow)?'TOP '+st.rk.get(st.slow):'นอกอันดับ'} ออกตัวช้า หรือแฟนรอบุกวันท้ายๆ กันนะ?`);
 if(st.trainee)say('mix',`A trainee in the Senbatsu zone! ${nm(st.trainee.id)} is TOP ${st.trainee.rank}!`,`เด็กฝึกเข้าโซนเซ็มบัตสึ! ${nm(st.trainee.id)} อยู่ TOP ${st.trainee.rank}!`);
 else if(st.firstTime)say('mix',`${nm(st.firstTime.id)} has never been ranked before — and she's TOP ${st.firstTime.rank}!`,`${nm(st.firstTime.id)} ไม่เคยติดอันดับมาก่อน แต่ตอนนี้อยู่ TOP ${st.firstTime.rank}!`);
 if(st.champ&&st.champ.now!=1)say('lucia',st.champ.now?`Last year's champion ${nm(st.champ.id)} is TOP ${st.champ.now}. Defending a title is the hardest battle of all.`:`Our reigning champion ${nm(st.champ.id)} is not even in the ranking yet… I know that silence. It's terrifying.`,st.champ.now?`แชมป์ครั้งก่อน ${nm(st.champ.id)} ตอนนี้ TOP ${st.champ.now} การป้องกันแชมป์คือศึกที่ยากที่สุด`:`แชมป์คนล่าสุด ${nm(st.champ.id)} ยังไม่ติดอันดับเลย… ฉันรู้จักความเงียบแบบนี้ดี มันน่ากลัวมาก`);
 if(st.back)say('mix',`${nm(st.back.id)} is back in the Senbatsu zone after falling out last time!`,`${nm(st.back.id)} กลับเข้าโซนเซ็มบัตสึอีกครั้งหลังหลุดไปเมื่อครั้งก่อน!`);
 say('mix',...pk([[`Remember: votes cast after today still count. Nothing is decided yet!`,`อย่าลืมนะคะ คะแนนหลังจากวันนี้ยังนับทั้งหมด ยังไม่มีอะไรตัดสินแล้ว!`],[`Fans, the final result is still in your hands!`,`แฟนๆ ผลสุดท้ายยังอยู่ในมือทุกคนนะคะ!`]],2));
 return L.slice(0,6)}
const GV3_RE={up:[['I can\'t believe it… thank you! Let\'s keep climbing together!','ไม่อยากเชื่อเลย… ขอบคุณนะคะ! ไต่ขึ้นไปด้วยกันอีกนะ!'],['My fans did this. I\'ll repay them on stage every day.','แฟนๆ ทำให้เป็นแบบนี้ หนูจะตอบแทนทุกคนบนเวทีทุกวันเลยค่ะ'],['I was so scared to look at the list… I\'m shaking.','กลัวมากตอนจะดูรายชื่อ… มือสั่นไปหมดเลย']],
 down:[['It hurts a little… but it\'s not over. I\'ll fight until the last day.','เจ็บนิดหน่อย… แต่ยังไม่จบ หนูจะสู้จนวันสุดท้าย'],['I\'m sorry I worried everyone. Please believe in me a little longer.','ขอโทษที่ทำให้ทุกคนเป็นห่วง เชื่อในตัวหนูอีกหน่อยนะคะ'],['This is only the preliminary. I\'m not giving up.','นี่แค่ผลด่วน หนูไม่ยอมแพ้หรอก']],
 lead:[['First?! It\'s too early to celebrate — I want to be first on the real day!','ที่ 1 เหรอ?! ยังเร็วไปที่จะดีใจ อยากเป็นที่ 1 ในวันจริงค่ะ!'],['Being on top is scary. I\'ll work even harder.','อยู่บนสุดมันน่ากลัวนะ จะพยายามให้มากกว่าเดิม']],
 dark:[['Me…? In the top ten? I have to check again…','หนู…? ติดท็อป 10? ขอดูอีกรอบได้ไหม…'],['My fans are few, but they are the strongest in the world.','แฟนหนูไม่เยอะ แต่แข็งแกร่งที่สุดในโลกเลยค่ะ']],
 grad:[['This is my last election. I want to see the best view with everyone.','นี่คือเลือกตั้งครั้งสุดท้ายของหนู อยากเห็นวิวที่สวยที่สุดไปพร้อมทุกคน']]};
function gv3Reacts(e,P){const st=gv3Story(e,P),seed=gv3H(e.id+'r'+P.n2),out=[],used=new Set(),add=(id,k,tag)=>{if(!id||used.has(id)||!get(id))return;used.add(id);const L=GV3_RE[k];const q=L[(seed+out.length*3+id)%L.length];out.push({id,q:GV3_T(q[0],q[1]),tag})};
 if(st.leader)add(st.leader,'lead',GV3_T('1st','อันดับ 1'));if(st.grad)add(st.grad.id,'grad',GV3_T('Graduating','ประกาศจบการศึกษา'));if(st.dark)add(st.dark.id,'dark',GV3_T('Dark horse','ม้ามืด'));
 if(P.n2==2&&st.riser&&st.riser.d>=4)add(st.riser.id,'up','▲'+st.riser.d);if(P.n2==2&&st.faller&&st.faller.d<=-4)add(st.faller.id,'down',st.faller.to?'▼'+(-st.faller.d):'OUT');
 return out.slice(0,4)}
function gv3TalkHtml(e,P){try{if(!P||!P.v2)return'';const L=gv3Talk(e,P),Rc=gv3Reacts(e,P);return`<div class="gv3talk">${typeof gehSay=='function'?gehSay(L):''}${Rc.length?`<div class="gv3re">${Rc.map(x=>{const m=get(x.id);return`<div class="gv3rc">${ptc(m,40)}<div><b>${esc(m.stage||m.name)}</b> <span class="gv3tag">${esc(x.tag)}</span><q>${esc(x.q)}</q></div></div>`}).join('')}</div>`:''}</div>`}catch(x){console.error(x);return''}}
{const f=gePrelimHtml;gePrelimHtml=function(e){let h=f.apply(this,arguments);try{const PL=e.prelim||[];if(e.v2&&PL.length){const k=Math.min(PL.length-1,ui.gep==null?PL.length-1:ui.gep),P=PL[k];const t=gv3TalkHtml(e,P);if(t){const i=h.indexOf('<div class="geprg">');h=i>=0?h.slice(0,i)+t+h.slice(i):h+t}}}catch(x){console.error(x)}return h}}
