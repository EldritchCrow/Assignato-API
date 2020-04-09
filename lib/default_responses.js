

module.exports = {
    post_success: {
        success: true,
        message: "Operation performed successfully"
    },
    post_failure: {
        success: false,
        message: "An error occurred while performing the request"
    },
    auth_error: {
        success: false,
        message: "ERROR: The provided access token is invalid"
    },
    validation_error: {
        success: false,
        message: "ERROR: Some items in the request failed to pass validation"
    },
    deletion_error: {
        success: false,
        message: "ERROR: Failed to delete the specified item"
    }
}