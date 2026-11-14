// =====================================================================================
//  Concert System — core data, venues, schedule, setlists, formations, costumes, expenses
// -------------------------------------------------------------------------------------
//  · One record per concert in S.cc.list (saved with the game). Part 2 (concert2.js) adds
//    tickets, sales, performances, fan response and reports to the SAME records.
//  · Types: Regular · Anniversary (group / sister group / team / generation) · Graduation
//    (individual / joint). Graduation concerts never graduate anyone (the existing graduation
//    system does that).
//  · Venues: real Japanese venues (CC_V). Every price says what it is: official (tax incl.),
//    published reference range (tax excl.) or an estimated game price.
//  · Participants: any member of any group. Songs come from the existing song libraries; the
//    concert formation is a COPY of the original formation keeping only original members who
//    take part (no automatic replacements). Original songs are never written to.
//  · Costumes: per song — original costume, previous song's costume, one design or one design
//    per member, all from the shared Costume Library (S.czLib).
//  · Expenses are calculated automatically (no production budget / quality / staff choice).
// =====================================================================================
const CC_CAT={lh:'Live House',hall:'Hall',lhall:'Large Hall / Iconic Venue',arena:'Arena',stad:'Stadium',dome:'Dome'};
const CC_SRC={off:'Official price (tax included)',ref:'Published reference price (tax excluded)',est:'Estimated game price (not an official rental fee)'};
const CC_TYPE={reg:'Regular Concert',anni:'Anniversary Concert',grad:'Graduation Concert'};
const CC_ANNI={group:'Group Anniversary',sister:'Sister Group Anniversary',team:'Team Anniversary',gen:'Generation Anniversary'};
const CC_ST={plan:'Planning',conf:'Confirmed',sales:'Ticket Sales',live:'Ongoing',done:'Completed',cancel:'Cancelled'};
const CC_SL={a:'Afternoon Performance',e:'Evening Performance'},CC_SLS={a:'Afternoon',e:'Evening'};
const CC_TIME={a:[780,1080],e:[1020,1320]};
// region accessibility (simulation weights): how easy the location is for the fanbase to reach
const CC_ACC={Tokyo:1,Kanagawa:.95,Saitama:.9,Osaka:.88,Aichi:.8,Hokkaido:.62,Fukuoka:.7};
// ---- venue database (all amounts JPY) -----------------------------------------------------------------------------------
// r: rental by day kind → {perf:{wd,we}, prep:{wd,we}} ; slots (TIF Hall A only): weekday performance slots
const CC_V=[
 {id:'zsap',n:'Zepp Sapporo',city:'Sapporo',pref:'Hokkaido',cat:'lh',cap:{stand:2009,seat:723},cfg:'Standing (2,009) or seated (723) live house',src:'ref',tax:'excl',lo:500000,hi:1000000,prest:32,acc:'Susukino area, short walk from Nakajima-koen Station (Namboku Line).',inc:['sound','light']},
 {id:'zdc',n:'Zepp DiverCity TOKYO',city:'Koto',pref:'Tokyo',cat:'lh',cap:{stand:2473,seat:1102},cfg:'Standing (2,473) or seated (1,102) live house',src:'ref',tax:'excl',lo:600000,hi:1250000,prest:38,acc:'Odaiba, DiverCity Tokyo Plaza — Daiba / Tokyo Teleport stations.',inc:['sound','light']},
 {id:'zhnd',n:'Zepp Haneda (TOKYO)',city:'Ota',pref:'Tokyo',cat:'lh',cap:{stand:2925,seat:1207},cfg:'Standing (2,925) or seated (1,207) live house',src:'ref',tax:'excl',lo:600000,hi:1350000,prest:38,acc:'HANEDA INNOVATION CITY, next to Tenkubashi Station; close to Haneda Airport.',inc:['sound','light']},
 {id:'zyok',n:'KT Zepp Yokohama',city:'Yokohama',pref:'Kanagawa',cat:'lh',cap:{stand:2146,seat:1251},cfg:'Standing (2,146) or seated (1,251) live house',src:'ref',tax:'excl',lo:500000,hi:1100000,prest:36,acc:'Minato Mirai, near Shin-Takashima / Yokohama stations.',inc:['sound','light']},
 {id:'zngy',n:'Zepp Nagoya',city:'Nagoya',pref:'Aichi',cat:'lh',cap:{stand:1864,seat:741},cfg:'Standing (1,864) or seated (741) live house',src:'ref',tax:'excl',lo:500000,hi:1100000,prest:33,acc:'Sasashima Live, a few minutes from Nagoya Station.',inc:['sound','light']},
 {id:'znmb',n:'Zepp Namba (OSAKA)',city:'Naniwa',pref:'Osaka',cat:'lh',cap:{stand:2513,seat:1206},cfg:'Standing (2,513) or seated (1,206) live house',src:'ref',tax:'excl',lo:500000,hi:1300000,prest:36,acc:'Namba area, close to Daikokucho / Namba stations.',inc:['sound','light']},
 {id:'zbay',n:'Zepp Osaka Bayside',city:'Konohana',pref:'Osaka',cat:'lh',cap:{stand:2801,seat:1198},cfg:'Standing (2,801) or seated (1,198) live house',src:'ref',tax:'excl',lo:600000,hi:1350000,prest:36,acc:'Bay area near Universal City / Sakurajima stations.',inc:['sound','light']},
 {id:'zfuk',n:'Zepp Fukuoka',city:'Fukuoka',pref:'Fukuoka',cat:'lh',cap:{stand:1526,seat:669},cfg:'Standing (1,526) or seated (669) live house',src:'ref',tax:'excl',lo:400000,hi:1000000,prest:32,acc:'Momochi seaside area (BOSS E・ZO FUKUOKA), bus / taxi from Tojinmachi Station.',inc:['sound','light']},
 {id:'tifa',n:'Tokyo International Forum Hall A',city:'Chiyoda',pref:'Tokyo',cat:'lhall',cap:{seat:5012},cfg:'Seated hall (5,012 seats)',src:'off',tax:'incl',prest:66,acc:'Next to Yurakucho Station, a short walk from Tokyo Station.',
  slots:{perf:{a:2310000,ae:4140400,e:3502400},prep:{wd:2484240},perfWe:4968480,prepWe:2981088},slotTxt:'Weekday performance: 09:00–17:00 ¥2,310,000 · 13:00–23:00 ¥3,502,400 · 18:00–23:00 ¥2,732,400 · 09:00–23:00 ¥4,140,400. Weekday setup: 09:00–17:00 ¥1,386,000 · 13:00–23:00 ¥2,101,440 · 18:00–23:00 ¥1,639,440 · 09:00–23:00 ¥2,484,240. Weekend/holiday full day: performance ¥4,968,480 · setup ¥2,981,088.'},
 {id:'gmoa',n:'GMO ARENA saitama — Main Arena',city:'Saitama',pref:'Saitama',cat:'arena',cap:{seat:22500},cfg:'Arena configuration (max. 22,500 seats)',src:'off',tax:'incl',r:{perf:{wd:7260000,we:11550000},prep:{wd:4356000,we:6930000}},prest:84,acc:'Directly connected to Saitama-Shintoshin Station.'},
 {id:'gmos',n:'GMO ARENA saitama — Stadium Configuration',city:'Saitama',pref:'Saitama',cat:'stad',cap:{seat:37000},cfg:'Stadium configuration (max. 37,000 seats)',src:'off',tax:'incl',r:{perf:{wd:11000000,we:16500000},prep:{wd:6600000,we:9900000}},prest:90,acc:'Directly connected to Saitama-Shintoshin Station.'},
 {id:'tdome',n:'Tokyo Dome',city:'Bunkyo',pref:'Tokyo',cat:'dome',cap:{seat:55000},cfg:'Dome concert configuration (max. 55,000 people)',src:'est',tax:'incl',r:{perf:{wd:35000000,we:42000000},prep:{wd:15000000,we:18000000}},prest:100,acc:'Tokyo Dome City — Suidobashi / Korakuen stations.'},
 // expansion (estimated game prices — official concert rental fees are not used here)
 {id:'nhk',n:'NHK Hall',city:'Shibuya',pref:'Tokyo',cat:'hall',cap:{seat:3601},cfg:'Seated hall (3,601 seats)',src:'est',tax:'incl',r:{perf:{wd:1900000,we:2300000},prep:{wd:950000,we:1150000}},prest:62,acc:'Shibuya, next to Yoyogi Park — Harajuku / Shibuya stations.'},
 {id:'tifc',n:'Tokyo International Forum Hall C',city:'Chiyoda',pref:'Tokyo',cat:'hall',cap:{seat:1502},cfg:'Seated hall (1,502 seats)',src:'est',tax:'incl',r:{perf:{wd:1100000,we:1400000},prep:{wd:650000,we:800000}},prest:50,acc:'Next to Yurakucho Station, a short walk from Tokyo Station.'},
 {id:'tgt',n:'Tokyo Garden Theater',city:'Koto',pref:'Tokyo',cat:'lhall',cap:{seat:8000},cfg:'Theater configuration (approx. 8,000)',src:'est',tax:'incl',r:{perf:{wd:4500000,we:5500000},prep:{wd:2500000,we:3000000}},prest:72,acc:'Ariake Garden — Ariake / Kokusai-tenjijo stations.'},
 {id:'budo',n:'Nippon Budokan',city:'Chiyoda',pref:'Tokyo',cat:'lhall',cap:{seat:14471},cfg:'Iconic arena hall (max. 14,471)',src:'est',tax:'incl',r:{perf:{wd:6000000,we:7000000},prep:{wd:3500000,we:4000000}},prest:92,acc:'Kitanomaru Park — Kudanshita Station.'},
 {id:'yarena',n:'Yokohama Arena',city:'Yokohama',pref:'Kanagawa',cat:'arena',cap:{seat:17000},cfg:'Arena (max. 17,000)',src:'est',tax:'incl',r:{perf:{wd:7000000,we:9000000},prep:{wd:4000000,we:5000000}},prest:80,acc:'Next to Shin-Yokohama Station.'},
 {id:'karena',n:'K-Arena Yokohama',city:'Yokohama',pref:'Kanagawa',cat:'arena',cap:{seat:20033},cfg:'Music arena (20,033 seats)',src:'est',tax:'incl',r:{perf:{wd:9000000,we:11500000},prep:{wd:5000000,we:6200000}},prest:84,acc:'Minato Mirai — Shin-Takashima / Yokohama stations.'},
 {id:'osakajo',n:'Osaka-jo Hall',city:'Chuo',pref:'Osaka',cat:'arena',cap:{seat:16000},cfg:'Arena hall (max. 16,000)',src:'est',tax:'incl',r:{perf:{wd:6500000,we:8000000},prep:{wd:3800000,we:4500000}},prest:80,acc:'Osaka Castle Park — Osakajokoen Station.'},
 {id:'gaishi',n:'Nippon Gaishi Hall',city:'Nagoya',pref:'Aichi',cat:'arena',cap:{seat:10000},cfg:'Arena (approx. 10,000)',src:'est',tax:'incl',r:{perf:{wd:5000000,we:6200000},prep:{wd:3000000,we:3600000}},prest:74,acc:'Minami, Nagoya — Kasadera Station.'},
 {id:'nissan',n:'Nissan Stadium',city:'Yokohama',pref:'Kanagawa',cat:'stad',cap:{seat:72327},cfg:'Stadium (72,327 seats)',src:'est',tax:'incl',r:{perf:{wd:40000000,we:48000000},prep:{wd:18000000,we:21000000}},prest:96,acc:'Shin-Yokohama / Kozukue stations.'},
 {id:'kdome',n:'Kyocera Dome Osaka',city:'Nishi',pref:'Osaka',cat:'dome',cap:{seat:55000},cfg:'Dome concert configuration (max. 55,000)',src:'est',tax:'incl',r:{perf:{wd:30000000,we:38000000},prep:{wd:14000000,we:17000000}},prest:96,acc:'Dome-mae Chiyozaki / Osaka Dome-mae stations.'},
 {id:'vdome',n:'Vantelin Dome Nagoya',city:'Higashi',pref:'Aichi',cat:'dome',cap:{seat:49692},cfg:'Dome (max. 49,692)',src:'est',tax:'incl',r:{perf:{wd:26000000,we:32000000},prep:{wd:12000000,we:14500000}},prest:92,acc:'Nagoya Dome-mae Yada Station.'},
 {id:'fdome',n:'Mizuho PayPay Dome Fukuoka',city:'Fukuoka',pref:'Fukuoka',cat:'dome',cap:{seat:50000},cfg:'Dome concert configuration (approx. 50,000; formerly Fukuoka PayPay Dome)',src:'est',tax:'incl',r:{perf:{wd:26000000,we:32000000},prep:{wd:12000000,we:14500000}},prest:92,acc:'Momochi seaside — Tojinmachi Station.'}];
