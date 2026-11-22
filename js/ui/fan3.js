// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Fanbase System v3 (unified fan identity)
// -------------------------------------------------------------------------------------
//  ONE fan database: S.fb.segs. Every segment ("cohort") is a block of individual fans who share
//  the same profile; every fan has her own Fan ID (fr = list of [first ID, count] ranges), so a fan
//  is counted once wherever she appears. Former fans keep their IDs in S.fb.fx.fmr.ids.
//  Per segment: n fans · k = the Kami Oshi of each of them (EXACTLY one, an active member) ·
//  o{member: fans} = Oshi (≤ n per member, never the Kami Oshi, at most 5 per fan: Σo ≤ 5n) ·
//  u{member: fans} = other supporters (like / follow the member without Oshi; ≤ n − o[member]) ·
//  ft = Casual / Regular / Dedicated / Hardcore, or Dormant (Former fans leave the segments) ·
//  loy, eng (activity), sp (spending power), h = purchase & participation history, born, last.
//  The individual relationship set of every Fan ID is derived deterministically from the counts
//  (fdFan): Kami Oshi = k; Oshi and other supporters are laid out as cyclic intervals, which
//  guarantees ≤ 5 Oshi per fan, no member twice and no overlap with the Kami Oshi.
//  Derived numbers (never stored separately any more):
//   · Group fanbase of a group = unique fans (active + dormant) supporting it (fdGroupFans).
//   · Company fans S.fans = all unique fans.  · Member Supporters m.fans = Kami + Oshi + Other.
//  Old calculations are replaced: fbAcquire (new fans: diminishing returns by fanbase size and a
//  purpose per activity), fbSync (gains booked by older formulas on S.fans / m.fans are treated as
//  SIGNALS and converted by the new rules, then the derived numbers are written back), fbSplit /
//  fbMerge / fbFix (keep IDs, supporters and the rules), the second "Kami Oshi in another group"
//  (k2) is gone, and fan-limit.js is no longer needed.
// =====================================================================================
let FD_KW=null;const FD_V=3,FD_OMAX=5,FD_XG=.15; // at most 15% of a cohort also has an Oshi in a sister group
const FD_TYPE={casual:'Casual',oshi:'Regular',dedicated:'Dedicated',hardcore:'Hardcore',dormant:'Dormant'};
// purpose of each activity: share of its "new fans" signal that really becomes new fans; the rest strengthens existing fans
const FD_PURP=[[/theat|stage|revival|dvd/i,.25,'retain'],[/concert|live|tour|arena|dome/i,.4,'loyal'],[/handshake|hi-?touch|meet/i,.2,'bond'],[/election|vote|ballot/i,.3,'engage'],[/roadshow|regional/i,.8,'reach'],[/mv|video|youtube/i,.9,'reach'],[/news|media|tv|award|festival|program|magazine/i,.7,'attention'],[/single|album|release|cd|chart|song/i,1,'discover']];
const fdPurp=org=>{for(const p of FD_PURP)if(p[0].test(org||''))return p;return[null,.8,'other']};
const fdAct=()=>(S&&S.members||[]).filter(m=>m.status!='graduated'),fdIds=()=>new Set(fdAct().map(m=>m.id));
// ---- Fan IDs ---------------------------------------------------------------------------------------------------------
function fdSeq(n){const fb=S.fb;fb.fseq=fb.fseq|0;const a=fb.fseq+1;fb.fseq+=n;return[a,n]}
function fdFrN(fr){return(fr||[]).reduce((a,r)=>a+r[1],0)}
function fdTake(s,n){const out=[];let left=n;while(left>0&&s.fr&&s.fr.length){const r=s.fr[s.fr.length-1];if(r[1]<=left){out.unshift(r);s.fr.pop();left-=r[1]}else{out.unshift([r[0]+r[1]-left,left]);r[1]-=left;left=0}}return out}
function fdFrFix(s){const have=fdFrN(s.fr);if(!Array.isArray(s.fr))s.fr=[];if(have<s.n)s.fr.push(fdSeq(s.n-have));else if(have>s.n){const ex=fdTake(s,have-s.n);(S.fb.fidFree=S.fb.fidFree||[]).push(...ex.slice(0,50))}}
const fdFid=n=>'FAN-'+String(n).padStart(6,'0');
// ---- the rules (every segment, after every change) -----------------------------------------------------------------------
function fdGrpOf(id){const m=get(id);return m?(typeof gsGid=='function'?gsGid(m):m.group):null}
function fdAppealW(m){return(m.pop+5)*(1+((S.fb&&S.fb.exp&&S.fb.exp[m.id])||0)*.15)}
function fdPickKami(s,act,ids){const cand=[...Object.entries(s.o||{}),...Object.entries(s.u||{})].filter(([j,c])=>c>0&&ids.has(+j)).sort((a,b)=>b[1]-a[1]);if(cand.length)return+cand[0][0];
 let L=act;const g=s.gs!=null?act.filter(m=>(typeof gsGid=='function'?gsGid(m):m.group)==s.gs):[];if(g.length)L=g;if(!L.length)return null;
 const W=L.map(fdAppealW),T=W.reduce((a,b)=>a+b,0);let r=((s.fr&&s.fr[0]?s.fr[0][0]:s.n)*9301+49297)%233280/233280*T;for(let i=0;i<L.length;i++){r-=W[i];if(r<0)return L[i].id}return L[0].id}
