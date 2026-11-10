
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

const supabaseUrl = process.env.SUPABASE_URL || 'https://bvlunodvvhvsraewgcoi.supabase.co';
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminPassword = process.env.ADMIN_PASSWORD;

function requireAdmin(req, res) {
  if (!adminPassword) {
    res.status(503).json({ success: false, message: 'ADMIN_PASSWORD belum dikonfigurasi di environment server.' });
    return false;
  }
  if (req.get('x-admin-password') !== adminPassword) {
    res.status(401).json({ success: false, message: 'Password admin tidak valid.' });
    return false;
  }
  return true;
}

async function supabaseRequest(table, options = {}, { admin = false } = {}) {
  const key = admin ? supabaseServiceRoleKey : supabasePublishableKey;
  if (!key) throw new Error(`Supabase key belum dikonfigurasi untuk ${admin ? 'admin' : 'public'} API.`);
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}${options.query || ''}`, {
    method: options.method || 'GET',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: options.prefer || 'return=representation'
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) throw new Error(data?.message || data?.hint || `Supabase error ${response.status}`);
  return data;
}

app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, customerPhone, customerAddress = '', items = [], shippingCost = 0, discount = 0 } = req.body;
    if (!customerName || !customerPhone || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Nama, nomor WhatsApp, dan produk wajib diisi.' });
    }
    const normalizedItems = items.map(item => ({
      product_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(item.productId || '')) ? item.productId : null,
      product_name: String(item.name || 'Produk Pakan'),
      selling_price: Number(item.price) || 0,
      cost_price: Number(item.costPrice) || 0,
      quantity: Math.max(1, Number(item.quantity) || 1),
      line_total: (Number(item.price) || 0) * Math.max(1, Number(item.quantity) || 1)
    }));
    const subtotal = normalizedItems.reduce((sum, item) => sum + item.line_total, 0);
    const total = Math.max(0, subtotal + (Number(shippingCost) || 0) - (Number(discount) || 0));
    const orderNumber = `PDH-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${Date.now().toString().slice(-5)}`;
    const [order] = await supabaseRequest('orders', {
      method: 'POST',
      body: { order_number: orderNumber, customer_name: customerName, customer_phone: customerPhone, customer_address: customerAddress, subtotal, shipping_cost: Number(shippingCost) || 0, discount: Number(discount) || 0, total, status: 'pending' }
    });
    await supabaseRequest('order_items', { method: 'POST', body: normalizedItems.map(item => ({ ...item, order_id: order.id })) });
    res.status(201).json({ success: true, data: { ...order, items: normalizedItems } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/traffic', async (req, res) => {
  try {
    const { eventType = 'page_view', sessionId = '', pagePath = '/' } = req.body || {};
    await supabaseRequest('traffic_events', { method: 'POST', body: { event_type: eventType, session_id: sessionId, page_path: pagePath } });
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const query = '?select=*,order_items(*)&order=created_at.desc';
    const data = await supabaseRequest('orders', { query }, { admin: true });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/traffic/summary', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const data = await supabaseRequest('traffic_events', { query: '?select=id' }, { admin: true });
    res.json({ success: true, data: { total: data.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { status, cancellationReason = null } = req.body || {};
    const allowed = ['pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Status order tidak valid.' });
    const data = await supabaseRequest('orders', { method: 'PATCH', query: `?id=eq.${encodeURIComponent(req.params.id)}`, body: { status, cancellation_reason: status === 'cancelled' ? cancellationReason : null, cancelled_at: status === 'cancelled' ? new Date().toISOString() : null } }, { admin: true });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
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
