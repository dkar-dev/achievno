class AuthError(Exception):
    status_code = 400
    code = "auth_error"
    message = "Authentication request failed."

    def __init__(self, message: str | None = None, *, code: str | None = None):
        self.message = message or self.message
        self.code = code or self.code
        super().__init__(self.message)


class InvalidCredentials(AuthError):
    status_code = 401
    code = "invalid_credentials"
    message = "Invalid credentials."


class AuthenticationRequired(AuthError):
    status_code = 401
    code = "authentication_required"
    message = "Authentication required."


class DuplicateAccount(AuthError):
    status_code = 400
    code = "account_already_exists"
    message = "Account already exists."


class DuplicateUsername(AuthError):
    status_code = 400
    code = "username_already_exists"
    message = "Username already exists."


class InvalidVerificationToken(AuthError):
    status_code = 400
    code = "invalid_verification_token"
    message = "Verification token is invalid or expired."
