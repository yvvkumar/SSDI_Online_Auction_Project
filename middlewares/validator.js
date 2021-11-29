const Event = require('../models/event');
exports.validateId = (req,res,next)=>{
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid event id');
        err.status = 400;
        return next(err);
    }else{
        return next();
    }
}
exports.validateBidAmount = (req,res,next)=>{
    let id = req.params.id;
    Event.findById(id)
    .then(event=>{
        if(event){
            if(req.body.bid_amount >= event.baseAmount)
                return next();
            else{
                req.flash('error', 'bid amount should be greater than base amount');                
                res.redirect('/events/'+id);
            }
        }
    })
    .catch(err=>next(err));
}
exports.validateBaseAmount = (req,res,next)=>{
    let event = req.body;
    if(event.baseAmount>0)
        return next();
    else{
        req.flash('error', 'Base amount should be greater than zero');                
        res.redirect('back');
    }
}
    