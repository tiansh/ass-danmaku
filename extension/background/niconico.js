; (function () {

  const getPageTitle = async tabId => (await browser.tabs.get(tabId)).title;
  window.onRequest([
    '*://nvcomment.nicovideo.jp/v1/threads',
    '*://nv-comment.nicovideo.jp/v1/threads',
  ], async function (response, pageContext, { url }) {
    const { thread, danmaku } = window.danmaku.parser.niconico(response);
    if (danmaku.length === 0) return;
    const { tabId } = pageContext;
    const title = await getPageTitle(tabId);
    const name = 'N' + thread + (title ? ' - ' + title : '');
    const danmakuList = pageContext.danmakuList = pageContext.danmakuList || [];
    const id = `niconico-${thread}`;
    const danmakuItem = danmakuList.find(danmaku => danmaku.id === id);
    if (!danmakuItem) {
      danmakuList.push({
        id: `niconico-${thread}`,
        meta: { name, url },
        content: danmaku,
      });
    } else {
      const danmakuMap = new Map();
      danmakuItem.content.concat(danmaku).forEach(danmaku => danmakuMap.set(danmaku.id, danmaku));
      danmakuItem.content = [...danmakuMap.values()];
    }
  });

}());
