// =====================================================================================
//  IDOLVERSE48: Select Bloom!  —  Modular costume renderer (layered clothing pieces)
// -------------------------------------------------------------------------------------
//  A costume design is a set of independent pieces. Every piece has its own type,
//  variant, colours (primary / secondary / accent / pattern / details) and pattern
//  (type, size, density). modOutfit() turns a design into the drawing layers used by
//  the character engine (characters.js), so the pieces are really drawn on the idol.
//
//  Design format (stored per song in the save, see js/ui/costume-designer.js):
//   { top, sleeve, collar, outer, bottom, over, shoes, legs : piece,
//     x: {dsl,cape,ribbon,sash,belt,corset,drape : piece|null},
//     a: {hbow,headband,clip,crown,hat,hribbon,necklace,choker,earrings,gloves,armband,legacc,sdeco : piece|null} }
//   piece = { t:type, v:variant, c1,c2,c3,pc,dc:'#hex', pat:'solid'|..., ps:size, pd:density }
// =====================================================================================
const CZ_PATS=[['solid','Solid'],['stripe','Stripes'],['dots','Polka dots'],['plaid','Plaid'],['check','Checkered'],['floral','Floral'],['stars','Stars'],['hearts','Hearts'],['diamond','Diamonds'],['geo','Geometric'],['lace','Lace'],['mesh','Dot mesh'],['gradient','Gradient'],['sparkle','Sparkles'],['embroid','Embroidery']];
const CZ_CATS=[
 {k:'top',n:'Tops',jp:'トップス',items:[['blouse','Blouse'],['shirt','Shirt'],['crop','Crop top'],['sleeveless','Sleeveless top'],['offshoulder','Off-shoulder top'],['tee','T-shirt'],['dress','One-piece dress']],vars:{dress:['Short','Medium','Long'],blouse:['Buttons','Frill front','Lace yoke'],shirt:['Plain','Pocket'],crop:['Frill hem','Plain hem']}},
 {k:'sleeve',n:'Sleeves',jp:'袖',items:[['none','No sleeves'],['short','Short'],['puff','Puff'],['lpuff','Frilled puff'],['long','Long'],['bell','Bell']]},
 {k:'collar',n:'Collars',jp:'襟',items:[['none','None'],['round','Round collar'],['sailor','Sailor collar'],['frill','Frill collar'],['high','Mandarin collar'],['wide','Lace bertha']]},
 {k:'outer',n:'Outerwear',jp:'アウター',items:[['none','None'],['jacket','Cropped jacket'],['cardigan','Cardigan'],['vest','Vest'],['bolero','Bolero'],['coat','Tailcoat']]},
 {k:'bottom',n:'Bottoms',jp:'ボトムス',items:[['pleated','Pleated skirt'],['flared','Flared skirt'],['layered','Layered skirt'],['mini','Mini skirt'],['shorts','Shorts'],['pants','Long pants'],['wide','Wide-leg pants']],vars:{pleated:['Short','Medium','Long'],flared:['Short','Medium','Long'],layered:['Short','Medium','Long']}},
 {k:'over',n:'Overskirts',jp:'オーバースカート',items:[['none','None'],['sheer','Sheer tails'],['apron','Apron'],['peplum','Peplum'],['bustle','Back bustle'],['frillhem','Frill hem']]},
 {k:'x',n:'Extras',jp:'アクセント',multi:1,items:[['dsl','Detached sleeves'],['cape','Cape'],['ribbon','Neck ribbon'],['sash','Ribbon sash'],['belt','Belt'],['corset','Corset'],['drape','Fabric layer']],vars:{cape:['Short','Long'],ribbon:['Bow','Long tie']}},
 {k:'shoes',n:'Shoes',jp:'シューズ',items:[['boots','Knee boots'],['heels','High heels'],['mary','Mary Janes'],['sneakers','Sneakers'],['ankle','Ankle boots'],['loafers','Loafers']]},
 {k:'legs',n:'Legwear',jp:'レッグ',items:[['none','Bare legs'],['socks','Ankle socks'],['knee','Knee socks'],['thigh','Thigh-highs'],['stockings','Stockings']],vars:{socks:['Plain','Frilled'],knee:['Plain','Frilled','Striped top'],thigh:['Plain','Lace top']}},
 {k:'a',n:'Accessories',jp:'アクセサリー',multi:1,items:[['hbow','Hair bow'],['headband','Headband'],['clip','Hair clips'],['crown','Crown'],['hat','Hat'],['hribbon','Hair ribbon'],['necklace','Necklace'],['choker','Choker'],['earrings','Earrings'],['gloves','Gloves'],['armband','Arm accessory'],['legacc','Leg accessory'],['sdeco','Shoe decoration']],vars:{gloves:['Short','Long'],hat:['Mini top hat','Beret'],crown:['Tiara','Royal crown'],clip:['Stars','Hearts']}}];
const CZ_HEAD=['hbow','headband','clip','crown','hat','hribbon'];
const czPiece=(t,c1,c2,c3,o={})=>({t,v:0,c1,c2:c2||'#ffffff',c3:c3||'#f3c35c',pc:o.pc||'#ffffff',dc:o.dc||'#ffffff',pat:o.pat||'solid',ps:o.ps||1,pd:o.pd==null?.75:o.pd,...o});
const czLine=c=>/^#/.test(c||'')?mixc(c,'#2e2038',.48):'#6d5a7c';

