// =====================================================================================
//  IDOLVERSE48: Select Bloom! — interaction fixes & small features
//  · Roadshow participation per single (only Roadshows that actually took place)
//  · Roadshow "Select Members" picker (select / deselect / quick sets)
//  · Completed member costumes are added to the Costume Design Library (no duplicates)
//  · "Copy to members" works on every member, with an overwrite confirmation
//  · CD Cover Studio: members default to their Title Track costume; any other costume
//    can be chosen per member and is stored in the cover draft
// =====================================================================================

// ---- Roadshow participation (per single, completed Roadshows only) ------------------------------
function rsPartStore(){S.rsPart=S.rsPart||{};return S.rsPart}
function rsPartRec(ev){if(!ev||!ev.rid||!ev.d1)return;const P=rsPartStore(),R=P[ev.rid]=P[ev.rid]||{ev:[]};if(R.ev.some(e=>e.id==ev.id))return;
 R.ev.push({id:ev.id,loc:ev.loc||ev.dest||null,day:ev.day,members:(ev.members||[]).slice(),status:'completed'})}
function rsPartBackfill(){if(!S)return;(S.cal||[]).forEach(e=>{if(e.type=='road'&&e.d1)rsPartRec(e)});Object.values((S.rs&&S.rs.hist)||{}).forEach(L=>(L||[]).forEach(h=>{if(h&&h.rid&&(h.members||h.ids)&&(h.d1||h.done||h.fin))rsPartRec({id:h.id||('h'+h.rid+(h.loc||'')+h.day),rid:h.rid,loc:h.loc,day:h.day,members:h.members||h.ids,d1:1})}))}
function rsParted(rid){const R=rsPartStore()[rid],s=new Set();(R&&R.ev||[]).forEach(e=>(e.members||[]).forEach(id=>s.add(id)));return s}
const _fxRsRun=rsRun;rsRun=function(ev,part){const r=_fxRsRun.apply(this,arguments);try{rsPartRec(ev)}catch(e){console.error(e)}return r};
const _fxMig=migrate;migrate=function(){const r=_fxMig.apply(this,arguments);try{rsPartBackfill()}catch(e){console.error(e)}return r};

// ---- Roadshow member picker ---------------------------------------------------------------------
function rsSelHtml(){const P=ui.rsp;if(!P)return'';const x=S.singles.find(s=>s.rid==P.rid);if(!x)return'';const E=rsElig(x),I=plTTInfo(x),PT=rsParted(x.rid),f=ui.rsf=ui.rsf||{tt:0,np:0},L=E.filter(id=>(!f.tt||I.has(id))&&(!f.np||!PT.has(id)));
 return`<h2 class="ht">Select Roadshow members</h2><p class="st">${P.sel.filter(i=>E.includes(i)).length} selected · tap a member to select or deselect.</p><div class="row"><button class="b s" onclick="rsSelSet('all')">Select all shown</button><button class="b s" onclick="rsSelSet('tt')">Senbatsu</button><button class="b s" onclick="rsSelSet('np')">Not yet participated</button><button class="b s" onclick="rsSelSet('none')">Clear</button></div>
 <div class="row"><label class="plnm"><input type="checkbox" ${f.tt?'checked':''} onchange="ui.rsf.tt=this.checked?1:0;rsSelRefresh()"> Show Only Senbatsu</label><label class="plnm"><input type="checkbox" ${f.np?'checked':''} onchange="ui.rsf.np=this.checked?1:0;rsSelRefresh()"> Show Only Members Who Have Not Participated</label></div>
 <div class="g msel rssel">${L.map(id=>{const m=get(id),on=P.sel.includes(id),bz=P.day!=null&&busy(id,[P.day,P.day+1]).length;return`<button class="c m ${on?'msel-on':''}" style="${bz?'opacity:.5':''}" onclick="rsSelTog(${id})">${on?'<i class="mselck">✔</i>':''}${ptc(m,44)}<div class="st"><b>${esc(m.name)}</b><br>${plBadge(I.get(id))}<br>${plPartB(x.rid,id)}</div></button>`}).join('')||'<p class="st">No members match these filters.</p>'}</div><div class="row"><button class="b p" onclick="ui.mod=null;render()">Done</button></div>`}
