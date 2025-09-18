import "dotenv/config";

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure neon to use websockets with proper SSL handling for development
neonConfig.webSocketConstructor = ws;
// Use WebSocket proxy for Neon connections to fix SSL issues in development
if (process.env.NODE_ENV !== 'production') {
  neonConfig.wsProxy = (host) => `${host}:443/v2`;
  console.log('Using Neon WebSocket proxy for development environment');
}

// Check for database connection string
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Connection state tracking
let isConnected = false;
let connectionError: Error | null = null;
let retryCount = 0;
const MAX_RETRIES = 3;

const isProd = process.env.NODE_ENV === 'production';

// Create a connection pool with additional options for better reliability
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of clients
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection not established
  ssl: isProd ? { rejectUnauthorized: true } : undefined,
});

// Add error handling for the pool
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  connectionError = err;
  isConnected = false;
});

// Create a Drizzle ORM instance with our schema
export const db = drizzle({ client: pool, schema });

// Check connection health
export const checkConnection = async (): Promise<boolean> => {
  if (isConnected) return true;
  
  try {
    // Simple query to test connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    
    isConnected = true;
    connectionError = null;
    retryCount = 0;
    console.log('Database connection established successfully');
    return true;
  } catch (error) {
    connectionError = error as Error;
    isConnected = false;
    retryCount++;
    
    console.error(`Database connection failed (attempt ${retryCount}/${MAX_RETRIES}):`, error);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Will retry connection in ${retryCount * 2} seconds`);
      setTimeout(() => checkConnection(), retryCount * 2000);
    } else {
      console.error('Max retry attempts reached. Database connection failed.');
    }
    
    return false;
  }
};

// Call checkConnection immediately to establish initial connection
checkConnection().catch(console.error);

// Get connection status
export const getConnectionStatus = () => ({
  isConnected,
  error: connectionError ? connectionError.message : null,
  retryCount
});

// Export a function to close the pool when needed (for testing or shutdown)
export const closePool = async () => {
  await pool.end();
};