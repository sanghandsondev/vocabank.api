const AppError = require('./../utils/appError')

const sendErrorDev = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api/v')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })
    }
    // RENDER WEBSITE
    // console.log(err)
    // return res.status(err.statusCode).render('error', {
    //     title: 'Something went wrong!',
    //     msg: err.message
    // })

}

const sendErrorProd = (err, req, res) => {
    //  API ---------------------------------------------------------------------------
    if (req.originalUrl.startsWith('/api/v')) {
        // A) Operational, trusted error: send message to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            })
        }
        // B) Programming or other unknown error: don't leak error details to client
        // 1) Log error
        console.error('ERROR: ', err)
        // 2) Send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!',
        })

    }

    // RENDER WEBSITE -------------------------------------------------------------------
    // A) Operational, trusted error: send message to client
    // if (err.isOperational) {
    //     console.log(err)
    //     return res.status(err.statusCode).render('error', {
    //         title: 'Something went wrong!',
    //         msg: err.message
    //     })
    // }
    // B) Programming or other unknown error: don't leak error details to client
    // 1) Log error
    // console.error('ERROR: ', err)
    // // 2) Send generic message
    // return res.status(err.statusCode).render('error', {
    //     title: 'Something went wrong!',
    //     msg: 'Please try again later.'
    // })

}

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
    const message = `Duplicate field value: ${value}. Please use another value!`
    return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message)        // nhi???u l???i validate
    const message = `Invalid input data => ${errors.join('. ')}`;
    return new AppError(message, 400)
}

const handleJWTError = () => {
    return new AppError('Invalid token. Please log in again!', 401)
}

const handleJWTExpiredError = () => {
    return new AppError('Your token has expired! Please log in again.', 401)
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res)
    } else if (process.env.NODE_ENV === 'production') {          // Setup Error chung ch??? kh??ng ph???i ??i catch Error cho t???ng API
        // let error = { ...err }
        if (err.name === 'CastError') err = handleCastErrorDB(err)        // Id ko t???n t???i
        if (err.code === 11000) err = handleDuplicateFieldsDB(err)        // B??? tr??ng t??n (t??nh unique c???a Schema)
        if (err.name === 'ValidationError') err = handleValidationErrorDB(err)   // L???i validate ??? Schema c???a Model (DB)
        if (err.name === 'JsonWebTokenError') err = handleJWTError()            // sai Token
        if (err.name === 'TokenExpiredError') err = handleJWTExpiredError()     // Token h???t h???n
        sendErrorProd(err, req, res)       // ????n gi???n h??a Error khi g???i client 
    }
}
