// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');

// Crea l'app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Servi i file statici dalla cartella public
app.use(express.static(path.join(__dirname, 'public')));

// Rotta principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Verifica se esiste il file messages.json, altrimenti crea un file vuoto
const messagesFilePath = path.join(__dirname, 'public', 'messages.json');
if (!fs.existsSync(path.dirname(messagesFilePath))) {
    fs.mkdirSync(path.dirname(messagesFilePath), { recursive: true });
}

if (!fs.existsSync(messagesFilePath)) {
    fs.writeFileSync(messagesFilePath, JSON.stringify([], null, 2));
    console.log('File messages.json creato con un array vuoto.');
}

// Avvia il server
app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
    console.log('Per generare messaggi da file Word, esegui "npm run generate-messages"');
});