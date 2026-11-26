// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Theater Management: All-Team Stage, Special Stages, Stage categories, lineups
// -------------------------------------------------------------------------------------
//  Built on the existing theater model, so every mechanic is reused, not copied: an All-Team Stage and every Special
//  Stage is simply another theater "key" next to the team keys ('t…') and Trainee keys ('tr…'):
//     'ga<groupId>'  All-Team Stage of a group — performers: every active member of the group's teams. Official Stages
//                    with the normal numbering ("OMG48 1st Stage"), transitions, Revival, schedule, history.
//     'sx<id>'       one Special Stage (S.th.sp[id]) — performers: only the teams the player selected (+ Trainees if
//                    allowed). Formats: comb (Combined Team, runs until finished), lim (One performance / One day /
//                    Limited period / Number of performances), ann (Anniversary & Seasonal, one performance).
//  Setlists (≤ 20 songs, Units, MC, Encore), costumes, formations, availability, substitutes, results, fans and history
//  are the existing Theater functions working on these keys. Members never change team.
//  Additions:
//   · Lineups: a Stage can keep extra lineups (s.lus = [{id,name,ids}]); each performance may use one (x.lu). While a
//     performance is checked / performed its Stage lineup is that lineup (default: the Stage's own lineup).
//   · Replacement: a Special Stage performance replaces the regular performances of the participating teams on that
//     date (status cancel, x.repl); they come back if the Special performance is cancelled or moved away.
//   · Completion: one-time / count / day / period Special Stages finish automatically; Combined ones when the player
//     finishes them. Completed Special Stages keep their Stage, lineups, setlist, costumes and performance history.
//   · Theater menu categories: Team Stage · All-Team Stage · Special Stage · Waiting Stage (Stages in preparation,
//     waiting for their debut) · Revival Stage · Trainee Stage.
//  Old saves: nothing changes until the player creates an All-Team or Special Stage (S.th.ga / S.th.sp are new).
// =====================================================================================
const SPX_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
const SPX_LEAD=3; // Special Stages can be scheduled from 3 days ahead (regular Stages: 2 weeks)
function spxS(){const H=thS();if(!H.sp||typeof H.sp!='object')H.sp={};if(!H.ga||typeof H.ga!='object')H.ga={};return H}
const spxId=key=>{const m=/^sx(.+)$/.exec(String(key||''));return m?m[1]:null};
const spxOf=key=>{const id=spxId(key);return id&&S&&S.th&&S.th.sp?S.th.sp[id]||null:null};
const thIsGa=key=>/^ga/.test(String(key||'')),thIsSx=key=>/^sx/.test(String(key||''));
const SPX_FMT={comb:['Combined Team','รวมทีม'],lim:['Limited / One-Time','จำกัดรอบ / ครั้งเดียว'],ann:['Anniversary / Seasonal','ครบรอบ / เทศกาล']};
const SPX_DUR={one:['One performance','แสดงครั้งเดียว'],day:['One day','วันเดียว'],period:['Limited period','ช่วงเวลาที่กำหนด'],count:['Number of performances','จำนวนรอบที่กำหนด']};
const SPX_TPL=[['team','Team Anniversary','ครบรอบทีม'],['group','Group Anniversary','ครบรอบวง'],['val',"Valentine's Day",'วาเลนไทน์'],['xmas','Christmas','คริสต์มาส'],['ny','New Year','ปีใหม่'],['bday','Birthday Special','สเปเชียลวันเกิด'],['grad','Graduation Special','สเปเชียลจบการศึกษา'],['custom','Custom Special Event','อีเวนต์พิเศษ (ตั้งชื่อเอง)']];
const spxFmtN=f=>SPX_T(...(SPX_FMT[f]||SPX_FMT.comb)),spxTplN=k=>{const t=SPX_TPL.find(x=>x[0]==k);return t?SPX_T(t[1],t[2]):''};
const spxTeamsOf=gid=>((grp(gid)||{}).teams||[]);
const spxTeamNames=p=>p.teams.map(t=>(spxTeamsOf(p.gid).find(x=>x.id==t)||{}).name||t).concat(p.tr?[TL()]:[]);
const spxStage=p=>p?Object.values(thS().st).find(s=>s.k=='sx'+p.id)||null:null;
const spxDayStr=d=>thDateStr(d),spxStrDay=v=>{const a=String(v||'').split('-').map(Number);return a.length==3&&a[0]?dateDay(new Date(a[0],a[1]-1,a[2])):NaN};
const spxLive=key=>thShowsOf(key).filter(x=>x.st!='cancel');
function spxDurTxt(p){if(p.fmt=='comb')return SPX_T('Runs until you finish it','แสดงจนกว่าคุณจะปิด');if(p.fmt=='ann')return SPX_T('One performance','แสดงครั้งเดียว')+(p.date!=null?' · '+jd(p.date):'');const d=p.dur||{};
 return d.t=='count'?SPX_T(`${d.n} performances`,`${d.n} รอบ`):d.t=='day'?SPX_T('One day','วันเดียว')+' · '+jd(d.from):d.t=='period'?`${jd(d.from)} – ${jd(d.to)}`:SPX_T('One performance','แสดงครั้งเดียว')}
function spxRemain(p){const key='sx'+p.id,done=thShowsOf(key).filter(x=>x.st=='done').length,sch=thShowsOf(key).filter(x=>x.st=='sched').length;let total=null;if(p.fmt=='ann'||(p.fmt=='lim'&&(p.dur||{}).t=='one'))total=1;else if(p.fmt=='lim'&&p.dur.t=='count')total=p.dur.n;return{done,sch,total,left:total==null?null:Math.max(0,total-done)}}
const spxStN=p=>p.status=='done'?SPX_T('Completed','จบแล้ว'):p.status=='active'?SPX_T('Active','กำลังแสดง'):SPX_T('Preparing','กำลังเตรียม');

// ---- theater keys & performers ---------------------------------------------------------------------------------------------
{const f=thKeys;thKeys=function(){const L=f.apply(this,arguments);try{if(!S||!S.th)return L;const H=spxS(),gids=[...new Set(L.map(k=>k.gid))],add=[];
  gids.forEach(gid=>{const g=grp(gid);if(!g)return;if(H.ga[gid])add.push({key:'ga'+gid,kind:'all',gid,label:g.name,color:g.color||'#f39ac7'});
   Object.values(H.sp).filter(p=>p.gid==gid).forEach(p=>add.push({key:'sx'+p.id,kind:'sp',gid,label:String(p.name).replace(/\s+stage$/i,'')||p.name,color:p.color||'#ffb86b',sp:p.id}))});return add.length?[...L,...add]:L}catch(e){console.error(e);return L}}}
function spxPool(key){const K=thK(key);if(!K)return[];if(K.kind=='all'){const T=new Set(spxTeamsOf(K.gid).map(t=>t.id));return S.members.filter(m=>m.status!='graduated'&&isAct(m)&&(m.group==K.gid&&m.tid!=null&&T.has(m.tid)||m.kn&&T.has(m.kn.tid)))}
 const p=spxOf(key);if(!p)return[];const T=new Set(p.teams);return S.members.filter(m=>m.status!='graduated'&&(isAct(m)&&(T.has(m.tid)||m.kn&&T.has(m.kn.tid))||p.tr&&m.status=='trainee'&&m.group==p.gid))}
{const f=thPool;thPool=function(key){if(!thIsGa(key)&&!thIsSx(key))return f.apply(this,arguments);if(typeof TH_PC!='undefined'&&TH_PC){const k='p|'+key;let v=TH_PC.get(k);if(!v){v=spxPool(key);TH_PC.set(k,v)}return v.slice()}return spxPool(key)}}
// substitutes of a Special Stage come only from its own eligible members (participating teams, Trainees only if allowed)
{const f=thTrainees;thTrainees=function(x,s){const r=f.apply(this,arguments);try{if(x&&thIsSx(x.k)){const P=new Set(spxPool(x.k).map(m=>m.id));return r.filter(m=>P.has(m.id))}}catch(e){}return r}}
// new theater records: no extra online membership, Special Stages: manual substitutes and a manual schedule
{const f=thOf;thOf=function(key){const T=f.apply(this,arguments);try{if(T&&!T.spxInit&&(thIsGa(key)||thIsSx(key))){T.spxInit=1;T.pk.forEach(pk=>pk.on=0);if(thIsSx(key)){T.rmode='manual';T.sched.mode='custom'}const g=grp((thK(key)||{}).gid);if(g)T.name=`${g.name} Theater`}}catch(e){}return T}}

