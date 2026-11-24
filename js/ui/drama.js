// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Drama Studio (Drama & Series Production)
// -------------------------------------------------------------------------------------
//  A secondary business: the agency produces TV Dramas, Original Series, Special Dramas and GL Series
//  starring its members. It uses the existing systems only:
//   · money: spend()/earn() (company ledger) — installments at each stage, distribution at release;
//   · time: S.day — Pre-production → Filming → Post-production → Ready → release (weekly episodes,
//     full season or a screening run) → results;
//   · members: casting from active members; filming tires the cast (energy / wellness) but never
//     blocks idol work; an unavailable lead (health, leave — xeOk) slows filming;
//   · fans: new viewers become NEW CASUAL fans in S.fb.segs (unique Fan IDs, one Kami Oshi each),
//     tagged src='drama'. A share of them only follows acting (ao=1, stays Casual). The others can
//     become Idol fans gradually through idol activities (existing promotions + a monthly conversion
//     that depends on member popularity, the fans' engagement and recent idol exposure);
//   · pairings: a GL Series feeds the fan-driven Pairing system (pairing.js) — no official pairs;
//   · career: m.act = {xp, ap, works[]} — acting history next to (not instead of) idol popularity.
//  Data: S.drama = {v, seq, list:[production], draft, conv:{mid:n}}
// =====================================================================================
const DR_TYPES={tv:{n:'TV Drama',ic:'📺',d:'A serialized drama made for broadcast television — the widest audience and the biggest budgets.',eps:[6,12,10],dur:[45,60,54],plat:['tv','stream'],mult:1},
 orig:{n:'Original Series',d:'A series made for streaming audiences, with flexible episode lengths and bolder concepts.',ic:'🎞️',eps:[4,10,8],dur:[20,50,40],plat:['stream','tv'],mult:.9},
 sp:{n:'Special Drama',d:'A one-off feature-length special or a short mini-drama — ideal for screenings or holiday broadcasts.',ic:'🎬',eps:[1,3,1],dur:[60,130,95],plat:['screen','tv','stream'],mult:1.1},
 gl:{n:'GL Series',d:'A Girls\' Love series built around exactly two leading members. Their chemistry carries the story — existing fan pairings bring their own audience.',ic:'💞',eps:[6,12,8],dur:[25,45,35],plat:['stream','tv','screen'],mult:.95}};
const DR_GEN={Romance:{a:1.1,loc:['garden',1,'e'],c:['#ff7eb6','#5a2a4a'],cn:['First love','Office romance','Childhood friends','Second chance','Forbidden love','Contract relationship']},
 Mystery:{a:.95,loc:['corridor',0,'e'],c:['#7aa0e0','#1e2440'],cn:['Locked-room mystery','Missing classmate','Detective duo','Hidden diary','Small-town secret']},
 Horror:{a:.82,loc:['corridor',2,'e'],c:['#c04050','#0e0a14'],cn:['Haunted school','Cursed video','Urban legend','Night shift','Abandoned dorm']},
 Youth:{a:1.02,loc:['school',0,'m'],c:['#5ab0e8','#24406a'],cn:['School club dreams','Graduation summer','Band of friends','Sports team','Exam year']},
 Family:{a:.86,loc:['park',2,'a'],c:['#ffb86b','#5a3a24'],cn:['Sisters reunited','Family restaurant','Single parent','Inheritance','Coming home']},
 Crime:{a:.9,loc:['street',0,'e'],c:['#ffd23a','#141420'],cn:['Undercover idol','Heist','Courtroom','Police rookies','Revenge']},
 Fantasy:{a:.96,loc:['garden',2,'e'],c:['#b08cff','#22184a'],cn:['Time slip','Magical girl','Parallel world','Fairy-tale remake','Body swap']},
 Comedy:{a:1,loc:['shopping',1,'m'],c:['#ffcf4a','#5a3a1a'],cn:['Workplace comedy','Sitcom family','Idol parody','Mistaken identity','Road trip']},
 Drama:{a:.9,loc:['rooftop',0,'e'],c:['#e0a070','#2a1a2a'],cn:['Rise to the top','Rivals','Hospital drama','Second life','Dream chaser']}};
const DR_BUD={low:{n:'Low Budget',rate:250000,q:.55,d:'Cheap and fast. Lower quality, smaller loss if it fails.'},std:{n:'Standard',rate:600000,q:.72,d:'Solid production values for a normal release.'},high:{n:'High Budget',rate:1250000,q:.88,d:'Top crew and sets. Better reception — and a bigger loss if nobody watches.'}};
const DR_PLAT={tv:{n:'TV Broadcasting',risk:'Very high risk',d:'Very high broadcasting costs. Audience ratings drive the money. Can bring a huge number of New Fans — or a big loss.',slot:25000000,promo:30000000},
 stream:{n:'Streaming Platform',risk:'Moderate risk',d:'Medium-to-high costs. The platform pays a license fee plus a bonus by views. Weekly episodes or the full season at once.',fee:40000000,mk:4000000},
 screen:{n:'Special Screening',risk:'Depends on attendance',d:'Moderate screening costs. Ticket sales decide the result; good for specials and limited productions.',venue:6000000,days:14,cap:3600,price:2000}};
