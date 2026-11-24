const User = require('../models/user.model');
const bcrypt = require("bcrypt");
const generateToken = require('../utils/generatetoken')




const login = async (req, res) => {
    try {
        const { email, password } = req.body;


        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address"
            });
        }


        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "User does not exist"
            });
        }


        if (typeof password !== "string") {
            return res.status(400).json({
                message: "Password is required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must contain minimum 6 characters"
            });
        }

        if (!/[A-Za-z]/.test(password)) {
            return res.status(400).json({
                message: "Password must contain at least 1 alphabet"
            });
        }

        if (!/[0-9]/.test(password)) {
            return res.status(400).json({
                message: "Password must contain at least 1 number"
            });
        }

        if (!/[^A-Za-z0-9\s]/.test(password)) {
            return res.status(400).json({
                message: "Password must contain at least 1 special character"
            });
        }




        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }


        if (user.status !== "Active") {
            return res.status(403).json({
                message: "Your account is inactive"
            });
        }

        const token = generateToken(user);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                policyTier: user.policyTier
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            message: "Failed to login"
        });
    }
};


const logout = async (req, res) => {
    try {
        return res.status(200).json({
            message: "Logout Successful"
        });

    } catch (err) {
        return res.status(500).json({
            message: "Logout Failed"
        });
    }
};


const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message: "Password must contain minimum 8 characters, 1 alphabet, 1 number and 1 special character"
            });
        }

        const user = await userModel.findById(req.user.id).select("+password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Old password is incorrect"
            });
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({
                message: "New password must be different from old password"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        return res.status(200).json({
            message: "Password Changed Successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: "Failed to change password"
        });
    }
};


module.exports = {
    login,
    logout
};