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
//  Desktop keeps the existing layout. No data, logic or rendering is changed.
// =====================================================================================
const czzMob=()=>window.innerWidth<720;
const CZZ_IC={'Clothing':'👗','Details':'🎀','Accessories':'💍','Festival & seasonal':'🎐','Traditional ornaments':'🏮','Graduation':'🎓'};
const CZZ_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
function czzBack(){const b=[...document.querySelectorAll('.gebanner button,.plback button,.c.gebanner button')].find(x=>/^\s*[←◀]/.test(x.textContent));if(b){b.click();return}ui.czE=null;goView('music')}
function czzTab(t,g){ui.czzT=t;if(g!=null)ui.czzG=g;czzApply();if(t=='items'&&g!=null){const row=document.querySelectorAll('.czzsub .czsr')[g];if(row&&!row.querySelector('.on')){const b=row.querySelector('button');if(b)b.click()}}}
// show the active tab / group without re-rendering (nothing in the costume changes)
function czzApply(){const z=document.querySelector('.czz');if(!z)return;const t=ui.czzT||'items',g=ui.czzG|0;
 z.querySelectorAll('.czzg').forEach((b,i)=>b.classList.toggle('on',t=='items'?i==g:false));z.querySelectorAll('.czzx').forEach(b=>b.classList.toggle('on',b.dataset.t==t));
 z.querySelectorAll('.czzsub .czsr').forEach((r,i)=>r.style.display=t=='items'&&i==g?'':'none');const sub=z.querySelector('.czzsub');if(sub)sub.style.display=t=='items'?'':'none';
 z.querySelectorAll('.czzpanel [data-tab]').forEach(el=>el.style.display=el.dataset.tab==t?'':'none');czzSize()}
function czzBuild(){const g=document.querySelector('.czgrid');if(!g||!czzMob()||g.closest('.czz'))return false;const root=g.parentElement;
 const lib=root.querySelector(':scope > .czlib'),head=root.querySelector(':scope > .czhead'),asg=root.querySelector(':scope > .czasg'),nav=g.querySelector('.czcats'),sw=g.querySelector('.czstagewrap'),panel=g.querySelector('.czpanel');if(!nav||!sw||!panel)return false;
 const stage=sw.querySelector('.czstage'),pose=sw.querySelector('.czpose'),act=sw.querySelector('.czact'),d=czEditing&&czEditing();
 const z=document.createElement('div');z.className='czz';
 // 1 · top bar
 const top=document.createElement('div');top.className='czztop';top.innerHTML=`<div class="czztr"><button class="czzback" onclick="czzBack()" aria-label="Back">◀</button><div class="czztt"><b>${CZZ_T('Costume Studio','สตูดิโอชุด')}</b><small>${esc(d?d.name:'')}</small></div></div>`;if(act){act.classList.add('czzact');top.appendChild(act)}z.appendChild(top);
 // 2 · pinned preview
 const st=document.createElement('div');st.className='czzst';if(stage)st.appendChild(stage);if(pose){pose.classList.add('czzpose');st.appendChild(pose)}z.appendChild(st);
 // 3 · category groups + categories (existing buttons)
 const sh=[...nav.querySelectorAll(':scope > .czsh')],rows=[...nav.querySelectorAll(':scope > .czsr')];let active=rows.findIndex(r=>r.querySelector('.on'));if(active<0)active=0;
 if(ui.czzG==null||ui.czzLast!==(ui.czE&&ui.czE.cat)){ui.czzG=active;ui.czzLast=ui.czE&&ui.czE.cat}
 const gr=document.createElement('div');gr.className='czzgr';gr.innerHTML=sh.map((h,i)=>{const nm=(h.childNodes[0]&&h.childNodes[0].textContent||h.textContent).trim(),cnt=h.querySelector('i');return`<button class="czzg" onclick="czzTab('items',${i})"><span class="czzic">${CZZ_IC[nm]||'✨'}</span><small>${esc(nm)}</small>${cnt?`<i>${cnt.textContent}</i>`:''}</button>`}).join('')+`<button class="czzx" data-t="closet" onclick="czzTab('closet')"><span class="czzic">🗂</span><small>${CZZ_T('Closet','ตู้เสื้อผ้า')}</small></button>`+(asg?`<button class="czzx" data-t="assign" onclick="czzTab('assign')"><span class="czzic">🎵</span><small>${CZZ_T('Songs','เพลง')}</small></button>`:'');
 z.appendChild(gr);const sub=document.createElement('div');sub.className='czzsub';rows.forEach(r=>sub.appendChild(r));z.appendChild(sub);
 // 4 · scrolling panel: items + editor + colour tools (existing nodes), closet, songs
 const pn=document.createElement('div');pn.className='czzpanel';const it=document.createElement('div');it.dataset.tab='items';it.appendChild(panel);[...sw.children].forEach(c=>{if(c!==stage&&c!==pose&&c!==act)it.appendChild(c)});pn.appendChild(it);
 const cl=document.createElement('div');cl.dataset.tab='closet';if(lib)cl.appendChild(lib);if(head)cl.appendChild(head);pn.appendChild(cl);if(asg){const as=document.createElement('div');as.dataset.tab='assign';as.appendChild(asg);pn.appendChild(as)}z.appendChild(pn);
 g.replaceWith(z);return true}
