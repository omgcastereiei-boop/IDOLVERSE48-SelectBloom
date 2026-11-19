// =====================================================================================
//  IDOLVERSE48: Select Bloom!  —  Training & Skill Development (full replacement)
// -------------------------------------------------------------------------------------
//  Replaces the old Lesson Room (player-bought lessons, Potential, +1..3 per click).
//
//  · Three independent skills per member, 0–1000:  m.skl = {vo, da, va}  (Vocal, Dance, Variety)
//    This is the only stored copy. m.sing / m.dance / m.variety are read-only views of it on the
//    0–100 scale that every existing formula already uses (100·√(v/1000)), so all performance,
//    event and sales calculations read the same live skills without being rewritten.
//    Performance (m.cha) stays the Vocal/Dance average (ux6.js).
//  · Audition: rarity sets the starting skills (UR strongest overall) with an individual
//    specialization; no Potential. Rarity never affects growth or the cap.
//  · Growth: one function for every EXP source (skAdd). EXP per point = 1 + 3·(v/1000)²,
//    so progress slows as a skill rises but stays possible up to 1000.
//  · Members train on their own (trnDay): they decide whether, what, how hard, and with whom.
//    Group sessions can mix teams, groups and trainees; every participant gets her own EXP.
//  · Real work grants EXP to actual participants only, once per activity (skWork + done keys).
// =====================================================================================
const SK_KEYS=['sing','dance','variety'],SK_S={sing:'vo',dance:'da',variety:'va'},SK_MAX=1000;
const SK_N={sing:['Vocal','ร้องเพลง'],dance:['Dance','เต้น'],variety:['Variety','วาไรตี้']};
const skT=(en,th)=>typeof i18nLang=='function'&&i18nLang()=='th'?th:en;
const skNm=k=>skT(...(SK_N[k]||[k,k]));
const skClamp=v=>Math.max(0,Math.min(SK_MAX,+v||0));
const skCost=v=>1+3*Math.pow(v/SK_MAX,2);             // EXP needed for one point at level v

// ---- storage: m.skl is the only copy; sing/dance/variety are views --------------------------------
// Existing formulas were written for a 0–100 ability. They read the 0–1000 skill through a concave view
// (100·√(skill/1000)): a beginner's 150 counts like the old 39, 500 like 71 and 1000 like 100, so new
// recruits who start low still perform credibly and every formula keeps its own balance.
const skView=v=>Math.round(1000*Math.sqrt(skClamp(v)/SK_MAX))/10,skUnview=x=>skClamp(SK_MAX*Math.pow(Math.max(0,Math.min(100,+x||0))/100,2));
const SK_D={};SK_KEYS.forEach(k=>{const s=SK_S[k];SK_D[k]={get(){const o=this.skl;return o?skView(o[s]):0},set(v){if(!this.skl||typeof this.skl!='object')this.skl={vo:0,da:0,va:0};this.skl[s]=skUnview(v)},enumerable:true,configurable:true}});
function skDef(m){if(!m||typeof m!='object')return;
 if(!m.skl||typeof m.skl!='object'){const o={};SK_KEYS.forEach(k=>{const d=Object.getOwnPropertyDescriptor(m,k);const v=d&&'value' in d?+d.value:(d&&d.get?+m[k]:0);o[SK_S[k]]=skClamp((isFinite(v)?v:0)*10)});m.skl=o}   // old 0–100 values → 0–1000
 else SK_KEYS.forEach(k=>{const s=SK_S[k];m.skl[s]=skClamp(m.skl[s])});
 SK_KEYS.forEach(k=>{const d=Object.getOwnPropertyDescriptor(m,k);if(d&&d.get===SK_D[k].get)return;try{delete m[k];Object.defineProperty(m,k,SK_D[k])}catch(e){}});
 if('pot' in m)delete m.pot;                                        // no Potential
 if(m.gift&&!SK_KEYS.includes(m.gift))m.gift=null}
function skSync(){if(typeof S=='undefined'||!S)return;(S.members||[]).forEach(skDef);(S.alumni||[]).forEach(skDef);try{((ui.au&&ui.au.cands)||[]).forEach(skDef)}catch(e){}try{(S.aud&&S.aud.cands||[]).forEach(skDef)}catch(e){}}
const skV=(m,k)=>{if(!m)return 0;if(k=='cha')return Math.round((skV(m,'sing')+skV(m,'dance'))/2);const o=m.skl;return o?Math.floor(o[SK_S[k]]||0):Math.round((+m[k]||0)*10)};
// display helper for lists (0–1000)
function skShow(m,k){return skV(m,k)}

