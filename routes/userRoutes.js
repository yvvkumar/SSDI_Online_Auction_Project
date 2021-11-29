const express = require('express');
const controller = require('../controllers/userController');
const {isGuest, isLoggedIn,isAdmin} = require('../middlewares/auth');
const {validateId} = require('../middlewares/validator'); 

const router = express.Router();

//GET /users/new: send html form for creating a new user account
router.get('/new', isGuest, controller.new);

//POST /users: create a new user account
router.post('/', isGuest, controller.create);

//GET /users/edit: send html form for editing user account
router.get('/edit', isLoggedIn, controller.edit);

//PUT /users: update event identified by id
router.put('/',isLoggedIn,controller.update);

//GET /users/login: send html for logging in
router.get('/login', isGuest, controller.getUserLogin);

//POST /users/login: authenticate user's login
router.post('/login', isGuest, controller.login);

//GET /users/profile: send user's profile page
router.get('/profile', isLoggedIn, controller.profile);

//GET /users/dashboard: send user's dashboard page
router.get('/dashboard', isLoggedIn, isAdmin, controller.dashboard);

//POST /users/logout: logout a user
router.get('/logout', isLoggedIn, controller.logout);

//POST /users/:id/makeAdmin: makeAdmin
router.post('/:id/makeAdmin',validateId,isLoggedIn, isAdmin,controller.makeAdmin);

//POST /users/:id/removeAdmin: removeAdmin
router.post('/:id/removeAdmin',validateId,isLoggedIn, isAdmin,controller.removeAdmin);

//POST /users/:id/removeUser: removeUser
router.post('/:id/removeUser',validateId,isLoggedIn, isAdmin,controller.removeUser);

module.exports = router;