// ---- lineups: several lineups per Stage, one per performance --------------------------------------------------------------------
const thLus=s=>s&&Array.isArray(s.lus)?s.lus:[];
// the lineup of the performance being checked / performed (by Stage id, so copies of the Stage object follow it too)
let SPX_LU=null;
function thWithLu(x,fn){let s=null,L=null;try{if(x&&x.lu){s=thStageFor(thOf(x.k),x);L=s&&thLus(s).find(l=>l.id==x.lu)}}catch(e){}if(!L)return fn();const prev=SPX_LU;SPX_LU={sid:s.id,ids:new Set(L.ids)};try{return fn()}finally{SPX_LU=prev}}
{const f=thBase;thBase=function(s){if(SPX_LU&&s&&s.id==SPX_LU.sid){const I=SPX_LU.ids;return thPool(s.k).filter(m=>I.has(m.id))}return f.apply(this,arguments)}}
{const f=thCheck;thCheck=function(x){return thWithLu(x,()=>f.apply(this,arguments))}}
{const f=thPlanned;thPlanned=function(x){return thWithLu(x,()=>f.apply(this,arguments))}}
{const f=thShowLuHtml;thShowLuHtml=function(x){return thWithLu(x,()=>f.apply(this,arguments))}}
if(typeof thMoveCheck=='function'){const f=thMoveCheck;thMoveCheck=function(x){return thWithLu(x,()=>f.apply(this,arguments))}}
function spxLuName(s,x){if(!x||!x.lu)return thLus(s).length?SPX_T('Main lineup','ไลน์อัปหลัก'):'';const L=thLus(s).find(l=>l.id==x.lu);return L?L.name:SPX_T('Main lineup','ไลน์อัปหลัก')}
function spxLuNew(sid){const s=thStage(sid);if(!s)return;s.lus=thLus(s);const base=thBase(s).map(m=>m.id);const id='lu'+(++thS().seq);s.lus.push({id,name:SPX_T(`Lineup ${s.lus.length+2}`,`ไลน์อัป ${s.lus.length+2}`),ids:base});ui.spxLu={sid,id};ui.mod={t:'html',h:spxLuHtml()};render()}
function spxLuEdit(sid,id){ui.spxLu={sid,id};ui.mod={t:'html',h:spxLuHtml()};render()}
function spxLuHtml(){const c=ui.spxLu,s=c&&thStage(c.sid),L=s&&thLus(s).find(l=>l.id==c.id);if(!L)return'';const P=thPool(s.k),on=new Set(L.ids);
 return`<h2 class="ht">${SPX_T('Lineup','ไลน์อัป')} · ${esc(L.name)}</h2><div class="row"><label class="st">${SPX_T('Name','ชื่อ')} <input value="${esc(L.name)}" maxlength="30" onchange="spxLuRen(this.value)"></label><b>${L.ids.length} ${SPX_T('member(s)','คน')}</b>
 <button class="b s" onclick="spxLuSet('all')">${SPX_T('Everyone','ทุกคน')}</button><button class="b s" onclick="spxLuSet('none')">${SPX_T('Clear','ล้าง')}</button><button class="b s" onclick="spxLuSet('main')">${SPX_T('Copy main lineup','คัดลอกไลน์อัปหลัก')}</button></div>
 <p class="st">${SPX_T('Only members eligible for this Stage are listed. Members keep their own team.','แสดงเฉพาะเมมเบอร์ที่มีสิทธิ์ในสเตจนี้ เมมเบอร์ยังอยู่ทีมเดิม')}</p><div class="g msel">${P.map(m=>`<button class="c m ${on.has(m.id)?'msel-on':''}" onclick="spxLuTog(${m.id})">${on.has(m.id)?'<i class="mselck">✔</i>':''}${ptc(m,44)}<div class="st"><b>${esc(m.name)}</b><br><small>${esc(m.status=='trainee'?TL():((typeof teamName=='function'&&teamName(m))||''))}</small></div></button>`).join('')}</div>
 <div class="row"><button class="b p" onclick="ui.mod=null;render()">${SPX_T('Done','เสร็จ')}</button><button class="b" onclick="spxLuDel()">${SPX_T('Delete lineup','ลบไลน์อัป')}</button></div>`}
const spxLuCur=()=>{const c=ui.spxLu,s=c&&thStage(c.sid);return s?[s,thLus(s).find(l=>l.id==c.id)]:[null,null]};
function spxLuTog(mid){const[s,L]=spxLuCur();if(!L)return;const i=L.ids.indexOf(mid);if(i>=0)L.ids.splice(i,1);else L.ids.push(mid);ui.mod.h=spxLuHtml();render()}
function spxLuSet(k){const[s,L]=spxLuCur();if(!L)return;L.ids=k=='all'?thPool(s.k).map(m=>m.id):k=='main'?thBase(s).map(m=>m.id):[];ui.mod.h=spxLuHtml();render()}
function spxLuRen(v){const[s,L]=spxLuCur();if(!L)return;L.name=String(v||'').trim().slice(0,30)||L.name;ui.mod.h=spxLuHtml();render()}
function spxLuDel(){const[s,L]=spxLuCur();if(!L)return;ask(SPX_T(`Delete “${L.name}”? Performances using it go back to the main lineup.`,`ลบ “${L.name}”? รอบที่ใช้ไลน์อัปนี้จะกลับไปใช้ไลน์อัปหลัก`),()=>{s.lus=thLus(s).filter(l=>l!==L);thS().sh.forEach(x=>{if(x.lu==L.id&&x.st=='sched')delete x.lu});ui.mod=null;render()},SPX_T('Delete','ลบ'))}
function spxShowLu(sid,v){const x=thS().sh.find(z=>z.id==sid);if(!x||x.st!='sched')return;if(v)x.lu=v;else delete x.lu;render()}

// ---- scheduling: Special Stage limits, lead time, replacement of the participating teams' regular performances -----------------
const spxPart=p=>{const K=new Set(p.teams.map(t=>'t'+t));if(p.tr)K.add('tr'+p.gid);return K};
{const f=thSlotErr;thSlotErr=function(key,d,sl,isNew){const p=spxOf(key);if(!p)return f.apply(this,arguments);
  if(isNew&&d<S.day+SPX_LEAD)return SPX_T(`Special Stage performances must be scheduled at least ${SPX_LEAD} days ahead.`,`ต้องจัดรอบสเปเชียลสเตจล่วงหน้าอย่างน้อย ${SPX_LEAD} วัน`);
  return f.call(this,key,d,sl,false)}} // a Special Stage never takes a slot another Stage of the theater already has
function spxLimitErr(p,key,d){const live=spxLive(key),D=p.dur||{};if(p.status=='done')return SPX_T('This Special Stage is completed.','สเปเชียลสเตจนี้จบแล้ว');
 if(p.fmt=='ann'||(p.fmt=='lim'&&D.t=='one'))return live.length>=1?SPX_T('This Special Stage has exactly one performance (already scheduled).','สเปเชียลสเตจนี้แสดงครั้งเดียว (จัดรอบแล้ว)'):'';
 if(p.fmt=='lim'&&D.t=='count'&&live.length>=D.n)return SPX_T(`All ${D.n} performances are already scheduled.`,`จัดครบ ${D.n} รอบแล้ว`);
 if(p.fmt=='lim'&&D.t=='day'&&d!=D.from)return SPX_T(`This One-Day Special Stage performs only on ${jd(D.from)}.`,`สเปเชียลสเตจวันเดียวนี้แสดงเฉพาะ ${jd(D.from)}`);
 if(p.fmt=='lim'&&D.t=='period'&&(d<D.from||d>D.to))return SPX_T(`Outside the period ${jd(D.from)} – ${jd(D.to)}.`,`อยู่นอกช่วง ${jd(D.from)} – ${jd(D.to)}`);return''}
{const f=thAdd;thAdd=function(key,d,sl,src){const p=spxOf(key);if(!p){const r=f.apply(this,arguments);if(!r&&src=='custom'){try{const x=thS().sh[thS().sh.length-1];if(x&&x.k==key)x.keep=1}catch(e){}}return r}
 if(p.status!='active'||!thOf(key).active)return SPX_T('Activate the Special Stage first (its Setlist must be complete).','เปิดใช้สเปเชียลสเตจก่อน (เซ็ตลิสต์ต้องครบ)');const e=spxLimitErr(p,key,d);if(e)return e;const r=f.apply(this,arguments);if(!r)spxSync();return r}}
