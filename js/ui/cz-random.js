// random costumes keep using the original pieces only (see czxHideNew in costume-designer2.js)
{const f=czRandom;czRandom=function(){const a=arguments;return czxHideNew(()=>f.apply(this,a))}}
