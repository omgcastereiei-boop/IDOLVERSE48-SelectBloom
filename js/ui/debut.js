// =====================================================================================
//  IDOLVERSE48: Select Bloom! — automatic group debut & trainee handshake eligibility
//  · No manual "Debut group": a group officially debuts on the release day of its
//    first single (g.debut1 = {day, rid}); later releases never change it.
//  · Annual anniversary events in the existing calendar (type 'anniv', one per year,
//    ids keyed by group + number, so nothing is duplicated).
//  · Groups section: Official Debut date, time since debut, next anniversary.
//  · Handshake Events: trainees of the performing group take part like other members;
//    every member's handshake participation is kept in her profile.
// =====================================================================================
const DAY0=new Date(2026,3,1);
const dayDate=d=>new Date(2026,3,1+d),dateDay=t=>Math.round((new Date(t.getFullYear(),t.getMonth(),t.getDate())-DAY0)/86400000);
const longDate=d=>dayDate(d).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
const ordN=n=>n+(n%100>=11&&n%100<=13?'th':['th','st','nd','rd'][n%10]||'th');
function sinceYMD(from,to){const a=dayDate(from),b=dayDate(to);let y=b.getFullYear()-a.getFullYear(),m=b.getMonth()-a.getMonth(),d=b.getDate()-a.getDate();if(d<0){m--;d+=new Date(b.getFullYear(),b.getMonth(),0).getDate()}if(m<0){y--;m+=12}return{y,m,d}}
const ymdTxt=({y,m,d})=>[y?`${y} year${y>1?'s':''}`:'',m?`${m} month${m>1?'s':''}`:'',`${d} day${d!=1?'s':''}`].filter(Boolean).join(', ');
const annDay=(g,n)=>{const a=dayDate(g.debut1.day);return dateDay(new Date(a.getFullYear()+n,a.getMonth(),a.getDate()))};

// which group a released single belongs to: the group of most Title Track members
function relGroup(x){const mn=x&&S.songs[x.mainId],cnt={};((mn&&((mn.lib&&mn.lib.members)||mn.slots))||[]).filter(Boolean).forEach(id=>{const m=get(id)||(S.alumni||[]).find(a=>a.id==id);if(m&&m.group!=null)cnt[m.group]=(cnt[m.group]||0)+1});const k=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];return k!=null?+k:(S.groups[0]&&S.groups[0].id)}
function grpDebut(g,x,live){if(!g||g.debut1)return false;const day=x.relDay??x.day??S.day;g.debut1={day,rid:x.rid,title:x.title};g.active=true;if(g.debutDay==null)g.debutDay=day;
 if(live)S.members.filter(m=>m.group==g.id).forEach(m=>hev(m,{t:'debut',gid:g.id,gname:g.name}));annSync(g);return true}
// calendar: the debut day itself + every anniversary up to the next upcoming one
function annSync(g){if(!g||!g.debut1)return;S.cal=S.cal||[];const has=k=>S.cal.some(e=>e.type=='anniv'&&e.key==k);
 const k0=`deb:${g.id}`;if(!has(k0))S.cal.push({id:'e'+(++S.sid),type:'anniv',key:k0,gid:g.id,n:0,day:g.debut1.day,title:`${g.name} — Official Group Debut`,done:S.day>=g.debut1.day});
 for(let n=1;n<200;n++){const day=annDay(g,n),k=`ann:${g.id}:${n}`;if(!has(k))S.cal.push({id:'e'+(++S.sid),type:'anniv',key:k,gid:g.id,n,day,title:`${g.name} — ${ordN(n)} Anniversary`,done:S.day>=day});if(day>S.day)break}}
function annTick(){(S.groups||[]).forEach(g=>{if(!g.debut1)return;annSync(g);(S.cal||[]).forEach(e=>{if(e.type=='anniv'&&e.gid==g.id&&!e.done&&S.day>=e.day){e.done=true;if(e.n>0)toast(`🎉 ${g.name} celebrates its ${ordN(e.n)} anniversary!`)}})})}
function debutMigrate(){(S.groups||[]).forEach(g=>{if(g.debut1){annSync(g);return}const R=S.singles.filter(x=>x.mainId&&relGroup(x)==g.id).sort((a,b)=>(a.relDay??a.day??0)-(b.relDay??b.day??0));if(R.length)grpDebut(g,R[0],false)})}
function nextAnn(g){if(!g.debut1)return null;for(let n=1;n<200;n++){const d=annDay(g,n);if(d>S.day)return{n,day:d}}return null}
function todayAnn(g){if(!g.debut1)return 0;for(let n=1;n<200;n++){const d=annDay(g,n);if(d==S.day)return n;if(d>S.day)return 0}return 0}
function grpDebTag(g){return g&&g.debut1?`<span class="tag rrSR">Debuted ${dayDate(g.debut1.day).toLocaleDateString('en-US',{month:'short',year:'numeric'})}</span>`:'<span class="tag warn">Not Yet Debuted</span>'}
function grpDebCard(g){if(!g)return'';if(!g.debut1)return`<div class="c gdeb"><b>Not Yet Debuted</b><div class="st">The release day of ${esc(g.name)}'s first single becomes its official debut date. No separate debut step is needed — start producing a single whenever you are ready.</div></div>`;
 const na=nextAnn(g),ta=todayAnn(g);return`<div class="c gdeb">${ta?`<div class="gann">🎉 ${ordN(ta)} Anniversary today!</div>`:''}<div class="gdebk"><div><small>Official Debut</small><b>${longDate(g.debut1.day)}</b><span class="st">with “${esc(g.debut1.title||'')}”</span></div><div><small>Since debut</small><b>${ymdTxt(sinceYMD(g.debut1.day,S.day))}</b></div>${na?`<div><small>Next anniversary</small><b>${ordN(na.n)} · ${longDate(na.day)}</b></div>`:''}</div></div>`}

