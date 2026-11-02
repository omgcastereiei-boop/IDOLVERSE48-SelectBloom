// =====================================================================================
//  IDOLVERSE48: Select Bloom!  —  Costume Designer & costume library
// -------------------------------------------------------------------------------------
//  Costume designs live in ONE library (saved with the game):
//     S.czLib = { v:2, ds:[ {id, name, p:design, style, created, updated} ] }
//  Songs only reference designs:
//     S.songs[id].cdz = { main:designId, mode:'uniform'|'individual',
//                         mem:{ memberId:{ d:designId, ov:{slotPath:{c1}} } } }
//  A design can be used by many songs; editing it updates every song that wears it.
//
//  Production rule (changed on request): Single Production no longer has a costume
//  selection step. Each song needs a costume design assigned here; when the single
//  starts, the assigned design is used automatically (manufacturing still takes
//  CFG.costumeDays). The original concept bonus is kept: a design's "concept line"
//  (Cute/Cool/Pure/Elegant/Sporty) feeds the song's costume style exactly like the old
//  premade costumes did.
// =====================================================================================
const CZ_PAL=['#ffffff','#fff4e8','#f6e7c8','#f3c35c','#ffb46e','#ff8fb7','#f27aa6','#e2455f','#7a1f3d','#ffd3e6','#f7a8c8','#c9b6ff','#9d86da','#5b3f78','#9fd3ff','#6fb3e4','#3c4a78','#2c3a6b','#9fe0c0','#3c9a6c','#cfd4dc','#8a8f9a','#2b2436','#1e1a28'];
const CZ_COLS=[['c1','Primary'],['c2','Secondary'],['c3','Accent'],['pc','Pattern'],['dc','Details']];
// concept lines = the original costume styles used by the release formula (CMATCH)
const CZ_STYLES=[['','No concept line'],['Sailor','Cute line'],['Gothic','Cool line'],['Kimono','Pure line'],['Ballgown','Elegant line'],['Sporty','Sporty line']];
const CZ_PRESET_STYLE=['Sailor','Sailor','Ballgown','Sailor','Ballgown','Gothic','Gothic','Gothic','Sporty','Sporty','Kimono','Gothic','Sporty'];
const CZ_MAP=[9,1,0,8,12,0,5]; // original outfit index -> closest starting preset (migration only)
// one internal production record used when a song wears an original design (keeps the original release code working)
COS.push(['Original costume design',5,340,null,0]);const CZ_COS=COS.length-1;
SECS.find(x=>x.k=='music').v.push(['costume','Costume Designer']);SC_VIEW.costume='dressing';SUBLOC.costume='Dressing Room · Costume Designer';
let _czn=0;const czId=()=>'cz'+Date.now().toString(36)+(++_czn);

// ---- library & migration ---------------------------------------------------------------
function czLib(){if(!S.czLib)S.czLib={v:2,ds:[]};if(!S.czLib.mig){Object.values(S.songs||{}).forEach(o=>{const z=o.cdz;if(z&&Array.isArray(z.ds)){z.ds.forEach(d=>{if(!S.czLib.ds.some(x=>x.id==d.id))S.czLib.ds.push({id:d.id,name:d.name,p:d.p,style:o.costume||'',created:S.day,updated:S.day})});delete z.ds}});S.czLib.mig=1}return S.czLib}
const czMemD=id=>{if(typeof id!="string"||!id.startsWith("mz~"))return null;const[,sid,mid]=id.split("~"),o=S.songs[sid];const mm=o&&o.cdz&&o.cdz.mem&&o.cdz.mem[mid];if(!mm||!mm.own)return null;mm.own.id=id;return mm.own};
const czD=id=>id?(czMemD(id)||czLib().ds.find(d=>d.id==id)):null;
const czHasOwn=o=>!!(o&&o.cdz&&Object.values(o.cdz.mem||{}).some(m=>m.own&&m.own.p));
function czSongZ(o){if(!o.cdz)o.cdz={mode:'uniform',main:null,mem:{}};if(!o.cdz.mem)o.cdz.mem={};if(!o.cdz.mode)o.cdz.mode='uniform';return o.cdz}
const czGetSlot=(p,path)=>path.split('.').reduce((a,k)=>a&&a[k],p);
function czSetSlot(p,path,v){const ks=path.split('.'),last=ks.pop();let t=p;ks.forEach(k=>{t[k]=t[k]||{};t=t[k]});if(v==null)delete t[last];else t[last]=v}
function czFor(o,mid){if(!o||!o.cdz)return null;czLib();const z=o.cdz,mm=(z.mem||{})[mid]||{};if(mm.own&&mm.own.p)return mm.own.p;const d=czD(z.mode=='individual'&&mm.d?mm.d:z.main)||czD(z.main);if(!d)return null;let p=d.p;
 if(z.mode=='uniform'&&mm.ov&&Object.keys(mm.ov).length){p=czClone(p);for(const k in mm.ov){const s=czGetSlot(p,k);if(s)Object.assign(s,mm.ov[k])}}return p}
