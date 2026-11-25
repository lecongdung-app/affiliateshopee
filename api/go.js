// Trang trung gian: Facebook đọc og:image/og:title, người dùng bấm vào sẽ được chuyển sang Shopee.
const ALLOWED = ['shopee.vn', 'shope.ee', 'shp.ee'];

const esc = (s) =>
  String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function okShopee(u) {
  try {
    const x = new URL(u);
    if (x.protocol !== 'https:' && x.protocol !== 'http:') return false;
    return ALLOWED.some((a) => x.hostname === a || x.hostname.endsWith('.' + a));
  } catch (e) {
    return false;
  }
}

module.exports = (req, res) => {
  const { u, i, t, d } = req.query;
  if (!okShopee(u)) {
    res.status(400).send('Link không hợp lệ (chỉ chấp nhận link Shopee).');
    return;
  }
  const img = /^https:\/\//.test(i || '') ? i : '';
  const title = esc(t || 'Xem sản phẩm trên Shopee');
  const desc = esc(d || 'Bấm để xem chi tiết và giá trên Shopee.');
  const self = esc('https://' + req.headers.host + req.url);
  const target = esc(u);
  const W = parseInt(req.query.w, 10), H = parseInt(req.query.h, 10);
  const dimOk = W >= 200 && W <= 4000 && H >= 200 && H <= 4000;
  const isBot = /facebookexternalhit|facebot|meta-externalagent|zalo|twitterbot|telegrambot/i.test(req.headers['user-agent'] || '');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600');
  res.status(200).send(`<!doctype html>
<html lang="vi"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${self}">
${img ? `<meta property="og:image" content="${esc(img)}">
${dimOk ? `<meta property="og:image:width" content="${W}">
<meta property="og:image:height" content="${H}">` : ''}
<meta name="twitter:card" content="summary_large_image">` : ''}
<style>
body{font-family:system-ui,sans-serif;margin:0;padding:24px;text-align:center;color:#222}
img{max-width:100%;border-radius:12px}
a.b{display:inline-block;margin-top:16px;padding:14px 28px;background:#ee4d2d;color:#fff;border-radius:10px;text-decoration:none;font-weight:600}
</style>
</head><body>
${img ? `<img src="${esc(img)}" alt="">` : ''}
<h2>${title}</h2>
<p>${desc}</p>
<a class="b" href="${target}">Xem trên Shopee</a>
${isBot ? '' : `<script>location.replace(${JSON.stringify(u)});</script>`}
</body></html>`);
};
