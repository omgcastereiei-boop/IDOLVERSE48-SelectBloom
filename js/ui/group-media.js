// =====================================================================================
//  IDOLVERSE48: Select Bloom! — GROUP MEDIA (side feature): the group's own Variety shows, Music programs
//  and Radio programs.  State: S.gm = {v, seq, progs:[program], ki:{mid:interest}, cq:[aired today]}
//  · Program {id, gid, type var|mus|radio, name, fmt, concept, plat yt|tv, day (weekday 0–6 or null),
//    time (radio slot), logo{st,sh}, regs[], sel{reg,rot,rnd,n}, st on|hold|end, eps[], log[]}
//  · Episode {id,no,title,topic,acts[],cast[{m,src}],empty[],perf[],segs[],film,slot,bc,st,filmed,paid,res,
//    radio: host,co,guests[],day}.  Statuses — Variety/Music: plan · sched · (Filming on the filming day) ·
//    ready · aired.  Radio: sched · live · done (never filmed / ready).
//  Reuses: member schedules (gsCommits + thForbid), Energy (m.en), the Song Library (ccSongsAll / ccSongPop),
//  costumes (czFor / czLib / czD), the stage renderer (thStageSvg / fxRows), the fan economy (fan3 cohorts:
//  Oshi o / interest u / Kami k via fdInterest / fdMoveKami / fbAcquire), pairing (prSpark), Finance (finOut /
//  earn) and the Fan Community (new intents in CM_I, events fed through cmCollect → cmEmit).
// =====================================================================================
const GMD_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
const GMD_TYPES={var:['Variety Show','วาไรตี้โชว์'],mus:['Music Program','รายการเพลง'],radio:['Radio Program','รายการวิทยุ']};
const GMD_PLAT={yt:['YouTube','YouTube'],tv:['TV','ทีวี']},GMD_PLATR={yt:['YouTube Live','YouTube Live'],tv:['Radio Station','สถานีวิทยุ']};
const GMD_FMT={var:[['quiz','Quiz Show','ควิซโชว์'],['game','Game Show','เกมโชว์'],['talk','Talk Show','ทอล์กโชว์'],['chal','Challenge','ชาเลนจ์'],['cook','Cooking','ทำอาหาร'],['travel','Travel','ท่องเที่ยว'],['member','Member Variety','วาไรตี้เมมเบอร์'],['special','Special Variety','วาไรตี้พิเศษ'],['bts','Behind the Scenes','เบื้องหลัง']],
 mus:[['show','Music Show','มิวสิกโชว์'],['live','Studio Live','สตูดิโอไลฟ์'],['request','Fan Request','ตามคำขอแฟน'],['retro','Throwback Songs','ย้อนเพลงเก่า']],
 radio:[['solo','Solo Radio','วิทยุเดี่ยว'],['duo','Duo Radio','วิทยุคู่'],['group','Group Radio','วิทยุกลุ่ม'],['guest','Guest Radio','วิทยุรับแขก'],['special','Special Radio','วิทยุพิเศษ']]};
const GMD_TPL=[['var','quiz','{g} QUIZ ARENA','Members battle with buzzers in quick quizzes about music, the group and the world.','เมมแข่งตอบคำถามด้วยปุ่มกด ทั้งเรื่องเพลง เรื่องวง และความรู้รอบตัว'],['var','game','{g} GAME PARTY','Team games, punishments and silly props every week.','เกมทีม บทลงโทษ และพร็อพตลก ๆ ทุกสัปดาห์'],['var','member','{g} ROOM','The members as they really are: talks, small challenges and surprises.','ตัวตนจริงของเมม ทั้งพูดคุย ชาเลนจ์เล็ก ๆ และเซอร์ไพรส์'],['var','cook','{g} KITCHEN','Cooking battles judged by the other members.','แข่งทำอาหาร ให้เมมคนอื่นเป็นกรรมการ'],['var','travel','{g} ON THE ROAD','Day trips with a few members at a time.','ทริปไปเที่ยวกับเมมทีละไม่กี่คน'],
 ['mus','show','{g} SHOW','A weekly music show: up to three stages with talk corners in between.','มิวสิกโชว์รายสัปดาห์: สูงสุด 3 สเตจ คั่นด้วยช่วงพูดคุย'],['mus','retro','{g} SONG BOOK','Old songs on stage again, chosen by the members.','นำเพลงเก่ากลับมาแสดงใหม่ เมมเป็นคนเลือก'],
 ['radio','group','{g} RADIO NIGHT','A late-night live radio show with letters from fans.','รายการวิทยุสดตอนดึก อ่านจดหมายจากแฟน'],['radio','duo','{g} TALK TALK RADIO','Two members, one microphone each, no script.','เมมสองคน คนละไมค์ ไม่มีสคริปต์']];
const GMD_ACTS=[['quiz','Quiz competition','แข่งตอบคำถาม'],['team','Team competition','แข่งเป็นทีม'],['chal','Special challenge','ชาเลนจ์พิเศษ'],['disc','Member discussion','เมมคุยกัน'],['fanq','Fan questions','ตอบคำถามแฟน'],['inter','Member interactions','กิจกรรมคู่เมม']];
const GMD_TOPICS={var:[['music','Music & songs','เพลงและดนตรี'],['group','Group trivia','เรื่องของวง'],['food','Food','อาหาร'],['skill','Hidden talents','ความสามารถพิเศษ'],['school','School days','สมัยเรียน'],['season','Seasonal special','พิเศษตามฤดูกาล'],['fear','Fears & dares','ความกลัวและคำท้า'],['fashion','Fashion','แฟชั่น']],
 mus:[['latest','Latest single','ซิงเกิลล่าสุด'],['memories','Memories of the songs','ความทรงจำของเพลง'],['center','Center talk','คุยกับเซ็นเตอร์'],['practice','Practice stories','เรื่องการซ้อม']],
 radio:[['talk','Member Talk','คุยเรื่องเมม'],['letters','Fan Letters','จดหมายจากแฟน'],['qa','Questions from Fans','คำถามจากแฟน'],['story','Personal Stories','เรื่องส่วนตัว'],['memory','Group Memories','ความทรงจำของวง'],['rel','Member Relationships','ความสัมพันธ์ของเมม'],['special','Special Topic','หัวข้อพิเศษ']]};
