// =====================================================================================
//  Costume Designer — one clear set of categories for every piece
// -------------------------------------------------------------------------------------
//  The designer lists pieces in display categories by body area (Clothing / Details /
//  Accessories / Festival & seasonal / Traditional). A display category can hold pieces from
//  several storage categories (for example Head & hair = head accessories + the hair pieces of
//  the basic accessories). Storage does not change (design[category] keeps every piece where it
//  always was), so saved costumes, presets and randomizers are untouched.
// =====================================================================================
const CZT_SEC=[['cloth','Clothing'],['detail','Details'],['acc','Accessories'],['fes','Festival & seasonal'],['trad','Traditional ornaments']];
// [key, name, section, storage categories shown here by default, single pieces moved here ("category.piece")]
const CZT=[
 ['u_top','Tops','cloth',['top'],[]],
 ['u_dr','Dresses','cloth',['dr'],[]],
 ['u_bottom','Skirts & pants','cloth',['bottom'],[]],
 ['u_layer','Skirt layers & overlays','cloth',['over','skx','sko'],['g.train']],
 ['u_outer','Jackets, capes & robes','cloth',['outer','wrap'],['x.cape','bk.royalcape','bk.splitcape','shd.capelet','g.robe']],
 ['u_sleeve','Sleeves & cuffs','cloth',['sleeve','cuff'],['x.dsl']],
 ['u_collar','Collars & necklines','cloth',['collar','ncol'],['x.ribbon']],
 ['u_belt','Belts, sashes & corsets','cloth',['belt'],['x.sash','x.belt','x.corset','g.gsash','orn.waistdrape','orn.dblwaist']],
 ['u_legs','Legwear','cloth',['legs'],[]],
 ['u_shoes','Shoes','cloth',['shoes'],['a.sdeco']],
 ['u_bod','Bodice details','detail',['bod'],['x.drape']],
 ['u_shd','Shoulders, arms & hands','detail',['shd'],['a.armband','a.gloves']],
 ['u_bk','Back details','detail',['bk'],[]],
 ['u_trim','Trims','detail',['trim'],['g.lacetrim']],
 ['u_emb','Embroidery','detail',['emb'],[]],
 ['u_head','Head & hair','acc',['hd'],['a.hbow','a.headband','a.clip','a.crown','a.hat','a.hribbon','a.fhair','a.mortar']],
 ['u_jewel','Jewellery & ornaments','acc',['orn'],['a.necklace','a.choker','a.earrings','a.legacc','g.pearls']],
 ['u_flower','Flowers & corsages','acc',[],['g.flowers','g.corsage','g.bouquet']],
 ['u_fan','Wings & stage effects','acc',['fan'],[]],
 ['u_fes','Festival & seasonal','fes',['fes'],[]],
 ['u_trad','Traditional ornaments','trad',['trad'],[]]];
function cztList(){const ov={};CZT.forEach(u=>u[4].forEach(ck=>ov[ck]=u[0]));const M=new Map(CZT.map(u=>[u[0],{k:u[0],n:u[1],sec:u[2],items:[]}]));
 CZ_CATS.forEach(c=>(c.items||[]).forEach(([key,n])=>{let uk=ov[c.k+'.'+key];if(!uk){const u=CZT.find(u=>u[3].includes(c.k));uk=u?u[0]:'u_fes'}M.get(uk).items.push([c.k,key,n])}));
 return[...M.values()].filter(u=>u.items.length)}
