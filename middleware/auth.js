const jwt = require("jsonwebtoken")
const User = require("../models/user")

const auth = async (req, res, next) => {
    try {
        const token = req.session.token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id: decoded, token})
        if (!user) {
            throw new Error()
        }
        req.session.user = user
        next()
    } catch (error) {
        return res.status(401).redirect("/login")
    }
}

module.exports = auth