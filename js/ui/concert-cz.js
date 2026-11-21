// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Concert costumes: original positions, picture picker,
//                               member-by-member dressing (like the Theater)
// -------------------------------------------------------------------------------------
//  · "Original song costume": a member who takes a position of the original formation wears
//    the costume of that original position (position 1 → the costume of the original member in
//    position 1 …). Members of the original lineup keep their own costume.
//  · "One design for everyone": the design is chosen from a picture picker, sorted into
//    Single / Stage / Other designs and by group, three pictures per row.
//  · Dressing page for a concert song (like Stage Costumes): member strip, the Costume Designer
//    for the selected member, Save, Randomize, random for every member (same / different),
//    copy to the members without a costume, choose one of her existing costumes. Every member
//    can wear a different costume; it is saved for this concert song only.
// =====================================================================================
// ---- 1. original costumes follow the original positions ----------------------------------------------------------------
{const f=ccCzFor;ccCzFor=function(C,set,idx,mid,depth=0){const it=set&&set.items[idx];const r=f.apply(this,arguments);try{if(!it||it.k!='song')return r;const z=it.cz||{mode:'orig'};
  const useOrig=z.mode=='orig'||(z.mode=='mem'&&!(z.memP&&z.memP[mid])&&!(z.mem&&z.mem[mid]));if(!useOrig)return r;
  const o=ccSong(it.gid,it.song);if(!o)return r;let own=false;try{gsWith(it.gid,()=>{own=czMembers(o).some(m=>m.id==mid)})}catch(e){}if(own)return r;
  const k=(it.pos||[]).findIndex(p=>p.m==mid),om=k<0?null:it.orig&&it.orig[k]&&it.orig[k].m!=null?it.orig[k].m:it.pos[k].o??null;if(om==null)return r;let p=null;try{gsWith(it.gid,()=>{p=czFor(o,om)})}catch(e){}return p||r}catch(e){console.error(e);return r}}}
// ---- 1b. nobody stays in her everyday clothes ---------------------------------------------------------------------------------
//  When a performer has no costume of her own for the song (e.g. a concert song set up before positions were saved, or a
//  Theater Stage song she never performed), she wears the costume of the original position she takes; failing that, the
//  costume of an original performer of the song (Center first), or of another performer of this song who has one.
//  "Same as the previous / another song" follows the source song member by member, so it uses the same rule.
function ccCzFill(C,set,idx,mid,depth){const it=set&&set.items[idx];if(!it||it.k!='song')return null;const z=it.cz||{mode:'orig'};
 if(!(z.mode=='orig'||!z.mode||(z.mode=='mem'&&!(z.memP&&z.memP[mid])&&!(z.mem&&z.mem[mid]))))return null;
 const o=ccSong(it.gid,it.song);if(!o)return null;let orig=(it.orig||[]).map(x=>x.m);if(!orig.some(x=>x!=null)){try{orig=ccOrigPos(o).map(x=>x.m)}catch(e){orig=[]}}
 const k=(it.pos||[]).findIndex(p=>p.m==mid),ids=[];if(k>=0&&it.pos[k].o!=null)ids.push(it.pos[k].o);if(k>=0&&orig[k]!=null&&!ids.includes(orig[k]))ids.push(orig[k]);
 const cen=new Set(o.centers||[]);[...orig.filter(x=>x!=null&&cen.has(x)),...orig,...(o.centers||[]),...((o.slots||[]).filter(Boolean))].forEach(x=>{if(x!=null&&x!=mid&&!ids.includes(x))ids.push(x)});
 for(const id of ids){const p=ccCzOrig(C,it,id);if(p)return p}
 if(depth<1)for(const id of ccPerf(it)){if(id==mid)continue;const p=ccCzOrig(C,it,id);if(p)return p}return null}
{const f=ccCzFor;ccCzFor=function(C,set,idx,mid,depth=0){const r=f.apply(this,arguments);if(r)return r;try{return ccCzFill(C,set,idx,mid,depth)}catch(e){console.error(e);return r}}}
// ---- 2. picture picker for "one design for everyone" ------------------------------------------------------------------------
function ccDzOpen(iid){ui.ccdz={iid,ty:'single',g:'all',q:''};ui.mod={t:'html',h:ccDzHtml()};render()}
function ccDzHtml(){const C=ccCur(),P=ui.ccdz,r=C&&P&&ccItem(C,P.iid);if(!r)return'';const m=get(ccPerf(r.it)[0])||S.members[0],a=ap(m),z=r.it.cz||{};
 const CM=typeof tf7CzMap=='function'?tf7CzMap():null,inf=d=>CM?tf7CzInfo(d,CM):{r:2,g:0,hd:''},q=(P.q||'').toLowerCase();
 const L=czLib().ds.filter(d=>d&&d.p).filter(d=>{const f=inf(d);return(P.ty=='all'||(P.ty=='single'&&f.r==0)||(P.ty=='stage'&&f.r==1)||(P.ty=='other'&&f.r==2))&&(P.g=='all'||f.g==+P.g)&&(!q||String(d.name).toLowerCase().includes(q))});
 const chip=(k,v,n)=>`<button class="b s ${String(P[k])==String(v)?'p':''}" onclick="ui.ccdz.${k}='${v}';ui.mod.h=ccDzHtml();render()">${esc(n)}</button>`;
 return`<h2 class="ht">👗 Design · ${esc(r.it.title)}</h2><div class="row cctabs">${chip('ty','single','Single')}${chip('ty','stage','Stage')}${chip('ty','other','Other')}${chip('ty','all','All')}</div>${S.groups.length>1?`<div class="row">${chip('g','all','All groups')}${S.groups.map(g=>chip('g',g.id,g.name)).join('')}</div>`:''}
 <input class="ccpkq" placeholder="Search costume name" value="${esc(P.q||'')}" onchange="ui.ccdz.q=this.value;ui.mod.h=ccDzHtml();render()">
 <div class="czps ccdz3">${L.map(d=>`<button class="czpsi ${z.mode=='one'&&z.d==d.id?'on':''}" onclick="ccDzPick('${d.id}')"><svg viewBox="10 -2 80 200">${fig(m,{pose:0,of:a.of,oh:a.oh,ac:a.ac,ex:2,cd:d.p})}</svg><b>${esc(d.name)}</b><small class="st">${esc(inf(d).hd||'')}</small></button>`).join('')||'<p class="st">No design in this category.</p>'}</div>`}
