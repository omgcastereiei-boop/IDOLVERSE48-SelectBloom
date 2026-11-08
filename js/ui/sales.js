// =====================================================================================
//  Monthly Sales Chart · Single sales (editions, Limited Quantity / Pre-order) · YouTube fans
// -------------------------------------------------------------------------------------
//  PART 1 — one official chart: the Monthly Sales Chart (physical single CD sales of a calendar month,
//    all editions of a single combined, Top 20, previous rank, NEW). Weekly / streaming / combined charts
//    are no longer shown (the market simulation keeps running underneath). A pop-up announces each
//    completed month once, on the 1st of the next month; past months stay in the history.
//  PART 2 — every Type of a single has a Regular Edition and, optionally, a Limited Edition with its own CD
//    cover. Each edition has its own sales method:
//      · Limited Quantity: the player sets the stock; demand follows the existing sales curve (release
//        week + fading tail) and can never exceed the stock; it stops when sold out.
//      · Pre-order: opening and closing dates (max. 90 days); fans buy every day; accumulated sales are
//        shown, the final total only after closing (result pop-up).
//    Demand = the existing release formula (fanbase, popularity, Senbatsu…). Revenue, fans, CD units,
//    Handshake tickets and the charts follow the real daily sales. A group with an open (or upcoming)
//    pre-order cannot start another single / album production; other groups are not affected.
//    Pre-orders longer than one month move the (single) Handshake / Hi-Touch event to a Saturday–Sunday
//    after the latest such closing date (the player can pick the weekend).
//    General Election singles keep their own voting-period sales.
//  PART 3 — new YouTube MV views bring new group fans (balanced, diminishing rate); part of them become
//    fans of the participating members, weighted by their formation position (Center > front > middle >
//    back, existing position weights) and popularity. Member fans are a subset of the new group fans.
// =====================================================================================
const SE_MAXPRE=90,SE_LONG=31,SE_PRICE=300;
const seDayOf=(y,m)=>dateDay(new Date(y,m,1)),seMk=d=>{const t=dayDate(d);return t.getFullYear()*12+t.getMonth()},seMkName=mk=>new Date(Math.floor(mk/12),mk%12,1).toLocaleDateString('en-US',{month:'long',year:'numeric'});
const seMkRange=mk=>[seDayOf(Math.floor(mk/12),mk%12),seDayOf(Math.floor(mk/12),mk%12+1)-1];
// ---- editions of a single plan ---------------------------------------------------------------------------------------
const seEdKey=(p,e)=>{const t=p.types[e.ti];return t?(e.kind=='lim'?t.name+' Limited':t.name):'?'};
const seEdName=(p,e)=>{const t=p.types[e.ti];return`${t?t.name:'?'} — ${e.kind=='lim'?'Limited Edition':'Regular Edition'}`};
function seEst(p){try{const mn=S.songs[p.mainId],L=(mn.slots||[]).filter(Boolean).map(get).filter(Boolean),pop=L.length?avg(L.map(m=>m.pop)):30;return Math.max(1000,Math.round((pop*90+S.fans*.12)*(L.length/16+.5)*(1+.15*(p.types.length-1))))}catch(e){return 5000}}
function seSale(p){if(!p||plAlb&&plAlb(p))return null;if(!p.sale)p.sale={eds:[],hsDay:null};const SL=p.sale;SL.eds=SL.eds.filter(e=>p.types[e.ti]);p.types.forEach((t,i)=>{if(!SL.eds.some(e=>e.ti==i&&e.kind=='reg'))SL.eds.push({id:'ed'+(++S.sid),ti:i,kind:'reg',m:'qty',cap:Math.max(10000,Math.round(seEst(p)*3/1000)*1000),od:0,len:30})});SL.eds.sort((a,b)=>a.ti-b.ti||(a.kind=='reg'?-1:1));return SL}
const seRel=p=>{const mn=S.day+(CFG.prodDays||28);return p.releaseDay!=null?p.releaseDay:(p.relPick!=null&&p.relPick>=mn?p.relPick:mn)};
function seEdSet(id,k,v){const p=S.pj,SL=seSale(p);if(!SL)return;if(p.status=='released')return;const e=SL.eds.find(z=>z.id==id);if(!e)return;const R=seRel(p);
 if(k=='m')e.m=v=='pre'?'pre':'qty';else if(k=='cap'){const n=Math.round(+v);if(!(n>=1))return toast('The stock must be at least 1 CD.','err');e.cap=Math.min(5000000,n)}
 else if(k=='open'){const d=dateDay(new Date(v+'T00:00:00'));if(!Number.isFinite(d))return;if(d<R)return toast(`Pre-orders open on Release Day (${jd(R)}) at the earliest.`,'err');const close=R+e.od+e.len-1;e.od=d-R;e.len=Math.max(1,Math.min(SE_MAXPRE,close-d+1))}
 else if(k=='close'){const d=dateDay(new Date(v+'T00:00:00'));if(!Number.isFinite(d))return;const o=R+e.od,n=d-o+1;if(n<1)return toast('The closing date must be after the opening date.','err');if(n>SE_MAXPRE)return toast(`A pre-order can last at most ${SE_MAXPRE} days (until ${jd(o+SE_MAXPRE-1)}).`,'err');e.len=n}
 render()}
