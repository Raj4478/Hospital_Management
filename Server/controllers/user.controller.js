import { asyncHandler } from "../utils/asyncHandler.js"
import { Patient, User,FoodChart, PantryStaff,Delivery,Doctor } from "../model/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        
        
        const accessToken = user.generateAccessToken()

        console.log("accessToken is",accessToken);
        const refreshToken = user.generateRefreshToken()
        
        console.log("refreshToken is",refreshToken);

        

        user.refreshToken = refreshToken

        await user.save({validateBeforeSave : false})

        return {accessToken,refreshToken}


    } catch (error) {
        
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    


    const {fullName, email, username, password,AccountType} = req.body

    console.log("fullname is ",fullName);
    
 
    
    
    

    if (
        [fullName, email, username, password,AccountType].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    console.log("req body is ",req.files);

   
   let coverImageLocalPath;

   

   
    coverImageLocalPath = req.files.coverImage[0].path
    console.log("coverImageLocalPath",coverImageLocalPath);
    
   
 
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)
   
   console.log("coverImage",coverImage);

    const user = await User.create({
        fullName,
        email, 
        password,
        username: username.toLowerCase(),
        coverImage: coverImage?.url || "",
        AccountType,
    })

    const createdUser = await User.findById(user._id).select(
         "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )


const registerDoctor = asyncHandler(async (req, res) => {
    const {
    fullName,
    email,
    specialization,
    website,
    Contact_Number,
    bio,
    age,
    experience,
    
    } = req.body;
    
    if (
    [fullName, email, specialization, Contact_Number].some(
    (field) => typeof field === "undefined" || field?.trim() === ""
    )
    ) {
    throw new ApiError(400, "All required fields must be filled");
    }
    
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
    throw new ApiError(409, "Doctor with this email already exists");
    }
    
    let coverImageUrl = "";
    if (req.files?.doctorImage?.[0]?.path) {
    const localPath = req.files.doctorImage[0].path;
    const cloudImage = await uploadOnCloudinary(localPath);
    coverImageUrl = cloudImage?.url || "";
    }
    
    const doctor = await Doctor.create({
    fullName,
    email,
    specialization,
    website,
    Contact_Number,
    bio,
    age,
    experience,
    coverImage: coverImageUrl,
    });
    
    if (!doctor) {
    throw new ApiError(500, "Failed to register doctor");
    }
    
    return res
    .status(201)
    .json(new ApiResponse(201, doctor, "Doctor registered successfully"));
    });
    
    
  const getAllDoctors = asyncHandler(async (req, res) => {
    const doctors = await Doctor.find({});
  
    if (!doctors || doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No doctors found",
      });
    }
  
    return res.status(200).json({
      success: true,
      message: doctors,
    });
  });
  
  

const login = asyncHandler(async(req,res) => {

const {email,password,AccountType} = req.body

if(!email){

    throw new ApiError(400,"Email is required")
}

const user = await User.findOne({
    $or : [{email}]
})
console.log(user);


if(!user){
    throw new ApiError(404,"User does not exist")
}
const isPasswordValid = await user.isPasswordCorrect(password)

if(!isPasswordValid){
    throw new ApiError(401,"Invalid User Credentials")
}

const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

const options = {
    httpOnly : true,
    secure : true
}

return res
.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
    new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"User successfully logged in")
)
})
const PatientDetail = asyncHandler(async (req, res) => {
    const {
      patientName,
      disease,
      allergies,
      bloodGroup,
      roomNumber,
      bedNumber,
      floorNumber,
      age,
      gender,
      contactInformation,
      emergencyContact,
      organAffected // ✅ Match frontend field name
    } = req.body;
  
    console.log("Patient data received:", req.body);
  
    // Validate required fields
    if (!patientName || !disease || !roomNumber || !bedNumber) {
      throw new ApiError(400, "Please fill in all required data");
    }
  
    // Check if a patient with the same floorNumber or bedNumber already exists
    const existedPatient = await User.findOne({
      $or: [{ floorNumber }, { bedNumber }]
    });
  
    if (existedPatient) {
      throw new ApiError(409, "User with the provided floor or bed number already exists");
    }
  
    let coverImage; // ✅ Declare here so it’s accessible outside the if block
  
    // Handle image upload
    if (req.files && req.files.patientimage) {
      const coverImageLocalPath = req.files.patientimage[0].path;
      console.log("Cover Image Local Path:", coverImageLocalPath);
  
      coverImage = await uploadOnCloudinary(coverImageLocalPath);
      console.log("Cover Image URL:", coverImage.url);
    }
  
    // Create patient record
    const patient = await Patient.create({
      patientName,
      disease,
      allergies,
      bloodGroup,
      roomNumber,
      bedNumber,
      floorNumber,
      age,
      gender,
      contactInformation,
      emergencyContact,
      organAffected, // ✅ Correctly mapping form field to schema
      coverImage: coverImage?.url || " "
    });
  
    console.log("Created patient:", patient);
  
    // Verify patient creation
    const createdPatient = await Patient.findById(patient._id);
  
    if (!createdPatient) {
      throw new ApiError(500, "Something went wrong while registering the user");
    }
  
    return res.status(201).json(
      new ApiResponse(200, createdPatient, "User registered successfully")
    );
  });
  

