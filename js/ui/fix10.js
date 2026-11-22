// =====================================================================================
//  IDOLVERSE48: Select Bloom! — fixes round 10
// -------------------------------------------------------------------------------------
//  1. Music programs: the whole Title Track lineup of the song (or the single's Media Senbatsu) is
//     invited and drawn, and everyone wears HER costume of that song (also members of sister groups),
//     drawn in the song's own group context.
//  2. Theater report: the per-member effects (popularity / recognition / buzz / energy) are shown only
//     when the report is opened from the performance results, not from any history list.
//  3. Birthday Stage photos of every extra song also for older records (performers taken from that day's lineup).
//  4. A cancelled Birthday or Graduation Stage is postponed instead of lost: the special program moves
//     to the team's next scheduled performance (or a new one within 30 days); a Graduation Stage also
//     moves the graduation date if needed.
//  5. Profile › Units: every Stage unit song (by Stage) and Concert unit song (by concert) of the
//     member, marked (Center), (Solo) or (Duet).
//  6. Songs performed by one member are a Solo, by two members a Duet — not a "Center".
// =====================================================================================
// ---- 1. music programs ------------------------------------------------------------------------------------------------------
function f10MpIds(r){let ids=[];try{gsWith(r.gid,()=>{const x=(S.singles||[]).find(z=>z.rid==r.rid);if(x&&Array.isArray(x.media)&&x.media.length){ids=x.media.slice();r.mpMedia=1;return}const o=S.songs[r.song];ids=o&&o.slots?o.slots.filter(Boolean):[];r.mpMedia=0})}catch(e){}return ids.filter(id=>{const m=get(id);return m&&m.status!='graduated'})}
function f10DressSong(sp){if(!sp||sp.song==null||sp.gid==null||!Array.isArray(sp.m))return false;const keys=[],cds=[];let ok=false;
 try{gsWith(sp.gid,()=>{const o=S.songs[sp.song];if(!o)return;ok=true;sp.m.forEach(e=>{const m=get(e.id);if(!m)return;const c=evCostume(o,m);if(c&&c.cd){const k=JSON.stringify(c.cd);let ci=keys.indexOf(k);if(ci<0){keys.push(k);cds.push(JSON.parse(k));ci=cds.length-1}e.c=ci;delete e.of;delete e.oh}else{e.c=null;e.of=c.of;e.oh=c.oh}})})}catch(e){return false}
 if(ok){sp.cd=cds;sp.czSong=1}return ok}
{const f=xeDressLatest;xeDressLatest=function(sp){if(sp&&sp.scene=='mp'&&f10DressSong(sp))return sp;return f.apply(this,arguments)}}
{const f=xeArtMake;xeArtMake=function(r,ids,song){if(!r||r.ch!='mp')return f.apply(this,arguments);let sp;try{sp=gsWith(r.gid,()=>evSpec('xe',null,song||r.song||null,(ids||[]).slice(),{t:r.name,day:r.day}))}catch(e){return f.apply(this,arguments)}
 sp.scene='mp';sp.seed=xeR(1,99999);sp.hue=xeR(0,359);sp.org=(xeS().orgs[r.org]||{}).nm||r.orgNm||'';sp.sub=r.type;sp.ven=r.venue;sp.prog=r.prog||null;sp.gid=r.gid;sp.song=song||r.song;sp.mp2=1;f10DressSong(sp);return sp}}
