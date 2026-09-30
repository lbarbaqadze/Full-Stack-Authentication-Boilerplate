import jwt from 'jsonwebtoken'
import catchAsync from '../utils/catchAsync.js'
import appError from '../utils/appError.js'
import { authModel } from '../models/auth.model.js'

export const protect = catchAsync(async (req, res, next) => {

    const { accessToken } = req.cookies

    if(!accessToken){
        return next(new appError("you are not authorized", 401))
    } 

    let decoded
    try {
        decoded = jwt.verify(accessToken, process.env.JWT_SECRET)
    } catch (err) {
        return next(new appError("invalid or expired access token", 401))
    }

    const currentUser = await authModel.findById(decoded.userId)

    if(!currentUser){
        return next(new appError("the user who owned this token does not exist", 401))
    } 

    if(!currentUser.is_verified){
        return next(new appError("please, get verify", 403))
    }

    req.user = currentUser

    next()

})