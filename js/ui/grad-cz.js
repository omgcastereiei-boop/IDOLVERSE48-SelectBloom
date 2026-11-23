// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Graduation Costume dressing room
// -------------------------------------------------------------------------------------
//  "Create / Edit Graduation Costume" opens a page for THIS costume only (not the Costume Library): the model is
//  the graduating member herself, the full piece editor (with the Graduation category), and a design can be started
//  from her own earlier costumes (her songs, profile costumes), from a library design or from a preset
//  (graduation presets first). Saving updates her Graduation Costume design.
// =====================================================================================
const gczT=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
// her earlier costumes: songs she sang (every group context), her profile costume and its history
function gczOld(m){const out=[],seen=new Set(),add=(name,p)=>{if(!p)return;const k=JSON.stringify(p).length+':'+name;if(seen.has(k))return;seen.add(k);out.push({name,p})};
 try{(S.groups||[]).forEach(g=>gsWith(g.id,()=>{Object.values(S.songs||{}).filter(o=>o&&(o.slots||[]).includes(m.id)&&o.rel).sort((a,b)=>(b.relDay||0)-(a.relDay||0)).forEach(o=>{try{add(o.title,czFor(o,m.id))}catch(e){}})}))}catch(e){}
 try{if(m.profCz&&m.profCz.p)add(gczT('Profile costume','ชุดโปรไฟล์')+(m.profCz.name?' · '+m.profCz.name:''),m.profCz.p);(m.czHist||[]).slice().reverse().forEach(h=>h&&h.p&&add(h.name||gczT('Earlier profile costume','ชุดโปรไฟล์เก่า'),h.p))}catch(e){}
 return out.slice(0,60)}
ctGradCz=function(mid){const m=get(mid);if(!m||!m.grad)return;czInit();let d=m.grad.cz&&czD(m.grad.cz);
 if(!d){const k=CZG0+rnd(0,CZG_PRE.length-2);d={id:czId(),name:cleanName(`${m.stage||m.name} Graduation`).slice(0,40)||'Graduation',p:czClone(CZ_PRESETS[k][1]),style:CZ_PRESET_STYLE[k]||'',created:S.day,updated:S.day,grad:mid};czLib().ds.push(d);m.grad.cz=d.id;hev(m,{t:'ct_gcz',name:d.name})}
 ui.gcz={mid,did:d.id,back:{view,mod:ui.mod}};ui.mod=null;ui.czE={did:d.id,p:czClone(d.p),style:d.style||'',dirty:0,cat:'g',sel:'g.'+(Object.keys(d.p.g||{})[0]||'flowers'),mid,pose:0,ex:2,song:null,scz:1};view='gradcz';render();try{window.scrollTo(0,0)}catch(e){}};
function gczSave(){const G=ui.gcz,m=G&&get(G.mid),d=G&&czD(G.did);if(!m||!d||!ui.czE)return;d.p=czClone(ui.czE.p);d.updated=S.day;ui.czE.dirty=0;toast(gczT(`${m.name}'s Graduation Costume saved.`,`บันทึกชุดแกรดของ ${m.name} แล้ว`));render()}
function gczRevert(){const G=ui.gcz,d=G&&czD(G.did);if(!d||!ui.czE)return;ui.czE.p=czClone(d.p);ui.czE.dirty=0;render()}
function gczFrom(kind,v){const G=ui.gcz,m=G&&get(G.mid);if(!m||!ui.czE||v==='')return;let p=null;if(kind=='old'){const L=gczOld(m);p=(L[+v]||{}).p}else if(kind=='lib'){const d=czD(v);p=d&&d.p}else if(kind=='pre'){p=(CZ_PRESETS[+v]||[])[1]}
 if(!p)return;ui.czE.p=czClone(p);ui.czE.dirty=1;toast(gczT('Loaded as the starting point — edit it, then save.','โหลดเป็นต้นแบบแล้ว แก้ไขแล้วกดบันทึก'));render()}