// ---- patterns ------------------------------------------------------------------------
function czPat0(pid,P){const k=P.pat||'solid';if(k=='solid')return{f:P.c1,d:''};
 if(k=='gradient')return{f:`url(#${pid})`,d:`<linearGradient id="${pid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.c1}"/><stop offset="${N2(.3+(1-(P.pd??.75))*.4)}" stop-color="${P.c1}"/><stop offset="1" stop-color="${P.pc}"/></linearGradient>`};
 const c=P.pc,d=P.dc,o=N2(Math.max(.15,Math.min(1,P.pd??.75))),s=N2(Math.max(.4,Math.min(2.5,P.ps||1))),W=4;let m='';
 switch(k){
  case'stripe':m=`<rect width="1.4" height="4" fill="${c}"/>`;break;
  case'dots':m=`<circle cx="1" cy="1" r=".62" fill="${c}"/><circle cx="3" cy="3" r=".62" fill="${c}"/>`;break;
  case'plaid':m=`<rect width="4" height="1.3" fill="${c}" opacity=".7"/><rect width="1.3" height="4" fill="${c}" opacity=".6"/><rect x="2.6" width=".22" height="4" fill="${d}"/><rect y="2.6" width="4" height=".22" fill="${d}"/>`;break;
  case'check':m=`<rect width="2" height="2" fill="${c}"/><rect x="2" y="2" width="2" height="2" fill="${c}"/>`;break;
  case'floral':m=`<g transform="translate(2 2)">${[0,72,144,216,288].map(r=>`<ellipse cy="-.8" rx=".48" ry=".75" fill="${c}" transform="rotate(${r})"/>`).join('')}<circle r=".38" fill="${d}"/></g><circle cx=".2" cy=".2" r=".25" fill="${c}"/>`;break;
  case'stars':m=`<path d="M2 .8l.36.74.82.12-.6.58.14.82L2 2.67l-.72.39.14-.82-.6-.58.82-.12z" fill="${c}"/><circle cx=".4" cy="3.4" r=".22" fill="${c}"/>`;break;
  case'hearts':m=`<path d="M2 2.9C.9 2.1 1.1 1.2 2 1.7C2.9 1.2 3.1 2.1 2 2.9Z" fill="${c}"/><path d="M.3 .6C-.1 .3 0 0 .3 .2C.6 0 .7 .3 .3 .6Z" fill="${c}" transform="translate(.2 3)"/>`;break;
  case'diamond':m=`<path d="M2 0L4 2L2 4L0 2Z" fill="${c}"/><path d="M0 0L4 4M4 0L0 4" stroke="${d}" stroke-width=".14"/>`;break;
  case'geo':m=`<path d="M0 4L1 2.3L2 4ZM2 2L3 .3L4 2Z" fill="${c}"/><rect x="2.5" y="2.8" width=".8" height=".8" fill="${d}" transform="rotate(20 2.9 3.2)"/>`;break;
  case'lace':m=`<path d="M0 3.4Q1 1.8 2 3.4Q3 1.8 4 3.4" stroke="${c}" stroke-width=".3" fill="none"/><circle cx="1" cy="2.9" r=".3" fill="none" stroke="${c}" stroke-width=".18"/><circle cx="3" cy="2.9" r=".3" fill="none" stroke="${c}" stroke-width=".18"/><path d="M2 .4l.3.5-.3.5-.3-.5z" fill="${c}"/>`;break;
  case'mesh':m=`${[.5,1.5,2.5,3.5].map(x=>[.5,1.5,2.5,3.5].map(y=>`<circle cx="${x}" cy="${y}" r=".2" fill="${c}"/>`).join('')).join('')}`;break;
  case'sparkle':m=`<path d="M1.2 .3Q1.3 1.1 2.1 1.2Q1.3 1.3 1.2 2.1Q1.1 1.3 .3 1.2Q1.1 1.1 1.2 .3Z" fill="${c}"/><path d="M3 2.4Q3.06 2.88 3.5 2.94Q3.06 3 3 3.48Q2.94 3 2.5 2.94Q2.94 2.88 3 2.4Z" fill="${d}"/>`;break;
  case'embroid':m=`<path d="M.4 3.2C.4 1.8 2 1.6 2 .6M2 .6C2 1.6 3.6 1.8 3.6 3.2M1.2 2.6a.45 .45 0 1 1 .6 .5M2.8 2.6a.45 .45 0 1 0 -.6 .5" stroke="${c}" stroke-width=".2" fill="none" stroke-linecap="round"/><circle cx="2" cy=".5" r=".25" fill="${d}"/>`;break}
 return{f:`url(#${pid})`,d:`<pattern id="${pid}" width="${W}" height="${W}" patternUnits="userSpaceOnUse" patternTransform="scale(${s})"><rect width="${W}" height="${W}" fill="${P.c1}"/><g opacity="${o}">${m}</g></pattern>`}}


// ---- fabrics: a texture drawn over the colour/pattern (cotton = plain) ----------------
const CZ_FABS=[['cotton','Cotton'],['satin','Satin'],['velvet','Velvet'],['sequin','Sequins'],['denim','Denim'],['tulle','Tulle'],['leather','Leather'],['knit','Knit']];
function czFabOv(k){switch(k){
 case'satin':return'<path d="M-1 7L7 -1" stroke="#fff" stroke-width="1.6" opacity=".26"/><path d="M-1 3L3 -1M3 7L7 3" stroke="#fff" stroke-width=".5" opacity=".18"/>';
 case'velvet':return'<rect width="6" height="6" fill="#1e1a28" opacity=".16"/><circle cx="3" cy="3" r="2.2" fill="#fff" opacity=".07"/>';
 case'sequin':return[[1,1],[4,1.6],[2.4,3.4],[5,4.4],[.8,5]].map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r=".42" fill="#fff" opacity=".55"/>').join('')+'<circle cx="4" cy="1.6" r=".18" fill="#fff"/>';
 case'denim':return'<path d="M0 6L6 0M-3 6L3 0M3 6L9 0" stroke="#1e1a28" stroke-width=".25" opacity=".22"/><path d="M0 4.5L4.5 0" stroke="#fff" stroke-width=".2" opacity=".25"/>';
 case'tulle':return'<path d="M0 0L6 6M6 0L0 6M3 0V6M0 3H6" stroke="#fff" stroke-width=".18" opacity=".45"/>';
 case'leather':return'<rect width="6" height="6" fill="#1e1a28" opacity=".1"/><path d="M.5 2Q2 1 3.5 2" stroke="#fff" stroke-width=".35" opacity=".3" fill="none"/>';
 case'knit':return'<path d="M0 1L1.5 2.5L3 1L4.5 2.5L6 1M0 4L1.5 5.5L3 4L4.5 5.5L6 4" stroke="#1e1a28" stroke-width=".22" opacity=".2" fill="none"/>'}return''}
