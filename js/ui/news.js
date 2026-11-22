// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Media & Public Relations · Part 1: the News Engine
// -------------------------------------------------------------------------------------
//  One centralized engine and one news store (S.news). No social-media management exists:
//  there are no official accounts, followers, posting or scheduling — members' private
//  online behaviour only appears as the SOURCE of rumors / scandals (Part 2).
//
//  Pipeline: system ADAPTERS read each game system's own records once a day and EMIT
//  structured events {key, sys, type, facts}. The engine (1) ignores keys it has already
//  processed, (2) decides whether the event deserves coverage, (3) rates importance and
//  public attention, (4) writes the article natively in English AND Thai from the same facts,
//  (5) assigns a stable image spec, (6) stores the article with its source references,
//  (7) applies its impact once and logs it, (8) publishes it to the feed / archive.
//  Facts (sales, ranks, votes, attendance…) are copied from the records — never invented —
//  and the original records are never modified. Future systems only register an adapter.
//
//  Kept separate (S.news.rep): Company Reputation, Public Trust and Media Attention;
//  Group Reputation / Attention; Member Reputation / Attention. Popularity and fans stay
//  in the existing systems (m.fans/m.pop via gainPop, S.fb via fbBoost / fbAcquire).
// =====================================================================================
const NW_SRC={game:['Game event','ข่าวจากเหตุการณ์ในเกม'],world:['World news','ข่าวทั่วไปในวงการ'],scandal:['Scandal & rumor','ข่าวฉาวและข่าวลือ']};
const NW_CAT={single:['Singles & Music','ซิงเกิลและเพลง'],chart:['Music Chart','ชาร์ตเพลง'],theater:['Theater','เธียเตอร์'],concert:['Concert','คอนเสิร์ต'],event:['Events','อีเวนต์'],election:['General Election','เลือกตั้งทั่วไป'],audition:['Audition & Recruitment','ออดิชันและรับสมัคร'],member:['Members','เมมเบอร์'],fanbase:['Fanbase','ฐานแฟนคลับ'],company:['Company','บริษัท'],industry:['Industry','วงการบันเทิง'],rival:['Rival groups','คู่แข่ง'],recording:['Recordings & DVD','งานบันทึกเสียงและดีวีดี'],scandal:['Scandal','ข่าวฉาว'],rumor:['Rumor','ข่าวลือ']};
const NW_SENT={pos:['Positive','เชิงบวก'],neg:['Negative','เชิงลบ'],mix:['Mixed reactions','กระแสผสม'],neu:['Neutral','เป็นกลาง']};
// fictional outlets of the game world: name, focus, credibility (0–100), tone
const NW_OUT={
 stardaily:{n:['Star Daily','สตาร์เดลี่'],f:['General entertainment','ข่าวบันเทิงทั่วไป'],cred:70,tone:'bright'},
 idolpress:{n:['Idol Press Weekly','ไอดอลเพรส วีคลี่'],f:['Idol industry','วงการไอดอล'],cred:76,tone:'insider'},
 chartwatch:{n:['Chart Watch Japan','ชาร์ตวอทช์ เจแปน'],f:['Chart reporting','รายงานชาร์ตเพลง'],cred:88,tone:'data'},
 melody:{n:['Melody News','เมโลดี้นิวส์'],f:['Music industry','วงการดนตรี'],cred:80,tone:'pro'},
 tvstar:{n:['TV Star Pop','ทีวีสตาร์ป๊อป'],f:['Television & celebrity','ทีวีและคนดัง'],cred:60,tone:'gossip'},
 scoop:{n:['Scoop Insider','สกู๊ปอินไซเดอร์'],f:['Investigative entertainment','เจาะลึกข่าวบันเทิง'],cred:52,tone:'probe'},
 fanvoice:{n:['Fan Voice','แฟนวอยซ์'],f:['Fan culture & commentary','วัฒนธรรมแฟนคลับ'],cred:55,tone:'fan'},
 bizrev:{n:['Entertainment Business Review','รีวิวธุรกิจบันเทิง'],f:['Entertainment business','ธุรกิจบันเทิง'],cred:86,tone:'pro'}};
