const mongoose = require('mongoose')
const slugify = require('slugify')

const gameSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Game must have a title'],
        minlength: [3, 'Game title must have more or equal than 3 characters'],
        maxlength: [30, 'Game title must have less or equal than 30 characters'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        require: [true, 'Game mush have a description'],
        minlength: [10, 'Game description must have more or equal than 10 characters'],
        trim: true
    },
    imageCover: String,
    difficulty: {
        type: String,
        enum: {
            values: ['success', 'warning', 'danger', 'info'],
            message: 'Difficulty is either: success, warning, danger, info'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

gameSchema.index({ slug: 1 })

// Document middleware: runs before .save() .create() .update() ...
gameSchema.pre('save', function (next) {
    this.slug = slugify(this.title, { lower: true })
    next()
})

// Virtual populate
gameSchema.virtual('histories', {
    ref: 'History',
    foreignField: 'game',
    localField: '_id'
})

const Game = mongoose.model('Game', gameSchema)

module.exports = Game 
