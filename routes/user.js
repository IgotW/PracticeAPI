const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const user_jwt = require('../middleware/user_jwt');
const jwt = require('jsonwebtoken');



router.get('/', user_jwt, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        } else{
            return res.status(200).json({
                success: true,
                user: user
            });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: "Server Error",
            success: false
        });
    }
});

router.post('/register', async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide name, email, and password"
        });
    }

    try {
        const user_exist = await User.findOne({ email });
        if (user_exist) {
            return res.json({
                message: "User already exists",
                success: false
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            createdAt: Date.now()
        });

        await newUser.save();

        const payload = {
            user: {
                id: newUser.id
            }
        };

        jwt.sign(payload, process.env.jwtUserSecret, {
             expiresIn: 36000 
        }, (err, token) => {
            if (err) throw err;
            return res.status(200).json({
                success: true,
                token: token
            });
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
});


router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide email and password"
        });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, process.env.jwtUserSecret, {
             expiresIn: 36000 
        }, (err, token) => {
            if (err) throw err;
            return res.status(200).json({
                success: true,
                message: "Login successful",
                token: token,
                user: user
            });
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
});



module.exports = router;