// regular performances of the participating teams on a Special Stage date are replaced (and come back when it is cancelled / moved)
function spxSync(){if(!S||!S.th||!S.th.sp)return;const H=thS(),want=new Map();
 H.sh.forEach(x=>{if(!thIsSx(x.k)||x.st=='cancel')return;const p=spxOf(x.k);if(!p)return;const P=spxPart(p);H.sh.forEach(z=>{if(z===x||!P.has(z.k)||z.day!=x.day||z.keep)return;if(z.repl)want.set(z.id,x)})});
 H.sh.forEach(z=>{const w=want.get(z.id);if(w){if(z.st=='sched'){z.st='cancel';z.why=`Replaced by Special Stage “${(spxOf(w.k)||{}).name||''}”`;z.ex=1}z.repl=w.id}else if(z.repl){if(z.st=='cancel'&&z.day>S.day){z.st='sched';delete z.why;delete z.ex}delete z.repl}})}
// ---- performance: lineup, Special Stage record, completion -------------------------------------------------------------------------
{const f=thPerform;thPerform=function(x){if(!x)return f.apply(this,arguments);const H=thS(),n0=H.pf.length;
 // a Special Stage performance is not cancelled because some members are unavailable: it goes on without them (listed in the result notes and warned about in advance)
 if(thIsSx(x.k)&&x.st=='sched')x.dayOk=x.day;
 const r=thWithLu(x,()=>f.apply(this,arguments));
 try{if(H.pf.length>n0){const rec=H.pf[H.pf.length-1];if(rec&&rec.show==x.id){const s=thStage(rec.st),nm=s?spxLuName(s,x):'';if(nm)rec.lu=nm;if(thIsGa(x.k))rec.ga=1;const p=spxOf(x.k);
   if(p){p.done=(p.done|0)+1;rec.spx={id:p.id,name:p.name,fmt:p.fmt,teams:spxTeamNames(p),tpl:p.tpl||null,theme:p.theme||'',n:p.done};spxDoneCheck(p)}}}}catch(e){console.error(e)}return r}}
function spxComplete(p,why){if(!p||p.status=='done')return;const key='sx'+p.id,T=thOf(key),s=thStage(T.active)||spxStage(p);p.status='done';p.end=S.day;p.endWhy=why||'';if(s){s.status='retired';s.final=s.lastDay??S.day}T.active=null;
 thS().sh.forEach(x=>{if(x.k==key&&x.st=='sched'){x.st='cancel';x.why='Special Stage completed'}});spxSync();thN(`<li>🎭 <b>${esc(p.name)}</b> — ${SPX_T('Special Stage completed','สเปเชียลสเตจจบแล้ว')} (${spxRemain(p).done} ${SPX_T('performance(s)','รอบ')}). ${SPX_T('Its setlist, lineups, costumes and history are kept.','เซ็ตลิสต์ ไลน์อัป ชุด และประวัติยังเก็บไว้')}</li>`)}
function spxDoneCheck(p){if(!p||p.status!='active')return;const D=p.dur||{},R=spxRemain(p);
 if(p.fmt=='ann'||(p.fmt=='lim'&&(D.t=='one'||D.t=='count'))){if(R.total!=null&&R.done>=R.total)spxComplete(p,'count')}
 else if(p.fmt=='lim'&&(D.t=='day'||D.t=='period')){const end=D.t=='day'?D.from:D.to;if(S.day>=end&&!thShowsOf('sx'+p.id).some(x=>x.st=='sched'&&x.day>=S.day))spxComplete(p,'period')}}
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{if(S&&S.th&&S.th.sp){Object.values(S.th.sp).forEach(p=>{try{spxDoneCheck(p)}catch(e){}});spxSync();
  // a Special Stage never substitutes by itself: warn a few days ahead when an unavailable member still has no substitute
  thS().sh.forEach(x=>{if(!thIsSx(x.k)||x.st!='sched'||x.day>S.day+3||x.spw===x.day)return;const p=spxOf(x.k);if(!p||!thK(x.k))return;const C=thCheck(x),short=C.miss.filter(z=>!C.rp[z.id]);if(!short.length)return;x.spw=x.day;
   thN(`<li>🎭 <b>${esc(p.name)}</b> — ${thSlotTxt(x)}: ${short.map(z=>`${esc((get(z.id)||{}).name||'')} (${esc(z.why)})`).join(', ')} ${SPX_T('cannot perform. Choose substitutes or change the date (Theater › Special Stage), otherwise the performance is cancelled.','ขึ้นแสดงไม่ได้ เลือกตัวแทนหรือเปลี่ยนวัน (โรงละคร › สเปเชียลสเตจ) ไม่เช่นนั้นรอบนี้จะถูกยกเลิก')}</li>`)})}}catch(e){console.error(e)}return r}}

// ---- actions ------------------------------------------------------------------------------------------------------------------------
function spxGid(){const K=thK(thCur());return K?K.gid:gsAg()}
function spxGaCreate(){const gid=spxGid(),g=grp(gid);if(!g)return;const H=spxS();if(!H.ga[gid])H.ga[gid]={on:1,created:S.day};thOf('ga'+gid);ui.thk='ga'+gid;ui.thCat='all';ui.ths=null;
 toast(SPX_T(`${g.name} All-Team Stage theater created. Create its Stage in Stages (or a Revival Stage) — members of every team can perform, and they stay in their own teams.`,`สร้างโรงละครออลทีมสเตจของ ${g.name} แล้ว สร้างสเตจได้ที่หน้า Stages (หรือ Revival Stage) — เมมเบอร์ทุกทีมขึ้นแสดงได้ และยังอยู่ทีมเดิม`));goView('thstage')}
function spxNewOpen(fmt){const gid=spxGid(),T=spxTeamsOf(gid);ui.spxN={fmt:fmt||'comb',name:'',teams:fmt=='ann'?[]:T.slice(0,2).map(t=>t.id),tr:false,dt:'one',from:'',to:'',n:3,tpl:'team',team:(T[0]||{}).id||'',mid:'',date:'',theme:''};const N=ui.spxN;if(N.fmt=='ann'){N.teams=N.team?[N.team]:[];N.name=spxTplName(N);N.autoName=1;const d=spxTplDate(N);if(d!=null)N.date=spxDayStr(d)}ui.mod={t:'html',h:spxNewHtml()};render()}
function spxNv(k,v){const N=ui.spxN;if(!N)return;if(k=='teams'){const i=N.teams.indexOf(v);if(i>=0)N.teams.splice(i,1);else N.teams.push(v)}else N[k]=v;
 if(k=='tpl'||k=='team'||k=='mid'){const sug=spxTplDate(N);if(sug!=null)N.date=spxDayStr(sug);if(N.tpl=='group')N.teams=spxTeamsOf(spxGid()).map(t=>t.id);if(N.tpl=='team'&&N.team)N.teams=[N.team];if(!N.name||N.autoName){N.name=spxTplName(N);N.autoName=1}}
 if(k=='name')N.autoName=0;if(k=='fmt'&&v=='ann'){N.tpl=N.tpl||'team';N.teams=N.team?[N.team]:[];N.name=spxTplName(N);N.autoName=1;const sug=spxTplDate(N);if(sug!=null)N.date=spxDayStr(sug)}
 ui.mod.h=spxNewHtml();render()}
