/* Run against a local server: INTRO_BASE=http://127.0.0.1:8788 node scripts/check-introduction.cjs */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
fs.mkdirSync('/tmp/expres-intro',{recursive:true});
const base=process.env.INTRO_BASE||'http://127.0.0.1:8788';
const routes=['/blog-yak-rozpovisty-pro-sebe-polskoyu.html','/ru/blog-kak-rasskazat-o-sebe-na-polskom.html'];
const keys=[['C'],['B'],['A'],['true'],['C'],['A','B','C'],['A'],['false'],['D'],['C']];
(async()=>{
 const browser=await chromium.launch({headless:true, channel:process.env.PLAYWRIGHT_CHANNEL || 'chrome'});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // External integrations remain in markup; keep QA independent of external services.
 await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
 for(const route of routes) for(const width of [320,375,430,768,1440]){
  await page.setViewportSize({width,height:900});await page.goto(base+route);await page.locator('[data-quiz] input').first().waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,route+' overflow '+width);
  assert.equal(await page.locator('.blog-prose > h2').count(),15);
 }
 const q=page.locator('[data-quiz]');
 for(const route of routes){
  await page.goto(base+route);await page.evaluate(()=>sessionStorage.clear());await page.reload();
  // Keyboard submission, validation, no answer disclosed before confirmation.
  assert.equal(await q.locator('[aria-live]').innerText(),'');
  await q.locator('button').press('Enter');assert.match(await q.locator('[aria-live]').innerText(),/Виберіть|Выберите/);
  for(let i=0;i<10;i++){
   for(const key of keys[i]) await q.locator(`input[value="${key}"]`).check();
   await q.locator('button').press('Enter');assert.match(await q.locator('[aria-live]').innerText(),/Правильно!/);
   assert.equal(await q.locator('input:not(:disabled)').count(),0);
   await q.locator('button').click();
  }
  assert.match(await q.innerText(),/10\/10/);await q.locator('button').first().click();assert.match(await q.innerText(),/Помилок немає|Ошибок нет/);
  await q.locator('button').last().click();assert.match(await q.innerText(),/1\/10/);
 }
 // Persist unconfirmed and confirmed choices across reload and language navigation.
 await q.locator('input[value="C"]').check();await page.reload();assert.equal(await q.locator('input[value="C"]').isChecked(),true);
 await q.locator('button').click();await page.locator('.header__nav .language-switcher a[lang="uk"]').click();
 assert.match(await q.locator('[aria-live]').innerText(),/Правильно!/);await q.locator('button').click();assert.match(await q.innerText(),/2\/10/);
 async function seededRun(answers){
  await page.evaluate(answers=>sessionStorage.setItem('expres-quiz:self-introduction-v1',JSON.stringify({index:10,answers,pending:[]})),answers);
  await page.reload();return q.innerText();
 }
 let answers=Object.fromEntries(keys.map((v,i)=>['q'+(i+1),v]));answers.q6=['A','B'];assert.match(await seededRun(answers),/9\/10/);
 answers.q6=['A','B','C','D'];assert.match(await seededRun(answers),/9\/10/);
 for(let i=0;i<10;i++)answers['q'+(i+1)]=[i===3?'false':i===7?'true':keys[i][0]==='A'?'B':'A'];
 assert.match(await seededRun(answers),/0\/10/);await q.locator('button').first().click();assert.equal(await q.locator('h4').count(),10);
 for(let i=0;i<6;i++)answers['q'+(i+1)]=keys[i];assert.match(await seededRun(answers),/6\/10/);
 // Builder example, all ages, all fixed declensions, copy and reset.
 for(const route of routes){
  await page.goto(base+route);const b=page.locator('[data-builder]');
  await page.locator('#intro-name').fill('Anna');await page.locator('#intro-age').fill('25');
  for(const [id,value] of Object.entries({country:'0',city:'0',job:'0',hobby:'0',gender:'1'}))await page.locator('#intro-'+id).selectOption(value);
  await b.locator('button[type=submit]').click();
  const expected='Cześć! Mam na imię Anna. Mam 25 lat. Jestem z Ukrainy. Mieszkam we Wrocławiu. Jestem programistką. Lubię podróżować.';
  assert.equal(await page.locator('#intro-result').inputValue(),expected);
  await b.locator('button[type=button]').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),expected);
  await b.locator('button[type=reset]').click();assert.equal(await page.locator('#intro-result').inputValue(),'');
  for(let n=1;n<=120;n++){
   await page.locator('#intro-age').fill(String(n));await b.locator('button[type=submit]').click();
   const lata=[2,3,4,22,23,24,32,33,34,42,43,44,52,53,54,62,63,64,72,73,74,82,83,84,92,93,94,102,103,104];
   assert.equal(await page.locator('#intro-result').inputValue(),`Cześć! Mam ${n} ${n===1?'rok':lata.includes(n)?'lata':'lat'}.`);
  }
  for(const value of ['0','121','1.5']){await page.locator('#intro-age').fill(value);assert.equal(await page.locator('#intro-age').evaluate(n=>n.checkValidity()),false);}
  await b.locator('button[type=reset]').click();
  for(const [id,expected] of Object.entries({country:['z Ukrainy','z Polski','z Białorusi','z Niemiec','z Czech','z Gruzji'],city:['we Wrocławiu','w Warszawie','w Krakowie','w Poznaniu','w Gdańsku','w Łodzi'],hobby:['Lubię podróżować','Lubię czytać książki','Interesuję się muzyką','Interesuję się fotografią','Lubię uprawiać sport','Lubię gotować']})){
   for(let i=0;i<expected.length;i++){await page.locator('#intro-'+id).selectOption(String(i));await b.locator('button[type=submit]').click();assert.ok((await page.locator('#intro-result').inputValue()).includes(expected[i]));}
   await b.locator('button[type=reset]').click();
  }
  for(const gender of ['0','1'])for(let i=0;i<5;i++){
   await page.locator('#intro-gender').selectOption(gender);await page.locator('#intro-job').selectOption(String(i));await b.locator('button[type=submit]').click();
   const endings=gender==='0'?['programistą','nauczycielem','studentem','Pracuję zdalnie','Szukam pracy']:['programistką','nauczycielką','studentką','Pracuję zdalnie','Szukam pracy'];
   assert.ok((await page.locator('#intro-result').inputValue()).includes(endings[i]));
  }
  await b.locator('button[type=reset]').click();await page.locator('#intro-name').fill('<img src=x onerror=alert(1)>');await b.locator('button[type=submit]').click();assert.equal(await b.locator('img').count(),0);
  assert.ok((await page.locator('#intro-result').inputValue()).includes('<img'));
 }
 // Storage denied and clipboard denied still give usable quiz/manual-copy fallback.
 await context.addInitScript(()=>{Object.defineProperty(window,'sessionStorage',{get(){throw new Error('denied');}});Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('denied'))}});});
 await page.goto(base+routes[0]);await q.locator('input[value="C"]').check();await q.locator('button').click();assert.match(await q.innerText(),/Правильно!/);
 await page.locator('#intro-name').fill('Anna');await page.locator('[data-builder] button[type=submit]').click();await page.locator('[data-builder] button[type=button]').click();assert.match(await page.locator('[data-builder] [aria-live]').innerText(),/вручну/);
 await page.setViewportSize({width:375,height:900});await page.locator('[data-builder]').screenshot({path:'/tmp/expres-intro/builder.png'});await q.screenshot({path:'/tmp/expres-intro/quiz.png'});
 const nojs=await browser.newContext({javaScriptEnabled:false});const staticPage=await nojs.newPage();await staticPage.goto(base+routes[0]);assert.equal(await staticPage.locator('.blog-prose > h2').count(),15);assert.equal(await staticPage.locator('table').count(),10);await nojs.close();
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: both locales; 10 viewport checks; quiz scoring, all types, review, restart, keyboard, locale persistence; builder ages 1–120, fixed forms, copy, reset, XSS; denied storage/clipboard; no-JS article; no JS errors.');
})().catch(e=>{console.error(e);process.exit(1)});
