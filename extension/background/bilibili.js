; (function () {

  const getPageTitle = async tabId => (await browser.tabs.get(tabId)).title;

  window.onRequest(['https://api.bilibili.com/x/player/pagelist?*'], function (response, pageContext) {
    const { data } = JSON.parse(new TextDecoder('utf-8').decode(response));
    const { tabId } = pageContext;
    const cidTitle = pageContext.metaInfo.cidTitle = pageContext.metaInfo.cidTitle || new Map();
    data.forEach(({ cid, part }) => {
      cidTitle.set(cid, (async () => {
        const title = await getPageTitle(tabId);
        const aidTitle = title.replace(/_.*$/, '');
        const partTitle = part ? ' - ' + part : '';
        return aidTitle + partTitle;
      })());
    });
  });

  window.onRequest([
    'https://comment.bilibili.com/*.xml',
    'https://api.bilibili.com/x/v1/dm/list.so?oid=*',
  ], async function (response, pageContext, { url }) {
    const { cid, danmaku } = window.danmaku.parser.bilibili(response);
    if (danmaku.length === 0) return;
    const { tabId } = pageContext;
    const cidTitle = pageContext.metaInfo.cidTitle;
    const title = await (cidTitle && cidTitle.get(cid) || getPageTitle(tabId));
    const name = 'B' + cid + (title ? ' - ' + title : '');
    const danmakuList = pageContext.danmakuList = pageContext.danmakuList || [];
    danmakuList.push({
      id: `bilibili-${cid}`,
      meta: { name, url },
      content: danmaku,
    });
  });

}());
