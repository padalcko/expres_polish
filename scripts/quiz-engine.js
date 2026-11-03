/* Data-driven, browser-local quiz. Only stable question/answer IDs are stored. */
export function mountQuiz(root, data, lang) {
  const ui = lang === 'ru' ? {
    check:'Проверить ответ', next:'Следующий вопрос', review:'Посмотреть ошибки', restart:'Пройти ещё раз',
    correct:'Правильно!', wrong:'Неправильно.', answer:'Правильный ответ:', selected:'Ваш ответ:',
    choose:'Выберите ответ.', multi:'Выберите все правильные ответы.', score:'Ваш результат', none:'Ошибок нет!', finish:'Посмотреть результат'
  } : {
    check:'Перевірити відповідь', next:'Наступне запитання', review:'Переглянути помилки', restart:'Пройти ще раз',
    correct:'Правильно!', wrong:'Неправильно.', answer:'Правильна відповідь:', selected:'Ваша відповідь:',
    choose:'Виберіть відповідь.', multi:'Виберіть усі правильні відповіді.', score:'Ваш результат', none:'Помилок немає!', finish:'Переглянути результат'
  };
  const key = 'expres-quiz:' + data.id;
  let state = {index:0, answers:{}, pending:[]};
  const validAnswer = (q,a) => Array.isArray(a) && a.length > 0 && new Set(a).size === a.length &&
    (q.type === 'multi_select' || a.length === 1) && a.every(id => q.options.some(o => o.id === id));
  try {
    const saved = JSON.parse(sessionStorage.getItem(key));
    if (saved && Number.isInteger(saved.index) && saved.index >= 0 && saved.index <= data.questions.length &&
      saved.answers && typeof saved.answers === 'object' && !Array.isArray(saved.answers) &&
      data.questions.every((q,i) => i < saved.index ? validAnswer(q,saved.answers[q.id]) :
        i === saved.index ? !saved.answers[q.id] || validAnswer(q,saved.answers[q.id]) : !saved.answers[q.id])) {
      state = saved;
      const q = data.questions[state.index];
      state.pending = q && validAnswer(q,state.pending) ? state.pending : [];
    }
  } catch (_) { /* Storage is optional. */ }
  const save = () => { try { sessionStorage.setItem(key,JSON.stringify(state)); } catch (_) {} };
  const exact = (q,a) => a.length === q.correct.length && q.correct.every(id => a.includes(id));
  const el = (tag,text,cls) => { const node=document.createElement(tag); if(text) node.textContent=text; if(cls) node.className=cls; return node; };
  const button = (text,fn) => { const b=el('button',text,'btn btn--primary'); b.type='button'; b.addEventListener('click',fn); return b; };
  const labels = (q,ids) => q.options.filter(o=>ids.includes(o.id)).map(o=>o.label[lang]).join(' / ');
  function render(focus=false) {
    root.replaceChildren();
    const title=el('h3',data.title[lang]); title.tabIndex=-1; root.append(title);
    const live=el('div'); live.setAttribute('aria-live','polite'); live.setAttribute('aria-atomic','true');
    if(state.index === data.questions.length) {
      const score=data.questions.filter(q=>exact(q,state.answers[q.id])).length;
      const result=el('p',`${ui.score}: ${score}/${data.questions.length}. ${data.results.find(r=>score<=r.max).text[lang]}`);
      result.setAttribute('role','status'); root.append(result);
      const errors=el('div'); errors.hidden=true;
      data.questions.filter(q=>!exact(q,state.answers[q.id])).forEach(q=>{
        errors.append(el('h4',q.prompt[lang]),el('p',ui.selected+' '+labels(q,state.answers[q.id])),el('p',ui.answer+' '+labels(q,q.correct)),el('p',q.explanation[lang]));
      });
      if(!errors.childElementCount) errors.append(el('p',ui.none));
      const review=button(ui.review,()=>{errors.hidden=!errors.hidden; review.setAttribute('aria-expanded',String(!errors.hidden));});
      review.setAttribute('aria-expanded','false');
      root.append(review,errors,button(ui.restart,()=>{state={index:0,answers:{},pending:[]};save();render(true);}));
    } else {
      const q=data.questions[state.index], answered=state.answers[q.id];
      root.append(el('p',`${state.index+1}/${data.questions.length} · A0–A2`));
      const form=el('form'); const field=el('fieldset'); field.append(el('legend',q.prompt[lang]));
      if(q.type==='multi_select') field.append(el('p',ui.multi));
      q.options.forEach(o=>{
        const label=el('label',null,'learning-option'), input=el('input');
        input.type=q.type==='multi_select'?'checkbox':'radio'; input.name=q.id; input.value=o.id;
        input.checked=(answered || state.pending).includes(o.id); input.disabled=!!answered;
        input.addEventListener('change',()=>{state.pending=[...field.querySelectorAll('input:checked')].map(i=>i.value);save();});
        label.append(input,el('span',o.label[lang])); field.append(label);
      });
      form.append(field,live);
      if(answered) {
        live.append(el('p',exact(q,answered)?ui.correct:ui.wrong),el('p',ui.answer+' '+labels(q,q.correct)),el('p',q.explanation[lang]));
        form.append(button(state.index===data.questions.length-1?ui.finish:ui.next,()=>{state.index++;state.pending=[];save();render(true);}));
      } else {
        const confirm=el('button',ui.check,'btn btn--primary'); confirm.type='submit';form.append(confirm);
        form.addEventListener('submit',e=>{
          e.preventDefault();
          const selected=[...field.querySelectorAll('input:checked')].map(i=>i.value);
          if(!selected.length){live.textContent=ui.choose;return;}
          state.answers[q.id]=selected;state.pending=[];save();render();
          const feedback=root.querySelector('[aria-live]');feedback.tabIndex=-1;feedback.focus();
        });
      }
      root.append(form);
    }
    if(focus) title.focus();
  }
  render();
}
