// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Request Hour (リクエストアワー セットリストベスト)
// -------------------------------------------------------------------------------------
//  An annual ranking concert: fans vote for the songs they want to see performed again.
//   1. Setup (Concerts → Request Hour): name, ranking categories (All Songs / Single & Album Song /
//      Coupling Song / Theater Stage Song — one or several), Best N (10–200), 1–5 performances
//      (≤ 50 ranked songs each, split as evenly as possible), concert date, sister-group songs.
//   2. The Request Hour single is produced with the normal single production / CD sales system
//      (it is linked like the General Election single). Each CD bought during the voting month
//      carries exactly one voting code = one vote. Sales continue after voting closes, but
//      those CDs carry no usable code.
//   3. Voting month: the existing fan cohorts (Casual / Regular / Dedicated / Hardcore, their Kami
//      Oshi and 0–5 Oshi) spend their codes on the songs they personally want to see again:
//      song appeal, Kami Oshi / Oshi in the ORIGINAL lineup (center, unit), team & generation,
//      nostalgia (time since last performed, ended stages, rarely performed), and the group's
//      history (team disbanded / formed, graduation announcements, debut songs, anniversaries).
//      Every cohort is split into several "fans" with their own taste, so no rule guarantees a winner.
//      The producer can buy CDs too and vote with the codes in the voting screen.
//   4. When voting closes the votes are locked, codes validated, songs ranked and the result
//      saved permanently (history, rank changes). The ranking can never be edited.
//   5. A Request Hour concert is created in the existing Concert system (reqhour-cc.js).
//  Songs are keyed by their ORIGINAL owner ("gid:songId"): a Revival copy (song.xFrom) never
//  changes ownership and a song appears once however many stages performed it.
// =====================================================================================
const RH_CATS={all:'All Songs',sa:'Single & Album Song',cpl:'Coupling Song',th:'Theater Stage Song'};
const RH_CATS_TH={all:'เพลงทั้งหมด',sa:'เพลงซิงเกิลและอัลบั้ม',cpl:'เพลงคัปปลิ้ง',th:'เพลงเธียเตอร์สเตจ'};
const RH_ST={setup:'Setup',single:'Single in production',voting:'Voting open',closed:'Results announced',concert:'Concert',done:'Completed'};
const RH_ST_TH={setup:'ตั้งค่า',single:'กำลังผลิตซิงเกิล',voting:'เปิดโหวต',closed:'ประกาศผลแล้ว',concert:'คอนเสิร์ต',done:'จบแล้ว'};
const RH_CD_PRICE=1100; // the producer buying a CD pays the shop price (no revenue is booked for these copies)
const rhTh=()=>typeof UIP!='undefined'&&UIP.lang=='th';
const rhT=(en,th)=>rhTh()?th:en;
function rhS(){if(!S)return null;if(!S.rh||typeof S.rh!='object')S.rh={v:1,seq:0,list:[],hist:[]};const R=S.rh;R.list=Array.isArray(R.list)?R.list:[];R.hist=Array.isArray(R.hist)?R.hist:[];R.seq=+R.seq||0;return R}
const rhGet=id=>(rhS().list||[]).find(e=>e.id==id)||null;
const rhCur=()=>ui.rhe?rhGet(ui.rhe):null;
const rhGrp=gid=>(S.groups||[]).find(g=>g.id==gid)||null;
const rhCatName=k=>rhTh()?RH_CATS_TH[k]:RH_CATS[k];
// ---- performances: N ranked songs over P shows, ≤ 50 each, lowest ranks first (countdown) -------------------------------------
function rhSplit(N,P){P=Math.max(1,Math.min(5,P|0));const b=Math.floor(N/P),x=N%P;return Array.from({length:P},(_,i)=>b+(i<x?1:0))}
function rhSplitErr(N,P){return Math.ceil(N/Math.max(1,P))>50?rhT(`${Math.ceil(N/P)} songs per performance — a performance holds at most 50 ranked songs. Add performances or lower the ranking size.`,`การแสดงละ ${Math.ceil(N/P)} เพลง — แต่ละรอบรับได้สูงสุด 50 เพลง เพิ่มจำนวนรอบหรือลดขนาดอันดับ`):''}
// ranks per performance, e.g. Best 100 × 4 → [[100..76],[75..51],[50..26],[25..1]]
function rhPerfRanks(N,P){const L=rhSplit(N,P),out=[];let hi=N;L.forEach(n=>{out.push([hi,hi-n+1]);hi-=n});return out}
// ---- event ---------------------------------------------------------------------------------------------------------------
function rhAutoName(E){const g=rhGrp(E.gid),y=dayDate(E.date).getFullYear(),c=E.cats.includes('all')?'':E.cats.map(k=>k=='sa'?'Single & Album':k=='cpl'?'Coupling':'Theater Stage').join(' & ')+' Song ';return`${g?g.name:'Group'} ${c}Request Hour ${y} Setlist Best ${E.size}`}
function rhNew(){const R=rhS(),gid=typeof gsAg=='function'?gsAg():(S.groups[0]||{}).id,g=rhGrp(gid);if(!g)return;
 if(R.list.some(e=>e.gid==gid&&!['done'].includes(e.status)))return toast(rhT('This group already has a Request Hour in progress.','วงนี้มี Request Hour ที่ยังไม่จบอยู่แล้ว'),'err');
 const E={id:'rh'+(++R.seq),gid,cats:['all'],size:100,nperf:4,date:S.day+120,sis:false,name:'',nameEd:false,status:'setup',created:S.day,rid:null,open:null,close:null,
  codes:{next:1,fanIss:0,fanUsed:0,plIss:0,plUsed:0,pl:[],vd:null},cdV:0,cdPl:{},votes:{},pv:{},trend:null,rank:null,cc:null,log:[]};
 E.name=rhAutoName(E);R.list.push(E);ui.rhe=E.id;ui.rht='setup';view='rh';render();return E}
function rhEditable(E){return E&&(E.status=='setup'||E.status=='single')}
function rhSet(k,v){const E=rhCur();if(!E)return;
 if(k=='date'){if(E.status=='closed'||E.status=='concert'||E.status=='done')return;const d=dateDay(new Date(v+'T00:00:00'));if(!isFinite(d))return;E.date=d}
 else{if(!rhEditable(E))return toast(rhT('These settings are locked once voting has started.','ล็อกการตั้งค่าแล้วเมื่อเริ่มโหวต'),'err');
  if(k=='size')E.size=Math.max(10,Math.min(200,Math.round(+v||100)));else if(k=='nperf')E.nperf=Math.max(1,Math.min(5,+v||1));else if(k=='sis')E.sis=!!v;
  else if(k=='name'){const s=String(v||'').replace(/[<>]/g,'').trim().slice(0,90);E.name=s||rhAutoName(E);E.nameEd=!!s;render();return}
  else if(k=='cat'){let C=new Set(E.cats);if(v=='all')C=new Set(['all']);else{C.delete('all');C.has(v)?C.delete(v):C.add(v);if(!C.size)C.add('all')}E.cats=['all','sa','cpl','th'].filter(x=>C.has(x))}}
 if(!E.nameEd)E.name=rhAutoName(E);render()}
function rhDel(id){const E=rhGet(id);if(!E||E.status!='setup'&&E.status!='single')return;ask(rhT('Delete this Request Hour plan?','ลบแผน Request Hour นี้?'),()=>{const R=rhS();R.list=R.list.filter(e=>e!==E);try{S.groups.forEach(g=>gsWith(g.id,()=>{if(S.pj&&S.pj.rh==id)delete S.pj.rh}))}catch(e){}ui.rhe=null;render()})}
function rhErrs(E,noDate){const out=[],se=rhSplitErr(E.size,E.nperf);if(se)out.push(se);const P=rhPool(E);if(!P.length)out.push(rhT('No released song matches the selected categories.','ไม่มีเพลงที่วางจำหน่ายแล้วตรงกับหมวดที่เลือก'));
 if(noDate)return out;
 if(E.close!=null&&E.date<=E.close+6)out.push(rhT(`The concert must be at least a week after voting closes (${jd(E.close)}).`,`วันคอนเสิร์ตต้องห่างจากวันปิดโหวต (${jd(E.close)}) อย่างน้อย 1 สัปดาห์`));
 else if(E.close==null&&E.date<S.day+45)out.push(rhT('Leave time for the single, one month of voting and the concert preparation (at least 45 days from today).','เผื่อเวลาผลิตซิงเกิล โหวต 1 เดือน และเตรียมคอนเสิร์ต (อย่างน้อย 45 วันจากวันนี้)'));return out}