const cztCat=k=>CZ_CATS.find(c=>c.k==k);
function cztOn(E,cat,key){const c=cztCat(cat);if(!c)return false;return c.multi?!!czGetSlot(E.p,cat+'.'+key):((E.p[cat]||{t:'none'}).t||'none')==key&&key!='none'}
function cztSel(E,cat,key){const c=cztCat(cat);if(!c)return false;return c.multi?E.sel==cat+'.'+key:(E.sel==cat&&((E.p[cat]||{}).t||'none')==key)}
function cztCur(E,L){if(ui.czUC&&L.some(u=>u.k==ui.czUC))return ui.czUC;const key=E.sel&&E.sel.includes('.')?E.sel.split('.')[1]:((E.p[E.cat]||{}).t);const u=L.find(u=>u.items.some(([c,k])=>c==E.cat&&k==key))||L.find(u=>u.items.some(([c])=>c==E.cat))||L[0];return u&&u.k}
// open a display category: select its first piece in use, or its first piece
function cztOpen(uk){const E=ui.czE;if(!E)return;ui.czUC=uk;const u=cztList().find(x=>x.k==uk);if(!u)return render();const hit=u.items.find(([c,k])=>cztOn(E,c,k))||u.items[0],[c,k]=hit,C=cztCat(c);E.cat=c;E.sel=C&&C.multi?c+'.'+k:c;render()}
function cztItem(cat,key){const E=ui.czE;if(!E)return;E.cat=cat;czItem(cat,key)}
function cztNavHtml(E){const L=cztList(),cur=cztCur(E,L);return CZT_SEC.map(([sk,sn])=>{const U=L.filter(u=>u.sec==sk);if(!U.length)return'';const cnt=u=>u.items.filter(([c,k])=>cztOn(E,c,k)).length,tot=U.reduce((a,u)=>a+cnt(u),0);
  return`<div class="czsh">${sn}${tot?` <i>${tot}</i>`:''}</div><div class="czsr">${U.map(u=>{const n=cnt(u);return`<button role="tab" class="${u.k==cur?'on':''}" onclick="cztOpen('${u.k}')"><b>${u.n}</b>${n?`<i>${n}</i>`:''}</button>`}).join('')}</div>`}).join('')}
function cztItemsHtml(E){const L=cztList(),cur=cztCur(E,L),u=L.find(x=>x.k==cur);if(!u)return'';const F=ui.czxF=ui.czxF||{q:''},q=(F.q||'').toLowerCase(),I=u.items.filter(([c,k,n])=>!q||n.toLowerCase().includes(q));
 const srch=u.items.length>14?`<div class="czxfil"><input placeholder="Search ${esc(u.n.toLowerCase())}" value="${esc(F.q||'')}" onchange="ui.czxF.q=this.value;render()"></div>`:'';
 return srch+`<div class="czitems">${I.map(([c,k,n])=>{const C=cztCat(c),on=cztOn(E,c,k),sel=cztSel(E,c,k)&&(on||!C.multi);return`<button class="czitem ${on?'on':''} ${sel?'sel':''}" onclick="cztItem('${c}','${k}')" title="${C.multi?(on?'Click to edit':'Click to add'):esc(n)}">${czThumb(c,k)}<small>${esc(n)}${C.multi&&on?' ✓':''}</small></button>`}).join('')||'<p class="st">No piece matches.</p>'}</div>`}
{const f=czGridHtml;czGridHtml=function(E){let h=f.apply(this,arguments);try{
  // navigation
  const a=h.indexOf('<div class="czcats czsec" role="tablist">');if(a>=0){const b=h.indexOf('</div></div>',a);/* sections end with </div> of a czsr; find the closing tag of the nav */let depth=0,i=a,end=-1;const re=/<div\b|<\/div>/g;re.lastIndex=a;let m;while((m=re.exec(h))){depth+=m[0]=='</div>'?-1:1;if(depth==0){end=m.index+6;break}}if(end>0)h=h.slice(0,a)+`<div class="czcats czsec" role="tablist">${cztNavHtml(E)}</div>`+h.slice(end)}
  // piece grid (and the old per-category search box)
  h=h.replace(/<div class="czxfil">[\s\S]*?<\/div>/,'');
  const s=h.indexOf('<div class="czitems">');if(s>=0){const e=h.indexOf('</div>',s);h=h.slice(0,s)+cztItemsHtml(E)+h.slice(e+6)}
 }catch(e){console.error(e)}return h}}
// switching costume / member keeps the current display category only if it still applies
{const f=czCat;czCat=function(k){ui.czUC=null;return f.apply(this,arguments)}}
