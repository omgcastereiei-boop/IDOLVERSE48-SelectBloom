// =====================================================================================
//  Music Video — round 2
//  · two styles only: Performance MV and Story MV (Performance has no storyline)
//  · one scene per MV (no adding scenes) · 🎲 random location
//  · Story Concept: browse by category (like the genre picker) · 🎲 random story
//  · ← Single Production under the confirm button · MV Library sort (release date / views)
//  Old saves: an MV still being planned with another style becomes a Performance MV; published MVs keep their style.
// =====================================================================================
const MV2_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
const MV2_STY=['perf','story'];
function mv2Fix(v){if(!v||v.st!='plan')return v;if(!MV2_STY.includes(v.style))v.style='perf';if(v.style=='perf'){v.story='none';delete v.sc}
 if(Array.isArray(v.scenes)&&v.scenes.length>1){const ov=v.scenes.find(sc=>{const L=mvLoc(sc.id);return L&&L.ovs});v.scenes=[ov||v.scenes[0]]}return v}
{const f=mvOf;mvOf=function(o){const v=f.apply(this,arguments);try{mv2Fix(v)}catch(e){}return v}}
{const f=mvxSync;mvxSync=function(v){try{if(v&&Array.isArray(v.scenes)&&v.scenes.length>1)v.scenes=v.scenes.slice(0,1)}catch(e){}return f.apply(this,arguments)}}
mvxAdd=function(){toast(MV2_T('An MV has one scene. Change the location instead.','MV มีซีนเดียว เปลี่ยนสถานที่แทนได้'),'err')};
mvxDup=mvxAdd;
{const f=mvSet;mvSet=function(id,k,val){if(k=='style'&&!MV2_STY.includes(val))return;const r=f.apply(this,arguments);try{const o=S.songs[id];if(o&&o.mv)mv2Fix(o.mv)}catch(e){}return r}}
// random location (any location except the current one)
function mv2RandLoc(){const o=S.songs[ui.mvs];if(!o)return;const v=mvOf(o),cur=mvxScenes(v)[0].id;const L=MV_LOC.filter(l=>l.id!=cur&&(!ui.mv2ovs?!l.ovs:true));const X=L[Math.floor(Math.random()*L.length)];if(!X)return;ui.mvxi=0;mvxPick(X.id)}
// random story concept
function mv2RandStory(){const o=S.songs[ui.mvs];if(!o)return;const v=mvOf(o),c=ui.mv2cat;let L=MV_SC.map((x,i)=>i).filter(i=>i!==v.sc);if(c!=null&&c!=='all')L=L.filter(i=>Math.floor(i/10)==c);const i=L[Math.floor(Math.random()*L.length)];if(i==null)return;ui.mv2cat=Math.floor(i/10);mvScPick(i)}
// Story Concept picker: categories like the genre picker
mvxConceptSection=function(o,v,ed){const F=ui.mvscf=ui.mvscf||{q:''},cur=mvScOf(v.sc),dis=ed?'':'disabled',q=(F.q||'').toLowerCase();
 if(ui.mv2cat==null)ui.mv2cat=v.sc!=null&&cur?Math.floor(v.sc/10):0;const cat=ui.mv2cat;
 const items=MV_SC.map((x,i)=>[x,i]).filter(([x,i])=>q?(x[0].toLowerCase().includes(q)||x[1].toLowerCase().includes(q)):Math.floor(i/10)==cat);
 const cats=MV_SC_CATS.map((c,ci)=>`<button class="mv2cat ${!q&&ci==cat?'on':''}" onclick="ui.mv2cat=${ci};ui.mvscf.q='';render()">${esc(c[1])}${v.sc!=null&&Math.floor(v.sc/10)==ci?' ●':''}</button>`).join('');
 return`<div class="c mvscsec mv2sec"><h3><span class="mv2n">3</span> Story Concept <small class="st">Story MV · choose one</small></h3>
 ${cur?`<div class="mvsccur"><b>${esc(cur.n)}</b><span>${esc(cur.d)}</span><small>${esc(cur.cat[1])}</small></div>`:'<p class="thwarn">Choose a Story Concept for this Story MV.</p>'}
 <div class="row mv2act">${ed?`<button class="b s p" onclick="mv2RandStory()">🎲 ${MV2_T('Random story','สุ่มสตอรี่')}</button>`:''}<input class="mvscq" placeholder="Search concepts" value="${esc(F.q||'')}" oninput="ui.mvscf.q=this.value;clearTimeout(window.__mvsq);window.__mvsq=setTimeout(()=>{render();const i=document.querySelector('.mvscq');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},250)"></div>
 <div class="mv2cats">${cats}</div>
 <div class="mvscgrid">${items.map(([x,i])=>`<button class="mvscc ${v.sc===i?'on':''}" ${dis} onclick="mvScPick(${i})"><b>${esc(x[0])}</b><small>${esc(x[1])}</small></button>`).join('')||'<p class="st">No concept matches.</p>'}</div></div>`};
{const f=V.mvplan;V.mvplan=function(){let h=f.apply(this,arguments);try{const o=S.songs[ui.mvs],p=S.pj;if(!o||!p||!o.mv)return h;const v=mvOf(o),ed=!lockedSong(o.id)&&v.st=='plan';
  // styles: Performance / Story only
  h=h.replace(/<button class="mvcard[^"]*"[^>]*onclick="mvSet\('[^']+','style','(cine|concept|loc|sfx)'\)">[\s\S]*?<\/button>/g,'');
  h=h.replace('<div class="c"><h3>1 · MV Style <small class="st">choose one</small></h3><div class="mvgrid">',`<div class="c mv2sec"><h3><span class="mv2n">1</span> MV Style <small class="st">${MV2_T('Performance MV has no storyline','Performance MV ไม่มีสตอรี่')}</small></h3><div class="mvgrid mv2sty">`);
  // Performance: no storyline section
  if(v.style!='story'){const c=h.indexOf('<div class="c"><h3>3 · '),d=h.indexOf('<div class="c"><h3>4 · ');if(c>=0&&d>c)h=h.slice(0,c)+h.slice(d)}
  h=h.replace('<div class="c"><h3>4 · Senbatsu &amp; costume</h3>',`<div class="c mv2sec"><h3><span class="mv2n">${v.style=='story'?4:3}</span> Senbatsu &amp; costume</h3>`);
  // one scene: no scene list / add / move
  const a=h.indexOf('<div class="mvxleft">'),b=h.indexOf('<div class="mvxright">');if(a>=0&&b>a)h=h.slice(0,a)+h.slice(b);
  h=h.replace(/<h3>2 · Scenes &amp; locations <small class="st">[^<]*<\/small><\/h3>/,`<h3><span class="mv2n">2</span> Filming location <small class="st">${MV2_T('one scene','ซีนเดียว')}</small></h3>`).replace('<div class="c mvxsec">','<div class="c mvxsec mv2sec mv2one">');
  if(ed){h=h.replace(/(<button class="b s p" onclick="ui\.mvxLib=ui\.mvxLib\?0:1;render\(\)">)/,`<button class="b s" onclick="mv2RandLoc()">🎲 ${MV2_T('Random location','สุ่มสถานที่')}</button><label class="st mv2ovs"><input type="checkbox" ${ui.mv2ovs?'checked':''} onchange="ui.mv2ovs=this.checked?1:0"> ${MV2_T('include overseas','รวมต่างประเทศ')}</label>$1`)}
  // back to Single Production under the confirm button
  h=h.replace('<p class="st">The MV is filmed in Week 3',`<div class="row mv2back"><button class="b" onclick="goView('music')">← ${MV2_T('Back to Single Production','กลับไปหน้าทำซิงเกิล')}</button></div><p class="st">The MV is filmed in Week 3`);
  h=h.replace('<div class="c mvhero">','<div class="c mvhero mv2hero">')}catch(e){console.error(e)}return h}}
