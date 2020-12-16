const express = require("express")
const Stock = require("../models/stock")
const News = require("../models/news")
const auth = require("../middleware/auth")
const schedule = require("node-schedule")
const mongoose = require("mongoose")
const positiveTitleGenerator = ["Breaking news! Economy in the '<>' sector is booming!",
                                "Latest advancements in technology made in the '<>' sector; critics predict large increase in stocks.",
                                "Recent rise in purchases regarding '<>'! Professionals are left baffled!",
                                "Increase in productivity in '<>' mandatory to meet growing consumer demand!",
                                "Famous celebrity endorses specific '<>' brand; people are left wanting more!",
                                "'<>' suddenly becoming more optimal for solving new arising problems; sector estimated to explode!",
                                "Rapid financial increase in the '<>' sector-- researchers are still determining the cause!"]
const negativeTitleGenerator = ["Prices are clearly starting to suffer in the '<>' sector-- what can we do?",
                                "Overproduction in the '<>' sector leading to low consumer demand; stock prices falling!",
                                "'<>' starting to lower in intensity over the years. Will it be a future fad?",
                                "Surprising drop in demand regarding products in the '<>' sector! Researchers are stunned!",
                                "You won't believe this massive decline in the '<>' industry!",
                                "Stocks are dropping IMMENSELY in the '<>' sector! You won't believe your eyes when you look at the stats!",
                                "'<>' sector growth in neighboring countries leads to declining consumer demand in the area!"]

const categories = ["Advertising", "Agriculture", "Airlines", "Aluminum", "Athletics & Recreation", "Auto & Vehicle Manufacturers", "Biotech", "Chemicals", "China & Glassware", "Oil & Gas", "Broadcasters", "Casinos/Gambling", "Media Producers", "Publishing", "Sports & Theme Parks", "Toys & Video Games", "TV & Internet Providers", "Fashion & Luxury", "Financial Marketplaces", "Grocery/Big Box Retailers", "Homebuilders", "Building Materials", "Manufacturing", "Metals", "Property & Casualty", "Investment Brokerage", "Medical Devices & Equipment", "Banks", "Restaurants", "Business Software", "Cybersecurity Software", "Solar Power", "Water", "Waste Disposal"]

