const express = require('express')
const router = express.Router()
const userModel = require('../schema/userSchema')
const userMiddleware = require('../middleware/userMiddleware')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const userProfileModel= require('../schema/userProfilesSchema')

dotenv.config()

const saltSize = process.env.SALT_SIZE

router.get('/login', async(req, res) => {
    if ( req.session.user ) {
        res.status(200).send({ 
            "user": req.session.user,
            "jwt": req.session.jwt
        })
    } 
    else {
        res.status(401).send();
    }
})

router.post('/login', async(req, res) => {
    const userData = req.body
    const userCreds = {
        email: userData.email,
        password: userData.password,
        remember_me: userData.remember_me
    }

    if (!userCreds.email || userCreds.email===""){
        res.status(400).send({"detail": "Mandatory Field email missing"})
        return 
    }

    if (!userCreds.password || userCreds.password===""){
        res.status(400).send({"detail": "Mandatory Field password missing"})
        return 
    }

    const user = await userModel
        .findOne({email: userCreds.email})
        .exec()
    
    if (!user || (! await bcrypt.compare(userCreds.password, user.password))){
        res.status(401).send({"detail":"Invalid Credentials"})
        return 
    }

    try{
        const jwtToken = userMiddleware.generateJWT(user.id, userCreds.remember_me)
        user.last_log_in = Date.now()
        await user.save()
        user.password = undefined

        if ( userCreds.remember_me == "true" ) {
            req.session.user = user
            req.session.jwt = jwtToken
        }
        
        res.status(200).send({
            "user": user, 
            "jwtToken": jwtToken
        })
    }
    catch(err){
        res.status(401).send({ "detail": err.message })
    }
})


router.post('/signup', async(req, res) =>{
    const userData = req.body
    const userCreds = {
        email: userData.email,
        password: userData.password     
    }

    if (!userCreds.email || userCreds.email===""){
        res.status(400).send({"detail": "Mandatory Field email missing"})
        return 
    }

    if (!userCreds.password || userCreds.password===""){
        res.status(400).send({"detail": "Mandatory Field password missing"})
        return 
    }
    
    const found = await userModel
        .findOne({email: userCreds.email})
        .exec()
    
    if (found != null){
        res.status(409).send({ "detail":"User Already Exists" }) // status code for conflict 
        return 
    }

    try{
        const salt = await bcrypt.genSalt(parseInt(saltSize))
        const hashedPwd = await bcrypt.hash(userCreds.password, salt)
        userCreds.password = hashedPwd
        const newUser = new userModel(userCreds)
        await newUser.save()
        const userprofile = new userProfileModel({
            meta:{user_id: newUser._id}
        })
        await userprofile.save()
        newUser.meta.profiles_id = userprofile._id
        newUser.save()
        const jwtToken = userMiddleware.generateJWT(newUser.id)
        res.status(201).send({
            "jwtToken": jwtToken
        })
    }
    catch (err){
        res.status(401).send({ "detail": err.message }) // error cases to be discussed
    }
})


router.post('/checkuser', async(req, res) =>{
    const userData = req.body
    const userCreds = {
        email : userData.email
    }

    const found = await userModel
        .findOne({email: userCreds.email})
        .exec()
    

    if (found === null){
        res.status(202).send({ "detail":"User not found" })
        return 
    }

    res.status(200).send({ "detail":"User Exists" })
})


router.post('/set-subscription', userMiddleware.authenticateJWT, async(req, res) =>{
    const userId = req.user
    const subData = req.body
    const userDetails = {
        subscription: subData.subscription,
        id: userId
    }

    if (!mongoose.Types.ObjectId.isValid(userDetails.id)){
        res.status(400).send({ "detail":"Invalid ID" })
        return 
    }
    
    const user = await userModel
        .findOne({ _id: userDetails.id })
        .exec()
    
    if (user === null){
        res.status(404).send({ "detail":"User Not Found" })
        return 
        
    }
    try{
        user.subscription.type = userDetails.subscription.type
        user.subscription.value = userDetails.subscription.value
        await user.save()
        res.status(200).send({ "detail":"Subscription details added successfully" }) 
    }
    catch(err){
        res.status(401).send({ "detail": err.message })
    }
    
})

router.get('/logout', (req, res) => {
    req.session.destroy()
    res.status(200).send("Logged out successfully")
});


module.exports = router