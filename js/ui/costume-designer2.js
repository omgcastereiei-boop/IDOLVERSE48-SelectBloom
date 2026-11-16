// =====================================================================================
//  Costume Designer expansion — UI (same Costume Designer, same library, same save format)
//  · the new component categories join the existing category bar, grouped so it stays readable:
//    Basics · Details · Accessories · Festival · Traditional
//  · search + collection / style filters for large categories; real thumbnails for every item
//  · placement for the new components: side (left / right / both), layer, size, position, rotation,
//    area (trims & embroidery) and sheerness — clamped per component so nothing floats away or covers the face
//  · pattern groups (Basic / Thai / Chinese / Japanese / Universal), pattern rotation and a reusable
//    Pattern Library (patterns are saved on their own and can be applied to any piece of any costume)
// =====================================================================================
CZX_CAT.forEach(c=>{if(CZ_CATS.some(x=>x.k==c.k))return;const vars={};c.items.forEach(([k])=>{if(CZX[k]&&CZX[k].vars)vars[k]=CZX[k].vars});CZ_CATS.push({...c,vars})});
const CZ_GRPS=[['basic','Basics',['top','dr','sleeve','collar','outer','bottom','over','shoes','legs','x','a']],['detail','Details',['bod','skx','shd','bk','trim']],['acc','Accessories',['orn','emb','hd','fan']],['fes','Festival & Graduation',['fes','g']],['trad','Traditional',['trad']]];
Object.assign(CZ_CROP,{dr:'8 36 84 150',bod:'26 40 48 40',skx:'4 60 92 110',shd:'16 34 68 56',bk:'0 30 100 140',trim:'24 40 52 80',orn:'26 40 48 44',fan:'0 20 100 120',emb:'22 40 56 80',hd:'24 -12 52 44',fes:'14 30 72 90',trad:'14 30 72 110'});
const czxGrpOf=k=>(CZ_GRPS.find(g=>g[2].includes(k))||CZ_GRPS[0])[0];
// tags used by the filters
const CZX_FTAGS={trad:['Thai','Chinese','Japanese'],fes:['Christmas','Halloween','Valentine','Spring','Summer','New Year','Easter','Winter','Autumn','Birthday','Graduation'],hd:['Christmas','Halloween','Royal','Elegant','Thai','Chinese','Japanese','Cute','Fantasy']};
const CZX_STY=['Cute','48 Idol','Elegant','Royal','Cool','Military','Mature','Romantic','Fantasy','Pop','Traditional','Modern','Gothic'];
// default colours for new components
{const f=czItem;czItem=function(cat,t){const E=ui.czE,had=!!(E&&E.p&&czGetSlot(E.p,cat+'.'+t));const r=f.apply(this,arguments);try{const D=CZX[t];if(D&&!had&&D.col){const P=czGetSlot(ui.czE.p,cat+'.'+t);if(P){[P.c1,P.c2,P.c3]=D.col;if(D.ar)P.ar=D.ar[0][0];render()}}}catch(e){console.error(e)}return r}}
{const f=czThumb;czThumb=function(cat,t){const D=CZX[t];if(!D)return f.apply(this,arguments);const E=ui.czE,m=czPrevMember(),a=ap(m),p=czClone(E.p);p[cat]=p[cat]||{};if(!p[cat][t]){p[cat][t]=czPiece(t,(D.col||[])[0]||'#f7a8c8',(D.col||[])[1]||'#ffffff',(D.col||[])[2]||'#f3c35c');if(D.ar)p[cat][t].ar=D.ar[0][0];if(D.lr&&D.one)p[cat][t].sd='L'}
 const vb=D.crop||(D.z=='head'?'22 -14 56 54':D.z=='arm'?'12 40 76 60':CZ_CROP[cat]);return`<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${fig(m,{pose:D.z=='arm'?3:0,of:a.of,oh:a.oh,ac:a.ac,ex:2,cd:p})}</svg>`}}
