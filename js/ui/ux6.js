// =====================================================================================
//  Small updates — random song attributes in Theater song forms · secondary colour ·
//  replace one colour everywhere · smooth multi-select copy dialogs · dress-up order by
//  position · centre-out position numbers on existing saves
// =====================================================================================
// ---- 1. Theater song forms: random Genre / Concept / Lyrics ---------------------------------------------------------------
function thSnRand(k,part){const e=ui[k];if(!e)return;const P=(L,v)=>pick(L.filter(x=>x!=v));if(part=='genre'||part=='all')e.genre=P(GENRES,e.genre);if(part=='concept'||part=='all')e.concept=P(CONCEPTS,e.concept);if(part=='ly'||part=='all')e.ly=P(LY_THEMES,e.ly);ui.mod.h=k=='thsn2'?thSongNewHtml2():thSongEditHtml();render()}
const thSnRandRow=k=>`<div class="row serand"><span class="st">🎲 Random</span><button class="b s" onclick="thSnRand('${k}','genre')">Genre</button><button class="b s" onclick="thSnRand('${k}','concept')">Concept</button><button class="b s" onclick="thSnRand('${k}','ly')">Lyrics</button><button class="b s p" onclick="thSnRand('${k}','all')">🎲 Randomize all</button></div>`;
{const f=thSongNewHtml2;thSongNewHtml2=function(){const h=f.apply(this,arguments);if(!h)return h;const i=h.indexOf('<div class="row"><button class="b p" onclick="thSongMake2()">');return i<0?h:h.slice(0,i)+thSnRandRow('thsn2')+h.slice(i)}}
{const f=thSongEditHtml;thSongEditHtml=function(){const h=f.apply(this,arguments);if(!h||!ui.thse)return h;const i=h.lastIndexOf('<div class="row"><button class="b p"');return i<0?h:h.slice(0,i)+thSnRandRow('thse')+h.slice(i)}}
// ---- 2. secondary colour for "colours from main colour" ------------------------------------------------------------------
function czFromMain2(hex,sub){const E=czEdP();if(!E)return;const ok=v=>/^#?[0-9a-f]{6}$/i.test(v||'');if(!ok(hex)||!ok(sub))return toast('Choose the main and the secondary colour.','err');if(hex[0]!='#')hex='#'+hex;if(sub[0]!='#')sub='#'+sub;
 const[h,s,l]=czToHsl(hex),[h2,s2,l2]=czToHsl(sub),R=a=>a[Math.floor(Math.random()*a.length)];
 czPaint(E.p,{base:hex,light:czHsl(h,Math.max(20,s*.5),Math.min(95,l+28)),dark:czHsl(h,s*.8,Math.max(12,l-35)),acc:sub,acc2:czHsl(h2+R([-15,0,15]),Math.max(30,s2*.85),Math.min(88,l2+R([8,15,22]))),gold:R(['#f3c35c','#ffffff','#e9b949'])});
 UIP.czMain=hex;UIP.czSub=sub;try{localStorage.setItem('iv48ui',JSON.stringify(UIP))}catch(e){}E.dirty=1;toast('Colours built from your main and secondary colours (each press gives a new combination). Save to keep them.');render()}
