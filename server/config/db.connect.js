import mysql2 from 'mysql2/promise'

const dbconnect = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: process.env.VERCEL ? 1 : 10,
    queueLimit: 0,
    ssl: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
    }
})

export default dbconnect