function ccDzPick(did){const C=ccCur(),P=ui.ccdz,r=C&&P&&ccItem(C,P.iid);if(!ccEdit(C)||!r)return;r.it.cz={mode:'one',d:did};ui.mod=null;toast(`Design: ${(czD(did)||{}).name||''}`);render()}
{const f=ccCzHtml;ccCzHtml=function(C,s,it,i){let h=f.apply(this,arguments);try{const z=it.cz||{};
  // the design dropdown becomes a picture picker
  h=h.replace(/<label class="st">Design <select[\s\S]*?<\/select><\/label>/,`<button class="b s p" onclick="ccDzOpen('${it.id}')">🖼 ${z.d&&czD(z.d)?esc(czD(z.d).name):'Choose a design…'}</button>`);
  // member tiles open the dressing page; the old list picker stays as "Her costumes…"
  h=h.replace(/onclick="ccCzOpen\('([^']+)',(\d+)\)"/g,`onclick="ccDrOpen('$1',$2)"`).replace(/<p class="st">Tap a member to choose <b>her<\/b> costume[^<]*<\/p>/,`<p class="st">Tap a member to dress her (Costume Designer). Every member can wear her own costume.</p><div class="row"><button class="b s p" onclick="ccDrOpen('${it.id}')">👗 Dress members one by one</button></div>`)}catch(e){console.error(e)}return h}}
// ---- 3. dressing page --------------------------------------------------------------------------------------------------------------
function ccDrCtx(){const C=ccCur(),D=ui.ccdr,r=C&&D&&ccItem(C,D.iid);if(!r)return null;const s=r.s,it=r.it,idx=s.items.indexOf(it),M=ccPerf(it);return{C,s,it,idx,M,D}}
function ccDrOpen(iid,mid){const C=ccCur(),r=C&&ccItem(C,iid);if(!r)return;const M=ccPerf(r.it);if(!M.length)return toast('Nobody performs this song yet — set the formation first.','err');
 const go=()=>{ui.ccSetY=ui.ccSetY??window.scrollY;ui.ccdr={iid,mid:M.includes(+mid)?+mid:M[0]};ccDrLoad();view='cccz';render();try{window.scrollTo(0,0)}catch(e){}};if(view=='cccz'&&ui.czE&&ui.czE.dirty)czConfirmLeave(go);else go()}
