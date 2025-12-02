const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "MeuBot" // pasta única
    }),
    puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
});

client.on("qr", (qr) => {
    console.log("📲 Escaneie o QR code:");
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("🤖 Bot conectado e funcionando!");
});

client.on("authenticated", () => {
    console.log("🔑 Sessão autenticada! QR não será mais necessário.");
});

client.initialize();

module.exports = client;
