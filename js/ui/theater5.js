// =====================================================================================
//  Theater update — default Center, MC participants, Encore MC, performance count,
//  scheduled Formation / Center changes for a running Stage
// -------------------------------------------------------------------------------------
//  · Default Center: a song without its own Center uses the Stage Setlist Center (when she
//    performs that song). The Center picker opens with it selected; choosing someone else only
//    changes that song, unless the player also saves it as the Setlist Center.
//  · MC participants: Choose members (it.mem), All Members (it.mm='all': every available full
//    member of the Team) or Team (it.mm='team': everyone performing that show). Encore MC
//    segments are regular MC items stored in the Encore list (s.enc.items, k:'mc').
//  · Performance count: s.perfs (completed performances only; each round counts). Each
//    performance record keeps its number (pf.n).
//  · Running Stage: Formation / Center edits are a draft (s.cfgEd) until the player schedules
//    them for a performance at least 7 days later (s.cfgQ). Earlier performances keep the
//    previous configuration; from that performance on the new one is used. Every change is kept
//    in s.cfgH. The Stage, its Setlist, its history and its counter are unchanged.
// =====================================================================================
const TH5_SL={a:0,e:1};
const thClone=v=>v==null?null:JSON.parse(JSON.stringify(v));
// ---- 1. default Center = Stage Setlist Center -------------------------------------------------
{const f=thCen;thCen=function(s,it){const r=f.apply(this,arguments);if(r!=null||!s||!it||it.center!=null||s.center==null)return r;const M=thMem(s,it);return M.length>2&&M.includes(s.center)?s.center:r}}
{const f=thCenPickHtml;thCenPickHtml=function(){let h=f.apply(this,arguments);try{const c=ui.thcp2,s=thEd();if(!c||!s||c.id=='g'||c.slot==2)return h;const it=thItem(c.id);if(!it)return h;const M=thMem(s,it),sc=get(s.center);
 let info='';if(!sc)info=`<p class="st">No Stage Setlist Center is set. Choose a Center for this song, or set the Setlist Center in the Formation tab.</p>`;
 else if(!M.includes(sc.id))info=`<p class="st thwarn">⚠ The Stage Setlist Center ${esc(sc.name)} does not perform this song, so she cannot be its Center. Choose another member below.</p>`;
 else{const nx=thShowsOf(s.k).filter(x=>x.st=='sched'&&thStageFor(thOf(s.k),x)===s).sort((a,b)=>a.day-b.day)[0],why=nx?thWhy(sc,nx):'';info=`<p class="st">Default: the Stage Setlist Center <b>${esc(sc.name)}</b>${it.center==null?' (currently used)':''}.${why?` <span class="thwarn">⚠ She is unavailable for the next performance (${jd(nx.day)}: ${esc(why)}); a replacement Center is chosen automatically for that day, or choose another member.</span>`:''}</p>`}
 const sv=`<label class="st thcsv"><input type="checkbox" ${c.sv?'checked':''} onchange="ui.thcp2.sv=this.checked"> Also save my choice as the Stage Setlist Center</label>`;
 const use=sc&&M.includes(sc.id)&&it.center!=null?`<button class="b s" onclick="thCenSet(null)">Use the Setlist Center (${esc(sc.name)})</button>`:'';
 h=h.replace(/<div class="row">(<button class="b s" onclick="thCenSet\(null\)">Use the Setlist Center<\/button>)?<\/div>/,`${info}<div class="row">${use}${sv}</div>`);
 if(it.center==null&&sc&&M.includes(sc.id))h=h.replace('<span class="tag thcur">★ Current</span>','<span class="tag thcur">★ Current · Setlist Center</span>')}catch(e){console.error(e)}return h}}
{const f=thCenSet;thCenSet=function(mid){const c=ui.thcp2,s=thEd();const save=c&&c.sv&&c.id!='g'&&c.slot!=2&&mid!=null;if(c&&c.id!='g'&&c.slot!=2&&mid==null){const it=thItem(c.id);if(it){it.center=null;ui.mod=null;ui.thcp2=null;return render()}}
 const r=f.apply(this,arguments);if(save&&s){s.center=+mid;toast(`${(get(mid)||{}).name||'She'} is now also the Stage Setlist Center.`)}return r}}
