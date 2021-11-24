const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bidSchema = new Schema({   
    bidder: {type: Schema.Types.ObjectId,ref:'User'},  
    eventid:{type:Schema.Types.ObjectId,ref:'Event'}, 
    bidAmount:{type:Number, required: [true,'bid amount is required']}          
},
{timestamps:true}
);

module.exports = mongoose.model('Bid',bidSchema);