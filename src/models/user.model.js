import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        default: "user"
    },
    status: {
        type: String,
        default: "active",
    },
    sede: {
        type: String,
        enum: ["", "Nexus", "ZentraSanJose", "ZentraPlaza", "ZentraBalta"],
        default: "",
    },
}, {
    timestamps: true
})

export default mongoose.model("User", userSchema);