const GMD_SEGS=[['open','Opening Talk','ทอล์กเปิดรายการ'],['iv','Member Interview','สัมภาษณ์เมม'],['talk','Talk Segment','ช่วงพูดคุย'],['close','Closing Talk','ทอล์กปิดรายการ']];
const GMD_SLOT=[[570,750],[780,960],[990,1170]],GMD_RTIME=[[1260,1320,'21:00'],[1320,1380,'22:00'],[1380,1440,'23:00']];
const GMD_LEAD={yt:7,tv:14},GMD_EN={var:12,mus:18,radio:6};
const GMD_COST={var:{yt:600000,tv:4500000},mus:{yt:900000,tv:6000000},radio:{yt:150000,tv:800000}};
const GMD_DOW=[['Sunday','อาทิตย์'],['Monday','จันทร์'],['Tuesday','อังคาร'],['Wednesday','พุธ'],['Thursday','พฤหัสบดี'],['Friday','ศุกร์'],['Saturday','เสาร์']];
const gmdN=a=>GMD_T(a[0],a[1]),gmdFmtN=(t,k)=>{const f=(GMD_FMT[t]||[]).find(x=>x[0]==k);return f?GMD_T(f[1],f[2]):k};
const gmdDow=d=>GMD_T(GMD_DOW[d][0],GMD_DOW[d][1]);
function gmdS(){if(!S)return null;if(!S.gm||typeof S.gm!='object')S.gm={v:1,seq:0,progs:[],ki:{},cq:[]};const G=S.gm;G.progs=Array.isArray(G.progs)?G.progs:[];G.ki=G.ki||{};G.cq=Array.isArray(G.cq)?G.cq:[];G.seq=+G.seq||0;return G}
const gmdId=p=>p+(++gmdS().seq);
const gmdP=id=>gmdS().progs.find(p=>p.id==id)||null;
const gmdE=(p,id)=>p&&p.eps.find(e=>e.id==id)||null;
const gmdIso=d=>{const t=dayDate(d);return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`};
const gmdFromIso=v=>{if(!v)return null;const t=new Date(v+'T00:00:00');return isNaN(t)?null:dateDay(t)};
const gmdLead=p=>GMD_LEAD[p.plat]||7;
const gmdStat=(m,k)=>{let v=0;try{v=+sv(m,k)}catch(e){v=+m[k]||0}return v>100?v/10:v};
const gmdMem=id=>{const m=get(id);return m&&S.members.includes(m)&&m.status!='graduated'?m:null};
const gmdPool=()=>S.members.filter(m=>m.status!='graduated'&&(isAct(m)||m.status=='trainee'));
const gmdNm=id=>{const m=get(id)||(S.alumni||[]).find(x=>x.id==id);return m?(m.stage||m.name):'?'};

// ---- schedule: the existing member schedule (gsCommits) + group-wide blocked days (thForbid) ------------------------------
function gmdWin(p,e){if(p.type=='radio'){const t=GMD_RTIME[p.time|0]||GMD_RTIME[1];return[t[0],t[1]]}return GMD_SLOT[e.slot|0]||GMD_SLOT[0]}
function gmdDayOf(p,e){return p.type=='radio'?e.day:e.film}
function gmdBusy(mid,day,s,e,exceptId){const out=[];try{gsCommits(mid,day,day).forEach(c=>{if(c.id==exceptId)return;if((c.s??0)<e&&s<(c.e??1440))out.push(c)})}catch(x){}return out}
function gmdWhy(p,e,mid,day){const m=gmdMem(mid);if(!m)return GMD_T('not an active member','ไม่ใช่เมมที่ยังทำกิจกรรม');if(day==null)return null;const[s,en]=gmdWin(p,e),B=gmdBusy(mid,day,s,en,e.id);if(B.length)return(B[0].label||B[0].type||GMD_T('another activity','งานอื่น'));
 if(day==S.day&&(m.en||0)<GMD_EN[p.type])return GMD_T(`not enough Energy (${Math.round(m.en||0)})`,`พลังงานไม่พอ (${Math.round(m.en||0)})`);return null}
function gmdDayBlock(day){try{const r=thForbid(day);return r||null}catch(e){return null}}
function gmdFilmCount(day,exceptId){let n=0;gmdS().progs.forEach(p=>{if(p.type=='radio')return;p.eps.forEach(e=>{if(e.id!=exceptId&&e.film==day&&['sched','ready','aired'].includes(e.st)&&(e.st=='sched'||e.filmed==day))n++})});return n}
function gmdFreeSlot(day,exceptId){const used=new Set();gmdS().progs.forEach(p=>{if(p.type!='radio')p.eps.forEach(e=>{if(e.id!=exceptId&&e.film==day&&(e.st=='sched'||e.filmed==day))used.add(e.slot|0)})});for(let i=0;i<3;i++)if(!used.has(i))return i;return-1}
// Group Media work appears in every member's schedule, so other systems see it as a commitment
{const f=gsCommits;gsCommits=function(mid,from,to){const L=f.apply(this,arguments);try{const G=S&&S.gm;if(!G||!G.progs.length)return L;from=from??S.day;to=to??(S.day+400);
 G.progs.forEach(p=>p.eps.forEach(e=>{const d=gmdDayOf(p,e);if(d==null||d<from||d>to)return;const on=p.type=='radio'?e.st=='sched':e.st=='sched';if(!on)return;if(!gmdCast(p,e).includes(mid))return;const[s,en]=gmdWin(p,e);
  L.push({src:'gm',id:e.id,gid:p.gid,type:'media',label:`${p.name} ${p.type=='radio'?GMD_T('live radio','วิทยุสด'):GMD_T('filming','ถ่ายทำ')} EP.${String(e.no).padStart(2,'0')}`,day:d,s,e:en})}))}catch(x){}return L}}

// ---- cast ----------------------------------------------------------------------------------------------------------------
function gmdCast(p,e){if(p.type=='radio')return[e.host,e.co,...(e.guests||[])].filter(x=>x!=null);if(p.type=='mus'){const s=new Set();(e.perf||[]).forEach(x=>(x.mids||[]).forEach(id=>s.add(id)));(e.cast||[]).forEach(c=>s.add(c.m));return[...s]}return(e.cast||[]).map(c=>c.m)}
function gmdUse(p){const U={};p.eps.forEach(e=>gmdCast(p,e).forEach(id=>U[id]=(U[id]||0)+1));return U}
// random cast: available on the filming day, spread over popularity tiers, fewest appearances first
function gmdRandom(p,e,n,exclude){const day=e.film,U=gmdUse(p),ex=new Set(exclude||[]),A=gmdPool().filter(m=>!ex.has(m.id)&&(day==null||!gmdWhy(p,e,m.id,day)));if(!A.length)return[];
 const srt=A.slice().sort((a,b)=>b.pop-a.pop),T=[srt.slice(0,Math.ceil(srt.length/3)),srt.slice(Math.ceil(srt.length/3),Math.ceil(srt.length*2/3)),srt.slice(Math.ceil(srt.length*2/3))];const out=[];let t=Math.floor(Math.random()*3);
 while(out.length<n&&T.some(x=>x.length)){const L=T[t%3];t++;if(!L.length)continue;L.sort((a,b)=>(U[a.id]||0)-(U[b.id]||0)+(Math.random()-.5)*1.2);out.push(L.shift().id)}return out}
function gmdRandFill(pid,eid){const p=gmdP(pid),e=gmdE(p,eid);if(!e||!gmdEditable(e))return;if(e.film==null)return toast(GMD_T('Choose the filming date first: random members are picked from those available that day.','เลือกวันถ่ายทำก่อน ระบบจะสุ่มจากเมมที่ว่างในวันนั้น'),'err');
 const n=Math.max(1,Math.min(12,+((ui.gm&&ui.gm.rn)||p.sel.n||3)));e.cast=e.cast.filter(c=>c.src!='rnd');const pick=gmdRandom(p,e,n,e.cast.map(c=>c.m).concat(e.empty||[]));pick.forEach(id=>e.cast.push({m:id,src:'rnd'}));
 if(pick.length<n)toast(GMD_T(`Only ${pick.length} member(s) are available that day.`,`วันนั้นมีเมมว่างแค่ ${pick.length} คน`),'err');render()}
function gmdCastTog(pid,eid,mid,src){const p=gmdP(pid),e=gmdE(p,eid);if(!e||!gmdEditable(e))return;mid=+mid;const i=e.cast.findIndex(c=>c.m==mid);if(i>=0)e.cast.splice(i,1);else e.cast.push({m:mid,src:src||'rot'});e.empty=(e.empty||[]).filter(x=>x!=mid);render()}
function gmdRegFix(pid,eid,mid,act,rep){const p=gmdP(pid),e=gmdE(p,eid);if(!e)return;mid=+mid;
 if(act=='replace'){rep=+rep;if(!rep)return;const c=e.cast.find(c=>c.m==mid);if(c){c.m=rep;c.src='rep';c.for=mid}toast(GMD_T('Replaced for this episode only.','เปลี่ยนตัวเฉพาะตอนนี้แล้ว'))}
 if(act=='empty'){e.cast=e.cast.filter(c=>c.m!=mid);e.empty=[...new Set([...(e.empty||[]),mid])];toast(GMD_T('The slot stays empty for this episode.','เว้นที่ว่างไว้สำหรับตอนนี้'))}
 if(act=='cancel')return gmdCancelFilm(pid,eid);render()}
function gmdCancelFilm(pid,eid){const p=gmdP(pid),e=gmdE(p,eid);if(!e)return;if(p.type=='radio'){e.st='sched';e.day=null;e.issue=null}else{e.st='plan';e.film=null;e.slot=null;e.issue=null;if(p.plat=='yt')e.bc=null}toast(GMD_T('Filming cancelled. Everything you set up is kept: choose a new date when ready.','ยกเลิกการถ่ายทำแล้ว การตั้งค่าทั้งหมดยังอยู่ เลือกวันใหม่ได้เมื่อพร้อม'));render()}

// ---- programs ----------------------------------------------------------------------------------------------------------------
function gmdNewDraft(type){const g=grp(gsAg())||{name:'Group'},T=GMD_TPL.find(t=>t[0]==(type||'var'));ui.gm={pg:'new',d:{type:type||'var',name:T?T[2].replace('{g}',String(g.name).toUpperCase()):'',fmt:T?T[1]:GMD_FMT[type||'var'][0][0],concept:T?GMD_T(T[3],T[4]):'',plat:'yt',day:null,time:1,logo:{st:0,sh:0},regs:[],sel:{reg:1,rot:0,rnd:0,n:3}}};render()}
function gmdTpl(i){const T=GMD_TPL[+i],d=ui.gm&&ui.gm.d;if(!T||!d)return;const g=grp(gsAg())||{name:'Group'};Object.assign(d,{type:T[0],fmt:T[1],name:T[2].replace('{g}',String(g.name).toUpperCase()),concept:GMD_T(T[3],T[4])});render()}
function gmdDSet(k,v){const d=ui.gm&&ui.gm.d;if(!d)return;if(k=='name')v=String(v).replace(/[<>"`\\]/g,'').slice(0,28);if(k=='concept')v=String(v).replace(/[<>`\\]/g,'').slice(0,200);if(k=='day')v=v===''?null:+v;if(k=='time')v=+v;
 if(k=='type'){d.fmt=GMD_FMT[v][0][0];d.regs=[]}if(k=='plat'&&v=='tv'&&d.day==null)d.day=6;d[k]=v;render()}
function gmdDSel(k,v){const d=ui.gm.d;d.sel[k]=k=='n'?Math.max(1,Math.min(12,+v||3)):!!v;render()}
function gmdDReg(mid){const d=ui.gm.d;mid=+mid;const i=d.regs.indexOf(mid);if(i>=0)d.regs.splice(i,1);else d.regs.push(mid);render()}
function gmdCreate(){const d=ui.gm&&ui.gm.d;if(!d)return;if(!String(d.name||'').trim())return toast(GMD_T('Enter a program name.','ตั้งชื่อรายการก่อน'),'err');
 if(d.plat=='tv'&&d.day==null)return toast(GMD_T('A TV program needs a fixed broadcast day.','รายการทีวีต้องมีวันออกอากาศประจำ'),'err');
 if(d.type=='radio'&&d.plat=='tv'&&d.day==null)return toast(GMD_T('Choose the weekly live day.','เลือกวันออกอากาศสดประจำสัปดาห์'),'err');
 if(gmdS().progs.some(p=>p.gid==gsAg()&&p.st!='end'&&p.name.toLowerCase()==d.name.trim().toLowerCase()))return toast(GMD_T('A program with this name already exists.','มีรายการชื่อนี้อยู่แล้ว'),'err');
 const p={id:gmdId('gp'),gid:gsAg(),type:d.type,name:d.name.trim(),fmt:d.fmt,concept:d.concept,plat:d.plat,day:d.day,time:d.time|0,logo:{...d.logo},regs:d.regs.slice(),sel:{...d.sel},st:'on',created:S.day,eps:[],log:[]};
 if(p.type=='radio'){p.sel={reg:1,rot:1,rnd:0,n:2}}gmdS().progs.push(p);ui.gm={pg:'prog',pid:p.id};toast(GMD_T(`“${p.name}” created.`,`สร้างรายการ “${p.name}” แล้ว`));render()}
function gmdProgSet(pid,k,v){const p=gmdP(pid);if(!p)return;if(k=='st'){if(p.st=='end')return;if(v=='end'){return ask(GMD_T(`End “${p.name}”? It stays in the history with all its episodes. Unfilmed episodes are dropped.`,`จบรายการ “${p.name}”? รายการและตอนทั้งหมดยังดูย้อนหลังได้ ตอนที่ยังไม่ถ่ายจะถูกยกเลิก`),()=>{p.st='end';p.ended=S.day;p.eps=p.eps.filter(e=>e.st=='aired'||e.st=='done');render()},GMD_T('End program','จบรายการ'))}p.st=v}
 if(k=='day'){if(p.plat=='tv'&&(v===''||v==null))return toast(GMD_T('TV programs must keep a fixed broadcast day.','รายการทีวีต้องมีวันออกอากาศประจำ'),'err');p.day=v===''?null:+v}
 if(k=='time')p.time=+v;if(k=='name'){v=String(v).replace(/[<>"`\\]/g,'').trim().slice(0,28);if(v)p.name=v}if(k=='concept')p.concept=String(v).replace(/[<>`\\]/g,'').slice(0,200);render()}
function gmdRegTog(pid,mid){const p=gmdP(pid);if(!p)return;mid=+mid;const i=p.regs.indexOf(mid);if(i>=0)p.regs.splice(i,1);else p.regs.push(mid);render()}

// ---- episodes ------------------------------------------------------------------------------------------------------------------
const gmdEditable=e=>e&&(e.st=='plan'||e.st=='sched');
function gmdNewEp(pid){const p=gmdP(pid);if(!p||p.st=='end')return;const no=Math.max(0,...p.eps.map(e=>e.no))+1;
 const e={id:gmdId('ge'),no,title:'',topic:(GMD_TOPICS[p.type]||[[null]])[0][0],acts:p.type=='var'?['quiz']:[],cast:[],empty:[],perf:[],segs:p.type=='mus'?['open','p1','iv','p2','talk','p3']:[],film:null,slot:null,bc:null,st:p.type=='radio'?'sched':'plan',created:S.day};
 if(p.type=='radio'){e.fmt=p.fmt;e.host=p.regs[0]??null;e.co=p.regs[1]??null;e.guests=[];e.day=null;e.st='plan'}
 else if(p.sel.reg)p.regs.filter(gmdMem).forEach(id=>e.cast.push({m:id,src:'reg'}));
 if(p.type=='mus')e.perf=[];p.eps.push(e);ui.gm={pg:'ep',pid,eid:e.id};render()}
function gmdESet(pid,eid,k,v){const p=gmdP(pid),e=gmdE(p,eid);if(!e)return;if(!gmdEditable(e))return toast(GMD_T('This episode is already filmed.','ตอนนี้ถ่ายทำแล้ว'),'err');
 if(k=='no'){v=Math.max(1,+v|0);if(p.eps.some(x=>x!==e&&x.no==v))return toast(GMD_T('That episode number is used.','เลขตอนนี้ถูกใช้แล้ว'),'err')}
 if(k=='title')v=String(v).replace(/[<>"`\\]/g,'').slice(0,60);
 if(k=='film'||k=='day'){v=gmdFromIso(v);if(v!=null&&v<=S.day-(k=='day'?1:1)&&v<S.day)return toast(GMD_T('Choose today or a later date.','เลือกวันนี้หรือหลังจากนี้'),'err')}
 if(k=='bc'){v=gmdFromIso(v)}
 if(k=='film'&&v!=null){const b=gmdDayBlock(v);if(b)return toast(GMD_T(`No filming on that day: ${b}.`,`ถ่ายทำวันนั้นไม่ได้: ${b}`),'err');if(gmdFilmCount(v,e.id)>=3)return toast(GMD_T('Three episodes are already filmed on that day (Variety + Music combined).','วันนั้นมีถ่ายทำครบ 3 ตอนแล้ว (นับรวมวาไรตี้และรายการเพลง)'),'err');e.slot=gmdFreeSlot(v,e.id);if(p.plat=='yt'&&e.bc!=null&&e.bc<v+gmdLead(p))e.bc=null}
 if(k=='day'&&v!=null){const b=gmdDayBlock(v);if(b)return toast(GMD_T(`No live broadcast on that day: ${b}.`,`ออกอากาศสดวันนั้นไม่ได้: ${b}`),'err');if(p.plat=='tv'&&p.day!=null&&dowOf(v)!=p.day)return toast(GMD_T(`This program is live every ${gmdDow(p.day)}.`,`รายการนี้ออกอากาศสดทุกวัน${gmdDow(p.day)}`),'err')}
 if(k=='bc'&&v!=null){if(e.film==null)return toast(GMD_T('Choose the filming date first.','เลือกวันถ่ายทำก่อน'),'err');if(v<e.film+gmdLead(p))return toast(GMD_T(`YouTube episodes must be filmed at least 7 days before the broadcast (latest broadcast-ready filming for this date: ${jd(v-7)}).`,`ตอน YouTube ต้องถ่ายเสร็จก่อนออกอากาศอย่างน้อย 7 วัน (ถ้าออกวันนี้ ต้องถ่ายไม่เกิน ${jd(v-7)})`),'err');if(gmdS().progs.some(q=>q===p&&q.eps.some(x=>x!==e&&x.bc==v&&x.st!='aired')))return toast(GMD_T('Another episode already airs that day.','วันนั้นมีตอนอื่นออกอากาศแล้ว'),'err')}
 if(k=='topic'||k=='fmt')v=String(v);if(k=='rn'){ui.gm.rn=Math.max(1,Math.min(12,+v||3));return render()}
 if((k=='host'||k=='co')&&v!=null){e.guests=(e.guests||[]).filter(x=>x!=v);if(k=='host'&&e.co==v)e.co=null;if(k=='co'&&e.host==v)return toast(GMD_T('Already the Main Host.','เป็นพิธีกรหลักอยู่แล้ว'),'err')}
 e[k]=v;if(e.st=='sched'&&(k=='film'||k=='day'||k=='bc'))e.st=p.type=='radio'?'plan':'plan';render()}
