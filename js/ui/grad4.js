// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Graduation Stage in the Theater
// -------------------------------------------------------------------------------------
//  · A member who graduates at the END OF HER CONTRACT (Honorary Graduate: contract expiry, not early,
//    not dismissed) gets a full Graduation Stage: a dedicated Theater Stage of her team, built and edited
//    in the Theater's own Setlist Editor (Songs & MC · Units & Performers · Centers & Formation ·
//    Costumes — exactly like any Setlist Stage). It is performed once, on the team performance chosen for
//    her graduation (that performance uses this Stage instead of the team's active Stage). It never gets
//    a Stage number, never becomes the team's active Stage, and is listed in Theater › Stages.
//  · A member who graduates BEFORE the end of her contract gets what a Birthday Stage gets: the team's
//    current Setlist unchanged, then up to 3 farewell songs after the Encore.
//  · Pictures: the performance report of every Graduation Stage has a group photo (and, for the farewell
//    songs, one photo per song): the graduating member(s) wear their own Graduation Costume, every other
//    member wears the costume of the last song she performed in that show.
//  · Existing plans are kept: a planned full Graduation Stage becomes a Theater Stage with the same songs,
//    participants, Centers, units and Encore; an early graduate's plan keeps its last 3 songs as farewell songs.
// =====================================================================================
const g4San=t=>String(t||'').replace(/[<>]/g,'').trim().slice(0,40);
const g4Full=m=>!!(m&&typeof hgElig=='function'&&hgElig(m));
const g4St=x=>x&&x.gst?thStage(x.gst):null;
// the scheduled performance that carries a Graduation Stage uses that Stage
{const f=thStageFor;thStageFor=function(T,x){if(x&&x.gst){const s=thStage(x.gst);if(s)return s}return f.apply(this,arguments)}}
// a plan (song items: song, ids, center, unit, enc) → a Theater Stage of the team
function g4Make(x,mid,items){const H=thS(),m=get(mid),id='stg'+(++H.seq),pool=thPool(x.k).map(z=>z.id);
 const s={id,k:x.k,tpl:id,src:null,name:g4San(`${m?m.stage||m.name:''} Graduation Stage`),status:'gradst',gst:{mid,xid:x.id},created:S.day,units:[],uv:2,enc:{on:true,items:[]},cmode:'setlist',center:mid,fmode:'song',gform:{o:[],fr:0},items:[{k:'ov',id:thUid(),name:'Overture'}],no:null};
 const conv=z=>{const ids=(z.ids||[]).filter(id=>pool.includes(id)),it={k:'song',id:thUid(),song:z.song,pt:'team',unit:null,center:z.center!=null&&(ids.length?ids:pool).includes(z.center)?z.center:null,cz:null};
  if(ids.length&&ids.length<pool.length){const sig=ids.slice().sort((a,b)=>a-b).join(',');let u=s.units.find(q=>q.ids.slice().sort((a,b)=>a-b).join(',')==sig);if(!u){u={id:'u'+thUid(),name:g4San(z.unit)||`Unit ${s.units.length+1}`,desc:'',ids:ids.slice()};s.units.push(u)}it.pt='unit';it.unit=u.id}
  const M=ids.length&&it.pt=='unit'?ids:pool;it.form={o:M.slice().sort((a,b)=>(b==it.center)-(a==it.center)||((get(b)||{}).pop||0)-((get(a)||{}).pop||0)),fr:0};return it};
 const main=items.filter(z=>!z.enc),enc=items.filter(z=>z.enc);let mc=0;
 main.forEach((z,i)=>{s.items.push(conv(z));if((i+1)%4==0&&i<main.length-1)s.items.push({k:'mc',id:thUid(),name:`MC ${++mc}`,desc:'',mem:[],mm:'all'})});
 s.enc.items=enc.map(conv);if(!s.enc.items.length&&s.items.length>2){const last=s.items.pop();s.enc.items.push(last)}
 H.st[id]=s;x.gst=id;x.sp.gst=id;x.sp.full=0;delete x.sp.plan;x.sp.songs=[];try{g4Dress(s,mid)}catch(e){console.error(e)}return s}
