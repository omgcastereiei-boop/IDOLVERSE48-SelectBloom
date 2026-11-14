// =====================================================================================
//  Theater fixes — Trainee Stage ends on roster change · restructuring transition completes by itself ·
//  Birthday / Graduation Stage labels · one-time report sections · Birthday Stage photos per song ·
//  Stage Archive first / last performance · costume pickers grouped (Single / Theater)
// -------------------------------------------------------------------------------------
//  · Trainee Stage: as soon as a Trainee of its lineup is promoted, transferred or leaves, the Trainee
//    Stage ends (scheduled shows cancelled), whether Trainees remain or not. A restructuring transition
//    of the Trainee theater ends with it.
//  · Team transition banner: a pending restructuring transition is completed automatically when the
//    team already performs another Stage after the announcement (or the team no longer exists).
//  · Performance report: "Setlist as performed" only on the Stage's first performance (or when the
//    setlist changed); Song Preference only where songs were scored (first performance / new performers).
//  · Birthday / Graduation Stage tag in results, Performance History and Stage pages.
//  · Birthday Stage: 1 member per performance; never on the first or the final performance of a Stage.
//    Photos use the Theater stage: 1 photo of everyone who performed that show + 1 photo per extra song.
//  · Stage Archive: only the first and the last performance, with every member (tap a face: profile).
//  · Costume dropdowns: Single costumes and Theater costumes in separate sections, sorted by group,
//    team and release order.
// =====================================================================================
const TF7_SPT={bd:'🎂 Birthday Stage',grad:'🎓 Graduation Stage'};
const tf7Tag=p=>{const k=p&&p.sp&&p.sp.kind;return k&&TF7_SPT[k]?`<span class="tag thsptag ${k}">${TF7_SPT[k]}</span>`:''};
const tf7Lab=key=>typeof thLabelAny=='function'?thLabelAny(key):thLabel(key);
const tf7Sl=(a,b)=>a.day-b.day||((TH5_SL[a.sl]|0)-(TH5_SL[b.sl]|0));
// end index of the <div …> block that starts at k (matching </div>)
function tf7End(h,k){const re=/<div\b|<\/div>/g;re.lastIndex=k;let d=0,m;while((m=re.exec(h))){d+=m[0]=='</div>'?-1:1;if(!d)return re.lastIndex}return h.length}
const tf7Cut=(h,cls)=>{const k=h.indexOf(`<div class="${cls}`);return k<0?h:h.slice(0,k)+h.slice(tf7End(h,k))};

// ---- 1. Trainee Stage ends when its Trainees change -------------------------------------------------------------
function tf7TrWatch(){if(!S||!S.th)return;try{thAllK(()=>thKeysAll().filter(K=>K.kind=='tr').forEach(K=>{const T=thOf(K.key),now=S.members.filter(m=>m.status=='trainee'&&m.group==K.gid).map(m=>m.id),s=thStage(T.active);
 const busy=(s&&s.status=='active')||T.trans||thShowsOf(K.key).some(x=>x.st=='sched'&&x.day>=S.day),prev=T.trIds;T.trIds=now;if(!busy)return;
 let gone=prev?prev.filter(id=>!now.includes(id)):[];
 // first check on an existing save: performers of the latest show who are no longer Trainees here
 if(!prev&&s){const lp=thS().pf.filter(p=>p.k==K.key&&p.st==s.id).at(-1);if(lp)gone=(lp.mem||[]).filter(id=>!now.includes(id)&&ctMem(id))}
 // a restructuring kept the old lineup on the Trainee Stage: members who are no longer Trainees end it too
 if(T.rx&&Array.isArray(T.rx.lu))T.rx.lu.forEach(id=>{if(!now.includes(id)&&!gone.includes(id))gone.push(id)});
 if(!gone.length)return;
 if(T.rx){try{const p=orgP(T.rx.pid),t=p&&p.tr&&p.tr[K.key];if(t){t.st='done';t.doneDay=S.day;t.auto='Trainee Stage ended'}}catch(e){}delete T.rx}
 const nm=gone.map(id=>(ctMem(id)||{}).name).filter(Boolean);
 thStopTheater(K.key,'The Trainee lineup changed',`<li>🎭 <b>${esc(tf7Lab(K.key))}</b>: ${nm.length?esc(nm.slice(0,4).join(', '))+(nm.length>4?` +${nm.length-4}`:'')+' left the Trainee lineup':'the Trainee lineup changed'}, so ${s?`the Trainee Stage “${esc(s.name)}”`:'the Trainee Stage'} has ended. ${now.length?'Create a new Trainee Stage for the current Trainees.':'There are no Trainees left.'}</li>`)}))}catch(e){console.error(e)}}
{const f=tick;tick=function(){tf7TrWatch();tf7RxAuto();const r=f.apply(this,arguments);tf7TrWatch();tf7RxAuto();tf7BdFix();return r}}
{const f=thPerform;thPerform=function(x){try{if(x&&x.st=='sched'&&thTr(x.k)){tf7TrWatch();if(x.st!='sched')return}}catch(e){}return f.apply(this,arguments)}}

