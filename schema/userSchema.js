const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        // eslint-disable-next-line no-useless-escape
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email is invalid']
    },
    password:{
        type: String,
        required: true
    },
    account_created_on:{
        type: Date,
        required: true,
        default: Date.now
    },
    last_log_in: {
        type: Date,
        required: false
    },
    subscription:{
        type:{
            type: String,
            required: false,
            enum: {
                values: ["basic", "mobile", "premium", "standard"],
                message: '{VALUE} is not a type of subscription'
            }
        },
        value:{
            type: String,
            required: false,
            validate: { 
                validator (v) {
                    switch ( this.subscription.type ){
                        case 'basic':
                            return v == "199"
                        case 'mobile':
                            return v == "149"
                        case 'premium':
                            return v == "649"
                        case 'standard':
                            return v == "499"
                        }
                    },
                message: `{VALUE} doesn't match subscription type`
            }
        }
    },
    meta:{
        profiles_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user_profiles',
            required: false
        }
    }
})


const userModel = mongoose.model('users', userSchema)
module.exports = userModel