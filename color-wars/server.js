const express = require('express');
const fs = require('fs');
const app = express();
const DB = 'usuarios.json';
const TRX = 'transacciones.json';

if (!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({users:[]}));
if (!fs.existsSync(TRX)) fs.writeFileSync(TRX, JSON.stringify({pendientes:[]}));

app.use(express.json({limit: '10mb'}));
app.use(express.static(__dirname));

// Registro y Login
app.post('/api/reg', (req, res) => {
    const db = JSON.parse(fs.readFileSync(DB));
    if (db.users.find(u => u.email === req.body.email)) return res.status(400).send('Existe');
    const newUser = { ...req.body, balance: 0.00 };
    db.users.push(newUser);
    fs.writeFileSync(DB, JSON.stringify(db, null, 2));
    res.json(newUser);
});

app.post('/api/log', (req, res) => {
    const db = JSON.parse(fs.readFileSync(DB));
    const user = db.users.find(u => u.email === req.body.email && u.password === req.body.password);
    if (user) res.json(user);
    else res.status(401).send('Error');
});

// Reportar Carga o Retiro
app.post('/api/reportar', (req, res) => {
    const trx = JSON.parse(fs.readFileSync(TRX));
    const nuevaTrx = { id: Date.now(), ...req.body, estado: 'pendiente' };
    trx.pendientes.push(nuevaTrx);
    fs.writeFileSync(TRX, JSON.stringify(trx, null, 2));
    res.json({success: true});
});

// PANEL ADMIN: Ver transacciones
app.get('/api/admin/trx', (req, res) => {
    res.json(JSON.parse(fs.readFileSync(TRX)));
});

// PANEL ADMIN: Aprobar/Rechazar
app.post('/api/admin/procesar', (req, res) => {
    const { id, accion } = req.body;
    let trx = JSON.parse(fs.readFileSync(TRX));
    let db = JSON.parse(fs.readFileSync(DB));
    
    const tIdx = trx.pendientes.findIndex(t => t.id === id);
    if (tIdx === -1) return res.status(404).send('No encontrada');
    
    const t = trx.pendientes[tIdx];
    if (accion === 'aprobar') {
        const uIdx = db.users.findIndex(u => u.email === t.email);
        if (uIdx !== -1) {
            if (t.tipo === 'carga') db.users[uIdx].balance += parseFloat(t.monto);
            if (t.tipo === 'retiro') db.users[uIdx].balance -= parseFloat(t.monto);
        }
    }
    
    trx.pendientes.splice(tIdx, 1); // Quitar de pendientes
    fs.writeFileSync(DB, JSON.stringify(db, null, 2));
    fs.writeFileSync(TRX, JSON.stringify(trx, null, 2));
    res.json({success: true});
});

app.listen(3000, '0.0.0.0', () => console.log('SISTEMA NEBULA CON ADMIN PANEL'));
