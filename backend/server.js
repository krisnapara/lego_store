const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// 🔗 Koneksi ke MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",        // ganti sesuai user phpMyAdmin
  password: "",        // isi kalau ada password
  database: "lego_store"
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database.");
});

// 🏗️ Buat tabel jika belum ada
db.query(`CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  price DECIMAL(10,2),
  stock INT
)`);

db.query(`CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productId INT,
  quantity INT,
  FOREIGN KEY(productId) REFERENCES products(id)
)`);

// ------------------ API Produk ------------------

// Ambil semua produk
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Tambah produk
app.post("/products", (req, res) => {
  const { name, price, stock } = req.body;
  db.query(
    "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)",
    [name, price, stock],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, name, price, stock });
    }
  );
});

// Update produk
app.put("/products/:id", (req, res) => {
  const { name, price, stock } = req.body;
  db.query(
    "UPDATE products SET name=?, price=?, stock=? WHERE id=?",
    [name, price, stock, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: result.affectedRows });
    }
  );
});

// Hapus produk
app.delete("/products/:id", (req, res) => {
  db.query("DELETE FROM products WHERE id=?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: result.affectedRows });
  });
});

// ------------------ API Cart ------------------

// Ambil isi keranjang
app.get("/cart", (req, res) => {
  db.query(
    `SELECT cart.id, products.name, products.price, cart.quantity
     FROM cart JOIN products ON cart.productId = products.id`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// Tambah ke keranjang
app.post("/cart", (req, res) => {
  const { productId, quantity } = req.body;
  db.query(
    "INSERT INTO cart (productId, quantity) VALUES (?, ?)",
    [productId, quantity],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, productId, quantity });
    }
  );
});

// Hapus item dari keranjang
app.delete("/cart/:id", (req, res) => {
  db.query("DELETE FROM cart WHERE id=?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: result.affectedRows });
  });
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
