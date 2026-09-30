import appError from "../utils/appError.js";

export const validateAuth = (schema) => { 
    return (req, res, next) => {
        const {error} = schema.validate(req.body)

        if(error){
            const errorMessage = error.details.map(el => el.message).join('. ')
            return next(new appError(errorMessage, 400))
        }

        next()
    }
}