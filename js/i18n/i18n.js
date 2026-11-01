// =====================================================================================
//  IDOLVERSE48: Select Bloom!  —  Language layer (English / ภาษาไทย)
// -------------------------------------------------------------------------------------
//  The game code writes English. After every render this layer translates the visible
//  text (text nodes, placeholders, tooltips, toasts, dialogs) using the dictionary in
//  th.js. It never touches game data, save files, input values or SVG artwork, so names,
//  song titles and CD-cover text stay exactly as the player typed them.
//  The choice is a display preference (stored with the other UI prefs, not in the save).
// =====================================================================================
const I18N={cache:new Map(),re:null};
function i18nLang(){if(!UIP.lang)UIP.lang=/^th/i.test(navigator.language||'')?'th':'en';return UIP.lang}
function i18nBuild(){if(I18N.re)return;const esc=x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const keys=Object.keys(I18N_TH).filter(k=>/[^A-Za-z]/.test(k)&&/[A-Za-z]{2}/.test(k)&&k.length>3).sort((a,b)=>b.length-a.length);
 I18N.re=new RegExp('(?<![A-Za-z])('+keys.map(esc).join('|')+')(?![A-Za-z])','g');
 I18N.tpl=(typeof I18N_TH_TPL!='undefined'?I18N_TH_TPL:[]).map(([e,t])=>{const num=/^\{0\} [^{}]*$/.test(e)&&e.split(' ').length<=3;const dot=e.includes(' · ');let r=esc(e).replace(/\\\{(\d)\\\}/g,dot?'(.+?)':'((?:(?! · ).)+?)');if(num)r=r.replace(/^\(\(\?:\(\?! · \)\.\)\+\?\)/,'([\\d][\\d,./%]*)');return[new RegExp('^'+r+'$'),t,dot]});
 const M=Object.keys(I18N_TH_MON).join('|');I18N.dRe=[[new RegExp('\\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun), ','g'),(m,d)=>I18N_TH_DAY[d]+' '],[new RegExp('\\b('+M+') (\\d{1,2}), (\\d{4})','g'),(m,a,b,c)=>`${b} ${I18N_TH_MON[a]} ${c}`],[new RegExp('\\b('+M+') (\\d{4})\\b','g'),(m,a,b)=>`${I18N_TH_MON[a]} ${b}`],[new RegExp('\\b('+M+') (\\d{1,2})\\b','g'),(m,a,b)=>`${b} ${I18N_TH_MON[a]}`]]}
const I18N_SYM=/^[^A-Za-z0-9"'(¥~@]+/;
function i18nCap(c){if(c==null)return'';c=c.replace(/^(\d+)(st|nd|rd|th)$/,'$1');return I18N_TH[c]!=null?I18N_TH[c]:/[A-Za-z]{2}/.test(c)?trCore(c):c}
function trCore(k){const D=I18N_TH;if(D[k]!=null)return D[k];i18nBuild();
 const lead=(k.match(I18N_SYM)||[''])[0];if(lead&&lead.length<k.length){const core=k.slice(lead.length),r=trCore(core);return lead+r}
 const T=dotOnly=>{for(const[re,t,dot]of I18N.tpl){if(dotOnly&&!dot)continue;const m=k.match(re);if(m)return t.replace(/\{(\d)\}/g,(_,i)=>i18nCap(m[+i+1]))}return null};
 if(k.includes(' · ')){const r=T(1);if(r!=null)return r;return k.split(' · ').map(p=>p.trim()?trCore(p.trim()):p).join(' · ')}
 {const r=T(0);if(r!=null)return r}
 if(/^[A-Z][a-z]+( \/ [A-Z][a-z]+)+$/.test(k))return k.split(' / ').map(w=>D[w]||w).join(' / ');
 let out=k;for(const[r,v]of I18N_TH_RX)out=out.replace(r,v);for(const[r,f]of I18N.dRe)out=out.replace(r,f);
 out=out.replace(/(?<![A-Za-z])([A-Z][a-z]+(?:(?: \/ | )[A-Z][a-z]+)?)(?= [\d¥~#+×]|:? ?\d)/g,w=>D[w]??w.split(' / ').map(x=>D[x]??x).join(' / '));
 return out.replace(I18N.re,m=>D[m]??m)}
function tr(s){if(i18nLang()!='th'||s==null)return s;s=String(s);const k=s.trim();if(!k||!/[A-Za-z]{2}/.test(k))return s;let c=I18N.cache.get(s);if(c!=null)return c;
 let out;try{out=s.replace(k,trCore(k))}catch(e){out=s}
 if(I18N.cache.size>20000)I18N.cache.clear();I18N.cache.set(s,out);return out}
function i18nApply(root){const th=i18nLang()=='th';document.documentElement.lang=th?'th':'en';document.body.classList.toggle('lang-th',th);if(!th)return;root=root||document.getElementById('app');if(!root)return;
 const W=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentElement;if(!p||p.closest('svg,script,style,textarea,[data-notr]'))return NodeFilter.FILTER_REJECT;return/[A-Za-z]/.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
 const L=[];while(W.nextNode())L.push(W.currentNode);L.forEach(n=>{const v=tr(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v});
 root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(e=>{if(e.closest('svg'))return;['placeholder','title','aria-label'].forEach(a=>{const v=e.getAttribute(a);if(v&&/[A-Za-z]/.test(v)){const t=tr(v);if(t!==v)e.setAttribute(a,t)}})})}
// hooks: every render, every toast
const _i18nRender=render;render=function(){_i18nRender.apply(this,arguments);try{i18nApply()}catch(e){}};
const _i18nToast=toast;toast=function(t,k){_i18nToast(tr(t),k)};
function setLang(l){uiPref('lang',l)}
const langSwitch=()=>`<div class="langsw" data-notr role="group" aria-label="Language / ภาษา"><span>🌐</span><button class="${i18nLang()=='th'?'on':''}" onclick="setLang('th')">ไทย</button><button class="${i18nLang()=='en'?'on':''}" onclick="setLang('en')">English</button></div>`;
const _i18nTitle=titleScreen;titleScreen=function(ok){return _i18nTitle(ok).replace('<div class="title">','<div class="title">'+langSwitch())};
const _i18nManage=V.manage;V.manage=function(){return _i18nManage.call(V).replace('<h3 style="margin-top:8px">Display</h3>','<h3 style="margin-top:8px">Display</h3><div class="row"><span class="lbl">Language / ภาษา</span>'+langSwitch()+'</div>')};
render();