function fdFixSeg(s,act,ids){s.n=Math.max(0,Math.round(s.n||0));s.o=s.o||{};s.u=s.u||{};
 if(s.k2){for(const g in s.k2){const z=s.k2[g];if(z&&ids.has(z.m)&&z.m!=s.k)s.o[z.m]=Math.max(s.o[z.m]||0,Math.min(s.n,z.n))}delete s.k2}
 if(s.ft=='collector')s.ft='dedicated';if(!FD_TYPE[s.ft])s.ft='casual';
 if(s.k==null||!ids.has(s.k))s.k=fdPickKami(s,act,ids);
 const kg=fdGrpOf(s.k),xg=Math.ceil(s.n*FD_XG);for(const j in s.o){if(+j==s.k||!ids.has(+j)||!(s.o[j]>0))delete s.o[j];else{s.o[j]=Math.min(s.n,Math.round(s.o[j]));if(fdGrpOf(+j)!=kg&&s.o[j]>xg)s.o[j]=xg}}
 let tot=0;for(const j in s.o)tot+=s.o[j];const cap=FD_OMAX*s.n;if(tot>cap){const L=Object.entries(s.o).sort((a,b)=>a[1]-b[1]);let over=tot-cap;for(const[j,c]of L){if(over<=0)break;const d=Math.min(c,over);s.o[j]=c-d;over-=d;if(!s.o[j])delete s.o[j]}}
 for(const j in s.u){if(+j==s.k||!ids.has(+j)||!(s.u[j]>0))delete s.u[j];else s.u[j]=Math.max(0,Math.min(s.n-(s.o[j]||0),Math.round(s.u[j])));if(!s.u[j])delete s.u[j]}
 // support for sister-group members (Oshi + other) stays a minority of the cohort: ≤ 15% of its fans in total
 {const X=[...new Set([...Object.keys(s.o),...Object.keys(s.u)])].filter(j=>fdGrpOf(+j)!=kg);const tot=X.reduce((a,j)=>a+(s.o[j]||0)+(s.u[j]||0),0);if(tot>xg){const f=xg/tot;X.forEach(j=>{if(s.o[j]){s.o[j]=Math.floor(s.o[j]*f);if(!s.o[j])delete s.o[j]}if(s.u[j]){s.u[j]=Math.floor(s.u[j]*f);if(!s.u[j])delete s.u[j]}})}}
 s.h=s.h||{};s.born=s.born??S.day;s.last=s.last??S.day;fdFrFix(s)}
function fdFixAll(){const fb=S&&S.fb;if(!fb||!Array.isArray(fb.segs))return;const act=fdAct(),ids=new Set(act.map(m=>m.id));
 // fans without a (valid) Kami Oshi: a big cohort is spread over the members (its Oshi first, then appeal), never given to one member
 fb.segs.filter(s=>s.n>=8&&(s.k==null||!ids.has(s.k))).forEach(s=>{s.k=null;const L=s.gs!=null&&act.some(m=>fdGrpOf(m.id)==s.gs)?act.filter(m=>fdGrpOf(m.id)==s.gs):act;fdSpreadKami(s,L,FD_KW)});fb.segs.forEach(s=>fdFixSeg(s,act,ids));fb.segs=fb.segs.filter(s=>s.n>0&&s.k!=null);fb.ver=(fb.ver||0)+1}
// ---- derived numbers ---------------------------------------------------------------------------------------------------------
// same answer as fdSegGroups(s).has(g), without building a Set (it runs for every cohort on every fan change)
function fdSegHas(s,g){s.o=s.o||{};s.u=s.u||{};let any=false;if(s.k!=null){const x=fdGrpOf(s.k);if(x!=null){any=true;if(x==g)return true}}for(const j in s.o){const x=fdGrpOf(j);if(x!=null){any=true;if(x==g)return true}}for(const j in s.u){const x=fdGrpOf(j);if(x!=null){any=true;if(x==g)return true}}return!any&&s.gs!=null&&s.gs==g}
function fdSegGroups(s){s.o=s.o||{};s.u=s.u||{};const G=new Set(),add=j=>{const g=fdGrpOf(+j);if(g!=null)G.add(g)};if(s.k!=null)add(s.k);for(const j in s.o)add(j);for(const j in s.u)add(j);if(!G.size&&s.gs!=null)G.add(s.gs);return G}
// how many fans of a cohort support a group: all of them if their Kami Oshi is in it, else the union of the Oshi / other-supporter
// intervals of its members in that group (the same layout as fdFanOf, so it matches the individual fans exactly)
function fdLayout(s){s.o=s.o||{};s.u=s.u||{};const n=s.n,L={};let off=0;Object.keys(s.o).sort((a,b)=>a-b).forEach(j=>{const c=s.o[j];L[j]=[off%n,c+(s.u[j]||0)];off+=c});Object.keys(s.u).filter(j=>!(j in s.o)).sort((a,b)=>a-b).forEach(j=>{L[j]=[(off+(+j)*7)%n,s.u[j]]});return L}
function fdSegGroupN(s,gid){if(fdGrpOf(s.k)==gid)return s.n;const n=s.n,L=fdLayout(s),iv=[];for(const j in L){if(fdGrpOf(+j)!=gid)continue;const[a,len]=L[j];if(len<=0)continue;if(len>=n)return n;if(a+len<=n)iv.push([a,a+len]);else{iv.push([a,n]);iv.push([0,a+len-n])}}
 if(!iv.length)return 0;iv.sort((x,y)=>x[0]-y[0]);let tot=0,cs=iv[0][0],ce=iv[0][1];for(const[a,b]of iv.slice(1)){if(a<=ce)ce=Math.max(ce,b);else{tot+=ce-cs;cs=a;ce=b}}tot+=ce-cs;return Math.min(n,tot)}
function fdGroupFans(gid){let n=0;(S.fb&&S.fb.segs||[]).forEach(s=>{n+=fdSegGroupN(s,gid)});return n}
function fdSup(){const M={};fdAct().forEach(m=>M[m.id]={k:0,o:0,u:0,kd:0,od:0,ud:0});(S.fb&&S.fb.segs||[]).forEach(s=>{const d=s.ft=='dormant';if(M[s.k]){M[s.k].k+=s.n;if(d)M[s.k].kd+=s.n}for(const j in s.o)if(M[j]){M[j].o+=s.o[j];if(d)M[j].od+=s.o[j]}for(const j in s.u)if(M[j]){M[j].u+=s.u[j];if(d)M[j].ud+=s.u[j]}});
 Object.values(M).forEach(X=>{X.t=X.k+X.o+X.u;X.dorm=X.kd+X.od+X.ud;X.active=X.t-X.dorm});return M}
