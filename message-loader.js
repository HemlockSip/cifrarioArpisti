// message-loader.js
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

// Cartella contenente i file Word
const MESSAGES_DIR = './messages';
// File di output per i messaggi JSON
const OUTPUT_FILE = './public/messages.json';

// Chiavi di cifratura disponibili
const CIPHER_KEYS = [
    'arpisti', 'harpers', 'mystra', 'torm', 'elminster', 
    'selune', 'drizzt', 'faerun', 'orcbane', 'waterdeep',
    'volo', 'laeral', 'blackstaff', 'alustriel'
];

// Funzione per generare un testo "cifrato" (solo a scopo di visualizzazione)
function generateEncryptedText(text) {
    // Questa è una semplice sostituzione di caratteri per simulare un testo cifrato
    // Non è una vera cifratura, solo per effetto visivo
    const substitution = {
        'a': 'k', 'b': 'f', 'c': 'm', 'd': 'n', 'e': 'o', 'f': 'p', 'g': 'q', 
        'h': 'r', 'i': 's', 'j': 't', 'k': 'u', 'l': 'v', 'm': 'w', 'n': 'x', 
        'o': 'y', 'p': 'z', 'q': 'a', 'r': 'b', 's': 'c', 't': 'd', 'u': 'e', 
        'v': 'g', 'w': 'h', 'x': 'i', 'y': 'j', 'z': 'l',
        ' ': ' ', '.': '.', ',': ',', '!': '!', '?': '?'
    };
    
    return text.toLowerCase().split('').map(char => 
        substitution[char] || char
    ).join('');
}

// Funzione per leggere e processare un singolo file Word
async function processWordFile(filePath, fileName) {
    try {
        // Estrai il contenuto testuale dal file Word
        const result = await mammoth.extractRawText({ path: filePath });
        const content = result.value.trim();
        
        // Dividi il contenuto in base alle righe vuote
        const sections = content.split(/\n\s*\n/);
        
        // Assicurati che ci siano almeno due sezioni (mittente/contesto e messaggio)
        if (sections.length < 2) {
            console.error(`Errore: il file ${fileName} non ha il formato corretto.`);
            return null;
        }
        
        // Estrai le informazioni dal contenuto
        const headerInfo = sections[0].split('\n');
        const messageContent = sections[1].trim();
        
        // Estrai mittente e contesto (presupponendo che siano nella prima sezione)
        let sender = 'Mittente Sconosciuto';
        let context = 'Origine sconosciuta';
        
        headerInfo.forEach(line => {
            if (line.toLowerCase().startsWith('mittente:')) {
                sender = `Mittente ${line.substring('mittente:'.length).trim()}`;
            } else if (line.toLowerCase().startsWith('contesto:')) {
                context = line.substring('contesto:'.length).trim();
            }
        });
        
        // Genera una chiave casuale dall'array delle chiavi disponibili
        const key = CIPHER_KEYS[Math.floor(Math.random() * CIPHER_KEYS.length)];
        
        // Genera un testo cifrato per la visualizzazione
        const encrypted = generateEncryptedText(messageContent);
        
        // Crea l'oggetto messaggio
        return {
            id: path.basename(fileName, '.docx'), // Usa il nome del file (senza estensione) come ID
            sender,
            context,
            encrypted,
            decrypted: messageContent,
            key
        };
    } catch (error) {
        console.error(`Errore nel processare il file ${fileName}:`, error);
        return null;
    }
}

// Funzione principale per processare tutti i file nella cartella
async function processAllMessages() {
    try {
        // Crea la cartella dei messaggi se non esiste
        if (!fs.existsSync(MESSAGES_DIR)) {
            fs.mkdirSync(MESSAGES_DIR, { recursive: true });
            console.log(`Cartella ${MESSAGES_DIR} creata.`);
            console.log('Inserisci i tuoi file Word in questa cartella e riesegui lo script.');
            return;
        }
        
        // Leggi tutti i file nella cartella dei messaggi
        const files = fs.readdirSync(MESSAGES_DIR)
            .filter(file => file.endsWith('.docx')); // Filtra solo i file .docx
        
        if (files.length === 0) {
            console.log(`Nessun file Word (.docx) trovato nella cartella ${MESSAGES_DIR}.`);
            return;
        }
        
        console.log(`Trovati ${files.length} file Word da processare...`);
        
        // Processa ogni file e raccogli i risultati
        const messagePromises = files.map((file, index) => {
            const filePath = path.join(MESSAGES_DIR, file);
            return processWordFile(filePath, file)
                .then(message => {
                    if (message) {
                        // Assegna un ID progressivo
                        message.id = index + 1;
                        console.log(`Processato: ${file} -> ${message.sender}`);
                    }
                    return message;
                });
        });
        
        // Attendi che tutti i file siano processati
        let messages = await Promise.all(messagePromises);
        
        // Filtra eventuali errori (null)
        messages = messages.filter(msg => msg !== null);
        
        // Assicurati che la cartella di output esista
        const outputDir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Scrivi i messaggi nel file JSON
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(messages, null, 2));
        
        console.log(`${messages.length} messaggi salvati in ${OUTPUT_FILE}`);
        console.log('Processo completato con successo!');
        
    } catch (error) {
        console.error('Errore durante il processo:', error);
    }
}

// Esegui la funzione principale
processAllMessages();