// placement & extra settings
function czxSet(f,v){const E=ui.czE,P=czGetSlot(E.p,E.sel);if(!P||!czCanEdit())return;if(v===''||v==null)delete P[f];else P[f]=['sd','z','ar'].includes(f)?v:+v;czMark();if(['s','dx','dy','r','op','pr'].includes(f))czLive();else render()}
function czxReset(){const E=ui.czE,P=czGetSlot(E.p,E.sel);if(!P)return;['s','dx','dy','r','op'].forEach(k=>delete P[k]);czMark();render()}
const CZX_ZN={back:'Behind the body',mid:'On the outfit (under outerwear)',front:'On top',over:'Above the arms'};
function czxPlaceHtml(D,P){const ed=czCanEdit()?'':'disabled',rg=(f,n,a,b,st,v)=>`<label class="st czxrg">${n} <input type="range" min="${a}" max="${b}" step="${st}" value="${v}" ${ed} oninput="czxSet('${f}',this.value)" onchange="render()"><b>${f=='op'?Math.round(v*100)+'%':f=='s'?Math.round(v*100)+'%':f=='r'?Math.round(v)+'°':Q(v)}</b></label>`;
 let h=`<div class="czsub">Placement</div><div class="czxpl">`;
 if(D.lr)h+=`<div class="row"><b>Side</b>${(D.one?[['L','Left'],['R','Right']]:[['B','Both'],['L','Left only'],['R','Right only']]).map(([k,n])=>`<button class="b s ${(P.sd||(D.one?'L':'B'))==k?'on':''}" ${ed} onclick="czxSet('sd','${k}')">${n}</button>`).join('')}</div>`;
 if(D.ar)h+=`<div class="row"><b>Area</b>${D.ar.map(([k,n])=>`<button class="b s ${(P.ar||D.ar[0][0])==k?'on':''}" ${ed} onclick="czxSet('ar','${k}')">${n}</button>`).join('')}</div>`;
 if(D.zs&&D.zs.length>1)h+=`<div class="row"><b>Layer</b>${D.zs.map(z=>`<button class="b s ${(P.z&&D.zs.includes(P.z)?P.z:D.z)==z?'on':''}" ${ed} onclick="czxSet('z','${z}')">${CZX_ZN[z]||z}</button>`).join('')}</div>`;
 if(D.sc&&D.sc[0]!=D.sc[1])h+=rg('s','Size',D.sc[0],D.sc[1],.05,P.s??1);
 if(D.mv){h+=rg('dx','Left ↔ right',-D.mv,D.mv,.5,P.dx||0)+rg('dy','Up ↕ down',-D.mv,D.mv,.5,P.dy||0)}
 if(D.rot)h+=rg('r','Rotation',-D.rot,D.rot,1,P.r||0);
 if(D.op!=null||D.z=='back'||/tulle|veil|translucent|floatside|layereddrape|pibo/.test(P.t))h+=rg('op','Opacity',.2,1,.05,P.op??(D.op??1));
 h+=`<div class="row"><button class="b s" ${ed} onclick="czxReset()">Reset size & position</button><span class="st">Limits keep the part attached to the outfit and away from the face.</span></div></div>`;return h}
