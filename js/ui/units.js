// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Units & Solo Artists
// -------------------------------------------------------------------------------------
//  · A Unit (Permanent / Special / Shuffle) or a Solo Artist is its own production context in S.groups
//    (type 'unit' | 'solo'), so the whole existing single / album pipeline (songs, formation, costumes, MV, cover,
//    editions, release date, sales, chart, finances, calendar) works for it unchanged — through Production, which
//    switches the active context to the unit (gsSelect) and back.
//  · Membership is a roster of member ids taken from the whole company (any team, any sister group, never Trainees);
//    a member keeps her main group and team. Members' m.group never points to a unit.
//  · Unit discography lives in the unit's own context: it never counts as a Main Group single or a Senbatsu record
//    (no Senbatsu reactions / position records for unit releases).
//  · Leaving the company removes the member from every unit roster (history kept). A unit is Active until the
//    producer disbands it (manual only); a disbanded unit keeps its history and cannot release any more.
//  · Charts: unit & solo releases enter the same Japan CD Sales Chart as their own artist, with demand from the
//    unique fans of their members only (no inflation). Awards: release categories yes; solo artists are never in
//    group categories, units are not in the main-group categories (Best Idol Group, Sister Group, Fandom).
// =====================================================================================
const UT=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
const U_KIND={perm:['Permanent Unit','ยูนิตถาวร'],special:['Special Unit','ยูนิตพิเศษ'],shuffle:['Shuffle Unit','ยูนิตชัฟเฟิล']};
const U_SYM=['◆','✦','❖','✧','◇','✶','✷','✸','☆','♢'];
const U_COL=['#e05a8a','#5a8ae0','#8a5ae0','#3fb58f','#e0a23a','#d4485c','#2fa3c9','#9b6b4a','#6c7a89','#c45ac4'];
const uIs=g=>!!g&&(g.type=='unit'||g.type=='solo');
const uOf=gid=>{const g=S&&grp(gid);return uIs(g)?g:null};
const uCur=()=>S&&S.groups?uOf(gsAg()):null;
const uUnits=()=>(S.groups||[]).filter(g=>g.type=='unit');
const uSolos=()=>(S.groups||[]).filter(g=>g.type=='solo');
const uLive=m=>!!m&&S.members.includes(m)&&m.status!='graduated';
const uOkMem=m=>uLive(m)&&m.status!='trainee'&&isAct(m);
function uRoster(g){if(!g)return[];if(g.type=='solo')return g.solo&&!g.solo.end?[g.solo.mid]:[];return(g.unit&&g.unit.roster)||[]}
const uActive=g=>uRoster(g).map(get).filter(uOkMem);
function uState(g){if(!g)return'';if(g.type=='solo')return g.solo&&g.solo.end?'ended':'active';return(g.unit&&g.unit.st)||'active'}
const uCanRelease=g=>uState(g)=='active'&&uActive(g).length>0;
function uLog(g,t){const L=g.type=='solo'?(g.solo.log=g.solo.log||[]):(g.unit.log=g.unit.log||[]);L.unshift({d:S.day,t});if(L.length>200)L.length=200}
const uTypeName=g=>!g?'':g.type=='solo'?UT('Solo Artist','ศิลปินเดี่ยว'):g.type=='unit'?UT(...U_KIND[(g.unit||{}).kind]||U_KIND.perm):g.type=='main'?UT('Main Group','วงหลัก'):UT('Sister Group','วงน้องสาว');
const uIdent=g=>!g?'':g.type=='solo'?UT('Solo','โซโล่'):g.type=='unit'?UT('Unit','ยูนิต'):g.type=='main'?UT('Main Group','วงหลัก'):UT('Sister Group','วงน้องสาว');
// ---- generic group lists show the real groups only (units / solo artists have their own pages) ---------------------------------
let U_SCOPED=0;
function uScope(fn,keepCur){if(!S||!S.groups||U_SCOPED||!S.groups.some(uIs))return fn();const all=S.groups,cur=gsAg();S.groups=all.filter(g=>!uIs(g)||(keepCur&&g.id==cur));U_SCOPED=1;try{return fn()}finally{S.groups=all;U_SCOPED=0}}
{const f=save;save=function(){if(U_SCOPED)return;return f.apply(this,arguments)}}
// ---- unique fans of a unit / solo artist: the union of her members' supporters (each person once) --------------------------------
function uSegN(s,set){if(s.k!=null&&set.has(+s.k))return s.n;const n=s.n;if(!(n>0))return 0;const L=typeof fdLayout=='function'?fdLayout(s):{},iv=[];for(const j in L){if(!set.has(+j))continue;const[a,len]=L[j];if(len<=0)continue;if(len>=n)return n;if(a+len<=n)iv.push([a,a+len]);else{iv.push([a,n]);iv.push([0,a+len-n])}}
 if(!iv.length)return 0;iv.sort((x,y)=>x[0]-y[0]);let tot=0,cs=iv[0][0],ce=iv[0][1];for(const[a,b]of iv.slice(1)){if(a<=ce)ce=Math.max(ce,b);else{tot+=ce-cs;cs=a;ce=b}}tot+=ce-cs;return Math.min(n,tot)}
let U_FC={k:null,m:new Map()};
function uFans(g){if(!g||!S||!S.fb)return 0;const fb=S.fb,k=fb.ver+'|'+S.day+'|'+(fb.segs||[]).length;if(U_FC.k!==k||U_FC.s!==S)U_FC={k,s:S,m:new Map()};const set=new Set(uActive(g).map(m=>m.id)),ck=g.id+':'+[...set].sort().join(',');
 if(U_FC.m.has(ck))return U_FC.m.get(ck);let n=0;if(set.size)(fb.segs||[]).forEach(s=>{n+=uSegN(s,set)});n=Math.round(n);U_FC.m.set(ck,n);return n}
if(typeof fdGroupFans=='function'){const f=fdGroupFans;fdGroupFans=function(gid){const g=uOf(gid);return g?uFans(g):f.apply(this,arguments)};if(typeof gsFans=='function')gsFans=function(gid){return fdGroupFans(gid)}}
// demand of a unit / solo release: the company fan count is replaced by the unit's own unique fans while it is computed
function uFansWith(fn){const g=uCur();if(!g||!S)return fn();const F=S.fans,U=uFans(g);S.fans=U;let r;try{r=fn()}finally{const d=(S.fans||0)-U;S.fans=F+(Number.isFinite(d)?d:0)}return r}
{const f=doRelease;doRelease=function(){const args=arguments;return uFansWith(()=>f.apply(this,args))}}
if(typeof seEst=='function'){const f=seEst;seEst=function(){const args=arguments;return uFansWith(()=>f.apply(this,args))}}
// fans won by a unit / solo activity go to its members (a fan who already supports one of them is not a new person)
{const f=fbAcquire;fbAcquire=function(n,o){o=o||{};const g=uCur();if(!g||o.mid!=null||o.gid!=null||o._u)return f.apply(this,arguments);const M=uActive(g);if(!M.length)return;n=Math.round(n);if(!(n>0))return;
 const w=M.map(m=>Math.max(1,+m.pop||1)),t=w.reduce((a,b)=>a+b,0);let left=n;M.forEach((m,i)=>{const v=i==M.length-1?left:Math.round(n*w[i]/t);left-=v;if(v>0)f.call(this,v,{...o,mid:m.id,_u:1})})}}
