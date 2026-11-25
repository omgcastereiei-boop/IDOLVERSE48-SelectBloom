// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Costume Studio: ZEPETO-style mobile avatar editor (UI only)
//  The existing Costume Designer renders exactly as before (every wrapper, category, item, colour,
//  HEX field, slider, pattern, fabric, randomizer, undo/redo, save, library and song assignment). On
//  phones its nodes are MOVED (never copied or rebuilt, so every handler keeps working) into a
//  workspace sized to the visible screen:
//     top bar (Back · title · save actions) · pinned full-body preview (model / pose / expression)
//     · category groups (icons) · categories of the group · scrolling panel
//  The panel shows the selected category's items + the full editor and colour tools, or the
//  "Closet" (design library, rename / duplicate / delete / presets) or "Songs" (assignment) tabs.
//  Every costume screen (Costume Designer, Single Production, Theater, Concert, Graduation) uses this workspace on
//  phones and in the fullscreen studio; their own workflow controls move into the "Members" tab unchanged.
//  Desktop keeps the existing layout (plus a fullscreen button). No data, logic or rendering is changed.
// =====================================================================================
const CZZ_VIEWS=new Set(['costume','songcz','thcz','cccz','gradcz']); // every screen that edits a costume (shared czGridHtml editor)
const czzFs=()=>document.body.classList.contains('czfs');
const czzMob=()=>window.innerWidth<720||czzFs();
const CZZ_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
// ---- interface icons (no emoji anywhere in the studio) ---------------------------------------------------------------------
const CZI={hanger:'<path d="M12 7.5a2 2 0 1 1 2-2"/><path d="M12 7.5v1.2L3.6 15.2c-.9.7-.4 2.1.7 2.1h15.4c1.1 0 1.6-1.4.7-2.1L12 8.7"/>',
 bow:'<path d="M12 12 5 7.5v9zM12 12l7-4.5v9z"/><circle cx="12" cy="12" r="1.6"/>',gem:'<path d="M7 4h10l4 5-9 11L3 9z"/><path d="M3 9h18M9 4l3 16 3-16"/>',
 lantern:'<path d="M12 2v2M9 4h6M7.5 7.5c0-2 9-2 9 0v9c0 2-9 2-9 0z"/><path d="M9 20h6M12 20v2M7.5 12h9"/>',fan:'<path d="M12 20 3.5 9.5a11 11 0 0 1 17 0z"/><path d="M12 20 8 6.6M12 20V6M12 20l4-13.4"/>',
 cap:'<path d="M12 4 2 9l10 5 10-5z"/><path d="M6 11.2V16c0 1.6 12 1.6 12 0v-4.8M21 9v5"/>',closet:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 3v18M9.5 11v2M14.5 11v2"/>',
 music:'<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',users:'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.4 2.8-5 5.5-5s4.9 1.6 5.5 5"/><circle cx="17" cy="9" r="2.4"/><path d="M15.6 14.2c2.4-.4 4.4 1 4.9 4.8"/>',
 spark:'<path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7z"/>',save:'<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h8V4M8 20v-6h8v6"/>',
 dice:'<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2"/><circle cx="15" cy="15" r="1.2"/><circle cx="15" cy="9" r="1.2"/><circle cx="9" cy="15" r="1.2"/>',
 warn:'<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17v.4"/>',lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
 x:'<path d="M6 6l12 12M18 6 6 18"/>',edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',back:'<path d="M15 5 8 12l7 7"/>',undo:'<path d="M9 7 4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 12"/>',
 copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',hair:'<path d="M5 20c0-9 2.5-15 7-15s7 6 7 15"/><path d="M8.5 9.5c2 1.4 5 1.4 7 0"/>',
 star:'<path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/>',trash:'<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',photo:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m21 16-5-5-8 8"/>',
 cam:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',heart:'<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
 fsOn:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',fsOff:'<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',move:'<path d="M12 3v18M3 12h18M12 3l-2.5 2.5M12 3l2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5M3 12l2.5-2.5M3 12l2.5 2.5M21 12l-2.5-2.5M21 12l-2.5 2.5"/>',
 pin:'<path d="M12 21s-6-6.2-6-11a6 6 0 0 1 12 0c0 4.8-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.4"/>'};
