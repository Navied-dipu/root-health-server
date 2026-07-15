import { Router, Request, Response } from "express";
import { getDb } from "../db.js";

const router = Router();

/**
 * GET /api/stats/owner
 * Returns aggregated stats for the owner dashboard.
 */
router.get("/owner", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const [doctors, patients, tests, patientTests] = await Promise.all([
      db.collection("doctors").countDocuments(),
      db.collection("patients").countDocuments(),
      db.collection("tests").countDocuments(),
      db.collection("patientTests").countDocuments(),
    ]);

    const activeDoctors = await db.collection("doctors").countDocuments({ status: "Active" });
    const onLeaveDoctors = await db.collection("doctors").countDocuments({ status: "On Leave" });
    const completedTests = await db.collection("patientTests").countDocuments({ status: "Completed" });

    res.status(200).json({
      success: true,
      data: {
        totalDoctors: doctors,
        activeDoctors,
        onLeaveDoctors,
        totalPatients: patients,
        totalTests: tests,
        testsCompleted: completedTests,
        totalPatientTests: patientTests,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/stats/receptionist
 * Returns aggregated stats for the receptionist dashboard.
 */
router.get("/receptionist", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todaysPatients, pendingAssignments, scheduledTests] = await Promise.all([
      db.collection("patients").countDocuments({ createdAt: { $gte: today } }),
      db.collection("patientTests").countDocuments({ status: "Pending" }),
      db.collection("patientTests").countDocuments({ status: { $in: ["Pending", "In Progress"] } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        newPatientsToday: todaysPatients,
        pendingAssignments,
        testsScheduled: scheduledTests,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/stats/doctor/:id
 * Returns aggregated stats for a specific doctor dashboard.
 */
router.get("/doctor/:id", async (req: Request, res: Response) => {
  try {
    const { ObjectId } = await import("mongodb");
    const db = await getDb();
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const [myPatients, pendingTests] = await Promise.all([
      db.collection("patients").countDocuments({ doctorId: new ObjectId(id) }),
      db.collection("patientTests").countDocuments({ doctorId: new ObjectId(id), status: "Pending" }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        myPatients,
        pendingTests,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;