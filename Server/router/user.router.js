import { Router } from "express";
import rateLimit from "express-rate-limit";
import { verifyJWT, authorize } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import * as S from "../validators/schemas.js";
import * as auth from "../controllers/user.controller.js";
import * as patients from "../controllers/patient.controller.js";
import * as doctors from "../controllers/doctor.controller.js";
import * as diet from "../controllers/dietPlan.controller.js";
import * as staff from "../controllers/staff.controller.js";
import * as deliveries from "../controllers/delivery.controller.js";
import * as dashboard from "../controllers/dashboard.controller.js";
import { env } from "../config/env.js";

const router = Router();
const MANAGER = authorize("Manager");
const ANY_ROLE = authorize("Manager", "Pantry");
const photo = upload.single("photo");
const id = validate(S.idParam, "params");

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: env.isTest ? 1000 : 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, statusCode: 429, message: "Too many attempts. Try again in a few minutes.", errors: [] },
});

// ── Auth ────────────────────────────────────────────────────────────────
router.get("/auth/signup-options", auth.signupOptions);
router.post("/auth/register", authLimiter, upload.single("avatar"), validate(S.registerSchema), auth.register);
router.post("/auth/login", authLimiter, validate(S.loginSchema), auth.login);
router.post("/auth/refresh", authLimiter, auth.refresh);
router.post("/auth/logout", auth.logout);
router.get("/auth/me", verifyJWT, auth.me);

// Everything below needs a signed-in user.
router.use(verifyJWT, ANY_ROLE);

// ── Dashboard ───────────────────────────────────────────────────────────
router.get("/dashboard", dashboard.summary);

// ── Patients ────────────────────────────────────────────────────────────
router.get("/patients", patients.listPatients);
router.get("/patients/export", MANAGER, patients.exportPatients);
router.get("/patients/:id", id, patients.getPatient);
router.post("/patients", MANAGER, photo, validate(S.patientSchema), patients.createPatient);
router.patch("/patients/:id", MANAGER, id, photo, validate(S.patientUpdateSchema), patients.updatePatient);
router.post("/patients/:id/discharge", MANAGER, id, patients.dischargePatient);

// ── Doctors ─────────────────────────────────────────────────────────────
router.get("/doctors", doctors.listDoctors);
router.get("/doctors/specializations", doctors.specializations);
router.post("/doctors", MANAGER, photo, validate(S.doctorSchema), doctors.createDoctor);
router.patch("/doctors/:id", MANAGER, id, photo, validate(S.doctorUpdateSchema), doctors.updateDoctor);
router.delete("/doctors/:id", MANAGER, id, doctors.deleteDoctor);

// ── Diet plans ──────────────────────────────────────────────────────────
const mealImages = upload.fields([
    { name: "morningImage", maxCount: 1 },
    { name: "eveningImage", maxCount: 1 },
    { name: "nightImage", maxCount: 1 },
]);
router.get("/diet-plans", diet.listDietPlans);
router.post("/diet-plans", MANAGER, mealImages, validate(S.dietPlanSchema), diet.createDietPlan);
router.patch("/diet-plans/:id", MANAGER, id, mealImages, validate(S.dietPlanUpdateSchema), diet.updateDietPlan);

// ── Pantry staff (managed by both roles: the pantry lead runs their own team) ──
router.get("/staff", staff.listStaff);
router.post("/staff", photo, validate(S.staffSchema), staff.createStaff);
router.patch("/staff/:id", id, photo, validate(S.staffUpdateSchema), staff.updateStaff);
router.delete("/staff/:id", MANAGER, id, staff.deleteStaff);

// ── Meal deliveries ─────────────────────────────────────────────────────
router.get("/deliveries", deliveries.listDeliveries);
router.post("/deliveries", validate(S.deliverySchema), deliveries.createDelivery);
router.patch("/deliveries/:id/status", id, validate(S.deliveryStatusSchema), deliveries.updateDeliveryStatus);

export default router;