function seLimTog(ti){const p=S.pj,SL=seSale(p);if(!SL||p.status=='released')return;const i=SL.eds.findIndex(e=>e.ti==ti&&e.kind=='lim');if(i>=0){const k=seEdKey(p,SL.eds[i]);SL.eds.splice(i,1);toast('Limited Edition removed (its cover draft is kept until release).')}else{SL.eds.push({id:'ed'+(++S.sid),ti,kind:'lim',m:'qty',cap:Math.round(seEst(p)*.6/1000)*1000||2000,od:0,len:30});toast('Limited Edition added. Design its own CD cover.')}render()}
function sePreLong(p){const SL=p.sale;if(!SL)return null;const L=SL.eds.filter(e=>e.m=='pre'&&e.len>SE_LONG);if(!L.length)return null;const R=seRel(p);return Math.max(...L.map(e=>R+e.od+e.len-1))}
const seSats=after=>{const L=[];for(let d=after+1;L.length<8&&d<after+80;d++)if(dowOf(d)==6)L.push(d);return L};
function seErrs(p){const r=[],SL=p&&p.sale;if(!SL)return r;SL.eds.forEach(e=>{const n=seEdName(p,e);if(e.m=='qty'&&!(e.cap>=1))r.push(`${n}: set the stock (Limited Quantity).`);if(e.m=='pre'){if(!(e.len>=1&&e.len<=SE_MAXPRE))r.push(`${n}: a pre-order lasts 1–${SE_MAXPRE} days.`);if(e.od<0)r.push(`${n}: pre-orders cannot open before Release Day.`)}});return r}
function seCoverErrs(p){const r=[],SL=p&&p.sale;if(!SL)return r;SL.eds.filter(e=>e.kind=='lim').forEach(e=>{const c=S.cov[seEdKey(p,e)];if(!c)r.push(`${seEdName(p,e)}: design its own CD cover.`);else if(c.status!='confirmed')r.push(`${seEdName(p,e)}: confirm its CD cover.`)});return r}
{const f=reqs;reqs=function(p){const r=f.apply(this,arguments);try{if(p&&p.status=='draft'&&!p.ge&&seSale(p))r.push(...seErrs(p))}catch(e){console.error(e)}return r}}
{const f=readiness;readiness=function(p){const r=f.apply(this,arguments);try{if(p&&!p.ge&&seSale(p))r.push(...seErrs(p),...seCoverErrs(p))}catch(e){console.error(e)}return r}}
{const f=rnType;rnType=function(i,v){const p=S.pj,old=p&&p.types[i]&&p.types[i].name;const r=f.apply(this,arguments);try{const nw=p.types[i]&&p.types[i].name;if(old&&nw&&old!=nw&&S.cov[old+' Limited']){S.cov[nw+' Limited']=S.cov[old+' Limited'];delete S.cov[old+' Limited']}}catch(e){}return r}}
// ---- production lock: an open / upcoming pre-order of THIS group --------------------------------------------------------
function seLockOf(){const L=(S.singles||[]).filter(x=>x.sale&&x.sale.eds.some(e=>e.m=='pre'&&e.st!='closed'));if(!L.length)return null;const x=L[0],e=x.sale.eds.filter(e=>e.m=='pre'&&e.st!='closed');return{x,close:Math.max(...e.map(z=>z.close))}}
const seLockMsg=L=>`Pre-orders of “${L.x.title}” are open until ${jd(L.close)}. ${gsName?gsName()||'This group':'This group'} cannot start another single or album production until every pre-order has closed. Other groups are not affected.`;
{const f=startSingle;startSingle=function(){const p=S.pj;try{if(p&&p.status=='draft'){const L=seLockOf();if(L)return toast(seLockMsg(L),'err')}}catch(e){console.error(e)}return f.apply(this,arguments)}}
if(typeof alRelease=='function'){const f=alRelease;alRelease=function(){const L=seLockOf();if(L)return toast(seLockMsg(L),'err');return f.apply(this,arguments)}}
// ---- release: sales are sold day by day through the editions ------------------------------------------------------
let SE_HS=null;
{const f=scheduleHS;scheduleHS=function(o){const H=SE_HS;if(H&&o&&(o.pid==H.pid||o.rid==H.rid)){const ev=f.call(this,{...o,base:Math.max(o.base,H.close)});try{if(ev&&!ev.done&&!ev.r1){if(H.day&&H.day>H.close&&dowOf(H.day)==6){ev.day=H.day;ev.day2=H.day+1}if(ev.day<=H.close){const s=seSats(H.close)[0];ev.day=s;ev.day2=s+1}ev.preLock=H.close}}catch(e){}return ev}return f.apply(this,arguments)}}
{const f=doRelease;doRelease=function(){const p=S.pj;if(!p||p.status!='producing'||(plAlb&&plAlb(p))||p.ge)return f.apply(this,arguments);const SL=seSale(p),n=S.singles.length,R=S.day,lc=sePreLong(p);
 const e0=earn,fans0=S.fans,title=p.title;earn=function(v,l){if(String(l)=='Sales: '+title)return;return e0.apply(this,arguments)};SE_HS=lc!=null?{pid:p.id,rid:null,close:R+0+(lc-seRel(p)),day:SL.hsDay}:null;
 let r;try{r=f.apply(this,arguments)}finally{earn=e0;SE_HS=null}
 try{const x=S.singles[n];if(!x||S.singles.length<=n)return r;x.dem=x.sales;S.fans-=x.fans||0;x.fans0=x.fans;x.fans=0;x.rev=0;x.sales=0;x.cd={units:0,orders:0,tickets:0};x.dsl={};const hs=!!(x.hs&&x.hs.on!==false&&hsOn(p));x.seHs=hs;
  const nT=p.types.length,both=ti=>SL.eds.some(e=>e.ti==ti&&e.kind=='lim');
  x.sale={eds:SL.eds.map(e=>{const key=seEdKey(p,e),sh=(1/nT)*(both(e.ti)?(e.kind=='lim'?.42:.58):1),F=x.dem*sh,o=R+(e.m=='pre'?e.od:0),c=e.m=='pre'?o+e.len-1:null;
   if(e.kind=='lim'&&S.cov[key]){x.covers[key]=JSON.parse(JSON.stringify(S.cov[key]));delete S.cov[key]}
   return{id:e.id,type:p.types[e.ti].name,kind:e.kind,name:seEdName(p,e),cover:e.kind=='lim'?key:p.types[e.ti].name,m:e.m,cap:e.m=='qty'?e.cap:null,open:o,close:c,F:Math.round(F),P:e.m=='pre'?Math.round(F*(1+.45*Math.log(1+e.len/7))):null,sold:0,fr:0,st:e.m=='pre'?(o>R?'upcoming':'open'):'selling'}}),last:null,fc:0};
  seDay(x,R);
  if(ui.mod&&ui.mod.t=='html'){ui.mod.h=ui.mod.h.replace(/Sales <b>[\d,]+<\/b><br>Revenue <b>[^<]*<\/b> · Fans <b>[^<]*<\/b>/,`Release-day sales <b>${x.cd.units.toLocaleString()}</b> CDs <span class="st">(sales continue edition by edition)</span>`)+seSaleBox(x)}
 }catch(e){console.error(e)}return r}}
