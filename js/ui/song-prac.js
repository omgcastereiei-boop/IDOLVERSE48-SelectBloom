// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Song Performance Practice (extends the Practice Room, skills.js)
// -------------------------------------------------------------------------------------
//  · Preparing a song = choreography + vocals + lyrics + the member's position. They are stored per
//    member and song (S.sp.f[mid][song] = {d, v, l, pos:{positionKey: familiarity}, t: last used day})
//    but only ONE combined value is ever shown: Learning (< 70%) · Almost Ready (70–89%) · Ready (90%+).
//  · Learning speed uses existing attributes only: Dance skill (choreography, position), Vocal skill
//    (melody), Variety skill + personality + passion (memorising lyrics), motivation and condition.
//  · A known song in another position keeps choreography / vocals / lyrics; only the position has to be
//    learned, from the closest position she knows (the further away, the more practice).
//  · Automatic schedule (no player input): every Theater performance in the next 45 days gives each
//    performer (and assigned substitute) her songs and positions with that day as deadline. After the
//    day's work has used its Energy, each member practises her nearest deadlines (up to 4 songs) if she
//    still has 16+ Energy; otherwise only she skips and the practice moves to the next day, until the
//    day before the performance. Members who cannot be ready in time are reported — never marked Ready.
//    Under members (team members outside the Stage lineup) and Trainees practise the current Stage songs
//    as understudies when free.
//  · Familiarity fades after a month without practice or performance (≈1% → max 50% after a year);
//    Dance skill fades separately, only after 60 days without any dance activity.
//  · Practice History keeps 1 month; Skill Development History keeps 12 months (every skill change from
//    the existing skAdd growth, plus decay), with monthly and annual reports.
// =====================================================================================
const SPR={A:.26,READY:90,ALMOST:70,MIN_EN:16,COST:11,HOR:45,MAX:4,W:{d:.3,v:.25,l:.2,p:.25},GRACE:60};
const spT=(en,th)=>typeof i18nLang=='function'&&i18nLang()=='th'?th:en;
function spS(){if(!S.sp||typeof S.sp!='object')S.sp={v:1,f:{},h:[],ld:{},warned:{},seeded:0,run:-1};const P=S.sp;P.f=P.f||{};P.h=Array.isArray(P.h)?P.h:[];P.ld=P.ld||{};P.warned=P.warned||{};return P}
function skhS(){if(!S.skh||typeof S.skh!='object')S.skh={m:{}};S.skh.m=S.skh.m||{};return S.skh}
const sprKey=(ctx,i,n,c)=>`${ctx}|${i}/${n}${c?'c':''}`;
function spPos(k){const m=/^([a-z]+)\|(u|(\d+)\/(\d+)(c?))$/.exec(k||'');if(!m)return null;return m[2]=='u'?{ctx:m[1],u:1}:{ctx:m[1],i:+m[3],n:Math.max(1,+m[4]),c:!!m[5]}}
// how much of a known position carries over to another one (0–1)
function spSim(a,b){if(a==b)return 1;const A=spPos(a),B=spPos(b);if(!A||!B)return .4;if(A.ctx!=B.ctx)return .5;if(A.u||B.u)return .55;return Math.max(.15,1-Math.min(.85,Math.abs(A.i/A.n-B.i/B.n)*1.6+(A.c!=B.c?.25:0)))}
// forgetting: nothing in the first month, then ~1% → 50% after a year without practice or performance
const spLoss=t=>{const d=S.day-(t??S.day);return d<=30?0:Math.min(.5,.01+(d-30)/335*.49)};
const spRec=(mid,song)=>{const F=spS().f;return F[mid]&&F[mid][song]||null};
function spPosFam(r,key){if(!r||!r.pos)return 0;if(r.pos[key]!=null)return r.pos[key];let b=0;for(const k in r.pos)b=Math.max(b,r.pos[k]*spSim(k,key));return b}
function spPct(mid,song,key){const r=spRec(mid,song);if(!r)return 0;const L=1-spLoss(r.t),W=SPR.W;return Math.round((W.d*r.d+W.v*r.v+W.l*r.l+W.p*spPosFam(r,key))*L)}
const spSt=p=>p>=SPR.READY?'ready':p>=SPR.ALMOST?'almost':'learn';
const spStN=s=>({ready:spT('Ready','พร้อมแสดง'),almost:spT('Almost Ready','ใกล้พร้อม'),learn:spT('Learning','กำลังฝึก')})[s];
const spTag=p=>{const s=spSt(p);return`<span class="sptag ${s}">${p}% · ${spStN(s)}</span>`};
// apply forgetting to the stored values before practising again
function spMat(mid,song){const F=spS().f,M=F[mid]=F[mid]||{};let r=M[song];if(!r)r=M[song]={d:0,v:0,l:0,pos:{},t:S.day};const L=1-spLoss(r.t);if(L<1){r.d*=L;r.v*=L;r.l*=L;for(const k in r.pos)r.pos[k]*=L}r.t=S.day;return r}
// learning factors from existing attributes
const SP_MEM={Serious:.12,Cool:.06,Elegant:.04,Shy:.04,Genki:0,Airhead:-.1};
function spFac(m){const T=typeof trnOf=='function'?trnOf(m):{mot:50},w=typeof wlOf=='function'?wlOf(m):{ph:70,mh:70},da=skV(m,'dance')/1000,vo=skV(m,'sing')/1000,va=skV(m,'variety')/1000;
 const eff=Math.max(.55,Math.min(1.25,.65+(T.mot||50)/250+((m.pas||50)-50)/300))*((w.ph??70)<35?.85:1)*((w.mh??70)<35?.9:1);
 return{eff,d:.55+da*.9,v:.55+vo*.9,l:(.6+va*.35+(SP_MEM[m.pers]||0)+((m.pas||50)-50)/500)*1.15,p:(.55+da*.8)*1.1}}