function spxNext(mo,d){const t=dayDate(S.day);for(const y of[t.getFullYear(),t.getFullYear()+1]){const x=dateDay(new Date(y,mo-1,d));if(x>=S.day+SPX_LEAD)return x}return null}
function spxTplDate(N){const g=grp(spxGid());switch(N.tpl){case'val':return spxNext(2,14);case'xmas':return spxNext(12,25);case'ny':return spxNext(1,1);
 case'group':{if(!g||g.founded==null)return null;const f=dayDate(g.founded);return spxNext(f.getMonth()+1,f.getDate())}
 case'bday':{const m=get(+N.mid);return m&&m.bd&&m.bd.mo?spxNext(m.bd.mo,m.bd.d):null}default:return null}}
function spxTplName(N){const g=grp(spxGid()),t=spxTeamsOf(spxGid()).find(x=>x.id==N.team),m=get(+N.mid),y=dayDate(S.day).getFullYear();
 switch(N.tpl){case'team':return`${t?t.name:'Team'} Anniversary Special Stage`;case'group':return`${g?g.name:'Group'} Anniversary Special Stage`;case'val':return"Valentine's Special Stage";case'xmas':return'Christmas Special Stage';case'ny':return'New Year Special Stage';
  case'bday':return`${m?m.name.split(' ')[0]:''} Birthday Special Stage`.trim();case'grad':return`${m?m.name.split(' ')[0]:''} Graduation Special Stage`.trim();default:return''}}
function spxNewHtml(){const N=ui.spxN;if(!N)return'';const gid=spxGid(),T=spxTeamsOf(gid),P=S.members.filter(m=>m.group==gid&&m.status!='graduated'),fm=N.fmt;
 const fmB=Object.entries(SPX_FMT).map(([k,v])=>`<button class="b s ${fm==k?'on p':''}" onclick="spxNv('fmt','${k}')">${SPX_T(v[0],v[1])}</button>`).join('');
 const teams=`<div class="row spxteams"><b>${SPX_T('Participating teams','ทีมที่ร่วมแสดง')}</b>${T.map(t=>`<label class="pczlk"><input type="checkbox" ${N.teams.includes(t.id)?'checked':''} onchange="spxNv('teams','${t.id}')"> ${esc(t.name)}</label>`).join('')||`<span class="st">${SPX_T('This group has no teams yet.','วงนี้ยังไม่มีทีม')}</span>`}<label class="pczlk"><input type="checkbox" ${N.tr?'checked':''} onchange="spxNv('tr',this.checked)"> ${SPX_T('Trainees may take part','ให้เด็กฝึกร่วมได้')}</label></div><p class="st">${SPX_T('Only the teams you tick can perform (and substitute). Nobody changes team.','เฉพาะทีมที่ติ๊กเท่านั้นที่ขึ้นแสดงและเป็นตัวแทนได้ ไม่มีใครย้ายทีม')}</p>`;
 let body='';
 if(fm=='comb')body=`<p class="st">${SPX_T('Two or more teams perform one Stage together, with rotating lineups, until you finish it.','สองทีมขึ้นไปแสดงสเตจเดียวกัน หมุนไลน์อัปได้ จนกว่าคุณจะปิดสเตจ')}</p>${teams}`;
 else if(fm=='lim')body=`${teams}<div class="row"><label class="st">${SPX_T('Duration','ระยะเวลา')} <select onchange="spxNv('dt',this.value)">${Object.entries(SPX_DUR).map(([k,v])=>`<option value="${k}" ${N.dt==k?'selected':''}>${SPX_T(v[0],v[1])}</option>`).join('')}</select></label>
  ${N.dt=='day'||N.dt=='period'?`<label class="st">${N.dt=='day'?SPX_T('Date','วันที่'):SPX_T('From','เริ่ม')} <input type="date" value="${N.from}" min="${spxDayStr(S.day+SPX_LEAD)}" onchange="spxNv('from',this.value)"></label>`:''}${N.dt=='period'?`<label class="st">${SPX_T('To','ถึง')} <input type="date" value="${N.to}" min="${spxDayStr(S.day+SPX_LEAD)}" onchange="spxNv('to',this.value)"></label>`:''}
  ${N.dt=='count'?`<label class="st">${SPX_T('Performances','จำนวนรอบ')} <input type="number" min="1" max="60" value="${N.n}" onchange="spxNv('n',+this.value)"></label>`:''}</div>`;
 else body=`<div class="row"><label class="st">${SPX_T('Template','แม่แบบ')} <select onchange="spxNv('tpl',this.value)">${SPX_TPL.map(([k,en,th])=>`<option value="${k}" ${N.tpl==k?'selected':''}>${SPX_T(en,th)}</option>`).join('')}</select></label>
  ${N.tpl=='team'?`<label class="st">${SPX_T('Team','ทีม')} <select onchange="spxNv('team',this.value)">${T.map(t=>`<option value="${t.id}" ${N.team==t.id?'selected':''}>${esc(t.name)}</option>`).join('')}</select></label>`:''}
  ${N.tpl=='bday'||N.tpl=='grad'?`<label class="st">${SPX_T('Member','เมมเบอร์')} <select onchange="spxNv('mid',this.value)"><option value="">—</option>${P.filter(m=>N.tpl!='grad'||m.grad).map(m=>`<option value="${m.id}" ${+N.mid==m.id?'selected':''}>${esc(m.name)}</option>`).join('')}</select></label>`:''}
  <label class="st">${SPX_T('Date','วันที่')} <input type="date" value="${N.date}" min="${spxDayStr(S.day+SPX_LEAD)}" onchange="spxNv('date',this.value)"></label></div>
  <div class="row"><label class="st" style="flex:1">${SPX_T('Theme','ธีม')} <input value="${esc(N.theme)}" maxlength="60" placeholder="${SPX_T('e.g. Thank-you night, pink lights','เช่น คืนขอบคุณแฟน ๆ ไฟสีชมพู')}" onchange="spxNv('theme',this.value)" style="width:100%"></label></div>${teams}
  <p class="st">${SPX_T('Performed once on its date. It replaces the regular performances of the participating teams on that date only.','แสดงครั้งเดียวในวันที่กำหนด แทนรอบปกติของทีมที่ร่วมแสดงเฉพาะวันนั้น')}</p>`;
 return`<h2 class="ht">${SPX_T('New Special Stage','สร้างสเปเชียลสเตจ')}</h2><div class="row">${fmB}</div><div class="row"><label class="st" style="flex:1">${SPX_T('Stage name','ชื่อสเตจ')} <input id="spxname" value="${esc(N.name)}" maxlength="40" placeholder="${SPX_T('e.g. Sakura Stage','เช่น Sakura Stage')}" onchange="spxNv('name',this.value)" style="width:100%"></label></div>${body}
 <div class="row"><button class="b p" onclick="spxCreate()">${SPX_T('Create & build the Setlist','สร้างและจัดเซ็ตลิสต์')}</button><button class="b" onclick="ui.mod=null;ui.spxN=null;render()">${SPX_T('Cancel','ยกเลิก')}</button></div>`}