// ---- audition: rarity → starting skills with an individual specialization ---------------------------
const SK_RAR={UR:[230,340],SR:[170,262],R:[118,200],N:[62,148]};          // total of the three skills
function skGen(rar,R){R=R||Math.random;const [lo,hi]=SK_RAR[rar]||SK_RAR.N,tot=lo+(hi-lo)*R();
 const ord=[...SK_KEYS].sort(()=>R()-.5),x=R();let sh,type;
 if(x<.55){type='single';const a=.52+.18*R(),b=(1-a)*(.3+.4*R());sh=[a,b,1-a-b]}
 else if(x<.8){type='dual';const a=.36+.08*R(),b=.36+.08*R();sh=[a,b,Math.max(.08,1-a-b)]}
 else{type='bal';const a=.3+.08*R(),b=.3+.08*R();sh=[a,b,Math.max(.2,1-a-b)]}
 const o={};ord.forEach((k,i)=>o[SK_S[k]]=Math.max(8,Math.round(tot*sh[i])));
 let spec=type=='bal'?null:ord[0];
 if((rar=='N'||rar=='R')&&R()<.09){const k=ord[0];o[SK_S[k]]+=50+Math.round(R()*60);spec=k}      // a gifted newcomer
 SK_KEYS.forEach(k=>o[SK_S[k]]=skClamp(o[SK_S[k]]));return{o,spec}}
{const f=genStats;genStats=function(m,rar,R,keep){const r=f.apply(this,arguments);try{
  if(keep&&typeof keep.sing=='number'){m.skl={vo:skClamp(keep.sing*10),da:skClamp((keep.dance??m.dance)*10),va:skClamp((keep.variety??m.variety)*10)}}   // legacy regeneration keeps old skills
  else{const g=skGen(rar,R);m.skl=g.o;m.spec=g.spec}
  SK_KEYS.forEach(k=>{try{delete m[k]}catch(e){}});delete m.pot;m.gift=null;skDef(m)}catch(e){console.error(e)}return r}}

// ---- one growth calculation for every EXP source ---------------------------------------------------
function skAdd(m,k,exp){if(!m||!(exp>0)||!SK_S[k])return 0;skDef(m);const s=SK_S[k];let v=m.skl[s],e=exp;const v0=v;
 while(e>0&&v<SK_MAX){const c=skCost(v),step=Math.min(1,SK_MAX-v);if(e>=c*step){v+=step;e-=c*step}else{v+=e/c;e=0}}
 m.skl[s]=Math.round(skClamp(v)*1000)/1000;const T=trnOf(m);T.xp[k]=(T.xp[k]||0)+exp;return m.skl[s]-v0}

// ---- per-member training state: habit, preferences, motivation --------------------------------------
const TRN_P={Genki:{hab:.62,soc:.75,eff:.05,wk:.45,base:6},Cool:{hab:.6,soc:.4,eff:.04,wk:.55,base:3},Shy:{hab:.56,soc:.25,eff:0,wk:.6,base:0},Elegant:{hab:.58,soc:.5,eff:.03,wk:.5,base:2},Airhead:{hab:.46,soc:.65,eff:-.05,wk:.35,base:-4},Serious:{hab:.74,soc:.42,eff:.1,wk:.75,base:8}};
const trnHash=(id,n)=>{let h=(id*2654435761+n*97)>>>0;h^=h>>>15;h=Math.imul(h,2246822519)>>>0;h^=h>>>13;return(h%10000)/10000};
function trnOf(m){if(!m.trn||typeof m.trn!='object'){const P=TRN_P[m.pers]||TRN_P.Serious,id=m.id|0;
  const en={};SK_KEYS.forEach((k,i)=>en[k]=+(.25+.6*trnHash(id,i+3)).toFixed(2));if(m.spec&&en[m.spec]!=null)en[m.spec]=+Math.min(1,en[m.spec]+.3).toFixed(2);
  m.trn={hab:+(P.hab*(.8+.4*trnHash(id,1))).toFixed(2),soc:+(P.soc*(.75+.5*trnHash(id,2))).toFixed(2),en,mot:Math.round(40+(m.pas||50)*.3),amb:{},why:null,days:[],last:null,xp:{}}}
 const T=m.trn;T.en=T.en||{};T.amb=T.amb||{};T.days=Array.isArray(T.days)?T.days:[];T.xp=T.xp||{};if(typeof T.mot!='number'||!isFinite(T.mot))T.mot=50;return T}
