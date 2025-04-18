const jwt = require('jsonwebtoken');

module.exports = async function(req, res, next) {
    const token = req.header('Authorization');
    
    if (!token) {
        console.log("No token provided");
        return res.status(401).json({
            message: 'No token, authorization denied'
        });
    }

    try {
        await jwt.verify(token, process.env.jwtUserSecret, (err, decoded) => {
            if (err) {
                console.log("Error in verifying token:", err);
                return res.status(401).json({
                    message: 'Token is not valid'
                });
            } else {
                console.log("Token decoded successfully:", decoded);
                req.user = decoded.user;
                next();
            }
        });
    } catch (error) {
        console.log("Error in try block:", error);
        res.status(500).json({
            message: 'Server Error'
        });
    }
};