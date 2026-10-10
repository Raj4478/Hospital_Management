class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.success = false;
    }

    static badRequest(message, errors) { return new ApiError(400, message, errors); }
    static unauthorized(message = "Please sign in to continue") { return new ApiError(401, message); }
    static forbidden(message = "You do not have access to this resource") { return new ApiError(403, message); }
    static notFound(what = "Resource") { return new ApiError(404, `${what} not found`); }
    static conflict(message) { return new ApiError(409, message); }
}

export { ApiError };
