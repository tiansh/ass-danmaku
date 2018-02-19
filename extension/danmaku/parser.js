; (function () {

  const parser = (function () {
    /**
     * @typedef DanmakuColor
     * @property {number} r
     * @property {number} g
     * @property {number} b
     */
    /**
     * @typedef Danmaku
     * @property {string} text
     * @property {number} time
     * @property {string} mode
     * @property {number} size
     * @property {DanmakuColor} color
     * @property {boolean} bottom
     */

    const parser = {};

    /**
     * @param {Danmaku} danmaku
     * @returns {boolean}
     */
    const danmakuFilter = danmaku => {
      if (!danmaku.text) return false;
      if (!danmaku.mode) return false;
      if (!danmaku.size) return false;
      if (danmaku.time < 0 || danmaku.time >= 360000) return false;
      return true;
    };

    const parseRgb256IntegerColor = color => {
      const rgb = parseInt(color, 10);
      const r = (rgb >>> 4) & 0xff;
      const g = (rgb >>> 2) & 0xff;
      const b = (rgb >>> 0) & 0xff;
      return { r, g, b };
    };
    /**
     * @param {string|ArrayBuffer} content
     * @return {{ cid: number, danmaku: Array<Danmaku> }}
     */
    parser.bilibili = function (content) {
      const text = typeof content === 'string' ? content : new TextDecoder('utf-8').decode(content);
      const clean = text.replace(/(?:[\0-\x08\x0B\f\x0E-\x1F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g, '');
      const data = (new DOMParser()).parseFromString(clean, 'text/xml');
      const cid = +data.querySelector('chatid').textContent;
      /** @type {Array<Danmaku>} */
      const danmaku = Array.from(data.querySelectorAll('d')).map(d => {
        const p = d.getAttribute('p');
        const [time, mode, size, color, create, bottom, sender, id] = p.split(',');
        return {
          text: d.textContent,
          time: +time,
          // We do not support ltr mode
          mode: [null, 'RTL', 'RTL', 'RTL', 'BOTTOM', 'TOP'][+mode],
          size: +size,
          color: parseRgb256IntegerColor(color),
          bottom: bottom > 0,
        };
      }).filter(danmakuFilter);
      return { cid, danmaku };
    };

    /**
     * @param {string|ArrayBuffer} content
     * @return {{ cid: number, danmaku: Array<Danmaku> }}
     */
    parser.acfun = function (content) {
      const text = typeof content === 'string' ? content : new TextDecoder('utf-8').decode(content);
      const data = JSON.parse(text);
      const list = data.reduce((x, y) => x.concat(y), []);
      const danmaku = list.map(line => {
        const [time, color, mode, size, sender, create, uuid] = line.c.split(','), text = line.m;
        return {
          text,
          time: +time,
          color: parseRgb256IntegerColor(+color),
          mode: [null, 'RTL', null, null, 'BOTTOM', 'TOP'][mode],
          size: +size,
          bottom: false,
          uuid,
        };
      }).filter(danmakuFilter);
      return { danmaku };
    };

    return parser;
  }());

  window.danmaku = window.danmaku || {};
  window.danmaku.parser = parser;

}());