function gczBack(){czConfirmLeave(()=>{const G=ui.gcz||{},mid=G.mid;ui.czE=null;ui.gcz=null;const b=G.back||{};if(b.view&&b.view!='gradcz'){view=b.view;ui.mod=b.mod||null}else{goView('members');ui.ptab='stats';ui.mod={t:'prof',id:mid}}render()})}
V.gradcz=function(){const G=ui.gcz,m=G&&get(G.mid),d=G&&czD(G.did);if(!m||!d)return`<p class="st">${gczT('No Graduation Costume selected.','ยังไม่ได้เลือกชุดแกรด')}</p>`;
 if(!ui.czE||ui.czE.did!=d.id){ui.czE={did:d.id,p:czClone(d.p),style:d.style||'',dirty:0,cat:'g',sel:'g',mid:m.id,pose:0,ex:2,song:null,scz:1}}ui.czE.mid=m.id;
 const E=ui.czE,old=gczOld(m),lib=czLib().ds.filter(x=>x.id!=d.id&&x.p),pre=CZ_PRESETS.map(([n],i)=>[n,i]),gpre=pre.filter(([,i])=>i>=CZG0),opre=pre.filter(([,i])=>i<CZG0);
 let grid=czGridHtml(E,null,null,m).replace(/<label class="st">Model <select[\s\S]*?<\/select><\/label>/,'').replace('onclick="czSave()"','onclick="gczSave()"').replace('onclick="czRevert()"','onclick="gczRevert()"').replace('💾 Save design','💾 '+gczT('Save Graduation Costume','บันทึกชุดแกรด'));
 return`<h2 class="ht">🎓 ${gczT('Graduation Costume','ชุดแกรด')} · ${esc(m.name)}</h2><div class="c plczh"><div class="row"><span class="tag g4tag">🎓 ${esc(d.name)}</span><span class="st">${gczT('Worn at her Graduation Stage and kept as her final profile image. Face and hair never change.','ใส่ในสเตจแกรดและเป็นรูปโปรไฟล์สุดท้ายของเธอ หน้าและผมไม่เปลี่ยน')}</span><span style="flex:1"></span><button class="b" onclick="gczBack()">◀ ${gczT('Back','กลับ')}</button></div>
 <div class="row"><button class="b s p" onclick="plCzRandom()">🎲 ${gczT('Randomize','สุ่มชุด')}</button>
 <select onchange="gczFrom('old',this.value);this.value=''"><option value="">${gczT('Start from her earlier costume…','ใช้ชุดเก่าของเธอเป็นต้นแบบ…')}</option>${old.map((x,i)=>`<option value="${i}">${esc(x.name)}</option>`).join('')}</select>
 <select onchange="gczFrom('pre',this.value);this.value=''"><option value="">${gczT('Start from a preset…','ใช้แบบสำเร็จรูป…')}</option><optgroup label="${gczT('Graduation','แกรด')}">${gpre.map(([n,i])=>`<option value="${i}">${esc(n)}</option>`).join('')}</optgroup><optgroup label="${gczT('Other','อื่นๆ')}">${opre.map(([n,i])=>`<option value="${i}">${esc(n)}</option>`).join('')}</optgroup></select>
 <select onchange="gczFrom('lib',this.value);this.value=''"><option value="">${gczT('Start from a library design…','ใช้ดีไซน์จากคลังชุด…')}</option>${lib.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select></div></div>${grid}`};
// the Randomize button needs a dressing-room context
{const f=plCzRandom;plCzRandom=function(){if(view=='gradcz'&&ui.czE){ui.czE.p=czRandom();ui.czE.dirty=1;toast(gczT('Random costume generated — save to keep it.','สุ่มชุดแล้ว กดบันทึกเพื่อเก็บ'));return render()}return f.apply(this,arguments)}}
