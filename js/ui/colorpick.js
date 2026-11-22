// =====================================================================================
//  IDOLVERSE48: Select Bloom! — in-game colour picker for every colour field
// -------------------------------------------------------------------------------------
//  Every <input type="color"> becomes a game-styled colour button. Tapping it opens the game's own
//  picker: saturation / brightness square, hue bar, the game palette, recently used colours and a
//  colour-code field (#RRGGBB or #RGB, with or without "#"). Dragging previews the colour live
//  (the field's normal "input" handler), Apply confirms it ("change"), Cancel restores the old one.
//  Works in pages and pop-ups; the original fields and their handlers stay unchanged.
// =====================================================================================
const CP_TH=()=>typeof UIP!='undefined'&&UIP.lang=='th';
const CP_PAL=['#ffffff','#fff4e8','#ffd3e6','#f7a8c8','#ff8fc0','#f27aa6','#e2455f','#7a1f3d','#ffe680','#f3c35c','#e8c66a','#d9a441','#9fe0c0','#3c9a6c','#2ec4c4','#9fd3ff','#6fb3e4','#3c4a78','#1f2a5c','#c9b6ff','#9d86da','#5b2a6e','#c9ced8','#2b2436','#1e1a28','#000000'];
const cpHex=v=>{let s=String(v||'').trim().replace(/^#/,'');if(/^[0-9a-f]{3}$/i.test(s))s=s.split('').map(c=>c+c).join('');return/^[0-9a-f]{6}$/i.test(s)?'#'+s.toLowerCase():null};
function cpRgb(h){const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255]}
function cpToHsv(h){const[r,g,b]=cpRgb(h).map(x=>x/255),mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let H=0;if(d){H=mx==r?((g-b)/d)%6:mx==g?(b-r)/d+2:(r-g)/d+4;H*=60;if(H<0)H+=360}return{h:H,s:mx?d/mx:0,v:mx}}
function cpFromHsv(h,s,v){const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;let[r,g,b]=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return'#'+[r,g,b].map(t=>Math.round((t+m)*255).toString(16).padStart(2,'0')).join('')}
function cpRecent(add){let L=[];try{L=JSON.parse(localStorage.getItem('iv48cp')||'[]')}catch(e){}if(add){L=[add,...L.filter(x=>x!=add)].slice(0,12);try{localStorage.setItem('iv48cp',JSON.stringify(L))}catch(e){}}return L.filter(x=>cpHex(x))}
let CP=null;
function cpOpen(inp){try{inp.dispatchEvent(new Event('focus'))}catch(e){}const v=cpHex(inp.value)||'#ffffff';CP={inp,old:v,cur:v,...cpToHsv(v)};cpDraw()}
function cpEmit(type){if(!CP)return;const inp=CP.inp;inp.value=CP.cur;try{inp.dispatchEvent(new Event(type,{bubbles:true}))}catch(e){}const b=inp.nextElementSibling;if(b&&b.classList.contains('cpbtn')){b.querySelector('i').style.background=CP.cur;const s=b.querySelector('span');if(s)s.textContent=CP.cur.toUpperCase()}}
let CP_RAF=0;function cpLive(){if(CP_RAF)return;CP_RAF=requestAnimationFrame(()=>{CP_RAF=0;cpEmit('input')})}
function cpSet(hex,from){const h=cpHex(hex);if(!h||!CP)return;CP.cur=h;if(from!='sv'&&from!='hue')Object.assign(CP,cpToHsv(h));cpPaint(from);cpLive()}
function cpPaint(from){const o=document.getElementById('cpov');if(!o||!CP)return;const sq=o.querySelector('.cpsq'),hu=o.querySelector('.cphue');sq.style.background=`linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,${cpFromHsv(CP.h,1,1)})`;
 o.querySelector('.cpdot').style.left=(CP.s*100)+'%';o.querySelector('.cpdot').style.top=((1-CP.v)*100)+'%';o.querySelector('.cphk').style.left=(CP.h/360*100)+'%';o.querySelector('.cpnew').style.background=CP.cur;
 const f=o.querySelector('.cphex');if(f&&from!='hex')f.value=CP.cur.toUpperCase();o.querySelectorAll('.cpsw').forEach(b=>b.classList.toggle('on',b.dataset.c==CP.cur))}
function cpDrag(el,fn){const go=e=>{const r=el.getBoundingClientRect(),p=e.touches?e.touches[0]:e;fn(Math.max(0,Math.min(1,(p.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(p.clientY-r.top)/r.height)))};
 el.addEventListener('pointerdown',e=>{e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(x){}go(e);const mv=ev=>go(ev),up=()=>{el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up)};el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)})}
