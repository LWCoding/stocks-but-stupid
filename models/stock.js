const mongoose = require("mongoose")

const stockSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },
    lastChange: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: true
    },
    changes: [{
        change: {
            type: Number,
            required: true
        },
        date: {
            type: String,
            default: new Date(Date.now()).toDateString().substring(4)
        }
    }]
})

stockSchema.methods.recordCurrentStock = async function() {
    this.changes.push({
        change: this.lastChange
    })
}

const stockModel = mongoose.model("Stock", stockSchema)

module.exports = stockModel