const jwt = require("jsonwebtoken");
require('dotenv').config()

const generateToken = (user) => {
    const token = jwt.sign(
        {
            id: user._id.toString()
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    return token;
};

module.exports = generateToken;