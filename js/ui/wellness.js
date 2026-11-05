// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Member Emotions, Group Bond & Wellness
//  Four separate member conditions (none of them replaces an existing stat):
//   · Physical Health  m.wel.ph  0–100 — falls only under overload, injury or illness
//   · Energy           m.en      (the existing Stamina) — spent by lessons and events
//   · Mental Health    m.wel.mh  0–100 — long-term; changes slowly and only in context
//   · Mood             m.wel.mood — short-term feeling that fades back to Neutral
//  Passion (m.pas), Loyalty (m.loy) and Morale (m.mor) stay what they were.
//  Hidden helpers: m.wel.load (physical workload) and m.wel.str (stress) decay daily.
//  Senbatsu announcements produce personality-based reactions and are recorded in
//  m.senRec. Physical or Mental Health at 0 → one mandatory 3-month leave (m.wel.leave).
// =====================================================================================
const WL={
 mood:{Happy:['😊','pos'],Excited:['🤩','pos'],Proud:['🌟','pos'],Motivated:['🔥','pos'],Neutral:['🙂','neu'],Nervous:['😰','nrv'],Pressured:['😣','nrv'],Disappointed:['😞','neg'],Frustrated:['😤','neg'],Sad:['😢','neg'],Lonely:['🥀','neg']},
 cost:{sing:15,dance:25,variety:10,cha:20},load:{sing:5,dance:12,variety:3,cha:8},
 lv:v=>v<=0?'Leave':v<20?'Critical':v<40?'Poor':v<60?'Normal':v<80?'Good':'Excellent',
 mhMul:v=>v>=80?1.1:v>=60?1:v>=40?.95:v>=20?.85:.75,
 // per-mood effects on Morale / Passion / Loyalty / stress
 eff:{Happy:{mor:6,pas:2,loy:1},Excited:{mor:8,pas:3,loy:1},Proud:{mor:6,pas:2,loy:2},Motivated:{mor:3,pas:4},Neutral:{},Nervous:{mor:-1,str:8},Pressured:{mor:-2,str:15},Disappointed:{mor:-5,pas:-2,loy:-1},Frustrated:{mor:-6,pas:-3,loy:-2,str:8},Sad:{mor:-6,pas:-2,str:6},Lonely:{mor:-5,loy:-3,str:6}},
 posN:{center:'Center',front:'Front Row',mid:'Middle Row',back:'Back Row',none:'Not Selected'}
};
const wlAway=m=>!!(m&&m.wel&&m.wel.leave),wlOff=m=>!!(m&&m.wel&&m.wel.off==S.day);
function wlOf(m){let w=m.wel;if(!w||typeof w!='object'||Array.isArray(w))w=m.wel={};const n=(v,d)=>typeof v=='number'&&isFinite(v)?v:d;
 w.ph=cl(n(w.ph,100));w.mh=cl(n(w.mh,100));w.load=cl(n(w.load,0));w.str=cl(n(w.str,0));if(!WL.mood[w.mood]){w.mood='Neutral';w.moodTil=null}
 w.emo=Array.isArray(w.emo)?w.emo:[];w.cd=w.cd&&typeof w.cd=='object'?w.cd:{};w.warn=w.warn&&typeof w.warn=='object'?w.warn:{};if(w.leave===undefined)w.leave=null;w.leaves=Array.isArray(w.leaves)?w.leaves:[];w.red=!!w.red;return w}
function srOf(m){let r=m.senRec;if(!r||typeof r!='object'){r=m.senRec={sel:0,cen:0,front:0,mid:0,back:0,none:0,cons:0,consNone:0,bestCons:0,prev:null,lastCen:null,firstSen:null,firstCen:null,keys:[],log:[]}}
 ['sel','cen','front','mid','back','none','cons','consNone','bestCons'].forEach(k=>r[k]=+r[k]||0);r.keys=Array.isArray(r.keys)?r.keys:[];r.log=Array.isArray(r.log)?r.log:[];return r}
function wlLog(m,o){const w=wlOf(m);w.emo.push({day:S.day,...o});if(w.emo.length>40)w.emo.splice(0,w.emo.length-40)}
const wlN=h=>{ui.wlN=ui.wlN||[];ui.wlN.push(h)};
function wlMood(m,k,days){const w=wlOf(m);if(!WL.mood[k])return;w.mood=k;w.moodTil=k=='Neutral'?null:S.day+(days||rnd(5,10))}
// adjust health values; reaching 0 starts the mandatory leave immediately
function wlAdj(m,d,why){if(!m)return;const w=wlOf(m);if(d.ph)w.ph=cl(w.ph+d.ph);if(d.mh)w.mh=cl(w.mh+d.mh);if(d.load)w.load=cl(w.load+d.load);if(d.str)w.str=cl(w.str+d.str);
 ['ph','mh'].forEach(k=>{const v=w[k],lv=v<20?2:v<40?1:0,was=w.warn[k]|0,nm=k=='ph'?'Physical Health':'Mental Health';
  if(lv>was){w.warn[k]=lv;if(v>0){wlLog(m,{t:'warn',k,lv,txt:`${nm} became ${WL.lv(v)} (${Math.round(v)})${why?' — '+why:''}`});
   if(lv==2){toast(`⚠ ${m.name}: ${nm} is Critical (${Math.round(v)}).`,'err');wlN(`<li>⚠ <b>${esc(m.name)}</b> — ${nm} is <b>Critical</b> (${Math.round(v)}). She needs rest and care, or she will be put on mandatory leave.</li>`)}}}
  else if(was&&v>=45)w.warn[k]=0;else if(was==2&&v>=25)w.warn[k]=1});
 if(!w.leave&&(w.ph<=0||w.mh<=0))wlLeaveStart(m)}

// ---- mandatory leave ------------------------------------------------------------------------------
function wlRet(d){const a=dayDate(d),t=new Date(a.getFullYear(),a.getMonth()+3,1),last=new Date(t.getFullYear(),t.getMonth()+1,0).getDate();t.setDate(Math.min(a.getDate(),last));return dateDay(t)}
const WLT={medical:'Medical Leave',mental:'Mental Health Leave',both:'Medical & Mental Health Leave'};
function wlLeaveStart(m){const w=wlOf(m);if(w.leave)return;const c=[];if(w.ph<=0)c.push('ph');if(w.mh<=0)c.push('mh');if(!c.length)return;
 const type=c.length==2?'both':c[0]=='ph'?'medical':'mental';w.leave={type,causes:c,start:S.day,ret:wlRet(S.day)};w.ph=Math.max(0,w.ph);w.mh=Math.max(0,w.mh);
 const why=c.map(k=>k=='ph'?'Physical Health':'Mental Health').join(' and ');wlLog(m,{t:'leave',txt:`${WLT[type]} started: ${why} reached 0. Returns ${longDate(w.leave.ret)}.`});hev(m,{t:'leave_start',lt:type,ret:w.leave.ret});
 try{wlStrip()}catch(e){console.error(e)}toast(`${m.name} begins ${WLT[type]} until ${longDate(w.leave.ret)}.`,'err');
 wlN(`<li>🏥 <b>${esc(m.name)}</b> — <b>${WLT[type]}</b> (${why} reached 0). She is away from all activities for 3 months and returns on <b>${longDate(w.leave.ret)}</b>. She stays in her group and team.</li>`)}
