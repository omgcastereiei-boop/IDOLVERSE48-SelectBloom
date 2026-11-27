// =====================================================================================
//  Autosave after important actions: every confirmed dialog (ask … OK) and the main save / confirm buttons
//  (costumes, Senbatsu / formation, single production, cover, concerts, MV, events, bookings, contracts, stages …).
//  The write goes through the normal debounced autosave, so several quick actions produce one save.
// =====================================================================================
let SVA_T=null;
function svAct(){if(!S||!S.members||!S.members.length||ui.t)return;clearTimeout(SVA_T);SVA_T=setTimeout(()=>{try{SV_ADV++;try{svAuto()}finally{SV_ADV--}}catch(e){console.error(e)}},400)}
// a confirmed dialog = the player committed to something
{const f=ask;ask=function(t,fn){const a=[...arguments];if(typeof fn=='function'){const g=fn;a[1]=function(){const r=g.apply(this,arguments);try{svAct()}catch(e){}return r}}return f.apply(this,a)}}
['czSave','ccDrSave','gczSave','pczSave','thCzSave','plCzSave','hzSave','xmSave','apSave','applyWard','cpApply','czAssignMain',
 'fmSave','plFmSave','plSaveFm','saveDraft','confirmCov','confirmProd','startSingle','confirmAud','addConfirm',
 'ccConfirm','ccLibSave','mvConfirm','spConfirm','jkConfirm','orgConfirm','rtpConfirm','gsTrConfirm','thTransConfirm','orgAnnSave','orgTrSaveA','orgTrFinal',
 'xeAccept','xeDoAccept','rsBook','geBook','roadBook','rwBook','rsPlanStart','alRelease','release','drStart','srStart','dvdStart','jkStart',
 'thSongEditSave','thNewStage','ctRenew','ctActRenew','ctSoloSign','gsCreate','uCreate','ctGroupNew','plProfSave','plProfSaveAll','plMvDone','plSaleDone','plCzDone','plLimCovDone']
 .forEach(n=>{try{const f=window[n];if(typeof f!='function')return;window[n]=function(){const r=f.apply(this,arguments);try{svAct()}catch(e){}return r}}catch(e){}});
