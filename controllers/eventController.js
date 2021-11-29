//import
const model = require('../models/event');
const bid_Schema = require('../models/bid');


// controller functions
exports.index = (req,res,next) => {
    model.find()
    .then(events=>res.render('./events/events',{events}))
    .catch(err=>next(err));       
};

exports.localEvents = (req,res,next) => {
    let userCity= req.session.city;
    model.find()
    .then(localEvents=>{
        let events = [] ;
        localEvents.forEach(event=>{
            if(event.city === userCity){
                events.push(event);
            }
        });
        res.render('./events/events',{events})
    })
    .catch(err=>next(err));       
};

exports.myBids = (req,res,next) => {
    let id= req.session.userId;
    bid_Schema.find({bidder:id}).populate('eventid','title')
    .then(bids=>{
        let result=[];
        bids.forEach(bid=>{
            if(bid.status='accept')
                result.push(bid);
        })
        res.render('./events/myBids',{result})
    })
    .catch(err=>next(err));       
};

exports.new = (req,res) => {
    res.render('./events/newEvent');
};

exports.create = (req,res,next) => {
    let event = new model(req.body);
    event.host = req.session.userId;
    event.status='open';
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

exports.showBids = (req,res,next) => {
    let id = req.params.id;
    bid_Schema.find({eventid:id}).populate('bidder','firstName lastName')
    .then(bids=>{
        if(bids){
            bids.sort(function(a, b){return b.bidAmount-a.bidAmount});
            let eventStatus;
            model.findById(id)
            .then(event=>{
                return res.render('./events/bids',{bids,event});
            })
        }
    })
    .catch(err=>next(err));
};

exports.openBids = (req,res,next) => {
    let id = req.params.id;
    bid_Schema.find({eventid:id,status:'accept'})
    .then(bids=>{
        if(bids.length === 0){
            model.findById(id)
            .then(event=>{
                event.status='open';
                event.save();
                res.redirect('/events/'+id);
            })
        }else{
            req.flash('error', 'Event cannot be opened since result is already declared!');
            res.redirect('/events/'+id);
        }
    })
    .catch(err=>next(err));
};

exports.closeBids = (req,res,next) => {
    let id = req.params.id;
    model.findById(id)
    .then(event=>{
        event.status='close';
        event.save();
        res.redirect('/events/'+id);
    })
    .catch(err=>next(err));
};

exports.accept = (req,res,next) => {
    let id = req.params.id;
    bid_Schema.findById(id)
    .then(bid=>{
        if(bid){
            bid.status = 'accept';
            model.findById(bid.eventid)
            .then(event=>{
                if(event){
                    event.status='close';
                    bid.save();
                    event.save();
                    req.flash('success', 'Status has been successfully updated!');
                    res.redirect('/events/'+event.id);
                }
                else{
                    let err = new Error('Cannot find event with id '+ bid.eventid);
                    err.status = 404;
                    next(err);
                }
            })
        }
    })
    .catch(err=>next(err));
}

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
       
    bid.bidder = req.session.userId;
    bid.eventid = req.params.id;
    bid.bidAmount = req.body.bid_amount;
    
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
       
};

