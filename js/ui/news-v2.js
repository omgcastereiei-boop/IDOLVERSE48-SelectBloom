// =====================================================================================
//  IDOLVERSE48: Select Bloom! — News System Rework (extends the existing News Engine)
// -------------------------------------------------------------------------------------
//  Part 1 · a story library with genuinely different situations (funny & viral moments,
//  friendship, fandom, career opportunities, company business, rumors, music & chart talk,
//  Theater, concerts & events, rivals and the wider industry), each with its own subjects,
//  circumstances, outlet, article format and image; repetition prevention by story, category
//  and subject; a calm daily rhythm (some weeks busy, some quiet).
//  Part 2 · interactive articles: NEWS → CHOOSE → IMMEDIATE RESULT. Choices are written for each
//  situation; outcomes are rolled (positive / mixed / negative / neutral / unexpected) and use the
//  existing statistics only (gainPop, fanbase via fbAcquire / recognition signals, News reputation &
//  attention, company money, Passion / morale / mental health). The result shows only what changed.
//  Simple follow-ups (an offer "after more information", a rumor that fades or grows) refer to the
//  original article. Every record keeps both languages, the image spec and the decision history.
//  Game-triggered news stays with the existing adapters; this layer never invents sales, ranks, views
//  or bookings — data-based stories read the real records (latest single, formation, Theater shows,
//  concerts, the competitor simulation).
// =====================================================================================
Object.assign(NW_CAT,{funny:['Funny & Viral','ฮา & ไวรัล'],friend:['Friendship','มิตรภาพเมมเบอร์'],career:['Career & Opportunities','โอกาสในวงการ']});
Object.assign(NW_OUT_BY,{funny:['tvstar','stardaily','fanvoice'],friend:['fanvoice','idolpress','tvstar'],career:['idolpress','stardaily','bizrev']});
const NV_FMT={breaking:['Breaking News','ข่าวด่วน'],exclusive:['Exclusive Interview','สัมภาษณ์พิเศษ'],ranking:['Weekly Ranking','จัดอันดับประจำสัปดาห์'],scoop:['Entertainment Scoop','สกู๊ปบันเทิง'],variety:['Variety Report','รายงานวาไรตี้'],special:['Special Report','รายงานพิเศษ'],analysis:['Industry Analysis','บทวิเคราะห์วงการ'],fanrx:['Fan Reaction','เสียงจากแฟนคลับ'],official:['Official Announcement','ประกาศอย่างเป็นทางการ'],bts:['Behind the Scenes','เบื้องหลัง']};
const NV={};function nvDef(id,o){NV[id]={id,w:1,...o}}
const nvR=a=>a[Math.floor(Math.random()*a.length)];
const nvRi=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const nvP=p=>Math.random()<p;
function nvS(){const N=nwS();N.nv=N.nv&&typeof N.nv=='object'?N.nv:{};const X=N.nv;X.rec=Array.isArray(X.rec)?X.rec:[];X.fu=Array.isArray(X.fu)?X.fu:[];return X}
const nvAct=()=>S.members.filter(m=>(typeof isAct!='function'||isAct(m))&&!(typeof wlAway=='function'&&wlAway(m)));
const nvGid=m=>nwGid(m),nvG=m=>nwGn(nwGid(m));
const nvTeam=m=>{try{const t=teamOf(m);return t?t.name:''}catch(e){return''}};
// recent coverage of a subject (member id / group id / rival name)
function nvCovered(key,days){const X=nvS();return X.rec.some(r=>(r.subj||[]).includes(key)&&S.day-r.d<days)}
// pick a member: everybody has a chance (newcomers, trainees, captains, sister groups), recently covered members much less
function nvMem(o={}){let L=nvAct().filter(m=>!o.f||o.f(m));if(o.not)L=L.filter(m=>!o.not.includes(m.id));if(!L.length)return null;
 const w=L.map(m=>{const p=m.pop||1;let x=o.low?Math.max(4,105-p):o.top?p*p/40+4:Math.sqrt(p)*1.6+6;if(nvCovered('m'+m.id,25))x*=.12;return x*(.6+Math.random()*.8)}),T=w.reduce((a,b)=>a+b,0);let r=Math.random()*T;for(let i=0;i<L.length;i++){r-=w[i];if(r<=0)return L[i]}return L[0]}
