// =====================================================================================
//  Recording covers
//  · Studio Recording: the same Cover Studio as singles (layers, members, poses, text, stickers,
//    backgrounds). Members wear the costumes of the selected Stage songs (first performance).
//  · Theater DVD: a DVD-size jacket (portrait) showing a stage photo of the first performance in its
//    Stage costumes, with editable group, team, Stage and subtitle text.
// =====================================================================================
const rcSvgX=s=>s&&!/xmlns=/.test(s.slice(0,200))?s.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"'):s;
const rcInl=fn=>{if(typeof PT_INLINE=='undefined')return fn();PT_INLINE++;try{return fn()}finally{PT_INLINE--}};
// stage costume of one member (first selected song she sings in)
function rcCzOf(fp,mid,sel){let p=null;try{gsWith(fp.gid,()=>{const P=(S.th&&S.th.czp)||{};for(const z of fp.items||[]){if(z.k!='song'||(sel&&!sel.includes(z.i)))continue;if((z.mem||[]).includes(mid)&&z.cm&&z.cm[mid]&&P[z.cm[mid]]){p=P[z.cm[mid]];break}}})}catch(e){}return p}
function rcPerf(fp,sel){const out=[];(fp.items||[]).forEach(z=>{if(z.k!='song'||(sel&&!sel.includes(z.i)))return;[z.center,z.c2,...(z.mem||[])].forEach(id=>{if(id!=null&&!out.includes(id))out.push(id)})});return out.filter(id=>get(id))}

// ---- Studio Recording cover: the single Cover Studio, opened for one recording ---------------------------------------------------
let RCCV=null;
function rcCvDesign(p,fp,rnd){const sel=p.tracks?p.tracks.map(t=>t.i):p.sel,perf=rcPerf(fp,sel),R=a=>a[Math.floor(Math.random()*a.length)],h=rnd?Math.floor(Math.random()*360):rcHue(fp.sid);
 const n=Math.min(perf.length,rnd?1+Math.floor(Math.random()*5):Math.min(5,perf.length)),ids=rnd?[perf[0],...perf.slice(1).sort(()=>Math.random()-.5)].slice(0,n):perf.slice(0,n);
 const d={ed:'Album Cover',status:'draft',cmode:'indiv',cid:0,bg:{type:rnd?R(BGT):'grad',c1:`hsl(${h},70%,62%)`,c2:`hsl(${(h+60)%360},55%,35%)`,pc:'#ffffff',int:.45,seed:Math.floor(Math.random()*9999)},layers:[]};
 // hsl colours are converted to hex so the colour pickers keep working
 const hx=c=>{const m=/hsl\((\d+),(\d+)%,(\d+)%\)/.exec(c);if(!m)return c;const H=+m[1]/360,Sx=+m[2]/100,L=+m[3]/100,f=k=>{const q=L<.5?L*(1+Sx):L+Sx-L*Sx,pp=2*L-q;let t=H+k;if(t<0)t++;if(t>1)t--;const v=t<1/6?pp+(q-pp)*6*t:t<1/2?q:t<2/3?pp+(q-pp)*(2/3-t)*6:pp;return Math.round(v*255).toString(16).padStart(2,'0')};return'#'+f(1/3)+f(0)+f(-1/3)};d.bg.c1=hx(d.bg.c1);d.bg.c2=hx(d.bg.c2);
 const order=thArr(ids),sp=n<=1?0:Math.min(110,360/(n-1)),sc=n<=1?2.3:n<=3?2:1.7;
 order.forEach((id,k)=>{const l=mkM(id);l.x=Math.round(256+(k-(n-1)/2)*sp);l.y=n<=1?300:310+Math.abs(k-(n-1)/2)*6;l.s=sc;l.pose=rnd?Math.floor(Math.random()*POSES.length):(id==ids[0]?3:0);const cz=rcCzOf(fp,id,sel);if(cz)l.cd=cz;d.layers.push(l)});
 const ttl=mkT('Title',fp.stName,256,64,46),grpT=mkT('Group Name',(grp(fp.gid)||{}).name||'',256,458,30),lbl=mkT('Edition Label','Studio Recording',400,494,18),no=mkT('Release Number',`${fp.team}${fp.stNo?' · '+ordN(fp.stNo)+' Stage':''}`,256,108,20);
 if(rnd){const pal=['#ffffff','#fff6a8','#ffe0ef','#1e1a28'];ttl.col=R(pal);ttl.olc=R(['#ff7eb6','#7a62c8','#2b2b5b','#f27aa6']);ttl.y=R([64,90,430]);grpT.y=ttl.y>400?40:458}
 d.layers.push(ttl,grpT,lbl,no);return d}