// one day of sales of a released single
function seCurve(t){if(t<0)return 0;if(t==0)return .55;if(t<7)return .45*IND_D[t-1];return .12*Math.pow(.6,Math.floor(t/7)-1)/7}
function seDay(x,d){const SL=x&&x.sale;if(!SL||SL.last!=null&&SL.last>=d)return 0;SL.last=d;let tot=0;
 SL.eds.forEach(e=>{let n=0;if(e.m=='qty'){if(e.st!='selling')return;const t=d-x.relDay;const dm=e.F*seCurve(t)*(t>0?.85+Math.random()*.3:1)+e.fr;n=Math.floor(dm);e.fr=dm-n;n=Math.min(n,e.cap-e.sold);e.sold+=n;if(e.sold>=e.cap){e.st='soldout';e.soldDay=d;SE_Q.push({k:'sold',rid:x.rid,id:e.id,gid:gsAg()})}else if(t>210){e.st='ended';e.endDay=d}}
  else{if(e.st=='closed')return;if(d<e.open){e.st='upcoming';return}e.st='open';const T=e.close-e.open+1,i=d-e.open,w=T==1?1:i==0?.25:i==T-1?.12:(T>2?.63/(T-2):.75);const dm=e.P*w*(T>1?.85+Math.random()*.3:1)+e.fr;n=Math.floor(dm);e.fr=dm-n;e.sold+=n;if(d>=e.close){e.st='closed';e.closedDay=d;SE_Q.push({k:'pre',rid:x.rid,id:e.id,gid:gsAg()})}}
  e.dl=e.dl||{};if(n)e.dl[d]=(e.dl[d]||0)+n;tot+=n});
 if(tot){x.dsl[d]=(x.dsl[d]||0)+tot;x.sales+=tot;x.cd.units+=tot;x.cd.orders+=Math.max(1,Math.round(tot/1.05));if(x.seHs)x.cd.tickets+=tot;const rev=tot*SE_PRICE;x.rev+=rev;SL.pr=(SL.pr||0)+rev;const fr=tot*.2+SL.fc,nf=Math.floor(fr);SL.fc=fr-nf;x.fans+=nf;S.fans+=nf}
 // revenue is booked once a week (and when the last edition stops selling) to keep the ledger short
 const live=SL.eds.some(e=>e.st=='selling'||e.st=='open'||e.st=='upcoming');if(SL.pr&&((d-x.relDay)%7==0||!live)){earn(SL.pr,`CD sales: ${x.title}`);SL.pr=0}return tot}
