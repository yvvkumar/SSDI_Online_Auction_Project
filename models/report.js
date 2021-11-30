const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema({   
    isReported:{type:String, default:'no'},
    reportmessage:{type:String, default:'none'},
    reportedby:{type: Schema.Types.ObjectId,ref:'User'},
    eventid:{type:Schema.Types.ObjectId,ref:'Event'}, 
},
{timestamps:true}
);

module.exports = mongoose.model('Report',reportSchema);