function spLearn(m,song,key,share,mul){const r=spMat(m.id,song),F=spFac(m),a=SPR.A*share*F.eff*(mul||1),b0=spPct(m.id,song,key);if(r.pos[key]==null)r.pos[key]=spPosFam(r,key);
 r.d+=(100-r.d)*Math.min(.9,a*F.d);r.v+=(100-r.v)*Math.min(.9,a*F.v);r.l+=(100-r.l)*Math.min(.9,a*F.l);r.pos[key]+=(100-r.pos[key])*Math.min(.9,a*F.p);['d','v','l'].forEach(k=>r[k]=Math.min(100,r[k]));r.pos[key]=Math.min(100,r.pos[key]);sprTidy(r);
 return spPct(m.id,song,key)-b0}
function sprTidy(r){['d','v','l'].forEach(k=>r[k]=Math.round(r[k]*10)/10);const K=Object.keys(r.pos);K.forEach(k=>r.pos[k]=Math.round(r.pos[k]*10)/10);if(K.length>4)K.sort((a,b)=>r.pos[b]-r.pos[a]).slice(4).forEach(k=>delete r.pos[k])}
const spRate=m=>{const F=spFac(m),W=SPR.W;return Math.min(.9,SPR.A*.8*F.eff*(W.d*F.d+W.v*F.v+W.l*F.l+W.p*F.p))};
const spSess=(p,a)=>p>=SPR.READY?0:Math.ceil(Math.log((100-SPR.READY)/Math.max(1e-3,100-p))/Math.log(1-Math.max(.05,a)));

// ---- what each member has to learn (Theater performances in the next 45 days) ------------------------------------------
let SPN={k:null,v:null};
function spNeeds(){let key;try{key=S.day+'|'+thS().sh.length+'|'+thS().sh.filter(x=>x.st=='sched').map(x=>x.id+':'+JSON.stringify(x.rp||{})+JSON.stringify(x.sw||{})).join(',').length+'|'+(S.members||[]).length}catch(e){return{list:[],u:[]}}
 if(SPN.k==key)return SPN.v;const list=[],seen={},U=[],uSeen=new Set();
 try{const sh=thS().sh.filter(x=>x.st=='sched'&&x.day>S.day&&x.day<=S.day+SPR.HOR).sort((a,b)=>a.day-b.day||(a.sl=='a'?-1:1));const firstOf={};
  const SC={};sh.forEach(x=>{const man=(x.rp&&Object.keys(x.rp).length)||(x.sw&&Object.keys(x.sw).length);let C;if(x.day<=S.day+7||man)C=thCheck(x);else{const T=thOf(x.k),s0=thStageFor(T,x);if(!s0)return;if(SC[x.k+'|'+s0.id])return;SC[x.k+'|'+s0.id]=1;C={s:s0,miss:[],rp:{}}}const s=C.s;if(!s)return;const out=new Set(C.miss.map(z=>z.id));if(!firstOf[x.k])firstOf[x.k]={x,s,C};
   thAll(s).forEach(it=>{const L=thMem(s,it),n=L.length,c=thCen(s,it);L.forEach((id,i)=>{let mid=id,sub=0;if(out.has(id)){mid=C.rp[id];sub=1;if(!mid)return}const k=sprKey('th',i,n,c==id),kk=mid+'|'+it.song+'|'+k;
    if(seen[kk]){if(x.day<seen[kk].dl)Object.assign(seen[kk],{dl:x.day,xid:x.id});return}const z={mid:+mid,song:it.song,key:k,dl:x.day,xid:x.id,tk:x.k,sub,stage:s.name};seen[kk]=z;list.push(z)})})});
  // understudies: Under members (team members outside the Stage lineup) first, then Trainees
  Object.values(firstOf).forEach(({x,s})=>{let C=[];try{C=thTrainees(x,s)}catch(e){}const bench=new Set(thBench(s).map(m=>m.id));C.forEach(m=>{thAll(s).forEach(it=>{const kk=m.id+'|'+it.song;if(uSeen.has(kk))return;uSeen.add(kk);U.push({mid:m.id,song:it.song,key:sprKey('th','u'),dl:null,tk:x.k,under:bench.has(m.id),stage:s.name})})})})}catch(e){console.error(e)}
 SPN={k:key,v:{list,u:U}};return SPN.v}
// readiness projection: can she reach 90% for each deadline with the days left?
function sprPlan(mid){const N=spNeeds().list.filter(z=>z.mid==mid).sort((a,b)=>a.dl-b.dl),m=get(mid);if(!m)return[];const a=spRate(m),today=spS().run==S.day;let cum=0;
 return N.map(z=>{const p=spPct(mid,z.song,z.key);cum+=spSess(p,a)/SPR.MAX;const days=Math.max(0,z.dl-S.day-(today?1:0));return{...z,p,ok:p>=SPR.READY||cum<=days,days}})}
function spCatOf(m,z){if(!m)return'';if(m.status=='trainee'&&!m.tid)return spT('Trainee','เด็กฝึก');if(z&&z.sub)return spT('Under member','อันเดอร์');return''}