let SE_Q=[];
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{if(S&&S.groups)S.groups.forEach(g=>gsWith(g.id,()=>(S.singles||[]).forEach(x=>{if(x.sale&&x.sale.eds.some(e=>e.st=='selling'||e.st=='open'||e.st=='upcoming'))seDay(x,S.day)})))}catch(e){console.error(e)}
 try{seMonthCheck()}catch(e){console.error(e)}return r}}
{const f=adv;adv=function(){const r=f.apply(this,arguments);try{const Q=SE_Q.filter(q=>q.k=='pre');SE_Q=SE_Q.filter(q=>q.k=='sold'&&(toast(seSoldTxt(q)),0));const M=ui.mchPop;ui.mchPop=null;const H=[];if(Q.length)H.push(...Q.map(seResHtml));if(M!=null)H.push(seMonthPopHtml(M));
 if(H.length){if(ui.mod&&!ui.mod.sePop)ui.modNext=ui.mod;ui.mod={t:'html',sePop:1,h:H.join('<hr>')};render()}}catch(e){console.error(e)}return r}}
function seFind(gid,rid){const L=gsCtx(gid,'singles')||[];return L.find(x=>x.rid==rid)||null}
function seSoldTxt(q){const x=seFind(q.gid,q.rid),e=x&&x.sale.eds.find(z=>z.id==q.id);return x&&e?`${e.name} of “${x.title}” is sold out (${e.sold.toLocaleString()} CDs).`:''}
function seResHtml(q){const x=seFind(q.gid,q.rid),e=x&&x.sale.eds.find(z=>z.id==q.id);if(!x||!e)return'';const g=grp(q.gid),days=e.close-e.open+1;e.ann=1;
 return`<h2 class="ht">Pre-order results</h2><div class="c seres"><div class="row">${x.covers&&x.covers[e.cover]?coverSvg(x.covers[e.cover],{size:110}):''}<div><b>“${esc(x.title)}”</b><div class="st">${esc(g?g.name:'')} · ${esc(e.name)}</div><div class="st">Pre-orders ${jd(e.open)} – ${jd(e.close)} (${days} days)</div><div class="sebig">${e.sold.toLocaleString()} <small>CDs</small></div></div></div>
 <p class="st">${e.sold.toLocaleString()} copies were sold during the ${days}-day pre-order — about ${Math.round(e.sold/Math.max(1,days)).toLocaleString()} a day. All editions of “${esc(x.title)}” together: <b>${x.sales.toLocaleString()}</b> CDs so far.</p></div>`}
