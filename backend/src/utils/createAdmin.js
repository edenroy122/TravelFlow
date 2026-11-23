const bcrypt = require("bcrypt");
const User = require("../models/user.model");
require('dotenv').config()

const createAdmin = async () => {
    try {
        const adminExists = await User.findOne({
            email: process.env.ADMIN_EMAIL
        });

        if (adminExists) {
            console.log("Admin already exists");
            return;
        }

        const hashedPassword = await bcrypt.hash(
            process.env.ADMIN_PASSWORD,
            10
        );

        await User.create({
            name: "Admin",
            email: process.env.ADMIN_EMAIL,
            password: hashedPassword,
            role: "Admin",
            department : "Other",
            status : "Active",
            policyTier: "Tier 2"
            
        });

        console.log("Admin created successfully");

    } catch (error) {
        console.error("Admin creation failed:", error.message);
        throw error;
    }
};

module.exports = createAdmin;