// the formation of the song comes from the song's own group
{const f=evdRows;evdRows=function(sp){if(sp&&sp.gid!=null&&typeof gsWith=='function')try{return gsWith(sp.gid,()=>f.call(this,sp))}catch(e){}return f.apply(this,arguments)}}
function f10MpSync(){const X=typeof xeS=='function'&&xeS();if(!X||!X.list)return;X.list.forEach(r=>{if(r.ch!='mp'||(r.status!='open'&&r.status!='accepted')||r.day<S.day)return;try{const ids=f10MpIds(r);if(!ids.length)return;
 if(r.status=='open'&&ids.join()!=(r.req||[]).map(q=>q.mid).join()){const g=grp(r.gid)||{};r.req=ids.map(id=>({mid:id,gid:r.gid,nm:get(id).name,gn:g.name||''}));r.n=ids.length;if(Array.isArray(r.cond))r.cond[1]=r.mpMedia?'Performers: the Media Senbatsu of the single (no changes, no substitutes).':'Performers: exactly the Title Track Senbatsu of the single (no changes, no substitutes).';r.art=null}
 const who=r.status=='accepted'&&r.sel&&r.sel.length?r.sel:(r.req||[]).map(q=>q.mid);if(!r.art||!r.art.mp2||(r.art.m||[]).length!=who.length){r.art=xeArtMake(r,who,r.song);if(r.prog)r.art.prog={nm:r.prog.nm,net:r.prog.net}}}catch(e){console.error(e)}})}
{const f=tick;tick=function(){const o=f.apply(this,arguments);try{f10MpSync()}catch(e){}return o}}
{const f=migrate;migrate=function(){const o=f.apply(this,arguments);try{f10MpSync()}catch(e){}return o}}
{const f=xeArtFix;xeArtFix=function(r){if(r&&r.ch=='mp'&&r.art&&r.art.mp2&&r.status!='done')return r.art;return f.apply(this,arguments)}}

// ---- 2. theater report: member effects only from the results ----------------------------------------------------------------
document.addEventListener('click',e=>{try{ui.thRes=!!(e.target&&e.target.closest&&e.target.closest('.thres'))}catch(x){}},true);
{const f=thOpenPerf;thOpenPerf=function(id){const res=!!ui.thRes;ui.thRes=false;const r=f.apply(this,arguments);try{if(!res&&ui.mod&&ui.mod.t=='html'){const h=ui.mod.h,k=h.indexOf('<h3>Members</h3>');if(k>=0){const d=h.indexOf('<div class="thfx2"',k),e=d>=0?tf7End(h,d):k+16;ui.mod.h=h.slice(0,k)+h.slice(e);render()}}}catch(x){console.error(x)}return r}}

// ---- 3. photos of the special songs (Birthday / Graduation Stage) -------------------------------------------------------------
// older Birthday Stages did not save the performers of each extra song: everyone who performed that day sang them
{const f=tf7BdPics;tf7BdPics=function(rec){try{const sp=rec&&rec.sp;if(sp&&Array.isArray(sp.songs)&&sp.songs.some(z=>!(z.ids||[]).filter(id=>get(id)).length)){const all=(rec.mem||[]).filter(id=>get(id));if(all.length){const r2={...rec,sp:{...sp,songs:sp.songs.map(z=>(z.ids||[]).filter(id=>get(id)).length?z:{...z,ids:all.slice()})}};return f.call(this,r2)}}}catch(e){console.error(e)}return f.apply(this,arguments)}}
// birthday / graduation performances keep their record of the special program
{const f=thPerform;thPerform=function(x){const H=thS(),n0=H.pf.length,sp=x&&x.sp;const r=f.apply(this,arguments);try{if(sp&&H.pf.length>n0){const rec=H.pf.at(-1);if(!rec.sp)rec.sp=JSON.parse(JSON.stringify(sp))}}catch(e){}return r}}

// ---- 4. postpone instead of cancel -----------------------------------------------------------------------------------------------
function f10Postpone(x){const H=thS();if(!x||!x.sp||x.st!='cancel')return null;const ok=z=>z.k==x.k&&z.st=='sched'&&!z.sp&&z.day>S.day&&(z.day>x.day||(z.day==x.day&&x.sl=='a'&&z.sl=='e'));
 let y=H.sh.filter(ok).sort((a,b)=>a.day-b.day||(a.sl=='a'?-1:1))[0];
 if(!y||y.day>x.day+30){for(let d=Math.max(S.day+1,x.day+1);d<=Math.max(S.day+1,x.day+1)+30;d++){if(thForbid(d))continue;const n=H.sh.length;if(thAdd(x.k,d,x.sl||'e','sp')===''){y=H.sh[n];break}}}
 if(!y)return null;y.sp=x.sp;delete x.sp;y.sp.ok=1;y.sp.moved=(y.sp.moved||0)+1;x.why=(x.why||'Cancelled')+` — the ${y.sp.kind=='grad'?'Graduation':'Birthday'} Stage moved to ${jd(y.day)}`;
 (y.sp.mids||[]).forEach(id=>{const m=get(id);if(m&&m.grad&&y.sp.kind=='grad'){if(m.grad.stage==x.id)m.grad.stage=y.id;if(m.grad.target!=null&&m.grad.target<y.day)m.grad.target=y.day}});
 const nm=(y.sp.mids||[]).map(id=>(get(id)||{}).name).filter(Boolean).join(', ');try{thN(`<li>${y.sp.kind=='grad'?'🎓':'🎂'} The ${y.sp.kind=='grad'?'Graduation':'Birthday'} Stage of <b>${esc(nm)}</b> could not take place on ${jd(x.day)} (${esc(String(x.why).split(' — ')[0])}). It was postponed to <b>${wd(y.day)} ${TH_SLOT[y.sl]}</b>.</li>`)}catch(e){}return y}
