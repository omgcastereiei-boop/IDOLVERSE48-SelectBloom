// =====================================================================================
//  Navigation v2 — big UI reorganisation (loaded last, only moves pages; no game rule changes)
//  1. Company: Roster / Concurrent / Transfer tabs removed from the tab bar.
//  2. Former members: Solo Idol / New Idol Group system removed (no new offers, invites or acts).
//  3. One Group filter per list (duplicate group selects are hidden).
//  4. New section "Media": Documentaries + Drama Studio.
//  5. Events: hub page (Roadshow · Concert · Request Hour · General Election · Janken) and the
//     General Election / Janken / Request Hour pages as tabs of Events.
//  6. Recording & DVD → Theater.   7. Units & Solo Artists → Group & Team.
//  8. Community: icon, unread badge and a pop-up when new posts arrive.
//  9/10. Clearer sub-tab bar; desktop layout (CSS in theme.css · "nav v2").
// =====================================================================================
const NV_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
Object.assign(ICO,{
 community:'<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4h0A2.5 2.5 0 0 1 4 13.5z"/><path d="M8.5 9h7M8.5 12h4.5"/>',
 media:'<rect x="3.5" y="7" width="17" height="12.5" rx="2"/><path d="M3.5 7l3-3.5M9 7l3-3.5M14.5 7l3-3.5M3.5 10.5h17"/><path d="M10.5 13v4l3.5-2z"/>'});
(function(){try{
 const S_=k=>SECS.find(s=>s.k==k),moveV=(from,to,keys)=>{const A=S_(from),B=S_(to);if(!A||!B)return;keys.forEach(k=>{const i=A.v.findIndex(x=>x[0]==k);if(i>=0){if(!B.v.some(x=>x[0]==k))B.v.push(A.v[i]);A.v.splice(i,1)}const j=(A.hid||[]).indexOf(k);if(j>=0){A.hid.splice(j,1);B.hid=B.hid||[];if(!B.hid.includes(k))B.hid.push(k)}})};
 const hide=(sec,keys)=>{const A=S_(sec);if(!A)return;keys.forEach(k=>{const i=A.v.findIndex(x=>x[0]==k);if(i>=0){A.v.splice(i,1);A.hid=A.hid||[];if(!A.hid.includes(k))A.hid.push(k)}})};
 const drop=k=>{const i=SECS.findIndex(s=>s.k==k);if(i>=0)SECS.splice(i,1)};
 // 1. Company
 hide('company',['gsroster','gskn','gstransfer']);
 // 2. Solo & New Groups page
 hide('members',['solo']);
 // 4. Media
 const D=S_('drama');if(!S_('media')){const i=D?SECS.indexOf(D):SECS.findIndex(s=>s.k=='manage');SECS.splice(i<0?SECS.length:i,0,{k:'media',n:'Media',sh:'Media',jp:'メディア',loc:'Media Center',sc:'studio',v:[],hid:[]})}
 moveV('members','media',['doc']);if(D){moveV('drama','media',[...D.v.map(x=>x[0]),...(D.hid||[])]);drop('drama')}
 const M=S_('media');const dv=M.v.find(x=>x[0]=='drama');if(dv)dv[1]='Drama Studio';
 // 5. Events
 const E=S_('events');if(E){E.v=E.v.filter(x=>x[0]!='evhub');E.v.unshift(['evhub','Overview']);
  const G=S_('election');if(G){moveV('election','events',[...G.v.map(x=>x[0]),...(G.hid||[])]);drop('election')}
  E.hid=(E.hid||[]).filter(k=>k!='rh');if(!E.v.some(x=>x[0]=='rh'))E.v.push(['rh','Request Hour']);
  const ord=['evhub','roadshow','concert','rh','ge','gearch','janken','promo'];E.v.sort((a,b)=>(ord.indexOf(a[0])+99)%99-(ord.indexOf(b[0])+99)%99);
  E.n='Events';E.sh='Events'}
 // 6. Recording & DVD → Theater
 const R=S_('recording');if(R){moveV('recording','theater',[...R.v.map(x=>x[0]),...(R.hid||[])]);drop('recording')}
 // 7. Units & Solo Artists → Group & Team
 moveV('manage','groups',['units','soloart','unit']);
 SUBLOC.evhub='Event Hall · Overview';SC_VIEW.evhub='stage';SUBLOC.media='Media Center';
}catch(e){console.error('nav-v2',e)}})();
Object.assign(I18N_TH,{'Media':'มีเดีย','Media Center':'ศูนย์มีเดีย','Drama Studio':'สตูดิโอละคร','Events':'อีเวนต์','Overview':'ภาพรวม','Request Hour':'Request Hour','Event Hall · Overview':'ฮอลล์อีเวนต์ · ภาพรวม'});

