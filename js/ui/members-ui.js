// =====================================================================================
//  Member information & sorting standard (game-wide)
// -------------------------------------------------------------------------------------
//  · Every member portrait carries data-mid. Portraits in lists get an ⓘ button that opens
//    the existing Member Profile (profHtml) in an overlay ABOVE the current screen and modal,
//    so selections, formations and costume work in progress are never lost (ui.pov).
//  · Every list of member cards gets the shared sort / filter bar. It only re-orders or hides
//    the cards on screen: data, selections and assignments never change. The setting is
//    remembered per screen (ui.mls).
//  · Uses the existing member stats (STATS / sv) and filters (teamOpts / teamMatch).
// =====================================================================================
{const f=pt;pt=function(m,s){const r=f.apply(this,arguments);if(!m||m.id==null)return r;return r.replace(/^<svg/,`<svg data-mid="${m.id|0}" data-ms="${s||0}"`)}}
const mlGet=id=>{id=+id;const m=S&&S.members.find(x=>x.id==id);if(m)return{m,cand:false};const c=typeof candById=='function'?candById(id):null;return c?{m:c,cand:true}:null};
function mpOpen(id){const r=mlGet(id);if(!r)return;ui.pov=+id;ui.ptab=ui.ptab||'stats';render()}
function mpClose(){ui.pov=null;render()}
function mpHtml(){if(!ui.pov)return'';const r=mlGet(ui.pov);if(!r){ui.pov=null;return''}let h='';try{h=profHtml(r.m,r.cand)}catch(e){console.error(e);h=`<h2 class="ht">${esc(r.m.name)}</h2>`}
 return`<div class="mod t-prof pov" onclick="if(event.target==this)mpClose()"><div role="dialog" aria-modal="true" aria-label="Member profile">${h}<div class="row" style="margin-top:10px"><button class="b p" onclick="mpClose()">◀ Back</button><span class="st">Your current screen is kept as it was.</span></div></div></div>`}