// ---- the song pool ------------------------------------------------------------------------------------------------------------
function rhGroups(E){const h=rhGrp(E.gid);if(!h)return[];const L=[h];if(E.sis&&h.type=='main')(S.groups||[]).forEach(g=>{if(g.id!=h.id&&!g.dis&&g.type=='sister')L.push(g)});return L}
function rhReleased(o){if(!o)return false;if(o.relDay!=null&&o.rel&&o.relDay<=S.day)return true;if(o.th&&o.th.deb!=null&&o.th.deb<=S.day)return true;return false}
function rhAlbumIds(gid){const set=new Set();try{(gsCtx(gid,'albums')||[]).forEach(a=>{if(a.day!=null&&a.day>S.day)return;(a.types||[]).forEach(t=>(t.songs||[]).forEach(id=>set.add(id)));(a.songs||[]).forEach(id=>set.add(typeof id=='object'?id.id:id));(a.tracks||[]).forEach(t=>set.add(t.id))})}catch(e){}return set}
function rhSongCats(o,alb,copyTh){const c=new Set();if(o.rel&&o.relDay!=null)c.add('sa');if(alb&&alb.has(o.id))c.add('sa');if(o.rel&&o.relDay!=null&&o.role=='Coupling')c.add('cpl');if(o.th||copyTh)c.add('th');return c}
let RH_POOLC=null;
function rhPool(E){const sig=[E.id,E.gid,E.cats.join(),E.sis,S.day,(S.groups||[]).length].join('|');if(RH_POOLC&&RH_POOLC.sig==sig)return RH_POOLC.L;
 const G=rhGroups(E),gids=new Set(G.map(g=>g.id)),M=new Map();
 G.forEach(g=>{const SG=gsCtx(g.id,'songs')||{},alb=rhAlbumIds(g.id);Object.values(SG).forEach(o=>{if(!o||!rhReleased(o))return;let og=g.id,oid=o.id,oo=o,copy=false;
  if(o.xFrom&&o.xFrom.gid!=null){og=o.xFrom.gid;oid=o.xFrom.id;copy=true;const so=(gsCtx(og,'songs')||{})[oid];if(so)oo=so;
   // a Revival copy is eligible for the group that performed it (the event host), or when the owner group is part of the event
   if(g.id!=E.gid&&!gids.has(og))return}
  const key=og+':'+oid;let z=M.get(key);if(!z){z={key,gid:og,id:oid,title:oo.title||o.title,cats:new Set(),via:[]};M.set(key,z)}
  const oalb=og==g.id?alb:rhAlbumIds(og);rhSongCats(oo,oalb,copy&&o.th).forEach(c=>z.cats.add(c));if(copy)z.via.push(g.id)})});
 const all=E.cats.includes('all'),L=[...M.values()].filter(z=>all||E.cats.some(c=>z.cats.has(c))).sort((a,b)=>String(a.title).localeCompare(String(b.title)));
 RH_POOLC={sig,L};return L}
// ---- song facts: original lineup, revival lineups, history ---------------------------------------------------------------------
const rhSong=(gid,id)=>(gsCtx(gid,'songs')||{})[id]||null;
function rhTeamOfStage(gid,st){let t=null;try{gsWith(gid,()=>{const K=typeof thK=='function'?thK(st.k):null;t=K&&(K.tid||K.team)||null;if(!t){const m=/^t[tr](\d+)$/.exec(String(st.k||''));if(m)t='t'+m[1]}})}catch(e){}return t}
function rhOrigTh(gid,id){let out=null;try{gsWith(gid,()=>{const L=Object.values((S.th&&S.th.st)||{}).filter(s=>!s.revOf&&!s.adopted&&s.debut!=null&&thAll(s).some(it=>it.song==id)).sort((a,b)=>a.debut-b.debut),s=L[0];if(!s)return;
  const oi=(s.orig||[]).find(it=>it.k=='song'&&it.song==id),it=thAll(s).find(q=>q.song==id);let mem,cen,unit=null;
  if(oi&&oi.mem&&oi.mem.length){mem=oi.mem.slice();cen=[oi.center,oi.c2].filter(x=>x!=null&&mem.includes(x));unit=oi.unit?oi.unit.name:null}else if(it){mem=thMem(s,it).slice();const c=thCen(s,it);cen=c!=null?[c]:[];unit=it.unit?((s.units||[]).find(u=>u.id==it.unit)||{}).name||'Unit':null}
  if(!mem)return;out={sid:s.id,stage:s.name,stLabel:typeof thLabel=='function'?thLabel(s.k):'',tid:rhTeamOfStage(gid,s),mem,cen,unit,day:s.debut,retired:s.status=='retired'}})}catch(e){console.error(e)}return out}
// Revival lineups (any group, any revival stage) — stored separately, never replacing the original
function rhRevivals(key){const out=[];(S.groups||[]).forEach(g=>{try{gsWith(g.id,()=>{const SG=S.songs||{};const ids=Object.values(SG).filter(o=>(g.id+':'+o.id)==key||(o.xFrom&&(o.xFrom.gid+':'+o.xFrom.id)==key)).map(o=>o.id);if(!ids.length)return;
  Object.values((S.th&&S.th.st)||{}).filter(s=>s.revOf&&s.debut!=null).forEach(s=>{ids.forEach(id=>{const oi=(s.orig||[]).find(it=>it.k=='song'&&it.song==id),it=thAll(s).find(q=>q.song==id);if(!oi&&!it)return;const mem=oi&&oi.mem?oi.mem.slice():thMem(s,it).slice();out.push({gid:g.id,stage:s.name,day:s.debut,mem})})})})}catch(e){}});return out}
let RH_PERF=null;
// last day and number of times every song was performed (Theater shows of every group + concerts)
function rhPerfMap(){if(RH_PERF&&RH_PERF.day==S.day)return RH_PERF.M;const M={},hit=(key,d)=>{const z=M[key]||(M[key]={n:0,last:null});z.n++;if(z.last==null||d>z.last)z.last=d};
 (S.groups||[]).forEach(g=>{try{gsWith(g.id,()=>{const SG=S.songs||{},own=id=>{const o=SG[id];return o&&o.xFrom?o.xFrom.gid+':'+o.xFrom.id:g.id+':'+id},cache={};
  ((S.th&&S.th.pf)||[]).forEach(p=>{if(p.day==null||p.day>S.day)return;let L=cache[p.st];if(!L){const s=thStage(p.st);L=cache[p.st]=s?thAll(s).map(it=>it.song).filter(Boolean):[]}L.forEach(id=>hit(own(id),p.day))})})}catch(e){}});
 try{ccS().list.forEach(C=>(C.pf||[]).forEach(p=>{if(!p.res||p.res.err)return;const d=p.res.day??(C.start+p.d),set=C.sets[p.res.sid]||p.res.set;((set&&set.items)||[]).forEach(it=>{if(it.k!='song')return;const o=rhSong(it.gid,it.song);hit(o&&o.xFrom?o.xFrom.gid+':'+o.xFrom.id:it.gid+':'+it.song,d)})}))}catch(e){}
 RH_PERF={day:S.day,M};return M}