function f10PostponeAll(){try{const H=thS();if(!H||!H.sh)return;H.sh.filter(x=>x.st=='cancel'&&x.sp&&!x.sp.done).forEach(x=>{try{f10Postpone(x)}catch(e){console.error(e)}})}catch(e){}}
{const f=thPerform;thPerform=function(x){const r=f.apply(this,arguments);try{if(x&&x.st=='cancel'&&x.sp)f10Postpone(x)}catch(e){console.error(e)}return r}}
{const f=tick;tick=function(){const o=f.apply(this,arguments);f10PostponeAll();return o}}
{const f=render;render=function(){f10PostponeAll();return f.apply(this,arguments)}}

// ---- 5. Units in the profile ---------------------------------------------------------------------------------------------------------
function f10Tag(n,cen){return n==1?'Solo':n==2?'Duet':cen?'Center':''}
function f10Units(m){const st=[],cc=[];try{const H=thS();Object.values(H.st||{}).filter(s=>s.no||s.debut!=null).sort((a,b)=>(a.debut||0)-(b.debut||0)).forEach(s=>{const L=[];const add=(items,units)=>(items||[]).forEach(it=>{if(it.k!='song'||it.pt!='unit')return;const u=(units||s.units||[]).find(z=>z.id==it.unit);const ids=(u&&u.ids)||it.mem||[];if(!ids.includes(m.id))return;const t=it.title||(gsWith(gsGid(m),()=>S.songs[it.song])||{}).title||'';if(!t||L.some(z=>z.t==t))return;L.push({t,tag:f10Tag(ids.length,it.center==m.id||it.c2==m.id)})});
  add(s.orig,s.origUnits);add(s.items,s.units);if(L.length)st.push({h:`${thLabel(s.k)} ${s.no?ordN(s.no)+' ':''}Stage`,n:s.name,L})})}catch(e){console.error(e)}
 try{ccS().list.filter(C=>C.status!='plan'&&C.status!='cancel').sort((a,b)=>((a.pf[0]||{}).d||0)-((b.pf[0]||{}).d||0)).forEach(C=>{const L=[];Object.values(C.sets||{}).forEach(s=>(s.items||[]).forEach(it=>{if(it.k!='song'||!it.unit)return;const P=(it.pos||[]).filter(z=>z.m!=null),me=P.find(z=>z.m==m.id);if(!me||L.some(z=>z.t==it.title))return;L.push({t:it.title||'',tag:f10Tag(P.length,!!me.c)})}));if(L.length)cc.push({h:C.name,n:C.status=='done'?'':'upcoming',L})})}catch(e){}
 return{st,cc}}
function f10UnitsHtml(m){const U=f10Units(m);if(!U.st.length&&!U.cc.length)return'';const th=typeof UIP!='undefined'&&UIP.lang=='th';
 const blk=L=>L.map(g=>`<li class="f10ug"><b>${esc(g.h)}</b>${g.n?` <span class="st">(${esc(g.n)})</span>`:''}<ul>${g.L.map(z=>`<li>${esc(z.t)}${z.tag?` <span class="st">(${z.tag})</span>`:''}</li>`).join('')}</ul></li>`).join('');
 return`<h3>Units</h3>${U.st.length?`<h4>${th?'ยูนิตสเตจ':'Stage Units'}</h4><ul class="pfl f10u">${blk(U.st)}</ul>`:''}${U.cc.length?`<h4>${th?'ยูนิตคอนเสิร์ต':'Concert Units'}</h4><ul class="pfl f10u">${blk(U.cc)}</ul>`:''}`}
{const f=histHtml;histHtml=function(m){const h=f.apply(this,arguments);try{return h+f10UnitsHtml(m)}catch(e){return h}}}

