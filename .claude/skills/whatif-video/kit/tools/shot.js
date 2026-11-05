const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));
for (const n of process.argv.slice(2)){ await p.goto('file://'+process.cwd()+'/build/handtest/'+n+'.html'); await p.waitForTimeout(400);
 await p.screenshot({path:'build/handtest/'+n+'.png'}); }
await b.close();})();