const retrievePatient = asyncHandler(async (req, res) => {
    
    const allData = await Patient.find({});
  
    console.log("Data retrieved successfully:", allData);
  
    
    if (!allData || allData.length === 0) {
      throw new ApiError(404, "Patient data not fetched successfully");
    }
  

    return res.status(200).json(
      new ApiResponse(200, allData, "Data retrieved successfully")
    );
  });
  


const foodChartMenu = asyncHandler(async(req,res)=>{

    const{morning,evening,nightMeal,morningIngriends,eveningIngrediends,nightIngriends,specialInstructions} = req.body


    console.log("req.body is",req.body);

    console.log("req.files is",req.files);
    
    if(!morning || !evening || !nightMeal){
        throw new ApiError(400,"Please fill the data")
    }

    let coverImageLocalPath1;

   

   
    coverImageLocalPath1 = req.files.coverImage1[0].path
    console.log("coverImageLocalPath1",coverImageLocalPath1);

    let coverImageLocalPath2;

   

   
    coverImageLocalPath2 = req.files.coverImage2[0].path
    console.log("coverImageLocalPath2",coverImageLocalPath2);
    
   
 
   const coverImage1 = await uploadOnCloudinary(coverImageLocalPath1)
   
   console.log("coverImage1",coverImage1);
    
   
 
   const coverImage2 = await uploadOnCloudinary(coverImageLocalPath2)
   
   console.log("coverImage2",coverImage2);


   let coverImageLocalPath3;

   

   
    coverImageLocalPath3 = req.files.coverImage3[0].path
    console.log("coverImageLocalPath3",coverImageLocalPath3);
    
   
 
   const coverImage3 = await uploadOnCloudinary(coverImageLocalPath3)
   
   console.log("coverImage3",coverImage3);

    const foodChart = await FoodChart.create({
        morning,
        evening,
        nightMeal,
        morningIngriends,
        eveningIngrediends,
        nightIngriends,
        specialInstructions,
        coverImage1 : coverImage1.url || " ",
        coverImage2 : coverImage2.url || " ",
        coverImage3 : coverImage3.url || " "
    })

    const createdFoodChart = await FoodChart.findById(foodChart._id)

    if (!createdFoodChart) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdFoodChart, "User registered Successfully"))

})

const pantrypersonal = asyncHandler(async(req,res)=>{

    const{name,contactInfo,deliveryStatus} = req.body

    if(!name || !contactInfo || !deliveryStatus){
        throw new ApiError(400,"Please fill the data")
    }

    let coverImageLocalPath;

    console.log(req.files);
    
  
    coverImageLocalPath = req.files.pantrypersonal[0].path
        console.log("coverImageLocalPath",coverImageLocalPath);
    
    


   
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
   
   console.log("coverImage",coverImage);

    const pantryPersonal = await PantryStaff.create({
        name,
        contactInfo,
        deliveryStatus,
        coverImage : coverImage.url || " "
    })

    const createdPantryPersonal = await PantryStaff.findById(pantryPersonal._id)

    if (!createdPantryPersonal) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdPantryPersonal, "User registered Successfully"))

})

const particularPatientDetail = asyncHandler(async(req,res)=> {


    const {object_id} = req.body
    const patientdetail = await Patient.findById(object_id)
    

    if(!patientdetail){
        throw new ApiError(404,"Patient detail not fetched")
        
    }

    return res.status(200).json(
        new ApiResponse(200, patientdetail, "Data retrieved successfully")
      );

})

const ManagerDetail = asyncHandler(async(req,res)=> {


    const {object_id} = req.body
    const managerdetail = await User.findById(object_id)
    

    if(!managerdetail){
        throw new ApiError(404,"Manager detail not fetched")
        
    }

    return res.status(200).json(
        new ApiResponse(200, managerdetail, "Data retrieved successfully")
      );

})

const fetchFoodMenu = asyncHandler(async(req,res)=> {

    const menu = await FoodChart.find({})

    if(!menu){
        throw new ApiError(404,"failed to fetch menu Chart")
    }

    return res.status(200).json(
        new ApiResponse(200,menu,"Menu retrieved successfully")
    )

})


