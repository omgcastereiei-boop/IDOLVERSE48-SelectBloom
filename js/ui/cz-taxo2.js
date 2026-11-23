// =====================================================================================
//  Costume Studio — display groups for the new idol pieces (hats, hair ribbons, neck & chest),
//  and a hint when a hair ribbon does not fit the model's hairstyle
// =====================================================================================
(function(){const at=k=>CZT.findIndex(u=>u[0]==k);
 if(at('u_hat')<0)CZT.splice(at('u_head')+1,0,['u_hat','Hats','acc',['hat'],['a.hat','a.mortar']]);
 if(at('u_hrb')<0)CZT.splice(at('u_hat')+1,0,['u_hrb','Hair ribbons (twin tails & ponytails)','acc',['hrb'],[]]);
 if(at('u_nck')<0)CZT.splice(at('u_collar')+1,0,['u_nck','Neck & chest details','cloth',['nck'],[]])})();
function czHrbHint(E,model){try{const H=E&&E.p&&E.p.hrb;if(!H||!model)return'';const keys=Object.keys(H).filter(k=>H[k]&&HRB[k]);if(!keys.length)return'';const a=ap(model),kind=h4HairKind(a,dz(model));
 const tw=keys.some(k=>HRB[k].kind=='twin'),po=keys.some(k=>HRB[k].kind=='pony'),bad=(tw&&kind!='twin')||(po&&kind!='pony'&&kind!='bun');if(!bad)return'';
 const th=typeof UIP!='undefined'&&UIP.lang=='th',which=tw&&kind!='twin';
 if(th){const nm=kind=='twin'?'ทวินเทล':kind=='pony'?'ผมหางม้า':kind=='bun'?'ผมมวย':'ผมที่ไม่ได้มัด';return`<p class="st czhint" data-notr>🎀 ริบบิ้นทวินเทลจะแสดงบนทรงผมทวินเทล ส่วนริบบิ้นหางม้าแสดงบนผมหางม้าและผมมวย นางแบบคนนี้ทำ${nm} จึงไม่เห็น${which?'ริบบิ้นทวินเทล':'ริบบิ้นหางม้า'}บนตัวเธอ</p>`}
 const nm=kind=='twin'?'twin tails':kind=='pony'?'a ponytail':kind=='bun'?'a bun':'no tied hair';
 return`<p class="st czhint">🎀 Twin-tail ribbons appear on twin-tail hairstyles, ponytail ribbons on ponytails and buns. This model has ${nm}, so ${which?'the twin-tail ribbons':'the ponytail ribbons'} are not shown on her.</p>`}catch(e){return''}}
{const f=czGridHtml;czGridHtml=function(E,o,d,model){const h=f.apply(this,arguments);const n=czHrbHint(E,model);return n?n+h:h}}
// picture crops for the new categories; hair-ribbon pictures use a model with the matching hairstyle
Object.assign(CZ_CROP,{nck:'30 38 40 34',hat:'6 -34 88 84',hrb:'4 -18 92 74'});
CZX_CAT.find(c=>c.k=='hat').items.forEach(([k])=>{if(CZX[k])CZX[k].crop='4 -40 92 88'});
{const f=czThumb;czThumb=function(cat,t){const D=CZX[t];if(cat!='hrb'||!D||!D.hair)return f.apply(this,arguments);try{const E=ui.czE,m=czPrevMember(),a=ap(m),tw=D.hair=='twin',p=czClone(E.p);p.hrb={[t]:p.hrb&&p.hrb[t]?p.hrb[t]:czPiece(t,...(D.col||['#f27aa6','#ffffff','#f3c35c']))};
 const mm={...m,ap:{...a,bk:tw?73:5,bkx:null}};return`<svg viewBox="${tw?'4 -14 92 70':'24 -18 72 66'}" xmlns="http://www.w3.org/2000/svg">${fig(mm,{pose:0,of:a.of,oh:a.oh,ac:a.ac,ex:2,cd:p})}</svg>`}catch(e){console.error(e);return f.apply(this,arguments)}}}
