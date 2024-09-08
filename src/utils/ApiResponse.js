class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;  // HTTP status code of the response (e.g., 200, 404, 500)
        this.data = data;              // The actual data/content returned in the response (can be any type)
        this.message = message;        // A message describing the result, defaults to "Success"
        this.success = statusCode < 400; // Boolean indicating success (true if status code is below 400)
    }
}

export { ApiResponse }