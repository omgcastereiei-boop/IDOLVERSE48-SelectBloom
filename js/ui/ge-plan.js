// =====================================================================================
//  IDOLVERSE48: Select Bloom! — General Election single: Sales & Editions, schedule, pre-ceremony concert
// -------------------------------------------------------------------------------------
//  · The election single is planned like any single in step 5 · Sales & Editions: Release Day, editions
//    (every Type has a Regular Edition and, optionally, a Limited Edition in a limited quantity with its own
//    CD cover designed in step 6).
//  · Release Day = voting day 1. Voting lasts two months (the existing rule, geEnd); the ceremony date is a
//    Saturday or Sunday after voting closes and is chosen here, before production starts.
//  · No separate ceremony hall: a "Pre-ceremony Concert" is created in the Concert system on the ceremony date
//    (one afternoon performance). The player plans it there (venue, setlist, tickets…). The ceremony takes place
//    in that concert's venue right after the concert. If the concert is not held, the ceremony falls back to a
//    standard hall.
//  · Election mechanics are unchanged: the election CDs still come from the voting simulation (one CD = one
//    vote token). The editions only show how those CDs were sold (a Limited Edition stops at its stock; extra
//    demand buys the Regular Edition of the same Type), so the number of votes never changes.
// =====================================================================================
const gpT=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
const GE_CC_FALLBACK=GE_VEN[1];
CC_TYPE.ge='Election Concert';
{const f=ccTypeF;ccTypeF=function(C){return C&&C.type=='ge'?1.2:f.apply(this,arguments)}}
const gePj=e=>{const p=S.pj;return p&&e&&p.ge==e.id?p:null};
// ceremony dates for a release day: weekends within 70 days after voting closes
function geCerDaysFor(rel){const vE=geEnd(rel),D=[];for(let d=vE+1;d<=vE+70;d++)if(geIsWE(d)&&d>S.day)D.push(d);return D}
const geRelOf=(e,p)=>e&&e.vStart!=null?e.vStart:p?seRel(p):S.day;
// ---- the pre-ceremony concert ---------------------------------------------------------------------------------------------
const geCcOf=e=>{if(!e||!e.cc)return null;const C=ccGet(e.cc);return C&&C.status!='cancel'?C:null};
function geCcSongs(gid){const out=[];try{gsWith(gid,()=>{(S.singles||[]).slice().reverse().forEach(x=>{if(out.length<8&&x.mainId&&S.songs[x.mainId])out.push(x.mainId)})})}catch(e){}return out.reverse()}
function geMakeCc(e,day){if(!e||geCcOf(e))return geCcOf(e);const X=ccS(),id='cc'+(++X.seq),gid=e.gid!=null?e.gid:gsAg();
 const act=S.members.filter(m=>m.status!='graduated'&&(isAct(m)||m.status=='trainee')&&(typeof gsGid=='function'?gsGid(m):m.group)==gid).map(m=>m.id);
 const C={id,name:`${e.name} — ${gpT('Pre-ceremony Concert','คอนเสิร์ตก่อนประกาศผล')}`.slice(0,100),type:'ge',host:gid,anni:null,grad:[],vid:null,vcfg:'seat',start:day,pf:[],parts:act,sets:{},snap:{},status:'plan',created:S.day,log:[],ge:{gid,eid:e.id}};
 const sid='s1_'+Date.now().toString(36).slice(-4),items=[];
 geCcSongs(gid).forEach(sg=>{const o=ccSong(gid,sg);if(!o)return;items.push({id:ccIid(),k:'song',gid,song:sg,title:o.title,pos:ccCopyPos(C,o),orig:ccOrigPos(o).map(z=>({m:z.m,r:z.r,c:z.c})),cz:{mode:'orig'}})});
 C.sets[sid]={id:sid,name:gpT('Election Concert setlist','เซ็ตลิสต์คอนเสิร์ตเลือกตั้ง'),items};C.pf.push(ccPfNew(C,0,'a'));C.pf[0].set=sid;try{ccRenum(C)}catch(x){}
 X.list.push(C);e.cc=id;try{ccLog(C,'Created for the General Election ceremony.')}catch(x){}return C}
