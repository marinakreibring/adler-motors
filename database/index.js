const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
})

module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params)
      return res
    } catch (error) {
      console.error("database query error", error)
      throw error
    }
  },
}