const alterStocks = async () => {
    const allStocks = await Stock.find({})
    allStocks.forEach(async (stock) => {
        if (stock.changes.length > 3) {
            let average = 0;
            for (let i = 1; i < 4; i++) {
                average += parseFloat(stock.changes[stock.changes.length - i].change)
            }
            average = (average / 3)
            let randomChance = Math.random()
            if (randomChance > 0.55) {
                // Vary the average slightly, 45% chance
                average = (average * (1 + (Math.random() > 0.5 ? 1 : -1) * Math.random() / 20) + (Math.random() - 0.5)).toFixed(2)
            } else if (randomChance > 0.35) {
                // 0.1-0.3% decrease to current average, 20% chance
                average -= 0.2 + Math.random() / 5 - 0.1
            } else if (randomChance > 0.2) {
                // Cut the average in half and decrease/increase by 0.1-0.2% average, 15% chance
                average /= 2
                if (average > 0) {
                    average -= 0.15 + Math.random() / 10 - 0.05
                } else {
                    average += 0.15 + Math.random() / 10 - 0.05
                }
            } else {
                // 0.1-0.3% increase to current average, 20% chance
                average += 0.2 + Math.random() / 5 - 0.1
            }
            average = parseFloat(average)
            if (stock.eventRotations > 0) {
                --stock.eventRotations;
                // eventBoost will be amount of added % (Ex: 0.01 to 0.3)
                average += parseFloat(stock.eventBoost) * (Math.random() + 0.5)
            }
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

const newsHeadline = async () => {
    const allNews = await News.find({})
    if (allNews.length > 8) {
        await News.findOneAndDelete({_id: allNews[0]._id})
    }
    let affectAllCategories = (Math.random() > 0.9) ? true : false;
    let isPositive = (Math.random() > 0.5) ? true : false;
    let category = categories[Math.round(Math.random() * (categories.length - 1))]
    const stocks = await Stock.find({})
    stocks.forEach(async (stock) => {
        if (stock.category === category || affectAllCategories) {
            stock.eventRotations = Math.round(Math.random() * 4 + 2)
            stock.eventBoost = ((isPositive ? 1 : -1) * (Math.random() / 4 + 0.2)).toFixed(2)
            await stock.save()
        }
    })
    let title = ""
    if (affectAllCategories) {
        title = (isPositive) ? "Investment in all sectors increasing rapidly after new economy supplements implemented by government!" : "Stock market crash currently affecting all sectors and industries! Citizens panic about financial issues!"
    } else {
        title = (isPositive) ? positiveTitleGenerator[Math.round(Math.random() * (positiveTitleGenerator.length - 1))].replace("<>", category) : negativeTitleGenerator[Math.round(Math.random() * (negativeTitleGenerator.length - 1))].replace("<>", category)
    }
    let curr = new Date(Date.now())
    const news = new News({
        title,
        createdDate: `${curr.toDateString().substring(4)}, ${curr.getHours() < 10 ? "0" : ""}${curr.getHours()}:${curr.getMinutes() < 10 ? "0" : ""}${curr.getMinutes()}`
    })
    await news.save()
}

schedule.scheduleJob("*/15 * * * *", function() {
    alterStocks()
})

schedule.scheduleJob("0 * * * *", function() {
    newsHeadline()
})

const stocksRouter = express.Router()

stocksRouter.post("/get-news", async (req, res) => {
    let allNews = await News.find({})
    allNews.reverse()
    allNews = allNews.map(news => {
        return {
            title: news.title,
            description: news.description,
            date: news.createdDate
        }
    })
    return res.send({news: allNews})
})

stocksRouter.post("/make-news", async (req, res) => {
    if (req.body.password !== process.env.STOCK_PASSWORD) return res.status(400).send()
    await newsHeadline()
    return res.status(200).send()
})

stocksRouter.post("/trigger-stocks", async (req, res) => {
    if (req.body.password !== process.env.STOCK_PASSWORD) return res.status(400).send()
    await alterStocks()
    return res.status(200).send()
})

stocksRouter.post("/make-stock", async (req, res) => {
    if (req.body.password !== process.env.STOCK_PASSWORD) return res.status(400).send()
    letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let code = ""
    for (let i = 0; i < 4; i++) {
        code += letters[Math.round(Math.random() * (letters.length - 1))]
    }
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
    if (stock.price * parseInt(req.body.count) > req.session.user.balance) {
        return res.status(400).send({error: "Not enough funds to buy those stocks!"})
    }
    req.session.user.balance -= parseInt(stock.price) * parseInt(req.body.count)
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
            _id: new mongoose.Types.ObjectId,
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
    let newList = []
    for (let i = 0; i < req.session.user.stocks.length; i++) {
        let userStock = req.session.user.stocks[i]
        let limit = (req.body.count > userStock.stockCount) ? userStock.stockCount : parseInt(req.body.count)
        if (userStock.stockCode === req.body.code && limit == userStock.stockCount) {
            userStock.stockCount -= limit
            req.session.user.balance += stock.price * limit
        } else {
            if (userStock.stockCode === req.body.code) {
                req.session.user.balance += stock.price * limit
                newList.push({
                    _id: new mongoose.Types.ObjectId,
                    stockCode: userStock.stockCode,
                    stockCount: userStock.stockCount - parseInt(limit),
                    stockInitial: userStock.stockInitial
                })
            } else {
                newList.push({
                    _id: new mongoose.Types.ObjectId,
                    stockCode: userStock.stockCode,
                    stockCount: userStock.stockCount,
                    stockInitial: userStock.stockInitial
                })
            }
        }
        if (i == req.session.user.stocks.length - 1) {
            req.session.user.stocks = newList
        }
    }
    await req.session.user.save()
    return res.status(200).send()
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
    const correctChanges = (stock === null) ? [] : stock.changes.map((x) => {
        return {
            change: x.change.toFixed(2),
            date: x.date
        }
    })
    return res.status(200).send({
        exists: stock !== null, 
        price: (stock === null) ? 0 : stock.price, 
        change: (stock === null) ? 0 : stock.lastChange, 
        category: (stock === null) ? "None" : stock.category,
        changes: (stock === null) ? [] : correctChanges
    })
})

module.exports = stocksRouter