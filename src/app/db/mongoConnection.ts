import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger";

dotenv.config();

const uri = process.env.MONGO_URL as string;

if (!uri) {
  throw new Error("Please define the MONGO_URL environment variable in the .env file");
}

// Variables for connection state
let connectionAttempts = 0;
const MAX_RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY = 5000; // 5 seconds

// Function to check if the connection is active (REAL-TIME)
export const isDBConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

// Function to get detailed connection status
export const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected', 
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    state: states[mongoose.connection.readyState as keyof typeof states],
    readyState: mongoose.connection.readyState,
    isConnected: mongoose.connection.readyState === 1,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    attempts: connectionAttempts
  };
};

// Main connection function
export const connectDB = async () => {
  try {
    // If already connected, verify it's REAL
    if (isDBConnected()) {
      // Health check to ensure the connection is alive
      try {
        await mongoose.connection.db.admin().ping();
        logger.debug("MongoDB already connected and healthy", getConnectionStatus());
        return mongoose;
      } catch (healthError) {
        logger.warn("MongoDB connection appears dead, reconnecting...", {
          healthError: healthError.message
        });
        // Connection is dead, continue with reconnection
      }
    }

    // Configure event listeners BEFORE connecting
    setupConnectionListeners();

    logger.info("Connecting to MongoDB...", {
      uri: uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), // Hide credentials
      attempt: connectionAttempts + 1,
      maxAttempts: MAX_RECONNECTION_ATTEMPTS
    });

    const db = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,        // 10 seconds for server selection
      socketTimeoutMS: 45000,                 // 45 seconds for operations
      maxPoolSize: 10,                        // Maximum 10 connections in pool
      minPoolSize: 2,                         // Minimum 2 connections always active
      maxIdleTimeMS: 30000,                   // Close inactive connections after 30s
      retryWrites: true,                      // Retry failed writes
      w: 'majority',                          // Confirm writes to majority of replicas
      heartbeatFrequencyMS: 10000,            // Heartbeat every 10 seconds
      serverMonitoringMode: 'auto'            // Automatic server monitoring
    });

    connectionAttempts = 0;
    
    logger.info("MongoDB connected successfully", {
      ...getConnectionStatus(),
      message: "Database connection established with optimized settings"
    });

    return mongoose;
  } catch (error: any) {
    connectionAttempts++;
    
    logger.error("Failed to connect to MongoDB", {
      error: error.message,
      attempt: connectionAttempts,
      maxAttempts: MAX_RECONNECTION_ATTEMPTS,
      stack: error.stack,
      ...getConnectionStatus()
    });

    // Retry connection if we haven't exceeded the limit
    if (connectionAttempts < MAX_RECONNECTION_ATTEMPTS) {
      const delay = RECONNECTION_DELAY * connectionAttempts; // Exponential backoff
      logger.info(`Retrying connection in ${delay/1000} seconds... (${connectionAttempts}/${MAX_RECONNECTION_ATTEMPTS})`);
      setTimeout(() => connectDB(), delay);
    } else {
      logger.error("Max reconnection attempts reached. Please check your MongoDB connection.");
      throw error;
    }
  }
};

// Configure event listeners for the connection
const setupConnectionListeners = () => {
  // Event when connected
  mongoose.connection.on('connected', () => {
    connectionAttempts = 0;
    logger.info("MongoDB connection event: connected", getConnectionStatus());
  });

  // Event when disconnected
  mongoose.connection.on('disconnected', () => {
    logger.warn("MongoDB connection event: disconnected", getConnectionStatus());
    
    // Attempt automatic reconnection
    if (connectionAttempts < MAX_RECONNECTION_ATTEMPTS) {
      logger.info("Attempting automatic reconnection...");
      setTimeout(() => connectDB(), RECONNECTION_DELAY);
    }
  });

  // Event when there's an error
  mongoose.connection.on('error', (error) => {
    logger.error("MongoDB connection error", {
      error: error.message,
      stack: error.stack,
      ...getConnectionStatus()
    });
  });

  // Event when reconnected
  mongoose.connection.on('reconnected', () => {
    connectionAttempts = 0;
    logger.info("MongoDB connection event: reconnected", getConnectionStatus());
  });

  // Event when connection closes
  mongoose.connection.on('close', () => {
    logger.warn("MongoDB connection event: closed", getConnectionStatus());
  });

  // Event when connection opens
  mongoose.connection.on('open', () => {
    logger.info("MongoDB connection event: opened", getConnectionStatus());
  });
};

// Function to close the connection cleanly
export const disconnectDB = async () => {
  try {
    if (isDBConnected()) {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed gracefully");
    }
  } catch (error: any) {
    logger.error("Error closing MongoDB connection", {
      error: error.message,
      stack: error.stack
    });
  }
};

// Function to verify connection health
export const healthCheck = async (): Promise<boolean> => {
  try {
    if (!isDBConnected()) {
      logger.warn("Database health check failed: not connected");
      return false;
    }

    // Execute a simple command to verify the connection
    await mongoose.connection.db.admin().ping();
    logger.debug("Database health check passed");
    return true;
  } catch (error: any) {
    logger.error("Database health check failed", {
      error: error.message,
      stack: error.stack
    });
    return false;
  }
};

// Function to force reconnection
export const forceReconnect = async () => {
  try {
    logger.info("Forcing MongoDB reconnection...");
    await disconnectDB();
    connectionAttempts = 0;
    return await connectDB();
  } catch (error: any) {
    logger.error("Force reconnection failed", {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Graceful shutdown for clean closures
process.on('SIGINT', async () => {
  logger.info("SIGINT received, closing MongoDB connection...");
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info("SIGTERM received, closing MongoDB connection...");
  await disconnectDB();
  process.exit(0);
});

export default mongoose;