function rhSingleOf(gid,o){let x=null;try{gsWith(gid,()=>{x=(S.singles||[]).find(s=>s.mainId==o.id||(s.types||[]).some(t=>(t.songs||[]).includes(o.id)))||null})}catch(e){}return x}
// all facts about one pool song (cached per day)
let RH_META={};
function rhMeta(z){const ck=z.key+'|'+S.day;if(RH_META[ck])return RH_META[ck];if(Object.keys(RH_META).length>2000)RH_META={};
 const o=rhSong(z.gid,z.id)||{},g=rhGrp(z.gid),P=rhPerfMap()[z.key]||{n:0,last:null},T=o.th?rhOrigTh(z.gid,z.id):null,x=o.rel?rhSingleOf(z.gid,o):null;
 let mem=[],cen=[],kind,origin,team=null,unit=null,born=null;
 if(T){mem=T.mem;cen=T.cen;unit=T.unit;team=T.tid;kind=unit?'unit':'th';origin=`${T.stLabel?T.stLabel+' · ':''}${T.stage}`;born=T.day}
 else{mem=(o.slots||[]).filter(x=>x!=null);cen=(o.centers&&o.centers.length?o.centers:[o.center]).filter(x=>x!=null);kind=o.role=='Main'?'title':o.rel?'cpl':'alb';origin=x?`${x.title}${x.num?` (${x.num}${['th','st','nd','rd'][x.num%10>3||Math.floor(x.num%100/10)==1?0:x.num%10]} Single)`:''}`:(o.rel||'');born=o.relDay}
 const sales=x?(x.sales||0):0,since=born!=null?S.day-born:999;
 let ap;if(kind=='title')ap=1+.25*Math.log10(1+sales/10000)+(since<180?.18:0);else if(kind=='cpl'||kind=='alb')ap=.62+.12*Math.log10(1+sales/10000)+(since<180?.08:0);
 else{let pr=null;try{gsWith(z.gid,()=>{const s=T&&thStage(T.sid);pr=s&&s.prefs&&s.prefs[z.id]?s.prefs[z.id].s:null})}catch(e){}ap=(kind=='unit'?.5:.56)+Math.min(.4,(o.thPop||0)/40)+((pr??60)-60)/220}
 const tm=team&&g?(g.teams||[]).find(t=>t.id==team):null;
 const R={key:z.key,gid:z.gid,id:z.id,title:z.title,o,g,gname:g?g.name:'',kind,origin,team,teamName:tm?tm.name:(team&&typeof knTeamName=='function'?'':''),teamGone:!!(team&&g&&!(g.teams||[]).some(t=>t.id==team)),unit,mem,cen,born,since,sales,
  last:P.last,n:P.n,retired:T?T.retired:false,ap:Math.max(.25,ap),cats:z.cats,via:z.via};
 if(team&&!tm){try{gsWith(z.gid,()=>{const K=typeof thK=='function'&&T?thK((thStage(T.sid)||{}).k):null;R.teamName=K&&K.label?String(K.label).replace(/\s*\d+(st|nd|rd|th) Stage.*$/,''):''})}catch(e){}}
 RH_META[ck]=R;return R}
const RH_KIND={title:'Single (title track)',cpl:'Single (coupling)',alb:'Album track',th:'Theater Stage',unit:'Theater Unit'};
const RH_KIND_TH={title:'ซิงเกิล (เพลงหลัก)',cpl:'ซิงเกิล (คัปปลิ้ง)',alb:'เพลงในอัลบั้ม',th:'เธียเตอร์สเตจ',unit:'ยูนิตเธียเตอร์'};
// ---- the single ---------------------------------------------------------------------------------------------------------------
function rhLink(id){const E=rhGet(id);if(!E||E.status!='setup')return;const er=rhErrs(E,1);if(er.length)return toast(er[0],'err');
 if(typeof gsAg=='function'&&gsAg()!=E.gid)return toast(rhT(`Switch to ${rhGrp(E.gid).name} first (the Request Hour single is that group's single).`,`สลับไปที่วง ${rhGrp(E.gid).name} ก่อน (ซิงเกิล Request Hour เป็นซิงเกิลของวงนั้น)`),'err');
 const p=S.pj;if(!p||p.status!='draft')return toast(rhT('Finish (or release) the single currently in production first.','ปล่อยซิงเกิลที่กำลังผลิตอยู่ให้เสร็จก่อน'),'err');if(p.ge||p.geNext)return toast(rhT('This single is the General Election single.','ซิงเกิลนี้เป็นซิงเกิลเลือกตั้งทั่วไป'),'err');if(plAlb&&plAlb(p))return toast(rhT('An album cannot carry Request Hour voting codes.','อัลบั้มไม่สามารถแนบรหัสโหวต Request Hour ได้'),'err');
 p.rh=E.id;E.status='single';E.log.push({d:S.day,t:'single'});toast(rhT('This single is now the Request Hour single. Produce it as usual — every CD sold during the voting month carries one voting code.','ซิงเกิลนี้เป็นซิงเกิล Request Hour แล้ว ผลิตตามปกติ — ซีดีที่ขายในเดือนโหวตมีรหัสโหวต 1 รหัสต่อแผ่น'));goView('music')}
function rhUnlink(id){const E=rhGet(id);if(!E||E.status!='single')return;try{gsWith(E.gid,()=>{if(S.pj&&S.pj.rh==id)delete S.pj.rh})}catch(e){}E.status='setup';render()}
const rhX=E=>E&&E.rid?seFind(E.gid,E.rid):null;
// sister-group fans buy the main group's Request Hour single for their own songs (only when sister songs are eligible)
let RH_DEM=null;
{const f=cddDemand;cddDemand=function(gid,sen,ctx){const Z=RH_DEM;if(!Z||gid!=Z.gid)return f.apply(this,arguments);const c2={...(ctx||{}),promo:((ctx&&ctx.promo)||0)+.07},D=f.call(this,gid,sen,c2);if(!D)return D;
 Z.sis.forEach(sg=>{try{const d=f.call(this,sg,[],{...c2,q:(c2.q||.55)*.92,commit:c2.commit});if(d){const k=.55;D.units+=Math.round(d.units*k);D.fanCopies+=Math.round(d.fanCopies*k);D.buyers+=Math.round(d.buyers*k);D.sisU=(D.sisU||0)+Math.round(d.units*k)}}catch(e){console.error(e)}});return D}}
{const f=doRelease;doRelease=function(){const p=S.pj,E=p&&p.rh?rhGet(p.rh):null,n=S.singles.length;if(E)RH_DEM={gid:E.gid,sis:E.sis?rhGroups(E).filter(g=>g.id!=E.gid).map(g=>g.id):[]};let r;try{r=f.apply(this,arguments)}finally{RH_DEM=null}
 try{const x=S.singles[n];if(E&&x&&S.singles.length>n){x.rh=E.id;E.rid=x.rid;E.title=x.title;E.open=x.relDay??S.day;E.close=geAddMon(E.open,1)-1;E.status='voting';E.codes.vd=E.open-1;E.trend=null;E.log.push({d:S.day,t:'open'});
  if(E.date<=E.close+6)E.date=E.close+21;rhVoteTo(E,S.day);ui.rhPop={k:'open',id:E.id}}}catch(e){console.error(e)}return r}}
// ---- voting codes ---------------------------------------------------------------------------------------------------------
function rhCode(E,n){const h=String((n*2654435761+E.id.length*97+(E.created|0))>>>0).slice(-4);return`RH${String(E.id).slice(2).padStart(2,'0')}-${String(n).padStart(7,'0')}-${h}`}
function rhPlCodesLeft(E){return Math.max(0,E.codes.plIss-E.codes.plUsed)}
function rhBuy(id,n){const E=rhGet(id),x=rhX(E);if(!E||!x)return;n=Math.max(1,Math.min(1000,n|0));const cost=n*RH_CD_PRICE;
 if(!spend(cost,`Request Hour CDs: ${x.title} ×${n}`))return;x.dsl=x.dsl||{};x.dsl[S.day]=(x.dsl[S.day]||0)+n;x.sales=(x.sales||0)+n;if(x.cd){x.cd.units+=n;x.cd.orders+=1}
 E.cdPl[S.day]=(E.cdPl[S.day]||0)+n;E.cdPlTot=(E.cdPlTot||0)+n;if(E.status=='voting'&&S.day>=E.open&&S.day<=E.close&&E.codes.vd>=S.day)E.cdV+=n;
 if(rhVotingOpen(E)){const a=E.codes.next;E.codes.next+=n;E.codes.pl.push([a,a+n-1]);E.codes.plIss+=n;toast(rhT(`${n} CD(s) bought — ${n} voting code(s) received.`,`ซื้อซีดี ${n} แผ่น — ได้รหัสโหวต ${n} รหัส`))}
 else toast(rhT(`${n} CD(s) bought. Voting has closed, so these CDs carry no usable voting code.`,`ซื้อซีดี ${n} แผ่น แต่ปิดโหวตแล้ว ซีดีเหล่านี้จึงไม่มีรหัสโหวตที่ใช้ได้`));render()}