function gmdActTog(pid,eid,a){const p=gmdP(pid),e=gmdE(p,eid);if(!gmdEditable(e))return;const i=e.acts.indexOf(a);if(i>=0)e.acts.splice(i,1);else e.acts.push(a);render()}
function gmdSegMv(pid,eid,i,d){const p=gmdP(pid),e=gmdE(p,eid);if(!gmdEditable(e))return;const j=i+d;if(j<0||j>=e.segs.length)return;[e.segs[i],e.segs[j]]=[e.segs[j],e.segs[i]];render()}
function gmdSegTog(pid,eid,k){const p=gmdP(pid),e=gmdE(p,eid);if(!gmdEditable(e))return;const i=e.segs.indexOf(k);if(i>=0)e.segs.splice(i,1);else{const pi=e.segs.findIndex(x=>/^p/.test(x));e.segs.splice(k=='open'?0:k=='close'?e.segs.length:Math.max(0,pi+1),0,k)}render()}
// music: performances (≤3) from the Song Library; members, center and costume per performance
function gmdSongs(){let L=[];try{L=ccSongsAll()}catch(e){}return L.map(({gid,o})=>({gid,o,cat:gmdSongCat(o)}))}
function gmdSongCat(o){if(o.sp||o.srx)return GMD_T('Special','พิเศษ');if(o.unit||o.uid)return GMD_T('Unit','ยูนิต');if(o.solo)return GMD_T('Solo','โซโล');if(o.th&&!o.rel)return GMD_T('Theater Stage','เธียเตอร์สเตจ');if(o.rel&&/^Album/.test(o.rel))return GMD_T('Album','อัลบั้ม');if(o.role=='Main')return GMD_T('Single','ซิงเกิล');if(o.rel)return GMD_T('Coupling','เพลงรอง');return GMD_T('Other','อื่น ๆ')}
function gmdPerfAdd(pid,eid,key){const p=gmdP(pid),e=gmdE(p,eid);if(!gmdEditable(e))return;if(e.perf.length>=3)return toast(GMD_T('At most 3 performances per episode.','สูงสุด 3 การแสดงต่อตอน'),'err');const[gid,id]=String(key).split('|');const o=ccSong(+gid,id);if(!o)return;
 const orig=(o.slots||[]).filter(x=>gmdMem(x)),mids=orig.length?orig.slice(0,16):e.cast.map(c=>c.m).slice(0,8);e.perf.push({gid:+gid,id,mids,cen:(o.center&&mids.includes(o.center))?o.center:mids[0]??null,cz:{mode:'orig',did:null}});
 const k='p'+e.perf.length;if(!e.segs.includes(k))e.segs.push(k);ui.gm.pf=e.perf.length-1;render()}
