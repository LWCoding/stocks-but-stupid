const sanitizeHtml = require("sanitize-html")

const detectXSS = (req, res, next) => {
    let hasXSS = false
    Object.values(req.body).forEach((value) => {
        if (sanitizeHtml(value) != value) {
            hasXSS = true
        }
    })
    if (hasXSS) return res.status(400).send({error: "Unauthorized characters have been detected."})
    next()
}

module.exports = detectXSS