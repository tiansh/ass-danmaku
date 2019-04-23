; (function () {

  const getPageTitle = async tabId => (await browser.tabs.get(tabId)).title.replace(/ - \S*$/, '');

  window.onRequest([
    'https://ani.gamer.com.tw/ajax/danmuGet.php',
  ], async function (response, pageContext, { url, requestBody }) {
    const { sn } = requestBody.formData;
    const { danmaku } = window.danmaku.parser.bahamut(response);
    if (danmaku.length === 0) return;
    const { tabId } = pageContext;
    const title = await getPageTitle(tabId);
    const name = 'BH' + sn + (title ? ' - ' + title : '');
    const danmakuList = pageContext.danmakuList = pageContext.danmakuList || [];
    danmakuList.push({
      id: `bahamut-${sn}`,
      meta: { name, url },
      content: danmaku,
    });
  }, { includeRequestBody: true });

}());
