// =====================================================================================
//  IDOLVERSE48: Select Bloom! — the two permanent hosts of the General Election ceremony
// -------------------------------------------------------------------------------------
//  Mixmusa — CEO of Kisekiz Music (manages OMG4ki, WINÉR4 and SUMÉR4). Cute, warm, professional; green hair.
//  Lucia   — former Idol Queen of the legendary Midnight Musume. Glamorous, confident, experienced.
//  They are fixed characters (same face, hair and gown every election). They are NOT members: they are never
//  added to S.members, any group, any ranking, Senbatsu or performance. Nothing about them is saved.
// =====================================================================================
const GEH_ROLE={mix:['CEO, Kisekiz Music','ซีอีโอ Kisekiz Music'],lucia:['Former Idol Queen · Midnight Musume','อดีตราชินีไอดอลแห่ง Midnight Musume']};
const GEH_BIO={mix:['The CEO of Kisekiz Music, the agency behind OMG4ki, WINÉR4 and SUMÉR4. Cute and warm on stage, sharp and decisive in the boardroom — one of the most influential executives in the industry.','ซีอีโอของ Kisekiz Music ต้นสังกัดของ OMG4ki, WINÉR4 และ SUMÉR4 บนเวทีน่ารักและอบอุ่น แต่ในห้องประชุมเฉียบขาด หนึ่งในผู้บริหารที่ทรงอิทธิพลที่สุดในวงการ'],
 lucia:['Once the most celebrated Idol Queen of the legendary Midnight Musume. Years at the very top taught her the weight of the crown — tonight she welcomes a new generation to it.','อดีตราชินีไอดอลผู้โด่งดังที่สุดแห่งวงในตำนาน Midnight Musume หลายปีบนจุดสูงสุดสอนให้เธอรู้ว่ามงกุฎหนักเพียงใด คืนนี้เธอมาต้อนรับคนรุ่นใหม่สู่บัลลังก์นั้น']};
const GEH_P=(t,c1,c2,c3,o)=>czPiece(t,c1,c2,c3,{pat:'solid',fab:'satin',ps:1,...(o||{})});
function gehMk(k){
 if(k=='mix'){const s={id:990001,name:'Mixmusa',hue:150,pers:'Genki',_x:1,bgc:'hsl(150,55%,88%)'};
  s.ap={...newAp({id:990001,hue:150,pers:'Genki'},3),hcx:'#5fd39b',hc2x:'#2c9566',skx:'#fff3ee',ecx:'#2fa877',bk:2,ft:1,ah:2,mo:1,fs:0,of:2,oh:20,ac:0};
  const G='#3fbf8a',W='#fffdf6',A='#e8c46a';
  s.cd={x:{},a:{},top:GEH_P('blouse',G,W,A),bottom:GEH_P('flared',G,W,A),dr:GEH_P('highlow',G,W,A,{fab:'satin',pat:'solid'}),sleeve:GEH_P('lace',W,G,A,{fab:'organza'}),collar:GEH_P('frill',W,G,A),outer:{t:'none'},over:{t:'none'},
   shoes:GEH_P('heels',W,A,G),legs:GEH_P('stockings','#fff7f2','#fff7f2',G),trim:{pearltrim:GEH_P('pearltrim',W,A,G)},orn:{brooch:GEH_P('brooch',A,G,W)},hd:{pearlhp:GEH_P('pearlhp',W,A,G)}};
  s.cd.a={earrings:GEH_P('earrings',A,W,G),necklace:GEH_P('necklace',W,A,G),gloves:GEH_P('gloves',W,W,A)};return s}
 const s={id:990002,name:'Lucia',hue:340,pers:'Elegant',_x:1,bgc:'hsl(340,45%,86%)'};
 s.ap={...newAp({id:990002,hue:340,pers:'Elegant'},5),hcx:'#3b2140',hc2x:'#1d0f22',skx:'#fbefe9',ecx:'#b8336a',bk:3,ft:6,ah:0,mo:0,fs:1,of:2,oh:20,ac:0};
 const R='#9e1838',D='#5c0a1f',A='#f0cf74';
 s.cd={x:{},a:{},top:GEH_P('tube',R,D,A),bottom:GEH_P('flared',R,D,A),dr:GEH_P('mermaid',R,A,D,{fab:'sequin',pat:'sparkle',pc:'#ffd9a8'}),sleeve:{t:'none'},collar:{t:'none'},outer:{t:'none'},over:{t:'none'},
  shoes:GEH_P('heels',A,R,D),legs:{t:'none'},trim:{},orn:{},hd:{}};
 s.cd.a={earrings:GEH_P('earrings',A,'#ffffff',R),necklace:GEH_P('necklace',A,'#ffffff',R),gloves:GEH_P('gloves',D,D,A)};return s}
const GEH={};const geHost=k=>GEH[k]||(GEH[k]=gehMk(k));
const gehName=k=>geHost(k).name,gehRole=k=>gpT(...GEH_ROLE[k]),gehBio=k=>gpT(...GEH_BIO[k]);
// full figure (pose 13 holds a handheld microphone); Lucia is mirrored so the two face each other
const GEH_FC=new Map();
function gehFig(k,w,ex){const key=k+'|'+w+'|'+(ex|0);if(GEH_FC.has(key))return GEH_FC.get(key);const s=geHost(k),a=s.ap,id='gh'+k+(++PTC[0]);
 const inner=fig(s,{pose:13,of:a.of,oh:a.oh,ac:a.ac,ex:ex==null?(k=='mix'?2:0):ex,cd:s.cd});const h=(w*202/80).toFixed(1);
 const out=`<svg class="gehfig" viewBox="10 -4 80 202" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${k=='lucia'?`<g transform="translate(100 0) scale(-1 1)">${inner}</g>`:inner}</svg>`;GEH_FC.set(key,out);return out}
function gehPor(k,sz){const s=geHost(k),a=s.ap;return`<svg class="gehpor" viewBox="24 -3 52 52" width="${sz}" height="${sz}" xmlns="http://www.w3.org/2000/svg">${fig(s,{pose:0,of:a.of,oh:a.oh,ac:a.ac,ex:k=='mix'?2:0,cd:s.cd})}</svg>`}
// a dialogue box: one or two host lines
function gehSay(L){if(!L||!L.length)return'';return`<div class="gxmcs">${L.map(x=>`<div class="gxmc ${x.h}"><span class="gxmcp">${gehPor(x.h,46)}</span><div><b>${esc(gehName(x.h))}</b><small>${esc(gehRole(x.h))}</small><p>${esc(x.t)}</p></div></div>`).join('')}</div>`}
// host profile cards (General Election page)
function gehCards(){return`<div class="c gehcards"><h3>🎙 ${gpT('Ceremony hosts','พิธีกรงานประกาศผล')}</h3><div class="gehcl">${['mix','lucia'].map(k=>`<div class="gehc ${k}"><span>${gehPor(k,64)}</span><div><b>${esc(gehName(k))}</b><small>${esc(gehRole(k))}</small><p class="st">${esc(gehBio(k))}</p></div></div>`).join('')}</div></div>`}