function czPat(pid,P){const r=czPat0(pid,P),k=P&&P.fab;if(!k||k=='cotton'||(P.pat||'solid')=='gradient')return r;const ov=czFabOv(k);if(!ov)return r;const id=pid+'F';
 return{f:'url(#'+id+')',d:r.d+'<pattern id="'+id+'" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="'+r.f+'"/>'+ov+'</pattern>'}}

// ---- head accessories (head frame 0..100 x 0..120) ------------------------------------
function czHeadAcc(cd){const A=(cd&&cd.a)||{};let s='';const L=czLine;
 if(A.hribbon){const P=A.hribbon;s+=`<path d="M78 28C86 46 82 70 90 92L84 90C78 70 82 48 74 32Z" fill="${P.c1}" stroke="${L(P.c1)}" stroke-width=".6"/>`+bowSvg(77,26,.9,22,P.c1,L(P.c1))}
 if(A.headband){const P=A.headband;s+=`<path d="M19 34C22 14 36 8 50 8C64 8 78 14 81 34L77.6 35C75 18 63 12.4 50 12.4C37 12.4 25 18 22.4 35Z" fill="${P.c1}" stroke="${L(P.c1)}" stroke-width=".6"/>`+(P.v?'':`<circle cx="50" cy="10.2" r="1.6" fill="${P.c3}"/>`)}
 if(A.crown){const P=A.crown;s+=P.v?`<path d="M36 14L37 2L43 8L50 0L57 8L63 2L64 14Q50 10 36 14Z" fill="${P.c1}" stroke="${L(P.c1)}" stroke-width=".7"/><rect x="36" y="12" width="28" height="3" rx="1" fill="${P.c2}" stroke="${L(P.c1)}" stroke-width=".5"/><circle cx="50" cy="7" r="1.8" fill="${P.c3}"/><circle cx="43" cy="10" r="1.1" fill="${P.c3}"/><circle cx="57" cy="10" r="1.1" fill="${P.c3}"/>`:`<path d="M34 16L37 6L42 12L50 1L58 12L63 6L66 16Q50 12 34 16Z" fill="${P.c1}" stroke="${L(P.c1)}" stroke-width=".7"/><circle cx="50" cy="7" r="2" fill="${P.c3}" stroke="#fff" stroke-width=".4"/><circle cx="42" cy="12" r="1.1" fill="${P.c2}"/><circle cx="58" cy="12" r="1.1" fill="${P.c2}"/>`}
 if(A.hat){const P=A.hat,pt=czPat('§HAT',P);s+=pt.d?`<defs>${pt.d}</defs>`:'';s+=P.v?`<g transform="rotate(-14 62 12)"><ellipse cx="62" cy="13" rx="18" ry="7" fill="${pt.f}" stroke="${L(P.c1)}" stroke-width=".7"/><circle cx="62" cy="5.6" r="1.6" fill="${P.c2}"/><path d="M45 15Q62 20 79 15" stroke="${P.c2}" stroke-width="1.4" fill="none"/></g>`:`<g transform="rotate(14 66 14)"><ellipse cx="66" cy="16" rx="12" ry="3" fill="${pt.f}" stroke="${L(P.c1)}" stroke-width=".7"/><path d="M58 15L59 1H73L74 15Z" fill="${pt.f}" stroke="${L(P.c1)}" stroke-width=".7"/><rect x="58.6" y="10.6" width="14.8" height="2.6" fill="${P.c2}"/></g>`+bowSvg(74,10,.35,14,P.c3,L(P.c3))}
 if(A.clip){const P=A.clip;s+=[[24,32,-10],[28,26,8]].map(([x,y,r])=>P.v?`<path d="M${x} ${y+2.4}C${x-4.4} ${y-.6} ${x-2.4} ${y-4} ${x} ${y-1.6}C${x+2.4} ${y-4} ${x+4.4} ${y-.6} ${x} ${y+2.4}Z" fill="${P.c1}" stroke="${L(P.c1)}" stroke-width=".5" transform="rotate(${r} ${x} ${y})"/>`:`<path d="M${x} ${y-4}l1.2 2.5 2.7.4-2 1.9.5 2.7-2.4-1.3-2.4 1.3.5-2.7-2-1.9 2.7-.4z" fill="${P.c1}" stroke="${L(P.c1)}" stroke-width=".5" transform="rotate(${r} ${x} ${y})"/>`).join('')}
 if(A.hbow){const P=A.hbow;s+=bowSvg(A.hribbon?24:76,22,1,A.hribbon?-18:18,P.c1,L(P.c1))}
 if(A.earrings){const P=A.earrings;s+=[20.6,79.4].map(x=>`<path d="M${x} 68v3" stroke="${P.c2}" stroke-width=".5"/><circle cx="${x}" cy="73" r="1.5" fill="${P.c1}" stroke="${L(P.c1)}" stroke-width=".4"/>`).join('')}
 return s}
const czHasHead=cd=>!!(cd&&cd.a&&CZ_HEAD.some(k=>cd.a[k]));

