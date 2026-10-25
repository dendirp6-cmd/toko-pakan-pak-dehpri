
const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// 1. Menyajikan file statis (HTML, CSS, Gambar, Audio) dari folder root/public
app.use(express.static(path.join(__dirname, 'public'))); // Sesuaikan folder tempat index.html disimpan (misal: 'public' atau '.')

// 2. Sample Data API Pakan
const pakanData = [
  {
    id: 1,
    nama: "Pakan Ayam Broiler BR-1",
    harga: 380000,
    stok: 50,
    gambar: "https://via.placeholder.com/300x280?text=Pakan+Broiler",
    deskripsi: "Pakan berkadar protein tinggi cocok untuk pertumbuhan ayam broiler usia 1-21 hari."
  },
  {
    id: 2,
    nama: "Pakan Bebek Petelur Premium",
    harga: 355000,
    stok: 30,
    gambar: "https://via.placeholder.com/300x280?text=Pakan+Bebek",
    deskripsi: "Mengandung kalsium tinggi untuk meningkatkan produksi dan kualitas cangkang telur."
  }
];

// 3. API Route
app.get('/api/pakan', (req, res) => {
  res.json({ success: true, data: pakanData });
});

// 4. Fallback Route untuk melayani index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Export untuk Serverless Vercel
module.exports = app;

// Jalankan server lokal jika di-run secara mandiri
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
