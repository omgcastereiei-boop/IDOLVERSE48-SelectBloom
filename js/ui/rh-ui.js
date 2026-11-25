// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Request Hour: election / Janken singles + big-event presentation
// -------------------------------------------------------------------------------------
//  · Any single can carry the Request Hour voting codes: a General Election single (its CDs then carry a ballot AND a
//    Request Hour code), a single made from the election results, a Janken single… (albums still cannot).
//    The election single's daily sales are kept by the election (e.daily); they are copied into the single's daily
//    sales so every CD sold during the voting month counts exactly as for any other single.
//  · Request Hour looks like the big annual event it is: a stage poster with spotlights and lightsticks, the event's
//    five steps, a large launch card, and a banner on the Concerts page.
// =====================================================================================
const RHU_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
rhLink=function(id){const E=rhGet(id);if(!E||E.status!='setup')return;const er=rhErrs(E,1);if(er.length)return toast(er[0],'err');
 if(typeof gsAg=='function'&&gsAg()!=E.gid)return toast(rhT(`Switch to ${rhGrp(E.gid).name} first (the Request Hour single is that group's single).`,`สลับไปที่วง ${rhGrp(E.gid).name} ก่อน (ซิงเกิล Request Hour เป็นซิงเกิลของวงนั้น)`),'err');
 const p=S.pj;if(!p||p.status!='draft')return toast(rhT('Start planning a single first (or finish the one in production).','เริ่มวางแผนซิงเกิลก่อน (หรือปล่อยซิงเกิลที่กำลังผลิตให้เสร็จ)'),'err');
 if(plAlb&&plAlb(p))return toast(rhT('An album cannot carry Request Hour voting codes.','อัลบั้มไม่สามารถแนบรหัสโหวต Request Hour ได้'),'err');
 if(p.rh&&p.rh!=E.id)return toast(rhT('This single already carries another Request Hour.','ซิงเกิลนี้ผูกกับ Request Hour อื่นอยู่แล้ว'),'err');
 const kind=p.ge?RHU_T(' (General Election single: every CD carries a ballot and a Request Hour code)',' (ซิงเกิลเลือกตั้ง: ซีดีทุกแผ่นมีทั้งบัตรเลือกตั้งและรหัส Request Hour)'):p.geNext?RHU_T(' (election results single)',' (ซิงเกิลจากผลเลือกตั้ง)'):p.jk?RHU_T(' (Janken single)',' (ซิงเกิลจังเก้น)'):'';
 p.rh=E.id;E.status='single';E.log.push({d:S.day,t:'single'});toast(rhT('This single is now the Request Hour single. Produce it as usual — every CD sold during the voting month carries one voting code.','ซิงเกิลนี้เป็นซิงเกิล Request Hour แล้ว ผลิตตามปกติ — ซีดีที่ขายในเดือนโหวตมีรหัสโหวต 1 รหัสต่อแผ่น')+kind);goView('music')};
