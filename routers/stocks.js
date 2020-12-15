const express = require("express")
const Stock = require("../models/stock")
const auth = require("../middleware/auth")
const schedule = require("node-schedule")
const mongoose = require("mongoose")

const alterStocks = async () => {
    const allStocks = await Stock.find({})
    allStocks.forEach(async (stock) => {
        if (stock.changes.length > 3) {
            let average = 0
            for (let i = 1; i < 4; i++) {
                average += parseFloat(stock.changes[stock.changes.length - i].change)
            }
            average = (average / 3).toFixed(2)
            let randomChance = Math.random()
            if (randomChance > 0.4) {
                // Vary the average slightly, 60% chance
                average = (average * (1 + (Math.random() > 0.5 ? 1 : -1) * Math.random() / 20)).toFixed(2)
            } else if (randomChance > 0.25) {
                // Add 1.5x the previous percentage to average, 15% chance
                average = average + (1.5 * stock.changes[stock.changes.length - 1].change)
            } else if (randomChance > 0.1) {
                // Subtract 1.5x the previous percentage from average, 15% chance
                average = average - (1.5 * stock.changes[stock.changes.length - 1].change)
            } else {
                // 1.8x current average, 10% chance
                average *= 1.8
            }
            average = parseFloat(average)
            stock.lastChange = average
            stock.price = (stock.price + (stock.price * (average / 100))).toFixed(2)
        } else {
            let change = 1 + (Math.random() > 0.5 ? 1 : -1) * Math.random() / 30
            stock.lastChange = ((change - 1) * 100).toFixed(2)
            stock.price = (stock.price * change).toFixed(2)
        }
        await stock.recordCurrentStock()
        await stock.save()
    })
}

schedule.scheduleJob("*/15 * * * *", function() {
    alterStocks()
})

const stocksRouter = express.Router()

stocksRouter.post("/make-stock", async (req, res) => {
    if (req.body.password !== process.env.STOCK_PASSWORD) return res.status(400).send()
    letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let code = ""
    for (let i = 0; i < 4; i++) {
        code += letters[Math.round(Math.random() * (letters.length - 1))]
    }
    categories = ["Advertising", "Agriculture", "Air Freight Services", "Air/Defense Services", "Airlines", "Aluminum", "Asset Management", "Athletics & Recreation", "Auto & Vehicle Manufacturers", "Auto Dealers & Rentals", "Auto Parts", "Beverages", "Biotech", "Chemicals", "China & Glassware", "Coal", "Consumer Financial Services", "Consumer Goods", "Drilling", "Oil & Gas", "Services", "Broadcasters", "Casinos/Gambling", "Media Producers", "Publishing", "Radio", "Sports & Theme Parks", "Toys & Video Games", "TV & Internet Providers", "Fashion & Luxury", "Financial Marketplaces", "Financial Services", "Food Makers", "Grocery/Big Box Retailers", "Home Improvement & Goods", "Homebuilders", "Building Materials", "Equipment", "Machinery", "Manufacturing", "Metals", "Packaging", "Paper", "Services", "Textiles", "Wood", "Accident & Supplemental", "Brokers", "Property & Casualty", "Reinsurance", "Internet Services", "Investment Brokerage", "Medical Consumer Goods", "Medical Devices & Equipment", "Medical Drug Stores", "Hospitals", "Pharmaceuticals", "Midwest Regional Banks", "Gold Miners", "Silver Miners", "Education Services", "Business Services", "Staffing Services", "Industrial Services", "Restaurants", "Semiconductor & Wireless Chip Services", "Software Applications", "Business Software", "Cybersecurity Software", "Solar Power", "Steel Manufacturing", "Tobacco", "Water", "Waste Disposal", "Cruises", "Trucking Freight", "Domestic Utilies", "Foreign Utilities"]
    try {
        const stock = new Stock({
            code,
            price: (Math.random() < 0.7) ? (Math.random() * 4000 + 200).toFixed(2) : (Math.random() * 60000 + 500).toFixed(2),
            lastChange: (Math.random() * 4 - 2).toFixed(2),
            category: categories[Math.round(Math.random() * (categories.length - 1))]
        })
        await stock.recordCurrentStock()
        await stock.save()
    } catch(error) {
        return res.status(400).send({error: "Tried to randomize a stock that already existed."})
    }
    return res.status(200).send()
})

