const mongoose = require("mongoose");

const userShema = mongoose.Schema({

Name : {
    type: String,
    require: true
},

email : {
    type: String,
    require: true
},

password : {
    type: String,
    require: true
},

isAdmin : {
    type: Boolean,
    default: false
},

likedApartments: [{
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'Room' 
}],

phone: { 
    type: String 
},

preferredLocations: {
     type: [String], 
     default: [] 
},

income: {
     type: String,
      default: '' 
},

savings: {
     type: String,
      default: '' 
},

}, {
    timestamps: true

})

const userModel = mongoose.model('users', userShema)

module.exports = userModel