// ---- 3. restructuring transition: done once the team performs another Stage ---------------------------------------
function tf7RxAuto(){if(!S||!S.th||typeof orgS!='function')return;try{orgS().plans.forEach(p=>{if(p.st!='announced'||!p.tr)return;Object.values(p.tr).forEach(t=>{if(!t||t.st=='done')return;thAllK(()=>{const T=S.th.T[t.key];
 const gone=!thKeysAll().some(K=>K.key==t.key),a=T&&thStage(T.active),newOk=!!(a&&a.id!=t.sid&&thS().pf.some(z=>z.k==t.key&&z.st==a.id&&z.day>=(p.annDay|0)));
 if(!T||gone||newOk){t.st='done';t.doneDay=S.day;t.auto=gone?'team no longer exists':'new Stage already performed';if(T&&T.rx&&T.rx.pid==p.id)delete T.rx}})})})}catch(e){console.error(e)}}
{const f=V.thov;V.thov=function(){tf7RxAuto();return f.apply(this,arguments)}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{tf7RxAuto()}catch(e){}return r}}

// ---- 4. Birthday / Graduation Stage tag ----------------------------------------------------------------------------
{const f=thPfRow;thPfRow=function(p){const h=f.apply(this,arguments),t=tf7Tag(p);return t?h.replace('</b>',` ${t}</b>`):h}}
// results of the day: tag on the performance result; Song Preference note only when songs were scored
{const f=thPerform;thPerform=function(x){const H=thS(),n0=H.pf.length,r0=ui.newRes?ui.newRes.length:0,sig0={};
 try{if(x&&x.st=='sched'){const s=thStageFor(thOf(x.k),x);if(s&&s.prefs)for(const k in s.prefs)sig0[k]=s.prefs[k].sig}}catch(e){}
 const r=f.apply(this,arguments);
 try{if(H.pf.length>n0){const rec=H.pf.at(-1),st=thStage(rec.st);if(rec.prefs&&st&&st.prefs)rec.prefN=Object.keys(rec.prefs).filter(k=>st.prefs[k]&&st.prefs[k].sig!=sig0[k]);
  const R=ui.newRes,t=tf7Tag(rec);if(R)for(let i=r0;i<R.length;i++){const h=R[i];if(typeof h!='string')continue;
   if(h.includes('💗 Song Preference')&&!tf7PrefShow(rec)){R.splice(i--,1);continue}
   if(t&&h.includes('class="c thres"><b>🎭')&&!h.includes('thsptag'))R[i]=h.replace('class="c thres"><b>🎭',`class="c thres"><b>${t} 🎭`)}}}catch(e){console.error(e)}return r}}

