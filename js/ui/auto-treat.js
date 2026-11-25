// =====================================================================================
//  Automatic Medical Treatment
//  Members › Idol Roster: a company-wide switch — every day (after Next day), members whose Physical Health is below the
//  chosen level receive the existing Medical Treatment (same price, effect and 7-day interval as the button in the
//  profile), as long as the company keeps the chosen money reserve. Each member's profile (Wellness & Emotions) can
//  follow the company setting, always use it or never use it.  S.autoCare = {on, th, keep};  m.wel.atr = 'on'|'off'.
// =====================================================================================
const ATR_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
const atrS=()=>{if(!S.autoCare||typeof S.autoCare!='object')S.autoCare={on:false,th:40,keep:1000000};return S.autoCare};
const atrOn=m=>{const w=wlOf(m),o=w.atr;return o=='on'?true:o=='off'?false:!!atrS().on};
function atrRun(){if(!S||!S.members)return;const C=atrS(),A=WLA.treat,done=[];
 S.members.filter(m=>m.status!='graduated').sort((a,b)=>wlOf(a).ph-wlOf(b).ph).forEach(m=>{try{if(!atrOn(m))return;const w=wlOf(m);if(w.ph>=C.th)return;if(wlCan(m,'treat'))return;if(S.money-A.c<(+C.keep||0))return;
  const p0=Math.round(w.ph);if(!spend(A.c,`${A.n} (automatic): ${m.name}`))return;w.cd.treat=S.day;wlAdj(m,{ph:12,load:-15});wlLog(m,{t:'care',txt:'Medical Treatment — automatic (Physical Health +12).'});done.push(`${esc(m.name)} ${p0}→${Math.round(w.ph)}`)}catch(e){console.error(e)}});
 if(done.length)try{wlN(`<li>🩺 ${ATR_T('Automatic Medical Treatment','รักษาพยาบาลอัตโนมัติ')} (${yen(done.length*A.c)}): ${done.join(' · ')}</li>`)}catch(e){}}
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{atrRun()}catch(e){console.error(e)}return r}}
function atrSet(k,v){const C=atrS();if(k=='on')C.on=!!v;else if(k=='th')C.th=Math.max(10,Math.min(90,+v||40));else if(k=='keep')C.keep=Math.max(0,+v||0);render()}
function atrMem(id,v){const m=get(id);if(!m)return;const w=wlOf(m);if(v)w.atr=v;else delete w.atr;render()}
function atrCard(){const C=atrS(),A=WLA.treat,low=S.members.filter(m=>m.status!='graduated'&&wlOf(m).ph<C.th).length;
 return`<div class="c atrc"><div class="row"><b>${ATR_T('Automatic Medical Treatment','รักษาพยาบาลอัตโนมัติ')}</b><label class="pczlk"><input type="checkbox" ${C.on?'checked':''} onchange="atrSet('on',this.checked)"> ${C.on?ATR_T('On','เปิด'):ATR_T('Off','ปิด')}</label>
 <label class="st">${ATR_T('When Physical Health is below','เมื่อ Physical Health ต่ำกว่า')} <select onchange="atrSet('th',this.value)">${[30,40,50,60,70].map(v=>`<option ${C.th==v?'selected':''}>${v}</option>`).join('')}</select></label>
 <label class="st">${ATR_T('Keep at least','เหลือเงินอย่างน้อย')} <select onchange="atrSet('keep',this.value)">${[0,500000,1000000,5000000,20000000].map(v=>`<option value="${v}" ${+C.keep==v?'selected':''}>${yen(v)}</option>`).join('')}</select></label></div>
 <p class="st">${ATR_T(`After each Next day, members below the level get Medical Treatment (${yen(A.c)}, Physical Health +12, once every 7 days). Now below ${C.th}: ${low} member(s). Each member's profile can override this (Wellness & Emotions).`,`หลังกด Next day เมมเบอร์ที่ Physical Health ต่ำกว่าค่าที่ตั้งจะได้รับการรักษา (${yen(A.c)} · Physical Health +12 · ทุก 7 วัน) ตอนนี้ต่ำกว่า ${C.th}: ${low} คน ตั้งรายคนได้ในโปรไฟล์ (Wellness & Emotions)`)}</p></div>`}
{const f=V.members;V.members=function(){const h=f.apply(this,arguments);try{const i=h.indexOf('<div class="g');return i>=0?h.slice(0,i)+atrCard()+h.slice(i):atrCard()+h}catch(e){console.error(e);return h}}}
{const f=wlProfHtml;wlProfHtml=function(m){let h=f.apply(this,arguments);try{const w=wlOf(m),o=w.atr||'';h=h.replace('<div class="wl2">',`<div class="row atrm"><label class="st">${ATR_T('Automatic Medical Treatment','รักษาพยาบาลอัตโนมัติ')} <select onchange="atrMem(${m.id},this.value)"><option value="" ${!o?'selected':''}>${ATR_T('Follow company setting','ตามการตั้งค่าของค่าย')} (${atrS().on?ATR_T('on','เปิด'):ATR_T('off','ปิด')})</option><option value="on" ${o=='on'?'selected':''}>${ATR_T('Always for her','เปิดสำหรับเธอ')}</option><option value="off" ${o=='off'?'selected':''}>${ATR_T('Never for her','ปิดสำหรับเธอ')}</option></select></label><span class="st">${ATR_T('below Physical Health','เมื่อ Physical Health ต่ำกว่า')} ${atrS().th}</span></div><div class="wl2">`)}catch(e){console.error(e)}return h}}
