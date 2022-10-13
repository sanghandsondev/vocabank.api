const express = require('express')
const path = require('path')

const app = express()

app.enable('trust proxy')

// SET VIEW ENGINE  --------------------------------------------------------------------------------
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// GLOBAL MIDDLEWARES ----------------------------------------------------------------------------

// Implement CORS (Cross-origin resource sharing)      
const cors = require('cors')
app.use(cors())
app.options('*', cors())        // Nới lỏng bảo mật do accept tất cả từ phía Client
// Access-control-Allow-Origin
// api.mystore.com <= front-end => mystore.com
// app.use(cors({
//   origin: 'https://www.mystore.com' (example)
// }))

// Serving static files
app.use(express.static(path.join(__dirname, 'public')))

// Set security HTTP headers
// Helmet helps you secure your Express apps by setting various HTTP headers.
const helmet = require('helmet')
app.use(helmet())

// Development logging
const morgan = require('morgan')
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Limit request from same IP
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
    max: 500,                        // limit 100 requests from the same IP in 1 hour
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
})
app.use('/api', limiter)

// Body parser, reading data from body into req.body 
app.use(express.json({ limit: '10kb' }))

const cookieParser = require('cookie-parser')
app.use(cookieParser())        // hiểu được req.cookies

// Data sanitization against NoSQL query injection    (kiểu khi mấy cái query find() phủng không hoạt động đúng như mong muốn)
const mongoSanitize = require('express-mongo-sanitize')
app.use(mongoSanitize())

// Data sanitization against XSS
const xss = require('xss-clean')
app.use(xss())

// Prevent parameter pollution
// Cho phép hiểu được localhost:8000/api/v1/products?sort=quantity&sort=price , api/v1/products?quantity=5&quantity=9
// Khác với localhost:8000/api/v1/products?sort=quantity,price
// const hpp = require('hpp')
// app.use(hpp({
//     whitelist: [
//         'quantity',
//         'price'
//     ]
// }))

// nén file khi build
const compression = require('compression')
app.use(compression())       // compress all responses

// Test custom middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    next()
})

// ROUTES ------------------------------------------------------------------------------------------------------------
// views
// const viewRouter = require('./routes/viewRoute')
// app.use('/', viewRouter)

// api
const userRouter = require('./routes/userRoute')
const gameRouter = require('./routes/gameRoute')
const historyRouter = require('./routes/historyRoute')
const wordRouter = require('./routes/wordRoute')

app.use('/api/v1/users', userRouter)
app.use('/api/v1/games', gameRouter)
app.use('/api/v1/histories', historyRouter)
app.use('/api/v1/words', wordRouter)
app.get('/', (req, res, next) => {
    res.json("Home API")
})


const AppError = require('./utils/appError')
app.all('*', (req, res, next) => {          // Sai đường dẫn URL / API ko tồn tại
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

const globalErrorHandler = require('./controllers/errorController')
app.use(globalErrorHandler)            // catch err ở controller sẽ next() vào đây

module.exports = app;
