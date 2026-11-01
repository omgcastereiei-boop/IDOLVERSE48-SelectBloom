// =====================================================================================
//  IDOLVERSE48: Select Bloom!  —  Event images & Roadshow single synchronization
// -------------------------------------------------------------------------------------
//  1) Event images. Release Day Mini Concert, Roadshow and Handshake Event each get ONE
//     image. When the event first takes place, an image record is stored on the event
//     (ev.img) and copied to its history records (single promo records, Roadshow history):
//        { v, k:'release'|'road'|'hs', rid, song, t:single title, loc, vt, day, center,
//          m:[{id, n, h, ap, c:costumeIndex|null, of, oh}], cd:[costume design snapshots] }
//     The record holds who took part, how each idol looked and the costume of the single's
//     title-track Senbatsu at that moment, so the picture is drawn identically every time
//     (also after save/load), even if designs or looks change later. Rewards and results
//     are untouched: the record is only a description of the picture.
//  2) Roadshows always promote the LATEST RELEASED single. A single in production does not
//     count until its Release Day. The per-location "once per single" rule is the original
//     one (keyed by single), so locations open again for each new release while Regional
//     Fanbase Growth and Roadshow history keep accumulating.
// =====================================================================================
const latestSingle=()=>(S&&S.singles&&S.singles.length)?S.singles.reduce((a,b)=>((b.relDay??b.day??0)>=(a.relDay??a.day??0)?b:a)):null;

// ---- image records -------------------------------------------------------------------
function evCostume(o,m){const cd=o&&typeof czFor=='function'?czFor(o,m.id):null;if(cd)return{cd};const c=o&&o.cid!=null&&COS[o.cid];if(c&&o.cid!==(typeof CZ_COS!='undefined'?CZ_COS:-1))return{of:c[1],oh:o.coh!=null?o.coh:c[2]};const a=ap(m);return{of:a.of,oh:a.oh}}
function evSpec(k,rid,songId,ids,ex={}){const o=songId&&S.songs[songId],keys=[],cds=[];
 const m=(ids||[]).map(get).filter(Boolean).map(mm=>{const c=evCostume(o,mm);let ci=null;if(c.cd){const key=JSON.stringify(c.cd);ci=keys.indexOf(key);if(ci<0){keys.push(key);cds.push(JSON.parse(key));ci=cds.length-1}}return{id:mm.id,n:mm.name,h:mm.hue|0,ap:JSON.parse(JSON.stringify(ap(mm))),c:ci,of:c.of,oh:c.oh}});
 return{v:1,k,rid:rid||null,song:songId||null,t:ex.t||'',loc:ex.loc||'',vt:ex.vt||'',day:ex.day??S.day,center:o&&o.center||null,m,cd:cds,retro:ex.retro?1:undefined}}