function cpApply(){if(!CP)return;cpEmit('input');cpEmit('change');cpRecent(CP.cur);cpClose()}
function cpCancel(){if(!CP)return;if(CP.cur!=CP.old){CP.cur=CP.old;cpEmit('input');cpEmit('change')}cpClose()}
function cpClose(){CP=null;const o=document.getElementById('cpov');if(o)o.remove()}
function cpDraw(){let o=document.getElementById('cpov');if(o)o.remove();o=document.createElement('div');o.id='cpov';o.setAttribute('data-notr','');o.onclick=e=>{if(e.target===o)cpCancel()};document.body.appendChild(o);const th=CP_TH(),rec=cpRecent(),sw=c=>`<button class="cpsw" data-c="${c}" style="background:${c}" title="${c}" onclick="cpSet('${c}')"></button>`;
 o.innerHTML=`<div class="cpbox" role="dialog"><div class="gchd"><span>🎨 ${th?'เลือกสี':'Choose a colour'}</span><button class="gcx" onclick="cpCancel()" aria-label="Close">✕</button></div>
 <div class="cpsq"><i class="cpdot"></i></div><div class="cphue"><i class="cphk"></i></div>
 <div class="row cprow"><span class="cpprev"><i class="cpold" style="background:${CP.old}" title="${th?'สีเดิม':'Before'}" onclick="cpSet('${CP.old}')"></i><i class="cpnew"></i></span><label class="cpcode"><small>${th?'โค้ดสี':'Colour code'}</small><input class="cphex" maxlength="7" spellcheck="false" autocomplete="off" value="${CP.cur.toUpperCase()}" oninput="if(cpHex(this.value))cpSet(this.value,'hex')" onchange="const h=cpHex(this.value);if(h)cpSet(h);else this.value=CP.cur.toUpperCase()"></label></div>
 <div class="cplab">${th?'จานสีของเกม':'Game palette'}</div><div class="cpgrid">${CP_PAL.map(sw).join('')}</div>
 ${rec.length?`<div class="cplab">${th?'ใช้ล่าสุด':'Recent'}</div><div class="cpgrid">${rec.map(sw).join('')}</div>`:''}
 <div class="row gcft"><button class="b s" onclick="cpCancel()">${th?'ยกเลิก':'Cancel'}</button><span style="flex:1"></span><button class="b p" onclick="cpApply()">${th?'ใช้สีนี้':'Apply'}</button></div></div>`;
 cpDrag(o.querySelector('.cpsq'),(x,y)=>{CP.s=x;CP.v=1-y;CP.cur=cpFromHsv(CP.h,CP.s,CP.v);cpPaint('sv');cpLive()});
 cpDrag(o.querySelector('.cphue'),x=>{CP.h=Math.min(359.9,x*360);CP.cur=cpFromHsv(CP.h,CP.s,CP.v);cpPaint('hue');cpLive()});cpPaint()}
// replace the native fields (pages and pop-ups), whenever they appear
function cpEnhance(root){(root||document).querySelectorAll('input[type="color"]:not([data-cp])').forEach(inp=>{inp.setAttribute('data-cp','1');inp.classList.add('cphide');const b=document.createElement('button');b.type='button';b.className='cpbtn';b.disabled=inp.disabled;const v=cpHex(inp.value)||'#ffffff';
 b.innerHTML=`<i style="background:${v}"></i><span>${v.toUpperCase()}</span>`;b.title=inp.getAttribute('aria-label')||'';b.onclick=e=>{e.preventDefault();e.stopPropagation();cpOpen(inp)};inp.insertAdjacentElement('afterend',b)})}
{const f=render;render=function(){const r=f.apply(this,arguments);try{cpEnhance()}catch(e){console.error(e)}return r}}
try{new MutationObserver(()=>{if(document.querySelector('input[type="color"]:not([data-cp])'))cpEnhance()}).observe(document.documentElement,{childList:true,subtree:true})}catch(e){}
