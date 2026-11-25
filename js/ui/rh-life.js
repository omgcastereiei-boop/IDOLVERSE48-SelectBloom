// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Request Hour: long-term song life (extends reqhour.js)
// -------------------------------------------------------------------------------------
//  Every released song (singles, couplings, Under Girls, theater stage songs, units, solos, duets, sister groups…)
//  keeps two separate long-term values in S.rhs.s["gid:songId"] (the same key as the Request Hour pool):
//   · Awareness (0–100): how widely fans know the song. Set at release, raised by exposure (theater performances,
//     concerts and roadshows the PLAYER chose, Request Hour placings, news such as a graduation announcement), and
//     fading week by week when the song is no longer performed.
//   · Affection (0–100): how much fans love it. Set at release from its reception (with a "hidden gem" element of its
//     own), grows with a well-received stage, Request Hour concerts and graduation announcements of its members, and
//     stays almost unchanged for years. Player-chosen performances never raise Affection directly.
//  Player-chosen performances are remembered (concerts once per concert; roadshow performances and unique roadshow
//  locations counted separately; random setlists and Request Hour concerts excluded).
//  Voting (rhCtx / rhCohortPref of reqhour.js) now uses three sources of support inside each fan's single choice —
//  group support, center (Kami Oshi) support and song affection — gated by awareness, plus new-release interest,
//  events and the previous ranking. Sales and member popularity no longer give title tracks an automatic edge, and a
//  member who centers many songs splits her fans' votes among them (center diversity).
//  A Request Hour is held every year: if the player has not prepared one, fan-club voting runs in December
//  (Top 25, sister-group songs included) and the ranking is announced on the first days of January.
// =====================================================================================
const RHL_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
function rhsS(){if(!S)return null;if(!S.rhs||typeof S.rhs!='object')S.rhs={v:1,s:{},wk:-1};const R=S.rhs;R.s=R.s||{};return R}
const rhsCl=v=>Math.max(0,Math.min(100,v));
function rhsKeyOf(gid,id){try{const o=(gsCtx(gid,'songs')||{})[id];if(o&&o.xFrom&&o.xFrom.gid!=null)return o.xFrom.gid+':'+o.xFrom.id}catch(e){}return gid+':'+id}
const rhsRng=k=>mulb(rhSeedN('rhs|'+k));
// first values of a song (lazily, from its facts); an old song first seen in a running game starts with the awareness it
// would have kept since its release
function rhsInit(M){const r=rhsRng(M.key),born=M.born??S.day,age=Math.max(0,S.day-born),kind=M.kind,sales=M.sales||0;
 let aw=kind=='title'?52+9*Math.log10(1+sales/10000):kind=='cpl'||kind=='alb'?37+4*Math.log10(1+sales/10000):kind=='unit'?26:34;
 let pr=null;try{gsWith(M.gid,()=>{const T=rhOrigTh(M.gid,M.id),s=T&&thStage(T.sid);pr=s&&s.prefs&&s.prefs[M.id]?s.prefs[M.id].s:null})}catch(e){}
 const o=M.o||{},rec=o.ev&&o.ev.comp!=null?(o.ev.comp-58)/2.6:0,mv=o.mv&&o.mv.st=='published'&&o.mv.v>0?Math.min(6,Math.log10(o.mv.v)-3):0;
 const gem=Math.pow(r(),1.6)*34;let af=16+gem+(kind=='title'?6:0)+(pr!=null?(pr-55)/3:0)+rec+Math.max(0,mv)+((r()+r())/2-.5)*10;
 const wks=age/7,floor=4+af*.2;aw=floor+(aw-floor)*Math.pow(.988,wks);if(M.n&&M.last!=null&&S.day-M.last<180)aw+=Math.min(22,M.n*.25);
 return{aw:+rhsCl(aw).toFixed(2),af:+rhsCl(af).toFixed(2),t0:S.day,born,pc:{cc:0,rs:0,loc:[],last:null,log:[]},ev:[]}}