stocksRouter.post("/purchase-stock", auth, async (req, res) => {
    if (!req.body.code) return res.status(400).send({error: "Code was not specified when purchasing stock!"})
    if (!req.body.count) return res.status(400).send({error: "Count of stock was not provided!"})
    if (req.body.count <= 0 || req.body.count > 100) return res.status(400).send({error: "Invalid stock amount provided!"})
    const stock = await Stock.findOne({ code: req.body.code })
    if (!stock) {
        return res.status(400).send({error: "Specified stock code was not found!"})
    }
    let exists = false
    for (let i = 0; i < req.session.user.stocks.length; i++) {
        let userStock = req.session.user.stocks[i]
        if (userStock.stockCode === req.body.code) {
            userStock.stockCount += parseInt(req.body.count)
            exists = true
            break
        }
    }
    if (!exists || req.session.user.stocks.length === 0) {
        req.session.user.stocks.push({
            stockCode: req.body.code,
            stockCount: req.body.count,
            stockInitial: stock.price
        })
    }
    await req.session.user.save()
    return res.status(200).send()
})

stocksRouter.post("/sell-stock", auth, async (req, res) => {
    if (!req.body.code) return res.status(400).send({error: "Code was not specified when selling stock!"})
    if (!req.body.count) return res.status(400).send({error: "Count of stock was not provided!"})
    if (req.body.count <= 0) return res.status(400).send({error: "Invalid stock amount provided!"})
    const stock = await Stock.findOne({ code: req.body.code })
    if (!stock) {
        return res.status(400).send({error: "Specified stock code was not found!"})
    }
    let netMoney = 0
    let newList = []
    for (let i = 0; i < req.session.user.stocks.length; i++) {
        let userStock = req.session.user.stocks[i]
        if (userStock.stockCode === req.body.code) {
            let limit = (req.body.count > userStock.stockCount) ? userStock.stockCount : req.body.count
            netMoney = (stock.price - userStock.stockInitial) * limit
            userStock.stockCount -= limit
            req.session.user.balance += netMoney
        } else {
            newList.push({
                _id: new mongoose.Types.ObjectId,
                stockCode: userStock.stockCode,
                stockCount: userStock.stockCount,
                stockInitial: userStock.stockInitial
            })
        }
        if (i == req.session.user.stocks.length - 1) {
            req.session.user.stocks = newList
        }
    }
    await req.session.user.save()
    return res.status(200).send({moneyMade: netMoney})
})

stocksRouter.post("/delete-stock", async (req, res) => {
    if (req.body.password !== process.env.STOCK_PASSWORD) return res.status(400).send()
    await Stock.findOneAndDelete({ code: req.body.code })
    return res.status(200).send()
})

stocksRouter.get("/stocks", async (req, res) => {
    if (!req.query.skip || !req.query.limit) return res.status(400).send({error: "Invalid request."})
    const allStocks = await Stock.find({}).skip(parseInt(req.query.skip)).limit(parseInt(req.query.limit) + 1)
    const stocks = []
    for (let i = 0; i < allStocks.length - (allStocks.length > req.query.limit); i++) {
        stocks.push({
            code: allStocks[i].code,
            price: allStocks[i].price,
            change: allStocks[i].lastChange,
            category: allStocks[i].category
        })
    }
    return res.status(200).send({stocks, hasMore: allStocks.length > req.query.limit})
})

stocksRouter.post("/worth", async (req, res) => {
    const stock = await Stock.findOne({ code: req.body.code })
    return res.status(200).send({
        exists: stock !== null, 
        price: (stock === null) ? 0 : stock.price, 
        change: (stock === null) ? 0 : stock.lastChange, 
        category: (stock === null) ? "None" : stock.category
    })
})

module.exports = stocksRouter