const rhVotingOpen=E=>E&&E.status=='voting'&&S.day>=E.open&&S.day<=E.close;
function rhVote(id,key,n){const E=rhGet(id);if(!rhVotingOpen(E))return toast(rhT('Voting is not open.','ไม่ได้เปิดโหวตอยู่'),'err');n=Math.max(1,n|0);const left=rhPlCodesLeft(E);if(n>left)return toast(rhT(`You have ${left} unused voting code(s).`,`คุณมีรหัสโหวตเหลือ ${left} รหัส`),'err');
 if(!rhPool(E).some(z=>z.key==key))return toast(rhT('That song is not eligible.','เพลงนี้ไม่มีสิทธิ์'),'err');E.codes.plUsed+=n;E.pv[key]=(E.pv[key]||0)+n;toast(rhT(`${n} vote(s) submitted.`,`ส่งโหวต ${n} คะแนนแล้ว`));render()}
// ---- fan voting simulation --------------------------------------------------------------------------------------------------
const RH_WFT={casual:.006,oshi:.022,dedicated:.1,hardcore:.45};       // codes per fan (purchase × copies), relative
const RH_TAU={casual:1.05,oshi:.9,dedicated:.8,hardcore:.7};           // how personal (noisy) a fan's taste is
const RH_KM={casual:.5,oshi:.8,dedicated:1,hardcore:1.25};             // how much the Kami Oshi drives her choices
const RH_SPLIT={casual:[.6,.25,.15],oshi:[.55,.28,.17],dedicated:[.62,.25,.13],hardcore:[.72,.2,.08]};
const rhGumbel=r=>-Math.log(-Math.log(Math.max(1e-9,Math.min(1-1e-9,r()))));
function rhSeedN(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
// event-wide context: song facts, the group's history and the shared mood of the year
function rhCtx(E){const P=rhPool(E),Ms=P.map(rhMeta),G=rhGroups(E),now=S.day,r=mulb(rhSeedN(E.id+'trend'));
 if(!E.trend){E.trend={};P.forEach(z=>{E.trend[z.key]=+(((r()+r()+r()+r())/4-.5)*.9).toFixed(3)})}
 const past=new Map();S.members.forEach(m=>{const T=new Set();(m.mh||[]).forEach(h=>{if(h.tid&&(h.t=='team_join'||h.t=='team_transfer'||h.t=='team_leave'))T.add(h.tid)});if(m.tid)T.add(m.tid);past.set(m.id,T)});
 // history: graduation announcements, new teams, anniversaries, previous Request Hours
 const ann=new Map();S.members.forEach(m=>{if(m.grad&&m.grad.ann!=null&&m.status!='graduated'&&now-m.grad.ann<400)ann.set(m.id,m)});
 const newT=new Set();G.forEach(g=>{try{gsWith(g.id,()=>{(g.teams||[]).forEach(t=>{const first=Object.values((S.th&&S.th.st)||{}).filter(s=>!s.revOf&&s.debut!=null&&rhTeamOfStage(g.id,s)==t.id).map(s=>s.debut);const d=first.length?Math.min(...first):null;if(d!=null&&now-d<240)newT.add(t.id)})})}catch(e){}});
 const anni=new Set();G.forEach(g=>{const d0=g.debutDay??g.formed;if(d0==null)return;const yrs=Math.round((E.close-d0)/365);if(yrs>=1&&Math.abs(E.close-(d0+yrs*365))<75)anni.add(g.id)});
 const debutKey=new Set();G.forEach(g=>{try{gsWith(g.id,()=>{const x=(S.singles||[]).slice().sort((a,b)=>(a.relDay??a.day)-(b.relDay??b.day))[0];if(x)debutKey.add(g.id+':'+x.mainId);const st=Object.values((S.th&&S.th.st)||{}).filter(s=>!s.revOf&&s.debut!=null).sort((a,b)=>a.debut-b.debut)[0];const f=st&&thAll(st).find(it=>it.song);if(f)debutKey.add(g.id+':'+f.song)})}catch(e){}});
 const prev=rhPrevRank(E),gen=new Map(S.members.map(m=>[m.id,m.gen]));
 const S2=Ms.map(M=>{const mem=new Set(M.mem),cen=new Set(M.cen),rev=new Set();rhRevivals(M.key).forEach(R=>R.mem.forEach(id=>{if(!mem.has(id))rev.add(id)}));
  const act=M.mem.filter(id=>{const m=get(id);return m&&m.status!='graduated'}).length,gap=M.last!=null?now-M.last:(M.born!=null?now-M.born:0);
  let nost=.36*Math.min(1,gap/540)+(M.retired&&!rhInActive(M)?.2:0)+(M.n<10&&(M.kind=='th'||M.kind=='unit')?.12:0)+(M.mem.length&&act/M.mem.length>=.6&&gap>200?.1:0);
  let hist=0;if(M.teamGone)hist+=.15;if(debutKey.has(M.key))hist+=.22+(anni.has(M.gid)?.35:0);if(M.since<180&&M.kind=='title')hist+=.12;const pr=prev[M.key];if(pr!=null)hist+=pr<=10?.14:pr<=50?.07:.03;
  const gc=M.cen.map(id=>get(id)).filter(m=>m&&m.status=='graduated');
  return{M,mem,cen,rev,small:M.unit&&M.mem.length<=4,base:Math.log(M.ap)*1.5+E.trend[M.key],nost,hist,gradC:gc.length?Math.max(...gc.map(m=>(m.pop||50)/100)):0,annC:M.cen.filter(id=>ann.has(id)),annM:M.mem.filter(id=>ann.has(id)),
   newTeam:M.team&&newT.has(M.team),cenGen:M.cen.length?gen.get(M.cen[0]):null,born:M.born}});
 return{E,P,S2,past,ann,gen}}
function rhInActive(M){let on=false;try{gsWith(M.gid,()=>{on=Object.values((S.th&&S.th.st)||{}).some(s=>s.status=='active'&&thAll(s).some(it=>it.song==M.id))})}catch(e){}return on}
// one cohort → a vote distribution over the pool (several fans with their own taste inside the cohort)
function rhCohortPref(X,s,wk){const E=X.E,ft=RH_TAU[s.ft]?s.ft:'oshi',tau=RH_TAU[ft],km=RH_KM[ft],sp=RH_SPLIT[ft],k=s.k,km_=k!=null?get(k):null,team=km_?km_.tid:null,pt=k!=null?X.past.get(k):null,kg=k!=null?X.gen.get(k):null,O=s.o||{},longFan=d=>s.born!=null&&d!=null&&s.born<=d+60;
 const oshi=Object.keys(O).filter(j=>O[j]>0).map(Number),np=Math.max(1,Math.min(8,Math.round(1+Math.log2(1+s.n)))),r=mulb(rhSeedN(E.id+'|'+s.id+'|'+wk)),D={};
 const fix=X.S2.map(z=>{let u=z.base+z.nost*(longFan(z.M.last??z.born)?1:.55)+z.hist;
  if(k!=null){if(z.cen.has(k))u+=1.1*km;else if(z.mem.has(k))u+=(z.small?.75:.5)*km;else if(z.rev.has(k))u+=.25*km;
   if(z.mem.has(k)&&z.M.last!=null&&S.day-z.M.last>180)u+=.2*km;if(team&&z.M.team==team)u+=.25;else if(pt&&z.M.team&&pt.has(z.M.team))u+=z.M.teamGone?.5:.18;
   if(kg!=null&&z.cenGen==kg)u+=.1;if(z.newTeam&&team==z.M.team)u+=.3;if(z.annC.includes(k))u+=.9;else if(z.annM.includes(k))u+=.45}
  let oc=0;for(const j of oshi)if(z.mem.has(j))oc++;else if(z.rev.has(j))oc+=.3;u+=.18*Math.min(3,oc);
  if(z.annC.length&&!z.annC.includes(k))u+=.25*Math.max(...z.annC.map(id=>(get(id)||{}).pop||50))/100;
  if(z.gradC&&longFan(z.born))u+=.35*z.gradC;if(z.M.teamGone&&longFan(z.born))u+=.12;return u});
 for(let p=0;p<np;p++){const B=[];for(let i=0;i<fix.length;i++){const v=fix[i]+tau*rhGumbel(r);if(B.length<3||v>B[2][0]){B.push([v,i]);B.sort((a,b)=>b[0]-a[0]);if(B.length>3)B.pop()}}
  B.forEach(([,i],j)=>{const key=X.S2[i].M.key;D[key]=(D[key]||0)+sp[j]/np})}
 return D}
function rhCohorts(E){const G=new Set(rhGroups(E).map(g=>g.id));return((S.fb&&S.fb.segs)||[]).filter(s=>s.n>0&&s.ft!='dormant').map(s=>{const g=typeof fmPg=='function'?fmPg(s):(s.k!=null?fdGrpOf(s.k):s.gs);if(!G.has(g))return null;
 const w=s.n*(RH_WFT[s.ft]||.02)*(1+((s.loy||50)-50)/150)*(g==E.gid?1:.55);return w>0?{s,w}:null}).filter(Boolean)}
// cast the fan votes of every day from (last processed + 1) to `to` (sales of a day are known after its tick)
function rhVoteTo(E,to){if(E.status!='voting')return;const x=rhX(E);if(!x)return;to=Math.min(to,E.close);let d=(E.codes.vd??E.open-1)+1;if(d>to)return;
 E.acc=E.acc||{};let X=null,C=null,W=0;
 for(;d<=to;d++){const tot=Math.max(0,((x.dsl||{})[d]||0)-((E.cdPl||{})[d]||0));E.cdV+=((x.dsl||{})[d]||0);E.codes.vd=d;if(!tot)continue;
  const a=E.codes.next;E.codes.next+=tot;E.codes.fanIss+=tot;const left=E.close-d,use=left>=3?.985:left==2?.93:left==1?.9:.85,used=Math.round(tot*use);E.codes.fanUsed+=used;
  const wk=Math.floor((d-E.open)/7);if(!X||X.wk!=wk){X=rhCtx(E);X.wk=wk;C=rhCohorts(E);W=C.reduce((t,c)=>t+c.w,0);E.prefC={wk,D:{}}}
  if(!W)continue;C.forEach(c=>{const share=used*c.w/W;if(share<=0)return;let D=E.prefC.D[c.s.id];if(!D){D=rhCohortPref(X,c.s,wk);E.prefC.D[c.s.id]=D}for(const key in D)E.acc[key]=(E.acc[key]||0)+share*D[key]})}
 delete E.prefC}
// integer votes: fan totals rounded so they add up exactly to the codes used, plus the producer's votes
function rhTotals(E){const acc=E.acc||{},keys=Object.keys(acc),U=E.codes.fanUsed;let fl=keys.map(k=>[k,Math.floor(acc[k]),acc[k]-Math.floor(acc[k])]),s=fl.reduce((t,z)=>t+z[1],0);fl.sort((a,b)=>b[2]-a[2]);for(let i=0;s<U&&i<fl.length;i++,s++)fl[i][1]++;
 const V={};fl.forEach(([k,n])=>{if(n)V[k]=n});for(const k in E.pv)V[k]=(V[k]||0)+E.pv[k];return V}
// ---- close & results -------------------------------------------------------------------------------------------------------
function rhClose(E){if(E.status!='voting')return;rhVoteTo(E,E.close);const V=rhTotals(E),P=rhPool(E);E.votes=V;E.status='closed';E.closed=S.day;E.locked=true;
 const valid=E.codes.fanUsed+E.codes.plUsed,tv=Object.values(V).reduce((a,b)=>a+b,0);E.check={valid,tv,ok:valid==tv,expired:(E.codes.fanIss-E.codes.fanUsed)+(E.codes.plIss-E.codes.plUsed)};
 const L=P.map(z=>{const M=rhMeta(z);return{key:z.key,gid:z.gid,id:z.id,title:z.title,v:V[z.key]||0,ap:M.ap,kind:M.kind,origin:M.origin,gname:M.gname,team:M.teamName||'',unit:M.unit,cen:M.cen.slice(),mem:M.mem.slice()}}).sort((a,b)=>b.v-a.v||b.ap-a.ap||String(a.title).localeCompare(String(b.title)));
 const prev=rhPrevRank(E),ever=rhEverRanked(E);E.rank=L.slice(0,Math.min(E.size,L.length)).map((z,i)=>({...z,r:i+1,prev:prev[z.key]??null,re:prev[z.key]==null&&ever.has(z.key)}));E.out=L.slice(E.size).map(z=>({key:z.key,title:z.title,v:z.v}));
 const R=rhS(),x=rhX(E);R.hist.push({eid:E.id,year:dayDate(E.date).getFullYear(),name:E.name,gid:E.gid,groups:rhGroups(E).map(g=>({id:g.id,name:g.name})),cats:E.cats.slice(),size:E.size,nperf:E.nperf,date:E.date,closed:S.day,
  single:x?{rid:x.rid,title:x.title}:null,win:E.rank[0]?{key:E.rank[0].key,title:E.rank[0].title,v:E.rank[0].v}:null,top:E.rank.slice(0,10).map(z=>({key:z.key,title:z.title,v:z.v,r:z.r})),
  rank:E.rank.map(z=>({r:z.r,key:z.key,title:z.title,v:z.v,gid:z.gid,prev:z.prev,re:z.re,cen:z.cen,mem:z.mem})),tv,codes:{...E.codes,pl:undefined},cdV:E.cdV,perfs:[],lineups:{}});
 E.log.push({d:S.day,t:'close'});try{if(typeof rhMakeConcert=='function')rhMakeConcert(E)}catch(e){console.error(e)}ui.rhPop={k:'res',id:E.id}}
const rhSig=E=>E.gid+'|'+E.cats.slice().sort().join(',')+'|'+(E.sis?1:0);
function rhPrevRank(E){const H=rhS().hist.filter(h=>h.eid!=E.id&&h.gid==E.gid&&(h.gid+'|'+h.cats.slice().sort().join(',')+'|'+((h.groups||[]).length>1?1:0))==rhSig(E)).sort((a,b)=>b.closed-a.closed)[0];const M={};if(H)H.rank.forEach(z=>M[z.key]=z.r);return M}
function rhEverRanked(E){const s=new Set();rhS().hist.forEach(h=>{if(h.eid!=E.id&&h.gid==E.gid)h.rank.forEach(z=>s.add(z.key))});return s}
// daily: voting days are cast as soon as the day's sales are known; voting closes by itself after one month
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{if(S&&S.rh)rhS().list.forEach(E=>{if(E.status=='voting'){rhVoteTo(E,S.day);if(S.day>E.close)rhClose(E)}})}catch(e){console.error(e)}return r}}
// ---- pop-ups -----------------------------------------------------------------------------------------------------------------------
{const f=render;render=function(){try{const z=ui.rhPop;if(z&&S&&!ui.mod&&!ui.ccsh&&!ui.awsh){ui.rhPop=null;const E=rhGet(z.id);if(E){const th=rhTh();
 if(z.k=='open')ui.mod={t:'html',h:`<div class="rhpop"><div class="rhk">REQUEST HOUR</div><h2>${esc(E.name)}</h2><h3>${th?'เปิดโหวตแล้ว!':'Voting is now open!'}</h3><p>${th?`ซีดี “${esc(E.title||'')}” ที่ขายตั้งแต่วันนี้ถึง ${jd(E.close)} มีรหัสโหวต 1 รหัสต่อแผ่น แฟน ๆ เริ่มโหวตเพลงที่อยากดูอีกครั้งแล้ว`:`Every CD of “${esc(E.title||'')}” sold from today to ${jd(E.close)} carries one voting code. Fans are voting for the songs they want to see again.`}</p><div class="row rhact"><button class="b p" onclick="ui.mod=null;ui.rhe='${E.id}';ui.rht='vote';goView('rh')">${th?'ไปหน้าโหวต':'Open voting'}</button></div></div>`};
 else if(z.k=='res'){const T=(E.rank||[]).slice(0,10);ui.mod={t:'html',h:`<div class="rhpop"><div class="rhk">REQUEST HOUR · ${th?'ผลการโหวต':'RESULTS'}</div><h2>${esc(E.name)}</h2><h3>${th?'อันดับ 1':'No. 1'}: ${esc(T[0]?T[0].title:'—')}</h3><ol class="rhtop">${T.map(z=>`<li><b>${esc(z.title)}</b> <small>${esc(z.gname)} · ${z.v.toLocaleString()} ${th?'โหวต':'votes'}</small></li>`).join('')}</ol><p class="st">${th?`อันดับทั้งหมด ${E.rank.length} เพลงถูกล็อกแล้ว และสร้างคอนเสิร์ต Request Hour ในระบบคอนเสิร์ตแล้ว`:`All ${E.rank.length} ranks are locked and the Request Hour concert has been created in the Concert system.`}</p><div class="row rhact"><button class="b p" onclick="ui.mod=null;ui.rhe='${E.id}';ui.rht='res';goView('rh')">${th?'ดูอันดับทั้งหมด':'Full ranking'}</button>${E.cc?`<button class="b s" onclick="ui.mod=null;ccOpen('${E.cc}','setup')">${th?'เปิดคอนเสิร์ต':'Open concert'}</button>`:''}</div></div>`}}}}}catch(e){console.error(e)}return f.apply(this,arguments)}}
