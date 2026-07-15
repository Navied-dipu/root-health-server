import { Router } from "express";
import { getDb } from "../db.js";
const router = Router();
/**
 * GET /api/tests
 * Returns all medical tests.
 */
router.get("/", async (req, res) => {
    try {
        const db = await getDb();
        const tests = await db.collection("tests").find({}).toArray();
        res.status(200).json({ success: true, count: tests.length, data: tests });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
/**
 * GET /api/tests/patient-tests
 * Returns patient-test assignments with status.
 */
router.get("/patient-tests", async (req, res) => {
    try {
        const db = await getDb();
        const patientTests = await db.collection("patientTests").find({}).toArray();
        res.status(200).json({ success: true, count: patientTests.length, data: patientTests });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
/**
 * POST /api/tests
 * Creates a new medical test.
 */
router.post("/", async (req, res) => {
    try {
        const db = await getDb();
        const result = await db.collection("tests").insertOne(req.body);
        res.status(201).json({ success: true, data: { _id: result.insertedId, ...req.body } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
/**
 * POST /api/tests/patient-tests
 * Assigns a test to a patient.
 */
router.post("/patient-tests", async (req, res) => {
    try {
        const db = await getDb();
        const patientTest = { ...req.body, status: req.body.status || "Pending", createdAt: new Date() };
        const result = await db.collection("patientTests").insertOne(patientTest);
        res.status(201).json({ success: true, data: { _id: result.insertedId, ...patientTest } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
/**
 * PATCH /api/tests/patient-tests/:id
 * Updates the status of a patient-test assignment.
 */
router.patch("/patient-tests/:id", async (req, res) => {
    try {
        const { ObjectId } = await import("mongodb");
        const db = await getDb();
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const result = await db
            .collection("patientTests")
            .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: req.body }, { returnDocument: "after" });
        if (!result) {
            return res.status(404).json({ success: false, message: "Patient test not found" });
        }
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
export default router;
//# sourceMappingURL=tests.js.map