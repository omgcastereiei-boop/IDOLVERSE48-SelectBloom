// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Theater: automatic substitutes
// -------------------------------------------------------------------------------------
//  When members cannot perform, the most important open position is filled first (positions are
//  ranked by where she stands in the songs: Center / front positions first). Candidates: the team's
//  Under members (bench) first, then Trainees. Within each, the latest General Election rank comes
//  first (if there was an election), then Performance, then Energy. E.g. positions 3, 7 and 13 are
//  open → the best candidate takes 3, the next one 7, then 13.
// =====================================================================================
function thPosRank(s,id){let best=1e9;try{thAll(s).forEach(it=>{const L=thMem(s,it),i=L.indexOf(id);if(i>=0){const c=(it.center!=null&&it.center==id)?-1:i;if(c<best)best=c}})}catch(e){}return best}
function thEleRank(gid){const M={};let ed=-1;S.members.forEach(m=>{if(gid!=null&&m.group!=gid)return;(m.geRec||[]).forEach(h=>{if(h.rank&&(h.ed||0)>ed)ed=h.ed||0})});if(ed<0)return null;S.members.forEach(m=>{const h=(m.geRec||[]).find(z=>(z.ed||0)==ed&&z.rank);if(h)M[m.id]=h.rank});return M}
thAutoPick=function(x,s,missing,taken){const bench=new Set(thBench(s).map(m=>m.id)),K=thK(x.k),ER=thEleRank(K&&K.gid);
 const key=m=>[bench.has(m.id)?0:1,ER?(ER[m.id]||1e6):0,-(m.cha|0),-(+m.en||0),m.id];
 const C=thTrainees(x,s).filter(m=>!taken.has(m.id)).sort((a,b)=>{const A=key(a),B=key(b);for(let i=0;i<A.length;i++)if(A[i]!=B[i])return A[i]-B[i];return 0});
 const R={};missing.slice().sort((a,b)=>thPosRank(s,a)-thPosRank(s,b)).forEach(id=>{const c=C.find(m=>!taken.has(m.id));if(c){R[id]=c.id;taken.add(c.id)}});return R};
