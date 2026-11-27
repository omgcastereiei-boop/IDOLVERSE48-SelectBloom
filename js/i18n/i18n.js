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
 I18N.re=true;I18N.kx=new Map();keys.forEach(k=>{const h=k.slice(0,2);let L=I18N.kx.get(h);if(!L)I18N.kx.set(h,L=[]);L.push(k)}); // phrase index by first two characters (longest first) — the same matches as one big regex, without its cost
 I18N.tpl=(typeof I18N_TH_TPL!='undefined'?I18N_TH_TPL:[]).flatMap(([e,t])=>{const l=(e.match(I18N_SYM)||[''])[0];return l&&l.length<e.length&&t.startsWith(l)&&/[A-Za-z]{3}/.test(e.slice(l.length).replace(/\{\d\}/g,''))?[[e,t],[e.slice(l.length),t.slice(l.length)]]:[[e,t]]}).map(([e,t])=>{const raw=new Set([...e.matchAll(/[“"]\{(\d)\}[”"]/g)].map(m=>+m[1]));const num=/^\{0\} [^{}]*$/.test(e)&&e.split(' ').length<=3;const dot=e.includes(' · ');let r=esc(e).replace(/\\\{(\d)\\\}/g,dot?'(.+?)':'((?:(?! · ).)+?)');if(num)r=r.replace(/^\(\(\?:\(\?! · \)\.\)\+\?\)/,'([\\d][\\d,./%]*)');const an=e.split(/\{\d\}/).sort((x,y)=>y.length-x.length)[0]||'';return[new RegExp('^'+r+'$'),t,dot,raw,an]}); // an: its longest fixed text — a sentence without it cannot match, so the regex is skipped
 const M=Object.keys(I18N_TH_MON).join('|');I18N.dRe=[[new RegExp('\\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun), ','g'),(m,d)=>I18N_TH_DAY[d]+' '],[new RegExp('\\b('+M+') (\\d{1,2}), (\\d{4})','g'),(m,a,b,c)=>`${b} ${I18N_TH_MON[a]} ${c}`],[new RegExp('\\b('+M+') (\\d{4})\\b','g'),(m,a,b)=>`${I18N_TH_MON[a]} ${b}`],[new RegExp('\\b('+M+') (\\d{1,2})\\b','g'),(m,a,b)=>`${b} ${I18N_TH_MON[a]}`]]}