const evSingle=rid=>S.singles.find(s=>s.rid==rid);
function evRoadSpec(ev,retro){const x=evSingle(ev.rid),l=RSL[ev.loc||ev.locId];return evSpec('road',ev.rid,x?x.mainId:null,ev.members,{t:x?x.title:(ev.st||''),loc:l?l.n:(ev.loc||''),vt:l?l.vt:'',day:ev.day,retro})}
function evHsSpec(ev,retro){const x=evSingle(ev.rid),pres=ev.r1&&ev.r1.present&&ev.r1.present.length?ev.r1.present:ev.members;return evSpec('hs',ev.rid,x?x.mainId:null,pres,{t:x?x.title:(ev.st||''),day:ev.day,retro})}
// attach exactly once, when the event first happens
const _evRsRun=rsRun;rsRun=function(ev,part){if(ev&&!ev.img&&!ev[('d'+part)])try{ev.img=evRoadSpec(ev)}catch(e){}return _evRsRun.apply(this,arguments)};
const _evHsRun=hsRun;hsRun=function(ev,part){const r=_evHsRun.apply(this,arguments);if(ev&&!ev.img&&ev.r1)try{ev.img=evHsSpec(ev)}catch(e){}return r};
const _evHsRun2=hsRun2;hsRun2=function(ev,part){if(ev&&!ev.img)try{ev.img=evHsSpec(ev)}catch(e){}return _evHsRun2.apply(this,arguments)};
const _evConcert=holdConcert;holdConcert=function(p,x){const ev=_evConcert.apply(this,arguments);if(ev&&!ev.img)try{ev.img=evSpec('release',x&&x.rid,p.mainId,(ev.result&&ev.result.members)||ev.members,{t:x?x.title:p.title,day:S.day})}catch(e){}return ev};
// copy image records to history; give events from older saves one image built from their record
function evSync(){if(!S||!S.singles)return;const cal=S.cal||[];
 S.singles.forEach(x=>{(x.promo||[]).forEach(r=>{if(r.img)return;const src=cal.find(e=>e.id==r.id&&e.img)||(r.type=='road'&&typeof rsGet=='function'&&rsGet(r.id));if(src&&src.img){r.img=src.img;return}
  try{if(r.type=='concert')r.img=evSpec('release',x.rid,x.mainId,(r.res&&r.res.members)||r.members,{t:x.title,day:r.day,retro:1});else if(r.type=='road'&&r.v==2)r.img=evRoadSpec({...r,loc:r.locId,st:x.title,rid:x.rid},1);else if(r.type=='handshake')r.img=evHsSpec({...r,rid:x.rid,st:x.title},1)}catch(e){}})});
 if(S.rs&&S.rs.hist)Object.values(S.rs.hist).forEach(H=>H.forEach(h=>{if(h.img)return;const src=cal.find(e=>e.id==h.id&&e.img)||S.singles.flatMap(x=>x.promo||[]).find(r=>r.id==h.id&&r.img);h.img=src?src.img:evRoadSpec(h,1)}))}
const evImgOf=id=>{const cal=(S.cal||[]).find(e=>e.id==id&&e.img);if(cal)return cal.img;const r=S.singles.flatMap(x=>x.promo||[]).find(r=>r.id==id&&r.img);if(r)return r.img;const h=S.rs&&Object.values(S.rs.hist).flat().find(h=>h.id==id&&h.img);return h?h.img:null};

// ---- drawing ---------------------------------------------------------------------------
const EV_SVG=new WeakMap();
const evT=s=>typeof tr=='function'?tr(s):s;
function evFigs(sp,opt){const N=sp.m.length;if(!N)return'';const ci=sp.m.findIndex(z=>z.id==sp.center),ord=[...sp.m];if(ci>0){const [c]=ord.splice(ci,1);ord.unshift(c)}
 const front=ord.slice(0,Math.min(N,N>8?Math.ceil(N/2):N)),back=ord.slice(front.length),r=mulb((sp.rid?String(sp.rid).length:1)*7919+(sp.day|0)*31+sp.k.length);
 const place=(L,y,s,w)=>{const out=[],n=L.length,step=Math.min(w/n,98*s);L.forEach((z,i)=>{const slot=n%2?Math.ceil(i/2)*(i%2?-1:1):(Math.floor(i/2)+.5)*(i%2?-1:1),cx=400+slot*step;out.push([z,cx,y,s,i])});return out};
 const byEdge=L=>L.sort((a,b)=>Math.abs(b[1]-400)-Math.abs(a[1]-400)),rows=[...(back.length?byEdge(place(back,opt.backY,opt.backS,700)):[]),...byEdge(place(front,opt.frontY,opt.frontS,740))];
 return rows.map(([z,cx,y,s,i])=>{const mem={id:z.id,name:z.n,hue:z.h,ap:z.ap,_x:1},cd=z.c!=null?sp.cd[z.c]:null,pose=opt.pose(i,z,r),ex=opt.ex(i,r);
  let g='';try{g=fig(mem,{pose,of:z.of!=null?z.of:z.ap.of,oh:z.oh!=null?z.oh:z.ap.oh,ac:z.ap.ac,ex,...(cd?{cd}:{})})}catch(e){g=''}
  return`<g transform="translate(${(cx-50*s).toFixed(1)} ${(y-192*s).toFixed(1)}) scale(${s})">${g}</g>`}).join('')}
