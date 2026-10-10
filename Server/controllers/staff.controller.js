import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { send } from "../utils/ApiResponse.js";
import { paginate } from "../utils/query.js";
import { uploadImage } from "../utils/cloudinary.js";
import { fileFrom } from "../middleware/multer.middleware.js";
import { PantryStaff, Delivery, STAFF_STATUSES, OPEN_DELIVERY_STATUSES } from "../model/index.js";

export const listStaff = asyncHandler(async (req, res) => {
    const filter = {};
    if (STAFF_STATUSES.includes(req.query.status)) filter.deliveryStatus = req.query.status;

    const result = await paginate(PantryStaff, req, { searchFields: ["name", "contactInfo"], filter, defaultSort: "name" });

    const open = await Delivery.aggregate([
        { $match: { status: { $in: OPEN_DELIVERY_STATUSES }, staff: { $in: result.items.map((s) => s._id) } } },
        { $group: { _id: "$staff", n: { $sum: 1 } } },
    ]);
    const byId = new Map(open.map((o) => [String(o._id), o.n]));
    result.items = result.items.map((s) => ({ ...s, openDeliveries: byId.get(String(s._id)) || 0 }));

    return send(res, 200, result, "Staff fetched");
});

export const createStaff = asyncHandler(async (req, res) => {
    const coverImage = await uploadImage(fileFrom(req, "photo"), "medicare-hms/staff");
    const staff = await PantryStaff.create({ ...req.body, coverImage });
    return send(res, 201, staff, "Staff member added");
});

export const updateStaff = asyncHandler(async (req, res) => {
    const update = { ...req.body };
    const photo = fileFrom(req, "photo");
    if (photo) update.coverImage = await uploadImage(photo, "medicare-hms/staff");

    const staff = await PantryStaff.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!staff) throw ApiError.notFound("Staff member");
    return send(res, 200, staff, "Staff member updated");
});

export const deleteStaff = asyncHandler(async (req, res) => {
    const open = await Delivery.exists({ staff: req.params.id, status: { $in: OPEN_DELIVERY_STATUSES } });
    if (open) throw ApiError.conflict("Reassign or finish this person's open deliveries first");

    const staff = await PantryStaff.findByIdAndDelete(req.params.id);
    if (!staff) throw ApiError.notFound("Staff member");
    return send(res, 200, null, "Staff member removed");
});