// write the derived numbers back: S.fans, every member's supporters (m.fans) and her popularity
function fdWrite(){const fb=S.fb;const M=fdSup();S.fans=fb.segs.reduce((a,s)=>a+s.n,0);fb.lastS=S.fans;fdAct().forEach(m=>{const X=M[m.id];if(!X)return;m.fans=X.t;fb.mf[m.id]=m.fans;try{m.pop=popOf(m)}catch(e){}});fb.ver++}
// ---- growth: new fans (diminishing returns, purpose of the activity) ------------------------------------------------------------------
function fdDim(F){return 1/Math.pow(1+Math.max(0,F)/150000,.6)}
const _fdAcq=fbAcquire;
fbAcquire=function(n,o={}){const fb=fbState();n=Math.round(n);if(!fb||!Number.isFinite(n)||n<=0)return;const org=o.org||'Group activity',P=fdPurp(org),F=fb.segs.reduce((a,s)=>a+s.n,0);
 const raw=n,eff=fbRound(n*P[1]*fdDim(F));fdPurpose(P[2],raw,F,o);if(eff<=0)return;
 const before=new Set(fb.segs);_fdAcq.call(this,eff,o);const act=fdAct(),ids=new Set(act.map(m=>m.id));
 // the new segments: exactly one Kami Oshi each (the member who attracted them for a share, else the one they like most), some casual likes
 const gid=o.gid!=null?o.gid:(o.mid!=null?fdGrpOf(o.mid):(typeof gsAg=='function'?gsAg():null)),cand=act.filter(m=>gid==null||fdGrpOf(m.id)==gid);
 fb.segs.filter(s=>!before.has(s)).forEach(s=>{if(s.k==null){if(o.mid!=null&&ids.has(o.mid)&&Math.random()<.5){s.k=o.mid;delete s.o[o.mid]}else fdSpreadKami(s,cand.length?cand:act)}});
 fb.segs.filter(s=>!before.has(s)).forEach(s=>{s.org=org;
  fdFixSeg(s,act,ids);s.born=S.day;s.last=S.day;s.src=org;const gl=act.filter(m=>m.id!=s.k&&fdGrpOf(m.id)==fdGrpOf(s.k));
  const likes=gl.sort((a,b)=>fdAppealW(b)-fdAppealW(a)).slice(0,3);likes.forEach((m,i)=>{const c=fbRound((s.n-(s.o[m.id]||0))*(.25-.07*i)*Math.random());if(c>0)s.u[m.id]=(s.u[m.id]||0)+c});fdFixSeg(s,act,ids)});fb.ver++;if(!FBW&&!FD_IN){if(FD_DEFER)FD_DIRTY=1;else{fdFixAll();fdWrite()}}};let FD_IN=0,FD_DEFER=0,FD_DIRTY=0;
// new fans without a Kami Oshi choose one: a big batch is split over the members by appeal (and their Oshi choice), so a batch never follows one member
function fdSpreadKami(s,L,wf){if(!L.length)return;s.o=s.o||{};s.u=s.u||{};const W=L.map(m=>[m,(wf?wf(m):fdAppealW(m))*(1+3*(s.o[m.id]||0)/Math.max(1,s.n))*(.6+Math.random()*.8)]).sort((a,b)=>b[1]-a[1]);if(s.n<8){let r=Math.random()*W.reduce((a,b)=>a+b[1],0);for(const[m,w]of W){r-=w;if(r<0){s.k=m.id;break}}if(s.k==null)s.k=W[0][0].id;delete s.o[s.k];return}
 const T=W.slice(0,10),Tw=T.reduce((a,b)=>a+b[1],0),n0=s.n;T.slice(1).forEach(([m,w])=>{const c=fbRound(n0*w/Tw);if(c>0&&c<s.n){const t=fbSplit(s,c);t.k=m.id;delete t.o[m.id];delete t.u[m.id]}});s.k=T[0][0].id;delete s.o[s.k];delete s.u[s.k]}
// what an activity does to existing fans (its main purpose), proportional to the activity and limited
function fdPurpose(kind,raw,F,o){if(!F||!(raw>0))return;const fb=S.fb,x=Math.min(1,raw/Math.max(1,F)),mids=o.mid!=null?new Set([o.mid]):null,hit=s=>!mids||mids.has(s.k)||(s.o&&s.o[o.mid]);
 if(kind=='retain'||kind=='other')fb.segs.forEach(s=>{if(hit(s)){s.loy=fbCl(s.loy+3*x+.2);s.last=S.day}});
 else if(kind=='loyal'){fb.segs.slice().forEach(s=>{if(!hit(s))return;s.loy=fbCl(s.loy+4*x+.3);s.eng=fbCl(s.eng+3*x);s.last=S.day;if(s.ft=='casual'&&s.n>=4&&s.loy>35){const c=fbRound(s.n*Math.min(.006,.05*x));if(c>0){const t=fbSplit(s,c);t.ft='oshi'}}})}
 else if(kind=='bond'){fb.segs.forEach(s=>{if(!hit(s))return;s.loy=fbCl(s.loy+2*x+.2);s.last=S.day;if(o.mid!=null&&s.u[o.mid]>0&&s.k!=o.mid){const c=fbRound(s.u[o.mid]*Math.min(.08,.6*x));if(c>0){s.u[o.mid]-=c;s.o[o.mid]=(s.o[o.mid]||0)+c}}})}
 else if(kind=='engage')fb.segs.forEach(s=>{if(hit(s)){s.eng=fbCl(s.eng+4*x+.3);s.last=S.day}});
 else if(kind=='attention')fb.segs.forEach(s=>{s.eng=fbCl(s.eng+1.5*x)})}
// a member's recognition grew (older formulas raise m.fans): existing fans of her group start to like / follow her,
// a few people become new fans because of her — never more supporters than her group has fans
function fdInterest(m,d,org){const fb=S.fb,act=fdAct(),ids=new Set(act.map(x=>x.id)),g=fdGrpOf(m.id),F=fb.segs.reduce((a,s)=>a+s.n,0);if(!(d>0))return;
 const pool=fb.segs.filter(s=>s.k!=m.id&&fdSegHas(s,g)),free=s=>Math.max(0,s.n-(s.o[m.id]||0)-(s.u[m.id]||0)),FR=pool.reduce((a,s)=>a+free(s)*(.3+s.eng/100),0);
 const conv=Math.min(d*.35,FR*.04)*fdDim(F);let left=fbRound(conv);if(left>0&&FR>0)pool.forEach(s=>{const c=Math.min(free(s),fbRound(conv*free(s)*(.3+s.eng/100)/FR));if(c>0&&left>0){const cc=Math.min(c,left);s.u[m.id]=(s.u[m.id]||0)+cc;left-=cc}});
 const nw=fbRound(d*.012*fdDim(F));if(nw>0)fbAcquire(nw,{via:'member',mid:m.id,org:org||'Member buzz'})}