// default costumes (all editable in the Costumes tab): a released song → its own costume; a Theater song → its original Stage
// costume; the graduating member wears her Graduation Costume in the Encore
function g4Dress(s,mid){const m=get(mid),gd=m&&m.grad&&czD(m.grad.cz),lib=czLib().ds.filter(d=>d.p),enc=new Set(thEncSeq(s).map(it=>it.id));
 const origSi=song=>{let si=null;Object.values(thS().st).filter(z=>!z.gst&&z.debut!=null).sort((a,b)=>a.debut-b.debut).some(z=>{const q=thAll(z).find(it=>it.song==song);if(q){si=q;return true}return false});return si};
 thAll(s).forEach(it=>{const o=S.songs[it.song],si=o&&o.th?origSi(it.song):null,one=lib.length?lib[Math.floor(Math.random()*lib.length)].p:null;
  thMem(s,it).forEach(id=>{let p=null;if(enc.has(it.id)&&id==mid&&gd)p=gd.p;if(!p&&si)p=thCzOf(si,id)||(typeof thCzAny=='function'?thCzAny(si):null);if(!p&&o&&o.rel){try{p=czFor(o,id)}catch(e){}if(!p&&typeof czMain=='function'){const d=czMain(o);p=d&&d.p}}if(!p)p=one;if(p)thSetOwn(it,id,p)})})}
// full Graduation Stage for contract-end graduates; farewell songs after the Encore for early graduates
spMakeFull=function(x,mid){const m=get(mid);if(!x||!x.sp)return;
 if(g4Full(m)){if(x.gst&&thStage(x.gst))return;
  // a Graduation Stage already built for her (e.g. the first date was cancelled) is reused with its Setlist
  const old=Object.values(thS().st).find(z=>z.gst&&z.gst.mid==mid&&z.status=='gradst');if(old){old.gst.xid=x.id;x.gst=old.id;x.sp.gst=old.id;x.sp.full=0;delete x.sp.plan;x.sp.songs=[];return}
  const P={mid,ids:thPool(x.k).map(z=>z.id),items:[],team:x.k,cz:{}};try{hgRandSet(P,1)}catch(e){console.error(e)}g4Make(x,mid,P.items);return}
 if(x.gst&&thStage(x.gst))return;x.sp.full=0;delete x.sp.plan;g4MakeEarly(x,mid)};
// choosing / proposing the performance opens the right editor
{const f=spSet;spSet=function(xid,mid,kind){const r=f.apply(this,arguments);try{if(kind=='grad'){const x=spShow(xid);if(x&&x.gst){g4Open(x)}else if(x&&x.sp){ui.spx=xid;ui.hgx=null;view='spst';render()}}}catch(e){console.error(e)}return r}}
function g4Open(x){if(!x||!x.gst)return;ui.thk=x.k;ui.ths=x.gst;ui.thst=ui.thst||'songs';ui.spx=x.id;ui.hgx=null;ui.mod=null;view='thset';render()}
function g4OpenStage(sid){const s=thStage(sid);if(!s||!s.gst)return;const x=spShow(s.gst.xid);if(x&&x.gst==sid)return g4Open(x);ui.thk=s.k;ui.ths=sid;view='thset';render()}
{const f=V.spst;V.spst=function(){const x=spShow(ui.spx);if(x&&x.gst&&thStage(x.gst)){ui.thk=x.k;ui.ths=x.gst;view='thset';return V.thset()}return f.apply(this,arguments)}}
{const f=V.hgst;V.hgst=function(){const id=String(ui.hgx||'');if(id.startsWith('sp:')){const x=spShow(id.slice(3));if(x&&x.gst){ui.thk=x.k;ui.ths=x.gst;view='thset';return V.thset()}if(x&&x.sp&&!x.sp.full){ui.spx=x.id;view='spst';return V.spst()}}return f.apply(this,arguments)}}
// errors: the Stage's own rules + she is Center at least once + Graduation Costume ready
{const f=spErr;spErr=function(x){if(x&&x.sp&&x.sp.gst){const s=thStage(x.sp.gst);if(!s)return['The Graduation Stage is missing.'];const E=thErr(s).slice();const songs=[...thAll(s)];
  x.sp.mids.forEach(id=>{const m=get(id);if(!m)return;if(!songs.some(it=>thCen(s,it)==id))E.push(`${m.name} must be the Center of at least one song.`);if(m.grad&&!(m.grad.cz&&czD(m.grad.cz)))E.push(`${m.name} has no Graduation Costume yet.`)});return E}
 return f.apply(this,arguments)}}
