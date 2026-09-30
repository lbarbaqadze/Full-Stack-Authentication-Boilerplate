import dbconnect from '../config/db.connect.js';

export const googleAuthModel = {
    createGoogleUser: async (userData, providerUserId) => {
        const connection = await dbconnect.getConnection();
        try {
            await connection.beginTransaction();

            const [userResult] = await connection.execute(
                "INSERT INTO users (name, surname, email, is_verified) VALUES (?, ?, ?, 1)",
                [userData.name, userData.surname, userData.email]
            );
            const userId = userResult.insertId;

            await connection.execute(
                "INSERT INTO user_oauth_accounts (user_id, provider, provider_user_id) VALUES (?, 'google', ?)",
                [userId, providerUserId]
            );

            await connection.commit();
            return userId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },
    
    findUserByGoogleId: async (providerUserId) => {
        const [rows] = await dbconnect.execute(
            "SELECT user_id FROM user_oauth_accounts WHERE provider = 'google' AND provider_user_id = ?",
            [providerUserId]
        );
        return rows[0];
    }
};