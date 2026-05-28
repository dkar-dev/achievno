from __future__ import annotations


class PersonalAchievementError(Exception):
    code = "personal_achievement_error"
    message = "Personal achievement request failed."
    status_code = 400


class PersonalAchievementValidationError(PersonalAchievementError):
    code = "validation_error"
    message = "Invalid request."
    status_code = 400

    def __init__(self, fields: dict[str, list[str]]):
        super().__init__(self.message)
        self.fields = fields


class PersonalAchievementNotFound(PersonalAchievementError):
    code = "not_found"
    message = "Achievement not found."
    status_code = 404


class PersonalAchievementArchived(PersonalAchievementError):
    code = "achievement_archived"
    message = "Archived achievements cannot be changed."
    status_code = 400


class PersonalAchievementProgressError(PersonalAchievementError):
    code = "progress_failed"
    message = "Progress could not be recorded."
    status_code = 400
