import { asyncHandler } from "../utils/asyncHandler.js";
import { send } from "../utils/ApiResponse.js";
import { Patient, Doctor, DietPlan, PantryStaff, Delivery, DELIVERY_STATUSES } from "../model/index.js";

const startOfDay = (offsetDays = 0) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + offsetDays);
    return d;
};

export const summary = asyncHandler(async (_req, res) => {
    const today = startOfDay();
    const tomorrow = startOfDay(1);
    const weekAgo = startOfDay(-6);

    const [
        admitted, discharged, doctors, availableDoctors, activePlans,
        staffByStatus, todayByStatus, weekly, byFloor, admittedWithoutPlan, recent,
    ] = await Promise.all([
        Patient.countDocuments({ status: "admitted" }),
        Patient.countDocuments({ status: "discharged" }),
        Doctor.countDocuments(),
        Doctor.countDocuments({ available: true }),
        DietPlan.countDocuments({ active: true }),
        PantryStaff.aggregate([{ $group: { _id: "$deliveryStatus", n: { $sum: 1 } } }]),
        Delivery.aggregate([
            { $match: { scheduledFor: { $gte: today, $lt: tomorrow } } },
            { $group: { _id: "$status", n: { $sum: 1 } } },
        ]),
        Delivery.aggregate([
            { $match: { status: "delivered", deliveredAt: { $gte: weekAgo, $lt: tomorrow } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$deliveredAt" } }, n: { $sum: 1 } } },
        ]),
        Patient.aggregate([
            { $match: { status: "admitted" } },
            { $group: { _id: { $ifNull: ["$floorNumber", ""] }, n: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]),
        Patient.aggregate([
            { $match: { status: "admitted" } },
            { $lookup: { from: "dietplans", let: { pid: "$_id" }, as: "plans", pipeline: [
                { $match: { $expr: { $and: [{ $eq: ["$patient", "$$pid"] }, { $eq: ["$active", true] }] } } },
                { $limit: 1 },
            ] } },
            { $match: { plans: { $size: 0 } } },
            { $project: { patientName: 1, roomNumber: 1, bedNumber: 1 } },
            { $limit: 5 },
        ]),
        Delivery.find({ "timeline.0": { $exists: true } })
            .sort("-updatedAt").limit(8)
            .populate("patient", "patientName roomNumber")
            .populate("staff", "name")
            .lean(),
    ]);

    const toMap = (rows) => Object.fromEntries(rows.map((r) => [r._id, r.n]));
    const todayMap = toMap(todayByStatus);
    const weeklyMap = toMap(weekly);

    const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = startOfDay(i - 6);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return { date: key, delivered: weeklyMap[key] || 0 };
    });

    return send(res, 200, {
        patients: { admitted, discharged },
        doctors: { total: doctors, available: availableDoctors },
        dietPlans: { active: activePlans, missing: admittedWithoutPlan },
        staff: { available: 0, busy: 0, off_duty: 0, ...toMap(staffByStatus) },
        deliveriesToday: Object.fromEntries(DELIVERY_STATUSES.map((s) => [s, todayMap[s] || 0])),
        deliveredLast7Days: last7,
        patientsByFloor: byFloor.map((f) => ({ floor: f._id || "Unassigned", count: f.n })),
        recentActivity: recent.map((d) => {
            const last = d.timeline[d.timeline.length - 1];
            return {
                id: d._id,
                status: last.status,
                at: last.at,
                mealSlot: d.mealSlot,
                patient: d.patient?.patientName,
                room: d.patient?.roomNumber,
                staff: d.staff?.name,
            };
        }),
    }, "Dashboard summary");
});
