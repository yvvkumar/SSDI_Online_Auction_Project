const model = require('../models/user');
const Event = require('../models/event');

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
                    req.session.user = user._id;
                    req.session.firstName = user.firstName;
                    req.session.userRole = user.role;
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
    let id = req.session.user;
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
    .catch(err=>next(err))
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
    .catch(err=>next(err))
 };