import { asyncHandler } from "../utils/asyncHandler.js"
import { Patient, User, FoodChart, PantryStaff, Delivery, Doctor } from "../model/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import mongoose from "mongoose"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password, AccountType } = req.body;

    if ([fullName, email, username, password, AccountType].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) throw new ApiError(409, "User with email or username already exists");

    // FIX: null check before accessing image path
    let coverImageUrl = "";
    if (req.files?.coverImage?.[0]?.path) {
        const coverImage = await uploadOnCloudinary(req.files.coverImage[0].path);
        coverImageUrl = coverImage?.url || "";
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        coverImage: coverImageUrl,
        AccountType,
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) throw new ApiError(500, "Something went wrong while registering the user");

    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const registerDoctor = asyncHandler(async (req, res) => {
    const { fullName, email, specialization, website, Contact_Number, bio, age, experience } = req.body;

    if ([fullName, email, specialization, Contact_Number].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All required fields must be filled");
    }

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) throw new ApiError(409, "Doctor with this email already exists");

    let coverImageUrl = "";
    if (req.files?.doctorImage?.[0]?.path) {
        const cloudImage = await uploadOnCloudinary(req.files.doctorImage[0].path);
        coverImageUrl = cloudImage?.url || "";
    }

    const doctor = await Doctor.create({
        fullName, email, specialization, website,
        Contact_Number, bio, age, experience,
        coverImage: coverImageUrl,
    });

    return res.status(201).json(new ApiResponse(201, doctor, "Doctor registered successfully"));
});

const getAllDoctors = asyncHandler(async (req, res) => {
    const doctors = await Doctor.find({});
    return res.status(200).json(new ApiResponse(200, doctors, "Doctors fetched successfully"));
});

const login = asyncHandler(async(req, res) => {
    const { email, password } = req.body;

    if (!email) throw new ApiError(400, "Email is required");

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User does not exist");

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = { httpOnly: true, secure: true };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});

const PatientDetail = asyncHandler(async (req, res) => {
    const {
        patientName, disease, allergies, bloodGroup,
        roomNumber, bedNumber, floorNumber, age, gender,
        contactInformation, emergencyContact, organAffected
    } = req.body;

    if (!patientName || !disease || !roomNumber || !bedNumber) {
        throw new ApiError(400, "Please fill in all required fields");
    }

    // FIX: null check before accessing image
    let coverImageUrl = "";
    if (req.files?.patientimage?.[0]?.path) {
        const coverImage = await uploadOnCloudinary(req.files.patientimage[0].path);
        coverImageUrl = coverImage?.url || "";
    }

    const patient = await Patient.create({
        patientName, disease, allergies, bloodGroup,
        roomNumber, bedNumber, floorNumber, age, gender,
        contactInformation, emergencyContact, organAffected,
        coverImage: coverImageUrl
    });

    return res.status(201).json(new ApiResponse(201, patient, "Patient registered successfully"));
});

const retrievePatient = asyncHandler(async (req, res) => {
    const allData = await Patient.find({});
    return res.status(200).json(new ApiResponse(200, allData, "Patients fetched successfully"));
});

const foodChartMenu = asyncHandler(async(req, res) => {
    const {
        morning, evening, nightMeal,
        morningIngredients, eveningIngredients, nightIngredients,
        specialInstructions
    } = req.body;

    if (!morning || !evening || !nightMeal) {
        throw new ApiError(400, "Morning, evening and night meal are required");
    }

    // FIX: null checks on all 3 images — any can be optional
    let img1 = "", img2 = "", img3 = "";
    if (req.files?.coverImage1?.[0]?.path) {
        const r = await uploadOnCloudinary(req.files.coverImage1[0].path);
        img1 = r?.url || "";
    }
    if (req.files?.coverImage2?.[0]?.path) {
        const r = await uploadOnCloudinary(req.files.coverImage2[0].path);
        img2 = r?.url || "";
    }
    if (req.files?.coverImage3?.[0]?.path) {
        const r = await uploadOnCloudinary(req.files.coverImage3[0].path);
        img3 = r?.url || "";
    }

    const foodChart = await FoodChart.create({
        morning, evening, nightMeal,
        morningIngredients, eveningIngredients, nightIngredients,
        specialInstructions,
        coverImage1: img1,
        coverImage2: img2,
        coverImage3: img3
    });

    return res.status(201).json(new ApiResponse(201, foodChart, "Food chart created successfully"));
});

