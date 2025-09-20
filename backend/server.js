const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // biar gambar bisa diakses

// Koneksi MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // sesuaikan
  database: "lego_store", // sesuaikan
  port: 5004 // sesuai setting MySQL kamu
});

db.connect(err => {
  if (err) {
    console.error("Koneksi database gagal:", err);
  } else {
    console.log("MySQL terkoneksi!");
  }
});

// Setup Multer untuk upload gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// API Tambah Produk
app.post("/products", upload.single("image"), (req, res) => {
  const { name, price, stock } = req.body;
  const image = req.file ? `uploads/${req.file.filename}` : null;

  const sql = "INSERT INTO products (name, price, stock, image) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, price, stock, image], (err, result) => {
    if (err) {
      console.error("Gagal insert:", err);
      return res.status(500).json({ message: "Gagal menambahkan produk" });
    }
    res.json({ message: "Produk berhasil ditambahkan!" });
  });
});

// API Ambil Semua Produk
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.error("Gagal ambil data:", err);
      return res.status(500).json({ message: "Gagal mengambil produk" });
    }
    res.json(results);
  });
});

app.listen(3000, () => console.log("Server running di http://localhost:3000"));
