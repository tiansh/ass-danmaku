; (function () {

  const getPageTitle = async tabId => (await browser.tabs.get(tabId)).title.replace(/ - \S*$/, '');
  const redirector = (url) => {
    const newUrl = new URL(url);
    newUrl.searchParams.delete('limit');
    return newUrl.href;
  };

  window.redirect([
    'https://api.gamer.com.tw/anime/v1/danmu.php?*limit=*',
  ], { redirector: redirector });

  window.onRequest([
    'https://api.gamer.com.tw/anime/v1/danmu.php?*',
  ], async function (response, pageContext, { url, requestBody }) {
    const params = new URL(url).searchParams;
    const sn = params.get('videoSn');
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
