// =====================================================================================
//  History screens show one month back. The records themselves stay in the save (statistics, awards, profiles,
//  elections and reports keep reading them), only the history screens list less.
//   · Theater › Performance History: the last 30 days, plus — always — the first and the final performance of every
//     Stage and every Birthday / Graduation Stage (the same performances th-compact.js keeps in full).
//   · External Events › Event History and the Event Calendar: the last 30 days, except Music Programs (always shown).
// =====================================================================================
const HL_DAYS=30,HL_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
function hlThKeep(){const T=thS(),keep=new Set(),first={},last={};(T.pf||[]).forEach(p=>{if(!p||!p.st)return;if(!first[p.st]||p.day<first[p.st].day)first[p.st]=p;if(!last[p.st]||p.day>=last[p.st].day)last[p.st]=p});
 const why={};Object.values(first).forEach(p=>{keep.add(p.id);why[p.id]=HL_T('First performance','รอบแรก')});
 Object.entries(last).forEach(([sid,p])=>{const s=T.st&&T.st[sid];if(!s||s.status!='active'){keep.add(p.id);why[p.id]=why[p.id]?why[p.id]+' · '+HL_T('Final performance','รอบสุดท้าย'):HL_T('Final performance','รอบสุดท้าย')}});
 (T.pf||[]).forEach(p=>{const s=T.st&&T.st[p.st];if(p.sp||(s&&s.gst)){keep.add(p.id);const g=(p.sp&&p.sp.kind=='grad')||(s&&s.gst);why[p.id]=g?HL_T('Graduation Stage','สเตจแกรด'):HL_T('Birthday Stage','สเตจวันเกิด')}});return{keep,why}}
{const f=V.thhist;V.thhist=function(){const T=thS(),all=T.pf,{keep,why}=hlThKeep(),cut=S.day-HL_DAYS;T.pf=all.filter(p=>p&&(p.day>=cut||keep.has(p.id)));HL_WHY=why;let h;try{h=f.apply(this,arguments)}finally{T.pf=all;HL_WHY=null}
  return h.replace(/<h3>(\d+) performance\(s\)<\/h3>/,(m,n)=>`<h3>${n} performance(s)</h3><p class="st">${HL_T('Showing the last 30 days. First and final performances of every Stage, Birthday Stages and Graduation Stages are always kept here.','แสดงย้อนหลัง 30 วัน รอบแรกและรอบสุดท้ายของทุกสเตจ สเตจวันเกิด และสเตจแกรด ดูย้อนหลังได้เสมอ')}</p>`)}}
let HL_WHY=null;
{const f=thPfRow;thPfRow=function(p){const h=f.apply(this,arguments);try{if(HL_WHY&&HL_WHY[p.id]&&p.day<S.day-HL_DAYS&&!/🎂|🎓/.test(h))return h.replace('</button>',`<span class="tag">${esc(HL_WHY[p.id])}</span></button>`)}catch(e){}return h}}
const hlXeMp=r=>r&&(r.ch=='mp'||r.cat=='mp');
function hlXeWrap(f,note){return function(){const X=xeS(),all=X.list,cut=S.day-HL_DAYS;X.list=all.filter(r=>r.status=='open'||r.status=='accepted'||hlXeMp(r)||(r.end!=null?r.end:r.day)>=cut);let h;try{h=f.apply(this,arguments)}finally{X.list=all}
 return note?h.replace(/<p class="st">Every booking is kept[^<]*<\/p>/,`<p class="st">${HL_T('Showing the last 30 days. Music Programs are always kept here.','แสดงย้อนหลัง 30 วัน รายการเพลงดูย้อนหลังได้เสมอ')}</p>`):h}}
V.xehist=hlXeWrap(V.xehist,1);if(V.xecal)V.xecal=hlXeWrap(V.xecal,0);