function seSaleBox(x){if(!x||!x.sale)return'';return`<div class="c sebox"><h3>Editions &amp; sales</h3>${x.sale.eds.map(e=>{const pre=e.m=='pre',open=pre&&e.st!='closed';return`<div class="seedr">${x.covers&&x.covers[e.cover]?coverSvg(x.covers[e.cover],{size:56}):''}<div><b>${esc(e.name)}</b><small>${pre?`Pre-order ${jd(e.open)} – ${jd(e.close)} · ${e.st=='upcoming'?'opens '+jd(e.open):e.st=='open'?Math.max(0,e.close-S.day)+' day(s) left':'closed'}`:`Limited Quantity · stock ${e.cap.toLocaleString()} · remaining ${(e.cap-e.sold).toLocaleString()}${e.st=='soldout'?' · SOLD OUT':''}`}</small></div><span class="sesold">${open?'<small>so far</small> ':''}${e.sold.toLocaleString()}</span></div>`}).join('')}<div class="row"><b>Total</b><span class="st">${x.sales.toLocaleString()} CDs (all editions)</span></div></div>`}
// ---- Single Production: Sales & Editions card ----------------------------------------------------------------------
function seCardHtml(p){const SL=seSale(p);if(!SL)return'';const R=seRel(p),ro=p.status=='released',dis=ro?'disabled':'',lc=sePreLong(p),hs=hsOn&&hsOn(p);
 const ed=e=>{const key=seEdKey(p,e),c=S.cov[key],o=R+e.od,cl=o+e.len-1;return`<div class="c seed ${e.kind}"><div class="row"><b>${esc(seEdName(p,e))}</b>${e.kind=='lim'?`<button class="b s" ${dis} onclick="seLimTog(${e.ti})">Remove</button>`:''}</div>
  <div class="row"><button class="b s ${e.m=='qty'?'on':''}" ${dis} onclick="seEdSet('${e.id}','m','qty')">Limited Quantity</button><button class="b s ${e.m=='pre'?'on':''}" ${dis} onclick="seEdSet('${e.id}','m','pre')">Pre-order</button></div>
  ${e.m=='qty'?`<label class="st">Stock (maximum CDs for sale) <input type="number" min="1" step="100" value="${e.cap}" ${dis} style="width:120px" onchange="seEdSet('${e.id}','cap',this.value)"></label><p class="st">Sales follow real demand (fanbase, popularity, Senbatsu) and stop when the stock is sold out. The stock is not a sales guarantee.</p>`
   :`<div class="row"><label class="st">Opens <input type="date" ${dis} min="${thDateStr(R)}" value="${thDateStr(o)}" onchange="seEdSet('${e.id}','open',this.value)"></label><label class="st">Closes <input type="date" ${dis} min="${thDateStr(o)}" max="${thDateStr(o+SE_MAXPRE-1)}" value="${thDateStr(cl)}" onchange="seEdSet('${e.id}','close',this.value)"></label></div><p class="st">${e.len} day(s) (max. ${SE_MAXPRE}). Fans keep ordering until ${jd(cl)}; the final total is announced when pre-orders close.${e.len>SE_LONG?' Longer than one month: the Handshake / Hi-Touch event moves after the closing date.':''}</p>`}
  ${e.kind=='lim'?`<div class="row secov">${c?coverSvg(c,{size:74}):'<span class="cover empty-cover" style="width:74px;height:74px">No cover</span>'}<div><span class="st">${c?(c.status=='confirmed'?'✔ Cover confirmed':'✎ Draft — confirm it in the studio'):'Own cover not designed yet'}</span><div class="row"><button class="b s p" ${dis} onclick="openCov('${esc(key)}')">🎨 Design cover</button><button class="b s" ${dis} onclick="plCoverRand('${esc(key)}')">🎲 Random cover</button></div></div></div>`:''}</div>`};
 const L=seLockOf();
 return`<div class="c sesale"><h3>Sales &amp; Editions</h3><p class="st">Every Type is sold as a Regular Edition and, if you like, a Limited Edition with its own CD cover. Each edition has its own sales method. All editions are one single: one chart entry, combined sales.</p>${L&&p.status=='draft'?`<div class="c geerr">${esc(seLockMsg(L))}</div>`:''}
 ${p.types.map((t,i)=>`<div class="setype"><h4>${esc(t.name)}</h4>${SL.eds.filter(e=>e.ti==i).map(ed).join('')}${SL.eds.some(e=>e.ti==i&&e.kind=='lim')?'':`<button class="b s" ${dis} onclick="seLimTog(${i})">+ Add a Limited Edition</button>`}</div>`).join('')}
 ${lc!=null&&hs?`<div class="c sehs"><b>Handshake / Hi-Touch date</b><p class="st">A pre-order lasts longer than one month, so the event takes place on a Saturday–Sunday after the latest closing date (${jd(lc)}).</p><div class="row">${seSats(lc).map(d=>`<button class="b s ${SL.hsDay==d?'on':''}" ${dis} onclick="S.pj.sale.hsDay=${d};render()">${jd(d)}</button>`).join('')}</div>${SL.hsDay?'':'<p class="st">Not chosen: the first available weekend after the closing date is used.</p>'}</div>`:''}
 ${seErrs(p).map(x=>`<div class="st thwarn">✗ ${esc(x)}</div>`).join('')}</div>`}
{const f=V.music;V.music=function(){let h=f.apply(this,arguments);try{const p=S.pj;if(p&&!(plAlb&&plAlb(p))&&!p.ge){const card=seCardHtml(p),i=h.indexOf('<div data-step="5"');if(card)h=i>=0?h.slice(0,i)+card+h.slice(i):h+card}else if(!p||p.status=='released'){const L=seLockOf();if(L)h=`<div class="c geerr">${esc(seLockMsg(L))}</div>`+h}}catch(e){console.error(e)}return h}}
// released singles: editions in the Discography window
{const f=showEds;showEds=function(i){f.apply(this,arguments);try{const x=S.singles[i];if(x&&x.sale&&ui.mod&&ui.mod.t=='html')ui.mod.h+=seSaleBox(x)}catch(e){console.error(e)}}}
// the market (charts) uses the real daily sales of the player's singles
{const f=indCd;indCd=function(r,day){if(r&&r.pref&&r.pref.k=='s'){const x=seFind(r.pref.gid,r.pref.rid);if(x&&x.dsl)return x.dsl[day]||0}return f.apply(this,arguments)}}
// ---- PART 1: Monthly Sales Chart ---------------------------------------------------------------------------------------
function seMonth(mk){const I=indS();if(!I)return null;const[a,b]=seMkRange(mk),rows=[];Object.values(I.R).forEach(r=>{if(r.k!='s'||r.day>b)return;const pl=r.pref&&r.pref.k=='s';if(!pl&&!r.act&&r.day<a-7*30)return;if(!pl&&!r.act)return;let cd=0;for(let d=Math.max(a,r.day);d<=b;d++)cd+=indCd(r,d)||0;cd=Math.round(cd);if(cd>0)rows.push([r.id,cd])});
 rows.sort((x,y)=>y[1]-x[1]);const top=rows.slice(0,20);I.M=I.M||{};I.MH=I.MH||{};const prev=I.M[mk-1];top.forEach(([id],i)=>{const h=I.MH[id]=I.MH[id]||{first:mk,pk:99,n:0};h.pk=Math.min(h.pk,i+1);h.n++;h.last=mk});I.M[mk]={rows:top,made:S.day,prev:prev?1:0};return I.M[mk]}