function rsSelOpen(){if(!ui.rsp)return;ui.rsp.mode='sel';ui.mod={t:'html',h:rsSelHtml(),rssel:1};render()}
function rsSelRefresh(){if(ui.mod&&ui.mod.rssel)ui.mod.h=rsSelHtml();render()}
function rsSelTog(id){const n=ui.rsp.sel.length;rsTogM(id);rsSelRefresh()}
function rsSelSet(k){const P=ui.rsp,x=S.singles.find(s=>s.rid==P.rid);if(!x)return;const E=rsElig(x),I=plTTInfo(x),PT=rsParted(x.rid),f=ui.rsf||{},shown=E.filter(id=>(!f.tt||I.has(id))&&(!f.np||!PT.has(id))),free=id=>!(P.day!=null&&busy(id,[P.day,P.day+1]).length);
 if(k=='none')P.sel=[];else{const add=k=='all'?shown:k=='tt'?E.filter(id=>I.has(id)):E.filter(id=>!PT.has(id));add.filter(free).forEach(id=>{if(!P.sel.includes(id))P.sel.push(id)})}rsSelRefresh()}

// ---- costumes: completed designs go to the library; copy to any members -----------------------------
function fxLibAdd(p,name){czLib();const L=czLib().ds,key=JSON.stringify(p);if(L.some(d=>JSON.stringify(d.p)==key))return false;L.push({id:czId(),name:String(name).slice(0,40),p:czClone(p),style:'',created:S.day,updated:S.day,auto:1});return true}
const _fxCzSave=plCzSave;plCzSave=function(){const s=ui.scz;const r=_fxCzSave.apply(this,arguments);try{const H=s&&plCzHost(s.song),mm=H&&H.o.cdz.mem[s.mid],m=get(s&&s.mid);if(mm&&mm.ok&&mm.own&&m&&!H.locked&&fxLibAdd(mm.own.p,`${H.single?'Single Costume':H.o.title} — ${m.name}`))toast(`Saved — also added to the Costume Design Library.`)}catch(e){console.error(e)}return r};
function plCzCopyHtml(){const s=ui.scz,H=s&&plCzHost(s.song);if(!H)return'';const c=ui.czcp=ui.czcp||{sel:[]},M=(H.o.cdz&&H.o.cdz.mem)||{},src=get(s.mid),T=H.mem.filter(m=>m.id!=s.mid);
 return`<h2 class="ht">Copy ${esc(src?src.name.split(' ')[0]:'')}'s costume to…</h2><p class="st">The design currently in the editor is copied. Members who already have a costume are marked; their costume is replaced only if you select them.</p><div class="row"><button class="b s" onclick="plCzCpSet('none_cz')">Members without a costume</button><button class="b s" onclick="plCzCpSet('all')">All members</button><button class="b s" onclick="plCzCpSet('clear')">Clear</button></div>
 <div class="g msel">${T.map(m=>{const on=c.sel.includes(m.id),has=!!(M[m.id]&&M[m.id].own&&M[m.id].ok);return`<button class="c m ${on?'msel-on':''}" onclick="plCzCpTog(${m.id})">${on?'<i class="mselck">✔</i>':''}${ptc(m,44)}<div class="st"><b>${esc(m.name)}</b><br>${has?'<span class="rsb s">Has a costume</span>':'<span class="rsb n">No costume</span>'}</div></button>`}).join('')}</div><div class="row"><button class="b p" ${c.sel.length?'':'disabled'} onclick="plCzCpGo()">Copy to ${c.sel.length} member(s)</button><button class="b" onclick="ui.mod=null;render()">Cancel</button></div>`}
