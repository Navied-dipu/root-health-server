import { Router } from "express";
import { getDb } from "../db.js";
const router = Router();
/**
 * GET /api/patients
 * Returns all patients.
 */
router.get("/", async (req, res) => {
    try {
        const db = await getDb();
        const patients = await db.collection("patients").find({}).toArray();
        res.status(200).json({ success: true, count: patients.length, data: patients });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
/**
 * GET /api/patients/:id
 * Returns a single patient by id.
 */
router.get("/:id", async (req, res) => {
    try {
        const { ObjectId } = await import("mongodb");
        const db = await getDb();
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const patient = await db.collection("patients").findOne({ _id: new ObjectId(id) });
        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }
        res.status(200).json({ success: true, data: patient });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
/**
 * POST /api/patients
 * Creates a new patient.
 */
router.post("/", async (req, res) => {
    try {
        const db = await getDb();
        const patient = { ...req.body, createdAt: new Date() };
        const result = await db.collection("patients").insertOne(patient);
        res.status(201).json({ success: true, data: { _id: result.insertedId, ...patient } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
/**
 * PATCH /api/patients/:id
 * Updates a patient.
 */
router.patch("/:id", async (req, res) => {
    try {
        const { ObjectId } = await import("mongodb");
        const db = await getDb();
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const result = await db
            .collection("patients")
            .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: req.body }, { returnDocument: "after" });
        if (!result) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
/**
 * DELETE /api/patients/:id
 * Deletes a patient.
 */
router.delete("/:id", async (req, res) => {
    try {
        const { ObjectId } = await import("mongodb");
        const db = await getDb();
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const result = await db.collection("patients").deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }
        res.status(200).json({ success: true, message: "Patient deleted" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
export default router;
//# sourceMappingURL=patients.js.map