function wlLeaveEnd(m){const w=wlOf(m),L=w.leave;if(!L)return;L.causes.forEach(k=>{if(w[k]<20)w[k]=20});L.end=S.day;w.leaves.push(L);if(w.leaves.length>12)w.leaves.shift();w.leave=null;w.warn={};w.load=0;w.str=Math.min(w.str,20);wlMood(m,'Motivated',7);
 wlLog(m,{t:'return',txt:`Returned from ${WLT[L.type]} (Physical ${Math.round(w.ph)}, Mental ${Math.round(w.mh)}).`});hev(m,{t:'leave_end',lt:L.type});toast(`✿ ${m.name} has returned from ${WLT[L.type]}!`);
 wlN(`<li>✿ <b>${esc(m.name)}</b> returned from ${WLT[L.type]}. Physical Health ${Math.round(w.ph)} · Mental Health ${Math.round(w.mh)} · Energy ${m.en}. She is available for activities again.</li>`)}
// members on leave are removed from everything still to come (draft formations, events, plans)
function wlStrip(){const A=new Set(S.members.filter(wlAway).map(m=>m.id));if(!A.size)return;
 const p=S.pj;if(p&&p.status=='draft')Object.values(S.songs).forEach(o=>{if(!o||!o.fm||lockedSong(o.id)||o.ge)return;let ch=0;o.fm.sl.forEach(x=>{if(x.m&&A.has(x.m)){x.m=null;ch=1}});if(ch)fmSync(o)});
 if(p&&p.hs){if(Array.isArray(p.hs.members))p.hs.members=p.hs.members.filter(id=>!A.has(id));(p.hs.groups||[]).forEach(g=>{if(Array.isArray(g.m))g.m=g.m.filter(id=>!A.has(id))})}
 (S.cal||[]).forEach(e=>{if(e.done||e.type=='release'||e.type=='anniv')return;if(e.type=='handshake'&&e.r1)return;if(e.type=='road'&&(e.d1||e.res))return;if(Array.isArray(e.members))e.members=e.members.filter(id=>!A.has(id));(e.groups||[]).forEach(g=>{if(Array.isArray(g.m))g.m=g.m.filter(id=>!A.has(id))})});
 if(ui.rsp&&Array.isArray(ui.rsp.sel))ui.rsp.sel=ui.rsp.sel.filter(id=>!A.has(id));if(ui.rs&&Array.isArray(ui.rs.sel))ui.rs.sel=ui.rs.sel.filter(id=>!A.has(id));if(ui.mod&&ui.mod.t=='ev'&&Array.isArray(ui.mod.sel))ui.mod.sel=ui.mod.sel.filter(id=>!A.has(id))}

// ---- daily condition ------------------------------------------------------------------------------
function wlDay(m){const w=wlOf(m);
 if(w.leave){w.ph=cl(w.ph+.6);w.mh=cl(w.mh+.6);w.load=Math.max(0,w.load-10);w.str=Math.max(0,w.str-5);if(w.mood!='Neutral'&&S.day>=(w.moodTil||0))wlMood(m,'Neutral');
  if(S.day==w.leave.ret-7)toast(`${m.name} returns from leave in 7 days.`);if(S.day>=w.leave.ret)wlLeaveEnd(m);return}
 const R=w.red?1.5:1;w.load=Math.max(0,w.load-6*R);w.str=Math.max(0,w.str-4*R-(WL.mood[w.mood][1]=='pos'?1:0));if(m.en<20)w.str=cl(w.str+1.5);
 let dp=0,dm=0;if(w.load>70)dp-=(w.load-70)*.04;if(m.en<10)dp-=.25;if(dp==0&&w.load<35&&m.en>=30)dp+=.2*R;
 if(w.str>65)dm-=(w.str-65)*.04;if(m.en<10)dm-=.15;if(dm==0&&w.str<35)dm+=.15*R+(WL.mood[w.mood][1]=='pos'?.1:0);
 // rare injury / illness only when the body is already worn out
 if(w.ph<40&&w.load>55&&Math.random()<.03){const v=rnd(6,12);dp-=v;wlLog(m,{t:'injury',txt:`Minor injury from overwork (Physical Health −${v}).`});toast(`${m.name} was injured from overwork.`,'err');wlN(`<li>🩹 <b>${esc(m.name)}</b> was injured from overwork (Physical Health −${v}). Lower her workload and consider Medical Treatment.</li>`)}
 else if(w.ph<30&&m.en<20&&Math.random()<.015){const v=rnd(5,9);dp-=v;wlLog(m,{t:'ill',txt:`Caught a cold while exhausted (Physical Health −${v}).`});toast(`${m.name} fell ill.`,'err')}
 if(w.mood!='Neutral'&&S.day>=(w.moodTil||0))wlMood(m,'Neutral');
 if(w.mh<40&&WL.mood[w.mood][1]!='neg'&&Math.random()<(w.mh<20?.08:.04)){const k=pick(['Sad','Lonely','Nervous','Frustrated']);wlMood(m,k,rnd(3,6));wlLog(m,{t:'mood',txt:`Felt ${k.toLowerCase()} for no clear reason (low Mental Health).`})}
 wlAdj(m,{ph:dp,mh:dm},'daily condition')}
const _wlTick=tick;tick=function(){try{wlStrip()}catch(e){console.error(e)}const r=_wlTick.apply(this,arguments);try{S.members.forEach(m=>{if(m.status!='graduated')wlDay(m)})}catch(e){console.error(e)}return r};

// ---- workload from existing activities -----------------------------------------------------------
function wlWork(ids,d,why){(ids||[]).forEach(id=>{const m=get(id);if(m&&!wlAway(m))wlAdj(m,d,why)})}
const _wlHs=hsRun2;hsRun2=function(ev,part){const k='r'+part,was=!!ev[k];const r=_wlHs.apply(this,arguments);try{if(!was&&ev[k]&&ev.plan)wlWork(ev.plan.rows.map(x=>x.mid),{load:6,str:6},'handshake event')}catch(e){console.error(e)}return r};
const _wlRs=rsRun;rsRun=function(ev,part){const k='d'+part,was=!!ev[k];const r=_wlRs.apply(this,arguments);try{if(!was&&ev[k])wlWork(ev.members,{load:14,str:3},'roadshow')}catch(e){console.error(e)}return r};
const _wlConc=holdConcert;holdConcert=function(p,x){const ev=_wlConc.apply(this,arguments);try{if(ev&&ev.result)wlWork(ev.result.members,{load:10,str:2,mh:1},'release concert')}catch(e){console.error(e)}return ev};

// ---- lessons: per-skill Energy costs and the Mental/Physical Health effect on EXP ------------------
function wlTrainMul(m,k){const w=wlOf(m);let f=WL.mhMul(w.mh);if((k=='dance'||k=='cha')&&w.ph<40)f*=.9;if(w.red)f*=.8;const md=WL.mood[w.mood][1];if(w.mood=='Motivated'||w.mood=='Excited')f*=1.05;else if(md=='neg')f*=.95;return f}
function wlTrainBlock(m,k){const w=wlOf(m);if(w.leave)return`${m.name} is on ${WLT[w.leave.type]} until ${longDate(w.leave.ret)}.`;if(w.off==S.day)return`${m.name} is resting today.`;if(k=='dance'&&w.ph<20)return`${m.name}'s Physical Health is Critical — Dance lessons are unavailable.`;return''}
train=function(id,k){const m=get(id);if(!m)return;const b=wlTrainBlock(m,k);if(b)return toast(b,'err');const c=WL.cost[k]||25;if(m.en<c)return toast(`${m.name} is too tired (energy ${m.en}/100, ${SKL[k]} needs ${c}).`,'err');
 if(m[k]>=100)return toast(`${SKL[k]} is already maxed.`,'err');if(!spend(10000,`Training: ${m.name} (${k})`))return;
 const base=rnd(1,3)+(m.pot>60?1:0)+(m.pas>70?1:0),v=base*wlTrainMul(m,k),g=Math.min(100-m[k],Math.floor(v)+(Math.random()<v%1?1:0));m[k]+=g;m.en-=c;m.mor=cl(m.mor+2);
 const w=wlOf(m);if(w.mh<40&&w.mh>=20&&Math.random()<.15&&WL.mood[w.mood][1]!='neg'){const k2=pick(['Frustrated','Nervous','Pressured']);wlMood(m,k2,rnd(2,4));wlLog(m,{t:'mood',txt:`Lesson left her ${k2.toLowerCase()} (low Mental Health).`})}
 wlAdj(m,{load:WL.load[k]||5,str:k=='dance'?2:1},'lessons');toast(g?`${m.name}'s ${SKL[k]} +${g}!`:`${m.name} could not focus — no progress this lesson.`,g?'ok':'err');render()};

