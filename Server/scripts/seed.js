// Fills an empty database with demo data: `npm run seed` (add --force to wipe first).
import { env, assertEnv } from "../config/env.js";
import { connectDB, disconnectDB } from "../config/db.js";
import { User, Patient, Doctor, DietPlan, PantryStaff, Delivery } from "../model/index.js";

assertEnv();
await connectDB(env.mongoUri);

const force = process.argv.includes("--force");
if (await Patient.estimatedDocumentCount() && !force) {
    console.log("Database already has data. Re-run with --force to wipe it and reseed.");
    await disconnectDB();
    process.exit(0);
}
if (force) {
    await Promise.all([User, Patient, Doctor, DietPlan, PantryStaff, Delivery].map((M) => M.deleteMany({})));
}

const password = process.env.SEED_PASSWORD || "Demo@1234";
const [manager] = await User.create([
    { fullName: "Asha Verma", username: "manager", email: "manager@medicare.test", password, AccountType: "Manager" },
    { fullName: "Ravi Kumar", username: "pantry", email: "pantry@medicare.test", password, AccountType: "Pantry" },
]);

const doctors = await Doctor.create([
    { fullName: "Dr. Meera Iyer", specialization: "Cardiology", email: "meera@medicare.test", Contact_Number: "+91 98100 11111", experience: 14, age: 44 },
    { fullName: "Dr. Arjun Rao", specialization: "Endocrinology", email: "arjun@medicare.test", Contact_Number: "+91 98100 22222", experience: 9, age: 38 },
    { fullName: "Dr. Kavya Nair", specialization: "Gastroenterology", email: "kavya@medicare.test", Contact_Number: "+91 98100 33333", experience: 6, age: 34, available: false },
]);

const patients = await Patient.create([
    { patientName: "Rohan Mehta", disease: "Type 2 diabetes", bloodGroup: "B+", age: 52, gender: "male", floorNumber: "2", roomNumber: "204", bedNumber: "A", allergies: "Peanuts", assignedDoctor: doctors[1]._id },
    { patientName: "Sunita Sharma", disease: "Post-operative recovery", bloodGroup: "O+", age: 61, gender: "female", floorNumber: "2", roomNumber: "206", bedNumber: "B", assignedDoctor: doctors[0]._id },
    { patientName: "Imran Khan", disease: "Hypertension", bloodGroup: "A-", age: 47, gender: "male", floorNumber: "3", roomNumber: "301", bedNumber: "A", allergies: "Lactose", assignedDoctor: doctors[0]._id },
    { patientName: "Priya Desai", disease: "Gastritis", bloodGroup: "AB+", age: 29, gender: "female", floorNumber: "3", roomNumber: "305", bedNumber: "C", assignedDoctor: doctors[2]._id },
]);

const meal = (m, i = "") => ({ meal: m, ingredients: i });
const plans = await DietPlan.create([
    { patient: patients[0]._id, morning: meal("Vegetable oats upma", "Oats, carrots, beans"), evening: meal("Moong dal soup"), night: meal("2 multigrain rotis, lauki sabzi"), specialInstructions: "No added sugar. Peanut-free kitchen.", createdBy: manager._id },
    { patient: patients[1]._id, morning: meal("Idli with sambar"), evening: meal("Fruit bowl"), night: meal("Khichdi with curd"), specialInstructions: "Soft foods only for 5 days.", createdBy: manager._id },
    { patient: patients[2]._id, morning: meal("Poha", "Low salt"), evening: meal("Sprouts chaat"), night: meal("Brown rice, dal, salad"), specialInstructions: "Low sodium. No dairy.", createdBy: manager._id },
]);

const staff = await PantryStaff.create([
    { name: "Deepak Singh", contactInfo: "+91 99000 10001", shift: "morning" },
    { name: "Neha Patel", contactInfo: "+91 99000 10002", shift: "evening" },
    { name: "Vikram Joshi", contactInfo: "+91 99000 10003", shift: "night", deliveryStatus: "off_duty" },
]);

const at = (h) => { const d = new Date(); d.setHours(h, 0, 0, 0); return d; };
await Delivery.create([
    { patient: patients[0]._id, staff: staff[0]._id, dietPlan: plans[0]._id, mealSlot: "morning", scheduledFor: at(8), status: "delivered", deliveredAt: at(8),
      timeline: [{ status: "pending", by: manager._id, at: at(7) }, { status: "preparing", at: at(7) }, { status: "out_for_delivery", at: at(8) }, { status: "delivered", at: at(8) }] },
    { patient: patients[1]._id, staff: staff[0]._id, dietPlan: plans[1]._id, mealSlot: "morning", scheduledFor: at(8), status: "preparing",
      timeline: [{ status: "pending", by: manager._id, at: at(7) }, { status: "preparing", at: at(8) }] },
    { patient: patients[2]._id, staff: staff[1]._id, dietPlan: plans[2]._id, mealSlot: "evening", scheduledFor: at(17), status: "pending",
      timeline: [{ status: "pending", by: manager._id }] },
]);

console.log(`Seeded demo data. Sign in as manager@medicare.test or pantry@medicare.test with password "${password}".`);
await disconnectDB();
