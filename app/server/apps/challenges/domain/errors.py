from __future__ import annotations


class ChallengeError(Exception):
    code = "challenge_error"
    message = "Challenge request failed."
    status_code = 400


class ChallengeNotFound(ChallengeError):
    code = "not_found"
    message = "Challenge was not found."
    status_code = 404


class ChallengeArchived(ChallengeError):
    code = "challenge_archived"
    message = "Challenge is archived."
    status_code = 409


class ChallengeValidationError(ChallengeError):
    code = "validation_error"
    message = "Invalid request."
    status_code = 400

    def __init__(self, fields: dict[str, list[str]]):
        super().__init__(self.message)
        self.fields = fields


class ChallengeProgressError(ChallengeError):
    code = "progress_failed"
    message = "Challenge progress could not be recorded."
    status_code = 400
