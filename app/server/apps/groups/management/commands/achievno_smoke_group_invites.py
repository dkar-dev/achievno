from __future__ import annotations

from uuid import uuid4

from django.core.management.base import BaseCommand, CommandError
from django.test import override_settings
from rest_framework.test import APIClient

from apps.accounts.management.commands.achievno_smoke_auth import (
    AuthSmokeFailure,
    ensure_live_postgresql_database,
    expect_status,
    safe_json,
)
from apps.achievements.management.commands.achievno_smoke_personal_achievements import (
    PersonalAchievementsSmokeFailure,
    sign_in_smoke_user,
)


class GroupInvitesSmokeFailure(Exception):
    pass


def run_group_invites_smoke(stdout) -> None:
    user_a_client = APIClient()
    user_a = sign_in_smoke_user(user_a_client, stdout)

    user_b_client = APIClient()
    user_b = sign_in_smoke_user(user_b_client, stdout)
    if user_a.profile_id == user_b.profile_id:
        raise GroupInvitesSmokeFailure("auth setup returned duplicate profiles")

    suffix = uuid4().hex[:8]
    create_group_response = user_a_client.post(
        "/api/v1/groups/",
        {
            "title": f"Smoke Team {suffix}",
            "description": "Created by group invites smoke command.",
            "visibility_type": "private",
        },
        format="json",
    )
    expect_status("create group", create_group_response, 201)
    group = safe_json(create_group_response, "create group").get("group")
    if not isinstance(group, dict) or not group.get("group_id"):
        raise GroupInvitesSmokeFailure("create group did not return group id")
    group_id = group["group_id"]
    stdout.write("create group ok")

    create_invite_response = user_a_client.post(f"/api/v1/groups/{group_id}/invites", {}, format="json")
    expect_status("create group invite", create_invite_response, 201)
    invite = safe_json(create_invite_response, "create group invite").get("invite")
    if not isinstance(invite, dict) or not invite.get("token") or not invite.get("url"):
        raise GroupInvitesSmokeFailure("create group invite did not return shareable token")
    token = invite["token"]
    stdout.write("create group invite ok")

    fetch_invite_response = user_b_client.get(f"/api/v1/group-invites/{token}", format="json")
    expect_status("fetch group invite", fetch_invite_response, 200)
    stdout.write("fetch group invite ok")

    accept_response = user_b_client.post(f"/api/v1/group-invites/{token}/accept", {}, format="json")
    expect_status("accept group invite", accept_response, 201)
    accepted_group = safe_json(accept_response, "accept group invite").get("group")
    if not isinstance(accepted_group, dict) or accepted_group.get("group_id") != group_id:
        raise GroupInvitesSmokeFailure("accept group invite did not return joined group")
    stdout.write("accept group invite ok")

    members_response = user_b_client.get(f"/api/v1/groups/{group_id}/members", format="json")
    expect_status("list group members", members_response, 200)
    members_body = safe_json(members_response, "list group members")
    members = members_body.get("items")
    if not isinstance(members, list) or len(members) < 2:
        raise GroupInvitesSmokeFailure("group members did not include both smoke users")
    stdout.write("list group members ok")

    detail_a_response = user_a_client.get(f"/api/v1/groups/{group_id}", format="json")
    expect_status("group detail user A", detail_a_response, 200)
    stdout.write("group detail user A ok")

    detail_b_response = user_b_client.get(f"/api/v1/groups/{group_id}", format="json")
    expect_status("group detail user B", detail_b_response, 200)
    stdout.write("group detail user B ok")

    create_achievement_response = user_b_client.post(
        f"/api/v1/groups/{group_id}/achievements",
        {
            "base_type": "progress",
            "title": f"Smoke team {suffix}",
            "short_definition": "Track team smoke progress",
            "description": "Created by group invites smoke command.",
            "progress_target": "2.00",
            "unit_label": "steps",
        },
        format="json",
    )
    expect_status("create group achievement", create_achievement_response, 201)
    achievement = safe_json(create_achievement_response, "create group achievement").get("achievement")
    if not isinstance(achievement, dict) or achievement.get("assignment_mode") != "all_members":
        raise GroupInvitesSmokeFailure("create group achievement returned unexpected payload")
    stdout.write("create group achievement ok")
    stdout.write("group invites smoke ok")


class Command(BaseCommand):
    help = "Run live PostgreSQL group members, invites, and team achievements smoke flow."

    def handle(self, *args, **options):
        try:
            ensure_live_postgresql_database()
            with override_settings(
                ACHIEVNO_RETURN_DEV_VERIFICATION_TOKEN=True,
                ACHIEVNO_SEND_VERIFICATION_EMAIL=False,
            ):
                run_group_invites_smoke(self.stdout)
        except (AuthSmokeFailure, PersonalAchievementsSmokeFailure, GroupInvitesSmokeFailure) as exc:
            raise CommandError(str(exc)) from exc