// ---- the daily schedule (after the day's work; before free self-practice) --------------------------------------------
function spHist(e){const P=spS();P.h.push(e);const lim=S.day-30;if(P.h.length&&(P.h[0].d<lim||P.h.length%40==0))P.h=P.h.filter(z=>z.d>=lim);if(P.h.length>6000)P.h=P.h.slice(-6000)}
let SKH_SRC=null;
function spDay(){const P=spS();if(P.run===S.day)return;P.run=S.day;spSeed();P.h=P.h.filter(z=>z.d>=S.day-30);P.today={};const day=S.day,N=spNeeds(),by={};N.list.forEach(z=>{if(z.dl>day)(by[z.mid]=by[z.mid]||[]).push(z)});
 Object.keys(by).forEach(mid=>{const m=get(+mid);if(!m||!S.members.includes(m))return;const w=typeof wlOf=='function'?wlOf(m):{};const L=by[mid].map(z=>({...z,p:spPct(m.id,z.song,z.key)})).filter(z=>z.p<100).sort((a,b)=>a.dl-b.dl||a.p-b.p);if(!L.length)return;
  const nd=L[0];if(w.leave){spHist({d:day,mid:m.id,song:nd.song,g:0,st:'skip',why:'leave',dl:nd.dl});return}
  if((m.en|0)<SPR.MIN_EN){spHist({d:day,mid:m.id,song:nd.song,g:0,st:nd.dl-day>1?'resched':'skip',why:'energy',en:m.en|0,dl:nd.dl});return}
  // nearest deadline first; songs that are not yet Ready first within it
  const pick=[],dl0=L[0].dl;L.filter(z=>z.p<SPR.READY).forEach(z=>{if(pick.length<SPR.MAX)pick.push(z)});if(!pick.length)L.filter(z=>z.dl==dl0).slice(0,2).forEach(z=>pick.push(z));
  spRun(m,pick,'perf')});
 // understudies (Under members first, then Trainees) practise the Stage songs when they are free
 const us={};N.u.forEach(z=>(us[z.mid]=us[z.mid]||[]).push(z));
 Object.keys(us).forEach(mid=>{const m=get(+mid);if(!m||P.today[m.id]||!S.members.includes(m))return;const w=typeof wlOf=='function'?wlOf(m):{};if(w.leave||(m.en|0)<SPR.MIN_EN)return;let busy=false;try{busy=trnBusy(m,day)}catch(e){}if(busy)return;
  const T=typeof trnOf=='function'?trnOf(m):{hab:.5,mot:50};if(Math.random()>Math.min(.8,(T.hab||.5)*(.45+(T.mot||50)/160)))return;
  const L=us[mid].map(z=>({...z,p:spPct(m.id,z.song,z.key)})).filter(z=>z.p<SPR.READY).sort((a,b)=>a.p-b.p).slice(0,2);if(L.length)spRun(m,L,'under')});
 spDecayDance();spWarnDaily()}
function spRun(m,L,kind){const P=spS(),sh=L.length>1?.8:1;let gs=0;L.forEach(z=>{gs+=spLearn(m,z.song,z.key,sh)});const dls=L.map(z=>z.dl).filter(Boolean);spHist({d:S.day,mid:m.id,song:L[0].song,s:L.length>1?L.map(z=>z.song):undefined,g:Math.round(gs/L.length*10)/10,st:'done',dl:dls.length?Math.min(...dls):undefined,u:kind=='under'?1:undefined});
 const cost=SPR.COST+(L.length>2?2:0);m.en=Math.max(0,(m.en|0)-cost);try{wlAdj(m,{load:Math.round(4+L.length*1.5),str:1},'song practice')}catch(e){}
 // the rehearsal itself is dance & vocal practice (existing growth function)
 const eff=spFac(m).eff;SKH_SRC=spT('Song practice','ซ้อมเพลง');try{skAdd(m,'dance',.3*L.length*eff);skAdd(m,'sing',.22*L.length*eff)}finally{SKH_SRC=null}
 P.ld[m.id]=S.day;P.today[m.id]=1;try{const T=trnOf(m);T.days.push(S.day);if(T.days.length>40)T.days=T.days.slice(-40)}catch(e){}}
// she rehearsed songs today, so she does not also pick a free self-practice session
{const f=trnCan;trnCan=function(m,day){const r=f.apply(this,arguments);try{const P=S.sp;if(r=='ok'&&P&&P.run==day&&P.today&&P.today[m.id])return'busy'}catch(e){}return r}}
{const f=trnDay;trnDay=function(){try{spDay()}catch(e){console.error(e)}return f.apply(this,arguments)}}
// notify the Producer once per performance about members who cannot be ready in time
function spWarnDaily(){const P=spS(),bad={};try{spNeeds().list.forEach(z=>{if(z.dl-S.day>7)return;const pl=sprPlan(z.mid).find(q=>q.song==z.song&&q.key==z.key&&q.xid==z.xid);if(pl&&!pl.ok)(bad[z.xid]=bad[z.xid]||new Set()).add(z.mid)});
 Object.entries(bad).forEach(([xid,ids])=>{const k=xid+':'+[...ids].sort().join(',');if(P.warned[xid]==k)return;P.warned[xid]=k;const x=thS().sh.find(q=>q.id==xid);if(!x||typeof thN!='function')return;
  thN(`<li>⚠ ${spT('Practice','การซ้อม')} — ${esc(thLabel(x.k))} ${jd(x.day)}: ${[...ids].map(id=>esc((get(id)||{}).name||'')).join(', ')} ${spT('may not be ready in time. Check Training › Song Practice.','อาจซ้อมไม่ทัน ตรวจสอบที่ ฝึกซ้อม › ซ้อมเพลง')}</li>`)});
 for(const k in P.warned){const x=thS().sh.find(q=>q.id==k);if(!x||x.day<S.day)delete P.warned[k]}}catch(e){console.error(e)}}