const NW_OUT_BY={single:['idolpress','stardaily','melody'],chart:['chartwatch','melody'],theater:['idolpress','fanvoice'],concert:['stardaily','idolpress','melody'],event:['tvstar','stardaily','fanvoice'],election:['idolpress','stardaily','fanvoice'],audition:['idolpress','stardaily'],member:['idolpress','stardaily','fanvoice'],fanbase:['fanvoice','idolpress'],company:['bizrev','stardaily'],industry:['melody','bizrev','stardaily'],rival:['melody','chartwatch','stardaily'],recording:['melody','idolpress'],scandal:['scoop','tvstar','stardaily'],rumor:['tvstar','scoop','fanvoice']};
const nwL=()=>typeof i18nLang=='function'&&i18nLang()=='th'?1:0;
const nwT=p=>Array.isArray(p)?p[nwL()]:p;
// ---- state ---------------------------------------------------------------------------------------------------------------------
function nwS(){if(!S)return null;let N=S.news;if(!N||typeof N!='object')N=S.news={};N.v=1;N.seq=N.seq|0;N.list=Array.isArray(N.list)?N.list:[];N.seen=N.seen&&typeof N.seen=='object'?N.seen:{};N.log=Array.isArray(N.log)?N.log:[];
 N.rep=N.rep||{};N.rep.co=N.rep.co||{rep:50,trust:60,att:8};N.rep.g=N.rep.g||{};N.rep.m=N.rep.m||{};N.cd=N.cd||{};N.sc=N.sc||{seq:0,list:[]};N.sc.list=Array.isArray(N.sc.list)?N.sc.list:[];return N}
const nwGet=id=>nwS().list.find(a=>a.id==id)||null;
const nwRepM=mid=>{const R=nwS().rep.m;return R[mid]=R[mid]||{rep:50,att:0}};
const nwRepG=gid=>{const R=nwS().rep.g;return R[gid]=R[gid]||{rep:50,att:5}};
const nwCl=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const nwMem=id=>(typeof ctMem=='function'?ctMem(id):null)||get(id)||null;
const nwNm=id=>{const m=nwMem(id);return m?m.name:'#'+id};
const nwGn=gid=>{const g=grp(gid);return g?g.name:(S.gn||'')};
const nwGid=m=>m?(typeof gsGid=='function'?gsGid(m):m.group):null;
const nwN=n=>Math.round(+n||0).toLocaleString('en-US');
const nwDate=(d,th)=>{const s=jd(d);if(!th)return s;try{return trCore(s)}catch(e){return s}};
const nwPick=(a,seed)=>a[Math.abs(seed|0)%a.length];
const nwHash=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))|0;return Math.abs(h)};
// ---- adapters (one per game system; future systems just call nwAdapter) --------------------------------------------------------
const NW_AD=[];function nwAdapter(sys,fn){NW_AD.push({sys,fn})}
const NW_TPL={};function nwTpl(type,fn){NW_TPL[type]=fn}
// emit: an adapter (or any system) hands over one structured event
function nwEmit(ev){const N=nwS();if(!ev||!ev.key||N.seen[ev.key])return null;N.seen[ev.key]=S.day;if(N.base)return null;const fn=NW_TPL[ev.type];if(!fn)return null;let out=null;try{out=fn(ev.f||{},ev)}catch(e){console.error('news',ev.type,e);return null}
 if(!out)return null;if(out.chance!=null&&Math.random()>out.chance)return null;return nwPublish({...out,src:ev.src||out.src||'game',ev:ev.key,sys:ev.sys,type:ev.type})}
// publish one article (all three source types go through here)
function nwPublish(o){const N=nwS(),id='N'+String(++N.seq).padStart(4,'0'),cat=o.cat||'industry',outs=NW_OUT_BY[cat]||['stardaily'],out=o.out||nwPick(outs,nwHash(id+o.type));
 const a={id,day:S.day,t:Date.now(),src:o.src||'game',cat,type:o.type||cat,sys:o.sys||null,ev:o.ev||null,out,sent:o.sent||'neu',att:nwCl(Math.round(o.att||30),1,100),imp:o.imp||2,
  refs:o.refs||{},img:o.img||{k:'edit',th:cat},alt:o.alt||{en:'Editorial illustration',th:'ภาพประกอบข่าว'},en:o.en,th:o.th,fx:o.fx||null,fxDone:0,st:o.st||'published',read:0,
  hist:[{d:S.day,e:'created'},{d:S.day,e:'published'}],fu:[],parent:o.parent||null,sc:o.sc||null,sev:o.sev||null,truth:o.truth||null,reac:o.reac||null,facts:o.facts||null};
 if(!a.en||!a.th)return null;N.list.unshift(a);if(a.parent){const p=nwGet(a.parent);if(p){p.fu.push(a.id);p.hist.push({d:S.day,e:'follow-up',id:a.id})}}
 nwApply(a);nwNotify(a);return a}
