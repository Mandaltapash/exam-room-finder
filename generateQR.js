const QRCode = require('qrcode');
const os = require('os');

// Automatically get your PC's local IP address
function getLocalIP() {
    const interfaces = os.networkInterfaces();

    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            // Skip internal (loopback) and non-IPv4 addresses
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    return '192.168.1.100'; // fallback IP
}

// Generate QR Code for your index.html
async function generateQR() {
    try {
        // Get your local IP automatically
        const localIP = getLocalIP();
        const url = `http://${localIP}:5500/index.html`;

        console.log(`🌐 Your Local IP: ${localIP}`);
        console.log(`🔗 URL: ${url}`);
        console.log(`🔄 Generating QR code...`);

        // Generate QR code with phone-friendly settings
        await QRCode.toFile('qr-code.png', url, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000', // Black
                light: '#FFFFFF' // White
            },
            errorCorrectionLevel: 'M' // Medium error correction (good for phones)
        });

        console.log('✅ QR code successfully created!');
        console.log('📱 Scan with your phone to open index.html');
        console.log('📍 File saved as: qr-code.png');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('💡 Make sure you have installed: npm install qrcode');
    }
}

// Run the generator
generateQR();