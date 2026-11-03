/* No persistence, network requests, analytics events, or user HTML. */
export function mountBuilder(root, lang) {
  const ru=lang==='ru';
  const t=ru ? {
    labels:['Имя','Возраст','Страна происхождения','Город проживания','Профессия или статус','Увлечение','Грамматический род'],
    empty:'Не выбрано', genders:['Мужской','Женский'], countries:['Украина','Польша','Беларусь','Германия','Чехия','Грузия'],
    jobs:['Программист / программистка','Преподаватель / преподавательница','Студент / студентка','Удалённая работа','Поиск работы'],
    hobbies:['Путешествия','Книги','Музыка','Фотография','Спорт','Кулинария'],
    create:'Создать рассказ', copy:'Скопировать мой рассказ', reset:'Очистить форму', copied:'Текст скопирован',
    fallback:'Не удалось скопировать автоматически. Выделите текст и скопируйте его вручную.', result:'Мой рассказ', generated:'Рассказ создан.', required:'Заполните хотя бы одно поле.',
    hint:'Все поля необязательные. Имя: до 60 символов. Возраст: от 1 до 120. Данные остаются в браузере.'
  } : {
    labels:["Ім’я",'Вік','Країна походження','Місто проживання','Професія або статус','Захоплення','Граматичний рід'],
    empty:'Не вибрано', genders:['Чоловічий','Жіночий'], countries:['Україна','Польща','Білорусь','Німеччина','Чехія','Грузія'],
    jobs:['Програміст / програмістка','Викладач / викладачка','Студент / студентка','Дистанційна робота','Пошук роботи'],
    hobbies:['Подорожі','Книжки','Музика','Фотографія','Спорт','Кулінарія'],
    create:'Створити розповідь', copy:'Скопіювати мою розповідь', reset:'Очистити форму', copied:'Текст скопійовано',
    fallback:'Не вдалося скопіювати автоматично. Виділіть текст і скопіюйте його вручну.', result:'Моя розповідь', generated:'Розповідь створено.', required:'Заповніть хоча б одне поле.',
    hint:'Усі поля необов’язкові. Ім’я: до 60 символів. Вік: від 1 до 120. Дані залишаються в браузері.'
  };
  const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
  root.replaceChildren(); const form=el('form'); form.autocomplete='off';
  const hint=el('p',t.hint);hint.id='intro-hint';form.setAttribute('aria-describedby',hint.id);form.append(hint);
  const grid=el('div');grid.className='learning-fields';const fields={};
  ['name','age','country','city','job','hobby','gender'].forEach((key,i)=>{
    const wrap=el('div'), label=el('label',t.labels[i]);label.htmlFor='intro-'+key;
    let input;
    if(i<2){input=el('input');input.type=i?'number':'text';if(i){input.min='1';input.max='120';input.step='1';}else input.maxLength=60;}
    else {
      input=el('select');
      const options=[t.countries,['Wrocław','Warszawa','Kraków','Poznań','Gdańsk','Łódź'],t.jobs,t.hobbies,t.genders][i-2];
      if(key!=='gender'){const empty=el('option',t.empty);empty.value='';input.append(empty);}
      options.forEach((text,index)=>{const o=el('option',text);o.value=String(index);input.append(o);});
    }
    input.id=label.htmlFor; fields[key]=input;wrap.append(label,input);grid.append(wrap);
  });
  form.append(grid);
  function btn(text,type){const b=el('button',text);b.type=type;b.className='btn btn--primary';return b;}
  const generate=btn(t.create,'submit'),reset=btn(t.reset,'reset');form.append(generate,reset);
  const outputLabel=el('label',t.result);outputLabel.htmlFor='intro-result';
  const output=el('textarea');output.id=outputLabel.htmlFor;output.readOnly=true;output.lang='pl';output.rows=5;
  const copy=btn(t.copy,'button');copy.disabled=true;
  const status=el('p');status.setAttribute('aria-live','polite');
  root.append(form,outputLabel,output,copy,status);
  // Never allow an old story to be copied after changing the input fields.
  form.addEventListener('input',()=>{output.value='';copy.disabled=true;status.textContent='';});
  form.addEventListener('submit',e=>{
    e.preventDefault(); const v=Object.fromEntries(Object.entries(fields).map(([k,n])=>[k,n.value.trim()]));
    const parts=[];
    if(v.name)parts.push(`Mam na imię ${v.name}.`);
    if(v.age){const n=Number(v.age);const ending=n===1?'rok':n%10>=2&&n%10<=4&&!(n%100>=12&&n%100<=14)?'lata':'lat';parts.push(`Mam ${n} ${ending}.`);}
    if(v.country!=='')parts.push('Jestem z '+['Ukrainy','Polski','Białorusi','Niemiec','Czech','Gruzji'][v.country]+'.');
    if(v.city!=='')parts.push('Mieszkam '+['we Wrocławiu','w Warszawie','w Krakowie','w Poznaniu','w Gdańsku','w Łodzi'][v.city]+'.');
    if(v.job!=='')parts.push([
      `Jestem ${v.gender==='1'?'programistką':'programistą'}.`,
      `Jestem ${v.gender==='1'?'nauczycielką':'nauczycielem'}.`,
      `Jestem ${v.gender==='1'?'studentką':'studentem'}.`,'Pracuję zdalnie.','Szukam pracy.'
    ][v.job]);
    if(v.hobby!=='')parts.push(['Lubię podróżować.','Lubię czytać książki.','Interesuję się muzyką.','Interesuję się fotografią.','Lubię uprawiać sport.','Lubię gotować.'][v.hobby]);
    output.value=parts.length?'Cześć! '+parts.join(' '):'';copy.disabled=!parts.length;status.textContent=parts.length?t.generated:t.required;
  });
  form.addEventListener('reset',()=>{output.value='';copy.disabled=true;status.textContent='';});
  copy.addEventListener('click',async()=>{
    try {await navigator.clipboard.writeText(output.value);status.textContent=t.copied;}
    catch(_){output.focus();output.select();status.textContent=t.fallback;}
  });
}
