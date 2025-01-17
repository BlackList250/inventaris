import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost/crud_inventaris/crud.php'; // File PHP

const App = () => {
  const [stock, setStock] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}`)
      .then((response) => setStock(response.data))
      .catch((error) => console.error('Gagal memuat data stok:', error));
  }, []);

  const handleStockUpdate = async (itemId) => {
    const item = stock.find((item) => item.id_barang === itemId);
    const newStock = prompt(`Masukkan stok baru untuk ${item.nama}:`, item.stok);

    if (newStock !== null) {
      const confirmed = window.confirm(`Konfirmasi perubahan stok ${item.nama} menjadi ${newStock}`);
      if (confirmed) {
        try {
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
          }
        } catch (error) {
          console.error('Gagal update stok.', error);
        }
      }
    }
  };

  const handleAddNewItem = async () => {
    const nama = prompt('Masukkan nama barang baru:');
    const stok = prompt('Masukkan jumlah stok barang baru:');

    if (nama && stok) {
      try {
        const response = await axios.post(API_BASE_URL, {
          nama,
          stok: parseInt(stok, 10),
        });

        if (response.status === 200) {
          setStock([...stock, { id_barang: response.data.id, nama, stok: parseInt(stok, 10), }]);
          alert('Barang berhasil ditambahkan!');
        }
      } catch (error) {
        console.error('Gagal menambah barang:', error);
      }
    }
  };

  const filteredStock = stock.filter((item) =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      <h1>Manajemen Stok Gudang</h1>
      <button onClick={handleAddNewItem} style={{ margin: '10px 0', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>
        Tambah Barang Baru
      </button>
      <input
        type="text"
        placeholder="Cari barang..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{margin: '10px 0', padding: '10px', width: '100%', boxSizing: 'border-box', }}
      />
      <StockTable stock={filteredStock} handleStockUpdate={handleStockUpdate} />
    </div>
  );
};

const StockTable = ({ stock, handleStockUpdate }) => (
  <div>
    <h2>Stok Barang</h2>
    <table border="1" width="100%" style={{ textAlign: 'left' }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nama Barang</th>
          <th>Stok</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        {stock.map((item) => (
          <tr key={item.id_barang}>
            <td>{item.id_barang}</td>
            <td>{item.nama}</td>
            <td>{item.stok}</td>
            <td>
              <button onClick={() => handleStockUpdate(item.id_barang)}>Edit Stok</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default App;