// ---- views -----------------------------------------------------------------------------------------------------------------------
{const f=V.concert;V.concert=function(){let h=f.apply(this,arguments);try{if(!ccCur()){const b=`<button class="b s rhnav" onclick="ui.rhe=null;goView('rh')">🎤 Request Hour</button>`;const i=h.indexOf('<span style="flex:1"></span>');if(i>=0)h=h.slice(0,i)+b+h.slice(i)}}catch(e){console.error(e)}return h}}
const rhFace=(id,sz)=>{const m=get(id);return m?`<span class="rhface" title="${esc(m.name)}">${ptc(m,sz)}</span>`:''};
const rhNm=id=>{const m=get(id);return m?m.name+(m.status=='graduated'?rhT(' (graduated)',' (จบการศึกษา)'):''):'—'};
V.rh=function(){const R=rhS(),E=rhCur(),th=rhTh();
 const head=`<div class="row rhhead"><button class="b s" onclick="ui.rhe=null;ui.ccov='over';goView('concert')">← ${th?'คอนเสิร์ต':'Concerts'}</button><h2 class="ht">🎤 Request Hour <small class="st">リクエストアワー</small></h2></div>`;
 if(!E){const act=R.list.filter(e=>e.status!='done'),H=R.hist.slice().sort((a,b)=>b.closed-a.closed);
  return head+`<div class="c rhintro"><p>${th?'คอนเสิร์ตจัดอันดับประจำปีที่แฟน ๆ โหวตเพลงที่อยากดูอีกครั้ง ผลิตซิงเกิล Request Hour ซีดีที่ขายในเดือนโหวตมีรหัสโหวต 1 รหัสต่อแผ่น เมื่อปิดโหวต อันดับจะถูกล็อกและสร้างคอนเสิร์ตนับถอยหลังให้อัตโนมัติ':'An annual ranking concert where fans vote for the songs they want to see performed again. Produce the Request Hour single — each CD sold during the voting month carries one voting code. When voting closes the ranking is locked and a countdown concert is created.'}</p><button class="b p" onclick="rhNew()">✦ ${th?'สร้าง Request Hour':'Create Request Hour'}</button></div>`+
   (act.length?`<h3>${th?'กำลังดำเนินการ':'In progress'}</h3>`+act.map(rhCard).join(''):'')+rhHistHtml(H)}
 const T=[['setup',th?'ตั้งค่า':'Setup'],['vote',th?'โหวต':'Voting'],['res',th?'ผลอันดับ':'Ranking'],['hist',th?'ประวัติ':'History']],tab=ui.rht||'setup';
 let body='';if(tab=='setup')body=rhSetupHtml(E);else if(tab=='vote')body=rhVoteHtml(E);else if(tab=='res')body=rhResHtml(E);else body=rhHistHtml(rhS().hist.filter(h=>h.gid==E.gid).sort((a,b)=>b.closed-a.closed));
 return head+`<div class="c rhev"><div class="rhevt"><b>${esc(E.name)}</b><span class="tag">${th?RH_ST_TH[E.status]:RH_ST[E.status]}</span></div>${rhStatsHtml(E)}<div class="row cctabs">${T.map(([k,n])=>`<button class="b s ${tab==k?'p':''}" onclick="ui.rht='${k}';render()">${n}</button>`).join('')}<span style="flex:1"></span><button class="b s" onclick="ui.rhe=null;render()">${th?'ทั้งหมด':'All events'}</button></div></div>`+body};
