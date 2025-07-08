const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const csv = require('csv-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const Room = require('./Room');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = 'examroomfinder123';

mongoose.connect('mongodb+srv://tapashmandal26145@admin: tapashmandal26145 @cluster0.rvvsjew.mongodb.net / exam - room - db ? retryWrites = true & w = majority & appName = Cluster0 ', {
useNewUrlParser : true,
useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Error:", err));

app.use(cors());
app.use(bodyParser.json());

// ✅ Room Info Route (MongoDB based)
app.post('/get-room', async(req, res) => {
    const { subject, shift, roll } = req.body;
    try {
        const match = await Room.findOne({ subject, shift, roll: parseInt(roll) });
        if (match) {
            res.json({ room: match.room, building: match.building, floor: match.floor });
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Upload New CSV File (store to MongoDB)
app.post('/upload-csv', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
    const rooms = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            const start = parseInt(row.roll_start);
            const end = parseInt(row.roll_end);
            for (let i = start; i <= end; i++) {
                rooms.push({
                    subject: row.subject,
                    shift: row.shift,
                    roll: i,
                    room: row.room,
                    building: row.building,
                    floor: row.floor
                });
            }
        })
        .on('end', async() => {
            try {
                await Room.deleteMany({});
                await Room.insertMany(rooms);
                res.send('✅ CSV uploaded and saved to MongoDB!');
            } catch (err) {
                console.error(err);
                res.status(500).send('❌ Failed to store in MongoDB');
            }
        });
});

// ✅ Reset All Data
app.post('/reset-data', async(req, res) => {
    try {
        await Room.deleteMany({});
        res.send('✅ All room data cleared from MongoDB');
    } catch (err) {
        console.error(err);
        res.status(500).send('❌ Failed to reset data');
    }
});

// ✅ Health check
app.get('/health', (req, res) => {
    res.send('OK');
});

// 🔒 In-memory user list
const users = [];

// ✅ Register Route
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'User already exists' });
    }
    users.push({ username, password });
    res.json({ message: 'User registered successfully' });
});

// ✅ Login Route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
});

// ✅ Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});