function fdDisinterest(m,d){const fb=S.fb,L=fb.segs.filter(s=>s.u[m.id]>0),T=L.reduce((a,s)=>a+s.u[m.id],0);if(!T)return;const cut=Math.min(T,Math.round(d*.5));L.forEach(s=>{const c=Math.round(cut*s.u[m.id]/T);s.u[m.id]=Math.max(0,s.u[m.id]-c)})}
// ---- sync: older formulas' signals → the new rules → derived numbers ---------------------------------------------------------------
fbSync=function(ctx){if(!S||FBW)return;const fb=fbState();if(!fb)return;FD_IN=1;try{fdSync0(ctx)}finally{FD_IN=0}if(FD_DEFER){FD_DIRTY=1;fdAct().forEach(m=>{if(fb.mf[m.id]!=null&&Number.isFinite(+m.fans))fb.mf[m.id]=m.fans});fb.lastS=S.fans;fb.ver++}else{fdFixAll();fdWrite()}};
function fdSync0(ctx){const fb=S.fb;const org=(ctx&&ctx.org)||FBORG||'Group activity',reg=ctx&&ctx.reg;
 if(!Number.isFinite(S.fans))S.fans=fb.lastS;const dG=Math.round((S.fans||0)-fb.lastS),sig=[];
 fdAct().forEach(m=>{const b=fb.mf[m.id];if(b==null||!Number.isFinite(+m.fans))return;const d=Math.round(m.fans-b);if(d)sig.push([m,d])});
 S.fans=fb.lastS;if(dG>0)fbAcquire(dG,{via:'group',org,reg});else if(dG<0)fdLose(-dG,org);
 sig.forEach(([m,d])=>d>0?fdInterest(m,d,org):fdDisinterest(m,-d))}
fbApply=function(){const fb=S.fb;fb.ver++;if(FBW)return;fdFixAll();fdWrite()};
// gradual loss requested by older formulas (rare): from the least loyal fans first, never in one huge step
function fdLose(n,why){const fb=S.fb,F=fb.segs.reduce((a,s)=>a+s.n,0);n=Math.min(n,Math.round(F*.03));if(n<=0)return;const L=fb.segs.slice().sort((a,b)=>a.loy-b.loy);let left=n;for(const s of L){if(left<=0)break;const c=Math.min(left,Math.ceil(s.n*.25));if(c>0){fxFormer(s,c,why||'Lost interest');left-=c}}}
// ---- split / merge keep IDs, supporters and history --------------------------------------------------------------------------------
{const f=fbSplit;fbSplit=function(s,n){const n0=s.n,ids=fdTake(s,Math.min(s.n,Math.max(0,Math.round(n))));const u0={...(s.u||{})},h0={...(s.h||{})};const t=f.apply(this,arguments);try{t.fr=ids;const r=n0?t.n/n0:0;t.u={};for(const j in u0){const c=Math.min(t.n,Math.round(u0[j]*r));if(c>0){t.u[j]=c;s.u[j]-=c}}t.h={};for(const k in h0){const c=Math.round(h0[k]*r);t.h[k]=c;s.h[k]=(s.h[k]||0)-c}t.born=s.born;t.last=s.last;t.src=s.src}catch(e){console.error(e)}return t}}
{const f=fbNew;fbNew=function(o){const s=f.apply(this,arguments);try{s.u=o&&o.u?{...o.u}:{};s.h=o&&o.h?{...o.h}:{};s.fr=o&&o.fr?o.fr.map(r=>r.slice()):[];if(!o||!o.fr)fdFrFix(s)}catch(e){console.error(e)}return s}}
fbMerge=function(coarse){const fb=S.fb,M=new Map(),wavg=(t,s,f,N)=>{if(Number.isFinite(t[f])&&Number.isFinite(s[f]))t[f]=(t[f]*t.n+s[f]*s.n)/N};
 fb.segs.forEach(s=>{const key=coarse?`${s.k}|${s.ft}|${s.fk||'n'}|${s.gs}`:s.n<6?`${s.k}|${s.ft}|${s.fk||'n'}|${s.gs}`:`${s.k}|${s.ft}|${s.pat}|${s.reg}|${s.ng}|${Math.floor(s.loy/20)}|${s.fk||'n'}|${s.gs}`;const t=M.get(key);if(!t){M.set(key,s);return}
  const N=t.n+s.n;['loy','eng','sp','gi','ws','pq','et','so','bl'].forEach(f=>wavg(t,s,f,N));for(const j in s.o)t.o[j]=(t.o[j]||0)+s.o[j];t.u=t.u||{};for(const j in s.u||{})t.u[j]=(t.u[j]||0)+s.u[j];t.h=t.h||{};for(const k in s.h||{})t.h[k]=(t.h[k]||0)+s.h[k];
  if(s.af){t.af=t.af||{};for(const j in s.af)t.af[j]=t.af[j]==null?s.af[j]:(t.af[j]*t.n+s.af[j]*s.n)/N}if(s.bx){t.bx=t.bx||{};for(const k in s.bx)t.bx[k]=(t.bx[k]||0)+s.bx[k]}
  t.fr=[...(t.fr||[]),...(s.fr||[])];if(t.fr.length>40){t.fr.sort((a,b)=>a[0]-b[0]);const R=[];t.fr.forEach(r=>{const l=R[R.length-1];if(l&&l[0]+l[1]==r[0])l[1]+=r[1];else R.push(r.slice())});t.fr=R}
  if(s.n>t.n)t.org=s.org;t.born=Math.min(t.born,s.born);t.last=Math.max(t.last||0,s.last||0);t.n=N});fb.segs=[...M.values()];fdFixAll()};
{const f=fbFix;fbFix=function(s){const r=f.apply(this,arguments);try{if(s.u){for(const j in s.u){if(+j==s.k)delete s.u[j];else s.u[j]=Math.max(0,Math.min(s.n-(s.o[j]||0),Math.round(s.u[j])))}}}catch(e){}return r}}
// former fans keep their Fan IDs (history) — a dormant fan returning keeps the same ID because she never left her segment
{const f=fxFormer;fxFormer=function(s,n){const N=Math.min(s.n,Math.round(n));const ids=N>0?fdTake(s,N):[];const r=N&&s.n?N/s.n:0;if(s.u)for(const j in s.u)s.u[j]=Math.max(0,s.u[j]-Math.round(s.u[j]*r));const out=f.apply(this,arguments);try{const X=fxS();X.fmr.ids=X.fmr.ids||[];X.fmr.ids.push(...ids);if(X.fmr.ids.length>400)X.fmr.ids.splice(0,X.fmr.ids.length-400)}catch(e){}return out}}
// ---- one group fanbase per group (unique fans supporting it), sister groups never pooled ------------------------------------------------
if(typeof gsFans=='function')gsFans=function(gid){return fdGroupFans(gid)};
// ---- monthly: other supporters follow exposure; nobody keeps a second Kami Oshi ----------------------------------------------------------
function fdMonthlyU(){const fb=S.fb,act=fdAct(),last=(S.singles||[]).slice(-3).map(x=>new Set((S.songs[x.mainId]&&S.songs[x.mainId].slots||[]).filter(Boolean)));
 fb.segs.forEach(s=>{if(s.n<2)return;const g=fdGrpOf(s.k),dorm=s.ft=='dormant';act.forEach(m=>{if(m.id==s.k||fdGrpOf(m.id)!=g)return;const cur=s.u[m.id]||0,free=s.n-(s.o[m.id]||0)-cur,e=(fb.exp[m.id]||0),seen=!last.length||last.some(x=>x.has(m.id));
  const add=dorm?0:fbRound(free*Math.min(.03,.003*(m.pop/40)*(1+e*.3))),drop=fbRound(cur*(seen?.01:.035)*(dorm?2:1));const d=add-drop;if(d)s.u[m.id]=Math.max(0,cur+d)})})}
{const f=fbMonthly;fbMonthly=function(){const r=f.apply(this,arguments);try{fdMonthlyU();fdFixAll();fdWrite();fdTrend()}catch(e){console.error(e)}return r}}
if(typeof fxMonthly=='function'){const f=fxMonthly;fxMonthly=function(){const r=f.apply(this,arguments);try{fdFixAll();fdWrite()}catch(e){console.error(e)}return r}}
// supporter trend per member (last 12 months)
function fdTrend(){const fb=S.fb,M=fdSup();fb.trend=fb.trend||{};Object.entries(M).forEach(([id,X])=>{const L=fb.trend[id]=fb.trend[id]||[];L.push([fbMon(),X.t,X.k,X.o,X.u]);if(L.length>12)L.shift()})}
// ---- purchases & participation are history of existing fans, never new fans ---------------------------------------------------------------
{const f=fxPayNow;fxPayNow=function(kind,yen){const fb=S&&S.fb;const b0=fb?new Map(fb.segs.map(s=>[s,s.bl||0])):null;const r=f.apply(this,arguments);
 try{if(b0){fb.segs.forEach(s=>{const d=(b0.get(s)||0)-(s.bl||0);if(d>0){const y=Math.round(d*s.n);s.h=s.h||{};s.h[kind]=(s.h[kind]||0)+y;s.h.yen=(s.h.yen||0)+y;s.last=S.day}})}}catch(e){}return r}}
{const f=fxAct;fxAct=function(kind,n){const r=f.apply(this,arguments);try{const fb=S.fb,T=fb.segs.reduce((a,s)=>a+s.n*(s.ft=='dormant'?0:(.2+s.eng/100)),0);if(T>0&&n>0)fb.segs.forEach(s=>{if(s.ft=='dormant')return;const c=n*s.n*(.2+s.eng/100)/T;if(c>=.5){s.h=s.h||{};s.h['n_'+kind]=Math.round((s.h['n_'+kind]||0)+c);s.last=S.day}})}catch(e){}return r}}
// ---- one individual fan, derived from her segment ---------------------------------------------------------------------------------------------
function fdFan(fid){const fb=S.fb;for(const s of fb.segs){let i=0;for(const r of s.fr||[]){if(fid>=r[0]&&fid<r[0]+r[1]){i+=fid-r[0];return fdFanOf(s,i,fid)}i+=r[1]}}
 if(((fxS().fmr.ids)||[]).some(r=>fid>=r[0]&&fid<r[0]+r[1]))return{id:fdFid(fid),status:'Former'};return null}