function rhsGet(M){const R=rhsS();let z=R.s[M.key];if(!z){z=R.s[M.key]=rhsInit(M)}return z}
function rhsByKey(gid,id){const key=rhsKeyOf(gid,id),R=rhsS();if(R.s[key])return R.s[key];const [g,i]=key.split(':');try{const M=rhMeta({key,gid:+g,id:i,title:''});return rhsGet(M)}catch(e){return null}}
function rhsLog(z,t,txt){z.ev=z.ev||[];z.ev.push([S.day,t,txt]);if(z.ev.length>30)z.ev.shift()}
// ---- weekly life: awareness fades unless the song is performed; affection stays -------------------------------------------
function rhsPoolAll(){const L=[];(S.groups||[]).forEach(g=>{try{rhPool({id:'rhs',gid:g.id,cats:['all'],sis:false}).forEach(z=>L.push(z))}catch(e){}});const seen=new Set();return L.filter(z=>!seen.has(z.key)&&seen.add(z.key))}
function rhsWeek(){const R=rhsS();rhsPoolAll().forEach(z=>{let M;try{M=rhMeta(z)}catch(e){return}const s=rhsGet(M);if(s.lw==S.day)return;s.lw=S.day;
  const floor=4+s.af*.2+(M.kind=='title'?16:M.kind=='cpl'?5:0);s.aw=floor+(s.aw-floor)*(M.kind=='title'?.993:M.kind=='cpl'?.99:.988);
  if(rhInActive(M)){s.aw+=.6;let pr=null;try{gsWith(M.gid,()=>{const T=rhOrigTh(M.gid,M.id),st=T&&thStage(T.sid);pr=st&&st.prefs&&st.prefs[M.id]?st.prefs[M.id].s:null})}catch(e){}if(pr!=null&&pr>62&&(s.afT||0)<10){const g=.12*(pr-62)/20;s.af+=g;s.afT=(s.afT||0)+g}}
  s.af=s.af*.9996+(1-.9996)*12;
  if(M.teamGone&&!s.tg){s.tg=1;s.af+=6;s.aw+=4;rhsLog(s,'team',RHL_T('Original team disbanded','ทีมต้นฉบับถูกยุบ'))}
  s.aw=+rhsCl(s.aw).toFixed(2);s.af=+rhsCl(s.af).toFixed(2)})}
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{if(S&&S.songs&&dowOf(S.day)==1)rhsWeek()}catch(e){console.error('rhs',e)}return r}}
// ---- player-chosen performances ----------------------------------------------------------------------------------------------
function rhsPerf(gid,id,kind,loc){const s=rhsByKey(gid,id);if(!s)return;const P=s.pc=s.pc||{cc:0,rs:0,loc:[],last:null,log:[]};const recent=(P.log||[]).filter(([d])=>S.day-d<120).length;
 if(kind=='c'){P.cc++;s.aw+=5.5/(1+.12*recent)}else{P.rs++;s.aw+=1.4/(1+.08*recent);if(loc!=null&&!P.loc.includes(loc)){P.loc.push(loc);s.aw+=1.2}}
 P.last=S.day;P.log.push([S.day,kind]);if(P.log.length>80)P.log.shift();s.aw=+rhsCl(s.aw).toFixed(2)}
// concerts: once per concert, Request Hour concerts excluded (their setlists are the ranking, not the player's choice)
if(typeof ccPerform=='function'){const f=ccPerform;ccPerform=function(C,p){const r=f.apply(this,arguments);try{if(C&&!C.rh&&C.type!='rh'&&p&&p.res&&!p.res.err){const set=C.sets[p.res.sid]||ccSetOf(C,p);C.rhSeen=C.rhSeen||{};
  ((set&&set.items)||[]).forEach(it=>{if(it.k!='song'||it.song==null)return;const k=rhsKeyOf(it.gid,it.song);if(C.rhSeen[k])return;C.rhSeen[k]=1;rhsPerf(it.gid,it.song,'c')})}}catch(e){console.error(e)}return r}}
