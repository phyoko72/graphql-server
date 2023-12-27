import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
    },
    password: {
        type: String,
        required: true,
    },
    friends: [{type: mongoose.Schema.ObjectId, ref: "Person"}],
})

const User = mongoose.model("User", userSchema)

export default User