const DR_ROLE={lead:['Main Lead',.4],second:['Second Lead',.22],sup:['Supporting Cast',.1],guest:['Guest Role',.04]},DR_LIM={lead:[1,2],second:[0,2],sup:[0,8],guest:[0,4]};
const DR_STG={plan:'Planning',pre:'Pre-production',film:'Filming',post:'Post-production',ready:'Ready to Release',air:'On Air',done:'Released'};
function drS(){if(!S)return null;if(!S.drama||typeof S.drama!='object')S.drama={v:1,seq:0,list:[],draft:null,conv:{}};const D=S.drama;D.list=Array.isArray(D.list)?D.list:[];D.conv=D.conv||{};return D}
const drGet=id=>(drS().list||[]).find(p=>p.id==id)||null;
const drT=(en,th)=>typeof i18nLang=='function'&&i18nLang()=='th'?th:en;
const drM=id=>get(id)||(S.alumni||[]).find(m=>m.id==id)||null;
const drNm=m=>m?(m.stage||m.name):'?';
// ---- acting ---------------------------------------------------------------------------------------------------------------
function drAct(m){if(!m.act||typeof m.act!='object')m.act={xp:0,ap:0,works:[]};m.act.works=m.act.works||[];return m.act}
function drAbility(m){if(!m)return 0;const v=+(m.variety||0),A=m.act||{},T=m.traits||[],P={Elegant:4,Cool:3,Serious:5,Shy:-2,Genki:2,Airhead:-1}[m.pers]||0;
 return Math.round(Math.max(5,Math.min(100,18+v/1000*42+P+(T.includes('Expressive')?5:0)+Math.min(32,Math.sqrt(A.xp||0)*2.6))))}
// ---- costs & schedule ------------------------------------------------------------------------------------------------------
function drProdCost(p){const T=DR_TYPES[p.type]||DR_TYPES.tv,B=DR_BUD[p.budget]||DR_BUD.std;return Math.round(p.eps*p.dur*B.rate*T.mult/100000)*100000}
function drDistCost(p){const P=DR_PLAT[p.plat];if(!P)return 0;if(p.plat=='tv')return P.slot*p.eps*(p.dur/54)+P.promo;if(p.plat=='stream')return P.fee+P.mk*p.eps;return P.venue*P.days}
function drDays(p){const film=Math.max(5,Math.ceil(p.eps*p.dur/60*4.5)),pre=p.type=='sp'?10:12+Math.min(12,p.eps),post=12+Math.ceil(p.eps*1.5);return{pre,film,post,total:pre+film+post}}
function drAirLen(p){return p.plat=='screen'?DR_PLAT.screen.days:p.plat=='stream'&&p.fmt=='full'?28:p.eps*7}
// ---- cast & interest -------------------------------------------------------------------------------------------------------
const drCast=(p,r)=>(p.cast||[]).filter(c=>!r||c.role==r);
function drLeads(p){return drCast(p,'lead').map(c=>c.mid)}
function drPair(p){if(p.type!='gl')return null;const L=drLeads(p);if(L.length!=2)return null;return typeof prGet=='function'?prGet(L[0],L[1]):null}
function drInterest(p){let ci=0,wt=0;(p.cast||[]).forEach(c=>{const m=drM(c.mid);if(!m)return;const w=(DR_ROLE[c.role]||DR_ROLE.sup)[1];wt+=w;ci+=w*Math.min(1,(m.pop||0)/100*.5+Math.log10(1+(m.fans||0))/6*.4+((m.act&&m.act.ap)||0)/400)});ci=wt?ci/wt:0;
 const n=(p.cast||[]).length;let i=.08+.6*ci*(DR_GEN[p.genre]||DR_GEN.Drama).a+Math.min(.08,n*.012);const P=drPair(p);if(p.type=='gl')i+=.04;if(P)i+=P.pop/100*.14+Math.log10(1+(P.pf||0))/45+P.tr/700;if(p.song)i+=.03;return Math.max(.08,Math.min(1.2,i))}