function gmdPerfDel(pid,eid,i){const p=gmdP(pid),e=gmdE(p,eid);if(!gmdEditable(e))return;e.perf.splice(i,1);e.segs=e.segs.filter(s=>!/^p\d$/.test(s)||+s.slice(1)<=e.perf.length);render()}
function gmdPerfMem(pid,eid,i,mid){const p=gmdP(pid),e=gmdE(p,eid),x=e&&e.perf[i];if(!x||!gmdEditable(e))return;mid=+mid;const j=x.mids.indexOf(mid);if(j>=0)x.mids.splice(j,1);else{if(x.mids.length>=24)return toast(GMD_T('At most 24 performers.','สูงสุด 24 คน'),'err');x.mids.push(mid)}if(!x.mids.includes(x.cen))x.cen=x.mids[0]??null;render()}
function gmdPerfSet(pid,eid,i,k,v){const p=gmdP(pid),e=gmdE(p,eid),x=e&&e.perf[i];if(!x||!gmdEditable(e))return;if(k=='cen')x.cen=+v;if(k=='cz'){x.cz=v?{mode:'lib',did:v}:{mode:'orig',did:null}}render()}
function gmdCzOf(x,mid){const o=ccSong(x.gid,x.id);if(x.cz&&x.cz.mode=='lib'){const d=czD(x.cz.did);if(d)return d.p}try{const p=czFor(o,mid);if(p)return p}catch(e){}try{const d=czMain(o);return d&&d.p}catch(e){return null}}
// validation (setup complete, schedules, energy, daily limit, lead time)
function gmdCheck(p,e,film){const err=[],warn=[],reg=[],cast=gmdCast(p,e);
 if(p.type=='radio'){if(e.host==null)err.push(GMD_T('Choose the Main Host.','เลือกพิธีกรหลัก'));if(e.day==null)err.push(GMD_T('Choose the live broadcast date.','เลือกวันออกอากาศสด'));if(!e.topic)err.push(GMD_T('Choose a topic.','เลือกหัวข้อ'))}
 else{if(!cast.length)err.push(GMD_T('Select the participating members.','เลือกเมมที่ร่วมรายการ'));if(e.film==null)err.push(GMD_T('Set the filming date.','กำหนดวันถ่ายทำ'));if(p.type=='mus'&&!e.perf.length&&!e.segs.some(s=>!/^p/.test(s)))err.push(GMD_T('Add at least one performance or talk segment.','เพิ่มการแสดงหรือช่วงพูดคุยอย่างน้อย 1 ช่วง'));
  if(p.type=='mus')e.perf.forEach((x,i)=>{if(!x.mids.length)err.push(GMD_T(`Performance ${i+1}: choose the performers.`,`การแสดงที่ ${i+1}: เลือกเมมที่แสดง`))});
  if(p.type=='var'&&!e.acts.length)err.push(GMD_T('Choose at least one activity.','เลือกกิจกรรมอย่างน้อย 1 อย่าง'));
  if(e.film!=null){if(gmdFilmCount(e.film,e.id)>=3)err.push(GMD_T('Three episodes are already filmed on that day.','วันนั้นมีถ่ายทำครบ 3 ตอนแล้ว'));const b=gmdDayBlock(e.film);if(b)err.push(GMD_T(`No filming on ${jd(e.film)}: ${b}.`,`ถ่ายทำ ${jd(e.film)} ไม่ได้: ${b}`));
   if(p.plat=='yt'&&e.bc!=null&&e.bc<e.film+7)err.push(GMD_T('The broadcast date is less than 7 days after filming.','วันออกอากาศห่างจากวันถ่ายไม่ถึง 7 วัน'));
   if(p.plat=='tv'){const b2=gmdTvNext(p,e.film+14);warn.push(GMD_T(`First possible TV broadcast: ${jd(b2)} (${gmdDow(p.day)}, at least 14 days after filming).`,`ออกอากาศทีวีได้เร็วสุด ${jd(b2)} (วัน${gmdDow(p.day)} หลังถ่ายอย่างน้อย 14 วัน)`))}}}
 const day=gmdDayOf(p,e);if(day!=null)cast.forEach(id=>{const w=gmdWhy(p,e,id,day);if(w){const c=(e.cast||[]).find(c=>c.m==id);const isReg=p.type!='radio'&&c&&c.src=='reg';(isReg?reg:err).push(isReg?id:GMD_T(`${gmdNm(id)} is unavailable on ${jd(day)}: ${w}.`,`${gmdNm(id)} ไม่ว่างวันที่ ${jd(day)}: ${w}`))}});
 if(reg.length)err.push(GMD_T(`${reg.length} regular member(s) are unavailable: replace, leave the slot empty or cancel filming.`,`เมมประจำ ${reg.length} คนไม่ว่าง: เปลี่ยนตัว เว้นที่ว่าง หรือยกเลิกการถ่ายทำ`));
 if(p.type=='radio'&&e.day!=null&&(gmdS().progs.some(q=>q.type=='radio'&&q.eps.some(x=>x!==e&&x.day==e.day&&x.st=='sched'&&(q.time|0)==(p.time|0)))))err.push(GMD_T('Another live radio uses this time.','มีวิทยุสดอีกรายการในเวลานี้'));
 if(film&&day!=null)cast.forEach(id=>{const m=gmdMem(id);if(m&&(m.en||0)<GMD_EN[p.type])err.push(GMD_T(`${gmdNm(id)} does not have enough Energy.`,`${gmdNm(id)} พลังงานไม่พอ`))});
 return{err,warn,reg}}
function gmdTvNext(p,from){let d=Math.max(from,S.day+1);for(let i=0;i<8;i++){if(dowOf(d)==p.day)return d;d++}return d}
function gmdPreview(pid,eid){const p=gmdP(pid),e=gmdE(p,eid);if(!e)return;ui.gm={...ui.gm,pg:'prev',pid,eid};render()}
function gmdConfirm(pid,eid){const p=gmdP(pid),e=gmdE(p,eid);if(!e||!gmdEditable(e))return;const c=gmdCheck(p,e);if(c.err.length)return toast(c.err[0],'err');
 if(p.type!='radio'&&e.slot==null)e.slot=gmdFreeSlot(e.film,e.id);if(p.type!='radio'&&e.slot<0)return toast(GMD_T('No free filming slot that day.','วันนั้นไม่มีช่วงเวลาถ่ายทำว่าง'),'err');
 if(!e.title)e.title=gmdAutoTitle(p,e);e.st='sched';e.issue=null;ui.gm={pg:'prog',pid};toast(p.type=='radio'?GMD_T(`EP.${e.no} scheduled live on ${jd(e.day)}.`,`EP.${e.no} กำหนดออกอากาศสด ${jd(e.day)}`):GMD_T(`EP.${e.no} scheduled: filming on ${jd(e.film)}.`,`EP.${e.no} กำหนดถ่ายทำ ${jd(e.film)}`));render()}
