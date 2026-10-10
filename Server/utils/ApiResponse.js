// Every success response has the same shape: { success, statusCode, message, data }.
// (The old class took (status, message, data) but was called as (status, data, message),
// so payloads ended up under "message".)
class ApiResponse {
    constructor(statusCode, data = null, message = "Success") {
        this.success = statusCode < 400;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}

export const send = (res, statusCode, data, message) =>
    res.status(statusCode).json(new ApiResponse(statusCode, data, message));

export { ApiResponse };