function seMonthCheck(){if(!S||!S.ind)return;const I=S.ind,mk=seMk(S.day),pm=mk-1;I.mk0=I.mk0??mk;if(pm<I.mk0)return;I.M=I.M||{};if(I.M[pm])return;seMonth(pm);ui.mchPop=pm}
function seMvMark(mk,id,i){const I=S.ind,P=I.M[mk-1],h=I.MH&&I.MH[id];const pi=P?P.rows.findIndex(x=>x[0]==id):-1;if(h&&h.first==mk)return'<span class="mchnew">NEW</span>';if(pi<0)return'<span class="mchre">RE</span>';const d=pi-i;return d>0?`<span class="mchup">▲${d}</span>`:d<0?`<span class="mchdn">▼${-d}</span>`:'<span class="mcheq">＝</span>'}
function seRowHtml(mk,id,cd,i){const I=S.ind,r=I.R[id],a=I.A[r.aid]||{},pl=a.cat=='player',P=I.M[mk-1],pi=P?P.rows.findIndex(x=>x[0]==id):-1;
 return`<div class="mchr ${pl?'pl':''} ${i<3?'t'+(i+1):''}"><span class="mchk">${i+1}</span>${indCover(r,44)}<div><b>${esc(r.t)}</b><small>${esc(a.nm||'')}</small></div><span class="mchv">${cd.toLocaleString()}<small>CDs</small></span><span class="mchp">${seMvMark(mk,id,i)}<small>${pi>=0?'last '+(pi+1):'—'}</small></span></div>`}