function gmdUnconfirm(pid,eid){const p=gmdP(pid),e=gmdE(p,eid);if(!e||e.st!='sched')return;e.st='plan';ui.gm={pg:'ep',pid,eid};render()}
function gmdDelEp(pid,eid){const p=gmdP(pid),e=gmdE(p,eid);if(!e||!gmdEditable(e))return;ask(GMD_T(`Delete EP.${e.no}?`,`ลบ EP.${e.no}?`),()=>{p.eps=p.eps.filter(x=>x!==e);ui.gm={pg:'prog',pid};render()},GMD_T('Delete','ลบ'))}
function gmdAutoTitle(p,e){const t=(GMD_TOPICS[p.type]||[]).find(x=>x[0]==e.topic),c=gmdCast(p,e);if(p.type=='mus'){const o=e.perf[0]&&ccSong(e.perf[0].gid,e.perf[0].id);return o?`${GMD_T('Stage','สเตจ')} “${o.title}”${e.perf.length>1?' +'+(e.perf.length-1):''}`:(t?GMD_T(t[1],t[2]):'Talk')}
 if(p.type=='radio')return`${t?GMD_T(t[1],t[2]):''} · ${gmdNm(e.host)}${e.guests&&e.guests.length?' & '+e.guests.map(gmdNm).join(', '):''}`;const a=GMD_ACTS.find(x=>x[0]==e.acts[0]);return`${t?GMD_T(t[1],t[2]):''}${a?' · '+GMD_T(a[1],a[2]):''}`}

// ---- filming (Variety & Music) ---------------------------------------------------------------------------------------------
function gmdFilm(pid,eid,manual){const p=gmdP(pid),e=gmdE(p,eid);if(!e||e.st!='sched'||p.type=='radio')return false;if(e.film!=S.day){if(manual)toast(GMD_T('Filming happens on the filming date.','ถ่ายทำได้ในวันถ่ายทำเท่านั้น'),'err');return false}
 // random members who became unavailable are swapped automatically
 e.cast.forEach(c=>{if(c.src=='rnd'&&gmdWhy(p,e,c.m,e.film)){const r=gmdRandom(p,e,1,gmdCast(p,e).concat(e.empty||[]));if(r[0]){c.was=c.m;c.m=r[0]}}});
 const c=gmdCheck(p,e,true);if(c.err.length){e.issue={day:S.day,msg:c.err.slice(0,3),reg:c.reg};if(manual)toast(c.err[0],'err');else GMD_Q.push({pid,eid,msg:GMD_T(`${p.name} EP.${e.no}: filming could not start — ${c.err[0]}`,`${p.name} EP.${e.no}: เริ่มถ่ายทำไม่ได้ — ${c.err[0]}`)});return false}
 const cast=gmdCast(p,e);cast.forEach(id=>{const m=gmdMem(id);if(m)m.en=Math.max(0,(m.en||0)-GMD_EN[p.type])});
 if(!e.paid){finOut(GMD_COST[p.type][p.plat],`Production: Group Media ${p.name} EP.${e.no} (${GMD_PLAT[p.plat][0]})`,{gid:p.gid});e.paid=S.day}
 try{for(let i=0;i<cast.length;i++)for(let j=i+1;j<cast.length&&j<i+4;j++)prSpark(cast[i],cast[j],'variety',p.type=='var'?.5:.3,`${p.name} EP.${e.no}`)}catch(x){}
 e.st='ready';e.filmed=S.day;e.issue=null;e.cast0=cast.slice();if(p.plat=='tv')e.bc=null;if(manual){toast(GMD_T(`EP.${e.no} filmed — it is Ready for broadcast.`,`ถ่ายทำ EP.${e.no} เสร็จแล้ว พร้อมออกอากาศ`));render()}return true}
// ---- broadcast & results ----------------------------------------------------------------------------------------------------
const gmdFansOf=gid=>{try{return S.groups.length>1?fdGroupFans(gid):(S.fans||0)}catch(e){return S.fans||0}};
function gmdQuality(p,e,cast){const M=cast.map(gmdMem).filter(Boolean);if(!M.length)return .3;const avg=a=>a.reduce((x,y)=>x+y,0)/Math.max(1,a.length);let q;
 if(p.type=='var'){const vv=avg(M.map(m=>gmdStat(m,'variety'))),ch=avg(M.map(m=>gmdStat(m,'cha'))),fit=e.acts.length?Math.min(1,.55+.12*e.acts.length):.5,mix=new Set(M.map(m=>m.pers)).size/Math.max(1,M.length);
  let chem=0;try{for(let i=0;i<M.length;i++)for(let j=i+1;j<M.length;j++){const P=prGet(M[i].id,M[j].id);if(P)chem=Math.max(chem,(P.chem||0)/100)}}catch(x){}
  const rep=p.eps.filter(x=>x.st=='aired').slice(-3).filter(x=>x.topic==e.topic).length*.05;q=vv/100*.42+ch/100*.18+fit*.14+mix*.1+chem*.1+.06-rep}
 else if(p.type=='mus'){const P=e.perf.map(x=>{const o=ccSong(x.gid,x.id);let sp=40;try{sp=ccSongPop(x.gid,x.id)}catch(z){}const PM=x.mids.map(gmdMem).filter(Boolean),sk=avg(PM.map(m=>(gmdStat(m,'sing')+gmdStat(m,'dance'))/2)),cen=gmdMem(x.cen);return sp/100*.35+sk/100*.4+(cen?cen.pop/100*.15:0)+(x.cz.mode=='lib'?.06:.04)});
  const talk=e.segs.filter(s=>!/^p/.test(s)).length;q=(P.length?avg(P):.35)*.85+Math.min(.12,talk*.03)}
 else{const H=gmdMem(e.host),G=[e.co,...(e.guests||[])].map(gmdMem).filter(Boolean);const hv=H?(gmdStat(H,'variety')*.6+gmdStat(H,'cha')*.4)/100:.3;let rel=0;try{G.forEach(g=>{const P=prGet(H.id,g.id);if(P)rel=Math.max(rel,(P.chem||0)/100,(P.tr||0)/100)})}catch(x){}
  q=hv*.55+rel*.2+(G.length?.1:.05)+(['letters','qa'].includes(e.topic)?.08:.05)}
 return Math.max(.12,Math.min(.98,q*(.85+Math.random()*.3)))}
function gmdApplyFans(p,e,cast,q,aud){const fb=S.fb;if(!fb||!Array.isArray(fb.segs))return{oshi:{},kami:{},nf:0};const ids=new Set(fdAct().map(m=>m.id)),O={},K={},tv=p.plat=='tv';
 const lead=p.type=='radio'?e.host:p.type=='mus'?(e.perf[0]&&e.perf[0].cen):null,W=cast.map(id=>[id,id==lead?1.6:1]),WS=W.reduce((a,b)=>a+b[1],0)||1;const F0=S.fans||0;
 W.forEach(([mid,w])=>{if(!ids.has(mid))return;const m=get(mid),share=w/WS,base=aud*q*share*(tv?.010:.014)*(.6+Math.random()*.8);let left=Math.round(base);if(left<=0)return;
  // fans who already noticed her (u) or support the group: some add her as an Oshi (≤5 Oshi per fan, never their Kami Oshi)
  const g=fdGrpOf(mid),pool=fb.segs.filter(s=>s.k!=mid&&s.ft!='dormant'&&fdSegHas(s,g)).map(s=>[s,(s.u&&s.u[mid]||0)*3+(s.n-(s.o[mid]||0))*(.2+(s.eng||30)/100)*Math.random()]).sort((a,b)=>b[1]-a[1]).slice(0,8);let got=0;
  pool.forEach(([s])=>{if(left<=0)return;s.o=s.o||{};s.u=s.u||{};const cur=s.o[mid]||0,room=FD_OMAX*s.n-Object.values(s.o).reduce((a,b)=>a+b,0),c=Math.max(0,Math.min(left,s.n-cur,room,Math.ceil(s.n*.06)));if(!c)return;s.o[mid]=cur+c;if(s.u[mid])s.u[mid]=Math.max(0,Math.min(s.u[mid]-c,s.n-s.o[mid]));left-=c;got+=c});
  if(got)O[mid]=got;try{fdInterest(m,Math.round(base*.6),`Group Media ${tv?'TV':'YouTube'}: ${p.name}`)}catch(x){}
  // Kami Oshi: only after interest accumulated over several episodes, and only some fans move
  const G=gmdS();G.ki[mid]=(G.ki[mid]||0)+q*share*cast.length*(tv?1.2:1)*(p.type=='radio'&&mid==e.host?1.3:1);
  if(G.ki[mid]>=3){G.ki[mid]-=3;const C=fb.segs.filter(s=>s.k!=mid&&(s.o[mid]||0)>0&&(s.loy??50)<72&&s.ft!='hardcore'&&s.ft!='dormant').sort(()=>Math.random()-.5).slice(0,2);
   C.forEach(s=>{const n=Math.round((s.o[mid]||0)*(.015+Math.random()*.035));if(n>0){try{if(fdMoveKami(s,n,mid,.7))K[mid]=(K[mid]||0)+n}catch(x){}}})}});
 // existing fans of the cast stay more engaged (existing cohort activity / loyalty)
 const cs=new Set(cast);fb.segs.forEach(s=>{if(cs.has(s.k)||Object.keys(s.o||{}).some(j=>cs.has(+j)&&s.o[j]>0)){s.eng=Math.min(100,(s.eng||30)+q*1.5);s.loy=Math.min(100,(s.loy??50)+q*.3);s.last=S.day}});
 try{fdFixAll();fdWrite()}catch(x){}
 // a few viewers who did not follow the group before (secondary effect; TV reaches further)
 const gen=Math.round((tv?aud*.006:aud*.0025)*q*(.5+Math.random()));if(gen>0)try{fbAcquire(gen,{org:`Group Media ${tv?'TV':'YouTube'}: ${p.name}`,mid:lead??cast[0]})}catch(x){}
 return{oshi:O,kami:K,nf:Math.max(0,(S.fans||0)-F0)}}
