require("./db/mongoose")
const express = require("express")
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)
const hbs = require("hbs")
const path = require("path")
const cors = require("cors")

const partialsDir = path.join(__dirname, "/templates/partials")
const viewsDir = path.join(__dirname, "/templates/views")
const publicDir = path.join(__dirname, "/public")

const app = express()
hbs.registerPartials(partialsDir)
app.set("view engine", "hbs")
app.set("views", viewsDir)
app.use(cors())
app.use(express.static(publicDir))
app.use(express.json())
app.use(session({
    secret: process.env.COOKIE_SECRET, 
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({db: session, url: process.env.DATABASE_URL}),
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    }
}))

const port = process.env.PORT || 3000;

const navRouter = require("./routers/nav")
const accountRouter = require("./routers/account")
const stocksRouter = require("./routers/stocks")
app.use(accountRouter)
app.use(stocksRouter)
app.use(navRouter)

app.listen(port, () => {
    console.log(`Listening on port ${port}.`)
})