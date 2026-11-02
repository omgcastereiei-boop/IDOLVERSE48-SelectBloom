// =====================================================================================
//  IDOLVERSE48: Select Bloom! — member display, profile outfit, Roadshow planning, audition
//  · Audition: probability settings removed (default recruitment odds are used again;
//    a previous custom setting is kept aside in the save, not deleted).
//  · Configurable member grid columns (3 / 4 / 5) on the Members directory, team member
//    selection and the CD Cover Studio member list; remembered per screen.
//  · On each official single release, every member's profile outfit becomes her Title Track
//    costume (Senbatsu) or the single's Single Costume (Under Girls).
//  · Roadshow planning: Not Planned / Planned / Participated per member for the promoted
//    single, upcoming assignments (location + date), filters and a duplicate warning.
// =====================================================================================

// ---- 1. audition: no probability settings -----------------------------------------------------
(function(){const a=SECS.find(s=>s.k=='audition');a.v=a.v.filter(x=>x[0]!='audset')})();
function auDefaults(){if(!S||!S.cfg)return;['prob','nat'].forEach(k=>{if(S.cfg[k]&&Object.keys(S.cfg[k]).length){S.cfg[k+'Custom']=S.cfg[k+'Custom']||S.cfg[k];S.cfg[k]={}}})}
const _mxAud=V.audition;V.audition=function(){auDefaults();return _mxAud.call(V).replace(/<button class="b s" onclick="view='audset';render\(\)">Probability settings<\/button>/,'')};
const _mxAudSet=V.audset;V.audset=function(){view='audition';return V.audition()};
const _mxManage=V.manage;V.manage=function(){return _mxManage.call(V).replace(/<div class="row"><span class="lbl">Audition odds<\/span><button class="b s" onclick="goView\('audset'\)">Probability settings<\/button><\/div>/,'')};

