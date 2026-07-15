import { MongoClient } from "mongodb";
/**
 * Shared MongoDB client for the RootHealth server.
 *
 * - Env vars are read lazily (inside functions) so dotenv.config() in
 *   index.ts has a chance to run before the URI is evaluated.
 * - In development we cache the client on `globalThis` so HMR / `--watch`
 *   restarts don't open a new connection pool on every reload.
 * - In production a single client is created per process.
 */
let client;
let clientPromise;
function getUri() {
    return process.env.MONGODB_URI ?? "mongodb://localhost:27017";
}
function getDbName() {
    return process.env.MONGODB_DB ?? "roothealth";
}
function createClientPromise() {
    const uri = getUri();
    if (process.env.NODE_ENV === "development") {
        const globalWithMongo = global;
        if (!globalWithMongo._mongoClientPromise) {
            client = new MongoClient(uri);
            globalWithMongo._mongoClientPromise = client.connect();
        }
        return globalWithMongo._mongoClientPromise;
    }
    client = new MongoClient(uri);
    return client.connect();
}
/**
 * Get the connected MongoDB database instance.
 * Call this wherever you need DB access in route handlers.
 */
export async function getDb() {
    if (!clientPromise) {
        clientPromise = createClientPromise();
    }
    const connectedClient = await clientPromise;
    return connectedClient.db(getDbName());
}
/**
 * Get the raw MongoClient (e.g. for transactions or admin commands).
 */
export async function getClient() {
    if (!clientPromise) {
        clientPromise = createClientPromise();
    }
    return clientPromise;
}
/**
 * Lazily-initialized promise for the connected MongoClient.
 * Import this if you want to `await` the client directly (e.g. in index.ts).
 */
export { clientPromise };
//# sourceMappingURL=db.js.map