function rcCvOpen(pid){const p=srGet(pid),fp=p&&rcS().fps[p.sid];if(!p||!fp)return;if(RCCV)rcCvExit(0);
 RCCV={pid,bak:{cov:S.cov,al:S.al,ctx:ui.cvCtx,ed:ui.ed}};S.cov={};if(p.cover)S.cov['Album Cover']=JSON.parse(JSON.stringify(p.cover));S.al=Object.assign({},S.al||{},{title:fp.stName});
 ui.cvCtx='album';EDS.length=0;EDS.push('Album Cover');ui.cd=p.cover?JSON.parse(JSON.stringify(p.cover)):rcCvDesign(p,fp,false);ui.ed='Album Cover';ui.hu=[];ui.hr=[];ui.sel=(ui.cd.layers.find(l=>l.t=='m')||{}).id||'bg';view='cover';render();try{window.scrollTo(0,0)}catch(e){}}
function rcCvExit(go){if(!RCCV)return;const p=srGet(RCCV.pid),st=S.cov['Album Cover'];if(p&&ui.cd){const c=JSON.parse(JSON.stringify(ui.cd)),same=st&&JSON.stringify(st.layers)==JSON.stringify(c.layers)&&JSON.stringify(st.bg)==JSON.stringify(c.bg);c.status=same?st.status:'draft';p.cover=c;p.cvv=(p.cvv||0)+1}
 const b=RCCV.bak;S.cov=b.cov;S.al=b.al;ui.cvCtx=b.ctx;ui.ed=b.ed;ui.cd=null;EDS.length=0;RCCV=null;if(go&&p){ui.rcp=p.id;view='recsr'}}
{const f=render;render=function(){if(RCCV&&view!='cover')rcCvExit(0);return f.apply(this,arguments)}}
{const f=save;save=function(){if(!RCCV)return f.apply(this,arguments);const cur={cov:S.cov,al:S.al};S.cov=RCCV.bak.cov;S.al=RCCV.bak.al;try{return f.apply(this,arguments)}finally{S.cov=cur.cov;S.al=cur.al}}}
{const f=tick;tick=function(){if(RCCV){rcCvExit(0);if(view=='cover')view='recsr'}return f.apply(this,arguments)}}
{const f=newDesign;newDesign=function(ed){if(RCCV){const p=srGet(RCCV.pid),fp=p&&rcS().fps[p.sid];if(fp)return rcCvDesign(p,fp,false)}return f.apply(this,arguments)}}
{const f=cvPool;cvPool=function(){if(RCCV){const p=srGet(RCCV.pid),fp=p&&rcS().fps[p.sid];if(fp){const L=rcPerf(fp,p.tracks?p.tracks.map(t=>t.i):p.sel),H=new Set(L);return{ok:true,has:id=>H.has(id),tag:()=>'',msg:'',list:L,map:null}}}return f.apply(this,arguments)}}
{const f=setCos;setCos=function(id){if(RCCV&&ui.cd){const l=ui.cd.layers.find(x=>x.id==id);if(l){l.czSrc='cos';delete l.cd}}return f.apply(this,arguments)}}
{const f=addM;addM=function(mid){const n=ui.cd?ui.cd.layers.length:0;const r=f.apply(this,arguments);try{if(RCCV&&ui.cd&&ui.cd.layers.length>n){const p=srGet(RCCV.pid),fp=p&&rcS().fps[p.sid],l=ui.cd.layers.find(x=>x.t=='m'&&x.mid==mid&&!x.cd);const cz=fp&&rcCzOf(fp,mid,p.tracks?p.tracks.map(t=>t.i):p.sel);if(l&&cz&&l.czSrc!='cos'){l.cd=cz;render()}}}catch(e){console.error(e)}return r}}
function rcCvStageCz(){if(!RCCV||!ui.cd)return;const p=srGet(RCCV.pid),fp=p&&rcS().fps[p.sid];if(!fp)return;const sel=p.tracks?p.tracks.map(t=>t.i):p.sel;ui.cd.layers.forEach(l=>{if(l.t!='m')return;delete l.czSrc;const cz=rcCzOf(fp,l.mid,sel);if(cz)l.cd=cz});toast('Every member wears her Stage costume again.');render()}
{const f=V.cover;V.cover=function(){let h=f.apply(this,arguments);if(!RCCV)return h;try{const p=srGet(RCCV.pid);h=h.replace('<h2 class="ht">Single Cover Studio</h2>',`<h2 class="ht">🎙 Studio Recording Cover</h2><div class="c rccvh"><b>${esc(p?p.name:'')}</b><span class="st">Same tools as the single covers. Members wear the costumes of the recorded Stage songs.</span><div class="row"><button class="b s" onclick="rcCvExit(1);render()">◀ Back to Studio Recording</button><button class="b s" onclick="rcCvStageCz()">👗 Stage costumes for everyone</button><button class="b s" onclick="ui.cd=rcCvDesign(srGet(RCCV.pid),rcS().fps[srGet(RCCV.pid).sid],true);render()">🎲 Random cover</button></div></div>`)
  .replace(/>Album Cover( ✔| ✎)?<\/button>/,(m,a)=>`>Studio Recording${a||''}</button>`).replace(/<option([^>]*)>Album Cover<\/option>/g,'<option value="Album Cover"$1>Studio Recording</option>').replace(`onclick="view=ui.cvCtx=='album'?'albums':'music';render()">Back to production`,`onclick="rcCvExit(1);render()">Back to Studio Recording`)}catch(e){console.error(e)}return h}}
