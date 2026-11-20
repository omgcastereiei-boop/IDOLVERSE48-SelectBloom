// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Album covers are portrait 3:4 (singles stay 1:1)
// -------------------------------------------------------------------------------------
//  · A cover design with d.ar=='3:4' is drawn on a 512×683 canvas (coverSvg / bgSvg /
//    exportCov read cvHt(d)). Every cover of an album plan gets ar='3:4' the first time it
//    is opened, randomised or saved; its layers are moved down proportionally so the layout
//    fills the taller cover. Albums released before this update keep their square covers.
// =====================================================================================
const cvIsAlbPlan=ed=>{try{return ui.cvCtx!='album'&&S.pj&&plAlb(S.pj)&&S.pj.types.some(t=>t.name==ed||t.name+' Limited'==ed)}catch(e){return false}};
function cvArFix(d){if(!d||d.ar=='3:4')return d;const k=683/512;(d.layers||[]).forEach(l=>{if(typeof l.y=='number')l.y=Math.round(l.y*k)});d.ar='3:4';return d}
function cvArUnfix(d){if(!d||d.ar!='3:4')return d;const k=512/683;(d.layers||[]).forEach(l=>{if(typeof l.y=='number')l.y=Math.round(l.y*k)});delete d.ar;return d}
// opening the cover editor
{const f=initCov;initCov=function(ed){const r=f.apply(this,arguments);try{if(cvIsAlbPlan(ed)){cvArFix(ui.cd);if(S.cov[ed])cvArFix(S.cov[ed])}}catch(e){console.error(e)}return r}}
// random cover
{const f=plCoverRand;plCoverRand=function(ed){const r=f.apply(this,arguments);try{if(cvIsAlbPlan(ed)){if(S.cov[ed])cvArFix(S.cov[ed]);if(ui.cd&&ui.ed==ed)cvArFix(ui.cd)}}catch(e){console.error(e)}return r}}
// random positions / texts use the full height of the cover
{const f=cvRandPos;cvRandPos=function(){const d=ui.cd,before=d&&d.ar=='3:4';if(before)cvArUnfix(d);try{return f.apply(this,arguments)}finally{if(before)cvArFix(d)}}}
{const f=cvTextRand;cvTextRand=function(d){const before=d&&d.ar=='3:4';if(before)cvArUnfix(d);try{return f.apply(this,arguments)}finally{if(before)cvArFix(d)}}}
// switching an album plan back to a single: covers become square again
{const f=plSetKind;plSetKind=function(k){const was=S.pj&&plAlb(S.pj);const r=f.apply(this,arguments);try{if(was&&S.pj&&!plAlb(S.pj))S.pj.types.forEach(t=>{cvArUnfix(S.cov[t.name]);if(ui.cd&&ui.ed==t.name)cvArUnfix(ui.cd)})}catch(e){console.error(e)}return r}}
