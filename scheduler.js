const fs = require("fs");
const client = require("./bot");

// ---------------------
// Função de leitura segura
// ---------------------
function lerJSONSeguro(caminho) {
    try {
        if (!fs.existsSync(caminho)) {
            fs.writeFileSync(caminho, "[]");
            return [];
        }

        const conteudo = fs.readFileSync(caminho, "utf8").trim();

        if (conteudo === "") {
            fs.writeFileSync(caminho, "[]");
            return [];
        }

        return JSON.parse(conteudo);

    } catch (e) {
        console.log(`⚠ Arquivo corrompido (${caminho}). Recriando...`);
        fs.writeFileSync(caminho, "[]");
        return [];
    }
}

// ---------------------
// Enviar cobrança
// ---------------------
function enviarCobranca(cliente) {
    const msg =
        `Olá ${cliente.nome}! 👋\n\n` +
        `Este é o lembrete automático da sua cobrança mensal.\n` +
        `💰 Valor: R$ ${cliente.valor}\n` +
        `📅 Vencimento: dia ${cliente.diaCobranca}\n\n` +
        `Se já realizou o pagamento, desconsidere.`;

    return client.sendMessage(`${cliente.whatsapp}@c.us`, msg);
}

// ---------------------
// Salvar DB
// ---------------------
function salvarBD(db) {
    fs.writeFileSync("./db.json", JSON.stringify(db, null, 2));
}

// ---------------------
// Registrar log
// ---------------------
function registrarLog(log) {
    let logs = lerJSONSeguro("./logs.json"); // <-- seguro
    logs.push(log);
    fs.writeFileSync("./logs.json", JSON.stringify(logs, null, 2));
}

// ---------------------
// Agendador principal
// ---------------------
setInterval(() => {

    const hoje = new Date();
    const diaAtual = hoje.getDate();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    let db = lerJSONSeguro("./db.json"); // <-- seguro

    db.forEach((cliente) => {
        if (cliente.diaCobranca == diaAtual) {

            const ultima = cliente.ultimaCobranca
                ? new Date(cliente.ultimaCobranca)
                : null;

            // Evitar duplicar no mesmo mês
            if (!ultima ||
                ultima.getMonth() + 1 !== mesAtual ||
                ultima.getFullYear() !== anoAtual
            ) {

                enviarCobranca(cliente).then(() => {

                    cliente.ultimaCobranca = `${anoAtual}-${mesAtual}-${diaAtual}`;

                    registrarLog({
                        cliente: cliente.nome,
                        numero: cliente.whatsapp,
                        data: new Date().toISOString()
                    });

                    salvarBD(db);

                    console.log(`✔ Cobrança enviada para ${cliente.nome}`);
                });
            }
        }
    });

}, 1000 * 60); // a cada 1 minuto

console.log("⏱ AGENDAMENTO INICIADO…");
