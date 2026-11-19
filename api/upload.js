const { put } = require('@vercel/blob');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.UPLOAD_KEY || req.headers['x-key'] !== process.env.UPLOAD_KEY) {
    return res.status(401).json({ error: 'Sai mật khẩu' });
  }
  const type = req.headers['x-type'] || '';
  if (!/^image\/(jpeg|png|webp)$/.test(type)) {
    return res.status(400).json({ error: 'Chỉ nhận ảnh jpg, png, webp' });
  }
  const ext = type.split('/')[1].replace('jpeg', 'jpg');
  try {
    const blob = await put('img/photo.' + ext, req.body, {
      access: 'public',
      contentType: type,
      addRandomSuffix: true,
    });
    return res.status(200).json({ url: blob.url });
  } catch (e) {
    return res.status(500).json({ error: 'Lỗi tải ảnh lên' });
  }
};
