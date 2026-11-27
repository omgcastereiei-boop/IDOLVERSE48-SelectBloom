// =====================================================================================
//  Older browsers (iPhone Safari before iOS 15.4 and similar): the few newer built-ins the game uses.
// =====================================================================================
(function(){const def=(o,k,v)=>{if(!o[k])try{Object.defineProperty(o,k,{value:v,writable:true,configurable:true})}catch(e){o[k]=v}};
 const at=function(i){i=Math.trunc(i)||0;if(i<0)i+=this.length;return i<0||i>=this.length?undefined:this[i]};
 def(Array.prototype,'at',at);def(String.prototype,'at',at);
 def(Array.prototype,'findLast',function(f,t){for(let i=this.length-1;i>=0;i--)if(f.call(t,this[i],i,this))return this[i];return undefined});
 def(Array.prototype,'findLastIndex',function(f,t){for(let i=this.length-1;i>=0;i--)if(f.call(t,this[i],i,this))return i;return -1});
 def(Object,'hasOwn',(o,k)=>Object.prototype.hasOwnProperty.call(o,k));
 if(typeof structuredClone!='function')window.structuredClone=v=>JSON.parse(JSON.stringify(v));
 if(typeof window.requestIdleCallback!='function')window.requestIdleCallback=(f)=>setTimeout(()=>f({didTimeout:true,timeRemaining:()=>0}),1);
})();
