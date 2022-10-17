const express = require('express')
const historyController = require('../controllers/historyController')
const authController = require('../controllers/authController')


const router = express.Router({ mergeParams: true })

router.route('/:id')
    .delete(authController.protect, historyController.deleteHistory)   // KO đưa vào sản phẩm

router.route('/')
    .get(authController.protect, historyController.getAllHistories)
    .post(authController.protect, historyController.createHistory)
// .post(authController.protect, setUserId, historyController.createHistory)

module.exports = router