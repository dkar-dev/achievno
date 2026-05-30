from __future__ import annotations


class FriendError(Exception):
    code = "friend_error"
    message = "Friend request failed."
    status_code = 400


class FriendRelationNotFound(FriendError):
    code = "friend_relation_not_found"
    message = "Friend relation not found."
    status_code = 404


class FriendInviteNotFound(FriendError):
    code = "friend_invite_not_found"
    message = "Invite not found."
    status_code = 404


class FriendInviteInvalid(FriendError):
    code = "friend_invite_invalid"
    message = "Invite cannot be used."
    status_code = 400


class FriendInviteAlreadyUsed(FriendError):
    code = "friend_invite_already_used"
    message = "Invite is already used."
    status_code = 409


class FriendSelfInvite(FriendError):
    code = "friend_self_invite"
    message = "You cannot accept your own invite."
    status_code = 400


class FriendValidationError(FriendError):
    code = "friend_validation_error"
    message = "Friend request is invalid."
    status_code = 400

    def __init__(self, fields: dict[str, list[str]]):
        super().__init__(self.message)
        self.fields = fields