// ---- performing refreshes the songs and positions she actually performed ---------------------------------------------
function spFromSnap(rec,full){const items=(thS().snap[rec.snap]||[]).filter(z=>z.k=='song'&&z.song),P=spS();const mem=new Set(rec.mem||[]);
 items.forEach(z=>{const L=z.mem||[],n=L.length;L.forEach((id,i)=>{if(rec.mem&&!mem.has(id))return;const F=P.f[id]=P.f[id]||{},key=sprKey('th',i,n,z.center==id);let r=F[z.song];
  if(full){if(!r||r.t<=rec.day){r=F[z.song]=r||{d:0,v:0,l:0,pos:{},t:rec.day};r.d=r.v=r.l=100;r.pos[key]=100;r.t=rec.day}}
  else{r=spMat(id,z.song);if(r.pos[key]==null)r.pos[key]=spPosFam(r,key);const g=c=>c+(100-c)*.35;r.d=g(r.d);r.v=g(r.v);r.l=g(r.l);r.pos[key]=g(r.pos[key]);r.t=rec.day}
  if(!full)P.ld[id]=S.day})})}
{const f=thPerform;thPerform=function(x){const was=x&&x.st;const r=f.apply(this,arguments);try{if(x&&was=='sched'&&x.st=='done'){const rec=thS().pf.find(z=>z.id==x.perf);if(rec)spFromSnap(rec,false)}}catch(e){console.error(e)}return r}}
// existing saves: songs already performed are known (in the positions performed), then fade with time
function spSeed(){const P=spS();if(P.seeded)return;P.seeded=1;try{thS().pf.slice().sort((a,b)=>a.day-b.day).forEach(rec=>spFromSnap(rec,true))}catch(e){console.error(e)}(S.members||[]).forEach(m=>{if(P.ld[m.id]==null)P.ld[m.id]=S.day})}

// ---- Dance skill: separate decay after 60 days without any dance activity --------------------------------------------
{const f=trnRun;trnRun=function(s){SKH_SRC=s&&s.t=='group'?spT('Group practice','ซ้อมรวม'):spT('Self-practice','ซ้อมเอง');try{return f.apply(this,arguments)}finally{SKH_SRC=null;try{if(s&&s.k=='dance')(s.ids||[]).forEach(id=>spS().ld[id]=S.day)}catch(e){}}}}
const SKH_WHY={theater:['Theater performance','การแสดงเธียเตอร์'],concert:['Concert','คอนเสิร์ต'],'mini concert':['Release mini concert','มินิคอนเสิร์ตวันวางแผง'],event:['External event','งานภายนอก'],handshake:['Handshake event','งานจับมือ'],roadshow:['Roadshow','โรดโชว์'],rehearsal:['Single rehearsal','ซ้อมซิงเกิล']};
{const f=skWork;skWork=function(key,L,why){SKH_SRC=spT(...(SKH_WHY[why]||[why||'Work','งาน']));try{return f.apply(this,arguments)}finally{SKH_SRC=null;try{(L||[]).forEach(z=>{if(z&&z.da>0)spS().ld[z.id]=S.day})}catch(e){}}}}
function spDecayDance(){const P=spS();(S.members||[]).forEach(m=>{if(!['active','trainee'].includes(m.status||'active')||!m.skl)return;if(P.ld[m.id]==null){P.ld[m.id]=S.day;return}const idle=S.day-P.ld[m.id];if(idle<=SPR.GRACE)return;
 const v=m.skl.da||0;if(v<=60)return;const loss=Math.min(.8,.2+(idle-SPR.GRACE)*.002);m.skl.da=Math.max(60,v-loss);skhLog(m.id,'dance',-(v-m.skl.da),spT('Skill decay (no dance activity)','ทักษะลดลง (ไม่ได้เต้นนาน)'))})}

