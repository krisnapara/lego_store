import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import Sidebar from "./sidebar";

const API_URL = "http://localhost:3000/products";

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", stock: "", image: null });
  const [editingId, setEditingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState(null);

  const formRef = useRef(null);

  const loadProducts = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    if (form.image) formData.append("image", form.image);

    const url = editingId ? `${API_URL}/${editingId}` : API_URL;
    const method = editingId ? "PUT" : "POST";

    try {
      await fetch(url, { method, body: formData });
      setForm({ name: "", price: "", stock: "", image: null });
      document.getElementById("fileInput").value = "";
      setEditingId(null);
      loadProducts();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({ name: product.name, price: product.price, stock: product.stock, image: null });
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", price: "", stock: "", image: null });
  };

  const handleDeleteClick = (id) => {
    setShowConfirm(true);
    setProductIdToDelete(id);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setProductIdToDelete(null);
  };

  const confirmDelete = async () => {
    try {
      await fetch(`${API_URL}/${productIdToDelete}`, { method: "DELETE" });
      setShowConfirm(false);
      setProductIdToDelete(null);
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <div id="section-products">
            <h1>🤖Lego Store Online🤖</h1>
            <div className="product-list">
              {products.map((p) => (
                <div key={p.id} className="product-card">
                  <div className="product-image-container">
                    <img src={`http://localhost:3000/${p.image}`} alt={p.name} />
                  </div>
                  <div className="product-content">
                    <h3>{p.name}</h3>
                    <p>Harga: Rp{Number(p.price).toLocaleString("id-ID")}</p>
                    <p>Stok: {p.stock}</p>
                  </div>
                  <div className="actions">
                    <button onClick={() => startEdit(p)}>Edit</button>
                    <button onClick={() => handleDeleteClick(p.id)}>Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="section-form" ref={formRef} className="form-section">
            <h2>{editingId ? "Edit Produk" : "Tambah Produk Baru"}</h2>
            <form className="form-product" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Nama produk"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Harga"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Stok"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
              />
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
              />
              {editingId ? (
                <div className="action-buttons">
                  <button type="submit">Simpan Perubahan</button>
                  <button type="button" onClick={cancelEdit}>Batal</button>
                </div>
              ) : (
                <button type="submit">Tambah Produk</button>
              )}
            </form>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>Apakah Anda yakin ingin menghapus produk ini?</p>
            <div className="confirm-buttons">
              <button onClick={confirmDelete} className="confirm-yes">Yakin</button>
              <button onClick={handleCancelDelete} className="confirm-no">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