// roadshows: one performance per roadshow and per song; unique locations kept apart; random setlists excluded
if(typeof rsRun=='function'){const f=rsRun;rsRun=function(ev,part){const r=f.apply(this,arguments);try{if(ev&&ev.d1&&!ev.rhC){ev.rhC=1;if(ev.smode!='random'){const gid=typeof gsAg=='function'?gsAg():null,ids=new Set();[ev.sl1,ev.sl2].forEach(L=>(L||[]).forEach(it=>{if(it&&it.k=='s'&&it.id!=null)ids.add(it.id)}));ids.forEach(id=>rhsPerf(gid,id,'r',ev.loc))}}}catch(e){console.error(e)}return r}}
// ---- events: graduation announcements (songs she centers, solos and units especially), Request Hour placings -------------------
if(typeof ctAnnounce=='function'){const f=ctAnnounce;ctAnnounce=function(m,o){const r=f.apply(this,arguments);try{if(m&&o&&o.kind!='dismiss'){const gid=typeof gsGid=='function'?gsGid(m):m.group;
  rhsPoolAll().forEach(z=>{let M;try{M=rhMeta(z)}catch(e){return}const c=M.cen.includes(m.id),inL=M.mem.includes(m.id);if(!c&&!inL)return;const s=rhsGet(M),yrs=Math.min(1,Math.max(0,S.day-(M.born??S.day))/730);
   if(c){const solo=M.mem.length<=1,unit=M.unit||M.mem.length<=4;s.af+=(solo?14:unit?11:7)*(.6+.6*yrs);s.aw+=7}else{s.af+=2.5*(.6+.6*yrs);s.aw+=2}
   s.af=+rhsCl(s.af).toFixed(2);s.aw=+rhsCl(s.aw).toFixed(2);rhsLog(s,'grad',`${m.name}: ${RHL_T('graduation announced','ประกาศจบการศึกษา')}`)})}}catch(e){console.error(e)}return r}}
// after a Request Hour: placed songs are seen again (awareness) and a big Request Hour stage is remembered (a little affection)
{const f=rhClose;rhClose=function(E){const was=E&&E.status;const r=f.apply(this,arguments);try{if(was=='voting'&&E.rank){const N=E.rank.length;E.rank.forEach(z=>{const s=rhsByKey(z.gid,z.id);if(!s)return;s.aw=+rhsCl(s.aw+3+12*(N-z.r+1)/N).toFixed(2);if(z.r<=10)s.af=+rhsCl(s.af+1.5).toFixed(2)});}}catch(e){console.error(e)}return r}}
// ---- voting: three sources of support in one choice per fan ----------------------------------------------------------------
{const f=rhCtx;rhCtx=function(E){const X=f.apply(this,arguments);try{const now=S.day,r=mulb(rhSeedN(E.id+'trend2'));if(!E.trend2){E.trend2={};X.S2.forEach(z=>{E.trend2[z.M.key]=+(((r()+r()+r())/3-.5)*.7).toFixed(3)})}
  // how many pool songs each member centers (her Kami Oshi fans' votes spread over them) and whether a center is a first-time center
  const cenN=new Map(),firstC=new Set(),genFirst=new Map();X.S2.forEach(z=>z.M.cen.forEach(id=>cenN.set(id,(cenN.get(id)||0)+1)));
  const byBorn=X.S2.slice().filter(z=>z.M.born!=null).sort((a,b)=>a.M.born-b.M.born),seenC=new Set();byBorn.forEach(z=>{z.M.cen.forEach(id=>{if(!seenC.has(id)){seenC.add(id);firstC.add(z.M.key+'|'+id)}})});
  byBorn.forEach(z=>{const g=z.cenGen;if(g!=null&&!genFirst.has(z.M.gid+'|'+g))genFirst.set(z.M.gid+'|'+g,z.M.key)});
  const pops=S.members.filter(m=>m.status!='graduated').map(m=>m.pop||0).sort((a,b)=>a-b),medPop=pops.length?pops[Math.floor(pops.length/2)]:50;
  X.S2.forEach(z=>{const M=z.M,s=rhsGet(M),since=M.born!=null?now-M.born:999;z.aw=s.aw;z.af=s.af;
   let b=1.05*Math.log(.06+s.aw/100)+2.3*s.af/100+(E.trend2[M.key]||0);
   if(since<365){const fresh=1-since/365;b+=.55*fresh;if(M.cen.some(id=>firstC.has(M.key+'|'+id)))b+=.3*fresh+.1;if(z.cenGen!=null&&genFirst.get(M.gid+'|'+z.cenGen)==M.key)b+=.3*fresh+.1}
   z.base=b;z.cenN=Math.max(1,...M.cen.map(id=>cenN.get(id)||1));z.under=M.cen.length&&M.cen.every(id=>{const m=get(id)||((S.alumni||[]).find(a=>a.id==id));return m&&(m.pop||0)<medPop})});
 }catch(e){console.error(e)}return X}}