function gmdResults(p,e){const cast=gmdCast(p,e).filter(gmdMem),F=gmdFansOf(p.gid),q=gmdQuality(p,e,cast),tv=p.plat=='tv';
 const fanView=F*(p.type=='radio'?.05:tv?.12:.16)*(.5+q),gen=tv?(p.type=='radio'?12000:60000)*(.4+q*1.6)*(.7+Math.random()*.6):(p.type=='radio'?800:4000)*(.3+q)*(.6+Math.random()*.8);
 const aud=Math.round(fanView+gen),pop0={};cast.forEach(id=>pop0[id]=get(id).pop);
 const fx=gmdApplyFans(p,e,cast,q,aud);cast.forEach(id=>{const m=get(id);if(q>.55&&Math.random()<q)try{gainPop(m,1)}catch(x){}});const pop={};cast.forEach(id=>{const d=(get(id).pop||0)-(pop0[id]||0);if(d)pop[id]=d});
 const songs={};if(p.type=='mus')e.perf.forEach(x=>{const o=ccSong(x.gid,x.id);if(!o)return;const old=o.relDay!=null&&S.day-o.relDay>180,d=Math.round(q*3+(old?2:0));o.thPop=(o.thPop||0)+d*.5;o.thBuzz=Math.min(30,(o.thBuzz||0)+d);songs[x.gid+'|'+x.id]={t:o.title,d,old}});
 const rel=[];if(p.type=='radio'||p.type=='var'){try{for(let i=0;i<cast.length&&rel.length<4;i++)for(let j=i+1;j<cast.length&&rel.length<4;j++){const P=prSpark(cast[i],cast[j],'variety',p.type=='radio'?.6:.35,`${p.name} EP.${e.no}`);if(P)rel.push([cast[i],cast[j]])}}catch(x){}}
 const eng=Math.round(30+q*65);let rev=0;if(p.plat=='yt'){rev=Math.round(aud*.35);if(rev>0)earn(rev,`Streaming views: ${p.name} EP.${e.no}`)}else{rev=Math.round(aud*(p.type=='radio'?12:16)*(.55+q*.7));if(rev>0)earn(rev,`TV ads: ${p.name} EP.${e.no}`)}
 if(p.type=='radio'&&!e.paid){finOut(GMD_COST.radio[p.plat],`Production: Group Media ${p.name} EP.${e.no} (live)`,{gid:p.gid});e.paid=S.day}
 return{q:Math.round(q*100),aud,eng,oshi:fx.oshi,kami:fx.kami,nf:fx.nf,pop,songs,rel,rev,cost:GMD_COST[p.type][p.plat],cast,ret:Math.round(eng*.6+q*30)}}
function gmdAir(p,e){e.res=gmdResults(p,e);e.st=p.type=='radio'?'done':'aired';e.bc=S.day;gmdS().cq.push({pid:p.id,eid:e.id,gid:p.gid,d:S.day});GMD_Q.push({pid:p.id,eid:e.id,res:1,msg:p.type=='radio'?GMD_T(`${p.name} EP.${e.no} went live: ${e.res.aud.toLocaleString()} listeners.`,`${p.name} EP.${e.no} ออกอากาศสดแล้ว: ผู้ฟัง ${e.res.aud.toLocaleString()} คน`):GMD_T(`${p.name} EP.${e.no} aired: ${e.res.aud.toLocaleString()} viewers.`,`${p.name} EP.${e.no} ออกอากาศแล้ว: ผู้ชม ${e.res.aud.toLocaleString()} คน`)})}
// ---- radio (live only) --------------------------------------------------------------------------------------------------------------------
function gmdLiveOpen(pid,eid){const p=gmdP(pid),e=gmdE(p,eid);if(!e||p.type!='radio'||e.st!='sched')return;if(e.day!=S.day)return toast(GMD_T('A live broadcast can only start on its date.','ออกอากาศสดได้เฉพาะวันที่กำหนด'),'err');if(p.st!='on')return toast(GMD_T('The program is on hold.','รายการพักอยู่'),'err');
 const c=gmdCheck(p,e,true);if(c.err.length){e.issue={day:S.day,msg:c.err.slice(0,3)};render();return toast(c.err[0],'err')}e.st='live';ui.gm={pg:'live',pid,eid,i:0,L:gmdRadioLines(p,e)};render()}
function gmdLiveNext(){const g=ui.gm;if(!g||g.pg!='live')return;g.i=Math.min(g.L.length-1,g.i+1);render()}
function gmdLiveEnd(){const g=ui.gm;if(!g||g.pg!='live')return;const p=gmdP(g.pid),e=gmdE(p,g.eid);if(!e||e.st!='live')return;e.cast0=gmdCast(p,e);e.lines=g.L.slice(0,12);gmdCast(p,e).forEach(id=>{const m=gmdMem(id);if(m)m.en=Math.max(0,(m.en||0)-GMD_EN.radio)});gmdAir(p,e);GMD_Q.pop();gmdCmEmit();ui.gm={pg:'res',pid:p.id,eid:e.id};render()}
const GMD_RL={talk:[["{a}: Tonight it's just us talking, so get comfortable!","{a}: คืนนี้คุยกันสบาย ๆ นะ ทำตัวตามสบายเลย"],["{b}: Wait, are we really live? My heart is racing.","{b}: เดี๋ยว นี่สดจริงเหรอ ใจเต้นแรงมาก"],["{a}: Let's talk about what everyone did on their day off.","{a}: มาคุยกันว่าวันหยุดทุกคนทำอะไรกันบ้าง"]],
 letters:[["{a}: A letter from a listener: 'I started supporting the group this spring…'","{a}: จดหมายจากผู้ฟัง: 'เพิ่งเริ่มเชียร์วงตอนฤดูใบไม้ผลินี้…'"],["{b}: That's so sweet. Thank you for writing to us!","{b}: น่ารักมาก ขอบคุณที่เขียนมานะ"],["{a}: Next one asks for advice about exams. {b}, you go first.","{a}: ฉบับต่อไปขอคำแนะนำเรื่องสอบ {b} ตอบก่อนเลย"]],
 qa:[["{a}: Question from a fan: what is your comfort food?","{a}: คำถามจากแฟน: อาหารปลอบใจของแต่ละคนคืออะไร"],["{b}: Easy — the convenience-store pudding. Every time.","{b}: ง่ายมาก พุดดิ้งเซเว่น ทุกครั้งเลย"],["{a}: Rapid-fire round! Cats or dogs?","{a}: รอบตอบเร็ว! แมวหรือหมา"]],
 story:[["{a}: I've never said this on air, but I almost quit once.","{a}: ไม่เคยพูดออกอากาศเลย แต่ครั้งหนึ่งเคยเกือบจะเลิก"],["{b}: Really? I never knew…","{b}: จริงเหรอ ไม่เคยรู้เลย…"],["{a}: What kept me going was the theater crowd.","{a}: สิ่งที่ทำให้ไปต่อได้คือคนดูที่เธียเตอร์"]],
 memory:[["{a}: Do you remember our first stage? I forgot the choreography!","{a}: จำสเตจแรกได้ไหม ลืมท่าเต้นเลย!"],["{b}: You hid it so well, nobody noticed.","{b}: ปิดเนียนมาก ไม่มีใครรู้เลย"],["{a}: {g} has come so far since then.","{a}: {g} มาไกลมากเลยนะตั้งแต่ตอนนั้น"]],
 rel:[["{a}: People say we're close. Is that true, {b}?","{a}: คนชอบบอกว่าเราสนิทกัน จริงไหม {b}"],["{b}: We text every night, so… yes?","{b}: เราแชตกันทุกคืนเลย ก็… ใช่มั้ง"],["{a}: Let's reveal one secret about each other!","{a}: มาเปิดความลับของกันและกันคนละเรื่อง!"]],
 special:[["{a}: Special night! We prepared a little surprise.","{a}: คืนพิเศษ! เราเตรียมเซอร์ไพรส์เล็ก ๆ ไว้"],["{b}: No spoilers yet, okay?","{b}: ยังห้ามสปอยล์นะ"],["{a}: Let's count down together, everyone!","{a}: มานับถอยหลังพร้อมกันนะทุกคน!"]]};