function seMonthPopHtml(mk){const I=S.ind,M=I&&I.M&&I.M[mk];if(!M)return'';I.Mpop=I.Mpop||{};I.Mpop[mk]=1;
 return`<h2 class="ht">Monthly Sales Chart</h2><p class="st"><b>${esc(seMkName(mk))}</b> has ended — the official ranking of physical single sales (all editions combined).</p><div class="mch">${M.rows.slice(0,10).map(([id,cd],i)=>seRowHtml(mk,id,cd,i)).join('')||'<p class="st">No single sold a CD this month.</p>'}</div><div class="row"><button class="b p" onclick="ui.mod=null;ui.chm=${mk};ui.cht='m';goView('charts')">Open the full chart</button></div>`}
V.charts=function(){const I=indS(),t=ui.cht=ui.cht=='a'?'a':'m',M=I.M||{},ks=Object.keys(M).map(Number).sort((a,b)=>b-a),mk=ui.chm!=null&&M[ui.chm]?ui.chm:ks[0];
 const tabs=`<div class="row"><button class="b s ${t=='m'?'on':''}" onclick="ui.cht='m';render()">Monthly Sales Chart</button><button class="b s ${t=='a'?'on':''}" onclick="ui.cht='a';render()">Artists</button></div>`;
 if(t=='a')return`<h2 class="ht">Charts &amp; Sales</h2>${tabs}${indArtists()}`;
 const cur=seMk(S.day),[a]=seMkRange(cur);
 return`<h2 class="ht">Charts &amp; Sales</h2>${tabs}<div class="c"><h3>Monthly Sales Chart ${mk!=null?'· '+esc(seMkName(mk)):''}</h3><p class="st">The only official chart: physical CD sales of singles in a calendar month (Top 20), all editions of a single combined. YouTube views are not included. ${esc(seMkName(cur))} is published on ${jd(seMkRange(cur)[1]+1)}.</p>
 ${ks.length?`<div class="row mchm">${ks.slice(0,24).map(k=>`<button class="b s ${k==mk?'on':''}" onclick="ui.chm=${k};render()">${esc(seMkName(k))}</button>`).join('')}</div>`:''}
 ${mk!=null?`<div class="mch">${M[mk].rows.map(([id,cd],i)=>seRowHtml(mk,id,cd,i)).join('')||'<p class="st">No single sold a CD this month.</p>'}</div>`:'<p class="st">The first Monthly Sales Chart is published when the current month ends.</p>'}</div>
 ${seMineHtml()}`};
