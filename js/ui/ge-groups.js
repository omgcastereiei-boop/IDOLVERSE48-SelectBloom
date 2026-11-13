// =====================================================================================
//  General Election — archive layout, rank history per group, one election at a time,
//  sister-group rankings inside the Main Group election
// -------------------------------------------------------------------------------------
//  · Archive: rank rows show rank, face, name, "Group Team", votes (no preliminary rank, no mood);
//    from the 2nd election on, the change vs the previous election stands before the rank (▲ / ▼ / ＝,
//    NEW, Comeback). Preliminary Result 01 and 02 are shown at the bottom of each archived election.
//  · Rank changes, NEW / Comeback and reactions only compare elections of the SAME group.
//  · Only one group can run a General Election at a time (until its results are announced).
//  · Main Group election: optional sister-group rankings (e.g. "Group B TOP 16" = the 16 sister
//    members with the most votes). Each can become the Title Track Senbatsu of that group's next single.
//    The member history shows e.g. "Group A 1st General Election: TOP 16 (Senbatsu) (Group B TOP 1)".
// =====================================================================================
const geIdsHere=()=>new Set(((geS()||{}).list||[]).map(z=>z.id));
function geOnlyHere(m,fn){if(!m||!Array.isArray(m.geRec))return fn();const all=m.geRec,ids=geIdsHere();m.geRec=all.filter(h=>ids.has(h.eid));try{return fn()}finally{const add=m.geRec.filter(h=>!all.includes(h));m.geRec=[...all.filter(h=>!ids.has(h.eid)||m.geRec.includes(h)),...add]}}
// same-group history for NEW / Comeback and for reactions
{const f=geHistOf;geHistOf=function(e,r){const m=get(r.id);return m?geOnlyHere(m,()=>f.apply(this,arguments)):f.apply(this,arguments)}}
{const f=geSitOf;geSitOf=function(e,r,m){return geOnlyHere(m,()=>f.apply(this,arguments))}}
// which group held an election
function geGidOf(eid){for(const g of S.groups){const G=gsCtx(g.id,'ge');const e=((G&&G.list)||[]).find(z=>z.id==eid);if(e)return{g,e}}return null}
// ---- one election at a time ----------------------------------------------------------------------------------------
function geBusyElsewhere(){const ag=gsAg();for(const g of S.groups){if(g.id==ag)continue;const G=gsCtx(g.id,'ge'),c=G&&((G.list||[]).find(z=>z.id==G.cur));if(c&&c.st!='done')return{g,e:c}}return null}
{const f=geNew;geNew=function(){try{if(S.groups.length>1){const B=geBusyElsewhere();if(B)return toast(`${B.g.name} is running its ${B.e.name}. Only one group can hold a General Election at a time — wait until its results are announced.`,'err')}}catch(e){console.error(e)}return f.apply(this,arguments)}}
// ---- sister-group rankings in the Main Group election ----------------------------------------------------------------
const geIsMainE=e=>S.groups.length>1&&(e.gid??gsAg())==(gsMain()||{}).id;
function geSubOf(e,gid){const s=e.sub&&e.sub[gid];if(!s||!s.on||!e.final)return[];return e.final.rows.filter(r=>!r.withdrawn&&r.votes>0&&gsGid(get(r.id)||(S.alumni||[]).find(a=>a.id==r.id)||{group:null})==gid).sort((a,b)=>b.votes-a.votes||(a.rank||999)-(b.rank||999)).slice(0,s.n).map(r=>r.id)}
function geSubSet(gid,k,v){const e=geActive();if(!e||e.st!='setup')return toast('Sister-group rankings can be changed only during setup.','err');e.sub=e.sub||{};const s=e.sub[gid]=e.sub[gid]||{on:0,n:16,sen:1};
 if(k=='on')s.on=v?1:0;else if(k=='n')s.n=Math.max(1,Math.min(48,Math.round(+v)||16));else if(k=='sen')s.sen=v?1:0;render()}