function spxCreate(){const N=ui.spxN;if(!N)return;const el=document.getElementById('spxname');if(el)N.name=el.value;const name=String(N.name||'').trim().slice(0,40),gid=spxGid(),fmt=N.fmt,err=m=>toast(m,'err');
 if(!name)return err(SPX_T('Enter a Stage name.','ใส่ชื่อสเตจ'));if(!N.teams.length&&!N.tr)return err(SPX_T('Choose the participating teams.','เลือกทีมที่ร่วมแสดง'));if(fmt=='comb'&&N.teams.length<2)return err(SPX_T('A Combined Team Stage needs two or more teams.','สเตจรวมทีมต้องมีอย่างน้อย 2 ทีม'));
 const dur={t:fmt=='lim'?N.dt:'one'};if(fmt=='lim'){if(N.dt=='count'){dur.n=Math.max(1,Math.min(60,+N.n|0))}if(N.dt=='day'||N.dt=='period'){dur.from=spxStrDay(N.from);if(!Number.isFinite(dur.from)||dur.from<S.day+SPX_LEAD)return err(SPX_T(`Choose a date at least ${SPX_LEAD} days ahead.`,`เลือกวันล่วงหน้าอย่างน้อย ${SPX_LEAD} วัน`))}
  if(N.dt=='period'){dur.to=spxStrDay(N.to);if(!Number.isFinite(dur.to)||dur.to<dur.from)return err(SPX_T('Choose an end date after the start date.','เลือกวันสิ้นสุดหลังวันเริ่ม'))}if(N.dt=='day')dur.to=dur.from}
 let date=null;if(fmt=='ann'){date=spxStrDay(N.date);if(!Number.isFinite(date)||date<S.day+SPX_LEAD)return err(SPX_T(`Choose the performance date (at least ${SPX_LEAD} days ahead).`,`เลือกวันแสดง (ล่วงหน้าอย่างน้อย ${SPX_LEAD} วัน)`))}
 const H=spxS(),id='sp'+(++H.seq),key='sx'+id;H.sp[id]={id,name,fmt,gid,teams:N.teams.slice(),tr:!!N.tr,dur,tpl:fmt=='ann'?N.tpl:null,team:fmt=='ann'&&N.tpl=='team'?N.team:null,mid:N.mid?+N.mid:null,theme:fmt=='ann'?String(N.theme||'').slice(0,60):'',date,status:'draft',created:S.day,done:0,color:['#ffb86b','#9fd3ff','#c9a6ff','#ff9ac8','#8fd9b6'][Object.keys(H.sp).length%5]};
 thOf(key);const P=spxPool(key),sid='stg'+(++H.seq);
 H.st[sid]={id:sid,k:key,tpl:sid,src:null,name,status:'draft',created:S.day,units:[],uv:2,enc:{on:false,items:[]},cmode:'setlist',center:(P.slice().sort((a,b)=>b.pop-a.pop)[0]||{}).id||null,fmode:'global',gform:{o:[],fr:0},items:[{k:'ov',id:thUid(),name:'Overture'}],no:null,spx:id};
 ui.mod=null;ui.spxN=null;ui.thk=key;ui.ths=sid;ui.thCat='sp';ui.thv='set';ui.thst='songs';toast(SPX_T(`“${name}” created. Build its Setlist (up to 20 songs, Units, MC, Encore, costumes), then activate it on the Overview.`,`สร้าง “${name}” แล้ว จัดเซ็ตลิสต์ (สูงสุด 20 เพลง ยูนิต MC อังกอร์ ชุด) แล้วเปิดใช้ที่หน้า Overview`));goView('thset')}
function spxActivate(id){const p=spxS().sp[id];if(!p||p.status!='draft')return;const key='sx'+id,T=thOf(key),s=spxStage(p);if(!s)return;const e=thErr(s);if(e.length)return toast(SPX_T('The Setlist is not complete: ','เซ็ตลิสต์ยังไม่ครบ: ')+e[0],'err');
 if(!thBase(s).length)return toast(SPX_T('Nobody is eligible to perform.','ไม่มีเมมเบอร์ที่มีสิทธิ์แสดง'),'err');
 if(!s.no){T.no=(T.no|0)+1;s.no=T.no;s.orig=thSnapItems(s);s.origUnits=JSON.parse(JSON.stringify(thUnits(s)))}s.status='active';s.debut=S.day;s.runs=[{from:S.day}];T.active=s.id;p.status='active';
 if(p.fmt=='ann'&&p.date!=null&&!thShowsOf(key).length){const e2=thAdd(key,p.date,dowOf(p.date)==0||dowOf(p.date)==6?'a':'e','custom');if(e2)toast(SPX_T('Activated. The planned date could not be booked: ','เปิดใช้แล้ว แต่จองวันที่ตั้งไว้ไม่ได้: ')+e2,'err');else toast(SPX_T(`“${p.name}” is ready and scheduled for ${jd(p.date)}.`,`“${p.name}” พร้อมแล้ว และจัดแสดงวันที่ ${jd(p.date)}`))}
 else toast(SPX_T(`“${p.name}” is ready. Schedule its performances below.`,`“${p.name}” พร้อมแล้ว จัดรอบการแสดงด้านล่าง`));render()}
function spxFinish(id){const p=spxS().sp[id];if(!p||p.status!='active')return;ask(SPX_T(`Finish “${p.name}”? Remaining scheduled performances are cancelled; its history is kept.`,`ปิด “${p.name}”? รอบที่เหลือจะถูกยกเลิก ประวัติยังเก็บไว้`),()=>{spxComplete(p,'finished');render()},SPX_T('Finish','ปิดสเตจ'))}
function spxDel(id){const p=spxS().sp[id];if(!p||p.status!='draft'||thShowsOf('sx'+id).some(x=>x.st=='done'))return;ask(SPX_T(`Delete the draft “${p.name}”?`,`ลบร่าง “${p.name}”?`),()=>{const H=thS(),key='sx'+id;Object.values(H.st).filter(s=>s.k==key).forEach(s=>delete H.st[s.id]);H.sh=H.sh.filter(x=>x.k!=key);delete H.sp[id];delete H.T[key];spxSync();ui.thk=null;render()},SPX_T('Delete','ลบ'))}
// add a performance: date, time, lineup — availability is shown before it is booked
function spxAddV(k,v){ui.spxA=ui.spxA||{};ui.spxA[k]=v;render()}
function spxAddGo(key){const A=ui.spxA||{},d=spxStrDay(A.d),sl=A.sl||'e';if(!Number.isFinite(d))return toast(SPX_T('Choose a date.','เลือกวันที่'),'err');const e=thAdd(key,d,sl,'custom');if(e)return toast(e,'err');const x=thShowsOf(key).filter(z=>z.day==d&&z.sl==sl&&z.st=='sched').pop();if(x&&A.lu)x.lu=A.lu;
 const C=x?thCheck(x):null;toast(C&&C.miss.length?SPX_T(`Booked — ${C.miss.length} member(s) unavailable: choose substitutes or another date.`,`จองแล้ว — มี ${C.miss.length} คนไม่ว่าง เลือกตัวแทนหรือเปลี่ยนวัน`):SPX_T('Performance booked.','จองรอบแล้ว'),C&&C.miss.length?'err':undefined);render()}

// ---- UI ------------------------------------------------------------------------------------------------------------------------------
const SPX_CATS=[['team','Team Stage','ทีมสเตจ'],['all','All-Team Stage','ออลทีมสเตจ'],['sp','Special Stage','สเปเชียลสเตจ'],['wait','Waiting Stage','สเตจรอเปิดตัว'],['rev','Revival Stage','รีไววัลสเตจ'],['tr','Trainee Stage','สเตจเด็กฝึก']];
const spxCatOf=key=>{const k=String(key||'');return k.startsWith('tr')?'tr':k.startsWith('ga')?'all':k.startsWith('sx')?'sp':'team'};
const spxKindOk=(cat,K)=>cat=='team'?K.kind=='team':cat=='tr'?K.kind=='tr':cat=='all'?K.kind=='all':cat=='sp'?K.kind=='sp':false;
function spxCat(c){ui.thCat=c;const K=thKeys().filter(k=>spxKindOk(c,k));if(K.length&&!K.some(k=>k.key==ui.thk)){ui.thk=K[0].key;ui.ths=null;ui.thtr=null}render()}
function spxGoStage(sid){const s=thStage(sid);if(!s)return;ui.thk=s.k;ui.ths=sid;ui.thCat=spxCatOf(s.k);goView('thstage')}
function spxCatHtml(){const cat=ui.thCat||spxCatOf(thCur()),gid=spxGid(),stg=Object.values(thS().st).filter(s=>{const K=thK(s.k);return K&&K.gid==gid&&!s.gst});
 const cnt={wait:stg.filter(s=>s.status=='draft'||s.status=='upcoming').length,rev:stg.filter(s=>s.revOf).length,sp:Object.values(spxS().sp).filter(p=>p.gid==gid&&p.status!='done').length};
 return`<div class="thcats" role="tablist">${SPX_CATS.map(([k,en,th])=>`<button role="tab" class="${cat==k?'on':''}" onclick="spxCat('${k}')">${SPX_T(en,th)}${cnt[k]?`<i>${cnt[k]}</i>`:''}</button>`).join('')}</div>`}
