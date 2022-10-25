
const Word = require('../models/wordModel')

const catchAsync = require('../utils/catchAsync')
const AppError = require('./../utils/appError')
const APIFeatures = require('./../utils/apiFeatures')

exports.createWord = catchAsync(async (req, res, next) => {
    if (!req.body.user) req.body.user = req.user.id
    const newWord = await Word.create(req.body)
    res.status(201).json({
        status: 'success',
        data: {
            game: newWord
        }
    })
})

exports.getAllWords = catchAsync(async (req, res, next) => {
    let filter = {}
    if (req.params.userId) filter = { user: req.params.userId }
    if (!req.params.userId) filter = { user: req.user.id }
    const features = new APIFeatures(Word.find(filter), req.query).filter().sort().limitFields()
    const words = await features.query
    res.status(200).json({
        status: 'success',
        results: words.length,
        data: {
            words
        }
    })
})

exports.deleteWord = catchAsync(async (req, res, next) => {
    const word = await Word.findByIdAndDelete(req.params.id)
    if (!word) {
        return next(new AppError('No game found with that ID', 404))
    }
    res.status(204).json({
        status: 'success',
        data: null
    })
})

exports.updateWord = catchAsync(async (req, res, next) => {
    const word = await Word.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if (!word) {
        return next(new AppError('No Game found with that ID', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            word
        }
    })
})