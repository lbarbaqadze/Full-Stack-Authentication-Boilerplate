import jwt from 'jsonwebtoken';
import ms from 'ms'; 

export const generateTokens = (userId) => {
    
    const accessToken = jwt.sign( 
        { userId: userId }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN } 
    );

    const refreshToken = jwt.sign(
        { userId: userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES }
    );

    return { accessToken, refreshToken };
};

const cookieOptions = () => {
    const production = process.env.NODE_ENV === 'production'
    return {
        httpOnly: true,
        secure: production,
        sameSite: 'lax',
        path: "/"
    }
}

export const setTokenCookies = (res, accessToken, refreshToken) => {
    const accessTokenMaxAge = ms(process.env.JWT_EXPIRES_IN); 
    const refreshTokenMaxAge = ms(process.env.JWT_REFRESH_EXPIRES); 

    res.cookie('accessToken', accessToken, { ...cookieOptions(), maxAge: accessTokenMaxAge });
    res.cookie('refreshToken', refreshToken, { ...cookieOptions(), maxAge: refreshTokenMaxAge });
};

export const clearTokenCookies = (res) => {
    res.clearCookie('accessToken', cookieOptions());
    res.clearCookie('refreshToken', cookieOptions()); 
};