const I18N_SYM=/^[^A-Za-z0-9"'(¥~@]+/;
function i18nCap(c){if(c==null)return'';c=c.replace(/^(\d+)(st|nd|rd|th)$/,'$1');return I18N_TH[c]!=null?I18N_TH[c]:/[A-Za-z]{2}/.test(c)?trCore(c):c}
// one sentence (or a run of sentences) found in the dictionary or matching a sentence template; a template blank never spans a sentence break
function i18nExact(s){const D=I18N_TH;if(D[s]!=null)return D[s];i18nBuild();for(const[re,t,,raw,an]of I18N.tpl){if(an&&!s.includes(an))continue;const m=s.match(re);if(m&&!m.slice(1).some(g=>g&&/[.!?](?:[”"])?\s|…\s/.test(g)))return t.replace(/\{(\d)\}/g,(_,i)=>raw&&raw.has(+i)?m[+i+1]:i18nCap(m[+i+1]))}return null}
// speech and notes made of several sentences joined together: translate the longest known run of sentences at each point
function i18nSent(k){if(k.length<12||!/[.!?…][”"]?\s+\S/.test(k))return null;const P=k.replace(/([.!?…][”"]?)\s+/g,'$1\u0001').split('\u0001');if(P.length<2||P.length>40)return null;
 const out=[];let hit=0;for(let i=0;i<P.length;){let done=0;for(let j=P.length;j>i;j--){const seg=P.slice(i,j).join(' '),q=seg.match(/^([“"]?)([\s\S]*?)([”"]?)$/),r=i18nExact(seg)??(q[1]||q[3]?i18nExact(q[2]):null);if(r!=null){out.push(I18N_TH[seg]!=null||!(q[1]||q[3])||i18nExact(seg)!=null?r:q[1]+r+q[3]);hit++;i=j;done=1;break}}if(!done){out.push(P[i]);i++}}
 if(!hit)return null;return out.map(x=>/[A-Za-z]{2}/.test(x)&&!/[\u0E00-\u0E7F]/.test(x)?trCore(x):x).join(' ')}
function trCore(k){const D=I18N_TH;if(D[k]!=null)return D[k];i18nBuild();
 {const q=k.match(/^([“"])([^“”"]+)([”"])$/);if(q){const r=i18nExact(q[2])??i18nSent(q[2]);if(r!=null)return q[1]+r+q[3]}}
 {const r=i18nSent(k);if(r!=null)return r}
 const T=dotOnly=>{for(const[re,t,dot,raw,an]of I18N.tpl){if(dotOnly&&!dot)continue;if(an&&!k.includes(an))continue;const m=k.match(re);if(m&&!m.slice(1).some(g=>g&&/[.!?][”"]?\s+[A-Z“"]/.test(g)))return t.replace(/\{(\d)\}/g,(_,i)=>raw&&raw.has(+i)?m[+i+1]:i18nCap(m[+i+1]))}return null};
 const lead=(k.match(I18N_SYM)||[''])[0];if(lead&&lead.length<k.length){{const r=T(k.includes(' · ')?1:0);if(r!=null)return r}const core=k.slice(lead.length),r=trCore(core);return lead+r}
 if(k.includes(' · ')){const r=T(1);if(r!=null)return r;{const q=i18nSent(k);if(q!=null)return q}return k.split(' · ').map(p=>p.trim()?trCore(p.trim()):p).join(' · ')}
 {const r=T(0);if(r!=null)return r}
 if(/^[A-Z][a-z]+( \/ [A-Z][a-z]+)+$/.test(k))return k.split(' / ').map(w=>D[w]||w).join(' / ');
 {const r=i18nSent(k);if(r!=null)return r}
 let out=k;for(const[r,v]of I18N_TH_RX)out=out.replace(r,v);for(const[r,f]of I18N.dRe)out=out.replace(r,f);
 out=out.replace(/(^|[^A-Za-z])([A-Z][a-z]+(?:(?: \/ | )[A-Z][a-z]+)?)(?= [\d¥~#+×]|:? ?\d)/g,(m0,pre,w)=>pre+(D[w]??w.split(' / ').map(x=>D[x]??x).join(' / ')));
 return i18nPhr(out)}
// replace every known phrase that stands on its own (not inside a longer word), leftmost and longest first
const I18N_LT=c=>(c>=65&&c<=90)||(c>=97&&c<=122);
function i18nPhr(s){const D=I18N_TH,X=I18N.kx,n=s.length;let out='',last=0,prev=0;for(let i=0;i<=n-4;i++){if(!(i==0||(i-1>=prev&&!I18N_LT(s.charCodeAt(i-1)))))continue;const L=X.get(s.substr(i,2));if(!L)continue;for(const k of L){if(s.startsWith(k,i)&&!I18N_LT(s.charCodeAt(i+k.length))){out+=s.slice(last,i)+(D[k]??k);last=prev=i+k.length;i=prev-1;break}}}return last?out+s.slice(last):s}
// names the player chose (members, songs, singles, albums, groups, teams, units, stages, concerts) are never translated
const I18N_NM={t:0,k:'',re:null,set:new Set()},I18N_NM_KEEP=new Set(['Center','Senbatsu','Theater','Single','Album','Concert','Main','Team','Under Girls','Trainee','Solo','Duet','Unit']);
function i18nNames(){if(typeof S=='undefined'||!S||!S.members)return null;const now=Date.now();if(I18N_NM.re!==null&&now-I18N_NM.t<1500)return I18N_NM;I18N_NM.t=now;
 const N=new Set(),add=v=>{if(typeof v!='string')return;v=v.trim();if(v.length>=3&&/[A-Za-z]{2}/.test(v)&&!I18N_NM_KEEP.has(v))N.add(v)};
 try{[...(S.members||[]),...(S.alumni||[])].forEach(m=>{if(!m)return;add(m.name);add(m.real);add(m.stage)});add(S.co);add(S.producer&&(S.producer.name||S.producer));
  (S.groups||[]).forEach(g=>{add(g.name);(g.teams||[]).forEach(t=>add(t.name));const ctx=k=>g.id==S.ag?S[k]:(g.ctx||{})[k];Object.values(ctx('songs')||{}).forEach(o=>o&&add(o.title));(ctx('singles')||[]).forEach(x=>x&&add(x.title));(ctx('albums')||[]).forEach(x=>x&&add(x.title))});
  Object.values((S.th&&S.th.st)||{}).forEach(x=>x&&add(x.name));((S.cc&&S.cc.list)||[]).forEach(x=>x&&add(x.name))}catch(e){}
 const L=[...N].sort((a,b)=>b.length-a.length),key=L.length+'|'+L.slice(0,40).join('\u0001')+'|'+L.reduce((a,x)=>(a*31+x.length)%1000003,7);if(key===I18N_NM.k)return I18N_NM;
 const esc=x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');I18N_NM.k=key;I18N_NM.set=N;I18N_NM.re=L.length&&L.length<=2500?new RegExp('(^|[^A-Za-z0-9])('+L.map(esc).join('|')+')(?![A-Za-z0-9])','g'):null;I18N.cache.clear();return I18N_NM}
function tr(s){if(i18nLang()!='th'||s==null)return s;s=String(s);const k=s.trim();if(!k||!/[A-Za-z]{2}/.test(k))return s;let NM=null;try{NM=i18nNames()}catch(e){NM=null}let c=I18N.cache.get(s);if(c!=null)return c;
 let out;try{if(NM&&NM.set.has(k))out=s;else if(NM&&NM.re){const keep=[];const mk=k.replace(NM.re,(m0,pre,w)=>{keep.push(w);return pre+'\uE000'+String.fromCharCode(0xE100+keep.length-1)+'\uE001'});
   if(!keep.length)out=s.replace(k,trCore(k));else{const t=/[A-Za-z]{2}/.test(mk)?trCore(mk):mk;out=s.replace(k,t.replace(/\uE000([\uE100-\uEFFF])\uE001/g,(_,ch)=>keep[ch.charCodeAt(0)-0xE100]??''))}}
  else out=s.replace(k,trCore(k))}catch(e){out=s}
 if(I18N.cache.size>20000)I18N.cache.clear();I18N.cache.set(s,out);return out}
function i18nApply(root){const th=i18nLang()=='th',lg=th?'th':'en';if(document.documentElement.lang!==lg)document.documentElement.lang=lg;if(document.body.classList.contains('lang-th')!==th)document.body.classList.toggle('lang-th',th);if(!th)return;root=root||document.getElementById('app');if(!root)return;
 const W=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentElement;if(!p||p.closest('svg,script,style,textarea,[data-notr]'))return NodeFilter.FILTER_REJECT;return/[A-Za-z]/.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
 const L=[];while(W.nextNode())L.push(W.currentNode);L.forEach(n=>{const v=tr(n.nodeValue);if(v!==n.nodeValue){const o=n.parentElement;if(o&&o.tagName=='OPTION'&&!o.hasAttribute('value'))o.setAttribute('value',o.textContent);n.nodeValue=v}});
 root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(e=>{if(e.closest('svg'))return;['placeholder','title','aria-label'].forEach(a=>{const v=e.getAttribute(a);if(v&&/[A-Za-z]/.test(v)){const t=tr(v);if(t!==v)e.setAttribute(a,t)}})})}
// hooks: every render, every toast
const _i18nRender=render;render=function(){_i18nRender.apply(this,arguments);try{i18nApply()}catch(e){}};
const _i18nToast=toast;toast=function(t,k){let x=t;try{x=tr(t)}catch(e){}_i18nToast(x,k)};
function setLang(l){uiPref('lang',l)}
const langSwitch=()=>`<div class="langsw" data-notr role="group" aria-label="Language / ภาษา"><span>🌐</span><button class="${i18nLang()=='th'?'on':''}" onclick="setLang('th')">ไทย</button><button class="${i18nLang()=='en'?'on':''}" onclick="setLang('en')">English</button></div>`;
const _i18nTitle=titleScreen;titleScreen=function(ok){return _i18nTitle(ok).replace('<div class="title">','<div class="title">'+langSwitch())};
const _i18nManage=V.manage;V.manage=function(){return _i18nManage.call(V).replace('<h3 style="margin-top:8px">Display</h3>','<h3 style="margin-top:8px">Display</h3><div class="row"><span class="lbl">Language / ภาษา</span>'+langSwitch()+'</div>')};
render();
