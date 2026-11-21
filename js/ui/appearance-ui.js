// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Character Creator: appearance categories & colour picker
// -------------------------------------------------------------------------------------
//  The existing Character Creator (view 'creator', ui.draft, setAp / saveAp / resetAp) is kept
//  and given clear categories: Face Shape · Skin Color · Bangs · Back Hair · Ahoge · Eyebrows ·
//  Eyes · Mouth · Hair Color (+ the existing Outfits and Accessories). Every option is a thumbnail
//  drawn by the real renderer. Colours use a full picker (saturation/brightness square, hue,
//  HEX, RGB, presets, saved custom colours, reset). Changes show at once in the preview and are
//  stored in the member's appearance record only when "Confirm & Save" is pressed.
// =====================================================================================
const AP_CATS=[['face','Face Shape'],['bangs','Bangs'],['side','Side Locks'],['back','Back Hair'],['ahoge','Ahoge'],['hair','Hair Color'],['skin','Skin Color'],['brows','Eyebrows'],['eyes','Eyes'],['mouth','Mouth'],['outfit','Outfits']];
const AP_SKIN_PRE=['#fff4ee','#ffefe6','#fde6d6','#f5d7bd','#e6c0a0','#d2a07a','#b07a55','#8a5a3c','#6b4330','#4a2e22','#dfe8ff','#d8f5e4','#efe0ff','#bfe6ff'];
const AP_HAIR_PRE=()=>HC.map(x=>x[1]).concat(['#ffe9a8','#f2f0ec','#ff9f6b','#9fe0d0','#c7a4ff','#ffb3c7']);
const AP_EYE_PRE=()=>EC.map(x=>x[1]).concat(['#e0a020','#30c0a0','#ff6fa0','#9a7bff']);
// ---- colour maths ------------------------------------------------------------------------
const apH2R=h=>{const c=hx(h);return{r:c[0],g:c[1],b:c[2]}};
const apR2H=(r,g,b)=>'#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(+v||0))).toString(16).padStart(2,'0')).join('');
function apR2V(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){h=mx==r?((g-b)/d)%6:mx==g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360}return{h,s:mx?d/mx:0,v:mx}}
function apV2R(h,s,v){const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;let[r,g,b]=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return apR2H((r+m)*255,(g+m)*255,(b+m)*255)}
// ---- what each colour field means --------------------------------------------------------
const AP_COL={
 hcx:{n:'Hair color',cur:d=>apHairC(d)[1],pre:AP_HAIR_PRE,reset:d=>{delete d.hcx;delete d.hc2x}},
 hc2x:{n:'Hair shadow color',cur:d=>apHairC(d)[2],pre:AP_HAIR_PRE,reset:d=>{delete d.hc2x}},
 skx:{n:'Skin color',cur:d=>apSkinC(d,dz(get(ui.cm)||{id:0}))[0],pre:()=>AP_SKIN_PRE,reset:d=>{delete d.skx}},
 ecx:{n:'Eye color',cur:d=>apEyeC(d)[1],pre:AP_EYE_PRE,reset:d=>{delete d.ecx}},
 bcx:{n:'Eyebrow color',cur:d=>apOkHex(d.bcx)?d.bcx:mixc(apHairC(d)[2],'#2a1622',.25),pre:AP_HAIR_PRE,reset:d=>{delete d.bcx}},
 lcx:{n:'Eyelash color',cur:d=>apOkHex(d.lcx)?d.lcx:mixc('#2b1a26',apHairC(d)[2],.2),pre:()=>['#2b1a26','#1a1a2e','#4a2c22','#6b3a5a','#2c3e6b','#7a2a3a'],reset:d=>{delete d.lcx}}};