const czMain=o=>o&&o.cdz?czD(o.cdz.main):null;
const czMembers=o=>(o.slots||[]).filter(Boolean).map(get).filter(Boolean);
const czUsers=did=>Object.values(S.songs||{}).filter(o=>o.cdz&&(o.cdz.main==did||Object.values(o.cdz.mem||{}).some(m=>m.d==did)));
// keep the original production fields in step with the assigned design (only while the song is still a draft)
function czSync(o){if(!o||lockedSong(o.id))return;const d=czMain(o)||czHasOwn(o);if(d){o.cid=CZ_COS;o.coh=null;o.cosFinal=true;o.costume='Custom'}else if(o.cid==CZ_COS){o.cid=null;o.cosFinal=false}}
function czSyncPlan(){if(!S||!S.pj)return;[S.pj.mainId,...S.pj.coup].forEach(id=>czSync(S.songs[id]))}
function czSongs(){const L=[];if(S.pj)[S.pj.mainId,...S.pj.coup].forEach((id,i)=>{const o=S.songs[id];if(o)L.push([o,i?'Coupling':'Main'])});if(S.al)(S.al.tracks||[]).forEach(id=>{const o=S.songs[id];if(o&&!o.rel&&!L.some(x=>x[0]==o))L.push([o,'Album'])});return L}

// ---- production rule changes (no costume selection step) ---------------------------------
const _czReqs=reqs;reqs=function(p){czSyncPlan();const r=_czReqs(p).filter(x=>!/: (choose a costume|finalize the costume design)\.$/.test(x));
 if(p.status=='draft')usedSongs(p).forEach(i=>{const o=S.songs[i];if(!czMain(o))r.push(`"${o.title}" (${i==p.mainId?'main song':'coupling song'}): assign a costume design in Costume Designer.`)});return r};
const _czStart=startSingle;startSingle=function(){czSyncPlan();return _czStart.apply(this,arguments)};
const _czConfirm=confirmProd;confirmProd=function(){czSyncPlan();return _czConfirm.apply(this,arguments)};

// ---- designer state ---------------------------------------------------------------------
function czInit(did,songId){czLib();const songs=czSongs(),o=songId?S.songs[songId]:(songs[0]||[])[0],d=czD(did)||(o&&czMain(o))||czLib().ds[0]||null;
 ui.czE={did:d?d.id:null,p:d?czClone(d.p):null,style:d?d.style||'':'',dirty:0,cat:'top',sel:'top',mid:((o&&czMembers(o)[0])||S.members[0]||{}).id,pose:2,ex:2,song:o?o.id:null}}
