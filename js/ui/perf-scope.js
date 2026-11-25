// =====================================================================================
//  Speed: the Stage lineup and team pools cannot change while a lineup check, the daily song-practice plan or a
//  screen update is running, so thPool / thBase reuse the per-performance cache (perf3.js, TH_PC) inside these
//  calls too. Results are copies; nothing in the game rules changes, only how often the same list is rebuilt.
// =====================================================================================
const thScoped=f=>function(){const outer=TH_PC;if(!outer)TH_PC=new Map();try{return f.apply(this,arguments)}finally{if(!outer)TH_PC=null}};
thCheck=thScoped(thCheck);
if(typeof spNeeds=='function')spNeeds=thScoped(spNeeds);
if(typeof spDay=='function')spDay=thScoped(spDay);
render=thScoped(render);
