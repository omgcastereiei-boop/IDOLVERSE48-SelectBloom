// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Birthday / Graduation Stage: the featured member always performs
// -------------------------------------------------------------------------------------
//  · The member a Birthday or Graduation Stage is for performs that show even when she is not in the Stage's
//    main lineup: if a main member is unavailable she takes that member's place; if every main member can
//    perform, she takes the place of the member in the LAST position of the lineup, who sits this show out.
//  · A Graduation Stage show always uses her Graduation Stage (the link is repaired before the show), so the
//    Extra Shows are performed, recorded with photos, and she graduates afterwards as planned.
// =====================================================================================
const spfT=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
function spfFeat(x){const sp=x&&x.sp;return sp&&(sp.kind=='bd'||sp.kind=='grad')?(sp.mids||[]):[]}
{const f=thCheck;thCheck=function(x){const C=f.apply(this,arguments);try{const F=spfFeat(x);if(!F.length||!C||!C.s)return C;const B=(C.B||thPerf(C.s)).map(m=>m.id),taken=new Set(Object.values(C.rp||{}).map(Number));C.rp=C.rp||{};
 F.forEach(id=>{const m=get(id);if(!m||taken.has(id)||thWhy(m,x))return;
  // during the show itself the planned replacement is already counted among the performers (TH_INV): keep the swap
  const inv=typeof TH_INV!='undefined'&&TH_INV&&TH_INV[id]!=null?+TH_INV[id]:null;if(inv!=null&&inv!==id){if(!C.miss.some(z=>z.id==inv))C.miss.push({id:inv,why:spfT(`sits out for ${m.name}'s ${x.sp.kind=='bd'?'Birthday Stage':'Graduation Stage'}`,`งดแสดงรอบนี้ให้${x.sp.kind=='bd'?'สเตจวันเกิด':'สเตจแกรด'}ของ ${m.name}`)});C.rp[inv]=id;taken.add(id);return}
  if(B.includes(id))return;
  // an unavailable main member without a substitute → she takes that place
  const open=C.miss.find(z=>!C.rp[z.id]);if(open){C.rp[open.id]=id;taken.add(id);return}
  // everyone can perform → the member in the last position of the lineup sits this show out
  const L=(thLu(C.s)||B).filter(i=>B.includes(i)&&!F.includes(i)&&!C.miss.some(z=>z.id==i)),last=L[L.length-1];if(last==null)return;
  C.miss.push({id:last,why:spfT(`sits out for ${m.name}'s ${x.sp.kind=='bd'?'Birthday Stage':'Graduation Stage'}`,`งดแสดงรอบนี้ให้${x.sp.kind=='bd'?'สเตจวันเกิด':'สเตจแกรด'}ของ ${m.name}`)});C.rp[last]=id;taken.add(id)})}catch(e){console.error(e)}return C}}
// the Graduation Stage of the show: repair a lost link before the performance; the Extra Shows go into the report
function spfLink(x){if(!x||!x.sp||x.sp.kind!='grad'||x.st!='sched')return;const mid=(x.sp.mids||[])[0];let st=x.gst&&thStage(x.gst);
 if(!st||!st.gst||st.status=='gradone'){const L=Object.values(thS().st||{}).filter(s=>s.gst&&s.gst.mid==mid&&s.status!='gradone').sort((a,b)=>(b.created||0)-(a.created||0));st=L[0]||null;if(st){x.gst=st.id;x.sp.gst=st.id;st.gst.xid=x.id}}
 if(!st)try{g4Ensure();st=x.gst&&thStage(x.gst)}catch(e){}
 if(st&&g4Early(st))x.sp.songs=g4Extras(st).map(it=>{const ids=thMem(st,it);return{song:it.song,ids,center:thCen(st,it),unit:'',rows:Object.fromEntries(ids.map(i=>[i,i==thCen(st,it)?1:2]))}})}
// the featured member herself is unavailable for this show (an external event, leave …): the special stage is not dropped —
// it moves to the next show of the team she can perform (the show itself goes ahead as a regular performance)
function spfPostpone(x){const sp=x&&x.sp;if(!sp||x.st!='sched'||(sp.kind!='bd'&&sp.kind!='grad'))return null;const bad=(sp.mids||[]).map(get).find(m=>m&&thWhy(m,x));if(!bad)return null;
 const why=thWhy(bad,x),H=thS(),free=z=>(sp.mids||[]).every(id=>{const m=get(id);return m&&!thWhy(m,z)});
 const L=H.sh.filter(z=>z!==x&&z.k==x.k&&z.st=='sched'&&!z.sp&&(z.day>x.day||(z.day==x.day&&x.sl=='a'&&z.sl=='e'))&&z.day<=x.day+45&&!thForbid(z.day)).sort((a,b)=>a.day-b.day||(a.sl=='a'?-1:1));
 const y=L.find(free);if(!y)return null;y.sp=sp;delete x.sp;sp.ok=1;sp.moved=(sp.moved||0)+1;
 if(x.gst){y.gst=x.gst;sp.gst=x.gst;delete x.gst;const st=thStage(y.gst);if(st&&st.gst)st.gst.xid=y.id}
 sp.mids.forEach(id=>{const m=get(id);if(m&&m.grad&&sp.kind=='grad'){if(m.grad.stage==x.id||!m.grad.stage)m.grad.stage=y.id;if(m.grad.target!=null&&m.grad.target<y.day)m.grad.target=y.day}});
 try{thN(`<li>${sp.kind=='grad'?'🎓':'🎂'} ${spfT(`The ${sp.kind=='grad'?'Graduation':'Birthday'} Stage of <b>${esc(bad.name)}</b> could not take place on ${jd(x.day)} (${esc(why)}). It was moved to <b>${wd(y.day)} ${TH_SLOT[y.sl]}</b>.`,`${sp.kind=='grad'?'สเตจแกรด':'สเตจวันเกิด'}ของ <b>${esc(bad.name)}</b> จัดในวันที่ ${jd(x.day)} ไม่ได้ (${esc(why)}) จึงเลื่อนไปเป็น <b>${wd(y.day)} ${TH_SLOT[y.sl]}</b>`)}</li>`)}catch(e){}return y}
{const f=thPerform;thPerform=function(x){try{spfLink(x)}catch(e){console.error(e)}try{spfPostpone(x)}catch(e){console.error(e)}return f.apply(this,arguments)}}
// a performed Graduation Stage is read-only: its card says so and opens the report view
{const f=V.thstage;V.thstage=function(){let h=f.apply(this,arguments);try{Object.values((S.th&&S.th.st)||{}).filter(s=>s.gst&&s.status=='gradone').forEach(s=>{h=h.split(`onclick="g4OpenStage('${s.id}')">Edit Setlist`).join(`onclick="g4OpenStage('${s.id}')">${spfT('View','ดู')}`)})}catch(e){}return h}}
