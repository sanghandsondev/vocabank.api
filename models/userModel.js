const moongose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new moongose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!'],
        trim: true,
        minlength: [3, 'A user name must have more or equal than 3 characters'],
        maxlength: [30, 'A user name must have less or equal than 30 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    avatar: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false        // mặc định ko gửi lên client bằng phương thức Find..(query)
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on CREATE and SAVE
            validator: function (value) {
                return value === this.password
            },
            message: 'Passwords are not the same!'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    deletedAt: Date,
    active: {
        default: true,
        type: Boolean,
        select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
})

// Document Middleware
userSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next()
    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12)
    // Delete passwordConfirm field  
    this.passwordConfirm = undefined
    next()
})

userSchema.pre('save', function (next) {
    // nếu ko có password hoặc User được tạo mới thì thoát ra
    if (!this.isModified('password') || this.isNew) return next()
    // nếu ko phải là User tạo mới 
    this.passwordChangedAt = Date.now() - 1000
    next()
})

// Query Middleware
// userSchema.pre(/^find/, function (next) {
//     this.find({ active: { $ne: false } })
//     next()
// })

// Set up method for Model User (cho đối tượng của class User)
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        // console.log(this.passwordChangedAt, JWTTimestamp)
        return JWTTimestamp < changedTimestamp
    }
    //False means NOT changed
    return false
}

userSchema.methods.createPasswordResetToken = function () {  // Gửi token đến email người dùng xác nhận đổi password, với hạn là 10phut
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    // console.log({ resetToken }, this.passwordResetToken)
    return resetToken
}


const User = moongose.model('User', userSchema)

module.exports = User