// ---- 2 / 5. report sections shown once ----------------------------------------------------------------------------
const tf7SetSig=p=>(S.th.snap[p.snap]||[]).map(z=>z.k=='song'?'s'+z.song+(z.enc?'e':''):z.k+':'+(z.name||'')).join('|');
function tf7Prev(p){const P=thS().pf,i=P.indexOf(p);for(let j=i-1;j>=0;j--)if(P[j].st==p.st)return P[j];return null}
const tf7SetFirst=p=>{const q=tf7Prev(p);return!q||tf7SetSig(q)!=tf7SetSig(p)};
const tf7IsFinal=p=>{const st=thStage(p.st);return!!(st&&st.final!=null&&st.status!='active'&&st.status!='upcoming'&&thS().pf.filter(z=>z.st==p.st).at(-1)===p)};
const tf7PrefShow=p=>!!p&&(!tf7Prev(p)||tf7IsFinal(p));
function tf7PrefHtml(p){if(!p.prefs||!tf7PrefShow(p))return'';const first=!tf7Prev(p),st=thStage(p.st),P=[];
 (thS().snap[p.snap]||[]).forEach(z=>{if(z.k!='song'||p.prefs[z.song]==null)return;if(P.some(q=>q.song==z.song))return;const o=S.songs[z.song]||{},cur=st&&st.prefs&&st.prefs[z.song],old=st&&(st.prefH||[]).find(h=>h.song==z.song&&h.s==p.prefs[z.song]),d=cur&&cur.s==p.prefs[z.song]?cur:old;
  P.push(d?{...d,song:z.song,title:(d.title||o.title)+(d.unit?` · ${d.unit}`:'')}:{song:z.song,title:z.title||o.title,genre:o.genre,concept:o.concept,ly:o.lyT,s:p.prefs[z.song],why:''})});
 return P.length?muPrefList(P,first?'Scored at the first performance of this Stage, with the members who perform each song (Unit songs: the Unit only).':'Final performance of this Stage: how much the fans liked each song.'):''}

// ---- 7. Birthday Stage photos: Theater stage, everyone + one photo per extra song ------------------------------------
function tf7BdPics(rec){const sp=rec.sp;if(!sp||sp.kind!='bd')return[];const img=sp.img||null,P=(S.th&&S.th.czp)||{},items=(S.th.snap[rec.snap]||[]).filter(z=>z.k=='song');
 const cdOf=id=>{if(img&&img.m){const z=img.m.find(q=>q.id==id);if(z&&z.c!=null&&img.cd&&img.cd[z.c])return img.cd[z.c]}for(let i=items.length-1;i>=0;i--){const c=items[i].cm&&items[i].cm[id];if(c&&P[c])return P[c]}return null};
 const bd=(sp.mids||[]).filter(id=>get(id)),rnd=thSeed(rec.id+':bd'),songs=sp.songs||[];
 const all=[...new Set([...(rec.mem||[]),...songs.flatMap(z=>z.ids||[])])].filter(id=>get(id)),oth=all.filter(id=>!bd.includes(id)).sort((a,b)=>((get(b)||{}).pop||0)-((get(a)||{}).pop||0)),go=[...bd,...oth];
 const L=[];if(go.length)L.push({grp:1,o:go,rows:fxRows(go.length,Math.max(1,bd.length)),nc:Math.max(1,Math.min(2,bd.length)),mic:0,po:(()=>{const PZ=[0,1,2,6,8],q={};go.forEach(id=>q[id]=bd.includes(id)?3:PZ[Math.floor(rnd()*PZ.length)]);return id=>q[id]})(),hue:330,cap:`Group photo · ${go.length} members`});
 songs.forEach((z,i)=>{const ids=(z.ids||[]).filter(id=>get(id));if(!ids.length)return;const cen=z.center!=null&&ids.includes(z.center)?z.center:null,oo=[...(cen!=null?[cen]:[]),...ids.filter(id=>id!=cen).sort((a,b)=>((get(b)||{}).pop||0)-((get(a)||{}).pop||0))];const po={};ids.forEach(id=>po[id]=TH_MICP[Math.floor(rnd()*TH_MICP.length)]);
  L.push({o:oo,rows:fxRows(oo.length,1),nc:cen!=null&&ids.length>2?1:0,mic:1,po:id=>po[id],hue:Math.floor(rnd()*360),cap:`Encore +${i+1} “${z.title||''}”${z.unit?' · '+z.unit:''}${z.center!=null?` · Center ${(ctMem(z.center)||{}).name||''}`:''} · ${ids.length} member(s)`})});
 return L.map(p=>({...p,svg:()=>{let s=thStageSvg(++PTC[0],p.o,p.rows,p.nc,cdOf,p.po,p.mic,p.hue,null,p.grp?(m=>bd.includes(m.id)?bdCake(66):''):null);const t=`🎂 Happy Birthday ${sp.names?sp.names.join(' & '):''}!`;
  if(p.grp)s=s.replace(/<\/svg>$/,`<g><rect x="250" y="34" width="400" height="34" rx="17" fill="#fff" opacity=".88"/><text x="450" y="57" text-anchor="middle" font-size="18" font-weight="700" fill="#c2185b">${esc(t)}</text></g></svg>`);return s}}))}