function evBg(k){try{return SCN(k).replace('<svg ','<svg x="0" y="0" width="800" height="450" ')}catch(e){return'<rect width="800" height="450" fill="#f3e6dc"/>'}}
function evRoadBg(sp){const r=mulb((sp.loc||'x').length*977+(sp.day|0)),vt=sp.vt||'Outdoor Event Stage';let s=`<defs><linearGradient id="evsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc9ff"/><stop offset=".7" stop-color="#d7ecff"/><stop offset="1" stop-color="#fff2e6"/></linearGradient></defs><rect width="800" height="450" fill="url(#evsky)"/><ellipse cx="660" cy="70" rx="46" ry="46" fill="#fff6d6" opacity=".9"/>`;
 [[140,60,1.2],[420,40,.9],[700,110,1]].forEach(([x,y,z])=>s+=`<g fill="#fff" opacity=".85"><ellipse cx="${x}" cy="${y}" rx="${50*z}" ry="${16*z}"/><ellipse cx="${x+26*z}" cy="${y-10*z}" rx="${30*z}" ry="${16*z}"/></g>`);
 if(/Shopping|City|Square/.test(vt)){let x=0;while(x<800){const w=50+r()*70,h=90+r()*110;s+=`<rect x="${x.toFixed(0)}" y="${(300-h).toFixed(0)}" width="${w.toFixed(0)}" height="${(h+20).toFixed(0)}" fill="hsl(${Math.floor(200+r()*80)} 35% ${Math.floor(78+r()*10)}%)"/>`;for(let wy=300-h+10;wy<300;wy+=18)for(let wx=x+6;wx<x+w-8;wx+=14)s+=`<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="7" height="9" fill="#fff" opacity=".7"/>`;x+=w+4}}
 else{for(let i=0;i<14;i++){const x=i*62+r()*20,h=60+r()*50;s+=`<rect x="${x+14}" y="${300-h*.4}" width="7" height="${h*.4+10}" fill="#9a7357"/><ellipse cx="${x+18}" cy="${300-h*.5}" rx="${24+r()*8}" ry="${h*.4}" fill="hsl(${110+Math.floor(r()*40)} 45% ${55+Math.floor(r()*12)}%)"/>`}}
 s+=`<rect y="290" width="800" height="160" fill="${/Plaza|Square/.test(vt)?'#e8dccf':'#cfe3b4'}"/>`;
 // outdoor truss stage
 s+=`<rect x="90" y="300" width="620" height="44" fill="#5b5070"/><rect x="90" y="296" width="620" height="8" fill="#ffd36a"/><g fill="none" stroke="#8a8fa0" stroke-width="7"><path d="M100 300V40M700 300V40M100 46H700"/></g><g stroke="#8a8fa0" stroke-width="2" fill="none" opacity=".8">${[...Array(10)].map((_,i)=>`<path d="M${100+i*60} 46l30 -10l30 10"/>`).join('')}</g>`;
 s+=`<rect x="210" y="56" width="380" height="54" rx="10" fill="#f7a3c8"/><text x="400" y="80" text-anchor="middle" font-family="Dela Gothic One,sans-serif" font-size="18" fill="#fff">ROADSHOW</text><text x="400" y="101" text-anchor="middle" font-family="M PLUS Rounded 1c,sans-serif" font-size="15" font-weight="800" fill="#fff">${esc(sp.loc||'')}</text>`;
 [[130,60],[670,60]].forEach(([x,y])=>s+=`<rect x="${x-12}" y="${y}" width="24" height="16" rx="3" fill="#3e3550"/><path d="M${x-10} ${y+16}L${x-60} 300L${x+60} 300L${x+10} ${y+16}Z" fill="#fffbe0" opacity=".12"/>`);
 return s}