const GMD_RTONE={Genki:["{x}: Haha! That's the best!","{x}: ฮ่า ๆ ดีที่สุดเลย!"],Cool:["{x}: …Fine, I'll admit it was fun.","{x}: …ก็ได้ ยอมรับว่าสนุก"],Shy:["{x}: U-um… I'm a bit embarrassed…","{x}: อ-เอ่อ… เขินนิดหน่อย…"],Elegant:["{x}: How lovely. Thank you, everyone.","{x}: น่ารักจังเลย ขอบคุณทุกคนนะคะ"],Airhead:["{x}: Wait, what were we talking about?","{x}: เดี๋ยวนะ เมื่อกี้คุยเรื่องอะไรกันอยู่"],Serious:["{x}: Let me answer that properly.","{x}: ขอตอบให้ดี ๆ นะ"]};
function gmdRadioLines(p,e){const A=gmdMem(e.host),Bm=[e.co,...(e.guests||[])].map(gmdMem).filter(Boolean),b=Bm[0]||A,g=(grp(p.gid)||{}).name||'',th=UIP.lang=='th',T=GMD_RL[e.topic]||GMD_RL.talk,used=(gmdS().rlu=gmdS().rlu||{});
 const fill=s=>s.replace(/\{a\}/g,A?A.stage||A.name:'').replace(/\{b\}/g,b?b.stage||b.name:'').replace(/\{g\}/g,g);const L=[fill(th?`{a}: สวัสดีค่ะ ที่นี่ ${p.name} คืนนี้ออกอากาศสดนะคะ`:`{a}: Good evening, this is ${p.name}, live tonight!`)];
 T.forEach(x=>L.push(fill(x[th?1:0])));[A,...Bm].filter(Boolean).forEach(m=>{const t=GMD_RTONE[m.pers]||GMD_RTONE.Genki,k=m.id+'|'+e.topic;if((used[k]||0)>S.day-30&&Math.random()<.5)return;used[k]=S.day;L.splice(1+Math.floor(Math.random()*(L.length)),0,t[th?1:0].replace('{x}',m.stage||m.name))});
 L.push(fill(th?`{a}: ขอบคุณที่ฟังนะคะ แล้วพบกันใหม่สัปดาห์หน้า!`:`{a}: Thank you for listening — see you next week!`));return L}

// ---- daily progression --------------------------------------------------------------------------------------------------------------------
let GMD_Q=[];
function gmdDaily(){const G=S&&S.gm;if(!G||!G.progs.length)return;G.cq=G.cq.filter(x=>S.day-x.d<=2);
 G.progs.forEach(p=>{try{gsWith(p.gid,()=>{
  if(p.type=='radio'){p.eps.forEach(e=>{if(e.st=='sched'&&e.day!=null&&e.day<S.day){e.issue={day:S.day,msg:[GMD_T('The live date passed: reschedule.','เลยวันออกอากาศสดแล้ว: กำหนดวันใหม่')]};e.st='plan';GMD_Q.push({pid:p.id,eid:e.id,msg:GMD_T(`${p.name} EP.${e.no}: the live broadcast did not happen — choose a new date.`,`${p.name} EP.${e.no}: ไม่ได้ออกอากาศสด — เลือกวันใหม่`)})}
    else if(e.st=='sched'&&e.day==S.day&&p.st=='on'){const c=gmdCheck(p,e,true);if(c.err.length){e.issue={day:S.day,msg:c.err.slice(0,3)};GMD_Q.push({pid:p.id,eid:e.id,msg:GMD_T(`${p.name} EP.${e.no}: live broadcast blocked — ${c.err[0]}`,`${p.name} EP.${e.no}: ออกอากาศสดไม่ได้ — ${c.err[0]}`)})}else{e.lines=gmdRadioLines(p,e).slice(0,12);e.cast0=gmdCast(p,e);gmdCast(p,e).forEach(id=>{const m=gmdMem(id);if(m)m.en=Math.max(0,(m.en||0)-GMD_EN.radio)});gmdAir(p,e)}}});return}
  p.eps.forEach(e=>{if(e.st=='sched'&&e.film!=null&&e.film<S.day){e.st='plan';e.issue={day:S.day,msg:[GMD_T('The filming date passed.','เลยวันถ่ายทำแล้ว')]};GMD_Q.push({pid:p.id,eid:e.id,msg:GMD_T(`${p.name} EP.${e.no}: filming did not happen — choose a new date.`,`${p.name} EP.${e.no}: ไม่ได้ถ่ายทำ — เลือกวันใหม่`)})}
   else if(e.st=='sched'&&e.film==S.day)gmdFilm(p.id,e.id,false)});
  if(p.st!='on')return;
  if(p.plat=='yt'){p.eps.forEach(e=>{if(e.st=='ready'&&e.bc!=null&&e.bc==S.day&&e.filmed!=null&&e.filmed<=S.day-7)gmdAir(p,e);else if(e.st=='ready'&&e.bc!=null&&e.bc<S.day){e.bc=null}});
   // optional regular day: the oldest Ready episode without a date airs on that day
   if(p.day!=null&&dowOf(S.day)==p.day&&!p.eps.some(e=>e.bc==S.day&&e.st=='aired')){const r=p.eps.filter(e=>e.st=='ready'&&e.bc==null&&e.filmed<=S.day-7).sort((a,b)=>a.no-b.no)[0];if(r)gmdAir(p,r)}}
  else if(p.day!=null&&dowOf(S.day)==p.day){const r=p.eps.filter(e=>e.st=='ready'&&e.filmed!=null&&e.filmed<=S.day-14).sort((a,b)=>a.no-b.no)[0];if(r)gmdAir(p,r);else{p.log.push({d:S.day,t:'none'});if(p.log.length>60)p.log.shift();GMD_Q.push({pid:p.id,msg:GMD_T(`${p.name}: no new episode this week (nothing Ready 14 days before).`,`${p.name}: สัปดาห์นี้ไม่มีตอนใหม่ (ไม่มีตอนที่ถ่ายเสร็จก่อน 14 วัน)`)})}}
 })}catch(x){console.error('group media',x)}})}
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{if(S){gmdDaily();gmdCmEmit()}}catch(e){console.error('group media',e)}return r}}
{const f=adv;adv=function(){GMD_Q=[];const r=f.apply(this,arguments);try{if(GMD_Q.length)setTimeout(gmdPop,250)}catch(e){}return r}}
function gmdPop(){const Q=GMD_Q.splice(0);if(!Q.length)return;let el=document.getElementById('gmpop');if(!el){el=document.createElement('div');el.id='gmpop';document.body.appendChild(el)}
 el.innerHTML=`<div class="gmpophd"><b>${GMD_T('Group Media','กรุ๊ปมีเดีย')}</b><button class="cmpopx" onclick="document.getElementById('gmpop').classList.remove('on')" aria-label="close">×</button></div>${Q.slice(-4).map(x=>`<button class="gmpopi" onclick="document.getElementById('gmpop').classList.remove('on');gmdGo('${x.pid}','${x.eid||''}',${x.res?1:0})">${esc(x.msg)}</button>`).join('')}`;el.classList.add('on');setTimeout(()=>el.classList.remove('on'),12000)}
function gmdGo(pid,eid,res){ui.gm=eid?{pg:res?'res':'ep',pid,eid}:{pg:'prog',pid};const p=gmdP(pid);if(p&&p.gid!=gsAg())try{gsSelect(p.gid)}catch(e){}view='gmedia';render();try{window.scrollTo(0,0)}catch(e){}}