// MV Library: sort by release date / views
{const f=V.mvlib;V.mvlib=function(){let h=f.apply(this,arguments);try{const k=ui.mvSort||'new',a=h.indexOf('<div class="mvlib">');if(a<0)return h;
  const re=/<button class="c mvli" onclick="mvOpen\('([^']+)'\)">[\s\S]*?<\/button>/g,B=[];let m;while((m=re.exec(h)))B.push({id:m[1],h:m[0],i:m.index,e:m.index+m[0].length});if(!B.length)return h;
  const val=id=>{const v=(S.songs[id]||{}).mv||{};return k=='new'||k=='old'?(v.pub|0):(v.v||0)};const sorted=[...B].sort((x,y)=>k=='old'||k=='low'?val(x.id)-val(y.id):val(y.id)-val(x.id));
  h=h.slice(0,B[0].i)+sorted.map(x=>x.h).join('')+h.slice(B[B.length-1].e);
  const opts=[['new',MV2_T('Newest','ปล่อยล่าสุด')],['old',MV2_T('Oldest','ปล่อยเก่าสุด')],['views',MV2_T('Most views','ยอดวิวมากสุด')],['low',MV2_T('Fewest views','ยอดวิวน้อยสุด')]];
  h=h.replace('<div class="mvlib">',`<div class="row mv2sort"><span class="st">${MV2_T('Sort','เรียง')}</span>${opts.map(([x,n])=>`<button class="cvchip ${k==x?'on':''}" onclick="ui.mvSort='${x}';render()">${n}</button>`).join('')}</div><div class="mvlib">`)}catch(e){console.error(e)}return h}}
// old saves: MVs being planned
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{Object.values(S.songs||{}).forEach(o=>{if(o.mv)mv2Fix(o.mv)})}catch(e){}return r}}
try{Object.assign(I18N_TH,{'MV Style':'สไตล์ MV','Filming location':'สถานที่ถ่ายทำ','Story Concept':'คอนเซปต์สตอรี่','Senbatsu & costume':'เซ็มบัตสึและชุด','Senbatsu &amp; costume':'เซ็มบัตสึและชุด'})}catch(e){}