const trnBase=m=>{const P=TRN_P[m.pers]||TRN_P.Serious;return 28+(m.pas||50)*.45+P.base};
function trnMot(m,d,why,k,amb){const T=trnOf(m);T.mot=Math.max(0,Math.min(100,T.mot+d));if(why)T.why={t:why,d:S.day,up:d>=0};if(k&&SK_S[k])T.amb[k]=Math.min(1.5,(T.amb[k]||0)+(amb||.5))}
const trnRecent=m=>trnOf(m).days.filter(d=>S.day-d<=30).length;

// ---- availability: never overlap an existing activity ----------------------------------------------
function trnBusy(m,day){try{if(typeof gsCommits=='function'&&gsCommits(m.id,day,day).length)return true}catch(e){}
 // activities already finished today (they no longer show as upcoming commitments)
 try{const H=thS();if((H.pf||[]).some(p=>p.day==day&&((p.mem||[]).includes(m.id)||(H.snap[p.snap]||[]).some(z=>z.k=='mc'&&(z.mem||[]).includes(m.id)))))return true}catch(e){}
 try{if(typeof gsSched=='function'&&gsSched().res.some(r=>r.mid==m.id&&r.day==day&&(r.st=='ok'||r.st=='done')))return true}catch(e){}
 try{if(S.groups.some(g=>(gsCtx(g.id,'cal')||[]).some(ev=>Array.isArray(ev.members)&&ev.members.includes(m.id)&&evDays(ev).includes(day))))return true}catch(e){}
 try{const p=S.pj;if(p&&p.status=='producing'&&p.startDay!=null){const e=day-p.startDay-1;if(e>=7&&e<=13&&usedSongs(p).some(i=>(S.songs[i].slots||[]).includes(m.id)))return true}}catch(e){}
 try{if(typeof ccS=='function'&&ccS().list.some(C=>C.status=='live'&&(C.parts||[]).includes(m.id)&&C.pf.some(p=>ccPfDay(C,p)==day)))return true}catch(e){}
 return false}
function trnCan(m,day){if(!S.members.includes(m)||!['active','trainee'].includes(m.status||'active'))return'';const w=typeof wlOf=='function'?wlOf(m):{};
 if(w.leave)return'leave';if(w.off==day)return'rest';if(trnBusy(m,day))return'busy';if((m.en|0)<18)return'tired';return'ok'}

// ---- choosing what to practise ------------------------------------------------------------------------
function trnWant(m){const T=trnOf(m),P=TRN_P[m.pers]||TRN_P.Serious,v={};SK_KEYS.forEach(k=>v[k]=skV(m,k));const top=Math.max(...Object.values(v),1),w=typeof wlOf=='function'?wlOf(m):{ph:70};
 const W={};SK_KEYS.forEach(k=>{if(v[k]>=SK_MAX){W[k]=0;return}let x=P.wk*(top-v[k])/top*1.4+(T.en[k]||.4)*(1-P.wk)*1.4+(T.amb[k]||0)+.15;if(k=='dance'&&(w.ph??70)<30)x*=.15;W[k]=Math.max(.01,x)});
 const tot=Object.values(W).reduce((a,b)=>a+b,0);let r=Math.random()*tot;for(const k of SK_KEYS){r-=W[k];if(r<=0)return k}return SK_KEYS[0]}