function tf7BdHtml(rec){const L=tf7BdPics(rec);return L.length?`<div class="thpics tf7bd">${L.map(p=>`<figure class="thpic">${p.svg()}<figcaption>${esc(p.cap)}</figcaption></figure>`).join('')}</div>`:''}
{const f=bdPhotoOpen;bdPhotoOpen=function(pf,mid){const r=thS().pf.find(z=>z.id==pf);if(!r||!r.sp||r.sp.kind!='bd')return f.apply(this,arguments);
 ui.mod={t:'html',h:`<h2 class="ht">🎂 Birthday Stage — ${esc((r.sp.names||[]).join(', '))}</h2><p class="st">${wd(r.day)} · ${TH_SLOT[r.sl]} · ${esc(tf7Lab(r.k))} · “${esc(r.nm||'')}”</p>${tf7BdHtml(r)}<div class="row"><button class="b s" onclick="thOpenPerf('${r.id}')">Performance report</button></div>`};render()}}
// compact special-stage summary (no member / row list)
function tf7SpSum(p){const sp=p.sp,ss=sp.songs||[];return`<div class="c spsum"><h3>${TF7_SPT[sp.kind]||''} — ${esc((sp.names||[]).join(', '))}</h3><p class="st">${esc(sp.stno||'')} “${esc(sp.stage||'')}” + ${ss.length} extra song(s) at the end of the Encore: ${ss.map(z=>`“${esc(z.title)}”${z.center!=null?` (Center ${esc((ctMem(z.center)||{}).name||'')})`:''}`).join(', ')}</p></div>`}

// the performance report
{const f=thOpenPerf;thOpenPerf=function(id){const r=f.apply(this,arguments);try{const p=thS().pf.find(z=>z.id==id);if(!p||!ui.mod||ui.mod.t!='html')return r;let h=ui.mod.h;
 if(!tf7SetFirst(p)){const k=h.indexOf('<h3>Setlist as performed</h3>');if(k>=0){let e=h.indexOf('<h3>',k+10);const e2=h.indexOf('<div class="mupl"',k);if(e<0||(e2>=0&&e2<e))e=e2;h=h.slice(0,k)+(e<0?'':h.slice(e))}}
 if(h.includes('<div class="mupl"')){h=tf7Cut(h,'mupl');h+=tf7PrefHtml(p)}
 if(p.sp){h=tf7Cut(h,'bdph');h=tf7Cut(h,'c spsum');const add=(p.sp.kind=='bd'?tf7BdHtml(p):'')+tf7SpSum(p),k=h.indexOf('</h2>');h=k<0?add+h:h.slice(0,k+5)+add+h.slice(k+5);h=h.replace('</h2>',` ${tf7Tag(p)}</h2>`)}
 ui.mod.h=h;render()}catch(e){console.error(e)}return r}}

// ---- 10. Birthday Stage: one member, not on a Stage's first or final performance ----------------------------------------
function tf7BdBad(x){try{const T=thOf(x.k),s=thStageFor(T,x);if(!s)return'';
 if(x.fin||(T.trans&&T.trans.final==x.id)||(s.finAuto&&s.finAuto.show==x.id)||(T.rx&&((T.rx.final&&T.rx.final.id==x.id)||(T.rx.first&&T.rx.first.id==x.id))))return'final';
 if(!thS().pf.some(p=>p.st==s.id)){const first=thShowsOf(x.k).filter(z=>z.st=='sched'&&thStageFor(T,z)===s).sort(tf7Sl)[0];if(first&&first.id==x.id)return'first'}return''}catch(e){return''}}