// ---- 2. MC participants: Choose members / All Members / Team; Encore MC ---------------------------
const thMcAll=s=>s.items.filter(i=>i.k=='mc').concat(thEncO(s).items.filter(i=>i.k=='mc'));
function thMcIds(s,it,x,res){const ok=m=>!x||!thWhy(m,x);if(it.mm=='team'){const P=res?[...new Set(Object.values(res).flatMap(r=>r.ids||[]))]:thBase(s).map(m=>m.id);return P.filter(id=>{const m=get(id);return m&&ok(m)})}
 if(it.mm=='all')return thPool(s.k).filter(m=>m.status!='trainee'&&ok(m)).map(m=>m.id);return(it.mem||[]).filter(id=>{const m=get(id);return m&&ok(m)})}
const TH_MCL={all:'All Members',team:'Team'};
function thMcMode(id,mm){const s=thEd(),it=thItem(id);if(!thGuardEdit(s)||!it||it.k!='mc')return;if(mm=='all'||mm=='team')it.mm=mm;else delete it.mm;render()}
{const f=thMemTab;thMemTab=function(s){let h=f.apply(this,arguments);try{const i=h.indexOf('<div class="c"><h3>MC participants</h3>');if(i>=0)h=h.slice(0,i);const L=thMcAll(s);if(!L.length)return h;const P=thPool(s.k),ret=s.status=='retired'||s.status=='archived',dis=ret?'disabled':'',E=thEncO(s).items;
 return h+`<div class="c thmcp"><h3>MC participants</h3><p class="st"><b>All Members</b>: every full member of ${esc(thLabel(s.k))} who is available that day. <b>Team</b>: everyone performing that show. <b>Choose members</b>: only the members you pick. Unavailable members never take part.</p>${L.map(it=>{const enc=E.includes(it),ids=thMcIds(s,it);return`<div class="thmcr"><div class="row"><b>${enc?'<span class="tag">Encore</span> ':''}${esc(it.name)}</b>${['all','team',''].map(k=>`<button class="b s ${(it.mm||'')==k?'on':''}" ${dis} onclick="thMcMode('${it.id}','${k}')">${k?TH_MCL[k]:'Choose members'}</button>`).join('')}<span class="st">${ids.length} member(s)</span></div>
  ${it.mm?`<span class="thmcm">${ids.slice(0,16).map(id=>thMini(id,22)).join('')}${ids.length>16?`<i>+${ids.length-16}</i>`:''}</span>`:`<div class="row">${P.map(m=>`<button class="b s ${(it.mem||[]).includes(m.id)?'on':''}" ${dis} onclick="thMcMem('${it.id}',${m.id})">${esc(m.name)}${m.status=='trainee'?' (Trainee)':''}</button>`).join('')}</div>`}</div>`}).join('')}</div>`}catch(e){console.error(e)}return h}}
