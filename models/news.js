const mongoose = require("mongoose")

const newsSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    createdDate: {
        type: String,
        default: `${new Date(Date.now()).toDateString().substring(4)}, ${new Date(Date.now()).getHours()}:${new Date(Date.now()).getMinutes()}`
    }
})

const newsModel = mongoose.model("News", newsSchema)

module.exports = newsModel