const ccV=id=>CC_V.find(v=>v.id==id)||null;
const ccTax=(v,a)=>v.tax=='excl'?Math.round(a*1.1):a;
// Japanese national holidays on fixed dates (moving holidays such as Coming of Age Day are not modelled)
const CC_HOL=new Set(['1-1','2-11','2-23','4-29','5-3','5-4','5-5','8-11','11-3','11-23']);
const ccDate=d=>new Date(2026,3,1+d);
const ccHol=d=>{const t=ccDate(d);return CC_HOL.has(`${t.getMonth()+1}-${t.getDate()}`)};
const ccWE=d=>{const w=dowOf(d);return w==0||w==6||ccHol(d)};
// ---- state ----------------------------------------------------------------------------------------------------------------
function ccS(){if(!S)return null;if(!S.cc||typeof S.cc!='object')S.cc={v:1,seq:0,list:[],lib:[],trust:{},mt:{},hist:{}};const X=S.cc;X.list=Array.isArray(X.list)?X.list:[];X.lib=Array.isArray(X.lib)?X.lib:[];X.trust=X.trust||{};X.mt=X.mt||{};X.hist=X.hist||{};X.seq=+X.seq||0;return X}
const ccGet=id=>(ccS().list.find(c=>c.id==id))||null;
const ccCur=()=>ui.cc?ccGet(ui.cc):null;
const ccMem=id=>get(id)||(S.alumni||[]).find(m=>m.id==id)||null;
const ccNm=(C,id)=>{const m=ccMem(id);return m?m.name:((C&&C.snap&&C.snap[id])||{}).name||'#'+id};
const ccEdit=C=>C&&C.status=='plan';
function ccSnap(C){C.snap=C.snap||{};C.parts.forEach(id=>{const m=ccMem(id);if(!m)return;const g=grp(gsGid(m)),t=teamOf(m);C.snap[id]={name:m.name,gid:g?g.id:null,gname:g?g.name:'',team:t?t.name:(m.status=='trainee'?TL():''),gen:m.gen||1,pop:m.pop||0}})}
// ---- creation & types -----------------------------------------------------------------------------------------------------
function ccNew(){const X=ccS(),id='cc'+(++X.seq),host=gsAg();const C={id,name:`${(grp(host)||{}).name||'Concert'} Live ${X.seq}`,type:'reg',host,anni:null,grad:[],vid:null,vcfg:'seat',start:S.day+60,pf:[],parts:[],sets:{},snap:{},status:'plan',created:S.day,log:[]};
 C.pf.push(ccPfNew(C,0,'e'));X.list.push(C);ui.cc=id;ui.cct='setup';view='concert';render();return C}
