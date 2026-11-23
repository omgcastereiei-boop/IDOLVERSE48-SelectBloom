// =====================================================================================
//  IDOLVERSE48: Select Bloom! — election single planning, round 2
// -------------------------------------------------------------------------------------
//  1. Release Day and the ceremony date are picked on a game calendar that shows the schedule of every day
//     (calendar events of all groups, concerts, Theater shows of this group).
//  2. Election editions: a Type may be sold as a Limited Edition only (the Regular Edition can be removed while
//     a Limited Edition exists). If no Regular Edition is sold at all, election CDs stop at the total stock.
//  3. Media Senbatsu picker: Title Track members first, in their position order; taps update in place (fast).
//  4. The Pre-ceremony Concert is optional ("Hold a concert" on/off in the election schedule). When held, its venue
//     is chosen there; its setlist can wait. One afternoon performance on the ceremony day: no extra performance,
//     no evening slot, no date change.
//  5. No separate confirmation: starting the election single's production confirms the concert (venue rental paid,
//     ticket sale scheduled). Setlists stay editable until the performance, as for every confirmed concert.
// =====================================================================================
const g2T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
// ---- 1. calendar picker ------------------------------------------------------------------------------------------------------
function gcalEvents(d0,d1){const M={},add=(d,t,c)=>{if(d<d0||d>d1)return;(M[d]=M[d]||[]).push({t,c})};
 try{(S.groups||[]).forEach(g=>{const L=g.id==S.ag?S.cal:(g.ctx&&g.ctx.cal);(L||[]).forEach(e=>{if(!e||e.day==null)return;const end=e.day2!=null?e.day2:e.day;for(let d=e.day;d<=end&&d<=d1;d++)add(d,(S.groups.length>1&&g.id!=S.ag?g.name+' · ':'')+(e.title||e.type||''),e.type||'ev')})})}catch(x){}
 try{ccS().list.forEach(C=>{if(!C||C.status=='cancel')return;C.pf.forEach(p=>add(ccPfDay(C,p),`🎤 ${C.name} (${CC_SLS[p.sl]||''})`,'cc'))})}catch(x){}
 try{thKeys().filter(K=>K.gid==gsAg()).forEach(K=>thShowsOf(K.key).forEach(x=>{if(x.st=='sched')add(x.day,`🎭 ${K.label} · ${TH_SLOT[x.sl]||''}`,'th')}))}catch(x){}
 try{const p=S.pj;if(p&&p.releaseDay!=null&&p.status=='producing')add(p.releaseDay,`💿 ${g2T('Release','วางขาย')}: ${p.title}`,'rel')}catch(x){}
 return M}
function gcalOpen(kind){const p=S.pj;if(!p)return;if(kind=='cer'){const e=geGet(p.ge);if(e&&e.st!='setup')return toast(g2T('The ceremony date is fixed once the election single goes into production.','วันประกาศผลล็อกแล้วตั้งแต่เริ่มผลิตซิงเกิลเลือกตั้ง'),'err')}const cur=kind=='rel'?seRel(p):((geGet(p.ge)||{}).cerPlan||{}).day;const base=cur||(kind=='rel'?seRelMin():(geCerDaysFor(seRel(p))[0]||S.day));const t=dayDate(base);
 ui.gcal={kind,y:t.getFullYear(),m:t.getMonth(),sel:base};ui.mod={t:'html',gcal:1,h:gcalHtml()};render()}