// ---- 6. Solo / Duet instead of Center --------------------------------------------------------------------------------------------
function f10SongN(gid,sid){try{return gsWith(gid,()=>{const o=S.songs[sid];return o&&o.slots?o.slots.filter(Boolean).length:0})}catch(e){return 0}}
function f10HistFix(){(S.members||[]).forEach(m=>(m.hist||[]).forEach(h=>{if(h.pt!==undefined)return;const n=f10SongN(h.gid??(typeof gsGid=='function'?gsGid(m):m.group),h.song);h.pt=n==1?'solo':n==2?'duet':'';if(h.pt){if(h.center)h.c0=1;h.center=false}}))}
{const f=migrate;migrate=function(){const o=f.apply(this,arguments);try{f10HistFix()}catch(e){console.error(e)}return o}}
{const f=doRelease;doRelease=function(){const o=f.apply(this,arguments);try{f10HistFix()}catch(e){}return o}}
try{if(typeof plAlbumRelease=='function'){const f=plAlbumRelease;plAlbumRelease=function(){const o=f.apply(this,arguments);try{f10HistFix()}catch(e){}return o}}}catch(e){}

// ---- 7. Fanbase sort = the supporters shown in the profile (always computed from the fan database) ------------------------
let F10SUP={v:null,M:null,s:null};
function fdSupFresh(m,k){try{const fb=S&&S.fb;if(!fb||typeof fdSup!='function')return+m.fans||0;const key=fb.ver+'|'+S.day+'|'+(fb.segs||[]).length;if(F10SUP.v!==key||F10SUP.s!==S){F10SUP={v:key,s:S,M:fdSup()}}const X=F10SUP.M[m.id];if(!X)return k&&k!='fans'?0:(+m.fans||0);return k=='kami'?X.k:k=='oshi'?X.o:k=='ko'?X.k+X.o:X.t}catch(e){return+m.fans||0}}
// sort options: Kami Oshi · Oshi · Kami Oshi & Oshi (everywhere members can be sorted)
try{const i=STATS.findIndex(x=>x[0]=='fans');STATS.splice(i<0?STATS.length:i+1,0,['kami','Kami Oshi'],['oshi','Oshi'],['ko','Kami Oshi & Oshi'])}catch(e){}
try{Object.assign(I18N_TH,{"Kami Oshi & Oshi":"คามิโอชิ & โอชิ"})}catch(e){}

// ---- 8. Roadshow pictures: Title Track Senbatsu members wear their title track costume; everyone else wears the
//         single's costume for members outside the Senbatsu (Single Costume, x.scz) — never a coupling-song costume ----
function f10RsSongs(x){const o=[];if(!x)return o;const mn=S.songs[x.mainId];if(mn)o.push(mn);const ids=[...new Set((x.types||[]).flatMap(t=>t.songs||[]))].filter(id=>id!=x.mainId);
 const U=ids.map(id=>S.songs[id]).filter(s=>s&&s.sname&&SNAMES.indexOf(s.sname)>0).sort((a,b)=>SNAMES.indexOf(a.sname)-SNAMES.indexOf(b.sname));return[...o,...U]}
function f10RsDress(sp){if(!sp||sp.k!='road'||!Array.isArray(sp.m)||!sp.rid)return sp;const x=(S.singles||[]).find(s=>s.rid==sp.rid);if(!x)return sp;const L=f10RsSongs(x),mn=L[0];if(!mn)return sp;
 const keys=[],cds=[],add=cd=>{const k=JSON.stringify(cd);let i=keys.indexOf(k);if(i<0){keys.push(k);cds.push(JSON.parse(k));i=cds.length-1}return i};
 const back=(mn.slots||[]).filter(Boolean).slice().reverse().map(get).filter(Boolean),fb=(()=>{for(const m of back){const c=evCostume(mn,m);if(c&&c.cd)return c.cd}return null})();
 const tt=new Set((x.tt&&x.tt.members)||(mn.slots||[]).filter(Boolean)),sc=(x.scz&&x.scz.cdz&&x.scz.cdz.mem)||{},any=Object.values(sc).find(v=>v&&v.own&&v.own.p&&v.ok);
 sp.m.forEach(e=>{const m=get(e.id);if(!m)return;let cd=null;if(tt.has(m.id)){const c=evCostume(mn,m);if(c&&c.cd)cd=c.cd}else{const v=sc[m.id];cd=v&&v.own&&v.ok&&v.own.p?v.own.p:any?any.own.p:null}if(!cd)cd=fb;if(cd){e.c=add(cd);delete e.of;delete e.oh}});sp.cd=cds;sp.rs2=2;return sp}
{const f=evRoadSpec;evRoadSpec=function(){const sp=f.apply(this,arguments);try{f10RsDress(sp)}catch(e){console.error(e)}return sp}}
function f10RsMigrate(){try{(S.groups||[]).forEach(g=>gsWith(g.id,()=>{const L=[...(S.cal||[]),...(S.singles||[]).flatMap(x=>x.promo||[]),...Object.values((S.rs&&S.rs.hist)||{}).flat()];L.forEach(e=>{if(e&&e.img&&e.img.k=='road'&&e.img.rs2!=2)f10RsDress(e.img)})}))}catch(e){console.error(e)}}
{const f=migrate;migrate=function(){const o=f.apply(this,arguments);f10RsMigrate();return o}}