// ---- body pieces (figure frame) -------------------------------------------------------
function modOutfit(cd,id,D,sk){const W='#fffefc';let defs='';const F={},pat=(k,P)=>{if(!P)return'#fff';const r=czPat(id+'Z'+k,P);defs+=r.d;return r.f};
 const T=cd.top||czPiece('blouse','#ffffff'),SL=cd.sleeve||{t:'none'},CO=cd.collar||{t:'none'},OU=cd.outer||{t:'none'},BO=(cd.top&&cd.top.t=='dress')?{...cd.top,t:'flared',v:cd.top.v|0}:(cd.bottom||czPiece('pleated','#f5a3c4')),OV=cd.over||{t:'none'},SH=cd.shoes||czPiece('sneakers','#ffffff'),LG=cd.legs||{t:'none'},X=cd.x||{},A=cd.a||{};
 const fT=pat('top',T),lT=czLine(T.c1),sx=T.t=='tee'?1.1:1.05;
 const clip=`<clipPath id="${id}tc"><path d="${torsoD}" transform="translate(50 0) scale(${sx} 1) translate(-50 0)"/></clipPath>`;
 const hem=T.t=='crop'?62:T.t=='tee'?73:71;
 let top=clip+`<g clip-path="url(#${id}tc)"><rect x="20" y="${T.t=='offshoulder'?51.4:38}" width="60" height="${hem-(T.t=='offshoulder'?51.4:38)}" fill="${fT}"/><path d="M57 44L66 48L64 ${hem}L57 ${hem}Z" fill="#2e2038" opacity=".07"/>`;
 if(T.t=='blouse'){if(T.v==1)top+=`<path d="M50 47V${hem}" stroke="${T.dc}" stroke-width="1.6"/>`+[50,54,58,62,66].map(y=>`<path d="M48.6 ${y}q1.4 1.2 2.8 0" stroke="${czLine(T.dc)}" stroke-width=".25" fill="none"/>`).join('');else if(T.v==2)top+=`<path d="M41 46H59L58 55Q50 58 42 55Z" fill="${T.dc}" opacity=".9"/><path d="M42 55Q50 58 58 55" stroke="${czLine(T.dc)}" stroke-width=".3" fill="none" stroke-dasharray=".6 .5"/>`;else top+=`<path d="M50 46V${hem}" stroke="${lT}" stroke-width=".3" opacity=".6"/>`+[52,57,62,67].map(y=>`<circle cx="50.8" cy="${y}" r=".5" fill="${T.c3}"/>`).join('')}
 if(T.t=='shirt'){top+=`<path d="M49 46V${hem}M51 46V${hem}" stroke="${lT}" stroke-width=".3" opacity=".6"/>`+[52,57,62,67].map(y=>`<circle cx="50" cy="${y}" r=".5" fill="${T.c3}"/>`).join('')+(T.v?`<path d="M53.4 54h4.4v4Q55.6 59.4 53.4 58Z" fill="none" stroke="${lT}" stroke-width=".3"/>`:'')}
 if(T.t=='crop'&&!T.v)top+='';
 if(T.t=='tee')top+=`<path d="M45 52Q50 56 55 52Q54 60 50 60Q46 60 45 52Z" fill="${T.c2}" opacity=".9"/><path d="M47 55l1.4-1.4 1.6 1.6 1.6-1.6 1.4 1.4-3 3z" fill="${T.c3}"/>`;
 top+=`<path d="${torsoD}" transform="translate(50 0) scale(${sx} 1) translate(-50 0)" fill="none" stroke="${lT}" stroke-width=".7" clip-path="url(#${id}hm)"/></g><clipPath id="${id}hm"><rect width="100" height="${hem}"/></clipPath>`;
 if(T.t=='sleeveless')top+=`<path d="M34 46L44 45L44.6 50L39 56L34 54ZM66 46L56 45L55.4 50L61 56L66 54Z" fill="${sk[0]}"/><path d="M44.4 45.6L44.8 50.4L39.6 55.6M55.6 45.6L55.2 50.4L60.4 55.6" stroke="${lT}" stroke-width=".35" fill="none"/>`;
 if(T.t=='offshoulder')top+=`<path d="${skirtD(50.4,12.6,52.6,12.6,14,.9,0).replace(/wT\*=/,'')}" fill="${T.c2}" stroke="${czLine(T.c2)}" stroke-width=".3"/>`;
 if(T.t=='crop')top+=T.v?`<path d="M40.6 ${hem}Q50 ${hem+1.2} 59.4 ${hem}" stroke="${lT}" stroke-width=".35" fill="none"/>`:`<path d="${skirtD(hem-1.4,9.2,hem+.4,9,9,1,0)}" fill="${T.dc}" stroke="${czLine(T.dc)}" stroke-width=".3"/>`;
 else if(T.t!='offshoulder')top+=`<path d="M41.6 ${hem}Q50 ${hem+1.2} 58.4 ${hem}" stroke="${lT}" stroke-width=".35" fill="none"/>`;
 // bottoms
 const fB=pat('bot',BO),lB=czLine(BO.c1);let bottom='',pantsFn=null,hemY=92;
 const len=[86,92,104][BO.v|0]||92;
 if(BO.t=='pleated'){hemY=len;bottom=lay(69,8.6,len,15.4+(BO.v|0)*1.6,fB,lB,10)+pleats(69,8.6,len,15.4+(BO.v|0)*1.6,10,lB,.55)}
 else if(BO.t=='flared'){hemY=len;bottom=lay(69,8.2,len,18+(BO.v|0)*1.6,fB,lB,7)+[44,50,56].map(x=>`<path d="M${x} 71Q${x+(x-50)*.6} ${(69+len)/2} ${x+(x-50)*1.4} ${len+3}" stroke="${lB}" stroke-width=".3" fill="none" opacity=".5"/>`).join('')}
 else if(BO.t=='layered'){hemY=len+2;const fB2=pat('bot2',{...BO,c1:BO.c2,pat:'solid'});bottom=lay(69,8.4,len+2,18.4,fB,lB,12)+`<path d="${skirtD(len,18,len+2,18.4,12,1.4,2.2)}" fill="${BO.dc}" stroke="${czLine(BO.dc)}" stroke-width=".3"/>`+lay(69,8.4,len-6,15,fB2,czLine(BO.c2),10)+`<path d="${skirtD(len-8,14.6,len-6,15,10,1.3,2.2)}" fill="${BO.dc}" stroke="${czLine(BO.dc)}" stroke-width=".3"/>`+lay(69,8.4,len-14,11.4,fB,lB,8)}
 else if(BO.t=='mini'){hemY=84;bottom=`<path d="M41.2 69L58.8 69L61.6 84Q50 86 38.4 84Z" fill="${fB}" stroke="${lB}" stroke-width=".35"/><path d="M41 70.6H59" stroke="${BO.c2}" stroke-width="1.2"/>`}
 else{const wide=BO.t=='wide',full=BO.t!='shorts';hemY=0;bottom=`<path d="M41.2 69L58.8 69L60.4 ${full?84:82}L50 ${full?84:82}L50 80L50 ${full?84:82}L39.6 ${full?84:82}Z" fill="${fB}" stroke="${lB}" stroke-width=".35"/><path d="M41.2 70.6H58.8" stroke="${BO.c2}" stroke-width="1.2"/><circle cx="50" cy="70.6" r=".6" fill="${BO.c3}"/>`;
  pantsFn=LJ=>LJ.map(J=>{const S=limbPts(J,t=>legProf(t)+(wide?1.6+t*9:1.2),16);return`<path d="${limbPath(S,0,full?.97:.24,.15,full?.2:.6)}" fill="${fB}" stroke="${lB}" stroke-width=".35"/>`+(full?'':`<path d="${limbPath(S,.2,.24,.4)}" fill="${BO.c2}"/>`)}).join('')}
 // overskirts
 let back='',over='';const fO=OV.t!='none'?pat('ovr',OV):'',lO=czLine(OV.c1||'#fff');
 if(OV.t=='sheer')back+=`<path d="M42 72Q28 94 32 122L44 110L46 80ZM58 72Q72 96 68 126L56 112L54 80Z" fill="${fO}" opacity=".6" stroke="${lO}" stroke-width=".3"/>`;
 if(OV.t=='apron')over+=`<path d="M44 70.4L56 70.4L58.6 ${Math.max(84,hemY-4)}Q50 ${Math.max(86,hemY-2)} 41.4 ${Math.max(84,hemY-4)}Z" fill="${fO}" stroke="${lO}" stroke-width=".35"/><path d="${skirtD(Math.max(84,hemY-4)-1.4,7.6,Math.max(84,hemY-4),7.6,7,1,.6)}" fill="${OV.dc}" stroke="${czLine(OV.dc)}" stroke-width=".25"/>`;
 if(OV.t=='peplum')over+=lay(69,8.4,76,11.4,fO,lO,9);
 if(OV.t=='bustle'){back+=`<path d="M56 72Q70 90 66 118L60 112Q64 92 54 76ZM44 72Q30 90 34 118L40 112Q36 92 46 76Z" fill="${fO}" stroke="${lO}" stroke-width=".3"/>`;over+=bowS(59,71.6,1.3,fO,lO,0)}
 if(OV.t=='frillhem'&&hemY)over+=`<path d="${skirtD(hemY,16,hemY+3.4,17.6,13,1.5,2.2)}" fill="${fO}" stroke="${lO}" stroke-width=".3"/>`;
 // extras
 let mid='',outer='',collar='',front='';
 if(X.corset){const P=X.corset,f=pat('cor',P),l=czLine(P.c1);mid+=`<path d="M41 57Q50 55.6 59 57L58.4 66Q57.4 69 58.6 72.4Q50 74 41.4 72.4Q42.6 69 41.6 66Z" fill="${f}" stroke="${l}" stroke-width=".4"/>`+[59,62,65,68].map(y=>`<path d="M48.4 ${y}L51.6 ${y+2}M51.6 ${y}L48.4 ${y+2}" stroke="${P.dc}" stroke-width=".35"/>`).join('')+`<path d="M41 57Q50 55.6 59 57" stroke="${P.c2}" stroke-width=".8" fill="none"/>`}
 if(X.belt){const P=X.belt;mid+=`<path d="M41 69.4H59V71.6H41Z" fill="${P.c1}" stroke="${czLine(P.c1)}" stroke-width=".3"/><rect x="48.6" y="69" width="2.8" height="3" rx=".5" fill="none" stroke="${P.c3}" stroke-width=".55"/>`}
 if(X.sash){const P=X.sash,f=pat('sash',P),l=czLine(P.c1);mid+=`<path d="M40.8 68.4H59.2V72.2H40.8Z" fill="${f}" stroke="${l}" stroke-width=".3"/><path d="M57 72L62 92L58.6 90.4L57.4 93L54 74Z" fill="${f}" stroke="${l}" stroke-width=".3"/>`+bowS(57.6,70.6,1.6,f,l,0)}
 if(X.drape){const P=X.drape,f=pat('drp',P);mid+=`<path d="M40.4 70Q52 74 60 72L58 94Q48 90 37 86Z" fill="${f}" opacity=".55" stroke="${czLine(P.c1)}" stroke-width=".3"/>`}
 // outerwear
 let sleeveOv=null;
 if(OU.t!='none'){const f=pat('out',OU),l=czLine(OU.c1),LN=`stroke="${l}" stroke-width=".4" stroke-linejoin="round"`;
  if(OU.t=='vest')outer=`<g clip-path="url(#${id}tc)"><path d="M41 44L47.6 46.4L50 58L52.4 46.4L59 44L64 50L62 70Q56 72.4 50 73.4Q44 72.4 38 70L36 50Z" fill="${f}" ${LN}/>${[61,64.6,68].map(y=>`<circle cx="48.4" cy="${y}" r=".55" fill="${OU.c3}"/><circle cx="51.6" cy="${y}" r=".55" fill="${OU.c3}"/>`).join('')}</g>`;
  else{const yb={jacket:66,cardigan:84,bolero:56.6,coat:71}[OU.t],lap=OU.t=='jacket'||OU.t=='coat';
   const panel=s=>`<path d="M${50-s*13.6} 47.6Q${50-s*9} 45.8 ${50-s*5.4} 45.6L${50-s*(lap?3.2:4.6)} ${lap?60:52}L${50-s*(OU.t=='bolero'?7:4.2)} ${yb}Q${50-s*11} ${yb+1} ${50-s*(OU.t=='cardigan'?12.6:11.4)} ${yb}L${50-s*14.6} 52Z" fill="${f}" ${LN}/>`;
   outer=panel(1)+panel(-1);
   if(lap)outer+=`<path d="M44.6 45.8L46.8 59L44 54.6L42.6 47.2ZM55.4 45.8L53.2 59L56 54.6L57.4 47.2Z" fill="${OU.c2}" ${LN}/>`;
   if(OU.t=='cardigan')outer+=`<path d="M45.8 47L45.8 84M54.2 47L54.2 84" stroke="${OU.c2}" stroke-width="1.2"/><path d="M37.6 83.4H45.8M54.2 83.4H62.4" stroke="${OU.c2}" stroke-width="1.4"/>`+[56,62,68,74].map(y=>`<circle cx="46.4" cy="${y}" r=".55" fill="${OU.c3}"/>`).join('');
   if(OU.t=='coat'){back+=`<path d="M40 66L34 112L44 106L46 70ZM60 66L66 112L56 106L54 70Z" fill="${f}" ${LN}/><path d="M34 112L44 106M66 112L56 106" stroke="${OU.c3}" stroke-width=".7"/>`;outer+=`<path d="M38.6 71H45.8M54.2 71H61.4" stroke="${OU.c3}" stroke-width=".8"/>`+[60,64,68].map(y=>`<circle cx="45.6" cy="${y}" r=".6" fill="${OU.c3}"/><circle cx="54.4" cy="${y}" r=".6" fill="${OU.c3}"/>`).join('')}
   if(OU.t=='jacket')outer+=[60,63.4].map(y=>`<circle cx="45.2" cy="${y}" r=".55" fill="${OU.c3}"/>`).join('');
   sleeveOv={t:OU.t=='bolero'?'puff':'long',f,l,cuff:OU.t=='coat'?OU.c3:OU.c2}}}
 // collars & neck pieces
 if(CO.t!='none'){const f=pat('col',CO),l=czLine(CO.c1);
  if(CO.t=='round')collar+=`<path d="M45.2 45.2C43 47 43 50.6 46.6 51.4L50 48.6ZM54.8 45.2C57 47 57 50.6 53.4 51.4L50 48.6Z" fill="${f}" stroke="${l}" stroke-width=".35"/><path d="M44.2 50.2Q45 51.2 46.6 51.4M55.8 50.2Q55 51.2 53.4 51.4" stroke="${CO.dc}" stroke-width=".5" fill="none"/>`;
  if(CO.t=='sailor')collar+=`<path d="M43.2 45.4L50 57L56.8 45.4L63.8 49.4L60 55.4L50 60L40 55.4L36.2 49.4Z" fill="${f}" stroke="${l}" stroke-width=".35"/><path d="M37.6 50.2L41 54.4L50 58.6L59 54.4L62.4 50.2" stroke="${CO.c2}" stroke-width=".5" fill="none"/>`;
  if(CO.t=='frill')collar+=`<path d="${skirtD(45.4,5.2,49.6,7.6,9,1.4,1.6)}" fill="${f}" stroke="${l}" stroke-width=".3"/>`;
  if(CO.t=='high')collar+=`<path d="M46.6 42.4H53.4L54 46.6Q50 47.6 46 46.6Z" fill="${f}" stroke="${l}" stroke-width=".35"/><circle cx="50" cy="45" r=".55" fill="${CO.c3}"/>`;
  if(CO.t=='wide')collar+=`<path d="${skirtD(45.2,6.6,54,14.4,13,1.6,2.4)}" fill="${f}" stroke="${l}" stroke-width=".3"/><path d="${skirtD(52,13.2,54,14.4,13,1.2,2.4)}" fill="none" stroke="${CO.dc}" stroke-width=".4"/>`}
 if(A.choker){const P=A.choker;collar+=`<path d="M47.2 40.6Q50 42 52.8 40.6V42Q50 43.4 47.2 42Z" fill="${P.c1}"/><circle cx="50" cy="43.6" r=".8" fill="${P.c3}"/>`}
 if(A.necklace){const P=A.necklace;collar+=[...Array(9)].map((_,i)=>`<circle cx="${N2(45.6+i*1.1)}" cy="${N2(46+Math.sin(i/8*Math.PI)*3)}" r=".45" fill="${P.c1}" stroke="${czLine(P.c1)}" stroke-width=".12"/>`).join('')+`<path d="M50 49.4l1 1.4-1 1.4-1-1.4z" fill="${P.c3}"/>`}
 if(X.ribbon){const P=X.ribbon,f=pat('rib',P),l=czLine(P.c1);collar+=P.v?`<path d="M49 48.4H51L51.8 60L50 62L48.2 60Z" fill="${f}" stroke="${l}" stroke-width=".3"/><path d="M48.6 47.2H51.4L51 49H49Z" fill="${f}" stroke="${l}" stroke-width=".3"/>`:bowS(50,49.2,1.05,f,l)}
 if(X.cape){const P=X.cape,f=pat('cape',P),l=czLine(P.c1),yb=P.v?124:98;back+=`<path d="M37 47Q50 44 63 47Q72 ${yb*.6} 76 ${yb}Q50 ${yb+6} 24 ${yb}Q28 ${yb*.6} 37 47Z" fill="${f}" stroke="${l}" stroke-width=".4"/><path d="M28 ${yb-2}Q50 ${yb+4} 72 ${yb-2}" stroke="${P.c2}" stroke-width=".8" fill="none"/>`;front+=`<path d="M36.4 48.4Q50 43 63.6 48.4L62 53Q50 49.6 38 53Z" fill="${f}" stroke="${l}" stroke-width=".35"/><circle cx="50" cy="47" r="1.2" fill="${P.c3}" stroke="${l}" stroke-width=".3"/>`}
 // limbs
 const fS=SL.t!='none'?pat('slv',SL):null;
 const O={defs:(defs?defs:'')}; // defs filled after all pat() calls below
 O.sleeve=sleeveOv?sleeveOv.t:SL.t;O.sc=sleeveOv?sleeveOv.f:fS;O.sln=sleeveOv?sleeveOv.l:czLine(SL.c1);O.cuff=sleeveOv?sleeveOv.cuff:SL.c2;
 if(X.dsl){const P=X.dsl;O.dsl={f:pat('dsl',P),l:czLine(P.c1),c2:P.c2}}
 if(A.gloves){const P=A.gloves;O.glove=P.c1;O.gloveFrom=P.v?.45:.82}
 if(A.armband){const P=A.armband;O.armb={c:P.c1,c3:P.c3}}
 // legs & shoes
 const legSpec={none:null,socks:{t:'sock',c:LG.c1,from:.88,frill:LG.v==1},knee:{t:'sock',c:LG.c1,from:.6,frill:LG.v==1,band:LG.v==2?LG.c2:null},thigh:{t:'sock',c:LG.c1,from:.28,lace:LG.v==1?LG.c2:null,lacetop:LG.v==1},stockings:{t:'tights',c:LG.c1,from:0}}[LG.t]||null;
 const fL=legSpec&&LG.pat&&LG.pat!='solid'?pat('leg',LG):null;if(legSpec&&fL)legSpec.f=fL;
 let leg=legSpec?{...legSpec}:null;
 if(SH.t=='boots'||SH.t=='ankle'){const bt={t:'boot',c:SH.c1,from:SH.t=='boots'?.6:.86,lace:SH.c2};leg=leg?{...leg,over:bt}:bt}
 O.leg=leg||{};O.shoe={t:{boots:'boot',ankle:'boot',heels:'heel',mary:'mary',sneakers:'sneaker',loafers:'loafer'}[SH.t]||'sneaker',c:SH.c1,a:SH.c2,deco:A.sdeco?A.sdeco.c1:null};
 if(A.legacc)O.garter=A.legacc.c1;
 O.top=top;O.vestL='';O.skirt=bottom+over;O.cover=0;O.mid=mid;O.outer=outer;O.collar=collar+front;O.back=back;O.pantsFn=pantsFn;
 O.defs=defs;return O}

