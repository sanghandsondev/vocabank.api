const dotenv = require('dotenv')
dotenv.config()

const app = require('./app')

// database
const mongoose = require('mongoose')
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    console.log('DB connection successful!')
}).catch(() => {
    console.log('Cannot connect to DB')
})

// start server
const port = process.env.PORT || 8080
const server = app.listen(port, () => {
    console.log(`App listening on port ${port}...`)
})

// Error outside Express (Database/...)
process.on('unhandledRejection', (err) => {
    // console.log(err)
    console.log('UNHANDLER REJECTION!! Shutting down...')
    server.close(() => {
        process.exit(1)
    })
})

// sigterm signal  => heroku sau 24h ...
process.on('SIGTERM', () => {
    console.log('SIGTERM RECEIVED. Shutting down gracefully')
    server.close(() => {
        console.log('Process terminated')
    })
})