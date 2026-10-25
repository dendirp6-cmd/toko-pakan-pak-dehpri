const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Gunakan /tmp untuk penyimpanan sementara di environment Serverless Vercel
const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const baseUploadPath = isVercel ? '/tmp' : 'public';
const dataFilePath = isVercel ? '/tmp/data.json' : path.join(__dirname, 'data.json');

// Inisialisasi file data.json di /tmp jika belum ada (khusus Vercel)
if (isVercel && !fs.existsSync(dataFilePath)) {
  try {
    const originalDataPath = path.join(__dirname, 'data.json');
    if (fs.existsSync(originalDataPath)) {
      fs.copyFileSync(originalDataPath, dataFilePath);
    } else {
      fs.writeFileSync(dataFilePath, '[]', 'utf8');
    }
  } catch (err) {
    console.error('Gagal menyiapkan data.json di /tmp:', err);
  }
}

// Konfigurasi Multer untuk Musik & Gambar Produk
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = path.join(baseUploadPath, 'uploads');
    if (file.fieldname === 'fileMusik') {
      folder = path.join(baseUploadPath, 'audio');
    }
    
    try {
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }
      cb(null, folder);
    } catch (err) {
      cb(err, folder);
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    if (file.fieldname === 'fileMusik') {
      cb(null, 'background' + ext);
    } else {
      cb(null, 'produk_' + Date.now() + ext);
    }
  }
});

const upload = multer({ storage: storage });

function bacaData() {
  try {
    if (!fs.existsSync(dataFilePath)) return [];
    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(fileData);
  } catch (err) {
    return [];
  }
}

function simpanData(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Gagal menyimpan data:', err);
  }
}

// API GET Produk
app.get('/api/pakan', (req, res) => {
  const daftarPakan = bacaData();
  res.json({ status: 'success', data: daftarPakan });
});

// API DELETE Produk berdasarkan ID
app.delete('/api/pakan/:id', (req, res) => {
  const idHapus = Number(req.params.id);
  let daftarPakan = bacaData();
  
  const dataBaru = daftarPakan.filter(item => item.id !== idHapus);
  
  if (dataBaru.length === daftarPakan.length) {
    return res.status(404).json({ status: 'error', message: 'Produk tidak ditemukan!' });
  }

  simpanData(dataBaru);
  res.json({ status: 'success', message: 'Produk berhasil dihapus!' });
});

// API POST Produk dengan Upload Gambar dari HP
app.post('/api/pakan', upload.single('gambarProduk'), (req, res) => {
  const { nama, stok, harga } = req.body;
  const daftarPakan = bacaData();
  
  const gambarPath = req.file 
    ? `/uploads/${req.file.filename}` 
    : 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=300&auto=format&fit=crop&q=80';

  const produkBaru = {
    id: daftarPakan.length > 0 ? daftarPakan[daftarPakan.length - 1].id + 1 : 1,
    nama: nama,
    stok: Number(stok),
    harga: Number(harga),
    gambar: gambarPath
  };

  daftarPakan.push(produkBaru);
  simpanData(daftarPakan);

  res.json({ status: 'success', message: 'Produk dan foto berhasil disimpan!', data: produkBaru });
});

// API POST Upload Musik
app.post('/api/upload-musik', upload.single('fileMusik'), (req, res) => {
  res.json({ status: 'success', message: 'Musik latar berhasil di-upload dari HP!' });
});

// Hanya jalankan server lokal jika di-run langsung (bukan via Vercel function)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
  });
}

// Export module untuk Vercel Serverless
module.exports = app;