// ---- recovery activities ---------------------------------------------------------------------------
const WLA={
 rest:{n:'Rest',d:'Free · +40 Energy, lighter workload · she takes the rest of today off'},
 rday:{n:'Recovery Day',c:30000,cd:3,d:'¥30,000 · massage & full rest: +40 Energy, workload −35, stress −20, Physical +3, Mental +3 · today off'},
 check:{n:'Medical Checkup',c:20000,d:'¥20,000 · a doctor\'s report on her condition and risks'},
 treat:{n:'Medical Treatment',c:80000,cd:7,leave:1,d:'¥80,000 · Physical Health +12 (every 7 days)'},
 mental:{n:'Mental Recovery',c:60000,cd:7,leave:1,d:'¥60,000 · counselling: Mental Health +10, stress −30 (every 7 days)'},
 talk:{n:'Producer Talk',cd:14,d:'Free · a one-on-one talk: stress −10, Passion +2, mood lifts (every 14 days)'},
 bond:{n:'Team Bonding',c:100000,cd:30,d:'¥100,000 · an outing for her whole team: stress −15, Mental +3, Loyalty +2 for every member (every 30 days)'}
};
function wlCdLeft(m,k){const w=wlOf(m),a=WLA[k];if(k=='bond'){const t=teamOf(m);const last=t&&S.wlBond&&S.wlBond[t.id];return last!=null?Math.max(0,last+a.cd-S.day):0}return a.cd&&w.cd[k]!=null?Math.max(0,w.cd[k]+a.cd-S.day):0}
function wlCan(m,k){const w=wlOf(m),a=WLA[k];if(w.leave&&!a.leave&&k!='check')return'Not available during leave.';if(k=='rest'&&w.rest==S.day)return'Already rested today.';if(k=='rday'&&w.off==S.day)return'Already off today.';if(k=='bond'&&!(isAct(m)&&teamOf(m)))return'Only for members in a team.';const c=wlCdLeft(m,k);if(c)return`Available again in ${c} day${c>1?'s':''}.`;return''}
function wlDo(id,k){const m=get(id),a=WLA[k];if(!m||!a)return;const no=wlCan(m,k);if(no)return toast(no,'err');const w=wlOf(m);if(a.c&&!spend(a.c,`${a.n}: ${m.name}`))return;
 if(a.cd&&k!='bond')w.cd[k]=S.day;
 if(k=='rest'){m.en=cl(m.en+40);w.rest=S.day;w.off=S.day;wlAdj(m,{load:-10,str:-5});wlLog(m,{t:'care',txt:'Took a rest (+40 Energy).'});toast(`${m.name} rests: Energy ${m.en}/100. No more lessons or events for her today.`)}
 else if(k=='rday'){m.en=cl(m.en+40);w.off=S.day;w.rest=S.day;wlAdj(m,{load:-35,str:-20,ph:3,mh:3});wlLog(m,{t:'care',txt:'Recovery Day: full rest and massage.'});toast(`${m.name} enjoys a Recovery Day.`)}
 else if(k=='check'){wlAdj(m,{str:-2});w.cd.check=S.day;wlLog(m,{t:'care',txt:`Medical Checkup: Physical ${WL.lv(w.ph)}, Mental ${WL.lv(w.mh)}.`});ui.mod={t:'html',h:wlReport(m)};render();return}
 else if(k=='treat'){wlAdj(m,{ph:12,load:-15});wlLog(m,{t:'care',txt:'Medical Treatment (Physical Health +12).'});toast(`${m.name} received Medical Treatment: Physical Health ${Math.round(w.ph)}.`)}
 else if(k=='mental'){wlAdj(m,{mh:10,str:-30});wlLog(m,{t:'care',txt:'Mental Recovery session (Mental Health +10).'});toast(`${m.name} attended a Mental Recovery session: Mental Health ${Math.round(w.mh)}.`)}
 else if(k=='talk'){wlAdj(m,{str:-10});m.pas=cl(m.pas+2);if(WL.mood[w.mood][1]!='pos')wlMood(m,w.mh>=40?'Motivated':'Neutral',5);wlLog(m,{t:'care',txt:'A one-on-one talk with the producer.'});toast(`${m.name} feels heard after your talk.`)}
 else if(k=='bond'){const t=teamOf(m),L=S.members.filter(x=>x.tid==t.id&&!wlAway(x));S.wlBond=S.wlBond||{};S.wlBond[t.id]=S.day;L.forEach(x=>{wlAdj(x,{str:-15,mh:3});x.loy=cl(x.loy+2);if(WL.mood[wlOf(x).mood][1]!='neg')wlMood(x,'Happy',5);wlLog(x,{t:'bond',txt:`Team bonding outing with ${t.name}.`})});toast(`${t.name} enjoyed a team bonding outing (${L.length} members).`)}
 render()}
function wlRedTog(id){const m=get(id);if(!m)return;const w=wlOf(m);w.red=!w.red;wlLog(m,{t:'care',txt:w.red?'Reduced Schedule started.':'Reduced Schedule ended.'});toast(w.red?`${m.name} is on a Reduced Schedule: faster recovery, lesson EXP ×0.8.`:`${m.name} is back on a normal schedule.`);render()}
function wlRisk(m){const w=wlOf(m);return w.ph<40&&w.load>55?'High — injury likely if the workload stays heavy':w.ph<60||w.load>70?'Moderate — keep an eye on her schedule':'Low'}
function wlReport(m){const w=wlOf(m),row=(a,b)=>`<tr><td>${a}</td><td><b>${b}</b></td></tr>`,rec=[];if(w.leave)rec.push('Continue the leave; treatment can speed recovery but the return date is fixed.');if(w.ph<40)rec.push('Lower her workload (Rest, Recovery Day or Reduced Schedule) and consider Medical Treatment.');if(w.mh<40)rec.push('Arrange a Mental Recovery session or a Producer Talk; avoid high-pressure roles.');if(m.en<25)rec.push('Her Energy is low — let her rest before more lessons.');if(!rec.length)rec.push('She is in good shape. Keep a balanced schedule.');
 return`<h2 class="ht">🩺 Medical Checkup — ${esc(m.name)}</h2><table>${row('Physical Health',`${Math.round(w.ph)} · ${WL.lv(w.ph)}`)}${row('Mental Health',`${Math.round(w.mh)} · ${WL.lv(w.mh)}`)}${row('Energy',`${m.en}/100`)}${row('Workload',wlLoadTxt(w.load))}${row('Stress',wlStrTxt(w.str))}${row('Injury risk',wlRisk(m))}${row('Lesson EXP',`×${wlTrainMul(m,'sing').toFixed(2)}`)}</table><h3>Recommendation</h3><ul class="ms">${rec.map(x=>`<li>${x}</li>`).join('')}</ul>`}
const wlLoadTxt=v=>v>70?'Overloaded':v>45?'Heavy':v>20?'Moderate':'Light',wlStrTxt=v=>v>65?'Very high':v>40?'High':v>20?'Some':'Low';

