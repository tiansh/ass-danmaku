; (function () {

  const activeTab = browser.tabs.query({ currentWindow: true, active: true }).then(([tab]) => tab);

  const callBackend = new Proxy({}, {
    get: (empty, method) => (...params) => (
      activeTab.then(({ id }) => (
        browser.runtime.sendMessage({ method, params: [id, ...params] })
      ))
    ),
  });

  const domReady = new Promise(resolve => {
    document.addEventListener('DOMContentLoaded', () => resolve());
  });

  const danmakuInfo = callBackend.listDanmaku();


  Promise.all([domReady, danmakuInfo]).then(([, danmakuList]) => {
    const menuList = document.querySelector('.download-list');
    const menuItems = document.createDocumentFragment();
    danmakuList.forEach(({ id, meta: { name } }) => {
      /** @type {HTMLTemplateElement} */
      const template = document.querySelector('#download-item-template');
      const content = template.content;
      const menuText = content.querySelector('.text');
      menuText.textContent = name;
      const menuItem = content.querySelector('.download-item');
      menuItem.dataset.id = id;
      menuItems.appendChild(document.importNode(menuItem, true));
    });
    menuList.appendChild(menuItems);
  });

  domReady.then(() => {
    document.addEventListener('click', event => {
      const target = event.target;
      const downloadItem = target.closest && target.closest('.download-item');
      const id = downloadItem && downloadItem.dataset.id;
      if (!id) return;
      const converting = document.createElement('span');
      converting.textContent = browser.i18n.getMessage('downloadingTip');
      const text = downloadItem.querySelector('.text');
      text.insertBefore(converting, text.firstChild);
      callBackend.downloadDanmaku(id).then(() => {
        converting.parentNode.removeChild(converting);
      });
    });
  });

}());