const czIco=k=>`<svg class="czic" viewBox="0 0 24 24" aria-hidden="true">${CZI[k]||CZI.spark}</svg>`;
const CZZ_IC={'Clothing':'hanger','Basics':'hanger','Details':'bow','Accessories':'gem','Festival & seasonal':'lantern','Festival & Graduation':'lantern','Traditional ornaments':'fan','Traditional':'fan','Graduation':'cap'};
// emoji found in the studio screens -> interface icon (anything else is simply removed)
const CZ_EMO={'💾':'save','🎲':'dice','👗':'hanger','👘':'hanger','🎓':'cap','⚠':'warn','🔒':'lock','🔓':'lock','✓':'check','✔':'check','✅':'check','✕':'x','✖':'x','❌':'x','✎':'edit','✏':'edit','◀':'back','←':'back','↺':'undo','🔄':'undo','📋':'copy','💇':'hair','✨':'spark','⭐':'star','★':'star','🗑':'trash','📸':'cam','📷':'cam','🖼':'photo','💖':'heart','❤':'heart','🎵':'music','🎶':'music','🗂':'closet','🎀':'bow','💍':'gem','🏮':'lantern','🎐':'lantern','👑':'star','👥':'users','📍':'pin','ℹ':'info','🎂':'star','🎭':'star','🌸':'spark','💡':'info'};
const CZ_EMO_RE=/(?:\p{Extended_Pictographic}|[✓✔✕✖✎◀←↺★])️?/gu;
function czzDeEmoji(root){if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),L=[];let n;while(n=w.nextNode())if(CZ_EMO_RE.test(n.nodeValue))L.push(n),CZ_EMO_RE.lastIndex=0;else CZ_EMO_RE.lastIndex=0;
 L.forEach(t=>{const pa=t.parentElement;if(!pa)return;if(/^(OPTION|TEXTAREA|TITLE|STYLE|SCRIPT)$/.test(pa.tagName)||pa.closest('svg')){t.nodeValue=t.nodeValue.replace(CZ_EMO_RE,'').replace(/^\s+/,'');return}
  const parts=t.nodeValue.split(CZ_EMO_RE),ms=t.nodeValue.match(CZ_EMO_RE)||[],fr=document.createDocumentFragment();parts.forEach((p,i)=>{if(p)fr.appendChild(document.createTextNode(i&&!ms[i-1]?p:p));const m=ms[i];if(m){const k=CZ_EMO[m.replace('️','')];if(k){const sp=document.createElement('span');sp.className='czicw';sp.innerHTML=czIco(k);fr.appendChild(sp)}}});pa.replaceChild(fr,t)});
 root.querySelectorAll('option').forEach(o=>{if(CZ_EMO_RE.test(o.textContent)){CZ_EMO_RE.lastIndex=0;o.textContent=o.textContent.replace(CZ_EMO_RE,'').trim()}CZ_EMO_RE.lastIndex=0});
 root.querySelectorAll('[title],[placeholder],[aria-label]').forEach(el=>['title','placeholder','aria-label'].forEach(a=>{const v=el.getAttribute(a);if(v&&CZ_EMO_RE.test(v)){CZ_EMO_RE.lastIndex=0;el.setAttribute(a,v.replace(CZ_EMO_RE,'').trim())}CZ_EMO_RE.lastIndex=0}))}
// ---- navigation ----------------------------------------------------------------------------------------------------------------
function czzBack(){const all=[...document.querySelectorAll('.gebanner button,.plback button,.c.gebanner button,.czzpanel [data-tab="setup"] button,.plczh button')];
 const b=all.find(x=>/^\s*(?:[←◀]|Back\b|กลับ)/.test(x.textContent)||x.querySelector('.czicw svg path[d="M15 5 8 12l7 7"]')&&/Back|กลับ|Stage|Theater|Concert|Single|Election|Graduation/.test(x.textContent));
 czzFsExit();if(b){b.click();return}ui.czE=null;goView(view=='thcz'?'thset':view=='cccz'?'concert':view=='gradcz'?'former':'music')}
function czzTab(t,g){ui.czzT=t;if(g!=null)ui.czzG=g;czzApply();if(t=='items'&&g!=null){const row=document.querySelectorAll('.czzsub .czsr')[g];if(row&&!row.querySelector('.on')){const b=row.querySelector('button');if(b)b.click()}}}
// show the active tab / group without re-rendering (nothing in the costume changes)
function czzApply(){const z=document.querySelector('.czz');if(!z)return;const t=ui.czzT||'items',g=ui.czzG|0;
 z.querySelectorAll('.czzg').forEach((b,i)=>b.classList.toggle('on',t=='items'?i==g:false));z.querySelectorAll('.czzx').forEach(b=>b.classList.toggle('on',b.dataset.t==t));
 z.querySelectorAll('.czzsub .czsr').forEach((r,i)=>r.style.display=t=='items'&&i==g?'':'none');const sub=z.querySelector('.czzsub');if(sub)sub.style.display=t=='items'?'':'none';
 z.querySelectorAll('.czzpanel [data-tab]').forEach(el=>el.style.display=el.dataset.tab==t?'':'none');czzSize()}
