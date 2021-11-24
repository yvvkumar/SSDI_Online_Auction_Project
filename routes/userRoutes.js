const express = require('express');
const controller = require('../controllers/userController');
const {isGuest, isLoggedIn,isAdmin} = require('../middlewares/auth');

const router = express.Router();

//GET /users/new: send html form for creating a new user account
router.get('/new', isGuest, controller.new);

//POST /users: create a new user account
router.post('/', isGuest, controller.create);

//GET /users/login: send html for logging in
router.get('/login', isGuest, controller.getUserLogin);

//POST /users/login: authenticate user's login
router.post('/login', isGuest, controller.login);

//GET /users/profile: send user's profile page
router.get('/profile', isLoggedIn, controller.profile);

//GET /users/profile: send user's profile page
router.get('/dashboard', isLoggedIn, isAdmin, controller.dashboard);

//POST /users/logout: logout a user
router.get('/logout', isLoggedIn, controller.logout);

//POST /users/:id/makeAdmin: makeAdmin
router.post('/:id/makeAdmin',controller.makeAdmin);

//POST /users/:id/removeeAdmin: removeAdmin
router.post('/:id/removeAdmin',controller.removeAdmin);

module.exports = router;