import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.NODE_ENV = "test";
process.env.ACCESS_TOKEN_SECRET = "test-access";
process.env.REFRESH_TOKEN_SECRET = "test-refresh";
process.env.SIGNUP_ROLES = "Manager,Pantry";

let mongo, request, app, db;

before(async () => {
    mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongo.getUri();
    ({ default: request } = await import("supertest"));
    ({ default: app } = await import("../app.js"));
    db = await import("../config/db.js");
});

after(async () => {
    await db.disconnectDB();
    await mongo.stop();
});

const agentFor = async (role) => {
    const agent = request.agent(app);
    const email = `${role.toLowerCase()}@test.dev`;
    await agent.post("/api/v1/auth/register")
        .send({ fullName: `${role} User`, username: role.toLowerCase(), email, password: "Passw0rd!", role })
        .expect(201);
    await agent.post("/api/v1/auth/login").send({ email, password: "Passw0rd!" }).expect(200);
    return agent;
};

let manager, pantry, patientId, staffId, deliveryId;

test("health check responds without auth", async () => {
    const res = await request(app).get("/api/health").expect(200);
    assert.equal(res.body.status, "ok");
});

test("unknown routes return JSON 404", async () => {
    const res = await request(app).get("/api/v1/nope").expect(401); // protected area: auth comes first
    assert.equal(res.body.success, false);
    const res2 = await request(app).get("/nope").expect(404);
    assert.match(res2.body.message, /not found/);
});

test("registration validates input", async () => {
    const res = await request(app).post("/api/v1/auth/register")
        .send({ fullName: "X", username: "x", email: "bad", password: "short", role: "Manager" })
        .expect(400);
    assert.ok(res.body.errors.length >= 2);
});

test("login and session cookies", async () => {
    manager = await agentFor("Manager");
    pantry = await agentFor("Pantry");
    const me = await manager.get("/api/v1/auth/me").expect(200);
    assert.equal(me.body.data.role, "Manager");
    assert.equal(me.body.data.password, undefined);

    await request(app).post("/api/v1/auth/login")
        .send({ email: "manager@test.dev", password: "wrong" }).expect(401);
});

test("refresh rotates the session", async () => {
    const res = await manager.post("/api/v1/auth/refresh").expect(200);
    assert.ok(res.body.data.accessToken);
});

test("protected routes reject anonymous users", async () => {
    await request(app).get("/api/v1/patients").expect(401);
});

test("only managers can admit patients", async () => {
    const body = { patientName: "Test Patient", disease: "Flu", bloodGroup: "O+", roomNumber: "101", bedNumber: "A", floorNumber: "1", age: "40" };
    await pantry.post("/api/v1/patients").send(body).expect(403);
    const res = await manager.post("/api/v1/patients").send(body).expect(201);
    patientId = res.body.data._id;
    assert.equal(res.body.data.age, 40);

    // Same bed can't hold two admitted patients.
    const dup = await manager.post("/api/v1/patients").send({ ...body, patientName: "Other" }).expect(409);
    assert.match(dup.body.message, /bed/);
});

test("patients list is paginated and searchable", async () => {
    const res = await pantry.get("/api/v1/patients?q=test&limit=5").expect(200);
    assert.equal(res.body.data.total, 1);
    assert.equal(res.body.data.limit, 5);
    const none = await pantry.get("/api/v1/patients?q=zzz").expect(200);
    assert.equal(none.body.data.total, 0);
});

test("diet plan is linked to the patient", async () => {
    const plan = { patient: patientId, morningMeal: "Oats", eveningMeal: "Soup", nightMeal: "Khichdi" };
    const res = await manager.post("/api/v1/diet-plans").send(plan).expect(201);
    assert.equal(res.body.data.morning.meal, "Oats");

    // A second plan replaces the first.
    await manager.post("/api/v1/diet-plans").send({ ...plan, morningMeal: "Poha" }).expect(201);
    const list = await manager.get(`/api/v1/diet-plans?patient=${patientId}`).expect(200);
    assert.equal(list.body.data.total, 1);
    assert.equal(list.body.data.items[0].morning.meal, "Poha");
});

test("delivery lifecycle updates staff availability", async () => {
    const staff = await pantry.post("/api/v1/staff").send({ name: "Runner", contactInfo: "+91 9000000000" }).expect(201);
    staffId = staff.body.data._id;

    const created = await pantry.post("/api/v1/deliveries")
        .send({ patient: patientId, staff: staffId, mealSlot: "morning" }).expect(201);
    deliveryId = created.body.data._id;
    assert.ok(created.body.data.dietPlan, "picks up the active diet plan");

    await pantry.post("/api/v1/deliveries")
        .send({ patient: patientId, staff: staffId, mealSlot: "morning" }).expect(409);

    await pantry.patch(`/api/v1/deliveries/${deliveryId}/status`).send({ status: "delivered" }).expect(400);
    await pantry.patch(`/api/v1/deliveries/${deliveryId}/status`).send({ status: "preparing" }).expect(200);
    await pantry.patch(`/api/v1/deliveries/${deliveryId}/status`).send({ status: "out_for_delivery" }).expect(200);

    let s = await pantry.get("/api/v1/staff").expect(200);
    assert.equal(s.body.data.items[0].deliveryStatus, "busy");

    const done = await pantry.patch(`/api/v1/deliveries/${deliveryId}/status`).send({ status: "delivered" }).expect(200);
    assert.equal(done.body.data.timeline.length, 4);
    assert.ok(done.body.data.deliveredAt);

    s = await pantry.get("/api/v1/staff").expect(200);
    assert.equal(s.body.data.items[0].deliveryStatus, "available");
});

test("dashboard summary aggregates everything", async () => {
    const res = await pantry.get("/api/v1/dashboard").expect(200);
    const d = res.body.data;
    assert.equal(d.patients.admitted, 1);
    assert.equal(d.deliveriesToday.delivered, 1);
    assert.equal(d.deliveredLast7Days.length, 7);
    assert.equal(d.deliveredLast7Days[6].delivered, 1);
    assert.ok(d.recentActivity.length >= 1);
});

test("discharge closes diet plans and open deliveries", async () => {
    await manager.post("/api/v1/deliveries").send({ patient: patientId, staff: staffId, mealSlot: "night" }).expect(201);
    await manager.post(`/api/v1/patients/${patientId}/discharge`).expect(200);

    const open = await manager.get("/api/v1/deliveries?status=open").expect(200);
    assert.equal(open.body.data.total, 0);
    const plans = await manager.get("/api/v1/diet-plans").expect(200);
    assert.equal(plans.body.data.total, 0);
});

test("CSV export is manager-only and escapes formulas", async () => {
    await manager.post("/api/v1/patients")
        .send({ patientName: "=HYPERLINK(1)", disease: "X", bloodGroup: "A+", roomNumber: "9", bedNumber: "9" }).expect(201);
    await pantry.get("/api/v1/patients/export").expect(403);
    const res = await manager.get("/api/v1/patients/export").expect(200);
    assert.match(res.headers["content-type"], /text\/csv/);
    assert.match(res.text, /"'=HYPERLINK\(1\)"/);
});

test("invalid ids are rejected cleanly", async () => {
    const res = await manager.get("/api/v1/patients/not-an-id").expect(400);
    assert.equal(res.body.success, false);
});

test("logout clears the session", async () => {
    await manager.post("/api/v1/auth/logout").expect(200);
    await manager.get("/api/v1/auth/me").expect(401);
});