function czOpen(songId){czInit(null,songId);view='costume';render();try{window.scrollTo(0,0)}catch(e){}}
const czEditing=()=>ui.czE&&ui.czE.did&&czD(ui.czE.did);
// pieces can be edited in the library designer AND in a member's song / Single costume (even before its first save)
const czCanEdit=()=>!!(ui.czE&&ui.czE.p&&(ui.czE.scz||czEditing()));
function czConfirmLeave(go){if(ui.czE&&ui.czE.dirty)ask('Discard unsaved changes to the current design?',go,'Discard');else go()}
function czPick(did){czConfirmLeave(()=>{const d=czD(did);if(!d)return;Object.assign(ui.czE,{did,p:czClone(d.p),style:d.style||'',dirty:0});render()})}
function czMark(){ui.czE.dirty=1}
function czNew(i){czConfirmLeave(()=>{const k=i===''||i==null?0:+i,d={id:czId(),name:(k?CZ_PRESETS[k][0]:'New design')+' '+(czLib().ds.length+1),p:czClone(CZ_PRESETS[k][1]),style:CZ_PRESET_STYLE[k]||'',created:S.day,updated:S.day};czLib().ds.push(d);Object.assign(ui.czE,{did:d.id,p:czClone(d.p),style:d.style,dirty:0});toast(`"${d.name}" added to the costume library.`);render()})}
function czDup(){const src=czEditing();if(!src)return;const d={id:czId(),name:(src.name+' (copy)').slice(0,40),p:czClone(ui.czE.p),style:ui.czE.style,created:S.day,updated:S.day};czLib().ds.push(d);Object.assign(ui.czE,{did:d.id,dirty:0});toast('Design duplicated.');render()}
function czRename(v){const d=czEditing(),n=cleanName(v);if(!d)return;if(!n)return toast('Enter a name.','err');d.name=n;d.updated=S.day;toast('Design renamed.');render()}
function czDel(){const d=czEditing();if(!d)return;const U=czUsers(d.id),busy=U.filter(o=>lockedSong(o.id));
 if(busy.length)return toast(`"${d.name}" is worn by songs already in production or released (${busy.map(o=>o.title).join(', ')}). It cannot be deleted.`,'err');
 ask(`Delete the design "${d.name}" from the costume library?${U.length?` It is assigned to ${U.length} song(s); they will need another design.`:''}`,()=>{U.forEach(o=>{const z=o.cdz;if(z.main==d.id)z.main=null;Object.values(z.mem).forEach(m=>{if(m.d==d.id)delete m.d});czSync(o)});const L=czLib();L.ds=L.ds.filter(x=>x.id!=d.id);const n=L.ds[0];Object.assign(ui.czE,{did:n?n.id:null,p:n?czClone(n.p):null,style:n?n.style||'':'',dirty:0});render()},'Delete')}
function czPreset(i){if(i===''||!czCanEdit())return;const go=()=>{ui.czE.p=czClone(CZ_PRESETS[+i][1]);ui.czE.style=CZ_PRESET_STYLE[+i]||'';czMark();toast(`Started from "${CZ_PRESETS[+i][0]}". Every piece can still be changed.`);render()};if(ui.czE.dirty)ask('Replace the current unsaved changes with this preset?',go,'Use preset');else go()}
function czStyle(v){if(!czEditing())return;ui.czE.style=v;czMark();render()}
function czSave(){const d=czEditing();if(!d)return;d.p=czClone(ui.czE.p);d.style=ui.czE.style||'';d.updated=S.day;ui.czE.dirty=0;czSyncPlan();const n=czUsers(d.id).length;toast(n?`"${d.name}" saved. ${n} song(s) wearing it are updated.`:`"${d.name}" saved to the costume library.`);render()}
function czRevert(){const d=czEditing();if(!d)return;Object.assign(ui.czE,{p:czClone(d.p),style:d.style||'',dirty:0});render()}
// piece editing (draft)
function czCat(k){const E=ui.czE,c=CZ_CATS.find(x=>x.k==k);E.cat=k;if(c&&c.multi){const on=Object.keys((E.p||{})[k]||{}).find(x=>E.p[k][x]);E.sel=on?k+'.'+on:k+'.'+c.items[0][0]}else E.sel=k;render()}
function czItem(cat,t){const E=ui.czE;if(!czCanEdit())return;const c=CZ_CATS.find(x=>x.k==cat);
 if(c.multi){const path=cat+'.'+t;if(!czGetSlot(E.p,path))czSetSlot(E.p,path,czPiece(t,'#f7a8c8','#ffffff','#f3c35c'));E.sel=path}
 else{const cur=E.p[cat]||{};E.p[cat]=t=='none'?{t:'none'}:{...czPiece(t,cur.c1||'#ffffff',cur.c2,cur.c3),...(cur.t&&cur.t!='none'?{c1:cur.c1,c2:cur.c2,c3:cur.c3,pc:cur.pc,dc:cur.dc,pat:cur.pat,ps:cur.ps,pd:cur.pd}:{}),t,v:0};E.sel=cat}
 czMark();render()}
