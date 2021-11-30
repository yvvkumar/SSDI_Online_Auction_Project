//import
const model = require('../models/event');
const bid_Schema = require('../models/bid');
const report_Schema = require('../models/report');

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
        console.log(bids);
        let result=[];
        bids.forEach(bid=>{
            if(bid.status==='accept')
                result.push(bid);
        })
        console.log(result);
        res.render('./events/myBids',{result});
    })
    .catch(err=>next(err));       
};

exports.new = (req,res) => {
    res.render('./events/newEvent');
};

exports.create = (req,res,next) => {
    let event = new model(req.body);
    event.host = req.session.userId;
    event.status='close';
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
            let baseEnable = true;
            bid_Schema.find({eventid:id})
            .then(bids=>{
                if(bids.length>0)
                    baseEnable=false;
                res.render('./events/edit',{event,baseEnable});
            })
            .catch(err=>next(err));
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

exports.removeEvent = (req,res,next) => {
    let id = req.params.id;
    let results = true;
    Promise.resolve()
    .then(()=>{
        report_Schema.deleteMany({eventid:id})
        .then(result=>{
            if(!result)
                results=false;
        })
        .catch(err=>next(err));
    })
    .then(()=>{
        bid_Schema.deleteMany({eventid:id})
        .then(result=>{
            if(!result)
                results=false;
        })
        .catch(err=>next(err));
    })
    .then(()=>{
        model.findByIdAndDelete(id,{useFindAndModify: false})
        .then(result=>{
            if(!result)
                results=false;
        })
        .catch(err=>next(err));
    })
    .catch(err=>next(err));
    if(results){
        req.flash('success', 'Event has been successfully deleted!');
        res.redirect('back');
    }else{
        let err = new Error('Cannot find event with id '+ id);
        err.status = 404;
        next(err);
    }
}

exports.delete = (req,res,next) => {
    let id = req.params.id;
    let results = true;
    Promise.resolve()
    .then(()=>{
        report_Schema.deleteMany({eventid:id})
        .then(result=>{
            if(!result)
                results=false;
        })
        .catch(err=>next(err));
    })
    .then(()=>{
        bid_Schema.deleteMany({eventid:id})
        .then(result=>{
            if(!result)
                results=false;
        })
        .catch(err=>next(err));
    })
    .then(()=>{
        model.findByIdAndDelete(id,{useFindAndModify: false})
        .then(result=>{
            if(!result)
                results=false;
        })
        .catch(err=>next(err));
    })
    .catch(err=>next(err));
    if(results){
        req.flash('success', 'Event has been successfully deleted!');
        res.redirect('/events');
    }else{
        let err = new Error('Cannot find event with id '+ id);
        err.status = 404;
        next(err);
    }
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

exports.report = (req,res,next) =>{
    let report = new report_Schema(req.body);  
    let id = req.params.id;
    report.reportedby = req.session.userId;
    report.eventid = id;
    report.reportmessage = req.body.report_msg;
    report.isReported = 'yes'
    report.save() 
    .then(result=>{
        if(result){
            req.flash('success', 'Successfully event reported');
            res.redirect('/events/'+id);
        }
    })
    .catch(err => next(err));
};


exports.reportIgnore = (req,res,next) =>{
    let id = req.params.id;
    report_Schema.findByIdAndDelete(id)
    .then(report=>{
        if(report){          
            req.flash('success', 'Event has been successfully ignored!');
            res.redirect('/users/dashboard');
        }else{
            let err = new Error('Cannot find report with id '+ id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err));
};