// ---- Fan Community: discussions about aired episodes (existing generator, new meanings) ------------------------------------------------
Object.assign(CM_I,{
 gmdPraise:{tone:'p',who:'oshi',en:["{m} carried {p} tonight. Every time the camera found her, something funny happened","Watching {p} just to see {m} react to everything","{m} on {p} is exactly the energy I needed this week","Clipping every {m} moment from {p}. There are a lot"],th:["{m} แบกรายการ {p} คืนนี้จริง กล้องจับทีไรมีเรื่องฮาทุกที","ดู {p} เพราะอยากเห็นรีแอคของ {m} ล้วน ๆ","{m} ใน {p} คือพลังที่ต้องการในสัปดาห์นี้เลย","นั่งตัดคลิป {m} จาก {p} อยู่ เยอะมากกก"]},
 gmdFunny:{tone:'p',who:'any',en:["{m} and {m2} in {p} had me crying laughing","The way {m2} looked at {m} after that answer on {p}… iconic","{p} needs a whole corner just for {m} and {m2}","{m} vs {m2} on {p} was the best part, no contest"],th:["{m} กับ {m2} ใน {p} ขำจนน้ำตาไหล","สายตาที่ {m2} มอง {m} หลังตอบคำถามใน {p}… ตำนาน","{p} ควรมีช่วงพิเศษให้ {m} กับ {m2} เลย","{m} ปะทะ {m2} ใน {p} คือช่วงที่ดีที่สุด"]},
 gmdShip:{tone:'p',who:'any',en:["{m} and {m2} sitting together on {p} again. I see what the staff is doing","Adding {p} EP.{k} to the {m}×{m2} archive","{m} fixing {m2}'s hair mid-segment on {p}. I'm fine. totally fine"],th:["{m} กับ {m2} นั่งข้างกันใน {p} อีกแล้ว ทีมงานรู้ใจ","เก็บ {p} EP.{k} เข้าคลังคู่ {m}×{m2}","{m} จัดผมให้ {m2} กลางรายการ {p} ไม่ไหวแล้ว"]},
 gmdDiscover:{tone:'p',who:'any',en:["Never paid attention to {m} before {p}. She's actually hilarious","{p} made me look up {m}'s theater clips. I think I have a new oshi","Who is {m}?? Saw her on {p} and now I need to know everything","{m} was quietly the funniest person on {p}"],th:["ไม่เคยสังเกต {m} มาก่อนจนได้ดู {p} ตลกมากจริง","ดู {p} แล้วต้องไปหาคลิปเธียเตอร์ของ {m} ต่อ น่าจะได้โอชิใหม่แล้ว","{m} คือใคร?? เห็นใน {p} แล้วอยากรู้ทุกอย่าง","{m} เงียบ ๆ แต่ฮาที่สุดใน {p}"]},
 gmdSong:{tone:'p',who:'mus',en:["{s} on {p} sounded better than I remembered","Didn't expect {p} to bring back {s}. Adding it to my playlist again","{p} performing {s}… this song deserved this","The {s} stage on {p} is going on repeat"],th:["{s} ใน {p} เพราะกว่าที่จำได้อีก","ไม่คิดว่า {p} จะหยิบ {s} กลับมา เพิ่มเข้าเพลย์ลิสต์อีกรอบ","{p} แสดง {s}… เพลงนี้สมควรได้รับแบบนี้","สเตจ {s} ใน {p} ต้องวนดูซ้ำ"]},
 gmdCostume:{tone:'u',who:'perf',en:["The costumes for {s} on {p} were a choice. A good one, I think?","Whoever styled {p} this week, please keep that job","Not sure the {s} outfits fit the song on {p}, but the stage was fun"],th:["ชุดเพลง {s} ใน {p} กล้าดี น่าจะดีนะ","ใครเป็นสไตลิสต์ {p} สัปดาห์นี้ ขอให้ทำต่อไป","ชุดเพลง {s} ใน {p} อาจไม่เข้ากับเพลง แต่สเตจสนุก"]},
 gmdCrit:{tone:'n',who:'any',en:["{p} felt a bit flat this week. Same jokes, same setup","Love the members but {p} needs better editing","Half of {p} was the same people talking again","{p} had potential this episode and didn't use it"],th:["{p} สัปดาห์นี้แบนไปหน่อย มุกเดิม ๆ","รักเมมนะ แต่ {p} ต้องตัดต่อให้ดีกว่านี้","ครึ่งรายการ {p} ก็คนเดิมพูดอีกแล้ว","{p} ตอนนี้มีของ แต่ใช้ไม่สุด"]},
 gmdRequest:{tone:'u',who:'oshi',en:["Please put {m} on {p} next time. She'd be perfect for this","{p} staff, we're waiting for {m}","Still no {m} on {p}? I'll keep asking every week"],th:["ครั้งหน้าขอ {m} ใน {p} หน่อย เหมาะมาก","ทีมงาน {p} พวกเรารอ {m} อยู่นะ","ยังไม่มี {m} ใน {p} อีกเหรอ จะขอทุกสัปดาห์"]},
 gmdDebate:{tone:'u',who:'ana',en:["Interesting cast choice on {p}. Mixing older and newer members works better than I expected","Is {p} picking members at random? Some faces barely show up","{p} keeps giving airtime to the same few. Spread it out"],th:["การเลือกเมม {p} น่าสนใจ ผสมรุ่นพี่รุ่นน้องแล้วเวิร์กกว่าที่คิด","{p} สุ่มเมมเหรอ บางคนแทบไม่ได้ออก","{p} ให้เวลาออกอากาศแค่ไม่กี่คนเดิม ๆ ช่วยกระจายหน่อย"]},
 gmdRadio:{tone:'p',who:'oshi',en:["{m}'s voice on {p} at night is so calming","Stayed up for {p} live and {m} read my letter?!","{m} talking about the early days on {p}… I teared up","{p} live with {m} was unscripted chaos and I loved it"],th:["เสียง {m} ใน {p} ตอนดึกฟังแล้วสบายใจมาก","อดนอนฟัง {p} สด แล้ว {m} อ่านจดหมายเรา?!","{m} เล่าเรื่องช่วงแรก ๆ ใน {p}… น้ำตาซึม","{p} สดกับ {m} ไม่มีสคริปต์ วุ่นวายแต่ชอบมาก"]},
 gmdRival:{tone:'u',who:'ana',en:["{g2} fans watching {p} too? The comments are full of them","Honestly {p} is better than what {g2} is doing on TV right now","{g} has their own show now ({p}). {g2} should take notes"],th:["แฟน {g2} ก็มาดู {p} ด้วยเหรอ คอมเมนต์เต็มเลย","บอกตรง ๆ {p} สนุกกว่ารายการทีวีของ {g2} ตอนนี้อีก","{g} มีรายการของตัวเองแล้ว ({p}) {g2} ควรจดไว้"]}});
try{if(typeof CM_INT=='object')CM_INT.gm='ev'}catch(e){}
function gmdCmEvents(){const E=[];try{const G=S.gm;if(!G||!G.cq.length)return E;const C=cmS();
 G.cq.filter(x=>x.d==S.day).forEach(x=>{const p=gmdP(x.pid),e=gmdE(p,x.eid);if(!p||!e||!e.res)return;const key='gm:'+e.id;if(C.seen[key]!=null)return;const R=e.res,cast=(R.cast||[]).filter(id=>get(id)),g=grp(p.gid)||{};if(!cast.length)return;
  const O=Object.entries(R.oshi||{}).sort((a,b)=>b[1]-a[1]).map(z=>+z[0]),top=O[0]??cast[0],low=cast.slice().sort((a,b)=>get(a).pop-get(b).pop)[0],its=[],v={p:p.name,g:g.name,k:e.no};
  its.push({i:p.type=='radio'?'gmdRadio':'gmdPraise',sub:top,v:{m:top},w:3});if(cast.length>1){const b=cast.find(id=>id!=top);its.push({i:'gmdFunny',sub:top+'-'+b,v:{m:top,m2:b},w:2});
   try{const pr=cast.flatMap((a,i)=>cast.slice(i+1).map(b=>[a,b,(prGet(a,b)||{}).chem||0])).sort((a,b)=>b[2]-a[2])[0];if(pr&&pr[2]>=35)its.push({i:'gmdShip',sub:pr[0]+'-'+pr[1],v:{m:pr[0],m2:pr[1]},w:1.5})}catch(z){}}
  if(low!=null&&low!=top)its.push({i:'gmdDiscover',sub:low,v:{m:low},w:2.2});
  if(p.type=='mus')Object.values(R.songs||{}).slice(0,2).forEach(s=>{its.push({i:'gmdSong',sub:s.t,v:{s:s.t},w:2});if(Math.random()<.5)its.push({i:'gmdCostume',sub:s.t,v:{s:s.t},w:1})});
  if(R.q<55||Math.random()<.3)its.push({i:'gmdCrit',sub:p.id,v:{},w:R.q<45?2:.8});const out=gmdPool().filter(m=>!cast.includes(m.id)).sort((a,b)=>b.pop-a.pop)[Math.floor(Math.random()*5)];if(out)its.push({i:'gmdRequest',sub:out.id,v:{m:out.id},w:1});
  if(cast.length>=3&&Math.random()<.45)its.push({i:'gmdDebate',sub:p.id,v:{},w:1});
  const sis=(typeof cmReal=='function'?cmReal():[]).filter(z=>z.id!=p.gid),gids=[p.gid];if(sis.length&&Math.random()<.5){const s2=sis[Math.floor(Math.random()*sis.length)];gids.push(s2.id);its.push({i:'gmdRival',sub:p.id+':'+s2.id,v:{g2:s2.name},w:.8})}
  E.push({key,cat:'gm',gid:p.gid,gids,imp:p.plat=='tv'?3:2,v,its,lb:{en:`${p.name} EP.${e.no}`,th:`${p.name} EP.${e.no}`},hr0:20})})}catch(x){console.error(x)}return E}
// emitted through the existing generator right after the broadcast (same budget, repetition and account rules)
function gmdCmEmit(){try{if(typeof cmEmit!='function')return;gmdCmEvents().forEach(ev=>{try{cmEmit(ev,Math.round(4+Math.random()*4))}catch(x){console.error(x)}})}catch(x){console.error(x)}}

// ---- save compatibility ------------------------------------------------------------------------------------------------------------------
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{if(S&&S.gm)gmdS()}catch(e){}return r}}
