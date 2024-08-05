const mongoose = require('mongoose')
const userModel = require('./userSchema')

const ICONS_ARRAY = [
    'https://occ-0-2482-3646.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABfNXUMVXGhnCZwPI1SghnGpmUgqS_J-owMff-jig42xPF7vozQS1ge5xTgPTzH7ttfNYQXnsYs4vrMBaadh4E6RTJMVepojWqOXx.png?r=1d4',
    'https://occ-0-2482-3646.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABY5cwIbM7shRfcXmfQg98cqMqiZZ8sReZnj4y_keCAHeXmG_SoqLD8SXYistPtesdqIjcsGE-tHO8RR92n7NyxZpqcFS80YfbRFz.png?r=229',
    'https://occ-0-2482-3646.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABdi6oYb6DJb1LndQWckgaXvrqqP3QURNa8Xngiq7wwFwDtWIg1otEuYKVxbYwS9c5clAI1_Bn7DuljwcvhfUzQu2_Y2v9y5P6t_n.png?r=e6e',
    'https://occ-0-2482-3646.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABbV2URr-qEYOrESG0qnP2787XsIxWTMBh7QfJwyqYxMAVFNyiXAqFeu16gI8yTxg3kLwF2mUDKmZGfwBEDd7722xskhYwAMwsBBe.png?r=bd7',
    'https://occ-0-2482-3646.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABaJGLnhAYjYcftDWrzAZarl1ygxsOD5cqp7U3NsfhjsYea-danyRSqBXmGStUuSxIAcKQYSTJS7cOereTKbN0niQG06N9CcjdP3e.png?r=98e',
    'https://occ-0-2482-3646.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABeJjKPc0z9BbQmLlHsv4P2Bxra12hw_B3CVWH7-05P5fYFFAtDv-q-DT_8rT94empMPl0BHIv0UEeRiKZK1nG_NQwpDC8Os101f3.png?r=54c',
    'https://occ-0-2482-3646.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABWSSskpeBlxJ7GJaJjs7wvQuDUYz9oUy1S2NXON039kW6sX_vKlS6gCgSzmB1eIBoygZwDnEtl-_muUJWsq9yltBAZt8UQUcFL6m.png?r=201',
    'https://occ-0-2482-3646.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABfYxtmHOGUMSCUEDKuZqGYtH_GWBgCgUv6ZEpxCKbtT9S4NsUHDEwymTMSxq08PH32Rq-IkgS8n1umsNjpMwMo9Wwy1l29Q5m7I1.png?r=7c7',
    'https://occ-0-2482-3646.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABd3mDvVI90iOMEOuvW6g48vIgs8Uv6A8xyzJq1ljqFzBGvtWo4Y8Zh5QFARpgwZcs4qs92NiniRNgYq6mWQl81lNiNMYzyPabP8O.png?r=b39',
    'https://occ-0-2482-3646.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABQNA13q-hMGbmuhvHbTvIkxaROY7kVf4QtGMco1CDTTPDZsEbrWtZu0x2vNOnsR1tIOJ71KinrhYET2hP4n_zbeFIxR0tWJ3b7V4.png?r=6a6',
  ]



const profileSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    icon:{
        type: String,
        required: true
    },
    autoplay_next_episode:{
        type: Boolean,
        default: true,
        required: false
    },
    autoplay_previews:{
        type: Boolean,
        default: true,
        required: false
    },
    meta:{
        deletable:{
            type: Boolean,
            required: false,
            default: true
        },
        icon_history: {
            type: [String]
        }
    },
    game_handle:{
        type: String,
        required: false,
        default: ''
    }
})


const userProfileSchema = new mongoose.Schema({
    meta:{
        _index:{
            type: Number,
            required: false,
            max: 9,
            min: 0
        },
        profile_creation_available:{
            type: Boolean,
            default: true,
            required: true
        },
        user_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    },
    profiles: {
        type: [profileSchema], 
        validate: function arrayLimit(val) {
            return val.length <= 5
        }
    }
})


userProfileSchema.pre('save', async function() {
    if ( this.meta._index == null ){
        const userInstance = await userModel.findOne({ _id: this.meta.user_id })
        this.meta._index = Math.floor(Math.random() * 10)
        const icon = ICONS_ARRAY[this.meta._index]
        this.profiles = [{
            name: userInstance.email,
            icon: icon,
            meta: {
                deletable: false,
                icon_history: [icon]
            }
        }]
    }
})




const userProfileModel = mongoose.model('user_profiles', userProfileSchema)
module.exports = userProfileModel