const model = require('../models/user');
const Event = require('../models/event');
const Bid = require('../models/bid');

exports.new = (req, res)=>{
    return res.render('./user/new');
};

exports.create = (req, res, next)=>{
    let user = new model(req.body);
    user.save()
    .then(user=>{
        req.flash('success', 'You have successfully registered!');
        res.redirect('/users/login');
    }) 
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('/users/new');
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has already been used!');  
            return res.redirect('/users/new');
        }
        
        next(err);
    });
};

exports.edit = (req,res,next) => {
    let id = req.session.userId;
    model.findById(id)
    .then(user=>{
        if(user){
            res.render('./user/edit',{user});
        }
    })
    .catch(err=>next(err));
};

exports.update = (req,res,next) => {
    let user = req.body;
    let id = req.session.userId;
    model.findByIdAndUpdate(id,user,{useFindAndModify: false, runValidators: true})
    .then(oldUser=>{
        if(oldUser){
            req.session.firstName = user.firstName;
            req.flash('success', 'User profile has been successfully updated!');
            res.redirect('/users/dashboard');
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

exports.getUserLogin = (req, res, next) => {
     res.render('./user/login');
}

exports.login = (req, res, next)=>{
    let email = req.body.email;
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            req.flash('error', 'Wrong email address!');  
            res.redirect('/users/login');
        } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.userId = user._id;
                    req.session.firstName = user.firstName;
                    req.session.userRole = user.role;
                    req.session.city = user.city;
                    req.flash('success', 'You have successfully logged in');
                    if(user.role === 'Admin' || user.role === 'SuperAdmin')
                        res.redirect('/users/dashboard');
                    else
                        res.redirect('/users/profile');
                } else {
                    req.flash('error', 'Wrong password!');      
                    res.redirect('/users/login');
                }
            });     
        }     
    })
    .catch(err => next(err));
};

exports.profile = (req, res, next)=>{
    let id = req.session.userId;
    Promise.all([model.findById(id),Event.find({host:id})])
    .then(results=>{
        const[user,events]=results;
        res.render('./user/profile', {user,events})
    })
    .catch(err=>next(err));
};

exports.dashboard = (req, res, next)=>{
    model.find()
    .then(users=>res.render('./user/usersList', {users}))
    .catch(err=>next(err));
};

exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else{res.redirect('/users/login');  
       }
    });
 };

 exports.makeAdmin = (req,res,next)=>{
    let id = req.params.id;
    model.findById(id)
    .then(user=>{
        if(user){
            user.role='Admin';
            model.findByIdAndUpdate(id,user,{useFindAndModify: false, runValidators: true})
            .then(newuser=>{    
                req.flash('success', 'User role has been successfully updated!');
                res.redirect('/users/dashboard');
            })
        }else{
            let err = new Error('Cannot find user with id '+ id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
 };

 exports.removeAdmin = (req,res,next)=>{
    let id = req.params.id;
    model.findById(id)
    .then(user=>{
        if(user){
            user.role='User';
            model.findByIdAndUpdate(id,user,{useFindAndModify: false, runValidators: true})
            .then(newuser=>{    
                req.flash('success', 'User role has been successfully updated!');
                res.redirect('/users/dashboard');
            })
        }else{
            let err = new Error('Cannot find user with id '+ id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
 };

 exports.removeUser = (req,res,next)=>{
    let id = req.params.id;
    console.log(id);
    Promise.resolve()
    .then(()=>{
        Bid.find({bidder:id})
        .then(bids=>{
            if(bids)
                bids.forEach(bid=>{
                    Bid.findByIdAndDelete(bid.id,{useFindAndModify: false})
                    .catch(err=>next(err));
                });
        })
    })
    .then(()=>{
        Event.find({host:id})
        .then(events=>{
            if(events)
                events.forEach(event=>{
                    Event.findByIdAndDelete(event.id,{useFindAndModify: false})
                    .catch(err=>next(err));
                });
        })
    })
    .then(()=>{
        model.findByIdAndDelete(id,{useFindAndModify: false})
        .then(user=>{
            if(!user){
                let err = new Error('Cannot find user with id '+ id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err=>next(err));
    })
    .catch(err => next(err));
    req.flash('success', 'User has been successfully removed!');
    res.redirect('/users/dashboard');
 };