// impacts: applied exactly once, logged separately, never touching the source record
function nwApply(a){if(!a||a.fxDone||!a.fx)return;const F=a.fx,N=nwS(),L=[];
 try{(F.pop||[]).forEach(([mid,d])=>{const m=get(mid);if(m&&d){gainPop(m,d);L.push(['pop',mid,d])}});
  (F.mrep||[]).forEach(([mid,d])=>{const r=nwRepM(mid);r.rep=nwCl(r.rep+d);L.push(['mrep',mid,d])});(F.matt||[]).forEach(([mid,d])=>{const r=nwRepM(mid);r.att=nwCl(r.att+d);L.push(['matt',mid,d])});
  (F.grep||[]).forEach(([gid,d])=>{const r=nwRepG(gid);r.rep=nwCl(r.rep+d);L.push(['grep',gid,d])});(F.gatt||[]).forEach(([gid,d])=>{const r=nwRepG(gid);r.att=nwCl(r.att+d);L.push(['gatt',gid,d])});
  const C=N.rep.co;if(F.crep){C.rep=nwCl(C.rep+F.crep);L.push(['crep',0,F.crep])}if(F.trust){C.trust=nwCl(C.trust+F.trust);L.push(['trust',0,F.trust])}if(F.catt){C.att=nwCl(C.att+F.catt);L.push(['catt',0,F.catt])}
  if(F.eng&&S.fb&&typeof fbBoost=='function'){const[mid,de]=F.eng;fbBoost(s=>mid==null||s.k==mid||(s.o&&s.o[mid]),de,0);L.push(['eng',mid,de])}
  if(F.fans&&typeof fbAcquire=='function'&&S.fb){fbAcquire(F.fans,{via:'group',org:'Media coverage'});if(typeof fbApply=='function')fbApply();L.push(['fans',0,F.fans])}}catch(e){console.error(e)}
 a.fxDone=1;a.hist.push({d:S.day,e:'impact',fx:L});N.log.unshift({d:S.day,id:a.id,fx:L});if(N.log.length>600)N.log.length=600}
// ---- daily processing --------------------------------------------------------------------------------------------------------
function nwDaily(){if(!S||!S.members)return;const N=nwS();
 // first run on an existing save: every past record is marked as already covered (no flood of old news)
 if(!N.init){N.base=1;nwScan();N.base=0;N.init=1;return}
 nwScan();
 // media attention cools down a little every day
 const C=N.rep.co;C.att=nwCl(C.att*.985);Object.values(N.rep.g).forEach(r=>r.att=nwCl(r.att*.98));Object.values(N.rep.m).forEach(r=>r.att=nwCl(r.att*.97));
 try{if(typeof nwWorldDaily=='function')nwWorldDaily()}catch(e){console.error(e)}
 try{if(typeof scDaily=='function')scDaily()}catch(e){console.error(e)}
 if(N.list.length>1500){N.list.slice(1500).forEach(a=>{a.arch=1});}}
function nwScan(){NW_AD.forEach(A=>{try{A.fn()}catch(e){console.error('news adapter',A.sys,e)}})}
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{nwDaily()}catch(e){console.error(e)}return r}}
// per-group loop helper
const nwGroups=()=>(S.groups||[]).filter(g=>!g.dis);
function nwEachGroup(fn){nwGroups().forEach(g=>{try{gsWith(g.id,()=>fn(g))}catch(e){console.error(e)}})}