// pattern groups + rotation + library
const CZX_PG=[['basic','Basic',k=>!CZX_PAT[k]],['thai','Thai',k=>['kanok','prajamyam','phumkhaobin','phikun','thaifloral','thaigeo'].includes(k)],['cn','Chinese',k=>['cndragon','cnphoenix','cncloud','peony','cnfloral','huiwen','brocade'].includes(k)],['jp','Japanese',k=>['sakura','asanoha','seigaiha','crane','kiku','jpfloral','nami','kikko'].includes(k)],['uni','Universal',k=>['roses','lilies','butterflies','ribbons','pearls','chains','crystals','snowflakes','abstract','web'].includes(k)]];
function czxPatHtml(P){const g=ui.czPg||((CZX_PG.find(([,,t])=>t(P.pat||'solid'))||CZX_PG[0])[0]),T=CZX_PG.find(x=>x[0]==g)||CZX_PG[0],L=CZ_PATS.filter(([k])=>T[2](k)),lib=czxPatLib();
 return`<div class="row czxpg">${CZX_PG.map(([k,n])=>`<button class="b s ${k==g?'on':''}" onclick="ui.czPg='${k}';render()">${n}</button>`).join('')}</div><div class="czpats">${L.map(([k,n])=>`<button class="czpat ${(P.pat||'solid')==k?'on':''}" onclick="czSetPat('${k}')" title="${n}">${czSwatch(k,P)}<small>${n}</small></button>`).join('')}</div>
 ${(P.pat||'solid')!='solid'?`<div class="row"><label class="st czxrg">Pattern rotation <input type="range" min="-90" max="90" step="5" value="${P.pr||0}" oninput="czxSet('pr',this.value)" onchange="render()"><b>${P.pr||0}°</b></label></div>`:''}
 <div class="czsub">Pattern Library <small class="st">reusable on any piece of any costume</small></div><div class="row">${(P.pat||'solid')!='solid'?`<button class="b s" onclick="czxPatSave()">💾 Save this pattern</button>`:''}${lib.length?`<div class="czxplib">${lib.map((x,i)=>`<button class="czpat" title="${esc(x.n)}" onclick="czxPatUse(${i})">${czSwatch(x.pat,{...P,...x})}<small>${esc(x.n)}</small></button><button class="b s czxpx" aria-label="Delete saved pattern" onclick="czxPatDel(${i})">✕</button>`).join('')}</div>`:'<span class="st">Saved patterns appear here.</span>'}</div>`}
function czxPatLib(){if(!S)return[];S.czPat=Array.isArray(S.czPat)?S.czPat:[];return S.czPat}
function czxPatSave(){const P=czGetSlot(ui.czE.p,ui.czE.sel);if(!P||(P.pat||'solid')=='solid')return;const n=(CZ_PATS.find(x=>x[0]==P.pat)||[0,'Pattern'])[1];czxPatLib().push({n:`${n} ${czxPatLib().length+1}`,pat:P.pat,pc:P.pc,dc:P.dc,ps:P.ps,pd:P.pd,pr:P.pr||0});toast('Pattern saved to the Pattern Library.');render()}
function czxPatUse(i){const P=czGetSlot(ui.czE.p,ui.czE.sel),x=czxPatLib()[i];if(!P||!x||!czCanEdit())return;Object.assign(P,{pat:x.pat,pc:x.pc,dc:x.dc,ps:x.ps,pd:x.pd,pr:x.pr||0});czMark();toast(`“${x.n}” applied. The fabric colour stays your own.`);render()}
function czxPatDel(i){const L=czxPatLib();if(!L[i])return;L.splice(i,1);render()}
// the grid: category groups, filters and the new editor sections
{const f=czGridHtml;czGridHtml=function(E,o,d,model){const g=ui.czGrp||czxGrpOf(E.cat),G=CZ_GRPS.find(x=>x[0]==g)||CZ_GRPS[0];if(!G[2].includes(E.cat)){E.cat=G[2][0];const c=CZ_CATS.find(x=>x.k==E.cat);if(c&&c.multi){const on=Object.keys(E.p[E.cat]||{}).find(x=>E.p[E.cat][x]);E.sel=on?E.cat+'.'+on:E.cat+'.'+c.items[0][0]}else E.sel=E.cat}
 const all=CZ_CATS.slice(),cat=CZ_CATS.find(x=>x.k==E.cat),items0=cat?cat.items:null,F=ui.czxF=ui.czxF||{q:'',tag:'',sty:''};
 if(cat&&cat.items.length>12&&CZX_CAT.some(c=>c.k==cat.k)){const q=(F.q||'').toLowerCase();cat.items=cat.items.filter(([k,n])=>{const D=CZX[k]||{tags:[]};return(!q||n.toLowerCase().includes(q))&&(!F.tag||D.tags.includes(F.tag))&&(!F.sty||D.tags.includes(F.sty))})}
 CZ_CATS.length=0;all.filter(c=>G[2].includes(c.k)).forEach(c=>CZ_CATS.push(c));let h;try{h=f.apply(this,arguments)}finally{CZ_CATS.length=0;all.forEach(c=>CZ_CATS.push(c));if(cat)cat.items=items0}
 try{const grp=`<div class="row czxgrp" role="tablist">${CZ_GRPS.map(([k,n,ks])=>{const cnt=ks.reduce((a,c)=>{const v=E.p[c];return a+(!v?0:CZ_CATS.find(x=>x.k==c&&x.multi)?Object.values(v).filter(Boolean).length:v.t&&v.t!='none'?1:0)},0);return`<button class="b s ${k==g?'p':''}" onclick="ui.czGrp='${k}';render()">${n}${cnt?` <i>${cnt}</i>`:''}</button>`}).join('')}</div>`;
  h=h.replace('<div class="czcats" role="tablist">',grp+'<div class="czcats" role="tablist">');
  if(cat&&CZX_CAT.some(c=>c.k==cat.k)&&items0.length>12){const tags=CZX_FTAGS[cat.k]||[],fil=`<div class="czxfil"><input placeholder="Search ${esc(cat.n.toLowerCase())}" value="${esc(F.q)}" onchange="ui.czxF.q=this.value;render()">${tags.length?`<select onchange="ui.czxF.tag=this.value;render()"><option value="">All collections</option>${tags.map(t=>`<option ${F.tag==t?'selected':''}>${t}</option>`).join('')}</select>`:''}<select onchange="ui.czxF.sty=this.value;render()"><option value="">All styles</option>${CZX_STY.map(t=>`<option ${F.sty==t?'selected':''}>${t}</option>`).join('')}</select></div>`;h=h.replace('<div class="czitems">',fil+'<div class="czitems">')}
  const P=czGetSlot(E.p,E.sel),D=P&&CZX[P.t];
  if(P&&P.t&&P.t!='none'){const i=h.indexOf('<div class="czsub">Pattern</div>');if(i>=0){let j=h.indexOf('<div class="czsub">Fabric &amp; texture</div>',i);if(j<0)j=h.length;const mid=h.slice(i,j),pre=mid.indexOf('<div class="row"><label class="st">Pattern size');const sizes=pre>=0?mid.slice(pre):'';h=h.slice(0,i)+(D?czxPlaceHtml(D,P):'')+`<div class="czsub">Pattern</div>`+czxPatHtml(P)+sizes+h.slice(j)}}
  if(E.cat=='dr'&&E.p.dr&&E.p.dr.t&&E.p.dr.t!='none')h=h.replace('<div class="czitems">','<p class="st">A dress is one piece: while it is worn, the Top and Bottom pieces are kept but not shown. Sleeves, collars, extras and every new component can still be added.</p><div class="czitems">');
  if((E.cat=='top'||E.cat=='bottom')&&E.p.dr&&E.p.dr.t&&E.p.dr.t!='none')h=h.replace('<div class="czitems">','<p class="st thwarn">A dress is selected — remove it in Basics › Dresses to wear this piece.</p><div class="czitems">')}catch(e){console.error(e)}
 return h}}