const ML_RAR={UR:4,SR:3,R:2,N:1};
const ML_KEYS=()=>[['','Default order'],['name','Name'],...STATS.map(x=>[x[0],x[1]]),['rar','Rarity'],['gen','Generation'],['team','Team'],['trend','Trend (Buzz)']];
function mlVal(m,k){if(k=='name')return String(m.name||'');if(k=='rar')return ML_RAR[rar(m)]||0;if(k=='gen')return m.gen||1;if(k=='team'){const t=teamOf(m);return m.status=='trainee'?'~':t?t.name:'~~'}if(k=='trend')return m.buzz||0;const v=sv(m,k);return typeof v=='number'?v:+v||0}
function mlSet(key,f,v){const st=ui.mls=ui.mls||{},c=st[key]=st[key]||{k:'',d:'d',team:'all',gen:'all',rar:'all'};if(f=='d')c.d=c.d=='a'?'d':'a';else c[f]=v;render()}
const ML_SKIP='.throw,.thstagef,.geprg,.gecer,.gearch .gear,.stage,.mvsen,.pov,.mlbar,.trg,.czlineup';
function mlDecorate(){const app=document.getElementById('app');if(!app||!S||ui.t)return;const P=[...app.querySelectorAll('svg[data-mid]')];
 // ⓘ profile buttons
 const HS=[];P.forEach(sv0=>{const ms=+sv0.dataset.ms;if(ms&&ms<28)return;if(sv0.closest('.pov,.mc,.mpi,.mod.t-prof,.thart,.gephbig,.thpic'))return;const host=sv0.parentElement;if(!host||HS.some(x=>x[0]===host))return;HS.push([host,sv0])});
 HS.forEach(([host,sv0],i)=>{const b=document.createElement('span');b.className='mpi';b.setAttribute('role','button');b.setAttribute('aria-label','Member profile');b.title='Member profile';b.textContent='ⓘ';
  b.dataset.mid=sv0.dataset.mid;host.classList.add('mph');host.appendChild(b)});
 // sort / filter bars on member lists
 const seen=new Set(),conts=[];P.forEach(sv0=>{const ms=+sv0.dataset.ms;if(ms&&ms<28)return;let el=sv0;while(el&&el.parentElement&&el.parentElement!==app){const par=el.parentElement;if(par.children.length>=4&&!seen.has(par)){const kids=[...par.children].filter(ch=>ch.matches('svg[data-mid]')?false:ch.querySelectorAll('svg[data-mid]').length==1);if(kids.length>=4&&kids.length>=par.children.length*.6){seen.add(par);conts.push([par,kids]);break}}el=par}});
 let idx=0;conts.forEach(([par,kids])=>{if(par.closest(ML_SKIP)||kids.some(k=>k.matches('.slot,.thpos')||k.querySelector('.slot,.thpos')))return;if(view=='members'&&!ui.mod&&kids.every(k=>k.matches('.mc')))return;
  const items=kids.map(k=>{const s=k.querySelector('svg[data-mid]'),r=s&&mlGet(s.dataset.mid);return r?{el:k,m:r.m}:null}).filter(Boolean);if(items.length<4)return;
  const key=`${view}|${ui.mod?ui.mod.t:''}|${idx++}`,c=(ui.mls||{})[key]||{k:'',d:'d',team:'all',gen:'all',rar:'all'};
  if(c.k){const sorted=items.slice().sort((a,b)=>{const x=mlVal(a.m,c.k),y=mlVal(b.m,c.k);let r=typeof x=='string'?String(x).localeCompare(String(y)):(y-x);if(c.d=='a')r=-r;return r||0});const marks=items.map(it=>{const cm=document.createComment('');it.el.before(cm);return cm});items.forEach(it=>it.el.remove());marks.forEach((cm,i)=>cm.replaceWith(sorted[i].el))}
  let shown=0;items.forEach(it=>{const m=it.m,ok=teamMatch(m,c.team)&&(c.gen=='all'||(m.gen||1)==+c.gen)&&(c.rar=='all'||rar(m)==c.rar);it.el.classList.toggle('mlhide',!ok);if(ok)shown++});
  const gens=gensOf(items.map(i=>i.m)),op=(l,v)=>l.map(([k,n])=>`<option value="${esc(String(k))}" ${String(k)==String(v)?'selected':''}>${esc(n)}</option>`).join('');
  const bar=document.createElement('div');bar.className='mlbar';bar.dataset.mlk=key;
  bar.innerHTML=`<label>Sort <select aria-label="Sort members" onchange="mlSet('${key}','k',this.value)">${op(ML_KEYS(),c.k)}</select></label><button class="b s" type="button" onclick="mlSet('${key}','d')" aria-label="Sort direction">${c.d=='a'?'↑ Reverse order':'↓ Highest first / A→Z'}</button><select aria-label="Team filter" onchange="mlSet('${key}','team',this.value)">${op(teamOpts(),c.team)}</select>${gens.length>1?`<select aria-label="Generation filter" onchange="mlSet('${key}','gen',this.value)">${op([['all','All Generations'],...gens.map(g=>[g,ord(g)+' Generation'])],c.gen)}</select>`:''}<select aria-label="Rarity filter" onchange="mlSet('${key}','rar',this.value)">${op([['all','All rarities'],['UR','UR'],['SR','SR'],['R','R'],['N','N']],c.rar)}</select><span class="st">${shown}/${items.length} shown</span>`;
  ['onclick','onmousedown','onchange'].forEach(t=>bar.setAttribute(t,'event.stopPropagation()'));
  if(par.tagName=='TBODY'||par.tagName=='TABLE'){const tb=par.closest('table');tb.before(bar)}else par.before(bar)})}
{const f=render;render=function(){const r=f.apply(this,arguments);try{if(S&&!ui.t){const a=document.getElementById('app');if(a&&ui.pov)a.insertAdjacentHTML('beforeend',mpHtml());mlDecorate()}}catch(e){console.error(e)}return r}}
// one delegated listener (no per-render closures): ⓘ opens the profile without triggering the card it sits on
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('.mpi');if(!b)return;e.stopPropagation();e.preventDefault();mpOpen(b.dataset.mid)},true);
document.addEventListener('mousedown',e=>{if(e.target&&e.target.closest&&e.target.closest('.mpi'))e.stopPropagation()},true);
