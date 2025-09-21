const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs"); // Tambahkan modul fs untuk menghapus file

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
  destination: (req, file, cb) => {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
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

// --- FITUR BARU: API EDIT PRODUK ---
app.put("/products/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { name, price, stock } = req.body;
  const newImage = req.file ? `uploads/${req.file.filename}` : null;

  // Dapatkan produk lama untuk memeriksa gambar
  const sqlGetOldImage = "SELECT image FROM products WHERE id = ?";
  db.query(sqlGetOldImage, [id], (err, result) => {
    if (err) {
      console.error("Gagal ambil gambar lama:", err);
      return res.status(500).json({ message: "Gagal mengedit produk" });
    }

    const oldImage = result[0].image;

    // Jika ada gambar baru, hapus gambar lama
    if (newImage && oldImage) {
      fs.unlink(oldImage, (err) => {
        if (err) console.error("Gagal hapus gambar lama:", err);
      });
    }

    const imageToUpdate = newImage || oldImage;
    const sqlUpdate = "UPDATE products SET name = ?, price = ?, stock = ?, image = ? WHERE id = ?";
    db.query(sqlUpdate, [name, price, stock, imageToUpdate, id], (err, result) => {
      if (err) {
        console.error("Gagal update:", err);
        return res.status(500).json({ message: "Gagal mengedit produk" });
      }
      res.json({ message: "Produk berhasil diupdate!" });
    });
  });
});

// --- FITUR BARU: API HAPUS PRODUK ---
app.delete("/products/:id", (req, res) => {
  const { id } = req.params;

  const sqlGetImage = "SELECT image FROM products WHERE id = ?";
  db.query(sqlGetImage, [id], (err, result) => {
    if (err || result.length === 0) {
      console.error("Produk tidak ditemukan atau gagal ambil gambar:", err);
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    const imageToDelete = result[0].image;

    const sqlDelete = "DELETE FROM products WHERE id = ?";
    db.query(sqlDelete, [id], (err, result) => {
      if (err) {
        console.error("Gagal hapus:", err);
        return res.status(500).json({ message: "Gagal menghapus produk" });
      }

      // Hapus file gambar dari server
      if (imageToDelete) {
        fs.unlink(imageToDelete, (err) => {
          if (err) console.error("Gagal hapus file gambar:", err);
        });
      }
      res.json({ message: "Produk berhasil dihapus!" });
    });
  });
});

app.listen(3000, () => console.log("Server running di http://localhost:3000"));