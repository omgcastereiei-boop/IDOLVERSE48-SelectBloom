// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Character Creator: Back Hair picker & mixed back-hair layers
// -------------------------------------------------------------------------------------
//  The Back Hair category shows the styles in groups (Short · Medium · Long · Tied ·
//  Twin tails · Buns, braids & half-up) and a layer panel:
//   · "+ Add layer" adds another back-hair layer (up to 5 extra layers);
//   · tap a layer to choose which one the style grid changes (the main back hair or a layer);
//   · ▲ ▼ move a layer forward / backward (the main back hair can be moved too),
//     ✕ removes a layer, X / Y / Size adjust a layer's position and size.
//  Everything stays in the draft until "Confirm & Save" (m.ap.bk + m.ap.bkx).
// =====================================================================================
const BH_MAXL=5;
// the stack as shown (bottom → top); {m:1} is the main back hair
function bhStack(d){const X=Array.isArray(d.bkx)?d.bkx:[];return X.some(L=>L&&L.m)?X:[{m:1},...X]}
function bhEdit(fn){const d=ui.draft;if(!d)return;const S0=bhStack(d).map(L=>({...L}));fn(S0);const extra=S0.filter(L=>!L.m);d.bkx=extra.length?(S0[0].m?extra:S0):undefined;if(!d.bkx)delete d.bkx;render()}
function bhAddLayer(){const d=ui.draft;if(!d)return;if(bhStack(d).filter(L=>!L.m).length>=BH_MAXL)return toast(`At most ${BH_MAXL} extra layers.`,'err');bhEdit(S=>{S.push({k:d.bk!=null?d.bk:2,x:0,y:0,s:1});ui.apLay=S.length-1})}
function bhSel(i){ui.apLay=i;render()}
function bhRm(i){bhEdit(S=>{if(S[i]&&!S[i].m)S.splice(i,1)});ui.apLay=null}
function bhMv(i,dd){bhEdit(S=>{const j=i+dd;if(j<0||j>=S.length)return;[S[i],S[j]]=[S[j],S[i]];if(ui.apLay==i)ui.apLay=j;else if(ui.apLay==j)ui.apLay=i})}
function bhSet(i,k,v){bhEdit(S=>{const L=S[i];if(!L||L.m)return;L[k]=k=='s'?Math.max(.5,Math.min(1.6,+v||1)):Math.max(-30,Math.min(30,+v||0))})}
function bhPick(k){const d=ui.draft;if(!d)return;const S0=bhStack(d),L=ui.apLay!=null&&S0[ui.apLay];if(L&&!L.m){bhEdit(S=>{S[ui.apLay].k=k})}else apPick('bk',k)}
function bhUiHtml(){const d=ui.draft,S0=bhStack(d);if(ui.apLay!=null&&!S0[ui.apLay])ui.apLay=null;const cur=ui.apLay!=null&&!S0[ui.apLay].m?S0[ui.apLay]:null,curK=cur?cur.k:d.bk;
 const one=k=>({...d,bk:k,bkx:undefined,sx:0}),pm=o=>{const m=get(ui.cm);return{...m,_x:1,ap:o}};
 const layers=S0.map((L,i)=>{const k=L.m?d.bk:L.k,on=(ui.apLay==null&&L.m)||ui.apLay==i;return`<div class="c bhl ${on?'on':''}"><button class="bhlp" onclick="bhSel(${L.m?'null':i})">${pt(pm(one(k)),44,1)}</button><div class="bhlb"><b>${L.m?'Main back hair':'Layer '+i}</b><small>${esc(BKN[k]||'')}</small>${L.m?'':`<div class="bhls"><label>X <input type="range" min="-30" max="30" value="${+L.x||0}" onchange="bhSet(${i},'x',this.value)"></label><label>Y <input type="range" min="-30" max="30" value="${+L.y||0}" onchange="bhSet(${i},'y',this.value)"></label><label>Size <input type="range" min="50" max="160" value="${Math.round((+L.s||1)*100)}" onchange="bhSet(${i},'s',this.value/100)"></label></div>`}</div>
  <div class="bhlc"><button class="b s" title="Move backward" onclick="bhMv(${i},-1)">▲</button><button class="b s" title="Move forward" onclick="bhMv(${i},1)">▼</button>${L.m?'':`<button class="b s" title="Remove layer" onclick="bhRm(${i})">✕</button>`}</div></div>`}).join('');
 const grid=BH_GROUPS.map(([g,ids])=>`<h4 class="bhg">${esc(g)}</h4><div class="th apth">${ids.filter(i=>BKN[i]!=null).map(i=>`<button class="tb ${curK===i?'on':''}" onclick="bhPick(${i})">${pt(pm(one(i)),64,0)}<small>${esc(BKN[i])}</small></button>`).join('')}</div>`).join('');
 return`<div class="c"><b>Back Hair</b><p class="st">Chosen independently of the bangs and side locks. Combine several back hair layers for your own hairstyle.</p>
 <div class="c bhlay"><div class="row"><b>Layers</b><span class="st">top of the list = furthest back</span><span style="flex:1"></span><button class="b s p" onclick="bhAddLayer()">＋ Add layer</button></div>${layers}<p class="st">Editing: <b>${cur?'Layer '+ui.apLay:'Main back hair'}</b> — pick a style below.</p></div>${grid}</div>`}
{const f=apBody;apBody=function(cat){if(cat=='back')return bhUiHtml();return f.apply(this,arguments)}}
// random appearance: one back hair, no extra layers
{const f=rapp;rapp=function(){const a=f.apply(this,arguments);delete a.bkx;return a}}
{const f=resetAp;resetAp=function(){ui.apLay=null;return f.apply(this,arguments)}}
{const f=cmSel;cmSel=function(){ui.apLay=null;return f.apply(this,arguments)}}