// election single: its daily sales (kept by the election) become the single's daily sales for the voting codes
function rhuDslSync(E){try{const x=rhX(E);if(!x||!x.ge)return;let e=null;gsWith(E.gid,()=>{e=(geS().list||[]).find(z=>z.rid==x.rid)||null});if(!e||!Array.isArray(e.daily))return;x.dsl=x.dsl||{};const D={};e.daily.forEach(r=>{if(r&&r.day!=null)D[r.day]=(D[r.day]||0)+(+r.sales||0)});
 // the release-day entry stores the cumulative units of that day
 for(const d in D){if(x.dsl[d]==null||x.dsl[d]<D[d])x.dsl[d]=D[d]}}catch(e){console.error(e)}}
{const f=rhVoteTo;rhVoteTo=function(E){try{rhuDslSync(E)}catch(e){}return f.apply(this,arguments)}}
// ---- presentation ----------------------------------------------------------------------------------------------------------------
function rhuPoster(E,big){const g=E?rhGrp(E.gid):rhGrp(typeof gsAg=='function'?gsAg():null),y=E?dayDate(E.date).getFullYear():dayDate(S.day).getFullYear()+1,size=E?E.size:25,gn=g?g.name:'',hue=(g&&g.color)||'#f2789f';
 const sticks=[...Array(46)].map((_,i)=>{const x=8+i*13.6,c=['#ff6fb5','#ffd86b','#7ad7ff','#b98cff','#7dffb0'][i%5],h=14+((i*37)%11);return`<rect x="${x.toFixed(1)}" y="${(196-h).toFixed(1)}" width="3" height="${h}" rx="1.5" fill="${c}" opacity=".9"/><circle cx="${(x+1.5).toFixed(1)}" cy="${(196-h).toFixed(1)}" r="3.4" fill="${c}" opacity=".55"/>`}).join('');
 return`<svg class="rhposter ${big?'big':''}" viewBox="0 0 640 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Request Hour">
 <defs><linearGradient id="rhpbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b0f33"/><stop offset=".65" stop-color="#3a1856"/><stop offset="1" stop-color="#120a22"/></linearGradient>
 <linearGradient id="rhpgold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3c4"/><stop offset=".5" stop-color="#ffd25e"/><stop offset="1" stop-color="#d08a1e"/></linearGradient>
 <radialGradient id="rhpsp" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
 <rect width="640" height="220" rx="18" fill="url(#rhpbg)"/>
 ${[90,230,410,550].map((x,i)=>`<path d="M${x} 0 L${x-70} 200 L${x+70} 200 Z" fill="url(#rhpsp)" opacity="${i%2?.35:.5}"/>`).join('')}
 ${[...Array(40)].map((_,i)=>`<circle cx="${(i*163)%640}" cy="${(i*71)%120+6}" r="${1+(i%3)*.6}" fill="#fff" opacity="${.35+(i%4)*.12}"/>`).join('')}
 <rect x="0" y="160" width="640" height="60" fill="#0d0718" opacity=".85"/>${sticks}
 <text x="320" y="70" text-anchor="middle" font-family="Quicksand,sans-serif" font-weight="900" font-size="46" letter-spacing="4" fill="url(#rhpgold)" stroke="#5a2a00" stroke-width=".6">REQUEST HOUR</text>
 <text x="320" y="96" text-anchor="middle" font-family="Quicksand,sans-serif" font-weight="800" font-size="13" letter-spacing="6" fill="#ffe7f4">リクエストアワー セットリストベスト ${size}</text>
 <text x="320" y="132" text-anchor="middle" font-family="Quicksand,sans-serif" font-weight="900" font-size="24" fill="#fff">${esc(gn)} ${y}</text>
 <rect x="236" y="140" width="168" height="4" rx="2" fill="${hue}"/></svg>`}