function drQuality(p){const B=DR_BUD[p.budget]||DR_BUD.std;let ab=0,w=0;(p.cast||[]).forEach(c=>{const m=drM(c.mid),x=(DR_ROLE[c.role]||DR_ROLE.sup)[1];if(m){ab+=drAbility(m)*x;w+=x}});ab=w?ab/w/100:.3;
 let q=B.q*.48+ab*.37+(String(p.syn||'').length>40?.04:0)+(p.concept?.03:0);if(p.type=='gl'){const L=drLeads(p);if(L.length==2){const P=drPair(p),bd=(typeof prBond=='function'?prBond(L[0],L[1]):null);q+=((P?P.chem:bd!=null?bd*.8:30)/100)*.1}}return Math.max(.1,Math.min(1,q))}
// ---- create / draft ---------------------------------------------------------------------------------------------------------
function drDraft(){const D=drS();if(!D.draft)D.draft={type:null,title:'',syn:'',genre:'Romance',concept:'',eps:10,dur:54,cast:[],budget:'std',plat:'tv',fmt:'weekly',rel:null,song:null};return D.draft}
function drNew(){drS().draft=null;drDraft();ui.drs=1;goView('drnew')}
function drSet(k,v){const d=drDraft();if(k=='type'){d.type=v;const T=DR_TYPES[v];d.eps=T.eps[2];d.dur=T.dur[2];if(!T.plat.includes(d.plat))d.plat=T.plat[0];if(v=='gl')d.cast=d.cast.filter(c=>c.role!='lead').concat(drCast(d,'lead').slice(0,2))}
 else if(k=='eps'||k=='dur'){const T=DR_TYPES[d.type]||DR_TYPES.tv,r=k=='eps'?T.eps:T.dur;d[k]=Math.max(r[0],Math.min(r[1],Math.round(+v||r[2])))}else d[k]=v;render()}
function drRole(mid){const d=drDraft(),r=ui.drRole||'lead',i=d.cast.findIndex(c=>c.mid==mid);if(i>=0){const was=d.cast[i].role;d.cast.splice(i,1);if(was==r)return render()}
 const lim=d.type=='gl'&&r=='lead'?[2,2]:DR_LIM[r];if(drCast(d,r).length>=lim[1])return toast(drT(`${DR_ROLE[r][0]}: at most ${lim[1]}.`,`${DR_ROLE[r][0]} ได้สูงสุด ${lim[1]} คน`),'err');d.cast.push({mid,role:r});render()}
function drErrs(d,step){const E=[];if(!d.type)E.push('Choose a production type.');if(step>=2){if(!String(d.title).trim())E.push('Give the drama a title.')}
 if(step>=3){const L=drCast(d,'lead').length;if(d.type=='gl'&&L!=2)E.push('A GL Series needs exactly two Main Leads (the GL couple).');else if(L<1)E.push('Cast at least one Main Lead.');
  Object.entries(DR_LIM).forEach(([r,[a,b]])=>{const n=drCast(d,r).length;if(r!='lead'&&n>b)E.push(`${DR_ROLE[r][0]}: at most ${b}.`)});if(d.cast.some(c=>!isAct(get(c.mid)||{})))E.push('A cast member is no longer active.')}
 if(step>=4){const T=DR_TYPES[d.type];if(T&&!T.plat.includes(d.plat))E.push('This platform is not available for this production type.');const dd=drDays(d);if(d.rel!=null&&d.rel<S.day+dd.total)E.push('The release date is before the expected completion date.')}return E}
function drStart(){const d=drDraft(),E=drErrs(d,4);if(E.length)return toast(E[0],'err');const cost=drProdCost(d),first=Math.round(cost*.3);if(!spend(first,`Drama production (pre-production): ${d.title}`))return;
 const D=drS(),dd=drDays(d),p={...JSON.parse(JSON.stringify(d)),id:'DR'+(++D.seq),gid:typeof gsAg=='function'?gsAg():null,created:S.day,status:'pre',stDay:S.day,pg:0,dd,cost,dist:Math.round(drDistCost(d)),paid:first,earned:0,
  rel:d.rel!=null?d.rel:S.day+dd.total,eta:S.day+dd.total,v:1,log:[{d:S.day,t:'Production started'}],air:null,res:null};
 p.interest0=+drInterest(p).toFixed(3);D.list.unshift(p);D.draft=null;ui.drd=p.id;toast(drT(`“${p.title}” is in pre-production!`,`“${p.title}” เข้าสู่ขั้นเตรียมการผลิตแล้ว!`));
 try{if(typeof nwPublish=='function'){const L=drLeads(p).map(drM).filter(Boolean).map(drNm).join(' & ');nwPublish({cat:'event',type:'drama-ann',src:'company',sent:'pos',att:30+Math.round(p.interest0*25),imp:2,refs:{mids:drLeads(p)},img:{k:'edit',th:'event'},
  en:{h:`${DR_TYPES[p.type].n} “${p.title}” announced`,b:`${L} will star in the new ${p.genre.toLowerCase()} ${DR_TYPES[p.type].n.toLowerCase()} “${p.title}”, planned for ${DR_PLAT[p.plat].n}.`},th:{h:`ประกาศ${p.type=='gl'?'ซีรีส์ GL':'ละคร'} “${p.title}”`,b:`${L} จะนำแสดงใน “${p.title}” แนว${p.genre} ทาง${DR_PLAT[p.plat].n}`}})}}catch(e){}
 goView('drdet')}
