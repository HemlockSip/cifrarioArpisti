// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os'); // Aggiungiamo il modulo os per ottenere l'indirizzo IP

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

// Funzione per ottenere gli indirizzi IP locali
function getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    
    for (const interfaceName in interfaces) {
        const interfaceInfo = interfaces[interfaceName];
        
        for (const iface of interfaceInfo) {
            // Ignora gli indirizzi IPv6 e quelli non-locali
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push(iface.address);
            }
        }
    }
    
    return addresses;
}

// Avvia il server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
    
    // Mostra tutti gli indirizzi IP locali
    const localIPs = getLocalIPs();
    if (localIPs.length > 0) {
        console.log('\nPuoi accedere all\'applicazione da altri dispositivi sulla stessa rete usando:');
        localIPs.forEach(ip => {
            console.log(`http://${ip}:${PORT}`);
        });
    }
    
    console.log('\nPer generare messaggi da file Word, esegui "npm run generate-messages"');
});