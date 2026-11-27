// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Special Releases (Special Single · Special Album)
// -------------------------------------------------------------------------------------
//  A release category of its own, next to the Regular Singles / Albums. Nothing is rebuilt:
//  · Each Special Release is its own project (S.srx.list, one per group context). While the player edits
//    it, it takes the place of the Regular project (S.pj, S.prod, S.cov…) and the Regular one waits in
//    S.srx.stash — so the existing planning steps, Senbatsu & Center, costumes, CD cover studio, MV planner,
//    production schedule and release code all work unchanged. Leaving the music screens puts the Regular
//    project back; ticks, release days and saves never see the swap.
//  · Production runs day by day in the background (costumes, rehearsals, release day) like a Regular single.
//  · Formats: Physical CD (Types, editions, cover per Type — existing CD sales) or Digital (one "Digital"
//    artwork, no Types, no inventory; downloads use the existing sales curve booked as "Digital sales").
//  · Never numbered, never handshake tickets, never a Regular Release record: after the existing release
//    code ran (sales, charts, MV, reputation…), the record moves from S.singles / S.albums to its project.
//  · Members: the song history (m.hist) keeps Special entries with sp:1 — they appear in the member's
//    work history and Center counts, but every Senbatsu count / first-time / streak record skips them.
//    Feelings: only members in the main song or a coupling song react; their Senbatsu record is unchanged.
// =====================================================================================
const SRX_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
const SRX_DIG=250/300; // a download earns ¥250 where a CD earns the company ¥300 (the platform fee is booked by the finance rule)
const SRX_SWAP=['pj','prod','cov','cur','curAlb','saved'];
const SRX_VIEWS=['music','senbatsu','cover','mvplan','costume','songcz'];
let SRX_CREATING=0,SRX_DIGREL=0;
try{GS_KEYS.push('srx')}catch(e){}
try{FIN_RULES.unshift([/^Digital sales: /,'digital',{d:.3,dl:'Download store & streaming platform fees'}])}catch(e){}
function srxS(){if(!S)return null;if(!S.srx||typeof S.srx!='object')S.srx={v:1,seq:0,list:[],on:null,stash:null};const X=S.srx;if(!Array.isArray(X.list))X.list=[];X.seq=+X.seq||0;return X}
const srxGet=id=>{const X=S&&S.srx;return X&&Array.isArray(X.list)?X.list.find(z=>z.id==id)||null:null};
const srxCur=()=>{const X=S&&S.srx;return X&&X.on?srxGet(X.on):null};
const srxKindN=sp=>sp.kind=='album'?SRX_T('Special Album','อัลบั้มพิเศษ'):SRX_T('Special Single','ซิงเกิลพิเศษ');
const srxFmtN=sp=>sp.fmt=='digital'?SRX_T('Digital','ดิจิทัล'):SRX_T('Physical CD','ซีดี');
// ---- the project swap --------------------------------------------------------------------------------------------------
function srxEnter(id){const X=srxS(),sp=srxGet(id);if(!sp||sp.st=='released')return false;if(X.on==id)return true;srxLeave();
 X.stash={};SRX_SWAP.forEach(k=>X.stash[k]=S[k]===undefined?null:S[k]);S.pj=sp.pj;S.prod=sp.prod||null;S.cov=sp.cov||(sp.cov={});S.saved=sp.saved||null;X.on=id;ui.cd=null;try{syncEds()}catch(e){}return true}
function srxLeave(){const X=S&&S.srx;if(!X||!X.on)return;const sp=srxGet(X.on);if(sp&&sp.st!='released'){sp.pj=S.pj;sp.prod=S.prod;sp.cov=S.cov||{};sp.saved=S.saved}
 const st=X.stash||{};SRX_SWAP.forEach(k=>{S[k]=st[k]!=null?st[k]:(k=='cov'?{}:null)});X.on=null;X.stash=null;ui.cd=null;try{syncEds()}catch(e){}}
function srxWith(sp,fn){const X=srxS(),prev=X.on;srxEnter(sp.id);try{return fn()}finally{srxLeave();if(prev&&prev!=sp.id&&srxGet(prev))srxEnter(prev)}}
const srxIsSp=()=>!!(S&&S.pj&&S.pj.srx);
// ---- create / open / delete ------------------------------------------------------------------------------------------
function srxNew(kind,fmt){const X=srxS();if(!X)return;srxLeave();const id='sx'+(++X.seq),dig=fmt=='digital';SRX_CREATING=1;
 try{const m=mkSong('Main');const pj={title:'',num:null,mainId:m.id,coup:[],types:[{name:dig?'Digital':'Type A',songs:[m.id]}],status:'draft',hs:{...hsNew(),on:false},srx:id,spFmt:fmt,spKind:kind};
  const sp={id,kind,fmt,pj,prod:null,cov:{},created:S.day,st:'draft'};X.list.push(sp);srxEnter(id);try{syncSaved()}catch(e){}
  if(kind=='album'){try{plSetKind('album')}catch(e){console.error(e)}}pj.num=null;pj.hs={...hsNew(),on:false};if(dig)pj.types=[{name:'Digital',songs:[...new Set(pj.types.flatMap(t=>t.songs))]}];try{syncEds()}catch(e){}}
 finally{SRX_CREATING=0}ui.srxNew=null;toast(SRX_T(`New ${kind=='album'?'Special Album':'Special Single'} (${dig?'Digital':'Physical CD'}). The Regular project is kept as it is.`,`สร้าง${kind=='album'?'อัลบั้มพิเศษ':'ซิงเกิลพิเศษ'} (${dig?'ดิจิทัล':'ซีดี'}) แล้ว โปรเจกต์ปกติยังอยู่เหมือนเดิม`));view='music';render()}