// ---- Skill Development History (12 months) -------------------------------------------------------------------------------
const skhMon=d=>{const t=dayDate(d);return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')};
function skhLog(mid,k,delta,src){if(!delta)return;const H=skhS(),mk=skhMon(S.day),M=H.m[mk]=H.m[mk]||{},R=M[mid]=M[mid]||{},z=R[k]=R[k]||{u:0,d:0,s:{}};if(delta>0)z.u+=delta;else z.d+=-delta;const s=src||spT('Other','อื่น ๆ');z.s[s]=(z.s[s]||0)+delta;
 const ks=Object.keys(H.m).sort();while(ks.length>12)delete H.m[ks.shift()]}
{const f=skAdd;skAdd=function(m,k,exp){const g=f.apply(this,arguments);try{if(m&&g)skhLog(m.id,k,g,SKH_SRC)}catch(e){}return g}}

// ---- UI: Practice Room tabs --------------------------------------------------------------------------------------------
const SP_TABS=[['room',['Practice Room','ห้องซ้อม']],['songs',['Song Practice','ซ้อมเพลง']],['ph',['Practice History','ประวัติการซ้อม']],['skh',['Skill Development','พัฒนาการทักษะ']]];
{const f=V.training;V.training=function(){const t=ui.spTab||'room';let h=f.apply(this,arguments);try{const bar=`<div class="sptabs">${SP_TABS.map(([k,n])=>`<button class="b s ${t==k?'p':''}" onclick="ui.spTab='${k}';render()">${spT(...n)}</button>`).join('')}</div>`;
  const i=h.indexOf('</h2>');if(i<0)return h;if(t=='room')return h.slice(0,i+5)+bar+h.slice(i+5);return h.slice(0,i+5)+bar+`<div data-notr>${t=='songs'?spSongsHtml():t=='ph'?spHistHtml():skhHtml()}</div>`}catch(e){console.error(e);return h}}}
const spSong=id=>(S.songs[id]||{}).title||id;
function spSongsHtml(){spSeed();const N=spNeeds(),f=ui.spf=ui.spf||{q:'',w:0,u:1},q=f.q.toLowerCase(),by={};N.list.forEach(z=>(by[z.mid]=by[z.mid]||[]).push(z));
 const plans=Object.keys(by).map(mid=>({m:get(+mid),P:sprPlan(+mid)})).filter(z=>z.m&&(!q||z.m.name.toLowerCase().includes(q))),warn=plans.filter(z=>z.P.some(p=>!p.ok));
 const rows=(z)=>{const P=z.P,avg=P.length?Math.round(P.reduce((a,p)=>a+p.p,0)/P.length):0,next=P.reduce((a,p)=>Math.min(a,p.dl),1e9),bad=P.filter(p=>!p.ok);
  return`<details class="c spm ${bad.length?'warn':''}"><summary><span class="spav">${ptc(z.m,36)}</span><span class="spnm"><b>${esc(z.m.name)}</b><small>${spCatOf(z.m,P.find(p=>p.sub))} ${spT('Next performance','แสดงครั้งถัดไป')}: ${jd(next)} (${spT('in','อีก')} ${next-S.day} ${spT('days','วัน')}) · ${spT('Energy','พลังงาน')} ${z.m.en|0}</small></span>${spTag(avg)}${bad.length?`<span class="spw">⚠ ${bad.length}</span>`:''}</summary>
  <div class="spsl">${P.map(p=>`<div class="sps ${p.ok?'':'bad'}"><b>${esc(spSong(p.song))}</b><span class="st">${esc(p.stage||'')} · ${spT('deadline','กำหนด')} ${jd(p.dl)}${p.sub?' · '+spT('as substitute','ในฐานะตัวแทน'):''}</span><span class="spbar"><i style="width:${p.p}%"></i></span>${spTag(p.p)}${p.ok?'':`<span class="spw">⚠ ${spT('may not be ready in time','อาจซ้อมไม่ทัน')}</span>`}</div>`).join('')}</div></details>`};
 let U='';if(f.u){const ub={};N.u.forEach(z=>(ub[z.mid]=ub[z.mid]||[]).push(z));const L=Object.keys(ub).map(mid=>({m:get(+mid),Z:ub[mid]})).filter(z=>z.m&&(!q||z.m.name.toLowerCase().includes(q)));
  U=`<div class="c"><h3>${spT('Understudies (Under members first, then Trainees)','ตัวสำรอง (อันเดอร์ก่อน แล้วจึงเด็กฝึก)')}</h3><p class="st">${spT('They practise the current Stage songs when they are free, so they are ready when a member has to be replaced.','ซ้อมเพลงของสเตจปัจจุบันเมื่อว่าง เพื่อให้พร้อมขึ้นแทนเมื่อมีเมมเบอร์ขาด')}</p><div class="spul">${L.map(z=>{const ps=z.Z.map(q=>spPct(z.m.id,q.song,q.key)),avg=Math.round(ps.reduce((a,b)=>a+b,0)/Math.max(1,ps.length)),rd=ps.filter(p=>p>=SPR.READY).length;
   return`<div class="spu"><span class="spav">${ptc(z.m,30)}</span><span class="spnm"><b>${esc(z.m.name)}</b><small>${z.Z[0].under?spT('Under member','อันเดอร์'):spT('Trainee','เด็กฝึก')} · ${esc(z.Z[0].stage||'')} · ${rd}/${ps.length} ${spT('songs ready','เพลงพร้อม')}</small></span>${spTag(avg)}</div>`}).join('')||`<p class="st">${spT('No understudies.','ไม่มีตัวสำรอง')}</p>`}</div></div>`}
 const list=(f.w?warn:plans).sort((a,b)=>Math.min(...a.P.map(p=>p.dl))-Math.min(...b.P.map(p=>p.dl))||a.m.name.localeCompare(b.m.name));
 return`<div class="c tools"><p class="st">${spT('Every performer prepares choreography, vocals, lyrics and her position for each song. Only one combined progress is shown. Practice is scheduled automatically by the nearest performance; after work, members with 16+ Energy practise, otherwise they skip that day and continue the next day until the day before the show.','เมมเบอร์ทุกคนต้องเตรียมท่าเต้น การร้อง เนื้อเพลง และตำแหน่งของตัวเองในแต่ละเพลง โดยแสดงเป็นความคืบหน้ารวมเพียงค่าเดียว ระบบจัดตารางซ้อมให้อัตโนมัติตามการแสดงที่ใกล้ที่สุด หลังเลิกงานถ้าพลังงานเหลือ 16 ขึ้นไปจะได้ซ้อม ถ้าไม่ถึงจะงดซ้อมวันนั้นแล้วไปซ้อมต่อวันถัดไป จนถึงวันก่อนการแสดง')}</p>
 <div class="row"><input placeholder="${spT('Search member','ค้นหาเมมเบอร์')}" value="${esc(f.q)}" onchange="ui.spf.q=this.value;render()"><button class="b s ${f.w?'p':''}" onclick="ui.spf.w=ui.spf.w?0:1;render()">⚠ ${spT('Not ready in time','ซ้อมไม่ทัน')} (${warn.length})</button><button class="b s ${f.u?'p':''}" onclick="ui.spf.u=ui.spf.u?0:1;render()">${spT('Understudies','ตัวสำรอง')}</button></div></div>
 ${warn.length?`<div class="c spwarn"><b>⚠ ${warn.length} ${spT('member(s) may not finish preparing before their performance.','คนอาจเตรียมตัวไม่ทันการแสดง')}</b> <span class="st">${spT('They are never marked Ready automatically. Consider a prepared substitute.','ระบบจะไม่ถือว่าพร้อมโดยอัตโนมัติ ควรพิจารณาตัวแทนที่ซ้อมพร้อมแล้ว')}</span></div>`:''}
 ${list.map(rows).join('')||`<div class="c"><p class="st">${spT('No upcoming performances to prepare for.','ไม่มีการแสดงที่ต้องเตรียมตัว')}</p></div>`}${U}`}
function spHistHtml(){const P=spS(),f=ui.sphf=ui.sphf||{q:''},q=f.q.toLowerCase(),L=P.h.filter(z=>z.d>=S.day-30).filter(z=>{const m=get(z.mid);return!q||(m&&m.name.toLowerCase().includes(q))||(z.s||[z.song]).some(sg=>spSong(sg).toLowerCase().includes(q))}).slice().reverse();
 const st=z=>z.st=='done'?`<span class="sptag ready">${spT('Completed','ซ้อมแล้ว')}</span>`:z.st=='resched'?`<span class="sptag almost">${spT('Rescheduled','เลื่อนไปวันถัดไป')}</span>`:`<span class="sptag learn">${spT('Skipped','งดซ้อม')}</span>`;
 const why=z=>z.why=='energy'?`${spT('Energy','พลังงาน')} ${z.en} (${spT('needs 16','ต้องมี 16')})`:z.why=='leave'?spT('On leave','ลาพัก'):z.u?spT('Understudy practice','ซ้อมเป็นตัวสำรอง'):'';
 return`<div class="c"><h3>${spT('Practice History · last 30 days','ประวัติการซ้อม · 30 วันล่าสุด')}</h3><div class="row"><input placeholder="${spT('Search member or song','ค้นหาเมมเบอร์หรือเพลง')}" value="${esc(f.q)}" onchange="ui.sphf.q=this.value;render()"><span class="st">${L.length} ${spT('records','รายการ')}</span></div>
 <div class="sptw"><table class="spt"><thead><tr><th>${spT('Date','วันที่')}</th><th>${spT('Member','เมมเบอร์')}</th><th>${spT('Song','เพลง')}</th><th>${spT('Progress','ความคืบหน้า')}</th><th>${spT('Status','สถานะ')}</th></tr></thead><tbody>${L.slice(0,400).map(z=>{const m=get(z.mid);return`<tr><td>${jd(z.d)}</td><td>${esc(m?m.name:'#'+z.mid)}</td><td>${(z.s||[z.song]).map(sg=>esc(spSong(sg))).join(', ')}</td><td>${z.st=='done'?'+'+z.g+'% '+((z.s||[]).length>1?spT('avg / song','เฉลี่ย/เพลง'):''):'—'}</td><td>${st(z)} <small class="st">${why(z)}</small></td></tr>`}).join('')}</tbody></table></div>${L.length?'':`<p class="st">${spT('No practice in the last 30 days.','ไม่มีการซ้อมใน 30 วันที่ผ่านมา')}</p>`}</div>`}
const SKH_K=[['sing',['Vocal','ร้องเพลง']],['dance',['Dance','เต้น']],['variety',['Variety','วาไรตี้']]];
function skhAgg(months,sk){const H=skhS(),R={};months.forEach(mk=>{const M=H.m[mk]||{};for(const mid in M){const r=R[mid]=R[mid]||{u:0,d:0,k:{},s:{}};SKH_K.forEach(([k])=>{if(sk!='all'&&sk!=k)return;const z=M[mid][k];if(!z)return;r.u+=z.u;r.d+=z.d;const a=r.k[k]=r.k[k]||{u:0,d:0};a.u+=z.u;a.d+=z.d;for(const s in z.s)r.s[s]=(r.s[s]||0)+z.s[s]})}});return R}
function skhHtml(){const H=skhS(),ks=Object.keys(H.m).sort(),f=ui.skhf=ui.skhf||{mode:'m',mon:null,sk:'all',sort:'net',dir:-1,q:''};if(!f.mon||!ks.includes(f.mon))f.mon=ks.at(-1)||skhMon(S.day);
 const year=f.mon.slice(0,4),months=f.mode=='m'?[f.mon]:ks.filter(k=>k.startsWith(year)),A=skhAgg(months,f.sk),n1=x=>(Math.round(x*10)/10).toLocaleString();
 const rows=Object.entries(A).map(([mid,r])=>({m:get(+mid),r,net:r.u-r.d})).filter(z=>z.m&&(!f.q||z.m.name.toLowerCase().includes(f.q.toLowerCase())));
 const key={name:z=>z.m.name,up:z=>z.r.u,dn:z=>z.r.d,net:z=>z.net,sing:z=>(z.r.k.sing||{u:0,d:0}).u-(z.r.k.sing||{d:0}).d,dance:z=>(z.r.k.dance||{u:0,d:0}).u-(z.r.k.dance||{d:0}).d,variety:z=>(z.r.k.variety||{u:0,d:0}).u-(z.r.k.variety||{d:0}).d}[f.sort]||(z=>z.net);
 rows.sort((a,b)=>{const A1=key(a),B1=key(b);return(typeof A1=='string'?A1.localeCompare(B1):A1-B1)*(f.dir>0?1:-1)});
 const TU=rows.reduce((a,z)=>a+z.r.u,0),TD=rows.reduce((a,z)=>a+z.r.d,0),mn=k=>{const t=new Date(+k.slice(0,4),+k.slice(5)-1,1);return t.toLocaleDateString(spT('en-US','th-TH'),{month:'short',year:'numeric'})};
 const top=rows.slice().sort((a,b)=>b.net-a.net),low=rows.filter(z=>z.r.d>0).sort((a,b)=>b.r.d-a.r.d);
 const cell=(z,k)=>{const a=z.r.k[k];if(!a)return'—';return`<span class="up">+${n1(a.u)}</span>${a.d?` <span class="dn">−${n1(a.d)}</span>`:''}`};
 const srcs=z=>Object.entries(z.r.s).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,3).map(([s,v])=>`${esc(s)} ${v>=0?'+':'−'}${n1(Math.abs(v))}`).join(' · ');
 const th=(k,n)=>`<th><button class="spsb ${f.sort==k?'on':''}" onclick="ui.skhf.dir=ui.skhf.sort=='${k}'?-ui.skhf.dir:-1;ui.skhf.sort='${k}';render()">${n}${f.sort==k?(f.dir>0?' ▲':' ▼'):''}</button></th>`;
 const monthly=f.mode=='y'?`<div class="c"><h3>${spT('Monthly summary','สรุปรายเดือน')} · ${year}</h3><div class="spmons">${months.map(k=>{const R=skhAgg([k],f.sk);let u=0,d=0;for(const i in R){u+=R[i].u;d+=R[i].d}return`<div><b>${mn(k)}</b><span class="up">+${n1(u)}</span><span class="dn">−${n1(d)}</span></div>`}).join('')}</div></div>`:'';
 return`<div class="c tools"><div class="row"><button class="b s ${f.mode=='m'?'p':''}" onclick="ui.skhf.mode='m';render()">${spT('Monthly report','รายงานรายเดือน')}</button><button class="b s ${f.mode=='y'?'p':''}" onclick="ui.skhf.mode='y';render()">${spT('Annual report','รายงานประจำปี')}</button>
 <select onchange="ui.skhf.mon=this.value;render()">${ks.slice().reverse().map(k=>`<option value="${k}" ${k==f.mon?'selected':''}>${mn(k)}</option>`).join('')||`<option>${mn(f.mon)}</option>`}</select>
 <select onchange="ui.skhf.sk=this.value;render()"><option value="all">${spT('All skills','ทุกทักษะ')}</option>${SKH_K.map(([k,n])=>`<option value="${k}" ${f.sk==k?'selected':''}>${spT(...n)}</option>`).join('')}</select>
 <input placeholder="${spT('Search member','ค้นหาเมมเบอร์')}" value="${esc(f.q)}" onchange="ui.skhf.q=this.value;render()"></div><p class="st">${spT('Every change of Vocal, Dance and Variety from practice, work, performances and decay. Kept for 12 months (separate from Practice History).','ทุกการเปลี่ยนแปลงของทักษะร้อง เต้น และวาไรตี้ จากการซ้อม งาน การแสดง และการลดลงของทักษะ เก็บไว้ 12 เดือน (แยกจากประวัติการซ้อม)')}</p></div>
 <div class="gevgrp"><div><small>${spT('Total increases','เพิ่มขึ้นรวม')}</small><b class="up">+${n1(TU)}</b></div><div><small>${spT('Total decreases','ลดลงรวม')}</small><b class="dn">−${n1(TD)}</b></div><div><small>${spT('Net change','สุทธิ')}</small><b>${TU-TD>=0?'+':'−'}${n1(Math.abs(TU-TD))}</b></div><div><small>${spT('Members with changes','เมมเบอร์ที่มีการเปลี่ยนแปลง')}</small><b>${rows.length}</b></div></div>
 ${monthly}<div class="c"><h3>${spT('Largest increases','พัฒนาขึ้นมากที่สุด')}</h3><div class="spmons">${top.slice(0,5).map(z=>`<div><b>${esc(z.m.name)}</b><span class="up">+${n1(z.r.u)}</span></div>`).join('')||'—'}</div><h3>${spT('Largest decreases','ลดลงมากที่สุด')}</h3><div class="spmons">${low.slice(0,5).map(z=>`<div><b>${esc(z.m.name)}</b><span class="dn">−${n1(z.r.d)}</span></div>`).join('')||`<span class="st">${spT('No decreases.','ไม่มีทักษะที่ลดลง')}</span>`}</div></div>
 <div class="c"><div class="sptw"><table class="spt"><thead><tr>${th('name',spT('Member','เมมเบอร์'))}${th('sing',spT('Vocal','ร้องเพลง'))}${th('dance',spT('Dance','เต้น'))}${th('variety',spT('Variety','วาไรตี้'))}${th('up',spT('Increased','เพิ่มขึ้น'))}${th('dn',spT('Decreased','ลดลง'))}${th('net',spT('Net','สุทธิ'))}<th>${spT('Sources','ที่มา')}</th></tr></thead>
 <tbody>${rows.map(z=>`<tr><td>${esc(z.m.name)}</td><td>${cell(z,'sing')}</td><td>${cell(z,'dance')}</td><td>${cell(z,'variety')}</td><td class="up">+${n1(z.r.u)}</td><td class="dn">${z.r.d?'−'+n1(z.r.d):'—'}</td><td><b>${z.net>=0?'+':'−'}${n1(Math.abs(z.net))}</b></td><td><small class="st">${srcs(z)}</small></td></tr>`).join('')}</tbody></table></div>${rows.length?'':`<p class="st">${spT('No skill changes recorded for this period yet.','ยังไม่มีการเปลี่ยนแปลงทักษะในช่วงนี้')}</p>`}</div>`}