const TF7_BDW={first:'the first performance of the Stage',final:'the final performance of the Stage'};
{const f=spOpts;spOpts=function(m,kind){const L=f.apply(this,arguments);return kind!='bd'?L:L.filter(x=>!tf7BdBad(x)&&(!x.sp||(x.sp.kind=='bd'&&x.sp.mids.every(i=>i==m.id))))}}
{const f=spSet;spSet=function(xid,mid,kind){if(kind=='bd'){const x=spShow(xid);if(x){if(x.sp&&x.sp.kind=='bd'&&x.sp.mids.some(i=>i!=mid))return toast('A Birthday Stage is for one member only. Choose another performance.','err');const b=tf7BdBad(x);if(b&&!(x.sp&&x.sp.mids.includes(mid)))return toast(`No Birthday Stage on ${TF7_BDW[b]}.`,'err')}}return f.apply(this,arguments)}}
{const f=spPlanMore;spPlanMore=function(xid){const x=spShow(xid);if(x&&x.sp&&x.sp.kind=='bd')return toast('A Birthday Stage is for one member only.','err');return f.apply(this,arguments)}}
// planned Birthday Stages that break the rules are moved (auto-schedule) or released with a notice
function tf7BdFix(){if(!S||!S.th)return;try{thAllK(()=>thS().sh.forEach(x=>{const sp=x.sp;if(!sp||sp.kind!='bd'||x.st!='sched')return;const bad=tf7BdBad(x),drop=bad?sp.mids.slice():sp.mids.slice(1);if(!drop.length)return;
 sp.mids=sp.mids.filter(i=>!drop.includes(i));if(!sp.mids.length){x.spOld=sp;delete x.sp}
 drop.forEach(id=>{const m=get(id);if(!m)return;m.bdA=null;let moved=null;try{if(bdAutoOn(m)){spAutoBd(m);moved=spCur(m,'bd')}}catch(e){}
  CTQ.push(`<div class="ctbd">🎂 Birthday Stage of <b>${esc(m.name)}</b> on ${jd(x.day)} ${bad?`moved: no Birthday Stage on ${TF7_BDW[bad]}`:'moved: one member per Birthday Stage'}. ${moved?`New date: ${wd(moved.day)} ${TH_SLOT[moved.sl]}.`:'Choose another performance in her profile (🎂 Plan Birthday Stage).'}</div>`)})}))}catch(e){console.error(e)}}

// ---- 11. Stage Archive: first and last performance only ---------------------------------------------------------------
function tf7PfCard(p,lbl){const M=(p.mem||[]).map(id=>ctMem(id)).filter(Boolean);return`<div class="c tf7pf"><div class="row"><b>${esc(lbl)}</b>${tf7Tag(p)}<span class="st">${wd(p.day)} · ${TH_SLOT[p.sl]} · ${p.att}/${p.cap} · ${M.length} member(s)</span><button class="b s" onclick="thOpenPerf('${p.id}')">Report</button></div>
 <div class="tf7mem">${M.map(m=>`<span class="tf7m">${ptc(m,40)}<small>${esc(m.stage||m.name)}</small></span>`).join('')}</div></div>`}
{const f=thOpenStage;thOpenStage=function(id){const r=f.apply(this,arguments);try{const s=thStage(id);if(!s||!ui.mod||ui.mod.t!='html')return r;let h=ui.mod.h;const k=h.indexOf('<h3>Performances</h3>');if(k<0)return r;const e=h.indexOf('<div class="row">',k);
 const P=thS().pf.filter(p=>p.st==s.id),a=P[0],b=P.at(-1),live=s.status=='active'||s.status=='upcoming';
 const body=`<h3>First &amp; ${live?'latest':'last'} performance</h3>${a?tf7PfCard(a,'First performance')+(b!==a?tf7PfCard(b,live?'Latest performance':'Final performance'):''):'<p class="st">Not performed yet.</p>'}`;
 ui.mod.h=h.slice(0,k)+body+(e<0?'':h.slice(e));render()}catch(e){console.error(e)}return r}}