function seMineHtml(){const L=(S.singles||[]).filter(x=>x.sale).slice().reverse();if(!L.length)return'';return`<div class="c"><h3>Your singles · editions</h3>${L.slice(0,6).map(x=>`<div class="seminer"><b>#${x.num||''} ${esc(x.title)}</b> <span class="st">${x.sales.toLocaleString()} CDs</span>${seSaleBox(x)}</div>`).join('')}</div>`}
indDetail=function(c,id){const I=S.ind,r=I.R[id];if(!r)return;const a=I.A[r.aid]||{},H=Object.entries(I.M||{}).map(([k,M])=>[+k,M.rows.findIndex(x=>x[0]==id),(M.rows.find(x=>x[0]==id)||[])[1]]).filter(x=>x[1]>=0).sort((x,y)=>x[0]-y[0]);
 ui.mod={t:'html',h:`<h2 class="ht">${esc(r.t)}</h2><div class="row">${indCover(r,90)}<div><b>${esc(a.nm||'')}</b><div class="st">${r.k=='a'?'Album':'Single'} · released ${jd(r.day)}</div></div></div><h3>Monthly Sales Chart</h3>${H.length?`<ul class="ms">${H.map(([k,i,cd])=>`<li>${esc(seMkName(k))}: <b>#${i+1}</b> · ${Number(cd).toLocaleString()} CDs</li>`).join('')}</ul>`:'<p class="st">Not ranked yet.</p>'}`};render()};
// ---- PART 3: YouTube MV views → fans ---------------------------------------------------------------------------------
{const f=mvAddDay;mvAddDay=function(o,first){const dv=f.apply(this,arguments);try{if(dv>0&&o&&o.mv)seMvFans(o,dv)}catch(e){console.error(e)}return dv}}
function seMvFans(o,dv){const v=o.mv;const rate=.0022/(1+Math.sqrt(Math.max(0,v.v)/3e6)),g=dv*rate*(.85+Math.random()*.3)+(v.gfr||0),G=Math.floor(g);v.gfr=g-G;if(G<=0)return;
 const add=()=>{S.fans+=G};if(typeof fbWith=='function')fbWith('mv',add,{org:'YouTube MV · '+(o.title||'')});else add();v.yf=(v.yf||0)+G;
 // a part of the new fans become fans of the members in the MV, weighted by their formation position and popularity
 const sl=(o.fm&&o.fm.sl)||[],P=sl.length&&typeof posShares=='function'?posShares(sl).sh:new Map(),mem=new Map();sl.forEach((x,k)=>{if(x.m&&P.has(k)){const m=get(x.m);if(m)mem.set(m.id,(mem.get(m.id)||0)+P.get(k)*(x.c?1.25:1)*(.7+.6*(m.pop||0)/100))}});
 if(!mem.size)return;const tot=[...mem.values()].reduce((a,b)=>a+b,0),share=G*.35;v.mf=v.mf||{};v.mfr=v.mfr||{};mem.forEach((w,id)=>{const m=get(id);if(!m)return;const x=share*w/tot*(.7+Math.random()*.6)+(v.mfr[id]||0),n=Math.floor(x);v.mfr[id]=x-n;if(n>0){m.fans+=n;v.mf[id]=(v.mf[id]||0)+n}})}
{const f=mvOpen;mvOpen=function(id){f.apply(this,arguments);try{const o=S.songs[id],v=o&&o.mv;if(v&&ui.mod&&ui.mod.t=='html'){const L=Object.entries(v.mf||{}).map(([k,n])=>[get(+k),n]).filter(x=>x[0]).sort((a,b)=>b[1]-a[1]);ui.mod.h+=`<div class="c"><h3>Fans from this MV</h3><p class="st">New group fans: <b>${(v.yf||0).toLocaleString()}</b>. Part of them became fans of the members in the MV (by formation position and popularity).</p><div class="semvf">${L.map(([m,n])=>`<span>${ptc(m,34)}<b>${esc(m.name.split(' ')[0])}</b><small>+${n.toLocaleString()}</small></span>`).join('')||'<span class="st">None yet.</span>'}</div></div>`;render()}}catch(e){console.error(e)}}}
// CD Cover Studio: Limited Edition covers are editions of their own (designed and saved separately)
{const f=syncEds;syncEds=function(){const keep=ui.cd,ed=ui.ed;const r=f.apply(this,arguments);try{const p=S.pj;if(ui.cvCtx!='album'&&p&&p.sale&&!(plAlb&&plAlb(p))){p.sale.eds.filter(e=>e.kind=='lim').forEach(e=>{const k=seEdKey(p,e);if(!EDS.includes(k))EDS.push(k)});if(!ui.cd&&keep&&EDS.includes(ed))ui.cd=keep}}catch(e){console.error(e)}return r}}