function drCancel(id){const p=drGet(id);if(!p||!['pre','film','post','ready'].includes(p.status))return;ask(drT('Cancel this production? Money already spent is not returned.','ยกเลิกการผลิตนี้? เงินที่จ่ายไปแล้วจะไม่ได้คืน'),()=>{p.status='cancelled';p.log.push({d:S.day,t:'Production cancelled'});toast(drT('Production cancelled.','ยกเลิกการผลิตแล้ว'));render()},drT('Cancel production','ยกเลิกการผลิต'))}
function drSetRel(id,v){const p=drGet(id);if(!p||!['pre','film','post','ready'].includes(p.status))return;const t=new Date(v+'T00:00:00');if(isNaN(t))return;const d=dateDay(t);if(d<Math.max(S.day,p.eta))return toast(drT('Choose a date after the expected completion.','เลือกวันหลังวันที่คาดว่าจะเสร็จ'),'err');p.rel=d;render()}
// ---- daily simulation --------------------------------------------------------------------------------------------------------
function drPay(p,share,label){const a=Math.round(p.cost*share);if(a<=0)return true;if(!spend(a,`Drama production (${label}): ${p.title}`)){p.hold=label;return false}p.paid+=a;p.hold=null;return true}
function drDaily(){const D=drS();if(!D)return;D.list.forEach(p=>{try{drStep(p)}catch(e){console.error('drama',p.id,e)}});if(dt().getDate()==1)drConvert()}
function drStep(p){if(p.status=='cancelled'||p.status=='done'||p.status=='plan')return;
 if(p.hold){if(p.hold=='filming'&&!drPay(p,.5,'filming'))return;if(p.hold=='post-production'&&!drPay(p,.2,'post-production'))return;if(p.hold=='release'){if(!drRelease(p))return}}
 const days={pre:p.dd.pre,film:p.dd.film,post:p.dd.post}[p.status];
 if(days){let f=1;const L=drLeads(p).map(get);if(p.status=='film'){const away=L.filter(m=>!(typeof xeOk=='function'?xeOk(m):isAct(m||{}))).length;if(away)f=away>=L.length?.2:.55;
   (p.cast||[]).forEach(c=>{const m=get(c.mid);if(!m||!isAct(m))return;const lead=c.role=='lead'||c.role=='second';m.en=Math.max(-100,(+m.en||0)-(lead?7:3));if(lead&&S.day%3==0&&typeof wlAdj=='function')wlAdj(m,{load:2},'Drama filming')})}
  p.pg=Math.min(1,p.pg+f/days);const late=Math.round((1-p.pg)*days/Math.max(.2,f));p.eta=Math.max(p.eta,S.day+late+(p.status=='pre'?p.dd.film+p.dd.post:p.status=='film'?p.dd.post:0));
  if(p.pg>=1){const nx={pre:'film',film:'post',post:'ready'}[p.status];p.status=nx;p.pg=0;p.stDay=S.day;p.log.push({d:S.day,t:DR_STG[nx]+' started'});
   if(nx=='film')drPay(p,.5,'filming');if(nx=='post')drPay(p,.2,'post-production');if(nx=='ready'){p.eta=S.day;p.log.push({d:S.day,t:'Ready to release'});toast(drT(`“${p.title}” is ready to release!`,`“${p.title}” พร้อมออกฉายแล้ว!`))}}}
 if(p.status=='ready'&&S.day>=p.rel)drRelease(p);if(p.status=='air')drAirDay(p)}
