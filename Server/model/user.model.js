import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { Schema } from "mongoose";

const userSchema = mongoose.Schema(
    {
        username : {
            type: String,
            required : true,
            unique: true,
            lowercase : true,
            trim : true,
            index:true
            
        },
        email:{
            type: String,
            required : true,
            unique: true,
            trim : true
        },
        password:{
            type: String,
            required : true,

        },
        coverImage :{
         type : String
        },
        fullName: {
            type:String,
            required:true,
            trim : true,
            index:true
        },
        AccountType: {
            type: String,
            required:true,
            trim : true,
        index:true
            
        },
        
       
        
        refreshToken : {
            type : String,
        }
        },
        { timestamps : true }
    
);



const patientSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    disease: {
        type: String,
        required: true,
        trim: true
    },
    allergies: {
        type: String,
        lowercase: true,
        trim: true
    },
    coverImage: {
        type: String
    },
    bloodGroup: {
        type: String,
        lowercase: true,
        trim: true,
        required: true
    },
    roomNumber: {
        type: String,
        lowercase: true,
        required: true,
        trim: true
    },
    bedNumber: {
        type: String,
        lowercase: true,
        required: true,
        trim: true
    },
    floorNumber: {
        type: String,
        lowercase: true,
        trim: true
    },
    age: {
        type: String,
        lowercase: true,
        trim: true
    },
    gender: {
        type: String,
        lowercase: true,
        trim: true
    },
    contactInformation: {
        type: String,
        lowercase: true,
        trim: true
    },
    emergencyContact: {
        type: String,
        lowercase: true,
        trim: true
    },
    object_id: {
        type: String
    },
    organAffected: {
        type: String, // An array of strings to store multiple affected organs
        lowercase: true,
        trim: true
    }
}, { timestamps: true });




const doctorSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  specialization: {
    type: String,
 required: true,
    
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    match: [/.+\@.+\..+/, "Please enter a valid email address"],
  },
  website: {
    type: String,
    trim: true,
    lowercase: true,
  },
  Contact_Number: {
    type: String,
    required: true,
    match: [/^\+?\d{1,4}[-.\s]?\d{3,5}[-.\s]?\d{4,6}$/, "Please enter a valid phone number"],
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  coverImage: {
    type: String, // can be base64 or URL
    trim: true,
  },
  age:{
    type: Number,
    trim: true,
  },
  experience:{
    type: Number,
    trim: true,
  },
  object_id: {
    type: String,
    
  },
  patientassigned:{
    type: Array,
    
  }
}, {
  timestamps: true,
});


const foodChartSchema = ({

    morning : {
        type : String,
        required : true,
        lowercase : true,
        trim : true
    },
    evening : {
        type : String,
        required : true,
        lowercase : true,
        trim : true
    },
    coverImage1 :{
        type : String
       },
       coverImage2 :{
        type : String
       },
       coverImage3 :{
        type : String
       },
    nightMeal : {
        type : String,
        required : true,
        lowercase : true,
        trim : true
    },
    morningIngriends : {
        type : String,
    },
    eveningIngriends : {
        type : String,
    },
    nightIngriends : {
        type : String,
    },
    specialInstructions : {
        type : String
    }
})

const pantryStaffSchema = mongoose.Schema({
    name : {
        type : String,
        required : true,
        lowercase : true,
        trim : true
    },
    contactInfo : {
        type : String,
        required : true,
        lowercase : true,
        trim : true
    },
    coverImage :{
        type : String
       },
    deliveryStatus : {
        type : String,
        
        lowercase : true,
        trim: true
    },
})

const deliverySchema = mongoose.Schema({
  patient : { type: Schema.Types.ObjectId,
     ref : "Patient"
   },
   staff : {
     type: Schema.Types.ObjectId,
     ref : "PantryStaff"
   }
})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    console.log("password is",password);
    console.log("bcrypt password is",this.password);

console.log(await bcrypt.compare(password,this.password));

    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function () {
    try {
      return jwt.sign(
        {
          _id: this._id,
          email: this.email,
          username: this.username,
          fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
      );
    } catch (error) {
      console.error("Error generating access token:", error);
      throw new Error("Access token generation failed");
    }
  };
  

  userSchema.methods.generateRefreshToken = function () {
    try {
        return jwt.sign(
            {
                _id: this._id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
            }
        );
    } catch (error) {
        console.log("Error in generating refresh token:", error);
        return new Error("refresh token generation failed")
    }
};


export const User = mongoose.model("User", userSchema);
export const Patient = mongoose.model("Patient",patientSchema);
export const FoodChart = mongoose.model("FoodChart",foodChartSchema);
export const PantryStaff = mongoose.model("PantryStaff",pantryStaffSchema);
export const Delivery = mongoose.model("Delivery",deliverySchema)

export const Doctor = mongoose.model("Doctor",doctorSchema);