class ApiError extends Error{
    constructor(StatusCode,message = "Something went wrong",errors,stack = ""){
        super(message)
        this.StatusCode = StatusCode
        this.errors = errors
        this.success = false
        this.data = null

        if(stack){
            this.stack = stack
    }
    else{
        Error.captureStackTrace(this,this.constructor)
    }
}
}
export {ApiError}