function drRelease(p){const cost=Math.round(p.dist);if(!spend(cost,`Drama distribution (${DR_PLAT[p.plat].n}): ${p.title}`)){p.hold='release';if(!p.hw){p.hw=1;toast(drT(`Not enough money to release “${p.title}”. It waits until the agency can pay.`,`เงินไม่พอสำหรับปล่อย “${p.title}” จะรอจนกว่าจะจ่ายได้`),'err')}return false}
 p.hold=null;p.paid+=cost;p.status='air';p.relDay=S.day;p.interest=+drInterest(p).toFixed(3);p.q=+drQuality(p).toFixed(3);const r=mulb((p.id.length*977+S.day*31+p.cast.length)|0);p.rec=Math.max(.05,Math.min(1,p.q*.78+(r()-.5)*.36+.06));
 p.air={start:S.day,n:0,eps:[],rev:0,view:0,last:null};p.log.push({d:S.day,t:`Released on ${DR_PLAT[p.plat].n}`});
 try{if(typeof nwPublish=='function')nwPublish({cat:'event',type:'drama-rel',src:'company',sent:'pos',att:35+Math.round(p.interest*30),imp:3,refs:{mids:drLeads(p)},img:{k:'edit',th:'event'},
  en:{h:`“${p.title}” premieres today`,b:`The ${DR_TYPES[p.type].n.toLowerCase()} starring ${drLeads(p).map(drM).map(drNm).join(' & ')} starts on ${DR_PLAT[p.plat].n}.`},th:{h:`“${p.title}” ออกฉายวันนี้`,b:`${drLeads(p).map(drM).map(drNm).join(' และ ')} นำแสดง เริ่มฉายทาง${DR_PLAT[p.plat].n}`}})}catch(e){}return true}
// one airing step: TV / weekly streaming = one episode a week; full season = four weekly windows; screening = daily
function drAirDay(p){const A=p.air,k=S.day-A.start,I=p.interest,R=p.rec,r=mulb((p.id.length*131+S.day*7)|0);
 if(p.plat=='screen'){if(k>=DR_PLAT.screen.days)return drFinish(p);const P=DR_PLAT.screen,fill=Math.min(1,(.18+.75*I*(.45+R))*(k<3?1.15:1)*Math.pow(.97+R*.04,k)*(.85+r()*.3)),n=Math.round(P.cap*fill);
  const rev=n*(P.price+600);earn(rev,`Screening tickets & goods: ${p.title}`);A.eps.push({d:S.day,v:n,f:+(fill*100).toFixed(1)});A.rev+=rev;A.view+=n;p.earned+=rev;return}
 if(k%7)return;const full=p.plat=='stream'&&p.fmt=='full',N=full?4:p.eps;if(A.n>=N)return drFinish(p);const i=A.n,pos=N>1?i/(N-1):1;
 const wom=1+(R-.5)*.8*pos,fin=i==N-1?1.12:1,prem=i==0?1.08:1,noise=.88+r()*.24;
 if(p.plat=='tv'){const rating=Math.max(1,(2+14*Math.pow(I,1.1)*Math.pow(R,1.3))*wom*fin*prem*noise),view=Math.round(rating/100*45000000),rev=Math.round(rating*11000000*(p.dur/54)+5000000);
  earn(rev,`TV ads & sponsors (ep ${i+1}): ${p.title}`);A.eps.push({d:S.day,ep:i+1,r:+rating.toFixed(1),v:view,rev});A.rev+=rev;A.view=Math.max(A.view,view);p.earned+=rev}
 else{const base=620000*I*(.5+R)*(p.type=='gl'?1.12:1),share=full?[.42,.26,.18,.14][i]*Math.max(1,p.eps/4):1,v=Math.round(base*share*wom*noise*(full?1:.55+.45*Math.exp(-i/8))),fee=i==0?Math.round(p.cost*(.32+.28*Math.min(1,I))):0,rev=fee+Math.round(v*42);
  earn(rev,`${i==0?'Streaming license & ':'Streaming '}views: ${p.title}`);A.eps.push({d:S.day,ep:full?null:i+1,wk:full?i+1:null,v,rev,r:+(5+5*R*wom*noise).toFixed(1)});A.rev+=rev;A.view+=v;p.earned+=rev}
 A.n++;(p.cast||[]).forEach(c=>{const m=get(c.mid);if(m&&isAct(m)&&(c.role=='lead'||c.role=='second'))m.buzz=cl((m.buzz||0)+Math.round(2+6*I*R))});
 if(p.type=='gl'){const L=drLeads(p);if(L.length==2&&typeof prSpark=='function')prSpark(L[0],L[1],'gl',.25+.5*R,`GL Series “${p.title}”`)}
 if(A.n>=N)drFinish(p)}
