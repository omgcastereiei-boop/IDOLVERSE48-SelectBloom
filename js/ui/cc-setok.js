// =====================================================================================
//  IDOLVERSE48: Select Bloom! — a confirmed concert keeps its setlist editable
// -------------------------------------------------------------------------------------
//  Setlist actions (songs, formation, costumes, MC, units, VTR, encore) stay editable after a concert is confirmed.
//  Some of them were wrapped again after they had been made editable, and the newer wrapper checked "editable" outside
//  that permission (e.g. Reset to original of a Theater song fell back to the empty single formation). Loaded after
//  every concert file, this puts the permission around the final version of each setlist action.
// =====================================================================================
['ccAddAt','ccAddMC','ccAddSong','ccCzCopyAll','ccCzHtml','ccCzMemAll','ccCzMemNo','ccCzMemSet','ccCzNew','ccCzOpen','ccCzPickHtml','ccCzRandom','ccCzSet','ccCzEdit','ccCzMem',
 'ccDrCopyOpen','ccDrCopyGo','ccDrCopyRest','ccDrLib','ccDrLibHtml','ccDrLibOpen','ccDrLibPick','ccDrMem','ccDrOpen','ccDrRandAll','ccDrRandom','ccDrRevert','ccDrSave','ccDzHtml','ccDzOpen','ccDzPick',
 'ccEncTog','ccFmDefault','ccFmNcSet','ccFmSize','ccFmBySort','ccFormAddShown','ccFormCopy','ccFormClear','ccFormMove','ccFormPage','ccFormPick','ccItemDel','ccItemMove','ccLibOpen','ccLibUse',
 'ccMcAfter','ccMcOpen','ccMcPickHtml','ccMcRow','ccMcSet','ccOvName','ccOvTog','ccPickAdd','ccPickAddSt','ccPickHtml','ccPickOpen','ccPosAdd','ccPosAll','ccPosCen','ccPosDel','ccPosFill','ccPosReset',
 'ccPosRow','ccPosSet','ccRowArrange','ccRowClear','ccSetDel','ccSetHtml','ccSetName','ccSetNew','ccSongRow','ccUnitTog','ccVtrAdd','ccVtrRow','ccVtrSet'].forEach(n=>{const f=window[n];if(typeof f!='function')return;
 window[n]=function(){const p=CC_SETOK;CC_SETOK=1;try{return f.apply(this,arguments)}finally{CC_SETOK=p}}});
{const f=V.cccz;if(f)V.cccz=function(){const p=CC_SETOK;CC_SETOK=1;try{return f.apply(this,arguments)}finally{CC_SETOK=p}}}
