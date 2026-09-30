import Joi from 'joi'

export const signUpSchema = Joi.object({
    name: Joi.string().trim().min(2).max(12).required().messages({
        'string.empty': 'the name field must not be empty',
        'any.required': 'the name field is required',
        'string.min': 'the name field must contain at least 2 characters',
        'string.max': 'the name must contain a maximum of 12 characters'
    }),

    surname: Joi.string().trim().min(5).max(15).required().messages({
        'string.empty': 'the surname field must not be empty',
        'any.required': 'the surname field is required',
        'string.min': 'the surname field must contain at least 5 characters',
        'string.max': 'the surname must contain a maximum of 15 characters'
    }),
    email: Joi.string().trim().email().required().messages({
        'string.empty': 'the email field must not be empty',
        'any.required': 'the email field is required',
    }),
    password: Joi.string().trim().min(8).max(20).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/).required().messages({
        'string.empty': 'the password field must not be empty',
        'any.required': 'the password field is required',
        'string.min': 'the password must contain at least 8 characters',
        'string.max': 'the password must contain a maximum of 20 characters',
        'string.pattern.base': 'password must contain uppercase, lowercase, number and special character'
    })
})

export const signInSchema = Joi.object({
    email: Joi.string().trim().email().required().messages({
        'string.empty': 'the email field must not be empty',
        'any.required': 'the email field is required',
        'string.email': 'please enter a valid email address'
    }),

    password: Joi.string().trim().required().messages({
        'string.empty': 'the password field must not be empty',
        'any.required': 'the password field is required'
    })
})

export const verifyEmailSchema = Joi.object({
    email: Joi.string().trim().email().required().messages({
        'string.empty': 'the email field must not be empty',
        'any.required': 'the email field is required',
        'string.email': 'please enter a valid email address'
    }),
    code: Joi.string().trim().length(6).pattern(/^\d+$/).required().messages({
        'string.empty': 'the code field must not be empty',
        'any.required': 'the code field is required',
        'string.length': 'the code must be 6 digits',
        'string.pattern.base': 'the code must contain only numbers'
    })
})

const passwordField = Joi.string().trim().min(8).max(20).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/).required().messages({
    'string.empty': 'the password field must not be empty',
    'any.required': 'the password field is required',
    'string.min': 'the password must contain at least 8 characters',
    'string.max': 'the password must contain a maximum of 20 characters',
    'string.pattern.base': 'password must contain uppercase, lowercase, number and special character'
})

const codeField = Joi.string().trim().length(6).pattern(/^\d+$/).required().messages({
    'string.empty': 'the code field must not be empty',
    'any.required': 'the code field is required',
    'string.length': 'the code must be 6 digits',
    'string.pattern.base': 'the code must contain only numbers'
})

const emailField = Joi.string().trim().email().required().messages({
    'string.empty': 'the email field must not be empty',
    'any.required': 'the email field is required',
    'string.email': 'please enter a valid email address'
})

export const forgotPasswordSchema = Joi.alternatives().try(
    Joi.object({ email: emailField }),
    Joi.object({ email: emailField, code: codeField, password: passwordField })
)

export const changePasswordSchema = Joi.alternatives().try(
    Joi.object({}),
    Joi.object({ code: codeField, password: passwordField })
)