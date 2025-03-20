import { MongoClient, ServerApiVersion } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

const uri = process.env.MONGODB_URI
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient>

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri, options)
    await client.connect()
  }
  return client
}

// Export a module-scoped MongoClient promise.
export default connectToDatabase()