// latest released single of a group, with its Title Track formation (front → back)
function nvSingle(gid){let out=null;try{gsWith(gid,()=>{const x=(S.singles||[]).slice(-1)[0];if(!x)return;const o=S.songs[x.mainId];if(!o)return;let ord=[];try{ord=slotOrder(o.fm).map(k=>o.fm.sl[k]).filter(z=>z.m!=null)}catch(e){}out={x,o,rid:x.rid,gid,ord,rows:ord.length?Math.max(...ord.map(z=>z.r))+1:1}})}catch(e){}return out}
function nvSongById(gid,id){let o=null;try{gsWith(gid,()=>{o=S.songs[id]||null})}catch(e){}return o}
// ---- effects: existing statistics only; returns the rows that really changed ------------------------------------------------------
function nvFx(fx){if(!fx)return[];const N=nwS(),M=new Set();['pop','rec','nf','mrep','matt','pas','mor','mh','en'].forEach(k=>(fx[k]||[]).forEach(([id])=>{if(id!=null)M.add(+id)}));
 const snap=()=>{const o={fans:S.fans|0,money:S.money|0,crep:N.rep.co.rep,trust:N.rep.co.trust,catt:N.rep.co.att,m:{},g:{}};M.forEach(id=>{const m=get(id);if(!m)return;const r=nwRepM(id),w=typeof wlOf=='function'?wlOf(m):{};o.m[id]={pop:m.pop|0,fans:m.fans|0,rep:r.rep,att:r.att,pas:m.pas|0,mor:m.mor|0,mh:w.mh|0,en:m.en|0}});(fx.grep||[]).concat(fx.gatt||[]).forEach(([g])=>{const r=nwRepG(g);o.g[g]={rep:r.rep,att:r.att}});return o};
 const A=snap();
 try{(fx.pop||[]).forEach(([id,d])=>{const m=get(id);if(m&&d)gainPop(m,d)});(fx.rec||[]).forEach(([id,n])=>{const m=get(id);if(m&&n)m.fans=Math.max(0,(+m.fans||0)+Math.round(n))});
  (fx.nf||[]).forEach(([id,n])=>{if(n>0&&typeof fbAcquire=='function'&&S.fb)fbAcquire(Math.round(n),id!=null?{via:'member',mid:+id,org:'News coverage'}:{via:'group',org:'News coverage'})});
  (fx.mrep||[]).forEach(([id,d])=>{const r=nwRepM(id);r.rep=nwCl(r.rep+d)});(fx.matt||[]).forEach(([id,d])=>{const r=nwRepM(id);r.att=nwCl(r.att+d)});
  (fx.grep||[]).forEach(([g,d])=>{const r=nwRepG(g);r.rep=nwCl(r.rep+d)});(fx.gatt||[]).forEach(([g,d])=>{const r=nwRepG(g);r.att=nwCl(r.att+d)});
  if(fx.crep)N.rep.co.rep=nwCl(N.rep.co.rep+fx.crep);if(fx.trust)N.rep.co.trust=nwCl(N.rep.co.trust+fx.trust);if(fx.catt)N.rep.co.att=nwCl(N.rep.co.att+fx.catt);
  (fx.pas||[]).forEach(([id,d])=>{const m=get(id);if(m)m.pas=cl((m.pas|0)+d)});(fx.mor||[]).forEach(([id,d])=>{const m=get(id);if(m)m.mor=cl((m.mor|0)+d)});
  (fx.mh||[]).forEach(([id,d])=>{const m=get(id);if(m&&typeof wlAdj=='function')wlAdj(m,{mh:d})});(fx.en||[]).forEach(([id,d])=>{const m=get(id);if(m)m.en=Math.max(-100,Math.min(100,(+m.en||0)+d))});
  if(fx.money>0)earn(Math.round(fx.money),fx.ml||'News: business');else if(fx.money<0)spend(Math.round(-fx.money),fx.ml||'News: promotion');
  if(((fx.rec||[]).length||(fx.nf||[]).length||(fx.pop||[]).length)&&typeof fbSync=='function')fbSync({org:'News coverage'})}catch(e){console.error('nvFx',e)}
 const B=snap(),rows=[],add=(en,th,d,money)=>{d=Math.round(d);if(d)rows.push({en,th,d,money:!!money})};
 M.forEach(id=>{const a=A.m[id],b=B.m[id];if(!a||!b)return;const n=nwNm(id);add(`${n} · Popularity`,`${n} · ความนิยม`,b.pop-a.pop);add(`${n} · Supporters`,`${n} · ผู้สนับสนุน`,b.fans-a.fans);add(`${n} · Reputation`,`${n} · ชื่อเสียง`,b.rep-a.rep);add(`${n} · Media attention`,`${n} · ความสนใจจากสื่อ`,b.att-a.att);add(`${n} · Passion`,`${n} · แพชชั่น`,b.pas-a.pas);add(`${n} · Morale`,`${n} · กำลังใจ`,b.mor-a.mor);add(`${n} · Mental health`,`${n} · สุขภาพจิต`,b.mh-a.mh);add(`${n} · Energy`,`${n} · พลังงาน`,b.en-a.en)});
 Object.keys(B.g).forEach(g=>{const a=A.g[g],b=B.g[g],G=nwGn(g);add(`${G} · Group reputation`,`${G} · ชื่อเสียงวง`,b.rep-a.rep);add(`${G} · Media attention`,`${G} · ความสนใจจากสื่อ`,b.att-a.att)});
 add('Fans (company total)','แฟนคลับ (รวมทั้งบริษัท)',B.fans-A.fans);add('Company reputation','ชื่อเสียงบริษัท',B.crep-A.crep);add('Public trust','ความเชื่อมั่นของสาธารณชน',B.trust-A.trust);add('Media attention (company)','ความสนใจจากสื่อ (บริษัท)',B.catt-A.catt);add('Money','เงินบริษัท',B.money-A.money,1);return rows}
