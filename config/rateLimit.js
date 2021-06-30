const rateLimit = require("express-rate-limit");
// const signinLimiter = rateLimit({
//     windowMs: 60 * 60 * 1000 * 24, // 10 minutes
//     max: 10, // limit each IP to 100 requests per windowMs,
//     message : "Too many signin attempt, please try again after 10 minutes"
// });
const signinLimiter = rateLimit({
    windowMs: 60 * 60, // 10 minutes
    max: 1000, // limit each IP to 100 requests per windowMs,
    message : "Too many signin attempt, please try again after 10 minutes"
});
const adminDeleteLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // limit each IP to 10 requests per windowMs,
    message : "Too many delete attempt, please try again after 10 minutes"
});

module.exports = {
    signinLimiter,
    adminDeleteLimiter
}