// timeline / Encore list: show the participants of All Members / Team MCs
function thMcView(s,fn){const L=thMcAll(s).filter(it=>it.mm),keep=L.map(it=>it.mem);L.forEach(it=>{it.mem=thMcIds(s,it)});let h;try{h=fn()}finally{L.forEach((it,i)=>{it.mem=keep[i]})}
 L.forEach(it=>{h=h.split(`onchange="thMcSet('${it.id}','desc',this.value)"><span class="thmcm">`).join(`onchange="thMcSet('${it.id}','desc',this.value)"><span class="tag thmct">${TH_MCL[it.mm]}</span><span class="thmcm">`)});return h}
{const f=thTimeline;thTimeline=function(s){const a=arguments,t=this;return s?thMcView(s,()=>f.apply(t,a)):f.apply(t,a)}}
{const f=thEncHtml;thEncHtml=function(s){const a=arguments,t=this;return s?thMcView(s,()=>f.apply(t,a)):f.apply(t,a)}}
// performance: the MC participants of that show are recorded in its Setlist snapshot
let TH5_X=null;
{const f=thSnapItems;thSnapItems=function(s,res){const r=f.apply(this,arguments);try{if(res&&TH5_X){const L=[...s.items,...thEncSeq(s)];let k=0;r.forEach((x,i)=>{if(x.k!='mc')return;const it=L[i];if(it&&it.k=='mc')x.mem=thMcIds(s,it,TH5_X,res),x.mm=it.mm||null})}}catch(e){console.error(e)}return r}}
// ---- 3. Formation / Center configuration of a Stage --------------------------------------------------
function thCfgSnap(s){return{center:s.center??null,center2:s.center2??null,cmode:s.cmode??null,fmode:s.fmode??null,gform:thClone(s.gform),it:Object.fromEntries([...s.items,...thEncO(s).items].filter(i=>i.k=='song').map(i=>[i.id,{form:thClone(i.form),fo:i.fo??null,center:i.center??null,center2:i.center2??null}]))}}
function thCfgApply(s,c){if(!c)return;s.center=c.center;s.center2=c.center2;if(c.cmode!=null)s.cmode=c.cmode;if(c.fmode!=null)s.fmode=c.fmode;s.gform=thClone(c.gform);[...s.items,...thEncO(s).items].forEach(i=>{const v=c.it&&c.it[i.id];if(i.k!='song'||!v)return;i.form=thClone(v.form);i.fo=v.fo;i.center=v.center;i.center2=v.center2})}
const thCfgJ=c=>JSON.stringify(c);
const thCfgDirty=s=>!!(s&&s.cfgEd&&thCfgJ(thCfgSnap(s))!=thCfgJ(s.cfgEd.base));
const thCfgNow=s=>s.cfgEd?s.cfgEd.base:thCfgSnap(s); // the configuration performances use now
const thSlotLe=(a,b)=>a.day<b.day||(a.day==b.day&&(TH5_SL[a.sl]|0)<=(TH5_SL[b.sl]|0));
// what changed between two configurations (for the Stage details)
function thCfgDiff(s,a,b){const out=[],nm=id=>(get(id)||{}).name||'none';if(!a||!b)return out;if(a.center!=b.center)out.push(`Setlist Center ${nm(a.center)} → ${nm(b.center)}`);if(a.center2!=b.center2)out.push(`2nd Center ${nm(a.center2)} → ${nm(b.center2)}`);
 if(a.fmode!=b.fmode)out.push(b.fmode=='song'?'formation per song':'one formation for every song');if(thCfgJ(a.gform)!=thCfgJ(b.gform))out.push('Stage formation');
 thAll(s).forEach(it=>{const x=a.it[it.id],y=b.it[it.id];if(!x||!y)return;const d=[];if(x.center!=y.center)d.push(`Center ${nm(x.center)} → ${nm(y.center)}`);if(x.center2!=y.center2)d.push(`2nd Center ${nm(x.center2)} → ${nm(y.center2)}`);if(thCfgJ(x.form)!=thCfgJ(y.form)||x.fo!=y.fo)d.push('formation');if(d.length)out.push(`${thLbl(s,it)}: ${d.join(', ')}`)});return out}