// ---- 6. costume dropdowns: Single / Theater sections, by group, team and release order --------------------------------
function tf7CzMap(){const M=new Map(),PJ=new Map(),GL=(S.groups&&S.groups.length)?S.groups:[{id:null,name:''}],gi=new Map(GL.map((g,i)=>[g.id,i])),multi=GL.length>1;
 const put=(id,v)=>{if(id&&!M.has(id))M.set(id,v)},zone=(z,v)=>{if(!z)return;put(z.main,v);Object.values(z.mem||{}).forEach(mm=>{if(!mm)return;if(mm.d)put(mm.d,v);if(mm.own&&mm.own.p){const k=JSON.stringify(mm.own.p);if(!PJ.has(k))PJ.set(k,v)}})};
 GL.forEach(g=>{try{gsWith(g.id,()=>{const ord=new Map();(S.singles||[]).forEach((x,i)=>{[x.mainId,...(x.coup||[]),...((x.types||[]).flatMap(t=>t.songs||[]))].forEach(sid=>{if(sid!=null&&!ord.has(sid))ord.set(sid,i)})});(S.albums||[]).forEach((a,i)=>(a.trk||[]).forEach(t=>{if(t&&!ord.has(t.id))ord.set(t.id,1000+i)}));
  const hd=`Single costumes${multi?' · '+g.name:''}`;(S.singles||[]).forEach((x,i)=>zone(x.scz&&x.scz.cdz,{r:0,g:gi.get(g.id)|0,t:0,o:i,hd}));
  Object.values(S.songs||{}).forEach(o=>{if(o&&o.cdz)zone(o.cdz,{r:0,g:gi.get(g.id)|0,t:0,o:ord.has(o.id)?ord.get(o.id):(o.rel?5000:9000),hd})});
  if(S.pj&&S.pj.scz)zone(S.pj.scz.cdz,{r:0,g:gi.get(g.id)|0,t:0,o:9000,hd})})}catch(e){}});
 try{const K=thKeysAll(),ki=new Map(K.map((x,i)=>[x.key,i]));Object.values((S.th&&S.th.st)||{}).forEach(s=>{const k=K.find(x=>x.key==s.k),v={r:1,g:k?gi.get(k.gid)|0:99,t:ki.has(s.k)?ki.get(s.k):99,o:s.no||900,hd:`Theater costumes · ${multi&&k?(grp(k.gid)||{}).name+' · ':''}${k?k.label:thLabel(s.k)}`};
  [...(s.items||[]),...thEnc(s)].forEach(it=>{if(it&&it.cz&&it.cz.did)put(it.cz.did,v);if(it&&it.cdz)zone(it.cdz,v)});(czLib().ds||[]).forEach(d=>{if(d.stg==s.id)put(d.id,v)})})}catch(e){}
 return{M,PJ}}
function tf7CzInfo(d,C){return C.M.get(d.id)||(d.p&&C.PJ.get(JSON.stringify(d.p)))||{r:2,g:0,t:0,o:0,hd:'Other costumes'}}
function tf7CzGroup(sel){if(!sel||sel.dataset.czg)return;sel.dataset.czg=1;const id=v=>String(v).startsWith('lib:')?String(v).slice(4):String(v);
 const D=[...sel.options].filter(o=>o.parentNode===sel&&o.value&&!id(o.value).startsWith('mz~')&&czLib().ds.some(d=>d.id==id(o.value)));if(D.length<2)return;
 const C=tf7CzMap(),cur=sel.value,X=D.map((o,i)=>{const d=czD(id(o.value));return{o,i,f:tf7CzInfo(d,C),c:d.created|0}}).sort((a,b)=>a.f.r-b.f.r||a.f.g-b.f.g||a.f.t-b.f.t||a.f.o-b.f.o||a.c-b.c||a.i-b.i);
 const G=new Map();X.forEach(x=>{if(!G.has(x.f.hd))G.set(x.f.hd,[]);G.get(x.f.hd).push(x.o)});G.forEach((L,hd)=>{const og=document.createElement('optgroup');og.label=typeof tr=='function'?tr(hd):hd;L.forEach(o=>og.appendChild(o));sel.appendChild(og)});sel.value=cur}
{const f=gpOpen;gpOpen=function(sel){try{tf7CzGroup(sel)}catch(e){console.error(e)}return f.apply(this,arguments)}}