// ---- eligibility: inside a unit only its roster (active, not on leave) takes part; a solo artist sings alone -----------------
{const f=gsElig;gsElig=function(o){const g=uCur();if(!g)return f.apply(this,arguments);return uActive(g)}}
// no Senbatsu reactions / position records for unit or solo releases
{const f=wlReact;wlReact=function(p){if(uCur())return[];return f.apply(this,arguments)}}
// no theater, captain or trainee stage for a unit context
{const f=thKeys;thKeys=function(){return f.apply(this,arguments).filter(K=>!uOf(K.gid))}}
if(typeof capSlots=='function'){const f=capSlots;capSlots=function(){return f.apply(this,arguments).filter(x=>!uIs(x.g))}}
// releases: only an active unit with members / an active solo artist; the solo artist is the center
{const f=startSingle;startSingle=function(){const g=uCur();if(g){if(!uCanRelease(g))return toast(g.type=='solo'?UT(`${g.name} is no longer active as a Solo Artist.`,`${g.name} ไม่ได้เป็นศิลปินเดี่ยวแล้ว`):uState(g)=='disbanded'?UT(`${g.name} was disbanded: no new releases.`,`${g.name} ยุบแล้ว ปล่อยผลงานใหม่ไม่ได้`):UT(`${g.name} has no active members.`,`${g.name} ไม่มีเมมเบอร์ที่ทำงานได้`),'err');
  if(g.type=='solo'){try{const mid=g.solo.mid;usedSongs(S.pj).forEach(i=>{const o=S.songs[i];if(o&&(o.slots||[]).includes(mid))o.center=mid})}catch(e){}}}
 return f.apply(this,arguments)}}
{const f=gsSelect;gsSelect=function(gid){const g=uOf(+gid);if(g&&uState(g)=='disbanded'&&!ui.uView)return toast(UT(`${g.name} was disbanded.`,`${g.name} ยุบแล้ว`),'err');return f.apply(this,arguments)}}
// ---- after a release of a unit: its log --------------------------------------------------------------------------------------
{const f=doRelease;doRelease=function(){const g=uCur(),p=S.pj,t=p&&p.title;const r=f.apply(this,arguments);try{if(g&&p&&p.status=='released'){uLog(g,UT(`Released “${t}”.`,`ปล่อยผลงาน “${t}”`));const x=(S.singles||[]).at(-1);if(!g.debut1&&x&&typeof grpDebut=='function'){try{grpDebut(g,x,1)}catch(e){}if(!g.debut1)g.debut1={day:x.relDay??S.day,rid:x.rid,title:x.title};uLog(g,UT('Debut.','เดบิวต์'))}}}catch(e){}return r}}
// ---- leaving the company: out of every roster (history kept); the unit stays Active ---------------------------------------
{const f=ctLeave;ctLeave=function(m){const r=f.apply(this,arguments);try{uDepart(m)}catch(e){console.error(e)}return r}}
function uDepart(m){if(!m||!S)return;(S.groups||[]).forEach(g=>{if(g.type=='unit'&&g.unit){const U=g.unit;if(!U.roster.includes(m.id))return;U.roster=U.roster.filter(x=>x!=m.id);(U.hist||[]).forEach(h=>{if(h.mid==m.id&&h.to==null)h.to=S.day});
  if(U.leader==m.id){U.leader=null;const nx=uActive(g).sort((a,b)=>b.pop-a.pop)[0];if(nx){U.leader=nx.id;U.lh=U.lh||[];U.lh.push({mid:nx.id,d:S.day})}}uLog(g,UT(`${m.name} left the company and the unit.`,`${m.name} ออกจากบริษัทและยูนิต`))}
 if(g.type=='solo'&&g.solo&&g.solo.mid==m.id&&!g.solo.end){g.solo.end=S.day;uLog(g,UT(`${m.name} left the company; the solo activity ended.`,`${m.name} ออกจากบริษัท กิจกรรมเดี่ยวสิ้นสุด`))}})}