// ---- fullscreen: the browser Fullscreen API where it exists, a full-window editing mode everywhere ------------------------------
function czzFsOn(){document.body.classList.add('czfs');const el=document.documentElement,rq=el.requestFullscreen||el.webkitRequestFullscreen||el.msRequestFullscreen;
 if(rq&&!(document.fullscreenElement||document.webkitFullscreenElement)){try{const r=rq.call(el,{navigationUI:'hide'});if(r&&r.catch)r.catch(()=>{})}catch(e){}}ui.czzFs=1;render()}
function czzFsExit(){if(!document.body.classList.contains('czfs'))return;document.body.classList.remove('czfs');ui.czzFs=0;const ex=document.exitFullscreen||document.webkitExitFullscreen||document.msExitFullscreen;
 if(ex&&(document.fullscreenElement||document.webkitFullscreenElement)){try{const r=ex.call(document);if(r&&r.catch)r.catch(()=>{})}catch(e){}}}
function czzFsTog(){if(czzFs()){czzFsExit();render()}else czzFsOn()}
['fullscreenchange','webkitfullscreenchange'].forEach(ev=>document.addEventListener(ev,()=>{if(!(document.fullscreenElement||document.webkitFullscreenElement)&&czzFs()){document.body.classList.remove('czfs');ui.czzFs=0;if(CZZ_VIEWS.has(view))render()}}));
// ---- build the workspace from the existing editor nodes ---------------------------------------------------------------------------
function czzBuild(){const g=document.querySelector('.czgrid');if(!g||!czzMob()||g.closest('.czz'))return false;const root=g.parentElement,cz=view=='costume';
 const lib=cz?root.querySelector(':scope > .czlib'):null,head=cz?root.querySelector(':scope > .czhead'):null,asg=cz?root.querySelector(':scope > .czasg'):null,nav=g.querySelector('.czcats'),sw=g.querySelector('.czstagewrap'),panel=g.querySelector('.czpanel');if(!nav||!sw||!panel)return false;
 const stage=sw.querySelector('.czstage'),pose=sw.querySelector('.czpose'),act=sw.querySelector('.czact'),d=cz&&czEditing&&czEditing(),h2=root.querySelector(':scope > h2.ht');
 // workflow controls of the other studios (member picker, presets, random, copy to members, hairstyle ...) stay as they are
 const setup=cz?[]:[...root.children].filter(c=>c!==g&&c!==h2&&!c.matches('.gssw,.locb,.gebanner,.czz,.czfsbar,script,style'));
 const title=cz?CZZ_T('Costume Studio','สตูดิโอชุด'):((h2&&h2.textContent.replace(CZ_EMO_RE,'').trim())||CZZ_T('Costume Studio','สตูดิโอชุด')),subt=cz?(d?d.name:''):(ui.czE&&ui.czE.mid&&get(ui.czE.mid)?get(ui.czE.mid).name:'');
 const z=document.createElement('div');z.className='czz';z.dataset.v=view;
 // 1 · top bar
 const top=document.createElement('div');top.className='czztop';top.innerHTML=`<div class="czztr"><button class="czzback" onclick="czzBack()" aria-label="Back">${czIco('back')}</button><div class="czztt"><b>${esc(title)}</b><small>${esc(subt)}</small></div><span style="flex:1"></span><button class="czzfs" onclick="czzFsTog()" aria-label="${czzFs()?'Exit fullscreen':'Fullscreen'}" title="${czzFs()?CZZ_T('Exit fullscreen','ออกจากโหมดเต็มจอ'):CZZ_T('Fullscreen','เต็มจอ')}">${czIco(czzFs()?'fsOff':'fsOn')}<span>${czzFs()?CZZ_T('Exit','ออก'):CZZ_T('Full screen','เต็มจอ')}</span></button></div>`;if(act){act.classList.add('czzact');top.appendChild(act)}z.appendChild(top);
 // 2 · pinned preview
 const st=document.createElement('div');st.className='czzst';if(stage)st.appendChild(stage);if(pose){pose.classList.add('czzpose');st.appendChild(pose)}z.appendChild(st);
 // 3 · category groups + categories (existing buttons)
 const sh=[...nav.querySelectorAll(':scope > .czsh')],rows=[...nav.querySelectorAll(':scope > .czsr')];let active=rows.findIndex(r=>r.querySelector('.on'));if(active<0)active=0;
 const ck=view+'|'+(ui.czE&&ui.czE.cat);if(ui.czzG==null||ui.czzLast!==ck){ui.czzG=active;ui.czzLast=ck}if(ui.czzView!==view){ui.czzView=view;ui.czzT='items'}
 const gr=document.createElement('div');gr.className='czzgr';gr.innerHTML=(setup.length?`<button class="czzx" data-t="setup" onclick="czzTab('setup')"><span class="czzic">${czIco('users')}</span><small>${CZZ_T('Members','เมมเบอร์')}</small></button>`:'')+sh.map((h,i)=>{const nm=(h.childNodes[0]&&h.childNodes[0].textContent||h.textContent).trim(),cnt=h.querySelector('i');return`<button class="czzg" onclick="czzTab('items',${i})"><span class="czzic">${czIco(CZZ_IC[nm]||'spark')}</span><small>${esc(nm)}</small>${cnt?`<i>${cnt.textContent}</i>`:''}</button>`}).join('')
  +(cz?`<button class="czzx" data-t="closet" onclick="czzTab('closet')"><span class="czzic">${czIco('closet')}</span><small>${CZZ_T('Closet','ตู้เสื้อผ้า')}</small></button>`:'')+(asg?`<button class="czzx" data-t="assign" onclick="czzTab('assign')"><span class="czzic">${czIco('music')}</span><small>${CZZ_T('Songs','เพลง')}</small></button>`:'');
 z.appendChild(gr);const sub=document.createElement('div');sub.className='czzsub';rows.forEach(r=>sub.appendChild(r));z.appendChild(sub);
 // 4 · scrolling panel: items + editor + colour tools (existing nodes), closet, songs / the studio's own controls
 const pn=document.createElement('div');pn.className='czzpanel';const it=document.createElement('div');it.dataset.tab='items';it.appendChild(panel);[...sw.children].forEach(c=>{if(c!==stage&&c!==pose&&c!==act)it.appendChild(c)});pn.appendChild(it);
 if(cz){const cl=document.createElement('div');cl.dataset.tab='closet';if(lib)cl.appendChild(lib);if(head)cl.appendChild(head);pn.appendChild(cl);if(asg){const as=document.createElement('div');as.dataset.tab='assign';as.appendChild(asg);pn.appendChild(as)}}
 else{const su=document.createElement('div');su.dataset.tab='setup';setup.forEach(c=>su.appendChild(c));pn.appendChild(su);if(h2)h2.style.display='none'}
 z.appendChild(pn);g.replaceWith(z);return true}
