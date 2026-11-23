// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Under Girls costume: one design per release, required
// -------------------------------------------------------------------------------------
//  · Every single / album has ONE Under Girls costume (the Single Costume). It is designed once and every
//    member outside the Title Track Senbatsu wears it: it is copied to each of them (p.scz.cdz.mem), so the
//    profile outfit at release, promotion events, the election "latest costume" and the concert
//    "Single costumes" option keep working unchanged.
//  · It is required: a release whose Title Track does not include every eligible member cannot start
//    production until the Under Girls costume is saved.
//  · Just before release the copy is refreshed for every member outside the Title Track, so at release they
//    all get it as their profile outfit automatically.
// =====================================================================================
const sczT=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
const sczOne=p=>(p&&p.scz&&p.scz.cdz&&p.scz.cdz.one)||null;
function sczFill(p){const one=sczOne(p);if(!one)return 0;const z=plSczHost(p).cdz;z.mode='one';z.mem=z.mem||{};let n=0;
 plSczMembers(p).forEach(m=>{z.mem[m.id]={own:{name:`Under Girls — ${m.name}`,p:czClone(one.p),updated:one.updated},ok:true};n++});return n}
// required before production starts
{const f=reqs;reqs=function(p){const r=f.apply(this,arguments);try{if(p&&p.status=='draft'&&plSczMembers(p).length&&!sczOne(p))r.push(sczT('Design the Under Girls costume (one costume for every member outside the Title Track Senbatsu).','ออกแบบชุด Under Girls (ชุดเดียวสำหรับเมมทุกคนที่ไม่ติดเซ็มบัตสึเพลงหลัก)'))}catch(e){console.error(e)}return r}}
// the designer: one design, saved for everyone
{const f=plCzLoad;plCzLoad=function(){f.apply(this,arguments);try{const s=ui.scz;if(s&&s.song=='__single'){const one=sczOne(S.pj);if(one){ui.czE.p=czClone(one.p);ui.czE.did='mz~__single~one'}else ui.czE.did=null}}catch(e){console.error(e)}}}
{const f=plCzSave;plCzSave=function(){const s=ui.scz;if(!s||s.song!='__single'||!S.pj)return f.apply(this,arguments);const p=S.pj,H=plSczHost(p);
 H.cdz.one={p:czClone(ui.czE.p),updated:S.day,name:`Under Girls — ${p.title||''}`};const n=sczFill(p);ui.czE.dirty=0;ui.czE.did='mz~__single~one';
 toast(sczT(`Under Girls costume saved — ${n} member(s) outside the Title Track wear it.`,`บันทึกชุด Under Girls แล้ว — เมม ${n} คนที่ไม่ติดเซ็มเพลงหลักจะใส่ชุดนี้`));render()}}
{const f=plCzMem;if(typeof f=='function')plCzMem=function(mid){if(ui.scz&&ui.scz.song=='__single'){ui.scz.mid=mid;if(ui.czE)ui.czE.mid=mid;render();return}return f.apply(this,arguments)}}
// the planning card
plSczCard=function(p,lk){const H=plCzHost('__single');if(!H)return'';const M=H.mem,one=sczOne(p),m0=M[0];
 const pic=m0?(()=>{const a=ap(m0);return`<svg viewBox="10 -2 80 200" class="sczpic">${fig(m0,{pose:0,of:a.of,oh:a.oh,ac:a.ac,ex:2,...(one?{cd:one.p}:{})})}</svg>`})():'';
 return`<div class="c songc plscz"><div class="sh2"><span class="tag plsct">${plAlb(p)?'ALBUM COSTUME':'SINGLE COSTUME'}</span><b>Under Girls</b><span class="tag ${one?'':'warn'}">${one?sczT('✔ Designed','✔ ออกแบบแล้ว'):sczT('Required','จำเป็นต้องทำ')}</span></div>
 <p class="st">${sczT(`One costume for the ${M.length} member(s) outside the Title Track Senbatsu. They all wear it in their profile from release day and at events promoting this ${plAlb(p)?'album':'single'}. It never replaces a song's costume.`,`ชุดเดียวสำหรับเมม ${M.length} คนที่ไม่ติดเซ็มบัตสึเพลงหลัก ทุกคนจะใส่ชุดนี้ในโปรไฟล์ตั้งแต่วันวางขาย และใส่ในงานโปรโมต${plAlb(p)?'อัลบั้ม':'ซิงเกิ้ล'}นี้ ไม่แทนที่ชุดของเพลงใด ๆ`)}</p>
 ${M.length?`<div class="row sczrow">${pic}<div><div class="plczmini">${M.slice(0,12).map(x=>`<span title="${esc(x.name)}">${ptc(x,26)}</span>`).join('')}${M.length>12?`<span class="st">+${M.length-12}</span>`:''}</div>
 <div class="row"><button class="b s p" onclick="plCzOpen('__single')">👗 ${one?sczT('Edit the Under Girls costume','แก้ไขชุด Under Girls'):sczT('Design the Under Girls costume','ออกแบบชุด Under Girls')}</button></div></div></div>`:`<span class="st">${sczT('Everyone eligible is in the Title Track Senbatsu.','เมมทุกคนติดเซ็มเพลงหลักแล้ว')}</span>`}</div>`};
// designer page header for the Under Girls costume
{const f=V.songcz;V.songcz=function(){let h=f.apply(this,arguments);try{const s=ui.scz;if(s&&s.song=='__single'&&S.pj){const H=plCzHost('__single'),n=H.mem.length,one=sczOne(S.pj);
  h=h.replace(/<b>\d+ \/ \d+ members designed<\/b>/,`<b>${sczT(`One costume · ${n} member(s)`,`ชุดเดียว · เมม ${n} คน`)}</b>`).replace(/<small>(✔ Done|✗ To design)<\/small>/g,`<small>${one?'✔':'—'}</small>`)
   .replace('💾 Save Single Costume',`💾 ${sczT('Save for all '+n+' members','บันทึกให้เมมทั้ง '+n+' คน')}`).replace(/<button class="b s"[^>]*onclick="plCzCopyAll\(\)"[^>]*>[\s\S]*?<\/button>/,'');
  h=h.replace('<div class="c plczh">',`<div class="c gebanner"><span class="st">${sczT('Tap a member in the strip to preview the costume on her. The design is the same for everyone.','แตะเมมด้านบนเพื่อดูชุดบนตัวเธอ ทุกคนใส่ชุดเดียวกัน')}</span></div><div class="c plczh">`)}}catch(e){console.error(e)}return h}}
// release: refresh the copy for everyone outside the Title Track (the profile outfit is set at release)
{const f=doRelease;doRelease=function(){try{const p=S.pj;if(p&&p.status=='producing')sczFill(p)}catch(e){console.error(e)}return f.apply(this,arguments)}}
