; (function () {

  window.onRequest(['*://www.acfun.cn/v/ac*'], function (response, pageContext) {
    const html = new TextDecoder('utf-8').decode(response);
    const pageDom = (new DOMParser()).parseFromString(html, 'text/html');
    const scriptTags = Array.from(pageDom.querySelectorAll('script'));
    const script = scriptTags.find(script => (
      /^var pageInfo = \{.*}$/.test(script.textContent)
    ));
    const data = JSON.parse(script.textContent.match(/({.*})/)[1]);
    const { title } = data;
    const vidTitle = pageContext.metaInfo.vidTitle = pageContext.metaInfo.vidTitle || new Map();
    data.videoList.forEach(({ id, title: part }) => {
      vidTitle.set(id, title + (part ? ' - ' + part : ''));
    });
  });

  window.onRequest(['*://danmu.aixifan.com/V4/*_*/*/*'], async function (response, pageContext, { url }) {
    const vid = +(url.match(/\w+:\/\/danmu\.aixifan\.com\/V4\/(\d+)_/) || [])[1];
    const { danmaku } = window.danmaku.parser.acfun(response);
    if (danmaku.length === 0) return;
    const danmakuList = pageContext.danmakuList = pageContext.danmakuList || [];
    const danmakuItem = danmakuList.find(({ id }) => id === `acfun-${vid}`);
    if (danmakuItem) {
      const danmakuMap = new Map();
      danmakuItem.content.concat(danmaku).forEach(danmaku => danmakuMap.set(danmaku.uuid, danmaku));
      danmakuItem.content = [...danmakuMap.values()];
    } else {
      const vidTitle = pageContext.metaInfo.vidTitle;
      const title = vidTitle && vidTitle.get(vid);
      const name = 'A' + vid + (title ? ' - ' + title : '');
      danmakuList.push({
        id: `acfun-${vid}`,
        meta: { name, url },
        content: danmaku,
      });
    }
  });

}());
