import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  server: process.env.DB_SERVER.split('\\')[0],
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    instanceName: process.env.DB_SERVER.includes('\\') ? process.env.DB_SERVER.split('\\')[1] : undefined
  }
};

// Add port only if provided
if (process.env.DB_PORT) {
  config.port = parseInt(process.env.DB_PORT);
}

let pool;

export const connectDB = async () => {
  try {
    pool = await sql.connect(config);
    console.log('Connected to SQL Server');
    return pool;
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
};

export const getPool = () => pool;

export { sql };