import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { send } from "../utils/ApiResponse.js";
import { paginate } from "../utils/query.js";
import {
    Delivery, Patient, PantryStaff, DietPlan,
    DELIVERY_FLOW, DELIVERY_STATUSES, OPEN_DELIVERY_STATUSES, MEAL_SLOTS,
} from "../model/index.js";

const POPULATE = [
    { path: "patient", select: "patientName roomNumber bedNumber floorNumber allergies" },
    { path: "staff", select: "name contactInfo deliveryStatus" },
    { path: "dietPlan", select: "morning evening night specialInstructions" },
    { path: "timeline.by", select: "fullName" },
];

function dayRange(dateString) {
    const start = dateString ? new Date(dateString) : new Date();
    if (Number.isNaN(start.getTime())) throw ApiError.badRequest("Invalid date");
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { $gte: start, $lt: end };
}

// Staff are "busy" while carrying a delivery and "available" again once they have none.
async function syncStaffStatus(staffId) {
    const staff = await PantryStaff.findById(staffId);
    if (!staff || staff.deliveryStatus === "off_duty") return;
    const carrying = await Delivery.exists({ staff: staffId, status: "out_for_delivery" });
    const next = carrying ? "busy" : "available";
    if (staff.deliveryStatus !== next) {
        staff.deliveryStatus = next;
        await staff.save();
    }
}

export const listDeliveries = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.status === "open") filter.status = { $in: OPEN_DELIVERY_STATUSES };
    else if (DELIVERY_STATUSES.includes(req.query.status)) filter.status = req.query.status;
    if (MEAL_SLOTS.includes(req.query.mealSlot)) filter.mealSlot = req.query.mealSlot;
    if (typeof req.query.staff === "string" && req.query.staff) filter.staff = req.query.staff;
    if (req.query.date) filter.scheduledFor = dayRange(req.query.date);

    const result = await paginate(Delivery, req, { filter, populate: POPULATE, defaultSort: "-scheduledFor" });
    return send(res, 200, result, "Deliveries fetched");
});

export const createDelivery = asyncHandler(async (req, res) => {
    const { patient: patientId, staff: staffId, mealSlot, scheduledFor, notes } = req.body;

    const [patient, staff] = await Promise.all([Patient.findById(patientId), PantryStaff.findById(staffId)]);
    if (!patient) throw ApiError.notFound("Patient");
    if (!staff) throw ApiError.notFound("Staff member");
    if (patient.status !== "admitted") throw ApiError.badRequest("Patient has been discharged");
    if (staff.deliveryStatus === "off_duty") throw ApiError.badRequest(`${staff.name} is off duty`);

    const when = scheduledFor || new Date();
    const duplicate = await Delivery.exists({
        patient: patient._id,
        mealSlot,
        status: { $ne: "cancelled" },
        scheduledFor: dayRange(when),
    });
    if (duplicate) throw ApiError.conflict(`${patient.patientName} already has a ${mealSlot} delivery that day`);

    const dietPlan = await DietPlan.findOne({ patient: patient._id, active: true }).select("_id");

    const delivery = await Delivery.create({
        patient: patient._id,
        staff: staff._id,
        dietPlan: dietPlan?._id,
        mealSlot,
        scheduledFor: when,
        notes,
        timeline: [{ status: "pending", by: req.user._id, note: "Assigned" }],
    });
    await delivery.populate(POPULATE);
    return send(res, 201, delivery, "Delivery assigned");
});

export const updateDeliveryStatus = asyncHandler(async (req, res) => {
    const { status, note } = req.body;
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) throw ApiError.notFound("Delivery");

    if (!DELIVERY_FLOW[delivery.status].includes(status)) {
        throw ApiError.badRequest(`Can't move a delivery from "${delivery.status}" to "${status}"`);
    }

    delivery.status = status;
    delivery.timeline.push({ status, by: req.user._id, note });
    if (status === "delivered") delivery.deliveredAt = new Date();
    await delivery.save();

    await syncStaffStatus(delivery.staff);
    await delivery.populate(POPULATE);
    return send(res, 200, delivery, `Delivery marked ${status.replace(/_/g, " ")}`);
});