function czRemove(){const E=ui.czE;if(!czCanEdit())return;czSetSlot(E.p,E.sel,null);const c=CZ_CATS.find(x=>x.k==E.cat),on=Object.keys(E.p[E.cat]||{}).find(x=>E.p[E.cat][x]);if(c&&c.multi)E.sel=on?E.cat+'.'+on:E.cat+'.'+c.items[0][0];czMark();render()}
function czSetFab(k){const P=czGetSlot(ui.czE.p,ui.czE.sel);if(P){P.fab=k;czMark();render()}}
function czVar(v){const P=czGetSlot(ui.czE.p,ui.czE.sel);if(P){P.v=v;czMark();render()}}
function czSetPat(k){const P=czGetSlot(ui.czE.p,ui.czE.sel);if(P){P.pat=k;czMark();render()}}
function czNum(f,v,live){const P=czGetSlot(ui.czE.p,ui.czE.sel);if(!P)return;P[f]=+v;czMark();live?czLive():render()}
function czRecent(c){let r=(UIP.czRecent||[]).filter(x=>x!=c);r.unshift(c);UIP.czRecent=r.slice(0,10);try{localStorage.setItem('iv48ui',JSON.stringify(UIP))}catch(e){}}
function czCol(f,v,live){if(!/^#?[0-9a-f]{6}$/i.test(v)){if(!live)toast('Use a HEX colour like #ff8fb7.','err');return}if(v[0]!='#')v='#'+v;v=v.toLowerCase();const P=czGetSlot(ui.czE.p,ui.czE.sel);if(!P)return;P[f]=v;czMark();if(live)return czLive();czRecent(v);render()}
function czLive(){const el=document.getElementById('czstage');if(el)el.innerHTML=czStageSvg()}
// assignment (song side)
const czSongLocked=o=>!o||lockedSong(o.id);
function czAsGuard(o){if(czSongLocked(o)){toast('This song is already in production: its costume assignment can no longer change. (Editing the design itself still updates its look.)','err');return false}return true}
function czSelSong(id){ui.czE.song=id||null;const o=S.songs[id];if(o){const m=czMembers(o)[0];if(m)ui.czE.mid=m.id}render()}
function czAssignMain(id,did){const o=S.songs[id];if(!o||!czAsGuard(o))return;if(did&&ui.czE.dirty&&did==ui.czE.did)czSave();const z=czSongZ(o);z.main=did||null;czSync(o);o.czOk=false;const d=czD(did);toast(d?`"${d.name}" is now the costume for "${o.title}".`:`Costume removed from "${o.title}".`);render()}
function czMode(id,m){const o=S.songs[id];if(!o||!czAsGuard(o))return;czSongZ(o).mode=m;o.czOk=false;render()}
function czAssignMem(id,mid,did){const o=S.songs[id];if(!o||!czAsGuard(o))return;const z=czSongZ(o);o.czOk=false;z.mem[mid]={...(z.mem[mid]||{})};if(did)z.mem[mid].d=did;else delete z.mem[mid].d;render()}
function czOv(id,mid,path,v){const o=S.songs[id];if(!o||!czAsGuard(o))return;const z=czSongZ(o),mm=z.mem[mid]=z.mem[mid]||{};mm.ov=mm.ov||{};if(v)mm.ov[path]={c1:v};else delete mm.ov[path];render()}
function czOvReset(id,mid){const o=S.songs[id];if(!o||!czAsGuard(o))return;if(o.cdz&&o.cdz.mem[mid])delete o.cdz.mem[mid].ov;render()}

// ---- rendering helpers ------------------------------------------------------------------
function czPrevMember(){const E=ui.czE,o=E.song&&S.songs[E.song];return get(E.mid)||(o&&czMembers(o)[0])||S.members[0]}
function czStageSvg(){const E=ui.czE,m=czPrevMember();if(!m||!E.p)return'';const a=ap(m);return`<svg viewBox="4 -4 92 204" class="czfig" xmlns="http://www.w3.org/2000/svg">${fig(m,{pose:E.pose,of:a.of,oh:a.oh,ac:a.ac,ex:E.ex,cd:E.p})}</svg>`}
const CZ_CROP={top:'24 32 52 46',sleeve:'18 36 64 56',collar:'30 30 40 30',outer:'20 34 60 60',bottom:'16 62 68 64',over:'10 62 80 70',shoes:'26 156 48 40',legs:'22 92 56 106',x:'14 30 72 90',a:'14 0 72 110'};
const CZ_ACROP={hbow:'26 -2 48 32',headband:'26 -2 48 32',clip:'26 -2 48 32',crown:'26 -4 48 32',hat:'26 -6 48 34',hribbon:'26 -2 48 46',earrings:'28 14 44 30',necklace:'34 32 32 26',choker:'34 30 32 24',gloves:'14 50 72 50',armband:'14 46 72 40',legacc:'30 84 40 40',sdeco:'26 162 48 34'};
function czThumb(cat,t){const E=ui.czE,m=czPrevMember(),a=ap(m),c=CZ_CATS.find(x=>x.k==cat),p=czClone(E.p);
 if(c.multi){p[cat]=p[cat]||{};if(!p[cat][t])p[cat][t]=czPiece(t,'#f7a8c8','#ffffff','#f3c35c')}else{const cur=p[cat]||{};p[cat]=t=='none'?{t:'none'}:{...czPiece(t,cur.c1||'#ffffff',cur.c2,cur.c3),...(cur.t&&cur.t!='none'?{c1:cur.c1,c2:cur.c2,c3:cur.c3,pc:cur.pc,dc:cur.dc,pat:cur.pat,ps:cur.ps,pd:cur.pd}:{}),t,v:0}}
 return`<svg viewBox="${c.k=='a'?CZ_ACROP[t]:CZ_CROP[cat]}" xmlns="http://www.w3.org/2000/svg">${fig(m,{pose:0,of:a.of,oh:a.oh,ac:a.ac,ex:2,cd:p})}</svg>`}
function czSwatch(k,P){const r=czPat('czs'+k+(++PTC[0]),{...P,pat:k,ps:.9});return`<svg viewBox="0 0 12 12"><defs>${r.d}</defs><rect width="12" height="12" rx="2" fill="${r.f}"/></svg>`}
const czSlotName=path=>{const[c,i]=path.split('.'),cat=CZ_CATS.find(x=>x.k==c);if(i){const it=cat.items.find(x=>x[0]==i);return it?it[1]:i}return cat?cat.n:path};
function czDesignThumb(d,m,w=70){if(!d||!m)return'';const a=ap(m);return`<svg viewBox="10 -2 80 200" width="${w}">${fig(m,{pose:0,of:a.of,oh:a.oh,ac:a.ac,ex:2,cd:d.p})}</svg>`}
const czStyleName=s=>(CZ_STYLES.find(x=>x[0]==(s||''))||CZ_STYLES[0])[1];

// ---- the Costume Designer screen ------------------------------------------------------
V.costume=function(){czLib();if(!ui.czE)czInit();const E=ui.czE,L=czLib().ds,d=czEditing(),songs=czSongs(),o=E.song&&S.songs[E.song];czSyncPlan();
 const model=czPrevMember();
 const lib=`<div class="c czlib"><div class="row"><b class="czt">Costume library</b><span class="st">衣装ライブラリ · ${L.length} design(s)</span><span style="flex:1"></span><select onchange="czNew(this.value);this.value=''"><option value="">+ New design…</option>${CZ_PRESETS.map(([n],i)=>`<option value="${i}">New from preset: ${n}</option>`).join('')}</select></div>
 <div class="czcards">${L.map(x=>{const U=czUsers(x.id);return`<button class="czcardb ${d&&x.id==d.id?'on':''}" onclick="czPick('${x.id}')">${czDesignThumb(x,model,64)}<b>${esc(x.name)}</b><small>${U.length?`${U.length} song(s)`:'not assigned'}</small></button>`}).join('')||`<div class="empty"><i>👗</i>The costume library is empty. Create your first design with “+ New design”.</div>`}</div></div>`;
 if(!d)return lib+czAssignPanel(o,songs,model);
 const cat=CZ_CATS.find(x=>x.k==E.cat)||CZ_CATS[0],P=czGetSlot(E.p,E.sel),U=czUsers(d.id);
 const head=`<div class="c czhead"><div class="row czdes"><input id="czname" value="${esc(d.name)}" maxlength="40" style="width:200px" aria-label="Design name"><button class="b s" onclick="czRename($('#czname').value)">Rename</button><button class="b s" onclick="czDup()">Duplicate</button><button class="b s" onclick="czDel()">Delete</button><select onchange="czPreset(this.value);this.value=''"><option value="">Start from a preset…</option>${CZ_PRESETS.map(([n],i)=>`<option value="${i}">${n}</option>`).join('')}</select></div>
 <div class="st">Costumes are purely creative: they never change sales, fans, Buzz or member stats.${U.length?` · Worn by: ${U.map(x=>`<b>${esc(x.title)}</b>`).join(', ')}`:''}</div></div>`;
 return lib+head+czGridHtml(E,o,d,model)+czAssignPanel(o,songs,model)};
function czGridHtml(E,o,d,model){const cat=CZ_CATS.find(x=>x.k==E.cat)||CZ_CATS[0],P=czGetSlot(E.p,E.sel);
 const nav=`<div class="czcats" role="tablist">${CZ_CATS.map(c=>{const on=c.multi?Object.values(E.p[c.k]||{}).filter(Boolean).length:(E.p[c.k]&&E.p[c.k].t!='none'?1:0);return`<button role="tab" class="${c.k==E.cat?'on':''}" onclick="czCat('${c.k}')"><b>${c.n}</b><small>${c.jp}</small>${on?`<i>${c.multi?on:'✓'}</i>`:''}</button>`}).join('')}</div>`;
 const mem=o?czMembers(o):[];
 const stage=`<div class="czstagewrap"><div id="czstage" class="czstage">${czStageSvg()}</div><div class="row czpose"><label class="st">Model <select onchange="ui.czE.mid=+this.value;render()">${(mem.length?mem:S.members).map(m=>`<option value="${m.id}" ${m.id==(model&&model.id)?'selected':''}>${esc(m.name)}</option>`).join('')}</select></label><label class="st">Pose <select onchange="ui.czE.pose=+this.value;render()">${POSES.map((p,i)=>`<option value="${i}" ${i==E.pose?'selected':''}>${p[0]}</option>`).join('')}</select></label><label class="st">Expression <select onchange="ui.czE.ex=+this.value;render()">${EXN.map((n,i)=>`<option value="${i}" ${i==E.ex?'selected':''}>${n}</option>`).join('')}</select></label></div>
 <div class="czact">${E.dirty?'<span class="tag warn">Unsaved changes</span>':'<span class="tag">Saved</span>'}<button class="b" ${E.dirty?'':'disabled'} onclick="czRevert()">Revert</button><button class="b p" onclick="czSave()">💾 Save design</button>${o&&!czSongLocked(o)?`<button class="b" onclick="czAssignMain('${o.id}','${d.id}')">Use for "${esc(o.title)}"</button>`:''}</div></div>`;
 const items=`<div class="czitems">${cat.items.map(([t,n])=>{const on=cat.multi?!!czGetSlot(E.p,cat.k+'.'+t):(E.p[cat.k]||{t:'none'}).t==t,sel=E.sel==(cat.multi?cat.k+'.'+t:cat.k)&&on;return`<button class="czitem ${on?'on':''} ${sel?'sel':''}" onclick="czItem('${cat.k}','${t}')" title="${cat.multi?(on?'Click to edit':'Click to add'):n}">${czThumb(cat.k,t)}<small>${n}${cat.multi&&on?' ✓':''}</small></button>`}).join('')}</div>${cat.k=='bottom'&&E.p.top&&E.p.top.t=='dress'?'<p class="st">The top is a one-piece dress: its skirt is used instead of this bottom piece.</p>':''}${cat.multi?'<p class="st">Combine as many as you like: click an item to add it or to edit it, then use “Remove” to take it off.</p>':''}`;
 const vars=P&&P.t&&cat.vars&&cat.vars[P.t]?`<div class="row"><b>Style</b>${cat.vars[P.t].map((n,i)=>`<button class="b s ${(P.v|0)==i?'on':''}" onclick="czVar(${i})">${n}</button>`).join('')}</div>`:'';
 const colRow=([f,n])=>`<div class="czcol"><span>${n}</span><input type="color" value="${P[f]||'#ffffff'}" oninput="czCol('${f}',this.value,1)" onchange="czCol('${f}',this.value)" aria-label="${n} colour"><input class="hex" value="${P[f]||''}" maxlength="7" onchange="czCol('${f}',this.value)" aria-label="${n} HEX"></div>`,recent=UIP.czRecent||[];
 const editor=P&&P.t&&P.t!='none'?`<div class="czedit"><h3>${esc(czSlotName(E.sel))}${cat.multi?` <button class="b s" onclick="czRemove()">Remove</button>`:''}</h3>${vars}
 <div class="czsub">Pattern</div><div class="czpats">${CZ_PATS.map(([k,n])=>`<button class="czpat ${(P.pat||'solid')==k?'on':''}" onclick="czSetPat('${k}')" title="${n}">${czSwatch(k,P)}<small>${n}</small></button>`).join('')}</div>
 ${(P.pat||'solid')!='solid'?`<div class="row"><label class="st">Pattern size <input type="range" min=".4" max="2.4" step=".1" value="${P.ps||1}" oninput="czNum('ps',this.value,1)" onchange="czNum('ps',this.value)"></label><label class="st">Intensity <input type="range" min=".15" max="1" step=".05" value="${P.pd??.75}" oninput="czNum('pd',this.value,1)" onchange="czNum('pd',this.value)"></label></div>`:''}
 <div class="czsub">Fabric &amp; texture</div><div class="row czfabs">${CZ_FABS.map(([k,n])=>`<button class="b s ${(P.fab||'cotton')==k?'on':''}" onclick="czSetFab('${k}')">${n}</button>`).join('')}</div>${(P.pat||'solid')=='gradient'?'<div class="st">Fabric texture is not drawn on gradient pieces.</div>':''}<div class="czsub">Colours</div>${CZ_COLS.map(colRow).join('')}
 <div class="czsub">Palette &amp; recent colours</div><div class="row"><label class="st">Apply to <select id="czpt">${CZ_COLS.map(([f,n])=>`<option value="${f}">${n}</option>`).join('')}</select></label></div><div class="czpal">${CZ_PAL.map(c=>`<button style="background:${c}" onclick="czCol($('#czpt').value,'${c}')" aria-label="${c}"></button>`).join('')}</div>
 ${recent.length?`<div class="czsub">Recently used</div><div class="czpal">${recent.map(c=>`<button style="background:${c}" onclick="czCol($('#czpt').value,'${c}')" aria-label="${c}"></button>`).join('')}</div>`:''}</div>`:`<div class="czedit">${emptyBox(cat.multi?'Pick an item above to add it and edit its colours & pattern.':'Nothing selected here. Choose an item above.','👗')}</div>`;
 return `<div class="czgrid">${nav}${stage}<div class="czpanel c"><h3>${cat.n} <small class="st">${cat.jp}</small></h3>${items}${editor}</div></div>`}
function czAssignPanel(o,songs,model){const L=czLib().ds;
 let h=`<div class="c czasg"><h3>Assign costumes to songs</h3><p class="st">Each song wears the design assigned here; Single Production uses it automatically. One design can be reused by several songs, and changing a design updates every song that wears it.</p>
 <div class="czsongs">${songs.map(([s,k])=>{const d=czMain(s);return`<button class="czsong ${o&&s.id==o.id?'on':''}" onclick="czSelSong('${s.id}')"><span class="tag ${k=='Main'?'tmain':'tcoup'}">${k}</span><b>${esc(s.title||'Untitled')}</b><small>${d?'👗 '+esc(d.name):'⚠ no costume assigned'}${lockedSong(s.id)?' · 🔒':''}</small></button>`}).join('')||'<span class="st">No songs are being planned. Start a single in Music Production → Single Production.</span>'}</div>`;
 if(!o)return h+'</div>';
 const z=czSongZ(o),lk=czSongLocked(o),dis=lk?'disabled':'',mem=czMembers(o),main=czMain(o);
 h+=`<div class="row"><b>“${esc(o.title)}”</b>${lk?'<span class="tag warn">🔒 In production: assignment locked</span>':''}<label class="st">Main costume <select ${dis} onchange="czAssignMain('${o.id}',this.value)"><option value="">— none —</option>${L.map(x=>`<option value="${x.id}" ${main&&main.id==x.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label>
 <span class="st">Mode</span><button class="b s ${z.mode=='uniform'?'on':''}" ${dis} onclick="czMode('${o.id}','uniform')">Uniform costume</button><button class="b s ${z.mode=='individual'?'on':''}" ${dis} onclick="czMode('${o.id}','individual')">Individual costumes</button></div>
 <p class="st">${z.mode=='uniform'?'Everyone wears the main costume. You can tweak colours for a single member below (only for this song).':'Each member can wear a different design from the library; members without one wear the main costume.'}</p>`;
 if(!mem.length)return h+'<p class="st">This song has no Senbatsu yet. Choose its members in Single Production → Senbatsu Selection.</p></div>';
 h+=`<div class="czlineup">${mem.map(m=>{const mm=z.mem[m.id]||{},a=ap(m),cd=czFor(o,m.id),dn=(czD(z.mode=='individual'&&mm.d?mm.d:z.main)||{}).name;return`<div class="czm ${model&&m.id==model.id?'on':''}"><button class="czmfig" onclick="ui.czE.mid=${m.id};render()" title="Preview ${esc(m.name)}"><svg viewBox="10 -2 80 200">${fig(m,{pose:0,of:a.of,oh:a.oh,ac:a.ac,ex:2,...(cd?{cd}:{})})}</svg></button><b>${esc(m.name.split(' ')[0])}</b>${z.mode=='individual'?`<select ${dis} onchange="czAssignMem('${o.id}',${m.id},this.value)"><option value="">Main costume</option>${L.map(x=>`<option value="${x.id}" ${mm.d==x.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select>`:`<small>${esc(dn||'no costume')}${mm.ov&&Object.keys(mm.ov).length?' · tweaked':''}</small>`}</div>`}).join('')}</div>`;
 if(z.mode=='uniform'&&main&&model&&mem.some(m=>m.id==model.id)){const mm=z.mem[model.id]||{},base=main.p,paths=['top','bottom','outer','sleeve','collar','over',...Object.keys(base.x||{}).filter(k=>base.x[k]).map(k=>'x.'+k)].filter(k=>{const s=czGetSlot(base,k);return s&&s.t&&s.t!='none'});
  h+=`<div class="czov"><b>Colour tweaks for ${esc(model.name)}</b> <span class="st">(only this member, only this song)</span><div class="row">${paths.map(k=>{const cur=mm.ov&&mm.ov[k]?mm.ov[k].c1:czGetSlot(base,k).c1;return`<label class="st czovc">${esc(czSlotName(k))}<input type="color" value="${cur}" ${dis} onchange="czOv('${o.id}',${model.id},'${k}',this.value)">${mm.ov&&mm.ov[k]?`<button class="b s" ${dis} onclick="czOv('${o.id}',${model.id},'${k}','')">↺</button>`:''}</label>`}).join('')}</div>${mm.ov&&Object.keys(mm.ov).length?`<button class="b s" ${dis} onclick="czOvReset('${o.id}',${model.id})">Reset colours</button>`:''}</div>`}
 return h+'</div>'}

// ---- small costume badge used by Single Production (read-only; assignment happens in the designer)
function czBadge(o){czLib();const d=czMain(o),pm=get(o.center)||czMembers(o)[0];return`<div class="czbadge">${d&&pm?czDesignThumb(d,pm,38):'<span class="czbx">👗</span>'}<div><b>Costume</b> <span class="st">${d?esc(d.name):'⚠ No costume assigned'}</span><br><button class="b s ${d?'':'p'}" onclick="czOpen('${o.id}')">${d?'Change in Costume Designer':'Assign in Costume Designer'}</button></div></div>`}

// ---- CD Cover Studio: jacket members wear the main song's assigned costumes --------------
function czCoverSync(){const d=ui.cd;if(!d||ui.cvCtx=='album'||!S.pj)return;const o=S.songs[S.pj.mainId];const on=d.useCz!==false&&czMain(o);d.layers.forEach(l=>{if(l.t!='m')return;if(on){const cd=czFor(o,l.mid);if(cd)l.cd=cd;else delete l.cd}else delete l.cd})}
const _czCover=V.cover;V.cover=function(){czLib();czCoverSync();let h=_czCover.call(V);if(ui.cd&&!ui.cd._czs){ui.cd._czs=1;czCoverSync();h=_czCover.call(V)}
 const o=S.pj&&S.songs[S.pj.mainId],has=o&&czMain(o)&&ui.cvCtx!='album';
 return(has?`<div class="c czcov"><b>👗 Costume designs on the jacket</b><span class="st">Members are drawn in the costumes assigned to "${esc(o.title)}".</span><button class="b s ${ui.cd&&ui.cd.useCz!==false?'on':''}" onclick="ui.cd.useCz=true;render()">Use song designs</button><button class="b s ${ui.cd&&ui.cd.useCz===false?'on':''}" onclick="ui.cd.useCz=false;render()">Use studio costume settings</button><button class="b s" onclick="czOpen('${o.id}')">Edit designs</button></div>`:'')+h};
