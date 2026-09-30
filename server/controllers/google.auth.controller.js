import { generateTokens, setTokenCookies } from '../utils/generateToken.js';
import { authModel } from '../models/auth.model.js';
import catchAsync from '../utils/catchAsync.js';
import ms from 'ms';

export const googleAuthController = {

    googleCallback: catchAsync(async (req, res, next) => {
        const user = req.user;
        const userId = user.user_id;

        const { accessToken, refreshToken } = generateTokens(userId);

        const refreshTokenMaxAge = ms(process.env.JWT_REFRESH_EXPIRES); 
        const expiresAt = new Date(Date.now() + refreshTokenMaxAge);

        await authModel.saveRefreshToken(userId, refreshToken, expiresAt);

        setTokenCookies(res, accessToken, refreshToken);

        res.redirect(`${process.env.CLIENT_URL}/`);
    })

};