function drGrade(x){return x>=.82?'S':x>=.68?'A':x>=.52?'B':x>=.36?'C':'D'}
function drFinish(p){if(p.status=='done')return;const A=p.air,I=p.interest,R=p.rec,cost=p.paid,rev=p.earned,profit=rev-cost;
 let aud=0,rating=0,score=0;if(p.plat=='tv'){aud=Math.round(Math.max(...A.eps.map(e=>e.v))*1.4);rating=+(A.eps.reduce((a,e)=>a+e.r,0)/Math.max(1,A.eps.length)).toFixed(1);score=+(4.5+5*R).toFixed(1)}
 else if(p.plat=='stream'){aud=Math.round(A.view*.55);score=+(A.eps.reduce((a,e)=>a+e.r,0)/Math.max(1,A.eps.length)).toFixed(1)}else{aud=A.view;score=+(4.8+5*R).toFixed(1)}
 const succ=Math.max(0,Math.min(1,I*.45+R*.55)),pop=Math.round(100*succ),buzz=Math.round(Math.min(100,30*Math.log10(1+aud/20000)+25*R));
 const conv=p.plat=='screen'?.03+.08*R*R:p.plat=='tv'?.004+.02*R*R:.003+.015*R*R,F=S.fans||0,dim=typeof fdDim=='function'?fdDim(F):1/Math.pow(1+F/150000,.6),nf=Math.round(aud*conv*dim);
 p.res={aud,rating,score,pop,buzz,rev,cost,profit,nf,grade:drGrade(succ),succ:+succ.toFixed(3),day:S.day};p.status='done';p.log.push({d:S.day,t:`Finished · grade ${p.res.grade}`});
 try{drFans(p,nf)}catch(e){console.error(e)}try{drCareer(p)}catch(e){console.error(e)}try{drPairFx(p)}catch(e){console.error(e)}
 if(p.song){try{const o=S.songs[p.song];if(o){o.ost=[...new Set([...(o.ost||[]),p.id])];if(typeof fbAcquire=='function'&&succ>.4)fbAcquire(Math.round(nf*.08),{org:`Drama theme song: ${o.title}`})}}catch(e){}}
 try{if(typeof nwPublish=='function')nwPublish({cat:'event',type:'drama-res',src:'game',sent:profit>=0&&succ>=.45?'pos':succ<.3?'neg':'neu',att:30+Math.round(buzz/2),imp:succ>=.68?3:2,refs:{mids:drLeads(p)},img:{k:'edit',th:'event'},
  en:{h:`“${p.title}” ends — ${succ>=.68?'a hit':succ>=.45?'a solid run':'a quiet finish'}`,b:`Audience: ${aud.toLocaleString()}${p.plat=='tv'?` · average rating ${rating}%`:''} · ${nf.toLocaleString()} new fans. ${profit>=0?'It made a profit.':'It lost money.'}`},
  th:{h:`“${p.title}” จบแล้ว — ${succ>=.68?'ประสบความสำเร็จ':succ>=.45?'ทำได้ดี':'จบแบบเงียบ ๆ'}`,b:`ผู้ชม ${aud.toLocaleString()} คน${p.plat=='tv'?` · เรตติ้งเฉลี่ย ${rating}%`:''} · แฟนใหม่ ${nf.toLocaleString()} คน ${profit>=0?'มีกำไร':'ขาดทุน'}`}})}catch(e){}
 toast(drT(`“${p.title}” finished its run — grade ${p.res.grade}.`,`“${p.title}” ฉายจบแล้ว — เกรด ${p.res.grade}`))}
// ---- fans: new Casual fans (unique), some only follow acting ------------------------------------------------------------------
function drFans(p,N){if(!(N>0)||!S.fb||!Array.isArray(S.fb.segs)||typeof fbNew!='function')return;const W=(p.cast||[]).map(c=>{const m=get(c.mid);return m&&isAct(m)?[m,(DR_ROLE[c.role]||DR_ROLE.sup)[1]*(.6+(m.pop||0)/150)]:null}).filter(Boolean);
 const T=W.reduce((a,x)=>a+x[1],0);if(!T)return;const L=drLeads(p),gl=p.type=='gl'&&L.length==2,key=gl&&typeof prKey=='function'?prKey(L[0],L[1]):null;p.res.fanBy={};
 W.forEach(([m,w])=>{let n=Math.round(N*w/T);if(n<=0)return;p.res.fanBy[m.id]=n;const g=typeof gsGid=='function'?gsGid(m):m.group,ao=Math.round(n*(.42-.15*(p.res.succ||0))),pair=gl&&L.includes(m.id)?Math.round(n*.3):0,rest=n-ao-pair;
  const mk=(k,extra)=>{if(k<=0)return null;const s=fbNew({n:k,ft:'casual',k:m.id,org:`Drama: ${p.title}`,loy:20+Math.round(10*(p.res.succ||0)),eng:42,sp:25});s.gs=g;s.src='drama';s.dr=p.id;Object.assign(s,extra||{});return s};
  mk(ao,{ao:1});mk(rest);if(pair){const o=L.find(x=>x!=m.id);const s=mk(pair,{pr:key});if(s){s.o=s.o||{};s.o[o]=s.n}}});
 // viewers who were already fans become more engaged instead of being counted again
 S.fb.segs.forEach(s=>{if(s.src=='drama'||s.ft=='dormant')return;if(W.some(([m])=>s.k==m.id))s.eng=Math.min(100,(s.eng||50)+3*(p.res.succ||0))});
 try{if(typeof fdFixAll=='function'){fdFixAll();fdWrite()}}catch(e){console.error(e)}}