rhCohortPref=function(X,s,wk){const E=X.E,ft=RH_TAU[s.ft]?s.ft:'oshi',tau=RH_TAU[ft],km=RH_KM[ft],sp=RH_SPLIT[ft],k=s.k,km_=k!=null?get(k):null,team=km_?km_.tid:null,pt=k!=null?X.past.get(k):null,kg=k!=null?X.gen.get(k):null,O=s.o||{},longFan=d=>s.born!=null&&d!=null&&s.born<=d+60;
 let fg=null;try{fg=typeof fmPg=='function'?fmPg(s):(k!=null?fdGrpOf(k):s.gs)}catch(e){}
 const oshi=Object.keys(O).filter(j=>O[j]>0).map(Number),np=Math.max(1,Math.min(8,Math.round(1+Math.log2(1+s.n)))),r=mulb(rhSeedN(E.id+'|'+s.id+'|'+wk)),D={};
 const fix=X.S2.map(z=>{let u=z.base+z.nost*(longFan(z.M.last??z.born)?1:.55)+z.hist;
  // A. group support: fans of the song's own group (a sister group's fans carry its songs)
  if(fg!=null&&z.M.gid==fg)u+=.35;
  // B. center support: her Kami Oshi fans — spread over every song she centers, so one member cannot fill the ranking
  if(k!=null){if(z.cen.has(k))u+=1.1*km/Math.sqrt(Math.max(1,z.cenN/2))*(z.mem.size>=12?.55:1);else if(z.mem.has(k))u+=(z.small?.75:z.mem.size>=12?.28:.5)*km;else if(z.rev.has(k))u+=.25*km;
   if(z.mem.has(k)&&z.M.last!=null&&S.day-z.M.last>180)u+=.2*km;if(team&&z.M.team==team)u+=.12;else if(pt&&z.M.team&&pt.has(z.M.team))u+=z.M.teamGone?.5:.18;
   if(kg!=null&&z.cenGen==kg)u+=.1;if(z.newTeam&&team==z.M.team)u+=.3;if(z.annC.includes(k))u+=.9;else if(z.annM.includes(k))u+=.45}
  // C. song affection is in z.base; fans also like to give an underrated member the spotlight
  if(z.under&&z.af>45)u+=.18;
  let oc=0;for(const j of oshi)if(z.mem.has(j))oc++;else if(z.rev.has(j))oc+=.3;u+=.18*Math.min(3,oc);
  if(z.annC.length&&!z.annC.includes(k))u+=.25*Math.max(...z.annC.map(id=>(get(id)||{}).pop||50))/100;
  if(z.gradC&&longFan(z.born))u+=.35*z.gradC;if(z.M.teamGone&&longFan(z.born))u+=.12;return u});
 for(let p=0;p<np;p++){const B=[];for(let i=0;i<fix.length;i++){const v=fix[i]+tau*rhGumbel(r);if(B.length<3||v>B[2][0]){B.push([v,i]);B.sort((a,b)=>b[0]-a[0]);if(B.length>3)B.pop()}}
  B.forEach(([,i],j)=>{const key=X.S2[i].M.key;D[key]=(D[key]||0)+sp[j]/np})}
 return D};
// ---- new events: Top 25 by default, sister-group songs included -------------------------------------------------------------
{const f=rhNew;rhNew=function(){const E=f.apply(this,arguments);try{if(E&&E.status=='setup'){E.size=25;E.nperf=1;E.sis=true;if(!E.nameEd)E.name=rhAutoName(E);render()}}catch(e){console.error(e)}return E}}
// ---- annual Request Hour: fan-club voting in December when the player has not prepared one ----------------------------------
const RHL_SCALE=3.2;
function rhlMainGroups(){const G=(S.groups||[]).filter(g=>!g.dis&&g.type!='project'&&g.type!='sister');return G.length?G:(S.groups||[]).slice(0,1)}
function rhlAnnual(){const R=rhS();if(!R)return;const t=dayDate(S.day);if(t.getMonth()!=11||t.getDate()!=1)return;const Y=t.getFullYear()+1;
 rhlMainGroups().forEach(g=>{if(R.list.some(E=>E.gid==g.id&&(dayDate(E.date).getFullYear()==Y||['setup','voting'].includes(E.status))))return;
  const E={id:'rh'+(++R.seq),gid:g.id,cats:['all'],size:25,nperf:1,date:dateDay(new Date(Y,0,20)),sis:true,name:'',nameEd:false,status:'voting',created:S.day,rid:null,auto:1,open:S.day,close:dateDay(new Date(Y-1,11,31)),
   codes:{next:1,fanIss:0,fanUsed:0,plIss:0,plUsed:0,pl:[],vd:null},cdV:0,cdPl:{},votes:{},pv:{},trend:null,rank:null,cc:null,log:[{d:S.day,t:'auto'}]};
  E.name=rhAutoName(E);R.list.push(E);try{if(typeof blN=='function')blN(`<li>🎤 <b>${esc(E.name)}</b> — ${RHL_T(`fan-club voting is open until ${jd(E.close)}. Every song ever released can be voted for.`,`เปิดโหวตแฟนคลับถึง ${jd(E.close)} ทุกเพลงที่เคยปล่อยมีสิทธิ์ได้รับโหวต`)}</li>`)}catch(e){}})}