function geCcDrop(e){const C=e&&e.cc?ccGet(e.cc):null;if(C&&C.status=='plan')ccS().list=ccS().list.filter(c=>c!==C);if(e)delete e.cc}
const geCcVen=C=>C&&ccV(C.vid)?ccV(C.vid):null;
// the ceremony venue follows the concert venue
function geCcSync(e){try{if(!e||!e.cer||!e.cer.cc||e.st=='ceremony'||e.st=='done')return;const C=geCcOf(e),V=geCcVen(C);if(V){e.cer.vn=V.n;e.cer.cap=ccCap(C)||e.cer.cap}else e.cer.vn=gpT('Pre-ceremony Concert venue (choose it in Concert)','สถานที่คอนเสิร์ตก่อนประกาศผล (เลือกในหน้าคอนเสิร์ต)')}catch(x){}}
const geCcBusy=C=>C&&C.status!='plan';
// date picked for the ceremony (stored in the election's plan; the concert follows it)
function geCerPick(v){const e=geCur(),p=gePj(e);if(!e||!(e.st=='setup'||e.st=='producing'))return toast(gpT('The ceremony date is fixed once the election single is released.','วันประกาศผลล็อกแล้วหลังปล่อยซิงเกิลเลือกตั้ง'),'err');
 const d=+v||null,C=geCcOf(e);if(C&&geCcBusy(C)&&d!=C.start)return toast(gpT('The Pre-ceremony Concert is already confirmed — its date can no longer change.','คอนเสิร์ตก่อนประกาศผลยืนยันแล้ว เปลี่ยนวันไม่ได้'),'err');
 e.cerPlan=e.cerPlan||{};e.cerPlan.day=d;e.cerPlan.ven='cc';if(d){const K=C||geMakeCc(e,d);if(K&&K.status=='plan')K.start=d}else if(C&&C.status=='plan')geCcDrop(e);render()}
// ---- step 5 for the election single ----------------------------------------------------------------------------------------
function geEdCardHtml(p){const SL=seSale(p);if(!SL)return'';const dis=p.status=='released'?'disabled':'';
 const ed=e=>`<div class="c seed ${e.kind}"><div class="row"><b>${esc(seEdName(p,e))}</b>${e.kind=='lim'?`<button class="b s" ${dis} onclick="seLimTog(${e.ti})">${gpT('Remove','ลบ')}</button>`:''}</div>
  ${e.kind=='lim'?`<div class="row"><span class="tag tcoup">${gpT('Limited Quantity','จำนวนจำกัด')}</span></div><label class="st">${gpT('Stock (maximum CDs for sale)','สต็อก (จำนวนซีดีสูงสุด)')} <input type="number" min="1" step="100" value="${e.cap}" ${dis} style="width:120px" onchange="seEdSet('${e.id}','cap',this.value)"></label><p class="st">${gpT('Sold during the voting period until the stock runs out; after that fans buy the Regular Edition. 🎨 Its own CD cover is designed in step 6.','ขายในช่วงโหวตจนกว่าสต็อกหมด หลังจากนั้นแฟนจะซื้อ Regular Edition แทน 🎨 ออกแบบปกของตัวเองในขั้นที่ 6')}</p>`
   :`<div class="row"><span class="tag tmain">${gpT('Election sale','ขายช่วงเลือกตั้ง')}</span><span class="st">${gpT('Sold every day of the voting period. Every CD is one voting token.','ขายทุกวันตลอดช่วงโหวต ซีดี 1 แผ่น = สิทธิ์โหวต 1 สิทธิ์')}</span></div>`}</div>`;
 return`<div class="c sesale"><h3>${gpT('Editions','เอดิชัน')}</h3><p class="st">${gpT('Every Type is sold as a Regular Edition and, if you like, a Limited Edition with its own CD cover. All editions are one single and every copy is a vote.','ทุก Type ขายเป็น Regular Edition และเพิ่ม Limited Edition ที่มีปกของตัวเองได้ ทุกเอดิชันคือซิงเกิลเดียวกัน และทุกแผ่นคือคะแนนโหวต')}</p>
 ${p.types.map((t,i)=>`<div class="setype"><h4>${esc(t.name)}</h4>${SL.eds.filter(e=>e.ti==i).map(ed).join('')}${SL.eds.some(e=>e.ti==i&&e.kind=='lim')?'':`<button class="b s" ${dis} onclick="seLimTog(${i})">+ ${gpT('Add a Limited Edition','เพิ่ม Limited Edition')}</button>`}</div>`).join('')}
 ${seErrs(p).filter(x=>!/pre-order/i.test(x)).map(x=>`<div class="st thwarn">✗ ${esc(x)}</div>`).join('')}</div>`}
