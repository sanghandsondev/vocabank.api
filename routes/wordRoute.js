const express = require('express')
const wordController = require('../controllers/wordController')
const authController = require('../controllers/authController')


const router = express.Router({ mergeParams: true })

router.route('/:id')
    .patch(authController.protect, wordController.updateWord)
    .delete(authController.protect, wordController.deleteWord)

router.route('/')
    .get(authController.protect, wordController.getAllWords)
    .post(authController.protect, wordController.createWord)

module.exports = router
