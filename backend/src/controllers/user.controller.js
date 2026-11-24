const User = require('../models/user.model');
const bcrypt = require("bcrypt");
const mongoose = require('mongoose')
const crypto = require("crypto");
const userModel = require('../models/user.model');




const generatePassword = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "@#$!%&*";
    const all = letters + numbers + special;

    let password = [
        letters[crypto.randomInt(letters.length)],
        numbers[crypto.randomInt(numbers.length)],
        special[crypto.randomInt(special.length)]
    ];

    while (password.length < 8) {
        password.push(all[crypto.randomInt(all.length)]);
    }

    return password.join("");
};



const createUser = async (req, res) => {
    try {
        const {
            name,
            email,
            role,
            department,
            policyTier,
            reportingManager,
            status
        } = req.body;


        if (!name || !email || !department || !status) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address"
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

        const password = generatePassword()

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

        console.log("password : ",password)


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


const getAllUser = async(req,res)=>{

    try{
        const allUsers = await userModel.find()
        res.status(200).json({
            message :  "All User Fetched Successfully",
            user : allUsers
        })
    }
    catch(err){
        return res.status(500).json({
            message: "Failed to fetch users"
        });
    }
}


const getUser = async (req, res) => {

    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid User ID"
            });
        }

        const user = await userModel.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User Not Found"
            });
        }

        return res.status(200).json({
            message: "User Fetched Successfully",
            user
        });

    } catch (err) {
        return res.status(500).json({
            message: "Failed to Fetch User"
        });
    }
};




const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            email,
            role,
            department,
            policyTier
        } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid User ID"
            });
        }

        const user = await userModel.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User Not Found"
            });
        }

        // Prevent changing the system Admin's role
        if (user.role === "Admin" && role && role !== "Admin") {
            return res.status(403).json({
                message: "Cannot change Admin role"
            });
        }

        // Prevent creating additional Admin accounts
        if (role === "Admin" && user.role !== "Admin") {
            return res.status(403).json({
                message: "Cannot assign Admin role"
            });
        }

        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (role !== undefined) user.role = role;
        if (department !== undefined) user.department = department;
        if (policyTier !== undefined) user.policyTier = policyTier;

        await user.save();

        return res.status(200).json({
            message: "User Updated Successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                policyTier: user.policyTier,
                isActive: user.isActive
            }
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        if (err.name === "ValidationError") {
            return res.status(400).json({
                message: err.message
            });
        }

        return res.status(500).json({
            message: "Failed to Update User"
        });
    }
};



module.exports = {
    createUser,
    getAllUser,
    getUser,
    updateUser

};