function fdFanOf(s,i,fid){const n=s.n,O=[],U=[];let off=0;Object.keys(s.o).sort((a,b)=>a-b).forEach(j=>{const c=s.o[j];const st=off%n,inI=((i-st+n)%n)<c;if(inI)O.push(+j);const uc=s.u[j]||0;if(uc&&((i-(st+c)%n+n)%n)<uc)U.push(+j);off+=c});
 Object.keys(s.u).filter(j=>!(j in s.o)).sort((a,b)=>a-b).forEach(j=>{const uc=s.u[j],st=(off+(+j)*7)%n;if(((i-st+n)%n)<uc)U.push(+j)});
 return{id:fdFid(fid),groups:[...fdSegGroups(s)],kami:s.k,oshi:O,others:U,type:FD_TYPE[s.ft]||s.ft,status:s.ft=='dormant'?'Dormant':'Active',loyalty:Math.round(s.loy),activity:Math.round(s.eng),spending:Math.round(s.sp),history:{...(s.h||{})},since:s.born,seg:s.id}}
// ---- verification (used after migration and by the tests) ---------------------------------------------------------------------------------------
function fdVerify(){const fb=S.fb,ids=fdIds(),P=[],M=fdSup();let total=0;
 fb.segs.forEach(s=>{total+=s.n;if(s.k==null||!ids.has(s.k))P.push(`${s.id}: no valid Kami Oshi`);let os=0;for(const j in s.o){os+=s.o[j];if(+j==s.k)P.push(`${s.id}: Kami Oshi is also Oshi`);if(s.o[j]>s.n)P.push(`${s.id}: Oshi count above fans`)}if(os>FD_OMAX*s.n)P.push(`${s.id}: more than 5 Oshi per fan`);
  for(const j in s.u){if(+j==s.k)P.push(`${s.id}: Kami Oshi counted as other supporter`);if((s.u[j]||0)+(s.o[j]||0)>s.n)P.push(`${s.id}: supporters above fans`)}if(fdFrN(s.fr)!=s.n)P.push(`${s.id}: Fan IDs ${fdFrN(s.fr)} ≠ ${s.n}`)});
 if(total!=S.fans)P.push(`company fans ${S.fans} ≠ unique fans ${total}`);
 const G={};(S.groups||[]).forEach(g=>G[g.id]=fdGroupFans(g.id));fdAct().forEach(m=>{const X=M[m.id],gf=G[fdGrpOf(m.id)]||0;if(X.t>gf)P.push(`${m.name}: ${X.t} supporters > group fanbase ${gf}`);if(m.fans!=X.t)P.push(`${m.name}: m.fans ${m.fans} ≠ supporters ${X.t}`)});
 // sample individual fans: exactly one Kami Oshi, ≤5 Oshi, no overlap
 fb.segs.slice(0,60).forEach(s=>{for(let i=0;i<Math.min(s.n,25);i++){const f=fdFanOf(s,i,0);if(f.oshi.length>FD_OMAX)P.push(`${s.id}#${i}: ${f.oshi.length} Oshi`);if(f.oshi.includes(f.kami)||f.others.includes(f.kami))P.push(`${s.id}#${i}: Kami Oshi overlaps`);if(f.oshi.some(j=>f.others.includes(j)))P.push(`${s.id}#${i}: Oshi also other`)}});
 return{ok:!P.length,issues:P.slice(0,20),total,groups:G}}
