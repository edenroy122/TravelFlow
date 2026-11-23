const User = require('../models/user.model');
const bcrypt = require("bcrypt");
const generateToken = require('../utils/generatetoken')
const mongoose = require('mongoose')

const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            department,
            policyTier,
            reportingManager
        } = req.body;


        if (!name || !email || !password || !department) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }


        const userExist = await User.findOne({
            email: email.trim().toLowerCase()
        });


        if (userExist) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const allowedRoles = ["Employee", "Manager", "Finance"];

        if (role && !allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        if (role === "Employee") {

            if (!reportingManager) {
                return res.status(400).json({
                    message: "Please provide Reporting Manager id"
                });
            }

            if (!mongoose.isValidObjectId(reportingManager)) {
                return res.status(400).json({
                    message: "Invalid Reporting Manager ID"
                });
            }

            const reportingManagerExist = await User.findOne({
                _id: reportingManager,
                role: "Manager",
                status: "Active"
            });
        }
    


    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || "Employee",
        department,
        policyTier: policyTier || "Tier 3",
        reportingManager: reportingManager || null
    });

    return res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            policyTier: user.policyTier,
            reportingManager: role === "Employee" ? reportingManager : null
        }
    });

} catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
        message: "Failed to register user"
    });
}
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;


        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }


        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid email"
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


module.exports = {
    register,
    login
};