function ccDrMem(mid){if(ui.ccdr)ccDrOpen(ui.ccdr.iid,mid)}
function ccDrLoad(){const X=ccDrCtx();if(!X)return;const p=ccCzFor(X.C,X.s,X.idx,X.D.mid)||CZ_PRESETS[0][1],prev=ui.czE||{};ui.czE={did:null,p:czClone(p),style:'',dirty:0,cat:prev.cat||'top',sel:prev.sel||'top',mid:X.D.mid,pose:prev.pose??0,ex:prev.ex??2,song:null,scz:1,ccz:1}}
// switch the song to member-by-member costumes, keeping what everyone wears now
function ccDrMemMode(X){const z=X.it.cz=X.it.cz||{mode:'orig'};if(z.mode!='mem'){const cur={};X.M.forEach(id=>{const p=ccCzFor(X.C,X.s,X.idx,id);if(p)cur[id]=czClone(p)});X.it.cz={mode:'mem',mem:{},memP:cur}}return X.it.cz}
function ccDrSet(X,id,p){const z=ccDrMemMode(X);z.memP=z.memP||{};z.memP[id]=czClone(p);if(z.mem)delete z.mem[id];z.done=z.done||{};z.done[id]=1}
function ccDrSave(){const X=ccDrCtx();if(!X||!ccEdit(X.C))return;const m=get(X.D.mid);ccDrSet(X,m.id,ui.czE.p);ui.czE.dirty=0;toast(`Costume for ${m.name} in “${X.it.title}” saved.`);render()}
function ccDrRevert(){ccDrLoad();render()}
function ccDrRandom(){if(!ui.czE)return;ui.czE.p=czRandom();ui.czE.dirty=1;toast('Random costume generated. Edit any piece, then save (nothing is saved until you press Save).');render()}
function ccDrRandAll(diff){const X=ccDrCtx();if(!X||!ccEdit(X.C))return;const one=czRandom();X.M.forEach(id=>ccDrSet(X,id,diff?czRandom():one));ccDrLoad();toast(diff?`Every member (${X.M.length}) got her own random costume.`:`One random costume for all ${X.M.length} member(s).`);render()}
function ccDrCopyRest(){const X=ccDrCtx();if(!X||!ccEdit(X.C))return;const z=ccDrMemMode(X),D=X.M.filter(id=>id!=X.D.mid&&!(z.done&&z.done[id]));if(!D.length)return toast('Every member already has her own costume.','err');D.forEach(id=>ccDrSet(X,id,ui.czE.p));toast(`Current design copied to ${D.length} member(s).`);render()}
function ccDrLib(did){const d=czD(did);if(!d||!ui.czE)return;ui.czE.p=czClone(d.p);ui.czE.dirty=1;render()}
function ccDrBack(){czConfirmLeave(()=>{ui.czE=null;view='concert';render();const y=ui.ccSetY;ui.ccSetY=null;if(y!=null)requestAnimationFrame(()=>{try{window.scrollTo(0,y)}catch(e){}})})}
{const f=ccCzMemSet;ccCzMemSet=function(){const r=f.apply(this,arguments);try{if(view=='cccz'){const X=ccDrCtx();if(X){const z=X.it.cz;if(z){z.done=z.done||{};z.done[X.D.mid]=1}}ccDrLoad();render()}}catch(e){console.error(e)}return r}}
V.cccz=function(){const X=ccDrCtx();if(!X)return`<p class="st">No concert song selected. <button class="b" onclick="view='concert';render()">◀ Back</button></p>`;
 if(!X.M.includes(X.D.mid)){X.D.mid=X.M[0];ccDrLoad()}if(!ui.czE||!ui.czE.ccz||ui.czE.mid!=X.D.mid)ccDrLoad();
 const z=X.it.cz||{},E=ui.czE,m=get(X.D.mid),ed=ccEdit(X.C),L=czLib().ds.filter(d=>d.p),doneOf=id=>!!(z.mode=='mem'&&z.done&&z.done[id]),done=X.M.filter(doneOf).length;
 const strip=`<div class="plczs">${X.M.map(id=>{const x=get(id);if(!x)return'';const ok=doneOf(id);return`<button class="plczm ${id==m.id?'on':''} ${ok?'ok':''}" onclick="ccDrMem(${id})" title="${esc(x.name)}">${ptc(x,46)}<b>${esc(x.name.split(' ')[0])}</b><small>${ok?'✔ Own costume':'Original costume'}</small></button>`}).join('')}</div>`;
 const songs=X.s.items.filter(i=>i.k=='song');
 const tools=ed?`<button class="b s p" onclick="ccDrRandom()">🎲 Randomize Costume</button><button class="b s" onclick="ccDrRandAll(0)">🎲 Random for every member (same)</button><button class="b s" onclick="ccDrRandAll(1)">🎲 Random for every member (each different)</button><button class="b s p" onclick="ccDrLibOpen()">🖼 Costume Library</button><button class="b s" onclick="ccCzOpen('${X.it.id}',${m.id})">Her costumes…</button><button class="b s" onclick="ccDrCopyRest()">Copy to members without their own costume</button>`:'<span class="tag warn">🔒 This concert can no longer be edited</span>';
 let body=czGridHtml(E,null,null,m).replace(/<label class="st">Model <select[\s\S]*?<\/select><\/label>/,'').replace('onclick="czSave()"','onclick="ccDrSave()"').replace('onclick="czRevert()"','onclick="ccDrRevert()"').replace('💾 Save design','💾 Save costume');
 if(!doneOf(m.id)&&!E.dirty)body=body.replace('<span class="tag">Saved</span>','<span class="tag warn">Not saved yet</span>');
 return`<h2 class="ht">Concert Costumes · ${esc(X.it.title)}</h2><div class="c plczh"><div class="row"><b>${done} / ${X.M.length} members in their own costume</b><span class="st">${esc(X.C.name)} · ${esc(X.s.name)}. Each member can wear her own costume — saved for this concert song only.</span><span style="flex:1"></span><select aria-label="Song" onchange="ccDrOpen(this.value)">${songs.map(x=>`<option value="${x.id}" ${x.id==X.it.id?'selected':''}>${esc(x.title)}</option>`).join('')}</select><button class="b" onclick="ccDrBack()">◀ Back to Setlist</button></div>${strip}<div class="row">${tools}</div></div>${body}`};