// ---- 2. Solo Idol / New Idol Group removed ----------------------------------------------------------
if(typeof ctCareer=='function')ctCareer=function(m){try{ctCareerSet(m.id)}catch(e){console.error(e)}};
if(typeof ctSoloSign=='function')ctSoloSign=function(){toast(NV_T('The Solo Idol / New Idol Group system has been removed.','ระบบโซโลและวงใหม่ของอดีตสมาชิกถูกนำออกแล้ว'),'err')};
if(typeof ctGroupNew=='function')ctGroupNew=ctSoloSign;
if(typeof ctActTick=='function')ctActTick=function(){};
{const f=V.former;if(f)V.former=function(){let h=f.apply(this,arguments);try{h=h.replace(/<button class="b s" onclick="ctSoloSign\(\d+\)">Invite: Solo Idol<\/button><label class="st"><input type="checkbox"[^>]*> New group<\/label>/g,'').replace(' Invite them to a Solo Idol career or select several to form a New Idol Group.','').replace(/<input id="ctgn"[^>]*><button class="b s p" onclick="ctGroupNew\(\)">[^<]*<\/button>/,'')}catch(e){}return h}}

// ---- 5. Event hub ---------------------------------------------------------------------------------
const NV_IMG={};
function nvBg(key){if(NV_IMG[key])return NV_IMG[key];let u='';try{const svg=DOCBG.svg(key,7);u=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}))}catch(e){}return NV_IMG[key]=u}
function nvCnt(fn){try{return fn()}catch(e){return null}}
V.evhub=function(){const n=(x,en,th)=>x==null?'':`<span class="evhn">${x} ${NV_T(en,th)}</span>`;
 const C=[
  ['roadshow','tour',NV_T('Roadshow','โรดโชว์'),NV_T('Tour the country with handshake and promotion events.','ทัวร์ทั่วประเทศ พร้อมงานจับมือและโปรโมต'),'ロードショー',''],
  ['concert','concert',NV_T('Concert','คอนเสิร์ต'),NV_T('Plan venues, setlists, costumes and ticket sales.','วางแผนสถานที่ เซ็ตลิสต์ ชุด และการขายบัตร'),'コンサート',n(nvCnt(()=>ccS().list.length),'concerts','คอนเสิร์ต')],
  ['rh','stage',NV_T('Request Hour','Request Hour'),NV_T('Fans vote for the songs; the ranking becomes a concert.','แฟนโหวตเพลง แล้วจัดอันดับเป็นคอนเสิร์ต'),'リクエストアワー',n(nvCnt(()=>rhS().list.length),'held','ครั้ง')],
  ['ge','election',NV_T('General Election','เลือกตั้งทั่วไป'),NV_T('Fans vote for the next Senbatsu and Center.','แฟนโหวตเลือกเซ็มบัตสึและเซ็นเตอร์'),'総選挙',''],
  ['janken','auditorium',NV_T('Janken Tournament','จังเก้นทัวร์นาเมนต์'),NV_T('Rock-paper-scissors decides the Senbatsu.','เป่ายิ้งฉุบตัดสินเซ็มบัตสึ'),'じゃんけん大会',n(nvCnt(()=>jkS().list.length),'held','ครั้ง')]];
 return`<h2 class="ht">${NV_T('Events','อีเวนต์')}</h2><p class="st">${NV_T('Choose an event.','เลือกอีเวนต์ที่ต้องการ')}</p><div class="evhub">${C.map(([v,bg,t,d,jp,x])=>`<button class="evhc evh-${v}" onclick="goView('${v}')"><span class="evhimg" style="background-image:url('${nvBg(bg)}')"></span>${v=='janken'?'<span class="evhjk">✊ ✌ ✋</span>':''}<span class="evhtx"><small>${jp}</small><b>${t}</b><span>${d}</span>${x}</span></button>`).join('')}</div>`};

