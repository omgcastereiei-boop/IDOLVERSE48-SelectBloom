// =====================================================================================
//  Next day must always work: if one daily system fails on a save, the day still advances, the screen is drawn again
//  and the error is shown (so it can be reported), instead of the button silently doing nothing.
// =====================================================================================
let ADVG_ERR=[];
{const f=tick;tick=function(){try{return f.apply(this,arguments)}catch(e){console.error('daily update',e);ADVG_ERR.push((e&&e.message||String(e))+(e&&e.stack?' @ '+String(e.stack).split('\n').slice(0,2).join(' | ').slice(0,220):''));if(ADVG_ERR.length>5)ADVG_ERR.shift()}}}
{const f=adv;adv=function(){let r;try{r=f.apply(this,arguments)}catch(e){console.error('next day',e);ADVG_ERR.push('adv: '+(e&&e.message||String(e)))}
 if(ADVG_ERR.length){const L=ADVG_ERR.splice(0);try{ui.mod={t:'html',h:`<h2 class="ht">${(typeof UIP!='undefined'&&UIP.lang=='th')?'วันถัดไปทำงานแล้ว แต่มีบางระบบผิดพลาด':'The day advanced, but a daily system failed'}</h2><p class="st" data-notr>${L.map(x=>esc(x)).join('<br>')}</p><p class="st">${(typeof UIP!='undefined'&&UIP.lang=='th')?'แคปหน้าจอนี้ส่งให้ผู้พัฒนาได้เลย เกมเล่นต่อได้ตามปกติ':'Please send a screenshot of this message. You can keep playing.'}</p>`}}catch(x){}try{render()}catch(x){}}return r}}
