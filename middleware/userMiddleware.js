const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')


dotenv.config()

const privateKey = process.env.PRIVATE_KEY


function generateJWT(id, remember_me = "false"){
    if (remember_me == "true"){ 
        return jwt.sign({ id: id }, privateKey, { expiresIn: '30d' })
    }
    return jwt.sign({ id: id }, privateKey, { expiresIn: '1d' })
}


function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization

    if (authHeader) {
        const token = authHeader.split(' ')[1]

        jwt.verify(token, privateKey, (err, user) => {
            if (err) {
                return res.status(401).send({ "detail": err.message })
            }
            req.user = user.id
            next()
        })
    } else {
        res.status(401).send({ "detail": "Unauthorized access, please login again" })
    }
}

module.exports = { generateJWT, authenticateJWT }