// the Graduation Stage is performed once: active for that performance only, then kept as a performed Graduation Stage
{const f=thPerform;thPerform=function(x){const s=x&&x.st=='sched'&&x.gst?thStage(x.gst):null;const prev=s?s.status:null;if(s)s.status='active';let r;
 try{r=f.apply(this,arguments)}finally{if(s){if(x.st=='done'&&x.gst==s.id){s.status='gradone';s.final=x.day;s.debut=s.debut??x.day;if(!s.orig)try{s.orig=thSnapItems(s)}catch(e){}}else s.status=prev=='gradone'?'gradone':'gradst'}}
 try{if(x&&x.st=='done'&&x.perf){const rec=thS().pf.find(z=>z.id==x.perf);const mids=rec&&rec.sp&&rec.sp.kind=='grad'?rec.sp.mids:null;if(mids){rec.sp.gcz={};mids.forEach(id=>{const m=get(id),d=m&&m.grad&&czD(m.grad.cz);if(d)rec.sp.gcz[id]=d.p});if(s){rec.sp.gst=s.id;rec.sp.full=1;if(s.gst.early)rec.sp.g4x=g4Extras(s).length}}}}catch(e){console.error(e)}return r}}
{const f=thGuardEdit;thGuardEdit=function(s){if(s&&s.status=='gradone'){toast('This Graduation Stage has already been performed.','err');return false}return f.apply(this,arguments)}}
// ---- Theater pages ----------------------------------------------------------------------------------------------------
function g4Banner(s){const x=spShow(s.gst.xid),m=get(s.gst.mid)||ctMem(s.gst.mid),E=x&&x.sp?spErr(x):[];const when=x?`${wd(x.day)} · ${TH_SLOT[x.sl]||''}`:'—';
 return`<div class="c g4ban"><div class="row"><span class="g4ic">🎓</span><div style="flex:1;min-width:0"><b>Graduation Stage — ${esc(m?m.name:'')}</b><div class="st">${esc(thLabel(s.k))} · performed on <b>${when}</b> instead of the team's active Stage (no Stage number, the Stage's performance count does not change). Her graduation date is that day.</div></div>
 ${s.status=='gradst'&&x&&x.st=='sched'?`${x.sp&&x.sp.auto&&!x.sp.ok?`<button class="b s p" onclick="ui.spx='${x.id}';spConfirm()">✔ Confirm date</button>`:''}<button class="b s" onclick="ui.spx='${x.id}';spPlanAlt()">Change performance</button>`:''}</div>
 ${E.length?`<div class="geerr c"><ul class="ms">${E.slice(0,6).map(e=>`<li>${esc(e)}</li>`).join('')}</ul></div>`:s.status=='gradst'?'<p class="st ok">✓ Ready.</p>':''}${m&&typeof histHtml2=='function'?histHtml2(m):''}</div>`}
{const f=V.thset;V.thset=function(){let h=f.apply(this,arguments);try{const s=thEd();if(s&&s.gst){const i=h.indexOf('<div class="c thed">');const b=g4Banner(s);h=i>=0?h.slice(0,i)+b+h.slice(i):b+h}}catch(e){console.error(e)}return h}}
{const f=V.thstage;V.thstage=function(){let h=f.apply(this,arguments);try{const key=thCur();const L=Object.values(thS().st).filter(s=>s.k==key&&s.gst).sort((a,b)=>(b.created||0)-(a.created||0));if(!L.length)return h;
 const card=s=>{const x=spShow(s.gst.xid),m=get(s.gst.mid)||ctMem(s.gst.mid),pf=thS().pf.find(p=>p.st==s.id);return`<div class="c thsc g4card"><div class="row"><span class="g4ic">🎓</span><div style="flex:1;min-width:0"><b>${esc(s.name)}</b> ${thStBadge(s)}<div class="st">${esc(m?m.name:'')} · ${thAll(s).length} songs · ${thUnits(s).length} Unit(s) · ${pf?'performed '+jd(pf.day):x?'planned for '+jd(x.day):'—'}</div></div></div><div class="row">${s.status=='gradst'?`<button class="b s p" onclick="g4OpenStage('${s.id}')">Edit Setlist</button>`:''}${pf?`<button class="b s" onclick="thOpenPerf('${pf.id}')">Performance report &amp; photos</button>`:''}</div></div>`};
 const blk=`<h3>🎓 Graduation Stages</h3>${L.map(card).join('')}`;const k=h.indexOf('<div class="c thsc');return k>=0?h.slice(0,k)+blk+h.slice(k):h+blk}catch(e){console.error(e);return h}}}