function apSavedCols(){const L=Array.isArray(UIP.apSaved)?UIP.apSaved:[];return L.filter(apOkHex).slice(0,16)}
function apSaveCol(h){if(!apOkHex(h))return;const L=apSavedCols().filter(x=>x.toLowerCase()!=h.toLowerCase());L.unshift(h);UIP.apSaved=L.slice(0,16);try{localStorage.setItem('iv48ui',JSON.stringify(UIP))}catch(e){}toast(`Saved ${h} to your colors.`);render()}
// set a colour (from any input); live drag updates only the preview, everything else on release
function apSetCol(k,h,live){if(!ui.draft||!AP_COL[k])return;h=String(h||'').trim();if(/^[0-9a-f]{6}$/i.test(h))h='#'+h;if(!apOkHex(h))return toast('Enter a colour as #RRGGBB.','err');ui.draft[k]=h.toLowerCase();if(live)return apLive(k);ui.apPk=null;render()}
function apResetCol(k){if(!ui.draft||!AP_COL[k])return;AP_COL[k].reset(ui.draft);ui.apPk=null;render()}
function apLive(k){const P=document.getElementById('apprev');if(P)P.innerHTML=apPrevHtml();const h=ui.draft[k],sw=document.getElementById('apcur');if(sw)sw.style.background=h;const hx_=document.getElementById('aphex');if(hx_&&document.activeElement!=hx_)hx_.value=h;const c=apH2R(h);['r','g','b'].forEach(x=>{const e=document.getElementById('ap'+x);if(e&&document.activeElement!=e)e.value=c[x]})}
let AP_DRAG=null;
function apSvDown(e,k){const el=e.currentTarget;AP_DRAG={k,el};el.setPointerCapture&&el.setPointerCapture(e.pointerId);apSvMove(e)}
function apSvMove(e){if(!AP_DRAG)return;const r=AP_DRAG.el.getBoundingClientRect(),s=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),v=1-Math.max(0,Math.min(1,(e.clientY-r.top)/r.height)),h=ui.apHue??0;
 const dot=AP_DRAG.el.querySelector('.apdot');if(dot){dot.style.left=(s*100)+'%';dot.style.top=((1-v)*100)+'%'}ui.apSV={s,v};apSetCol(AP_DRAG.k,apV2R(h,s,v),1)}
function apSvUp(){if(!AP_DRAG)return;AP_DRAG=null;render()}
function apHue(k,h){ui.apHue=+h;const sv=ui.apSV||{s:.6,v:.8};const box=document.querySelector('.apsv');if(box)box.style.background=apSvBg(+h);apSetCol(k,apV2R(+h,sv.s,sv.v),1)}
const apSvBg=h=>`linear-gradient(to top,#000,rgba(0,0,0,0)),linear-gradient(to right,#fff,hsl(${h} 100% 50%))`;
function apRgb(k,ch,v){const c=apH2R(AP_COL[k].cur(ui.draft));c[ch]=Math.max(0,Math.min(255,+v||0));apSetCol(k,apR2H(c.r,c.g,c.b))}
function apPicker(k){const C=AP_COL[k],d=ui.draft,h=C.cur(d),rgb=apH2R(h),hsv=apR2V(rgb.r,rgb.g,rgb.b);if(ui.apPk!==k){ui.apHue=Math.round(hsv.h);ui.apSV={s:hsv.s,v:hsv.v};ui.apPk=k}
 const sv=ui.apSV,hue=ui.apHue,custom=apOkHex(d[k]),sw=c=>`<button class="sw ${h.toLowerCase()==c.toLowerCase()?'on':''}" style="background:${c}" title="${c}" onclick="apSetCol('${k}','${c}')"></button>`,saved=apSavedCols();
 return`<div class="c appk"><div class="row appkh"><b>${C.n}</b><span id="apcur" class="apcur" style="background:${h}"></span><code>${h}</code>${custom?'<span class="tag">Custom</span>':''}<span style="flex:1"></span><button class="b s" ${custom?'':'disabled'} onclick="apResetCol('${k}')">↺ Reset color</button></div>
 <div class="apsvw"><div class="apsv" style="background:${apSvBg(hue)}" onpointerdown="apSvDown(event,'${k}')" onpointermove="apSvMove(event)" onpointerup="apSvUp()" onpointercancel="apSvUp()"><span class="apdot" style="left:${N2(sv.s*100)}%;top:${N2((1-sv.v)*100)}%"></span></div>
 <input class="aphue" type="range" min="0" max="359" value="${Math.round(hue)}" aria-label="Hue" oninput="apHue('${k}',this.value)" onchange="render()"></div>
 <div class="row apin"><label class="st">HEX <input id="aphex" value="${h}" maxlength="7" onchange="apSetCol('${k}',this.value)"></label>${['r','g','b'].map(x=>`<label class="st">${x.toUpperCase()} <input id="ap${x}" type="number" min="0" max="255" value="${rgb[x]}" onchange="apRgb('${k}','${x}',this.value)"></label>`).join('')}<label class="st apnat" title="System colour picker">🎨<input type="color" value="${h}" oninput="apSetCol('${k}',this.value,1)" onchange="apSetCol('${k}',this.value)"></label></div>
 <div class="st">Presets</div><div class="th">${C.pre().map(sw).join('')}</div>
 <div class="row" style="margin-top:6px"><span class="st">Saved colors</span><button class="b s" onclick="apSaveCol('${h}')">＋ Save this color</button></div><div class="th">${saved.map(sw).join('')||'<span class="st">No saved colors yet.</span>'}</div></div>`}
