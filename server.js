const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("public"));


// ======================================================
// 🏠 ROTA PRINCIPAL → Dashboard
// ======================================================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});


// ======================================================
// 📌 CLIENTES – CRUD usando db.json
// ======================================================

// 📌 LISTAR CLIENTES
app.get("/api/clientes", (req, res) => {
    const db = JSON.parse(fs.readFileSync("./db.json"));
    res.json(db);
});

// 📌 CADASTRAR CLIENTE
app.post("/api/clientes", (req, res) => {
    const db = JSON.parse(fs.readFileSync("./db.json"));

    const novoCliente = {
        id: Date.now(),
        nome: req.body.nome,
        whatsapp: req.body.whatsapp,
        valor: req.body.valor,
        diaCobranca: req.body.diaCobranca,
        ultimaCobranca: null
    };

    db.push(novoCliente);

    fs.writeFileSync("./db.json", JSON.stringify(db, null, 2));

    res.json({ message: "Cliente cadastrado com sucesso!", cliente: novoCliente });
});


// 📌 ATUALIZAR CLIENTE
app.put("/api/clientes/:id", (req, res) => {
    const db = JSON.parse(fs.readFileSync("./db.json"));
    const id = Number(req.params.id);

    const index = db.findIndex(c => c.id === id);
    if (index === -1) {
        return res.status(404).json({ error: "Cliente não encontrado" });
    }

    db[index] = { ...db[index], ...req.body };

    fs.writeFileSync("./db.json", JSON.stringify(db, null, 2));

    res.json({ message: "Cliente atualizado!", cliente: db[index] });
});


// 📌 EXCLUIR CLIENTE
app.delete("/api/clientes/:id", (req, res) => {
    const db = JSON.parse(fs.readFileSync("./db.json"));
    const id = Number(req.params.id);

    const novoDB = db.filter(c => c.id !== id);

    fs.writeFileSync("./db.json", JSON.stringify(novoDB, null, 2));

    res.json({ message: "Cliente removido!" });
});


// ======================================================
// 📄 LOGS – SOMENTE LEITURA
// ======================================================

// LISTAR LOGS
app.get("/api/logs", (req, res) => {
    if (!fs.existsSync("./logs.json")) {
        return res.json([]);
    }

    const logs = JSON.parse(fs.readFileSync("./logs.json"));
    res.json(logs);
});


// ======================================================
// 🚀 INICIAR SERVIDOR
// ======================================================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🌐 Dashboard rodando em http://localhost:${PORT}`);
});
