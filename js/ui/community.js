// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Fan Community (replaces the old News system)
// -------------------------------------------------------------------------------------
//  · An in-game fan platform for the Main Group and every Sister Group (units post under the Main Group's
//    community). Each group has its own fan accounts, built from the existing fan economy (Kami Oshi counts decide
//    which members the accounts support) — no second fan count exists; the community only TALKS.
//  · Every post comes from a real, public game event found by a daily scan (announced Senbatsu, releases, concerts,
//    theater, roadshows, handshakes, elections, Request Hour, promotions, captains, graduations, anniversaries,
//    units, solo debuts, awards) or from speculation built only on public history (past lineups, centers, genres).
//    Nothing is posted about a decision that has not been announced.
//  · Anti-repetition: one post per meaning per event; the same meaning about the same subject waits 21 days; every
//    line variant has a cool-down; a similarity check against recent posts (names removed); account cool-down;
//    reply meanings never repeat inside a thread. When nothing new can be said, nothing is posted.
//  · Trending = engagement of the last 3 days (accounts × replies × likes × recency) above a threshold.
//    Campaigns (hashtags) start only after the same concern came back in several separate discussions.
//  · Impact: only aggregated buzz, small and rate-limited, through the existing popularity formula (gainPop).
// =====================================================================================
const CM_TH=()=>typeof UIP!='undefined'&&UIP.lang=='th';
const CMT=(en,th)=>CM_TH()?th:en;
const CM_MAXP=360,CM_FP=500;
const cmR=a=>a[Math.floor(Math.random()*a.length)];
const cmRnd=(a,b)=>a+Math.random()*(b-a);
const cmFirst=m=>m?String(m.name||'').split(' ')[0]:'';
const cmReal=()=>(S.groups||[]).filter(g=>!(g.type=='unit'||g.type=='solo')&&!g.ext&&!g.dis);
const cmMainId=()=>(gsMain()||{}).id;
function cmS(){if(!S)return null;if(!S.cm||typeof S.cm!='object')S.cm={v:1,seq:0,acc:{},hs:[],posts:[],seen:{},fp:[],vc:{},rc:{},cs:{},camp:[],trend:{d:-1,L:[]},imp:{},last:{},init:0};
 const C=S.cm;['posts','fp','camp','hs'].forEach(k=>{if(!Array.isArray(C[k]))C[k]=[]});['acc','seen','vc','rc','cs','imp','last'].forEach(k=>{if(!C[k]||typeof C[k]!='object')C[k]={}});if(!C.trend)C.trend={d:-1,L:[]};return C}
// ---- fan accounts (per group, from the fan economy) ------------------------------------------------------------------------------
const CM_HA=['sakura','hoshi','mochi','yuki','kira','luna','momo','nana','mint','peach','tsuki','hana','sora','riri','koko','miu','neko','usagi','ichigo','shiro','kumo','ame','niji','pudding','matcha','boba','ploy','pim','fah','mook','bam','pond','beam','tonkatsu','onigiri','dango','melon','sumire','kaede','haru','natsu','aki','fuyu','lemon','cocoa','ribbon','stella','penlight','encore','senbatsu','theater','lyric','chorus'];
const CM_HB=['_chan','.fan','_lover','daisuki','_diary','_cam','_note','san','_x','_jp','_th','_love','box','_fc','_log','_days','_stage','_mix','_00','_tl'];
const CM_ST=[['hype',.2],['soft',.17],['ana',.14],['salty',.1],['casual',.23],['vet',.16]];
const cmW=L=>{const t=L.reduce((a,x)=>a+x[1],0);let r=Math.random()*t;for(const x of L){r-=x[1];if(r<=0)return x[0]}return L[L.length-1][0]};
function cmGMembers(gid){return S.members.filter(m=>m.status!='graduated'&&gsGid(m)==gid)}
function cmKami(){try{return typeof fdSup=='function'?fdSup():{}}catch(e){return{}}}
function cmHandle(C,base){for(let t=0;t<40;t++){const h=(base||cmR(CM_HA))+(Math.random()<.6?cmR(CM_HB):'')+(Math.random()<.55?String(Math.floor(Math.random()*999)):'');if(!C.hs.includes(h)){C.hs.push(h);if(C.hs.length>4000)C.hs.shift();return h}}return'fan'+(++C.seq)}
function cmNewAcc(C,gid,K){const M=cmGMembers(gid).filter(m=>m.status!='trainee'||Math.random()<.3),g=grp(gid);const st=cmW(CM_ST);let oshi=null,int;
 if(M.length&&Math.random()<.62){const w=M.map(m=>[m.id,Math.max(1,((K[m.id]||{}).k)||(+m.fans||0)/10)]);oshi=cmW(w);int='mem'}else int=cmR(['grp','mus','perf','ev','grp']);
 const om=get(oshi),base=oshi&&Math.random()<.45?cmFirst(om).toLowerCase().replace(/[^a-z]/g,'')+cmR(['_oshi','daisuki','_stan','nofan','_forever','love']):(Math.random()<.2&&g?gsShort(g).toLowerCase()+cmR(['_lover','_fan','_diary','_tl']):null);
 return{id:'a'+(++C.seq),h:cmHandle(C,base),gid,st,oshi,int,act:+cmRnd(.2,1).toFixed(2),cl:Math.round(1+Math.pow(Math.random(),3)*40),nong:Math.random()<((st=='soft'||st=='hype')?.7:.35),last:-99,since:S.day}}
function cmAccs(gid){const C=cmS();C.acc[gid]=Array.isArray(C.acc[gid])?C.acc[gid]:[];const L=C.acc[gid];let F=0;try{F=typeof gsFans=='function'&&S.groups.length>1?gsFans(gid):S.fans}catch(e){F=S.fans||0}
 const want=Math.round(Math.max(30,Math.min(110,30+Math.log10(Math.max(10,F))*14)));if(L.length<want){const K=cmKami();while(L.length<want)L.push(cmNewAcc(C,gid,K))}return L}
// her fans stay (most switch to another member or to the whole group when she leaves)
function cmRefresh(){const C=cmS(),K=cmKami();Object.keys(C.acc).forEach(gid=>{(C.acc[gid]||[]).forEach(a=>{if(a.oshi==null)return;const m=get(a.oshi);if(m&&m.status!='graduated'&&gsGid(m)==+gid)return;if(Math.random()<.5){const M=cmGMembers(+gid);if(M.length){a.oshi=cmW(M.map(x=>[x.id,Math.max(1,((K[x.id]||{}).k)||1)]));return}}a.oshi=null;a.int='grp'})})}
// ---- public history (fan memory: always read from the real data) ------------------------------------------------------------------
function cmHist(gid){const L=[];try{const sg=gsCtx(gid,'singles')||[],so=gsCtx(gid,'songs')||{};sg.forEach(x=>{const o=so[x.mainId]||{};const mem=(x.tt&&x.tt.members)||(o.slots||[]).filter(Boolean);const cen=(x.tt&&x.tt.centers)||(o.centers&&o.centers.length?o.centers:(o.center!=null?[o.center]:[]));
  L.push({x,t:x.title||o.title||'',s:o.title||x.title||'',gen:o.genre,cp:o.concept,mem:mem.slice(),cen:cen.filter(v=>v!=null),d:x.relDay??x.day??0,sales:+x.sales||0,ge:!!x.ge})})}catch(e){}return L.sort((a,b)=>a.d-b.d)}
