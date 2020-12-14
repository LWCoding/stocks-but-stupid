const express = require("express")
const auth = require("../middleware/auth")

const navRouter = express.Router()

navRouter.get("/", (req, res) => {
    res.render("homepage.hbs")
})

navRouter.get("/register", (req, res) => {
    res.render("register.hbs")
})

navRouter.get("/login", (req, res) => {
    res.render("login.hbs")
})

navRouter.get("/portfolio", auth, (req, res) => {
    res.render("portfolio.hbs")
})

navRouter.get("/rankings", (req, res) => {
    res.render("rankings.hbs")
})

navRouter.get("/account", (req, res) => {
    res.render("account.hbs")
})

navRouter.get("/market", (req, res) => {
    res.render("market.hbs")
})

navRouter.get("/news", (req, res) => {
    res.render("news.hbs")
})

navRouter.get("*", (req, res) => {
    res.render("error.hbs")
})

module.exports = navRouter