// ---- migration of existing saves (once; safe to call again) ---------------------------------------------------------------------------------------
function fdMigrate(){const fb=S&&S.fb;if(!fb||fb.v3)return null;const act=fdAct(),ids=new Set(act.map(m=>m.id));
 try{if(typeof svPut=='function')svPut('bak_fan3',JSON.stringify(S))}catch(e){}
 const old={fans:S.fans|0,mf:Object.fromEntries(act.map(m=>[m.id,m.fans|0])),segs:fb.segs.length};
 fb.fseq=fb.fseq|0;fb.segs.forEach(s=>{s.fr=[];fdFrFix(s)});
 // fans without a Kami Oshi choose one by the old recognition of the members (the best aggregate data available)
 FD_KW=m=>Math.pow(Math.max(1,old.mf[m.id]||1),.85)*(.6+m.pop/100);try{fdFixAll()}finally{FD_KW=null}fb.segs.forEach(s=>fdFixSeg(s,act,ids));fb.segs=fb.segs.filter(s=>s.n>0&&s.k!=null);
 // former fans of the old system keep a block of Fan IDs too
 try{const X=fxS();if(X.fmr&&X.fmr.n>0&&!X.fmr.ids)X.fmr.ids=[fdSeq(X.fmr.n)]}catch(e){}
 // other supporters, reconciled from the old member recognition (capped by her group's fanbase): spread over the fans of her group by free capacity
 const M0=fdSup();act.forEach(m=>{const g=fdGrpOf(m.id),GF=fdGroupFans(g),X=M0[m.id],target=Math.min(old.mf[m.id]||0,Math.round(GF*.85)),need=Math.max(0,target-X.k-X.o);if(need<=0)return;
  const pool=fb.segs.filter(s=>s.k!=m.id&&fdSegHas(s,g)),free=s=>Math.max(0,s.n-(s.o[m.id]||0)-(s.u[m.id]||0)),FR=pool.reduce((a,s)=>a+free(s)*(.3+s.eng/100),0);if(!FR)return;
  let left=need;pool.forEach(s=>{const c=Math.min(free(s),left,Math.round(need*free(s)*(.3+s.eng/100)/FR));if(c>0){s.u[m.id]=(s.u[m.id]||0)+c;left-=c}})});
 fdFixAll();fdWrite();const v=fdVerify(),M=fdSup();
 fb.v3={v:FD_V,day:S.day,from:old,to:{fans:S.fans,mf:Object.fromEntries(act.map(m=>[m.id,M[m.id].t]))},ok:v.ok,issues:v.issues};fdTrend();return fb.v3}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{if(S&&S.fb){fbState();fdMigrate();fdFixAll();fdWrite()}}catch(e){console.error('fan v3 migration',e)}return r}}
// ---- statistics: supporters = Kami Oshi + Oshi + other supporters; active / dormant / former ------------------------------------------------
{const f=fbStats;let SC=null;fbStats=function(){const fb=S&&S.fb;if(SC&&fb&&SC.s===S&&SC.v===fb.ver&&SC.d===S.day&&SC.n===fb.segs.length)return SC.st;const st=f.apply(this,arguments);try{if(!st)return st;SC=fb?{s:S,v:fb.ver,d:S.day,n:fb.segs.length,st}:null;const M=fdSup();Object.values(st.M).forEach(X=>{const Y=M[X.id];if(!Y)return;X.u=Y.u;X.k=Y.k;X.o=Y.o;X.sup=Y.t;X.dorm=Y.dorm;X.active=Y.active});
 const G=st.G;G.dorm=S.fb.segs.filter(s=>s.ft=='dormant').reduce((a,s)=>a+s.n,0);G.act=G.total-G.dorm;try{G.former=fxS().fmr.n|0}catch(e){G.former=0}}catch(e){console.error(e)}return st}}
