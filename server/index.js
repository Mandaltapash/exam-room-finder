const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const csv = require('csv-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

let roomData = [];

// Load CSV file on server start
function loadCSVData() {
    roomData = [];
    fs.createReadStream(__dirname + '/../example.csv')
        .pipe(csv())
        .on('data', (row) => {
            const start = parseInt(row.roll_start);
            const end = parseInt(row.roll_end);
            for (let i = start; i <= end; i++) {
                roomData.push({
                    key: `${row.subject}_${row.shift}_${i}`,
                    room: row.room,
                    building: row.building,
                    floor: row.floor
                });
            }
        })
        .on('end', () => {
            console.log('CSV data loaded.');
        });
}

// Route: Get room info
app.post('/get-room', (req, res) => {
    const { subject, shift, roll } = req.body;
    const key = `${subject}_${shift}_${roll}`;
    const match = roomData.find(entry => entry.key === key);
    if (match) {
        res.json({
            room: match.room,
            building: match.building,
            floor: match.floor
        });
    } else {
        res.status(404).json({ message: 'Room not found' });
    }
});

// Route: Upload new CSV file
app.post('/upload-csv', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
    roomData = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            const start = parseInt(row.roll_start);
            const end = parseInt(row.roll_end);
            for (let i = start; i <= end; i++) {
                roomData.push({
                    key: `${row.subject}_${row.shift}_${i}`,
                    room: row.room,
                    building: row.building,
                    floor: row.floor
                });
            }
        })
        .on('end', () => {
            res.send('CSV uploaded and data loaded successfully!');
        })
        .on('error', () => {
            res.status(500).send('Error reading CSV file');
        });
});

// ✅ Route: Reset all data
app.post('/reset-data', (req, res) => {
    roomData = [];
    res.send('All room data has been cleared.');
});

// Start the server
loadCSVData();
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});