function srxOpen(id){const sp=srxGet(id);if(!sp)return;if(sp.st=='released')return srxShow(id);srxEnter(id);goView('music')}
function srxBack(){srxLeave();goView('srx')}
function srxDel(id){const X=srxS(),sp=srxGet(id);if(!sp||sp.st!='draft')return toast(SRX_T('Only a release that has not started production can be deleted.','ลบได้เฉพาะงานที่ยังไม่เริ่มผลิต'),'err');
 ask(SRX_T(`Delete this ${srxKindN(sp)} draft? Its new songs are removed too.`,`ลบร่าง${srxKindN(sp)}นี้? เพลงใหม่ในร่างจะถูกลบด้วย`),()=>{if(X.on==id)srxLeave();const p=sp.pj,reg=S.pj?new Set([S.pj.mainId,...(S.pj.coup||[]),...(S.pj.types||[]).flatMap(t=>t.songs)]):new Set();
  if(p)[...new Set([p.mainId,...(p.coup||[]),...(p.types||[]).flatMap(t=>t.songs)])].forEach(i=>{const o=S.songs[i];if(o&&!o.rel&&!reg.has(i))delete S.songs[i]});X.list=X.list.filter(z=>z.id!=id);render()},SRX_T('Delete','ลบ'))}
// ---- status ----------------------------------------------------------------------------------------------------------------
function srxStatus(sp){if(sp.st=='released')return['rel',SRX_T('Released','วางจำหน่ายแล้ว')];const p=sp.pj;if(!p||p.status=='draft')return['plan',SRX_T('Planning','วางแผน')];
 const d=p.releaseDay!=null?p.releaseDay-S.day:null;if(d!=null&&d<=7)return['up',SRX_T('Upcoming','ใกล้วางจำหน่าย')];return['prod',SRX_T('In Production','กำลังผลิต')]}
const srxRec=sp=>sp.rec||null;
const srxTitle=sp=>(sp.rec&&sp.rec.title)||(sp.pj&&String(sp.pj.title||'').trim())||SRX_T('Untitled','ยังไม่มีชื่อ');
const srxRelDay=sp=>sp.rec?(sp.rec.relDay??sp.rec.day):(sp.pj&&sp.pj.releaseDay!=null?sp.pj.releaseDay:null);
function srxCover(sp){const x=sp.rec;if(x&&x.covers){const c=x.covers['Album Cover']||Object.values(x.covers)[0];if(c)return c}const C=sp.cov||{};return C['Album Cover']||C.Digital||C['Type A']||Object.values(C)[0]||null}
function srxSongs(sp){const x=sp.rec,p=sp.pj;let ids=[];if(x)ids=x.tracks||plTracksX(x);else if(p){try{ids=plTracks(p)}catch(e){ids=[p.mainId,...(p.coup||[])]}}return ids.map(i=>S.songs[i]).filter(Boolean)}
// ---- daily production of the Special projects (the Regular project is never touched) --------------------------------------
function srxTick(sp){srxWith(sp,()=>{const p=S.pj;if(!p||p.status!='producing')return;
 [...new Set([p.mainId,...(p.coup||[]),...(p.types||[]).flatMap(t=>t.songs)])].forEach(i=>{const o=S.songs[i];if(o&&o.cosProd&&!o.cosProd.done&&S.day>=o.cosProd.ready)try{costumeDone(o)}catch(e){console.error(e)}});
 if(p.releaseDay!=null&&S.prod){const l=Math.max(0,p.releaseDay-S.day),was=S.prod.left;S.prod.left=l;if(was>0&&l==0)toast(SRX_T(`Release day for "${S.prod.title}" (${srxKindN(sp)}) has arrived!`,`ถึงวันวางจำหน่าย "${S.prod.title}" (${srxKindN(sp)}) แล้ว!`))}
 try{prodDay()}catch(e){console.error(e)}try{plCalSync();plCalTick()}catch(e){console.error(e)}
 const prev=ui.plRel;ui.plRel=null;try{plAutoRelease()}catch(e){console.error(e)}const R=ui.plRel;if(prev&&R&&R!==prev){const h=x=>x.t=='html'?x.h:relHtml(x);ui.plRel={t:'html',h:h(prev)+'<hr>'+h(R)}}else if(prev&&!R)ui.plRel=prev})}
{const f=tick;tick=function(){let back=null;try{if(S&&S.srx&&S.srx.on)back=S.srx.on;(S.groups||[]).forEach(g=>gsWith(g.id,srxLeave))}catch(e){console.error(e)}
 const r=f.apply(this,arguments);
 try{(S.groups||[]).forEach(g=>gsWith(g.id,()=>{const X=S.srx;if(!X||!Array.isArray(X.list))return;
  X.list.filter(sp=>sp.st=='producing'||(sp.pj&&sp.pj.status=='producing')).forEach(sp=>{sp.st='producing';srxTick(sp)});
  X.list.forEach(sp=>{const x=sp.rec;if(x&&x.sale&&x.sale.eds.some(e=>e.st=='selling'||e.st=='open'||e.st=='upcoming'))try{seDay(x,S.day)}catch(e){console.error(e)}if(sp.alb&&x){sp.alb.sales=x.sales;sp.alb.rev=x.rev;sp.alb.fans=x.fans}})}))}catch(e){console.error(e)}
 try{if(back&&srxGet(back)&&srxGet(back).st!='released')srxEnter(back)}catch(e){}return r}}
