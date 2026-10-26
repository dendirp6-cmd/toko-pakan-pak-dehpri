const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Header CORS agar tidak diblokir browser
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Melayani file statis dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// Data Mockup
let dataPakan = [
  {
    id: "1",
    nama: "Pakan Ayam Broiler BR-1",
    harga: 380000,
    stok: 50,
    gambar: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80",
    deskripsi: "Pakan berkadar protein tinggi cocok untuk pertumbuhan ayam broiler."
  },
  {
    id: "2",
    nama: "Pakan Bebek Petelur Premium",
    harga: 355000,
    stok: 30,
    gambar: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80",
    deskripsi: "Mengandung kalsium tinggi untuk meningkatkan produksi telur bebek."
  }
];

// --- API ROUTES ---

// GET All Pakan
app.get('/api/pakan', (req, res) => {
  res.json({ success: true, data: dataPakan });
});

// POST Tambah Pakan
app.post('/api/pakan', (req, res) => {
  const { nama, harga, stok, gambar, deskripsi } = req.body;
  const newPakan = {
    id: String(Date.now()),
    nama: nama || "Produk Pakan",
    harga: Number(harga) || 0,
    stok: Number(stok) || 0,
    gambar: gambar || "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80",
    deskripsi: deskripsi || ""
  };
  dataPakan.push(newPakan);
  res.json({ success: true, message: "Produk berhasil ditambahkan!", data: newPakan });
});

// DELETE Pakan By ID
app.delete('/api/pakan/:id', (req, res) => {
  const targetId = String(req.params.id);
  const lengthBefore = dataPakan.length;
  
  dataPakan = dataPakan.filter(item => String(item.id) !== targetId);

  if (dataPakan.length < lengthBefore) {
    return res.json({ success: true, message: "Produk berhasil dihapus!" });
  } else {
    return res.status(404).json({ success: false, message: "Data produk tidak ditemukan!" });
  }
});

// Fallback Route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;