// ---- publishing a story -----------------------------------------------------------------------------------------------------------
function nvPublish(st,ctx,o){const fmt=o.fmt||nvR(st.fmt||['breaking']);const a=nwPublish({src:o.src||'world',type:'nv_'+st.id,cat:o.cat||st.cat,sent:o.sent||'neu',att:o.att||24,imp:o.q?4:(o.imp||2),refs:o.refs||{},img:o.img,alt:o.alt,en:o.en,th:o.th,fx:o.fx||null,facts:o.facts||null,parent:o.parent||null});
 if(!a)return null;a.fmt=fmt;a.nvs=st.id;a.nvc=ctx;if(o.q)a.q={en:o.q.en,th:o.q.th,ch:o.q.ch.map(([k,en,th])=>({k,en,th})),dl:S.day+12};const X=nvS();X.rec.unshift({d:S.day,id:st.id,cat:a.cat,subj:o.subj||[],aid:a.id});if(X.rec.length>160)X.rec.length=160;return a}
// ---- choosing: the result is calculated and shown immediately ---------------------------------------------------------------------
function nvChoose(id,k,auto){const a=nwGet(id);if(!a||!a.q||a.dec)return;const st=NV[a.nvs],fn=st&&st.res&&st.res[k];if(!fn)return;let R=null;try{R=fn(a.nvc||{},a)}catch(e){console.error(e)}if(!R)R={sent:'neu',en:'Nothing in particular happened.',th:'ไม่มีอะไรเปลี่ยนแปลงเป็นพิเศษ'};
 const rows=nvFx(R.fx);const ch=a.q.ch.find(c=>c.k==k)||{en:k,th:k};a.dec={k,d:S.day,auto:auto?1:0,cen:ch.en,cth:ch.th,sent:R.sent||'neu',en:R.en,th:R.th,rows,st:R.fu?'continuing':'resolved'};a.hist.push({d:S.day,e:'decision',k});
 const N=nwS();N.log.unshift({d:S.day,id:a.id,dec:k,fx:rows.map(r=>[r.en,r.d])});if(N.log.length>600)N.log.length=600;
 if(R.fu){const X=nvS();X.fu.push({d:S.day+(R.fu.days||nvRi(3,7)),st:R.fu.st||a.nvs,ctx:{...(a.nvc||{}),...(R.fu.ctx||{})},parent:a.id})}
 if(!auto){toast(NWU('Decision made — see the result below.','ตัดสินใจแล้ว — ดูผลลัพธ์ด้านล่าง'));render()}}
