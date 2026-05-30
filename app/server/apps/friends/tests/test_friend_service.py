from unittest.mock import Mock
from uuid import uuid4

from django.test import SimpleTestCase

from apps.friends.domain.errors import FriendInviteAlreadyUsed, FriendSelfInvite
from apps.friends.application.friend_service import FriendService


class FriendServiceTests(SimpleTestCase):
    def test_accept_invite_rejects_self_accept(self):
        repository = Mock()
        repository.accept_invite.return_value = (object(), "self_accept")
        service = FriendService(repository=repository)

        with self.assertRaises(FriendSelfInvite):
            service.accept_invite(token="token", profile_id=uuid4())

    def test_accept_invite_rejects_already_used_invite(self):
        repository = Mock()
        repository.accept_invite.return_value = (object(), "already_used")
        service = FriendService(repository=repository)

        with self.assertRaises(FriendInviteAlreadyUsed):
            service.accept_invite(token="token", profile_id=uuid4())