function ccPfNew(C,d,sl){const n=C.pf.length+1;return{id:'p'+(C.pf.reduce((a,p)=>Math.max(a,+String(p.id).slice(1)||0),0)+1),d,sl,set:Object.keys(C.sets||{})[0]||null,no:n}}
function ccSet(k,v){const C=ccCur();if(!ccEdit(C))return toast('Only concerts in planning can be edited.','err');if(k=='name')v=String(v||'').replace(/[<>]/g,'').trim().slice(0,60)||C.name;if(k=='start'){v=+v;if(!(v>S.day))return toast('Choose a future date.','err')}
 if(k=='host'){v=+v;C.host=v;if(C.type=='anni')C.anni=null}else C[k]=v;if(k=='type'){C.anni=v=='anni'?{cat:'group'}:null;if(v!='grad')C.grad=[]}if(k=='vid'){const V=ccV(v);if(V&&!V.cap[C.vcfg])C.vcfg=V.cap.seat?'seat':'stand'}render()}
function ccDateIn(s){const t=new Date(s+'T00:00:00');if(isNaN(t))return null;return Math.round((t-new Date(2026,3,1))/864e5)}
const ccDateStr=d=>{const t=ccDate(d);return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`};
// anniversary: base date from the game's stored dates
function ccAnniBase(A){if(!A)return null;if(A.cat=='group'||A.cat=='sister'){const g=grp(+A.gid);if(!g)return null;const d=g.debutDay!=null?g.debutDay:g.founded;return d==null?null:{day:d,what:g.debutDay!=null?'debut':'founding',label:g.name}}
 if(A.cat=='team'){const g=grp(+A.gid),t=g&&(g.teams||[]).find(x=>x.id==A.tid);if(!t)return null;if(t.founded!=null)return{day:t.founded,what:'founding',label:t.name};const L=S.members.filter(m=>m.tid==t.id&&m.tjoined!=null).map(m=>m.tjoined);return L.length?{day:Math.min(...L),what:'first member join (team founding date not recorded)',label:t.name}:null}
 if(A.cat=='gen'){const g=grp(+A.gid);const L=[...S.members,...(S.alumni||[])].filter(m=>gsGid(m)==+A.gid&&(m.gen||1)==+A.gen&&m.joined!=null).map(m=>m.joined);return L.length?{day:Math.min(...L),what:'generation join date',label:`${g?g.name+' ':''}${ord(+A.gen)} Generation`}:null}return null}
function ccAnniTxt(C){const A=C.anni,b=ccAnniBase(A);if(!b)return'';const first=ccFirstDay(C),y=Math.max(0,Math.floor((first-b.day)/365.25));return`${b.label} — ${y?ordN(y)+' anniversary':'first year'} (${b.what}: ${jd(b.day)})`}
{const f=mkTeam;mkTeam=function(gid){const g=grp(gid),n=g?(g.teams||[]).length:0;const r=f.apply(this,arguments);try{if(g&&g.teams.length>n)g.teams.at(-1).founded=S.day}catch(e){}return r}}
const ccGradOk=m=>!!(m&&m.status!='graduated'&&m.grad&&m.grad.kind!='dismiss');
// ---- schedule -------------------------------------------------------------------------------------------------------------
const ccFirstDay=C=>C.start;
const ccDays=C=>[...new Set(C.pf.map(p=>p.d))].sort((a,b)=>a-b);
const ccSpan=C=>C.pf.length?Math.max(...C.pf.map(p=>p.d))+1:1;
const ccPfDay=(C,p)=>C.start+p.d;
const ccPfOrder=C=>C.pf.slice().sort((a,b)=>a.d-b.d||(a.sl=='a'?-1:1));
function ccPrepN(C){const V=ccV(C.vid);if(!V)return 0;const big=C.parts.length>=24,multi=C.pf.length>=4;return{lh:1,hall:1+(C.parts.length>16||multi?1:0),lhall:2,arena:2+(big||multi?1:0),stad:3+(big||multi?1:0),dome:3+(big||multi?1:0)}[V.cat]||1}
function ccSched(C){const P=ccPrepN(C),first=C.start,span=ccSpan(C);return{prepFrom:first-P,prepTo:first-1,prep:P,first,last:first+span-1,span,days:P+span,perfDays:ccDays(C).map(d=>first+d)}}
function ccPfAdd(){const C=ccCur();if(!ccEdit(C))return;if(C.pf.length>=5)return toast('A concert has at most 5 performances.','err');const used=new Set(C.pf.map(p=>p.d+p.sl));let pick=null;for(let d=0;d<3&&!pick;d++)for(const sl of['a','e'])if(!used.has(d+sl)){pick=[d,sl];break}if(!pick)return toast('Every slot of the three days is used.','err');C.pf.push(ccPfNew(C,pick[0],pick[1]));ccRenum(C);render()}
function ccPfDel(pid){const C=ccCur();if(!ccEdit(C))return;if(C.pf.length<=1)return toast('A concert needs at least one performance.','err');C.pf=C.pf.filter(p=>p.id!=pid);ccNorm(C);ccRenum(C);render()}
function ccPfSet(pid,k,v){const C=ccCur();if(!ccEdit(C))return;const p=C.pf.find(x=>x.id==pid);if(!p)return;if(k=='d'||k=='sl'){const nd=k=='d'?+v:p.d,ns=k=='sl'?v:p.sl;if(C.pf.some(x=>x!==p&&x.d==nd&&x.sl==ns))return toast('Another performance already uses that slot.','err');p.d=nd;p.sl=ns;ccNorm(C);ccRenum(C)}else p[k]=v;render()}
// days must be consecutive from day 1 (max 3 days)
function ccNorm(C){const ds=ccDays(C);if(!ds.length)return;const sh=ds[0];if(sh){C.pf.forEach(p=>p.d-=sh);C.start+=sh}}
function ccRenum(C){ccPfOrder(C).forEach((p,i)=>p.no=i+1)}
function ccGapErr(C){const ds=ccDays(C);for(let i=1;i<ds.length;i++)if(ds[i]-ds[i-1]>1)return'The concert days must be consecutive (no empty day between performance days).';return''}
// ---- participants --------------------------------------------------------------------------------------------------------
function ccPartTog(id){const C=ccCur();if(!ccEdit(C))return;id=+id;const i=C.parts.indexOf(id);if(i>=0){C.parts.splice(i,1);ccDropMember(C,id)}else C.parts.push(id);ccSnap(C);render()}
function ccPartSet(ids,on){const C=ccCur();if(!ccEdit(C))return;ids.forEach(id=>{const i=C.parts.indexOf(id);if(on&&i<0)C.parts.push(id);if(!on&&i>=0){C.parts.splice(i,1);ccDropMember(C,id)}});ccSnap(C);render()}
// a member removed from the concert leaves every formation / MC of this concert (positions stay, empty)
function ccDropMember(C,id){Object.values(C.sets).forEach(s=>s.items.forEach(it=>{if(it.k=='song')(it.pos||[]).forEach(z=>{if(z.m==id){z.m=null}});if(it.k=='mc')it.mem=(it.mem||[]).filter(x=>x!=id);if(it.cz&&it.cz.mem)delete it.cz.mem[id]}));C.grad=(C.grad||[]).filter(x=>x!=id)}
function ccCandidates(){return S.members.filter(m=>m.status!='graduated'&&(m.status=='trainee'||isAct(m)))}
// ---- songs ----------------------------------------------------------------------------------------------------------------
function ccSongsAll(){const L=[];S.groups.forEach(g=>{if(g.dis)return;const SG=gsCtx(g.id,'songs')||{};Object.values(SG).forEach(o=>{if(!o||!(o.rel||o.relDay!=null||(o.th&&o.th.deb!=null)||o.xFrom))return;L.push({gid:g.id,o})})});return L}
const ccSong=(gid,id)=>((gsCtx(gid,'songs')||{})[id])||null;
// original formation of a song (read only): [{m,r,c}] in position order
function ccOrigPos(o){const sl=(o&&o.fm&&o.fm.sl)||[];if(sl.length&&sl.some(z=>z.m)){return sl.map((z,i)=>({m:z.m||null,r:z.r||0,c:!!z.c,n:z.n||i+1,i:z.i!=null?z.i:i})).sort((a,b)=>a.r-b.r||a.i-b.i)}
 const ids=((o&&o.slots)||[]).filter(Boolean),cen=new Set((o&&o.centers)||[]);return ids.map((m,i)=>({m,r:0,c:cen.has(m),n:i+1,i}))}
// concert copy: original members who are concert participants keep their position; everyone else leaves an empty position
function ccCopyPos(C,o){const P=new Set(C.parts);return ccOrigPos(o).map(z=>{const m=ccMem(z.m),ok=z.m!=null&&P.has(z.m)&&m&&m.status!='graduated';return{m:ok?z.m:null,r:z.r,c:z.c,o:z.m||null,why:z.m==null?'':!m||m.status=='graduated'?'graduated':ok?'':'not in this concert'}})}
// ---- setlists -------------------------------------------------------------------------------------------------------------
let CC_IT=0;const ccIid=()=>'i'+Date.now().toString(36)+(++CC_IT);
function ccSetNew(name,copyOf){const C=ccCur();if(!ccEdit(C))return null;const n=Object.keys(C.sets).length+1,id='s'+n+'_'+Date.now().toString(36).slice(-4);
 const src=copyOf&&C.sets[copyOf];C.sets[id]={id,name:String(name||(src?src.name+' (copy)':'Setlist '+String.fromCharCode(64+n))).slice(0,40),items:src?JSON.parse(JSON.stringify(src.items)).map(it=>({...it,id:ccIid()})):[]};
 C.pf.forEach(p=>{if(!p.set||!C.sets[p.set])p.set=id});ui.ccs=id;render();return C.sets[id]}
function ccSetDel(sid){const C=ccCur();if(!ccEdit(C))return;if(C.pf.some(p=>p.set==sid))return toast('A performance still uses this setlist. Choose another setlist for it first.','err');delete C.sets[sid];ui.ccs=Object.keys(C.sets)[0]||null;render()}
function ccSetName(sid,v){const C=ccCur();if(!ccEdit(C)||!C.sets[sid])return;C.sets[sid].name=String(v||'').replace(/[<>]/g,'').trim().slice(0,40)||C.sets[sid].name;render()}
const ccSetOf=(C,p)=>p&&C.sets[p.set]||null;
const ccItemsOf=(C,sid)=>(C.sets[sid]||{items:[]}).items;
function ccAddSong(key){const C=ccCur(),s=C&&C.sets[ui.ccs];if(!ccEdit(C)||!s)return;const[gid,id]=String(key).split(':'),o=ccSong(+gid,id);if(!o)return;
 s.items.push({id:ccIid(),k:'song',gid:+gid,song:id,title:o.title,pos:ccCopyPos(C,o),orig:ccOrigPos(o).map(z=>({m:z.m,r:z.r,c:z.c})),cz:{mode:'orig'}});ui.ccadd=null;render()}
function ccAddMC(){const C=ccCur(),s=C&&C.sets[ui.ccs];if(!ccEdit(C)||!s)return;s.items.push({id:ccIid(),k:'mc',name:`MC ${s.items.filter(i=>i.k=='mc').length+1}`,all:true,mem:[]});render()}
function ccItem(C,iid){for(const s of Object.values(C.sets)){const it=s.items.find(x=>x.id==iid);if(it)return{s,it}}return null}
function ccItemDel(iid){const C=ccCur();if(!ccEdit(C))return;const r=ccItem(C,iid);if(!r)return;r.s.items=r.s.items.filter(x=>x.id!=iid);render()}
function ccItemMove(iid,dir){const C=ccCur();if(!ccEdit(C))return;const r=ccItem(C,iid);if(!r)return;const L=r.s.items,i=L.indexOf(r.it),j=i+dir;if(j<0||j>=L.length)return;[L[i],L[j]]=[L[j],L[i]];render()}
// saved setlists (reusable in other concerts)
function ccLibSave(sid){const C=ccCur(),s=C&&C.sets[sid];if(!s)return;const X=ccS();X.lib.push({id:'L'+Date.now().toString(36),name:s.name,day:S.day,from:C.name,items:JSON.parse(JSON.stringify(s.items))});toast(`Setlist “${s.name}” saved to the setlist library.`);render()}
function ccLibUse(lid){const C=ccCur();if(!ccEdit(C))return;const L=ccS().lib.find(x=>x.id==lid);if(!L)return;const s=ccSetNew(L.name);if(!s)return;
 s.items=JSON.parse(JSON.stringify(L.items)).map(it=>{it.id=ccIid();if(it.k=='song'){const o=ccSong(it.gid,it.song);const P=new Set(C.parts);if(o){it.pos=ccCopyPos(C,o);it.orig=ccOrigPos(o).map(z=>({m:z.m,r:z.r,c:z.c}))}else it.pos=(it.pos||[]).map(z=>({...z,m:z.m!=null&&P.has(z.m)?z.m:null}))}if(it.k=='mc')it.mem=(it.mem||[]).filter(x=>C.parts.includes(x));return it});toast(`Setlist “${L.name}” loaded (formations re-copied from the original songs for this concert's participants).`);render()}
function ccLibDel(lid){const X=ccS();X.lib=X.lib.filter(x=>x.id!=lid);render()}
// ---- formation editing (concert copy only) --------------------------------------------------------------------------------
function ccPosSet(iid,k,mid){const C=ccCur();if(!ccEdit(C))return;const r=ccItem(C,iid);if(!r)return;const it=r.it,z=it.pos[k];if(!z)return;mid=mid===''||mid==null?null:+mid;if(mid!=null&&!C.parts.includes(mid))return toast('Only concert participants can perform.','err');
 if(mid!=null){const j=it.pos.findIndex(x=>x.m==mid);if(j>=0&&j!=k)it.pos[j].m=z.m}z.m=mid;ccRender()}
function ccPosCen(iid,k){const C=ccCur();if(!ccEdit(C))return;const r=ccItem(C,iid);if(!r)return;const z=r.it.pos[k];if(z)z.c=!z.c;ccRender()}
function ccPosRow(iid,k,dr){const C=ccCur();if(!ccEdit(C))return;const r=ccItem(C,iid);if(!r)return;const z=r.it.pos[k];if(!z)return;z.r=Math.max(0,Math.min(5,z.r+dr));r.it.pos.sort((a,b)=>a.r-b.r);ccRender()}
function ccPosAdd(iid,row){const C=ccCur();if(!ccEdit(C))return;const r=ccItem(C,iid);if(!r)return;if(r.it.pos.length>=48)return toast('48 positions at most.','err');r.it.pos.push({m:null,r:+row||0,c:false,o:null,why:''});r.it.pos.sort((a,b)=>a.r-b.r);ccRender()}
function ccPosDel(iid,k){const C=ccCur();if(!ccEdit(C))return;const r=ccItem(C,iid);if(!r)return;r.it.pos.splice(k,1);ccRender()}
function ccPosReset(iid){const C=ccCur();if(!ccEdit(C))return;const r=ccItem(C,iid);if(!r)return;const o=ccSong(r.it.gid,r.it.song);if(!o)return toast('The original song is no longer in the library.','err');r.it.pos=ccCopyPos(C,o);toast('Formation reset to the original song (participants only).');ccRender()}
function ccPosFill(iid){const C=ccCur();if(!ccEdit(C))return;const r=ccItem(C,iid);if(!r)return;const used=new Set(r.it.pos.map(z=>z.m).filter(x=>x!=null));const free=C.parts.filter(id=>!used.has(id)&&get(id));r.it.pos.forEach(z=>{if(z.m==null&&free.length)z.m=free.shift()});ccRender()}
function ccPosAll(iid){const C=ccCur();if(!ccEdit(C))return;const r=ccItem(C,iid);if(!r)return;const used=new Set(r.it.pos.map(z=>z.m).filter(x=>x!=null));C.parts.filter(id=>!used.has(id)&&get(id)).forEach(id=>r.it.pos.push({m:id,r:Math.max(0,...r.it.pos.map(z=>z.r),0),c:false,o:null,why:''}));ccRender()}
const ccPerf=it=>(it.pos||[]).filter(z=>z.m!=null).map(z=>z.m);
function ccRowsOf(it){const R=[...new Set((it.pos||[]).map(z=>z.r))].sort((a,b)=>a-b);return R}
// position class of a member in a song: center / front / middle / back
function ccPosCls(it,mid){const z=(it.pos||[]).find(x=>x.m==mid);if(!z)return null;if(z.c)return'center';const R=ccRowsOf(it),i=R.indexOf(z.r);if(R.length<=1||i==0)return'front';if(i==R.length-1)return'back';return'middle'}
// MC
function ccMcSet(iid,k,v){const C=ccCur();if(!ccEdit(C))return;const r=ccItem(C,iid);if(!r)return;const it=r.it;if(k=='all'){it.all=!!v;if(v)it.mem=[]}else if(k=='name')it.name=String(v||'MC').replace(/[<>]/g,'').slice(0,40);else if(k=='tog'){v=+v;it.all=false;const i=it.mem.indexOf(v);if(i>=0)it.mem.splice(i,1);else if(C.parts.includes(v))it.mem.push(v)}ccRender()}
const ccMcMem=(C,it)=>it.all?C.parts.slice():(it.mem||[]).filter(id=>C.parts.includes(id));
// ---- costumes -------------------------------------------------------------------------------------------------------------
// it.cz = {mode:'orig'|'prev'|'one'|'mem', d:designId, mem:{mid:designId}}
function ccCzSet(iid,k,v){const C=ccCur();if(!ccEdit(C))return;const r=ccItem(C,iid);if(!r)return;const z=r.it.cz=r.it.cz||{mode:'orig'};if(k=='mode'){z.mode=v;if(v=='mem')z.mem=z.mem||{}}else if(k=='d'){z.d=v||null;if(z.mode!='one')z.mode='one'}else if(k=='mem'){const[mid,d]=v;z.mem=z.mem||{};if(d)z.mem[mid]=d;else delete z.mem[mid];z.mode='mem'}ccRender()}
function ccCzCopyAll(iid,mid){const C=ccCur();if(!ccEdit(C))return;const r=ccItem(C,iid);if(!r)return;const z=r.it.cz;if(!z||!z.mem||!z.mem[mid])return;ccPerf(r.it).forEach(id=>z.mem[id]=z.mem[mid]);toast('Costume copied to every performer of this song.');ccRender()}
function ccCzRandom(iid){const C=ccCur();if(!ccEdit(C))return;const r=ccItem(C,iid);if(!r)return;const d={id:czId(),name:cleanName(`${r.it.title} concert costume`).slice(0,40)||'Concert costume',p:czRandom(),style:'',created:S.day,updated:S.day,cc:C.id};czLib().ds.push(d);r.it.cz={mode:'one',d:d.id};toast(`New costume “${d.name}” saved to the Costume Library and assigned.`);ccRender()}
function ccCzNew(iid){const C=ccCur();if(!ccEdit(C))return;const r=ccItem(C,iid);if(!r)return;czInit();czNew(0);const d=czLib().ds.at(-1);d.name=cleanName(`${r.it.title} concert costume`).slice(0,40)||d.name;d.cc=C.id;r.it.cz={mode:'one',d:d.id};ui.ccBack={c:C.id,s:ui.ccs};Object.assign(ui.czE,{did:d.id,p:czClone(d.p),style:d.style||'',dirty:0});view='costume';render()}
function ccCzEdit(did){const C=ccCur();if(!C)return;czInit(did);ui.ccBack={c:C.id,s:ui.ccs};view='costume';render()}
{const f=V.costume;V.costume=function(){const h=f.apply(this,arguments),b=ui.ccBack;return b?`<div class="c gebanner"><span class="geprb">CONCERT</span><span class="st">Designing a concert costume. Saved designs go to the shared Costume Library.</span><button class="b s p" onclick="ui.cc='${b.c}';ui.ccs='${b.s||''}';ui.cct='set';ui.ccBack=null;goView('concert')">← Back to the Concert setlist</button></div>`+h:h}}
// costume design (p) a member wears for one song item in the concert; null = none
function ccCzFor(C,set,idx,mid,depth=0){const it=set.items[idx];if(!it||it.k!='song'||depth>40)return null;const z=it.cz||{mode:'orig'};
 if(z.mode=='prev'){for(let j=idx-1;j>=0;j--)if(set.items[j].k=='song')return ccCzFor(C,set,j,mid,depth+1);return null}
 if(z.mode=='one'){const d=czD(z.d);return d?d.p:null}if(z.mode=='mem'){const d=czD((z.mem||{})[mid]);return d?d.p:null}
 const o=ccSong(it.gid,it.song);if(!o)return null;let p=null;try{gsWith(it.gid,()=>{p=czFor(o,mid)})}catch(e){}return p}
const ccCzTxt=(C,set,idx)=>{const it=set.items[idx],z=it.cz||{mode:'orig'};if(z.mode=='prev')return'Same as the previous song';if(z.mode=='one'){const d=czD(z.d);return d?'Design: '+d.name:'Choose a design'}if(z.mode=='mem')return`Individual designs (${Object.keys(z.mem||{}).length})`;return'Original song costume'};
// ---- expenses (automatic) --------------------------------------------------------------------------------------------------
const CC_PROD={lh:1800000,hall:4500000,lhall:9000000,arena:32000000,stad:70000000,dome:90000000};
const CC_CREW={lh:14,hall:24,lhall:40,arena:90,stad:160,dome:180};
const CC_PSHARE=[['stage','Stage structures',.24],['deco','Stage decoration',.09],['light','Lighting equipment',.19],['sound','Sound equipment',.17],['led','LED screens',.15],['video','Video systems',.08],['fx','Visual effects',.05],['setup','Setup and dismantling',.03]];
const ccCap=C=>{const V=ccV(C.vid);return V?(V.cap[C.vcfg]||V.cap.seat||V.cap.stand||0):0};
const ccTokyo=V=>['Tokyo','Kanagawa','Saitama'].includes(V.pref);
// rental for one calendar day: kind 'perf' (with the slots used that day) or 'prep'
function ccRentDay(V,day,kind,slots){const we=ccWE(day);if(V.slots){if(kind=='prep')return{a:we?V.slots.prepWe:V.slots.prep.wd,t:we?'Weekend/holiday full-day setup':'Weekday setup 09:00–23:00'};if(we)return{a:V.slots.perfWe,t:'Weekend/holiday full-day performance'};const a=slots.includes('a'),e=slots.includes('e');return a&&e?{a:V.slots.perf.ae,t:'Weekday 09:00–23:00'}:a?{a:V.slots.perf.a,t:'Weekday 09:00–17:00'}:{a:V.slots.perf.e,t:'Weekday 13:00–23:00 (setup before an evening show)'}}
 if(V.lo!=null){if(kind=='prep'){const a=Math.round(V.lo*.5);return{a:ccTax(V,a),t:'Setup day — estimated game price (50% of the lower reference price)',est:1}}const a=we?V.hi:V.lo;return{a:ccTax(V,a),t:`${we?'Weekend/holiday: upper':'Weekday: lower'} end of the published range + 10% consumption tax`}}
 const r=V.r[kind]||V.r.perf;return{a:we?r.we:r.wd,t:`${kind=='prep'?'Setup':'Performance'} day · ${we?'weekend/holiday':'weekday'}`}}
function ccRent(C){const V=ccV(C.vid);if(!V)return{rows:[],perf:0,prep:0,total:0};const Sd=ccSched(C),rows=[];let perf=0,prep=0;
 for(let d=Sd.prepFrom;d<=Sd.prepTo;d++){const r=ccRentDay(V,d,'prep',[]);rows.push({day:d,kind:'Preparation',...r});prep+=r.a}
 for(let i=0;i<Sd.span;i++){const d=Sd.first+i,sl=C.pf.filter(p=>p.d==i).map(p=>p.sl);const r=ccRentDay(V,d,sl.length?'perf':'prep',sl);rows.push({day:d,kind:sl.length?'Performance':'Hold day',...r});if(sl.length)perf+=r.a;else prep+=r.a}
 return{rows,perf,prep,total:perf+prep}}
function ccTypeF(C){return C.type=='anni'?1.15:C.type=='grad'?1.1:1}
// the full automatic estimate (fixed costs only; Part 2 adds streaming and ticketing fees from ticket settings / revenue)
function ccCost(C){const V=ccV(C.vid);if(!V)return null;const Sd=ccSched(C),cap=ccCap(C),np=C.pf.length,nm=Math.max(1,C.parts.length),tf=ccTypeF(C),R=ccRent(C),days=Sd.days,pd=Sd.span;
 const prodBase=(CC_PROD[V.cat]+cap*300)*tf*(1+.04*Math.max(0,nm-16)/4),inc=new Set(V.inc||[]);
 const prod=CC_PSHARE.map(([k,n,w])=>{let a=prodBase*w;if(inc.has(k))a*=.4;if(k=='setup')a*=1+.15*(pd-1);return{k,n:n+(inc.has(k)?' (house equipment included in the rental — only additions charged)':''),a:Math.round(a)}});
 const crew=CC_CREW[V.cat],wage=32000;
 const ops=[['tech','Technical crew',crew*.25*wage*days],['stagec','Stage crew',crew*.35*wage*days],['snd','Sound engineers',crew*.1*wage*(pd+1)*(inc.has('sound')?.5:1)],['lop','Lighting operators',crew*.1*wage*(pd+1)*(inc.has('light')?.5:1)],
  ['sec','Security',cap*110*np],['med','Medical personnel',(60000+cap*8)*np],['aud','Audience management',cap*70*np],['clean','Cleaning',cap*35*np],['util','Electricity and venue utilities',({lh:60000,hall:150000,lhall:300000,arena:900000,stad:1800000,dome:2200000}[V.cat])*days],['ins','Insurance',(150000+cap*14)*pd]].map(([k,n,a])=>({k,n,a:Math.round(a)}));
 const far=!ccTokyo(V),trips=far?2:pd;
 const tr=[['mtr','Member transportation',nm*(far?26000:9000)*(far?1:pd)],['str','Staff transportation',crew*(far?22000:3000)*(far?1:pd)],['etr','Equipment transportation (trucks)',({lh:250000,hall:600000,lhall:1100000,arena:3200000,stad:6500000,dome:7500000}[V.cat])*(far?2:1)]].map(([k,n,a])=>({k,n,a:Math.round(a)}));
 const nights=far?pd+1:(pd>1?pd-1:0);
 const acc=[['macc','Member accommodation',nm*14000*nights],['sacc','Staff accommodation',crew*.6*9000*(far?days:0)],['xacc','Additional accommodation for multi-day events',pd>1?crew*.4*9000*(pd-1):0]].map(([k,n,a])=>({k,n,a:Math.round(a)}));
 const mkt=[['ads','Advertising',cap*120*Math.sqrt(np)*tf],['post','Posters',80000+cap*12],['dig','Digital promotions',150000+cap*40*Math.sqrt(np)],['pm','Promotional materials',60000+cap*15]].map(([k,n,a])=>({k,n,a:Math.round(a)}));
 const G={venue:{n:'Venue Rental',rows:[{k:'vperf',n:'Performance-day rental',a:R.perf},{k:'vprep',n:'Preparation / setup-day rental',a:R.prep}]},prod:{n:'Stage Production',rows:prod.concat([{k:'eqt',n:'Equipment transportation — counted under Transportation',a:0}])},ops:{n:'Operational Expenses',rows:ops},tr:{n:'Transportation',rows:tr},acc:{n:'Accommodation',rows:acc},mkt:{n:'Marketing',rows:mkt}};
 let sub=0;Object.values(G).forEach(g=>{g.a=g.rows.reduce((a,r)=>a+r.a,0);sub+=g.a});const misc=Math.round((sub-R.total)*.03);G.misc={n:'Miscellaneous',rows:[{k:'cont',n:'Unexpected expenses (3% contingency)',a:misc},{k:'addop',n:'Additional operating costs',a:Math.round(5000*nm*pd)}]};G.misc.a=G.misc.rows.reduce((a,r)=>a+r.a,0);sub+=G.misc.a;
 return{G,total:sub,rent:R,sched:Sd,cap}}
// ---- validation -----------------------------------------------------------------------------------------------------------
function ccErrs(C){const E=[];if(!ccV(C.vid))E.push('Choose a venue.');if(!C.parts.length)E.push('Choose the participating members.');if(!C.pf.length)E.push('Add at least one performance.');const g=ccGapErr(C);if(g)E.push(g);
 const Sd=ccSched(C);if(Sd.prepFrom<=S.day)E.push(`The preparation period starts ${jd(Sd.prepFrom)} — choose a later first performance date.`);
 C.pf.forEach(p=>{const s=ccSetOf(C,p);if(!s)E.push(`Performance ${p.no}: choose a setlist.`);else if(!s.items.some(i=>i.k=='song'))E.push(`Performance ${p.no}: setlist “${s.name}” has no song.`);else s.items.forEach((it,i)=>{if(it.k=='song'&&!ccPerf(it).length)E.push(`Setlist “${s.name}” M${i+1} “${it.title}”: no performer.`)})});
 if(C.type=='anni'){const b=ccAnniBase(C.anni);if(!b)E.push('Choose the anniversary target (group, team or generation).')}
 if(C.type=='grad'){if(!C.grad.length)E.push('Choose the graduating member(s).');C.grad.forEach(id=>{if(!C.parts.includes(id))E.push(`${ccNm(C,id)} must be a participant of her Graduation Concert.`)})}
 return E}
// schedule conflicts of participants (calendar, theater, other groups' activities, other concerts)
function ccConf(C){const out=[],Sd=ccSched(C);C.parts.forEach(mid=>{Sd.perfDays.forEach(d=>{let L=[];try{L=gsCommits(mid,d,d).filter(c=>!(c.src=='cc'&&c.id==C.id))}catch(e){}L.forEach(c=>out.push({mid,day:d,label:c.label||c.type}))})});return out}
// concerts are commitments: the theater and other groups see members as busy on performance days
{const f=gsCommits;gsCommits=function(mid,from,to){const L=f.apply(this,arguments);try{from=from??S.day;to=to??(S.day+400);ccS().list.forEach(C=>{if(!['conf','sales','live'].includes(C.status)||!C.parts.includes(mid))return;ccSched(C).perfDays.forEach(d=>{if(d>=from&&d<=to)L.push({src:'cc',id:C.id,gid:C.host,type:'concert',label:`Concert: ${C.name}`,day:d,s:0,e:1440})})})}catch(e){}return L}}
