const mysql = require("mysql2/promise")

let db = null

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "todoapp",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
}

async function initDatabase() {
    if (db) {
        console.log("Database already initialized")
        return db
    }

    try {
        console.log("Connecting to MySQL database...")
        db = await mysql.createConnection(dbConfig)

        await createTables()
        console.log("Database initialization completed")

        return db
    } catch (error) {
        console.error("Database initialization failed:", error)
        throw error
    }
}

async function createTables() {
    const tables = {
        users: `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `,
        todos: `
            CREATE TABLE IF NOT EXISTS todos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description VARCHAR(255),
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `
    }

    for (const [tableName, query] of Object.entries(tables)) {
        await db.execute(query)
        console.log(`Table '${tableName}' verified/created`)
    }
}

function getDatabase() {
    if (!db) {
        throw new Error("Database not initialized. Call initDatabase() first.")
    }
    return db
}

async function closeDatabase() {
    if (db) {
        await db.end()
        db = null
        console.log("Database connection closed")
    }
}

module.exports = {
    initDatabase,
    getDatabase,
    closeDatabase,
}
