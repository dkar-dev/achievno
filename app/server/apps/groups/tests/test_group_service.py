from types import SimpleNamespace
from unittest import TestCase
from uuid import uuid4

from apps.groups.application.group_service import GroupService
from apps.groups.domain.errors import GroupInviteAlreadyUsed


class GroupServiceTests(TestCase):
    def test_accept_group_invite_reuses_existing_membership(self):
        group_id = uuid4()
        membership = SimpleNamespace(
            group=SimpleNamespace(
                group_id=group_id,
                title="Demo Team",
                description=None,
                avatar_url=None,
                visibility_type="private",
                base_permission="member",
                created_at=None,
                updated_at=None,
            ),
            role="member",
            membership_status="active",
            joined_at=None,
        )
        repository = FakeGroupRepository(accept_result=(membership, "already_member"))

        payload = GroupService(repository=repository).accept_invite(token="demo-token", profile_id=uuid4())

        self.assertEqual(payload["group"]["group_id"], str(group_id))
        self.assertEqual(payload["group"]["membership_status"], "active")

    def test_accept_group_invite_rejects_used_invite_for_non_member(self):
        repository = FakeGroupRepository(accept_result=(None, "already_used"))

        with self.assertRaises(GroupInviteAlreadyUsed):
            GroupService(repository=repository).accept_invite(token="demo-token", profile_id=uuid4())


class FakeGroupRepository:
    def __init__(self, *, accept_result):
        self.accept_result = accept_result

    def accept_invite(self, *, token, profile_id):
        return self.accept_result

    def member_count(self, *, group_id):
        return 1

    def achievement_counts(self, *, group_id):
        return {"active": 0, "completed": 0}
