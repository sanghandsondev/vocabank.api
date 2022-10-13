const express = require('express')
const gameController = require('../controllers/gameController')
const authController = require('../controllers/authController')

const historyRouter = require('./historyRoute')

const router = express.Router()

router.route('/:id')
    .get(gameController.getGame)
    .patch(authController.protect, authController.restrictTo('admin', 'superadmin'), gameController.updateGame)
    .delete(authController.protect, authController.restrictTo('admin', 'superadmin'), gameController.deleteGame)

// Nested Router 
router.use('/:gameId/histories', historyRouter)

router.route('/')
    .get(gameController.getAllGames)
    .post(authController.protect, authController.restrictTo('admin', 'superadmin'), gameController.createGame)


module.exports = router