function rcSrCover(p,fp,cls){if(p&&p.cover)return rcImg(`srcv:${p.id}:${p.cvv||0}`,rcInl(()=>rcSvgX(coverSvg(p.cover,{}))),cls||'rcimg');return fp?rcFpCover(fp,'sr'):''}
function srCvRand(){const p=srGet(ui.rcp),fp=p&&rcS().fps[p.sid];if(!p||!fp)return;p.cover=rcCvDesign(p,fp,true);p.cvv=(p.cvv||0)+1;toast('New random cover — open the Cover Studio to edit it.');render()}

// ---- Theater DVD jacket (portrait, DVD size) ----------------------------------------------------------------------------------
const RC_DW=540,RC_DH=766;
function dvdCvDef(p,fp){const songs=(fp.items||[]).filter(z=>z.k=='song'&&(z.mem||[]).length);return Object.assign({song:songs[0]?songs[0].i:null,group:(grp(fp.gid)||{}).name||'',team:fp.team,stage:`${fp.stNo?ordN(fp.stNo)+' Stage ':''}“${fp.stName}”`,sub:`First Performance · ${jd(fp.day)}`,hue:rcHue(fp.sid),lay:0},p.dcv||{})}
function dvdCvSvg(p,fp){const c=dvdCvDef(p,fp),h=c.hue,z=(fp.items||[]).find(q=>q.k=='song'&&q.i==c.song)||(fp.items||[]).find(q=>q.k=='song'&&(q.mem||[]).length);
 let pic='';try{gsWith(fp.gid,()=>{pic=rcSongPic(fp,z)||''})}catch(e){}
 const top=c.lay==1?520:150,ph=360;pic=pic?pic.replace(/^<svg/,`<svg x="0" y="${c.lay==1?120:top}" width="${RC_DW}" height="${ph}" preserveAspectRatio="xMidYMid slice"`):'';
 const T=(x,y,s,w,txt,o='')=>`<text x="${x}" y="${y}" text-anchor="middle" font-family="'M PLUS Rounded 1c',Quicksand,sans-serif" font-size="${s}" font-weight="${w}" fill="#fff" ${o}>${esc(String(txt||''))}</text>`;
 const ty=c.lay==1?[60,92,560,600]:[62,96,560,600];
 return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${RC_DW} ${RC_DH}"><defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${h},55%,26%)"/><stop offset=".55" stop-color="hsl(${(h+40)%360},60%,14%)"/><stop offset="1" stop-color="hsl(${(h+80)%360},55%,8%)"/></linearGradient><linearGradient id="dl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="hsl(${h},90%,72%)"/><stop offset="1" stop-color="hsl(${(h+60)%360},90%,72%)"/></linearGradient></defs>
 <rect width="${RC_DW}" height="${RC_DH}" fill="url(#dg)"/>${[...Array(7)].map((_,i)=>`<path d="M${40+i*76} 0L${10+i*76} ${RC_DH}H${70+i*76}Z" fill="#fff" opacity=".035"/>`).join('')}
 ${pic}<rect x="0" y="${c.lay==1?120:top}" width="${RC_DW}" height="${ph}" fill="none" stroke="url(#dl)" stroke-width="4"/>
 ${T(270,ty[0],34,800,c.group,'letter-spacing="2"')}${T(270,ty[1],20,700,c.team,'opacity=".9"')}
 ${T(270,ty[2],c.stage.length>26?26:32,800,c.stage)}${T(270,ty[3],17,600,c.sub,'opacity=".85"')}
 <rect x="0" y="${RC_DH-92}" width="${RC_DW}" height="92" fill="#000" opacity=".35"/><circle cx="64" cy="${RC_DH-46}" r="30" fill="none" stroke="url(#dl)" stroke-width="6"/><circle cx="64" cy="${RC_DH-46}" r="8" fill="url(#dl)"/>
 ${T(290,RC_DH-52,24,800,'THEATER DVD','letter-spacing="6"')}${T(290,RC_DH-24,13,600,'Full first performance · IDOLVERSE48','opacity=".7"')}</svg>`}
function rcDvdCover(p,fp,cls){return rcImg(`dvcv:${p.id}:${p.dcvv||0}`,rcInl(()=>dvdCvSvg(p,fp)),cls||'rcimg rcdvdimg')}
function dvdCvSet(k,v){const p=dvdGet(ui.rcd),fp=p&&rcS().fps[p.sid];if(!p||!fp)return;const c=p.dcv=dvdCvDef(p,fp);if(k=='rand'){const L=(fp.items||[]).filter(z=>z.k=='song'&&(z.mem||[]).length);if(L.length)c.song=L[Math.floor(Math.random()*L.length)].i;c.hue=Math.floor(Math.random()*360);c.lay=Math.random()<.5?0:1}
 else if(k=='reset'){p.dcv=null}else if(k=='song'||k=='hue'||k=='lay')c[k]=+v;else c[k]=String(v||'').replace(/[<>]/g,'').slice(0,60);p.dcvv=(p.dcvv||0)+1;render()}
function dvdCvHtml(p,fp){const c=dvdCvDef(p,fp),songs=(fp.items||[]).filter(z=>z.k=='song'&&(z.mem||[]).length);
 return`<div class="c rcdvdc"><h3>📀 DVD cover</h3><div class="rcdvdw"><div class="rcdvdp">${rcInl(()=>dvdCvSvg(p,fp))}</div><div class="rcdvdf">
 <label class="st">Group <input value="${esc(c.group)}" maxlength="60" onchange="dvdCvSet('group',this.value)"></label><label class="st">Team <input value="${esc(c.team)}" maxlength="60" onchange="dvdCvSet('team',this.value)"></label><label class="st">Stage <input value="${esc(c.stage)}" maxlength="60" onchange="dvdCvSet('stage',this.value)"></label><label class="st">Subtitle <input value="${esc(c.sub)}" maxlength="60" onchange="dvdCvSet('sub',this.value)"></label>
 <label class="st">Stage photo <select onchange="dvdCvSet('song',this.value)">${songs.map(z=>`<option value="${z.i}" ${z.i==c.song?'selected':''}>${z.enc?'EN':'M'} · ${esc(z.title)}</option>`).join('')}</select></label><label class="st">Layout <select onchange="dvdCvSet('lay',this.value)"><option value="0" ${c.lay!=1?'selected':''}>Photo in the middle</option><option value="1" ${c.lay==1?'selected':''}>Photo on top</option></select></label><label class="st">Colour <input type="range" min="0" max="359" value="${c.hue}" onchange="dvdCvSet('hue',this.value)"></label>
 <div class="row"><button class="b s" onclick="dvdCvSet('rand')">🎲 Random</button><button class="b s" onclick="dvdCvSet('reset')">↺ Default</button></div><p class="st">The photo shows the first performance in its Stage costumes. Size: DVD case (portrait).</p></div></div></div>`}

// ---- hook the covers into the pages ------------------------------------------------------------------------------------------------
{const f=V.recsr;V.recsr=function(){let h=f.apply(this,arguments);try{const R=rcS(),p=ui.rcp&&srGet(ui.rcp);
 if(p){const fp=R.fps[p.sid];if(fp){const card=`<div class="c rccvc"><h3>💿 Cover</h3><div class="row"><div class="rccvp">${rcSrCover(p,fp,'rcimg rccvbig')}</div><div style="flex:1;min-width:0"><p class="st">${p.cover?(p.cover.status=='confirmed'?'✔ Cover confirmed':'✎ Draft cover'):'No cover yet — the Stage artwork is used.'}</p><div class="row"><button class="b s p" onclick="rcCvOpen('${p.id}')">🎨 Open Cover Studio</button><button class="b s" onclick="srCvRand()">🎲 Random cover</button></div><p class="st">Same tools as single covers; members wear their Stage costumes.</p></div></div></div>`;const i=h.indexOf('<div class="c"><h3>Tracklist');h=i<0?h+card:h.slice(0,i)+card+h.slice(i)}}
 else R.sr.forEach(p=>{const fp=R.fps[p.sid];if(fp&&p.cover)h=h.replace(`onclick="ui.rcp='${p.id}';render()">${rcFpCover(fp,'sr')}`,`onclick="ui.rcp='${p.id}';render()">${rcSrCover(p,fp)}`)})}catch(e){console.error(e)}return h}}
{const f=V.recdvd;V.recdvd=function(){let h=f.apply(this,arguments);try{const R=rcS(),p=ui.rcd&&dvdGet(ui.rcd);
 if(p){const fp=R.fps[p.sid];if(fp){const card=dvdCvHtml(p,fp),i=h.indexOf('<div class="c"><h3>Full performance contents');h=i<0?h+card:h.slice(0,i)+card+h.slice(i)}}
 else R.dvd.forEach(p=>{const fp=R.fps[p.sid];if(fp)h=h.replace(`onclick="ui.rcd='${p.id}';render()">${rcFpCover(fp,'dvd')}`,`onclick="ui.rcd='${p.id}';render()">${rcDvdCover(p,fp)}`)})}catch(e){console.error(e)}return h}}
{const f=V.reclib;V.reclib=function(){let h=f.apply(this,arguments);try{const R=rcS();R.sr.forEach(p=>{const fp=R.fps[p.sid];if(fp&&p.cover)h=h.split(`onclick="rcOpen('${p.id}')">${rcFpCover(fp,'sr')}`).join(`onclick="rcOpen('${p.id}')">${rcSrCover(p,fp)}`)});R.dvd.forEach(p=>{const fp=R.fps[p.sid];if(fp)h=h.split(`onclick="rcOpen('${p.id}')">${rcFpCover(fp,'dvd')}`).join(`onclick="rcOpen('${p.id}')">${rcDvdCover(p,fp)}`)})}catch(e){console.error(e)}return h}}
{const f=slArt;slArt=function(it,cls){try{if(it&&it.p&&it.fp){if(it.k=='sr'&&it.p.cover)return rcSrCover(it.p,it.fp,cls);if(it.k=='dvd')return rcDvdCover(it.p,it.fp,(cls||'')+' rcdvdimg')}}catch(e){}return f.apply(this,arguments)}}
{const f=cvRandMem;cvRandMem=function(){const r=f.apply(this,arguments);try{if(RCCV&&ui.cd){const p=srGet(RCCV.pid),fp=p&&rcS().fps[p.sid],sel=p.tracks?p.tracks.map(t=>t.i):p.sel;if(fp){ui.cd.layers.forEach(l=>{if(l.t=='m'&&l.czSrc!='cos'){const cz=rcCzOf(fp,l.mid,sel);if(cz)l.cd=cz}});render()}}}catch(e){console.error(e)}return r}}