// ---- one day of member-driven training -------------------------------------------------------------
function trS(){if(!S.trn||typeof S.trn!='object')S.trn={day:-1,ss:[],done:{}};S.trn.ss=S.trn.ss||[];S.trn.done=S.trn.done||{};return S.trn}
function trnDay(){const G=trS(),day=S.day;if(G.day===day)return;G.day=day;G.ss=[];
 const pool=S.members.filter(m=>['active','trainee'].includes(m.status||'active'));
 // motivation drift: back toward her own baseline; low Mental Health drags it down
 pool.forEach(m=>{const T=trnOf(m),w=typeof wlOf=='function'?wlOf(m):{mh:70};T.mot+=(trnBase(m)-T.mot)*.04;if((w.mh??70)<35)T.mot-=.6;const last=T.days.at(-1);if(last!=null&&day-last>21)T.mot-=.3;T.mot=Math.max(0,Math.min(100,T.mot));
  Object.keys(T.amb).forEach(k=>{T.amb[k]*=.985;if(T.amb[k]<.03)delete T.amb[k]})});
 // who decides to practise today
 const go=[];pool.forEach(m=>{if(trnCan(m,day)!='ok')return;const T=trnOf(m),w=typeof wlOf=='function'?wlOf(m):{mh:70};const enF=Math.max(.25,Math.min(1,((m.en|0)-15)/50)),mhF=(w.mh??70)<30?.5:1;
  const p=T.hab*(.3+.9*T.mot/100)*enF*mhF;if(Math.random()<p)go.push({m,k:trnWant(m)})});
 // group sessions: a sociable member invites others who are also free today (any team, group or trainee)
 const used=new Set(),sessions=[];go.sort((a,b)=>trnOf(b.m).soc-trnOf(a.m).soc);
 go.forEach(a=>{if(used.has(a.m.id))return;const Ta=trnOf(a.m);used.add(a.m.id);const S0={t:'self',k:a.k,lead:a.m.id,ids:[a.m.id]};
  if(Math.random()<Ta.soc*(.45+Ta.mot/220)){const size=2+Math.floor(Math.random()*Math.min(4,1+Ta.soc*4));
   const C=go.filter(b=>!used.has(b.m.id)).map(b=>{const P=typeof relGet=='function'?relGet(a.m.id,b.m.id):null,bond=P?Math.min(...P.x):15;const sc=bond/100*1.3+(b.k==a.k?.7:0)+(b.m.tid&&b.m.tid==a.m.tid?.15:b.m.group==a.m.group?.08:0)+Math.random()*.45+trnOf(b.m).soc*.35;return{b,sc}}).sort((x,y)=>y.sc-x.sc);
   C.forEach(({b,sc})=>{if(S0.ids.length>=size)return;if(sc>.95){S0.ids.push(b.m.id);used.add(b.m.id)}});if(S0.ids.length>1)S0.t='group'}
  sessions.push(S0)});
 sessions.forEach(s=>trnRun(s));G.ss=sessions}
function trnRun(s){const k=s.k,M=s.ids.map(get).filter(Boolean);if(!M.length)return;const lead=get(s.lead)||M[0],Tl=trnOf(lead);
 const hrs=Math.max(1,Math.min(3,1+Math.floor(Tl.mot/45)+(Math.random()<.3?1:0)));s.h=hrs;s.res={};
 let bond=0,bn=0;if(M.length>1&&typeof relGet=='function')for(let i=0;i<M.length;i++)for(let j=i+1;j<M.length;j++){const P=relGet(M[i].id,M[j].id);bond+=P?Math.min(...P.x):15;bn++}
 const coh=bn?bond/bn:0,top=Math.max(...M.map(m=>skV(m,k)));
 M.forEach(m=>{const T=trnOf(m),P=TRN_P[m.pers]||TRN_P.Serious,own=m.id==lead.id||k==trnWant(m)?1:.9;   // practising someone else's choice is a little less effective
  const eff=Math.max(.3,Math.min(1.35,.45+T.mot/160+((m.pas||50)-50)/250+P.eff+(Math.random()-.5)*.24))*own;
  const grpF=M.length>1?1.08+.1*coh/100+Math.min(.12,Math.max(0,top-skV(m,k))/2500):1;
  const cons=1+Math.min(.2,trnRecent(m)/60);const hm=typeof wlTrainMul=='function'?wlTrainMul(m,k):1;
  const exp=1.12*hrs*eff*grpF*cons*hm*(.9+Math.random()*.2);const g=skAdd(m,k,exp);
  const cost=Math.round(3+hrs*3*(k=='dance'?1.3:1)*Math.min(1.1,eff));m.en=Math.max(0,(m.en|0)-cost);
  try{wlAdj(m,{load:Math.round(hrs*2.5*(k=='dance'?1.3:1)),str:k=='dance'?1:0},M.length>1?'group practice':'self-practice')}catch(e){}
  T.days.push(S.day);if(T.days.length>40)T.days=T.days.slice(-40);T.mot=Math.min(100,T.mot+.8+(M.length>1?.4:0));
  T.last={d:S.day,k,t:s.t,with:s.ids.filter(x=>x!=m.id),h:hrs};s.res[m.id]={eff:+eff.toFixed(2),exp:+exp.toFixed(2),g:+g.toFixed(2)}})}

