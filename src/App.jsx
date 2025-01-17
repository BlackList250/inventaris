import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';
import './style.css';
import './output.css';

const API_BASE_URL = 'http://localhost/crud_inventaris/crud.php'; // File PHP

const App = () => {
  const [stock, setStock] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItem, setNewItem] = useState({ nama: '', stok: '' });
  const [editingItemId, setEditingItemId] = useState(null);
  const [tempStock, setTempStock] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}`)
      .then((response) => setStock(response.data))
      .catch((error) => console.error('Gagal memuat data stok:', error));
  }, []);

  const handleStockUpdate = async (itemId, newStock) => {
    if (newStock !== '') {
      try {
        const item = stock.find((item) => item.id_barang === itemId);
        const response = await axios.put(API_BASE_URL, {
          id: itemId,
          nama: item.nama,
          stok: parseInt(newStock, 10),
        });

        if (response.status === 200) {
          setStock((prevStock) =>
            prevStock.map((item) =>
              item.id_barang === itemId ? { ...item, stok: parseInt(newStock, 10) } : item
            )
          );
          alert("Stok berhasil diperbarui!");
        }
      } catch (error) {
        console.error('Gagal update stok.', error);
      }
    } else {
      alert("Stok tidak boleh kosong!");
    }
  };

  const handleAddNewItem = async () => {
    if (newItem.nama && newItem.stok) {
      try {
        const response = await axios.post(API_BASE_URL, {
          nama: newItem.nama,
          stok: parseInt(newItem.stok, 10),
        });

        if (response.status === 200) {
          setStock([...stock, { id_barang: response.data.id, ...newItem }]);
          setNewItem({ nama: '', stok: '' });
          alert('Barang berhasil ditambahkan!');
        }
      } catch (error) {
        console.error('Gagal menambah barang:', error);
      }
    } else {
      alert('Harap mengisi semua data barang!');
    }
  };

  const handleDelete = async (itemId) => {
    // Menambahkan konfirmasi sebelum menghapus
    const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus barang ini?");
    if (isConfirmed) {
      try {
        const response = await axios.delete(`${API_BASE_URL}?id=${itemId}`);
        if (response.status === 200) {
          setStock(stock.filter((item) => item.id_barang !== itemId));
          alert("Barang berhasil dihapus!");
        }
      } catch (error) {
        console.error('Gagal menghapus barang:', error);
      }
    }
  };

  const filteredStock = stock.filter((item) =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (itemId, currentStock) => {
    if (editingItemId === itemId) {
      handleStockUpdate(itemId, tempStock);
      setEditingItemId(null);
    } else {
      setEditingItemId(itemId);
      setTempStock(currentStock);
    }
  };

  return (
    <div className="container">
      <h1 className="header">Manajemen Stok Gudang</h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Nama barang baru"
          value={newItem.nama}
          onChange={(e) => setNewItem({ ...newItem, nama: e.target.value })}
          className="input mb-4"
        />
        <input
          type="number"
          placeholder="Stok barang baru"
          value={newItem.stok}
          onChange={(e) => setNewItem({ ...newItem, stok: e.target.value })}
          className="input mb-4"
        />
        <button onClick={handleAddNewItem} className="button">
          Tambah Barang Baru
        </button>
      </div>
      <input
        type="text"
        placeholder="Cari barang..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="input"
      />
      <StockTable 
        stock={filteredStock} 
        handleEdit={handleEdit} 
        editingItemId={editingItemId}
        tempStock={tempStock}
        setTempStock={setTempStock}
        handleDelete={handleDelete}
      />
    </div>
  );
};

const StockTable = ({ stock, handleEdit, editingItemId, tempStock, setTempStock, handleDelete }) => {
  return (
    <div className="table-container">
      <h2 className="header">Stok Barang</h2>
      <div className="overflow-auto max-h-64">
        <table className="table">
          <thead className="table-head">
            <tr>
              <th className="table-cell">ID</th>
              <th className="table-cell">Nama Barang</th>
              <th className="table-cell">Stok</th>
              <th className="table-cell">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((item) => (
              <tr key={item.id_barang} className="table-row">
                <td className="table-cell">{item.id_barang}</td>
                <td className="table-cell">{item.nama}</td>
                <td className="table-cell">
                  {editingItemId === item.id_barang ? (
                    <input
                      type="number"
                      value={tempStock}
                      onChange={(e) => setTempStock(e.target.value)}
                      className="input w-20"
                    />
                  ) : (
                    <span>{item.stok}</span>
                  )}
                </td>
                <td className="table-cell">
                  {editingItemId === item.id_barang ? (
                    <button
                      onClick={() => handleEdit(item.id_barang, item.stok)}
                      className="table-button"
                    >
                      Simpan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(item.id_barang, item.stok)}
                      className="table-button"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id_barang)}
                    className="table-button table-button-danger"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
