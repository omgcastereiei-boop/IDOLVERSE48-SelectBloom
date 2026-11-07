// =====================================================================================
//  Theater — substitute formations, performance photos, Stage performance statistics
// -------------------------------------------------------------------------------------
//  · Substitutes (bench members, Trainees, manual swaps) can enter a song's formation in two
//    ways, chosen per performance (x.fmo) with a Stage default (s.subMode):
//      Keep original positions — nobody moves; the substitute takes the absent member's exact
//                                position (her Center spot too).
//      Shift positions         — the remaining main members move up to fill the gap (the next
//                                member becomes Center) and the substitutes take the last positions.
//    Only the performance is affected: the Stage's own formation is never changed.
//  · The performance snapshot keeps the actual positions, Centers and every replacement
//    (orig → substitute), so history shows who really performed where.
//  · Performance photos: one group photo of everyone who actually performed (in the Stage costume
//    of the first Team song) and one photo for every Unit song. They are drawn from the immutable
//    performance snapshot with a seed from the performance id, so they never change later.
//  · Member Profile → Stage Performance Statistics: counted from the completed performance records
//    (once per performance, songs / Encore / MC included), never from a separate counter.
// =====================================================================================
const TH_SUBM={keep:['Keep original positions','The substitute takes the absent member\'s exact position (her Center spot too); nobody else moves.'],shift:['Shift positions','The remaining members move up to fill the gap (the next member becomes Center); substitutes take the last positions.']};
const thSubMode=(x,s)=>(x&&(x.fmo=='shift'||x.fmo=='keep')?x.fmo:null)||(s&&s.subMode)||'keep';
// formation of one song in one performance, with substitutes
function thSubRes(s,it,x,out,sub,notes){const F=thForm(s,it),o=F.o.slice(),n=o.length,mode=thSubMode(x,s),pairs=[];let c=F.c!==undefined?F.c:thCen(s,it),c2=F.c2!==undefined?F.c2:null,ids;
 if(mode=='shift'){const main=o.filter(id=>!out.has(id)),subs=o.filter(id=>out.has(id)).map(id=>{if(sub[id])pairs.push([id,sub[id]]);return sub[id]}).filter(Boolean);ids=[...new Set([...main,...subs])];
  if(c!=null&&out.has(c))c=main[0]??ids[0]??null;if(c2!=null&&(out.has(c2)||c2==c))c2=main.find(id=>id!=c)??null}
 else{ids=[...new Set(o.map(id=>{if(!out.has(id))return id;if(sub[id])pairs.push([id,sub[id]]);return sub[id]||null}).filter(Boolean))];if(c!=null&&out.has(c))c=sub[c]||null;if(c2!=null&&out.has(c2))c2=sub[c2]||null}
 const c0=F.c!==undefined?F.c:thCen(s,it);if(x&&x.cen&&ids.includes(x.cen)&&x.cen!=c){if(c2==x.cen)c2=c;c=x.cen}
 if(ids.length<=2){c=null;c2=null}else{if(c==null||!ids.includes(c))c=ids[0];if(c2!=null&&(!ids.includes(c2)||c2==c))c2=null;
  // Centers in the Center spots (swap, so everyone keeps exactly one position)
  const put=(id,k)=>{const i=ids.indexOf(id);if(i>=0&&i!=k){[ids[i],ids[k]]=[ids[k],ids[i]]}};put(c,0);if(c2!=null)put(c2,1)}
 if(c0!=null&&c!=c0&&out.has(c0))notes.push(`Center of “${(S.songs[it.song]||{}).title}” ${c?`is ${(get(c)||{}).name}`:'—'} (${(get(c0)||{}).name} unavailable · ${TH_SUBM[mode][0]})`);
 return{ids,o:ids.slice(),c,c2,sub:pairs,mode}}
