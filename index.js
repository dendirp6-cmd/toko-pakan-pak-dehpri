const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = 'public/uploads';
        if (file.fieldname === 'fileMusik') {
            folder = 'public/audio';
        }
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }
        cb(null, folder);
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
const dataFilePath = path.join(__dirname, 'data.json');

function bacaData() {
    if (!fs.existsSync(dataFilePath)) return [];
    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(fileData);
}

function simpanData(data) {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

app.get('/api/produk', (req, res) => {
    res.json(bacaData());
});

app.post('/api/produk', upload.single('fotoProduk'), (req, res) => {
    const daftarPakan = bacaData();
    const produkBaru = {
        id: Date.now(),
        nama: req.body.nama,
        kategori: req.body.kategori,
        harga: req.body.harga,
        stok: req.body.stok,
        satuan: req.body.satuan,
        deskripsi: req.body.deskripsi,
        foto: req.file ? '/uploads/' + req.file.filename : ''
    };
    daftarPakan.push(produkBaru);
    simpanData(daftarPakan);
    res.json({ status: 'success', message: 'Produk berhasil disimpan!', data: produkBaru });
});

app.post('/api/upload-musik', upload.single('fileMusik'), (req, res) => {
    res.json({ status: 'success', message: 'Musik latar berhasil di-upload!' });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server berjalan di http://localhost:${port}`);
    });
}
module.exports = app;