function geSchedCardHtml(e,p){const rel=geRelOf(e,p),vE=geEnd(rel),D=geCerDaysFor(rel),P=e.cerPlan||{},fix=!(e.st=='setup'||e.st=='producing'),C=geCcOf(e),V=geCcVen(C);
 return`<div class="c gesched geplan"><h3>🗳 ${gpT('Election schedule','กำหนดการเลือกตั้ง')}</h3>
 <div class="geplt"><div><small>${gpT('Release Day · voting opens','วันวางขาย · เปิดโหวตวันแรก')}</small><b>${jd(rel)}</b></div><div><small>${gpT('Voting closes','ปิดโหวต')}</small><b>${jd(vE)}</b><span class="st">${gpT('2 months','2 เดือน')}</span></div><div><small>${gpT('Concert + ceremony','คอนเสิร์ต + ประกาศผล')}</small><b>${P.day?jd(P.day):'—'}</b></div></div>
 <label class="st">${gpT('Ranking Announcement Ceremony','วันจัดงานประกาศผล')} <select ${fix?'disabled':''} onchange="geCerPick(this.value)"><option value="">${gpT('Choose…','เลือก…')}</option>${(P.day&&!D.includes(P.day)?[P.day,...D]:D).map(d=>`<option value="${d}" ${d==P.day?'selected':''}>${dayDate(d).toLocaleDateString('en-US',{weekday:'short'})}, ${longDate(d)}</option>`).join('')}</select></label>
 <p class="st">${gpT('Saturdays and Sundays after voting closes. A Pre-ceremony Concert is held that afternoon and the results are announced on the same stage afterwards — the ceremony uses the concert venue, so there is no separate hall to book. Changing the Release Day moves the voting period.','เลือกได้เฉพาะเสาร์–อาทิตย์หลังปิดโหวต ช่วงบ่ายจัดคอนเสิร์ตก่อนประกาศผล แล้วประกาศผลบนเวทีเดียวกันต่อทันที งานประกาศผลใช้ฮอลล์ของคอนเสิร์ต จึงไม่ต้องจองฮอลล์แยก การเปลี่ยนวันวางขายจะเลื่อนช่วงโหวตตาม')}</p>
 ${P.day&&D.length&&!D.includes(P.day)&&!fix?`<p class="st thwarn">✗ ${gpT('This date is no longer after the voting close — choose it again.','วันนี้ไม่อยู่หลังวันปิดโหวตแล้ว เลือกใหม่')}</p>`:''}${!P.day?`<p class="st thwarn">${gpT('Required before production starts.','ต้องเลือกก่อนเริ่มผลิต')}</p>`:''}
 ${C?`<div class="c geccc"><div class="row"><span class="geprb">CONCERT</span><b>${esc(C.name)}</b>${typeof ccBadge=='function'?ccBadge(C):''}</div><p class="st">${jd(C.start)} · ${V?esc(V.n)+' · '+(ccCap(C)||0).toLocaleString()+' '+gpT('seats','ที่นั่ง'):gpT('venue not chosen yet','ยังไม่ได้เลือกสถานที่')}</p><p class="st">${gpT('Plan the venue, members, setlist and tickets in Concert, then confirm it. The ceremony follows the concert in the same venue.','วางแผนสถานที่ เมมเบอร์ เซ็ตลิสต์ และบัตรในหน้าคอนเสิร์ต แล้วกดยืนยัน งานประกาศผลจัดต่อจากคอนเสิร์ตในสถานที่เดียวกัน')}</p><button class="b s p" onclick="ccOpen('${C.id}')">🎤 ${gpT('Open concert planning','เปิดหน้าวางแผนคอนเสิร์ต')}</button></div>`:''}</div>`}
{const f=plSaleStepHtml;plSaleStepHtml=function(p){if(!p||!p.ge||(typeof plAlb=='function'&&plAlb(p)))return f.apply(this,arguments);const e=geGet(p.ge);let h='';
 try{h=(p.status=='draft'?seRelCard(p):'')+(e?geSchedCardHtml(e,p):'')+geEdCardHtml(p)}catch(x){console.error(x)}return`<div data-step="5"><h3 class="sth">5 · Sales &amp; Editions</h3>${h}</div>`}}
{const f=plSaleDone;plSaleDone=function(p){if(!p||!p.ge)return f.apply(this,arguments);const e=geGet(p.ge);try{return!!(e&&e.cerPlan&&e.cerPlan.day)&&!seErrs(p).filter(x=>!/pre-order/i.test(x)).length}catch(x){return true}}}
// requirements: ceremony date (valid for the Release Day), edition stock, Limited Edition covers
{const f=reqs;reqs=function(p){const r=f.apply(this,arguments);try{if(p&&p.ge&&p.status=='draft'){const e=geGet(p.ge),d=e&&e.cerPlan&&e.cerPlan.day;if(!d)r.push('General Election: choose the Ranking Announcement Ceremony date in step 5 · Sales & Editions.');else if(!geCerDaysFor(seRel(p)).includes(d))r.push('General Election: the ceremony date must be a Saturday or Sunday after voting closes — choose it again in step 5.');
  seErrs(p).filter(x=>!/pre-order/i.test(x)).forEach(x=>r.push(x))}}catch(x){console.error(x)}return r}}
{const f=readiness;readiness=function(p){const r=f.apply(this,arguments);try{if(p&&p.ge&&p.sale)r.push(...seCoverErrs(p))}catch(x){console.error(x)}return r}}
// producing: the old date + venue card becomes the schedule card (no venue)
geCerPlanHtml=function(e){const p=S.pj;if(!e||!p||p.ge!=e.id||p.status!='producing')return'';return geSchedCardHtml(e,p)};
// ---- release: the editions of the election single -------------------------------------------------------------------------
function geEdAdd(x,u){const L=x&&x.geEds;if(!L||!L.length||!(u>0))return;const T=[...new Set(L.map(e=>e.type))],W={};
 L.forEach(e=>{const both=L.some(z=>z.type==e.type&&z.kind=='lim');W[e.id]=(1/T.length)*(both?(e.kind=='lim'?.42:.58):1)});const sp=geSplit(u,W);
 L.filter(e=>e.kind=='lim').forEach(e=>{const n=sp[e.id]||0,room=Math.max(0,e.cap-e.sold),k=Math.min(n,room),over=n-k;e.sold+=k;sp[e.id]=0;if(e.sold>=e.cap&&!e.out){e.out=S.day}const reg=L.find(z=>z.type==e.type&&z.kind=='reg');if(reg)sp[reg.id]=(sp[reg.id]||0)+over});
 L.filter(e=>e.kind=='reg').forEach(e=>{e.sold+=sp[e.id]||0})}
