// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Concert setlist & formation tools
// -------------------------------------------------------------------------------------
//  1. Formation page: "Not in any unit" filter for the participants.
//  2. Add songs: collapsed groups / singles / stages stay collapsed after + Add.
//  3. Add songs is organised by group: every group has its Singles, Stages and other songs.
//  4. Setlist: move a song straight to a chosen place; add songs above / below a song.
//  5. Formation: copy another song's formation exactly, or keep the original formation and add the
//     other song's members behind it as back rows (in that song's own row layout).
//  6. Concert costumes: copy the costume being edited to chosen members.
//  7. Costume panel of a setlist song: "Edit Costume" (no per-member copy buttons there).
// =====================================================================================
const ccOK=f=>function(){const p=CC_SETOK;CC_SETOK=1;try{return f.apply(this,arguments)}finally{CC_SETOK=p}};
// ---- 1. not in any unit ------------------------------------------------------------------------------------------------------------
{const f=ccFormPage;ccFormPage=function(C){const r=ccItem(C,ui.ccfp),F=ui.ccff=ui.ccff||{sort:'pop',free:0};let parts=null;
 if(r&&F.nu){const UM=ccUnitMap(r.s,r.it.id);parts=C.parts;C.parts=C.parts.filter(id=>!(UM[id]||[]).length)}
 let h;try{h=f.apply(this,arguments)}finally{if(parts)C.parts=parts}
 try{h=h.replace(/(<input type="checkbox" [^>]*onchange="ui\.ccff\.free=this\.checked;render\(\)"> Not in this song only<\/label>)/,`$1<label class="st"><input type="checkbox" ${F.nu?'checked':''} onchange="ui.ccff.nu=this.checked;render()"> Not in any unit</label>`);
  if(r&&ccEdit(C))h=h.replace(/(<button class="b s" onclick="ccFormClear\('[^']+'\)">Clear<\/button>)/,`$1</div>${ccFormCopyBar(C,r)}<div class="row">`)}catch(e){console.error(e)}return h}}
{const f=ccFormAddShown;ccFormAddShown=function(){const C=ccCur(),r=C&&ccItem(C,ui.ccfp),F=ui.ccff||{};let parts=null;if(r&&F.nu){const UM=ccUnitMap(r.s,r.it.id);parts=C.parts;C.parts=C.parts.filter(id=>!(UM[id]||[]).length)}try{return f.apply(this,arguments)}finally{if(parts)C.parts=parts}}}
// ---- 5. formation from another song ------------------------------------------------------------------------------------------------------
function ccFormCopyBar(C,r){const L=Object.values(C.sets).flatMap(s=>s.items.filter(x=>x.k=='song'&&x.id!=r.it.id&&(x.pos||[]).some(z=>z.m!=null)).map(x=>[s,x]));if(!L.length)return'';const v=ui.ccfcp&&L.some(([s,x])=>x.id==ui.ccfcp)?ui.ccfcp:L[0][1].id;
 return`<div class="c ccfcp"><b>Formation from another song</b><div class="row"><select onchange="ui.ccfcp=this.value">${L.map(([s,x])=>`<option value="${x.id}" ${x.id==v?'selected':''}>${Object.keys(C.sets).length>1?esc(s.name)+' · ':''}${esc(x.title)} (${ccPerf(x).length})</option>`).join('')}</select></div>
 <div class="row"><button class="b s p" onclick="ccFormCopy('${r.it.id}',ui.ccfcp||'${v}',0)">Same members &amp; positions</button><button class="b s" onclick="ccFormCopy('${r.it.id}',ui.ccfcp||'${v}',1)">Original formation + its members as back rows</button></div></div>`}