function rhlVoteDay(E){if(!E.auto||E.status!='voting'||S.day>E.close||E.codes.vd==S.day)return;E.codes.vd=S.day;const wk=Math.floor((S.day-E.open)/7);
 if(!E._X||E._X.wk!=wk){const X=rhCtx(E);X.wk=wk;E._X=X;E._C=rhCohorts(E);E._W=E._C.reduce((t,c)=>t+c.w,0);E._D={}}
 const X=E._X,C=E._C,W=E._W;if(!W)return;const days=E.close-E.open+1,tot=Math.round(W*RHL_SCALE/days*(S.day>=E.close-3?1.6:1));if(!tot)return;
 E.codes.fanIss+=tot;E.codes.fanUsed+=tot;E.codes.next+=tot;E.acc=E.acc||{};
 C.forEach(c=>{const share=tot*c.w/W;let D=E._D[c.s.id];if(!D){D=rhCohortPref(X,c.s,wk);E._D[c.s.id]=D}for(const key in D)E.acc[key]=(E.acc[key]||0)+share*D[key]})}
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{if(S&&S.songs){rhlAnnual();rhS().list.forEach(E=>{if(E.auto&&E.status=='voting'){rhlVoteDay(E)}})}}catch(e){console.error('rhl',e)}return r}}
// temporary voting caches are never saved
{const f=rhClose;rhClose=function(E){const r=f.apply(this,arguments);try{if(E){delete E._X;delete E._C;delete E._W;delete E._D}}catch(e){}return r}}
// ---- per-song Request Hour history ------------------------------------------------------------------------------------------
// one edition per year for the song's group (the largest "All songs" edition of that year)
function rhsEditions(gid){const H=rhS().hist.filter(h=>h.gid==gid||(h.groups||[]).some(g=>g.id==gid)),Y={};H.forEach(h=>{const b=Y[h.year];const all=h.cats.includes('all');if(!b||(all&&!b.cats.includes('all'))||(all==b.cats.includes('all')&&h.size>b.size))Y[h.year]=h});return Object.values(Y).sort((a,b)=>a.year-b.year)}
function rhsStats(key){const gid=+String(key).split(':')[0],E=rhsEditions(gid),s=rhsS().s[key],born=s?s.born:null;const L=E.filter(h=>born==null||h.closed>=born).map(h=>{const z=h.rank.find(q=>q.key==key);return{y:h.year,r:z?z.r:null,size:h.size}});
 const R=L.filter(x=>x.r!=null);let streak=0;for(let i=L.length-1;i>=0;i--){if(L[i].r!=null)streak++;else break}
 return{L,prev:L.length?L[L.length-1].r:null,best:R.length?Math.min(...R.map(x=>x.r)):null,years:R.length,streak,no1:R.filter(x=>x.r==1).map(x=>x.y),top3:R.filter(x=>x.r<=3).map(x=>x.y),top10:R.filter(x=>x.r<=10).map(x=>x.y),top25:R.filter(x=>x.r<=25).map(x=>x.y),miss:L.filter(x=>x.r==null||x.r>25).map(x=>x.y)}}