// ---- photos: group photo (+ one per farewell song) ----------------------------------------------------------------------
function g4Pics(rec){const sp=rec.sp;if(!sp||sp.kind!='grad')return[];const P=(S.th&&S.th.czp)||{},items=(S.th.snap[rec.snap]||[]).filter(z=>z.k=='song'),songs=(sp.songs||[]).slice();
 const gcz=id=>{if(sp.gcz&&sp.gcz[id])return sp.gcz[id];const m=get(id)||ctMem(id),G=m&&(m.grad||m.dep),d=G&&czD(G.cz);return d?d.p:null};
 const othCz=()=>{const d=sp.cz&&sp.cz.oth?czD(sp.cz.oth):null;return d?d.p:null};
 // the costume of the last song she performed in this show (farewell songs come last)
 const lastCz=id=>{if((sp.mids||[]).includes(id)){const g=gcz(id);if(g)return g}if(songs.some(z=>(z.ids||[]).includes(id))){const o=othCz();if(o)return o}for(let i=items.length-1;i>=0;i--){const c=items[i].cm&&items[i].cm[id];if(c&&P[c])return P[c];if((items[i].mem||[]).includes(id)&&items[i].cz){const d=czD(items[i].cz.did);if(d)return d.p}}return null};
 const gm=(sp.mids||[]).filter(id=>get(id)||ctMem(id)),rnd=thSeed(rec.id+':grad'),all=[...new Set([...(rec.mem||[]),...songs.flatMap(z=>z.ids||[])])].filter(id=>get(id)||ctMem(id)),oth=all.filter(id=>!gm.includes(id)).sort((a,b)=>(((get(b)||{}).pop)||0)-(((get(a)||{}).pop)||0)),go=[...gm,...oth];
 if(sp.gst&&sp.g4x){const E=items.filter(z=>z.enc).slice(-sp.g4x);songs.length=0;E.forEach(z=>songs.push({title:z.title,ids:(z.mem||[]).slice(),center:z.center,unit:z.unit?z.unit.name:''}))}
 const L=[];if(go.length)L.push({grp:1,o:go,rows:fxRows(go.length,Math.max(1,gm.length)),nc:Math.max(1,Math.min(2,gm.length)),mic:0,po:(()=>{const PZ=[0,1,2,3,6,8],q={};go.forEach(id=>q[id]=gm.includes(id)?3:PZ[Math.floor(rnd()*PZ.length)]);return id=>q[id]})(),hue:280,cap:`Group photo · ${go.length} members`});
 songs.forEach((z,i)=>{const ids=(z.ids||[]).filter(id=>get(id)||ctMem(id));if(!ids.length)return;const cen=z.center!=null&&ids.includes(z.center)?z.center:null,oo=[...(cen!=null?[cen]:[]),...ids.filter(id=>id!=cen).sort((a,b)=>(((get(b)||{}).pop)||0)-(((get(a)||{}).pop)||0))];const po={};ids.forEach(id=>po[id]=TH_MICP[Math.floor(rnd()*TH_MICP.length)]);
  L.push({o:oo,rows:fxRows(oo.length,1),nc:cen!=null&&ids.length>2?1:0,mic:1,po:id=>po[id],hue:Math.floor(rnd()*360),cap:`Encore +${i+1} “${z.title||''}”${z.unit?' · '+z.unit:''}${cen!=null?` · Center ${(ctMem(cen)||{}).name||''}`:''} · ${ids.length} member(s)`})});
 const fig4=id=>{const g=gcz(id);return g&&(sp.mids||[]).includes(id)?g:lastCz(id)};
 // graduated members are drawn too (the photo is usually opened after her graduation)
 return L.map(p=>({...p,svg:()=>{const tmp=go.filter(id=>!get(id)).map(id=>ctMem(id)).filter(Boolean);S.members.push(...tmp);let s;try{s=thStageSvg(++PTC[0],p.o,p.rows,p.nc,id=>p.grp?lastCz(id):fig4(id),p.po,p.mic,p.hue,null,null)}finally{if(tmp.length)S.members=S.members.filter(m=>!tmp.includes(m))}const t=`🎓 Thank you, ${(sp.names||[]).join(' & ')}!`;
  if(p.grp)s=s.replace(/<\/svg>$/,`<g><rect x="230" y="34" width="440" height="34" rx="17" fill="#fff" opacity=".9"/><text x="450" y="57" text-anchor="middle" font-size="18" font-weight="700" fill="#6a3fb5">${esc(t)}</text></g></svg>`);return s}}))}
