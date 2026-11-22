// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Fan purchase behaviour & CD sales (one model for every group)
// -------------------------------------------------------------------------------------
//  CD sales come from fans who really buy, never from the total fanbase:
//   · Casual fans rarely buy (CDM_P0.casual, well below Regular), one copy each, never for a Kami Oshi / Oshi.
//   · Regular, Dedicated and Hardcore fans each have a purchase PROBABILITY and a number of COPIES
//     per buyer. Probability = base by type × (1 + interest); interest is ONE additive score
//     (song quality, concept fit, Center appeal, Kami Oshi / Oshi in the Title Track, loyalty,
//     promotion, the previous release's quality, minus fan fatigue) — nothing is stacked
//     multiplicatively. Copies: Regular ≈1, Dedicated 1–2, Hardcore 1–3 (more only with strong
//     incentives: several Types, handshake tickets), always capped by the cohort's spending power.
//   · Every fan is counted once per group (fdSegGroupN), however many members she supports.
//   · General public buyers (non-fans) are computed separately from awareness × song appeal.
//   · Fan fatigue: short gaps between releases, a repeated concept and repeated purchase incentives lower
//     probability and extra copies; it is computed per release from recent history, so it heals by itself.
//  The single's sales formula (doRelease) still runs for everything else (revenue flow, editions,
//  handshake tickets, charts…); only the number of CDs it produces is replaced by this model.
//  Rival groups (rival3.js) use the same cdModel with their own fanbase size, mix and spending power.
// =====================================================================================
// base purchase probability per single (calibrated for the standard fan mix Casual 20 · Regular 40 · Dedicated 25 · Hardcore 15)
// Casual fans rarely buy (well below Regular), always a single copy, and never because of a Kami Oshi / Oshi
const CDM_P0={casual:.006,oshi:.02,dedicated:.065,hardcore:.18};
const CDM_TYPES=['casual','oshi','dedicated','hardcore'];
const cdmCl=(v,a,b)=>Math.max(a,Math.min(b,v));
// copies per buyer for one cohort (mean), limited by spending power (sp 0–100) and dampened by fatigue
function cdmCopies(t,I,o){const types=Math.max(1,o.types||1),inc=Math.max(0,I);let c;if(t=='casual')return 1;
 if(t=='oshi')c=1+.05*inc;else if(t=='dedicated')c=1.1+.3*inc+.08*(types-1);else c=1.55+.6*inc+.3*(types-1)+(o.hs?.7:0);
 const cap=t=='oshi'?1.2:t=='dedicated'?1+(o.sp??50)/100*2:1+(o.sp??55)/100*4.2;c=Math.min(c,cap);return 1+(c-1)*(1-cdmCl(o.fat||0,0,.8))}
function cdmProb(t,I,loy){const p=CDM_P0[t]*(1+cdmCl(I+((loy??50)-50)/250,-.85,1.2));return cdmCl(p,0,.95)}
// aggregated model: n = {oshi,dedicated,hardcore} fans, I = interest, o = {types,hs,sp,loy,fat}
function cdModel(n,I,o){o=o||{};let buy=0,cp=0;const by={};CDM_TYPES.forEach(t=>{const N=n[t]||0;if(!N)return;const p=cdmProb(t,I-(o.fat||0)*.6,o.loy),b=N*p,c=b*cdmCopies(t,I,o);buy+=b;cp+=c;by[t]={buyers:Math.round(b),copies:Math.round(c)}});return{buyers:buy,copies:cp,by}}
function cdmPublic(aware,q,hype){return Math.max(0,aware)*cdmCl(.004+.03*Math.pow(cdmCl(q,0,1.3),2)*(hype||1),0,.06)}
// ---- the player's single ---------------------------------------------------------------------------------------------------
function cdmFatigue(gid,concept,hsNow){let gap=999,same=0,hsRun=0;try{gsWith(gid,()=>{const L=(S.singles||[]).filter(x=>(x.relDay??x.day)!=null&&(x.relDay??x.day)<S.day).sort((a,b)=>(b.relDay??b.day)-(a.relDay??a.day));
 if(L[0])gap=S.day-(L[0].relDay??L[0].day);same=L.slice(0,2).filter(x=>x.concept&&x.concept==concept).length;hsRun=L.slice(0,3).filter(x=>x.seHs||x.hs&&x.hs.on!==false).length})}catch(e){}
 return cdmCl((gap<45?.35:gap<70?.2:gap<95?.08:0)+same*.07+(hsNow&&hsRun>=3?.06:0),0,.6)}
