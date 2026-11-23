const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: ["Admin", "Employee", "Manager", "Finance"],
      default: "Employee"
    },

    department: {
      type: String,
      enum: [
        "IT",
        "HR",
        "Finance",
        "Sales",
        "Marketing",
        "Operations",
        "Accounts",
        "Other"
      ],
      required: true
    },

    policyTier: {
      type: String,
      enum: ["Tier 1", "Tier 2", "Tier 3"],
      default: "Tier 3"
    },

    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);