function g4PicsHtml(rec){const L=g4Pics(rec);return L.length?`<div class="thpics g4pics"><h3>📸 ${rec.sp.gst?'Graduation Stage':'Farewell'} photos</h3>${L.map(p=>`<figure class="thpic">${p.svg()}<figcaption>${esc(p.cap)}</figcaption></figure>`).join('')}</div>`:''}
{const f=thOpenPerf;thOpenPerf=function(id){const r=f.apply(this,arguments);try{const p=thS().pf.find(z=>z.id==id);if(p&&p.sp&&p.sp.kind=='grad'&&p.sp.names&&ui.mod&&ui.mod.t=='html'&&!ui.mod.h.includes('g4pics')){const add=g4PicsHtml(p),k=ui.mod.h.indexOf('</h2>');ui.mod.h=k<0?add+ui.mod.h:ui.mod.h.slice(0,k+5)+add+ui.mod.h.slice(k+5);render()}}catch(e){console.error(e)}return r}}
// ---- existing plans ----------------------------------------------------------------------------------------------------
function g4Migrate(){try{(S.groups||[]).forEach(g=>gsWith(g.id,()=>{const H=S.th;if(!H||!Array.isArray(H.sh))return;H.sh.forEach(x=>{if(!x.sp||x.sp.kind!='grad'||x.st!='sched'||x.gst)return;const mid=(x.sp.mids||[])[0],m=get(mid);if(!m)return;
  if(x.sp.full&&x.sp.plan){const items=(x.sp.plan.items||[]).map(it=>({song:it.song,ids:it.ids||[],center:it.center,unit:it.unit,enc:!!it.enc}));
   if(g4Full(m))g4Make(x,mid,items);else{x.sp.full=0;delete x.sp.plan;x.sp.songs=items.slice(-3).map(it=>{const ids=it.ids.length?it.ids:[mid];return{song:it.song,ids,center:ids.includes(it.center)?it.center:mid,unit:it.unit||'',rows:spRows(ids,it.center)}})}}
  else if(!x.sp.full&&g4Full(m)&&!(x.sp.songs||[]).length)spMakeFull(x,mid)})}))}catch(e){console.error(e)}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{if(S&&!S.g4mig){S.g4mig=1;g4Migrate()}g4Ensure()}catch(e){console.error(e)}return r}}
