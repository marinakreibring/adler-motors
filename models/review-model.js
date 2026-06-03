/* ******************************
* Review Model
******************************* */
const pool = require("../database");

module.exports = {
  addReview: async (review) => {
    const sql = `INSERT INTO public.reviews (vehicle_id, client_id, rating, comment)
                 VALUES ($1, $2, $3, $4) RETURNING *;`;
    const values = [review.vehicle_id, review.client_id, review.rating, review.comment];
    const result = await pool.query(sql, values);
    return result.rows[0];
  },

  getReviewsByVehicleId: async (invId) => {
    const sql = `SELECT r.review_id, r.rating, r.comment, r.created_at,
                        a.account_firstname, a.account_lastname
                 FROM public.reviews r
                 LEFT JOIN public.account a ON r.client_id = a.account_id
                 WHERE r.vehicle_id = $1
                 ORDER BY r.created_at DESC;`;
    const result = await pool.query(sql, [invId]);
    return result.rows;
  },

  getAverageRating: async (invId) => {
    const sql = `SELECT COALESCE(ROUND(AVG(rating)::numeric,2), 0) AS avg_rating,
                        COUNT(*) AS review_count
                 FROM public.reviews
                 WHERE vehicle_id = $1;`;
    const result = await pool.query(sql, [invId]);
    return result.rows[0];
  }
};