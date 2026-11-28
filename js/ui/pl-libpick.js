// =====================================================================================
//  Single / Album planning — "Add from the Song Library" as a picker (like the concert song picker):
//  songs grouped by Single, by Theater Stage, or unreleased; tick several and add them in one go.
//  Uses the same list (plLibChoices) and the same add function (plAddLib) as before.
// =====================================================================================
const PLP_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
function plpData(){const p=S.pj;if(!p)return{single:[],stage:[],new:[]};const L=plLibChoices(p),idx=new Map(L.map(o=>[o.id,o])),by={single:[],stage:[],new:[]};
 const R={};L.filter(o=>o.rel).forEach(o=>{(R[o.rel]=R[o.rel]||{d:o.relDay??1e9,L:[]}).L.push(o)});
 Object.entries(R).sort((a,b)=>a[1].d-b[1].d).forEach(([t,r])=>by.single.push({h:t,sub:r.d<1e9?jd(r.d):'',L:r.L.sort((a,b)=>(a.role=='Main'?0:1)-(b.role=='Main'?0:1))}));
 try{Object.values((S.th&&S.th.st)||{}).filter(s=>s.status!='draft'||thAll(s).length).sort((a,b)=>(a.no||99)-(b.no||99)).forEach(s=>{const SL=thAll(s).map(it=>idx.get(it.song)).filter(Boolean);if(SL.length)by.stage.push({h:`${s.no?ordN(s.no)+' Stage · ':''}${s.name}`,sub:thLabel(s.k),L:SL})})}catch(e){}
 const N=L.filter(o=>!o.rel);if(N.length)by.new.push({h:PLP_T('Unreleased songs','เพลงที่ยังไม่วางขาย'),sub:'',L:N});return by}
function plpOpen(){ui.plp=ui.plp||{tab:'single',q:'',sel:[]};ui.plp.sel=[];{const D=plpData();if(!(D[ui.plp.tab]||[]).length)ui.plp.tab=['single','stage','new'].find(k=>D[k].length)||'single'}ui.mod={t:'html',plp:1,h:plpHtml()};render()}
function plpRe(){if(ui.mod&&ui.mod.plp){ui.mod.h=plpHtml();render()}}
function plpTog(id){const P=ui.plp;const i=P.sel.indexOf(id);if(i>=0)P.sel.splice(i,1);else P.sel.push(id);plpRe()}
function plpAll(ids,on){const P=ui.plp;ids.forEach(id=>{const i=P.sel.indexOf(id);if(on&&i<0)P.sel.push(id);if(!on&&i>=0)P.sel.splice(i,1)});plpRe()}
function plpAdd(){const P=ui.plp,ids=P.sel.slice();if(!ids.length)return;const t0=toast,msg=[];let n=0;toast=function(m,k){if(k=='err')msg.push(String(m))};
 try{ids.forEach(id=>{const before=plIn(id);plAddLib(id);if(!before&&plIn(id))n++})}finally{toast=t0}
 ui.mod=null;P.sel=[];toast(PLP_T(`${n} song(s) added.`,`เพิ่มแล้ว ${n} เพลง`)+(msg.length?' · '+msg[0]:''),msg.length&&!n?'err':undefined);render()}
function plpHtml(){const P=ui.plp||{tab:'single',q:'',sel:[]},D=plpData(),q=(P.q||'').toLowerCase(),sel=new Set(P.sel);
 const T=[['single',PLP_T('Singles','ซิงเกิล')],['stage',PLP_T('Stages','สเตจ')],['new',PLP_T('Unreleased','ยังไม่วางขาย')]];
 const blocks=(D[P.tab]||[]).map(b=>({...b,L:b.L.filter(o=>!q||o.title.toLowerCase().includes(q))})).filter(b=>b.L.length);
 return`<h2 class="ht">${PLP_T('Add from the Song Library','เพิ่มจากคลังเพลง')}</h2><div class="row cctabs">${T.map(([k,n])=>`<button class="b s ${P.tab==k?'p':''}" onclick="ui.plp.tab='${k}';plpRe()">${n}</button>`).join('')}</div>
 <input class="ccpkq" placeholder="${PLP_T('Search songs','ค้นหาเพลง')}" value="${esc(P.q||'')}" onchange="ui.plp.q=this.value;plpRe()">
 <div class="ccpk">${blocks.map(b=>{const ids=b.L.map(o=>o.id),all=ids.every(i=>sel.has(i));return`<details open class="ccpkb"><summary><b>${esc(b.h)}</b> <small class="st">${esc(b.sub||'')}</small></summary>
  <div class="row"><button class="b s" onclick='plpAll(${JSON.stringify(ids)},${all?0:1})'>${all?PLP_T('Unselect all','ยกเลิกทั้งหมด'):PLP_T('Select all','เลือกทั้งหมด')}</button></div>
  ${b.L.map(o=>`<label class="row ccpki plpi ${sel.has(o.id)?'on':''}"><input type="checkbox" ${sel.has(o.id)?'checked':''} onchange="plpTog('${o.id}')"><div style="flex:1;min-width:0"><b>${esc(o.title)}</b><small class="st">${o.rel?esc(o.role=='Main'?PLP_T('Title Track','เพลงหลัก'):PLP_T('Coupling','เพลงรอง')):PLP_T('Unreleased','ยังไม่วางขาย')}${o.genre?' · '+esc(o.genre):''}${o.concept?' · '+esc(o.concept):''}</small></div></label>`).join('')}</details>`}).join('')||`<p class="st">${P.tab=='stage'?PLP_T('No Stage songs to add.','ไม่มีเพลงสเตจให้เพิ่ม'):PLP_T('No songs match.','ไม่มีเพลงที่ตรง')}</p>`}</div>
 <div class="row plpbar"><button class="b p" ${P.sel.length?'':'disabled'} onclick="plpAdd()">＋ ${PLP_T('Add selected','เพิ่มที่เลือก')} (${P.sel.length})</button><button class="b" onclick="ui.mod=null;render()">${PLP_T('Close','ปิด')}</button></div>`}
{const f=V.music;V.music=function(){let h=f.apply(this,arguments);try{h=h.replace(/<select onchange="if\(this\.value\)plAddLib\(this\.value\)"[^>]*>[\s\S]*?<\/select>/,`<button class="b" onclick="plpOpen()">＋ ${PLP_T('Add from the Song Library','เพิ่มจากคลังเพลง')}</button>`)}catch(e){}return h}}
