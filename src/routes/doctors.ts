import { Router, Request, Response } from "express";
import { getDb } from "../db.js";

const router = Router();

/**
 * GET /api/doctors
 * Returns all doctors.
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const doctors = await db.collection("doctors").find({}).toArray();
    res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/doctors/available
 * Returns doctors with availability flag (for receptionist assignment).
 */
router.get("/available", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const doctors = await db.collection("doctors").find({}).toArray();
    const withAvailability = doctors.map((d: any) => ({
      name: d.name,
      specialty: d.specialty,
      available: d.status === "Active",
    }));
    res.status(200).json({ success: true, count: withAvailability.length, data: withAvailability });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/doctors/:id
 * Returns a single doctor by id.
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { ObjectId } = await import("mongodb");
    const db = await getDb();
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const doctor = await db.collection("doctors").findOne({ _id: new ObjectId(id) });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/doctors
 * Creates a new doctor.
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = await db.collection("doctors").insertOne(req.body);
    res.status(201).json({ success: true, data: { _id: result.insertedId, ...req.body } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;