// ---- leave enforcement in the existing selection systems ------------------------------------------
const wlBlockMsg=m=>`${m.name} is on ${WLT[m.wel.leave.type]} until ${longDate(m.wel.leave.ret)}.`;
const _wlAssign=fmAssign;fmAssign=function(id){const m=get(id);if(wlAway(m))return toast(wlBlockMsg(m),'err');const o=S.songs[ui.es],x=o&&o.fm.sl[ui.fslot];if(x&&x.c&&m&&wlOf(m).mh<20)return toast(`${m.name}'s Mental Health is Critical — she cannot take a Center position right now.`,'err');return _wlAssign.apply(this,arguments)};
const _wlDrop=fmDrop;fmDrop=function(e,k){const d=(e.dataTransfer&&e.dataTransfer.getData('text/plain'))||'';if(d.startsWith('m:')){const m=get(+d.slice(2));if(wlAway(m)){if(e.preventDefault)e.preventDefault();return toast(wlBlockMsg(m),'err')}}return _wlDrop.apply(this,arguments)};
const _wlCenter=plCenter;plCenter=function(id,k,mid){const m=get(mid);if(wlAway(m)){toast(wlBlockMsg(m),'err');return render()}if(m&&wlOf(m).mh<20){toast(`${m.name}'s Mental Health is Critical — she cannot take a Center position right now.`,'err');return render()}return _wlCenter.apply(this,arguments)};
const _wlTog=tog;tog=function(id){const m=get(id),s=ui.mod&&ui.mod.sel;if(s&&!s.includes(id)&&m){if(wlAway(m))return toast(wlBlockMsg(m),'err');if(wlOff(m))return toast(`${m.name} is resting today.`,'err');const w=wlOf(m);if(w.mh<20)return toast(`${m.name}'s Mental Health is Critical — high-pressure events are unavailable.`,'err');if(w.ph<20)return toast(`${m.name}'s Physical Health is Critical — she cannot perform.`,'err')}return _wlTog.apply(this,arguments)};
const _wlRunEv=runEv;runEv=function(){const M=ui.mod,sel=M&&M.sel?M.sel.slice():[],d0=S.day;const bad=sel.map(get).find(m=>m&&(wlAway(m)||wlOff(m)));if(bad)return toast(wlAway(bad)?wlBlockMsg(bad):`${bad.name} is resting today.`,'err');const e=M&&EV[M.k];const r=_wlRunEv.apply(this,arguments);
 try{if(S.day>d0&&e)sel.forEach(id=>{const m=get(id);if(m)wlAdj(m,{load:15*(e.dur||1),str:4*(e.dur||1),mh:1},'event')})}catch(x){console.error(x)}return r};
const _wlRsTogM=rsTogM;rsTogM=function(id){const P=ui.rsp,m=get(id);if(P&&!P.sel.includes(id)&&wlAway(m))return toast(wlBlockMsg(m),'err');return _wlRsTogM.apply(this,arguments)};
const _wlRsTog=rsTog;rsTog=function(id){const r=ui.rs,m=get(id);if(r&&!r.sel.includes(id)&&wlAway(m))return toast(wlBlockMsg(m),'err');return _wlRsTog.apply(this,arguments)};
const _wlRsAll=rsAll;rsAll=function(){const r=_wlRsAll.apply(this,arguments);try{wlStrip();render()}catch(e){}return r};
const _wlRsElig=rsElig;rsElig=function(){return _wlRsElig.apply(this,arguments).filter(id=>!wlAway(get(id)))};
const _wlHsElig=hsElig;hsElig=function(){return _wlHsElig.apply(this,arguments).filter(id=>!wlAway(get(id)))};
const _wlReqs=reqs;reqs=function(p){const r=_wlReqs.apply(this,arguments);try{if(p&&p.status=='draft'&&p.types){const ids=new Set();[p.mainId,...p.types.flatMap(t=>t.songs)].forEach(i=>{const o=S.songs[i];if(o&&o.fm&&!o.ge)o.fm.sl.forEach(x=>{if(x.m){const m=get(x.m);if(wlAway(m))ids.add(m.name+' is on leave and must be removed from "'+o.title+'".');else if(x.c&&m&&wlOf(m).mh<20)ids.add(m.name+'\'s Mental Health is Critical — choose another Center for "'+o.title+'".')}})});r.push(...ids)}}catch(e){console.error(e)}return r};