// ---- awards: release categories for everyone; group categories filtered -------------------------------------------------------
(function(){if(typeof AW_CAT=='undefined')return;const MAINONLY=['idolg','sis','fandom'];AW_CAT.forEach(c=>{if(c[2]!='group')return;const fn=c[3];c[3]=function(){const L=fn.apply(this,arguments)||[];return L.filter(x=>{const g=x&&x.gid!=null?grp(x.gid):null;if(!g)return true;if(g.type=='solo')return false;if(g.type=='unit')return!MAINONLY.includes(c[0]);return true})}})})();
if(typeof awElig=='function'){const f=awElig;awElig=function(x){const g=x&&x.gid!=null?uOf(x.gid):null;if(g&&x.k!='r'&&x.k!='song'&&x.k!='cc'&&x.k!='duo')return uActive(g).map(m=>m.id);return f.apply(this,arguments)}}
// ---- chart artist: the unit's own artist entry with its own fans; identity shown on chart rows --------------------------------
{const f=indPlayerArtist;indPlayerArtist=function(){const a=f.apply(this,arguments);try{const g=uCur();if(g&&a){a.fans=uFans(g);a.ut=g.type}else if(a){const gg=grp(gsAg());a.ut=gg?gg.type:'main'}}catch(e){}return a}}
function uArtTag(a){if(!a||a.cat!='player')return'';const g=grp(+String(a.id).slice(1));const t=g?g.type:a.ut;const L={main:UT('Main','วงหลัก'),sister:UT('Sister','วงน้อง'),unit:UT('Unit','ยูนิต'),solo:UT('Solo','โซโล่')}[t||'main'];return L?` <i class="utag u-${t||'main'}">${L}</i>`:''}
['seRowHtml','indRow'].forEach(n=>{const f=window[n];if(typeof f!='function')return;window[n]=function(){const h=f.apply(this,arguments);try{const id=n=='seRowHtml'?arguments[1]:arguments[2],r=S.ind.R[id],a=r&&S.ind.A[r.aid];if(!a||a.cat!='player')return h;const nm=esc(a.nm||''),i=h.indexOf(nm+'</small>');if(i<0)return h;return h.slice(0,i+nm.length)+uArtTag(a)+h.slice(i+nm.length)}catch(e){return h}}});
// ---- views of the group-only systems are closed inside a unit / solo context ----------------------------------------------------
const U_BLOCK_SEC=['events','theater','election','audition','xevents','recording','bloom','drama','groups'];
const U_BLOCK_V=['ge','janken','rh','gscompany','gstransfer','gskn','concert','orgrs','orgsh','orghr'];
function uBlockHtml(){const g=uCur();return`<div class="c ublk"><h2 class="ht">${esc(g.name)} · ${uTypeName(g)}</h2><p>${UT(`This page belongs to the groups' own activities. You are producing for ${g.name} now.`,`หน้านี้เป็นกิจกรรมของวง ตอนนี้กำลังผลิตผลงานให้ ${g.name}`)}</p><div class="row"><button class="b p" onclick="uBack()">${UT('Back to the Main Group','กลับไปวงหลัก')}</button><button class="b s" onclick="goView('music')">${UT('Production','การผลิต')}</button><button class="b s" onclick="uOpen(${g.id})">${UT('Profile','โปรไฟล์')}</button></div></div>`}
function uInstallBlocks(){const names=new Set(U_BLOCK_V);SECS.forEach(s=>{if(!U_BLOCK_SEC.includes(s.k))return;s.v.forEach(x=>names.add(x[0]));(s.hid||[]).forEach(v=>names.add(v))});
 names.forEach(n=>{const f=V[n];if(typeof f!='function'||f._ub)return;const w=function(){if(uCur())return uBlockHtml();return f.apply(this,arguments)};w._ub=1;V[n]=w})}
// group lists / switchers: real groups only
['chrome'].forEach(n=>{const f=window[n];window[n]=function(){const args=arguments;let h=uScope(()=>f.apply(this,args),true);try{const g=uCur();if(g){const bar=`<div class="ubar"><span>${UT('Producing for','กำลังผลิตให้')} <b>${esc(g.name)}</b> · ${uTypeName(g)}</span><button class="b s" onclick="uOpen(${g.id})">${UT('Profile','โปรไฟล์')}</button><button class="b s p" onclick="uBack()">${UT('Back to the Main Group','กลับไปวงหลัก')}</button></div>`;const i=h.indexOf('<main'),j=i>=0?h.indexOf('>',i):-1;h=j>=0?h.slice(0,j+1)+bar+h.slice(j+1):bar+h}}catch(e){}return h}});
function uScopeV(n){const f=V[n];if(typeof f!='function'||f._us)return;const w=function(){const args=arguments;return uScope(()=>f.apply(this,args),true)};w._us=1;w._ub=f._ub;V[n]=w}
['groups','gscompany','gsroster','gstransfer','gskn','gsfin','gsrep','gscal','audition','janken','orgrs','orgsh','orghr','dash','manage','members','training','skills','drama','contracts','ctc'].forEach(uScopeV);
if(typeof gsShares=='function'){const f=gsShares;gsShares=function(){const args=arguments;return uScope(()=>f.apply(this,args),false)}}
function uBack(){const m=gsMain();ui.uView=1;try{gsSelect(m.id)}finally{ui.uView=0}}
function uProduce(gid){const g=uOf(gid);if(!g)return;if(!uCanRelease(g)&&uState(g)!='active')return toast(UT('No new releases for this artist.','ศิลปินนี้ปล่อยผลงานใหม่ไม่ได้'),'err');if(gsAg()!=g.id){ui.uView=1;try{gsSelect(g.id)}finally{ui.uView=0}}view='music';render()}
// ---- create / edit ------------------------------------------------------------------------------------------------------------
function uNewForm(){return ui.unew=ui.unew||{name:'',kind:'perm',sym:U_SYM[0],color:U_COL[uUnits().length%U_COL.length],concept:'',desc:'',debut:'',mem:[],leader:null,q:'',gf:'all'}}
function uSet(k,v){const F=uNewForm();F[k]=v;if(k=='mem'&&!F.mem.includes(F.leader))F.leader=F.mem[0]||null;render()}
function uTogMem(id){const F=uNewForm(),m=get(id);if(!uOkMem(m))return toast(UT('Trainees and inactive members cannot join a unit.','เด็กฝึกและเมมเบอร์ที่ไม่ได้ทำงานเข้าร่วมยูนิตไม่ได้'),'err');if(F.mem.includes(id))F.mem=F.mem.filter(x=>x!=id);else{if(F.mem.length>=12)return toast(UT('A unit has at most 12 members.','ยูนิตมีได้สูงสุด 12 คน'),'err');F.mem.push(id)}if(!F.mem.includes(F.leader))F.leader=F.mem[0]||null;render()}
const uDayOf=s=>{if(!s)return null;try{const n=dateDay(new Date(s+'T00:00:00'));return Number.isFinite(n)?n:null}catch(e){return null}};
const uDateStr=d=>{try{const x=dayDate(d);return`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`}catch(e){return''}};
function uCreate(){const F=uNewForm(),name=String(F.name||'').trim();if(!name)return toast(UT('Enter the unit name.','ใส่ชื่อยูนิต'),'err');
 if(S.groups.some(g=>g.name.toLowerCase()==name.toLowerCase()))return toast(UT('That name is already used.','ชื่อนี้ถูกใช้แล้ว'),'err');
 const mem=F.mem.filter(id=>uOkMem(get(id)));if(mem.length<2||mem.length>12)return toast(UT('A unit needs 2 to 12 members.','ยูนิตต้องมีเมมเบอร์ 2–12 คน'),'err');
 const leader=mem.includes(F.leader)?F.leader:mem[0],deb=uDayOf(F.debut);
 const g={id:++S.gid,name,short:name.replace(/[^A-Za-z0-9]/g,'').slice(0,5).toUpperCase()||name.slice(0,3),color:F.color,teams:[],cap:null,tl:{},active:true,founded:S.day,formed:S.day,debutDay:null,type:'unit',logo:{sym:F.sym},desc:String(F.desc||''),hq:'',
  unit:{kind:F.kind,concept:String(F.concept||''),debut:deb,leader,lh:[{mid:leader,d:S.day}],roster:mem.slice(),hist:mem.map(mid=>({mid,from:S.day,to:null})),st:'active',log:[]}};
 S.groups.push(g);g.ctx=gsDefCtx(g);try{gsInit(g,S.groups.length-1)}catch(e){}uLog(g,UT(`${uTypeName(g)} formed with ${mem.length} members.`,`ก่อตั้ง${uTypeName(g)} สมาชิก ${mem.length} คน`));
 mem.forEach(id=>{const m=get(id);try{hev(m,{t:'unit_join',gid:g.id,gname:g.name,txt:`Joined the unit ${g.name}`})}catch(e){}});ui.unew=null;ui.uid=g.id;view='unit';toast(UT(`${name} was formed.`,`ก่อตั้ง ${name} แล้ว`));render()}
function uEdit(gid,k,v){const g=uOf(gid);if(!g)return;const U=g.unit;if(k=='name'){v=String(v||'').trim();if(!v)return;if(S.groups.some(x=>x!==g&&x.name.toLowerCase()==v.toLowerCase()))return toast(UT('That name is already used.','ชื่อนี้ถูกใช้แล้ว'),'err');g.name=v}
 else if(k=='desc')g.desc=String(v||'');else if(k=='sym')g.logo={...(g.logo||{}),sym:v};else if(k=='color')g.color=v;else if(U&&k=='concept')U.concept=String(v||'');else if(U&&k=='kind'&&U_KIND[v])U.kind=v;else if(U&&k=='debut')U.debut=uDayOf(v);render()}
// ---- member management -------------------------------------------------------------------------------------------------------
function uAddMem(gid,id){const g=uOf(gid),m=get(id);if(!g||g.type!='unit')return;const U=g.unit;if(U.st=='disbanded')return toast(UT('The unit was disbanded.','ยูนิตยุบแล้ว'),'err');if(!uOkMem(m))return toast(UT('Trainees and inactive members cannot join a unit.','เด็กฝึกและเมมเบอร์ที่ไม่ได้ทำงานเข้าร่วมยูนิตไม่ได้'),'err');
 if(U.roster.includes(id))return;if(U.roster.length>=12)return toast(UT('A unit has at most 12 members.','ยูนิตมีได้สูงสุด 12 คน'),'err');U.roster.push(id);U.hist.push({mid:id,from:S.day,to:null});if(U.leader==null)U.leader=id;uLog(g,UT(`${m.name} joined.`,`${m.name} เข้าร่วม`));try{hev(m,{t:'unit_join',gid:g.id,gname:g.name,txt:`Joined the unit ${g.name}`})}catch(e){}render()}
function uRemMem(gid,id){const g=uOf(gid),m=get(id)||{name:'#'+id};if(!g||g.type!='unit')return;const U=g.unit;if(U.st=='disbanded')return;if(!U.roster.includes(id))return;if(uActive(g).length<=2&&uOkMem(get(id)))return toast(UT('A unit keeps at least 2 members (members who leave the company are removed automatically).','ยูนิตต้องมีอย่างน้อย 2 คน (เมมเบอร์ที่ออกจากบริษัทจะถูกนำออกอัตโนมัติ)'),'err');
 ask(UT(`Remove ${m.name} from ${g.name}? Her past releases stay in the unit's history.`,`นำ ${m.name} ออกจาก ${g.name}? ผลงานที่ผ่านมายังอยู่ในประวัติยูนิต`),()=>{U.roster=U.roster.filter(x=>x!=id);U.hist.forEach(h=>{if(h.mid==id&&h.to==null)h.to=S.day});if(U.leader==id){U.leader=U.roster[0]||null;if(U.leader!=null)U.lh.push({mid:U.leader,d:S.day})}uLog(g,UT(`${m.name} left the unit.`,`${m.name} ออกจากยูนิต`));try{hev(m,{t:'unit_leave',gid:g.id,gname:g.name,txt:`Left the unit ${g.name}`})}catch(e){}ui.mod=null;render()},UT('Remove','นำออก'))}
function uSetLeader(gid,id){const g=uOf(gid);if(!g||g.type!='unit')return;const U=g.unit;if(!U.roster.includes(+id))return;if(U.leader==+id)return;U.leader=+id;(U.lh=U.lh||[]).push({mid:+id,d:S.day});uLog(g,UT(`New leader: ${(get(+id)||{}).name}.`,`ลีดเดอร์ใหม่: ${(get(+id)||{}).name}`));render()}
function uDisband(gid){const g=uOf(gid);if(!g||g.type!='unit'||g.unit.st=='disbanded')return;const p=gsCtx(g.id,'pj');if(p&&p.status=='producing')return toast(UT('A release of this unit is in production. Wait for its release first.','ยูนิตนี้มีผลงานที่กำลังผลิตอยู่ รอให้ปล่อยก่อน'),'err');
 ask(UT(`Disband ${g.name}? Its discography and history are kept, but it can never release again.`,`ยุบ ${g.name}? ผลงานและประวัติยังอยู่ แต่จะปล่อยผลงานใหม่ไม่ได้อีก`),()=>{g.unit.st='disbanded';g.unit.disDay=S.day;g.active=false;g.unit.hist.forEach(h=>{if(h.to==null)h.to=S.day});uLog(g,UT('Disbanded.','ยุบยูนิต'));if(gsAg()==g.id)uBack();ui.mod=null;toast(UT(`${g.name} was disbanded.`,`ยุบ ${g.name} แล้ว`));render()},UT('Disband','ยุบ'))}
// ---- Solo Debut -----------------------------------------------------------------------------------------------------------------
const uSoloOf=mid=>uSolos().find(g=>g.solo&&g.solo.mid==mid&&!g.solo.end);
function uSoloDebut(mid){mid=+mid;const m=get(mid);if(!uOkMem(m))return toast(UT('Only active members (not Trainees) can debut solo.','เดบิวต์เดี่ยวได้เฉพาะเมมเบอร์ที่ทำงานอยู่ (ไม่ใช่เด็กฝึก)'),'err');if(uSoloOf(mid))return toast(UT(`${m.name} is already a Solo Artist.`,`${m.name} เป็นศิลปินเดี่ยวอยู่แล้ว`),'err');
 const F=ui.usolo||{},name=String(F.name||m.name).trim()||m.name;if(S.groups.some(g=>g.name.toLowerCase()==name.toLowerCase()))return toast(UT('That name is already used.','ชื่อนี้ถูกใช้แล้ว'),'err');
 const g={id:++S.gid,name,short:name.replace(/[^A-Za-z0-9]/g,'').slice(0,5).toUpperCase()||name.slice(0,3),color:F.color||bgOf(m)||U_COL[0],teams:[],cap:null,tl:{},active:true,founded:S.day,formed:S.day,debutDay:null,type:'solo',logo:{sym:F.sym||'✦'},desc:String(F.desc||''),hq:'',solo:{mid,debut:S.day,concept:String(F.concept||''),log:[]}};
 S.groups.push(g);g.ctx=gsDefCtx(g);try{gsInit(g,S.groups.length-1)}catch(e){}uLog(g,UT(`${m.name} started her solo career.`,`${m.name} เริ่มกิจกรรมเดี่ยว`));try{hev(m,{t:'solo_debut',gid:g.id,gname:g.name,txt:`Solo debut as ${g.name}`})}catch(e){}
 ui.usolo=null;ui.uid=g.id;view='unit';toast(UT(`${m.name} is now a Solo Artist (${name}). She stays in her group, team and units.`,`${m.name} เป็นศิลปินเดี่ยว (${name}) แล้ว ยังอยู่ในวง ทีม และยูนิตเดิม`));render()}
// ---- migrate (older saves have no units; nothing to change) / repair rosters --------------------------------------------------
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{(S.groups||[]).forEach(g=>{if(g.type=='unit'){g.unit=g.unit||{kind:'perm',roster:[],hist:[],st:'active',log:[]};const U=g.unit;U.roster=(U.roster||[]).filter(id=>uLive(get(id)));U.hist=U.hist||[];U.log=U.log||[];U.lh=U.lh||[];if(U.leader!=null&&!U.roster.includes(U.leader))U.leader=U.roster[0]??null;if(!g.ctx&&g.id!=S.ag)g.ctx=gsDefCtx(g)}
  if(g.type=='solo'){g.solo=g.solo||{};g.solo.log=g.solo.log||[];if(!g.solo.end&&!uLive(get(g.solo.mid)))g.solo.end=S.day;if(!g.ctx&&g.id!=S.ag)g.ctx=gsDefCtx(g)}})}catch(e){console.error(e)}return r}}