// ---- option grids ---------------------------------------------------------------------------
function apPM(o){const m=get(ui.cm);return{...m,_x:1,ap:{...ui.draft,...o}}}
function apGrid(k,names,vb,extra={},orig){const d=ui.draft,cur=d[k];return`<div class="th apth">${orig?`<button class="tb ${cur==null?'on':''}" onclick="apPick('${k}',null)">${pt(apPM({[k]:undefined,...extra}),64,0,vb)}<small>${orig}</small></button>`:''}${names.map((n,i)=>`<button class="tb ${cur===i?'on':''}" onclick="apPick('${k}',${i})">${pt(apPM({[k]:i,...extra}),64,0,vb)}<small>${n}</small></button>`).join('')}</div>`}
function apPick(k,v){if(!ui.draft)return;if(v==null)delete ui.draft[k];else ui.draft[k]=v;render()}
function apPrevHtml(){const m=get(ui.cm);if(!m||!ui.draft)return'';const pm=apPM({});return`<div class="approw">${pt(pm,0)}<div class="apfull">${CHAR_ASSETS.full(pm)}</div></div>`}
function apBody(cat){const d=ui.draft,m=get(ui.cm),D=dz(m);
 switch(cat){
  case'face':return`<div class="c"><b>Face Shape</b><p class="st">The face outline; eyes, nose, mouth and hair stay where they are.</p>${apGrid('fc',AP_FCN,'12 22 76 74',{bk:0,sx:0},'Original')}</div>`;
  case'skin':return apPicker('skx');
  case'bangs':return`<div class="c"><b>Bangs / Front Hair</b><p class="st">Chosen independently of the back hair. Every style is built from separate hair locks.</p>${apGrid('ft',FTN,'8 -4 84 78')}</div>`;
  case'side':return`<div class="c"><b>Side Locks</b><p class="st">Face-framing hair beside the cheeks — part of the front hair, joined to the bangs, in the same hair colour. “From back hair” keeps the side locks that come with the back hair style.</p>${apGrid('sx',SXN,'4 14 92 88',{ah:0})}</div>`;
  case'back':return`<div class="c"><b>Back Hair</b><p class="st">Chosen independently of the bangs.</p>${apGrid('bk',BKN,null)}</div>`;
  case'ahoge':{const cur=d.ah!=null?d.ah:D.ahoge;return`<div class="c"><b>Ahoge</b><p class="st">A hair lock growing out of the crown at the bangs' attachment point — same colour and shading as the bangs, and it follows the bangs style.</p><div class="th apth">${AP_AHN.map((n,i)=>`<button class="tb ${cur==i?'on':''}" onclick="apPick('ah',${i})">${pt(apPM({ah:i}),64,0,'14 -18 72 62')}<small>${n}</small></button>`).join('')}</div></div>`}
  case'brows':return`<div class="c"><b>Eyebrows</b><p class="st">Independent of the eye shape. (Shown without bangs so the shape is visible.)</p>${apGrid('br',BRN,'18 34 64 26',{ft:0})}</div>${apPicker('bcx')}`;
  case'eyes':return`<div class="c"><b>Eyes</b>${apGrid('ey',EYN,'18 40 64 36')}</div>${apPicker('ecx')}${ui.apEyeK=='lcx'?apPicker('lcx'):`<button class="b s" onclick="ui.apEyeK='lcx';render()">Eyelash color…</button>`}`;
  case'mouth':return`<div class="c"><b>Mouth</b><p class="st">The resting mouth. Event expressions (surprised, sad…) still change it for the moment.</p>${apGrid('mt',APMT.map(x=>x[0]),'34 68 32 16',{},'Original')}</div>`;
  case'hair':return apPicker('hcx')+(ui.apHairK=='hc2x'?apPicker('hc2x'):`<button class="b s" onclick="ui.apHairK='hc2x';render()">Hair shadow color…</button>`);
  case'outfit':return`<div class="c"><b>Outfit</b>${apGrid('of',OFN,'0 62 100 58')}</div><div class="c"><b>Outfit color</b><div class="th">${OHS.map(h=>`<button class="sw ${d.oh==h?'on':''}" style="background:hsl(${h} 75% 78%)" onclick="setAp('oh',${h})"></button>`).join('')}</div></div>`;
  case'acc':return`<div class="c"><b>Accessory</b>${apGrid('ac',ACN,'10 0 80 66')}</div>`}return''}
