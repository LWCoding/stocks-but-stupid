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
            default: `(${new Date(Date.now()).getMonth() + 1}/${new Date(Date.now()).getDate()}) ${new Date(Date.now()).getHours() % 12}:${new Date(Date.now()).getMinutes()}${new Date(Date.now()).getHours() / 12 > 0 ? "PM" : "AM"}`
        }
    }]
})

stockSchema.methods.recordCurrentStock = async function() {
    this.changes.push({
        change: this.lastChange
    })
    if (this.changes.length > 10) {
        this.changes.shift()
    }
    return
}

const stockModel = mongoose.model("Stock", stockSchema)

module.exports = stockModel