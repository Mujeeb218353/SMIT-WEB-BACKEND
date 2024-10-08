const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res,next);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: 'Duplicate key error',
            });
        } else {
            const statusCode = error instanceof Error && error.statusCode ? error.statusCode : 500;
            res.status(statusCode || 500).json({
                statusCode: statusCode || 500,
                success: false,
                message: error.message,
            });
        }
    }
}

export  { asyncHandler };