function spxStCard(s){const T=thS().T[s.k];return`<button class="thstc ${s.status} spxst" onclick="spxGoStage('${s.id}')">${s.no?`<span class="thno sm">${ordN(s.no)}</span>`:''}<b>${esc(s.name)}</b><small>${esc(thLabel(s.k))} · ${s.status=='upcoming'&&T&&T.trans?SPX_T('debut ','เปิดตัว ')+jd(T.trans.dday):s.status}${s.revOf?' · '+SPX_T('Revival','รีไววัล'):''}</small></button>`}
{const f=thBar;thBar=function(){try{const cat=ui.thCat||spxCatOf(thCur());ui.thCat=cat;const head=spxCatHtml(),gid=spxGid();
  if(cat=='wait'){const L=Object.values(thS().st).filter(s=>{const K=thK(s.k);return K&&K.gid==gid&&!s.gst&&(s.status=='draft'||s.status=='upcoming')});return head+`<div class="c spxlist"><p class="st">${SPX_T('Stages in preparation, waiting for their debut (every theater of this group). Tap one to open it.','สเตจที่กำลังเตรียม รอเปิดตัว (ทุกโรงละครของวงนี้) แตะเพื่อเปิด')}</p><div class="thsth">${L.map(spxStCard).join('')||`<p class="st">${SPX_T('No Stage is waiting for its debut.','ไม่มีสเตจที่รอเปิดตัว')}</p>`}</div></div>`}
  if(cat=='rev'){const L=Object.values(thS().st).filter(s=>{const K=thK(s.k);return K&&K.gid==gid&&s.revOf});return head+`<div class="c spxlist"><p class="st">${SPX_T('Revival Stages of this group. Create a new one in Stages of any Team, All-Team or Trainee theater (“Revival Stage”).','รีไววัลสเตจของวงนี้ สร้างใหม่ได้ที่หน้า Stages ของทีม ออลทีม หรือเด็กฝึก (“Revival Stage”)')}</p><div class="thsth">${L.map(spxStCard).join('')||`<p class="st">${SPX_T('No Revival Stage yet.','ยังไม่มีรีไววัลสเตจ')}</p>`}</div></div>`}
  if(cat=='all'&&!thKeys().some(k=>k.kind=='all'))return head+`<div class="c spxlist"><h3>${SPX_T('All-Team Stage','ออลทีมสเตจ')}</h3><p class="st">${SPX_T('An official Stage of the whole group (e.g. “OMG48 1st Stage”): members of every team can perform, with rotating lineups. Members stay in their own teams.','สเตจทางการของทั้งวง (เช่น “OMG48 1st Stage”) เมมเบอร์ทุกทีมขึ้นแสดงได้ หมุนไลน์อัปได้ เมมเบอร์ยังอยู่ทีมเดิม')}</p><button class="b p" onclick="spxGaCreate()">${SPX_T('Open the All-Team Stage theater','เปิดโรงละครออลทีมสเตจ')}</button></div>`;
  if(cat=='sp'){const L=thKeys().filter(k=>k.kind=='sp');const cur=thCur();return head+`<div class="c spxlist"><div class="row"><b>${SPX_T('Special Stages','สเปเชียลสเตจ')}</b><span style="flex:1"></span><button class="b s p" onclick="spxNewOpen('comb')">＋ ${SPX_T('Combined Team','รวมทีม')}</button><button class="b s p" onclick="spxNewOpen('lim')">＋ ${SPX_T('Limited / One-Time','จำกัดรอบ / ครั้งเดียว')}</button><button class="b s p" onclick="spxNewOpen('ann')">＋ ${SPX_T('Anniversary / Seasonal','ครบรอบ / เทศกาล')}</button></div>
   <div class="thbar">${L.map(k=>{const p=spxOf(k.key),R=spxRemain(p);return`<button class="thtk ${k.key==cur?'on':''}" style="--tc:${k.color}" onclick="ui.thk='${k.key}';ui.ths=null;ui.thtr=null;goView('thov')"><b>${esc(p.name)}</b><small>${esc(spxFmtN(p.fmt))} · ${spxStN(p)}${R.total!=null?` · ${R.done}/${R.total}`:R.done?` · ${R.done} ${SPX_T('done','รอบ')}`:''}</small></button>`}).join('')||`<p class="st">${SPX_T('No Special Stage yet. Create one with the buttons above.','ยังไม่มีสเปเชียลสเตจ สร้างด้วยปุ่มด้านบน')}</p>`}</div></div>`}
  const all=thKeys;thKeys=function(){return all.apply(this,arguments).filter(k=>spxKindOk(cat,k))};let h;try{h=f.apply(this,arguments)}finally{thKeys=all}return head+h}catch(e){console.error(e);return f.apply(this,arguments)}}}
// pages of a Special / All-Team theater: its own panel on top of the existing Overview
function spxShowRow(x,s,canLu){const C=x.st=='sched'?thCheck(x):null,L=thLus(s),miss=C?C.miss.filter(z=>!C.rp[z.id]):[],subs=C?C.miss.filter(z=>C.rp[z.id]):[];
 const rp=thS().sh.filter(z=>z.repl==x.id).map(z=>`${thLabel(z.k)} ${TH_SLOT[z.sl]}`);const rec=x.perf&&thS().pf.find(p=>p.id==x.perf);
 return`<div class="spxsh ${x.st}"><div class="row"><b>${thSlotTxt(x)}</b><span class="tag ${x.st=='done'?'tmain':''}">${x.st=='done'?SPX_T('Performed','แสดงแล้ว'):x.st=='cancel'?SPX_T('Cancelled','ยกเลิก'):SPX_T('Scheduled','จัดไว้')}</span>
  ${x.st=='sched'&&canLu&&L.length?`<select onchange="spxShowLu('${x.id}',this.value)"><option value="">${SPX_T('Main lineup','ไลน์อัปหลัก')}</option>${L.map(l=>`<option value="${l.id}" ${x.lu==l.id?'selected':''}>${esc(l.name)}</option>`).join('')}</select>`:x.lu||L.length?`<span class="st">${esc(spxLuName(s,x))}</span>`:''}
  ${x.st=='sched'?`<button class="b s" onclick="thShowLu('${x.id}')">${SPX_T('Members & substitutes','เมมเบอร์และตัวแทน')}</button>${typeof thMoveOpen=='function'?`<button class="b s" onclick="thMoveOpen('${x.id}')">${SPX_T('Change date','เปลี่ยนวัน')}</button>`:''}<button class="b s" onclick="thShowCancel('${x.id}')">${SPX_T('Cancel','ยกเลิก')}</button>`:''}
  ${rec?`<button class="b s" onclick="thOpenPerf('${rec.id}')">${SPX_T('Result','ผลการแสดง')} · ${rec.att}/${rec.cap} · ${rec.sat}%</button>`:''}</div>
  ${rp.length?`<div class="st">${SPX_T('Replaces','แทนรอบปกติ')}: ${rp.map(esc).join(', ')}</div>`:''}${x.st=='cancel'&&x.why?`<div class="st">${esc(x.why)}</div>`:''}
  ${miss.length?`<div class="thwarn st">${SPX_T('Unavailable (no substitute chosen)','ไม่ว่าง (ยังไม่ได้เลือกตัวแทน)')}: ${miss.map(z=>`<b>${esc((get(z.id)||{}).name||'#'+z.id)}</b> — ${esc(z.why)}`).join(' · ')}</div>`:''}${subs.length?`<div class="st">${SPX_T('Substitutes','ตัวแทน')}: ${subs.map(z=>`${esc((get(z.id)||{}).name||'')} → ${esc((get(C.rp[z.id])||{}).name||'')}`).join(' · ')}</div>`:''}</div>`}