// ---- hooks ---------------------------------------------------------------------------------------
const _dbRel=doRelease;doRelease=function(){const n=S.singles.length;const r=_dbRel.apply(this,arguments);const x=S.singles[n];if(x&&S.singles.length>n)try{const g=grp(relGroup(x));if(grpDebut(g,x,true))toast(`✦ ${g.name} has officially debuted with “${x.title}”!`)}catch(e){console.error(e)}return r};
const _dbTick=tick;tick=function(){const r=_dbTick.apply(this,arguments);try{annTick()}catch(e){console.error(e)}return r};
const _dbMig=migrate;migrate=function(){const r=_dbMig.apply(this,arguments);try{debutMigrate();hsHistBackfill()}catch(e){console.error(e)}return r};
// no "debut first" requirement for singles; the manual debut action is gone
const _dbReqs=reqs;reqs=function(){return _dbReqs.apply(this,arguments).filter(x=>!/^Debut your first group/.test(x))};
debutGroup=function(){toast('Groups debut automatically on the release day of their first single.')};
const _dbOnb=onboard;onboard=function(){const g=S.groups[0];if(!g||g.debut1)return'';let h=_dbOnb.apply(this,arguments);if(!h)return'';
 const step=`Release your first single (official debut of ${esc(g.name)})`;return h.replace(/Form the group through auditions, then debut it to start producing singles\./,'Form the group through auditions, then produce your first single — its release day is the official debut.').replace(new RegExp('Debut '+esc(g.name).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=( <button|</li>))'),step).replace(/debutGroup\(\d+\)/g,"goView('music')").replace('>Debut</button>','>Single</button>')};
const _dbGroups=V.groups;V.groups=function(){let h=_dbGroups.call(V);
 h=h.replace(/<div class="row"><span class="tag" style="background:#ffe3a8">Forming<\/span><span class="st">[^<]*<\/span><button[^>]*onclick="debutGroup\(\d+\)">Debut group<\/button><\/div>/g,'');
 h=h.replace(/(<div class="row"><input id="gnm"[^>]*><button class="b s" onclick="renameGroup\((\d+))/,(s,a,id)=>grpDebCard(grp(+id))+s);
 h=h.replace(/onclick="ui\.g=(\d+);ui\.gg='all';render\(\)">([\s\S]*?)(<span class="tag rrSR">Active[^<]*<\/span>|<span class="tag" style="background:#ffe3a8">Forming[^<]*<\/span>)/g,(s,id,mid)=>`onclick="ui.g=${id};ui.gg='all';render()">${mid}${grpDebTag(grp(+id))}`);return h};

// ---- trainees take part in Handshake Events (same system, same rules) -------------------------------
hsElig=function(p){const g=new Set();[...new Set([p.mainId,...p.types.flatMap(t=>t.songs)])].filter(i=>S.songs[i]).forEach(i=>(S.songs[i].slots||[]).forEach(id=>{const m=get(id);if(m&&m.group!=null)g.add(m.group)}));
 return S.members.filter(m=>g.has(m.group)&&m.status!='graduated'&&(isAct(m)&&m.tid||m.status=='trainee')).map(m=>m.id).sort((a,b)=>a-b)};
// handshake participation in each member's history (one record per event)
function hsHistRec(ev){if(!ev||!ev.done||!ev.plan||!Array.isArray(ev.plan.rows))return;const x=S.singles.find(s=>s.rid==ev.rid);ev.plan.rows.forEach(r=>{const m=get(r.mid);if(!m)return;m.hsHist=m.hsHist||[];if(m.hsHist.some(h=>h.ev==ev.id))return;
 m.hsHist.push({ev:ev.id,rid:ev.rid,title:x?x.title:(ev.st||''),day:ev.day,fmt:ev.fmt||(ev.plan.fmt)||null,gain:r.gain||0,inter:r.inter||0,trainee:m.status=='trainee'})})}
function hsHistBackfill(){(S.cal||[]).forEach(e=>{if(e.type=='handshake'&&e.v==2)hsHistRec(e)})}
const _dbHs2=hsRun2;hsRun2=function(ev){const r=_dbHs2.apply(this,arguments);try{hsHistRec(ev)}catch(e){console.error(e)}return r};
const _dbProf=profHtml;profHtml=function(m,cand){const h=_dbProf.apply(this,arguments);if(cand||!m||!(m.hsHist||[]).length)return h;const L=m.hsHist.slice().sort((a,b)=>a.day-b.day);
 return h+`<div class="c hshist"><h3>Handshake Events</h3><ul>${L.map(x=>`<li><b>${esc(x.title)}</b> <span class="st">· ${dayDate(x.day).toLocaleDateString('en-US',{month:'short',year:'numeric'})} · ${esc((HSF[x.fmt]||{}).n||'Handshake')}${x.trainee?' · as '+esc(TL()):''}</span> <span class="st">+${(x.gain||0).toLocaleString()} fans · ${(x.inter||0).toLocaleString()} greetings</span></li>`).join('')}</ul></div>`};
