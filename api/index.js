const express = require('express');
const app = express();

app.use(express.json());

// API Endpoint untuk pakan
app.get('/api/pakan', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        nama: "Pakan Ayam Broiler BR-1",
        harga: 380000,
        stok: 50,
        gambar: "https://via.placeholder.com/300x280?text=Pakan+Broiler",
        deskripsi: "Pakan berkadar protein tinggi untuk pertumbuhan ayam broiler."
      }
    ]
  });
});

// Jalankan server lokal hanya saat dijalankan langsung
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;