// performances of this Stage that a change may start from (at least 7 days after today)
function thCfgShows(s){const T=thOf(s.k);return thShowsOf(s.k).filter(x=>x.st=='sched'&&x.day>=S.day+7&&thStageFor(T,x)===s).sort((a,b)=>a.day-b.day||(TH5_SL[a.sl]-TH5_SL[b.sl]))}
function thCfgSchedule(sid){const s=thStage(sid);if(!s||s.status!='active'||!thCfgDirty(s))return toast('There are no unsaved Formation or Center changes.','err');const sel=document.getElementById('thcfgd'),v=(sel&&sel.value)||ui.thcfgd||'',x=thS().sh.find(z=>z.id==v);
 if(!x||x.st!='sched'||thStageFor(thOf(s.k),x)!==s)return toast('Choose the first performance that should use the new Formation / Center.','err');if(x.day<S.day+7)return toast('The new configuration can start at the earliest 7 days from today.','err');
 const base=s.cfgEd.base,cfg=thCfgSnap(s);s.cfgQ=(s.cfgQ||[]);s.cfgQ.push({id:'cf'+(++thS().seq),eff:{day:x.day,sl:x.sl},show:x.id,made:S.day,cfg,prev:base});s.cfgQ.sort((a,b)=>thSlotLe(a.eff,b.eff)?-1:1);thCfgApply(s,base);delete s.cfgEd;ui.thcfgd=null;
 toast(`New Formation / Center saved. It starts with the performance on ${jd(x.day)} (${TH_SLOT[x.sl]}); earlier performances keep the current one.`);render()}
function thCfgDiscard(sid){const s=thStage(sid);if(!s||!s.cfgEd)return;ask('Discard the unsaved Formation / Center changes? The Stage keeps its current configuration.',()=>{thCfgApply(s,s.cfgEd.base);delete s.cfgEd;render()},'Discard')}
function thCfgCancel(sid,qid){const s=thStage(sid);if(!s)return;const q=(s.cfgQ||[]).find(z=>z.id==qid);if(!q)return;ask(`Cancel the Formation / Center change planned for ${jd(q.eff.day)}?`,()=>{s.cfgQ=s.cfgQ.filter(z=>z!==q);(s.cfgX=s.cfgX||[]).push({...q,cancelled:S.day,cfg:undefined,prev:undefined});render()},'Cancel change')}
// before every performance: changes that are due take effect; an unsaved draft is never used
{const f=thPerform;thPerform=function(x){if(!x||x.st!='sched')return f.apply(this,arguments);let s=null,draft=null;try{s=thStageFor(thOf(x.k),x);if(s){
  const due=(s.cfgQ||[]).filter(q=>thSlotLe(q.eff,x));if(due.length){s.cfgH=s.cfgH||[];if(!s.cfgH.length)s.cfgH.push({from:{day:s.debut??x.day,sl:'a'},cfg:thClone(due[0].prev),made:s.debut??null,first:1});
   due.forEach(q=>{const dr=thCfgDirty(s);if(dr)s.cfgEd.base=thClone(q.cfg);else{thCfgApply(s,q.cfg);if(s.cfgEd)s.cfgEd.base=thCfgSnap(s)}s.cfgH.push({id:q.id,from:q.eff,applied:{day:x.day,sl:x.sl},made:q.made,cfg:q.cfg,prev:q.prev});thN(`<li>🎭 <b>${esc(thNoTxt(s))}</b> — the new Formation / Center planned on ${jd(q.made)} is used from today's performance (${jd(x.day)}, ${TH_SLOT[x.sl]}).</li>`)});s.cfgQ=s.cfgQ.filter(q=>!due.includes(q))}
  if(thCfgDirty(s)){draft=thCfgSnap(s);thCfgApply(s,s.cfgEd.base)}}}catch(e){console.error(e)}
 TH5_X=x;let r;try{r=f.apply(this,arguments)}finally{TH5_X=null;try{if(draft)thCfgApply(s,draft)}catch(e){console.error(e)}}
 try{if(s&&x.st=='done'&&x.perf){const p=thS().pf.find(z=>z.id==x.perf);if(p&&p.n==null)p.n=s.perfs|0}}catch(e){}return r}}
