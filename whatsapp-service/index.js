const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const pino = require('pino');

const app = express();
app.use(cors());
app.use(express.json());

const logger = pino({ level: 'info' });

let sock = null;
let qrCode = null;
let isConnected = false;

// Store QR code in memory
let currentQR = null;

async function connectToWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info');
        const { version, isLatest } = await fetchLatestBaileysVersion();
        
        logger.info(`Using WA v${version.join('.')}, isLatest: ${isLatest}`);

        sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }),
            browser: ['Nectar ERP', 'Chrome', '1.0.0'],
            syncFullHistory: false
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                currentQR = qr;
                logger.info('QR Code generated');
                console.log('\n========================================');
                console.log('Scan this QR code with WhatsApp:');
                console.log(qr);
                console.log('========================================\n');
            }

            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                logger.info(`Connection closed. Reconnecting: ${shouldReconnect}`);
                
                if (shouldReconnect) {
                    setTimeout(connectToWhatsApp, 5000);
                } else {
                    isConnected = false;
                    currentQR = null;
                }
            } else if (connection === 'open') {
                isConnected = true;
                currentQR = null;
                logger.info('WhatsApp connected successfully!');
                console.log('\n✅ WhatsApp Business API Connected!\n');
            }
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type === 'notify') {
                for (const message of messages) {
                    if (!message.key.fromMe && message.message) {
                        logger.info(`Message received from: ${message.key.remoteJid}`);
                    }
                }
            }
        });

    } catch (error) {
        logger.error('WhatsApp initialization error:', error);
        setTimeout(connectToWhatsApp, 10000);
    }
}

// Send text message
async function sendTextMessage(phoneNumber, message) {
    try {
        if (!sock) {
            throw new Error('WhatsApp not connected');
        }

        // Format phone number
        const jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
        
        await sock.sendMessage(jid, { text: message });
        logger.info(`Message sent to: ${phoneNumber}`);
        
        return { success: true, message: 'Message sent successfully' };
    } catch (error) {
        logger.error('Error sending message:', error);
        return { success: false, error: error.message };
    }
}

// Send document (PDF, image, etc)
async function sendDocument(phoneNumber, filePath, fileName, caption = '') {
    try {
        if (!sock) {
            throw new Error('WhatsApp not connected');
        }

        const jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
        
        const fileBuffer = fs.readFileSync(filePath);
        
        await sock.sendMessage(jid, {
            document: fileBuffer,
            fileName: fileName,
            caption: caption,
            mimetype: 'application/pdf'
        });
        
        logger.info(`Document sent to: ${phoneNumber}`);
        return { success: true, message: 'Document sent successfully' };
    } catch (error) {
        logger.error('Error sending document:', error);
        return { success: false, error: error.message };
    }
}

// REST API Endpoints

// Get QR code
app.get('/qr', (req, res) => {
    try {
        if (currentQR) {
            res.json({ qr: currentQR, connected: false });
        } else if (isConnected) {
            res.json({ qr: null, connected: true, message: 'Already connected' });
        } else {
            res.json({ qr: null, connected: false, message: 'Connecting...' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get connection status
app.get('/status', (req, res) => {
    try {
        res.json({
            connected: isConnected,
            user: sock?.user || null,
            hasQR: currentQR !== null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send text message
app.post('/send-message', async (req, res) => {
    try {
        const { phone_number, message } = req.body;
        
        if (!phone_number || !message) {
            return res.status(400).json({ error: 'phone_number and message are required' });
        }

        const result = await sendTextMessage(phone_number, message);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send document
app.post('/send-document', async (req, res) => {
    try {
        const { phone_number, file_path, file_name, caption } = req.body;
        
        if (!phone_number || !file_path || !file_name) {
            return res.status(400).json({ 
                error: 'phone_number, file_path, and file_name are required' 
            });
        }

        const result = await sendDocument(phone_number, file_path, file_name, caption);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send invoice (combines message + document)
app.post('/send-invoice', async (req, res) => {
    try {
        const { 
            phone_number, 
            invoice_number,
            dealer_name,
            amount,
            due_date,
            pdf_path
        } = req.body;

        if (!phone_number || !invoice_number || !pdf_path) {
            return res.status(400).json({ 
                error: 'phone_number, invoice_number, and pdf_path are required' 
            });
        }

        // Format message
        const message = `🏢 Nectar - Invoice Generated

Hello ${dealer_name || 'Customer'},

Your invoice has been generated successfully!

📄 Invoice Details:
• Invoice Number: ${invoice_number}
• Amount: ₹${amount || 'N/A'}
• Due Date: ${due_date || 'N/A'}

Please find the invoice attached.

Thank you for your business!

For any queries, contact us.`;

        // Send message first
        const msgResult = await sendTextMessage(phone_number, message);
        
        if (!msgResult.success) {
            return res.json(msgResult);
        }

        // Wait a bit before sending document
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Send PDF document
        const docResult = await sendDocument(
            phone_number, 
            pdf_path, 
            `Invoice_${invoice_number}.pdf`,
            `Invoice ${invoice_number}`
        );

        res.json({
            success: docResult.success,
            message: 'Invoice sent successfully via WhatsApp',
            details: {
                message_sent: msgResult.success,
                document_sent: docResult.success
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Disconnect
app.post('/disconnect', async (req, res) => {
    try {
        if (sock) {
            await sock.logout();
            sock = null;
            isConnected = false;
            currentQR = null;
        }
        res.json({ success: true, message: 'Disconnected successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'whatsapp-service' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\n🚀 WhatsApp Service running on port ${PORT}`);
    console.log(`📡 API Endpoints:`);
    console.log(`   - GET  /qr            - Get QR code for authentication`);
    console.log(`   - GET  /status        - Get connection status`);
    console.log(`   - POST /send-message  - Send text message`);
    console.log(`   - POST /send-document - Send document/PDF`);
    console.log(`   - POST /send-invoice  - Send invoice with PDF`);
    console.log(`\n🔌 Connecting to WhatsApp...\n`);
    
    // Start WhatsApp connection
    connectToWhatsApp();
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n👋 Shutting down gracefully...');
    if (sock) {
        await sock.end();
    }
    process.exit(0);
});