// ---- 2. member grid columns ----------------------------------------------------------------------
const GCOL_DEF={mem:4,team:4,cover:4};
function gcolGet(k){const u=(UIP.gcol=UIP.gcol||{}),v=u[k]||(S&&S.uiPref&&S.uiPref.gcol&&S.uiPref.gcol[k])||GCOL_DEF[k];return[3,4,5].includes(+v)?+v:GCOL_DEF[k]}
function gcolSet(k,n){n=+n;if(![3,4,5].includes(n))return;UIP.gcol=UIP.gcol||{};UIP.gcol[k]=n;try{localStorage.setItem('iv48ui',JSON.stringify(UIP))}catch(e){}if(S){S.uiPref=S.uiPref||{};S.uiPref.gcol={...(S.uiPref.gcol||{}),[k]:n}}if(ui.mod&&ui.mod.t=='addm'){}render()}
const gcolBar=k=>`<div class="gcolbar" role="group" aria-label="Columns"><span class="st">Columns</span>${[3,4,5].map(n=>`<button class="${gcolGet(k)==n?'on':''}" aria-pressed="${gcolGet(k)==n}" onclick="gcolSet('${k}',${n})">${n}</button>`).join('')}</div>`;
const gcolCls=k=>`gcol gcol-${gcolGet(k)}`;
const _mxMembers=V.members;V.members=function(){const h=_mxMembers.call(V),i=h.indexOf('<div class="g">');if(i<0)return h;return h.slice(0,i)+gcolBar('mem')+`<div class="g ${gcolCls('mem')}">`+h.slice(i+15)};
const _mxAddm=addmHtml;addmHtml=function(){const h=_mxAddm.apply(this,arguments),m=/<div class="g msel"( style="[^"]*")?>/.exec(h);if(!m)return h;return h.slice(0,m.index)+gcolBar('team')+`<div class="g msel ${gcolCls('team')}"${m[1]||''}>`+h.slice(m.index+m[0].length)};
const _mxCover=V.cover;V.cover=function(){const h=_mxCover.call(V),i=h.indexOf('<div class="g rs">');if(i<0)return h;return h.slice(0,i)+gcolBar('cover')+`<div class="g rs ${gcolCls('cover')}">`+h.slice(i+18)};

// ---- 3. profile outfit follows the latest released single ------------------------------------------
function profSync(x){if(!x||!x.mainId)return 0;const mn=S.songs[x.mainId];if(!mn)return 0;const tt=new Set((x.tt&&x.tt.members)||(mn.slots||[]).filter(Boolean)),sc=(x.scz&&x.scz.cdz&&x.scz.cdz.mem)||{},any=Object.values(sc).find(v=>v&&v.own&&v.own.p&&v.ok);let n=0;
 S.members.forEach(m=>{if(m.profCz&&m.profCz.rid==x.rid)return;let p=null,kind;if(tt.has(m.id)){p=czFor(mn,m.id);kind='title'}else{const v=sc[m.id];p=v&&v.own&&v.ok?v.own.p:(any?any.own.p:null);kind='single'}if(!p)return;
  m.czHist=m.czHist||[];if(m.profCz)m.czHist.push(m.profCz);if(m.czHist.length>30)m.czHist.shift();m.profCz={p:czClone(p),title:x.title,rid:x.rid,pk:x.pkey||null,day:x.relDay??x.day??S.day,kind};n++});return n}
const _mxRelease=doRelease;doRelease=function(){const n=S.singles.length;const r=_mxRelease.apply(this,arguments);const x=S.singles[n];if(x&&S.singles.length>n)try{profSync(x)}catch(e){console.error(e)}return r};
const _mxMig=migrate;migrate=function(){const r=_mxMig.apply(this,arguments);try{auDefaults();if(S.uiPref&&S.uiPref.gcol){UIP.gcol={...S.uiPref.gcol,...(UIP.gcol||{})}}const x=typeof latestSingle=='function'?latestSingle():null;if(x)profSync(x)}catch(e){console.error(e)}return r};
// the profile's full-body art wears the profile outfit (face, hair and identity unchanged)
// every portrait and full-body picture of a member wears her profile outfit (face, hair, identity unchanged).
// Pictures that pass an explicit outfit (costume editor, CD covers, event images) are not affected.
const _mxApEff=apEff;apEff=function(m){const a=_mxApEff.apply(this,arguments);if(m&&!m._x&&m.profCz&&m.profCz.p&&m.cosOv==null)return{...a,cd:m.profCz.p};return a};
const _mxFull=CH.full;CH.full=function(m,w,ex,pose=0,of){if(!of&&m){const e=apEff(m);if(e.cd){const a=ap(m);return`<svg class="chf" viewBox="10 -2 80 200" ${w?`width="${w}"`:''} role="img" aria-label="${esc(m.name||'Idol')}" xmlns="http://www.w3.org/2000/svg">${fig(m,{pose,of:e.of,oh:e.oh,ac:a.ac,ex,cd:e.cd})}</svg>`}}return _mxFull.apply(this,arguments)};
// profile outfit card wording
plProfExtra=(f=>function(m){return f(m).replace('<h3>Current Single Costume</h3>',`<h3>Profile outfit</h3><p class="st">${m.profCz&&m.profCz.kind=='title'?'Title Track Senbatsu costume':'Single Costume (Under Girls)'} of the latest released single</p>`)})(plProfExtra);

// ---- 4. Roadshow: Not Planned / Planned / Participated ------------------------------------------------
function rsPlanned(rid){const M=new Map();(S.cal||[]).forEach(e=>{if(e.type!='road'||e.rid!=rid||e.done||e.d1)return;(e.members||[]).forEach(id=>{const L=M.get(id)||[];L.push({id:e.id,loc:e.loc,day:e.day});M.set(id,L)})});M.forEach(L=>L.sort((a,b)=>a.day-b.day));return M}
function rsStatus(rid,id){return rsParted(rid).has(id)?'part':rsPlanned(rid).has(id)?'plan':'none'}
const RS_ST={none:['Not Planned','rsb np'],plan:['Planned','rsb pl'],part:['✔ Participated','rsb pd']};
const rsLocN=id=>(RSL[id]&&RSL[id].n)||id||'?',rsDayLbl=d=>new Date(2026,3,1+d).toLocaleDateString('en-US',{month:'short',day:'numeric'});
function rsStatusHtml(rid,id){const st=rsStatus(rid,id),[t,c]=RS_ST[st],P=rsPlanned(rid).get(id)||[];return`<span class="${c}">${t}</span>${P.length?`<span class="rsplan">${P.map(a=>`📅 ${esc(rsLocN(a.loc))} · ${rsDayLbl(a.day)}`).join('<br>')}</span>`:''}`}
function rsPfOk(rid,id,pf){return!pf||pf=='all'||rsStatus(rid,id)==pf||(pf=='plan'&&rsPlanned(rid).has(id))}
function rsPfBar(rid,E,obj,pf){pf=pf||'all';const c={all:E.length,none:0,plan:0,part:0},PL=rsPlanned(rid),PT=rsParted(rid);E.forEach(id=>{c[rsStatus(rid,id)]++});c.plan=E.filter(id=>PL.has(id)).length;
 return`<div class="row rspf"><span class="st">Show</span><span class="fbseg">${[['all','All Members'],['none','Not Planned'],['plan','Planned'],['part','Participated']].map(([k,n])=>`<button class="${pf==k?'on':''}" onclick="${obj}.pf='${k}';${obj=='ui.rsp'?'render()':'rsSelRefresh()'}">${n} (${c[k]})</button>`).join('')}</span></div><p class="st">Planned = booked for an upcoming Roadshow of this single (not yet held) · Participated = took part in a Roadshow that already happened · “Have not participated” keeps planned members visible.</p>`}
// warn before adding a member who is already booked for another upcoming Roadshow of this single
const _mxTog=rsTogM;rsTogM=function(id){const P=ui.rsp;if(!P||P.sel.includes(id))return _mxTog.apply(this,arguments);const L=rsPlanned(P.rid).get(id)||[];if(!L.length||ui._rsOk)return _mxTog.apply(this,arguments);
 const m=get(id);ask(`${m?m.name:'This member'} is already scheduled for ${L.map(a=>`${rsLocN(a.loc)} (${rsDayLbl(a.day)})`).join(', ')}. Add her to this Roadshow too? Her existing booking stays as it is.`,()=>{ui._rsOk=1;try{_mxTog(id)}finally{ui._rsOk=0}if(ui._rsPick){ui._rsPick=0;ui.mod={t:'html',h:rsSelHtml(),rssel:1}}},'Add anyway')};
// picker: same statuses & filters
rsSelHtml=(f=>function(){const h=f();const P=ui.rsp;if(!P||!h)return h;const x=S.singles.find(s=>s.rid==P.rid);if(!x)return h;const E=rsElig(x);ui.rsf=ui.rsf||{};
 let out=h.replace('<div class="g msel rssel">',rsPfBar(x.rid,E,'ui.rsf',ui.rsf.pf)+'<div class="g msel rssel">');if(ui.rsf.pf&&ui.rsf.pf!='all'){const keep=new Set(E.filter(id=>rsPfOk(x.rid,id,ui.rsf.pf)).map(String));out=out.replace(/<button class="c m[^"]*"[^>]*onclick="rsSelTog\((\d+)\)">[\s\S]*?<\/div><\/button>/g,(s,id)=>keep.has(id)?s:'')}return out.replace('>Not yet participated</button>','>Not planned</button>')})(rsSelHtml);
rsSelSet=(f=>function(k){if(k!='np')return f(k);const P=ui.rsp,x=S.singles.find(s=>s.rid==P.rid);if(!x)return;rsElig(x).filter(id=>rsStatus(x.rid,id)=='none'&&!(P.day!=null&&busy(id,[P.day,P.day+1]).length)).forEach(id=>{if(!P.sel.includes(id))P.sel.push(id)});rsSelRefresh()})(rsSelSet);
rsSelTog=function(id){ui._rsPick=1;rsTogM(id);if(!(ui.mod&&ui.mod.t=='cf')){ui._rsPick=0;rsSelRefresh()}};

// ---- team lists (Group & Team) use the same 3 / 4 / 5 column setting ---------------------------------
GCOL_DEF.grp=3;
const _mxGroups=V.groups;V.groups=function(){let h=_mxGroups.call(V),first=true;h=h.replace(/<div class="g">(?=\s*<div class="c m")/g,()=>{const s=(first?gcolBar('grp'):'')+`<div class="g gcol gteam ${gcolCls('grp')}">`;first=false;return s});return h};

// ---- grades (UR / SR / R / N) are only shown in Auditions ------------------------------------------------
function hideRarity(){if(!S||view=='audition'||(ui.mod&&ui.mod.t=='cprof'))return;const root=document.getElementById('app');if(!root)return;
 root.querySelectorAll('i.rb').forEach(x=>x.remove());
 root.querySelectorAll('.tag[class*="rr"]').forEach(x=>{const t=x.textContent.trim();if(/^(UR|SR|R|N)$/.test(t)||/^(UR|SR|R|N)\s*·/.test(t))x.remove()});
 root.querySelectorAll('select').forEach(s=>{if([...s.options].some(o=>/All rarities/i.test(o.textContent))){const l=s.closest('label');(l||s).style.display='none'}})}
const _mxRender=render;render=function(){if(S&&view!='audition'){if(ui.f)ui.f.rar='all';if(ui.sf)ui.sf.rar='all';if(ui.aa)ui.aa.rar='all'}const r=_mxRender.apply(this,arguments);try{hideRarity()}catch(e){console.error(e)}return r};
