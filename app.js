// require modules
const morgan = require('morgan');
const express = require('express');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const userRoutes = require('./routes/userRoutes');
const mainRoutes = require('./routes/mainRoutes');
const eventRoutes = require('./routes/eventRoutes');


// create app
const app = express();

// configure app
let port = 3000;
let hostURL ='localhost';
app.set('view engine','ejs');

//connect to database
mongoose.connect('mongodb://localhost:27017/auction',
                {useNewUrlParser: true, useUnifiedTopology: true }) //, useCreateIndex: true
.then(()=>{
    //start the server
    app.listen(port, hostURL, ()=>{
    console.log('Server is running on port', port);
    });
})
.catch(err=>console.log(err.message));

// mount middleware 
app.use(
    session({
        secret: "xjfeirf90atu9eroejghefj",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/goa'}),
        cookie: {maxAge: 60*60*1000}
        })
);
app.use(flash());

app.use((req, res, next) => {
    res.locals.userId = req.session.userId||null;
    res.locals.firstName = req.session.firstName||null;
    res.locals.userRole = req.session.userRole||null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));


// set up routes
app.use('/',mainRoutes);

app.use('/about',mainRoutes);

app.use('/contact',mainRoutes);

app.use('/events',eventRoutes);

app.use('/users', userRoutes);

app.use((req,res,next)=>{
    let err = new Error('The server cannot locate resource at '+req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next)=>{
    console.log(err.stack);
    if(!err.status){
        err.status = 500;
        err.message = ("Internal Server Error");
    }
    res.status(err.status);
    res.render('error',{error: err});
});
