// =====================================================================================
//  Single Production flow (7 steps) · editions · song sheet after Senbatsu · costume names
// -------------------------------------------------------------------------------------
//  Steps: 1 Release information · 2 Songs & Senbatsu · 3 Costumes · 4 Music Video ·
//         5 Sales & Editions (Release Day) · 6 CD covers (Types and Limited Editions) · 7 Budget & start
//  · A new song goes straight to Senbatsu Selection; its Song Sheet opens after the Senbatsu is saved.
//  · Regular Edition = Pre-order, Limited Edition = Limited Quantity.
// =====================================================================================
var PL_STEP7=1;
// ---- steps 4 · 5 · 6 -------------------------------------------------------------------------------------------------------
function plMvDone(p,all){return all.every(id=>{const o=S.songs[id];if(!o||plReused(p,o))return true;const v=mvOf(o);return!v.on||v.st!='plan'})}
function plMvStepHtml(p,all,dis){const alb=plAlb(p);
 return`<div data-step="4"><h3 class="sth">4 · Music Video</h3><p class="st">Choose for each song whether it gets a Music Video and plan it. The MV is filmed during production and published on Release Day. The Senbatsu and costumes chosen in steps 2–3 appear in the MV.</p>${all.map(id=>{const o=S.songs[id];if(!o)return'';const tg=`<span class="tag ${id==p.mainId?'tmain':'tcoup'}">${PL_ROLE(p,id)}</span>`;
  if(plReused(p,o))return`<div class="c songc"><div class="sh2">${tg}<b>${esc(o.title)}</b></div><p class="st">Released song: no new video.</p></div>`;
  return`<div class="c songc ${id==p.mainId?'main':''}"><div class="sh2">${tg}<b>${esc(o.title)}</b></div>${mvCardHtml(o,p,dis)}</div>`}).join('')}</div>`}
function plSaleDone(p){if(plAlb(p)||p.ge)return true;try{return!seErrs(p).length}catch(e){return true}}
function plSaleStepHtml(p){if(plAlb(p))return`<div data-step="5"><h3 class="sth">5 · Sales &amp; Editions</h3><p class="st">Albums are sold as one edition per track type — nothing to set here.</p></div>`;
 if(p.ge)return`<div data-step="5"><h3 class="sth">5 · Sales &amp; Editions</h3><p class="st">The General Election single follows the election schedule.</p></div>`;
 let h='';try{h=(p.status=='draft'?seRelCard(p):'')+seCardHtml(p)}catch(e){console.error(e)}return`<div data-step="5"><h3 class="sth">5 · Sales &amp; Editions</h3>${h}</div>`}
