// =====================================================================================
//  Game-style picker for every dropdown
// -------------------------------------------------------------------------------------
//  Every <select> in the game opens this picker instead of the browser's own list (which looks
//  like a web page, especially on phones). Nothing in the screens changes: the picker sets the
//  select's value and fires its normal "change" event, so every existing handler works as before.
//  Disabled, multiple and list-box selects keep the browser behaviour. Long lists get a search box.
// =====================================================================================
const GP={sel:null,t:null};
const gpTr=s=>typeof tr=='function'?tr(s):s;
function gpLabel(sel){const a=sel.getAttribute('aria-label');if(a)return a;const l=sel.closest('label');if(l){const t=[...l.childNodes].filter(n=>n.nodeType==3).map(n=>n.textContent).join(' ').trim();if(t)return t}const p=sel.previousElementSibling;if(p&&/^(SPAN|B|SMALL|LABEL)$/.test(p.tagName)&&p.textContent.trim().length<40)return p.textContent.trim();const o=sel.options[0];return o&&/^(All|Choose|Select|Add|Replace|Sort|—)/i.test(o.textContent.trim())?o.textContent.trim().replace(/…$/,''):gpTr('Choose')}
function gpOpen(sel){if(!sel||sel.disabled||sel.multiple||sel.size>1||!sel.options.length)return;gpClose(1);GP.sel=sel;const cur=sel.value,L=[];let grp=null;
 [...sel.children].forEach(ch=>{if(ch.tagName=='OPTGROUP'){L.push({h:ch.label});[...ch.children].forEach(o=>L.push({o}))}else L.push({o:ch})});
 const items=L.map((x,i)=>x.h!=null?`<div class="gph">${esc(x.h)}</div>`:x.o.hidden?'':`<button type="button" class="gpo ${x.o.value==cur&&x.o.selected?'on':''}" ${x.o.disabled?'disabled':''} data-v="${esc(x.o.value)}" data-i="${i}"><span>${esc(x.o.textContent)}</span>${x.o.value==cur&&x.o.selected?'<i>✓</i>':''}</button>`).join('');
 const el=document.createElement('div');el.className='gpov';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');
 el.innerHTML=`<div class="gpbox" role="listbox"><div class="gphd"><span class="gporn">✿ ─── ♪ ─── ✿</span><b>${esc(gpLabel(sel))}</b><button type="button" class="gpx" aria-label="${esc(gpTr('Close'))}">✕</button></div>${sel.options.length>12?`<div class="gpsr"><input type="search" placeholder="${esc(gpTr('Search'))}…" aria-label="${esc(gpTr('Search'))}"></div>`:''}<div class="gpl">${items}</div></div>`;
 document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('in'));
 el.addEventListener('click',e=>{if(e.target===el||e.target.closest('.gpx'))return gpClose();const b=e.target.closest('.gpo');if(!b||b.disabled)return;gpPick(b.dataset.v,+b.dataset.i)});
 const q=el.querySelector('.gpsr input');if(q)q.addEventListener('input',()=>{const v=q.value.toLowerCase();el.querySelectorAll('.gpo').forEach(b=>b.style.display=b.textContent.toLowerCase().includes(v)?'':'none')});
 const on=el.querySelector('.gpo.on');if(on)on.scrollIntoView({block:'center'});GP.t=el}
function gpPick(v,i){const sel=GP.sel;gpClose(1);if(!sel)return;const opt=[...sel.options].find(o=>o.value===v);if(!opt)return;if(sel.value===v&&opt.selected)return;sel.value=v;opt.selected=true;sel.dispatchEvent(new Event('input',{bubbles:true}));sel.dispatchEvent(new Event('change',{bubbles:true}))}
function gpClose(now){const el=GP.t;GP.t=null;GP.sel=null;if(!el)return;if(now)return el.remove();el.classList.remove('in');setTimeout(()=>el.remove(),160)}
const gpOk=t=>t&&t.tagName=='SELECT'&&!t.disabled&&!t.multiple&&!(t.size>1)&&!t.closest('.gpov')&&!t.hasAttribute('data-native');
// mouse: open on press (the browser list never opens); touch: open on a tap (scrolling still works)
document.addEventListener('mousedown',e=>{const t=e.target&&e.target.closest&&e.target.closest('select');if(!gpOk(t)||e.button!==0)return;e.preventDefault();t.focus({preventScroll:true});gpOpen(t)},true);
let GPT=null;
document.addEventListener('touchstart',e=>{const t=e.target&&e.target.closest&&e.target.closest('select');GPT=gpOk(t)?{t,x:e.touches[0].clientX,y:e.touches[0].clientY}:null},{capture:true,passive:true});
document.addEventListener('touchend',e=>{if(!GPT)return;const c=e.changedTouches[0],T=GPT;GPT=null;if(Math.abs(c.clientX-T.x)>10||Math.abs(c.clientY-T.y)>10)return;e.preventDefault();gpOpen(T.t)},{capture:true,passive:false});
document.addEventListener('click',e=>{const t=e.target&&e.target.closest&&e.target.closest('select');if(gpOk(t))e.preventDefault()},true);
document.addEventListener('keydown',e=>{if(GP.t&&e.key=='Escape'){e.preventDefault();return gpClose()}const t=e.target;if(gpOk(t)&&(e.key=='Enter'||e.key==' '||(e.altKey&&e.key=='ArrowDown'))){e.preventDefault();gpOpen(t)}},true);