// keep the drama tags when fan cohorts are split or merged; acting-only fans stay Casual
{const f=fbSplit;fbSplit=function(s,n){const t=f.apply(this,arguments);try{if(t&&s){['src','dr','ao','pr','gs'].forEach(k=>{if(s[k]!=null&&t[k]==null)t[k]=s[k]})}}catch(e){}return t}}
{const f=fbMerge;fbMerge=function(){const L=(S.fb&&S.fb.segs)||[],tag=[];L.forEach(s=>{if(s.src=='drama'||s.pr){tag.push([s,s.gs]);s.gs=`${s.gs}#d${s.ao?1:0}${s.pr||''}`}});try{return f.apply(this,arguments)}finally{tag.forEach(([s,g])=>{s.gs=g});(S.fb.segs||[]).forEach(s=>{if(typeof s.gs=='string'&&s.gs.includes('#d')){const g=s.gs.split('#d')[0];s.gs=g===''||g=='undefined'||g=='null'?null:(isNaN(+g)?g:+g)}})}}}
{const f=fdFixSeg;fdFixSeg=function(s){if(s&&s.ao&&s.ft!='casual'&&s.ft!='dormant')s.ft='casual';return f.apply(this,arguments)}}
// monthly: some drama fans discover the idol side (depends on popularity, engagement and recent idol exposure)
function drExposure(m){let x=0;try{const g=typeof gsGid=='function'?gsGid(m):m.group;gsWith(g,()=>{const H=S.th;const n=((H&&H.pf)||[]).filter(r=>S.day-r.day<=30&&(r.mem||[]).includes(m.id)).length;x+=Math.min(.45,n*.06);
  if((S.singles||[]).some(s=>s.relDay!=null&&S.day-s.relDay<=45&&((S.songs[s.mainId]||{}).slots||[]).includes(m.id)))x+=.3})}catch(e){}x+=Math.min(.25,(m.buzz||0)/300);return Math.min(1,x)}
function drConvert(){const D=drS(),L=((S.fb&&S.fb.segs)||[]).filter(s=>s.src=='drama'&&!s.ao&&s.ft=='casual'&&s.n>0);let tot=0;
 L.forEach(s=>{const m=get(s.k);if(!m||!isAct(m))return;const rate=(.012+.05*drExposure(m)+.02*(m.pop||0)/100)*((s.eng||40)/60),c=Math.round(s.n*rate);if(c<=0)return;const t=fbSplit(s,c);if(t&&t.n){t.ft='oshi';t.org=`Idol fan (from drama)`;D.conv[m.id]=(D.conv[m.id]||0)+t.n;tot+=t.n;const p=drGet(s.dr);if(p&&p.res)p.res.conv=(p.res.conv||0)+t.n}});
 if(tot){try{fdFixAll();fdWrite()}catch(e){}D.lastConv={d:S.day,n:tot}}}
// ---- career & pairing --------------------------------------------------------------------------------------------------------
function drCareer(p){(p.cast||[]).forEach(c=>{const m=drM(c.mid);if(!m)return;const A=drAct(m),w=(DR_ROLE[c.role]||DR_ROLE.sup)[1];A.xp=Math.round((A.xp||0)+p.eps*p.dur/60*(4+w*20));A.ap=Math.round(Math.max(0,Math.min(100,(A.ap||0)*.85+p.res.pop*(.25+w))));
  A.works=A.works.filter(x=>x.id!=p.id);A.works.push({id:p.id,title:p.title,type:p.type,role:c.role,rel:p.relDay,grade:p.res.grade,aud:p.res.aud,rating:p.res.rating,score:p.res.score})})}
function drPairFx(p){if(p.type!='gl'||typeof prSpark!='function')return;const L=drLeads(p);if(L.length!=2)return;const s=p.res.succ,P=prGet(L[0],L[1]);
 if(P){P.pop=Math.max(0,Math.min(100,P.pop+24*s*s+2));P.tr=Math.min(100,P.tr+45*s+10);P.sb=Math.min(40,(P.sb||0)+20*s);P.gl=[...new Set([...(P.gl||[]),p.id])];prHist(P,'gl',`GL Series “${p.title}” — grade ${p.res.grade}`);prWork(P,'gl',`“${p.title}”`);P.last=S.day;prFans(P)}
 else{const Q=prSpark(L[0],L[1],'gl',.6+1.6*s,`GL Series “${p.title}”`);if(Q){Q.gl=[...new Set([...(Q.gl||[]),p.id])];prFans(Q)}}}
