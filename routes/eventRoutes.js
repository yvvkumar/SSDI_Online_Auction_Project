// require modules
const express = require('express');
const controller = require('../controllers/eventController');
const {isLoggedIn,isHost} = require('../middlewares/auth');
const {validateId,validateBidAmount} = require('../middlewares/validator');

// create router
const router = express.Router();

//GET /events: send all the events to the user
router.get('/',controller.index);

//GET /events: send all the events of the loaclity to the user
router.get('/localEvents',controller.localEvents);

//GET /events/new: send html form for creating a new event
router.get('/new',isLoggedIn,controller.new);

//POST /events: create a new event
router.post('/',isLoggedIn,controller.create);

//POST /events: save bid amount
router.post('/:id/bid',validateBidAmount,controller.bid);

//GET /events/:id: send details of event identified by id
router.get('/:id',validateId,controller.show);

//GET /events/:id/edit: send html form for editing an exising event
router.get('/:id/edit',validateId,isLoggedIn,isHost,controller.edit);

//PUT /events/:id: update event identified by id
router.put('/:id',validateId,isLoggedIn,isHost,controller.update);

//DELETE /events/:id: delete event identified by id
router.delete('/:id',validateId,isLoggedIn,isHost,controller.delete);

// export 
module.exports = router;