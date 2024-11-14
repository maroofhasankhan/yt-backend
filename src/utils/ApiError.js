// Custom error class for handling API-specific errors
class ApiError extends Error {
    constructor(
        statusCode,        // HTTP status code for the error
        message= "something went wrong",  // Error message, defaults to generic message
        errors=[],        // Array of additional error details
        stack =""         // Optional stack trace
    ){
        // Call parent Error constructor with message
        super(message)
        
        // Set custom properties
        this.statusCode = statusCode;  // HTTP status code
        this.data = null               // Placeholder for any error data
        this.message = message;        // Error message
        this.success = false;          // Indicates operation failed
        this.errors = errors;          // Array of detailed errors

        // Handle stack trace
        if(stack){
            this.stack = stack;        // Use provided stack trace if available
        }else{
            // Capture and attach stack trace to this instance
            Error.captureStackTrace(this, this.constructor);
        }

    }
}

// Export ApiError class for use in other modules
export { ApiError } 