// the featured member cannot perform → the show uses the team's Stage; her Graduation Stage waits for the next date
{const f=spCancel;spCancel=function(x){try{if(x&&x.gst){const st=thStage(x.gst);if(st&&st.gst)st.gst.xid=null;delete x.gst;if(x.sp)delete x.sp.gst}}catch(e){console.error(e)}return f.apply(this,arguments)}}
// a postponed Graduation Stage moves with its Setlist
if(typeof f10Postpone=='function'){const f=f10Postpone;f10Postpone=function(x){const g=x&&x.gst;const y=f.apply(this,arguments);try{if(g){delete x.gst;if(y){y.gst=g;if(y.sp)y.sp.gst=g;const st=thStage(g);if(st&&st.gst)st.gst.xid=y.id}}}catch(e){console.error(e)}return y}}
// every planned Graduation Stage follows the rule (also the ones chosen automatically when her date has passed)
function g4Ensure(){try{(S.groups||[]).forEach(g=>gsWith(g.id,()=>{const H=S.th;if(!H||!Array.isArray(H.sh))return;H.sh.forEach(x=>{if(x.st!='sched'||!x.sp||x.sp.kind!='grad')return;const mid=(x.sp.mids||[])[0],m=get(mid);if(!m)return;
 if(x.gst&&thStage(x.gst))return;if(x.sp.full&&x.sp.plan)return;spMakeFull(x,mid)})}))}catch(e){console.error(e)}}
{const f=tick;tick=function(){const r=f.apply(this,arguments);g4Ensure();return r}}
// reports of special stages that did not take place (only the plan was kept) open without errors
{const f=thOpenPerf;thOpenPerf=function(id){const p=thS().pf.find(z=>z.id==id);let keep=null;if(p&&p.sp&&!p.sp.names){keep=p.sp;delete p.sp}try{return f.apply(this,arguments)}finally{if(keep)p.sp=keep}}}
// the summary of a full Graduation Stage describes her own Setlist (not "extra songs")
{const f=tf7SpSum;tf7SpSum=function(p){if(p&&p.sp&&p.sp.gst){const st=thStage(p.sp.gst),items=(S.th.snap[p.snap]||[]).filter(z=>z.k=='song'),enc=items.filter(z=>z.enc).length;
 return`<div class="c spsum"><h3>🎓 Graduation Stage — ${esc((p.sp.names||[]).join(', '))}</h3><p class="st">Her own Setlist “${esc(st?st.name:p.sp.stage||'')}”: ${items.length-enc} song(s) + Encore ${enc}, performed instead of the team's Stage. ${items.map(z=>`${z.enc?'EN ':''}“${esc(z.title||'')}”${z.center!=null?` (Center ${esc((ctMem(z.center)||{}).name||'')})`:''}`).join(' · ')}</p></div>`}return f.apply(this,arguments)}}
try{Object.assign(I18N_TH,{'Graduation Stages':'สเตจจบการศึกษา','Change performance':'เปลี่ยนรอบการแสดง','Confirm date':'ยืนยันวัน','Performance report & photos':'รายงานและรูปการแสดง','Graduation Stage photos':'รูปสเตจจบการศึกษา','Farewell photos':'รูปอำลา','Graduation Stage':'สเตจจบการศึกษา','Graduation Stage · performed':'สเตจจบการศึกษา · แสดงแล้ว','✓ Ready.':'✓ พร้อมแล้ว'})}catch(e){}

