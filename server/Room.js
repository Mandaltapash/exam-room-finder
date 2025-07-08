const RoomSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
        trim: true
    },
    shift: {
        type: String,
        required: true,
        enum: ['morning', 'afternoon', 'evening']
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