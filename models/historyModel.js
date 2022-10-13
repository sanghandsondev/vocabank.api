const mongoose = require('mongoose')
const User = require('./userModel')
const Game = require('./gameModel')

const historySchema = new mongoose.Schema({
    game: {
        type: mongoose.Schema.ObjectId,
        ref: 'Game',
        required: [true, 'History must belong to a game']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'History must belong to an user']
    },
    dateCompleted: {
        type: Date,
        default: Date.now(),
    },
    numberOfTest: {
        type: Number,
        required: [true, 'History mush have a number of test']
    },
    numberOfWord: {
        type: Number,
        required: [true, 'History mush have a number of words'],
        validate: {
            validator: function (val) {
                return val >= this.numberOfTest
            }
        },
        message: 'Number of word shoud be large than number of test'
    }
})

// Query middleware
historySchema.pre(/^find/, function (next) {
    this.populate({
        path: 'game',
        select: 'title difficulty'
    }).populate({
        path: 'user',
        select: 'name email'
    })
    next()
})

const History = mongoose.model('History', historySchema)

module.exports = History