// ---- data for the pages ------------------------------------------------------------------------------------------------------
function uDisco(g){const sg=(gsCtx(g.id,'singles')||[]).slice(),al=(gsCtx(g.id,'albums')||[]).slice(),so=gsCtx(g.id,'songs')||{};return{sg,al,so,cd:sg.reduce((a,x)=>a+(+x.sales||0),0)+al.reduce((a,x)=>a+(+x.sales||0),0),mv:Object.values(so).filter(o=>o&&o.mv&&o.mv.v>0)}}
function uAwards(g){const L=[];try{const A=awS();Object.values(A.years||{}).forEach(Y=>{Object.entries(Y.win||{}).forEach(([k,w])=>{if(!w)return;let mine=w.gid==g.id;if(!mine&&w.k=='r'){const r=S.ind&&S.ind.R[w.id];mine=!!(r&&r.aid=='P'+g.id)}if(mine){const c=AW_CAT.find(c=>c[0]==k);L.push({y:Y.y,cat:c?c[1]:k,nm:w.nm})}})})}catch(e){}return L}
function uPeak(g){let best=null;try{const I=S.ind;Object.values(I.R||{}).forEach(r=>{if(r.aid!='P'+g.id)return;const h=I.H[(r.k=='a'?'ca':'cs')+':'+r.id];if(h&&(best==null||h.pk<best))best=h.pk})}catch(e){}return best}
// ---- pages ---------------------------------------------------------------------------------------------------------------------
const uLogo=(g,sz)=>typeof gsLogo=='function'?gsLogo(g,sz):'';
const uSt=g=>{const s=uState(g);return`<span class="tag ust-${s}">${s=='active'?UT('Active','ดำเนินการอยู่'):s=='disbanded'?UT('Disbanded','ยุบแล้ว'):UT('Ended','สิ้นสุด')}</span>`};
const uFace=(m,sz=44)=>m?`<span class="uface" onclick="mpOpen(${m.id})" title="${esc(m.name)}">${ptc(m,sz)}<small>${esc(m.name)}</small></span>`:'';
function uCardHtml(g){const M=uActive(g),D=uDisco(g),U=g.unit,ld=U&&get(U.leader);return`<div class="c ucard" style="--gc:${g.color}" onclick="uOpen(${g.id})"><div class="row">${uLogo(g,40)}<div style="flex:1"><b>${esc(g.name)}</b><div class="st">${uTypeName(g)} · ${uSt(g)}</div></div></div>
 <div class="ufaces">${M.slice(0,12).map(m=>ptc(m,34)).join('')}${!M.length?`<span class="st">${UT('No members','ไม่มีเมมเบอร์')}</span>`:''}</div>
 <div class="st">${g.type=='unit'?`${UT('Leader','ลีดเดอร์')}: ${ld?esc(ld.name):'—'} · `:''}${D.sg.length} ${UT('single(s)','ซิงเกิล')} · ${D.al.length} ${UT('album(s)','อัลบั้ม')} · ${D.cd.toLocaleString()} CD</div></div>`}