const ccFormCopy=ccOK(function(iid,src,merge){const C=ccCur(),r=C&&ccItem(C,iid),q=C&&ccItem(C,src);if(!ccEdit(C)||!r||!q)return;const SP=(q.it.pos||[]).filter(z=>z.m!=null);
 if(!merge){r.it.pos=SP.map(z=>({m:z.m,r:z.r,c:!!z.c,o:z.m}));toast(`Formation copied from “${q.it.title}”.`);ui.ccfs=null;return render()}
 // original formation of this song, then the other song's members (not yet in it) behind it, keeping that song's rows
 const p0=CC_SETOK;try{CC_SETOK=1;const t=render;render=()=>{};try{ccPosReset(iid)}finally{render=t}}finally{CC_SETOK=p0}
 const P=r.it.pos,have=new Set(P.filter(z=>z.m!=null).map(z=>z.m)),base=P.length?Math.max(...P.map(z=>z.r))+1:0,add=SP.filter(z=>!have.has(z.m)),rows=[...new Set(add.map(z=>z.r))].sort((a,b)=>a-b);
 add.forEach(z=>P.push({m:z.m,r:Math.min(CC_ROWS-1,base+rows.indexOf(z.r)),c:false,o:null}));ui.ccfs=null;toast(add.length?`${add.length} member(s) of “${q.it.title}” added as back rows.`:`Every member of “${q.it.title}” is already in this song.`);render()});
// ---- 4. move to a place / add above or below ------------------------------------------------------------------------------------------------
const ccItemTo=ccOK(function(iid,to){const C=ccCur(),r=C&&ccItem(C,iid);if(!ccEdit(C)||!r)return;const L=r.s.items,i=L.indexOf(r.it);to=Math.max(0,Math.min(L.length-1,(+to|0)-1));if(to==i)return;L.splice(i,1);L.splice(to,0,r.it);toast(`“${r.it.title}” moved to No. ${to+1}.`);render()});
function ccAddAt(iid,below){ui.ccins={iid,below:below?1:0};ccPickOpen()}
{const f=ccAddSong;ccAddSong=function(){const C=ccCur(),s=C&&C.sets[ui.ccs],n=s?s.items.length:0,I=ui.ccins;const r=f.apply(this,arguments);
 try{if(I&&s&&s.items.length>n){const it=s.items[s.items.length-1],L=s.items,j=L.findIndex(x=>x.id==I.iid);if(j>=0){L.pop();const at=I.below?j+1:j;L.splice(at,0,it);if(L[at+1]&&L[at+1].enc&&!L[at].enc&&I.below&&L[j].enc)it.enc=1;ui.ccins={iid:it.id,below:1}}}}catch(e){console.error(e)}return r}}
{const f=ccSongRow;ccSongRow=function(C,s,it,i,k){let h=f.apply(this,arguments);try{if(!ccEdit(C))return h;const L=s.items,pos=L.indexOf(it)+1,lab=(x,j)=>`${j+1} · ${x.k=='song'?esc(x.title):x.k=='mc'?esc(x.name||'MC'):esc((x.name||x.k||'').toString())}`;
 const ctl=`<select class="ccto" aria-label="Move to" onchange="ccItemTo('${it.id}',this.value)">${L.map((x,j)=>`<option value="${j+1}" ${j+1==pos?'selected':''}>${j+1==pos?'No. '+pos+' (here)':'→ '+lab(x,j)}</option>`).join('')}</select><button class="b s" title="Add songs above" onclick="ccAddAt('${it.id}',0)">＋▲</button><button class="b s" title="Add songs below" onclick="ccAddAt('${it.id}',1)">＋▼</button>`;
 h=h.replace(`<button class="b s" onclick="ccItemDel('${it.id}')">✕</button>`,ctl+`<button class="b s" onclick="ccItemDel('${it.id}')">✕</button>`)}catch(e){console.error(e)}return h}}
