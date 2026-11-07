// =====================================================================================
//  Theater — Revival across groups · Trainee Stage final performance
// -------------------------------------------------------------------------------------
//  · Revival Stage between groups: any group can revive a debuted Stage of any other group
//    (Main ⇄ sister). Songs the reviving group does not have in its own Song Library are copied
//    into it as Theater versions (title, Genre, Concept, Lyrics; o.xFrom = original group & song);
//    the other group's songs, Stage and history never change. Costumes follow the original.
//  · Trainee Theater: the members of a Stage's debut lineup keep performing it even after a
//    promotion (graduated members leave their position empty, no replacement). When the group no
//    longer has enough Trainees for the Stage (fewer Trainees than its debut lineup — promotions or
//    graduations, not schedule conflicts), the Stage's final performance is scheduled automatically:
//    the last performance of the next 14 days (or the next one). Later performances are cancelled,
//    no new ones are added, and the Stage retires after its final performance.
// =====================================================================================
const thKAny=key=>(typeof thKeysAll=='function'?thKeysAll():thKeys()).find(K=>K.key==key)||null;
const thLabelAny=key=>{const K=thKAny(key);if(!K)return thLabel(key);const g=grp(K.gid);return S.groups.length>1&&K.gid!=gsAg()?`${g?g.name+' · ':''}${K.label}`:K.label};
function thAllK(fn){const p=GS_ALLK;GS_ALLK=1;try{return fn()}finally{GS_ALLK=p}}
// ---- 1. Revival between groups ------------------------------------------------------------------
// the Revival list shows the debuted Stages of every group
{const f=V.thstage;if(f)V.thstage=function(){let h=f.apply(this,arguments);try{const key=thCur();if(!key||S.groups.length<2)return h;const mine=new Set(thKeys().map(K=>K.key));
 const L=Object.values(thS().st).filter(s=>s.no&&!mine.has(s.k)&&thKAny(s.k)).sort((a,b)=>String(a.k).localeCompare(String(b.k))||a.no-b.no);if(!L.length)return h;
 const add=L.map(s=>`<div class="thstc ${s.status}"><span class="thno sm">${ordN(s.no)}</span><b>${esc(s.name)}</b><small>${esc(thLabelAny(s.k))} · ${s.status}</small><button class="b s p" onclick="thRevival('${s.id}')">✦ Revival Stage</button></div>`).join('');
 const i=h.indexOf('<div class="thsth">',h.indexOf('<div class="c threv">'));return i<0?h:h.slice(0,i+19)+add+h.slice(i+19)}catch(e){console.error(e);return h}}}