function gcalOk(kind,d){const p=S.pj;if(!p)return false;if(kind=='rel')return d>=seRelMin();return geCerDaysFor(seRel(p)).includes(d)}
function gcalHtml(){const G=ui.gcal,p=S.pj;if(!G||!p)return'';const first=dateDay(new Date(G.y,G.m,1)),dim=new Date(G.y,G.m+1,0).getDate(),dow=new Date(G.y,G.m,1).getDay(),last=first+dim-1,EV=gcalEvents(first,last),cur=G.kind=='rel'?seRel(p):((geGet(p.ge)||{}).cerPlan||{}).day;
 const rel=seRel(p),vE=p.ge?geEnd(G.kind=='rel'?(G.sel||rel):rel):null,vS=G.kind=='rel'?(G.sel||rel):rel,wd=g2T('Sun Mon Tue Wed Thu Fri Sat','อา จ อ พ พฤ ศ ส').split(' ');
 let cells='';for(let i=0;i<dow;i++)cells+='<span class="gcx"></span>';
 for(let d=first;d<=last;d++){const ok=gcalOk(G.kind,d),ev=EV[d]||[],vote=p.ge&&vE&&d>=vS&&d<=vE,cls=[ok?'ok':'no',d==G.sel?'sel':'',d==cur?'cur':'',d==S.day?'today':'',vote?'vote':''].join(' ');
  cells+=`<button type="button" class="gcd ${cls}" onclick="ui.gcal.sel=${d};ui.mod.h=gcalHtml();render()"><b>${dayDate(d).getDate()}</b>${ev.length?`<i class="gcdot">${ev.length>1?ev.length:''}</i>`:''}</button>`}
 const sel=G.sel,L=sel!=null?(gcalEvents(sel,sel)[sel]||[]):[],okSel=sel!=null&&gcalOk(G.kind,sel);
 const conf=G.kind=='rel'&&sel!=null?seRelConf(p,sel):[],shows=G.kind=='rel'&&sel!=null?seRelShows(sel):[];
 const nav=dm=>`ui.gcal.m+=${dm};if(ui.gcal.m<0){ui.gcal.m=11;ui.gcal.y--}if(ui.gcal.m>11){ui.gcal.m=0;ui.gcal.y++}ui.mod.h=gcalHtml();render()`;
 return`<h2 class="ht">📅 ${G.kind=='rel'?g2T('Release Day','วันวางขาย'):g2T('Ranking Announcement Ceremony','วันประกาศผล')}</h2>
 <p class="st">${G.kind=='rel'?g2T(`Production takes ${CFG.prodDays||28} days — earliest ${jd(seRelMin())}.${p.ge?' Release Day = voting day 1; voting lasts two months.':''}`,`ผลิต ${CFG.prodDays||28} วัน — เร็วสุด ${jd(seRelMin())}${p.ge?' วันวางขาย = วันเปิดโหวตวันแรก โหวต 2 เดือน':''}`):g2T('Saturdays and Sundays after voting closes.','เฉพาะเสาร์–อาทิตย์หลังปิดโหวต')}</p>
 <div class="gcal"><div class="gch"><button class="b s" onclick="${nav(-1)}">◀</button><b>${new Date(G.y,G.m,1).toLocaleDateString(typeof UIP!='undefined'&&UIP.lang=='th'?'th-TH-u-ca-gregory':'en-US',{month:'long',year:'numeric'})}</b><button class="b s" onclick="${nav(1)}">▶</button></div>
 <div class="gcw">${wd.map(x=>`<span>${x}</span>`).join('')}</div><div class="gcg">${cells}</div>
 <div class="gcleg"><span><i class="lg ok"></i>${g2T('can be chosen','เลือกได้')}</span><span><i class="lg cur"></i>${g2T('current','ที่เลือกไว้')}</span>${p.ge?`<span><i class="lg vote"></i>${g2T('voting period','ช่วงโหวต')}</span>`:''}<span><i class="gcdot"></i>${g2T('scheduled','มีตารางงาน')}</span></div></div>
 ${sel!=null?`<div class="c gcday"><b>${dayDate(sel).toLocaleDateString(typeof UIP!='undefined'&&UIP.lang=='th'?'th-TH-u-ca-gregory':'en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</b>
  ${L.length?`<ul class="ms">${L.map(x=>`<li>${esc(x.t)}</li>`).join('')}</ul>`:`<p class="st">${g2T('Nothing scheduled.','ไม่มีตารางงาน')}</p>`}
  ${shows.length?`<p class="st thwarn">⚠ ${g2T(`${shows.length} Theater show(s) of this group will be cancelled.`,`การแสดงเธียเตอร์ ${shows.length} รอบจะถูกยกเลิก`)}</p>`:''}${conf.length?`<p class="st thwarn">⚠ ${esc(conf[0])}${conf.length>1?` (+${conf.length-1})`:''}</p>`:''}
  ${G.kind=='rel'&&p.ge?`<p class="st">${g2T('Voting closes','ปิดโหวต')} ${jd(geEnd(sel))}</p>`:''}
  <div class="row"><button class="b p" ${okSel?'':'disabled'} onclick="gcalPick(${sel})">${okSel?g2T('Choose this day','เลือกวันนี้'):g2T('This day cannot be chosen','เลือกวันนี้ไม่ได้')}</button></div></div>`:''}`}
function gcalPick(d){const G=ui.gcal;if(!G||!gcalOk(G.kind,d))return;ui.mod=null;ui.gcal=null;if(G.kind=='rel')seRelSet(thDateStr(d));else geCerPick(d)}
const gcalBtn=(kind,d)=>`<button type="button" class="b s gcbtn" onclick="gcalOpen('${kind}')">📅 ${d!=null?jd(d):g2T('Choose on the calendar','เลือกจากปฏิทิน')}</button>`;
{const f=seRelCard;seRelCard=function(p){let h=f.apply(this,arguments);try{if(h)h=h.replace(/<input type="date"[^>]*onchange="seRelSet\(this\.value\)">/,gcalBtn('rel',seRel(p)))}catch(x){}return h}}
// ---- 4. the concert switch and its venue ---------------------------------------------------------------------------------------
const geCcWanted=e=>e&&e.ccOn!==false;
{const f=geMakeCc;geMakeCc=function(e){if(e&&e.ccOn===false)return null;return f.apply(this,arguments)}}
function geCcTog(on){const e=geCur();if(!e||e.st!='setup')return toast(g2T('The concert is fixed once the election single is released.','คอนเสิร์ตล็อกแล้วหลังปล่อยซิงเกิลเลือกตั้ง'),'err');
 const C=e.cc?ccGet(e.cc):null;if(!on&&C&&C.status!='plan')return toast(g2T('The concert is already confirmed. Cancel it in Concert if you really want to.','คอนเสิร์ตยืนยันแล้ว ถ้าต้องการยกเลิกให้ไปที่หน้าคอนเสิร์ต'),'err');
 e.ccOn=!!on;if(on){const d=e.cerPlan&&e.cerPlan.day;if(d){const K=geMakeCc(e,d);if(K&&K.status=='plan')K.start=d}}else geCcDrop(e);render()}
function geCcVenueSet(v){const e=geCur(),C=geCcOf(e);if(!C)return;if(C.status!='plan')return toast(g2T('The venue is fixed once the concert is confirmed.','สถานที่ล็อกแล้วหลังยืนยันคอนเสิร์ต'),'err');const V=ccV(v);C.vid=V?V.id:null;if(V&&!V.cap[C.vcfg])C.vcfg=V.cap.seat?'seat':'stand';geCcSync(e);render()}
function geCcCardHtml(e){const fix=e.st!='setup',C=geCcOf(e),V=geCcVen(C),on=geCcWanted(e),dis=fix?'disabled':'';
 const L=(typeof CC_V!='undefined'?CC_V:[]).slice().sort((a,b)=>(b.cap.seat||b.cap.stand||0)-(a.cap.seat||a.cap.stand||0));let rent='';try{if(C&&V)rent=yen(ccCost(C).rent.total)}catch(x){}
 return`<div class="c geccc"><div class="row"><span class="geprb">CONCERT</span><b>${g2T('Pre-ceremony Concert','คอนเสิร์ตก่อนประกาศผล')}</b></div>
 <div class="row"><label class="plnm"><input type="radio" name="gecc${e.id}" ${on?'checked':''} ${dis} onchange="geCcTog(1)"> ${g2T('Hold a concert','จัดคอนเสิร์ต')}</label><label class="plnm"><input type="radio" name="gecc${e.id}" ${on?'':'checked'} ${dis} onchange="geCcTog(0)"> ${g2T('No concert','ไม่จัด')}</label></div>
 ${on?(C?`<label class="st">${g2T('Venue (the ceremony is held here too)','สถานที่ (ใช้จัดงานประกาศผลด้วย)')} <select ${C.status!='plan'?'disabled':''} onchange="geCcVenueSet(this.value)"><option value="">${g2T('Choose…','เลือก…')}</option>${L.map(v=>`<option value="${v.id}" ${v.id==C.vid?'selected':''}>${esc(v.n)} · ${(v.cap.seat||v.cap.stand||0).toLocaleString()} · ${esc(CC_CAT[v.cat]||'')}</option>`).join('')}</select></label>
  <p class="st">${jd(C.start)} · ${g2T('one Afternoon Performance, then the ceremony','รอบบ่ายรอบเดียว แล้วต่อด้วยงานประกาศผล')}${V?` · ${(ccCap(C)||0).toLocaleString()} ${g2T('seats','ที่นั่ง')}${rent?` · ${g2T('venue rental','ค่าเช่าสถานที่')} ${rent}`:''}`:''}</p>
  ${!V?`<p class="st thwarn">${g2T('Choose the venue before production starts.','เลือกสถานที่ก่อนเริ่มผลิต')}</p>`:''}
  <p class="st">${C.status=='plan'?g2T('Confirmed automatically when the election single goes into production (the venue rental is paid then). Members, setlist and tickets can be planned in Concert — the setlist can wait until the show.','ยืนยันอัตโนมัติเมื่อเริ่มผลิตซิงเกิลเลือกตั้ง (จ่ายค่าเช่าตอนนั้น) วางเมมเบอร์ เซ็ตลิสต์ และบัตรได้ที่หน้าคอนเสิร์ต เซ็ตลิสต์ทำทีหลังได้'):g2T('Confirmed with the election single. The setlist can still be edited until the show.','ยืนยันพร้อมซิงเกิลเลือกตั้งแล้ว แก้เซ็ตลิสต์ได้จนถึงวันแสดง')} ${typeof ccBadge=='function'?ccBadge(C):''}</p>
  <button class="b s p" onclick="ccOpen('${C.id}')">🎤 ${g2T('Open concert planning','เปิดหน้าวางแผนคอนเสิร์ต')}</button>`
  :`<p class="st">${g2T('Choose the ceremony date — the concert is created on that day.','เลือกวันประกาศผลก่อน แล้วคอนเสิร์ตจะถูกสร้างในวันนั้น')}</p>`)
 :`<p class="st">${g2T(`No concert: the ceremony is held at ${GE_CC_FALLBACK.n} (${GE_CC_FALLBACK.cap.toLocaleString()} seats, ${yen(GE_CC_FALLBACK.cost)} paid when it is booked).`,`ไม่จัดคอนเสิร์ต: งานประกาศผลจัดที่ ${GE_CC_FALLBACK.n} (${GE_CC_FALLBACK.cap.toLocaleString()} ที่นั่ง จ่าย ${yen(GE_CC_FALLBACK.cost)} ตอนจอง)`)}</p>`}</div>`}
// the schedule card: calendar for the ceremony, the concert switch
{const f=geSchedCardHtml;geSchedCardHtml=function(e,p){let h=f.apply(this,arguments);try{const P=e.cerPlan||{},fix=e.st!='setup';
 h=h.replace(/<select [^>]*onchange="geCerPick\(this\.value\)">[\s\S]*?<\/select>/,fix?`<b>${P.day?jd(P.day):'—'}</b>`:gcalBtn('cer',P.day));
 const i=h.indexOf('<div class="c geccc">');if(i>=0){h=h.slice(0,i)+geCcCardHtml(e)+'</div>'}else h=h.replace(/<\/div>$/,geCcCardHtml(e)+'</div>')}catch(x){console.error(x)}return h}}
// election page (setup with a linked single): the schedule card is shown there too
{const f=V.ge;V.ge=function(){let h=f.apply(this,arguments);try{const e=geCur(),p=gePj(e);if(e&&e.st=='setup'&&p&&p.status=='draft'&&!h.includes('class="c gesched geplan"'))h+=geSchedCardHtml(e,p)}catch(x){console.error(x)}return h}}
// locks: one afternoon performance on the ceremony day; no own confirmation
{const f=ccPfSet;ccPfSet=function(pid,k){const C=ccCur();if(C&&C.type=='ge'&&(k=='d'||k=='sl'))return geCcLock();return f.apply(this,arguments)}}
{const f=ccPfDel;ccPfDel=function(){const C=ccCur();if(C&&C.type=='ge')return geCcLock();return f.apply(this,arguments)}}
{const f=ccConfirm;ccConfirm=function(){const C=ccCur();if(C&&C.type=='ge')return toast(g2T('The election concert is confirmed together with the election single (when its production starts).','คอนเสิร์ตเลือกตั้งจะยืนยันพร้อมซิงเกิลเลือกตั้ง (ตอนเริ่มผลิต)'),'err');return f.apply(this,arguments)}}
{const f=ccEditor;ccEditor=function(C){let h=f.apply(this,arguments);try{if(C&&C.type=='ge')h=h.replace(/<button[^>]*onclick="ccConfirm\(\)"[^>]*>[\s\S]*?<\/button>/g,`<p class="st"><b>${g2T('Confirmed automatically with the election single.','ยืนยันอัตโนมัติพร้อมซิงเกิลเลือกตั้ง')}</b></p>`)}catch(x){}return h}}
// ---- 5. starting the election single confirms the concert -----------------------------------------------------------------------
function geCcAutoConfirm(e){const C=geCcOf(e);if(!C||C.status!='plan')return;const V=ccV(C.vid);if(!V)return;
 if(!C.parts.length)C.parts=S.members.filter(m=>m.status!='graduated'&&(isAct(m)||m.status=='trainee')&&gsGid(m)==C.host).map(m=>m.id);
 let set=C.sets[(C.pf[0]||{}).set];if(!set){const sid=Object.keys(C.sets)[0];if(sid){C.pf[0].set=sid;set=C.sets[sid]}}
 if(!set){const sid='s1_'+Date.now().toString(36).slice(-4);C.sets[sid]=set={id:sid,name:g2T('Election Concert setlist','เซ็ตลิสต์คอนเสิร์ตเลือกตั้ง'),items:[]};C.pf[0].set=sid}
 if(!set.items.some(i=>i.k=='song'))geCcSongs(C.host).forEach(sg=>{const o=ccSong(C.host,sg);if(o)set.items.push({id:ccIid(),k:'song',gid:C.host,song:sg,title:o.title,pos:ccCopyPos(C,o),orig:ccOrigPos(o).map(z=>({m:z.m,r:z.r,c:z.c})),cz:{mode:'orig'}})});
 C.pf.forEach(p=>ccTixDef(C,p));const K=ccCost(C),open=S.day+1,first=C.start;if(open>=first)return;
 if(!spend(K.rent.total,`Concert venue rental: ${C.name} (${V.n})`))return toast(g2T('Not enough money for the concert venue — confirm it later in Concert.','เงินไม่พอจ่ายค่าเช่าสถานที่ ไปยืนยันภายหลังที่หน้าคอนเสิร์ต'),'err');
 ccSnap(C);C.status='conf';C.conf=S.day;C.sale={open,close:first-1};C.est={G:JSON.parse(JSON.stringify(K.G)),total:K.total,rent:K.rent.total,sched:K.sched,stream:ccStreamCost(C)};C.paid={venue:K.rent.total};
 C.pf.forEach(p=>{p.sold={};p.fc=ccForecast(C,p)});ccLog(C,`Confirmed with the election single. Venue rental ${yen(K.rent.total)} paid.`);toast(`${C.name}: ${g2T('confirmed','ยืนยันแล้ว')} · ${V.n}`)}
{const f=startSingle;startSingle=function(){const p=S.pj,was=p&&p.status;const r=f.apply(this,arguments);try{if(p&&p.ge&&was=='draft'&&p.status=='producing'){const e=geGet(p.ge);if(e)geCcAutoConfirm(e)}}catch(x){console.error(x)}return r}}
{const f=ccConfirm;void f}
// requirements before production: a venue when the concert is held
{const f=reqs;reqs=function(p){const r=f.apply(this,arguments);try{if(p&&p.ge&&p.status=='draft'){const e=geGet(p.ge);if(e&&geCcWanted(e)&&e.cerPlan&&e.cerPlan.day){const C=geCcOf(e);if(C&&!ccV(C.vid))r.push(g2T('General Election: choose the Pre-ceremony Concert venue (or choose “No concert”).','เลือกตั้ง: เลือกสถานที่คอนเสิร์ตก่อนประกาศผล (หรือเลือก “ไม่จัด”)'))}}}catch(x){console.error(x)}return r}}
// booking without a concert: the standard hall
{const f=geBook;geBook=function(){const e=geActive();if(e&&e.st=='closed'&&e.ccOn===false){const d=+ui.gecd||(e.cerPlan&&e.cerPlan.day);if(!(d>e.vEnd)||!geIsWE(d)||d<=S.day)return toast('Choose a Saturday or Sunday after the voting close.','err');const v=GE_CC_FALLBACK;if(!spend(v.cost,`${e.name}: ceremony venue (${v.n})`))return;
 e.cer={day:d,ven:v.id,vn:v.n,cap:v.cap,cost:v.cost,booked:S.day};e.st='scheduled';S.cal.push({id:'e'+(++S.sid),type:'ge',ge:e.id,title:`${e.name} — Ranking Announcement Ceremony (${v.n})`,day:d,members:[],done:false});render();return}return f.apply(this,arguments)}}
// ---- 2. Limited Edition only ---------------------------------------------------------------------------------------------------
function geRegTog(ti){const p=S.pj,SL=seSale(p);if(!SL||p.status=='released')return;const r=SL.eds.find(e=>e.ti==ti&&e.kind=='reg'),l=SL.eds.find(e=>e.ti==ti&&e.kind=='lim');if(!r)return;
 if(!r.off&&!l)return toast(g2T('Add a Limited Edition first — every Type needs at least one edition.','เพิ่ม Limited Edition ก่อน — ทุก Type ต้องมีอย่างน้อย 1 เอดิชัน'),'err');r.off=!r.off;render()}
{const f=seLimTog;seLimTog=function(ti){const p=S.pj,SL=p&&seSale(p);const r=f.apply(this,arguments);try{if(SL&&!SL.eds.some(e=>e.ti==ti&&e.kind=='lim')){const g=SL.eds.find(e=>e.ti==ti&&e.kind=='reg');if(g)delete g.off}}catch(x){}return r}}
{const f=geEdCardHtml;geEdCardHtml=function(p){let h=f.apply(this,arguments);try{const SL=seSale(p),dis=p.status=='released'?'disabled':'';SL.eds.filter(e=>e.kind=='reg').forEach(e=>{const nm=esc(seEdName(p,e)),hasL=SL.eds.some(z=>z.ti==e.ti&&z.kind=='lim');
  const re=new RegExp(`(<div class="c seed reg"><div class="row"><b>${nm.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}</b>)`);
  if(e.off)h=h.replace(new RegExp(`<div class="c seed reg"><div class="row"><b>${nm.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}</b>[\\s\\S]*?</span></div></div>`),`<div class="c seed reg off"><div class="row"><b>${nm}</b><span class="tag">${g2T('Not sold','ไม่วางขาย')}</span><button class="b s" ${dis} onclick="geRegTog(${e.ti})">+ ${g2T('Sell the Regular Edition','วางขาย Regular Edition')}</button></div><p class="st">${g2T('This Type is sold only as its Limited Edition. When its stock is gone, its fans buy another Type\'s Regular Edition.','Type นี้ขายแค่ Limited Edition เมื่อสต็อกหมด แฟนจะไปซื้อ Regular Edition ของ Type อื่น')}</p></div>`);
  else if(hasL)h=h.replace(re,`$1<button class="b s" ${dis} onclick="geRegTog(${e.ti})">${g2T('Remove','ลบ')}</button>`)});
  if(SL.eds.every(e=>e.kind!='reg'||e.off)){const cap=SL.eds.filter(e=>e.kind=='lim').reduce((a,e)=>a+(+e.cap||0),0);h=h.replace('</h3>',`</h3><div class="c geerr">${g2T(`No Regular Edition is sold: election CDs (= votes) stop when the Limited stock (${cap.toLocaleString()} CDs in total) is sold out.`,`ไม่มี Regular Edition: ซีดีเลือกตั้ง (= คะแนนโหวต) จะหยุดขายเมื่อสต็อก Limited (${cap.toLocaleString()} แผ่นรวม) หมด`)}</div>`)}}catch(x){console.error(x)}return h}}
// release: editions that are not sold are left out; with no Regular Edition the election CDs stop at the stock
let GE_LIM=null;
{const f=doRelease;doRelease=function(){const p=S.pj;let P=null;try{if(p&&p.ge&&p.status=='producing'&&p.sale){P=p;const act=p.sale.eds.filter(e=>!e.off);GE_LIM=act.some(e=>e.kind=='reg')?null:{cap:act.reduce((a,e)=>a+(+e.cap||0),0)};p.sale.eds=act;p.sale._off=p.sale.eds.length}}catch(x){}
 try{return f.apply(this,arguments)}finally{GE_LIM=null;void P}}}
{const f=geStartVoting;geStartVoting=function(e,x){try{if(GE_LIM&&x&&x.cd&&x.cd.units>GE_LIM.cap){x.cd.units=GE_LIM.cap;x.sales=Math.min(x.sales||0,GE_LIM.cap)}}catch(z){}return f.apply(this,arguments)}}
const geStockLeft=x=>{if(!x||!x.geEds||x.geEds.some(e=>e.kind=='reg'))return Infinity;return Math.max(0,x.geEds.reduce((a,e)=>a+(+e.cap||0),0)-((x.cd&&x.cd.units)||0))};
{const f=geBuyDay;geBuyDay=function(e,x,d){const R=geStockLeft(x);if(R<=0)return 0;if(R==Infinity)return f.apply(this,arguments);const B0={...(e.buy||{})},K0={...(e.kb||{})};let u=f.apply(this,arguments);
 if(u>R){const s=R/u;let kept=0;const ids=Object.keys(e.buy||{});ids.forEach(k=>{const add=(e.buy[k]||0)-(B0[k]||0);if(add<=0)return;const keep=Math.floor(add*s),cut=add-keep;e.buy[k]-=cut;e.pend[k]=Math.max(0,(e.pend[k]||0)-cut);kept+=keep;
  if(e.kb&&e.kb[k]!=null){const ka=(e.kb[k]||0)-(K0[k]||0);if(ka>0)e.kb[k]-=Math.min(ka,cut)}});u=kept}return u}}
// overflow of a sold-out Limited Edition goes to its Type's Regular Edition, else to any Regular Edition
geEdAdd=function(x,u){const L=x&&x.geEds;if(!L||!L.length||!(u>0))return;const T=[...new Set(L.map(e=>e.type))],W={};
 L.forEach(e=>{const both=L.some(z=>z.type==e.type&&z.kind!=e.kind);W[e.id]=(1/T.length)*(both?(e.kind=='lim'?.42:.58):1)});const sp=geSplit(u,W),regs=L.filter(e=>e.kind=='reg');
 L.filter(e=>e.kind=='lim').forEach(e=>{const n=sp[e.id]||0,room=Math.max(0,e.cap-e.sold),k=Math.min(n,room);let over=n-k;e.sold+=k;sp[e.id]=0;if(e.sold>=e.cap&&e.out==null)e.out=S.day;
  if(over>0){const reg=L.find(z=>z.type==e.type&&z.kind=='reg')||regs[0];if(reg)sp[reg.id]=(sp[reg.id]||0)+over;else{const other=L.find(z=>z.kind=='lim'&&z.sold<z.cap);if(other){const m=Math.min(over,other.cap-other.sold);other.sold+=m}}}});
 regs.forEach(e=>{e.sold+=sp[e.id]||0})};
// ---- 3. Media Senbatsu: position order, fast taps -----------------------------------------------------------------------------
xmHtml=function(){const p=S.pj,P=ui.xmP;if(!p||!P)return'';const mn=S.songs[p.mainId],TT=(mn&&mn.slots||[]).filter(Boolean),pos=id=>TT.indexOf(id),M=xmMembersFor(p).sort((a,b)=>{const x=pos(a.id),y=pos(b.id);if(x>=0||y>=0)return(x<0?999:x)-(y<0?999:y);return sv(b,'fans')-sv(a,'fans')||a.id-b.id});
 return`<h2 class="ht">📣 Media Senbatsu</h2><p class="st">The members who perform at festivals and live events while this single is the latest one (other events draw members by skill). Optional — without a Media Senbatsu, every member of the group can be sent. Events take members in this order; busy members are replaced by General Election rank (or fanbase).</p>
 <div class="row"><button class="b s" onclick="ui.xmP.sel=${JSON.stringify(TT)};ui.mod.h=xmHtml();render()">Same as Title Track Senbatsu</button><button class="b s" onclick="ui.xmP.sel=[];ui.mod.h=xmHtml();render()">Clear</button></div><p class="st"><b id="xmcnt">${P.sel.length}</b> selected</p>
 <div class="ccmg3" id="xmgrid">${M.map(m=>{const k=P.sel.indexOf(m.id),ps=pos(m.id);return ccMCard(m,k>=0,`xmTog(${m.id})`,`<small class="ccm3s xmk">${k>=0?'#'+(k+1):''}</small>${ps>=0?`<small class="ccm3u">${g2T('Title Track','เพลงหลัก')} · ${g2T('Pos','ตำแหน่ง')} ${ps+1}</small>`:''}`)}).join('')}</div>
 <div class="row"><button class="b p" onclick="xmSave()">Save Media Senbatsu</button><button class="b s" onclick="ui.mod=null;ui.xmP=null;render()">Cancel</button></div>`};
xmTog=function(id){const P=ui.xmP;if(!P)return;const i=P.sel.indexOf(id);if(i>=0)P.sel.splice(i,1);else P.sel.push(id);
 const G=document.getElementById('xmgrid');if(!G){ui.mod.h=xmHtml();return render()}
 G.querySelectorAll('.ccm3[data-mid]').forEach(b=>{const k=P.sel.indexOf(+b.dataset.mid),on=k>=0;b.classList.toggle('on',on);let ck=b.querySelector('.ccm3k');if(on&&!ck){ck=document.createElement('i');ck.className='ccm3k';ck.textContent='✓';b.querySelector('.ccm3a').after(ck)}else if(!on&&ck)ck.remove();const s=b.querySelector('.xmk');if(s)s.textContent=on?'#'+(k+1):''});
 const c=document.getElementById('xmcnt');if(c)c.textContent=P.sel.length;
 // keep the modal's stored HTML in step without re-rendering the page
 clearTimeout(xmTog.t);xmTog.t=setTimeout(()=>{try{if(ui.xmP&&ui.mod&&ui.mod.xm)ui.mod.h=xmHtml()}catch(x){}},400)};
// ---- ranking groups and participants: shown as locked once the election single is in production ----------------------------
{const f=geSetupHtml;geSetupHtml=function(e){let h=f.apply(this,arguments);try{if(e&&e.st=='producing'){const L=` <span class="tag">🔒 ${g2T('Locked','ล็อกแล้ว')}</span>`;h=h.replace('<h3>1 · Election</h3>',`<h3>1 · Election${L}</h3>`).replace('<h3>2 · Ranking groups</h3>',`<h3>2 · Ranking groups${L}</h3>`).replace('<h3>3 · Participants ',`<h3>3 · Participants${L} `);
 h=h.replace('<h3>2 · Ranking groups',`<p class="c geerr" style="margin-bottom:8px">${g2T('The election single is in production: the ranking groups and the participants can no longer change.','ซิงเกิลเลือกตั้งเริ่มผลิตแล้ว: แก้ไขกลุ่มอันดับและผู้เข้าร่วมไม่ได้แล้ว')}</p><h3>2 · Ranking groups`)}}catch(x){console.error(x)}return h}}
// ---- the Pre-ceremony Concert: every election participant takes part (sister groups included) ------------------------------
function geCcWant(e){return[...new Set(e&&e.parts||[])].filter(id=>{const m=get(id);return m&&m.status!='graduated'})}
function geCcParts(e){const C=geCcOf(e);if(!C||['done','cancel','live'].includes(C.status))return;const add=geCcWant(e).filter(id=>!C.parts.includes(id));if(!add.length)return;
 C.parts.push(...add);const A=new Set(add);
 Object.values(C.sets||{}).forEach(s=>(s.items||[]).forEach(it=>{if(it.k=='song')(it.pos||[]).forEach(z=>{if(z.m==null&&z.o!=null&&A.has(z.o)){z.m=z.o;z.why=''}})}));
 // still planning: the latest main songs of each sister group that takes part join the setlist
 if(C.status=='plan'){const set=C.sets[(C.pf[0]||{}).set]||Object.values(C.sets)[0];if(set){const gids=[...new Set(add.map(id=>gsGid(get(id))).filter(g=>g!=null&&g!=C.host))];
  gids.forEach(gid=>{if(set.items.some(it=>it.gid==gid))return;geCcSongs(gid).slice(-3).forEach(sg=>{const o=ccSong(gid,sg);if(!o)return;set.items.push({id:ccIid(),k:'song',gid,song:sg,title:o.title,pos:ccCopyPos(C,o),orig:ccOrigPos(o).map(z=>({m:z.m,r:z.r,c:z.c})),cz:{mode:'orig'}})})});try{ccRenum(C)}catch(x){}}}
 try{ccSnap(C)}catch(x){}}
function geCcPartsAll(){try{gsAllGE().forEach(({g,G})=>(G.list||[]).forEach(e=>{if(e&&e.cc&&e.st!='done')try{gsWith(g.id,()=>geCcParts(e))}catch(x){console.error(x)}}))}catch(x){}}
{const f=geCcSync;geCcSync=function(e){try{geCcParts(e)}catch(x){console.error(x)}return f.apply(this,arguments)}}
{const f=geCcAutoConfirm;geCcAutoConfirm=function(e){try{geCcParts(e)}catch(x){console.error(x)}return f.apply(this,arguments)}}
{const f=geMakeCc;geMakeCc=function(e){const had=geCcOf(e),C=f.apply(this,arguments);try{if(C&&!had)geCcParts(e)}catch(x){console.error(x)}return C}}
{const f=tick;tick=function(){const r=f.apply(this,arguments);geCcPartsAll();return r}}
{const f=V.concert;if(f)V.concert=function(){geCcPartsAll();return f.apply(this,arguments)}}
