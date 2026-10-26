const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// 1. Melayani file statis dari folder public (HTML, CSS, JS, gambar)
app.use(express.static(path.join(__dirname, 'public')));

// 2. API Endpoint untuk pakan
app.get('/api/pakan', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        nama: "Pakan Ayam Broiler BR-1 Premium",
        harga: 380000,
        stok: 50,
        gambar: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80",
        deskripsi: "Pakan berkadar protein tinggi untuk pertumbuhan ayam broiler."
      },
      {
        id: 2,
        nama: "Pakan Bebek Petelur Premium",
        harga: 355000,
        stok: 30,
        gambar: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80",
        deskripsi: "Nutrisi lengkap untuk meningkatkan kualitas dan produksi telur bebek."
      }
    ]
  });
});

// 3. Fallback Route: Menampilkan public/index.html jika route tidak ditemukan
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 4. Jalankan local server jika file dieksekusi secara langsung
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;