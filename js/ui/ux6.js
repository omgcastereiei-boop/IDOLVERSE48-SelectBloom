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
