
//Catching Error in Async Function
module.exports = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next)      // bản chất là 1 Promise
    }
}