// ---- 9. Theater › team page: Team Songs (released songs made only for this team) in the team's history ------------------
function f10TeamSongs(key){const K=thK(key);if(!K||K.kind!='team')return[];let L=[];try{gsWith(K.gid,()=>{const g=grp(K.gid),t=g&&(g.teams||[]).find(x=>x.id==K.tid);if(!t)return;
 L=Object.values(S.songs||{}).filter(o=>o&&o.tm&&o.tm==t.name&&o.rel).map(o=>{const ids=(o.slots||[]).filter(Boolean),cen=(o.centers&&o.centers.length?o.centers:o.center!=null?[o.center]:[]).map(get).filter(Boolean);
  return{t:o.title,rel:o.rel,day:o.relDay,n:ids.length,lab:ids.length==1?`Solo · ${(get(ids[0])||{}).name||''}`:ids.length==2?`Duet · ${ids.map(id=>(get(id)||{}).name||'').join(' & ')}`:cen.length?`Center ${cen.map(m=>m.name).join(' & ')}`:''}}).sort((a,b)=>(a.day??0)-(b.day??0))})}catch(e){console.error(e)}return L}
{const f=V.thov;V.thov=function(){const h=f.apply(this,arguments);try{const L=f10TeamSongs(thCur());if(!L.length)return h;const th=typeof UIP!='undefined'&&UIP.lang=='th';
 return h+`<div class="c"><h3>${th?'เพลงทีม':'Team Songs'} <small class="st">${L.length}</small></h3><ul class="pfl">${L.map(z=>`<li><b>${esc(z.t)}</b> <span class="st">· ${esc(String(z.rel).replace(/^Album: /,'Album '))}${z.day!=null?' · '+jd(z.day):''} · ${z.n} ${th?'คน':'member(s)'}${z.lab?' · '+esc(z.lab):''}</span></li>`).join('')}</ul></div>`}catch(e){console.error(e);return h}}}
// profile › Team History: the Team Songs she sang
function f10MemTeamSongs(m){const L=[];(m.hist||[]).forEach(h=>{try{const o=gsWith(h.gid??(typeof gsGid=='function'?gsGid(m):m.group),()=>S.songs[h.song]);if(o&&o.tm&&!L.some(z=>z.t==o.title))L.push({t:o.title,tm:o.tm,rel:h.rel||o.rel||'',day:h.day,tag:h.pt=='solo'?'Solo':h.pt=='duet'?'Duet':h.center?'Center':''})}catch(e){}});return L.sort((a,b)=>(a.day??0)-(b.day??0))}
{const f=histHtml;histHtml=function(m){let h=f.apply(this,arguments);try{const L=f10MemTeamSongs(m);if(!L.length)return h;const th=typeof UIP!='undefined'&&UIP.lang=='th';
 const blk=`<h4>${th?'เพลงทีม':'Team Songs'}</h4><ul class="pfl">${L.map(z=>`<li><b>${esc(z.t)}</b> <span class="st">· ${esc(z.tm)} · ${esc(String(z.rel))}${z.day!=null?' · '+jd(z.day):''}${z.tag?` (${z.tag})`:''}</span></li>`).join('')}</ul>`;
 const a=h.indexOf('<h3>Team History');if(a<0)return h+blk;const b=h.indexOf('<h3>',a+5);return b<0?h+blk:h.slice(0,b)+blk+h.slice(b)}catch(e){return h}}}
