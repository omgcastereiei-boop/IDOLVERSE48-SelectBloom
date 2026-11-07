// =====================================================================================
//  Pop-up windows: Back button
// -------------------------------------------------------------------------------------
//  · When a tap inside a pop-up opens another pop-up (e.g. Promotion results → Performance summary),
//    the previous one is remembered. "← Back" (top of the window and next to Close) returns to it at
//    the same scroll position. Close still closes everything.
//  · Refreshing the same window (same title) and confirmation dialogs are not stacked.
// =====================================================================================
const MB={last:null,stack:[],from:null,y:0,back:0};
const mbDlg=()=>document.querySelector('.mod [role=dialog]');
const mbKey=M=>{try{if(!M)return'';if(M.t=='html'){const m=/<h2[^>]*>([\s\S]*?)<\/h2>/.exec(M.h||'');return'html:'+(m?m[1].replace(/<[^>]+>/g,'').trim():String(M.h||'').slice(0,60))}return M.t+':'+(M.id??M.k??M.rid??'')}catch(e){return''}};
document.addEventListener('click',e=>{try{const d=e.target&&e.target.closest&&e.target.closest('.mod [role=dialog]');if(d&&!e.target.closest('.mbback')){MB.from=ui.mod;MB.y=d.scrollTop||0}else MB.from=null}catch(err){}},true);
function mbBack(){const p=MB.stack.pop();if(!p){ui.mod=null;return render()}ui.mod=p.m;MB.back=1;try{render()}finally{MB.back=0}const d=mbDlg();if(d)d.scrollTop=p.y||0}
{const f=render;render=function(){const cur=S&&!ui.t?ui.mod:null;
 if(!cur)MB.stack=[];else if(!MB.back&&MB.last&&cur!==MB.last&&MB.from===MB.last&&cur.t!='cf'&&MB.last.t!='cf'&&mbKey(cur)!=mbKey(MB.last)){MB.stack.push({m:MB.last,y:MB.y});if(MB.stack.length>10)MB.stack.shift()}
 MB.from=null;MB.last=cur;const r=f.apply(this,arguments);
 try{if(cur&&MB.stack.length){const d=mbDlg();if(d&&!d.querySelector('.mbback')){const top=document.createElement('button');top.className='b s mbback mbtop';top.type='button';top.textContent='← Back';top.onclick=mbBack;d.insertBefore(top,d.firstChild);
   const close=[...d.querySelectorAll(':scope > .row:last-child > button')].pop();if(close){const b2=top.cloneNode(true);b2.classList.remove('mbtop');b2.onclick=mbBack;close.parentNode.insertBefore(b2,close)}}}}catch(e){console.error(e)}return r}}