// ---- Senbatsu announcement reactions ---------------------------------------------------------------
const WLTONE=m=>{const t=m.traits||[];if(m.pers=='Shy'||t.includes('Shy'))return'soft';if(m.pers=='Serious')return'firm';if(m.pers=='Cool'||m.pers=='Elegant'||t.includes('Cool')||t.includes('Elegant')||t.includes('Mysterious'))return'calm';return'bright'};
const WLD={
 firstCenter:{pos:{bright:['Me? The Center?! I\'m going to give it absolutely everything!','My first Center! I can\'t stop smiling — thank you so much!'],calm:['The first Center position... I will carry it with pride.','I have waited for this. I won\'t let the group down.'],soft:['I-I\'m the Center? I\'m scared... but I really want to try.','My heart is pounding... I\'ll do my best in the middle.'],firm:['My first Center. I will train twice as hard to deserve it.','Thank you. I understand the responsibility, and I accept it.']},nrv:{bright:['Center?! What if I mess up in front of everyone...','I\'m so happy, but my legs are shaking already!'],calm:['Everyone will be watching me now... I must not falter.','It is an honour. And a heavy one.'],soft:['Everyone is looking at me... I don\'t know if I can do this.','The Center... I\'m so nervous I could cry.'],firm:['There is no room for mistakes now. I feel the weight of it.','I will not fail. I cannot fail.']}},
 center:{pos:{bright:['Center again! Let\'s make this one even better!','Leave the middle to me!'],calm:['Center once more. I will show a new side of myself.','I know what this position demands.'],soft:['Again... thank you for trusting me.','I\'ll protect this position with everything I have.'],firm:['I will prove the last time was no accident.','Center again. I will raise the bar.']},nrv:{bright:['Center again... people expect even more now, right?'],calm:['The pressure only grows each time.'],soft:['Everyone expects so much... I\'m afraid of disappointing them.'],firm:['If this single underperforms, it will be on me.']}},
 front:{pos:{bright:['Front row! Fans will see my smile up close!','Yay, front row! Let\'s go!'],calm:['The front row. A good place to shine.','I will make the most of the front row.'],soft:['The front row... I\'ll try not to hide.','I\'m in front... I hope I can do well.'],firm:['Front row. One step away from the Center.','Good. Now I aim higher.']},neg:{bright:['Front row is nice, but I really wanted the Center...'],calm:['Front row. Not the Center, though.'],soft:['I\'m grateful... but I hoped for a little more.'],firm:['Not the Center this time. I need to improve.']}},
 mid:{pos:{bright:['Middle row is fine! I\'ll dance so hard they notice me!','I\'m in! That\'s what matters!'],calm:['The middle row. I will stand out anyway.','A steady position. I will build from here.'],soft:['I made it in... that\'s enough for me.','I\'ll do my part quietly but well.'],firm:['Middle row. I will move forward next time.','I will use this single to climb.']},neg:{bright:['Middle row again... I wanted to be closer to the front.'],calm:['Further back than I hoped.'],soft:['I thought maybe I\'d be in front this time...'],firm:['This is not where I want to be. I will work harder.']}},
 back:{pos:{bright:['Back row, but I\'m in! I\'ll be the most energetic back row ever!','Even from the back, I\'ll make fans smile!'],calm:['The back row has its own role. I will fulfil it.','I will shine even from the back.'],soft:['Back row is okay... I\'m just happy to be chosen.','I\'ll support everyone from behind.'],firm:['Back row. I will earn a better place.','Every position matters. I will do mine properly.']},neg:{bright:['The back row... I hoped for more this time.'],calm:['The back row. I expected better of myself.'],soft:['The back... maybe nobody will see me.'],firm:['The back row. That is a clear message I need to improve.']}},
 firstSen:{pos:{bright:['I\'m in the Senbatsu?! For real?! This is the best day ever!','My first Senbatsu! I\'m going to cry!'],calm:['My first Senbatsu. The real work starts now.','At last. I will not waste this chance.'],soft:['Me...? In the Senbatsu? I can\'t believe it...','My dream came true... thank you.'],firm:['My first Senbatsu. I will show I belong here.','Finally. I will make it count.']},nrv:{bright:['My first Senbatsu! I\'m so nervous I can\'t sit still!'],calm:['My first time with the Senbatsu... I must not fall behind.'],soft:['The Senbatsu... I\'m so nervous I feel sick.'],firm:['I must keep up with the senior members from day one.']}},
 exCenterBack:{neg:{bright:['From Center to the back row... did I do something wrong?','It\'s okay... I\'m fine. Really...'],calm:['The back row. After being the Center... I see.','I will not show it on stage. But this hurts.'],soft:['The back row... I knew I wasn\'t good enough.','I don\'t want anyone to see me cry.'],firm:['Center to back row. I need to know why.','I failed to keep my position. I will take it back.']},pos:{bright:['Back row this time — I\'ll fight my way to the front again!'],calm:['A step back. I will return to the Center.'],soft:['It\'s alright. I\'ll start again from here.'],firm:['I will reclaim the Center. Watch me.']}},
 exCenterOut:{neg:{bright:['Not even in the Senbatsu... after being the Center...','I don\'t understand. I really don\'t.'],calm:['Left out entirely. That is hard to accept.'],soft:['I was the Center... and now I\'m not even chosen.'],firm:['Excluded. After everything. I need to think about this.']}},
 promoted:{pos:{bright:['I moved up! Hard work really pays off!','Closer to the front! Yay!'],calm:['A better position. My efforts were seen.'],soft:['I moved forward... I\'m really happy.'],firm:['Progress. Next, I aim even higher.']}},
 demoted:{neg:{bright:['I moved back... I\'ll try harder!','Hmm, further back than last time...'],calm:['A step back. I will reflect on it.'],soft:['I went back a row... I\'m sorry.'],firm:['I lost ground. That will not happen again.']}},
 comeback:{pos:{bright:['I\'m back in the Senbatsu! I never gave up!','I did it! I\'m back!'],calm:['Back where I belong.','The waiting is over.'],soft:['I\'m back... I\'m so relieved.'],firm:['I am back. And I am staying.']}},
 notSel:{neg:{bright:['Not this time... but next time for sure!','Aww... I wanted to be in it.'],calm:['Not selected. I understand.','I will accept it — for now.'],soft:['I wasn\'t chosen... I expected it, but it still hurts.','It\'s okay... I\'m used to it.'],firm:['Not selected. I will analyse what I lack.','I was not good enough this time.']},pos:{bright:['I\'ll cheer for everyone and train hard for the next one!'],calm:['Next time, I will be impossible to overlook.'],soft:['I\'ll keep practising quietly.'],firm:['Then I will train until they cannot leave me out.']},neu:{bright:['Okay! There\'s always the next single!'],calm:['Not this time. That is fine.'],soft:['Mm. Next time, maybe.'],firm:['Understood. Back to training.']}},
 trainee:{pos:{bright:['One day I\'ll be up there too!'],calm:['I will learn by watching the senior members.'],soft:['Someday... I want to stand on that stage.'],firm:['My turn will come. Until then, I train.']},neu:{bright:['The seniors look so cool!'],calm:['Not yet. I know.'],soft:['I\'m still a trainee... it\'s okay.'],firm:['I need more lessons first.']},neg:{bright:['I hoped I might be picked, just a little...'],calm:['Waiting is harder than I thought.'],soft:['I wish I could be chosen too...'],firm:['I want to be chosen sooner.']}},
 neverSel:{neg:{bright:['Still never chosen... is it me?','Everyone else gets a chance...'],calm:['Not once. I am starting to wonder.'],soft:['I\'ve never been chosen... not even once.'],firm:['Never selected. I need to change something.']},pos:{bright:['Not yet, but my time will come!'],calm:['Not yet. I will be patient — and ready.'],soft:['I won\'t give up, even if it takes time.'],firm:['Then I will work until it is undeniable.']}},
 repeatedOut:{neg:{bright:['Left out again... I\'m trying so hard...','Again... I don\'t know what more I can do.'],calm:['Excluded again. It is becoming difficult to stay calm.'],soft:['Again... maybe I don\'t belong here.','I keep getting left behind...'],firm:['How many times now? Something has to change.']},pos:{bright:['Again?! Fine — I\'ll just get even better!'],calm:['Again. Then I will make them reconsider.'],soft:['I\'ll keep going... I have to.'],firm:['I refuse to give up. I will earn my place.']}}
};
function wlLine(sit,em,m){const S0=WLD[sit]||WLD.notSel,g=WL.mood[em][1],grp=g=='pos'?(S0.pos||S0.neu||S0.neg):g=='nrv'?(S0.nrv||S0.neg||S0.pos):g=='neu'?(S0.neu||S0.pos||S0.neg):(S0.neg||S0.nrv||S0.neu||S0.pos),L=grp[WLTONE(m)]||grp.bright;return pick(L)}
const WLRANK={center:4,front:3,mid:2,back:1,none:0};
function wlSit(m,pos,r){if(pos=='center')return r.cen==0?'firstCenter':'center';
 if(pos!='none'){if(r.sel==0)return'firstSen';if(r.prev=='center'&&pos=='back')return'exCenterBack';if(r.consNone>=2)return'comeback';if(r.prev&&r.prev!='none'){if(WLRANK[pos]>WLRANK[r.prev])return'promoted';if(WLRANK[pos]<WLRANK[r.prev])return'demoted'}return pos}
 if(m.status=='trainee')return'trainee';if(r.prev=='center')return'exCenterOut';if(r.sel==0&&r.none>=4)return'neverSel';if(r.consNone>=2)return'repeatedOut';return'notSel'}
