import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']})
const p=await b.newPage(); await p.setViewport({width:1536,height:900})
await p.goto('http://localhost:5173',{waitUntil:'domcontentloaded'}); await p.waitForSelector('.ribbon-content'); await new Promise(r=>setTimeout(r,500))
await p.evaluate(()=>[...document.querySelectorAll('.ribbon-tab')].find(t=>t.textContent==='Insert')?.click()); await new Promise(r=>setTimeout(r,400))
await p.screenshot({path:'verify/app/dark-insert.png',clip:{x:0,y:0,width:1536,height:260}})
console.log(await p.evaluate(()=>({
  groups:[...document.querySelectorAll('.ribbon-group')].map(g=>({label:g.querySelector('.ribbon-group-label')?.textContent,w:Math.round(g.getBoundingClientRect().width)})),
  content:{w:document.querySelector('.ribbon-content').clientWidth,scroll:document.querySelector('.ribbon-content').scrollWidth}
})))
await b.close()