function uOpen(gid){ui.uid=+gid;ui.utab=ui.utab||'over';view='unit';render();try{window.scrollTo(0,0)}catch(e){}}
// Unit Overview + Create
V.units=function(){const L=uUnits(),act=L.filter(g=>uState(g)=='active'),dis=L.filter(g=>uState(g)!='active');const tab=ui.unt||'list';
 const head=`<h2 class="ht">${UT('Units','ยูนิต')}</h2><div class="row gstabs"><button class="tabb ${tab=='list'?'on':''}" onclick="ui.unt='list';render()">${UT('Unit Overview','ภาพรวมยูนิต')}</button><button class="tabb ${tab=='new'?'on':''}" onclick="ui.unt='new';render()">${UT('Create Unit','สร้างยูนิต')}</button></div>`;
 if(tab=='new')return head+uNewHtml();
 return head+`<div class="c"><p class="st">${UT('Units are formed from members of any team or sister group of the company (2–12 members, no Trainees). A member keeps her group and team and can be in several units. Their releases are separate from the groups\' singles and Senbatsu records.','ยูนิตรวมเมมเบอร์จากทุกทีมและทุกวงในบริษัท (2–12 คน ไม่รวมเด็กฝึก) เมมเบอร์ยังอยู่ในวงและทีมเดิม และอยู่ได้หลายยูนิต ผลงานยูนิตแยกจากซิงเกิลของวงและสถิติเซมบัตสึ')}</p>
 <div class="fbkv">${[[UT('Active units','ยูนิตที่ดำเนินการ'),act.length],[UT('Disbanded','ยุบแล้ว'),dis.length],[UT('Unit releases','ผลงานยูนิต'),L.reduce((a,g)=>a+uDisco(g).sg.length+uDisco(g).al.length,0)]].map(([a,b])=>`<div><small>${a}</small><b>${b}</b></div>`).join('')}</div>
 <button class="b p" onclick="ui.unt='new';render()">${UT('Create Unit','สร้างยูนิต')}</button></div>
 ${act.length?`<div class="ugrid">${act.map(uCardHtml).join('')}</div>`:`<div class="c"><p class="st">${UT('No unit yet.','ยังไม่มียูนิต')}</p></div>`}
 ${dis.length?`<div class="c"><h3>${UT('Disbanded units','ยูนิตที่ยุบแล้ว')}</h3></div><div class="ugrid">${dis.map(uCardHtml).join('')}</div>`:''}`};
function uPickList(sel,onTog,opt){opt=opt||{};const F=opt.f||{q:'',gf:'all'},q=(F.q||'').toLowerCase(),gid=F.gf;
 let M=S.members.filter(uOkMem).filter(m=>(!q||m.name.toLowerCase().includes(q))&&(gid=='all'||String(gsGid(m))==String(gid)));M.sort((a,b)=>(sel.includes(b.id)-sel.includes(a.id))||b.pop-a.pop);
 const G=S.groups.filter(g=>!uIs(g)&&!g.dis);
 return`<div class="row"><input placeholder="${UT('Search name','ค้นหาชื่อ')}" value="${esc(F.q||'')}" onchange="${opt.path}.q=this.value;render()"><select onchange="${opt.path}.gf=this.value;render()"><option value="all">${UT('All groups','ทุกวง')}</option>${G.map(g=>`<option value="${g.id}" ${String(gid)==String(g.id)?'selected':''}>${esc(g.name)}</option>`).join('')}</select></div>
 <div class="upick">${M.map(m=>{const on=sel.includes(m.id),t=teamOf(m),g=grp(gsGid(m));return`<button class="upk ${on?'on':''}" onclick="${onTog}(${m.id})">${ptc(m,48)}<b>${esc(m.name)}</b><small>${esc(g?gsShort(g):'')}${t?' · '+esc(t.name):''}</small></button>`}).join('')}</div>`}
function uNewHtml(){const F=uNewForm(),sel=F.mem.map(get).filter(Boolean);
 return`<div class="c uform"><h3>${UT('Create Unit','สร้างยูนิต')}</h3><div class="gsform">
 <label>${UT('Unit name','ชื่อยูนิต')}<input value="${esc(F.name)}" onchange="ui.unew.name=this.value"></label>
 <label>${UT('Unit type','ประเภทยูนิต')}<select onchange="uSet('kind',this.value)">${Object.entries(U_KIND).map(([k,n])=>`<option value="${k}" ${F.kind==k?'selected':''}>${UT(...n)}</option>`).join('')}</select></label>
 <label>${UT('Concept','คอนเซปต์')}<input value="${esc(F.concept)}" onchange="ui.unew.concept=this.value"></label>
 <label>${UT('Debut date (planned)','วันเดบิวต์ (วางแผน)')}<input type="date" value="${esc(F.debut||'')}" min="${uDateStr(S.day)}" onchange="ui.unew.debut=this.value"></label>
 <label>${UT('Description','คำอธิบาย')}<textarea onchange="ui.unew.desc=this.value">${esc(F.desc)}</textarea></label>
 <div><small>${UT('Logo','โลโก้')}</small><div class="row">${U_SYM.map(s=>`<button class="b s ${F.sym==s?'p':''}" onclick="uSet('sym','${s}')">${s}</button>`).join('')}</div><div class="row">${U_COL.map(c=>`<button class="ucol ${F.color==c?'on':''}" style="background:${c}" onclick="uSet('color','${c}')" aria-label="${c}"></button>`).join('')}</div><div class="row">${uLogo({name:F.name||'?',color:F.color,logo:{sym:F.sym}},48)}</div></div>
 </div></div>
 <div class="c"><h3>${UT('Members','เมมเบอร์')} (${sel.length}/12)</h3><p class="st">${UT('2–12 members from any team or sister group. Trainees cannot join.','2–12 คนจากทุกทีมหรือวงน้อง เด็กฝึกเข้าร่วมไม่ได้')}</p>
 ${sel.length?`<div class="row">${sel.map(m=>`<label class="uldr"><input type="radio" name="uld" ${F.leader==m.id?'checked':''} onchange="ui.unew.leader=${m.id};render()"> ${ptc(m,30)} ${esc(m.name)} ${F.leader==m.id?`<i class="tag">${UT('Leader','ลีดเดอร์')}</i>`:''}</label>`).join('')}</div>`:''}
 ${uPickList(F.mem,'uTogMem',{f:F,path:'ui.unew'})}</div>
 <div class="c row"><button class="b p" onclick="uCreate()" ${sel.length<2?'disabled':''}>${UT('Create Unit','สร้างยูนิต')}</button><span class="st">${sel.length<2?UT('Choose at least 2 members.','เลือกอย่างน้อย 2 คน'):''}</span></div>`}
