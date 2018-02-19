; (function () {

  document.addEventListener('DOMContentLoaded', async function () {
    /** @type {HTMLTemplateElement} */
    const panel = document.getElementById('config_panel');
    const content = panel.content;
    const main = content.querySelector('main');
    const placeholders = Array.from(main.querySelectorAll('span[data-i18n]'));
    placeholders.forEach(span => {
      const i18n = span.dataset.i18n;
      delete span.dataset.i18n;
      const text = browser.i18n.getMessage(i18n);
      span.textContent = text;
    });
    const instance = document.importNode(main);
    const options = await window.options.get();
    window.options.bindDom(options, main);
    panel.parentNode.insertBefore(main, panel);
  });

}());
