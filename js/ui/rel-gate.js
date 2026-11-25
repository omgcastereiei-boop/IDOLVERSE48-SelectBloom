// =====================================================================================
//  IDOLVERSE48: Select Bloom! — nothing is released before everything is ready
// -------------------------------------------------------------------------------------
//  Every way a single can be released (Release button, automatic release on its Release Day, election / album
//  singles…) goes through doRelease(). It now refuses while readiness() still lists something (CD covers not
//  completed, Senbatsu not saved, costumes or videos unfinished, election ceremony not planned…) and shows the list
//  instead. A confirmed CD cover must still hold at least one member. The Release buttons are disabled while
//  anything is missing, with the reasons next to them.
// =====================================================================================
{const f=readiness;readiness=function(p){const r=f.apply(this,arguments);try{if(p&&Array.isArray(p.types))p.types.forEach(t=>{const c=S.cov&&S.cov[t.name];if(c&&c.status=='confirmed'&&!(c.layers||[]).some(l=>l.t=='m'))r.push(`CD cover for ${t.name} has no member — add the members and confirm it again.`)})}catch(e){console.error(e)}return r}}
{const f=doRelease;doRelease=function(){const p=S.pj;if(p&&p.status=='producing'){let pr=[];try{pr=readiness(p)}catch(e){console.error(e)}if(pr.length){ui.mod={t:'rel',pr};toast(`Not released: ${pr.length} item(s) are not finished.`,'err');render();return}}return f.apply(this,arguments)}}
// disable the Release buttons while something is missing
let RG_C=null;
function rgMissing(){const p=S&&S.pj;if(!p||p.status!='producing')return null;if(RG_C&&RG_C.day==S.day&&RG_C.t==Date.now()>>9)return RG_C.r;let r=[];try{r=readiness(p)}catch(e){}RG_C={day:S.day,t:Date.now()>>9,r};return r}
function rgApply(){try{const B=document.querySelectorAll('[onclick="release()"]:not([data-rg])');if(!B.length)return;RG_C=null;const M=rgMissing();B.forEach(b=>{b.setAttribute('data-rg','1');if(!M||!M.length)return;b.disabled=true;b.classList.add('rgoff');b.title=M.join('\n');
  if(!b.nextElementSibling||!b.nextElementSibling.classList.contains('rgwhy')){const d=document.createElement('div');d.className='st rgwhy';d.innerHTML=`<b>${M.length} ${M.length==1?'item':'items'} before release:</b><ul class="ms">${M.slice(0,6).map(x=>`<li style="color:var(--err)">✗ ${esc(x)}</li>`).join('')}</ul>`;b.after(d);try{if(typeof i18nApply=='function')i18nApply(d)}catch(e){}}})}catch(e){console.error(e)}}
let RG_RAF=0;try{new MutationObserver(()=>{if(RG_RAF)return;RG_RAF=requestAnimationFrame(()=>{RG_RAF=0;rgApply()})}).observe(document.documentElement,{childList:true,subtree:true})}catch(e){}
