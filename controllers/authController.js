const User = require('./../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const Email = require('../utils/email')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')    // Thư viện chức năng tích hợp sẵn trong node ( như 'fs' ) => promisify: function -> promise
const crypto = require('crypto')        // có sẵn trong node
const axios = require('axios')


const signToken = idUser => {
    return jwt.sign({ id: idUser }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id)
    res.cookie('jwt', token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),   // milliseconds
        httpOnly: true,
        secure: req.secure || req.header('x-forwarded-proto') === 'https'
    })   // Send JWT via Cookie

    //remove the password from output
    user.password = undefined         // ở đây ko .save() nên password trong database ko bị ảnh hưởng
    user.__v = undefined
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

// ĐĂNG KÝ
exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body)

    // const url = `${req.protocol}://${req.get('host')}/me`;
    // await new Email(newUser, url).sendWelcome()          // gửi email chào mừng người dùng mới cùng link để chỉnh sửa avatar
    createSendToken(newUser, 201, req, res)
})

// ĐĂNG NHẬP
exports.logIn = catchAsync(async (req, res, next) => {
    // email = req.body.email => 
    // password = req.body.password
    const { email, password } = req.body
    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400))
    }
    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password')       // thêm field password 
    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect email or password', 401))
    }
    // 3) If everything ok, send token to client
    createSendToken(user, 200, req, res)
})

// ĐĂNG NHẬP VỚI FACEBOOK
// ĐĂNG NHẬP VỚI GOOGLE

// ĐĂNG XUẤT
exports.logOut = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),      // + 10s
        httpOnly: true
    })
    res.status(200).json({ status: 'success' })
}

// XÁC THỰC, BẢO VỆ ROUTER
exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]          // lấy token phía sau Bearer
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }
    if (!token) {
        return next(new AppError('Your are not logged in! Please log in to get access.', 401))
    }
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id)
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist.', 401))
    }
    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again.', 401))
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser
    res.locals.user = currentUser
    next()
})

// PHÂN QUYỀN
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403))
        }
        next()
    }
}

// ĐỔI MẬT KHẨU
exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user 
    const user = await User.findById(req.user._id).select('+password')// lấy thông tin người dùng (bao gồm mật khẩu) đang đăng nhập req.user

    // 2) Check if POSTed current password is correct                     
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {  // Xác nhận đúng mật khẩu hiện tại
        return next(new AppError('Your current password is wrong.', 401))
    }
    // 3) If so, update password                                          
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()            // User.findByIdAndUpdate ko sử dụng vì nó ko hash password cũng như tạo thời gian đổi mật khẩu

    // 4) Log user in, send JWT
    createSendToken(user, 200, req, res)
})

// QUÊN MẬT KHẨU

