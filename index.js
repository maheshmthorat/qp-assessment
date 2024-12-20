const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
app.use(bodyParser.json());

const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


app.post('/api/admin/grocery', (req, res) => {
    const { name, price, description, category, inventory } = req.body;
    const sql = 'INSERT INTO groceries (name, price, description, category, inventory) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, price, description, category, inventory], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.status(201).json({ success: true, message: 'Grocery item added successfully', itemId: result.insertId });
    });
});

app.get('/api/admin/grocery', (req, res) => {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM groceries';
    const conditions = [];

    if (category) {
        conditions.push(`category = ${db.escape(category)}`);
    }

    if (search && search.trim()) {
        conditions.push(`name LIKE ${db.escape('%' + search.trim() + '%')}`);
    }

    if (conditions.length) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, items: results });
    });
});

app.delete('/api/admin/grocery/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM groceries WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Item not found' });
        res.json({ success: true, message: 'Grocery item deleted successfully' });
    });
});


app.put('/api/admin/grocery/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, description, category, inventory } = req.body;
    const sql = 'UPDATE groceries SET name = ?, price = ?, description = ?, category = ?, inventory = ? WHERE id = ?';
    db.query(sql, [name, price, description, category, inventory, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Item not found' });
        res.json({ success: true, message: 'Grocery item updated successfully' });
    });
});

app.patch('/api/admin/grocery/:id/inventory', (req, res) => {
    const { id } = req.params;
    const { inventory } = req.body;
    const sql = 'UPDATE groceries SET inventory = ? WHERE id = ?';
    db.query(sql, [inventory, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Item not found' });
        res.json({ success: true, message: 'Inventory updated successfully' });
    });
});