// ---- early graduation: the team's current Setlist (locked) + up to 3 farewell songs after the Encore, in the Setlist Editor ----
const G4_XMAX=3;
const g4Early=s=>!!(s&&s.gst&&s.gst.early);
const g4Locked=(s,it)=>!!(g4Early(s)&&it&&(s.gst.lock||[]).includes(it.id));
const g4Extras=s=>thEncSeq(s).filter(it=>it.k=='song'&&!(s.gst.lock||[]).includes(it.id));
function g4MakeEarly(x,mid){const H=thS(),m=get(mid),T=thOf(x.k);let base=null;{const g=x.gst;delete x.gst;try{base=thStageFor(T,x)}finally{if(g)x.gst=g}}
 if(!base)return;const s=JSON.parse(JSON.stringify(base)),id='stg'+(++H.seq);['debut','orig','origUnits','runs','perfs','prefs','prefH','debutPics','final','lastDay','reuse','cfgEd','revOf','adopted','srcNo','srcK'].forEach(k=>delete s[k]);
 Object.assign(s,{id,tpl:id,name:g4San(`${m?m.stage||m.name:''} Graduation Stage`),status:'gradst',no:null,created:S.day,gst:{mid,xid:x.id,early:1,base:base.id,lock:[]}});
 s.items.forEach(it=>s.gst.lock.push(it.id));thEncO(s);s.enc.on=true;s.enc.items.forEach(it=>s.gst.lock.push(it.id));
 // farewell songs: the plan's songs if there was one, otherwise her graduation songs / farewell songs (her as Center)
 const pool=thPool(x.k).map(z=>z.id),gd=m&&m.grad&&czD(m.grad.cz);let picks=(x.sp.songs||[]).filter(z=>z.song).slice(-G4_XMAX);
 if(picks.length<G4_XMAX)try{const have=new Set([...picks.map(z=>z.song),...thAll(base).map(it=>it.song)]);spPickSongs(x.k,G4_XMAX*3,mid,true).filter(song=>!have.has(song)).slice(0,G4_XMAX-picks.length).forEach(song=>picks.push({song,ids:pool,center:mid}))}catch(e){}
 picks.forEach(z=>{const ids=(z.ids||pool).filter(i=>pool.includes(i)),it={k:'song',id:thUid(),song:z.song,pt:'team',unit:null,center:mid,cz:null};
  if(ids.length&&ids.length<pool.length){const u={id:'u'+thUid(),name:g4San(z.unit)||`Farewell Unit ${(s.units||[]).length+1}`,desc:'',ids:ids.includes(mid)?ids:[mid,...ids]};s.units=s.units||[];s.units.push(u);it.pt='unit';it.unit=u.id}
  s.enc.items.push(it)});
 H.st[id]=s;x.gst=id;x.sp.gst=id;x.sp.songs=[];
 // costumes of the farewell songs: she wears her Graduation Costume, the others their last costume of the Setlist
 try{const last=[...thAll(base)].reverse();g4Extras(s).forEach(it=>thMem(s,it).forEach(i=>{let p=null;if(i==mid&&gd)p=gd.p;if(!p){for(const q of last){const c=thCzOf(q,i);if(c){p=c;break}}}if(p)thSetOwn(it,i,p)}))}catch(e){console.error(e)}
 return s}
