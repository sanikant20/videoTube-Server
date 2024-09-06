class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message); // Call the parent class (Error) constructor with the message
        this.statusCode = statusCode; // HTTP status code for the error
        this.data = null; // Placeholder for any relevant data (could be set later)
        this.message = message; // Error message (overrides default if provided)
        this.success = false; // Indicates the operation failed (for consistency in API responses)
        this.errors = errors; // Array to capture multiple errors or error details

        if (stack) {
            this.stack = stack; // If a custom stack trace is provided, use it
        } else {
            Error.captureStackTrace(this, this.constructor); // Otherwise, capture the current stack trace
        }
    }
}

export { ApiError };