// ---- Stage substitutes: Under members first, then Trainees; readiness, then highest Dance skill ------------------------
// readiness of a candidate for the songs and positions of the member she replaces
function spForSub(cand,s,outId){let t=0,n=0;try{thAll(s).forEach(it=>{const L=thMem(s,it),i=L.indexOf(outId);if(i<0)return;t+=spPct(cand,it.song,sprKey('th',i,L.length,thCen(s,it)==outId));n++})}catch(e){}return n?Math.round(t/n):0}
thAutoPick=function(x,s,missing,taken){const bench=new Set(thBench(s).map(m=>m.id)),C=thTrainees(x,s).filter(m=>!taken.has(m.id)),R={};
 missing.slice().sort((a,b)=>thPosRank(s,a)-thPosRank(s,b)).forEach(id=>{const L=C.filter(m=>!taken.has(m.id)).map(m=>{const p=spForSub(m.id,s,id);return{m,k:[bench.has(m.id)?0:1,-(p>=SPR.READY?2:p>=SPR.ALMOST?1:0),-skV(m,'dance'),m.id]}});
  L.sort((a,b)=>{for(let i=0;i<4;i++)if(a.k[i]!=b.k[i])return a.k[i]-b.k[i];return 0});if(L[0]){R[id]=L[0].m.id;taken.add(L[0].m.id)}});return R};