function geEdBox(x){if(!x||!x.geEds)return'';return`<div class="c sebox"><h3>${gpT('Editions & sales','เอดิชันและยอดขาย')}</h3>${x.geEds.map(e=>`<div class="seedr">${x.covers&&x.covers[e.cover]?coverSvg(x.covers[e.cover],{size:56}):''}<div><b>${esc(e.name)}</b><small>${e.kind=='lim'?`${gpT('Limited Quantity','จำนวนจำกัด')} · ${gpT('stock','สต็อก')} ${e.cap.toLocaleString()} · ${gpT('remaining','คงเหลือ')} ${Math.max(0,e.cap-e.sold).toLocaleString()}${e.out!=null?' · SOLD OUT':''}`:gpT('Election sale (voting period)','ขายช่วงเลือกตั้ง (ช่วงโหวต)')}</small></div><span class="sesold">${e.sold.toLocaleString()}</span></div>`).join('')}<div class="row"><b>${gpT('Total','รวม')}</b><span class="st">${(+x.sales||0).toLocaleString()} CDs</span></div></div>`}
{const f=doRelease;doRelease=function(){const p=S.pj;const ge=p&&p.ge&&p.status=='producing'&&p.sale?p:null;const r=f.apply(this,arguments);
 try{if(ge&&ge.status=='released'){const x=S.singles.find(s=>s.pid==ge.id);if(x&&!x.geEds){x.covers=x.covers||{};
  x.geEds=ge.sale.eds.map(e=>{const key=seEdKey(ge,e);if(e.kind=='lim'&&S.cov[key]){x.covers[key]=JSON.parse(JSON.stringify(S.cov[key]));delete S.cov[key]}return{id:e.id,type:ge.types[e.ti].name,kind:e.kind,name:seEdName(ge,e),cover:e.kind=='lim'?key:ge.types[e.ti].name,cap:e.kind=='lim'?e.cap:null,sold:0}});
  geEdAdd(x,(x.cd&&x.cd.units)||0);if(ui.mod&&ui.mod.t=='html')ui.mod.h+=geEdBox(x)}}}catch(x){console.error(x)}return r}}
{const f=geDay;geDay=function(e){const x=e&&geSingleOf(e),u0=x&&x.cd?x.cd.units:0;const r=f.apply(this,arguments);try{if(x&&x.geEds&&x.cd)geEdAdd(x,x.cd.units-u0)}catch(z){console.error(z)}return r}}
{const f=showEds;showEds=function(i){f.apply(this,arguments);try{const x=S.singles[i];if(x&&x.geEds&&ui.mod&&ui.mod.t=='html')ui.mod.h+=geEdBox(x)}catch(e){console.error(e)}}}
// ---- booking: the ceremony is held in the concert venue ---------------------------------------------------------------------
{const f=geBook;geBook=function(){const e=geActive();if(!e||e.st!='closed')return f.apply(this,arguments);const old=GE_VEN.some(z=>z.id==ui.gecv)&&!(e.cerPlan&&e.cerPlan.ven=='cc')&&!e.cc&&ui.gecv!='cc'&&!ui.gecCc;if(old)return f.apply(this,arguments);
 const d=+ui.gecd;if(!(d>e.vEnd))return toast('Choose a date after the voting close.','err');if(!geIsWE(d))return toast('The ceremony must be on a Saturday or Sunday.','err');if(d<=S.day)return toast('Choose a future date.','err');
 let C=geCcOf(e);if(C&&C.start!=d){if(C.status=='plan')C.start=d;else if(C.status!='done')return toast(gpT('The Pre-ceremony Concert is confirmed for '+jd(C.start)+' — the ceremony follows it that day.','คอนเสิร์ตยืนยันวันที่ '+jd(C.start)+' แล้ว งานประกาศผลต้องจัดวันเดียวกัน'),'err')}
 if(!C)C=geMakeCc(e,d);const V=geCcVen(C);e.cer={day:d,ven:'cc',cc:C?C.id:null,vn:V?V.n:'',cap:C&&V?ccCap(C):GE_CC_FALLBACK.cap,cost:0,booked:S.day};geCcSync(e);e.st='scheduled';
 S.cal.push({id:'e'+(++S.sid),type:'ge',ge:e.id,title:`${e.name} — Pre-ceremony Concert & Ranking Announcement Ceremony`,day:d,members:[],done:false});toast(`${gpT('Ceremony booked','จองงานประกาศผลแล้ว')}: ${longDate(d)}.`);render()}}
