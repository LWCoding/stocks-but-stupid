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
    eventBoost: {
        type: Number,
        default: 0
    },
    eventRotations: {
        type: Number,
        default: 0
    },
    changes: [{
        change: {
            type: Number,
            required: true
        },
        date: {
            type: String,
            required: true
        }
    }]
})

stockSchema.methods.recordCurrentStock = async function() {
    this.changes.push({
        change: this.lastChange,
        date: `(${new Date(Date.now()).getMonth() + 1}/${new Date(Date.now()).getDate()}) ${new Date(Date.now()).getHours()}:${new Date(Date.now()).getMinutes()}`
    })
    if (this.changes.length > 10) {
        this.changes.shift()
    }
    return
}

const stockModel = mongoose.model("Stock", stockSchema)

module.exports = stockModel