function rhsHistHtml(key,title){const st=rhsStats(key),s=rhsS().s[key],th=RHL_T('','x')=='x';if(!s&&!st.L.length)return'';const P=(s&&s.pc)||{cc:0,rs:0,loc:[]};
 const kv=[[RHL_T('Previous','ปีก่อน'),st.prev?'#'+st.prev:'—'],[RHL_T('Best','สูงสุด'),st.best?'#'+st.best:'—'],[RHL_T('Years ranked','ปีที่ติดอันดับ'),st.years],[RHL_T('In a row','ติดต่อกัน'),st.streak],[RHL_T('#1','อันดับ 1'),st.no1.join(', ')||'—'],[RHL_T('Top 3','Top 3'),st.top3.length],[RHL_T('Top 10','Top 10'),st.top10.length],[RHL_T('Top 25','Top 25'),st.top25.length],[RHL_T('Not ranked','ไม่ติดอันดับ'),st.miss.length],
  [RHL_T('Awareness','การรับรู้'),s?Math.round(s.aw):'—'],[RHL_T('Affection','ความรักของแฟน'),s?Math.round(s.af):'—'],[RHL_T('Concerts (your setlists)','คอนเสิร์ต (เซ็ตลิสต์ที่เลือก)'),P.cc],[RHL_T('Roadshow performances','การแสดงโรดโชว์'),P.rs],[RHL_T('Roadshow locations','สถานที่โรดโชว์'),(P.loc||[]).length],[RHL_T('Last chosen','เลือกแสดงล่าสุด'),P.last!=null?jd(P.last):'—']];
 return`<div class="c rhsong"><h4>🎤 Request Hour${title?' · '+esc(title):''}</h4><div class="fbkv">${kv.map(([a,b])=>`<div><small>${a}</small><b>${b}</b></div>`).join('')}</div>${st.L.length?`<p class="st">${st.L.map(x=>`${x.y}: ${x.r?'#'+x.r:'—'}`).join(' · ')}</p>`:''}</div>`}
// song info pop-up (Song Library, single pages)
if(typeof plSongInfo=='function'){const f=plSongInfo;plSongInfo=function(id){const r=f.apply(this,arguments);try{if(ui.mod&&ui.mod.t=='html'){const gid=typeof gsAg=='function'?gsAg():null,o=S.songs[id];if(o&&rhReleased(o)){const key=rhsKeyOf(gid,id);rhsByKey(gid,id);ui.mod.h+=rhsHistHtml(key,'');render()}}}catch(e){console.error(e)}return r}}
// ranking presentation: NEW / RETURN / movement, category, original performers and each song's Request Hour record
const RHL_KIND={title:['Title track','เพลงหลัก'],cpl:['Coupling','เพลงรอง'],alb:['Album song','เพลงในอัลบั้ม'],th:['Theater stage song','เพลงสเตจเธียเตอร์'],unit:['Unit song','เพลงยูนิต']};
rhChg=function(z){if(z.prev==null)return z.re?`<span class="rhre">RETURN</span>`:`<span class="rhnew">NEW</span>`;const d=z.prev-z.r;return d>0?`<span class="rhup">↑${d}</span>`:d<0?`<span class="rhdn">↓${-d}</span>`:`<span class="rhsame">→</span>`};
{const f=rhResHtml;rhResHtml=function(E){let h=f.apply(this,arguments);try{if(!E.rank)return h;E.rank.forEach(z=>{const st=rhsStats(z.key),n=z.mem.length,kind=z.kind=='unit'&&n==1?['Solo','โซโล่']:z.kind=='unit'&&n==2?['Duet','ดูเอ็ท']:RHL_KIND[z.kind]||[z.kind,z.kind];
  const add=` · ${RHL_T(kind[0],kind[1])}${z.prev?` · ${RHL_T('last year','ปีก่อน')} #${z.prev}`:''}${st.best&&st.years>1?` · ${RHL_T('best','สูงสุด')} #${st.best}`:''}${st.years>1?` · ${st.years} ${RHL_T('years','ปี')}${st.streak>1?` (${st.streak} ${RHL_T('in a row','ติดต่อกัน')})`:''}`:''}`;
  const mark=`<b>${esc(z.title)}</b><div class="st">`,i=h.indexOf(mark);if(i>=0){const j=h.indexOf('</div>',i+mark.length);if(j>0)h=h.slice(0,j)+add+h.slice(j)}});if(E.auto)h=h.replace(/<p class="st">[^<]*?(valid codes|รหัส)[^<]*/,`<p class="st">${RHL_T(`Fan-club voting · ${E.check.tv.toLocaleString()} votes.`,`โหวตแฟนคลับ · ${E.check.tv.toLocaleString()} โหวต`)}`)}catch(e){console.error(e)}return h}}
// save/load: make sure the store exists
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{if(S)rhsS()}catch(e){}return r}}