// ---- sizing (same principle as the CD Cover Studio workspace) -------------------------------------------------------------
function czzSize(){const z=document.querySelector('.czz');if(!z)return;const vv=window.visualViewport,vh=vv?vv.height:window.innerHeight,fs=czzFs(),hd=fs?null:document.querySelector('.hd'),nav=fs?null:document.querySelector('.nav'),
 hdB=hd?Math.max(0,hd.getBoundingClientRect().bottom):0,navH=nav&&getComputedStyle(nav).display!='none'&&vh>=window.innerHeight*.8?nav.getBoundingClientRect().height:0,avail=Math.max(360,vh-hdB-navH-(fs?0:6)),kb=vv&&vv.height<window.innerHeight*.75;
 z.style.top=hdB+'px';z.style.height=avail+'px';z.style.setProperty('--czzst',Math.round(avail*(kb?.22:fs?.44:.36))+'px');if(fs){z.style.marginBottom='';return}
 const cur=parseFloat(z.style.marginBottom)||0,aligned=window.scrollY+z.getBoundingClientRect().top-hdB,extra=document.documentElement.scrollHeight-(aligned+window.innerHeight);if(Math.abs(extra)>1)z.style.marginBottom=Math.min(0,cur-extra)+'px'}
{const f=render;render=function(){const on=CZZ_VIEWS.has(view);let keep=null;const pn0=document.querySelector('.czzpanel');if(on&&pn0)keep={t:pn0.scrollTop,cat:ui.czE&&ui.czE.cat,sub:(document.querySelector('.czzsub')||{}).scrollLeft||0,v:view};
 const r=f.apply(this,arguments);try{if(!on&&czzFs())czzFsExit();
  if(on){const built=czzBuild();const host=document.querySelector('.czz')||document.querySelector('.czgrid');if(host)czzDeEmoji(host.parentElement||host);const md=document.querySelector('#app .mod');if(md)czzDeEmoji(md);
   if(built){czzApply();const pn=document.querySelector('.czzpanel');if(pn&&keep&&keep.v==view){pn.scrollTop=keep.cat==(ui.czE&&ui.czE.cat)?keep.t:0;const sb=document.querySelector('.czzsub');if(sb)sb.scrollLeft=keep.sub}
    if(czzFs()){window.scrollTo(0,0)}else if(ui.czzVisit!==view){ui.czzVisit=view;const al=()=>{const z=document.querySelector('.czz'),hd=document.querySelector('.hd');if(!z)return;window.scrollTo(0,Math.max(0,window.scrollY+z.getBoundingClientRect().top-(hd?hd.getBoundingClientRect().height:0)));czzSize()};al();setTimeout(al,60);setTimeout(al,250)}}}
  else ui.czzVisit=0}catch(e){console.error(e)}return r}}
