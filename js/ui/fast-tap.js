// =====================================================================================
//  IDOLVERSE48: Select Bloom! — fast taps on the Senbatsu screen
// -------------------------------------------------------------------------------------
//  Tapping members to fill positions used to redraw the whole page after every tap (dozens of member
//  cards with portraits), so quick taps felt stuck. Now each tap is applied at once (data + a highlight
//  on the tapped card) and the page is redrawn once per frame, however fast you tap.
//  Cards below the visible part of the list are not laid out until they are scrolled into view.
// =====================================================================================
let FT_DEFER=0,FT_PEND=0;
{const f=render;render=function(){if(FT_DEFER){if(!FT_PEND){FT_PEND=1;requestAnimationFrame(()=>{FT_PEND=0;try{f()}catch(e){console.error(e)}})}return}return f.apply(this,arguments)}}
function ftFast(name){const f=window[name];if(typeof f!='function')return;window[name]=function(){try{const e=window.event,el=e&&e.currentTarget&&e.currentTarget.classList?e.currentTarget:null;if(el)el.classList.add('fttap')}catch(e){}
 FT_DEFER++;try{return f.apply(this,arguments)}finally{FT_DEFER--}}}
['fmAssign','slotClick','fmRemove','fmClear'].forEach(ftFast);