function thXgSong(srcGid,id,key){const S0=gsCtx(srcGid,'songs')||{},o=S0[id];if(!o)return null;const have=Object.values(S.songs||{}).find(z=>z.xFrom&&z.xFrom.gid==srcGid&&z.xFrom.id==id&&thSongOk(z,key));if(have)return have;
 const n=mkSong('Coupling',{title:o.title,genre:o.genre,concept:o.concept,th:{k:key,day:S.day,deb:null}});n.lyT=o.lyT||n.lyT;n.lyM=o.lyM||n.lyM;n.xFrom={gid:srcGid,id,title:o.title};return n}
{const f=thRevival;thRevival=function(sid){const src=thStage(sid),K=src&&thKAny(src.k),key=thCur(),tK=key&&thKAny(key);if(!src||!K||!tK||K.gid==tK.gid)return f.apply(this,arguments);
 let s;thAllK(()=>{s=f.apply(this,arguments)});if(!s)return s;let n=0;
 [...s.items,...thEncSeq(s)].forEach(it=>{if(it.k!='song')return;const o=S.songs[it.song];if(o&&thSongOk(o,key)&&!it.na)return;const c=thXgSong(K.gid,it.song,key);if(c){it.song=c.id;delete it.na;n++}});
 s.xg={gid:K.gid,gname:(grp(K.gid)||{}).name||''};thAllK(()=>{try{thRevCz(s)}catch(e){console.error(e)}});
 toast(`Revival Stage “${s.name}” created from ${(grp(K.gid)||{}).name||'another group'}'s “${src.name}”.${n?` ${n} song(s) were added to this group's Song Library as Theater versions.`:''} The original Stage and songs are unchanged.`);render();return s}}
thAdopt=thRevival;
// costumes of a cross-group Revival read the original group's Stage
{const f=thRevCz;thRevCz=function(s){return s&&s.xg?thAllK(()=>f.apply(this,arguments)):f.apply(this,arguments)}}
// ---- 2. Trainee Stage: promoted members keep performing; automatic final performance ---------------------
{const f=thBase;thBase=function(s){const r=f.apply(this,arguments);try{if(!s||!thTr(s.k)||s.status!='active'||!Array.isArray(s.debutLu))return r;const have=new Set(r.map(m=>m.id)),add=s.debutLu.map(get).filter(m=>m&&!have.has(m.id)&&m.status!='graduated'&&!(m.wel&&m.wel.leave));return add.length?[...r,...add]:r}catch(e){return r}}}
const thTrNeed=s=>Array.isArray(s.debutLu)&&s.debutLu.length?s.debutLu.length:0;
function thTrCheck(){if(!S||!S.th)return;thAllK(()=>{thKeysAll().filter(K=>K.kind=='tr').forEach(K=>{const T=thOf(K.key),s=thStage(T.active);if(!s||s.status!='active'||s.finAuto||T.trans)return;if(!Array.isArray(s.debutLu))s.debutLu=thBase(s).map(m=>m.id);
  const need=thTrNeed(s),have=thPool(K.key).filter(m=>m.status=='trainee').length;if(!need||have>=need)return;
  const L=thShowsOf(K.key).filter(x=>x.st=='sched'&&x.day>S.day).sort((a,b)=>a.day-b.day||(a.sl=='a'?-1:1)),soon=L.filter(x=>x.day<=S.day+14),fin=soon.at(-1)||L[0];if(!fin)return;
  s.finAuto={on:S.day,show:fin.id,day:fin.day,sl:fin.sl,have,need};fin.fin=1;L.filter(x=>x!==fin&&(x.day>fin.day||(x.day==fin.day&&fin.sl=='a'&&x.sl=='e'))).forEach(x=>{x.st='cancel';x.why=`Final performance of “${s.name}” on ${jd(fin.day)}`});
  thN(`<li>🎭 <b>${esc(thLabelAny(K.key))}</b> — only ${have} Trainee(s) are left for “${esc(s.name)}” (debut lineup ${need}). Its <b>final performance</b> is set for ${jd(fin.day)} (${TH_SLOT[fin.sl]}). Its members perform until then; promoted members stay in the lineup, graduated members leave their position empty.</li>`)})})}
// no new performances after the final one; the Stage retires after its final performance
{const f=thAdd;thAdd=function(key,d,sl,src){try{const T0=thOf(key);if(src!='custom'&&T0.finEnd!=null&&!T0.active&&!T0.trans)return'This theater has no Stage after the final performance.';const s=thStage(T0.active);if(s&&s.finAuto&&(d>s.finAuto.day||(d==s.finAuto.day&&s.finAuto.sl=='a'&&sl=='e')))return`The final performance of “${s.name}” is on ${jd(s.finAuto.day)}.`}catch(e){}return f.apply(this,arguments)}}
{const f=thPerform;thPerform=function(x){const fin=x&&x.fin&&x.st=='sched';const r=f.apply(this,arguments);try{if(fin){const T=thOf(x.k),s=thStage(T.active);if(s&&s.finAuto&&s.finAuto.show==x.id){s.status='retired';s.final=x.day;s.lastDay=x.day;s.runs=s.runs||[];const run=s.runs.at(-1);if(run&&run.to==null)run.to=x.day;T.active=null;T.finEnd=x.day;thShowsOf(x.k).forEach(z=>{if(z.st=='sched'&&z.day>=x.day&&z!==x){z.st='cancel';z.why=`“${s.name}” has ended`}});
  thN(`<li>🎭 <b>“${esc(s.name)}”</b> gave its final performance today (${x.st=='done'?'performed':'cancelled'}). The Stage is now retired; create or revive a new Stage for ${esc(thLabelAny(x.k))}.</li>`)}}}catch(e){console.error(e)}return r}}
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{thTrCheck()}catch(e){console.error(e)}return r}}
// Stage page: show the planned final performance
{const f=V.thset;V.thset=function(){let h=f.apply(this,arguments);try{const s=thEd();if(s&&s.finAuto&&s.status=='active')h=h.replace('<div class="row thtabs">',`<div class="row thfin"><span class="tag warn">FINAL PERFORMANCE</span><span class="st">${jd(s.finAuto.day)} · ${TH_SLOT[s.finAuto.sl]} — only ${s.finAuto.have} Trainee(s) left (debut lineup ${s.finAuto.need}).</span></div><div class="row thtabs">`)}catch(e){console.error(e)}return h}}
// a new or revived Stage restarts the automatic schedule of a theater whose Stage ended
['thNewStage','thRevival'].forEach(fn=>{const f=window[fn];if(typeof f!='function')return;window[fn]=function(){const r=f.apply(this,arguments);try{const k=thCur();if(k){const T=thOf(k);if(T.finEnd!=null)delete T.finEnd}}catch(e){}return r}});thAdopt=thRevival;
