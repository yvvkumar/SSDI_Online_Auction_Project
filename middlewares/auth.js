const Event = require('../models/event');

//check if a user is a guest
exports.isGuest = (req,res,next)=>{
    if(!req.session.user)
        return next();
    else{
        req.flash('error','You are logged in already!');
        return res.redirect('/users/profile');
    }
}

//check if a user is a authenticated
exports.isLoggedIn = (req,res,next)=>{
    if(req.session.user)
        return next();
    else{
        req.flash('error','You need to log in first!');
        return res.redirect('/users/login');
    }
}

//check if a user is the host of the event
exports.isHost = (req,res,next)=>{
    let id = req.params.id;
    Event.findById(id)
    .then(event=>{
        if(event){
            if(event.host == req.session.user)
                return next();
            else{
                let err = new Error('Unauthorized to access this resource');
                err.status = 401;
                return next(err);
            }
        }
    })
    .catch(err=>next(err));
}
