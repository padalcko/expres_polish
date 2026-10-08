/* Progressive enhancement: native details works with keyboard and without JS. */
document.querySelectorAll('.telc-page .faq__item').forEach((item) => {
  const question = item.querySelector('summary');
  const syncExpanded = () => question.setAttribute('aria-expanded', String(item.open));
  syncExpanded();
  item.addEventListener('toggle', syncExpanded);
});