// manual scheduling (no date planned before release): date only
geSchedHtml=function(e){const D=geDates(e);if(ui.gecd==null||!D.includes(+ui.gecd))ui.gecd=D[0];ui.gecCc=1;
 return`<div class="c gesched"><h3>${gpT('Schedule the Pre-ceremony Concert & Ranking Announcement Ceremony','กำหนดวันคอนเสิร์ตก่อนประกาศผลและงานประกาศผล')}</h3><p class="st">${gpT('After the voting close','หลังปิดโหวต')} (${longDate(e.vEnd)}) · ${gpT('Saturdays and Sundays only. The ceremony is held in the concert venue.','เฉพาะเสาร์–อาทิตย์ งานประกาศผลจัดที่สถานที่ของคอนเสิร์ต')}</p><div class="row"><label class="st">${gpT('Date','วันที่')} <select onchange="ui.gecd=+this.value;render()">${D.map(d=>`<option value="${d}" ${d==ui.gecd?'selected':''}>${dayDate(d).toLocaleDateString('en-US',{weekday:'short'})}, ${longDate(d)}</option>`).join('')}</select></label><button class="b p" onclick="geBook()">${gpT('Book','จอง')}</button></div></div>`};
// ceremony day: attendance from the concert (its tickets are the concert's revenue); fallback hall when it was not held
{const f=geCerDay;geCerDay=function(e){try{if(e&&e.st=='scheduled'&&e.cer&&e.cer.cc&&S.day>=e.cer.day&&!e.cer.paid){const C=ccGet(e.cer.cc),V=geCcVen(C);
  if(C&&V&&['sales','live','done'].includes(C.status)){let att=0;C.pf.forEach(p=>{for(const k in CC_TIX){const q=(p.tix&&p.tix[k]&&p.tix[k].qty)|0,n=(p.sold&&p.sold[k])||(p.dem&&p.dem[k])||0;att+=Math.min(q||n,n)}});e.cer.vn=V.n;e.cer.cap=ccCap(C);e.cer.paid={att:Math.max(1,Math.min(att||e.cer.cap,e.cer.cap)),rev:0,fans:0,cc:1}}
  else{const v=GE_CC_FALLBACK;e.cer.vn=v.n;e.cer.cap=v.cap;e.cer.cost=v.cost;e.cer.fb=1;spend(v.cost,`${e.name}: ceremony venue (${v.n}) — the Pre-ceremony Concert was not held`)}}}catch(x){console.error(x)}return f.apply(this,arguments)}}