// snapshot: actual Centers and the replacements of every song
let TH_SUBRES=null;
{const f=thSnapItems;thSnapItems=function(s,res){const r=f.apply(this,arguments);try{if(res){const L=[...s.items,...thEncSeq(s)];r.forEach((x,i)=>{const it=L[i],R=it&&res[it.id];if(!R||x.k!='song'||!R.o)return;x.mem=R.o.slice();x.center=R.c;x.c2=(R.o.length>2&&R.c2!=null)?R.c2:null;x.sub=(R.sub||[]).map(p=>p.slice());x.subm=R.mode})}}catch(e){console.error(e)}return r}}
// performance record: the substitution mode and every replacement (original main member → actual performer)
{const f=thPerform;thPerform=function(x){const H=thS(),n0=H.pf.length,mode=x&&thSubMode(x,thStageFor(thOf(x.k),x));const r=f.apply(this,arguments);try{if(H.pf.length>n0){const rec=H.pf.at(-1);rec.subm=mode;rec.subs=(rec.rp||[]).map(([o,n])=>({o:+o,n:+n,on:(get(o)||{}).name||'',nn:(get(n)||{}).name||''}));
  if(typeof resNote=='function')resNote(`<div class="row"><button class="b s" onclick="thOpenPerf('${rec.id}')">📸 Photos &amp; performance report — ${esc(thNoTxt(thStage(rec.st)||{k:rec.k,no:rec.no}))}</button></div>`)}}catch(e){console.error(e)}return r}}
// ---- choose the substitute mode -------------------------------------------------------------------
function thSubSet(sid,mode){const x=thS().sh.find(z=>z.id==sid);if(!x||x.st!='sched'||!TH_SUBM[mode])return;x.fmo=mode;if(ui.mod&&ui.mod.t=='html'&&ui.thsl==sid)ui.mod.h=thShowLuHtml(x);render()}
function thSubDef(mode){const s=thEd();if(!s||!TH_SUBM[mode])return;s.subMode=mode;toast(`Substitutes: ${TH_SUBM[mode][0]} (default of this Stage).`);render()}
const thSubBtns=(x,s)=>{const m=thSubMode(x,s);return`<div class="row thsubm"><span class="st">Substitutes</span>${Object.entries(TH_SUBM).map(([k,[n,d]])=>`<button class="b s ${m==k?'on':''}" title="${esc(d)}" onclick="thSubSet('${x.id}','${k}')">${k=='keep'?'📌':'⤴'} ${n}</button>`).join('')}</div>`};
// planned formation of a performance (who stands where, substitutes included)
function thSubPlan(x){const T=thOf(x.k),s=thStageFor(T,x);if(!s)return null;const C=thCheck(x),out=new Set(C.miss.map(z=>z.id)),sub=C.rp,n=[];return{s,out,sub,R:thAll(s).map(it=>[it,thSubRes(s,it,x,out,sub,n)])}}
function thSubPlanHtml(x){const P=thSubPlan(x);if(!P||!P.out.size)return'';const subIds=new Set(Object.values(P.sub).map(Number));
 return`<div class="c thsubp"><h3>Formation for this performance</h3><p class="st">${esc(TH_SUBM[thSubMode(x,P.s)][1])}</p>${P.R.filter(([it,R])=>R.sub.length||R.ids.some(id=>subIds.has(id))).map(([it,R])=>{const F=thForm(P.s,it,R.ids),rows=F.rows&&F.rows.reduce((a,b)=>a+b,0)==R.o.length?F.rows:[R.o.length];let i=0;
  return`<div class="thsubs"><b>${thLbl(P.s,it)} ${esc((S.songs[it.song]||{}).title||'')}</b>${rows.map(k=>`<div class="thsubr">${R.o.slice(i,i+=k).map(id=>{const m=get(id),isS=subIds.has(id),orig=isS?R.sub.find(p=>p[1]==id):null;return`<span class="thsubf ${isS?'sub':''} ${id==R.c||id==R.c2?'cen':''}" title="${esc(m?m.name:'')}${orig?` (for ${esc((get(orig[0])||{}).name||'')})`:''}">${m?ptc(m,30):''}${isS?'<i>SUB</i>':''}${id==R.c||id==R.c2?'<i class="c">C</i>':''}</span>`}).join('')}</div>`).join('')}</div>`}).join('')||'<p class="st">No song changes.</p>'}</div>`}
{const f=thShowLuHtml;thShowLuHtml=function(x){let h=f.apply(this,arguments);try{ui.thsl=x.id;const s=thStageFor(thOf(x.k),x);if(s){const i=h.lastIndexOf('<div class="row"><button class="b s" onclick="thSwReset');const add=thSubBtns(x,s)+thSubPlanHtml(x);h=i>=0?h.slice(0,i)+add+h.slice(i):h+add}}catch(e){console.error(e)}return h}}
{const f=V.thsched;V.thsched=function(){let h=f.apply(this,arguments);try{h=h.replace(/<button class="b s" onclick="thMoveOpen\('([^']+)'\)">📅 Move<\/button>/g,(a,id)=>{const x=thS().sh.find(z=>z.id==id);if(!x)return a;const s=thStageFor(thOf(x.k),x);let miss=0;try{miss=thCheck(x).miss.length}catch(e){}return miss&&s?a+'</div>'+thSubBtns(x,s)+'<div class="row">':a})}catch(e){console.error(e)}return h}}
// Stage default (Units & Performers tab)
{const f=thLuHtml;thLuHtml=function(s){const h=f.apply(this,arguments);try{const m=s.subMode||'keep';return h.replace(/<\/div>$/,`<div class="row thsubm"><span class="st">When a member is replaced</span>${Object.entries(TH_SUBM).map(([k,[n,d]])=>`<button class="b s ${m==k?'on':''}" title="${esc(d)}" onclick="thSubDef('${k}')">${k=='keep'?'📌':'⤴'} ${n}</button>`).join('')}</div><p class="st">${esc(TH_SUBM[m][1])} You can change it for one performance in Schedule (✎ Lineup).</p></div>`)}catch(e){console.error(e)}return h}}
// ---- performance photos -----------------------------------------------------------------------------
const thSeed=str=>{let h=2166136261;for(const c of String(str)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return((h>>>0)%100000)/100000}};
function thPerfPics(rec){const items=(S.th.snap[rec.snap]||[]).filter(x=>x.k=='song');if(!items.length)return[];const rnd=thSeed(rec.id),pose=ids=>{const po={};ids.forEach(id=>po[id]=TH_MICP[Math.floor(rnd()*TH_MICP.length)]);return po};
 const used=new Set(items.flatMap(x=>x.mem||[])),act=(rec.mem||[]).filter(id=>used.has(id)),lead=items.find(x=>x.pt!='unit')||items[0],o=[...(lead.mem||[]).filter(id=>act.includes(id)),...act.filter(id=>!(lead.mem||[]).includes(id))],cm={};
 o.forEach(id=>{const x=[lead,...items].find(z=>(z.cm||{})[id]);if(x)cm[id]=x.cm[id]});const nc=o.length<=2?0:lead.c2!=null&&o[1]==lead.c2?2:1;
 const P=[{lbl:'Stage',title:rec.nm||'',grp:1,o,rows:(lead.mem||[]).length==o.length&&lead.rows?lead.rows.slice():fxRows(o.length,Math.max(1,nc)),nc,cm,po:pose(o),hue:Math.floor(rnd()*360),day:rec.day}];
 let n=0,e=0;items.forEach(x=>{const lbl=x.enc?'E'+String(++e).padStart(2,'0'):'M'+String(++n).padStart(2,'0');if(x.pt!='unit')return;const m=(x.mem||[]).slice();P.push({lbl,title:x.title||(S.songs[x.song]||{}).title||'',unit:x.unit?x.unit.name:'Unit',o:m,rows:(x.rows||[]).slice(),nc:m.length<=2?0:x.c2!=null?2:1,cm:{...(x.cm||{})},po:pose(m),hue:Math.floor(rnd()*360),day:rec.day,sub:(x.sub||[]).map(p=>p[1])})});return P}