// ---- start of production: only participants react; the Senbatsu record stays as it was -----------------------------------
{const f=startSingle;startSingle=function(){const p=S.pj;if(!p||!p.srx)return f.apply(this,arguments);const was=p.status;p.num=null;p.hs={...(p.hs||hsNew()),on:false};
 const r=f.apply(this,arguments);try{const sp=srxGet(p.srx);if(sp&&was=='draft'&&p.status=='producing'){sp.st='producing';sp.prod=S.prod;p.num=null;
  if(ui.mod&&ui.mod.t=='html')ui.mod.h=ui.mod.h.replace(/Single #null|Album #null|#null/g,srxKindN(sp)).replace(/New single announced/,SRX_T(`New ${srxKindN(sp)} announced`,`ประกาศ${srxKindN(sp)}`))}}catch(e){console.error(e)}return r}}
{const f=wlReact;wlReact=function(p){if(!p||!p.srx)return f.apply(this,arguments);
 const part=new Set([p.mainId,...(p.coup||[]),...(p.types||[]).flatMap(t=>t.songs)].flatMap(i=>((S.songs[i]||{}).slots||[]).filter(Boolean)));
 const snap=new Map(),mh=new Map();S.members.forEach(m=>{snap.set(m,m.senRec===undefined?undefined:JSON.stringify(m.senRec));mh.set(m,(m.mh||[]).length)});
 const P0=wlPositions;wlPositions=function(){const M=P0.apply(this,arguments);if(!M)return M;const out=new Map();M.forEach((pos,id)=>{if(part.has(id))out.set(id,pos)});return out};
 let out;try{out=f.apply(this,arguments)}finally{wlPositions=P0;
  S.members.forEach(m=>{const s=snap.get(m);if(s===undefined)delete m.senRec;else m.senRec=JSON.parse(s); // Senbatsu record unchanged
   const n=mh.get(m)||0;if(Array.isArray(m.mh)&&m.mh.length>n)m.mh=m.mh.slice(0,n).concat(m.mh.slice(n).filter(e=>e.t!='first_sen'))})} // no first-Senbatsu record from a Special Release
 return(out||[]).filter(x=>x&&x.m&&part.has(x.m.id))}}
// ---- release: existing release code first, then the record leaves the Regular lists -----------------------------------------
{const f=doRelease;doRelease=function(){const p=S.pj;if(!p||!p.srx||p.status!='producing')return f.apply(this,arguments);
 const sp=srxGet(p.srx),dig=p.spFmt=='digital',n=S.singles.length,na=(S.albums||[]).length,rh0=(S.relHist||[]).length,e0=earn;p.hs={...(p.hs||hsNew()),on:false};
 if(dig)earn=function(a,l){const s=String(l);if(/^(Sales|Album sales|CD sales): /.test(s))return e0.call(this,Math.round(a*SRX_DIG),'Digital sales: '+s.replace(/^[^:]+: /,''));return e0.apply(this,arguments)};
 SRX_DIGREL=dig?1:0;let r;try{r=f.apply(this,arguments)}finally{earn=e0;SRX_DIGREL=0}
 try{if(!sp||p.status!='released')return r;const x=S.singles.length>n?S.singles.splice(n,1)[0]:null,a=(S.albums||[]).length>na?S.albums.splice(na,1)[0]:null;if(!x&&!a)return r;
  const kind=sp.kind,title=(x||a).title,lab=(kind=='album'?'Special Album: ':'Special Single: ')+title;
  [x,a].filter(Boolean).forEach(z=>{z.sp=1;z.spKind=kind;z.fmt=sp.fmt;z.num=null;z.srx=sp.id;if(z.hs)z.hs.on=false;if(z.cd)z.cd.tickets=0});
  if(x&&dig){x.dig={units:(x.dig&&x.dig.units||0)+((x.cd&&x.cd.units)||0)};x.cd={units:0,orders:0,tickets:0};if(x.sale)x.sale.eds.forEach(e=>{e.name=SRX_T('Digital download','ดาวน์โหลดดิจิทัล');e.type='Digital'})}
  if(a&&dig){a.dig={units:a.sales||0}}
  const rid=(x||a).rid||(x||a).id;[...S.members,...(S.alumni||[])].forEach(m=>(m.hist||[]).forEach(h=>{if(h.rid==rid){h.sp=1;h.spk=kind;h.rel=lab}}));
  S.relHist=(S.relHist||[]).filter(h=>h.id!=rid); // no first-time / continuing Senbatsu record
  (S.cal||[]).forEach(e=>{if(e.pid==p.id&&e.type=='release'&&e.title)e.title=e.title.replace(/^(Single|Album) Release Day/,lab.split(':')[0]+' Release Day')});
  try{const I=S.ind;[x,a].filter(z=>z&&z.ind&&I&&I.R[z.ind]).forEach(z=>{const R=I.R[z.ind];R.t=title;if(dig){R.F=0;R.d1=0;R.dlr=.03;R.S0=Math.round((R.S0||0)*1.3)}})}catch(e){}
  sp.rec=x||a;sp.alb=a;sp.st='released';sp.rid=rid;sp.pj=null;sp.prod=null;sp.cov={};
  const M=ui.plRel||ui.mod;if(M&&M.t=='html'){M.h=M.h.replace(/<h2 class="ht">✦ "([^"]*)" released! ✦<\/h2>/,`<h2 class="ht">✦ "$1" released! ✦</h2><p><span class="tag srxtag">${srxKindN(sp)} · ${srxFmtN(sp)}</span></p>`);if(dig)M.h=M.h.replace(/ CDs\b/g,' downloads').replace(/Release-day sales/,'Release-day downloads')}
 }catch(e){console.error(e)}return r}}
// digital releases: the existing daily sales curve, booked as downloads (no CD units, orders or tickets)
{const f=seDay;seDay=function(x,d){if(!x||!(x.fmt=='digital'||(SRX_DIGREL&&!x.fmt)))return f.apply(this,arguments);x.cd=x.cd||{units:0,orders:0,tickets:0};const u0=x.cd.units,o0=x.cd.orders,r0=x.rev||0,e0=earn;
 earn=function(a,l){const s=String(l);if(/^CD sales: /.test(s))return e0.call(this,Math.round(a*SRX_DIG),'Digital sales: '+s.slice(10));return e0.apply(this,arguments)};let t;try{t=f.apply(this,arguments)}finally{earn=e0}
 const du=x.cd.units-u0;if(x.fmt=='digital'){x.dig=x.dig||{units:0};x.dig.units+=du;x.cd.units=u0;x.cd.orders=o0}x.cd.tickets=0;x.rev=Math.round(r0+((x.rev||0)-r0)*SRX_DIG);return t}}
{const f=seSale;seSale=function(p){const SL=f.apply(this,arguments);try{if(SL&&p&&p.spFmt=='digital'){SL.eds=SL.eds.filter(e=>e.kind=='reg'&&e.ti==0).slice(0,1);SL.eds.forEach(e=>{e.m='qty';e.cap=CD_MAX});SL.hsDay=null}}catch(e){}return SL}}
{const f=seFind;seFind=function(gid,rid){const r=f.apply(this,arguments);if(r)return r;try{const X=gsCtx(gid,'srx');const sp=X&&(X.list||[]).find(z=>z.rid==rid);return sp?sp.rec:null}catch(e){return null}}}
// ---- what a Special Release can never do --------------------------------------------------------------------------------------
const srxNo=(en,th)=>(toast(SRX_T(en,th),'err'),render(),1);
{const f=plSetKind;plSetKind=function(){if(srxIsSp()&&!SRX_CREATING)return srxNo('A Special Release keeps the category it was created with.','งานพิเศษเปลี่ยนประเภทไม่ได้');return f.apply(this,arguments)}}
{const f=hsSetOn;hsSetOn=function(v){if(srxIsSp())return srxNo('Special Releases never include handshake tickets.','งานพิเศษไม่มีบัตรจับมือ');return f.apply(this,arguments)}}
{const f=hsSetFmt;hsSetFmt=function(){if(srxIsSp())return srxNo('Special Releases never include handshake tickets.','งานพิเศษไม่มีบัตรจับมือ');return f.apply(this,arguments)}}
{const f=hsPlanHtml;hsPlanHtml=function(p){if(p&&p.srx)return`<div class="c"><h3>${SRX_T('Handshake / Hi-Touch','จับมือ / ไฮทัช')}</h3><p class="st">${SRX_T('Special Releases never include handshake tickets.','งานพิเศษไม่มีบัตรจับมือ')}</p></div>`;return f.apply(this,arguments)}}
['addType','dupType'].forEach(n=>{const f=window[n];if(typeof f!='function')return;window[n]=function(){if(S.pj&&S.pj.spFmt=='digital')return srxNo('Digital releases have no CD Types.','งานดิจิทัลไม่มี Type ของซีดี');return f.apply(this,arguments)}});
{const f=seLimTog;seLimTog=function(){if(S.pj&&S.pj.spFmt=='digital')return srxNo('Digital releases have no limited CD editions.','งานดิจิทัลไม่มีฉบับจำกัดของซีดี');return f.apply(this,arguments)}}
{const f=seCardHtml;seCardHtml=function(p){if(p&&p.spFmt=='digital'){const R=seRel(p);return`<div class="c sebox"><h3>${SRX_T('Digital release','วางจำหน่ายแบบดิจิทัล')}</h3><p class="st">${SRX_T(`Downloads and streaming from ${jd(R)}. No CD Types, no editions, no CD inventory and no handshake tickets — only the usual music production costs.`,`ดาวน์โหลดและสตรีมมิงตั้งแต่ ${jd(R)} ไม่มี Type ซีดี ไม่มีฉบับพิเศษ ไม่มีสต็อกซีดี และไม่มีบัตรจับมือ มีเพียงค่าผลิตเพลงตามปกติ`)}</p></div>`}return f.apply(this,arguments)}}
{const f=seLockOf;seLockOf=function(){if(srxIsSp())return null;return f.apply(this,arguments)}} // Regular pre-orders never block a Special Release
['geApplyNext','geSubApply'].forEach(n=>{const f=window[n];if(typeof f!='function')return;window[n]=function(){if(SRX_CREATING||srxIsSp())return false;return f.apply(this,arguments)}});
// ---- Senbatsu statistics skip Special entries; Center counts and the work history keep them ----------------------------------
function srxNoSp(fn){const L=[...(S.members||[]),...(S.alumni||[])],keep=[];L.forEach(m=>{if(Array.isArray(m.hist)&&m.hist.some(h=>h&&h.sp)){keep.push([m,m.hist]);m.hist=m.hist.filter(h=>!(h&&h.sp))}});try{return fn()}finally{keep.forEach(([m,h])=>m.hist=h)}}
{const f=plRelList;plRelList=function(){return srxNoSp(()=>f.apply(this,arguments))}}
{const f=pfSenHtml;pfSenHtml=function(m){const SP=(m&&m.hist||[]).filter(h=>h&&h.sp);if(!SP.length)return f.apply(this,arguments);let h=srxNoSp(()=>f.apply(this,arguments));
 try{const cen=(m.hist||[]).filter(x=>x.center).length;h=h.replace(/Center ×\d+/,'Center ×'+cen);
  const L=SP.slice().sort((a,b)=>(a.day??0)-(b.day??0)).map(x=>`<li><b>${esc(x.title)}</b> <span class="st">(${esc(x.rel||'')})</span> <span class="tag srxtag">${x.spk=='album'?SRX_T('Special Album','อัลบั้มพิเศษ'):SRX_T('Special Single','ซิงเกิลพิเศษ')}</span> <span class="tag">${x.cat=='main'?SRX_T('Main song','เพลงหลัก'):SRX_T('Secondary song','เพลงรอง')}</span>${x.center?' <span class="tag rrUR">Center</span>':''} <span class="st">· ${jd(x.day)}</span></li>`).join('');
  h+=`<div class="shist pfsen"><h4><span>${SRX_T('Special Releases','งานพิเศษ')}</span></h4><p class="st">${SRX_T('Not counted as Senbatsu. Centers count.','ไม่นับเป็นเซ็มบัตสึ แต่นับการเป็นเซ็นเตอร์')}</p><ul>${L}</ul></div>`}catch(e){console.error(e)}return h}}
// ---- the release list (group discography) ---------------------------------------------------------------------------------------
function srxAllRel(){const out=[];(S.singles||[]).forEach((x,i)=>{if(x.kind!='album')out.push({c:'single',x,i,d:x.relDay??x.day})});(S.albums||[]).forEach(a=>out.push({c:'album',x:a,d:a.relDay??a.day}));
 (srxS().list||[]).filter(sp=>sp.st=='released'&&sp.rec).forEach(sp=>out.push({c:sp.kind=='album'?'salbum':'ssingle',x:sp.rec,sp,d:sp.rec.relDay??sp.rec.day}));return out.sort((a,b)=>(b.d??0)-(a.d??0))}
const SRX_CATS=[['all','All releases','ทั้งหมด'],['single','Singles','ซิงเกิล'],['ssingle','Special Singles','ซิงเกิลพิเศษ'],['album','Albums','อัลบั้ม'],['salbum','Special Albums','อัลบั้มพิเศษ']];
// discography thumbnails: a released cover never changes, so it is drawn once and shown as a cached image (a full inline cover is thousands of page elements)
const SRX_IMG=new WeakMap();
function srxThumb(cv,w){if(!cv)return'';let M=SRX_IMG.get(cv);if(!M){M={};SRX_IMG.set(cv,M)}if(M[w])return M[w];let h;try{let svg=coverSvg(cv,{size:w});if(!/xmlns=/.test(svg.slice(0,300)))svg=svg.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"');const u=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));h=`<img class="srxth" src="${u}" width="${w}" height="${w}" alt="" decoding="async">`}catch(e){h=coverSvg(cv,{size:w})}M[w]=h;return h}
function srxDiscHtml(){const t=ui.srxdt||'all',L=srxAllRel().filter(r=>t=='all'||r.c==t),N={single:SRX_T('Single','ซิงเกิล'),album:SRX_T('Album','อัลบั้ม'),ssingle:SRX_T('Special Single','ซิงเกิลพิเศษ'),salbum:SRX_T('Special Album','อัลบั้มพิเศษ')};
 return`<div class="row srxtabs">${SRX_CATS.map(([k,en,th])=>`<button class="b s ${t==k?'on p':''}" onclick="ui.srxdt='${k}';render()">${SRX_T(en,th)}</button>`).join('')}</div>${L.map(r=>{const x=r.x,sp=r.sp,cv=r.c=='single'?fc(x):(x.covers&&(x.covers['Album Cover']||Object.values(x.covers)[0])),units=sp&&sp.fmt=='digital'?((x.dig&&x.dig.units)||x.sales||0):(x.sales||0);
  const click=r.c=='single'?`showEds(${r.i})`:sp?`srxShow('${sp.id}')`:'';
  return`<div class="row disc" ${click?`onclick="${click}"`:''}>${cv?srxThumb(cv,46):`<span class="cover" style="width:34px;height:34px;background:${x.color||'#cdbdf5'}"></span>`}<span class="tag ${r.c=='single'||r.c=='ssingle'?'tmain':'tcoup'} ${sp?'srxtag':''}">${N[r.c]}</span>${sp?`<span class="tag">${srxFmtN(sp)}</span>`:`#${x.num||''}`} ${esc(String(x.title||'').replace(/^Album: /,''))} – ${units.toLocaleString()} ${sp&&sp.fmt=='digital'?SRX_T('downloads','ดาวน์โหลด'):SRX_T('sold','ขายแล้ว')}${r.d!=null?` · ${SRX_T('released','วางจำหน่าย')} ${jd(r.d)}`:''}</div>`}).join('')||`<p class="st">${SRX_T('No releases yet.','ยังไม่มีผลงาน')}</p>`}`}
function srxShow(id){const sp=srxGet(id);if(!sp)return;const x=sp.rec,songs=srxSongs(sp),dig=sp.fmt=='digital';const C=x?x.covers||{}:sp.cov||{};
 const tr=songs.map((o,k)=>{const cen=(o.centers&&o.centers.length?o.centers:o.center!=null?[o.center]:[]).map(get).filter(Boolean);const n=(o.slots||[]).filter(Boolean).length;return`<li><b>${esc(o.title)}</b> <span class="tag ${o.id==(x||sp.pj||{}).mainId?'tmain':'tcoup'}">${o.id==(x||sp.pj||{}).mainId?SRX_T('Main song','เพลงหลัก'):SRX_T('Secondary song','เพลงรอง')}</span> <span class="st">${n} ${SRX_T('members','คน')}${cen.length?' · Center '+cen.map(m=>esc(m.name)).join(', '):''}</span></li>`}).join('');
 const st=srxStatus(sp);ui.mod={t:'html',h:`<h2 class="ht">${esc(srxTitle(sp))}</h2><div class="row"><span class="tag srxtag">${srxKindN(sp)}</span><span class="tag">${srxFmtN(sp)}</span><span class="tag srxst ${st[0]}">${st[1]}</span></div>
 <div class="g">${Object.keys(C).map(k=>`<div class="c m">${coverSvg(C[k],{size:150})}<div class="st">${esc(k)}</div></div>`).join('')||`<p class="st">${SRX_T('No artwork yet.','ยังไม่มีปก')}</p>`}</div>
 ${x?`<p class="st">${SRX_T('Released','วางจำหน่าย')} ${jd(x.relDay??x.day)} · ${dig?`${((x.dig&&x.dig.units)||x.sales||0).toLocaleString()} ${SRX_T('downloads','ดาวน์โหลด')}`:`${(x.sales||0).toLocaleString()} ${SRX_T('CDs sold','ซีดีที่ขายได้')}`} · ${SRX_T('no handshake tickets','ไม่มีบัตรจับมือ')}</p>`:''}
 <div class="c"><h3>${sp.kind=='album'?SRX_T('Tracklist','รายชื่อเพลง'):SRX_T('Songs','เพลง')}</h3><ol class="ms">${tr}</ol></div>${x&&x.sale&&typeof seSaleBox=='function'&&!dig?seSaleBox(x):''}`};render()}
function srxCard(sp){const st=srxStatus(sp),cv=srxCover(sp),d=srxRelDay(sp),songs=srxSongs(sp);
 return`<div class="c srxcard"><div class="srxcv" onclick="srxOpen('${sp.id}')">${cv?(sp.st=='released'?srxThumb(cv,110):coverSvg(cv,{size:110})):`<div class="cover empty-cover" style="width:110px;height:110px">${SRX_T('No artwork','ยังไม่มีปก')}</div>`}</div><div class="srxinfo"><b>${esc(srxTitle(sp))}</b>
 <div class="row"><span class="tag">${srxFmtN(sp)}</span><span class="tag srxst ${st[0]}">${st[1]}</span></div><div class="st">${d!=null?(sp.st=='released'?SRX_T('Released ','วางจำหน่าย ')+jd(d):SRX_T('Release day ','วันวางจำหน่าย ')+jd(d)):SRX_T('Release day not set yet','ยังไม่กำหนดวันวางจำหน่าย')}</div>
 <${sp.kind=='album'?'ol':'ul'} class="ms srxtr">${songs.slice(0,10).map(o=>`<li>${esc(o.title)}${o.id==(sp.rec||sp.pj||{}).mainId?' <span class="tag tmain">'+SRX_T('Main','หลัก')+'</span>':''}</li>`).join('')}</${sp.kind=='album'?'ol':'ul'}>
 <div class="row"><button class="b s p" onclick="srxOpen('${sp.id}')">${sp.st=='released'?SRX_T('View','ดู'):SRX_T('Open','เปิด')}</button>${sp.st=='draft'?`<button class="b s" onclick="srxDel('${sp.id}')">${SRX_T('Delete draft','ลบร่าง')}</button>`:''}</div></div></div>`}
V.srx=function(){const X=srxS();if(!X)return'';const L=X.list.slice().sort((a,b)=>(srxRelDay(b)??1e9)-(srxRelDay(a)??1e9)||b.created-a.created),SS=L.filter(z=>z.kind!='album'),SA=L.filter(z=>z.kind=='album'),nw=ui.srxNew;
 const fmtPick=k=>`<div class="c srxnew"><b>${k=='album'?SRX_T('New Special Album — choose the format','อัลบั้มพิเศษใหม่ — เลือกรูปแบบ'):SRX_T('New Special Single — choose the format','ซิงเกิลพิเศษใหม่ — เลือกรูปแบบ')}</b>
  <div class="srxfmts"><button class="b" onclick="srxNew('${k}','cd')"><b>💿 ${SRX_T('Physical CD','ซีดี')}</b><small>${SRX_T('CD Types and editions, CD covers, CD sales. No handshake tickets.','มี Type และฉบับของซีดี ปกซีดี ยอดขายซีดี ไม่มีบัตรจับมือ')}</small></button>
  <button class="b" onclick="srxNew('${k}','digital')"><b>🎧 ${k=='album'?SRX_T('Digital Album','อัลบั้มดิจิทัล'):SRX_T('Digital Single','ซิงเกิลดิจิทัล')}</b><small>${SRX_T('Digital artwork, downloads & streaming. No CD production, Types or inventory.','ปกดิจิทัล ดาวน์โหลดและสตรีมมิง ไม่ผลิตซีดี ไม่มี Type ไม่มีสต็อก')}</small></button></div><button class="b s" onclick="ui.srxNew=null;render()">${SRX_T('Cancel','ยกเลิก')}</button></div>`;
 return`<h2 class="ht">${SRX_T('Special Releases','งานพิเศษ')}</h2><p class="st">${SRX_T('Special Singles and Special Albums run beside the Regular releases: no Regular number, no handshake tickets, and they never wait for (or change) the Regular project. Senbatsu counts are not affected; Centers count.','ซิงเกิลพิเศษและอัลบั้มพิเศษทำคู่ขนานกับงานปกติได้ ไม่มีลำดับเลขปกติ ไม่มีบัตรจับมือ ไม่ต้องรอและไม่กระทบโปรเจกต์ปกติ ไม่นับสถิติเซ็มบัตสึ แต่นับการเป็นเซ็นเตอร์')}</p>
 <div class="row"><button class="b p" onclick="ui.srxNew='single';render()">＋ ${SRX_T('Special Single','ซิงเกิลพิเศษ')}</button><button class="b p" onclick="ui.srxNew='album';render()">＋ ${SRX_T('Special Album','อัลบั้มพิเศษ')}</button></div>${nw?fmtPick(nw):''}
 <div class="c"><h3>${SRX_T('Special Singles','ซิงเกิลพิเศษ')} <span class="st">${SS.length}</span></h3><div class="srxg">${SS.map(srxCard).join('')||`<p class="st">${SRX_T('None yet.','ยังไม่มี')}</p>`}</div></div>
 <div class="c"><h3>${SRX_T('Special Albums','อัลบั้มพิเศษ')} <span class="st">${SA.length}</span></h3><div class="srxg">${SA.map(srxCard).join('')||`<p class="st">${SRX_T('None yet.','ยังไม่มี')}</p>`}</div></div>
 <div class="c"><h3>${SRX_T('Discography','ผลงานทั้งหมด')}</h3>${srxDiscHtml()}</div>`};
// ---- the planning page while a Special project is open ----------------------------------------------------------------------
{const f=V.music;V.music=function(){const sp=srxCur();if(sp&&S.pj)S.pj.num=null;let h=f.apply(this,arguments);
 try{h=h.replace(/(<div class="c" style="margin-top:10px"><h3>Discography<\/h3>)[\s\S]*?(<button class="b s" onclick="goView\('songlib'\)">)/,`$1${srxDiscHtml()}$2`);
  if(sp){h=h.replace(/New (Single|Album) Planning #(null|\d*)/,`${srxKindN(sp)} ${SRX_T('Planning','วางแผน')} · ${srxFmtN(sp)}`).replace(/<button class="[^"]*"[^>]*onclick="plSetKind\('[a-z]+'\)"[^>]*>[\s\S]*?<\/button>/g,'').replace(/<label class="st">No\. <input[^>]*><\/label>/,'');
   h=`<div class="c srxbar"><span class="tag srxtag">${srxKindN(sp)} · ${srxFmtN(sp)}</span><span class="st">${SRX_T('You are editing a Special Release. The Regular project is kept and continues on its own.','กำลังแก้ไขงานพิเศษ โปรเจกต์ปกติยังอยู่และดำเนินต่อตามปกติ')}</span><button class="b s p" onclick="srxBack()">← ${SRX_T('Special Releases','งานพิเศษ')}</button></div>`+h}
  else{const X=srxS(),n=X?X.list.filter(z=>z.st!='released').length:0;h=h.replace(/(<h2 class="ht">New (Single|Album) Planning[^<]*<\/h2>)/,`$1<div class="row srxlink"><button class="b s" onclick="goView('srx')">✦ ${SRX_T('Special Releases','งานพิเศษ')}${n?` (${n})`:''}</button></div>`)}}catch(e){console.error(e)}return h}}
// leaving the music screens puts the Regular project back
// (only screens of another menu section count: the dress-up, cover and MV screens of the production flow keep the Special project)
function srxOutside(v){if(SRX_VIEWS.includes(v))return false;try{const sec=SECS.find(z=>(z.v||[]).some(x=>x[0]==v)||(z.hid||[]).includes(v));return!!(sec&&sec.k!='music')||v=='srx'}catch(e){return false}}
{const f=render;render=function(){try{if(S&&S.srx&&S.srx.on&&srxOutside(view))srxLeave()}catch(e){}return f.apply(this,arguments)}}
// charts: Special Release covers
{const f=indCover;indCover=function(r,w){try{if(r&&r.pref){const X=gsCtx(r.pref.gid,'srx');const sp=X&&(X.list||[]).find(z=>z.rid==r.pref.rid&&z.rec);if(sp&&sp.rec.covers)return coverSvg(srxCover(sp),{size:w})}}catch(e){}return f.apply(this,arguments)}}
// saves made while a Special project is open: put the Regular project back when the game loads
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{(S.groups||[]).forEach(g=>gsWith(g.id,()=>{if(S.srx&&S.srx.on)srxLeave();if(S.srx)srxS()}))}catch(e){console.error(e)}return r}}
// the section entry
(function(){try{const M=SECS.find(s=>s.k=='music');if(M&&!M.v.some(v=>v[0]=='srx'))M.v.push(['srx','Special Releases']);if(typeof SUBLOC!='undefined')SUBLOC.srx='Recording Studio · Special Releases'}catch(e){console.error(e)}})();
try{Object.assign(I18N_TH,{'Special Releases':'งานพิเศษ','Recording Studio · Special Releases':'สตูดิโอบันทึกเสียง · งานพิเศษ','Download store & streaming platform fees':'ค่าธรรมเนียมร้านดาวน์โหลดและแพลตฟอร์มสตรีมมิง'})}catch(e){}
// the Under Girls costume dresses every member outside the Title Track — a Special Release only concerns its participants
{const f=reqs;reqs=function(p){const r=f.apply(this,arguments);try{if(p&&p.srx&&Array.isArray(r))return r.filter(x=>!/Under Girls/.test(String(x)))}catch(e){}return r}}
