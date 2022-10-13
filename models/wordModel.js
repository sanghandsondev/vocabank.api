const mongoose = require('mongoose')
const User = require('./userModel')

const wordSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A word need a name'],
        trim: true
    },
    meaning: {
        type: String,
        required: [true, 'A word mush have meaning'],
        trim: true,
        maxlength: [100, 'Meaning must have less or equal than 100 characters']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Word must belong to an user']
    }
})

// Query middleware
// productSchema.pre(/^find/, function (next) {
//     this.populate({
//         path: 'user',
//         select: 'email'
//     })
//     next()
// })

const Word = mongoose.model('Word', wordSchema)

module.exports = Word