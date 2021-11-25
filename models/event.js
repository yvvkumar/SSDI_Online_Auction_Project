const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    category:{type:String, required: [true,'category is required']},
    title:{type:String, required: [true,'title is required']},
    host: {type: Schema.Types.ObjectId,ref:'User'},
    eventDate: {type:String, required: [true,'event date is required']},
    startTime: {type:String, required: [true,'start time is required']},
    endTime: {type:String, required: [true,'end time is required']},
    address:{type:String, required: [true,'address is required']},
    city:{type:String, required: [true,'city is required']},
    details:{type:String, required: [true,'details is required'], minLength: [10,'Details should be atleast of 10 characters']},
    imageURL: { type: String, required: [true, 'image URL is required'] },
    baseAmount:{type:Number, required: [true,'bid amount is required']},
},
{timestamps:true}
);

module.exports = mongoose.model('Event',eventSchema);