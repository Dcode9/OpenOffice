import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']})
const p=await b.newPage(); await p.setViewport({width:1536,height:900})
await p.goto('http://localhost:5173',{waitUntil:'domcontentloaded'}); await p.waitForSelector('.ribbon-content'); await new Promise(r=>setTimeout(r,500))
await p.screenshot({path:'verify/app/dark-top.png',clip:{x:0,y:0,width:1536,height:260}})
await p.screenshot({path:'verify/app/dark-full.png'})
console.log(await p.evaluate(()=>({home:{w:document.querySelector('.ribbon-content').clientWidth,scroll:document.querySelector('.ribbon-content').scrollWidth},pageY:document.querySelector('.page-wrap').getBoundingClientRect().y})))
await b.close()