// ---- motivation from Senbatsu announcements (existing reactions) -----------------------------------
{const f=wlReact;wlReact=function(){const out=f.apply(this,arguments);try{(out||[]).forEach(x=>{const m=x.m;if(!m)return;const w=wlOf(m),ok=(w.mh??70)>=35,v={};SK_KEYS.forEach(k=>v[k]=skV(m,k));
  const weakPerf=v.sing<=v.dance?'sing':'dance',t=`“${(S.pj&&S.pj.title||'').trim()}”`;
  const S2={notSel:[10,'Not selected for {t} — wants to earn her place','ไม่ได้รับเลือกใน {t} — อยากพิสูจน์ตัวเองให้ได้'],neverSel:[12,'Still waiting for her first Senbatsu','ยังรอเซ็มบัตสึครั้งแรก'],repeatedOut:[8,'Left out again — determined to change it','ไม่ได้รับเลือกอีกครั้ง — ตั้งใจจะเปลี่ยนให้ได้'],demoted:[9,'Moved back in {t} — wants to win her spot back','ถูกถอยแถวใน {t} — อยากทวงตำแหน่งคืน'],exCenterBack:[14,'Lost the Center — wants it back','เสียตำแหน่งเซ็นเตอร์ — อยากทวงคืน'],exCenterOut:[16,'Lost the Center and her Senbatsu place','เสียทั้งเซ็นเตอร์และที่ในเซ็มบัตสึ'],
   firstCenter:[9,'First Center in {t} — wants to be worthy of it','ได้เป็นเซ็นเตอร์ครั้งแรกใน {t} — อยากทำให้สมกับตำแหน่ง'],center:[6,'Center of {t}','เซ็นเตอร์ของ {t}'],front:[4,'Front row in {t}','อยู่แถวหน้าใน {t}'],firstSen:[10,'First Senbatsu in {t}','ติดเซ็มบัตสึครั้งแรกใน {t}'],promoted:[5,'Moved up in {t}','ได้ขยับขึ้นใน {t}'],comeback:[6,'Back in the Senbatsu','กลับมาติดเซ็มบัตสึ'],trainee:[3,'Watching the seniors','เฝ้าดูรุ่นพี่']}[x.sit];
  if(!S2)return;let d=S2[0];const neg=['notSel','neverSel','repeatedOut','demoted','exCenterBack','exCenterOut'].includes(x.sit);if(neg&&!ok)d=-Math.round(d*.6);
  trnMot(m,d,(skT(S2[1],S2[2])).replace('{t}',t),neg||/Center|center/.test(x.sit)?weakPerf:null,neg?.6:.35)})}catch(e){console.error(e)}return out}}

// ---- real work experience: participants only, once per activity -------------------------------------
function skWork(key,L,why){const G=trS();if(!key||G.done[key])return 0;G.done[key]=S.day;const K=Object.keys(G.done);if(K.length>4000)K.filter(k=>S.day-G.done[k]>400).forEach(k=>delete G.done[k]);
 let n=0;(L||[]).forEach(z=>{const m=get(z.id);if(!m||!S.members.includes(m))return;const hm=typeof wlTrainMul=='function'?wlTrainMul(m,'sing'):1,f=(z.f??1)*(.88+Math.random()*.24)*hm;
  SK_KEYS.forEach(k=>{const e=z[SK_S[k]];if(e>0){skAdd(m,k,e*f);n++}});const T=trnOf(m);T.work=T.work||[];T.work.push(S.day);if(T.work.length>40)T.work=T.work.slice(-40)});return n}
// Theater: songs actually performed (Vocal + Dance), MC segments (Variety)
{const f=thPerform;thPerform=function(x){const was=x&&x.st;const r=f.apply(this,arguments);try{if(x&&was=='sched'&&x.st=='done'){const rec=thS().pf.find(z=>z.id==x.perf);if(rec){const items=thS().snap[rec.snap]||[],mem=new Set(rec.mem||[]),songs=items.filter(z=>z.k=='song'),mcs=items.filter(z=>z.k=='mc');
  const avgN=songs.length?songs.reduce((a,z)=>a+(z.mem||[]).filter(id=>mem.has(id)).length,0)/Math.max(1,mem.size):0,L={};
  mem.forEach(id=>{let n=songs.filter(z=>(z.mem||[]).includes(id)).length;if(!n)n=Math.round(avgN);const cen=songs.filter(z=>z.center==id||z.c==id).length;L[id]={id,vo:.05*n,da:.06*n,f:1+Math.min(.15,cen*.03)}});
  mcs.forEach(z=>(z.mem||[]).forEach(id=>{if(!mem.has(id))return;(L[id]=L[id]||{id}).va=(L[id].va||0)+.3}));
  skWork('th:'+rec.id,Object.values(L),'theater');if(rec.sat!=null)mem.forEach(id=>{const m=get(id);if(!m)return;if(rec.sat>=70)trnMot(m,1.2);else if(rec.sat<40)trnMot(m,m.pers=='Serious'||m.pers=='Cool'?1.5:-1.5)})}}}catch(e){console.error(e)}return r}}