// ---- performance pictures: every row stands on the stage floor, wider spacing; optional prop (birthday cake) ----------
const stFoot=m=>{try{return evFoot({id:m.id,h:m.hue|0,ap:ap(m)})}catch(e){return 183}};
// one row: figure width, step between members and the feet line (back rows further up the floor, smaller)
function stRowLay(n,back,RN,W,front,depth,maxFw){const sc=1-back*.1,avail=(W-150)*(1-back*.05),fw=Math.min(maxFw*sc,avail/Math.max(1,n)*1.12),step=Math.min(avail/Math.max(1,n),fw*1.32),dy=RN>1?Math.min(40,depth/(RN-1)):0;return{fw,step,feet:front-back*dy}}
function stFig(m,x,feet,ww,inner){const k=ww/80,y=feet-(stFoot(m)+2)*k;return`<svg x="${(x-ww/2).toFixed(1)}" y="${y.toFixed(1)}" width="${ww.toFixed(1)}" height="${(ww*2.5).toFixed(1)}" viewBox="10 -2 80 200" overflow="visible">${inner}</svg>`}
thStageSvg=function(o,ids,rows,nc,cdOf,poseOf,mic,hue,w,deco){const L=ids.map(get).filter(Boolean),W=900,H=360,cen=new Set(ids.slice(0,nc));let fg='';const R=[];{let a=0;rows.forEach(c=>{R.push(L.slice(a,a+c));a+=c})}
 const RN=R.length,FRONT=H-20,DEPTH=RN>1?Math.min(40*(RN-1),130):0,FB=FRONT-DEPTH-26;
 R.slice().reverse().forEach((row,ri)=>{const back=RN-1-ri,Y=stRowLay(row.length,back,RN,W,FRONT,DEPTH,104),ord=thArr(row),x0=W/2-Y.step*(ord.length-1)/2+(back%2&&ord.length>1?0:0);
  ord.forEach((m,i)=>{const a=ap(m),c=back==0&&cen.has(m.id),ww=c?Y.fw*1.1:Y.fw,cd=cdOf(m.id),ps=poseOf(m.id);
   fg+=`<ellipse cx="${(x0+Y.step*i).toFixed(1)}" cy="${(Y.feet+1).toFixed(1)}" rx="${(ww*.3).toFixed(1)}" ry="${(ww*.06).toFixed(1)}" fill="#000" opacity=".28"/>`+stFig(m,x0+Y.step*i,Y.feet+(c?4:0),ww,fig(m,{pose:ps!=null?ps:c?3:0,of:a.of,oh:a.oh,ac:a.ac,ex:2,...(mic?{prop:1}:{}),...(cd?{cd}:{})})+(deco?deco(m)||'':''))})});
 const h=hue==null?320:hue,g='thbg'+(o||''),sp='thsp'+(o||''),fl='thfl'+(o||'');
 const planks=[...Array(11)].map((_,i)=>{const t=i/10,xb=70+(W-140)*t,xf=-60+(W+120)*t;return`<path d="M${xb.toFixed(0)} ${FB}L${xf.toFixed(0)} ${H}" stroke="#fff" stroke-opacity=".06" stroke-width="1.5"/>`}).join('')+[...Array(4)].map((_,i)=>{const y=FB+(H-FB)*(i+1)/5;return`<path d="M0 ${y.toFixed(0)}H${W}" stroke="#fff" stroke-opacity=".05"/>`}).join('');
 return`<svg class="thart" viewBox="0 0 ${W} ${H}" ${w?`width="${w}"`:''} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Stage"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${(h+280)%360},45%,18%)"/><stop offset="1" stop-color="hsl(${h},42%,52%)"/></linearGradient><radialGradient id="${sp}" cx=".5" cy=".2" r=".7"><stop offset="0" stop-color="#fff3c8" stop-opacity=".55"/><stop offset="1" stop-color="#fff3c8" stop-opacity="0"/></radialGradient><linearGradient id="${fl}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2350"/><stop offset="1" stop-color="#5a3a6e"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${g})"/>${mic?[0,1,2,3,4,5].map(i=>`<path d="M${120+i*132} 0L${70+i*132+((i*37)%60)} ${FB+10}H${150+i*132+((i*37)%60)}Z" fill="hsl(${(h+i*40)%360},90%,80%)" opacity=".14"/>`).join(''):''}<rect width="${W}" height="${H}" fill="url(#${sp})"/>
 <path d="M70 ${FB}H${W-70}L${W} ${H}H0Z" fill="url(#${fl})"/>${planks}<path d="M70 ${FB}H${W-70}" stroke="#e9c46a" stroke-width="2" opacity=".7"/><ellipse cx="${W/2}" cy="${(FB+H)/2+10}" rx="${W*.36}" ry="${(H-FB)*.42}" fill="#fff3c8" opacity=".09"/>
 <path d="M0 0H120Q90 180 60 ${H}H0Z" fill="#7a1f3d"/><path d="M${W} 0H${W-120}Q${W-90} 180 ${W-60} ${H}H${W}Z" fill="#7a1f3d"/><path d="M0 0H${W}V26Q${W/2} 50 0 26Z" fill="#9a2a4e"/>${[0,1,2,3,4].map(i=>`<circle cx="${180+i*135}" cy="14" r="5" fill="#ffe8a3"/>`).join('')}
 ${fg}<path d="M0 ${H-4}H${W}" stroke="#e9c46a" stroke-width="3"/>${L.length?'':`<text x="${W/2}" y="${H/2}" text-anchor="middle" fill="#ffe8a3" font-size="22">No performers yet</text>`}</svg>`};

