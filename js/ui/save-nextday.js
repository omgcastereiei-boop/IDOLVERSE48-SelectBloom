// =====================================================================================
//  Autosave when the player presses Next day / +7 (adv), and every 10 minutes. Screen updates and other actions no longer write the
//  save (a large save blocked the screen for a moment after every tap on phones), and leaving or hiding the page does
//  not write it either. Save Game, save slots, export and import still save immediately.
// =====================================================================================
let SV_ADV=0;
{const f=svAuto;svAuto=function(){if(!SV_ADV)return;return f.apply(this,arguments)}}
{const f=adv;adv=function(){SV_ADV++;try{return f.apply(this,arguments)}finally{SV_ADV--}}}
// …and every 5 minutes of play (in case the player stays on one day for a long time)
const SV_EVERY=5*60*1000;
setInterval(()=>{try{if(!S||!S.members||!S.members.length)return;SV_ADV++;try{svAuto()}finally{SV_ADV--}}catch(e){console.error(e)}},SV_EVERY);