plCzCopyAll=function(){const H=ui.scz&&plCzHost(ui.scz.song);if(!H)return;if(H.locked)return toast('The release is in production: costumes are locked.','err');if(H.mem.length<2)return toast('There is no other member in this lineup.','err');ui.czcp={sel:[]};ui.mod={t:'html',h:plCzCopyHtml(),czcp:1};render()};
function plCzCpTog(id){const c=ui.czcp,i=c.sel.indexOf(id);if(i>=0)c.sel.splice(i,1);else c.sel.push(id);ui.mod.h=plCzCopyHtml();render()}
function plCzCpSet(k){const s=ui.scz,H=plCzHost(s.song),M=H.o.cdz.mem||{},T=H.mem.filter(m=>m.id!=s.mid);ui.czcp.sel=k=='clear'?[]:T.filter(m=>k=='all'||!(M[m.id]&&M[m.id].own&&M[m.id].ok)).map(m=>m.id);ui.mod.h=plCzCopyHtml();render()}
function plCzCpGo(){const s=ui.scz,H=plCzHost(s.song),o=H.o,z=czSongZ(o),sel=ui.czcp.sel.slice(),over=sel.filter(id=>z.mem[id]&&z.mem[id].own&&z.mem[id].ok);if(!sel.length)return;
 const go=()=>{const p=czClone(ui.czE.p);sel.forEach(id=>{const m=get(id),mm=z.mem[id]=z.mem[id]||{};mm.own={name:`${H.single?'Single Costume':o.title} — ${m.name}`,p:czClone(p),updated:S.day};mm.ok=true});if(!H.single)czSync(o);fxLibAdd(p,`${H.single?'Single Costume':o.title} — ${get(s.mid).name}`);ui.mod=null;ui.czcp=null;toast(`Costume copied to ${sel.length} member(s).`);render()};
 if(over.length)ask(`${over.length} of the selected member(s) already have a costume. Replace it with this design?`,go,'Replace costumes');else go()}
const _fxSongcz=V.songcz;V.songcz=function(){return _fxSongcz.call(V).replace('>Copy to members without a costume</button>','>Copy to members…</button>')};

// ---- CD Cover Studio: Title Track costume by default, any costume per member -----------------------
function covSrcList(mid){const p=S.pj,L=[];if(!p)return L;const mn=S.songs[p.mainId];if(czFor(mn,mid))L.push(['tt',`Title Track costume — ${mn.title}`]);
 p.coup.forEach(i=>{const o=S.songs[i];if(o&&(o.slots||[]).includes(mid)&&czFor(o,mid))L.push(['song:'+i,`Song costume — ${o.title}`])});
 const sc=p.scz&&p.scz.cdz&&p.scz.cdz.mem&&p.scz.cdz.mem[mid];if(sc&&sc.own&&sc.ok)L.push(['scz','Single Costume']);czLib().ds.forEach(d=>L.push(['lib:'+d.id,'Library — '+d.name]));L.push(['cos','Studio outfit (cover presets)']);return L}
function covSrcResolve(src,mid){const p=S.pj;if(!p)return null;if(!src||src=='tt')return czFor(S.songs[p.mainId],mid);if(src.startsWith('song:'))return czFor(S.songs[src.slice(5)],mid);if(src=='scz'){const sc=p.scz&&p.scz.cdz.mem[mid];return sc&&sc.own?sc.own.p:null}if(src.startsWith('lib:')){const d=czD(src.slice(4));return d?d.p:null}return null}
czCoverSync=function(){const d=ui.cd;if(!d||ui.cvCtx=='album'||!S.pj)return;const o=S.songs[S.pj.mainId];const on=d.useCz!==false;d.layers.forEach(l=>{if(l.t!='m')return;if(l.czSrc=='cos'){delete l.cd;return}if(!on&&!l.czSrc){delete l.cd;return}const cd=covSrcResolve(l.czSrc,l.mid);if(cd)l.cd=czClone(cd);else delete l.cd})};
function covSrcSet(v){const l=SEL();if(!l||l.t!='m')return;snap();l.czSrc=v||'tt';if(v=='tt')delete l.czSrc;czCoverSync();toast('Cover costume changed. The original design is not modified.');render()}
const _fxCover=V.cover;V.cover=function(){let h=_fxCover.call(V);try{const l=typeof SEL=='function'?SEL():null;if(ui.cvCtx!='album'&&S.pj&&l&&l.t=='m'){const m=get(l.mid),L=covSrcList(l.mid),cur=l.czSrc||(L.some(x=>x[0]=='tt')?'tt':'cos');
 const card=`<div class="c covsrc"><b>Costume for ${esc(m?m.name:'member')}</b> <select onchange="covSrcSet(this.value)">${L.map(([k,n])=>`<option value="${esc(k)}" ${k==cur?'selected':''}>${esc(n)}</option>`).join('')}</select><span class="st">Default: the Title Track Senbatsu costume of this single. Changing it here never edits the costume design.</span></div>`;
 const i=h.indexOf('<div class="c czcov">');h=i>=0?h.slice(0,i)+card+h.slice(i):card+h}}catch(e){console.error(e)}return h};
