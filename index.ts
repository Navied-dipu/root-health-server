import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Retrieve the URI from environment variables
const uri = process.env.MONGODB_URI;

// 2. TypeScript safety check
if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside your .env file",
  );
}

const client = new MongoClient(uri);

// Collections
const db = client.db("roothealth");
const doctorsCollection = db.collection("doctors");
const patientsCollection = db.collection("patients");
const testsCollection = db.collection("tests");

// Routes
app.get("/api/doctors", async (req: Request, res: Response) => {
  const doctors = await doctorsCollection.find().toArray();
  res.send(doctors);
});

app.get("/api/patients", async (req: Request, res: Response) => {
  const doctor = req.query.doctor;
  const query = doctor ? { doctor: String(doctor) } : {};
  const patients = await patientsCollection.find(query).toArray();
  res.send(patients);
});

app.get("/api/tests", async (req: Request, res: Response) => {
  const tests = await testsCollection.find().toArray();
  res.send(tests);
});

app.post("/api/patients", async (req: Request, res: Response) => {
  try {
    const newPatient = req.body;

    // Basic validation to ensure the body isn't empty
    if (!newPatient || Object.keys(newPatient).length === 0) {
      return res.status(400).send({ error: "Patient data is required" });
    }

    const result = await patientsCollection.insertOne(newPatient);

    // Respond with 201 Created and the inserted document's info
    res.status(201).send({
      message: "Patient registered successfully",
      patientId: result.insertedId,
      patient: { _id: result.insertedId, ...newPatient },
    });
  } catch (error) {
    console.error("Error saving patient:", error);
    res.status(500).send({ error: "Failed to create patient record" });
  }
});

app.get("/", async (req: Request, res: Response) => {
  console.log("Hello World");
  res.send("Hello World");
});

export async function connectToMongoDB(): Promise<MongoClient | undefined> {
  try {
    await client.connect();
    console.log("✓ You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.error("✗ Failed to connect to MongoDB:", err);
  }
}

// Call this only when your application terminates
export async function disconnectFromMongoDB(): Promise<void> {
  // await client.close();
}

// Establish connection and start the server
async function startServer() {
  await connectToMongoDB();

  app.listen(port, () => {
    console.log(`✓ Server is running on port ${port}`);
  });
}

// Start the server only if we are not in a Vercel environment
// if (!process.env.VERCEL) {
//   startServer();
// }

// Export the Express API so Vercel can use it
export default app;