// Concerts: per member songs and MC from the performance result
{const f=ccPerform;ccPerform=function(C,p){const r=f.apply(this,arguments);try{const R=p&&p.res;if(R&&!R.err&&R.mem){const out=R.out||{},L=[];Object.entries(R.mem).forEach(([id,z])=>{if(out[id])return;if(!(z.songs>0||z.mc>0))return;L.push({id:+id,vo:.07*z.songs,da:.08*z.songs,va:.4*(z.mc||0),f:1+Math.min(.2,(z.center||0)*.04)});const m=get(+id);if(m&&z.e!=null){if(z.e>=70)trnMot(m,2);else if(z.e<45)trnMot(m,(m.pas||50)>60?2.5:-2)}});skWork('cc:'+C.id+':'+p.id,L,'concert')}}catch(e){console.error(e)}return r}}
// Release mini concert
{const f=holdConcert;holdConcert=function(p,x){const ev=f.apply(this,arguments);try{if(ev&&ev.result&&Array.isArray(ev.result.members)){const n=Math.max(1,(ev.result.songs||[]).length||3);skWork('mc:'+ev.id,ev.result.members.map(id=>({id,vo:.07*n,da:.08*n,va:.15})),'mini concert')}}catch(e){console.error(e)}return ev}}
// External events & music programs: by their real activities
const SK_ACT={live:r=>({vo:.25*(r.songs||1),da:.25*(r.songs||1)}),talk:()=>({va:.6}),guest:()=>({va:.5}),mc:()=>({va:.8}),promo:()=>({va:.3}),photo:()=>({va:.12}),fashion:()=>({va:.12}),cm:()=>({va:.15})};
{const f=xeRun;xeRun=function(r){const was=r&&r.status;const out=f.apply(this,arguments);try{if(r&&was=='accepted'&&r.status=='done'&&r.res&&Array.isArray(r.res.mem)){const A=r.acts||[],base={};A.forEach(a=>{const g=(SK_ACT[a]||(()=>({})))(r);for(const k in g)base[k]=(base[k]||0)+g[k]});const mul=r.ch=='mp'?1.6:1;
  skWork('xe:'+r.id,r.res.mem.filter(z=>z&&z.id!=null).map(z=>({id:z.id,vo:(base.vo||0)*mul,da:(base.da||0)*mul,va:(base.va||0)*mul})),'event')}}catch(e){console.error(e)}return out}}
// Handshake events: talking with fans
{const f=hsRun2;hsRun2=function(ev,part){const k='r'+part,was=ev&&!!ev[k];const r=f.apply(this,arguments);try{if(ev&&!was&&ev[k]&&ev.plan&&ev.plan.rows)skWork('hs:'+ev.id+':'+part,ev.plan.rows.map(x=>({id:x.mid,va:.5})),'handshake')}catch(e){console.error(e)}return r}}
// legacy handshake events (older saves): the members who actually attended
{const f=hsRun;hsRun=function(ev,part){const k='r'+part,was=ev&&!!ev[k];const r=f.apply(this,arguments);try{if(ev&&!was&&ev[k]){const R=ev[k],ids=Array.isArray(R.rows)?R.rows.map(x=>x.mid??x.id):(ev.members||[]).filter(id=>{const m=get(id);return m&&(R.att||R.mem||1)});skWork('hs:'+ev.id+':'+part,ids.filter(id=>id!=null).map(id=>({id,va:.5})),'handshake')}}catch(e){console.error(e)}return r}}
// Roadshow: every participant performs the day's songs and MC breaks
{const f=rsRun;rsRun=function(ev,part){const k='d'+part,was=ev&&!!ev[k];const r=f.apply(this,arguments);try{if(ev&&!was&&ev[k]){const sl=ev[k].sl||[],ns=sl.filter(z=>z.k=='s').length,nm=sl.filter(z=>z.k=='mc').length;skWork('rs:'+ev.id+':'+part,(ev[k].rows||[]).map(x=>({id:x.mid,vo:.06*ns,da:.07*ns,va:.3*nm})),'roadshow')}}catch(e){console.error(e)}return r}}
// single production rehearsals (Week 2): only members who actually attended
function skRehearse(p,e,m){const key='rh:'+p.id+':'+e+':'+m.id,G=trS();if(G.done[key])return false;const b=[skV(m,'sing'),skV(m,'dance')];skWork(key,[{id:m.id,vo:.12,da:.15}],'rehearsal');return Math.floor(skV(m,'sing'))>Math.floor(b[0])||Math.floor(skV(m,'dance'))>Math.floor(b[1])}

// ---- the player no longer assigns lessons ---------------------------------------------------------
train=function(){toast(skT('Members practise on their own — there is nothing to assign.','เมมเบอร์ฝึกซ้อมกันเอง — ไม่ต้องสั่งการ'))};

