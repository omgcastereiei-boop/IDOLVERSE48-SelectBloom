// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Request Hour: repair a lost single link
//  A Request Hour waits in status 'single' until its linked single is released; the release opens
//  the voting month (reqhour.js, doRelease wrapper). If the link was lost before release (the plan was
//  replaced, turned into an album, or released another way), the event stayed in 'single' forever
//  even after the single had been sold. This repair runs daily and whenever the Request Hour page is
//  shown:
//   · the group's single in production is still the linked one but lost p.rh → re-attach it;
//   · a single of that group was released after the link (not a General Election / another Request
//     Hour single) → attach it and open voting exactly as a normal release would have done, back-dated
//     to its release day (codes come from the CDs it really sold during the voting month); the concert
//     date moves after the voting month when needed. Voting then closes and the concert follows normally.
//  Also: a Request Hour single can no longer be switched into an album plan.
// =====================================================================================
function rhLinkDay(E){const L=(E.log||[]).filter(x=>x.t=='single');return L.length?L[L.length-1].d:(E.created||0)}
function rhRepair(E){if(!E||E.status!='single')return false;let done=false;
 try{gsWith(E.gid,()=>{const p=S.pj;if(p&&p.rh==E.id&&p.status!='released')return;
  const d0=rhLinkDay(E),used=new Set((rhS().list||[]).filter(z=>z!==E&&z.rid).map(z=>z.rid)),x=(S.singles||[]).filter(s=>s&&s.relDay!=null&&s.relDay>=d0&&s.relDay<=S.day&&!s.ge&&(!s.rh||s.rh==E.id)&&!used.has(s.rid)).sort((a,b)=>a.relDay-b.relDay)[0];
  // nothing released yet: the single in production lost its link → re-attach it
  if(!x){if(p&&!p.rh&&!p.ge&&!p.geNext&&!(typeof plAlb=='function'&&plAlb(p))&&(p.status=='draft'||p.status=='producing')&&!(rhS().list||[]).some(z=>z!==E&&z.status=='single'&&z.gid==E.gid)){p.rh=E.id;E.log.push({d:S.day,t:'relinked'});done='relink'}return}
  if(p&&p.rh==E.id)delete p.rh;x.rh=E.id;E.rid=x.rid;E.title=x.title;E.open=x.relDay;E.close=geAddMon(E.open,1)-1;E.status='voting';E.codes.vd=E.open-1;E.trend=null;E.log.push({d:S.day,t:'open'},{d:S.day,t:'repaired'});
  if(E.date<=E.close+6||E.date<S.day+14)E.date=Math.max(E.close+21,S.day+21);done='open'})}catch(e){console.error(e);return false}
 if(done=='open'){try{rhVoteTo(E,Math.min(S.day,E.close))}catch(e){console.error(e)}toast(rhT(`“${E.name}”: voting was connected to the released single “${E.title}”. Concert on ${jd(E.date)}.`,`“${E.name}”: เชื่อมการโหวตกับซิงเกิล “${E.title}” ที่ออกแล้ว คอนเสิร์ตวันที่ ${jd(E.date)}`))}
 return!!done}
function rhRepairAll(){if(!S||!S.rh)return;(rhS().list||[]).forEach(E=>{if(E.status=='single')rhRepair(E)})}
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{rhRepairAll()}catch(e){console.error(e)}return r}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{rhRepairAll()}catch(e){console.error(e)}return r}}
{const f=V.rh;if(f)V.rh=function(){try{rhRepairAll()}catch(e){}return f.apply(this,arguments)}}
// a Request Hour single cannot become an album (the album release would drop the voting link)
{const f=plSetKind;plSetKind=function(k){const p=S.pj;if(k=='album'&&p&&p.rh)return toast(rhT('This single carries Request Hour voting codes. Unlink it from the Request Hour first.','ซิงเกิลนี้มีรหัสโหวต Request Hour อยู่ ยกเลิกการเชื่อมกับ Request Hour ก่อน'),'err');return f.apply(this,arguments)}}