function geSubHtml(e){if(!geIsMainE(e))return'';const ed=e.st=='setup',dis=ed?'':'disabled',sis=S.groups.slice(1);if(!sis.length)return'';
 return`<div class="c gesub"><h3>Sister-group rankings</h3><p class="st">Rank the members of a sister group among themselves in this election (by their votes here). The ranking can become the Title Track Senbatsu of that group's next single.</p>${sis.map(g=>{const s=(e.sub||{})[g.id]||{on:0,n:16,sen:1};return`<div class="row gesubr"><label class="plnm"><input type="checkbox" ${dis} ${s.on?'checked':''} onchange="geSubSet(${g.id},'on',this.checked)"> <b>${esc(g.name)}</b> TOP</label><input type="number" min="1" max="48" value="${s.n}" ${dis} style="width:64px" onchange="geSubSet(${g.id},'n',this.value)"><label class="plnm"><input type="checkbox" ${dis} ${s.sen?'checked':''} ${s.on?'':'disabled'} onchange="geSubSet(${g.id},'sen',this.checked)"> Title Track Senbatsu of ${esc(g.name)}'s next single</label></div>`}).join('')}</div>`}
{const f=geCosHtml;geCosHtml=function(e){const h=f.apply(this,arguments);try{if(e&&['setup','producing','voting','closed','scheduled'].includes(e.st))return geSubHtml(e)+h}catch(x){console.error(x)}return h}}
// ceremony: a slide per sister-group ranking after the Centers
{const f=geSteps;geSteps=function(e){const St=f.apply(this,arguments);try{if(!geIsMainE(e)||!e.sub)return St;const i=St.findIndex(s=>s.k=='centers');const add=S.groups.slice(1).filter(g=>geSubOf(e,g.id).length).map(g=>({k:'sub',gid:g.id}));if(add.length&&i>=0)St.splice(i+1,0,...add)}catch(x){console.error(x)}return St}}
{const f=geCerHtml;geCerHtml=function(e){let h=f.apply(this,arguments);try{const St=geSteps(e),i=Math.min(e.cp.i,St.length-1),s=St[i];if(s&&s.k=='sub'){const g=grp(s.gid),L=geSubOf(e,s.gid),sen=(e.sub[s.gid]||{}).sen;
 const body=`<div class="gestage"><div class="gekicker">${esc(g?g.name:'')} ranking</div><h2 class="geh">${esc(g?g.name:'')} TOP ${L.length}</h2><div class="gesubl">${L.map((id,k)=>{const r=geRow(e,id);return`<div class="gesubc ${k<3?'t'+(k+1):''}">${gePor(e.snap[id],0,56)}<b>TOP ${k+1}</b><span>${esc(r?r.stage:'')}</span><small>Overall TOP ${r&&r.rank?r.rank:'—'}</small></div>`}).join('')}</div>${sen?`<p class="gemc">These ${L.length} members become the Title Track Senbatsu of ${esc(g?g.name:'')}'s next single, with ${esc((geRow(e,L[0])||{}).stage||'')} as the Center.</p>`:''}</div>`;
 h=h.replace(/<div class="gebody" data-step="(\d+)">[\s\S]*?<\/div><div class="geact">[\s\S]*?<\/div><\/div>$/,(x,n)=>`<div class="gebody" data-step="${n}">${body}</div><div class="geact"><button class="geb p" onclick="geCerGo()">CONTINUE</button></div></div>`)}}catch(x){console.error(x)}return h}}
// after the ceremony: the sister rankings become that group's next Title Track Senbatsu
function geSubApply(){if(!S||S.groups.length<2)return;const main=gsMain();const G=gsCtx(main.id,'ge');((G&&G.list)||[]).filter(e=>e.st=='done'&&e.sub).forEach(e=>{e.subNext=e.subNext||{};S.groups.slice(1).forEach(g=>{const s=e.sub[g.id];if(!s||!s.on||!s.sen||e.subNext[g.id])return;const ids=geSubOf(e,g.id).filter(id=>get(id));if(!ids.length){e.subNext[g.id]={applied:1,none:1};return}
  gsWith(g.id,()=>{const p=S.pj;if(!p||p.status!='draft'||p.ge||p.geNext||p.geSub)return;const o=S.songs[p.mainId];if(!o||!o.fm)return;geSetLine(o,ids,e,{gi:0,name:'Senbatsu'});o.ge.name=`${g.name} TOP ${ids.length}`;p.geSub=e.id;e.subNext[g.id]={applied:1,day:S.day,pj:p.id};try{syncSaved()}catch(x){}toast(`${e.name}: ${g.name} TOP ${ids.length} is now the Title Track Senbatsu of ${g.name}'s next single.`)})})})}
{const f=geFinish;geFinish=function(e){const r=f.apply(this,arguments);try{geSubApply()}catch(x){console.error(x)}return r}}
{const f=newPj;newPj=function(){const r=f.apply(this,arguments);try{geSubApply()}catch(x){console.error(x)}return r}}
// ---- archive ---------------------------------------------------------------------------------------------------------
const geShortMeta=r=>{const m=get(r.id)||(S.alumni||[]).find(a=>a.id==r.id);if(!m)return esc(r.team||'');const g=grp(m.group),t=teamOf(m);let s=`${esc(g?g.name:'')} ${esc(t&&isAct(m)?t.name:TLm(m))}`;if(m.kn){const kg=grp(m.kn.gid),kt=kg&&(kg.teams||[]).find(x=>x.id==m.kn.tid);if(kg)s+=` / ${esc(kg.name)} ${esc(kt?kt.name:'')}`}return s};
function geArchRow(e,r,hasPrev,lab){const chg=hasPrev&&r.rank?geBadge(e,r):'';return`<div class="gear ${r.top?'top'+r.top:''} ${r.center?'cen':''}"><span class="geprk">${chg?`<i class="gearc">${chg}</i>`:''}${lab!=null?lab:r.rank?'TOP '+r.rank:'—'}</span>${gePor(e.snap[r.id],r.top,44)}<div><b>${esc(r.stage)}</b><small>${geShortMeta(r)}${r.center?' · '+esc(r.gname)+' Center':''}</small></div><span class="gepv">${r.votes.toLocaleString()}</span></div>`}
{const f=V.gearch;V.gearch=function(){let h=f.apply(this,arguments);try{const D=geS().list.filter(z=>z.st=='done');const e=D.find(z=>z.id==ui.gea);if(!e||!e.final)return h;GE_CTX=e;const R=geRanges(e),F=e.final,hasPrev=!!gePrevDone(e);
 let rows=e.groups.map((g,i)=>`<div class="gepgh"><b>${esc(g.name)}</b><span>TOP ${R[i][0]} – ${R[i][1]}</span></div>${F.rows.filter(r=>r.gi==i).map(r=>geArchRow(e,r,hasPrev)).join('')||'<p class="st">No members ranked in this group.</p>'}`).join('');
 if(geIsMainE(e))S.groups.slice(1).forEach(g=>{const L=geSubOf(e,g.id);if(L.length)rows+=`<div class="gepgh sub"><b>${esc(g.name)} TOP ${L.length}</b><span>${(e.sub[g.id]||{}).sen?'Title Track Senbatsu of the next single':''}</span></div>${L.map((id,k)=>geArchRow(e,geRow(e,id),false,'TOP '+(k+1))).join('')}`});
 if(F.rows.some(r=>!r.rank))rows+=`<div class="gepgh"><b>Unranked</b></div>${F.rows.filter(r=>!r.rank).map(r=>geArchRow(e,r,false)).join('')}`;
 const a=h.indexOf('<div class="gepgh">'),b=h.indexOf('<h3>Speeches &amp; reactions</h3>');if(a>0&&b>a)h=h.slice(0,a)+rows+h.slice(b);
 // preliminary results at the bottom
 const PL=(e.prelim||[]);if(PL.length){const g0=ui.gep;let pre='';try{PL.forEach((p,k)=>{ui.gep=k;pre+=gePrelimHtml(e).replace(/<button[^>]*onclick="[^"]*ui\.gep[^"]*"[^>]*>[\s\S]*?<\/button>/g,'').replace(/<select[^>]*ui\.gep[^>]*>[\s\S]*?<\/select>/g,'')})}finally{ui.gep=g0}const z=h.lastIndexOf('</div>');h=h.slice(0,z)+`<h3>Preliminary results</h3><div class="gearpre">${pre}</div>`+h.slice(z)}}catch(x){console.error(x)}return h}}
// ---- member history: "Group A 1st General Election: TOP 16 (Senbatsu) (Group B TOP 1)" ------------------------------------
{const f=profHtml;profHtml=function(m,cand){let h=f.apply(this,arguments);try{if(cand||!m||!(m.geRec||[]).length)return h;const a=h.indexOf('<div class="c gerec">');if(a<0)return h;const b=h.indexOf('</ul></div>',a);if(b<0)return h;
 const L=m.geRec.map(x=>({x,G:geGidOf(x.eid)})).sort((p,q)=>((p.G&&p.G.e.vEnd)||0)-((q.G&&q.G.e.vEnd)||0)||(p.x.ed||0)-(q.x.ed||0));
 const li=L.map(({x,G})=>{const gn=G&&S.groups.length>1?G.g.name+' ':'',sub=G&&geIsMainE(G.e)?(()=>{const id=gsGid(m),L2=geSubOf(G.e,id),k=L2.indexOf(m.id);return k>=0?` (${esc((grp(id)||{}).name||'')} TOP ${k+1})`:''})():'';
  return`<li><b>${esc(gn+x.name)}</b>: <span class="wlpos ${x.top?'center':x.rank?'front':'none'}">${x.rank?'TOP '+x.rank:'Unranked'}</span>${x.rank&&x.group?` (${esc(x.group)})`:''}${sub} <span class="st">· ${(x.votes||0).toLocaleString()} votes${x.change!=null?` · ${x.change>0?'▲'+x.change:x.change<0?'▼'+(-x.change):'＝'} vs previous`:''}${x.top?' · '+GE_CAPE[x.top].n:''}</span>${x.speech?`<br><q>${esc(x.speech)}</q>`:''}</li>`}).join('');
 h=h.slice(0,a)+`<div class="c gerec"><h3>General Elections</h3><ul class="wll">${li}`+h.slice(b)}catch(e){console.error(e)}return h}}