// Unit / Solo profile (dashboard, discography, members, production, finances, activities)
V.unit=function(){const g=uOf(ui.uid);if(!g)return V.units();const solo=g.type=='solo',U=g.unit,D=uDisco(g),M=uActive(g),st=uState(g),tab=ui.utab||'over',p=gsCtx(g.id,'pj'),F=typeof gsFinOf=='function'?gsFinOf(g.id):{inc:0,exp:0,net:0,T:[]};
 const T=(k,n)=>`<button class="tabb ${tab==k?'on':''}" onclick="ui.utab='${k}';render()">${n}</button>`;
 const back=`<button class="b s" onclick="goView('${solo?'soloart':'units'}')">${solo?UT('All Solo Artists','ศิลปินเดี่ยวทั้งหมด'):UT('All Units','ยูนิตทั้งหมด')}</button>`;
 let h=`<div class="row">${back}</div><div class="c uhead" style="--gc:${g.color}"><div class="row">${uLogo(g,64)}<div style="flex:1"><h2 class="ht" style="margin:0">${esc(g.name)}</h2><div class="st">${uTypeName(g)} · ${uSt(g)}</div></div>
 ${st=='active'?`<button class="b p" onclick="uProduce(${g.id})">${UT('Production','การผลิต')}</button>`:''}</div></div>
 <div class="row gstabs">${T('over',UT('Overview','ภาพรวม'))}${solo?'':T('mem',UT('Members','เมมเบอร์'))}${T('disco',UT('Discography','ผลงาน'))}${T('fin',UT('Finances','การเงิน'))}${T('act',UT('Activities','กิจกรรม'))}</div>`;
 if(tab=='over'){const ld=U&&get(U.leader),sm=solo&&(get(g.solo.mid)||(S.alumni||[]).find(x=>x.id==g.solo.mid)),aw=uAwards(g),pk=uPeak(g);
  h+=`<div class="c"><div class="fbkv">${[
   ...(solo?[[UT('Artist','ศิลปิน'),sm?esc(sm.name):'—']]:[[UT('Leader','ลีดเดอร์'),ld?esc(ld.name):'—'],[UT('Members','เมมเบอร์'),M.length]]),
   [UT('Concept','คอนเซปต์'),esc((solo?g.solo.concept:U.concept)||'—')],[UT('Formed','ก่อตั้ง'),jd(g.formed??g.founded)],
   [UT('Debut','เดบิวต์'),g.debut1?jd(g.debut1.day):U&&U.debut!=null?UT('planned ','วางแผน ')+jd(U.debut):UT('not yet','ยังไม่เดบิวต์')],
   [UT('Unique fans','แฟนที่ไม่ซ้ำ'),uFans(g).toLocaleString()],[UT('CD sales','ยอดซีดี'),D.cd.toLocaleString()],[UT('Releases','ผลงาน'),D.sg.length+D.al.length],[UT('Best chart peak','อันดับสูงสุด'),pk?'#'+pk:'—'],[UT('Music videos','MV'),D.mv.length],[UT('Awards','รางวัล'),aw.length]].map(([a,b])=>`<div><small>${a}</small><b>${b}</b></div>`).join('')}</div>
   ${g.desc?`<p>${esc(g.desc)}</p>`:''}${p&&p.status=='producing'?`<p class="st">${UT('In production','กำลังผลิต')}: <b>${esc(p.title||'')}</b>${p.releaseDay!=null?` · ${UT('release','วางขาย')} ${jd(p.releaseDay)}`:''}</p>`:''}</div>
   ${solo?(sm?`<div class="c"><div class="row">${uFace(sm,72)}<p class="st">${UT('She keeps her main group, team and units. She is the center of every solo release.','ยังอยู่ในวงหลัก ทีม และยูนิตเดิม และเป็นเซ็นเตอร์ของทุกผลงานเดี่ยว')}</p></div></div>`:''):`<div class="c"><h3>${UT('Members','เมมเบอร์')}</h3><div class="ufaces2">${M.map(m=>uFace(m,56)).join('')||`<span class="st">${UT('No active member. The unit stays active until it is disbanded.','ไม่มีเมมเบอร์ ยูนิตยังคงดำเนินการจนกว่าจะยุบ')}</span>`}</div></div>`}
   ${aw.length?`<div class="c"><h3>${UT('Awards','รางวัล')}</h3><ul class="ms">${aw.map(a=>`<li>${a.y} · <b>${esc(a.cat)}</b> · ${esc(a.nm||'')}</li>`).join('')}</ul></div>`:''}
   ${!solo&&st=='active'?`<div class="c uedit"><h3>${UT('Edit unit','แก้ไขยูนิต')}</h3><div class="gsform"><label>${UT('Name','ชื่อ')}<input value="${esc(g.name)}" onchange="uEdit(${g.id},'name',this.value)"></label><label>${UT('Type','ประเภท')}<select onchange="uEdit(${g.id},'kind',this.value)">${Object.entries(U_KIND).map(([k,n])=>`<option value="${k}" ${U.kind==k?'selected':''}>${UT(...n)}</option>`).join('')}</select></label>
    <label>${UT('Concept','คอนเซปต์')}<input value="${esc(U.concept||'')}" onchange="uEdit(${g.id},'concept',this.value)"></label><label>${UT('Debut date (planned)','วันเดบิวต์ (วางแผน)')}<input type="date" value="${U.debut!=null?uDateStr(U.debut):''}" onchange="uEdit(${g.id},'debut',this.value)" ${g.debut1?'disabled':''}></label><label>${UT('Description','คำอธิบาย')}<textarea onchange="uEdit(${g.id},'desc',this.value)">${esc(g.desc||'')}</textarea></label>
    <div><small>${UT('Logo','โลโก้')}</small><div class="row">${U_SYM.map(s=>`<button class="b s ${(g.logo||{}).sym==s?'p':''}" onclick="uEdit(${g.id},'sym','${s}')">${s}</button>`).join('')}</div><div class="row">${U_COL.map(c=>`<button class="ucol ${g.color==c?'on':''}" style="background:${c}" onclick="uEdit(${g.id},'color','${c}')" aria-label="${c}"></button>`).join('')}</div></div></div>
    <div class="row"><button class="b s warn" onclick="uDisband(${g.id})">${UT('Disband unit','ยุบยูนิต')}</button></div></div>`:''}`}
 if(tab=='mem'&&!solo){const ro=st!='active',past=U.hist.filter(x=>x.to!=null),P=ui.umem=ui.umem||{q:'',gf:'all'};
  h+=`<div class="c"><h3>${UT('Current members','เมมเบอร์ปัจจุบัน')} (${M.length}/12)</h3><div class="umems">${M.map(m=>{const t=teamOf(m),gg=grp(gsGid(m));return`<div class="umem">${ptc(m,52)}<div style="flex:1"><b onclick="mpOpen(${m.id})">${esc(m.name)}</b>${U.leader==m.id?` <i class="tag">${UT('Leader','ลีดเดอร์')}</i>`:''}<div class="st">${esc(gg?gg.name:'')}${t?' · '+esc(t.name):''}</div></div>${ro?'':`${U.leader==m.id?'':`<button class="b s" onclick="uSetLeader(${g.id},${m.id})">${UT('Make leader','ตั้งเป็นลีดเดอร์')}</button>`}<button class="b s warn" onclick="uRemMem(${g.id},${m.id})">${UT('Remove','นำออก')}</button>`}</div>`}).join('')||`<p class="st">${UT('No active member.','ไม่มีเมมเบอร์')}</p>`}</div></div>
  ${ro?'':`<div class="c"><h3>${UT('Add members','เพิ่มเมมเบอร์')}</h3>${uPickList(U.roster,`uAddTog`,{f:P,path:'ui.umem'})}</div>`}
  <div class="c"><h3>${UT('Membership history','ประวัติสมาชิก')}</h3><ul class="ms">${U.hist.slice().sort((a,b)=>a.from-b.from).map(x=>{const m=get(x.mid)||(S.alumni||[]).find(z=>z.id==x.mid)||{name:'#'+x.mid};return`<li><b>${esc(m.name)}</b> · ${jd(x.from)} – ${x.to!=null?jd(x.to):UT('now','ปัจจุบัน')}</li>`}).join('')}</ul>
  ${(U.lh||[]).length?`<h3>${UT('Leaders','ลีดเดอร์')}</h3><ul class="ms">${U.lh.map(x=>`<li>${jd(x.d)} · ${esc((get(x.mid)||(S.alumni||[]).find(z=>z.id==x.mid)||{name:'#'+x.mid}).name)}</li>`).join('')}</ul>`:''}${past.length?'':''}</div>`}
 if(tab=='disco'){const row=(x,al)=>{const o=D.so[x.mainId]||{},ids=al?[...new Set((x.tracks||[]).flatMap(t=>((D.so[t]||{}).slots||[]).filter(Boolean)))]:(o.slots||[]).filter(Boolean),c=get(o.center);
   return`<div class="udisc"><div style="flex:1"><b>${esc(x.title||'')}</b><div class="st">${al?UT('Album','อัลบั้ม'):UT('Single','ซิงเกิล')} · ${x.relDay!=null?jd(x.relDay):x.day!=null?jd(x.day):''}${o.genre?' · '+esc(o.genre):''}${o.concept?' · '+esc(o.concept):''}${al?` · ${(x.tracks||[]).length} ${UT('songs','เพลง')}`:''}</div>
   <div class="st">${(+x.sales||0).toLocaleString()} CD${c?` · ${UT('Center','เซ็นเตอร์')} ${esc(c.name)}`:''}${o.mv&&o.mv.v?` · MV ${(+o.mv.v).toLocaleString()} ${UT('views','วิว')}`:''}</div><div class="ufaces">${ids.map(get).filter(Boolean).map(m=>ptc(m,28)).join('')}</div></div></div>`};
  h+=`<div class="c"><h3>${UT('Singles','ซิงเกิล')} (${D.sg.length})</h3>${D.sg.slice().reverse().map(x=>row(x,0)).join('')||`<p class="st">${UT('No single yet.','ยังไม่มีซิงเกิล')}</p>`}</div>
  <div class="c"><h3>${UT('Albums','อัลบั้ม')} (${D.al.length})</h3>${D.al.slice().reverse().map(x=>row(x,1)).join('')||`<p class="st">${UT('No album yet (up to 10 songs per album).','ยังไม่มีอัลบั้ม (สูงสุด 10 เพลงต่ออัลบั้ม)')}</p>`}</div>`}
 if(tab=='fin'){const last=typeof gsFinOf=='function'?gsFinOf(g.id,S.day-30):F;h+=`<div class="c"><h3>${UT('Finances','การเงิน')}</h3><p class="st">${UT('Paid from and into the one Company Funds account.','จ่ายและรับผ่านบัญชีเงินบริษัทบัญชีเดียว')}</p><div class="fbkv">${[[UT('Revenue','รายรับ'),yen(F.inc)],[UT('Expenses','รายจ่าย'),yen(F.exp)],[UT('Profit / Loss','กำไร / ขาดทุน'),yen(F.net)],[UT('Last 30 days','30 วันล่าสุด'),yen(last.net)]].map(([a,b])=>`<div><small>${a}</small><b>${b}</b></div>`).join('')}</div>
  <ul class="ms">${(F.T||[]).slice(-40).reverse().map(t=>`<li>${jd(t.day)} · ${esc(t.l||t.lbl||t.cat||'')} · <b class="${t.io=='in'?'pos':'neg'}">${t.io=='in'?'+':'-'}${yen(t.amt)}</b></li>`).join('')||`<li class="st">${UT('No transaction yet.','ยังไม่มีรายการ')}</li>`}</ul></div>`}
 if(tab=='act'){const L=(solo?g.solo.log:U.log)||[],cal=(gsCtx(g.id,'cal')||[]).filter(e=>!e.done).sort((a,b)=>a.day-b.day);
  h+=`${cal.length?`<div class="c"><h3>${UT('Upcoming schedule','ตารางที่จะมาถึง')}</h3><ul class="ms">${cal.slice(0,20).map(e=>`<li>${jd(e.day)} · ${esc(e.title||e.type||'')}</li>`).join('')}</ul></div>`:''}<div class="c"><h3>${UT('Activities','กิจกรรม')}</h3><ul class="ms">${L.map(x=>`<li>${jd(x.d)} · ${esc(x.t)}</li>`).join('')||`<li class="st">—</li>`}</ul></div>`}
 return h};