// ---- UI: member profile ----------------------------------------------------------------------------------------------------------------------
function fdSupHtml(m){const M=fdSup(),X=M[m.id];if(!X)return'';const g=fdGrpOf(m.id),GF=fdGroupFans(g),T=(S.fb.trend||{})[m.id]||[],prev=T.length>1?T[T.length-2][1]:null,tr=prev==null?null:X.t-prev,pc=n=>X.t?Math.round(100*n/X.t)+'%':'0%';
 return`<div class="fdsup"><div class="fan"><b>${X.t.toLocaleString()}</b> supporters</div><div class="fdbar"><i style="width:${pc(X.k)};background:#d6457f"></i><i style="width:${pc(X.o)};background:#7a6ad8"></i><i style="width:${pc(X.u)};background:#9fd3ff"></i></div>
 <div class="fdkv"><span><small>Kami Oshi</small><b>${X.k.toLocaleString()}</b></span><span><small>Oshi</small><b>${X.o.toLocaleString()}</b></span><span><small>Other supporters</small><b>${X.u.toLocaleString()}</b></span><span><small>Trend</small><b class="${tr>0?'up':tr<0?'dn':''}">${tr==null?'—':(tr>0?'+':'')+tr.toLocaleString()}</b></span></div>
 <div class="st">Unique fans who support her (${X.dorm.toLocaleString()} of them dormant). They can support other members too, so supporters of different members are never added up. Group fanbase: ${GF.toLocaleString()} unique fans.</div></div>`}
{const f=profHtml;profHtml=function(m,cand){let h=f.apply(this,arguments);try{if(!cand&&m&&m.status!='graduated'&&S.fb&&S.fb.v3){h=h.replace(/<div class="fan"><b>[\d,.]+<\/b> fans<\/div>/,fdSupHtml(m)).replace('Individual fanbase; fans can overlap with other members.','')}}catch(e){console.error(e)}return h}}
// ---- UI: Fanbase page — group dashboard, supporter ranking, fan lookup ----------------------------------------------------------------------------
function fdDashHtml(){const st=fbStats();if(!st)return'';const G=st.G,fb=S.fb,H=fb.hist||[],last=H[H.length-1],types=['casual','oshi','dedicated','hardcore'].map(k=>[FD_TYPE[k],fb.segs.filter(s=>s.ft==k).reduce((a,s)=>a+s.n,0)]),act=types.reduce((a,t)=>a+t[1],0),groups=(S.groups||[]).map(g=>[g,fdGroupFans(g.id)]);
 const kv=(a,b,c)=>`<span><small>${a}</small><b>${b}</b>${c?`<em>${c}</em>`:''}</span>`;
 return`<div class="c fddash"><h3>👥 Fanbase overview</h3><div class="fdkv">${kv('Total fanbase',G.total.toLocaleString(),'unique fans')}${kv('Active fans',G.act.toLocaleString())}${kv('Dormant fans',G.dorm.toLocaleString())}${kv('Former fans',(G.former||0).toLocaleString(),'not in the fanbase')}${last?kv('Last month',(last.net>=0?'+':'')+last.net.toLocaleString(),`${(last.newG||0)+(last.newM||0)} new · ${last.lost||0} lost`):''}</div>
 <div class="fdbar">${types.map(([n,c],i)=>`<i title="${n}" style="width:${act?100*c/act:0}%;background:${['#9fd3ff','#b28be8','#f58fb7','#e2455f'][i]}"></i>`).join('')}</div><div class="fdleg">${types.map(([n,c],i)=>`<span><i style="background:${['#9fd3ff','#b28be8','#f58fb7','#e2455f'][i]}"></i>${n} ${c.toLocaleString()}</span>`).join('')}</div>
 ${groups.length>1?`<p class="st">Each group's fanbase counts its own unique fans: ${groups.map(([g,n])=>`<b>${esc(g.name)}</b> ${n.toLocaleString()}`).join(' · ')} (a fan who supports both groups is in both, but only once in the company total).</p>`:''}
 <p class="st">Every fan has one Fan ID, exactly one Kami Oshi and up to five Oshi. Buying CDs, attending shows, handshakes or voting never creates a new fan.</p></div>`}
function fdRankHtml(){const M=fdSup(),u=ui.fdr=ui.fdr||{s:'t'},L=fdAct().map(m=>({m,...M[m.id]})).sort((a,b)=>b[u.s]-a[u.s]),T=S.fb.trend||{};
 const th=(k,n)=>`<th><button class="b s ${u.s==k?'p':''}" onclick="ui.fdr.s='${k}';render()">${n}</button></th>`;
 return`<div class="c fdrank"><h3>Supporter ranking</h3><p class="st">Kami Oshi + Oshi + other supporters = supporters of each member. A fan can support several members, so these numbers overlap and are never added together.</p><div class="fdtw"><table class="fdt"><tr><th>#</th><th>Member</th>${th('t','Supporters')}${th('k','Kami Oshi')}${th('o','Oshi')}${th('u','Other')}<th>Trend</th></tr>
 ${L.map((x,i)=>{const t=T[x.m.id]||[],p=t.length>1?t[t.length-2][1]:null,d=p==null?null:x.t-p;return`<tr><td>${i+1}</td><td class="fdmn">${ptc(x.m,26)}${esc(x.m.name)}</td><td><b>${x.t.toLocaleString()}</b></td><td>${x.k.toLocaleString()}</td><td>${x.o.toLocaleString()}</td><td>${x.u.toLocaleString()}</td><td class="${d>0?'up':d<0?'dn':''}">${d==null?'—':(d>0?'+':'')+d.toLocaleString()}</td></tr>`}).join('')}</table></div></div>`}
function fdLookHtml(){const q=ui.fdq,f=q?fdFan(q):null,nm=id=>{const m=get(id);return m?esc(m.name):'—'};
 return`<div class="c fdlook"><h3>🔎 Fan lookup</h3><div class="row"><input type="number" min="1" placeholder="Fan number, e.g. 1" value="${q||''}" onchange="ui.fdq=+this.value||null;render()" style="width:160px"><button class="b s" onclick="ui.fdq=1+Math.floor(Math.random()*(S.fb.fseq||1));render()">🎲 Random fan</button></div>
 ${q?f?f.status=='Former'?`<p><b>${f.id}</b> — Former fan (left the fanbase; her history is kept).</p>`:`<div class="fdfan"><b>${f.id}</b> · ${f.type} · ${f.status}<br>Kami Oshi: <b>${nm(f.kami)}</b><br>Oshi (${f.oshi.length}/5): ${f.oshi.map(nm).join(', ')||'none'}<br>Also supports: ${f.others.map(nm).join(', ')||'—'}<br><span class="st">Loyalty ${f.loyalty} · Activity ${f.activity} · Spending power ${f.spending} · fan since ${jd(f.since)}</span>${Object.keys(f.history).length?`<br><span class="st">Purchases & participation (her cohort): ${Object.entries(f.history).filter(([k,v])=>v).map(([k,v])=>`${esc(k.replace('n_',''))} ${(+v).toLocaleString()}`).join(' · ')}</span>`:''}</div>`:'<p class="st">No fan with this number.</p>':''}</div>`}
{const f=V.fanbase;V.fanbase=function(){let h=f.apply(this,arguments);try{if(!S.fb||!S.fb.v3)return h;const tab=(ui.fb&&ui.fb.tab)||'over';if(tab=='over')h=fdDashHtml()+h+fdLookHtml();else if(tab=='rank'||tab=='oshi')h=fdRankHtml()+h}catch(e){console.error(e)}return h}}
// a new game (or a save that never ran migrate) switches to v3 the first time the fan database is used
let FD_MIG=0;{const f=fbState;fbState=function(){const fb=f.apply(this,arguments);if(fb&&!fb.v3&&!FD_MIG){FD_MIG=1;try{fdMigrate()}catch(e){console.error(e)}finally{FD_MIG=0}}return fb}}
// ---- relationship changes (used by the simulation and the tests): never creates or removes fans ----------------------------------------
// n fans of segment s choose a new Kami Oshi; the previous one stays as an Oshi for keepOld of them (if they have room)
function fdMoveKami(s,n,to,keepOld){const ids=fdIds();if(!s||!ids.has(to)||to==s.k)return null;n=Math.min(s.n,Math.round(n));if(n<=0)return null;const t=n<s.n?fbSplit(s,n):s,old=t.k;t.k=to;delete t.o[to];delete t.u[to];
 const keep=Math.round(t.n*(keepOld??.6)),room=FD_OMAX*t.n-Object.values(t.o).reduce((a,b)=>a+b,0);if(old!=null&&ids.has(old)&&keep>0&&room>0)t.o[old]=Math.min(t.n,keep,room);try{fbLife(old,'kl',t.n);fbLife(to,'kg',t.n)}catch(e){}fdFixAll();fdWrite();return t}
// n fans of segment s add / drop a member as Oshi (blocked for her Kami Oshi and above 5 Oshi per fan)
function fdOshi(s,mid,n,add){if(!s||!fdIds().has(mid)||mid==s.k)return 0;const cur=s.o[mid]||0;if(add){const room=FD_OMAX*s.n-Object.values(s.o).reduce((a,b)=>a+b,0),c=Math.max(0,Math.min(n,s.n-cur,room));if(!c)return 0;s.o[mid]=cur+c;if(s.u[mid])s.u[mid]=Math.max(0,Math.min(s.u[mid],s.n-s.o[mid]));fdFixAll();fdWrite();return c}
 const c=Math.min(cur,n);s.o[mid]=cur-c;s.u[mid]=(s.u[mid]||0)+c;fdFixAll();fdWrite();return c}
// ---- performance: keep the number of fan cohorts small ---------------------------------------------------------------------------------
//  Every new batch of fans is split over several Kami Oshi, so cohorts pile up (thousands after a few months) and every fan
//  update walks all of them — days became very slow. When there are too many, cohorts with the same Kami Oshi, fan type and
//  group are merged (fans, Fan IDs, Oshi / other supporters and history are kept; loyalty etc. become weighted averages).
const FD_SEGCAP=900;
function fdCompact(force){const fb=S&&S.fb;if(!fb||!Array.isArray(fb.segs))return;if(!force&&fb.segs.length<=FD_SEGCAP)return;try{const n0=fb.segs.length;fbMerge(n0>FD_SEGCAP*1.0);if(fb.segs.length>FD_SEGCAP)fbMerge(1);fdWrite()}catch(e){console.error('fdCompact',e)}}
{const f=fbAcquire;fbAcquire=function(){const r=f.apply(this,arguments);try{if(S&&S.fb&&S.fb.segs.length>FD_SEGCAP&&!FBW&&!FD_IN)fdCompact()}catch(e){console.error(e)}return r}}
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{fdCompact()}catch(e){console.error(e)}return r}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{fdCompact()}catch(e){console.error(e)}return r}}
// group fan totals are read many times a day: cache them until the fanbase changes (fb.ver / the cohort list)
{const f=fdGroupFans;let C={v:-1,a:null,n:-1,m:new Map()};fdGroupFans=function(gid){const fb=S&&S.fb;if(!fb)return f.apply(this,arguments);if(C.v!==fb.ver||C.a!==fb.segs||C.n!==fb.segs.length||C.s!==S){C={v:fb.ver,a:fb.segs,n:fb.segs.length,s:S,m:new Map()}}const k=String(gid);if(!C.m.has(k))C.m.set(k,f.apply(this,arguments));return C.m.get(k)};
 if(typeof gsFans=='function')gsFans=function(gid){return fdGroupFans(gid)}}
// member → group lookups happen thousands of times per fan update (get() scans every member): use a lookup table that is
// rebuilt at every fan pass, every day and after any group change (never stale across a transfer)
let FD_GM=null;const fdGmReset=()=>{FD_GM=null};
fdGrpOf=function(id){if(!S)return null;if(!FD_GM||FD_GM.s!==S||FD_GM.n!==S.members.length){const M=new Map();S.members.forEach(m=>M.set(m.id,typeof gsGid=='function'?gsGid(m):m.group));FD_GM={s:S,n:S.members.length,M};Promise.resolve().then(fdGmReset)}const g=FD_GM.M.get(+id);return g===undefined?null:g};
{const f=fdFixAll;fdFixAll=function(){FD_GM=null;return f.apply(this,arguments)}}
{const f=tick;tick=function(){FD_GM=null;try{return f.apply(this,arguments)}finally{FD_GM=null}}}
['transferGroup','gsTransfer','moveTeam','debutGroup','gsCreate'].forEach(n=>{if(typeof window[n]=='function'){const f=window[n];window[n]=function(){FD_GM=null;try{return f.apply(this,arguments)}finally{FD_GM=null}}}});
// fbSync runs around every fan-related activity (each MV, every day, every group): when nothing changed since the last
// full pass (no new / lost fans, no member signal, fanbase version unchanged), the full pass is skipped
{const f=fbSync;fbSync=function(ctx){try{const fb=S&&S.fb;if(fb&&!FBW&&fb.okVer===fb.ver&&Number.isFinite(S.fans)&&Math.round(S.fans-fb.lastS)==0&&!fdAct().some(m=>{const b=fb.mf[m.id];return b!=null&&Number.isFinite(+m.fans)&&Math.round(m.fans-b)!=0}))return}catch(e){}
  const r=f.apply(this,arguments);try{if(S&&S.fb)S.fb.okVer=S.fb.ver}catch(e){}return r}}
// during a day, fan updates from many activities (every MV, theater show, event …) are collected and the full pass
// (rules on every cohort + derived numbers) runs once at the end of the day instead of after each activity.
// The signal bookkeeping (fb.lastS / fb.mf) only moves in that pass, so nothing is counted twice or lost.
function fdFlush(){if(!FD_DIRTY||!S||!S.fb)return;FD_DIRTY=0;fdFixAll();fdWrite();S.fb.okVer=S.fb.ver}
{const f=tick;tick=function(){const o=FD_DEFER;FD_DEFER=1;try{return f.apply(this,arguments)}finally{FD_DEFER=o;if(!o)try{fdFlush()}catch(e){console.error(e)}}}}
// fan-type shares for the older formulas: the same all day long
{const f=fbFactor0;const C={};fbFactor0=function(kind){if(!FD_DEFER)return f.apply(this,arguments);const k=S.day+'|'+kind;if(C.s!==S||C.d!==S.day){for(const x in C)delete C[x];C.s=S;C.d=S.day}if(!(k in C))C[k]=f.apply(this,arguments);return C[k]}}