// ---- the daily rhythm ---------------------------------------------------------------------------------------------------------------
function nvPickStory(){const X=nvS(),L=Object.values(NV).filter(s=>!s.fuOnly);const w=L.map(s=>{let x=s.w;const last=X.rec.find(r=>r.id==s.id);if(last&&S.day-last.d<45)x*=.1;const cat=X.rec.filter(r=>r.cat==s.cat&&S.day-r.d<10).length;x*=Math.pow(.45,cat);return x}),T=w.reduce((a,b)=>a+b,0);let r=Math.random()*T;for(let i=0;i<L.length;i++){r-=w[i];if(r<=0)return L[i]}return L[0]}
function nvDaily(){const X=nvS();if(!S.members||!S.members.length)return;
 // follow-ups that are due
 X.fu.filter(f=>f.d<=S.day).forEach(f=>{const st=NV[f.st];try{if(st&&st.follow)st.follow(f.ctx,f.parent)}catch(e){console.error(e)}});X.fu=X.fu.filter(f=>f.d>S.day);
 // undecided articles: after the deadline the newsroom moves on (the "no action" choice, or the last one)
 nwS().list.slice(0,80).forEach(a=>{if(a.q&&!a.dec&&a.q.dl&&S.day>a.q.dl){const k=(a.q.ch.find(c=>/^none|^wait|^natural|^maintain|^nostate|^nocom|^keep/.test(c.k))||a.q.ch[a.q.ch.length-1]).k;nvChoose(a.id,k,1)}});
 // mood of the period: busy weeks and quiet weeks
 X.mood=X.mood&&X.mood.until>S.day?X.mood:{p:nvR([.2,.32,.32,.45,.6]),until:S.day+nvRi(7,16)};
 const open=nwS().list.slice(0,40).filter(a=>a.q&&!a.dec).length;if(!nvP(X.mood.p))return;
 for(let t=0;t<6;t++){const st=nvPickStory();if(st.q&&open>=4)continue;let ok=null;try{ok=st.gen()}catch(e){console.error('news story',st.id,e)}if(ok)break}}
{const f=nwDaily;nwDaily=function(){const r=f.apply(this,arguments);try{if(nwS().init)nvDaily()}catch(e){console.error(e)}return r}}
// the older random stories keep coming, a little less often (the library above adds the variety)
{const f=nwWorldDaily;nwWorldDaily=function(){if(Math.random()<.4)return;return f.apply(this,arguments)}}
// ---- UI: format, decision indicator, choices and result ------------------------------------------------------------------------------
const nvFmtTag=a=>a.fmt&&NV_FMT[a.fmt]?`<span class="nwfmt">${nwT(NV_FMT[a.fmt])}</span>`:'';
{const f=nwCard;nwCard=function(a){let h=f.apply(this,arguments);try{const tag=(a.q&&!a.dec?`<span class="nvneed">❗ ${NWU('Your decision','รอการตัดสินใจ')}</span>`:a.dec?`<span class="nvdone">✔ ${NWU('Decided','ตัดสินใจแล้ว')}</span>`:'')+nvFmtTag(a);if(tag)h=h.replace('<div class="nwmeta">','<div class="nwmeta">'+tag)}catch(e){}return h}}
function nvDecHtml(a){if(!a.q)return'';const L=nwL();
 if(!a.dec)return`<div class="c nvdec"><h3>🗳 ${NWU('Your decision','การตัดสินใจของคุณ')}</h3><p>${esc(L?a.q.th:a.q.en)}</p><div class="nvch">${a.q.ch.map(c=>`<button class="b ${'p'}" onclick="nvChoose('${a.id}','${c.k}')">${esc(L?c.th:c.en)}</button>`).join('')}</div><small class="st">${NWU(`Decide by ${jd(a.q.dl)} — after that the newsroom moves on.`,`ตัดสินใจภายใน ${nwDate(a.q.dl,1)} — หลังจากนั้นข่าวจะดำเนินไปตามธรรมชาติ`)}</small></div>`;
 const D=a.dec,rows=D.rows||[];return`<div class="c nvres ${D.sent}"><h3>📋 ${NWU('Result','ผลลัพธ์')}</h3><div class="st">${NWU('Your choice','สิ่งที่คุณเลือก')}: <b>${esc(L?D.cth:D.cen)}</b>${D.auto?` · ${NWU('no decision was made in time','ไม่ได้ตัดสินใจทันเวลา')}`:''}</div><p>${esc(L?D.th:D.en)}</p>
 ${rows.length?`<ul class="nvrows">${rows.map(r=>`<li><span>${esc(L?r.th:r.en)}</span><b class="${r.d>0?'up':'down'}">${r.d>0?'+':''}${r.money?yen(r.d):nwN(r.d)}</b></li>`).join('')}</ul>`:`<p class="st">${NWU('No statistics changed.','ไม่มีค่าสถานะใดเปลี่ยนแปลง')}</p>`}
 <small class="st">${D.st=='continuing'?NWU('This story continues — a follow-up will appear in the News Feed.','เรื่องนี้ยังมีต่อ — ข่าวติดตามจะปรากฏในหน้าข่าว'):NWU('Resolved.','จบเรื่องแล้ว')}</small><div class="row"><button class="b s" onclick="goView('news')">${NWU('Close','ปิด')}</button></div></div>`}
{const f=V.newsart;V.newsart=function(){let h=f.apply(this,arguments);try{const a=nwGet(ui.nwa);if(a){if(a.fmt)h=h.replace('<div class="nwmeta">','<div class="nwmeta">'+nvFmtTag(a));if(a.q)h=h.replace('</article>','</article>'+nvDecHtml(a))}}catch(e){console.error(e)}return h}}