function uAddTog(id){const g=uOf(ui.uid);if(!g)return;if(g.unit.roster.includes(id))return uRemMem(g.id,id);uAddMem(g.id,id)}
// Solo Management + Solo Debut + Solo Discography
V.soloart=function(){const L=uSolos(),tab=ui.sot||'list';const head=`<h2 class="ht">${UT('Solo Artists','ศิลปินเดี่ยว')}</h2><div class="row gstabs"><button class="tabb ${tab=='list'?'on':''}" onclick="ui.sot='list';render()">${UT('Solo Management','จัดการศิลปินเดี่ยว')}</button><button class="tabb ${tab=='new'?'on':''}" onclick="ui.sot='new';render()">${UT('Solo Debut','เดบิวต์เดี่ยว')}</button></div>`;
 if(tab=='new'){const F=ui.usolo=ui.usolo||{mid:null,name:'',concept:'',desc:'',sym:'✦',color:null,q:'',gf:'all'},m=get(F.mid);
  return head+`<div class="c"><p class="st">${UT('Eligible: active members who are not Trainees. She keeps her main group, team and units; a Solo Artist profile and its own discography are created. Solo songs inside a group single stay group releases.','มีสิทธิ์: เมมเบอร์ที่ทำงานอยู่และไม่ใช่เด็กฝึก ยังอยู่ในวงหลัก ทีม และยูนิตเดิม จะสร้างโปรไฟล์ศิลปินเดี่ยวและผลงานแยก เพลงโซโล่ในซิงเกิลของวงยังนับเป็นผลงานวง')}</p></div>
  ${m?`<div class="c uform"><div class="row">${ptc(m,64)}<b>${esc(m.name)}</b><button class="b s" onclick="ui.usolo.mid=null;render()">${UT('Change','เปลี่ยน')}</button></div><div class="gsform"><label>${UT('Artist name','ชื่อศิลปิน')}<input value="${esc(F.name||m.name)}" onchange="ui.usolo.name=this.value"></label><label>${UT('Concept','คอนเซปต์')}<input value="${esc(F.concept)}" onchange="ui.usolo.concept=this.value"></label><label>${UT('Description','คำอธิบาย')}<textarea onchange="ui.usolo.desc=this.value">${esc(F.desc)}</textarea></label>
   <div><small>${UT('Logo','โลโก้')}</small><div class="row">${U_SYM.map(s=>`<button class="b s ${F.sym==s?'p':''}" onclick="ui.usolo.sym='${s}';render()">${s}</button>`).join('')}</div><div class="row">${U_COL.map(c=>`<button class="ucol ${F.color==c?'on':''}" style="background:${c}" onclick="ui.usolo.color='${c}';render()" aria-label="${c}"></button>`).join('')}</div></div></div>
   <div class="row"><button class="b p" onclick="uSoloDebut(${m.id})">${UT('Solo Debut','เดบิวต์เดี่ยว')}</button></div></div>`:
  `<div class="c"><h3>${UT('Choose the member','เลือกเมมเบอร์')}</h3>${uPickList([],'uSoloPick',{f:F,path:'ui.usolo'})}</div>`}`}
 const act=L.filter(g=>uState(g)=='active'),end=L.filter(g=>uState(g)!='active');
 return head+`${act.length?`<div class="ugrid">${act.map(uCardHtml).join('')}</div>`:`<div class="c"><p class="st">${UT('No Solo Artist yet.','ยังไม่มีศิลปินเดี่ยว')}</p><button class="b p" onclick="ui.sot='new';render()">${UT('Solo Debut','เดบิวต์เดี่ยว')}</button></div>`}${end.length?`<div class="c"><h3>${UT('Former Solo Artists','ศิลปินเดี่ยวที่สิ้นสุดแล้ว')}</h3></div><div class="ugrid">${end.map(uCardHtml).join('')}</div>`:''}`};
