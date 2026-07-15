/**
 * Seed script — populates MongoDB with initial demo data.
 *
 * Run with:  npm run seed
 */
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB ?? "roothealth";

const doctors = [
  { name: "Dr. Emily Rodriguez", specialty: "Cardiology", patients: 142, status: "Active" },
  { name: "Dr. James Wilson", specialty: "Neurology", patients: 98, status: "Active" },
  { name: "Dr. Lisa Anderson", specialty: "Pediatrics", patients: 215, status: "Active" },
  { name: "Dr. Robert Kim", specialty: "Orthopedics", patients: 87, status: "On Leave" },
];

const patients = [
  { name: "John Smith", age: 45, doctor: "Dr. Rodriguez", lastVisit: "2024-01-15", condition: "Hypertension" },
  { name: "Mary Johnson", age: 32, doctor: "Dr. Anderson", lastVisit: "2024-01-10", condition: "Check-up" },
  { name: "David Brown", age: 58, doctor: "Dr. Wilson", lastVisit: "2024-01-08", condition: "Migraine" },
  { name: "Sarah Davis", age: 27, doctor: "Dr. Rodriguez", lastVisit: "2024-01-12", condition: "Arrhythmia" },
  { name: "Robert Lee", age: 63, doctor: "Dr. Rodriguez", lastVisit: "2024-01-05", condition: "Post-Surgery" },
];

const tests = [
  { name: "Complete Blood Count", category: "Hematology", price: 45, status: "Available" },
  { name: "Lipid Panel", category: "Cardiology", price: 65, status: "Available" },
  { name: "Thyroid Function", category: "Endocrinology", price: 85, status: "Available" },
  { name: "Liver Function", category: "Hepatology", price: 75, status: "Maintenance" },
];

const patientTests = [
  { patient: "John Smith", test: "Blood Count", doctor: "Dr. Rodriguez", status: "Pending" },
  { patient: "Mary Johnson", test: "X-Ray", doctor: "Dr. Kim", status: "In Progress" },
  { patient: "David Brown", test: "MRI", doctor: "Dr. Wilson", status: "Completed" },
];

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(dbName);

    // Clear existing data
    await Promise.all([
      db.collection("doctors").deleteMany({}),
      db.collection("patients").deleteMany({}),
      db.collection("tests").deleteMany({}),
      db.collection("patientTests").deleteMany({}),
    ]);
    console.log("Cleared existing collections");

    // Insert seed data
    await db.collection("doctors").insertMany(doctors);
    await db.collection("patients").insertMany(patients.map((p) => ({ ...p, createdAt: new Date() })));
    await db.collection("tests").insertMany(tests);
    await db.collection("patientTests").insertMany(patientTests.map((t) => ({ ...t, createdAt: new Date() })));

    console.log("Seed data inserted successfully:");
    console.log(`  - ${doctors.length} doctors`);
    console.log(`  - ${patients.length} patients`);
    console.log(`  - ${tests.length} tests`);
    console.log(`  - ${patientTests.length} patient tests`);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();