// ---- 2 + 3. Add songs by group (Singles / Stages / other songs), collapsed sections stay collapsed ------------------------------------------
function ccPkKey(t){let h=0;t=String(t);for(let i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))|0;return'k'+(h>>>0).toString(36)}
function ccPkTog(el,k){const Z=ui.ccpkz=ui.ccpkz||{};if(el.open)delete Z[k];else Z[k]=1}
const ccPkOpen=k=>!(ui.ccpkz||{})[k];
ccPickHtml=function(){const C=ccCur(),s=C&&C.sets[ui.ccs],P=ui.ccpk=ui.ccpk||{q:''};if(!s)return'';const D=ccPickData(),q=(P.q||'').toLowerCase(),have={},G=S.groups.filter(g=>!g.dis);s.items.forEach(it=>{if(it.k=='song'){const k=it.gid+':'+it.song;have[k]=(have[k]||0)+1}});
 if(!G.some(g=>g.id==P.g))P.g=(G.find(g=>g.id==(typeof gsAg=='function'?gsAg():null))||G[0]||{}).id;const g=P.g,ok=x=>x.gid==g&&(!q||String(x.o.title).toLowerCase().includes(q)),gid0=b=>b.L[0]&&b.L[0].gid;
 const sing=(D.single||[]).filter(b=>gid0(b)==g).map(b=>({...b,L:b.L.filter(ok)})).filter(b=>b.L.length),stg=(D.stage||[]).filter(b=>gid0(b)==g).map(b=>({...b,L:b.L.filter(ok)})).filter(b=>b.L.length);
 const used=new Set([...(D.single||[]),...(D.stage||[])].flatMap(b=>b.L.map(x=>x.gid+':'+x.o.id))),oth=((D.grp||[]).find(b=>gid0(b)==g)||{L:[]}).L.filter(x=>ok(x)&&!used.has(x.gid+':'+x.o.id));
 const row=(x,sid)=>{const k=x.gid+':'+x.o.id,n=have[k]||0;return`<div class="row ccpki"><div style="flex:1;min-width:0"><b>${esc(x.o.title)}</b><small class="st">${esc(x.o.role||thCat(x.o))}${x.o.genre?' · '+esc(x.o.genre):''}${x.o.concept?' · '+esc(x.o.concept):''}</small></div>${n?`<span class="tag">In setlist${n>1?' ×'+n:''}</span>`:''}<button class="b s ${n?'':'p'}" onclick="${sid?`ccPickAddSt('${k}','${sid}')`:`ccPickAdd('${k}')`}">+ Add</button></div>`};
 const blk=(b,pre)=>{const k=ccPkKey(pre+g+b.h);return`<details ${ccPkOpen(k)?'open':''} class="ccpkb" ontoggle="ccPkTog(this,'${k}')"><summary><b>${esc(b.h)}</b> <small class="st">${esc((b.sub||'').replace(/^[^·]*· /,G.length>1?'':'$&'))}</small></summary>${b.L.map(x=>row(x,b.sid)).join('')}</details>`};
 const sec=(id,title,n,body)=>{const k=ccPkKey('sec'+g+id);return parseInt(n)>0?`<details ${ccPkOpen(k)?'open':''} class="ccpks" ontoggle="ccPkTog(this,'${k}')"><summary><b>${title}</b> <small class="st">${n}</small></summary>${body}</details>`:''};
 const I=ui.ccins&&ccItem(C,ui.ccins.iid);
 return`<h2 class="ht">Add songs</h2>${I?`<div class="c ccins">Adding ${ui.ccins.below?'below':'above'} <b>${esc(I.it.title||I.it.name||'')}</b> <button class="b s" onclick="ui.ccins=null;ui.mod.h=ccPickHtml();render()">Add at the end instead</button></div>`:''}
 ${G.length>1?`<div class="row cctabs">${G.map(x=>`<button class="b s ${x.id==g?'p':''}" onclick="ui.ccpk.g=${x.id};ui.mod.h=ccPickHtml();render()">${esc(x.name)}</button>`).join('')}</div>`:''}
 <input class="ccpkq" placeholder="Search songs" value="${esc(P.q||'')}" onchange="ui.ccpk.q=this.value;ui.mod.h=ccPickHtml();render()">
 <div class="ccpk">${sec('single','💿 Singles',`${sing.length} single(s)`,sing.map(b=>blk(b,'s')).join(''))}${sec('stage','🎭 Stages',`${stg.length} stage(s)`,'<p class="st">Stage songs are added with the Stage’s current lineup and formation (only concert participants are placed).</p>'+stg.map(b=>blk(b,'t')).join(''))}${sec('other','🎵 Other songs',`${oth.length} song(s)`,oth.map(x=>row(x)).join(''))}
 ${!sing.length&&!stg.length&&!oth.length?'<p class="st">No songs match.</p>':''}</div>`};
{const f=ccPickOpen;ccPickOpen=function(){const r=f.apply(this,arguments);return r}}
// closing the picker ends "add above / below"
{const f=render;render=function(){if(ui.ccins&&!(ui.mod&&ui.mod.ccpk))ui.ccins=null;return f.apply(this,arguments)}}
// ---- 6. copy the costume being edited to chosen members ------------------------------------------------------------------------------------
function ccDrCopyOpen(){const X=ccDrCtx();if(!X||!ui.czE)return;ui.ccdc={sel:{}};ui.mod={t:'html',h:ccDrCopyHtml()};render()}
function ccDrCopyHtml(){const X=ccDrCtx(),D=ui.ccdc;if(!X||!D)return'';const m=get(X.D.mid),L=X.M.filter(id=>id!=X.D.mid).map(get).filter(Boolean),n=Object.keys(D.sel).filter(k=>D.sel[k]).length;
 return`<h2 class="ht">Copy ${esc(m.name)}’s costume</h2><p class="st">The costume you are editing (saved or not) is given to the chosen members of “${esc(X.it.title)}”.</p><div class="row"><button class="b s" onclick="ui.ccdc.sel=Object.fromEntries(ccDrCtx().M.map(id=>[id,1]));ui.mod.h=ccDrCopyHtml();render()">Select all</button><button class="b s" onclick="ui.ccdc.sel={};ui.mod.h=ccDrCopyHtml();render()">Clear</button></div>
 <div class="ccmg3">${L.map(x=>ccMCard(x,!!D.sel[x.id],`ui.ccdc.sel[${x.id}]=!ui.ccdc.sel[${x.id}];ui.mod.h=ccDrCopyHtml();render()`,'')).join('')}</div><div class="row"><button class="b p" ${n?'':'disabled'} onclick="ccDrCopyGo()">Copy to ${n} member(s)</button></div>`}
