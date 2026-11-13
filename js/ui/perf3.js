// =====================================================================================
//  Theater performance speed: during one performance the Stage lineup and the team pool cannot change,
//  so thBase / thPool are computed once per performance instead of hundreds of times (they were
//  recomputed for every song, formation, substitute check and statistic). Results are copies, so no
//  caller can change the cached list.
// =====================================================================================
let TH_PC=null;
{const f=thPerform;thPerform=function(){const outer=TH_PC;if(!outer)TH_PC=new Map();try{return f.apply(this,arguments)}finally{if(!outer)TH_PC=null}}}
{const f=thPool;thPool=function(key){if(!TH_PC)return f.apply(this,arguments);const k='p|'+key;let v=TH_PC.get(k);if(!v){v=f.apply(this,arguments);TH_PC.set(k,v)}return v.slice()}}
{const f=thBase;thBase=function(s){if(!TH_PC||!s)return f.apply(this,arguments);const x=(typeof ORG_X!='undefined'&&ORG_X)||null,y=(typeof TH5_X!='undefined'&&TH5_X)||null,k='b|'+s.id+'|'+(x?x.id:'')+'|'+(y?y.id:'')+'|'+(s.lineup?s.lineup.length:'');let v=TH_PC.get(k);if(!v){v=f.apply(this,arguments);TH_PC.set(k,v)}return v.slice()}}
// fan cohort clean-up: the full pass (dropping graduated members from every cohort) only when the active roster
// changed; otherwise only empty cohorts are removed and counts are kept whole
let FB_CL={sig:null,s:null};
{const f=fbClean;fbClean=function(){const fb=S.fb,act=fbActive(),sig=act.length+':'+act.reduce((a,m)=>(a*31+m.id)%1e9,7);if(FB_CL.s!==S||FB_CL.sig!==sig||fb.segs.length>4000){FB_CL={sig,s:S};return f.apply(this,arguments)}
 let drop=false;for(const s of fb.segs){if(s.n!==Math.round(s.n))s.n=Math.max(0,Math.round(s.n));if(s.n<=0)drop=true}if(drop)fb.segs=fb.segs.filter(s=>s.n>0)}}