const fetchPantryDetail = asyncHandler(async(req,res)=> {

    const staffData = await PantryStaff.find({})

    if(!staffData){
        throw new ApiError(404,"failed to fetch Pantry Personal")
    }

    return res.status(200).json(
        new ApiResponse(200,staffData,"Staff data retrieved successfully")
    )

})


    

    const updateStaff = asyncHandler(async (req, res) => {
        const { id, delivery } = req.body;
    
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(400, "Invalid ID format");
        }
    
        
        const update = await PantryStaff.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: { deliveryStatus: delivery } }
        );
    
        
        if (update.matchedCount === 0) {
            throw new ApiError(404, "No staff found with the given ID");
        }
    
        
        return res.status(200).json(
            new ApiResponse(200,null, "Staff data updated successfully")
        );
    });

    const delivery = asyncHandler(async (req, res) => {
    
        const allData = await Delivery.find({}).populate("patient")
        .populate("staff");
      
        console.log("Data retrieved successfully:", allData);
      
        
        if (!allData) {
          throw new ApiError(404, "Delivery data not fetched successfully");
        }
      
    
        return res.status(200).json(
          new ApiResponse(200, allData, "Data retrieved successfully")
        );
      });

      const assignDelivery = asyncHandler(async(req,res)=>{
        const{patient,staff} = req.body
        console.log(req.body);
        

        const deliveries = await Delivery.create({
            patient,
            staff
        })

        if (!deliveries) {
            throw new ApiError(404, "Delivery data not submitted successfully");
          }
        
      
          return res.status(200).json(
            new ApiResponse(200, deliveries, "Data submitted successfully")
          );
      })

      const deliveryDone = asyncHandler(async(req,res)=>{
        const {id} = req.body

        const deleteObject = await Delivery.deleteOne({_id : id})

        if(!deleteObject){
            throw new ApiError(404,"failed to delete object")
        }
    
        return res.status(200).json(
            new ApiResponse(200,deleteObject,"Object deleted successfully")
        )
      })


      const logoutUser = asyncHandler(async(req, res) => {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1 // this removes the field from document
                }
            },
            {
                new: true
            }
        )
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
    })

    const updateDoctorDetails = asyncHandler(async (req, res) => {
        const { doctorId } = req.params;
        
        const {
        fullName,
        email,
        specialization,
        gender,
        age,
        experience,
        Contact_Number,
        contact_number, // from frontend if using lowercase
        } = req.body;
        
        console.log("req nody is",req.body);
        
        const contactNumber = Contact_Number || contact_number;
        
        const updateFields = {
        ...(typeof fullName !== "undefined" && { fullName }),
        ...(typeof email !== "undefined" && { email }),
        ...(typeof specialization !== "undefined" && { specialization }),
        ...(typeof contactNumber !== "undefined" && { Contact_Number: contactNumber }),
        ...(typeof gender !== "undefined" && { gender }),
        ...(typeof age !== "undefined" && { age }),
        ...(typeof experience !== "undefined" && { experience }),
        };
        
        if (req.files?.coverImage?.[0]?.path) {
        const imagePath = req.files.coverImage[0].path;
        const uploadedImage = await uploadOnCloudinary(imagePath);
        updateFields.coverImage = uploadedImage?.url || "";
        }
        
        const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, updateFields, {
        new: true,
        runValidators: true,
        });
        
        if (!updatedDoctor) {
        throw new ApiError(404, "Doctor not found");
        }
        
        res.status(200).json({
        success: true,
        message: "Doctor details updated successfully.",
        doctor: updatedDoctor,
        });
        });
      
        const updateFoodMenu = asyncHandler(async (req, res) => {
            const { menuId } = req.params;
          
            console.log("Incoming update request:", req.body);
console.log("Menu ID:", req.params.menuId);
            if (!menuId) {
              throw new ApiError(400, "Menu ID is required");
            }
          
            const updatedMenu = await FoodChart.findByIdAndUpdate(menuId, req.body, {
              new: true,
              runValidators: true,
            });
          
            if (!updatedMenu) {
              throw new ApiError(404, "Menu not found or failed to update");
            }
          
            return res.status(200).json({
                success: true,
                data: updatedMenu,
                message: "Menu updated successfully",
              });
              
          });
          
    

export {

    registerUser,
    generateAccessAndRefreshToken,
    login,
    PatientDetail,
    foodChartMenu,
    pantrypersonal,
    retrievePatient,
    particularPatientDetail,
    fetchFoodMenu,
    fetchPantryDetail,
    updateStaff,
    delivery,
    assignDelivery,
    deliveryDone,
    logoutUser,
    ManagerDetail,
    registerDoctor,
    getAllDoctors,
    updateDoctorDetails,
    updateFoodMenu,
}