// ---- 3. one Group filter per list -------------------------------------------------------------------
function nvGrpDedupe(){const main=document.querySelector('#app main');if(!main||!S||(S.groups||[]).length<2)return;const ids=new Set(S.groups.map(g=>String(g.id)));
 const nm=new Map(S.groups.map(g=>[String(g.id),String(g.name).trim()])),isG=s=>{const o=[...s.options];if(!o.length||o[0].value!='all')return false;const v=o.slice(1);return v.length==ids.size&&v.every(x=>ids.has(x.value)&&x.text.trim()==nm.get(x.value))};
 const G=[...main.querySelectorAll('select')].filter(isG);if(G.length<2)return;const out=G.filter(s=>!s.closest('.mlbar')),bar=G.filter(s=>s.closest('.mlbar'));
 const off=s=>{if(s.value=='all')s.style.display='none'};
 if(out.length)bar.forEach(off);
 // a list that only holds one group's members does not need a group filter
 bar.forEach(s=>{if(s.style.display=='none')return;const b=s.closest('.mlbar'),L=b&&b.nextElementSibling;if(!L)return;const g=new Set();L.querySelectorAll('svg[data-mid]').forEach(sv=>{try{const r=mlGet(sv.dataset.mid);if(r&&r.m)g.add(gsGid(r.m))}catch(e){}});if(g.size<=1)off(s)});
 // two page-level group filters in the same card
 const seen=new Map();out.forEach(s=>{const c=s.closest('.c,.row')||main;if(seen.has(c))off(s);else seen.set(c,s)})}

// ---- 8. Community: unread badge + pop-up ---------------------------------------------------------------
const nvPn=p=>+(String(p.id||'').replace(/\D+/g,''))||0;
function nvCmUnread(){try{const C=cmS();if(!C)return 0;if(C.rd==null)C.rd=C.posts.reduce((a,p)=>Math.max(a,nvPn(p)),0);return C.posts.filter(p=>nvPn(p)>C.rd&&S.day-p.d<CM_DAYS).length}catch(e){return 0}}
function nvCmRead(){try{const C=cmS();C.rd=C.posts.reduce((a,p)=>Math.max(a,nvPn(p)),C.rd||0);C.pop=C.rd}catch(e){}}
let NV_POPT=null;
function nvCmPop(){try{const C=cmS();if(!C)return;if(C.pop==null)C.pop=C.rd!=null?C.rd:C.posts.reduce((a,p)=>Math.max(a,nvPn(p)),0);
 const N=C.posts.filter(p=>nvPn(p)>C.pop).sort((a,b)=>nvPn(b)-nvPn(a));C.pop=C.posts.reduce((a,p)=>Math.max(a,nvPn(p)),C.pop);if(!N.length||view=='community')return;
 const th=UIP.lang=='th',top=N.slice(0,2);let el=document.getElementById('cmpop');if(!el){el=document.createElement('div');el.id='cmpop';document.body.appendChild(el)}
 el.innerHTML=`<div class="cmpophd"><i>${ico('community')}</i><b>${NV_T(`${N.length} new post(s) in Community`,`มีโพสต์ใหม่ในคอมมูนิตี้ ${N.length} โพสต์`)}</b><button class="cmpopx" onclick="nvCmPopClose()" aria-label="close">×</button></div>${top.map(p=>`<div class="cmpopi" onclick="nvCmPopGo('${esc(String(p.id))}')"><b>@${esc(p.h)}</b><span>${esc(String(th?p.th:p.en).slice(0,110))}</span></div>`).join('')}<button class="b s p" onclick="nvCmPopGo()">${NV_T('Open Community','เปิดคอมมูนิตี้')}</button>`;
 el.classList.remove('off');void el.offsetWidth;el.classList.add('on');clearTimeout(NV_POPT);NV_POPT=setTimeout(nvCmPopClose,9000)}catch(e){console.error(e)}}
function nvCmPopClose(){const el=document.getElementById('cmpop');if(el){el.classList.remove('on');el.classList.add('off')}clearTimeout(NV_POPT)}
function nvCmPopGo(id){nvCmPopClose();view='community';render();try{window.scrollTo(0,0)}catch(e){}if(id)setTimeout(()=>{try{cmOpen(id)}catch(e){}},30)}
{const f=adv;adv=function(){const r=f.apply(this,arguments);try{if(S)setTimeout(nvCmPop,350)}catch(e){}return r}}

// ---- render hook: badge, dedupe, page markers -----------------------------------------------------------
{const f=render;render=function(){if(S&&!ui.t&&view=='community')nvCmRead();const r=f.apply(this,arguments);try{if(S&&!ui.t){
 document.body.classList.toggle('nv-in',true);
 const n=nvCmUnread();document.querySelectorAll('.nav button').forEach(b=>{if((b.getAttribute('onclick')||'')=="goSec('community')"){let x=b.querySelector('.nvbdg');if(n>0){if(!x){x=document.createElement('em');x.className='nvbdg';b.appendChild(x)}x.textContent=n>99?'99+':n}else if(x)x.remove()}});
 nvGrpDedupe()}}catch(e){console.error(e)}return r}}