const ccDrCopyGo=ccOK(function(){const X=ccDrCtx(),D=ui.ccdc;if(!X||!D||!ccEdit(X.C)||!ui.czE)return;const ids=Object.keys(D.sel).filter(k=>D.sel[k]).map(Number).filter(id=>X.M.includes(id)&&id!=X.D.mid);ids.forEach(id=>ccDrSet(X,id,ui.czE.p));ui.mod=null;ui.ccdc=null;toast(`Costume copied to ${ids.length} member(s).`);render()});
{const f=V.cccz;V.cccz=function(){let h=f.apply(this,arguments);try{h=h.replace(/(<button class="b s" onclick="ccDrCopyRest\(\)">)/,`<button class="b s p" onclick="ccDrCopyOpen()">📋 Copy to members…</button>$1`)}catch(e){}return h}}
// ---- 7. setlist costume panel: Edit Costume, no per-member copy buttons ---------------------------------------------------------------------
{const f=ccCzHtml;ccCzHtml=function(){let h=f.apply(this,arguments);try{h=h.replace(/<button[^>]*onclick="ccCzMem(?:No|All)\([^"]*\)"[^>]*>[\s\S]*?<\/button>/g,'').replace('👗 Dress members one by one','✏️ Edit Costume')}catch(e){}return h}}
['ccAddAt','ccDrCopyOpen'].forEach(n=>{const f=window[n];window[n]=ccOK(f)});
// ---- 8. "Each member's latest costume": every member wears the costume of the last earlier song SHE performed ----------
//  A member who has not performed yet in this setlist wears the original song costume (same rule as "Original song costume").
{const f=ccCzFor;ccCzFor=function(C,set,idx,mid,depth=0){const it=set&&set.items&&set.items[idx];if(!it||it.k!='song'||!it.cz||it.cz.mode!='last'||depth>40)return f.apply(this,arguments);
  try{for(let j=idx-1;j>=0;j--){const x=set.items[j];if(x&&x.k=='song'&&ccPerf(x).some(id=>id==mid))return ccCzFor(C,set,j,mid,depth+1)}}catch(e){console.error(e)}
  const z=it.cz;it.cz={mode:'orig'};try{return ccCzFor(C,set,idx,mid,depth+1)}finally{it.cz=z}}}
{const f=ccCzHtml;ccCzHtml=function(C,s,it,i){let h=f.apply(this,arguments);try{const first=s.items.findIndex(x=>x.k=='song')==i,on=(it.cz||{}).mode=='last';
  if(!first)h=h.replace('<option value="one"',`<option value="last" ${on?'selected':''}>Each member's latest costume</option><option value="one"`);
  if(on)h=h.replace(/(<\/select><\/label>)/,`$1<p class="st">Each member wears the costume from the last earlier song she performed in this setlist. Members performing for the first time wear the original song costume.</p>`)}catch(e){console.error(e)}return h}}