// ---- locks on the concert -------------------------------------------------------------------------------------------------
const geCcLock=()=>toast(gpT('This concert belongs to the General Election: its date is the ceremony date and it has one afternoon performance. Change the date in the election single (step 5 · Sales & Editions).','คอนเสิร์ตนี้เป็นของงานเลือกตั้ง วันที่คือวันประกาศผล และมีรอบบ่ายรอบเดียว เปลี่ยนวันได้ที่ซิงเกิลเลือกตั้ง (ขั้นที่ 5)'),'err');
{const f=ccSet;ccSet=function(k,v){const C=ccCur();if(C&&C.type=='ge'&&(k=='type'||k=='start'||k=='host'))return geCcLock();if(C&&C.type!='ge'&&k=='type'&&v=='ge')return toast(gpT('Election Concerts are created by the General Election.','คอนเสิร์ตเลือกตั้งสร้างจากระบบเลือกตั้งเท่านั้น'),'err');return f.apply(this,arguments)}}
{const f=ccPfAdd;ccPfAdd=function(){const C=ccCur();if(C&&C.type=='ge')return geCcLock();return f.apply(this,arguments)}}
{const f=ccPfSet;ccPfSet=function(pid,k){const C=ccCur();if(C&&C.type=='ge'&&k=='d')return geCcLock();return f.apply(this,arguments)}}
// the election is cancelled / the single unlinked → the concert plan goes too
{const f=geCancel;geCancel=function(){const e=geActive(),gid=gsAg();const r=f.apply(this,arguments);try{if(e&&!geS().list.includes(e))geCcDrop(e)}catch(x){console.error(x)}void gid;return r}}
{const f=geUnlink;geUnlink=function(){const p=S.pj,e=p&&p.ge?geGet(p.ge):null;const r=f.apply(this,arguments);try{if(e&&!(S.pj&&S.pj.ge==e.id)&&(e.st=='setup')){geCcDrop(e);if(e.cerPlan)delete e.cerPlan.day}}catch(x){console.error(x)}return r}}
// General Election page: the concert card and the venue
{const f=V.ge;V.ge=function(){try{const e=geCur();if(e)geCcSync(e)}catch(x){}let h=f.apply(this,arguments);try{const e=geCur();if(e&&geCcOf(e)&&['voting','closed','scheduled'].includes(e.st)){const C=geCcOf(e),Vn=geCcVen(C);
 const card=`<div class="c geccc"><div class="row"><span class="geprb">CONCERT</span><b>${esc(C.name)}</b>${typeof ccBadge=='function'?ccBadge(C):''}</div><p class="st">${jd(C.start)} · ${Vn?esc(Vn.n):gpT('venue not chosen yet','ยังไม่ได้เลือกสถานที่')} · ${gpT('the ceremony follows the concert in the same venue','งานประกาศผลจัดต่อจากคอนเสิร์ตในสถานที่เดียวกัน')}</p><button class="b s p" onclick="ccOpen('${C.id}')">🎤 ${gpT('Open concert','เปิดคอนเสิร์ต')}</button></div>`;
 const i=h.indexOf('<div class="c gecosc">');h=i>=0?h.slice(0,i)+card+h.slice(i):h+card}}catch(x){console.error(x)}return h}}
// Concert page: a banner on the election concert
{const f=ccEditor;ccEditor=function(C){let h=f.apply(this,arguments);try{if(C&&C.type=='ge')h=`<div class="c gebanner"><span class="geprb">GENERAL ELECTION</span><span class="st">${gpT('Pre-ceremony Concert: one afternoon performance on the ceremony date. The Ranking Announcement Ceremony follows in this venue.','คอนเสิร์ตก่อนประกาศผล: รอบบ่ายรอบเดียวในวันประกาศผล งานประกาศผลจัดต่อในสถานที่นี้')}</span></div>`+h}catch(x){}return h}}
