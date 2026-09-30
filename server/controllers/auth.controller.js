import bcrypt from 'bcrypt'
import appError from "../utils/appError.js"
import catchAsync from "../utils/catchAsync.js"
import { authModel } from "../models/auth.model.js"
import jwt from 'jsonwebtoken'
import sendEmail from '../utils/sendEmail.js'
import crypto from 'crypto'
import ms from 'ms' 
import { generateTokens, setTokenCookies, clearTokenCookies } from '../utils/generateToken.js'

const generateOtp = () => {
    const code = crypto.randomInt(100000, 999999).toString()
    const expires = new Date(Date.now() + 10 * 60 * 1000)
    return { code, expires }
}

export const authController = {

    signUp: catchAsync(async (req, res, next) => {
        const { name, surname, email, password } = req.body 

        const existingUser = await authModel.findByEmail(email)
        if (existingUser) {
            return next(new appError("user with this email already exist", 409))
        } 

        const hashedPassword = await bcrypt.hash(password, 10) 

        const { code: otpCode, expires: otpExpires } = generateOtp()

        const userId = await authModel.signUpWithVerification(
            { name, surname, email, password: hashedPassword },
            { code: otpCode, expires: otpExpires }
        )

        const message = `hello ${name} \n\nthanks to registration, your verification code: ${otpCode}`

        try {
            await sendEmail({
                email: email,
                subject: "account verification code",
                message: message
            })
            res.status(201).json({
                status: "success",
                message: "registration completed successfully! verification code has been sent to your email",
                data: {
                    userId,
                    name,
                    surname,
                    email
                }
            })
        } catch (error) {
            await authModel.deleteUserById(userId)
            return next(new appError("error occurred while sending the email", 500))
        }
    }),

    verifyEmail: catchAsync(async (req, res, next) => {
        const { email, code } = req.body 

        const validCodeRow = await authModel.findValidCode(email, code)

        if (!validCodeRow) {
            return next(new appError("verification code is wrong", 400))
        }

        await authModel.verifyUserAndClearCode(validCodeRow.user_id)

        res.status(200).json({
            status: "success",
            message: "success verification"
        })
    }),

    signIn: catchAsync(async (req, res, next) => {
        const { email, password } = req.body

        const user = await authModel.findByEmail(email)

        if (!user) {
            return next(new appError("email or password is incorrect", 401))
        } 

        if (!user.is_verified) {
            return next(new appError("please verify your email first", 403))
        }

        if (!user.password) {
            return next(new appError("this account uses social login, please sign in with google", 401))
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (!isPasswordCorrect) {
            return next(new appError("email or password is incorrect", 401))
        } 

        const { accessToken, refreshToken } = generateTokens(user.id); 

        const refreshTokenMaxAge = ms(process.env.JWT_REFRESH_EXPIRES) 

        const expiresAt = new Date(Date.now() + refreshTokenMaxAge)
        
        await authModel.saveRefreshToken(user.id, refreshToken, expiresAt)

        setTokenCookies(res, accessToken, refreshToken);
       

        res.status(200).json({
            status: "success",
            message: "sign in is successfully",
            data: {
                userId: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email
            }
        })

    }),

    refresh: catchAsync(async (req, res, next) => {

        const { refreshToken } = req.cookies || {}

        if (!refreshToken) {
            return next(new appError("refresh token missing, please sign in again", 401))
        } 
        
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (err) {
            clearTokenCookies(res);
            return next(new appError("your session has expired sign in again", 401));
        }

        const tokenInDb = await authModel.findRefreshToken(refreshToken)

        if (!tokenInDb) {
            return next(new appError("invalid or expired refresh token", 401))
        } 

        await authModel.deleteRefreshToken(refreshToken) 

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId); 

        const refreshTokenAge = ms(process.env.JWT_REFRESH_EXPIRES) 
        const expiresAt = new Date(Date.now() + refreshTokenAge) 
        await authModel.saveRefreshToken(decoded.userId, newRefreshToken, expiresAt) 

        setTokenCookies(res, newAccessToken, newRefreshToken);
       

        res.status(200).json({
            status: "success",
            message: "token refreshed successfully"
        })

    }),

    logOut: catchAsync(async (req, res, next) => {

        const { refreshToken } = req.cookies || {}

        if (refreshToken) {
            await authModel.deleteRefreshToken(refreshToken)
        } 

        clearTokenCookies(res);

        res.status(200).json({
            status: "success",
            message: "logout is successfully"
        })

    }),

    forgotPassword: catchAsync(async (req, res, next) => {
        const { email, code, password } = req.body

        if (!code && !password) {
            const user = await authModel.findByEmail(email)

            if (!user || !user.is_verified) {
                return res.status(200).json({
                    status: "success",
                    message: "if an account with this email exists, a verification code has been sent"
                })
            }

            const { code: otpCode, expires } = generateOtp()

            await authModel.saveVerificationCode(user.id, otpCode, expires)

            const message = `hello ${user.name}\n\nyour password forgotten code: ${otpCode}\n\nthis code expires in 10 minutes`

            try {
                await sendEmail({
                    email: user.email,
                    subject: "password forgotten code",
                    message
                })
            } catch (error) {
                await authModel.clearVerificationCode(user.id)
                return next(new appError("error occurred while sending the email", 500))
            }

            return res.status(200).json({
                status: "success",
                message: "if an account with this email exists, a verification code has been sent"
            })
        }

        const validCodeRow = await authModel.findValidCode(email, code)

        if (!validCodeRow) {
            return next(new appError("verification code is wrong or expired", 400))
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await authModel.updatePassword(validCodeRow.user_id, hashedPassword)
        await authModel.deleteRefreshTokensByUserId(validCodeRow.user_id)
        await authModel.clearVerificationCode(validCodeRow.user_id)

        clearTokenCookies(res)

        res.status(200).json({
            status: "success",
            message: "password has been updated successfully"
        })
    }),

    changePassword: catchAsync(async (req, res, next) => {
        const { code, password } = req.body

        if (!code && !password) {
            const user = await authModel.findById(req.user.id)

            const { code: otpCode, expires } = generateOtp()

            await authModel.saveVerificationCode(user.id, otpCode, expires)

            const message = `hello ${user.name}\n\nyour password change code: ${otpCode}\n\nthis code expires in 10 minutes`

            try {
                await sendEmail({
                    email: user.email,
                    subject: "password change code",
                    message
                })
            } catch (error) {
                await authModel.clearVerificationCode(user.id)
                return next(new appError("error occurred while sending the email", 500))
            }

            return res.status(200).json({
                status: "success",
                message: "verification code has been sent to your email"
            })
        }

        const validCodeRow = await authModel.findValidCode(req.user.email, code)

        if (!validCodeRow) {
            return next(new appError("verification code is wrong or expired", 400))
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await authModel.updatePassword(req.user.id, hashedPassword)
        await authModel.deleteRefreshTokensByUserId(req.user.id)
        await authModel.clearVerificationCode(req.user.id)

        clearTokenCookies(res)

        res.status(200).json({
            status: "success",
            message: "password has been changed successfully, please sign in again"
        })
    })

}