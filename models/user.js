const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 10000
    },
    stocks: [{
        stockCode: {
            type: String,
            required: true
        },
        stockCount: {
            type: Number,
            required: true
        },
        stockInitial: {
            type: Number,
            required: true
        }
    }]
})

userSchema.methods.toJSON = function() {
    const user = this.toObject()
    delete user.password
    delete user.token
    delete user._id
    return user
}
    
userSchema.methods.generateAuthToken = async function() {
    const token = jwt.sign({_id: this._id.toString()}, process.env.JWT_SECRET, {expiresIn: "7 days"})
    this.token = token
    await this.save()
    return token
}

const userModel = mongoose.model("User", userSchema)

module.exports = userModel