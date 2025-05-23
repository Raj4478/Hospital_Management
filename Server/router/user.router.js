import { Router } from "express";
import { registerUser,
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
    ManagerDetail,
    registerDoctor,
     logoutUser,
     updateDoctorDetails,
     updateFoodMenu,
     getAllDoctors} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name : "coverImage",
            maxCount:1
        }
    ])
    ,registerUser
)

router.route("/login").post(login)

router.route("/patientDetail").post(
  verifyJWT,  upload.fields([{
        name : "patientimage",
        maxCount : 1
    }]),PatientDetail
)

router.route("/foodchartmenu").post(
  verifyJWT,  upload.fields([{
        name : "coverImage1",
        maxCount : 1
    },{
        name : "coverImage2",
        maxCount : 1
    },
    {
        name : "coverImage3",
        maxCount : 1
    }]),foodChartMenu
)
router.route("/pantry").post(
 verifyJWT,   upload.fields([
      {  name : "pantrypersonal",
        maxCount : 1
      }
    ]),
    pantrypersonal
)

router.route("/patientdata").get(verifyJWT,retrievePatient)

router.route("/getalldoctors").get(verifyJWT,getAllDoctors)

router.route("/registerDoctor").post(
    verifyJWT,
    upload.fields([
      {
        name: "doctorImage", // or whatever field name you're sending in FormData
        maxCount: 1
      }
    ]),
    registerDoctor
  );

  router.put(
    "/editDoctor/:doctorId",
    verifyJWT,
    upload.fields([{ name: "coverImage", maxCount: 1 }]),
    updateDoctorDetails
    );

    router.route("/menu/:menuId").put(verifyJWT, updateFoodMenu);

router.route("/particularpatientdata").post(verifyJWT,particularPatientDetail)

router.route("/managerdata").post(verifyJWT,ManagerDetail)

router.route("/menu").get(verifyJWT,fetchFoodMenu)

router.route("/pantrydetail").get(verifyJWT,fetchPantryDetail)
router.route("/updatestaff").post(verifyJWT,updateStaff)

router.route("/delivery").get(verifyJWT,delivery)

router.route("/assigndelivery").post(verifyJWT,assignDelivery)

router.route("/deleteObject").post(verifyJWT,deliveryDone)

router.route("/logout").post(verifyJWT,logoutUser)

export default router