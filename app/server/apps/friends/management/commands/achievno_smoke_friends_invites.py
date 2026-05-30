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


class FriendsInvitesSmokeFailure(Exception):
    pass


def run_friends_invites_smoke(stdout) -> None:
    user_a_client = APIClient()
    user_a = sign_in_smoke_user(user_a_client, stdout)

    user_b_client = APIClient()
    user_b = sign_in_smoke_user(user_b_client, stdout)
    if user_a.profile_id == user_b.profile_id:
        raise FriendsInvitesSmokeFailure("auth setup returned duplicate profiles")

    create_invite_response = user_a_client.post("/api/v1/friends/invites", {}, format="json")
    expect_status("create invite", create_invite_response, 201)
    invite = safe_json(create_invite_response, "create invite").get("invite")
    if not isinstance(invite, dict) or not invite.get("token") or not invite.get("url"):
        raise FriendsInvitesSmokeFailure("create invite did not return shareable token")
    token = invite["token"]
    stdout.write("create invite ok")

    fetch_invite_response = user_b_client.get(f"/api/v1/friends/invites/{token}", format="json")
    expect_status("fetch invite", fetch_invite_response, 200)
    stdout.write("fetch invite ok")

    accept_response = user_b_client.post(f"/api/v1/friends/invites/{token}/accept", {}, format="json")
    expect_status("accept invite", accept_response, 201)
    relation = safe_json(accept_response, "accept invite").get("relation")
    if not isinstance(relation, dict) or relation.get("status") != "active":
        raise FriendsInvitesSmokeFailure("accept invite did not return active relation")
    relation_id = relation["friend_connection_id"]
    stdout.write("accept invite ok")

    list_a_response = user_a_client.get("/api/v1/friends/", format="json")
    expect_status("list friends user A", list_a_response, 200)
    expect_relation_in_list("list friends user A", list_a_response, relation_id)
    stdout.write("list friends user A ok")

    list_b_response = user_b_client.get("/api/v1/friends/", format="json")
    expect_status("list friends user B", list_b_response, 200)
    expect_relation_in_list("list friends user B", list_b_response, relation_id)
    stdout.write("list friends user B ok")

    detail_response = user_b_client.get(f"/api/v1/friends/{relation_id}", format="json")
    expect_status("friend detail", detail_response, 200)
    stdout.write("friend detail ok")

    suffix = uuid4().hex[:8]
    create_achievement_response = user_b_client.post(
        f"/api/v1/friends/{relation_id}/achievements",
        {
            "base_type": "progress",
            "title": f"Smoke shared {suffix}",
            "short_definition": "Track shared smoke progress",
            "description": "Created by friends invites smoke command.",
            "progress_target": "2.00",
            "unit_label": "steps",
        },
        format="json",
    )
    expect_status("create shared achievement", create_achievement_response, 201)
    achievement = safe_json(create_achievement_response, "create shared achievement").get("achievement")
    if not isinstance(achievement, dict) or achievement.get("assignment_mode") != "all_members":
        raise FriendsInvitesSmokeFailure("create shared achievement returned unexpected payload")
    achievement_id = achievement["achievement_id"]
    stdout.write("create shared achievement ok")

    achievement_detail_response = user_a_client.get(f"/api/v1/achievements/{achievement_id}", format="json")
    expect_status("shared achievement detail", achievement_detail_response, 200)
    stdout.write("shared achievement detail ok")

    progress_response = user_a_client.post(
        f"/api/v1/achievements/{achievement_id}/progress",
        {"delta_value": "1.00", "note_text": "smoke shared progress"},
        format="json",
    )
    expect_status("log shared progress", progress_response, 200)
    stdout.write("log shared progress ok")
    stdout.write("friends invites smoke ok")


def expect_relation_in_list(step: str, response, relation_id: str) -> None:
    body = safe_json(response, step)
    items = body.get("items")
    if not isinstance(items, list):
        raise FriendsInvitesSmokeFailure(f"{step} returned invalid items")
    if not any(item.get("friend_connection_id") == relation_id for item in items if isinstance(item, dict)):
        raise FriendsInvitesSmokeFailure(f"{step} did not include accepted relation")


class Command(BaseCommand):
    help = "Run live PostgreSQL friends, invites, and shared 1-1 achievements smoke flow."

    def handle(self, *args, **options):
        try:
            ensure_live_postgresql_database()
            with override_settings(
                ACHIEVNO_RETURN_DEV_VERIFICATION_TOKEN=True,
                ACHIEVNO_SEND_VERIFICATION_EMAIL=False,
            ):
                run_friends_invites_smoke(self.stdout)
        except (AuthSmokeFailure, PersonalAchievementsSmokeFailure, FriendsInvitesSmokeFailure) as exc:
            raise CommandError(str(exc)) from exc
