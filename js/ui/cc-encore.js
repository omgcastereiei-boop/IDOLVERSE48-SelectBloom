// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Concert big screen: the Encore is announced
// -------------------------------------------------------------------------------------
//  · Before the first Encore song an "ENCORE" step is shown; Encore songs are numbered EN1, EN2 …
//    (main songs keep M01, M02 …).
// =====================================================================================
{const f=ccShSteps;ccShSteps=function(){const St=f.apply(this,arguments),out=[];let cur=null,k=0,e=0,seen=false;
 St.forEach(z=>{const key=z.C&&z.p?z.C.id+'|'+z.p.id:null;if(key!==cur){cur=key;k=0;e=0;seen=false}
  if(z.it&&z.it.enc&&!seen&&z.k!='open'){seen=true;out.push({k:'corner',qi:z.qi,C:z.C,p:z.p,it:{k:'encore',name:'🎉 ENCORE',about:'The audience calls the members back to the stage!'}})}
  if(z.k=='song'){z.lb=z.it.enc?'EN'+(++e):'M'+String(++k).padStart(2,'0')}out.push(z)});return out}}
{const f=ccShHtml;ccShHtml=function(){let h=f.apply(this,arguments);try{const s=ui.ccsh,St=ccShSteps(s.q),z=St[Math.min(s.i,St.length-1)];if(z&&z.k=='song'&&z.lb)h=h.replace(`<div class="gekicker">M${z.no}</div>`,`<div class="gekicker">${z.lb}${z.it.enc?' · ENCORE':''}</div>`)}catch(e){console.error(e)}return h}}
