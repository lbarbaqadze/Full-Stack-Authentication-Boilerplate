const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "invalid server"

    if (err.name === 'TokenExpiredError') {
        err.message = 'your session has expired. Please log in again';
        err.statusCode = 401;
        err.isOperational = true; 
    }

    if (err.name === 'JsonWebTokenError') {
        err.message = 'invalid token. Access denied';
        err.statusCode = 401;
        err.isOperational = true;
    }

    err.status = err.statusCode.toString().startsWith('4') ? 'Fail' : 'Error'

    if (process.env.NODE_ENV === "development") {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err
        })
    } else {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
        }
        console.error("Error", err)
        res.status(500).json({
            status: "error",
            message: "error"
        })
    }
}

export default errorHandler;