function rhCard(E){const th=rhTh();return`<div class="c rhcard" onclick="ui.rhe='${E.id}';ui.rht='${E.status=='voting'?'vote':E.status=='setup'||E.status=='single'?'setup':'res'}';render()"><b>${esc(E.name)}</b><span class="tag">${th?RH_ST_TH[E.status]:RH_ST[E.status]}</span><div class="st">${esc((rhGrp(E.gid)||{}).name||'')} · ${E.cats.map(rhCatName).join(' + ')} · Best ${E.size} · ${E.nperf} ${th?'รอบ':'performance(s)'} · ${th?'คอนเสิร์ต':'concert'} ${jd(E.date)}${E.status=='voting'?` · ${th?'ปิดโหวต':'voting closes'} ${jd(E.close)}`:''}</div></div>`}
function rhStatsHtml(E){const x=rhX(E),th=rhTh();if(!x)return'';const tv=E.status=='voting'?E.codes.fanUsed+E.codes.plUsed:Object.values(E.votes||{}).reduce((a,b)=>a+b,0);
 const K=(a,b)=>`<div class="rhk2"><small>${a}</small><b>${b}</b></div>`;
 return`<div class="rhstats">${K(th?'ยอดขายซีดีทั้งหมด':'Total CD sales',(x.sales||0).toLocaleString())}${K(th?'ขายในช่วงโหวต':'Sold during voting',E.cdV.toLocaleString())}${K(th?'รหัสโหวตที่ออก':'Voting codes issued',(E.codes.fanIss+E.codes.plIss).toLocaleString())}${K(th?'รหัสที่ใช้แล้ว':'Voting codes used',(E.codes.fanUsed+E.codes.plUsed).toLocaleString())}${K(th?'คะแนนโหวตรวม':'Total votes received',tv.toLocaleString())}</div>
 <p class="st">${th?`ซิงเกิล “${esc(x.title)}” · โหวต ${jd(E.open)} – ${jd(E.close)}${E.status!='voting'?` · รหัสหมดอายุ ${((E.check||{}).expired||0).toLocaleString()} รหัส · ซีดีที่ขายหลังปิดโหวตไม่มีผลต่ออันดับ`:''}`:`Single “${esc(x.title)}” · voting ${jd(E.open)} – ${jd(E.close)}${E.status!='voting'?` · ${((E.check||{}).expired||0).toLocaleString()} code(s) expired unused · CDs sold after voting closed never affect the ranking`:''}`}</p>`}