// ---- images: stable specs, drawn from the game's own art --------------------------------------------------------------------
// k: mem (portrait) · grp (members together) · cover (actual CD cover) · stage (performance photo of a recorded show)
//    · concert (recorded concert picture) · rival (artist emblem) · chart (bar graphic of real chart data)
//    · edit (clearly-labelled editorial illustration; used for rumors / sensitive stories)
function nwImgSvg(a){const I=a.img||{},h=nwHash(a.id),W=640,H=360,lab=(t)=>`<rect x="${W-222}" y="${H-46}" width="210" height="36" rx="18" fill="#000" opacity=".6"/><text x="${W-117}" y="${H-22}" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="700" fill="#fff">${esc(t)}</text>`;
 const bg=(hue)=>`<defs><linearGradient id="nb${h}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},62%,72%)"/><stop offset="1" stop-color="hsl(${(hue+60)%360},55%,40%)"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#nb${h})"/>${[...Array(9)].map((_,i)=>`<circle cx="${(h*7+i*97)%W}" cy="${(h*13+i*53)%H}" r="${6+(i*5)%18}" fill="#fff" opacity=".12"/>`).join('')}`;
 const figs=(ids,y0,sc)=>{const L=ids.map(nwMem).filter(Boolean).slice(0,9),n=L.length,step=Math.min(120,(W-60)/Math.max(1,n));return L.map((m,i)=>{const ap0=ap(m),x=W/2+(i-(n-1)/2)*step;let g='';try{g=fig(m,{pose:[0,2,1,6,8][i%5],of:ap0.of,oh:ap0.oh,ac:ap0.ac,ex:2})}catch(e){}return`<svg x="${x-55*sc}" y="${y0}" width="${110*sc}" height="${275*sc}" viewBox="10 -2 80 200">${g}</svg>`}).join('')};
 try{switch(I.k){
  case'mem':{const m=nwMem(I.id);if(!m)break;let p='';try{p=pt(m,null,1)}catch(e){}return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${bg(m.hue|0)}<svg x="${W/2-150}" y="0" width="300" height="360" viewBox="0 0 100 120">${p.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</svg>${I.tag?lab(nwT(I.tag)):''}</svg>`}
  case'grp':{const ids=(I.ids||[]).filter(id=>nwMem(id));if(!ids.length)break;return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${bg(I.hue??(h%360))}<rect y="${H-70}" width="${W}" height="70" fill="#000" opacity=".18"/>${figs(ids,30,ids.length>5?.95:1.15)}${I.tag?lab(nwT(I.tag)):''}</svg>`}
  case'cover':{let c=null;try{gsWith(I.gid,()=>{const x=(S.singles||[]).find(z=>z.rid==I.rid);c=x&&x.covers&&Object.values(x.covers)[0]})}catch(e){}if(!c)break;const cv=coverSvg(c,{});return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${bg(h%360)}<rect x="${W/2-158}" y="22" width="316" height="316" fill="#000" opacity=".25" rx="8"/><svg x="${W/2-160}" y="20" width="316" height="316" viewBox="0 0 512 512">${cv.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</svg></svg>`}
  case'stage':{const ids=(I.ids||[]).filter(id=>nwMem(id));if(!ids.length)break;return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#1b1230"/>${[...Array(6)].map((_,i)=>`<path d="M${80+i*96} 0L${40+i*96} ${H}H${130+i*96}Z" fill="hsl(${(I.hue||300)+i*20},80%,70%)" opacity=".13"/>`).join('')}<rect y="${H-60}" width="${W}" height="60" fill="#2a1d45"/><path d="M0 ${H-60}H${W}" stroke="#f3c35c" stroke-width="3"/>${figs(ids,40,1)}${[...Array(26)].map((_,i)=>`<circle cx="${12+i*24.5}" cy="${H-8}" r="10" fill="#0a0612"/>`).join('')}</svg>`}
  case'concert':{let s='';try{const C=ccGet(I.cid),p=C&&C.pf.find(x=>x.res&&!x.res.err),set=p&&C.sets[(p.res||{}).sid||p.set];if(set){const idx=set.items.findIndex(x=>x.k=='song');if(idx>=0)s=ccStageSvg(C,p,set,idx,W,H)}}catch(e){}if(s)return s;break}
  case'rival':{const nm=String(I.nm||'?'),ini=nm.split(/\s+/).map(w=>w[0]).join('').slice(0,3).toUpperCase(),hue=I.hue??(nwHash(nm)%360);return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${bg(hue)}<circle cx="${W/2}" cy="${H/2-10}" r="96" fill="#fff" opacity=".9"/><text x="${W/2}" y="${H/2+18}" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="78" fill="hsl(${hue},55%,35%)">${esc(ini)}</text><text x="${W/2}" y="${H-28}" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="26" fill="#fff">${esc(nm)}</text>${lab(nwT(['Artist emblem','ตราศิลปิน']))}</svg>`}
  case'chart':{const R=I.rows||[],mx=Math.max(1,...R.map(r=>r[2]||0));return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#14182b"/><text x="24" y="40" font-family="sans-serif" font-size="22" font-weight="800" fill="#f3c35c">${esc(nwT(I.ttl||['Weekly chart','ชาร์ตประจำสัปดาห์']))}</text>${R.slice(0,6).map((r,i)=>{const y=62+i*46,w=Math.max(20,(W-260)*(r[2]||0)/mx);return`<text x="24" y="${y+26}" font-family="sans-serif" font-size="20" font-weight="800" fill="${r[3]?'#ff8fb7':'#ffffff'}">${r[0]}</text><rect x="64" y="${y+6}" width="${w}" height="28" rx="6" fill="${r[3]?'#ff8fb7':'#5b6aa8'}"/><text x="${74}" y="${y+26}" font-family="sans-serif" font-size="14" fill="#fff">${esc(String(r[1]).slice(0,34))}</text>`}).join('')}${lab(nwT(['Chart graphic','กราฟิกชาร์ต']))}</svg>`}}}catch(e){console.error(e)}
 // editorial illustration (rumors, sensitive or abstract stories) — clearly labelled as an illustration
 const th=I.th||'press',hue={rumor:270,scandal:350,award:45,industry:210,company:200,tv:190,fan:320,chart:230}[th]??(h%360);
 const ic={rumor:`<path d="M300 120q20-40 60-20q30 20 0 50q-20 15-20 40" stroke="#fff" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="340" cy="230" r="10" fill="#fff"/>`,scandal:`<rect x="250" y="110" width="140" height="110" rx="10" fill="#fff" opacity=".9"/><circle cx="320" cy="165" r="34" fill="hsl(${hue},40%,30%)"/><circle cx="320" cy="165" r="18" fill="#fff" opacity=".6"/><rect x="280" y="98" width="40" height="16" rx="4" fill="#fff"/>`,award:`<path d="M320 90l22 46 50 6-37 34 10 50-45-25-45 25 10-50-37-34 50-6z" fill="#ffe28a"/>`,tv:`<rect x="230" y="100" width="180" height="120" rx="14" fill="#fff" opacity=".9"/><rect x="246" y="114" width="148" height="92" rx="8" fill="hsl(${hue},50%,40%)"/><path d="M290 96l30 -26 30 26" stroke="#fff" stroke-width="6" fill="none"/>`,fan:`${[0,1,2,3,4].map(i=>`<path d="M${230+i*40} 240v-90" stroke="hsl(${(hue+i*40)%360},80%,75%)" stroke-width="14" stroke-linecap="round"/>`).join('')}`,industry:`${[0,1,2,3].map(i=>`<rect x="${240+i*40}" y="${230-i*30-20}" width="28" height="${i*30+20}" fill="#fff" opacity=".85"/>`).join('')}`,company:`<rect x="260" y="90" width="120" height="150" fill="#fff" opacity=".85"/>${[0,1,2,3].map(i=>`<rect x="278" y="${106+i*32}" width="84" height="18" fill="hsl(${hue},40%,45%)"/>`).join('')}`,chart:`${[0,1,2,3,4].map(i=>`<rect x="${230+i*38}" y="${240-i*28-30}" width="26" height="${i*28+30}" rx="4" fill="#fff" opacity=".9"/>`).join('')}`,press:`<rect x="300" y="150" width="40" height="90" fill="#fff" opacity=".9"/><circle cx="320" cy="132" r="30" fill="#fff"/><rect x="306" y="120" width="28" height="24" rx="6" fill="hsl(${hue},40%,35%)"/>`}[th]||'';
 return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${bg(hue)}${ic}${I.id&&nwMem(I.id)?(()=>{let p='';try{p=pt(nwMem(I.id),null,1)}catch(e){}return`<svg x="20" y="${H-170}" width="140" height="168" viewBox="0 0 100 120">${p.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</svg>`})():''}${lab(nwT(['Illustration','ภาพประกอบ']))}</svg>`}
function nwImg(a,cls){let svg='';try{svg=(typeof rcInl=='function'?rcInl:(f=>f()))(()=>nwImgSvg(a))}catch(e){}if(!svg)svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="#e9dff3"/><text x="320" y="190" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#7a62c8">IDOLVERSE48 NEWS</text></svg>`;
 const alt=esc(nwT([a.alt&&a.alt.en||'News image',a.alt&&a.alt.th||'ภาพข่าว']));return rcImg('nw:'+a.id+':'+(a.img&&(a.img.k=='edit'||a.img.tag)?nwL():''),svg,cls||'nwimg').replace('alt=""',`alt="${alt}"`)}

// ---- facts helpers --------------------------------------------------------------------------------------------------------------
const nwLine=o=>{if(!o)return[];const sl=(o.fm&&o.fm.sl||[]).filter(z=>z.m).map(z=>z.m);return sl.length?sl:(o.slots||[]).filter(Boolean)};
const nwCen=o=>(o&&(o.centers&&o.centers.length?o.centers:o.center!=null?[o.center]:[]))||[];
const nwList=(ids,th)=>{const n=ids.map(nwNm);if(n.length<=1)return n[0]||'';return th?n.slice(0,-1).join(', ')+' และ '+n.at(-1):n.slice(0,-1).join(', ')+' and '+n.at(-1)};
const nwMemImg=(id,tag)=>({k:'mem',id,tag});
const nwAlt=(en,th)=>({en,th});
