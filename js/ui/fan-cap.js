// =====================================================================================
//  IDOLVERSE48: Select Bloom! — repair of runaway fan counts (older saves)
// -------------------------------------------------------------------------------------
//  Before this fix a very high-selling release (an election single near the 5M CD cap) gave
//  members a popularity gain that multiplied their own fan count (×40 or more), and 3% of that
//  gain was turned into new group fans without the usual large-fanbase damping. The next release
//  compounded it, so a group could jump from ~1M to hundreds of millions of fans in one step.
//  The cause is fixed in gainPop (game-systems.js) and fbSync (fanbase.js).
//
//  For saves that already jumped: the monthly fanbase history is searched for the jump
//  (a rise of more than 8× to over 10M fans). Every fan segment, member fan count and the
//  later history points are scaled back to the level before the jump (+30% growth allowance).
//  Runs once per save; nothing happens to a fanbase without such a jump.
// =====================================================================================
function fcJump(fb,now){const P=[];(fb.hist||[]).forEach((h,i)=>{if(Number.isFinite(h.start))P.push({v:h.start,i});if(Number.isFinite(h.total))P.push({v:h.total,i})});P.push({v:now,i:(fb.hist||[]).length});
 for(let k=1;k<P.length;k++){const a=P[k-1].v,b=P[k].v;if(a>=1000&&b>10000000&&b>a*8)return{pre:a,at:P[k].i}}return null}
function fanCapRepair(){try{const fb=S&&S.fb;if(!fb||!Array.isArray(fb.segs)||fb.blowFix)return 0;const now=fb.segs.reduce((a,s)=>a+(+s.n||0),0),J=fcJump(fb,now);
 if(!J){fb.blowFix={day:S.day,none:1};return 0}
 const target=Math.round(J.pre*1.3),k=Math.min(1,target/Math.max(1,now));if(!(k<1)){fb.blowFix={day:S.day,none:1};return 0}
 fb.segs.forEach(s=>{s.n=Math.max(0,Math.round(s.n*k));for(const j in s.o){s.o[j]=Math.round(s.o[j]*k)}if(s.bx)for(const j in s.bx)s.bx[j]=Math.round(s.bx[j]*k);try{fbFix(s)}catch(e){}});
 fb.segs=fb.segs.filter(s=>s.n>0);
 (fb.hist||[]).forEach((h,i)=>{if(i<J.at)return;['start','total','net','newG','newM','lost'].forEach(x=>{if(Number.isFinite(h[x]))h[x]=Math.round(h[x]*k)});if(h.mem)for(const id in h.mem){const r=h.mem[id];if(Array.isArray(r))h.mem[id]=r.map(v=>Number.isFinite(v)?Math.round(v*k):v)}});
 Object.values(fb.alum||{}).forEach(a=>{if(a&&Number.isFinite(a.n))a.n=Math.round(a.n*k)});
 const T=fb.segs.reduce((a,s)=>a+s.n,0),lim=Math.max(100000,T*3);
 [...(S.members||[]),...(S.alumni||[])].forEach(m=>{if(!m||!Number.isFinite(+m.fans))return;if(m.fans>lim)m.fans=Math.round(Math.min(lim,Math.max(lim*.5,m.fans*k)));if(fb.mf&&fb.mf[m.id]!=null)fb.mf[m.id]=m.fans;try{m.pop=popOf(m)}catch(e){}});
 S.fans=T;fb.lastS=T;fb.carry={};fb.ver=(fb.ver||0)+1;fb.blowFix={day:S.day,from:now,to:T};console.log('[fan-cap] runaway fanbase repaired',now,'→',T);return 1}catch(e){console.error(e);return 0}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);if(fanCapRepair())try{toast(`Fan count repaired: ${S.fb.blowFix.from.toLocaleString()} → ${S.fb.blowFix.to.toLocaleString()} (a bug had inflated it).`)}catch(e){}return r}}
try{I18N_TH_RX.push([/^Fan count repaired: ([\d,]+) → ([\d,]+) \(a bug had inflated it\)\.$/,'แก้ไขจำนวนแฟนคลับแล้ว: $1 → $2 (บั๊กทำให้ตัวเลขพุ่งผิดปกติ)'])}catch(e){}
