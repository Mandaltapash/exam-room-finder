const mongoose = require('mongoose'); // 👈 ye line add karo

const RoomSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
        trim: true
    },
    shift: {
        type: String,
        required: true,
        enum: ['Morning', 'Afternoon', 'Evening']
    },
    roll: {
        type: Number,
        required: true
    },
    room: {
        type: String,
        required: true
    },
    building: {
        type: String,
        required: true
    },
    floor: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Room', RoomSchema); // 👈 ye bhi add karo