function thPerfPicsHtml(rec){const L=thPerfPics(rec);if(!L.length)return'';const subs=new Set((rec.subs||[]).map(z=>z.n));
 return`<h3>📸 Performance photos</h3><div class="thpics">${L.map((p,i)=>`<figure class="thpic" onclick="thPerfPicBig('${rec.id}',${i})">${thPicSvg(p)}<figcaption>${p.grp?`<b>Stage</b> ${p.o.length} performer(s)${p.o.some(id=>subs.has(id))?` · incl. ${p.o.filter(id=>subs.has(id)).length} substitute(s)`:''}`:`<b>${p.lbl}</b> ${esc(p.title)} <span class="thptb unit">UNIT · ${esc(p.unit)}</span>`}</figcaption></figure>`).join('')}</div>`}
function thPerfPicBig(pid,i){const rec=thS().pf.find(z=>z.id==pid),p=rec&&thPerfPics(rec)[i];if(!p)return;const subs=new Set((rec.subs||[]).map(z=>z.n));ui.mod={t:'html',h:`<h2 class="ht">${p.grp?'📸 Stage photo':`${p.lbl} ${esc(p.title)}`}</h2><p class="st">${esc(rec.nm||'')} · ${wd(rec.day)} · ${TH_SLOT[rec.sl]}${p.unit?' · Unit '+esc(p.unit):''}</p><div class="thpicbig">${thPicSvg(p)}</div>
 <div class="row thpicm">${p.o.map(id=>{const m=get(id);return m?`<span class="thmfc ${subs.has(id)?'bt':''}">${esc(m.name)}${subs.has(id)?' · substitute':''}</span>`:''}).join('')}</div><div class="row"><button class="b s" onclick="thOpenPerf('${pid}')">◀ Performance report</button></div>`};render()}