const cmIn=(h,mid)=>h.mem.includes(mid);
function cmStreakCen(H,mid){let k=0;for(let i=H.length-1;i>=0;i--){if(H[i].cen.includes(mid))k++;else break}return k}
function cmStreakOut(H,mid){let k=0;for(let i=H.length-1;i>=0;i--){if(!cmIn(H[i],mid))k++;else break}return k}
// ---- text --------------------------------------------------------------------------------------------------------------------------
function cmName(v,lang,a){const m=typeof v=='number'?(get(v)||(S.alumni||[]).find(x=>x.id==v)):null;if(!m)return String(v??'');const n=cmFirst(m);return lang=='th'&&a&&a.nong?'น้อง'+n:n}
function cmFill(str,vars,lang,a){return str.replace(/\{(\w+)\}/g,(_,k)=>{const v=vars[k];if(v==null)return'';if(k=='m'||k=='m2')return cmName(v,lang,a);return String(v)})}
function cmTh(s){return s.replace(/([\u0E00-\u0E7F]) น้อง/g,'$1น้อง').replace(/([฀-๿])([A-Za-z0-9#])/g,'$1 $2').replace(/([A-Za-z0-9!?)])([฀-๿])/g,'$1 $2').replace(/\s+/g,' ').trim()}
const CM_CG=new Set(['firstSen','firstCenter','returnee','promote','captain','award','soloDebut','geWin','geUp','bday','debutGroup','unitNew','gradThanks']);
const CM_TURN=new Set(['firstSen','firstCenter','geWin','geUp','award','promote','captain','returnee']);
function cmDecor(core,st,tone,lang,startsName,it){if(/^camp/.test(it||''))return core;const D0=((CM_DEC[st]||{})[lang]||{})[tone];if(!D0)return core;
 const D={pre:D0.pre,suf:st=='soft'&&!CM_CG.has(it)?[]:D0.suf.filter(x=>!(lang=='th'&&/จริง/.test(x)&&/จริงๆ?$/.test(core)))};let s=core;const r=Math.random();
 if(D.pre.length&&r<.22){const p=cmR(D.pre);s=p+(lang=='en'&&!/[:.!]\s$/.test(p)&&!startsName?s.charAt(0).toLowerCase()+s.slice(1):s)}
 else if(D.suf.length&&r<.5){const x=cmR(D.suf);if(/^[!.]/.test(x))s=s.replace(/[.!]+$/,'');else if(lang=='en'&&/^ [A-Z]/.test(x)&&/[A-Za-z0-9]$/.test(s))s+='.';s+=x}
 return s}
// similarity (names / titles removed)
function cmToks(s){return new Set(String(s).toLowerCase().replace(/[^a-z\s]/g,' ').split(/\s+/).filter(w=>w.length>2))}
function cmSim(a,b){if(!a.size||!b.size)return 0;let n=0;a.forEach(w=>{if(b.has(w))n++});return n/(a.size+b.size-n)}
function cmVar(key,arr,cool){const C=cmS();const free=arr.map((s,i)=>i).filter(i=>{const d=C.vc[key+':'+i];return d==null||S.day-d>=cool});if(!free.length)return null;const i=cmR(free);return{i,s:arr[i]}}
// one post: meaning (intent) + subject + account → EN & TH lines, or null when it would repeat
function cmCompose(ev,it,a){const C=cmS(),I=CM_I[it.i];if(!I)return null;const subj=it.sub!=null?String(it.sub):'';
 const mk=it.i+'|'+subj;if(C.fp.some(f=>f.mk==mk&&S.day-f.d<21&&f.ev!=ev.key))return null; // same meaning, same subject: only with a new context after 3 weeks
 if(C.fp.filter(f=>f.d==S.day&&f.i==it.i).length>=2)return null;
 const ve=cmVar('e:'+it.i,I.en,18),vt=cmVar('t:'+it.i,I.th,18);if(!ve||!vt)return null;
 const vars={...ev.v,...it.v},nm=/^\{/.test(ve.s),ntm=/^\{/.test(vt.s);if(vars.k!=null&&typeof ordN=='function')vars.ko=ordN(vars.k);
 let en=cmDecor(cmFill(ve.s,vars,'en',a),a.st,I.tone,'en',nm,it.i),th=cmTh(cmDecor(cmFill(vt.s,vars,'th',a),a.st,I.tone,'th',ntm,it.i));
 const strip=s=>{let x=s;Object.entries(vars).forEach(([k,v])=>{if(v==null)return;const n=(k=='m'||k=='m2')?cmName(v,'en'):String(v);if(n&&n.length>1)x=x.split(n).join(' ')});return x};
 const T=cmToks(strip(en)),he=nwHash(en),ht=nwHash(th);if(C.fp.some(f=>f.he==he||f.ht==ht))return null;if(C.fp.slice(-250).some(f=>f.tk&&cmSim(T,new Set(f.tk))>=.6))return null;
 C.vc['e:'+it.i+':'+ve.i]=S.day;C.vc['t:'+it.i+':'+vt.i]=S.day;C.fp.push({d:S.day,i:it.i,mk,ev:ev.key,tk:[...T],he,ht});if(C.fp.length>CM_FP)C.fp.splice(0,C.fp.length-CM_FP);
 return{en,th,tone:I.tone}}
// ---- accounts for a post -----------------------------------------------------------------------------------------------------------
const CM_INT={sen:'mem',rel:'mus',prerel:'mus',presen:'mem',cc:'perf',precc:'perf',th:'perf',rs:'ev',hs:'ev',ge:'mem',prege:'mem',rh:'mus',ms:'grp',mg:'grp',camp:'mem',unit:'mus'};
function cmPickAcc(ev,it,used){const I=CM_I[it.i]||{},sub=it.sub,L=[];(ev.gids||[ev.gid]).forEach(g=>cmAccs(g).forEach(a=>L.push(a)));
 const W=L.filter(a=>!used.has(a.id)&&S.day-a.last>=2).map(a=>{let w=a.act;const own=sub!=null&&a.oshi==sub;
  if(I.who=='oshi')w*=own?8:(a.int=='mem'?.35:.25);else if(own)w*=2.5;
  if(I.who=='ana')w*=a.st=='ana'||a.st=='vet'?4:.5;if(I.who=='mus')w*=a.int=='mus'?3:.8;if(I.who=='perf')w*=a.int=='perf'||a.int=='ev'?3:.8;
  if(I.tone=='n'&&!own&&a.st!='salty')w*=.3;if(a.gid!=ev.gid&&!own)w*=.15;if(CM_INT[ev.cat]==a.int)w*=1.5;return[a,w]}).filter(x=>x[1]>0);
 if(!W.length)return null;return cmW(W)}
// ---- engagement ------------------------------------------------------------------------------------------------------------------
function cmScale(gid){let F=0;try{F=S.groups.length>1&&typeof gsFans=='function'?gsFans(gid):S.fans}catch(e){F=S.fans||0}return Math.max(.45,Math.min(1.2,Math.log10(Math.max(100,F))/5.2))}
function cmLikes(a,imp,sc){return Math.max(0,Math.round((3+a.cl*3.2)*(.6+imp*.45)*sc*cmRnd(.5,1.5)))}
// ---- replies -------------------------------------------------------------------------------------------------------------------
function cmReplies(p,ev,n){const C=cmS();if(n<=0)return;const used=new Set([p.a]),got=new Set(),tone=p.tone;
 const cat=ev.cat,dec=['sen','ge','ms','mg'].includes(cat),perf=['cc','th','rs','hs'].includes(cat),spec=['presen','prege','precc','prerel'].includes(cat),hasM=p.rel&&p.rel.m!=null;
 const turn=hasM&&CM_TURN.has(p.i),joke=['sen','rel','cc','hs','th','ge'].includes(cat)&&tone=='p';
 const sets=tone=='n'?(dec&&cat!='mg'?['agreeN','disagreeN',...(cat=='sen'&&hasM?['factSen']:[])]:['agreeN','hopeN']):cat=='camp'?['agreeP','agreeN']:dec?['agreeP',...(joke?['joke']:[]),...(turn?['oshiTurn']:[]),...(cat=='sen'&&hasM?['factSen']:[]),...(tone=='u'?['disagreeP']:[]),...(cat=='ms'&&p.i=='annivMem'?[]:['memory'])]:perf?['agreeP','neutralQ',...(joke?['joke']:[]),...(turn?['oshiTurn']:[]),...(cat=='cc'?['memory']:[])]:spec?['agreeP',...(p.i=='countdown'||p.i=='mvExpect'?['joke']:['disagreeP'])]:['agreeP','disagreeP',...(joke?['joke']:[]),'memory','neutralQ'];
 const H=ev.H||[];for(let k=0;k<n;k++){const opts=sets.filter(r=>!got.has(r)&&(r!='factSen'||(ev.L&&hasM))&&(r!='memory'||H.length>2));if(!opts.length)break;
  const r=cmR(opts);got.add(r);const acc=cmPickAcc(ev,{i:'_r',sub:p.rel&&p.rel.m},used);if(!acc)break;used.add(acc.id);
  const R=CM_R[r];const ve=cmVar('re:'+r,R.en,8),vt=cmVar('rt:'+r,R.th,8);if(!ve||!vt)continue;
  const vars={};if(r=='factSen'){const mm=p.rel.m;vars.k=H.slice(-5).filter(h=>cmIn(h,mm)).length+(ev.L.includes(mm)?1:0);vars.n=Math.min(5,H.length)+1;if(vars.k<2)continue}if(r=='oshiTurn'){if(acc.oshi==null||acc.oshi==(p.rel&&p.rel.m))continue;vars.m2=acc.oshi}if(r=='memory'){const old=H.slice(0,-1);vars.t2=cmR(old).t}
  C.vc['re:'+r+':'+ve.i]=S.day;C.vc['rt:'+r+':'+vt.i]=S.day;acc.last=S.day;
  p.rp.push({a:acc.id,h:acc.h,gid:acc.gid,en:cmFill(ve.s,vars,'en',acc),th:cmTh(cmFill(vt.s,vars,'th',acc)),lk:Math.round(cmLikes(acc,1,.6)*.4),d:S.day,hr:Math.min(23,p.hr+1+Math.floor(Math.random()*4))})}}
// ---- events → posts -------------------------------------------------------------------------------------------------------------
const CM_BASE={1:1,2:3.2,3:6};
function cmEmit(ev,budget){const C=cmS();if(C.seen[ev.key]!=null)return 0;C.seen[ev.key]=S.day;const sc=cmScale(ev.gid);let n=Math.round(CM_BASE[ev.imp]*sc*cmRnd(.6,1.35));n=Math.min(n,budget,ev.its.length);if(n<=0)return 0;
 const its=ev.its.slice().sort((a,b)=>(b.w||1)*Math.random()-(a.w||1)*Math.random()),used=new Set();let made=0;
 for(const it of its){if(made>=n)break;const a=cmPickAcc(ev,it,used);if(!a)continue;const tx=cmCompose(ev,it,a);if(!tx)continue;used.add(a.id);a.last=S.day;
  const p={id:'cp'+(++C.seq),d:S.day,hr:Math.floor(cmRnd(ev.hr0||8,23)),gid:ev.gid,a:a.id,h:a.h,ag:a.gid,i:it.i,cat:ev.cat,imp:ev.imp,en:tx.en,th:tx.th,tone:tx.tone,tag:it.tag||ev.tag||null,top:it.top||ev.top||ev.key,lb:ev.lb,rel:{m:it.v&&typeof it.v.m=='number'?it.v.m:(typeof ev.v.m=='number'?ev.v.m:null),s:it.v&&it.v.s||ev.v.s||null,t:ev.v.t||null},lk:0,rp:[],ev:ev.key};
  p.lk=cmLikes(a,ev.imp,sc);const nr=Math.random()<.3+ev.imp*.15?Math.round(cmRnd(0,ev.imp+(a.cl>20?1:0))):0;cmReplies(p,ev,nr);C.posts.push(p);made++;
  if(it.cs)cmCount(it.cs,ev)}
 return made}
// campaign counters: the same concern raised in separate discussions
function cmCount(cs,ev){const C=cmS(),c=C.cs[cs.key]=C.cs[cs.key]||{n:0,evs:[],...cs};if(!c.evs.includes(ev.key)){c.evs.push(ev.key);c.n++;c.dl=S.day;if(c.evs.length>8)c.evs.shift()}}
// ---- collectors (public events only) ------------------------------------------------------------------------------------------
function cmRecent(d,w){return d!=null&&d<=S.day&&d>=S.day-(w??1)}
function cmCollect(){const E=[],main=cmMainId(),C=cmS();
 cmReal().forEach(g=>{const gid=g.id,H=cmHist(gid),gn=g.name,M=cmGMembers(gid).filter(m=>isAct(m)&&m.status!='trainee');
  // announced Senbatsu (the project is public once production started)
  const p=gsCtx(gid,'pj');if(p&&p.status=='producing'){const so=gsCtx(gid,'songs')||{},o=so[p.mainId];if(o){const L=(o.slots||[]).filter(Boolean),cen=(o.centers&&o.centers.length?o.centers:[o.center]).filter(v=>v!=null),key='sen:'+gid+':'+(p.id||p.title);
   if(L.length&&C.seen[key]==null){const its=[],t=p.title||o.title,prev=H[H.length-1],sen=L.filter(id=>get(id));
    cen.forEach(c=>{if(!H.some(h=>h.cen.includes(c)))its.push({i:'firstCenter',sub:c,v:{m:c},w:3});else{const k=cmStreakCen(H,c)+1;if(k>=2)its.push({i:'repeatCenter',sub:c,v:{m:c,k},w:2})}});
    sen.filter(id=>!H.some(h=>cmIn(h,id))).slice(0,3).forEach(id=>its.push({i:'firstSen',sub:id,v:{m:id},w:2.5}));
    sen.filter(id=>H.length>2&&!cmIn(H[H.length-1],id)&&!cmIn(H[H.length-2]||{mem:[]},id)&&H.some(h=>cmIn(h,id))).slice(0,1).forEach(id=>its.push({i:'returnee',sub:id,v:{m:id}}));
    const out=M.filter(m=>!L.includes(m.id));out.filter(m=>prev&&cmIn(prev,m.id)).sort((a,b)=>b.pop-a.pop).slice(0,2).forEach(m=>its.push({i:'excluded',sub:m.id,v:{m:m.id},w:1.5}));
    const pr=M.slice().sort((a,b)=>b.pop-a.pop),top=new Set(pr.slice(0,Math.ceil(pr.length*.4)).map(m=>m.id));
    out.map(m=>[m,cmStreakOut(H,m.id)+1]).filter(([m,k])=>k>=3&&(top.has(m.id)||H.some(h=>cmIn(h,m.id)))).sort((a,b)=>b[0].pop-a[0].pop).slice(0,2).forEach(([m,k])=>its.push({i:'excludedStreak',sub:m.id,v:{m:m.id,k},w:1.5,cs:{key:'sen:'+m.id,type:'sen',gid,mid:m.id}}));
    // never Center although always in the lineup → a Center campaign may grow
    sen.forEach(id=>{const m=get(id),nIn=H.filter(h=>cmIn(h,id)).length+1;if(m&&top.has(id)&&nIn>=4&&!H.some(h=>h.cen.includes(id))&&!cen.includes(id))cmCount({key:'cen:'+id,type:'cen',gid,mid:id,k:nIn},{key})});
    const never=M.filter(m=>H.slice(-3).every(h=>!cmIn(h,m.id))&&!L.includes(m.id)).length;if(M.length>=12&&never/M.length>=.4)cmCount({key:'under:'+gid,type:'under',gid,k:never},{key});
    its.push({i:'lineupLike',sub:null,v:{}});if(prev){const nw=L.filter(id=>!cmIn(prev,id)).length,dr=prev.mem.filter(id=>!L.includes(id)).length;its.push({i:'comparePrev',sub:'g'+gid,v:{k:nw,k2:dr,s2:prev.t}})}
    for(let k=0;k<6;k++){const a=cmR(L),b=cmR(L);if(a!=b&&!H.some(h=>cmIn(h,a)&&cmIn(h,b))){its.push({i:'newCombo',sub:a+'-'+b,v:{m:a,m2:b}});break}}
    const fc=cen[0]!=null?cen[0]:L[0],dc=new Set(H.slice(-5).flatMap(h=>h.cen).concat(cen));
    E.push({key,cat:'sen',gid,gids:[...new Set([gid,...L.map(id=>gsGid(get(id)||{}))].filter(x=>x!=null))],imp:3,v:{t,g:gn},its,lb:{en:`${t} Senbatsu`,th:`เซ็มบัตสึ ${t}`},H,L,tag:Math.random()<.4?'#'+gsShort(g)+'_'+String(t).replace(/[^A-Za-z0-9]/g,''):null,
     fact:{sen:{k:H.slice(-5).filter(h=>cmIn(h,fc)).length+1,n:Math.min(5,H.length)+1},cen:H.length&&H[H.length-1].cen[0]!=null?{m2:H[H.length-1].cen[0],k:dc.size,n:Math.min(5,H.length)+1}:null}})}
   // before the release
   const left=p.releaseDay!=null?p.releaseDay-S.day:null;if(left!=null&&left>=1&&left<=5){const L2=(o.slots||[]).filter(Boolean),t=p.title||o.title;E.push({key:'prerel:'+gid+':'+(p.id||p.title),cat:'prerel',gid,imp:2,v:{t,s:o.title,g:gn},its:[{i:'countdown',sub:'g'+gid,v:{k:left}},...(L2.length?[{i:'posGuess',sub:cmR(L2),v:{m:null}}]:[]),{i:'mvExpect',sub:'g'+gid,v:{}}].map(x=>x.i=='posGuess'?{...x,v:{m:x.sub}}:x),lb:{en:t,th:t},H})}}}
  // speculation before the next single (public history only)
  const last=H[H.length-1],gap=last?S.day-last.d:null;if((!p||p.status!='producing')&&last&&gap>=28&&Math.random()<.2){const key='presen:'+gid+':'+H.length;if(C.seen[key]==null){const pr=M.slice().sort((a,b)=>b.pop-a.pop),rc=new Set(H.slice(-3).flatMap(h=>h.cen)),cand=pr.filter(m=>!rc.has(m.id)).slice(0,3),its=[];
   if(cand.length)its.push({i:'centerGuess',sub:cmR(cand).id,v:{}});const od=pr.slice(0,Math.ceil(pr.length*.5)).map(m=>[m,cmStreakOut(H,m.id)]).filter(x=>x[1]>=2).sort((a,b)=>b[1]-a[1])[0];if(od)its.push({i:'overdue',sub:od[0].id,v:{k:od[1]}});
   its.push({i:'newFaces',sub:'g'+gid,v:{}},{i:'whenSingle',sub:'g'+gid,v:{k:gap,t:last.t}});its.forEach(x=>{if(typeof x.sub=='number')x.v.m=x.sub});E.push({key,cat:'presen',gid,imp:2,v:{g:gn},its,lb:{en:CMT('Next single','ซิงเกิลถัดไป'),th:'ซิงเกิลถัดไป'},H})}}
  // release
  (gsCtx(gid,'singles')||[]).filter(x=>cmRecent(x.relDay??x.day,1)).forEach(x=>{const key='rel:'+gid+':'+(x.rid||x.title),so=gsCtx(gid,'songs')||{},o=so[x.mainId]||{},hi=H.findIndex(h=>h.x===x),prev=hi>0?H[hi-1]:null,its=[];const L=(o.slots||[]).filter(Boolean);
   its.push({i:'songHook',sub:'s'+gid+o.id,v:{}});if(o.genre)its.push({i:prev&&prev.gen==o.genre?'genreSame':'genreNew',sub:'g'+gid,v:{gen:o.genre}});if(o.concept)its.push({i:'conceptTake',sub:'g'+gid,v:{cp:o.concept}});
   const cp=Object.values(so).filter(z=>z&&z.id!=o.id&&(z.relDay??-1)==(x.relDay??-2)&&z.title);if(cp.length)its.push({i:'couplingPref',sub:'s'+gid+cp[0].id,v:{s2:cmR(cp).title}});
   if((o.mv&&(o.mv.v||o.mv.pub!=null))||o.videoDone||(x.videos||[]).length)its.push({i:'mvTake',sub:'s'+gid+o.id,v:{m:L.length?cmR(L):null}});
   its.push({i:Math.random()<.75?'costumeTake':'costumeMeh',sub:'r'+gid+(x.rid||x.title),v:{}},{i:'coverTake',sub:'r'+gid+(x.rid||x.title),v:{}});
   if(g.debut1&&(g.debut1.rid==x.rid||g.debut1.title==x.title)&&H.length<=1)its.push({i:'debutGroup',sub:'g'+gid,v:{},w:4});
   E.push({key,cat:'rel',gid,imp:H.length<=1?3:2,v:{t:x.title,s:o.title||x.title,g:gn},its,lb:{en:x.title,th:x.title},H})});
  // first-week sales (real numbers) and MV view milestones
  (gsCtx(gid,'singles')||[]).filter(x=>(x.relDay??x.day)==S.day-7&&(+x.sales||0)>0).forEach(x=>{const hi=H.findIndex(h=>h.x===x),pv=hi>0?H[hi-1]:null;if(!pv||!pv.sales)return;const up=x.sales>=pv.sales;
   E.push({key:'sales:'+gid+':'+(x.rid||x.title),cat:'rel',gid,imp:2,v:{t:x.title,g:gn},its:[{i:up?'salesUp':'salesDown',sub:'r'+gid+(x.rid||x.title),v:{n:(+x.sales).toLocaleString('en-US'),s2:pv.t}}],lb:{en:x.title,th:x.title},H})});
  Object.values(gsCtx(gid,'songs')||{}).forEach(o=>{const v=o&&o.mv&&+o.mv.v;if(!v)return;const k='mv:'+gid+':'+o.id,lv=[100000,1000000,5000000,10000000,50000000].filter(t=>v>=t).pop()||0;if(C.last[k]==null){C.last[k]=lv;return}if(lv>C.last[k]){C.last[k]=lv;
   E.push({key:k+':'+lv,cat:'rel',gid,imp:lv>=1000000?2:1,v:{s:o.title,g:gn},its:[{i:'mvMile',sub:'s'+gid+o.id,v:{n:lv>=1000000?(lv/1000000)+'M':(lv/1000)+'K'}}],lb:{en:o.title,th:o.title}})}});
  // roadshows / handshakes
  (gsCtx(gid,'cal')||[]).forEach(e=>{if(!e.done)return;const d=e.day2??e.day;if(!cmRecent(d,2))return;const mem=(e.members||[]).filter(id=>get(id));
   if(e.type=='road'){const loc=String(e.loc||'').replace(/^\w/,c=>c.toUpperCase());const vis=((S.rs||{}).loc)||{},other=Object.keys(vis).filter(k=>!(vis[k].visits>0)&&k!=e.loc),its=[{i:'rsLocal',sub:'loc'+e.loc,v:{loc}}];if(mem.length)its.push({i:'rsMember',sub:cmR(mem),v:{loc}});if(other.length)its.push({i:'rsRequest',sub:'g'+gid,v:{loc:cmR(other).replace(/^\w/,c=>c.toUpperCase())}});
    its.forEach(x=>{if(typeof x.sub=='number')x.v.m=x.sub});E.push({key:'rs:'+e.id,cat:'rs',gid,imp:2,v:{g:gn},its,lb:{en:e.title||'Roadshow',th:e.title||'โรดโชว์'}})}
   if(e.type=='handshake'&&mem.length&&Math.random()<.7){const pk=mem.map(get).sort((a,b)=>b.pop*Math.random()-a.pop*Math.random()).slice(0,2);E.push({key:'hs:'+e.id,cat:'hs',gid,imp:1,v:{g:gn},its:pk.map(m=>({i:'hsFun',sub:m.id,v:{m:m.id}})),lb:{en:e.title||'Handshake',th:e.title||'งานจับมือ'}})}
   if(e.type=='anniv'&&e.n>0&&cmRecent(e.day,1)){const first=H[0];E.push({key:'anniv:'+e.key,cat:'ms',gid,imp:3,v:{g:gn,k:e.n},its:[{i:'anniv',sub:'g'+gid,v:{}},...(first?[{i:'annivMem',sub:'g'+gid,v:{t:first.t}}]:[])],lb:{en:`${gn} ${typeof ordN=='function'?ordN(e.n):e.n+'th'} anniversary`,th:`ครบรอบ ${e.n} ปี ${gn}`},tag:'#'+gsShort(g)+'_'+e.n+'th'})}});
  // elections
  const GE=(gsCtx(gid,'ge')||{}).list||[];GE.forEach((e,i)=>{if(e.st=='done'&&e.final&&e.final.rows&&cmRecent(e.doneDay,2)){const rows=e.final.rows.filter(r=>r.rank&&get(r.id)),its=[];const w=rows.find(r=>r.rank==1);if(w)its.push({i:'geWin',sub:w.id,v:{m:w.id},w:3});
    const pv=GE.slice(0,i).reverse().find(z=>z.st=='done'&&z.final&&z.final.rows),pm=new Map(pv?pv.final.rows.filter(r=>r.rank).map(r=>[r.id,r.rank]):[]);
    const ch=rows.filter(r=>pm.has(r.id)).map(r=>[r,pm.get(r.id)-r.rank]).sort((a,b)=>b[1]-a[1]);if(ch.length&&ch[0][1]>=3)its.push({i:'geUp',sub:ch[0][0].id,v:{m:ch[0][0].id,r:ch[0][0].rank,r2:pm.get(ch[0][0].id)}});const dn=ch[ch.length-1];if(dn&&dn[1]<=-3)its.push({i:'geDown',sub:dn[0].id,v:{m:dn[0].id,r:dn[0].rank,r2:pm.get(dn[0].id)}});
    const sp=rows.filter(r=>r.rank<=16&&r.prelim&&r.prelim-r.rank>=8).sort((a,b)=>(b.prelim-b.rank)-(a.prelim-a.rank))[0];if(sp)its.push({i:'geSurprise',sub:sp.id,v:{m:sp.id,r:sp.rank}});
    E.push({key:'ge:'+e.id,cat:'ge',gid,imp:3,v:{g:gn,e:e.name||''},its,lb:{en:e.name||'Election',th:e.name||'งานเลือกตั้ง'},tag:'#'+gsShort(g)+'_GE'})}
   if(e.st!='done'&&e.vStart!=null&&e.vEnd!=null&&S.day>=e.vStart&&S.day<=e.vEnd){const parts=(e.parts||[]).map(get).filter(Boolean).sort((a,b)=>b.pop-a.pop);if(parts.length>3){const its=parts.slice(0,8).sort(()=>Math.random()-.5).slice(0,3).map(m=>({i:'geVote',sub:m.id,v:{m:m.id}}));its.push({i:'gePredict',sub:parts[0].id,v:{m:parts[0].id}});
    E.push({key:'prege:'+e.id+':'+(S.day-e.vStart>=Math.max(3,(e.vEnd-e.vStart)/2)?2:1),cat:'prege',gid,imp:2,v:{g:gn},its,lb:{en:e.name||'Election',th:e.name||'งานเลือกตั้ง'},tag:'#'+gsShort(g)+'_GE'})}}});
  // management patterns (descriptive, from history)
  const lk='mg'+gid;if(H.length>=4&&S.day-(C.last[lk]??-99)>=25&&Math.random()<.12){const L4=H.slice(-4),pats=[];const firsts=L4.reduce((a,h,ix)=>a+h.mem.filter(id=>!H.slice(0,H.length-4+ix).some(z=>cmIn(z,id))).length,0);if(firsts>=4)pats.push({i:'mgNew',v:{k:firsts}});
   const L3=H.slice(-3),core=L3[0].mem.filter(id=>L3.every(h=>cmIn(h,id))).length;if(L3[0].mem.length&&core/L3[0].mem.length>=.8)pats.push({i:'mgSame',v:{k:3}});
   const gens=new Set(L4.map(h=>h.gen).filter(Boolean)).size;if(gens>=3)pats.push({i:'mgGenre',v:{k:gens}});const cs=L4.map(h=>h.cen[0]).filter(v=>v!=null);if(cs.length==4&&new Set(cs).size==4)pats.push({i:'mgRotate',v:{k:4}});
   const evn=(gsCtx(gid,'cal')||[]).filter(e=>e.done&&['handshake','road','concert'].includes(e.type)&&e.day>=S.day-60).length;if(evn>=4)pats.push({i:'mgEvents',v:{k:evn}});
   if(pats.length){const pt=cmR(pats);C.last[lk]=S.day;E.push({key:'mg:'+gid+':'+pt.i+':'+S.day,cat:'mg',gid,imp:2,v:{g:gn},its:[{...pt,sub:'g'+gid}],lb:{en:CMT('Management talk','คุยเรื่องการบริหาร'),th:'คุยเรื่องการบริหาร'},H})}}
 });
 // concerts (company level; group by participants)
 try{ccS().list.forEach(Cc=>{const parts=(Cc.parts||[]).map(get).filter(Boolean),gc={};parts.forEach(m=>{const g=gsGid(m);gc[g]=(gc[g]||0)+1});const gids=Object.keys(gc).map(Number).filter(g=>cmReal().some(x=>x.id==g)).sort((a,b)=>gc[b]-gc[a]);const gid=gids[0]??main,gn=(grp(gid)||{}).name||'';
  if(Cc.status=='done'&&cmRecent(Cc.done,2)){const R=(Cc.pf||[]).map(p=>p.res).filter(Boolean),songs=[...new Set(R.flatMap(r=>(r.songs||[]).map(s=>s.title)))],mem={};R.forEach(r=>Object.entries(r.mem||{}).forEach(([id,x])=>{mem[id]=mem[id]||{e:0,mc:0};mem[id].e+=+x.e||0;mem[id].mc+=+x.mc||0}));
   const ids=Object.keys(mem).map(Number).filter(id=>get(id)),best=ids.sort((a,b)=>mem[b].e-mem[a].e)[0],mc=ids.filter(id=>mem[id].mc>0).sort((a,b)=>mem[b].mc-mem[a].mc)[0],its=[{i:'ccGreat',sub:'cc'+Cc.id,v:{}}];
   if(songs.length)its.push({i:'ccSong',sub:'cc'+Cc.id,v:{s:cmR(songs.slice(0,Math.min(8,songs.length)))}});if(best!=null)its.push({i:'ccMember',sub:best,v:{m:best}});if(mc!=null)its.push({i:'ccMC',sub:mc,v:{m:mc}});
   const hits=cmHist(gid).slice().sort((a,b)=>b.sales-a.sales).map(h=>h.s).filter(s=>s&&!songs.includes(s));if(hits.length){its.push({i:'ccRequest',sub:'song:'+hits[0],v:{s2:hits[0]},cs:{key:'song:'+gid+':'+hits[0],type:'song',gid,s:hits[0]}})}
   if(gids.length>1){const g2=gids[1],m2=parts.filter(m=>gsGid(m)==g2).sort((a,b)=>b.pop-a.pop)[0];its.push({i:'collab',sub:'cc'+Cc.id,v:{g2:(grp(g2)||{}).name||'',m:m2?m2.id:null}})}
   E.push({key:'cc:'+Cc.id,cat:'cc',gid,gids,imp:3,v:{cc:Cc.name||'',g:gn},its,lb:{en:Cc.name||'Concert',th:Cc.name||'คอนเสิร์ต'}})}
  if(['conf','sales','live'].includes(Cc.status)&&Cc.start!=null&&Cc.start-S.day>=1&&Cc.start-S.day<=10){const hits=cmHist(gid).slice().sort((a,b)=>b.sales-a.sales).map(h=>h.s).filter(Boolean);
   E.push({key:'precc:'+Cc.id,cat:'precc',gid,gids,imp:2,v:{cc:Cc.name||'',g:gn},its:[{i:'ccHype',sub:'cc'+Cc.id,v:{k:Cc.start-S.day}},...(hits.length?[{i:'setlistGuess',sub:'cc'+Cc.id,v:{s:cmR(hits.slice(0,4))}}]:[])],lb:{en:Cc.name||'Concert',th:Cc.name||'คอนเสิร์ต'}})}})}catch(e){console.error(e)}
 // theater
 try{const H=S.th&&S.th.pf||[],K=typeof thKeysAll=='function'?thKeysAll():[];for(let i=H.length-1;i>=0&&i>=H.length-60;i--){const p=H[i];if(!cmRecent(p.day,1))continue;const Kk=K.find(z=>z.key==p.k),gid=Kk?Kk.gid:main;if(!cmReal().some(g=>g.id==gid))continue;const st=(S.th.st||{})[p.st]||{},nm=st.name||p.nm||'';
  if(p.no==1&&!/Special|Birthday|Graduation/i.test(nm)){const U=(st.units||[]).filter(u=>(u.ids||[]).length>=2&&u.ids.every(id=>get(id))),its=[{i:'thDebut',sub:'st'+p.st,v:{}}];if(U.length){const u=cmR(U);its.push({i:'thUnit',sub:u.ids[0]+'-'+u.ids[1],v:{m:u.ids[0],m2:u.ids[1]}})}if(Kk&&Kk.kind!='team'||Math.random()<.4)its.push({i:'thUnder',sub:'g'+gid,v:{},cs:{key:'under:'+gid,type:'under',gid}});
   E.push({key:'thd:'+p.st,cat:'th',gid,imp:2,v:{st:nm,g:(grp(gid)||{}).name||''},its,lb:{en:nm,th:nm}})}
  if((p.rp||[]).length&&Math.random()<.25){const r=cmR(p.rp),inn=r&&r[1];if(get(inn))E.push({key:'ths:'+p.id,cat:'th',gid,imp:1,v:{st:nm},its:[{i:'thSub',sub:inn,v:{m:inn}}],lb:{en:nm,th:nm}})}}}catch(e){console.error(e)}
 // daily theater talk: some days, about a show that really happened and a member who really performed
 try{const H=S.th&&S.th.pf||[],K=typeof thKeysAll=='function'?thKeysAll():[];cmReal().forEach(g=>{const key='thp:'+g.id+':'+S.day;if(C.seen[key]!=null||Math.random()>.5*cmScale(g.id))return;
  const P=H.slice(-80).filter(p=>cmRecent(p.day,1)&&(K.find(z=>z.key==p.k)||{}).gid==g.id&&(p.mem||[]).length);if(!P.length)return;const p=cmR(P),st=((S.th.st||{})[p.st]||{}).name||p.nm||'',mem=p.mem.map(get).filter(Boolean);if(!mem.length)return;
  const pick=mem.slice().sort((a,b)=>b.pop*Math.random()-a.pop*Math.random()).slice(0,2),its=[...pick.map(m=>({i:'thPerf',sub:m.id,v:{m:m.id}})),{i:'thShow',sub:'st'+p.st,v:{}}];
  const best=k=>mem.slice().sort((a,b)=>(+b[k]||0)-(+a[k]||0))[Math.floor(Math.random()*Math.min(3,mem.length))];const vo=best('sing'),da=best('dance'),va=best('variety');if(vo)its.push({i:'thVocal',sub:vo.id,v:{m:vo.id}});if(da)its.push({i:'thDance',sub:da.id,v:{m:da.id}});if(va&&Math.random()<.5)its.push({i:'thMC',sub:va.id,v:{m:va.id}});
  E.push({key,cat:'th',gid:g.id,imp:1,v:{st,g:g.name},its,lb:{en:st,th:st}})})}catch(e){console.error(e)}
 // Request Hour
 try{if(typeof rhS=='function')rhS().list.forEach(R=>{if(R.status!='closed'||!Array.isArray(R.rank)||!R.rank.length)return;const key='rh:'+R.id;if(C.seen[key]!=null)return;const top=R.rank[0];const gid=R.gid!=null&&cmReal().some(g=>g.id==R.gid)?R.gid:main;
  E.push({key,cat:'rh',gid,imp:3,v:{g:(grp(gid)||{}).name||''},its:[{i:'rhTop',sub:'rh'+R.id,v:{s:top.title,r:1}},...(R.rank[1]?[{i:'rhTop',sub:'rh2'+R.id,v:{s:R.rank[1].title,r:2}}]:[])],lb:{en:'Request Hour',th:'Request Hour'},tag:'#RequestHour'})})}catch(e){}
 // members: promotions, captains, awards, special stages, solo debuts, transfers, graduation announcements
 S.members.forEach(m=>{const gid=gsGid(m);if(!cmReal().some(g=>g.id==gid))return;const gn=(grp(gid)||{}).name||'';
  (m.mh||[]).forEach(h=>{if(!cmRecent(h.day,1)||h.day<=0)return;const key='mh:'+m.id+':'+h.t+':'+h.day,t=teamOf(m);let it=null,imp=1;
   if(h.t=='promote'&&t){it={i:'promote',v:{tm:t.name}};imp=2}else if(h.t=='cap_start'){it={i:'captain',v:{}};imp=2}else if(h.t=='award'&&h.win){it={i:'award',v:{aw:h.cat||h.aw||''}};imp=2}else if(h.t=='bd_stage'){it={i:'bdStage',v:{}}}else if(h.t=='bday'){it={i:'bday',v:{}}}else if(h.t=='grad_stage'){it={i:'gradStage',v:{}};imp=2}
   else if(h.t=='solo_debut'){it={i:'soloDebut',v:{}};imp=2}else if((h.t=='team_join'&&!(m.mh||[]).some(z=>z.t=='promote'&&z.day==h.day)&&Math.random()<.5)||h.t=='transfer'||h.t=='group_transfer'){it={i:'teamMove',v:{tm:h.tname||h.gname||(t&&t.name)||''}}}
   if(it)E.push({key,cat:'ms',gid,imp,v:{g:gn},its:[{...it,sub:m.id,v:{...it.v,m:m.id}}],lb:{en:m.name,th:m.name}})});
  const G=m.grad;if(G&&G.kind!='dismiss'&&cmRecent(G.ann,1)){const key='grad:'+m.id+':'+G.ann,fc=(m.mh||[]).find(h=>h.t=='first_center')||(m.mh||[]).find(h=>h.t=='first_sen'),its=[{i:'gradSad',sub:m.id,v:{m:m.id}},{i:'gradThanks',sub:m.id,v:{m:m.id}}];if(fc&&fc.title)its.push({i:'gradMemory',sub:m.id,v:{m:m.id,t:fc.title}});
   E.push({key,cat:'ms',gid,imp:3,v:{g:gn},its,lb:{en:CMT(`${m.name} graduation`,`${m.name} จบการศึกษา`),th:`${m.name} จบการศึกษา`}})}});
 // units
 (S.groups||[]).filter(g=>g.type=='unit').forEach(g=>{const R=(g.unit&&g.unit.roster)||[];if(cmRecent(g.formed,1)&&R.length>=2)E.push({key:'unit:'+g.id,cat:'unit',gid:main,gids:[...new Set(R.map(id=>gsGid(get(id)||{})).filter(x=>x!=null))],imp:2,v:{u:g.name,g:(grp(main)||{}).name},its:[{i:'unitNew',sub:'u'+g.id,v:{m:R[0],m2:R[1]}}],lb:{en:g.name,th:g.name}});
  (gsCtx(g.id,'singles')||[]).filter(x=>cmRecent(x.relDay??x.day,1)).forEach(x=>E.push({key:'urel:'+g.id+':'+(x.rid||x.title),cat:'unit',gid:main,gids:[...new Set(R.map(id=>gsGid(get(id)||{})).filter(v=>v!=null))],imp:2,v:{u:g.name,t:x.title},its:[{i:'unitRel',sub:'u'+g.id+x.title,v:{}}],lb:{en:g.name,th:g.name}}))});
 return E}
// ---- campaigns -----------------------------------------------------------------------------------------------------------------
function cmTag(c){const m=get(c.mid),n=m?cmFirst(m).replace(/[^A-Za-z0-9]/g,''):'';const g=grp(c.gid);return c.type=='cen'?`#GiveHerACenter_${n}`:c.type=='sen'?`#${n}ToSenbatsu`:c.type=='song'?`#BringBack${String(c.s||'').replace(/[^A-Za-z0-9]/g,'')}`:c.type=='under'?`#MoreUnderGirls_${g?gsShort(g):''}`:`#WeWantAnotherConcert_${g?gsShort(g):''}`}
function cmCampaigns(budget){const C=cmS();let made=0;
 // the concern keeps coming back → a campaign starts (never on its own)
 Object.entries(C.cs).forEach(([k,c])=>{if(made>=budget)return;if(c.n<2||c.d0)return;if(C.camp.some(x=>x.key==k&&(x.act||S.day-x.d<120)))return;if(c.type=='under'){const H=cmHist(c.gid),M=cmGMembers(c.gid).filter(m=>isAct(m)&&m.status!='trainee');if(M.length<12||M.filter(m=>H.slice(-3).every(h=>!cmIn(h,m.id))).length/M.length<.35)return}if(c.mid!=null){const m=get(c.mid);if(!m||m.status=='graduated')return}
  const camp={key:k,type:c.type,gid:c.gid,mid:c.mid??null,s:c.s||null,d:S.day,act:true,posts:0,k:c.k||c.n};camp.tag=cmTag(camp);C.camp.push(camp);c.d0=S.day;
  made+=cmCampPost(camp,true)});
 C.camp.filter(x=>x.act).forEach(x=>{
  // resolved: she got the Center / the senbatsu, or the song was performed again
  try{const H=cmHist(x.gid),L=H[H.length-1];if(x.type=='cen'&&L&&L.d>x.d&&L.cen.includes(x.mid))x.res='done';if(x.type=='sen'&&L&&L.d>x.d&&cmIn(L,x.mid))x.res='done'}catch(e){}
  if(x.res||S.day-x.d>21){x.act=false;x.end=S.day;const c=C.cs[x.key];if(c){c.n=0;c.evs=[];c.d0=0}return}
  if(made<budget&&x.posts<7&&Math.random()<.35)made+=cmCampPost(x,false)});
 if(C.camp.length>60)C.camp.splice(0,C.camp.length-60)}
const CM_CPLUS={en:["Adding my voice. {tag}","Not stopping until someone at the office notices {tag}","Sharing every {tag} post I see today","One more for the tag {tag}","Quietly supporting this {tag}"],th:["ขอเพิ่มอีกเสียง {tag}","จะติดแท็กจนกว่าค่ายจะเห็น {tag}","รีทุกโพสต์ที่มี {tag} วันนี้","มาช่วยดันแท็กอีกแรง {tag}","ซัพพอร์ตเงียบๆ อยู่ตรงนี้นะ {tag}"]};
function cmCampPost(x,first){const C=cmS(),g=grp(x.gid);if(!g)return 0;let H=[];try{H=cmHist(x.gid)}catch(e){}
 const it=first?{i:{cen:'campCenter',sen:'campSen',song:'campSong',under:'campUnder',conc:'campConcert'}[x.type],sub:x.key,v:{m:x.mid,s:x.s,k:x.type=='sen'?cmStreakOut(H,x.mid):x.type=='cen'?H.filter(h=>cmIn(h,x.mid)).length:x.type=='under'?cmGMembers(x.gid).filter(m=>isAct(m)&&m.status!='trainee'&&H.slice(-3).every(h=>!cmIn(h,m.id))).length:x.k,tag:x.tag,g:g.name}}:null;
 const ev={key:'camp:'+x.key+':'+x.d,cat:'camp',gid:x.gid,imp:x.posts>3?2:1,v:{tag:x.tag,g:g.name},its:[],lb:{en:x.tag,th:x.tag}};const used=new Set();
 const a=cmPickAcc(ev,{i:it?it.i:'campSen',sub:x.mid},used);if(!a)return 0;let tx;
 if(it)tx=cmCompose(ev,it,a);else{const ve=cmVar('ce:'+x.key,CM_CPLUS.en,40),vt=cmVar('ct:'+x.key,CM_CPLUS.th,40);if(!ve||!vt)return 0;tx={en:cmFill(ve.s,{tag:x.tag},'en',a),th:cmTh(cmFill(vt.s,{tag:x.tag},'th',a)),tone:'u'};const he=nwHash(tx.en),ht=nwHash(tx.th);if(C.fp.some(f=>f.he==he||f.ht==ht))return 0;
  C.vc['ce:'+x.key+':'+ve.i]=S.day;C.vc['ct:'+x.key+':'+vt.i]=S.day;C.fp.push({d:S.day,i:'campPlus',mk:'campPlus|'+x.key+S.day,ev:'camp',tk:[],he,ht})}
 if(!tx)return 0;a.last=S.day;const sc=cmScale(x.gid);const p={id:'cp'+(++C.seq),d:S.day,hr:Math.floor(cmRnd(9,23)),gid:x.gid,a:a.id,h:a.h,ag:a.gid,i:it?it.i:'campPlus',cat:'camp',imp:2,en:tx.en,th:tx.th,tone:'u',tag:x.tag,top:x.tag,lb:{en:x.tag,th:x.tag},rel:{m:x.mid,s:x.s,t:null},lk:Math.round(cmLikes(a,2,sc)*(1+x.posts*.25)),rp:[],ev:ev.key};
 cmReplies(p,{...ev,H},Math.random()<.5?1:0);C.posts.push(p);x.posts++;return 1}
// ---- trending --------------------------------------------------------------------------------------------------------------------
function cmTrend(){const C=cmS(),T={};C.posts.filter(p=>S.day-p.d<=2).forEach(p=>{const k=p.top;if(!k)return;const w=[1,.6,.35][S.day-p.d]||.3,t=T[k]=T[k]||{k,lb:p.lb,tag:p.tag&&p.top==p.tag?p.tag:(p.tag||null),gid:p.gid,acc:new Set(),rp:0,lk:0,n:0,camp:p.cat=='camp'};
  t.acc.add(p.a);p.rp.forEach(r=>t.acc.add(r.a));t.rp+=p.rp.length*w;t.lk+=p.lk*w;t.n++});
 const cur=new Set();cmReal().forEach(g=>{const p=gsCtx(g.id,'pj');if(p&&p.status=='producing')cur.add('sen:'+g.id+':'+(p.id||p.title))});
 const L=Object.values(T).map(t=>{let sc=t.acc.size*4+t.rp*2+t.lk/40;if(cur.has(t.k))sc*=1.3;if(t.camp)sc*=1.15;return{k:t.k,lb:t.lb,tag:t.tag,gid:t.gid,acc:t.acc.size,n:t.n,sc:Math.round(sc),camp:t.camp}}).filter(t=>t.acc>=3&&t.n>=2&&t.sc>=30).sort((a,b)=>b.sc-a.sc).slice(0,6);
 C.trend={d:S.day,L}}
// ---- impact: aggregated, small, rate-limited, through the existing popularity formula ----------------------------------------
function cmImpact(){const C=cmS(),B={};C.posts.filter(p=>p.d==S.day&&p.rel&&p.rel.m!=null).forEach(p=>{B[p.rel.m]=(B[p.rel.m]||0)+p.lk/100+p.rp.length*.6+(p.tone=='p'?.5:0)});
 Object.entries(B).forEach(([id,b])=>{const m=get(+id);if(!m||m.status=='graduated')return;const last=C.imp[id]||{};
  const camp=C.camp.find(x=>x.act&&x.mid==+id&&(C.trend.L||[]).some(t=>t.k==x.tag));
  if(camp&&S.day-(last.h??-99)>=21){try{gainPop(m,.8)}catch(e){}C.imp[id]={...last,h:S.day,lv:'high'};return}
  if(b>=4&&S.day-(last.m??-99)>=7){try{gainPop(m,.3)}catch(e){}C.imp[id]={...last,m:S.day,lv:'med'}}})}
// ---- daily ----------------------------------------------------------------------------------------------------------------------
function cmDaily(){if(!S||!S.members||!S.groups)return;const C=cmS();if(C.dayDone===S.day)return;C.dayDone=S.day;
 try{cmReal().forEach(g=>cmAccs(g.id));if(S.day%7==0)cmRefresh()}catch(e){console.error(e)}
 let E=[];try{E=cmCollect()}catch(e){console.error('community',e)}
 // the most important first; a quiet day stays quiet
 E.sort((a,b)=>b.imp-a.imp||Math.random()-.5);let left=Math.round(cmRnd(10,18));E.forEach(ev=>{if(left>0)left-=cmEmit(ev,left);else C.seen[ev.key]=C.seen[ev.key]??S.day});
 try{cmCampaigns(Math.max(1,Math.min(3,left)))}catch(e){console.error(e)}
 // likes grow for a few days; a few late replies on lively threads
 C.posts.forEach(p=>{const age=S.day-p.d;if(age>=1&&age<=4){p.lk+=Math.round(p.lk*(.35/age)*cmRnd(.6,1.2))}if(age==1&&p.imp>=2&&p.rp.length<5&&Math.random()<.2){try{cmReplies(p,{gid:p.gid,gids:[p.gid],cat:p.cat,H:cmHist(p.gid)},1)}catch(e){}}});
 try{cmTrend();cmImpact()}catch(e){console.error(e)}
 // retention: visible feed is recent; older posts are dropped, memory of meanings stays in fp / seen
 if(C.posts.length>CM_MAXP)C.posts.splice(0,C.posts.length-CM_MAXP);C.posts=C.posts.filter(p=>S.day-p.d<=60);
 Object.keys(C.seen).forEach(k=>{if(S.day-C.seen[k]>400)delete C.seen[k]});Object.keys(C.vc).forEach(k=>{if(S.day-C.vc[k]>60)delete C.vc[k]})}
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{cmDaily()}catch(e){console.error('community',e)}return r}}
// first load: accounts, past events are not replayed (only the last days), old news data is gone
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{if(S){delete S.news;const C=cmS();if(!C.init){C.init=S.day;try{if(typeof rhS=='function')rhS().list.forEach(R=>{if(R.status=='closed')C.seen['rh:'+R.id]=S.day})}catch(e){}cmReal().forEach(g=>cmAccs(g.id))}}}catch(e){console.error(e)}return r}}
// ---- UI -------------------------------------------------------------------------------------------------------------------------
const CM_ICO={like:'<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 21s-7-4.4-9.3-9C1.2 8.8 3 5 6.6 5c2 0 3.4 1.1 4.4 2.6C12 6.1 13.4 5 15.4 5 19 5 20.8 8.8 19.3 12 17 16.6 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
 rep:'<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
 up:'<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M4 17l6-6 4 4 6-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'};
function cmAgo(p){const n=S.day-p.d;if(n<=0){const h=Math.max(1,22-p.hr);return CMT(`${h}h`,`${h} ชม.`)}if(n==1)return CMT('1d','เมื่อวาน');return CMT(`${n}d`,`${n} วัน`)}
function cmFmt(n){return n>=10000?(n/1000).toFixed(0)+'K':n>=1000?(n/1000).toFixed(1)+'K':String(n)}
function cmAv(h,gid){const g=grp(gid),c=g?g.color:'#e05a8a';let x=0;for(const ch of h)x=(x*31+ch.charCodeAt(0))>>>0;const hue=x%360;return`<span class="cmav" style="background:linear-gradient(135deg,hsl(${hue} 70% 72%),${c})">${esc(h.charAt(0).toUpperCase())}</span>`}
function cmGChip(gid){const g=grp(gid);return g?`<span class="cmg" style="--gc:${g.color}">${esc(gsShort(g))}</span>`:''}
function cmAcc(id,gid){return((cmS().acc[gid]||[]).find(a=>a.id==id))||null}
function cmPostHtml(p,full){const th=CM_TH(),m=p.rel&&p.rel.m!=null?get(p.rel.m):null,a=cmAcc(p.a,p.ag),om=a&&a.oshi!=null?get(a.oshi):null;
 return`<div class="cmp ${full?'full':''}" ${full?'':`onclick="cmOpen('${p.id}')"`}>${cmAv(p.h,p.ag)}<div class="cmb"><div class="cmh"><b>@${esc(p.h)}</b>${cmGChip(p.gid)}${om?`<small class="cmo">${CMT('Oshi','โอชิ')}: ${esc(cmFirst(om))}</small>`:''}<span class="cmt">${cmAgo(p)}</span></div>
 <div class="cmx">${esc(th?p.th:p.en)}</div>${(m||p.rel.s||p.lb)?`<div class="cmrel">${m?`<span class="cmm" onclick="event.stopPropagation();mpOpen(${m.id})">${ptc(m,22)}${esc(m.name)}</span>`:''}${p.rel.s?`<span class="cmtopic">${esc(p.rel.s)}</span>`:p.lb&&!(m&&p.lb.en==m.name)?`<span class="cmtopic">${esc(th?p.lb.th:p.lb.en)}</span>`:''}${p.tag&&!(th?p.th:p.en).includes(p.tag)?`<span class="cmtag">${esc(p.tag)}</span>`:''}</div>`:''}
 <div class="cmf"><span>${CM_ICO.like}${cmFmt(p.lk)}</span><span>${CM_ICO.rep}${p.rp.length}</span></div></div></div>`}
function cmOpen(id){const p=cmS().posts.find(x=>x.id==id);if(!p)return;const th=CM_TH();ui.mod={t:'html',h:`<div class="cmthread"><h2 class="ht">${CMT('Discussion','กระทู้')}</h2>${cmPostHtml(p,1)}<div class="cmreps">${p.rp.length?p.rp.map(r=>`<div class="cmrp">${cmAv(r.h,r.gid)}<div class="cmb"><div class="cmh"><b>@${esc(r.h)}</b>${cmGChip(r.gid)}<span class="cmt">${cmAgo({d:r.d,hr:r.hr})}</span></div><div class="cmx">${esc(th?r.th:r.en)}</div><div class="cmf"><span>${CM_ICO.like}${cmFmt(r.lk)}</span></div></div></div>`).join(''):`<p class="st">${CMT('No replies yet.','ยังไม่มีคนตอบ')}</p>`}</div></div>`};render()}
function cmFeed(flt){const C=cmS();return C.posts.filter(p=>S.day-p.d<=7&&flt(p)).sort((a,b)=>b.d-a.d||b.hr-a.hr).slice(0,70)}
V.community=function(){const C=cmS(),tab=ui.cmt||'all',main=cmMainId(),sis=cmReal().filter(g=>g.id!=main),T=(k,n)=>`<button class="tabb ${tab==k?'on':''}" onclick="ui.cmt='${k}';ui.cmtop=null;render()">${n}</button>`;
 let body='';const empty=`<div class="c cmempty"><p class="st">${CMT('It is quiet right now. Fans talk when something happens: announcements, releases, shows and events.','ตอนนี้ยังเงียบๆ แฟนๆ จะคุยกันเมื่อมีเรื่องเกิดขึ้น เช่น ประกาศ การปล่อยผลงาน การแสดง และอีเวนต์')}</p></div>`;
 if(tab=='trend'){const L=(C.trend&&C.trend.L)||[],ca=C.camp.filter(x=>x.act),old=C.camp.filter(x=>!x.act).slice(-8).reverse();
  body=`<div class="c"><h3>${CMT('Trending now','กำลังเป็นกระแส')}</h3>${L.length?L.map((t,i)=>`<button class="cmtr" onclick="ui.cmt='all';ui.cmtop='${esc(t.k)}';render()"><span class="cmrk">${i+1}</span><span class="cmtrb"><b>${esc(t.tag&&t.camp?t.tag:(CM_TH()?t.lb.th:t.lb.en))}</b><small>${cmGChip(t.gid)} ${t.acc} ${CMT('fans talking','คนกำลังพูดถึง')} · ${t.n} ${CMT('posts','โพสต์')}</small></span>${CM_ICO.up}</button>`).join(''):`<p class="st">${CMT('Nothing is trending today. A topic trends only when many fans join the same discussion.','วันนี้ยังไม่มีเรื่องที่เป็นกระแส หัวข้อจะติดเทรนด์เมื่อแฟนหลายคนร่วมคุยเรื่องเดียวกัน')}</p>`}</div>
  <div class="c"><h3>${CMT('Fan campaigns','แคมเปญของแฟนๆ')}</h3>${ca.length?ca.map(x=>`<div class="cmcamp"><b>${esc(x.tag)}</b>${cmGChip(x.gid)}<small>${CMT('since','ตั้งแต่')} ${jd(x.d)} · ${x.posts} ${CMT('posts','โพสต์')}</small></div>`).join(''):`<p class="st">${CMT('No active campaign. Campaigns start only when the same wish keeps coming back in separate discussions.','ยังไม่มีแคมเปญ แคมเปญจะเกิดเมื่อแฟนพูดเรื่องเดิมซ้ำในหลายกระทู้')}</p>`}
  ${old.length?`<h3>${CMT('Earlier campaigns','แคมเปญที่ผ่านมา')}</h3>${old.map(x=>`<div class="cmcamp old"><b>${esc(x.tag)}</b><small>${jd(x.d)} – ${x.end!=null?jd(x.end):''}${x.res?' · '+CMT('wish came true','สมหวังแล้ว'):''}</small></div>`).join('')}`:''}<p class="st">${CMT('Management does not have to follow fan campaigns.','ฝ่ายบริหารไม่จำเป็นต้องทำตามแคมเปญของแฟน')}</p></div>`}
 else{const flt=tab=='main'?(p=>p.gid==main):tab=='sis'?(p=>p.gid!=main):(()=>true),top=ui.cmtop,L=cmFeed(p=>flt(p)&&(!top||p.top==top));
  body=(top?`<div class="c row"><span class="st">${CMT('Topic','หัวข้อ')}: <b>${esc((L[0]&&(CM_TH()?L[0].lb.th:L[0].lb.en))||top)}</b></span><button class="b s" onclick="ui.cmtop=null;render()">${CMT('Show all','ดูทั้งหมด')}</button></div>`:'')+(L.length?`<div class="cmfeed">${L.map(p=>cmPostHtml(p)).join('')}</div>`:empty)}
 const tr=((C.trend&&C.trend.L)||[]).slice(0,3);
 return`<h2 class="ht">${CMT('Fan Community','คอมมูนิตี้แฟนคลับ')}</h2><div class="row gstabs cmtabs">${T('all',CMT('All','ทั้งหมด'))}${T('main',esc((grp(main)||{}).name||CMT('Player Group','วงของเรา')))}${sis.length?T('sis',CMT('Sister Groups','วงน้องสาว')):''}${T('trend',CMT('Trending','กระแส'))}</div>
 ${tab!='trend'&&tr.length?`<div class="cmtrend-strip">${tr.map(t=>`<button class="cmchip" onclick="ui.cmt='all';ui.cmtop='${esc(t.k)}';render()">${CM_ICO.up}${esc(t.tag&&t.camp?t.tag:(CM_TH()?t.lb.th:t.lb.en))}</button>`).join('')}</div>`:''}${body}`};
(function(){try{if(!SECS.some(s=>s.k=='community')){const i=SECS.findIndex(s=>s.k=='fans');SECS.splice(i<0?SECS.length:i+1,0,{k:'community',n:'Fan Community',sh:'Community',jp:'コミュニティ',loc:'Fan Community · Timeline',sc:'fanclub',v:[['community','Community']]})}
 if(typeof SUBLOC!='undefined')SUBLOC.community='Fan Community · Timeline';if(typeof SC_VIEW!='undefined')SC_VIEW.community='fanclub';
 // units / solo contexts: the community is a page of the groups
 if(typeof U_BLOCK_V!='undefined'){const f=V.community;V.community=function(){if(typeof uCur=='function'&&uCur())return uBlockHtml();return f.apply(this,arguments)}}}catch(e){console.error(e)}})();
