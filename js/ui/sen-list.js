// =====================================================================================
//  Song Senbatsu list — Results and release history
// -------------------------------------------------------------------------------------
//  · The release Results, the Discography (past singles) and the Song Library song details show
//    each song's Senbatsu as a list grouped by Group and Team, names in alphabetical order.
//    Centers are marked (bold ★). For the Title Track / Main Song, First Time Senbatsu members
//    of that group are marked too.
//  · Dance Positions stay available, in their own section separate from the list.
// =====================================================================================
const slMem=id=>get(id)||(S.alumni||[]).find(m=>m.id==id)||null;
function slIds(o){return((o.lib?o.lib.members:o.slots)||[]).filter(Boolean)}
function slCen(o){const F=plForm(o).filter(s=>s.c&&s.m).map(s=>s.m);return[...new Set([...((o.lib?o.lib.centers:o.centers)||[]),...F])].filter(Boolean)}
// which group's single a song belongs to, and the songs's single
function slSingleOf(o){if(!o)return null;for(const g of S.groups){const L=gsCtx(g.id,'singles')||[];const x=L.find(x=>x.mainId==o.id)||L.find(x=>(x.types||[]).some(t=>(t.songs||[]).includes(o.id)));if(x)return{x,gid:g.id,L}}return null}
// First Time Senbatsu: not in the Title Track Senbatsu of any earlier single of the same group
function slFirst(x,L){if(!x||!L)return new Set();const i=L.indexOf(x),prev=new Set(L.slice(0,i<0?L.length:i).map(y=>y.rid)),mn=S.songs[x.mainId]||{};const ids=(x.tt&&x.tt.members)||slIds(mn);
 return new Set(ids.filter(id=>{const m=slMem(id);return m&&!(m.hist||[]).some(h=>h.cat=='main'&&prev.has(h.rid))}))}
function slListHtml(o,opt={}){const ids=slIds(o);if(!ids.length)return'<p class="st">No Senbatsu yet.</p>';const cen=new Set(slCen(o)),first=opt.first||new Set(),G=new Map();
 ids.forEach(id=>{const m=slMem(id);if(!m)return;const g=grp(m.group),t=teamOf(m),gk=g?g.id:'_',tk=m.status=='graduated'?'_grad':t?t.id:'_tr';if(!G.has(gk))G.set(gk,{g,T:new Map()});const T=G.get(gk).T;
  if(!T.has(tk))T.set(tk,{n:tk=='_grad'?'Graduated':t?t.name:TL(),c:t&&t.color||'#c9b8e8',i:t&&g?g.teams.indexOf(t):99,L:[]});T.get(tk).L.push(m)});
 const gOrd=[...G.values()].sort((a,b)=>(a.g?S.groups.indexOf(a.g):99)-(b.g?S.groups.indexOf(b.g):99)),many=gOrd.length>1;
 const nm=m=>`<span class="sln${cen.has(m.id)?" slcen":""}">${cen.has(m.id)?'★ ':''}${esc(m.name)}${first.has(m.id)?' <i class="slft">First Time</i>':''}</span>`;
 const body=gOrd.map(({g,T})=>`${many||opt.gh?`<div class="slg">${esc(g?g.name:'—')}</div>`:''}<ul class="sll">${[...T.values()].sort((a,b)=>a.i-b.i).map(t=>`<li style="--tc:${t.c}"><b>${esc(t.n)}</b>: ${t.L.sort((a,b)=>a.name.localeCompare(b.name)).map(nm).join(', ')}</li>`).join('')}</ul>`).join('');
 const fl=[...first].map(slMem).filter(Boolean).sort((a,b)=>a.name.localeCompare(b.name));
 return`<div class="slbox"><div class="st">${ids.length} members${cen.size?` · Center: ${[...cen].map(slMem).filter(Boolean).map(m=>esc(m.name)).join(', ')}`:''}</div>${body}${opt.main?`<div class="slfts"><b>First Time Senbatsu</b> ${fl.length?fl.map(m=>esc(m.name)).join(', '):'<span class="st">none</span>'}</div>`:''}</div>`}
function slPosHtml(o){const F=plForm(o),nR=F.length?Math.max(...F.map(s=>s.r))+1:0;if(!nR)return'<p class="st">No Dance Positions yet.</p>';
 return`<div class="plstage">${Array.from({length:nR},(_,r)=>r).reverse().map(r=>`<div class="plrow"><b>${rowSh(r,nR)} row</b><div>${F.filter(s=>s.r==r).sort((a,b)=>a.i-b.i).map(s=>{const m=slMem(s.m);return m?`<span class="plm ${s.c?'ctr':''}">${ptc(m,30)}<small>${esc(m.name.split(' ')[0])}</small>${s.c?'<i>★</i>':''}</span>`:'<span class="plm empty">·</span>'}).join('')}</div></div>`).join('')}</div>`}
// one song: list, then Dance Positions in a separate (collapsible) section
function slSongHtml(o,x,L,open){const main=x&&x.mainId==o.id;return`<div class="c slsong"><h3>${main?'<span class="tag tmain">Title Track</span> ':'<span class="tag tcoup">Coupling</span> '}♪ ${esc(o.title)} <span class="st">· ${esc((o.lib&&o.lib.sname)||o.sname||'Senbatsu')}</span></h3>${slListHtml(o,{main,first:main?slFirst(x,L):null})}<details class="slpos" ${open?'open':''}><summary>Dance Positions</summary>${slPosHtml(o)}</details></div>`}
function slSingleHtml(x,L){const ids=[x.mainId,...new Set((x.types||[]).flatMap(t=>t.songs||[]))].filter((v,i,A)=>v&&A.indexOf(v)==i),songs=gsCtx((slSingleOf(S.songs[x.mainId])||{}).gid??gsAg(),'songs')||S.songs;
 return`<div class="slrel"><h3>Senbatsu</h3>${ids.map(id=>songs[id]||S.songs[id]).filter(Boolean).map(o=>slSongHtml(o,x,L)).join('')}</div>`}
// Results (release window)
{const f=doRelease;doRelease=function(){const n=S.singles.length,r=f.apply(this,arguments);try{const x=S.singles[n];if(x&&S.singles.length>n&&ui.mod&&ui.mod.t=='html'&&ui.mod.h.includes('released!')){ui.mod.h+=slSingleHtml(x,S.singles);render()}}catch(e){console.error(e)}return r}}
// release history (Discography)
{const f=showEds;showEds=function(i){f.apply(this,arguments);try{const x=S.singles[i];if(x&&ui.mod&&ui.mod.t=='html'){ui.mod.h+=`<p class="st">Released ${jd(x.relDay??x.day)} · ${(x.sales||0).toLocaleString()} sold</p>`+slSingleHtml(x,S.singles);render()}}catch(e){console.error(e)}}}
// Song Library: the list above, the Dance Positions in their own section
{const f=plSongInfo;plSongInfo=function(id){f.apply(this,arguments);try{const o=S.songs[id];if(!o||!ui.mod||ui.mod.t!='html')return;const R=slSingleOf(o),main=R&&R.x.mainId==id;
 const h=ui.mod.h,i=h.indexOf('<h3>Member positions</h3>');if(i<0)return;const j=h.indexOf('<div class="row">',i);if(j<0)return;
 ui.mod.h=h.slice(0,i)+`<h3>Senbatsu</h3>${slListHtml(o,{main,first:main?slFirst(R.x,R.L):null})}<h3>Dance Positions</h3>`+h.slice(i+25);render()}catch(e){console.error(e)}}}