function rhSetupHtml(E){const th=rhTh(),ed=rhEditable(E),dis=ed?'':'disabled',g=rhGrp(E.gid),P=rhPool(E),split=rhSplit(E.size,E.nperf),er=rhErrs(E),pr=rhPerfRanks(E.size,E.nperf),dd=dayDate(E.date);
 const iso=`${dd.getFullYear()}-${String(dd.getMonth()+1).padStart(2,'0')}-${String(dd.getDate()).padStart(2,'0')}`;
 const cats=['all','sa','cpl','th'].map(k=>`<label class="rhchk"><input type="checkbox" ${E.cats.includes(k)?'checked':''} ${dis} onchange="rhSet('cat','${k}')"> ${rhCatName(k)}${k=='all'?` <small class="st">(${th?'ค่าเริ่มต้น':'default'})</small>`:''}</label>`).join('');
 let act='';if(E.status=='setup')act=`<button class="b p" onclick="rhLink('${E.id}')">${th?'ใช้ซิงเกิลที่กำลังวางแผนเป็นซิงเกิล Request Hour':'Use the single being planned as the Request Hour single'}</button><button class="b s" onclick="rhDel('${E.id}')">${th?'ลบ':'Delete'}</button><p class="st">${th?'เริ่มวางแผนซิงเกิลใหม่ที่หน้า Single Production ก่อน แล้วกลับมากดปุ่มนี้ เดือนโหวตเริ่มวันวางจำหน่าย':'Start planning a new single in Single Production first, then link it here. The voting month starts on its release day.'}</p>`;
 else if(E.status=='single')act=`<button class="b p" onclick="goView('music')">${th?'ไปที่การผลิตซิงเกิล':'Go to Single Production'}</button><button class="b s" onclick="rhUnlink('${E.id}')">${th?'ยกเลิกการเชื่อมซิงเกิล':'Unlink the single'}</button>`;
 else if(E.cc)act=`<button class="b p" onclick="ccOpen('${E.cc}','setup')">${th?'เปิดคอนเสิร์ต Request Hour':'Open the Request Hour concert'}</button>`;
 return`<div class="c rhsetup"><label>${th?'ชื่องาน':'Event name'}<input value="${esc(E.name)}" ${dis} maxlength="90" onchange="rhSet('name',this.value)"></label><p class="st">${th?'ปล่อยว่างเพื่อใช้ชื่ออัตโนมัติ':'Leave empty for the automatic name'}: ${esc(rhAutoName(E))}</p>
 <h4>${th?'หมวดการจัดอันดับ':'Ranking category'}</h4><div class="rhcats">${cats}</div><p class="st">${th?`เพลงที่มีสิทธิ์: ${P.length} เพลง (เฉพาะเพลงที่วางจำหน่ายแล้ว ไม่นับซ้ำ)`:`Eligible songs: ${P.length} (officially released only, never counted twice)`}</p>
 <div class="rhgrid"><label>${th?'จำนวนเพลงในอันดับ':'Ranked songs'} (10–200)<input type="number" min="10" max="200" value="${E.size}" ${dis} onchange="rhSet('size',this.value)"></label>
 <label>${th?'จำนวนรอบการแสดง':'Performances'} (1–5)<select ${dis} onchange="rhSet('nperf',this.value)">${[1,2,3,4,5].map(n=>`<option ${n==E.nperf?'selected':''}>${n}</option>`).join('')}</select></label>
 <label>${th?'วันคอนเสิร์ต':'Concert date'}<input type="date" value="${iso}" ${E.status=='setup'||E.status=='single'||E.status=='voting'?'':'disabled'} onchange="rhSet('date',this.value)"></label></div>
 <div class="rhsplit">${pr.map(([a,b],i)=>`<span><b>${th?'รอบ':'Show'} ${i+1}</b> #${a}–#${b} <small>(${split[i]} ${th?'เพลง':'songs'})</small></span>`).join('')}</div>
 ${g&&g.type=='main'?`<label class="rhchk"><input type="checkbox" ${E.sis?'checked':''} ${dis} onchange="rhSet('sis',this.checked)"> ${th?'รวมเพลงของวงน้องสาว':'Include Sister Group Songs'} <small class="st">(${(S.groups||[]).filter(x=>x.type=='sister'&&!x.dis).map(x=>esc(x.name)).join(', ')||'—'})</small></label><p class="st">${th?'เมื่อเปิด แฟนวงน้องสาวซื้อซิงเกิลนี้เพื่อโหวตเพลงของวงตัวเองได้ ทุกโหวตรวมในอันดับเดียวกัน':'When ON, sister-group fans buy this single to vote for their own groups\' songs; all valid votes count toward the same ranking.'}</p>`:`<p class="st">${th?'วงน้องสาวโหวตได้เฉพาะเพลงของวงตัวเอง และเพลงของวงพี่ที่วงนี้เคยแสดงใน Revival Stage ของตัวเอง':'A sister group ranks only its own songs, plus senior-group songs it has performed in its own Revival Stage (ownership never changes).'}</p>`}
 ${er.length?`<div class="thwarn">${er.map(esc).join('<br>')}</div>`:''}<div class="row rhact">${act}</div></div>`}
function rhRowSong(E,z,canVote){const M=rhMeta(z),th=rhTh(),grp=rhGrp(z.gid);const fc=M.mem.slice(0,10).map(id=>rhFace(id,26)).join('')+(M.mem.length>10?`<small>+${M.mem.length-10}</small>`:'');
 return`<div class="rhsong"><div class="rhst"><b>${esc(z.title)}</b><span class="tag">${th?RH_KIND_TH[M.kind]:RH_KIND[M.kind]}${M.unit?' · '+esc(M.unit):''}</span><div class="st">${esc(M.gname)}${M.teamName&&!String(M.origin).startsWith(M.teamName)?' · '+esc(M.teamName):''}${M.teamGone?th?' (ยุบทีมแล้ว)':' (disbanded)':''} · ${esc(M.origin)}${z.via&&z.via.length&&grp&&z.via.some(v=>v!=z.gid)?` · ${th?'แสดงใน Revival โดย':'Revival by'} ${z.via.filter(v=>v!=z.gid).map(v=>esc((rhGrp(v)||{}).name||'')).join(', ')}`:''}</div>
 <div class="st">${th?'เซ็นเตอร์ดั้งเดิม':'Original center'}: <b>${M.cen.length?M.cen.map(id=>esc(rhNm(id))).join(' & '):th?'ไม่มี':'none'}</b></div><div class="rhfaces">${fc}</div></div>
 ${canVote?`<div class="rhvote"><input type="number" min="1" value="1" id="rhv_${z.key.replace(':','_')}"><button class="b p" onclick="rhVote('${E.id}','${z.key}',+document.getElementById('rhv_${z.key.replace(':','_')}').value)">${th?'โหวต':'Vote'}</button>${E.pv[z.key]?`<small>${th?'โหวตแล้ว':'you'}: ${E.pv[z.key]}</small>`:''}</div>`:''}</div>`}
function rhVoteHtml(E){const th=rhTh();if(E.status=='setup'||E.status=='single')return`<div class="c"><p>${th?'การโหวตเริ่มในวันวางจำหน่ายซิงเกิล Request Hour':'Voting starts on the release day of the Request Hour single.'}</p></div>`;
 const open=rhVotingOpen(E),left=rhPlCodesLeft(E),q=String(ui.rhq||'').toLowerCase(),fc=ui.rhfc||'',fg=ui.rhfg||'';
 let L=rhPool(E).filter(z=>(!q||String(z.title).toLowerCase().includes(q))&&(!fc||z.cats.has(fc))&&(!fg||String(z.gid)==fg));const pg=Math.max(0,ui.rhpg|0),per=25,np=Math.max(1,Math.ceil(L.length/per));const page=Math.min(pg,np-1);
 const codes=E.codes.pl.slice(-3).map(([a,b])=>`${rhCode(E,a)}${b>a?` … ${rhCode(E,b)}`:''}`).join('<br>');
 return`<div class="c rhvoteh"><div class="row"><div><b>${th?'รหัสโหวตที่เหลือ':'Your unused voting codes'}: ${left.toLocaleString()}</b><div class="st">${th?'1 รหัส = 1 โหวต · โหวตเพลงเดิมซ้ำหรือหลายเพลงได้ · รหัสที่ไม่ได้ใช้หมดอายุเมื่อปิดโหวต':'1 code = 1 vote · vote for the same song again or for different songs · unused codes expire when voting closes'}</div>${codes?`<div class="rhcodes">${codes}</div>`:''}</div><span style="flex:1"></span>
 ${rhX(E)&&(open||E.status=='closed'||E.status=='concert')?`<div class="rhbuy">${[1,10,100].map(n=>`<button class="b s" onclick="rhBuy('${E.id}',${n})">${th?'ซื้อซีดี':'Buy CD'} ×${n} <small>${yen(n*RH_CD_PRICE)}</small></button>`).join('')}</div>`:''}</div>
 <p class="st">${open?(th?`เปิดโหวตถึง ${jd(E.close)} — ระหว่างโหวตจะไม่แสดงอันดับหรือคะแนนของแต่ละเพลง`:`Voting is open until ${jd(E.close)} — the live ranking and song totals stay secret until voting closes.`):(th?'ปิดโหวตแล้ว ซีดีที่ซื้อตอนนี้ไม่มีรหัสโหวตที่ใช้ได้':'Voting has closed. CDs bought now carry no usable voting code.')}</p>
 <div class="row rhflt"><input placeholder="${th?'ค้นหาเพลง':'Search songs'}" value="${esc(ui.rhq||'')}" onchange="ui.rhq=this.value;ui.rhpg=0;render()"><select onchange="ui.rhfc=this.value;ui.rhpg=0;render()"><option value="">${th?'ทุกหมวด':'All categories'}</option>${['sa','cpl','th'].map(k=>`<option value="${k}" ${fc==k?'selected':''}>${rhCatName(k)}</option>`).join('')}</select>${rhGroups(E).length>1?`<select onchange="ui.rhfg=this.value;ui.rhpg=0;render()"><option value="">${th?'ทุกวง':'All groups'}</option>${rhGroups(E).map(g=>`<option value="${g.id}" ${fg==String(g.id)?'selected':''}>${esc(g.name)}</option>`).join('')}</select>`:''}<span class="st">${L.length} ${th?'เพลง':'songs'}</span></div></div>
 ${L.slice(page*per,page*per+per).map(z=>rhRowSong(E,z,open&&left>0)).join('')}
 ${np>1?`<div class="row rhpg">${page>0?`<button class="b s" onclick="ui.rhpg=${page-1};render()">‹</button>`:''}<span>${page+1} / ${np}</span>${page<np-1?`<button class="b s" onclick="ui.rhpg=${page+1};render()">›</button>`:''}</div>`:''}`}
function rhChg(z){const th=rhTh();if(z.prev==null)return z.re?`<span class="rhre">RE</span>`:`<span class="rhnew">NEW</span>`;const d=z.prev-z.r;return d>0?`<span class="rhup">↑${d}</span>`:d<0?`<span class="rhdn">↓${-d}</span>`:`<span class="rhsame">→</span>`}
function rhResHtml(E){const th=rhTh();if(!E.rank)return`<div class="c"><p>${th?'อันดับจะประกาศเมื่อปิดโหวต':'The ranking is announced when voting closes.'}</p></div>`;
 const pr=rhPerfRanks(E.rank.length,E.nperf);return`<div class="c rhres"><p class="st">${th?`ผลการโหวตถูกล็อกถาวร ตรวจสอบรหัส ${E.check.valid.toLocaleString()} รหัส = ${E.check.tv.toLocaleString()} โหวต`:`Final and locked. ${E.check.valid.toLocaleString()} valid codes = ${E.check.tv.toLocaleString()} votes.`}${E.cc?` <button class="b s" onclick="ccOpen('${E.cc}','setup')">${th?'เปิดคอนเสิร์ต':'Open concert'}</button>`:''}</p>
 ${pr.map(([a,b],i)=>`<h4>${th?'รอบที่':'Performance'} ${i+1} · #${a}–#${b}</h4><table class="rhtab"><tbody>${E.rank.filter(z=>z.r<=a&&z.r>=b).sort((p,q)=>q.r-p.r).map(z=>`<tr class="${z.r<=10?'top':''}"><td class="rk">#${z.r}</td><td>${rhChg(z)}</td><td><b>${esc(z.title)}</b><div class="st">${esc(z.gname)}${z.team&&!String(z.origin).startsWith(z.team)?' · '+esc(z.team):''} · ${esc(z.origin)}${z.unit?' · '+esc(z.unit):''}</div></td><td class="ctr">${z.cen.map(id=>rhFace(id,28)).join('')}</td><td class="num">${z.v.toLocaleString()}</td></tr>`).join('')}</tbody></table>`).join('')}
 ${(E.out||[]).length?`<details><summary>${th?`เพลงนอกอันดับ (${E.out.length})`:`Outside the ranking (${E.out.length})`}</summary><p class="st">${E.out.slice(0,60).map(z=>`${esc(z.title)} (${z.v.toLocaleString()})`).join(' · ')}</p></details>`:''}</div>`}
function rhHistHtml(H){const th=rhTh();if(!H.length)return`<div class="c"><p class="st">${th?'ยังไม่มีประวัติ Request Hour':'No Request Hour history yet.'}</p></div>`;
 const songs={};H.forEach(h=>h.rank.forEach(z=>{(songs[z.key]=songs[z.key]||{t:z.title,L:[]}).L.push([h.year,z.r])}));
 const multi=Object.values(songs).filter(s=>s.L.length>1).sort((a,b)=>Math.min(...a.L.map(x=>x[1]))-Math.min(...b.L.map(x=>x[1]))).slice(0,15);
 return`<h3>${th?'ประวัติ Request Hour':'Request Hour history'}</h3>`+H.map(h=>`<details class="c rhh"><summary><b>${h.year}</b> · ${esc(h.name)} · ${th?'อันดับ 1':'No. 1'}: <b>${esc(h.win?h.win.title:'—')}</b></summary><p class="st">${h.groups.map(g=>esc(g.name)).join(' + ')} · ${h.cats.map(rhCatName).join(' + ')} · Best ${h.size} · ${h.tv.toLocaleString()} ${th?'โหวต':'votes'}${h.single?` · ${th?'ซิงเกิล':'single'} “${esc(h.single.title)}”`:''}${h.perfs.length?` · ${h.perfs.length} ${th?'รอบที่แสดงแล้ว':'performance(s) held'}`:''}</p>
 <ol class="rhtop">${h.rank.map(z=>`<li value="${z.r}"><b>${esc(z.title)}</b> <small>${z.v.toLocaleString()} ${rhChg(z)}${h.lineups[z.key]?` · ${th?'ผู้แสดง':'performed by'} ${h.lineups[z.key].slice(0,6).map(id=>esc(rhNm(id))).join(', ')}${h.lineups[z.key].length>6?'…':''}`:''}</small></li>`).join('')}</ol></details>`).join('')+
 (multi.length?`<div class="c"><h4>${th?'เพลงที่ติดอันดับหลายปี':'Songs ranked in several years'}</h4>${multi.map(s=>`<div class="row"><b>${esc(s.t)}</b><span class="st">${s.L.sort((a,b)=>a[0]-b[0]).map(([y,r])=>`${y}: #${r}`).join(' · ')}</span></div>`).join('')}</div>`:'')}
// Single Production: show which Request Hour the single belongs to
{const f=V.music;if(f)V.music=function(){let h=f.apply(this,arguments);try{const p=S.pj,E=p&&p.rh?rhGet(p.rh):null;if(E)h=`<div class="c rhbanner">🎤 <b>${rhT('Request Hour single','ซิงเกิล Request Hour')}</b> · ${esc(E.name)} · ${rhT('every CD sold during the voting month (from release day) carries one voting code.','ซีดีที่ขายในเดือนโหวต (นับจากวันวางจำหน่าย) มีรหัสโหวต 1 รหัสต่อแผ่น')}</div>`+h}catch(e){console.error(e)}return h}}