const RHU_STEPS=[['setup','Setup','ตั้งค่า'],['single','Request Hour single','ซิงเกิล Request Hour'],['voting','Voting month','เดือนโหวต'],['closed','Ranking','ประกาศอันดับ'],['concert','Concert','คอนเสิร์ต']];
function rhuSteps(E){const order=['setup','single','voting','closed','concert','done'],i=Math.max(0,order.indexOf(E.status));return`<div class="rhsteps">${RHU_STEPS.map(([k,en,th],j)=>`<div class="rhstep ${j<i||E.status=='done'?'ok':j==i?'on':''}"><i>${j<i||E.status=='done'?'✓':j+1}</i><span>${RHU_T(en,th)}</span></div>`).join('')}</div>`}
function rhuLaunch(){const R=rhS(),act=R.list.filter(e=>e.status!='done').length,last=R.hist.slice().sort((a,b)=>b.closed-a.closed)[0];
 return`<div class="c rhlaunch">${rhuPoster(null,1)}<div class="rhlaunchb"><h2>${RHU_T('The biggest fan event of the year','อีเวนต์ใหญ่ที่สุดแห่งปีของแฟน ๆ')}</h2>
 <p>${RHU_T('Fans vote for the songs they want to see on stage again — every released song can win: title tracks, couplings, theater and unit songs, solos, duets and sister-group songs. The ranking is revealed from the bottom to No. 1 in a countdown concert.','แฟน ๆ โหวตเพลงที่อยากดูบนเวทีอีกครั้ง — ทุกเพลงที่ปล่อยแล้วมีสิทธิ์ชนะ ทั้งเพลงหลัก เพลงรอง เพลงเธียเตอร์ ยูนิต โซโล่ ดูเอ็ท และเพลงวงน้อง อันดับประกาศจากท้ายสุดจนถึงอันดับ 1 ในคอนเสิร์ตนับถอยหลัง')}</p>
 <div class="rhfeat">${[['🎫',RHU_T('Voting codes in the CDs of the Request Hour single (any single: election and Janken singles too)','รหัสโหวตในซีดีของซิงเกิล Request Hour (ใช้ได้ทุกซิงเกิล รวมซิงเกิลเลือกตั้งและจังเก้น)')],['🗳️',RHU_T('One voting month from release day','เดือนโหวต 1 เดือนนับจากวันวางจำหน่าย')],['🏆',RHU_T('Top 25 by default · up to 200 songs','Top 25 เป็นค่าเริ่มต้น · สูงสุด 200 เพลง')],['🎤',RHU_T('Countdown concert created automatically','สร้างคอนเสิร์ตนับถอยหลังให้อัตโนมัติ')]].map(([i,t])=>`<div><b>${i}</b><span>${t}</span></div>`).join('')}</div>
 <div class="row rhact"><button class="b p rhgo" onclick="rhNew()">✦ ${RHU_T('Create Request Hour','สร้าง Request Hour')}</button>${last?`<span class="st">${RHU_T('Last No. 1','อันดับ 1 ครั้งล่าสุด')}: <b>${esc(last.win?last.win.title:'—')}</b> (${last.year})</span>`:''}${act?`<span class="tag tmain">${act} ${RHU_T('in progress','กำลังดำเนินการ')}</span>`:''}</div></div></div>`}
{const f=V.rh;V.rh=function(){let h=f.apply(this,arguments);try{const E=rhCur();
  if(!E){const i=h.indexOf('<div class="c rhintro">');if(i>=0){const j=h.indexOf('</div>',h.indexOf('</button>',i))+6;h=h.slice(0,i)+rhuLaunch()+h.slice(j)}}
  else{const i=h.indexOf('<div class="c rhev">');if(i>=0)h=h.slice(0,i)+`<div class="rhhero">${rhuPoster(E,1)}${rhuSteps(E)}</div>`+h.slice(i)}}catch(e){console.error(e)}return h}}
// Concerts page: a banner instead of a small button
{const f=V.concert;V.concert=function(){let h=f.apply(this,arguments);try{if(!ccCur()){const R=rhS(),E=R.list.filter(e=>e.status!='done').sort((a,b)=>a.date-b.date)[0],st=E?(rhTh()?RH_ST_TH[E.status]:RH_ST[E.status]):'';
  const ban=`<div class="c rhban" onclick="ui.rhe=${E?`'${E.id}'`:'null'};ui.rht='${E&&E.status=='voting'?'vote':E&&['closed','concert'].includes(E.status)?'res':'setup'}';goView('rh')">${rhuPoster(E,0)}<div class="rhbanb"><b>🎤 Request Hour</b><span>${E?`${esc(E.name)} · ${st}${E.status=='voting'?` · ${RHU_T('voting closes','ปิดโหวต')} ${jd(E.close)}`:''}`:RHU_T('Create this year\'s Request Hour — fans choose the setlist.','สร้าง Request Hour ของปีนี้ — แฟน ๆ เป็นคนเลือกเซ็ตลิสต์')}</span></div><button class="b p">${E?RHU_T('Open','เปิด'):RHU_T('Create','สร้าง')}</button></div>`;
  h=h.replace(/<button class="b s rhnav"[^>]*>[^<]*<\/button>/,'');const k=h.indexOf('<div class="c');h=k>=0?h.slice(0,k)+ban+h.slice(k):ban+h}}catch(e){console.error(e)}return h}}
