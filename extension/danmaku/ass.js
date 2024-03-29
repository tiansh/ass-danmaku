; (function () {

  const ass = (function () {

    // escape string for ass
    const textEscape = s => (
      // VSFilter do not support escaped "{" or "}"; we use full-width version instead
      s.replace(/{/g, '｛').replace(/}/g, '｝').replace(/\s/g, ' ')
    );

    const formatColorChannel = v => (v & 255).toString(16).toUpperCase().padStart(2, '0');

    // format color
    const formatColor = color => '&H' + (
      [color.b, color.g, color.r].map(formatColorChannel).join('')
    );

    // format timestamp
    const formatTimestamp = time => {
      const value = Math.round(time * 100) * 10;
      const rem = value % 3600000;
      const hour = (value - rem) / 3600000;
      const fHour = hour.toFixed(0).padStart(2, '0');
      const fRem = new Date(rem).toISOString().slice(-11, -2);
      return fHour + fRem;
    };

    // test is default color
    const isDefaultColor = ({ r, g, b }) => r === 255 && g === 255 && b === 255;
    // test is dark color
    const isDarkColor = ({ r, g, b }) => r * 0.299 + g * 0.587 + b * 0.114 < 0x30;

    // Ass header
    const header = info => [
      '[Script Info]',
      `Title: ${info.title}`,
      `Original Script: ${info.original}`,
      'ScriptType: v4.00+',
      'Collisions: Normal',
      `PlayResX: ${info.playResX}`,
      `PlayResY: ${info.playResY}`,
      'Timer: 100.0000',
      '',
      '[V4+ Styles]',
      'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
      `Style: Fix,${info.fontFamily},${info.fontSize},&H${info.alpha}FFFFFF,&H${info.alpha}FFFFFF,&H${info.alpha}000000,&H${info.alpha}000000,1,0,0,0,100,100,0,0,1,2,0,2,20,20,2,0`,
      `Style: Rtl,${info.fontFamily},${info.fontSize},&H${info.alpha}FFFFFF,&H${info.alpha}FFFFFF,&H${info.alpha}000000,&H${info.alpha}000000,1,0,0,0,100,100,0,0,1,2,0,2,20,20,2,0`,
      '',
      '[Events]',
      'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
    ];

    // Set color of text
    const lineColor = ({ color }) => {
      let output = [];
      if (!isDefaultColor(color)) output.push(`\\c${formatColor(color)}`);
      if (isDarkColor(color)) output.push(`\\3c&HFFFFFF`);
      return output.join('');
    };

    // Set fontsize
    let defaultFontSize;
    const lineFontSize = ({ fontSize }) => {
      if (fontSize === defaultFontSize) return '';
      return `\\fs${fontSize}`;
    };
    const getCommonFontSize = list => {
      const count = new Map();
      let commonCount = 0, common = 1;
      list.forEach(({ fontSize }) => {
        let value = 1;
        if (count.has(fontSize)) value = count.get(fontSize) + 1;
        count.set(fontSize, value);
        if (value > commonCount) {
          commonCount = value;
          common = fontSize;
        }
      });
      defaultFontSize = common;
      return common;
    };

    // Add animation of danmaku
    const lineMove = ({ layout: { type, start = null, end = null } }) => {
      if (type === 'Rtl' && start && end) return `\\move(${start.x},${start.y},${end.x},${end.y})`;
      if (type === 'Fix' && start) return `\\pos(${start.x},${start.y})`;
      return '';
    };

    // format one line
    const formatLine = line => {
      const start = formatTimestamp(line.layout.start.time);
      const end = formatTimestamp(line.layout.end.time);
      const type = line.layout.type;
      const color = lineColor(line);
      const fontSize = lineFontSize(line);
      const move = lineMove(line);
      const format = `${color}${fontSize}${move}`;
      const text = textEscape(line.text);
      return `Dialogue: 0,${start},${end},${type},,20,20,2,,{${format}}${text}`;
    };

    return (danmaku, options) => {
      const info = {
        title: danmaku.meta.name,
        original: browser.i18n.getMessage('assOriginal', danmaku.meta.url),
        playResX: options.resolutionX,
        playResY: options.resolutionY,
        fontFamily: options.fontFamily,
        fontSize: getCommonFontSize(danmaku.layout),
        alpha: formatColorChannel(0xFF * (100 - options.textOpacity) / 100),
      };
      return [
        ...header(info),
        ...danmaku.layout.map(formatLine).filter(x => x),
      ].join('\r\n');
    };
  }());

  window.danmaku = window.danmaku || {};
  window.danmaku.ass = ass;

}());