function spxLuCard(s,canEdit){const L=thLus(s);return`<div class="c spxlu"><div class="row"><b>${SPX_T('Lineups','ไลน์อัป')}</b><span class="st">${SPX_T('Main lineup','ไลน์อัปหลัก')}: ${thBase(s).length} ${SPX_T('member(s) (edit in Stages › Members)','คน (แก้ที่ Stages › Members)')}</span><span style="flex:1"></span>${canEdit?`<button class="b s p" onclick="spxLuNew('${s.id}')">＋ ${SPX_T('New lineup','ไลน์อัปใหม่')}</button>`:''}</div>
 ${L.length?`<div class="row">${L.map(l=>`<button class="b s" ${canEdit?`onclick="spxLuEdit('${s.id}','${l.id}')"`:'disabled'}>${esc(l.name)} · ${l.ids.length}</button>`).join('')}</div>`:`<p class="st">${SPX_T('Add lineups to rotate members between performances (e.g. Lineup 1 and Lineup 2); choose the lineup of each performance below.','เพิ่มไลน์อัปเพื่อหมุนเมมเบอร์ระหว่างรอบ (เช่น ไลน์อัป 1 และ 2) แล้วเลือกไลน์อัปของแต่ละรอบด้านล่าง')}</p>`}</div>`}
function spxAddForm(key,s){const A=ui.spxA=ui.spxA||{};if(A.key!=key){ui.spxA={key,d:'',sl:'e',lu:''}}const B=ui.spxA,d=spxStrDay(B.d);let chk='';
 if(Number.isFinite(d)){const e=thSlotErr(key,d,B.sl,true)||spxLimitErr(spxOf(key)||{dur:{}},key,d);if(e)chk=`<div class="thwarn st">${esc(e)}</div>`;else{const x={id:'_tmp',k:key,day:d,sl:B.sl,st:'sched',rp:{},lu:B.lu||undefined};const C=thCheck(x),miss=C.miss;
  const p=spxOf(key),P=p?spxPart(p):new Set(),rp=thS().sh.filter(z=>P.has(z.k)&&z.day==d&&z.st=='sched').map(z=>`${thLabel(z.k)} ${TH_SLOT[z.sl]}`);
  chk=`<div class="st">${C.B.length} ${SPX_T('performer(s)','คน')}${rp.length?` · ${SPX_T('replaces','แทนรอบปกติ')}: ${rp.map(esc).join(', ')}`:''}</div>${miss.length?`<div class="thwarn st">${SPX_T('Unavailable on this date','ไม่ว่างในวันนี้')}: ${miss.map(z=>`<b>${esc((get(z.id)||{}).name||'')}</b> — ${esc(z.why)}`).join(' · ')}. ${SPX_T('After booking, choose substitutes (Members & substitutes) or pick another date.','หลังจองแล้วเลือกตัวแทน (เมมเบอร์และตัวแทน) หรือเลือกวันอื่น')}</div>`:`<div class="st">${SPX_T('Everyone is available.','ทุกคนว่าง')}</div>`}`}}
 const L=thLus(s);return`<div class="row spxadd"><label class="st">${SPX_T('Date','วันที่')} <input type="date" value="${B.d}" min="${spxDayStr(S.day+(thIsSx(key)?SPX_LEAD:TH_LEAD))}" onchange="spxAddV('d',this.value)"></label><label class="st">${SPX_T('Time','รอบ')} <select onchange="spxAddV('sl',this.value)">${Object.entries(TH_SLOT).map(([k,v])=>`<option value="${k}" ${B.sl==k?'selected':''}>${SPX_T(v,k=='a'?'บ่าย':'เย็น')}</option>`).join('')}</select></label>${L.length?`<label class="st">${SPX_T('Lineup','ไลน์อัป')} <select onchange="spxAddV('lu',this.value)"><option value="">${SPX_T('Main lineup','ไลน์อัปหลัก')}</option>${L.map(l=>`<option value="${l.id}" ${B.lu==l.id?'selected':''}>${esc(l.name)}</option>`).join('')}</select></label>`:''}<button class="b p" onclick="spxAddGo('${key}')">${SPX_T('Book performance','จองรอบ')}</button></div>${chk}`}
function spxPanel(key){const K=thK(key);if(!K)return'';const T=thOf(key);
 if(K.kind=='all'){const s=thStage(T.active)||(T.trans&&thStage(T.trans.stage));const up=thShowsOf(key).filter(x=>x.st=='sched').sort((a,b)=>a.day-b.day||(a.sl=='a'?-1:1)).slice(0,8);
  return`<div class="c spxpan"><div class="row"><span class="tag tmain">${SPX_T('All-Team Stage','ออลทีมสเตจ')}</span><b>${esc(K.label)}</b><span class="st">${SPX_T('Every team of the group can perform; members stay in their own teams. Stages, Revival, schedule and history work like a Team theater.','ทุกทีมในวงขึ้นแสดงได้ เมมเบอร์ยังอยู่ทีมเดิม สเตจ รีไววัล ตารางและประวัติใช้เหมือนโรงละครทีม')}</span></div>
   ${s?spxLuCard(s,s.status!='retired'):`<p class="st">${SPX_T('Create the first Stage in Stages (new Stage or Revival Stage) and schedule its debut.','สร้างสเตจแรกที่หน้า Stages (สเตจใหม่หรือรีไววัล) แล้วกำหนดวันเปิดตัว')}</p>`}
   ${s&&up.length?`<h3>${SPX_T('Next performances','รอบถัดไป')}</h3>${up.map(x=>spxShowRow(x,thStageFor(T,x)||s,true)).join('')}`:''}</div>`}
 const p=spxOf(key);if(!p)return'';const s=spxStage(p),R=spxRemain(p),err=s?thErr(s):[],sh=thShowsOf(key).slice().sort((a,b)=>a.day-b.day||(a.sl=='a'?-1:1));
 return`<div class="c spxpan"><div class="row"><span class="tag tmain">${esc(spxFmtN(p.fmt))}</span>${p.tpl?`<span class="tag">${esc(spxTplN(p.tpl))}</span>`:''}<b class="spxnm">${esc(p.name)}</b><span class="tag ${p.status=='done'?'':'tcoup'}">${spxStN(p)}</span></div>
  <div class="fbkv">${[[SPX_T('Participating teams','ทีมที่ร่วมแสดง'),spxTeamNames(p).map(esc).join(', ')],[SPX_T('Eligible members','เมมเบอร์ที่มีสิทธิ์'),spxPool(key).length],[SPX_T('Duration','ระยะเวลา'),esc(spxDurTxt(p))],[SPX_T('Performances','รอบการแสดง'),`${R.done}${R.total!=null?' / '+R.total:''}${R.sch?` (+${R.sch} ${SPX_T('scheduled','จัดไว้')})`:''}`],...(R.left!=null?[[SPX_T('Remaining','คงเหลือ'),R.left]]:[]),...(p.theme?[[SPX_T('Theme','ธีม'),esc(p.theme)]]:[])].map(([a,b])=>`<div><small>${a}</small><b>${b}</b></div>`).join('')}</div>
  ${p.status=='draft'?`<div class="row"><button class="b" onclick="ui.ths='${s?s.id:''}';goView('thset')">${SPX_T('Edit Setlist','แก้เซ็ตลิสต์')}</button><button class="b" onclick="ui.ths='${s?s.id:''}';ui.thst='mem';goView('thset')">${SPX_T('Members','เมมเบอร์')}</button><button class="b p" ${err.length?'disabled':''} onclick="spxActivate('${p.id}')">${SPX_T('Activate','เปิดใช้')}</button><button class="b s" onclick="spxDel('${p.id}')">${SPX_T('Delete draft','ลบร่าง')}</button></div>${err.length?`<p class="thwarn st">${SPX_T('To activate','ก่อนเปิดใช้')}: ${esc(err[0])}${err.length>1?` (+${err.length-1})`:''}</p>`:`<p class="st">${SPX_T('The Setlist is complete.','เซ็ตลิสต์ครบแล้ว')}</p>`}`:''}
  ${s?spxLuCard(s,p.status!='done'):''}
  ${p.status=='active'?`<h3>${SPX_T('Schedule a performance','จัดรอบการแสดง')}</h3>${spxAddForm(key,s)}`:''}
  ${sh.length?`<h3>${SPX_T('Performances','รอบการแสดง')}</h3>${sh.map(x=>spxShowRow(x,s,p.status=='active')).join('')}`:''}
  ${p.status=='active'&&p.fmt=='comb'?`<div class="row"><button class="b" onclick="spxFinish('${p.id}')">${SPX_T('Finish this Special Stage','ปิดสเปเชียลสเตจนี้')}</button></div>`:p.status=='active'?`<div class="row"><button class="b s" onclick="spxFinish('${p.id}')">${SPX_T('Finish early','ปิดก่อนกำหนด')}</button></div>`:''}
  ${p.status=='done'?`<p class="st">${SPX_T('Completed','จบแล้ว')} ${jd(p.end)}. ${SPX_T('Its Setlist, lineups, costumes and performance history are kept (History tab).','เซ็ตลิสต์ ไลน์อัป ชุด และประวัติการแสดงยังเก็บไว้ (แท็บ History)')}</p>`:''}</div>`}