V.creator=function(){if(!S.members.length)return`<h2 class="ht">Character Creator</h2><div class="c"><p class="st">No idols yet. Recruit members through an audition first.</p><button class="b p" onclick="view='audition';render()">Go to Audition</button></div>`;
 if(!get(ui.cm)||!ui.draft){ui.cm=get(ui.cm)?ui.cm:S.members[0].id;ui.draft={...ap(get(ui.cm))}}
 const m=get(ui.cm),cat=AP_CATS.some(c=>c[0]==ui.apCat)?ui.apCat:'face',dirty=JSON.stringify(ui.draft)!=JSON.stringify(ap(m));
 return`<h2 class="ht">Character Creator</h2><div class="cr apcr"><div class="c cprev stage apside"><select onchange="cmSel(this.value)">${S.members.map(x=>`<option value="${x.id}" ${x.id==m.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select><div id="apprev">${apPrevHtml()}</div><div class="st">${(m.traits||[]).join(' / ')} · ${m.age}y ${dirty?'· <b>unsaved changes</b>':''}</div><div class="row" style="justify-content:center"><button class="b" onclick="rndAp()">Randomize</button><button class="b" onclick="resetAp()">Reset</button><button class="b p" onclick="saveAp()">Confirm &amp; Save</button></div></div>
 <div><div class="apnav" role="tablist">${AP_CATS.map(([k,n])=>`<button class="b s ${k==cat?'on p':''}" role="tab" onclick="ui.apCat='${k}';render()">${n}</button>`).join('')}</div>${apBody(cat)}</div></div>`};
// random appearance uses the whole new range (Randomize button only)
{const f=rapp;rapp=function(){const a=f.apply(this,arguments);a.ft=rnd(0,FTN.length-1);a.bk=rnd(0,BKN.length-1);a.ey=rnd(0,EYN.length-1);a.br=rnd(0,BRN.length-1);delete a.fs;a.fc=rnd(0,AP_FCN.length-1);a.sx=rnd(0,SXN.length-1);a.ah=rnd(0,AP_AHN.length-1);a.mt=rnd(0,APMT.length-1);return a}}
// a pointer released outside the colour square still ends the drag
if(typeof window!='undefined')window.addEventListener('pointerup',()=>{if(AP_DRAG)apSvUp()});