// ---- 4. Stage details ---------------------------------------------------------------------------------
function thCfgCard(s){if(!s||!s.no)return'';const T=thOf(s.k),cur=thCfgNow(s),nm=id=>{const m=get(id);return m?esc(m.name):'—'},Q=s.cfgQ||[],H=(s.cfgH||[]).filter(h=>!h.first),dirty=s.status=='active'&&thCfgDirty(s),SH=dirty?thCfgShows(s):[];
 const fm=cur.fmode=='song'?'A formation for each song':'One formation for every song',rows=cur.gform&&cur.gform.rows?cur.gform.rows.filter(Boolean).join('-'):'';
 return`<div class="c thcfg"><div class="row"><h3>${esc(thNoTxt(s))} — ${(s.perfs|0).toLocaleString()} Performances</h3><span class="st">completed performances of this Stage (cancelled ones are not counted)</span></div>
 <table class="gskv"><tr><th>Dance Formation</th><td>${fm}${rows?` · rows ${rows}`:''}</td></tr><tr><th>Setlist Center</th><td>${cur.center!=null?thMini(cur.center,22)+' '+nm(cur.center):'—'}${cur.center2!=null?` &amp; ${thMini(cur.center2,22)} ${nm(cur.center2)}`:''}</td></tr>
 <tr><th>Planned changes</th><td>${Q.length?`<ul class="ms">${Q.map(q=>`<li><b>from ${jd(q.eff.day)} (${TH_SLOT[q.eff.sl]})</b> · saved ${jd(q.made)} · ${esc(thCfgDiff(s,q.prev,q.cfg).join('; ')||'no visible change')} ${s.status=='active'?`<button class="b s" onclick="thCfgCancel('${s.id}','${q.id}')">Cancel</button>`:''}</li>`).join('')}</ul>`:'none'}</td></tr></table>
 ${s.status=='active'&&!dirty?'<p class="st">Changes to the Dance Formation or Centers of this running Stage start with a performance you choose, at least 7 days later.</p>':''}${dirty?`<div class="gswarn thcfgw"><b>✎ Unsaved Formation / Center changes</b><p class="st">${esc(thCfgDiff(s,s.cfgEd.base,thCfgSnap(s)).join('; ')||'Positions changed.')}</p><p class="st">This Stage is running: changes cannot be used right away. Choose the first performance that should use them, at least 7 days from today (${jd(S.day+7)} or later). Performances before it keep the current Formation and Center.</p>
  ${SH.length?`<div class="row"><select id="thcfgd" onchange="ui.thcfgd=this.value">${SH.map(x=>`<option value="${x.id}" ${ui.thcfgd==x.id?'selected':''}>${wd(x.day)} · ${TH_SLOT[x.sl]}</option>`).join('')}</select><button class="b p" onclick="thCfgSchedule('${s.id}')">Save for this performance</button><button class="b s" onclick="thCfgDiscard('${s.id}')">Discard changes</button></div>`:`<p class="st thwarn">No performance of this Stage is scheduled 7 or more days from today. Add performances in the Schedule first.</p><div class="row"><button class="b s" onclick="thCfgDiscard('${s.id}')">Discard changes</button></div>`}</div>`:''}
 ${H.length?`<details><summary class="st">Configuration history (${H.length})</summary><ul class="ms">${H.slice().reverse().map(h=>`<li>from ${jd(h.from.day)} (${TH_SLOT[h.from.sl]}) · saved ${jd(h.made)} · ${esc(thCfgDiff(s,h.prev,h.cfg).join('; ')||'—')}</li>`).join('')}</ul><p class="st">Past performances keep the Formation and Center they were performed with (Performance History).</p></details>`:''}</div>`}
{const f=V.thset;V.thset=function(){let h=f.apply(this,arguments);try{const s=thEd();if(s&&s.status=='active'&&!s.cfgEd)s.cfgEd={base:thCfgSnap(s),at:S.day};if(s&&s.cfgEd&&s.status!='active')delete s.cfgEd;const c=thCfgCard(s);if(c){const i=h.indexOf('<div class="row thtabs">');h=i>=0?h.slice(0,i)+c+h.slice(i):h+c}}catch(e){console.error(e)}return h}}