// ---- sizing (same principle as the CD Cover Studio workspace) -------------------------------------------------------------
function czzSize(){const z=document.querySelector('.czz');if(!z)return;const vv=window.visualViewport,vh=vv?vv.height:window.innerHeight,hd=document.querySelector('.hd'),nav=document.querySelector('.nav'),
 hdB=hd?Math.max(0,hd.getBoundingClientRect().bottom):0,navH=nav&&getComputedStyle(nav).display!='none'&&vh>=window.innerHeight*.8?nav.getBoundingClientRect().height:0,avail=Math.max(360,vh-hdB-navH-6),kb=vv&&vv.height<window.innerHeight*.75;
 z.style.top=hdB+'px';z.style.height=avail+'px';z.style.setProperty('--czzst',Math.round(avail*(kb?.22:.36))+'px');
 const w=z.closest('main,.main,#app')||document.documentElement;void w;const cur=parseFloat(z.style.marginBottom)||0,aligned=window.scrollY+z.getBoundingClientRect().top-hdB,extra=document.documentElement.scrollHeight-(aligned+window.innerHeight);if(Math.abs(extra)>1)z.style.marginBottom=Math.min(0,cur-extra)+'px'}
{const f=render;render=function(){let keep=null;const pn0=document.querySelector('.czzpanel');if(view=='costume'&&pn0)keep={t:pn0.scrollTop,cat:ui.czE&&ui.czE.cat,sub:(document.querySelector('.czzsub')||{}).scrollLeft||0};
 const r=f.apply(this,arguments);try{if(view=='costume'&&czzBuild()){czzApply();const pn=document.querySelector('.czzpanel');if(pn&&keep){pn.scrollTop=keep.cat==(ui.czE&&ui.czE.cat)?keep.t:0;const sb=document.querySelector('.czzsub');if(sb)sb.scrollLeft=keep.sub}
  if(ui.czzVisit!==1){ui.czzVisit=1;const al=()=>{const z=document.querySelector('.czz'),hd=document.querySelector('.hd');if(!z)return;window.scrollTo(0,Math.max(0,window.scrollY+z.getBoundingClientRect().top-(hd?hd.getBoundingClientRect().height:0)));czzSize()};al();setTimeout(al,60);setTimeout(al,250)}}else if(view!='costume')ui.czzVisit=0}catch(e){console.error(e)}return r}}
window.addEventListener('resize',()=>{if(view!='costume')return;const z=!!document.querySelector('.czz');if(z!==czzMob())render();else czzSize()});if(window.visualViewport)window.visualViewport.addEventListener('resize',()=>{if(view=='costume')czzSize()});
