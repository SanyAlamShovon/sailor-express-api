const jwt = require('jsonwebtoken');

const verifyToken = (req,res,next) => {
    if (!req.headers.authorization)return res.status(401).json({
        success : false,
        message : "Unauthorized : Token Required."
    });
    let token = req.headers['authorization'].replace(/^JWT\s/, '');
    if(!token){
        return res.status(401).json({ "success": false, "message":"Token Missing" });
    }else {
        try {
            jwt.verify(token,process.env.TokenSecret,false,(err,decoded) => {
                if(err){
                    return res.status(401).json({
                        success : false,
                        message : "Forbidden"
                    });
                }
                req.user = decoded.data;
                next();
            });
        }catch(err) {
                console.log(err);
                return next(err);
        }
    }
}

module.exports = verifyToken;