try{const ev=SECS.find(s=>s.v.some(x=>x[0]=='concert'));if(ev){ev.hid=[...(ev.hid||[]),'cccz']}SUBLOC.cccz='Concert · Costumes';if(typeof SC_VIEW!='undefined')SC_VIEW.cccz='dressing'}catch(e){}

// ---- 4. dressing page: choose from the Costume Library with pictures (Single / Stage / Other, by group) -----------------------
function ccDrLibOpen(){if(!ui.czE)return;ui.ccdl={ty:'single',g:'all',q:''};ui.mod={t:'html',h:ccDrLibHtml()};render()}
function ccDrLibHtml(){const X=ccDrCtx(),P=ui.ccdl;if(!X||!P)return'';const m=get(X.D.mid),a=ap(m),CM=typeof tf7CzMap=='function'?tf7CzMap():null,inf=d=>CM?tf7CzInfo(d,CM):{r:2,g:0,hd:''},q=(P.q||'').toLowerCase();
 const L=czLib().ds.filter(d=>d&&d.p).filter(d=>{const f=inf(d);return(P.ty=='all'||(P.ty=='single'&&f.r==0)||(P.ty=='stage'&&f.r==1)||(P.ty=='other'&&f.r==2))&&(P.g=='all'||f.g==+P.g)&&(!q||String(d.name).toLowerCase().includes(q))});
 const chip=(k,v,n)=>`<button class="b s ${String(P[k])==String(v)?'p':''}" onclick="ui.ccdl.${k}='${v}';ui.mod.h=ccDrLibHtml();render()">${esc(n)}</button>`;
 return`<h2 class="ht">🖼 Costume Library · ${esc(m.name)}</h2><p class="st">Tap a design: ${esc(m.name)} wears it in the Costume Designer. Edit it if you like, then press Save.</p><div class="row cctabs">${chip('ty','single','Single')}${chip('ty','stage','Stage')}${chip('ty','other','Other')}${chip('ty','all','All')}</div>${S.groups.length>1?`<div class="row">${chip('g','all','All groups')}${S.groups.map(g=>chip('g',g.id,g.name)).join('')}</div>`:''}
 <input class="ccpkq" placeholder="Search costume name" value="${esc(P.q||'')}" onchange="ui.ccdl.q=this.value;ui.mod.h=ccDrLibHtml();render()">
 <div class="czps ccdz3">${L.map(d=>`<button class="czpsi" onclick="ccDrLibPick('${d.id}')"><svg viewBox="10 -2 80 200">${fig(m,{pose:0,of:a.of,oh:a.oh,ac:a.ac,ex:2,cd:d.p})}</svg><b>${esc(d.name)}</b><small class="st">${esc(inf(d).hd||'')}</small></button>`).join('')||'<p class="st">No design in this category.</p>'}</div>`}
function ccDrLibPick(did){ui.mod=null;ui.ccdl=null;ccDrLib(did);toast('Design applied — press 💾 Save costume to keep it.')}
