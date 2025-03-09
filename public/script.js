// Script principale per il Cifrario degli Arpisti

// Elementi DOM
const messageListView = document.getElementById('messageListView');
const messageList = document.getElementById('messageList');
const loadingIndicator = document.getElementById('loadingIndicator');
const noMessagesIndicator = document.getElementById('noMessagesIndicator');
const keyInputModal = document.getElementById('keyInputModal');
const keyInput = document.getElementById('keyInput');
const decryptButton = document.getElementById('decryptButton');
const decryptedMessageModal = document.getElementById('decryptedMessageModal');
const decryptedMessage = document.getElementById('decryptedMessage');
const errorMessageModal = document.getElementById('errorMessageModal');
const backToKeyInput = document.getElementById('backToKeyInput');
const backToListFromKey = document.getElementById('backToListFromKey');
const backToListFromMessage = document.getElementById('backToListFromMessage');
const backToListFromError = document.getElementById('backToListFromError');

let messages = [];
let selectedMessage = null;

// Carica i messaggi dal file JSON
async function loadMessages() {
    try {
        // Mostra l'indicatore di caricamento
        loadingIndicator.style.display = 'flex';
        noMessagesIndicator.style.display = 'none';
        
        // Carica il file JSON con i messaggi
        const response = await fetch('messages.json');
        
        if (!response.ok) {
            throw new Error(`Errore nel caricamento dei messaggi: ${response.status}`);
        }
        
        messages = await response.json();
        
        // Nascondi l'indicatore di caricamento
        loadingIndicator.style.display = 'none';
        
        // Mostra un messaggio se non ci sono messaggi disponibili
        if (messages.length === 0) {
            noMessagesIndicator.style.display = 'block';
        } else {
            populateMessageList();
        }
    } catch (error) {
        console.error('Errore durante il caricamento dei messaggi:', error);
        loadingIndicator.style.display = 'none';
        
        // In caso di errore, mostra il messaggio di nessun messaggio disponibile
        noMessagesIndicator.style.display = 'block';
        noMessagesIndicator.innerHTML = `
            <p>Impossibile caricare i messaggi.</p>
            <p>Errore: ${error.message}</p>
        `;
    }
}

// Popola la lista dei messaggi
function populateMessageList() {
    // Rimuovi il loading e no messages indicator
    loadingIndicator.style.display = 'none';
    noMessagesIndicator.style.display = 'none';
    
    // Pulisci la lista
    messageList.innerHTML = '';
    
    // Aggiungi le card dei messaggi
    messages.forEach(message => {
        const card = document.createElement('div');
        card.className = 'message-card';
        card.dataset.id = message.id;
        
        card.innerHTML = `
            <div class="message-icon">
                <img src="/api/placeholder/80/80" alt="Messaggio">
            </div>
            <div class="message-info">
                <div class="message-sender">${message.sender}</div>
                <div class="message-context">${message.context}</div>
            </div>
        `;
        
        card.addEventListener('click', () => openKeyModal(message));
        
        messageList.appendChild(card);
    });
}

// Apre il modal per l'inserimento della chiave
function openKeyModal(message) {
    selectedMessage = message;
    messageListView.style.display = 'none';
    keyInputModal.style.display = 'flex';
    keyInput.value = '';
    keyInput.focus();
}

// Torna alla lista dei messaggi
function backToList() {
    keyInputModal.style.display = 'none';
    decryptedMessageModal.style.display = 'none';
    errorMessageModal.style.display = 'none';
    messageListView.style.display = 'block';
}

// Prova a decifrare il messaggio
function decryptMessage() {
    const enteredKey = keyInput.value.trim().toLowerCase();
    
    if (enteredKey === selectedMessage.key) {
        // Chiave corretta - Pulisci ulteriormente il messaggio da eventuali metadati residui
        const cleanedMessage = cleanDecryptedMessage(selectedMessage.decrypted, enteredKey);
        decryptedMessage.textContent = cleanedMessage;
        keyInputModal.style.display = 'none';
        decryptedMessageModal.style.display = 'flex';
    } else {
        // Chiave errata
        keyInputModal.style.display = 'none';
        errorMessageModal.style.display = 'flex';
    }
}

// Imposta gli Event Listeners
function setupEventListeners() {
    decryptButton.addEventListener('click', decryptMessage);
    
    backToKeyInput.addEventListener('click', () => {
        errorMessageModal.style.display = 'none';
        keyInputModal.style.display = 'flex';
        keyInput.focus();
    });
    
    backToListFromKey.addEventListener('click', backToList);
    backToListFromMessage.addEventListener('click', backToList);
    backToListFromError.addEventListener('click', backToList);
    
    // Gestisce l'invio da tastiera
    keyInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            decryptMessage();
        }
    });
}

// Funzione per rimuovere eventuali metadati dal messaggio decifrato
function cleanMessage(message) {
    // Cerca pattern comuni di metadati come "Contesto:", "Chiave:", ecc.
    const lines = message.split('\n');
    const cleanedLines = [];
    let metadataSection = true;
    
    for (const line of lines) {
        // Se troviamo una riga vuota dopo l'intestazione, inizia la sezione del messaggio
        if (metadataSection && line.trim() === '') {
            metadataSection = false;
            continue;
        }
        
        // Se siamo già nella sezione del messaggio o se la riga non sembra un metadato
        if (!metadataSection || !(line.toLowerCase().startsWith('mittente:') || 
                                 line.toLowerCase().startsWith('contesto:') || 
                                 line.toLowerCase().startsWith('chiave:'))) {
            cleanedLines.push(line);
        }
    }
    
    return cleanedLines.join('\n').trim();
}


// Funzione per pulire il messaggio decifrato da eventuali metadati residui
function cleanDecryptedMessage(text, key) {
    // Divide il testo in righe
    let lines = text.split('\n');
    
    // Rimuovi le righe che contengono metadati conosciuti
    lines = lines.filter(line => {
        const lowerLine = line.toLowerCase().trim();
        return !(
            lowerLine.startsWith('mittente:') ||
            lowerLine.startsWith('contesto:') ||
            lowerLine.startsWith('chiave:') ||
            lowerLine === key.toLowerCase() || // Rimuovi anche righe che sono solo la chiave
            lowerLine.includes(`chiave: ${key.toLowerCase()}`) // Rimuovi righe che contengono la chiave
        );
    });
    
    // Rimuovi righe vuote all'inizio
    while (lines.length > 0 && lines[0].trim() === '') {
        lines.shift();
    }
    
    return lines.join('\n');
}

// Inizializza l'app
function init() {
    setupEventListeners();
    loadMessages();
}

// Avvia l'app quando il DOM è completamente caricato
document.addEventListener('DOMContentLoaded', init);