function uSoloPick(id){const m=get(id);if(uSoloOf(id))return toast(UT(`${m.name} is already a Solo Artist.`,`${m.name} เป็นศิลปินเดี่ยวอยู่แล้ว`),'err');ui.usolo.mid=id;ui.usolo.name=m.name;render()}
// ---- member profile: units, solo, releases --------------------------------------------------------------------------------------
function uProfHtml(m){if(!m)return'';const cur=uUnits().filter(g=>g.unit.roster.includes(m.id)),past=uUnits().filter(g=>!g.unit.roster.includes(m.id)&&g.unit.hist.some(h=>h.mid==m.id)),so=uSolos().filter(g=>g.solo&&g.solo.mid==m.id);if(!cur.length&&!past.length&&!so.length)return'';
 const rel=[];[...cur,...past,...so].forEach(g=>{const D=uDisco(g);D.sg.forEach(x=>{const o=D.so[x.mainId]||{};if((o.slots||[]).includes(m.id)||Object.values(D.so).some(s=>s&&(s.slots||[]).includes(m.id)&&[x.mainId,...(x.coup||[])].includes(s.id)))rel.push({g,x,c:o.center==m.id})});D.al.forEach(x=>{if((x.tracks||[]).some(t=>((D.so[t]||{}).slots||[]).includes(m.id)))rel.push({g,x,al:1})})});
 const chip=g=>`<button class="b s" onclick="uOpen(${g.id})">${esc(g.name)} · ${uTypeName(g)}${g.type=='unit'&&g.unit.leader==m.id&&g.unit.roster.includes(m.id)?' · '+UT('Leader','ลีดเดอร์'):''}${uState(g)!='active'?' · '+(uState(g)=='disbanded'?UT('Disbanded','ยุบแล้ว'):UT('Ended','สิ้นสุด')):''}</button>`;
 return`<div class="c uprof"><h3>${UT('Units & Solo','ยูนิตและโซโล่')}</h3>${cur.length?`<div class="st">${UT('Current units','ยูนิตปัจจุบัน')}</div><div class="row">${cur.map(chip).join('')}</div>`:''}${past.length?`<div class="st">${UT('Former units','ยูนิตที่เคยอยู่')}</div><div class="row">${past.map(chip).join('')}</div>`:''}${so.length?`<div class="st">${UT('Solo Artist','ศิลปินเดี่ยว')}</div><div class="row">${so.map(chip).join('')}</div>`:''}
 ${rel.length?`<ul class="ms">${rel.sort((a,b)=>(b.x.relDay??0)-(a.x.relDay??0)).map(r=>`<li>${r.x.relDay!=null?jd(r.x.relDay):''} · <b>${esc(r.x.title||'')}</b> · ${esc(r.g.name)} (${r.al?UT('Album','อัลบั้ม'):UT('Single','ซิงเกิล')})${r.c?' · '+UT('Center','เซ็นเตอร์'):''}</li>`).join('')}</ul>`:''}</div>`}
{const f=profHtml;profHtml=function(m,cand){let h=f.apply(this,arguments);if(cand||!m||!S||!S.groups.some(uIs))return h;try{const x=uProfHtml(m);if(x){const k=h.indexOf('💞'),i=k>0?h.lastIndexOf('<div class="c',k):-1;if(i>0)h=h.slice(0,i)+x+h.slice(i);else{const j=h.lastIndexOf('</div>');h=j>0?h.slice(0,j)+x+h.slice(j):h+x}}}catch(e){console.error(e)}return h}}
// the music page: no "has no members" card for a unit (its members come from its roster)
function uStripDiv(h,mark){const i=h.indexOf(mark);if(i<0)return h;const s0=h.lastIndexOf('<div',i);let d=0,k=s0;const re=/<\/?div\b/g;re.lastIndex=s0;let mm;while((mm=re.exec(h))){d+=mm[0]=='<div'?1:-1;if(d==0){k=h.indexOf('>',mm.index)+1;break}}return k>s0?h.slice(0,s0)+h.slice(k):h}
{const f=V.music;V.music=function(){const h=f.apply(this,arguments);try{if(uCur())return uStripDiv(h,'class="c gsempty"')}catch(e){}return h}}
// ---- navigation ------------------------------------------------------------------------------------------------------------
(function(){try{const M=SECS.find(s=>s.k=='manage');if(M){if(!M.v.some(x=>x[0]=='units'))M.v.push(['units','Units']);if(!M.v.some(x=>x[0]=='soloart'))M.v.push(['soloart','Solo Artists']);M.hid=[...(M.hid||[]),'unit']}
 if(typeof SUBLOC!='undefined')Object.assign(SUBLOC,{units:'Management Office · Units',soloart:'Management Office · Solo Artists',unit:'Management Office · Unit Profile'});if(typeof SC_VIEW!='undefined'){SC_VIEW.units=SC_VIEW.units||'manage';SC_VIEW.soloart=SC_VIEW.soloart||'manage';SC_VIEW.unit=SC_VIEW.unit||'manage'}
 uInstallBlocks()}catch(e){console.error(e)}})();
