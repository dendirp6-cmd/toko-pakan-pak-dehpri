
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());

// 1. Menyajikan file statis (HTML, CSS, Gambar, Audio) dari folder root/public
app.use(express.static(path.join(__dirname, 'public'))); // Sesuaikan folder tempat index.html disimpan (misal: 'public' atau '.')

// 2. Data produk dibaca dari data.json agar gambar di public/uploads ikut tampil.
const pakanData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8')
);

// 3. API Route
app.get('/api/pakan', (req, res) => {
  res.json({ success: true, data: pakanData });
});

// 4. Fallback Route untuk melayani index.html
app.get('*', (req, res) => {
  // Pastikan fallback memakai halaman terbaru di public, bukan halaman lama
  // di root proyek yang masih menggunakan grid 2 kolom pada layar kecil.
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export untuk Serverless Vercel
module.exports = app;

// Jalankan server lokal jika di-run secara mandiri
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
