import express from 'express'
import { authController } from '../controllers/auth.controller.js'
import { validateAuth } from '../middlewares/validate.js'
import { signInSchema, signUpSchema, verifyEmailSchema, forgotPasswordSchema, changePasswordSchema } from '../validation/auth.validator.js'
import { protect } from '../middlewares/auth.middleware.js'
import rateLimit from 'express-rate-limit'

const authRouter = express.Router()

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: 'too many attempts, try again later' 
})

const signInLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10, 
    message: 'too many login attempts, try again later'
})

authRouter.post('/sign-up', validateAuth(signUpSchema), authController.signUp)
authRouter.post('/sign-in', signInLimiter, validateAuth(signInSchema), authController.signIn)
authRouter.post('/refresh-token', authController.refresh)
authRouter.post('/logout', authController.logOut)
authRouter.post('/verify-email', otpLimiter, validateAuth(verifyEmailSchema), authController.verifyEmail)

authRouter.post('/forgot-password', otpLimiter, validateAuth(forgotPasswordSchema), authController.forgotPassword)
authRouter.post('/change-password', otpLimiter, protect, validateAuth(changePasswordSchema), authController.changePassword)

authRouter.get('/secret-data', protect, (req, res) => {
    res.status(200).json({
        status: "success",
        message: "congratulations you are in this page",
        data: {
            user: req.user 
        }
    })
})

export default authRouter;