// ---- costume presets: starting points only (every piece stays editable) --------------
const CZ_PRESETS=(()=>{const P=czPiece,x=(o)=>o;const mk=(top,sleeve,collar,outer,bottom,over,shoes,legs,X={},A={})=>({top,sleeve,collar,outer,bottom,over,shoes,legs,x:X,a:A});
 return[
 ['Cute Idol',mk(P('blouse','#ffffff','#f7a8c8','#f3c35c',{v:1,dc:'#ffd7e6'}),P('lpuff','#ffffff','#f7a8c8'),P('round','#ffffff',0,0,{dc:'#f7a8c8'}),{t:'none'},P('layered','#f9b6cf','#ffffff','#f3c35c',{v:0,pat:'plaid',pc:'#e985ad',dc:'#ffffff'}),{t:'none'},P('sneakers','#f7a8c8','#ffffff'),P('knee','#ffffff','#f7a8c8',0,{v:1}),{ribbon:P('ribbon','#f27aa6'),sash:P('sash','#ffffff')},{hbow:P('hbow','#f27aa6'),armband:P('armband','#f7a8c8')})],
 ['School Uniform',mk(P('blouse','#ffffff'),P('long','#ffffff','#2c3a6b'),P('sailor','#2c3a6b','#ffffff'),{t:'none'},P('pleated','#2c3a6b','#ffffff','#f3c35c',{v:1}),{t:'none'},P('loafers','#4a3438'),P('knee','#2c3a6b'),{ribbon:P('ribbon','#e2455f')},{})],
 ['Princess',mk(P('offshoulder','#fff5fb','#ffffff','#f3c35c'),P('puff','#fff5fb','#ffffff'),{t:'none'},{t:'none'},P('layered','#ffd3e6','#ffffff','#f3c35c',{v:2,dc:'#ffffff'}),P('frillhem','#ffffff'),P('heels','#ffe3ef','#f3c35c'),P('stockings','#fff4f8'),{corset:P('corset','#f7a8c8','#ffffff','#f3c35c',{dc:'#ffffff',pat:'embroid',pc:'#ffffff',pd:.5})},{crown:P('crown','#f6d77c','#ffffff','#f58fb5'),necklace:P('necklace','#fff8f2','#fff','#a6dbff'),gloves:P('gloves','#ffffff',0,0,{v:1}),earrings:P('earrings','#a6dbff','#f3c35c')})],
 ['Magical Girl',mk(P('crop','#ffffff','#ffffff','#f3c35c',{dc:'#9fd3ff'}),P('puff','#ffffff','#9fd3ff'),P('wide','#ffffff',0,0,{dc:'#9fd3ff'}),{t:'none'},P('flared','#8fc8ff','#ffffff','#f3c35c',{v:0,pat:'stars',pc:'#ffffff'}),P('frillhem','#ffffff'),P('boots','#ffffff','#8fc8ff'),P('none','#ffffff'),{ribbon:P('ribbon','#ff8fb7'),cape:P('cape','#c9b6ff','#ffffff','#f3c35c',{pat:'sparkle',pc:'#ffffff'})},{hbow:P('hbow','#ff8fb7'),gloves:P('gloves','#ffffff')})],
 ['Elegant',mk(P('blouse','#fbf6ee','#d9c08a','#d9b36a',{v:2,dc:'#efe4cf'}),P('long','#fbf6ee','#d9c08a'),P('high','#fbf6ee',0,'#d9b36a'),{t:'none'},P('flared','#3b3562','#d9c08a','#d9b36a',{v:2}),{t:'none'},P('heels','#2b2436','#d9b36a'),P('stockings','#ecdcd0'),{belt:P('belt','#d9b36a','#fff','#fff4c0')},{necklace:P('necklace','#fff8f2','#fff','#d9b36a'),earrings:P('earrings','#d9b36a','#d9b36a')})],
 ['Cool',mk(P('tee','#2b2436','#ffffff','#9fd3ff'),P('none','#2b2436'),{t:'none'},P('jacket','#3c4a78','#2b2436','#cfd4dc'),P('shorts','#2b2436','#9fd3ff','#cfd4dc'),{t:'none'},P('ankle','#1e1a28','#9fd3ff'),P('thigh','#1e1a28'),{belt:P('belt','#1e1a28','#fff','#cfd4dc')},{choker:P('choker','#1e1a28',0,'#9fd3ff')})],
 ['Sexy / Mature',mk(P('sleeveless','#7a1f3d','#ffffff','#d9b36a'),P('none','#7a1f3d'),{t:'none'},{t:'none'},P('mini','#2b1a24','#7a1f3d','#d9b36a'),P('sheer','#b83a64'),P('heels','#2b1a24','#d9b36a'),P('stockings','#3a2a30',0,0,{pat:'mesh',pc:'#000000',pd:.6}),{corset:P('corset','#2b1a24','#7a1f3d','#d9b36a',{dc:'#d9b36a'})},{choker:P('choker','#2b1a24',0,'#d9b36a'),earrings:P('earrings','#d9b36a','#d9b36a'),gloves:P('gloves','#2b1a24',0,0,{v:1})})],
 ['Gothic',mk(P('blouse','#2b2436','#ffffff','#b9a2ec',{v:1,dc:'#ffffff'}),P('bell','#2b2436','#ffffff'),P('frill','#ffffff'),{t:'none'},P('layered','#2b2436','#5b3f78','#b9a2ec',{v:1,dc:'#ffffff'}),P('apron','#ffffff','#fff','#fff',{pat:'lace',pc:'#e6dcef',dc:'#ffffff'}),P('boots','#1e1a28','#b9a2ec'),P('thigh','#1e1a28','#ffffff',0,{v:1}),{corset:P('corset','#5b3f78','#2b2436','#b9a2ec',{dc:'#ffffff'})},{headband:P('headband','#2b2436',0,0,{v:1}),choker:P('choker','#2b2436',0,'#b9a2ec'),hbow:P('hbow','#2b2436')})],
 ['Rock',mk(P('tee','#1e1a28','#e2455f','#ffffff'),P('none','#1e1a28'),{t:'none'},P('vest','#2b2436','#e2455f','#cfd4dc',{pat:'check',pc:'#e2455f',ps:.8,pd:.5}),P('pleated','#e2455f','#1e1a28','#cfd4dc',{v:0,pat:'plaid',pc:'#1e1a28',dc:'#ffffff'}),{t:'none'},P('boots','#1e1a28','#cfd4dc'),P('stockings','#1e1a28',0,0,{pat:'mesh',pc:'#000000'}),{belt:P('belt','#1e1a28','#fff','#cfd4dc')},{choker:P('choker','#1e1a28',0,'#cfd4dc'),armband:P('armband','#1e1a28','#fff','#cfd4dc'),clip:P('clip','#e2455f')})],
 ['Street Fashion',mk(P('tee','#ffffff','#9fd3ff','#f3c35c'),P('short','#ffffff','#9fd3ff'),{t:'none'},P('cardigan','#ffd36a','#ffffff','#ffffff'),P('wide','#6e86c4','#ffffff','#cfd4dc'),{t:'none'},P('sneakers','#ffffff','#ff8fb7'),P('socks','#ffffff'),{},{hat:P('hat','#ff8fb7','#ffffff','#ffd36a',{v:1}),clip:P('clip','#ffd36a',0,0,{v:1})})],
 ['Traditional Japanese',mk(P('blouse','#f6e7f0','#c0392b','#f3c35c',{pat:'floral',pc:'#f28aa8',dc:'#ffd36a'}),P('bell','#f6e7f0','#c0392b',0,{pat:'floral',pc:'#f28aa8',dc:'#ffd36a'}),P('high','#c0392b',0,'#f3c35c'),{t:'none'},P('pleated','#7a2335','#f3c35c','#f3c35c',{v:2}),{t:'none'},P('mary','#7a2335','#f3c35c'),P('socks','#ffffff'),{sash:P('sash','#f3c35c','#ffffff','#c0392b',{pat:'embroid',pc:'#c0392b'})},{hribbon:P('hribbon','#c0392b'),clip:P('clip','#ffd36a',0,0,{v:1})})],
 ['Futuristic',mk(P('crop','#e8f4ff','#9fd3ff','#7cf2ff',{v:1}),P('long','#c9d6ea','#7cf2ff',0,{pat:'geo',pc:'#9fd3ff',pd:.5}),P('high','#e8f4ff',0,'#7cf2ff'),P('bolero','#c9d6ea','#7cf2ff','#7cf2ff',{pat:'gradient',pc:'#9fb4ff'}),P('mini','#c9d6ea','#7cf2ff','#7cf2ff',{pat:'gradient',pc:'#8a9cff'}),P('sheer','#9fd3ff'),P('boots','#e8f4ff','#7cf2ff'),P('none','#fff'),{belt:P('belt','#7cf2ff','#fff','#ffffff')},{headband:P('headband','#c9d6ea',0,'#7cf2ff'),earrings:P('earrings','#7cf2ff','#c9d6ea')})],
 ['Summer Festival',mk(P('sleeveless','#fff7d6','#ffb46e','#ff8fb7',{pat:'floral',pc:'#ffb46e',dc:'#ff8fb7'}),P('none','#fff'),{t:'none'},{t:'none'},P('flared','#ffb46e','#ffffff','#ff8fb7',{v:0,pat:'stripe',pc:'#ffe2b8',pd:.6}),P('frillhem','#ffffff'),P('sneakers','#ffffff','#ffb46e'),P('socks','#ffffff',0,0,{v:1}),{sash:P('sash','#ff8fb7')},{hat:P('hat','#fff2c8','#ff8fb7','#ffb46e',{v:1}),armband:P('armband','#ff8fb7','#fff','#fff')})]]})();
const czClone=o=>JSON.parse(JSON.stringify(o));