window.addEventListener('resize',()=>{if(!CZZ_VIEWS.has(view))return;const z=!!document.querySelector('.czz');if(z!==czzMob())render();else czzSize()});if(window.visualViewport)window.visualViewport.addEventListener('resize',()=>{if(CZZ_VIEWS.has(view))czzSize()});
// desktop: the fullscreen button sits above the editor (the unified workspace opens in fullscreen)
{const f=czGridHtml;czGridHtml=function(){const h=f.apply(this,arguments);try{if(window.innerWidth>=720&&!czzFs())return h.replace('<div class="czgrid">',`<div class="czfsbar"><button class="b s" onclick="czzFsOn()">${czIco('fsOn')} ${CZZ_T('Full screen studio','สตูดิโอเต็มจอ')}</button></div><div class="czgrid">`)}catch(e){}return h}}
// ---- starter outfit for a brand-new costume: basic T-shirt, shorts and sneakers ------------------------------------------------
function czStarter(){const P=czPiece;return{top:P('tee','#ffffff','#f7a8c8','#f3c35c'),sleeve:P('short','#ffffff','#ffffff'),collar:P('crew','#ffffff'),outer:{t:'none'},bottom:P('shorts','#7f9fcf','#ffffff','#f3c35c'),over:{t:'none'},shoes:P('sneakers','#ffffff','#f7a8c8'),legs:{t:'none'},x:{},a:{}}}
// czNew(0 / '' / 'blank') = a new costume from scratch; czNew('3') (from the preset list) keeps the preset
{const f=czNew;czNew=function(i){const blank=i===0||i===''||i==null||i==='blank';if(!blank)return f.apply(this,arguments);const n=czLib().ds.length;
 const r=f.call(this,0);try{const L=czLib().ds;if(L.length>n){const d=L[L.length-1];d.p=czStarter();d.style='';d.name=d.name.replace(CZ_PRESETS[0][0],'New design');if(ui.czE&&ui.czE.did==d.id){ui.czE.p=czClone(d.p);ui.czE.style=''}}}catch(e){console.error(e)}return r}}
{const f=V.costume;V.costume=function(){let h=f.apply(this,arguments);try{h=h.replace('<option value="">+ New design…</option>',`<option value="">+ New design…</option><option value="blank">${CZZ_T('New design (basic T-shirt, shorts, sneakers)','ชุดใหม่ (เสื้อยืด กางเกงขาสั้น รองเท้าผ้าใบ)')}</option>`)}catch(e){}return h}}
// ---- Group page: member cards no longer carry the "Actions…" menu (team moves, transfers, promotions
// go through Team Restructuring; graduation / dismissal stay in the member profile). Only "Open profile".
{const f=mcardT;mcardT=function(m){let h=f.apply(this,arguments);try{h=h.replace(/<select class="act"[\s\S]*?<\/select>/,`<button class="b s mprof" onclick="memAct(${m.id},'prof')">${(typeof UIP!='undefined'&&UIP.lang=='th')?'เปิดโปรไฟล์':'Open profile'}</button>`)}catch(e){console.error(e)}return h}}