// the locked part of the Setlist cannot be changed; adding a song adds a farewell song at the end of the Encore
const g4Msg=()=>toast('Early graduation: the team\'s current Setlist is performed unchanged. You can add up to 3 farewell songs after the Encore and edit their members, Center, formation and costumes.','err');
[['thDel',(s,a)=>g4Locked(s,s.items[a[0]])],['thMv',(s)=>g4Early(s)],['thEncDel',(s,a)=>g4Locked(s,thEncO(s).items[a[0]])],['thEncMv',(s,a)=>{const L=thEncO(s).items;return g4Locked(s,L[a[0]])||g4Locked(s,L[a[0]+a[1]])}],
 ['thEncTog',(s)=>g4Early(s)],['thMcAdd',(s)=>g4Early(s)],['thOvTog',(s)=>g4Early(s)],['thSongNew',(s)=>g4Early(s)],['thSongMake',(s)=>g4Early(s)],['thSongRand',(s)=>g4Early(s)],
 ['thSwapSong',(s,a)=>g4Locked(s,thAll(s).find(i=>i.id==a[0])||s.items.find(i=>i.id==a[0]))],['thSongDelAsk',(s,a)=>g4Locked(s,thAll(s).find(i=>i.id==a[0])||s.items.find(i=>i.id==a[0]))]].forEach(([n,bad])=>{try{const f=window[n];if(typeof f!='function')return;window[n]=function(){const s=thEd();if(s&&g4Early(s)&&bad(s,[...arguments]))return g4Msg();return f.apply(this,arguments)}}catch(e){}});
function g4AddExtra(songId){const s=thEd();if(!s||!g4Early(s)||!thGuardEdit(s))return;if(g4Extras(s).length>=G4_XMAX)return toast(`At most ${G4_XMAX} farewell songs.`,'err');const o=S.songs[songId];if(!thSongOk(o,s.k))return toast('That song is not available to this theater.','err');if(g4Extras(s).some(i=>i.song==songId))return toast('This song is already a farewell song.','err');
 const mid=s.gst.mid,it={k:'song',id:thUid(),song:songId,pt:'team',unit:null,center:mid,cz:null};thEncO(s).items.push(it);try{const m=get(mid),gd=m&&m.grad&&czD(m.grad.cz),last=[...thAll(s)].reverse().slice(1);thMem(s,it).forEach(i=>{let p=i==mid&&gd?gd.p:null;if(!p)for(const q of last){const c=thCzOf(q,i);if(c){p=c;break}}if(p)thSetOwn(it,i,p)})}catch(e){}toast(`“${o.title}” added as farewell song ${g4Extras(s).length}.`);render()}
{const f=thSongAdd;thSongAdd=function(songId){const s=thEd();if(s&&g4Early(s))return g4AddExtra(songId);return f.apply(this,arguments)}}
{const f=thEncAdd;thEncAdd=function(songId){const s=thEd();if(s&&g4Early(s))return g4AddExtra(songId);return f.apply(this,arguments)}}
// the song limit does not apply to the farewell songs; at least one farewell song is needed
{const f=thErr;thErr=function(s){const E=f.apply(this,arguments);if(!g4Early(s))return E;const out=E.filter(e=>!/at most \d+ songs/i.test(e));if(!g4Extras(s).length)out.push('Add at least 1 farewell song after the Encore.');return out}}
{const f=spErr;spErr=function(x){const E=f.apply(this,arguments);try{const s=x&&x.gst&&thStage(x.gst);if(g4Early(s))return E.filter(e=>!/must be the Center/.test(e)||!g4Extras(s).some(it=>thCen(s,it)==s.gst.mid))}catch(e){}return E}}
// the editor tells which part is fixed
{const f=V.thset;V.thset=function(){let h=f.apply(this,arguments);try{const s=thEd();if(g4Early(s)){const n=g4Extras(s).length;h=h.replace('<div class="c thed">',`<div class="c g4ban"><b>🎓 Early graduation — farewell songs ${n}/${G4_XMAX}</b><div class="st">The team's current Setlist (🔒) is performed unchanged. Add up to ${G4_XMAX} farewell songs after the Encore (use “Add song”) — their members, Center, formation and costumes can be edited like any song.</div></div><div class="c thed">`)}}catch(e){console.error(e)}return h}}
