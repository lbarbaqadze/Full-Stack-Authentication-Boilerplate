import dbconnect from '../config/db.connect.js'

export const authModel = {    

    signUpWithVerification: async (userData, otpData) => {
        const connection = await dbconnect.getConnection()

        try {
            await connection.beginTransaction() 

            const [userResult] = await connection.execute(
                "INSERT INTO users (name, surname, email, password) VALUES (?, ?, ?, ?)",
                [userData.name, userData.surname, userData.email, userData.password]
            ) 

            const userId = userResult.insertId             

            await connection.execute(
                "INSERT INTO verification_codes (user_id, code, expires_at) VALUES (?, ?, ?)",
                [userId, otpData.code, otpData.expires]
            );

            await connection.commit();

            return userId

        } catch (error) {
            await connection.rollback() 
            throw error
        } finally {
            connection.release();
        }
    },

    findByEmail: async (email) => {
        const [rows] = await dbconnect.execute(
            "SELECT * FROM users WHERE email = ?", [email]
        )
        return rows[0]
    }, 

    deleteUserById: async (id) => {
        await dbconnect.execute("DELETE FROM users WHERE id = ?", [id])
    },

    saveRefreshToken: async (userId, token, expiresAt) => {
        const [result] = await dbconnect.execute(
            "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)", [userId, token, expiresAt]
        )
        return result
    }, 

    findRefreshToken: async (token) => {
        const [rows] = await dbconnect.execute(
            "SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()", [token]
        )
        return rows[0] 
    },

    deleteRefreshToken: async (token) => {
        const [result] = await dbconnect.execute(
            "DELETE FROM refresh_tokens WHERE token = ?", [token]
        )
        return result
    }, 

    findById: async (id) => {
        const [rows] = await dbconnect.execute(
            "SELECT id, name, surname, email, is_verified FROM users WHERE id = ?", [id]
        )
        return rows[0] 
    },  

    findValidCode: async (email, code) => {
        const [rows] = await dbconnect.execute(
            `SELECT vc.user_id
            FROM verification_codes vc
            JOIN users u ON vc.user_id = u.id
            WHERE u.email = ? AND vc.code = ? AND vc.expires_at > NOW()`, [email, code]
        )
        return rows[0]
    }, 

    verifyUserAndClearCode: async (userId) => {
        await dbconnect.execute("UPDATE users SET is_verified = 1 WHERE id = ?", [userId])
        await dbconnect.execute("DELETE FROM verification_codes WHERE user_id = ?", [userId])
    },

    saveVerificationCode: async (userId, code, expiresAt) => {
        await dbconnect.execute("DELETE FROM verification_codes WHERE user_id = ?", [userId])
        await dbconnect.execute(
            "INSERT INTO verification_codes (user_id, code, expires_at) VALUES (?, ?, ?)",
            [userId, code, expiresAt]
        )
    },

    clearVerificationCode: async (userId) => {
        await dbconnect.execute("DELETE FROM verification_codes WHERE user_id = ?", [userId])
    },

    updatePassword: async (userId, hashedPassword) => {
        await dbconnect.execute(
            "UPDATE users SET password = ? WHERE id = ?",
            [hashedPassword, userId]
        )
    },

    deleteRefreshTokensByUserId: async (userId) => {
        await dbconnect.execute(
            "DELETE FROM refresh_tokens WHERE user_id = ?",
            [userId]
        )
    },
    
}