function evCrowd(n,seed,y0,dark){const r=mulb(seed);let s='';for(let i=0;i<n;i++){const x=r()*820-10,y=y0+r()*60,c=['#ff8fc0','#b9a2ff','#8fd0ff','#fff08a','#9ff0c4'][i%5];s+=`<ellipse cx="${x.toFixed(0)}" cy="${(y+26).toFixed(0)}" rx="14" ry="18" fill="${dark?'#2a2350':'#6d6380'}"/><circle cx="${x.toFixed(0)}" cy="${(y+4).toFixed(0)}" r="9" fill="${dark?'#2a2350':'#6d6380'}"/><path d="M${(x+8).toFixed(0)} ${(y+14).toFixed(0)}l${(6+r()*10).toFixed(0)} -30" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`}return s}
function evImgSvg(sp){if(!sp||!sp.m)return'';if(EV_SVG.has(sp))return EV_SVG.get(sp);let bg='',figs='',fg='',label='';
 const perf=(i,z,r)=>i==0?13:[2,1,12,6,15,8,2,1][(i+Math.floor(r()*3))%8],happy=(i,r)=>[3,1,11,2][(i+Math.floor(r()*4))%4];
 if(sp.k=='release'){bg=evBg('stage');figs=evFigs(sp,{frontY:400,frontS:1.18,backY:330,backS:.95,pose:perf,ex:happy});fg=evCrowd(40,7,392,1);label=evT('Release Day Mini Concert')}
 else if(sp.k=='road'){bg=evRoadBg(sp);figs=evFigs(sp,{frontY:318,frontS:1.06,backY:300,backS:.9,pose:perf,ex:happy});fg=evCrowd(46,11,350,0);label=evT('Roadshow')+(sp.loc?' · '+sp.loc:'')}
 else{bg=evBg('fanclub');figs=evFigs(sp,{frontY:372,frontS:1.08,backY:318,backS:.88,pose:(i)=>[1,3,4,2][i%4],ex:(i)=>[2,1,11,4][i%4]});
  fg=`<rect x="40" y="340" width="720" height="34" rx="6" fill="#fffaf3" stroke="#e2cfa8" stroke-width="3"/><rect x="40" y="372" width="720" height="78" fill="#f7e3ea"/>`+[...Array(7)].map((_,i)=>{const x=90+i*104;return`<g><ellipse cx="${x}" cy="436" rx="26" ry="34" fill="#7a6f8f"/><circle cx="${x}" cy="392" r="16" fill="#7a6f8f"/><path d="M${x+6} 410Q${x+18} 360 ${x+24} 352" stroke="#7a6f8f" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M${x+28} 344l2 -4 2 4" stroke="#ff8fb7" stroke-width="2" fill="none"/></g>`}).join('')+`<rect x="250" y="24" width="300" height="40" rx="10" fill="#f7a3c8"/><text x="400" y="51" text-anchor="middle" font-family="Dela Gothic One,sans-serif" font-size="18" fill="#fff">HANDSHAKE EVENT</text>`;
  label=evT('Handshake Event')}
 const title=`<g><rect x="12" y="${sp.k=='hs'?78:12}" width="${Math.min(520,90+((label+sp.t).length*7.6))}" height="44" rx="12" fill="#fffaf3" opacity=".92"/><text x="26" y="${sp.k=='hs'?97:31}" font-family="M PLUS Rounded 1c,Mitr,sans-serif" font-size="13" font-weight="800" fill="#c76a95">${esc(label)}</text><text x="26" y="${sp.k=='hs'?115:49}" font-family="M PLUS Rounded 1c,Mitr,sans-serif" font-size="14" font-weight="800" fill="#4b3a5e">${esc(sp.t||'')}</text></g>`;
 const out=`<svg viewBox="0 0 800 450" class="evimg" role="img" aria-label="${esc(label+' — '+(sp.t||''))}" xmlns="http://www.w3.org/2000/svg"><clipPath id="evclip"><rect width="800" height="450" rx="14"/></clipPath><g clip-path="url(#evclip)">${bg}${sp.k=='hs'?figs+fg:figs+fg}${title}</g></svg>`;
 EV_SVG.set(sp,out);return out}
function evImgBlock(sp,cap){if(!sp)return`<div class="evph"><span>🎤</span>${esc(evT('No event image for this record yet.'))}</div>`;let svg='';try{svg=evImgSvg(sp)}catch(e){svg=''}
 if(!svg)return`<div class="evph"><span>🎤</span>${esc(evT('Event image unavailable.'))}</div>`;return`<figure class="evfig">${svg}<figcaption>${esc(cap||'')} ${sp.m.length} ${esc(evT('members'))}${sp.retro?' · '+esc(evT('reconstructed from the record')):''}</figcaption></figure>`}
function evOpen(id){const sp=evImgOf(id);ui.mod={t:'html',h:`<h2 class="ht">${esc(sp?({release:'Release Day Mini Concert',road:'Roadshow',hs:'Handshake Event'}[sp.k]):'Event')}</h2>${evImgBlock(sp,sp?sp.t:'')}`};render()}

