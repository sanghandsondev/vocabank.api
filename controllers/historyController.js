
const History = require('../models/historyModel')

const catchAsync = require('../utils/catchAsync')
const AppError = require('./../utils/appError')
const APIFeatures = require('./../utils/apiFeatures')
// const slugify = require('slugify')

exports.createHistory = catchAsync(async (req, res, next) => {
    if (!req.body.game) req.body.game = req.params.gameId
    if (!req.body.user) req.body.user = req.user.id
    console.log(req.body)
    const newHistory = await History.create(req.body)
    res.status(201).json({
        status: 'success',
        data: {
            histoty: newHistory
        }
    })
})
exports.getAllHistories = catchAsync(async (req, res, next) => {
    let filter = { user: req.user.id }  // mặc định lấy lịch sử của người đang đăng nhập
    if (req.params.gameId) filter = { game: req.params.gameId }
    if (req.params.userId) filter = { user: req.params.userId }
    const features = new APIFeatures(History.find(filter), req.query).filter().sort().limitFields().paginate()
    const histories = await features.query
    res.status(200).json({
        status: 'success',
        results: histories.length,
        data: {
            histories
        }
    })
})

exports.deleteHistory = catchAsync(async (req, res, next) => {
    const history = await History.findByIdAndDelete(req.params.id)
    if (!history) {
        return next(new AppError('No history found with that ID', 404))
    }
    res.status(204).json({
        status: 'success',
        data: null
    })
})