// substitutions in the report: original main member → actual performer
function thSubsHtml(rec){const L=rec.subs||(rec.rp||[]).map(([o,n])=>({o:+o,n:+n}));if(!L.length)return'';return`<h3>Substitutions</h3><p class="st">${esc(TH_SUBM[rec.subm||'keep'][0])}: ${esc(TH_SUBM[rec.subm||'keep'][1])}</p><div class="thsubl">${L.map(z=>{const a=get(z.o),b=get(z.n);return`<div class="thsubi"><span>${a?ptc(a,30):''}<small>Main member</small><b>${esc(a?a.name:z.on||'#'+z.o)}</b></span><i>→</i><span>${b?ptc(b,30):''}<small>Performed</small><b>${esc(b?b.name:z.nn||'#'+z.n)}</b>${b&&b.status=='trainee'?'<small>Trainee</small>':''}</span></div>`}).join('')}</div>`}
{const f=thOpenPerf;thOpenPerf=function(id){const r=f.apply(this,arguments);try{const rec=thS().pf.find(z=>z.id==id);if(rec&&ui.mod&&ui.mod.h){const s=thStage(rec.st);let h=ui.mod.h;if(rec.pics&&s){const old=thPicsHtml(s);if(old)h=h.split(old).join('')}const add=thPerfPicsHtml(rec)+thSubsHtml(rec),k=h.indexOf('<h3>Setlist as performed</h3>');h=k>=0?h.slice(0,k)+add+h.slice(k):h+add;ui.mod.h=h;render()}}catch(e){console.error(e)}return r}}
// ---- Member Profile: Stage Performance Statistics (from the completed performance records) -----------
let THST_C={n:-1,id:null,m:null};
function thMemPerfStats(){const P=thS().pf;if(THST_C.n==P.length&&THST_C.id==(P.at(-1)||{}).id)return THST_C.m;const M={};
 P.forEach(p=>{const who=new Set(p.mem||[]);(S.th.snap[p.snap]||[]).forEach(x=>{if(x.k=='mc')(x.mem||[]).forEach(id=>who.add(id))});who.forEach(id=>{const z=M[id]=M[id]||{n:0,st:{},sub:0,first:p.day,last:p.day};z.n++;const k=p.st;(z.st[k]=z.st[k]||{n:0,nm:p.nm,k:p.k,no:p.no}).n++;z.last=Math.max(z.last,p.day);z.first=Math.min(z.first,p.day);if((p.rp||[]).some(r=>+r[1]==id))z.sub++})});
 THST_C={n:P.length,id:(P.at(-1)||{}).id,m:M};return M}
function thMemPerfHtml(m){const z=(thMemPerfStats()||{})[m.id];return`<div class="c thmps"><h3>Stage Performance Statistics</h3>${z?`<div class="gekg">${thKpi('Total Stage Performances',z.n.toLocaleString(),`completed performances · ${jd(z.first)} – ${jd(z.last)}`)}${thKpi('As a substitute',z.sub.toLocaleString(),'performances where she replaced a member')}</div>
 <div class="thmpl">${Object.entries(z.st).sort((a,b)=>b[1].n-a[1].n).map(([sid,v])=>`<div class="thmpr"><span><small>${esc(v.no?(typeof thLabelAny=='function'?thLabelAny(v.k):thLabel(v.k))+' · '+ordN(v.no)+' Stage':thLabel(v.k))}</small><b>${esc(v.nm||'')}</b></span><em>${v.n.toLocaleString()}</em></div>`).join('')}</div>`:'<p class="st">No completed Stage performances yet. Only performances that actually took place count (once per performance).</p>'}</div>`}
{const f=profHtml;profHtml=function(m,cand){const h=f.apply(this,arguments);try{if(!cand&&m&&S&&S.th&&(ui.ptab||'stats')=='stats')return h+thMemPerfHtml(m)}catch(e){console.error(e)}return h}}
