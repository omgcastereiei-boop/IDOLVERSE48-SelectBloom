// =====================================================================================
//  UI updates: promotion pictures open their results · costume presets with pictures (3 columns)
// =====================================================================================
// ---- 1. Discography / promotion: the Handshake picture opens its results, a Roadshow picture its details ----------------
{const f=evOpen;evOpen=function(id){try{const sp=evImgOf(id),SG=S.singles||[];
 if(sp&&sp.k=='hs'){const x=SG.find(z=>(z.promo||[]).some(r=>r.id==id))||SG.find(z=>z.rid==sp.rid);const r=x&&(x.promo||[]).find(y=>y.type=='handshake'&&y.v==2&&y.res);if(r){ui.mod={t:'hsres',P:r.res};return render()}}
 if(sp&&sp.k=='road'){const rec=SG.flatMap(x=>x.promo||[]).find(r=>r.id==id&&r.type=='road'&&r.v==2&&r.res);if(rec){ui.mod={t:'rsres',id,tab:'region'};return render()}}}catch(e){console.error(e)}return f.apply(this,arguments)}}
{const f=singlePromo;singlePromo=function(x){let h=f.apply(this,arguments);try{h=h.replace(/ ?<button class="b s" onclick="hsOpenRes\('[^']+'\)">View results<\/button>/g,'').replace(/ ?<button class="b s" onclick="ui\.mod=\{t:'rsres',id:'[^']+',tab:'region'\};render\(\)">Details<\/button>/g,'');
 if(h.includes('class="evgal"'))h=h.replace('<div class="evgal">','<p class="st evhint">Tap a picture: the Handshake Event shows its results, a Roadshow its details.</p><div class="evgal">')}catch(e){console.error(e)}return h}}
// ---- 4. costume presets: a picture for every preset, 3 columns ----------------------------------------------------------
let CZPS=null;
function czPsMem(){try{if(ui.czE&&ui.czE.mid&&get(ui.czE.mid))return get(ui.czE.mid);if(ui.scz&&get(ui.scz.mid))return get(ui.scz.mid);const X=typeof thCzCtx=='function'&&thCzCtx();if(X&&get(X.c.mid))return get(X.c.mid)}catch(e){}return(S.members||[]).find(isAct)||S.members[0]}
function czPsOpen(i){const sel=CZPS&&CZPS[i];if(!sel)return;const m=czPsMem();if(!m)return;const a=ap(m);
 ui.mod={t:'html',h:`<h2 class="ht">Start from a preset</h2><p class="st">Every piece stays editable after you pick a preset.</p><div class="czps">${CZ_PRESETS.map(([n,cd],k)=>{let svg='';try{svg=`<svg viewBox="10 -2 80 200">${fig(m,{pose:0,of:a.of,oh:a.oh,ac:a.ac,ex:2,cd})}</svg>`}catch(e){}return`<button class="czpsi" onclick="czPsPick(${i},${k})">${svg}<b>${esc(n)}</b></button>`}).join('')}</div>`};render()}
function czPsPick(i,k){const code=CZPS&&CZPS[i];ui.mod=null;if(!code)return render();try{new Function(code).call({value:String(k)})}catch(e){console.error(e);render()}}
{const f=render;render=function(){const r=f.apply(this,arguments);try{CZPS=[];document.querySelectorAll('select').forEach(sel=>{const oc=sel.getAttribute('onchange')||'';if(!/CZ_PRESETS|czPreset\(/.test(oc)||sel.dataset.czps)return;const i=CZPS.length;CZPS.push(oc);sel.dataset.czps=1;sel.style.display='none';const b=document.createElement('button');b.type='button';b.className='b s czpsb';b.textContent='🎨 '+(typeof tr=='function'?tr('Presets'):'Presets');b.onclick=()=>czPsOpen(i);sel.after(b)})}catch(e){}return r}}
