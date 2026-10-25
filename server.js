const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// Menyajikan file statis
app.use(express.static(process.cwd()));

// Sample API Route
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

// Serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

module.exports = app;
