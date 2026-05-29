from __future__ import annotations


class GroupError(Exception):
    code = "group_error"
    message = "Group request failed."
    status_code = 400


class GroupNotFound(GroupError):
    code = "group_not_found"
    message = "Group not found."
    status_code = 404


class GroupValidationError(GroupError):
    code = "group_validation_error"
    message = "Group request is invalid."
    status_code = 400

    def __init__(self, fields: dict[str, list[str]]):
        super().__init__(self.message)
        self.fields = fields


class GroupPersistenceError(GroupError):
    code = "group_persistence_error"
    message = "Group could not be saved."
    status_code = 500
