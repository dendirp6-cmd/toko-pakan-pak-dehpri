const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Melayani file statis dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// Data sementara (Mock Database)
let dataPakan = [
  {
    id: 1,
    nama: "Pakan Ayam Broiler BR-1",
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
];

// --- API ENDPOINTS ---

// GET: Ambil daftar pakan
app.get('/api/pakan', (req, res) => {
  res.json({ success: true, data: dataPakan });
});

// POST: Tambah pakan baru
app.post('/api/pakan', (req, res) => {
  const { nama, harga, stok, gambar, deskripsi } = req.body;
  const newPakan = {
    id: Date.now(),
    nama,
    harga: Number(harga) || 0,
    stok: Number(stok) || 0,
    gambar: gambar || "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80",
    deskripsi
  };
  dataPakan.push(newPakan);
  res.json({ success: true, message: "Produk berhasil ditambahkan", data: newPakan });
});

// DELETE: Hapus pakan berdasarkan ID
app.delete('/api/pakan/:id', (req, res) => {
  const targetId = req.params.id;
  const initialLength = dataPakan.length;
  
  // Filter dengan perbandingan string agar cocok sempurna
  dataPakan = dataPakan.filter(item => String(item.id) !== String(targetId));

  if (dataPakan.length < initialLength) {
    res.json({ success: true, message: "Produk berhasil dihapus" });
  } else {
    res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
  }
});

// Fallback route ke index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;