// random costumes keep using the original pieces only (no wings, hats or national costumes appear by surprise)
const CZX_NEWI=new Set(['sabai','thaitop','dusit','kimono','hanfu','qipaotop','phasin','hakama','mamian','ruqun','kimonosk','furi','hanfuw','water','jpcollar','jiaoling','beizi','lace','chiffon','organza','metallic','glitter','embfab']);
function czxHideNew(fn){const keep=CZ_CATS.slice(),sv=keep.map(c=>c.items),fab=CZ_FABS.slice(),pats=CZ_PATS.slice();CZ_CATS.length=0;keep.forEach(c=>{if(!CZX_CAT.some(x=>x.k==c.k)&&c.k!='dr')CZ_CATS.push(c)});CZ_CATS.forEach(c=>{c.items=c.items.filter(i=>!CZX_NEWI.has(i[0]))});
 CZ_FABS.length=0;fab.filter(f=>!CZX_NEWI.has(f[0])).forEach(f=>CZ_FABS.push(f));CZ_PATS.length=0;pats.filter(([k])=>!CZX_PAT[k]).forEach(x=>CZ_PATS.push(x));
 try{return fn()}finally{CZ_CATS.length=0;keep.forEach((c,i)=>{c.items=sv[i];CZ_CATS.push(c)});CZ_FABS.length=0;fab.forEach(f=>CZ_FABS.push(f));CZ_PATS.length=0;pats.forEach(x=>CZ_PATS.push(x))}}