// ---- daily hook & syncing -------------------------------------------------------------------------
{const f=render;render=function(){try{skSync()}catch(e){}return f.apply(this,arguments)}}
{const f=tick;tick=function(){try{skSync()}catch(e){}const r=f.apply(this,arguments);try{trnDay()}catch(e){console.error(e)}return r}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{skSync()}catch(e){}return r}}

// ---- UI: profile skills block, candidate line, Practice Room ----------------------------------------
const skBar=v=>`<span class="skbar"><i style="width:${Math.round(v/10)}%"></i></span>`;
function skRows(m){return SK_KEYS.map(k=>{const v=skV(m,k);return`<div class="skr ${m.spec==k?'spec':''}"><b>${skNm(k)}</b><span>${v}<small>/1000</small></span>${skBar(v)}</div>`}).join('')}
function skMotW(v){return v>=75?skT('Fired up','ไฟแรงสุด ๆ'):v>=55?skT('Motivated','มีแรงจูงใจ'):v>=35?skT('Steady','ทรงตัว'):skT('Low','หมดไฟ')}
function skLast(m){const L=trnOf(m).last;if(!L)return skT('Has not practised yet.','ยังไม่ได้ฝึกซ้อม');const ago=S.day-L.d,w=ago==0?skT('today','วันนี้'):ago==1?skT('yesterday','เมื่อวาน'):skT(ago+' days ago',ago+' วันก่อน');
 const wn=(L.with||[]).map(id=>{const o=get(id);return o?o.name.split(' ')[0]:''}).filter(Boolean);return`${skT('Last practice','ฝึกล่าสุด')}: ${skNm(L.k)} · ${w}${wn.length?' · '+skT('with ','กับ ')+wn.slice(0,3).join(', '):''}`}
function skProfHtml(m,cand){const T=cand?null:trnOf(m);return`<h3>${skT('Skills','ทักษะ')}</h3><div class="skbox" data-notr>${skRows(m)}<div class="skr sub"><b>${skT('Performance','การแสดง')}</b><span>${skV(m,'cha')}</span><small class="st">${skT('Average of Vocal & Dance','ค่าเฉลี่ยร้องและเต้น')}</small></div>${m.spec?`<div class="st">${skT('Specialty','ถนัดด้าน')}: <b>${skNm(m.spec)}</b></div>`:''}
 ${T?`<div class="skmot"><span class="tag">${skT('Motivation','แรงจูงใจ')}: ${skMotW(T.mot)} (${Math.round(T.mot)})</span>${T.why&&S.day-T.why.d<60?`<span class="st">${esc(T.why.t)}</span>`:''}<span class="st">${skLast(m)}</span></div>`:''}
 <p class="st">${skT('Members decide on their own when to practise, which skill and with whom. Practice and real work (Theater, concerts, events, handshakes) both raise skills; higher levels take longer.','เมมเบอร์ตัดสินใจเองว่าจะฝึกเมื่อไหร่ ฝึกทักษะไหน และฝึกกับใคร ทั้งการฝึกซ้อมและงานจริง (เธียเตอร์ คอนเสิร์ต อีเวนต์ งานจับมือ) ช่วยเพิ่มทักษะ ยิ่งระดับสูงยิ่งพัฒนาช้าลง')}</p></div>`}
function skCandLine(m){return`${skNm('sing')} ${skV(m,'sing')} · ${skNm('dance')} ${skV(m,'dance')} · ${skNm('variety')} ${skV(m,'variety')}${m.spec?` · ${skT('Specialty','ถนัด')}: ${skNm(m.spec)}`:''}`}

