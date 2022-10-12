const User = require('../models/userModel')
const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const multer = require('multer')   // upload file
const sharp = require('sharp')   // resize photo

// ----- upload photo --------------------------------------------
const multerStorage = multer.memoryStorage()
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {         // if file is a image
        cb(null, true)
    } else {
        cb(new AppError('Not an image! Please upload only images', 400), false)
    }
}
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})
exports.uploadUserAvatar = upload.single('avatar')

exports.resizeUserAvatar = catchAsync(async (req, res, next) => {
    if (!req.file) return next()

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`)
    next()
})
// -------------------------------------------------------------
// Allow field for update data
const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el]
    })
    return newObj
}

// User update himself/herself
exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates. Please use /updateMyPassWord.', 400))
    }
    // 2) Filtered out unwanted fields names are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name')            // chỉ cho phép thay đổi tên người dùng
    if (req.file) {
        filteredBody.avatar = req.file.filename        // thêm field avatar nếu có upload ảnh
    }
    // 3) Update user document
    const updateUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        status: 'success',
        data: {
            user: updateUser
        }
    })
})


// Soft Delete
exports.deleteMe = (req, res, next) => {
    req.params.id = req.user.id
    next()
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id
    next()
}


// Manage Users -- Admin
exports.getAllUsers = catchAsync(async (req, res, next) => {
    let filter = { active: { $ne: false } }    // choose user is active

    const features = new APIFeatures(User.find(filter), req.query).filter().sort().limitFields().paginate()
    const users = await features.query

    res.status(200).json({
        status: 'success',
        requestdAt: req.requestTime,
        results: users.length,
        data: {
            users
        }
    })
})

exports.getAllUsersNotActive = catchAsync(async (req, res, next) => {
    let filter = { active: false }    // choose user is active

    const features = new APIFeatures(User.find(filter), req.query).filter().sort().limitFields().paginate()
    const users = await features.query

    res.status(200).json({
        status: 'success',
        requestdAt: req.requestTime,
        results: users.length,
        data: {
            users
        }
    })
})

exports.createUser = catchAsync(async (req, res, next) => {
    return next(new AppError('This route is not defined! Please use /signup instead', 400))
})

exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    if (!user) {
        return next(new AppError('No user found with that ID', 404))
    }
    user.__v = undefined
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
})


// ---- Super Admin
exports.deleteSoftUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, { active: false, deletedAt: Date.now() - 1000 })
    if (!user) {
        return next(new AppError('No user found with that ID', 404))
    }
    res.status(204).json({
        status: 'success',
        data: null
    })
})

exports.restoreUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, { active: true, deletedAt: undefined })
    if (!user) {
        return next(new AppError('No user found with that ID', 404))
    }
    user.__v = undefined
    user.deletedAt = undefined
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
})

exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
        return next(new AppError('No user found with that ID', 404))
    }
    res.status(204).json({
        status: 'success',
        data: null
    })
})

exports.updateUser = catchAsync(async (req, res, next) => {
    const filteredBody = filterObj(req.body, 'role', 'name')  // chỉ cho superadmin sửa role và tên của người dùng
    const user = await User.findByIdAndUpdate(req.params.id, filteredBody, {
        new: true,
        runValidators: true
    })
    if (!user) {
        return next(new AppError('No user found with that ID', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
})
