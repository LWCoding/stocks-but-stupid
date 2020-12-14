const express = require("express")
const Stock = require("../models/stock")

const stocksRouter = express.Router()

stocksRouter.post("/make-stock", async (req, res) => {
    if (req.body.password !== process.env.STOCK_PASSWORD) return res.status(400).send()
    letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let code = ""
    for (let i = 0; i < 4; i++) {
        code += letters[Math.round(Math.random() * (letters.length - 1))]
    }
    categories = ["Advertising", "Agriculture", "Air Freight Services", "Air/Defense Services", "Airlines", "Aluminum", "Asset Management", "Athletics & Recreation", "Auto & Vehicle Manufacturers", "Auto Dealers & Rentals", "Auto Parts", "Beverages", "Biotech", "Chemicals", "China", "Coal", "Consumer Financial Serivces", "Consumer Goods", "Drilling", "Oil & Gas", "Services", "Broadcasters", "Casinos/Gambling", "Media Producers", "Publishing", "Radio", "Sports & Theme Parks", "Toys & Video Games", "TV & Internet Providers", "Fashion & Luxury", "Financial Marketplaces", "Financial Services", "Food Makers", "Grocery/Big Box Retailers", "Home Improvement & Goods", "Homebuilders", "Building Materials", "Equipment", "Machinery", "Manufacturing", "Metals", "Packaging", "Paper", "Services", "Textiles", "Wood", "Accident & Supplemental", "Brokers", "Life", "Property & Casualty", "Reinsurance", "Internet Services", "Investment Brokerage", "Medical Consumer Goods", "Medical Devices & Equipment", "Medical Drug Stores", "Hospitals", "Pharmaceuticals", "Midwest Regional Banks", "Gold Miners", "Silver Miners", "Education Services", "Business Services", "Staffing Services", "Industrial Services", "Restaurants", "Semiconductor & Wireless Chip Services", "Software Applications", "Business Software", "Cybersecurity Software", "Solar Power", "Steel Manufacturing", "Tobacco", "Water", "Waste Disposal", "Cruises", "Trucking Freight", "Domestic Utilies", "Foreign Utilities"]
    try {
        const stock = new Stock({
            code,
            price: (Math.random() < 0.7) ? (Math.random() * 3000 + 200).toFixed(2) : (Math.random() * 80000 + 500).toFixed(2),
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
    if (!stock) res.status(404).send({error: "Could not find stock with specified code."})
    return res.status(200).send({price: stock.price})
})

module.exports = stocksRouter