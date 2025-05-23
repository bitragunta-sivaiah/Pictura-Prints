import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const profileImgsNameList = [
    "Chase",
    "Leo",
    "Kingston",
    "Ryan",
    "Luis",
    "Ryker",
    "Oliver",
    "Maria",
    "Sawyer",
];

const profileImgsCollectionsList = ["adventurer"];

// Helper function to generate default avatar
const generateAvatar = () => {
    const collection =
        profileImgsCollectionsList[
        Math.floor(Math.random() * profileImgsCollectionsList.length)
        ];
    const seed =
        profileImgsNameList[
        Math.floor(Math.random() * profileImgsNameList.length)
        ];
    return `https://api.dicebear.com/6.x/${collection}/svg?seed=${seed}`;
};

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
            trim: true,
        },
        password: { type: String, required: true },
        address: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
        phoneNumber: {
            type: String,
            match: [/^\d{10}$/, "Phone number must be 10 digits long"],
            trim: true,
        },
        avatar: { type: String, default: generateAvatar },
        role: {
            type: String,
            enum: {
                values: ["user", "admin", "deliveryPartner", "branchManager"], // Added branchManager
                message: "Role must be 'user', 'admin', 'deliveryPartner' or 'branchManager'",
            },
            default: "user",
            index: true,
        },
        deletedAt: { type: Date, default: null }, // Assuming you have a deletedAt field
        // --- Delivery Partner Specific Fields ---
        isDeliveryPartner: {
            type: Boolean,
            default: false,
            index: true,
        },
        deliveryPartnerDetails: {
            //  Store delivery partner specific information
            vehicleType: {
                type: String,
                enum: ["motorcycle", "car", "bicycle", "scooter", "other"],
                trim: true,
            },
            licenseNumber: { type: String, trim: true },
            licenseExpiryDate: { type: Date },
            insuranceNumber: { type: String, trim: true },
            insuranceExpiryDate: { type: Date },
            vehicleNumber: { type: String, trim: true },
            aadharNumber: { type: String, trim: true },
            approvalStatus: {
                type: String,
                enum: ["pending", "processing", "approved", "rejected"],
                default: "pending",
                index: true,
            },
            availableStatus: {
                type: Boolean,
                default: false, //  Delivery partner availability
                index: true,
            },
            workingHours: {
                // New structure for working hours
                Monday: {
                    type: {
                        startTime: String,
                        endTime: String,
                        isAvailable: Boolean,
                    },
                    default: { startTime: '', endTime: '', isAvailable: false },
                },
                Tuesday: {
                    type: {
                        startTime: String,
                        endTime: String,
                        isAvailable: Boolean,
                    },
                    default: { startTime: '', endTime: '', isAvailable: false },
                },
                Wednesday: {
                    type: {
                        startTime: String,
                        endTime: String,
                        isAvailable: Boolean,
                    },
                    default: { startTime: '', endTime: '', isAvailable: false },
                },
                Thursday: {
                    type: {
                        startTime: String,
                        endTime: String,
                        isAvailable: Boolean,
                    },
                    default: { startTime: '', endTime: '', isAvailable: false },
                },
                Friday: {
                    type: {
                        startTime: String,
                        endTime: String,
                        isAvailable: Boolean,
                    },
                    default: { startTime: '', endTime: '', isAvailable: false },
                },
                Saturday: {
                    type: {
                        startTime: String,
                        endTime: String,
                        isAvailable: Boolean,
                    },
                    default: { startTime: '', endTime: '', isAvailable: false },
                },
                Sunday: {
                    type: {
                        startTime: String,
                        endTime: String,
                        isAvailable: Boolean,
                    },
                    default: { startTime: '', endTime: '', isAvailable: false },
                },
            },
            availability: {
                type: String,
                enum: ["available", "on_delivery", "offline", "break"],
                default: "offline",
                index: true,
            },
            currentOrders: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Order'
            }], // Orders currently being handled
            earnings: {
                type: Number,
                default: 0,
            },
            totalEarnings:{
                  type: Number,
                default: 0,
            },
            paymentDetails: {
                method: {
                    type: String,
                    enum: ["bank_transfer", "upi", "other"],
                    trim: true
                },
                accountDetails: mongoose.Schema.Types.Mixed, // Flexible for different payment methods
            },
            preferredDeliveryRadius: {
                type: Number,
                default: 5, // in kilometers
            },
            lastActive: { type: Date }, // Last time the delivery partner was active
            rating: {
                type: Number,
                default: 0,
                min: 0,
                max: 5,
                index: true,
            }, //  Average rating
            totalDeliveries: { type: Number, default: 0 },
            bio: { type: String, trim: true, maxLength: 500 }, // Short bio for delivery partner profile
            documents: [{  // storing URLs of documents
                type: String,
            }],
            bankDetails: {
                accountHolderName: { type: String, trim: true },
                accountNumber: { type: String, trim: true },
                ifscCode: { type: String, trim: true },
                bankName: { type: String, trim: true },
            },
            location: {  // Current location of the delivery partner
                type: {
                    type: String,
                    enum: ['Point'], // 'Point' for GeoJSON Point
                    default: 'Point',
                },
                coordinates: {
                    type: [Number], // [longitude, latitude]
                    index: '2dsphere',         //  for geospatial queries
                },
            },
            operatingAreas: [{ // Array of areas (e.g., city, postal codes)
                type: String,
                trim: true
            }],
            branchStation: {  // Add branch station
                type: mongoose.Schema.Types.ObjectId,
                ref: 'BranchStation',
                index: true,
            }
        },
        // --- Become a Delivery Partner Request ---
        deliveryPartnerApplication: {
            // To store the application details when a user applies to become a delivery partner
            status: {
                type: String,
                enum: ["pending", "processing", "approved", "rejected"],
                default: "pending",
                index: true,
            },
            applicationDate: { type: Date, default: Date.now },
            vehicleType: {
                type: String,
                enum: ["motorcycle", "car", "bicycle", "scooter", "other"],
                trim: true,
            },
            licenseNumber: { type: String, trim: true },
            licenseExpiryDate: { type: Date },
            insuranceNumber: { type: String, trim: true },
            insuranceExpiryDate: { type: Date },
            vehicleNumber: { type: String, trim: true },
            aadharNumber: { type: String, trim: true },
            documents: [{  // storing URLs of documents
                type: String,
            }],
            rejectionReason: { type: String, trim: true }, // Store reason if application is rejected
            branchStation: {  // 신청자가 희망하는 지점
                type: mongoose.Schema.Types.ObjectId,
                ref: 'BranchStation',
                index: true,
            }
        },
        // --- Branch Manager Specific Fields ---
        managedBranch: { //  For Branch Manager
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BranchStation',
            index: true,
        },
        // --- Branch Manager Application ---
        managerApplication: {  // User applying to become a branch manager
            branchStation: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'BranchStation',
                index: true,
            },
            status: {
                type: String,
                enum: ['pending', 'approved', 'rejected'],
                default: 'pending',
                index: true
            },
            applicationDate: { type: Date, default: Date.now },
            reason: { type: String, trim: true },
            documents: [{ type: String }],
            rejectionReason: { type: String, trim: true },
        },
        assignedOrders: [{ // Orders assigned to this delivery partner
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            index: true,
        }],
    },
    {
        timestamps: true,
    }
);

// Hash Password Middleware
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
});

// Method to Match Password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;