function wlPickMood(m,sit){const w=wlOf(m),t=m.traits||[],P=m.pers,W={};const add=(k,v)=>{W[k]=(W[k]||0)+v};
 const T={firstCenter:{Excited:3,Proud:2,Happy:2,Nervous:1.5,Pressured:.5},center:{Proud:3,Motivated:2,Happy:1,Pressured:1},front:{Happy:3,Motivated:2,Proud:1,Excited:1,Disappointed:.3},mid:{Neutral:3,Motivated:2,Happy:1,Disappointed:.6},back:{Neutral:2,Motivated:2,Happy:1,Disappointed:1},
  firstSen:{Excited:4,Happy:3,Nervous:1},exCenterBack:{Disappointed:3,Frustrated:2,Sad:2,Motivated:1},exCenterOut:{Sad:3,Frustrated:3,Disappointed:2,Motivated:.5},promoted:{Happy:3,Motivated:2,Proud:1},demoted:{Disappointed:3,Motivated:1.5,Neutral:1},comeback:{Happy:3,Excited:2,Motivated:2},
  notSel:{Neutral:3,Disappointed:2.5,Motivated:2,Sad:.8},trainee:{Motivated:3,Neutral:3,Disappointed:.8},neverSel:{Disappointed:2,Sad:2,Lonely:1,Motivated:2},repeatedOut:{Frustrated:3,Sad:2,Lonely:1.5,Disappointed:2,Motivated:1}}[sit]||{Neutral:1};
 for(const k in T)add(k,T[k]);const neg=k=>WL.mood[k][1]=='neg';
 if(P=='Genki'||t.includes('Energetic')){if(W.Excited)add('Excited',1.5);add('Motivated',.8)}
 if(P=='Shy'||t.includes('Shy')){if(W.Nervous!=null||sit=='firstCenter'||sit=='center'||sit=='firstSen')add('Nervous',2);if(W.Sad)add('Sad',.8)}
 if(P=='Serious'){add('Motivated',1.2);if(sit=='center'||sit=='firstCenter')add('Pressured',.8)}
 if(P=='Cool'||t.includes('Cool')){if(W.Proud)add('Proud',1);if(W.Frustrated)add('Frustrated',.8);if(W.Sad)W.Sad*=.6}
 if(P=='Elegant'||t.includes('Elegant')){if(W.Proud)add('Proud',1);if(W.Frustrated)W.Frustrated*=.7}
 if(P=='Airhead'||t.includes('Natural')){add('Neutral',1);if(W.Happy)add('Happy',1)}
 if(t.includes('Funny')&&W.Happy)add('Happy',.8);if(t.includes('Mysterious'))add('Neutral',.8);if(t.includes('Cute')&&W.Sad)add('Sad',.5);
 if(m.pas>=70)add('Motivated',1.5);if(m.pas<35)for(const k in W)if(neg(k))W[k]*=1.3;if(m.loy>=75){add('Motivated',.8);if(W.Frustrated)W.Frustrated*=.7}if(m.loy<35&&W.Frustrated)W.Frustrated*=1.5;
 if(w.mh<40){for(const k in W)if(neg(k))W[k]*=1.5;if(sit=='center'||sit=='firstCenter')add('Pressured',2)}else if(w.mh>=80)for(const k in W)if(neg(k))W[k]*=.8;
 if((sit=='center'||sit=='firstCenter')&&m.pop<25)add('Pressured',1);if((sit=='notSel'||sit=='back'||sit=='mid')&&m.pop>=60){add('Disappointed',1.2);add('Frustrated',.5)}
 const E=Object.entries(W).filter(([,v])=>v>0),tot=E.reduce((a,[,v])=>a+v,0);let x=Math.random()*tot;for(const[k,v]of E){x-=v;if(x<=0)return k}return E[0][0]}
function wlMhDelta(m,sit,em,r){const loyF=m.loy>=75?.7:1;let d=0;
 if(sit=='exCenterBack')d=-rnd(5,8);else if(sit=='exCenterOut')d=-rnd(7,11);else if(sit=='repeatedOut')d=-Math.min(12,2+r.consNone*1.5);else if(sit=='neverSel'&&Math.random()<.5)d=-rnd(3,6);
 else if((sit=='center'||sit=='firstCenter')&&em=='Pressured')d=-rnd(2,5);else if(sit=='firstCenter'||sit=='firstSen'||sit=='comeback')d=em=='Nervous'?0:rnd(2,4);
 if(d<0){d*=loyF;if(WL.mood[em][1]=='pos')d*=.5}return Math.round(d*10)/10}
// positions of everyone affected by a main-song lineup
function wlPositions(p){const o=S.songs[p.mainId];if(!o||!o.fm)return null;const sl=o.fm.sl,nR=nRows(sl),M=new Map();
 sl.forEach(x=>{if(!x.m)return;M.set(x.m,x.c?'center':x.r==0?'front':(nR>1&&x.r==nR-1)?'back':'mid')});
 const G=new Set([...M.keys()].map(id=>get(id)?.group).filter(v=>v!=null));S.members.forEach(m=>{if(M.has(m.id)||!G.has(m.group)||m.status=='graduated'||wlAway(m))return;if(!(isAct(m)&&m.tid)&&m.status!='trainee')return;M.set(m.id,'none')});return M}
function wlRecord(m,pos,key,title,day){const r=srOf(m);if(r.keys.includes(key))return false;r.keys.push(key);if(r.keys.length>80)r.keys.shift();
 if(pos=='none'){r.none++;r.consNone++;r.cons=0}else{r.sel++;r[pos=='center'?'cen':pos]++;if(pos=='center'){r.lastCen={day,title};if(r.firstCen==null)r.firstCen={day,title}}if(r.firstSen==null)r.firstSen={day,title};r.cons++;r.consNone=0;r.bestCons=Math.max(r.bestCons,r.cons)}
 r.prev=pos;r.log.push({day,title,pos,key});if(r.log.length>30)r.log.shift();return true}
function wlReact(p){if(!p||!p.id||!p.ann)return[];S.wlAnn=S.wlAnn||[];if(S.wlAnn.includes(p.id))return[];S.wlAnn.push(p.id);if(S.wlAnn.length>200)S.wlAnn.shift();
 const M=wlPositions(p);if(!M)return[];const title=p.title.trim(),out=[];
 // a single whose lineups come from the General Election: members already reacted at the ceremony,
 // so only the Senbatsu record is updated (no second mood / emotional effect)
 if(p.geNext){M.forEach((pos,id)=>{const m=get(id);if(m)wlRecord(m,pos,p.id,title,S.day)});return[]}
 M.forEach((pos,id)=>{const m=get(id);if(!m)return;const r=srOf(m),sit=wlSit(m,pos,r),em=wlPickMood(m,sit),dmh=wlMhDelta(m,sit,em,r),e=WL.eff[em]||{},line=wlLine(sit,em,m);
  const was=r.prev;wlRecord(m,pos,p.id,title,S.day);
  // trainees expect little: muted effects
  const k=m.status=='trainee'&&pos=='none'?.5:1;m.mor=cl(m.mor+Math.round((e.mor||0)*k));m.pas=cl(m.pas+Math.round((e.pas||0)*k));m.loy=cl(m.loy+Math.round((e.loy||0)*k));
  wlMood(m,em,em=='Neutral'?0:rnd(6,12));wlAdj(m,{mh:dmh,str:(e.str||0)*k},'Senbatsu announcement');
  const sitTxt={firstCenter:'First Center!',center:'Center',front:'Front Row',mid:'Middle Row',back:'Back Row',firstSen:'First Senbatsu!',exCenterBack:'Former Center → Back Row',exCenterOut:'Former Center — not selected',promoted:'Moved up',demoted:'Moved back',comeback:'Back in the Senbatsu',notSel:'Not selected',trainee:'Not selected (Trainee)',neverSel:'Never selected yet',repeatedOut:`Not selected ${r.consNone} times in a row`}[sit];
  wlLog(m,{t:'sen',pos,sit,mood:em,mh:dmh,title,line,txt:`“${title}”: ${sitTxt} — felt ${em}.`});
  if(sit=='firstCenter')hev(m,{t:'first_center',title});else if(sit=='firstSen')hev(m,{t:'first_sen',title});
  out.push({m,pos,sit,sitTxt,em,dmh,line,e,was})});
 const imp=out.filter(x=>x.sit!='notSel'&&x.sit!='trainee'&&x.sit!='mid'&&x.sit!='back'&&x.sit!='front').map(x=>x.m.name+': '+x.sitTxt);if(imp.length)toast('Senbatsu reactions — '+imp.slice(0,2).join(' · '));return out}