// ---- show the images where events are reviewed ---------------------------------------
const _evRsRes=rsResHtml;rsResHtml=function(id,tab){const e=rsGet(id);return(e?evImgBlock(e.img||evImgOf(id),e.st||''):'')+_evRsRes.apply(this,arguments)};
const _evHsRes=hsResHtml;hsResHtml=function(P){let sp=null;const ev=(S.cal||[]).find(e=>e.type=='handshake'&&e.plan===P);if(ev)sp=ev.img;if(!sp){const r=S.singles.flatMap(x=>x.promo||[]).find(r=>r.type=='handshake'&&r.res===P);if(r)sp=r.img}return evImgBlock(sp,P&&P.title)+_evHsRes.apply(this,arguments)};
const _evPromo=singlePromo;singlePromo=function(x){evSync();let h=_evPromo.apply(this,arguments);const P=x.promo||[],cal=S.cal||[],items=[];
 const cc=P.find(r=>r.type=='concert');if(cc&&cc.img)items.push([cc.id,cc.img,'Release Day Mini Concert']);
 const hs=cal.find(e=>e.type=='handshake'&&e.rid==x.rid&&e.img)||P.find(r=>r.type=='handshake'&&r.img);if(hs)items.push([hs.id,hs.img,'Handshake Event']);
 P.filter(r=>r.type=='road'&&r.img).forEach(r=>items.push([r.id,r.img,'Roadshow · '+(r.loc||'')]));
 cal.filter(e=>e.type=='road'&&e.rid==x.rid&&e.img&&!P.some(r=>r.id==e.id)).forEach(e=>items.push([e.id,e.img,'Roadshow · '+((RSL[e.loc]||{}).n||'')+' (in progress)']));
 if(!items.length)return h;const gal=`<div class="evgal">${items.map(([id,sp,n])=>`<button class="evthumb" onclick="evOpen('${id}')" title="${esc(n)}">${evImgSvg(sp)}<small>${esc(n)}</small></button>`).join('')}</div>`;
 return h.replace(/(<\/h3><div class="st">Released [^<]*<\/div>)/,'$1'+gal)};
const _evRelease=doRelease;doRelease=function(){const n=S.singles.length;_evRelease.apply(this,arguments);evSync();if(S.singles.length>n&&ui.mod&&ui.mod.t=='html'){const x=S.singles[S.singles.length-1],cc=(x.promo||[]).find(r=>r.type=='concert');if(cc&&cc.img)ui.mod.h=ui.mod.h.replace('</h2>','</h2>'+evImgBlock(cc.img,x.title));render()}};

// ---- Roadshow: always the latest released single --------------------------------------
// switching to a new single starts a clean plan: setlists, members and dates of the old single are never carried over
function evRsSync(){const L=latestSingle();ui.rsp=ui.rsp||{rid:null,tab:'jp',loc:null,plan:false};if(L&&ui.rsp.rid!==L.rid)ui.rsp={rid:L.rid,tab:ui.rsp.tab||'jp',loc:ui.rsp.loc||null,plan:false};if(L&&ui.rs&&ui.rs.rid!==L.rid){ui.rs.rid=L.rid;ui.rs.sel=[]}return L}
const _evRoad=V.roadshow;V.roadshow=function(){const L=evRsSync();let h=_evRoad.call(V);
 return h.replace(/<label class="st">Promoting <select[\s\S]*?<\/select><\/label>/,L?`<span class="pill evpromo">📣 Promoting: <b>#${L.num||''} ${esc(L.title)}</b> <span class="st">· latest released single${S.pj&&S.pj.status=='producing'?` · next single "${esc(S.pj.title)}" is in production`:''}</span></span>`:'')};
const _evPlan=rsPlanStart;rsPlanStart=function(){evRsSync();return _evPlan.apply(this,arguments)};
const _evBook=rsBook;rsBook=function(){if(ui.rsp){const L=latestSingle();if(L&&ui.rsp.rid!==L.rid){evRsSync();toast('A new single was released: the Roadshow planner now promotes it. Please review the plan.','err');return render()}}return _evBook.apply(this,arguments)};
const _evPromoV=V.promo;V.promo=function(){evRsSync();return _evPromoV.call(V)};
// keep image records in history in step (cheap, idempotent)
const _evRender=render;render=function(){try{if(S&&!ui.t)evSync()}catch(e){}return _evRender.apply(this,arguments)};
