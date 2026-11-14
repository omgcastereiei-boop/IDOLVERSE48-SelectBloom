// =====================================================================================
//  Notification settings: turn off the pop-ups for Birthdays, Theater performance results and Theater notices.
//  Nothing else changes: performances, birthdays and their histories are recorded as before, and every muted
//  notice is kept in a log (Management › Notifications) so it can still be read later.
// =====================================================================================
const NM_K={bd:['Member birthdays','Birthdays, upcoming birthdays and Birthday Stage notices'],thp:['Theater performances','The result card of every Theater performance'],thn:['Theater notices','Stage transitions, final performances, replacements and other Theater pop-ups']};
const nmS=()=>{if(!S)return{};S.set=S.set||{};S.set.mute=S.set.mute&&typeof S.set.mute=='object'?S.set.mute:{};return S.set.mute};
const nmOn=k=>!!(S&&S.set&&S.set.mute&&S.set.mute[k]);
function nmLog(kind,h){S.nlog=Array.isArray(S.nlog)?S.nlog:[];S.nlog.unshift({d:S.day,k:kind,h});if(S.nlog.length>200)S.nlog.length=200}
const NM_BD=/^<div class="ctbd">[^<]*(🎂|🎈|Birthday)/;
function nmFilter(){if(!S)return;try{
 if(nmOn('bd')&&typeof CTQ!='undefined'&&CTQ.length){for(let i=CTQ.length-1;i>=0;i--)if(NM_BD.test(CTQ[i])){nmLog('bd',CTQ[i]);CTQ.splice(i,1)}}
 if(nmOn('thp')&&Array.isArray(ui.newRes)){for(let i=ui.newRes.length-1;i>=0;i--){const h=ui.newRes[i];if(typeof h=='string'&&!h.includes('xenote')&&(h.includes('class="c thres')||h.includes("thOpenPerf('"))){nmLog('thp',h);ui.newRes.splice(i,1)}}}
 if(nmOn('thn')&&Array.isArray(ui.thN)&&ui.thN.length){ui.thN.forEach(h=>nmLog('thn',h));ui.thN=[]}}catch(e){console.error(e)}}
{const f=tick;tick=function(){const r=f.apply(this,arguments);nmFilter();return r}}
function nmTog(k){const M=nmS();M[k]=!M[k];toast(`${NM_K[k][0]}: notifications ${M[k]?'off':'on'}.`);render()}
function nmCard(){const M=nmS(),L=(S.nlog||[]);return`<div class="c nmcard"><h3>🔕 Notifications</h3><p class="st">Turn pop-ups off without losing anything: performances and birthdays are still recorded in their histories, and muted notices are kept below.</p>
 ${Object.entries(NM_K).map(([k,[n,d]])=>`<label class="nmrow"><input type="checkbox" ${M[k]?'':'checked'} onchange="nmTog('${k}')"><span><b>${esc(n)}</b><small class="st">${esc(d)}</small></span></label>`).join('')}
 <details><summary>Muted notices (${L.length})</summary><div class="nmlog">${L.slice(0,60).map(z=>`<div class="nmli"><small class="st">${jd(z.d)} · ${esc(NM_K[z.k]?NM_K[z.k][0]:z.k)}</small>${z.h.startsWith('<li')?`<ul class="ms">${z.h}</ul>`:z.h}</div>`).join('')||'<p class="st">Nothing muted yet.</p>'}</div></details>
 <div class="row"><button class="b s" onclick="goView('bday')">🎂 Birthdays</button><button class="b s" onclick="goView('thhist')">🎭 Theater history</button></div></div>`}
{const f=V.manage;V.manage=function(){return f.apply(this,arguments)+nmCard()}}