V.training=function(){const f=ui.trf=ui.trf||{grp:'all',st:'all',sk:'mot'};if(!S.members.length)return`<div class="c">${emptyBox('No idols yet. Recruit members through an audition first.')}<button class="b p" onclick="goSec('audition')">Go to Audition</button></div>`;
 const G=trS(),op=(a,v)=>a.map(([k,n])=>`<option value="${k}" ${String(k)==String(v)?'selected':''}>${n}</option>`).join('');
 const L=S.members.filter(m=>['active','trainee'].includes(m.status||'active')&&(f.grp=='all'||m.group==+f.grp)&&(f.st=='all'||(f.st=='act'?isAct(m):m.status=='trainee')));
 const key=f.sk;L.sort((a,b)=>key=='name'?a.name.localeCompare(b.name):key=='mot'?trnOf(b).mot-trnOf(a).mot:key=='en'?b.en-a.en:skV(b,key)-skV(a,key));
 const why={leave:skT('On leave','ลาพัก'),rest:skT('Resting today','พักวันนี้'),busy:skT('Busy with work today','ติดงานวันนี้'),tired:skT('Too tired to practise','เหนื่อยเกินกว่าจะซ้อม')};
 const ss=(G.day==S.day?G.ss:[]).map(s=>{const M=s.ids.map(get).filter(Boolean);return`<div class="c trs ${s.t}"><div class="trsf">${M.map(m=>`<span onclick="${prof(m.id)}">${ptc(m,40)}</span>`).join('')}</div><div><b>${s.t=='group'?skT('Group practice','ซ้อมเป็นกลุ่ม'):skT('Self-practice','ซ้อมเดี่ยว')} · ${skNm(s.k)}</b><small>${M.map(m=>esc(m.name)).join(', ')} · ${s.h||1}${skT('h','ชม.')}</small></div></div>`}).join('');
 const card=m=>{const T=trnOf(m),c=trnCan(m,S.day),today=T.last&&T.last.d==S.day;return`<div class="c trc2 ${today?'on':''}"><div class="av" onclick="${prof(m.id)}">${CH.half(m,0,7)}<span class="avt">${isAct(m)?esc(teamLbl(m)):esc(TLm(m))}</span></div><div class="trb"><div class="trh"><b>${esc(m.name)}</b> <span class="tag rr${rar(m)}">${rar(m)}</span></div>
  <div class="skmot sm"><span class="tag ${T.mot>=55?'up':T.mot<35?'dn':''}">${skMotW(T.mot)}</span>${today?`<span class="tag on">${skT('Practised','ซ้อมแล้ว')}: ${skNm(T.last.k)}</span>`:c!='ok'&&why[c]?`<span class="st">${why[c]}</span>`:''}</div>${skRows(m)}
  <div class="en ${m.en<25?'low':''}">${skT('Energy','พลังงาน')} ${m.en}/100</div>${T.why&&S.day-T.why.d<45?`<div class="st trwhy">${esc(T.why.t)}</div>`:''}</div></div>`};
 return`<h2 class="ht">${skT('Practice Room','ห้องซ้อม')}</h2><div data-notr><div class="c tools"><p class="st">${skT('Members practise by themselves — alone or with friends from any team, group or trainee class — whenever they are free and have the energy. You do not assign lessons. Real work also builds skills.','เมมเบอร์ฝึกซ้อมกันเอง — คนเดียวหรือกับเพื่อนจากทีม วง หรือรุ่นเด็กฝึกไหนก็ได้ — เมื่อว่างและมีแรง คุณไม่ต้องสั่งบทเรียน งานจริงก็ช่วยพัฒนาทักษะเช่นกัน')}</p>
 <div class="row"><select onchange="ui.trf.grp=this.value;render()">${op([['all',skT('All groups','ทุกวง')],...S.groups.map(g=>[g.id,g.name])],f.grp)}</select><select onchange="ui.trf.st=this.value;render()">${op([['all',skT('Members & trainees','เมมเบอร์และเด็กฝึก')],['act',skT('Members','เมมเบอร์')],['tr',skT('Trainees','เด็กฝึก')]],f.st)}</select><select onchange="ui.trf.sk=this.value;render()">${op([['mot',skT('Motivation','แรงจูงใจ')],['sing',skNm('sing')],['dance',skNm('dance')],['variety',skNm('variety')],['en',skT('Energy','พลังงาน')],['name',skT('Name','ชื่อ')]],f.sk)}</select></div></div>
 <div class="c"><h3>${skT('Today in the practice room','วันนี้ในห้องซ้อม')}</h3>${ss?`<div class="trsl">${ss}</div>`:`<p class="st">${skT('Nobody has practised yet today. Members decide at the end of their day.','วันนี้ยังไม่มีใครซ้อม เมมเบอร์จะตัดสินใจหลังจบภารกิจของวัน')}</p>`}</div>
 <div class="trg2">${L.map(card).join('')}</div></div>`};
// profile: the skills block replaces the old Abilities/lesson buttons
{const f=profHtml;profHtml=function(m,cand){let h=f.apply(this,arguments);try{h=h.replace(/<h3>Abilities<\/h3>[\s\S]*?(?=<h3>Concept affinity<\/h3>)/,skProfHtml(m,cand)).replace(/<div class="sr"><b>Potential<\/b>[\s\S]*?<\/div>(?=<div class="sr">)/,'').replace(/<p class="st">(?:Training costs|Lessons cost)[^<]*<\/p>/,'')}catch(e){console.error(e)}return h}}