function cddDemand(gid,sen,ctx){const fb=S&&S.fb;if(!fb||!Array.isArray(fb.segs)||!fb.segs.length)return null;ctx=ctx||{};const senS=new Set(sen||[]),cen=ctx.center;
 const q=cdmCl(ctx.q??.55,0,1.3),base=(q-.55)*.6+((ctx.comp??1)-1)*.6+(ctx.cpop!=null?(ctx.cpop-50)/400:0)+(ctx.promo||0)+(ctx.prevQ!=null?(ctx.prevQ-.55)*.3:0),fat=ctx.fat||0;
 let buyers=0,copies=0,casual=0,fans=0;const by={casual:{buyers:0,copies:0,fans:0},oshi:{buyers:0,copies:0,fans:0},dedicated:{buyers:0,copies:0,fans:0},hardcore:{buyers:0,copies:0,fans:0}},R=ctx.rnd||Math.random;
 fb.segs.forEach(s=>{const N=typeof fdSegGroupN=='function'?fdSegGroupN(s,gid):s.n;if(!N)return;fans+=N;if(s.ft=='casual')casual+=N;if(s.ft=='dormant'||!CDM_P0[s.ft])return;
  let I=base;if(s.ft!='casual'){if(s.k!=null){I+=senS.has(s.k)?.2:-.15;if(cen!=null&&s.k==cen)I+=.15}let on=0;for(const j in s.o)if(senS.has(+j))on++;I+=Math.min(.12,on*.04)}
  const p=cdmProb(s.ft,I-fat*.6,s.loy),b=N*p,c=b*cdmCopies(s.ft,I,{types:ctx.types,hs:ctx.hs,sp:s.sp,fat});buyers+=b;copies+=c;const z=by[s.ft];z.buyers+=b;z.copies+=c;z.fans+=N;
  if(ctx.commit&&b>=.5){s.h=s.h||{};s.h.cdb=Math.round((s.h.cdb||0)+b);s.h.cdc=Math.round((s.h.cdc||0)+c);s.cdl=S.day}});
 const pub=cdmPublic(fans*.5+(ctx.buzz||0)*400,q,1+(ctx.promo||0)),noise=cdmCl(1+((R()+R()+R())/3-.5)*.16,.88,1.12);
 Object.values(by).forEach(z=>{z.buyers=Math.round(z.buyers);z.copies=Math.round(z.copies)});
 return{units:Math.round((copies+pub)*noise),fanCopies:Math.round(copies*noise),buyers:Math.round(buyers),pub:Math.round(pub*noise),casual,fans,fat:+fat.toFixed(2),by}}
function cddCtx(p,mn){const gid=typeof gsAg=='function'?gsAg():0,L=(mn.slots||[]).filter(Boolean),ctx={types:(p.types||[]).length||1};
 try{const RC=seRecep(mn),E=RC.E||{};ctx.q=((+E.comp||60)/100)*.5+((E.abil&&+E.abil.all)||50)/100*.5;ctx.comp=RC.comp||1}catch(e){ctx.q=.55}
 const c=get(mn.center);ctx.center=mn.center;ctx.cpop=c?c.pop:null;try{ctx.hs=!!(typeof hsOn=='function'&&hsOn(p))}catch(e){}
 ctx.promo=((mn.video&&mn.video!='none')?.03:0)+(ctx.hs?.05:0);const M=L.map(get).filter(Boolean);ctx.buzz=M.length?avg(M.map(m=>m.buzz||0)):0;
 const R=S.fb.relQ=S.fb.relQ||{};ctx.prevQ=R[gid]!=null?R[gid]:null;ctx.fat=cdmFatigue(gid,mn.concept,ctx.hs);return{gid,L,ctx}}
{const f=doRelease;doRelease=function(){const p=S&&S.pj;let D=null,mn=null,C=null;try{if(p&&p.status=='producing'){mn=S.songs[p.mainId];if(mn){C=cddCtx(p,mn);D=cddDemand(C.gid,C.L,{...C.ctx,commit:1})}}}catch(e){console.error(e);D=null}
 const n=S.singles.length,r=f.apply(this,arguments);
 try{const x=S.singles[n];if(x&&D&&D.fans>0){const u=Math.max(0,D.units);x.sales=u;if(x.cd){const r0=x.cd.units||1;x.cd.units=u;x.cd.orders=Math.max(1,Math.round(D.buyers+D.pub));if(x.cd.tickets)x.cd.tickets=Math.round(x.cd.tickets*u/r0)}
  x.cdd={units:u,buyers:D.buyers,pub:D.pub,casual:D.casual,fans:D.fans,fat:D.fat,by:D.by};S.fb.relQ[C.gid]=+C.ctx.q.toFixed(3)}}catch(e){console.error(e)}return r}}
