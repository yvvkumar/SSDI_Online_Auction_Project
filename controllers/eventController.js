//import
const model = require('../models/event');
const bid_Schema = require('../models/bid');


// controller functions
exports.index = (req,res) => {
    model.find()
    .then(events=>res.render('./events/events',{events}))
    .catch(err=>next(err));       
};

exports.new = (req,res) => {
    res.render('./events/newEvent');
};

exports.create = (req,res,next) => {
    let event = new model(req.body);
    event.host = req.session.user;
    event.save() 
    .then(()=>{
        req.flash('success', 'Event has been successfully created!');
        res.redirect('/events');
    })
    .catch(err=>{
        if(err.name==='ValidationError'){
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err);
    });
};

exports.show = (req,res,next) => {
    let id = req.params.id;
    model.findById(id).populate('host','firstName lastName')
    .then(event=>{
        if(event){
            return res.render('./events/event',{event});
        }else{
            let err = new Error('Cannot find event with id '+ id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};

exports.edit = (req,res,next) => {
    let id = req.params.id;
    model.findById(id)
    .then(event=>{
        if(event){
            res.render('./events/edit',{event});
        }else{
            let err = new Error('Cannot find event with id '+ id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};

exports.update = (req,res,next) => {
    let event = req.body;
    let id = req.params.id;
    model.findByIdAndUpdate(id,event,{useFindAndModify: false, runValidators: true})
    .then(event=>{
         if(event){
            req.flash('success', 'Event has been successfully updated!');
            res.redirect('/events/'+id);
        }else{
            let err = new Error('Cannot find event with id '+ id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>{
        if(err.name==='ValidationError'){
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err)
    });
};

exports.delete = (req,res,next) => {
    let id = req.params.id;
    model.findByIdAndDelete(id,{useFindAndModify: false})
    .then(event=>{
        if(event){
            req.flash('success', 'Event has been successfully deleted!');
            res.redirect('/events');
        }else{
            let err = new Error('Cannot find event with id '+ id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err));
};
exports.bid = (req,res,next) => {
    let bid = new bid_Schema(req.body);  
    let baseAmt =  model.findById(id).select(baseAmount);    
    bid.bidder = req.session.user;
    bid.eventid = req.params.id;
    bid.bidAmount = req.body.bid_amount;
    if(req.body.bid_amount > baseAmt)
    {
    bid.save() 
    .then(()=>{
        req.flash('success', 'Bid Amount has been successfully saved');
        res.redirect('/events');
    })
    
    .catch(err=>{
        if(err.name==='ValidationError'){
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err);
    });
    }
    else
    {
        req.flash('failed', 'Bid Amount must be greater than Base Amount');
        res.redirect('/events');
    }
};

