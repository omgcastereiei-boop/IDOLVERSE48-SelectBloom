// =====================================================================================
//  IDOLVERSE48: Select Bloom! — the News / Media & PR system is removed (news feed, archive, outlets, reputation,
//  scandals and crisis cases). No news is generated or stored and the Media menu is gone; old saves drop S.news.
//  Systems that used to announce something through a news article (awards, Red & White, Janken, drama, pairing,
//  industry) still call nwPublish: the article is no longer created, but the direct gameplay effect that came with
//  it (popularity, fan engagement, new fans) is still applied exactly once, so those events keep their results.
// =====================================================================================
const NW_POS={},NW_AWARD=[];
function nwHash(s){s=String(s||'');let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h}
function nwAlt(en,th){return{en,th}}
function nwMemImg(mid){return{k:'mem',mid}}
function nwPublish(o){try{const F=o&&o.fx;if(!F||!S)return null;
  (F.pop||[]).forEach(([mid,d])=>{const m=get(mid);if(m&&d)gainPop(m,d)});
  if(F.eng&&S.fb&&typeof fbBoost=='function'){const[mid,de]=F.eng;fbBoost(s=>mid==null||s.k==mid||(s.o&&s.o[mid]),de,0)}
  if(F.fans&&typeof fbAcquire=='function'&&S.fb){fbAcquire(F.fans,{via:'group',org:'Media coverage'});if(typeof fbApply=='function')fbApply()}}catch(e){console.error(e)}return null}
function scS(){return null}function scNew(){return null}function scDaily(){}
const NW_GONE=new Set(['news','crisis','newsarc','newsrep','newsart']);
{const f=render;render=function(){if(NW_GONE.has(view))view='dash';return f.apply(this,arguments)}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{if(S&&S.news)delete S.news}catch(e){}return r}}