// ---- Performance History: the report opened from a history list has no per-member section ------------------------------
{const f=thPfRow;thPfRow=function(p){return f.apply(this,arguments).replace(`onclick="thOpenPerf(`,`onclick="ui.thFromH=1;thOpenPerf(`)}}
{const f=thOpenPerf;thOpenPerf=function(id){const fromH=!!ui.thFromH;ui.thFromH=0;const r=f.apply(this,arguments);try{if(fromH&&ui.mod&&ui.mod.t=='html'){let h=ui.mod.h;const k=h.indexOf('<h3>Members</h3>');if(k>=0){const d=h.indexOf('<div class="thfx2"',k);const e=d>=0?tf7End(h,d):k+16;ui.mod.h=h.slice(0,k)+h.slice(e);render()}}}catch(e){console.error(e)}return r}}
// ---- Stage Archive: simple Setlist (Unit songs: members), no Units section ----------------------------------------------
function tf7SetHtml(items){let n=0,e=0,eh=0;const nm=id=>{const m=ctMem(id);return m?m.name:''};
 return`<ol class="thtl ro tf7set">${(items||[]).map(it=>{const hd=it.enc&&!eh++?'<li class="thench"><b>ENCORE</b><span class="st">アンコール</span></li>':'';
  if(it.k=='ov')return`<li class="thov"><span class="thnum">OV</span><b>${esc(it.name||'Overture')}</b></li>`;
  if(it.k=='mc')return`${hd}<li class="thmc"><span class="thnum">MC</span><b>${esc(it.name||'MC')}</b><span class="thmcm">${(it.mem||[]).map(id=>thMini(id,20)).join('')}</span></li>`;
  if(it.k!='song')return'';if(it.enc)e++;else n++;const unit=it.pt=='unit',cs=[it.center,it.c2].filter(x=>x!=null).map(nm).filter(Boolean);
  return`${hd}<li class="thsg ${it.enc?'enc':''}"><span class="thnum">${it.enc?'E'+String(e).padStart(2,'0'):'M'+String(n).padStart(2,'0')}</span><div class="thsgm"><b>${esc(it.title||(S.songs[it.song]||{}).title||'')}</b><small><span class="thptb ${unit?'unit':'team'}">${unit?'UNIT · '+esc((it.unit||{}).name||''):'Team'}</span>${cs.length?' Center '+esc(cs.join(' & ')):''}</small>${unit?`<div class="tf7mem tf7um">${(it.mem||[]).map(id=>{const m=ctMem(id);return m?`<span class="tf7m">${ptc(m,34)}<small>${esc(m.stage||m.name)}</small></span>`:''}).join('')}</div>`:''}</div></li>`}).join('')}</ol>`}
{const f=thOpenStage;thOpenStage=function(id){const r=f.apply(this,arguments);try{const s=thStage(id);if(!s||!ui.mod||ui.mod.t!='html')return r;let h=ui.mod.h;
 const mk=['<h3>Original Setlist (as debuted)</h3>','<h3>Setlist</h3>'].find(x=>h.includes(x));if(mk){const a=h.indexOf(mk)+mk.length,b=h.indexOf('<h3>',a);h=h.slice(0,a)+tf7SetHtml(s.orig||thSnapItems(s))+(b<0?'':h.slice(b))}
 const u=h.indexOf('<h3>Units');if(u>=0){const b=h.indexOf('<h3>',u+5);h=h.slice(0,u)+(b<0?'':h.slice(b))}
 h=h.replace(/<h3>📸 Debut performance · ([^<]*)<\/h3>/,'<h3>📸 First performance photos · $1</h3><p class="st">Costumes as worn on that day. Costume changes made later appear in the photos of later performances (Performance History).</p>');h=h.replace(/onclick="thOpenPerf\(/g,'onclick="ui.thFromH=1;thOpenPerf(');ui.mod.h=h;render()}catch(e){console.error(e)}return r}}
