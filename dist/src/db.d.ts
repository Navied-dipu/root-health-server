import { MongoClient, Db } from "mongodb";
declare let clientPromise: Promise<MongoClient> | undefined;
/**
 * Get the connected MongoDB database instance.
 * Call this wherever you need DB access in route handlers.
 */
export declare function getDb(): Promise<Db>;
/**
 * Get the raw MongoClient (e.g. for transactions or admin commands).
 */
export declare function getClient(): Promise<MongoClient>;
/**
 * Lazily-initialized promise for the connected MongoClient.
 * Import this if you want to `await` the client directly (e.g. in index.ts).
 */
export { clientPromise };
//# sourceMappingURL=db.d.ts.map