let SPX_OV=0;
{const f=V.thov;V.thov=function(){SPX_OV=1;try{return f.apply(this,arguments)}finally{SPX_OV=0}}}
{const f=thHead;thHead=function(key){let h=f.apply(this,arguments);try{const K=thK(key);if(K&&(K.kind=='all'||K.kind=='sp')){h=h.replace(/(<div class="st">)Team · /,'$1'+(K.kind=='all'?SPX_T('All-Team Stage','ออลทีมสเตจ'):SPX_T('Special Stage','สเปเชียลสเตจ'))+' · ');if(SPX_OV)h+=spxPanel(key)}}catch(e){console.error(e)}return h}}
// Special Stage names: the Stage of a Special Stage is shown with its own name (no Stage number)
{const f=thOpenPerf;thOpenPerf=function(id){f.apply(this,arguments);try{const rec=thS().pf.find(p=>p.id==id);if(rec&&ui.mod&&ui.mod.t=='html'&&(rec.spx||rec.lu)){const X=rec.spx;
  const info=`<div class="c spxrec">${X?`<b>${esc(X.name)}</b> · ${esc(spxFmtN(X.fmt))}${X.tpl?' · '+esc(spxTplN(X.tpl)):''} · ${SPX_T('Performance','รอบที่')} ${X.n} · ${SPX_T('Teams','ทีม')}: ${X.teams.map(esc).join(', ')}${X.theme?` · ${esc(X.theme)}`:''}`:''}${rec.lu?` · ${SPX_T('Lineup','ไลน์อัป')}: ${esc(rec.lu)}`:''}</div>`;ui.mod.h=ui.mod.h.replace('</h2>','</h2>'+info);render()}}catch(e){console.error(e)}}}
{const f=thPfRow;thPfRow=function(p){const h=f.apply(this,arguments);try{if(p&&(p.spx||p.lu))return h.replace('</button>',`<span class="tag">${esc(p.spx?SPX_T('Special','สเปเชียล')+(p.lu?' · '+p.lu:''):p.lu)}</span></button>`)}catch(e){}return h}}
// regular schedules: show which performances a Special Stage replaces
{const f=V.thsched;V.thsched=function(){let h=f.apply(this,arguments);try{const key=thCur(),R=thShowsOf(key).filter(z=>z.repl&&z.st=='cancel'&&z.day>=S.day);if(R.length)h=h.replace(/(<div class="c[^"]*">)/,`<div class="c spxrepl"><b>${SPX_T('Replaced by Special Stages','ถูกแทนด้วยสเปเชียลสเตจ')}</b>${R.map(z=>{const w=thS().sh.find(y=>y.id==z.repl),p=w&&spxOf(w.k);return`<div class="st">${thSlotTxt(z)} → ${esc(p?p.name:'')}${w?` (${TH_SLOT[w.sl]})`:''}</div>`}).join('')}</div>$1`)
  if(thIsSx(key)){const p=spxOf(key);h=h.replace(/(<div class="c[^"]*">)/,`<div class="c"><p class="st">${SPX_T('Book this Special Stage’s performances on its Overview (date, time, lineup and availability check).','จองรอบของสเปเชียลสเตจนี้ที่หน้า Overview (วันที่ รอบ ไลน์อัป และตรวจความว่างของเมมเบอร์)')}</p><button class="b s p" onclick="goView('thov')">${SPX_T('Open Overview','เปิด Overview')}</button></div>$1`)}}catch(e){console.error(e)}return h}}
{const f=render;render=function(){try{if(S&&S.th&&S.th.sp&&/^th/.test(String(view)))spxSync()}catch(e){}return f.apply(this,arguments)}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{if(S&&S.th){if(S.th.sp&&typeof S.th.sp!='object')S.th.sp={};if(S.th.ga&&typeof S.th.ga!='object')S.th.ga={}}}catch(e){}return r}}

// switching a Stage to "Individual song Centers": songs without their own Center start with the Setlist Center 1 and 2
{const f=thSet;thSet=function(k,v){const s=thEd(),was=s&&s.cmode,songs=s?[...s.items,...thEncO(s).items].filter(it=>it.k=='song'):[];let pre=null;try{if(k=='cmode'&&v=='song'&&s&&was!='song')pre=songs.map(it=>[it,thCen(s,it),thCen2(s,it)])}catch(e){}
 const r=f.apply(this,arguments);try{if(pre&&s.cmode=='song'){pre.forEach(([it,c,c2])=>{if(it.center==null&&c!=null)it.center=c;if(it.center2==null&&c2!=null&&c2!=it.center)it.center2=c2});render()}}catch(e){console.error(e)}return r}}
// Stage costumes: coming back from the dressing room returns to the same song on the "Costumes per song" page
{const fo=thCzOpen;thCzOpen=function(id){try{ui.thczY={id,y:window.scrollY||document.documentElement.scrollTop||0}}catch(e){}return fo.apply(this,arguments)}}
{const fb=thCzBack;thCzBack=function(){if(ui.thczY)ui.thczRet=ui.thczY;return fb.apply(this,arguments)}}
{const f=render;render=function(){const r=f.apply(this,arguments);try{const R=ui.thczRet;if(R&&view=='thset'&&!ui.czE){ui.thczRet=null;const go=()=>{try{window.scrollTo(0,R.y||0)}catch(e){}};go();requestAnimationFrame(go);setTimeout(go,80)}}catch(e){}return r}}
// Units tab: adding / removing a Unit member updates the tapped card at once instead of redrawing the whole page
// (the page holds the member grid, the song list and the member × song table: a full redraw took about a second on phones);
// the Unit cards, the song list and the table are refreshed in place a moment after the last tap
let TH_UREF=0;
function thUnitRefresh(){TH_UREF=0;try{if(view!='thset'||ui.thst!='mem'||ui.mod)return;const s=thEd();if(!s)return;const t=document.createElement('template');t.innerHTML=thMemTab(s);
 const swap=(sel,card)=>{const n=t.content.querySelector(sel),o=document.querySelector('#app '+sel);if(!n||!o)return;const N=card?n.closest('.c'):n,O=card?o.closest('.c'):o;if(!N||!O)return;O.replaceWith(N);try{if(typeof i18nApply=='function')i18nApply(N)}catch(e){}};
 swap('.thucs');swap('.thptl',1);swap('table.thmx',1)}catch(e){console.error(e);render()}}
{const f=thUnitTog;thUnitTog=function(uid,mid){if(view!='thset'||ui.thst!='mem')return f.apply(this,arguments);const s=thEd(),u=s&&thUnitOf(s,uid),before=u?u.ids.join():null;
 const R=render;let asked=false;render=function(){asked=true};let r;try{r=f.apply(this,arguments)}finally{render=R}
 if(!asked)return r;if(!u||before==u.ids.join()){render();return r}
 try{const b=document.querySelector(`#app [onclick="thUnitTog('${uid}',${mid})"]`);if(!b)throw 0;const on=u.ids.includes(mid),tx=on?'✓ In this Unit':'Add',th=typeof UIP!='undefined'&&UIP.lang=='th'&&typeof I18N_TH!='undefined';
  b.classList.toggle('on',on);const i=b.querySelector('i');if(i)i.textContent=th&&I18N_TH[tx]||tx;clearTimeout(TH_UREF);TH_UREF=setTimeout(thUnitRefresh,650)}catch(e){render()}return r}}
