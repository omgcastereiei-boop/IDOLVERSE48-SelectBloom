// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Concert formation page: fast taps
// -------------------------------------------------------------------------------------
//  Every tap on the formation page (pick a member, select a position, move, center, row) used to rebuild the whole
//  page: about 90 portraits that point into the shared portrait store, which phones redraw slowly. A tap now updates
//  only the stage, the page header, the position bar and the member cards whose state changed. Anything else
//  (a dialog, another page, a toast-only action) still uses the normal full render.
//  Loaded last, so it runs before every other render hook.
// =====================================================================================
let CC_FAST=0;
function ccFastOk(){return S&&!ui.t&&!ui.mod&&view=='concert'&&ui.ccfp&&ui.cct=='set'&&document.querySelector('#app .ccfstage')&&typeof ccCur=='function'&&ccCur()}
// keep every node that did not change (portraits are the expensive part); replace only what differs
function ccMorph(a,b){if(a.isEqualNode(b))return;
 if(a.nodeType!==1||a.nodeName!==b.nodeName||a.childNodes.length!==b.childNodes.length||a.nodeName.toLowerCase()=='svg'){a.replaceWith(document.importNode(b,true));return}
 [...a.attributes].forEach(x=>{if(!b.hasAttribute(x.name))a.removeAttribute(x.name)});[...b.attributes].forEach(x=>{if(a.getAttribute(x.name)!==x.value)a.setAttribute(x.name,x.value)});
 const A=[...a.childNodes],B=[...b.childNodes];A.forEach((c,i)=>ccMorph(c,B[i]))}
// translate the replaced text only (the full i18n pass also touches <html>/<body>, which restyles the whole page)
function ccTr(root){if(typeof i18nLang!='function'||i18nLang()!='th')return;const W=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentElement;if(!p||p.closest('svg,script,style,textarea,[data-notr]'))return NodeFilter.FILTER_REJECT;return/[A-Za-z]/.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
 const L=[];while(W.nextNode())L.push(W.currentNode);L.forEach(n=>{const v=tr(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v});
 root.querySelectorAll('[title],[aria-label],[placeholder]').forEach(e=>{if(e.closest('svg'))return;['title','aria-label','placeholder'].forEach(a=>{const v=e.getAttribute(a);if(v&&/[A-Za-z]/.test(v)){const t=tr(v);if(t!==v)e.setAttribute(a,t)}})})}
function ccFastPatch(){const C=ccCur(),T=document.createElement('template');T.innerHTML=ccFormPage(C);const tmp=T.content,app=document.getElementById('app'),roots=[];
 const pair=k=>[app.querySelector(k),tmp.querySelector(k)];
 for(const k of ['.ccfhead','.ccfstage']){const[a,b]=pair(k);if(!a||!b)return false;ccMorph(a,b);roots.push(k)}
 // the position bar comes and goes with the selection
 {const[a,b]=pair('.ccfbar');if(a&&b)ccMorph(a,b);else if(a)a.remove();else if(b)app.querySelector('.ccfstage').after(document.importNode(b,true));if(b)roots.push('.ccfbar')}
 // participants: hint, buttons and the cards whose state changed (the sort / filter order and visibility stay)
 const grid=app.querySelector('.ccmg3'),ng=tmp.querySelector('.ccmg3');if(!grid||!ng)return false;const sec=grid.closest('.c'),nsec=ng.closest('.c');
 if(sec&&nsec){const q=':scope > p.st, :scope > .row button',ps=[...sec.querySelectorAll(q)],nps=[...nsec.querySelectorAll(q)];if(ps.length==nps.length)ps.forEach((x,i)=>ccMorph(x,nps[i]))}
 const N=new Map([...ng.querySelectorAll('.ccm3[data-mid]')].map(e=>[e.dataset.mid,e])),L=[...grid.querySelectorAll('.ccm3[data-mid]')];if(L.length!=N.size)return false;
 for(const el of L){const n=N.get(el.dataset.mid);if(!n)return false;const hid=el.classList.contains('mlhide');if(hid)n.classList.add('mlhide');ccMorph(el,n)}
 try{['.ccfhead','.ccfstage','.ccfbar'].forEach(k=>{const r=app.querySelector(k);if(r)ccTr(r)});if(sec)ccTr(sec)}catch(e){}
 clearTimeout(ccFastPatch.sv);ccFastPatch.sv=setTimeout(()=>{try{if(typeof svAuto=='function')svAuto();else save()}catch(e){}},400);return true}
{const f=render;render=function(){if(CC_FAST&&ccFastOk()){let ok=false;try{ok=ccFastPatch()}catch(e){console.error(e)}if(ok)return}return f.apply(this,arguments)}}
const ccFast=fn=>function(){const p=CC_FAST;CC_FAST=1;try{return fn.apply(this,arguments)}finally{CC_FAST=p}};
['ccFormPick','ccPosSet','ccPosCen','ccFormMove','ccPosRow','ccPosDel','ccPosAdd','ccFormRowSel','ccRowClear','ccFmBySort'].forEach(n=>{const f=window[n];if(typeof f=='function')window[n]=ccFast(f)});
function ccFmSel(k,r){ui.ccfs=k;ui.ccfr=r;ccFast(render)()}
// the position buttons on the stage select through the fast path
{const f=ccFormPage;ccFormPage=function(){return f.apply(this,arguments).replace(/onclick="ui\.ccfs=([^;"]+);ui\.ccfr=(\d+);render\(\)"/g,'onclick="ccFmSel($1,$2)"')}}