// ---- hooks -------------------------------------------------------------------------------------------------------------------
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{if(S&&S.drama)drDaily()}catch(e){console.error(e)}return r}}
// ---- poster art ----------------------------------------------------------------------------------------------------------------
function drPosterSvg(p,W=300,H=420){const G=DR_GEN[p.genre]||DR_GEN.Drama,u='dp'+p.id+'_'+(++PTC[0]),[lk,lv,lt]=p.type=='gl'?['garden',1,'e']:G.loc;let s='';
 try{s+=`<g transform="scale(${(W/512).toFixed(4)})">${CVLOC.svg(lk,lv,lt,u)}</g>`}catch(e){s+=`<rect width="${W}" height="${H}" fill="${G.c[1]}"/>`}
 s+=`<defs><linearGradient id="${u}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${G.c[1]}" stop-opacity=".15"/><stop offset=".55" stop-color="${G.c[1]}" stop-opacity=".25"/><stop offset="1" stop-color="${G.c[1]}" stop-opacity=".95"/></linearGradient><radialGradient id="${u}s"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#${u}v)"/><ellipse cx="${W/2}" cy="${H*.42}" rx="${W*.6}" ry="${H*.34}" fill="url(#${u}s)"/>`;
 const lead=drLeads(p).map(drM).filter(Boolean),sec=drCast(p,'second').map(c=>drM(c.mid)).filter(Boolean).slice(0,2),fg=(m,x,y,w,pose,ex)=>{const a=ap(m);return`<g transform="translate(${(x-w/2).toFixed(1)} ${y.toFixed(1)}) scale(${(w/100).toFixed(3)})">${fig(m,{pose,of:a.of,oh:a.oh,ac:a.ac,ex})}</g>`};
 sec.forEach((m,i)=>{s+=`<g opacity=".88">${fg(m,i?W*.84:W*.16,H*.2,W*.42,[2,9][i%2],[2,1][i%2])}</g>`});
 if(lead.length==2)s+=fg(lead[0],W*.36,H*.12,W*.62,p.type=='gl'?7:0,2)+fg(lead[1],W*.66,H*.13,W*.6,p.type=='gl'?8:4,p.type=='gl'?6:3);else if(lead[0])s+=fg(lead[0],W*.5,H*.08,W*.72,{Horror:7,Mystery:9,Comedy:2,Romance:14,Crime:5}[p.genre]||0,{Horror:4,Mystery:0,Comedy:3,Romance:2}[p.genre]??2);
 s+=`<rect y="${H*.66}" width="${W}" height="${H*.34}" fill="${G.c[1]}" opacity=".55"/>`;
 const t=String(p.title||'Untitled'),fs=Math.max(18,Math.min(38,W*1.1/Math.max(4,t.length)));s+=`<text x="${W/2}" y="${H*.8}" text-anchor="middle" font-family="'Dela Gothic One','Kanit',sans-serif" font-size="${fs.toFixed(1)}" fill="#fff" stroke="${G.c[1]}" stroke-width="4" paint-order="stroke" letter-spacing="1">${esc(t)}</text>`;
 s+=`<text x="${W/2}" y="${H*.86}" text-anchor="middle" font-family="Quicksand,sans-serif" font-size="11" font-weight="700" fill="${G.c[0]}" letter-spacing="2">${esc((p.concept||p.genre||'').toUpperCase().slice(0,34))}</text><text x="${W/2}" y="${H*.93}" text-anchor="middle" font-family="Quicksand,sans-serif" font-size="10" fill="#fff" opacity=".85">${esc(lead.map(drNm).join(' · '))}</text>`;
 const bw=Math.round(16+DR_TYPES[p.type].n.length*7);s+=`<rect x="10" y="10" width="${bw}" height="20" rx="4" fill="${G.c[0]}"/><text x="${10+bw/2}" y="24" text-anchor="middle" font-family="Quicksand,sans-serif" font-weight="800" font-size="10.5" fill="#fff">${esc(DR_TYPES[p.type].n.toUpperCase())}</text><text x="${W-10}" y="24" text-anchor="end" font-family="Quicksand,sans-serif" font-weight="800" font-size="10" fill="#fff" opacity=".9">${esc((DR_PLAT[p.plat]||{}).n||'')}</text>`;
 // film-strip edges
 s+=[0,W-9].map(x=>`<rect x="${x}" y="0" width="9" height="${H}" fill="#0c0a12" opacity=".75"/>${Array.from({length:Math.floor(H/18)},(_,i)=>`<rect x="${x+2}" y="${5+i*18}" width="5" height="9" rx="1.5" fill="#fff" opacity=".55"/>`).join('')}`).join('');
 return s}
function drPoster(p,cls){const v=[p.id,p.title,p.genre,p.type,p.plat,p.concept,(p.cast||[]).map(c=>c.mid+c.role).join(',')].join('|');return`<span class="drposter ${cls||''}">${cvImg('drp:'+v,()=>drPosterSvg(p),300,420)}</span>`}
