// =====================================================================================
//  IDOLVERSE48: Select Bloom! — a member's fans never exceed her group's fans
// -------------------------------------------------------------------------------------
//  Individual fanbases (m.fans) are part of the group's fanbase (they overlap between members),
//  so no member can have more fans than her group. Many systems add member fans (Theater, MV,
//  concerts, events, elections …); after every day and when a save is loaded, a member above
//  90% of her group's fans is brought back to that limit (her popularity is updated with it, and
//  the fanbase baseline moves with it so nothing is turned into group fans).
// =====================================================================================
const MF_CAP=.9,MF_MIN=300;
function mfGroupFans(){const G={};try{const multi=(S.groups||[]).length>1&&typeof gsFans=='function';(S.groups||[]).forEach(g=>{G[g.id]=multi?gsFans(g.id):(S.fans|0)})}catch(e){}return G}
function mfClamp(){if(!S||!Array.isArray(S.members))return 0;const G=mfGroupFans();let n=0;
 S.members.forEach(m=>{if(!m||!Number.isFinite(+m.fans))return;const gf=G[m.group]!=null?G[m.group]:(S.fans|0),cap=Math.max(MF_MIN,Math.round(gf*MF_CAP));if(m.fans>cap){m.fans=cap;n++;try{if(S.fb&&S.fb.mf&&S.fb.mf[m.id]!=null)S.fb.mf[m.id]=m.fans}catch(e){}try{m.pop=popOf(m)}catch(e){}}});return n}
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{if(!(typeof GS_SCOPED!='undefined'&&GS_SCOPED))mfClamp()}catch(e){console.error(e)}return r}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{mfClamp()}catch(e){console.error(e)}return r}}