function wlReactHtml(L){if(!L||!L.length)return'';const ord={center:0,front:1,mid:2,back:3,none:4},S2=L.slice().sort((a,b)=>ord[a.pos]-ord[b.pos]||(a.sit=='notSel')-(b.sit=='notSel')),fmt=(v,l)=>v?`<span class="${v>0?'up':'dn'}">${l} ${v>0?'+':''}${v}</span>`:'';
 const card=x=>`<div class="wlr ${WL.mood[x.em][1]}"><div class="wlrh">${ptc(x.m,40)}<div><b>${esc(x.m.name)}</b><div class="st">${x.sitTxt}</div></div><span class="wlmood">${WL.mood[x.em][0]} ${x.em}</span></div><q>${esc(x.line)}</q><div class="wlfx">${fmt(Math.round((x.e.mor||0)),'Morale')}${fmt(Math.round(x.e.pas||0),'Passion')}${fmt(Math.round(x.e.loy||0),'Loyalty')}${fmt(x.dmh,'Mental')}</div></div>`;
 const sel=S2.filter(x=>x.pos!='none'),out=S2.filter(x=>x.pos=='none'),quiet=out.filter(x=>(x.sit=='notSel'||x.sit=='trainee')&&WL.mood[x.em][1]=='neu'),loud=out.filter(x=>!quiet.includes(x));
 return`<div class="c wlreact"><h3>Member reactions</h3>${sel.length?`<h4>Selected (${sel.length})</h4><div class="wlrg">${sel.map(card).join('')}</div>`:''}${loud.length?`<h4>Not selected</h4><div class="wlrg">${loud.map(card).join('')}</div>`:''}${quiet.length?`<p class="st">${quiet.map(x=>esc(x.m.name)).join(', ')} took the news calmly.</p>`:''}</div>`}
const _wlStart=startSingle;startSingle=function(){const p=S.pj,was=p&&p.status;const r=_wlStart.apply(this,arguments);if(p&&was=='draft'&&p.status=='producing')try{const L=wlReact(p);ui.wlLast=L;if(ui.mod&&ui.mod.t=='html')ui.mod.h+=wlReactHtml(L);else if(L.length)ui.mod={t:'html',h:'<h2 class="ht">Senbatsu announced</h2>'+wlReactHtml(L)};render()}catch(e){console.error(e)}return r};

// ---- one-time backfill of Senbatsu history from released title tracks (existing saves) -------------
function wlBackfill(){const R=(typeof plRelList=='function'?plRelList():[]);const rel=S.singles.slice().filter(x=>x.mainId).sort((a,b)=>(a.relDay??a.day??0)-(b.relDay??b.day??0));
 S.members.forEach(m=>{if(m.senRec)return;const r=srOf(m);rel.forEach(x=>{const key=x.pid||x.rid,o=S.songs[x.mainId],h=(m.hist||[]).find(h=>h.rid==x.rid&&h.song==x.mainId),day=x.relDay??x.day??0;
  if(h){const nR=h.rows||(o&&o.fm?nRows(o.fm.sl):1),pos=h.center?'center':h.row==null?'mid':h.row==0?'front':(nR>1&&h.row==nR-1)?'back':'mid';wlRecord(m,pos,key,x.title,day)}
  else{const g=relGroup(x);if(m.group==g&&(m.joined==null||m.joined<=day)&&(m.tjoined!=null&&m.tjoined<=day||m.status=='trainee'))wlRecord(m,'none',key,x.title,day)}})});void R}
function wlMigrate(){S.members.forEach(m=>{wlOf(m)});wlBackfill();S.wlAnn=Array.isArray(S.wlAnn)?S.wlAnn:[];if(S.pj&&S.pj.status=='producing'&&S.pj.id&&!S.wlAnn.includes(S.pj.id))S.wlAnn.push(S.pj.id);S.wlBond=S.wlBond&&typeof S.wlBond=='object'?S.wlBond:{};S.members.forEach(m=>{if(m.wel.leave&&S.day>=m.wel.leave.ret)wlLeaveEnd(m)});ui.wlN=[]}
const _wlMig=migrate;migrate=function(){const r=_wlMig.apply(this,arguments);try{wlMigrate()}catch(e){console.error(e)}return r};
// new members (auditions) start healthy
const _wlRender=render;render=function(){try{if(S&&S.members)S.members.forEach(m=>{if(!m.wel)wlOf(m)});if(S&&ui.wlN&&ui.wlN.length&&!ui.mod&&!ui.t){ui.mod={t:'html',h:`<h2 class="ht">Member wellness</h2><ul class="ms wln">${ui.wlN.join('')}</ul>`};ui.wlN=[]}}catch(e){console.error(e)}return _wlRender.apply(this,arguments)};

// ---- history text --------------------------------------------------------------------------------
const _wlEvText=evText;evText=function(e){switch(e&&e.t){case'leave_start':return`Started ${WLT[e.lt]||'leave'} (returns ${longDate(e.ret)})`;case'leave_end':return`Returned from ${WLT[e.lt]||'leave'}`;case'first_center':return`First Center position: “${esc(e.title||'')}”`;case'first_sen':return`First Senbatsu selection: “${esc(e.title||'')}”`}return _wlEvText.apply(this,arguments)};