const plLimEds=p=>{try{const SL=!plAlb(p)&&seSale(p);return SL?SL.eds.filter(e=>e.kind=='lim'):[]}catch(e){return[]}};
function plLimCovDone(p){return plLimEds(p).every(e=>{const c=S.cov[seEdKey(p,e)];return c&&c.status=='confirmed'})}
function plLimCovHtml(p){return plLimEds(p).map(e=>{const key=seEdKey(p,e),cc=S.cov[key];return`<div class="c covc"><b>${esc(seEdName(p,e))}</b><div class="covw">${cc?coverSvg(cc,{size:170}):'<div class="cover empty-cover">No cover yet</div>'}</div><div class="st">${cc?(cc.status=='confirmed'?'✔ Cover confirmed':'✎ Draft — confirm it in the studio'):'Not designed yet'}</div><div class="row" style="justify-content:center"><button class="b s p" onclick="openCov('${esc(key)}')">🎨 Design cover</button></div></div>`}).join('')}
// ---- editions: Regular = Pre-order, Limited = Limited Quantity ------------------------------------------------------------
{const f=seSale;seSale=function(p){const SL=f.apply(this,arguments);try{if(SL&&p&&p.status=='draft')SL.eds.forEach(e=>{const m=e.kind=='lim'?'qty':'pre';if(e.m!=m){e.m=m;if(m=='pre'){e.od=e.od|0;e.len=Math.max(1,Math.min(SE_MAXPRE,e.len||30))}else e.cap=e.cap||Math.max(2000,Math.round(seEst(p)*.6/1000)*1000)}})}catch(e){}return SL}}
{const f=seEdSet;seEdSet=function(id,k,v){if(k=='m')return;return f.apply(this,arguments)}}
// ---- a new song: Senbatsu first, then its Song Sheet ------------------------------------------------------------------------
let PL8_NEW=0;
['plAddCoup','plNewAlbSong'].forEach(fn=>{const f=window[fn];if(typeof f!='function')return;window[fn]=function(){PL8_NEW++;try{return f.apply(this,arguments)}finally{PL8_NEW--}}});
{const f=seSheet;seSheet=function(id){if(PL8_NEW&&S.songs[id]&&!lockedSong(id)){S.songs[id].shPend=1;ui.mod=null;view='music';ui.mstep=2;ui.psong=id;PL8_FOCUS=id;render();return}return f.apply(this,arguments)}}
// a new song opens on its song card (title, genre, concept, lyrics) in step 2
let PL8_FOCUS=null;{const f=render;render=function(){const r=f.apply(this,arguments);if(PL8_FOCUS&&view=='music'){const id=PL8_FOCUS;setTimeout(()=>{try{const el=document.querySelector(`input[oninput*="plTitle('${id}'"]`);if(el){PL8_FOCUS=null;el.closest('.songc').scrollIntoView({block:'center'});el.closest('.songc').classList.add('plnew')}}catch(e){}},60)}return r}}
{const f=fmSave;fmSave=function(){const o=S.songs[ui.es];const r=f.apply(this,arguments);try{if(o&&o.shPend&&o.fm&&o.fm.saved&&!fmCheck(o).length){delete o.shPend;view='music';seSheet(o.id)}}catch(e){console.error(e)}return r}}
{const f=seSheetHtml;seSheetHtml=function(id){let h=f.apply(this,arguments);try{const o=S.songs[id];if(o&&o.fm&&o.fm.saved)h=h.replace('<p class="st">Concept Compatibility and Senbatsu Ability are shown after you choose this song\'s Senbatsu.</p>','').replace(`<button class="b p"  onclick="ui.mod=null;editLine('${id}','music')">Proceed to Senbatsu Selection ▶</button>`,`<button class="b p" onclick="ui.mod=null;goView('music')">Back to Single Production ▶</button>`)}catch(e){}return h}}
// ---- Popularity Index is no longer shown (it still works inside the simulation) ----------------------------------------------
[STATS,typeof ORG_SORT!='undefined'?ORG_SORT:[]].forEach(L=>{const i=L.findIndex(x=>x[0]=='pop');if(i>=0)L.splice(i,1)});
function plNoPop(){try{[['gs','k'],['ams','k'],['aa','attr'],['thaa','attr']].forEach(([o,k])=>{if(ui[o]&&ui[o][k]=='pop')ui[o][k]='fans'});if(!ui.gs)ui.gs={k:'fans',dir:'d'};if(!ui.aa)ui.aa={attr:'fans',dir:'d',gen:'all',team:'all',rar:'all'};if(!ui.ams)ui.ams={k:'fans',dir:'d'};if(ui.orgsort=='pop')ui.orgsort='';if(ui.f&&(!ui.f.sk||!STATS.some(x=>x[0]==ui.f.sk)))ui.f.sk='fans';if(ui.sf&&ui.sf.sort&&!STATS.some(x=>x[0]==ui.sf.sort))ui.sf.sort='fans';
 if(ui.mls)for(const k in ui.mls)if(ui.mls[k]&&ui.mls[k].k=='pop')ui.mls[k].k=''}catch(e){}}
{const f=render;render=function(){plNoPop();return f.apply(this,arguments)}}
{const f=profHtml;profHtml=function(){return f.apply(this,arguments).replace(/ Popularity index \d+ is computed from fanbase and buzz\./,'')}}
// ---- Costume Library picker: categories (group / team / single / theater), newest or oldest first, previews ----------------
{const f=V.songcz;V.songcz=function(){return f.apply(this,arguments).replace(/<select onchange="if\(this\.value\)plCzLib\(this\.value\);this\.value=''"><option value="">Start from a library design…<\/option>[\s\S]*?<\/select>/,`<button class="b s" onclick="czPickOpen('pl')">📚 Library design…</button>`)}}
function czPkSet(k,v){if(!ui.czpk)return;ui.czpk[k]=v;ui.mod.h=czPickHtml();render()}
czPickHtml=function(){const c=ui.czpk;if(!c)return'';const X=c.ctx=='th'?thCzCtx():null,m=X?get(X.c.mid):get(ui.scz&&ui.scz.mid);if(!m)return'';const{L,T}=czPickList(),tr=X&&X.tr;
 c.ty=c.ty||'all';c.grp=c.grp??'all';c.team=c.team||'all';c.so=c.so||'new';
 const C=tf7CzMap(),ord=new Map(czLib().ds.map((d,i)=>[d.id,i])),info=e=>{if(e.k!='lib')return{r:1,g:0,hd:''};const d=czD(e.id);return d?tf7CzInfo(d,C):{r:2,g:0,hd:''}},GL=S.groups||[];
 const base=(c.src=='th'?T:L).map(e=>({...e,f:info(e),cr:e.k=='lib'?((czD(e.id)||{}).created|0):0,ix:e.k=='lib'?ord.get(e.id)|0:0}));
 const teams=[...new Set(base.filter(e=>e.f.r==1&&e.f.hd).map(e=>e.f.hd))],q=(c.q||'').toLowerCase();
 const list=base.filter(e=>(!q||(e.name+' '+e.assoc).toLowerCase().includes(q))&&(c.ty=='all'||(c.ty=='single'&&e.f.r==0)||(c.ty=='theater'&&e.f.r==1)||(c.ty=='other'&&e.f.r==2))&&(c.grp=='all'||e.f.g==+c.grp)&&(c.team=='all'||e.f.hd==c.team))
  .sort((a,b)=>(c.so=='old'?1:-1)*((a.cr-b.cr)||(a.ix-b.ix)));
 const chip=(k,v,n)=>`<button class="b s ${String(c[k])==String(v)?'on':''}" onclick="czPkSet('${k}','${v}')">${esc(n)}</button>`;
 return`<h2 class="ht">📚 Use existing costume</h2><p class="st">Pick a saved costume. ${esc(m.name)} gets an <b>independent copy</b>: editing it later never changes the library design, other songs or other Stages.</p>
 <div class="row"><button class="b s ${c.src!='th'?'on':''}" onclick="ui.czpk.src='lib';ui.mod.h=czPickHtml();render()">Costume Library (${L.length})</button>${c.ctx=='th'?`<button class="b s ${c.src=='th'?'on':''}" onclick="ui.czpk.src='th';ui.mod.h=czPickHtml();render()">Stage costumes (${T.length})</button>`:''}<input placeholder="Search costume, song or Stage" value="${esc(c.q||'')}" onchange="ui.czpk.q=this.value;ui.mod.h=czPickHtml();render()"></div>
 ${c.src=='th'?'':`<div class="row czpkf"><span class="st">Category</span>${chip('ty','all','All')}${chip('ty','single','Single')}${chip('ty','theater','Theater')}${chip('ty','other','Other')}</div>
 ${GL.length>1?`<div class="row czpkf"><span class="st">Group</span>${chip('grp','all','All groups')}${GL.map((g,i)=>chip('grp',i,g.name)).join('')}</div>`:''}
 ${teams.length&&c.ty!='single'&&c.ty!='other'?`<div class="row czpkf"><span class="st">Team</span>${chip('team','all','All teams')}${teams.map(t=>`<button class="b s ${c.team==t?'on':''}" onclick='czPkSet("team",${JSON.stringify(t).replace(/'/g,"&#39;")})'>${esc(t.replace(/^Theater costumes · /,''))}</button>`).join('')}</div>`:''}`}
 <div class="row czpkf"><span class="st">Order</span>${chip('so','new','Newest first')}${chip('so','old','Oldest first')}<span class="st">${list.length} costume(s)</span></div>
 <div class="czpick">${list.map(e=>`<div class="czpki">${thFigCd(m,e.p,62)}<b>${esc(e.name)}</b><small>${esc(e.f.hd||e.assoc)}</small><small>${e.use?`used ${e.use}×`:'not used yet'}</small><div class="row"><button class="b s p" onclick="czPickUse('${e.k}','${e.id}',0)">${c.ctx=='th'&&!tr?'Use for this member':c.ctx=='th'?'This member':'Load into editor'}</button><button class="b s" onclick="czPickUse('${e.k}','${e.id}',1)">All members</button></div></div>`).join('')||emptyBox('No costume in this category.','👗')}</div>`};
// ---- Costume Library names: "Song — Center", "Song #2", "<Group> <Title Track>" instead of member names --------------------
const plCzMemN=nm=>(S.members||[]).find(m=>m.name==nm)||null;
function plCzBase(name,ctx){const i=String(name).lastIndexOf(' — ');if(i<0)return null;const title=name.slice(0,i),m=plCzMemN(name.slice(i+3));if(!m)return null;
 if(title=='Single Costume'){const g=grp((ctx&&ctx.gid)??gsAg()),mt=ctx&&ctx.main!=null?ctx.main:(S.pj&&S.songs[S.pj.mainId]?S.songs[S.pj.mainId].title:'');return`${g?g.name+' ':''}${mt}`.trim()||'Single Costume'}
 let cen=[];try{if(ctx&&ctx.cen)cen=ctx.cen;else if(view=='thcz'&&thCzCtx()){const X=thCzCtx();cen=[thCen(X.s,X.it),X.it.center2]}else{const o=(ui.scz&&S.songs[ui.scz.song]&&S.songs[ui.scz.song].title==title)?S.songs[ui.scz.song]:Object.values(S.songs||{}).find(z=>z&&z.title==title);cen=(o&&o.centers)||[]}}catch(e){}
 return cen.includes(m.id)?`${title} — Center`:title}
function plCzNum(base,d){const L=czLib().ds,re=new RegExp('^'+base.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?: #(\\d+))?$'),O=L.filter(x=>x!==d&&re.test(x.name));if(!O.length)return base;let mx=0;O.forEach(x=>{const k=x.name.match(re);if(k[1])mx=Math.max(mx,+k[1]);else{x.name=base+' #1';mx=Math.max(mx,1)}});return base+' #'+(mx+1)}
{const f=fxLibAdd;fxLibAdd=function(p,name){const n0=czLib().ds.length;const r=f.apply(this,arguments);try{if(r&&czLib().ds.length>n0){const d=czLib().ds.at(-1),b=plCzBase(name);if(b)d.name=plCzNum(b.slice(0,34),d)}}catch(e){console.error(e)}return r}}
// saves made before: rename the auto-saved library designs once
function plCzRename(){if(!S||S.czNm8)return;S.czNm8=1;try{const L=czLib().ds.filter(d=>d.auto&&/ — /.test(d.name)).sort((a,b)=>(a.created|0)-(b.created|0));
 L.forEach(d=>{const i=d.name.lastIndexOf(' — '),title=d.name.slice(0,i),m=plCzMemN(d.name.slice(i+3));if(!m)return;let ctx=null;const key=JSON.stringify(d.p);
  if(title=='Single Costume'||title=='Album Costume'){(S.groups&&S.groups.length?S.groups:[{id:null}]).forEach(g=>{if(ctx)return;try{gsWith(g.id,()=>{[...(S.singles||[]),...(S.albums||[])].forEach(x=>{if(ctx)return;const z=x.scz&&x.scz.cdz;if(z&&Object.values(z.mem||{}).some(mm=>mm&&mm.own&&JSON.stringify(mm.own.p)==key))ctx={gid:g.id,main:(S.songs[x.mainId]||{}).title||x.title||''}})})}catch(e){}});if(!ctx)ctx={gid:gsGid(m),main:''}}
  else if(d.stg){const s=thStage(d.stg),it=s&&thAll(s).find(z=>(S.songs[z.song]||{}).title==title);ctx={cen:it?[it.center,it.center2].filter(x=>x!=null):[]}}
  else{let cen=null;(S.groups&&S.groups.length?S.groups:[{id:null}]).forEach(g=>{if(cen)return;try{gsWith(g.id,()=>{const o=Object.values(S.songs||{}).find(z=>z&&z.title==title);if(o)cen=o.centers||[]})}catch(e){}});ctx={cen:cen||[]}}
  const b=plCzBase(d.name,ctx);if(b)d.name=plCzNum(b.slice(0,34),d)})}catch(e){console.error(e)}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{plCzRename()}catch(e){}return r}}
// ---- CD cover studio: random members / positions / poses; a random cover also moves its texts --------------------------------
const CV_TXT=[{T:[256,70],G:[256,458],E:[400,492],N:[96,28]},{T:[256,430],G:[256,52],E:[410,94],N:[92,486]},{T:[256,396],G:[256,452],E:[256,494],N:[256,34]},{T:[256,118],G:[256,170],E:[96,492],N:[420,32]},{T:[256,250],G:[256,470],E:[410,30],N:[100,30]}];
function cvTextRand(d){if(!d||!d.layers)return;const L=CV_TXT[Math.floor(Math.random()*CV_TXT.length)],k={'Single Title':'T','Group Name':'G','Edition Label':'E','Release Number':'N'};d.layers.forEach(l=>{if(l.t!='x'||l.lock)return;const q=L[k[l.name]];if(q){l.x=q[0]+rnd(-8,8);l.y=q[1]+rnd(-4,4)}})}
const cvMs=()=>(ui.cd&&ui.cd.layers||[]).filter(l=>l.t=='m'&&!l.lock);
function cvPoolIds(){const P=cvPool();if(!P.ok)return[];const L=P.list&&P.list.length?P.list:(S.members||[]).filter(m=>isAct(m)).map(m=>m.id);return L.filter(id=>get(id))}
function cvRandMem(){const M=cvMs();if(!M.length)return toast('There is no member on this cover yet.','err');const used=new Set(ui.cd.layers.filter(l=>l.t=='m').map(l=>l.mid)),free=cvPoolIds().filter(id=>!used.has(id)).sort(()=>Math.random()-.5);
 if(!free.length)return toast('Every Senbatsu member is already on the cover.','err');snap();let n=0;M.forEach(l=>{const id=free.shift();if(id==null)return;const nl=mkM(id);inh(nl,ui.cd);['x','y','s','r','fl','pose','hide'].forEach(k=>nl[k]=l[k]);nl.id=l.id;Object.assign(l,nl);n++});toast(`${n} member(s) on the cover replaced at random.`);render()}
function cvRandPos(){const M=cvMs();if(!M.length)return toast('There is no member on this cover yet.','err');snap();const n=M.length,T=Math.floor(Math.random()*3);let P=[];
 if(n==1)P=[[rnd(170,340),rnd(260,320),+(1.5+Math.random()*.4).toFixed(2)]];
 else if(T==0){const st=Math.min(150,400/Math.max(1,n-1));P=M.map((_,i)=>[256-st*(n-1)/2+st*i,rnd(280,330),+(Math.max(.8,1.7-n*.12)).toFixed(2)])}
 else if(T==1){const f=Math.ceil(n/2),b=n-f;P=[...Array(b)].map((_,i)=>[256-(110*(b-1))/2+110*i,250,+(Math.max(.75,1.3-n*.07)).toFixed(2)]).concat([...Array(f)].map((_,i)=>[256-(130*(f-1))/2+130*i,340,+(Math.max(.85,1.55-n*.08)).toFixed(2)]))}
 else{P=M.map(()=>[rnd(110,400),rnd(240,350),+(Math.max(.8,1.6-n*.1)+Math.random()*.2).toFixed(2)])}
 const ord=M.slice().sort(()=>Math.random()-.5);ord.forEach((l,i)=>{const q=P[i]||P[0];l.x=Math.round(q[0]);l.y=Math.round(q[1]);l.s=q[2]});
 // draw back members first
 {const Ls=ui.cd.layers,ix=[];Ls.forEach((l,i)=>{if(l.t=='m')ix.push(i)});const ms=ix.map(i=>Ls[i]).sort((a,b)=>a.y-b.y);ix.forEach((i,k)=>Ls[i]=ms[k])}toast('Member positions shuffled.');render()}
function cvRandPose(){const M=cvMs();if(!M.length)return toast('There is no member on this cover yet.','err');snap();M.forEach(l=>l.pose=rnd(0,POSES.length-1));toast('New poses for every member.');render()}
function cvRandText(){if(!ui.cd)return;snap();cvTextRand(ui.cd);toast('Texts moved.');render()}
{const f=V.cover;V.cover=function(){const h=f.apply(this,arguments);return h.replace('<div class="row" style="justify-content:center"><button class="b s" onclick="undo()">Undo</button>',`<div class="row cvrand" style="justify-content:center"><button class="b s" onclick="cvRandMem()">🎲 Random members</button><button class="b s" onclick="cvRandPos()">🎲 Random positions</button><button class="b s" onclick="cvRandPose()">🎲 Random poses</button><button class="b s" onclick="cvRandText()">🎲 Move texts</button></div><div class="row" style="justify-content:center"><button class="b s" onclick="undo()">Undo</button>`)}}
// ---- Theater notices: short reasons ("Busy: Filming MV — names"), substitutes by name only (details in the summary) --------
const thWhyKey=w=>{w=String(w||'Unavailable').split(' — ')[0].trim();return w.replace(/^Busy: MV filming$/i,'Busy: Filming MV')};
function thWhyShort(L){const G=new Map();(L||[]).forEach(z=>{const k=thWhyKey(z.why),m=ctMem(z.id);if(!G.has(k))G.set(k,[]);G.get(k).push(m?m.name:'#'+z.id)});return[...G].map(([k,n])=>`${k}: ${n.join(', ')}`).join(' · ')}
{const f=thPerform;thPerform=function(x){let C=null;const r0=ui.newRes?ui.newRes.length:0,n0=thS().pf.length;try{if(x&&x.st=='sched')C=thCheck(x)}catch(e){}const r=f.apply(this,arguments);
 try{const H=thS();if(C&&H.pf.length>n0&&ui.newRes){const rec=H.pf.at(-1),miss=C.miss||[],subs=Object.values(C.rp||{}).map(id=>(ctMem(id)||{}).name).filter(Boolean);if(miss.length){const txt=[thWhyShort(miss),subs.length?`Substitutes: ${subs.join(', ')}`:''].filter(Boolean).join(' · ');
  for(let i=r0;i<ui.newRes.length;i++){const h=ui.newRes[i];if(typeof h=='string'&&h.includes(`thOpenPerf('${rec.id}')`)&&h.includes('class="c thres"><b>'))ui.newRes[i]=h.replace(/(<div class="st">[^<]*<\/div>)<div class="st">[^<]*<\/div>(<button)/,`$1<div class="st">${esc(txt)}</div>$2`)}}}}catch(e){console.error(e)}return r}}
// ---- Release Day Mini Concert picture: members stand in the Title Track dance formation ------------------------------------
{const f=evStageRows;evStageRows=function(sp,G,seed){try{if(sp&&sp.k=='release'&&sp.song&&G&&G.front&&G.back){const o=S.songs[sp.song],sl=o&&o.fm&&o.fm.sl,have=new Map((sp.m||[]).map(z=>[z.id,z]));
 if(sl&&sl.some(x=>x.m&&have.has(x.m))){let R=[];sl.filter(x=>x.m&&have.has(x.m)).forEach(x=>{(R[x.r]=R[x.r]||[]).push(x)});R=R.filter(Boolean).map(L=>L.sort((a,b)=>a.i-b.i));
  const rest=(sp.m||[]).filter(z=>!sl.some(x=>x.m==z.id)).map((z,i)=>({m:z.id,i:99+i,c:0}));if(rest.length)(R[1]=R[1]||[]).push(...rest);while(R.length>3){const x=R.pop();R[R.length-1].push(...x)}
  const geo=R.length==1?[G.one||G.front]:[G.front,G.back,{y:G.back.y-24,x0:G.back.x0+46,x1:G.back.x1-46,smax:G.back.smax*.86}],r=mulb(seed);let out='';
  for(let k=R.length-1;k>=0;k--){const L=R[k],g=geo[k],n=L.length,step=(g.x1-g.x0)/n,s=Math.min(g.smax,step/66);
   out+=L.map((x,i)=>[x,g.x0+step*(i+.5),i]).sort((a,b)=>Math.abs(b[1]-400)-Math.abs(a[1]-400)).map(([x,cx,i])=>evFigOne(sp,have.get(x.m),x.c&&k==0?13:EV_POSES[(i*3+Math.floor(r()*5))%EV_POSES.length],[1,3,11,2][(i+Math.floor(r()*4))%4],cx,g.y,s)).join('')}
  return out}}}catch(e){console.error(e)}return f.apply(this,arguments)}}
// ---- MV: Song Preference changes views; new fans are highest on the first day, then fade; Title Track MVs reach more people ---
function mvPrefOf(o){try{if(!o.pref){seFill(o);const r=muPref(o,muLineSingle(o),gsAg());if(r)o.pref=r}return o.pref&&Number.isFinite(o.pref.s)?o.pref.s:50}catch(e){return 50}}
{const f=mvAddDay;mvAddDay=function(o,first){try{const v=o&&o.mv;if(v&&first&&v.pf8==null){const s=mvPrefOf(o),k=+(.6+.8*s/100).toFixed(3);v.pf8=k;v.i0=Math.round(v.i0*k);v.lt=+(v.lt*(.7+.6*s/100)).toFixed(4)}}catch(e){}return f.apply(this,arguments)}}
{const f=seMvFans;seMvFans=function(o,dv){try{const v=o.mv,t=Math.max(0,S.day-(v.pub??S.day)),k=(.7+2.5*Math.exp(-t/4))*(v.track=='coupling'?.6:1);return f.call(this,o,dv*k)}catch(e){return f.apply(this,arguments)}}}
// ---- Release Day Mini Concert: Title Track members gain more popularity than Coupling members ------------------------------
// Title Track Senbatsu (they already get +1): Center +2 more, front row +1 more. Coupling-only performers join the show with
// smaller exposure; the Center of a Coupling song gets +1.
{const f=holdConcert;holdConcert=function(p,x){const ev=f.apply(this,arguments);try{if(ev&&ev.result&&!ev.result.g8){const mn=S.songs[p.mainId],sl=(mn&&mn.fm&&mn.fm.sl)||[],G=[];
 sl.filter(z=>z.m&&get(z.m)).forEach(z=>{const m=get(z.m),add=z.c?2:z.r==0?1:0;if(add)gainPop(m,add);G.push({id:m.id,role:'Main',g:1+add})});
 const inMain=new Set(G.map(z=>z.id));(p.coup||[]).forEach(id=>{const o=S.songs[id];if(!o)return;(o.slots||[]).filter(Boolean).forEach(mid=>{const m=get(mid);if(!m||inMain.has(mid)||G.some(z=>z.id==mid))return;const c=(o.centers||[]).includes(mid);if(c)gainPop(m,1);try{fbExp(mid,.4)}catch(e){}G.push({id:mid,role:'Coupling',g:c?1:0})})});
 const add=G.filter(z=>z.role=='Coupling').map(z=>z.id);if(add.length){ev.members=[...new Set([...(ev.members||[]),...add])];ev.result.members=[...new Set([...(ev.result.members||[]),...add])]}ev.result.g8=G}}catch(e){console.error(e)}return ev}}
// release result: popularity from the Mini Concert per member
{const f=doRelease;doRelease=function(){const n=S.singles.length;const r=f.apply(this,arguments);try{const x=S.singles[n];const ev=x&&(S.cal||[]).find(e=>e.type=='concert'&&e.result&&e.result.rid==x.rid);const G=ev&&ev.result.g8;if(G&&G.length&&ui.mod&&ui.mod.t=='html'){const row=z=>{const m=get(z.id);return m?`<tr><td>${esc(m.name)}</td><td>${z.role=='Main'?'Title Track':'Coupling'}</td><td>+${z.g}</td></tr>`:''};
 ui.mod.h+=`<h3>Mini Concert popularity</h3><p class="st">Title Track members gain more (Center most); Coupling members gain less.</p><div class="wrap" style="max-height:200px"><table><tr><th>Idol</th><th>Song</th><th>+Pop</th></tr>${G.slice().sort((a,b)=>b.g-a.g).map(row).join('')}</table></div>`}}catch(e){console.error(e)}return r}}
// ---- Release Day Mini Concert: one performance picture per Coupling song (its own Senbatsu, formation and costumes) ---------
function relCoupIds(x){const ids=[...new Set((x.types||[]).flatMap(t=>t.songs||[]))].filter(id=>id!=x.mainId&&S.songs[id]);return ids.filter(id=>{const o=S.songs[id];return o.relDay==null||o.relDay==(x.relDay??x.day)})}
function relCoupImgs(x){if(!x)return[];const ev=(S.cal||[]).find(e=>e.type=='concert'&&e.result&&e.result.rid==x.rid),r=(x.promo||[]).find(z=>z.type=='concert');const own=(ev&&ev.imgC)||(r&&r.imgC);if(own)return own;
 const L=relCoupIds(x).map(id=>{const o=S.songs[id],m=(o.slots||[]).filter(i=>i&&get(i));if(!m.length)return null;try{return evSpec('release',x.rid,id,m,{t:o.title,day:x.relDay??x.day,retro:ev?undefined:1})}catch(e){return null}}).filter(Boolean);
 if(r)r.imgC=L;else if(ev)ev.imgC=L;return L}
const relCoupHtml=x=>relCoupImgs(x).map(sp=>evImgBlock(sp,'Coupling · '+(sp.t||''))).join('');
{const f=holdConcert;holdConcert=function(p,x){const ev=f.apply(this,arguments);try{if(ev&&!ev.imgC){const ids=[...new Set((p.types||[]).flatMap(t=>t.songs||[]))].filter(id=>id!=p.mainId&&S.songs[id]&&!plReused(p,S.songs[id]));
 ev.imgC=ids.map(id=>{const o=S.songs[id],m=(o.slots||[]).filter(i=>i&&get(i));return m.length?evSpec('release',x&&x.rid,id,m,{t:o.title,day:S.day,eid:ev.id}):null}).filter(Boolean)}}catch(e){console.error(e)}return ev}}
{const f=evSync;evSync=function(){const r=f.apply(this,arguments);try{const cal=S.cal||[];(S.singles||[]).forEach(x=>(x.promo||[]).forEach(z=>{if(z.type=='concert'&&!z.imgC){const e=cal.find(q=>q.id==z.id&&q.imgC);if(e)z.imgC=e.imgC}}))}catch(e){}return r}}
// release pop-up: after the Title Track picture
{const f=doRelease;doRelease=function(){const n=S.singles.length;const r=f.apply(this,arguments);try{const x=S.singles[n];if(x&&ui.mod&&ui.mod.t=='html'){const add=relCoupHtml(x);if(add){const h=ui.mod.h,k=h.indexOf('</figure>');ui.mod.h=k>=0?h.slice(0,k+9)+add+h.slice(k+9):h.replace('</h2>','</h2>'+add)}}}catch(e){console.error(e)}return r}}
// event window: every song of the Mini Concert
{const f=evOpen;evOpen=function(id){f.apply(this,arguments);try{const sp=evImgOf(id);if(sp&&sp.k=='release'&&ui.mod&&ui.mod.t=='html'){const x=(S.singles||[]).find(z=>z.rid==sp.rid)||(S.singles||[]).find(z=>(z.promo||[]).some(q=>q.id==id));const add=x?relCoupHtml(x):'';if(add){ui.mod.h+=add;render()}}}catch(e){console.error(e)}}}
