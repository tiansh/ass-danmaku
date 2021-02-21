; (function () {

  window.onRequest(['http://himado.in/api/player?mode=comment*'], async function (response, pageContext, { url }) {
    const id = new URL(url).searchParams.get('id');
    const { danmaku } = window.danmaku.parser.himawari(response);
    if (danmaku.length === 0) return;
    const { tabId } = pageContext;
    const title = (await browser.tabs.get(tabId)).title;
    const name = 'H' + id + (title ? ' - ' + title : '');
    const danmakuList = pageContext.danmakuList = pageContext.danmakuList || [];
    danmakuList.push({
      id: `himadori-${id}`,
      meta: { name, url },
      content: danmaku,
    });

  });

}());