// substitute options grouped: Under members, then Trainees, with combined readiness for that position
function spSubOpts(x,s,out,sel,exclude,firstOpt){const bench=new Set(thBench(s).map(m=>m.id)),C=thTrainees(x,s).filter(c=>c.id==sel||!exclude.has(c.id)),o=c=>{const p=spForSub(c.id,s,out);return`<option value="${c.id}" ${c.id==sel?'selected':''}>${esc(c.name)} · ${p}% ${spStN(spSt(p))}${p<SPR.READY?' ⚠':''}</option>`};
 const U=C.filter(c=>bench.has(c.id)),T=C.filter(c=>!bench.has(c.id));return firstOpt+(U.length?`<optgroup label="${spT('1 · Under members','1 · อันเดอร์')}">${U.map(o).join('')}</optgroup>`:'')+(T.length?`<optgroup label="${spT('2 · Trainees','2 · เด็กฝึก')}">${T.map(o).join('')}</optgroup>`:'')}
function spSubNote(x,s,out,id){if(!id)return'';const p=spForSub(id,s,out),m=get(id),bench=new Set(thBench(s).map(z=>z.id));return` <span class="sptag ${spSt(p)}">${esc(m?m.name:'')} · ${bench.has(id)?spT('Under member','อันเดอร์'):spT('Trainee','เด็กฝึก')} · ${p}% ${spStN(spSt(p))}</span>${p<SPR.READY?`<span class="spw">⚠ ${spT('not fully prepared for this position','ยังเตรียมตัวสำหรับตำแหน่งนี้ไม่ครบ')}</span>`:''}`}
{const f=thShowLuHtml;thShowLuHtml=function(x){let h=f.apply(this,arguments);try{const s=thStageFor(thOf(x.k),x);if(!s)return h;const sw=x.sw||{};
  h=h.replace(/<select aria-label="([^"]*)" onchange="thSwSet\('([^']+)',(\d+),this.value\)">[\s\S]*?<\/select>/g,(a,lab,sid,out)=>{out=+out;const v=sw[out]?+sw[out]:null,used=new Set(Object.entries(sw).filter(([o])=>+o!=out).map(([,n])=>+n));
   return`<select aria-label="${lab}" onchange="thSwSet('${sid}',${out},this.value)">${spSubOpts(x,s,out,v,used,`<option value="">✓ ${spT('Performs','ขึ้นแสดง')}</option>`)}</select>${spSubNote(x,s,out,v)}`})}catch(e){console.error(e)}return h}}
{const f=V.thsched;V.thsched=function(){let h=f.apply(this,arguments);try{h=h.replace(/<select onchange="thRp\('([^']+)',(\d+),this.value\)">[\s\S]*?<\/select>/g,(a,sid,out)=>{out=+out;const x=thS().sh.find(z=>z.id==sid),s=x&&thStageFor(thOf(x.k),x);if(!s)return a;const v=x.rp&&x.rp[out]?+x.rp[out]:null,used=new Set(Object.entries(x.rp||{}).filter(([o])=>+o!=out).map(([,n])=>+n));
  return`<select onchange="thRp('${sid}',${out},this.value)">${spSubOpts(x,s,out,v,used,`<option value="">${spT('No replacement','ไม่มีตัวแทน')}</option>`)}</select>${spSubNote(x,s,out,v)}`});}catch(e){console.error(e)}return h}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{if(S){spS();skhS()}}catch(e){}return r}}
