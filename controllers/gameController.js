
const Game = require('../models/gameModel')

const catchAsync = require('../utils/catchAsync')
const AppError = require('./../utils/appError')
const APIFeatures = require('./../utils/apiFeatures')
const slugify = require('slugify')

exports.createGame = catchAsync(async (req, res, next) => {
    const newGame = await Game.create(req.body)
    res.status(201).json({
        status: 'success',
        data: {
            game: newGame
        }
    })
})
exports.getGame = catchAsync(async (req, res, next) => {
    const game = await Game.findById(req.params.id).populate({ path: 'histories' })
    if (!game) {
        return next(new AppError('No Game found with that ID', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            game
        }
    })
})
exports.getAllGames = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Game.find(), req.query).filter().limitFields()
    const games = await features.query
    res.status(200).json({
        status: 'success',
        results: games.length,
        data: {
            games
        }
    })
})
exports.deleteGame = catchAsync(async (req, res, next) => {
    const game = await Game.findByIdAndDelete(req.params.id)
    if (!game) {
        return next(new AppError('No game found with that ID', 404))
    }
    res.status(204).json({
        status: 'success',
        data: null
    })
})
exports.updateGame = catchAsync(async (req, res, next) => {
    const body = { ...req.body }
    if (body.title) body.slug = slugify(body.title, { lower: true })
    // console.log(body)
    const game = await Game.findByIdAndUpdate(req.params.id, body, {
        new: true,
        runValidators: true
    })
    if (!game) {
        return next(new AppError('No Game found with that ID', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            game
        }
    })
})