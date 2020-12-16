const mongoose = require("mongoose")

const newsSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    createdDate: {
        type: String,
        required: true
    }
})

const newsModel = mongoose.model("News", newsSchema)

module.exports = newsModel