// ---- 3. replace one colour in every piece --------------------------------------------------------------------------------
const CZ_CF=['c1','c2','c3','pc','dc'];
function czUsedCols(p){const M=new Map();czPieces(p||{}).forEach(([,P])=>CZ_CF.forEach(f=>{const v=P[f];if(typeof v=='string'&&/^#[0-9a-f]{6}$/i.test(v)){const k=v.toLowerCase();M.set(k,(M.get(k)||0)+1)}}));return[...M.entries()].sort((a,b)=>b[1]-a[1])}
function czRepPick(c){ui.czrep=ui.czrep||{};ui.czrep.from=c;render()}
function czRepGo(to){const E=czEdP();if(!E)return;const from=(ui.czrep||{}).from;if(!from)return toast('Tap a colour of the costume first.','err');if(!/^#?[0-9a-f]{6}$/i.test(to||''))return toast('Choose the new colour.','err');if(to[0]!='#')to='#'+to;to=to.toLowerCase();
 let n=0;czPieces(E.p).forEach(([,P])=>CZ_CF.forEach(f=>{if(typeof P[f]=='string'&&P[f].toLowerCase()==from){P[f]=to;n++}}));if(!n)return toast('That colour is no longer used in this costume.','err');ui.czrep.from=to;ui.czrep.to=to;E.dirty=1;try{czRecent(to)}catch(e){}toast(`${n} colour slot(s) changed in every piece. Save to keep them.`);render()}
{const f=czGridHtml;czGridHtml=function(){let h=f.apply(this,arguments);try{const E=ui.czE;if(!E||!E.p)return h;const sc=UIP.czSub||'#c9b6ff',R=ui.czrep||{},U=czUsedCols(E.p);
 h=h.replace('<button class="b s" onclick="czFromMain($(\'#czmainc\').value)">🎯 Colours from main colour</button>',`<button class="b s" onclick="czFromMain($('#czmainc').value)">🎯 Colours from main colour</button><label class="st czmc">Secondary colour <input type="color" id="czsubc" value="${sc}"></label><button class="b s" onclick="czFromMain2($('#czmainc').value,$('#czsubc').value)">🎯 Main + secondary</button>`);
 const rep=`<div class="czrep"><span class="st">🔁 Replace a colour in every piece — tap a colour:</span><div class="czrepl">${U.map(([c,n])=>`<button class="czsw ${R.from==c?'on':''}" style="background:${c}" title="${c} · ${n}" aria-label="Colour ${c}" onclick="czRepPick('${c}')"></button>`).join('')}</div>${R.from?`<div class="row"><span class="czsw on" style="background:${R.from}"></span><span>→</span><input type="color" id="czrepto" value="${R.to||R.from}"><button class="b s p" onclick="czRepGo($('#czrepto').value)">Change everywhere</button></div>`:''}</div>`;
 const i=h.indexOf('<div class="czact">');h=i<0?h+rep:h.slice(0,i)+rep+h.slice(i)}catch(e){console.error(e)}return h}}
// ---- 4. copy dialogs: select several members without re-rendering the page ---------------------------------------------------
function czCpDom(fn,id,sel,goFn){const on=sel.includes(id),b=document.querySelector(`.msel [onclick="${fn}(${id})"]`);if(b){b.classList.toggle('msel-on',on);const ck=b.querySelector('.mselck');if(on&&!ck)b.insertAdjacentHTML('afterbegin','<i class="mselck">✔</i>');if(!on&&ck)ck.remove()}
 const g=document.querySelector(`[onclick="${goFn}()"]`);if(g){g.disabled=!sel.length;g.textContent=`Copy to ${sel.length} member(s)`;try{if(typeof tr=='function')g.textContent=tr(g.textContent)}catch(e){}}return!!b}
plCzCpTog=function(id){const c=ui.czcp;if(!c)return;const i=c.sel.indexOf(id);if(i>=0)c.sel.splice(i,1);else c.sel.push(id);ui.mod.h=plCzCopyHtml();if(!czCpDom('plCzCpTog',id,c.sel,'plCzCpGo'))render()};
thCpTog=function(id){const c=ui.thcp;if(!c)return;const i=c.sel.indexOf(id);if(i>=0)c.sel.splice(i,1);else c.sel.push(id);ui.mod.h=thCzCopyHtml();if(!czCpDom('thCpTog',id,c.sel,'thCpGo'))render()};
// ---- 5. Theater dressing room: members in formation order ---------------------------------------------------------------
{const f=thCzCtx;thCzCtx=function(){const X=f.apply(this,arguments);try{if(X&&X.M&&X.M.length>1){const o=thForm(X.s,X.it).o;X.M=X.M.slice().sort((a,b)=>{const i=o.indexOf(a),j=o.indexOf(b);return(i<0?99:i)-(j<0?99:j)})}}catch(e){}return X}}
// ---- 6. centre-out position numbers: keep them after every formation change and on existing saves --------------------------
{const f=fmSync;fmSync=function(o){try{if(o&&o.fm)fmRenum(o.fm.sl)}catch(e){}return f.apply(this,arguments)}}
function fmRenumAll(){try{(S.groups||[]).forEach(g=>{Object.values(gsCtx(g.id,'songs')||{}).forEach(o=>{if(o&&o.fm&&Array.isArray(o.fm.sl))fmRenum(o.fm.sl)})})}catch(e){console.error(e)}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);if(S&&!S.fmN1){fmRenumAll();S.fmN1=1}return r}}
// covers are exported as standalone images (PNG): their portraits stay inline (no sprite references)
{const f=coverSvg;coverSvg=function(){PT_INLINE++;try{return f.apply(this,arguments)}finally{PT_INLINE--}}}
// ---- Performance = average of Vocal and Dance (replaces the old separate "Performance" value) ------------------------------
// m.cha becomes a computed value on every member, so every existing formula, sort and display that used "Performance"
// now uses the Vocal/Dance average; the old stored number is discarded. It cannot be trained directly.
const perfOf=m=>Math.round(((+m.sing||0)+(+m.dance||0))/2);
const PERF_D={get(){return perfOf(this)},set(){},enumerable:true,configurable:true};
function perfDef(m){if(!m||typeof m!='object')return;const d=Object.getOwnPropertyDescriptor(m,'cha');if(d&&d.get===PERF_D.get)return;try{delete m.cha;Object.defineProperty(m,'cha',PERF_D)}catch(e){}}
function perfSync(){if(!S)return;(S.members||[]).forEach(perfDef);(S.alumni||[]).forEach(perfDef);try{((ui.au&&ui.au.cands)||[]).forEach(perfDef)}catch(e){}}
{const f=render;render=function(){try{perfSync()}catch(e){}return f.apply(this,arguments)}}
{const f=tick;tick=function(){try{perfSync()}catch(e){}return f.apply(this,arguments)}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{perfSync()}catch(e){}return r}}
{const f=train;train=function(id,k){if(k=='cha')return toast('Performance is the average of Vocal and Dance — train those instead.','err');return f.apply(this,arguments)}}
SKL.cha='Performance';
// ---- Theater Unit member picker: 3 / 4 / 5 columns (same control as the member lists) ------------------------------------
GCOL_DEF.unit=4;
{const f=V.thset;V.thset=function(){let h=f.apply(this,arguments);try{if(h.includes('<div class="thpg">')){let first=true;h=h.split('<div class="thpg">').join('\u0001');h=h.replace(/\u0001/g,()=>{const b=first?gcolBar('unit'):'';first=false;return b+`<div class="thpg gcolu gcolu-${gcolGet('unit')}">`})}}catch(e){console.error(e)}return h}}
// ---- member profile: ✕ close button at the top right ---------------------------------------------------------------------
{const f=render;render=function(){const r=f.apply(this,arguments);try{if(ui.mod&&ui.mod.t=='prof'){const d=document.querySelector('.mod [role=dialog]');if(d&&!d.querySelector('.mxclose')){const b=document.createElement('button');b.type='button';b.className='mxclose';b.setAttribute('aria-label','Close');b.textContent='✕';b.onclick=()=>{ui.mod=null;render()};d.insertBefore(b,d.firstChild)}}}catch(e){}return r}}
// ---- Costume editor: Undo / Redo and the random-costume buttons under the character -----------------------------------------
// History follows the design being edited (ui.czE.p): every change made by any tool becomes one step.
let CZ_UR=0;
function czHist(){const E=ui.czE;if(!E||!E.p)return;let cur;try{cur=JSON.stringify(E.p)}catch(e){return}if(E._u==null){E._u=[];E._r=[];E._last=cur;return}if(CZ_UR||cur==E._last)return;E._u.push(E._last);if(E._u.length>60)E._u.shift();E._r=[];E._last=cur}
function czUndo(){const E=ui.czE;if(!E||!E._u||!E._u.length)return;czHist();E._r.push(JSON.stringify(E.p));const s=E._u.pop();E.p=JSON.parse(s);E._last=s;E.dirty=1;CZ_UR=1;try{render()}finally{CZ_UR=0}}
function czRedo(){const E=ui.czE;if(!E||!E._r||!E._r.length)return;E._u.push(JSON.stringify(E.p));const s=E._r.pop();E.p=JSON.parse(s);E._last=s;E.dirty=1;CZ_UR=1;try{render()}finally{CZ_UR=0}}
// library designer (no member context): random design for the design being edited
function czRandEd(){const E=ui.czE;if(!E||!E.p||!czEditing())return toast('Choose a design to edit first.','err');E.p=czRandom();E.dirty=1;toast('Random costume generated. Edit any piece, then press Save.');render()}
const CZ_RANDB=['plCzRandom()','thCzRandom()','thCzRandAll(0)','thCzRandAll(1)','thCzLibRand(0)','thCzLibRand(1)','geCzRandEd()'];
{const f=render;render=function(){try{czHist()}catch(e){}const r=f.apply(this,arguments);try{const st=document.getElementById('czstage'),pose=st&&st.parentNode&&st.parentNode.querySelector('.czpose');if(pose&&!document.querySelector('.czubar')){const E=ui.czE||{};
  const bar=document.createElement('div');bar.className='row czubar';bar.innerHTML=`<button class="b s" type="button" ${E._u&&E._u.length?'':'disabled'} onclick="czUndo()" aria-label="Undo">↶ Undo</button><button class="b s" type="button" ${E._r&&E._r.length?'':'disabled'} onclick="czRedo()" aria-label="Redo">↷ Redo</button>`;
  const moved=[];document.querySelectorAll('#app button[onclick]').forEach(b=>{if(CZ_RANDB.includes(b.getAttribute('onclick'))&&!st.parentNode.contains(b))moved.push(b)});
  if(!moved.length&&czEditing&&czEditing()&&!E.scz){const b=document.createElement('button');b.className='b s p';b.type='button';b.setAttribute('onclick','czRandEd()');b.textContent='🎲 Randomize Costume';moved.push(b)}
  moved.forEach(b=>bar.appendChild(b));pose.insertAdjacentElement('afterend',bar);try{if(typeof i18nApply=='function')i18nApply(bar)}catch(e){}}}catch(e){console.error(e)}return r}}
document.addEventListener('keydown',e=>{try{if(!document.getElementById('czstage')||/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||''))return;const k=(e.key||'').toLowerCase();if((e.ctrlKey||e.metaKey)&&k=='z'&&!e.shiftKey){e.preventDefault();czUndo()}else if((e.ctrlKey||e.metaKey)&&(k=='y'||(k=='z'&&e.shiftKey))){e.preventDefault();czRedo()}}catch(x){}});