const pantrypersonal = asyncHandler(async(req, res) => {
    const { name, contactInfo, deliveryStatus } = req.body;

    if (!name || !contactInfo || !deliveryStatus) {
        throw new ApiError(400, "Please fill all required fields");
    }

    // FIX: null check on image
    let coverImageUrl = "";
    if (req.files?.pantrypersonal?.[0]?.path) {
        const coverImage = await uploadOnCloudinary(req.files.pantrypersonal[0].path);
        coverImageUrl = coverImage?.url || "";
    }

    const pantryPersonal = await PantryStaff.create({
        name, contactInfo, deliveryStatus,
        coverImage: coverImageUrl
    });

    return res.status(201).json(new ApiResponse(201, pantryPersonal, "Pantry staff added successfully"));
});

const particularPatientDetail = asyncHandler(async(req, res) => {
    const { object_id } = req.body;
    const patientdetail = await Patient.findById(object_id);
    if (!patientdetail) throw new ApiError(404, "Patient not found");
    return res.status(200).json(new ApiResponse(200, patientdetail, "Patient fetched successfully"));
});

const ManagerDetail = asyncHandler(async(req, res) => {
    const { object_id } = req.body;
    const managerdetail = await User.findById(object_id);
    if (!managerdetail) throw new ApiError(404, "Manager not found");
    return res.status(200).json(new ApiResponse(200, managerdetail, "Manager fetched successfully"));
});

const fetchFoodMenu = asyncHandler(async(req, res) => {
    const menu = await FoodChart.find({});
    return res.status(200).json(new ApiResponse(200, menu, "Menu fetched successfully"));
});

const fetchPantryDetail = asyncHandler(async(req, res) => {
    const staffData = await PantryStaff.find({});
    return res.status(200).json(new ApiResponse(200, staffData, "Staff fetched successfully"));
});

const updateStaff = asyncHandler(async (req, res) => {
    const { id, delivery } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid ID format");
    const update = await PantryStaff.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        { $set: { deliveryStatus: delivery } }
    );
    if (update.matchedCount === 0) throw new ApiError(404, "Staff not found");
    return res.status(200).json(new ApiResponse(200, null, "Staff updated successfully"));
});

const delivery = asyncHandler(async (req, res) => {
    const allData = await Delivery.find({}).populate("patient").populate("staff");
    return res.status(200).json(new ApiResponse(200, allData, "Deliveries fetched successfully"));
});

const assignDelivery = asyncHandler(async(req, res) => {
    const { patient, staff } = req.body;
    const deliveries = await Delivery.create({ patient, staff });
    return res.status(200).json(new ApiResponse(200, deliveries, "Delivery assigned successfully"));
});

const deliveryDone = asyncHandler(async(req, res) => {
    const { id } = req.body;
    const deleteObject = await Delivery.deleteOne({ _id: id });
    if (!deleteObject) throw new ApiError(404, "Delivery not found");
    return res.status(200).json(new ApiResponse(200, deleteObject, "Delivery completed successfully"));
});

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true });
    const options = { httpOnly: true, secure: true };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const updateDoctorDetails = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const { fullName, email, specialization, gender, age, experience, Contact_Number, contact_number } = req.body;
    const contactNumber = Contact_Number || contact_number;

    const updateFields = {
        ...(fullName && { fullName }),
        ...(email && { email }),
        ...(specialization && { specialization }),
        ...(contactNumber && { Contact_Number: contactNumber }),
        ...(gender && { gender }),
        ...(age && { age }),
        ...(experience && { experience }),
    };

    if (req.files?.coverImage?.[0]?.path) {
        const uploadedImage = await uploadOnCloudinary(req.files.coverImage[0].path);
        updateFields.coverImage = uploadedImage?.url || "";
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, updateFields, { new: true, runValidators: true });
    if (!updatedDoctor) throw new ApiError(404, "Doctor not found");

    return res.status(200).json(new ApiResponse(200, updatedDoctor, "Doctor updated successfully"));
});

const updateFoodMenu = asyncHandler(async (req, res) => {
    const { menuId } = req.params;
    if (!menuId) throw new ApiError(400, "Menu ID is required");

    const updatedMenu = await FoodChart.findByIdAndUpdate(menuId, req.body, { new: true, runValidators: true });
    if (!updatedMenu) throw new ApiError(404, "Menu not found");

    return res.status(200).json(new ApiResponse(200, updatedMenu, "Menu updated successfully"));
});

export {
    registerUser, generateAccessAndRefreshToken, login,
    PatientDetail, foodChartMenu, pantrypersonal,
    retrievePatient, particularPatientDetail,
    fetchFoodMenu, fetchPantryDetail, updateStaff,
    delivery, assignDelivery, deliveryDone,
    logoutUser, ManagerDetail, registerDoctor,
    getAllDoctors, updateDoctorDetails, updateFoodMenu,
};