// ---- profile: WELLNESS & EMOTIONS --------------------------------------------------------------------
const wlBar=(v,cls)=>`<div class="wlbar ${cls||''}"><i style="width:${cl(Math.round(v))}%"></i></div>`;
const wlLvCls=v=>v<=0?'z':v<20?'cr':v<40?'po':v<60?'no':v<80?'go':'ex';
function wlLeaveBanner(m){const L=m.wel&&m.wel.leave;if(!L)return'';const left=L.ret-S.day;return`<div class="wlleave"><b>🏥 ${WLT[L.type]}</b><div>Reason: ${L.causes.map(k=>k=='ph'?'Physical Health reached 0':'Mental Health reached 0').join(' · ')}</div><div>Started ${longDate(L.start)} · Returns <b>${longDate(L.ret)}</b> (${left} day${left!=1?'s':''} left)</div><div class="st">Away from lessons, Senbatsu, concerts, MV, handshakes and roadshows. She stays in her group and team; recovery continues during the leave.</div></div>`}
function wlProfHtml(m){const w=wlOf(m),r=srOf(m),mo=WL.mood[w.mood],lv=v=>`<span class="wllv ${wlLvCls(v)}">${WL.lv(v)}</span>`;
 const stat=(n,v,ex)=>`<div class="wls"><div class="wlsh"><b>${n}</b><span>${Math.round(v)}${ex||''}</span></div>${wlBar(v,wlLvCls(v))}</div>`;
 const btn=k=>{const no=wlCan(m,k),a=WLA[k];return`<button class="b s" ${no?'disabled':''} title="${esc(no||a.d)}" onclick="wlDo(${m.id},'${k}')">${a.n}</button>`};
 const recent=w.emo.slice(-8).reverse(),sl=r.log.slice(-6).reverse(),f=wlTrainMul(m,'sing');
 return`<div class="c wlp"><h3>Wellness &amp; Emotions</h3>${wlLeaveBanner(m)}
 <div class="wlgrid">${stat('Physical Health',w.ph)}<div class="wllvr">${lv(w.ph)}</div>${stat('Energy',m.en,'/100')}<div class="wllvr">${m.en<25?'<span class="wllv po">Tired</span>':'<span class="wllv go">Ready</span>'}</div>${stat('Mental Health',w.mh)}<div class="wllvr">${lv(w.mh)}</div></div>
 <div class="wlrow"><span class="wlmood ${mo[1]}">${mo[0]} Mood: ${w.mood}</span><span class="tag">Passion ${m.pas}</span><span class="tag">Loyalty ${m.loy}</span><span class="tag">Workload: ${wlLoadTxt(w.load)}</span><span class="tag">Stress: ${wlStrTxt(w.str)}</span>${w.red?'<span class="tag warn">Reduced Schedule</span>':''}</div>
 <div class="st">Lesson EXP ×${f.toFixed(2)}${w.mh<20?' · high-pressure activities (Center, events) unavailable':''}${w.ph<20?' · Dance lessons unavailable':''}</div>
 <div class="row wlact">${['rest','rday','check','treat','mental','talk','bond'].map(btn).join('')}<button class="b s ${w.red?'on':''}" ${w.leave?'disabled':''} onclick="wlRedTog(${m.id})">${w.red?'End Reduced Schedule':'Reduced Schedule'}</button></div>
 <div class="wl2"><div><h4>Senbatsu record</h4><div class="wlkv">${[['Selected',r.sel],['Center',r.cen],['Front Row',r.front],['Middle Row',r.mid],['Back Row',r.back],['Not Selected',r.none],['Selected in a row',r.cons],['Not selected in a row',r.consNone]].map(([a,b])=>`<div><small>${a}</small><b>${b}</b></div>`).join('')}</div>
 <div class="st">${r.firstSen?`First Senbatsu: “${esc(r.firstSen.title)}” · `:'No Senbatsu yet · '}${r.firstCen?`First Center: “${esc(r.firstCen.title)}”`:'No Center yet'}${r.lastCen&&r.prev!='center'?` · Last Center: “${esc(r.lastCen.title)}”`:''}</div>
 <ul class="wll">${sl.map(x=>`<li><b>${esc(x.title)}</b> <span class="st">${dayDate(x.day).toLocaleDateString('en-US',{month:'short',year:'numeric'})}</span> <span class="wlpos ${x.pos}">${WL.posN[x.pos]}</span></li>`).join('')||'<li class="st">No Senbatsu announcements yet.</li>'}</ul></div>
 <div><h4>Recent emotional events</h4><ul class="wll">${recent.map(x=>`<li><span class="st">${dayDate(x.day).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span> ${esc(x.txt||'')}${x.line?`<br><q>${esc(x.line)}</q>`:''}</li>`).join('')||'<li class="st">Nothing notable yet.</li>'}</ul></div></div></div>`}
const _wlProf=profHtml;profHtml=function(m,cand){let h=_wlProf.apply(this,arguments);if(cand||!m||!S.members.includes(m))return h;try{const tab=ui.ptab||'stats';if(wlAway(m))h=h.replace('</h2>',`</h2><span class="tag wltag">On ${WLT[m.wel.leave.type]}</span>`);h=h.replace('Training costs ¥10,000 and 25 Stamina; Stamina recovers 15 per day.','Lessons cost ¥10,000 and Energy (Vocal 15 · Dance 25 · Performance 20 · Variety 10); Energy recovers 15 per day. Mental Health changes lesson EXP.');if(tab=='stats'){const s=wlProfHtml(m),i=h.indexOf('<h3>Growth &amp; management</h3>');h=i>=0?h.slice(0,i)+s+h.slice(i):h+s}}catch(e){console.error(e)}return h};
// member cards: leave badge
const _wlCard=mcard;mcard=function(m){const h=_wlCard.apply(this,arguments);return wlAway(m)?h.replace('<div class="mart">',`<span class="wlbadge">On Leave</span><div class="mart">`):h};
const _wlCardT=mcardT;mcardT=function(m){const h=_wlCardT.apply(this,arguments);return wlAway(m)?h.replace('<div><b>','<div><span class="wlbadge in">On Leave</span><b>'):h};

// ---- Lesson Room: per-skill costs, Rest, condition and leave ----------------------------------------
V.training=function(){const f=ui.trf=ui.trf||{grp:'all',st:'all',sk:'name'};if(!S.members.length)return`<div class="c">${emptyBox('No idols yet. Recruit members through an audition first.')}<button class="b p" onclick="goSec('audition')">Go to Audition</button></div>`;
 const op=(a,v)=>a.map(([k,n])=>`<option value="${k}" ${String(k)==String(v)?'selected':''}>${n}</option>`).join('');
 const L=S.members.filter(m=>(f.grp=='all'||m.group==+f.grp)&&(f.st=='all'||(f.st=='act'?isAct(m):f.st=='leave'?wlAway(m):!isAct(m)))).sort((a,b)=>f.sk=='name'?a.name.localeCompare(b.name):f.sk=='en'?b.en-a.en:f.sk=='ph'?wlOf(a).ph-wlOf(b).ph:f.sk=='mh'?wlOf(a).mh-wlOf(b).mh:b[f.sk]-a[f.sk]);
 const card=m=>{const w=wlOf(m),away=!!w.leave,off=w.off==S.day,low=m.en<10||away||off,mo=WL.mood[w.mood];
  return`<div class="c trc ${low?'tired':''} ${away?'wlaway':''}"><div class="av" onclick="${prof(m.id)}">${CH.half(m,0,m.en<25?9:7)}<span class="avt">${isAct(m)?esc(teamLbl(m)):esc(TL())}</span>${away?'<span class="wlbadge">On Leave</span>':''}</div><div><div class="trh"><b>${esc(m.name)}</b> <span class="tag rr${rar(m)}">${rar(m)}</span> <span class="wlmood sm ${mo[1]}" title="Mood: ${w.mood}">${mo[0]} ${w.mood}</span></div>
  <div class="en ${m.en<25?'low':''}">Energy ${m.en}/100${bar(m.en)}</div><div class="wlmini"><span>Physical ${Math.round(w.ph)}</span>${wlBar(w.ph,wlLvCls(w.ph))}<span>Mental ${Math.round(w.mh)}</span>${wlBar(w.mh,wlLvCls(w.mh))}</div>
  ${away?`<div class="wlleave sm">🏥 ${WLT[w.leave.type]} · returns ${longDate(w.leave.ret)}</div>`:off?'<div class="st">Resting today — back tomorrow.</div>':''}
  ${ABK.map(k=>{const c=WL.cost[k],dis=away||off||m[k]>=100||m.en<c||(k=='dance'&&w.ph<20);return`<div class="trr"><b>${SKL[k]}</b><span>${m[k]}</span>${bar(m[k])}<button class="b s" ${dis?'disabled':''} title="Uses ${c} Energy" onclick="train(${m.id},'${k}')">Train −${c}</button></div>`}).join('')}
  <div class="row"><button class="b s" ${away||w.rest==S.day?'disabled':''} onclick="wlDo(${m.id},'rest')">Rest +40</button><span class="st">EXP ×${wlTrainMul(m,'sing').toFixed(2)}</span></div></div></div>`};
 return`<h2 class="ht">Lesson Room</h2><div class="c tools"><div class="row"><span class="tag rrR">Each lesson: ${yen(10000)}</span><span class="tag">Energy: Vocal −15 · Dance −25 · Performance −20 · Variety −10 · Rest +40</span><span class="tag">+1–3 points (bonus for high Potential / Passion)</span><span class="tag">Mental Health changes lesson EXP</span><span class="tag">Energy recovers +15 per day</span></div>
 <div class="row"><select onchange="ui.trf.grp=this.value;render()">${op([['all','All groups'],...S.groups.map(g=>[g.id,g.name])],f.grp)}</select><select onchange="ui.trf.st=this.value;render()">${op([['all','All statuses'],['act','Active members'],['tr',TL()+'s'],['leave','On leave']],f.st)}</select><select onchange="ui.trf.sk=this.value;render()">${op([['name','Sort: Name'],['en','Sort: Energy'],['ph','Sort: Physical Health (low first)'],['mh','Sort: Mental Health (low first)'],...ABK.map(k=>[k,'Sort: '+SKL[k]])],f.sk)}</select><span class="st">${L.length} idols</span><button class="b s" onclick="adv(1)">Next day</button></div></div>
 <div class="trg">${L.map(card).join('')||emptyBox('No idols match these filters.')}</div>`};
