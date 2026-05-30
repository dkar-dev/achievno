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


class ChallengesSmokeFailure(Exception):
    pass


def run_challenges_smoke(client: APIClient, stdout) -> None:
    sign_in_smoke_user(client, stdout)
    suffix = uuid4().hex[:8]

    create_response = client.post(
        "/api/v1/challenges",
        {
            "title": f"Smoke challenge {suffix}",
            "description": "Created by challenges smoke command.",
            "goal_title": "Complete smoke progress",
            "target_value": "5.00",
            "unit_label": "points",
        },
        format="json",
    )
    expect_status("create challenge", create_response, 201)
    challenge = safe_json(create_response, "create challenge")["challenge"]
    challenge_id = challenge["challenge_id"]
    stdout.write("create challenge ok")

    list_response = client.get("/api/v1/challenges", format="json")
    expect_status("list challenges", list_response, 200)
    list_body = safe_json(list_response, "list challenges")
    if not any(item.get("challenge_id") == challenge_id for item in list_body.get("items", [])):
        raise ChallengesSmokeFailure("created challenge was not listed")
    stdout.write("list challenges ok")

    detail_response = client.get(f"/api/v1/challenges/{challenge_id}", format="json")
    expect_status("detail challenge", detail_response, 200)
    expect_challenge_id("detail challenge", detail_response, challenge_id)
    stdout.write("detail challenge ok")

    join_response = client.post(f"/api/v1/challenges/{challenge_id}/join", {}, format="json")
    expect_status("join challenge", join_response, 200)
    join_body = safe_json(join_response, "join challenge")
    if join_body.get("participant", {}).get("status") not in {"joined", "completed"}:
        raise ChallengesSmokeFailure("join challenge returned unexpected participant state")
    stdout.write("join challenge ok")

    progress_response = client.post(
        f"/api/v1/challenges/{challenge_id}/progress",
        {"delta_value": "2.00", "note_text": "smoke progress"},
        format="json",
    )
    expect_status("challenge progress", progress_response, 200)
    progress_body = safe_json(progress_response, "challenge progress")
    if progress_body.get("participant", {}).get("progress_value") != 2.0 or not progress_body.get("event"):
        raise ChallengesSmokeFailure("challenge progress did not update participant state")
    stdout.write("challenge progress ok")

    complete_response = client.post(
        f"/api/v1/challenges/{challenge_id}/complete",
        {"note_text": "smoke complete"},
        format="json",
    )
    expect_status("complete challenge", complete_response, 200)
    complete_body = safe_json(complete_response, "complete challenge")
    if complete_body.get("participant", {}).get("status") != "completed" or not complete_body.get("event"):
        raise ChallengesSmokeFailure("complete challenge did not complete participant flow")
    stdout.write("complete challenge ok")
    stdout.write("challenges smoke ok")


def expect_challenge_id(step: str, response, challenge_id: str) -> None:
    body = safe_json(response, step)
    challenge = body.get("challenge")
    if not isinstance(challenge, dict) or challenge.get("challenge_id") != challenge_id:
        raise ChallengesSmokeFailure(f"{step} returned unexpected challenge")


class Command(BaseCommand):
    help = "Run live PostgreSQL challenges smoke flow through the DRF API routes."

    def handle(self, *args, **options):
        try:
            ensure_live_postgresql_database()
            with override_settings(
                ACHIEVNO_RETURN_DEV_VERIFICATION_TOKEN=True,
                ACHIEVNO_SEND_VERIFICATION_EMAIL=False,
            ):
                run_challenges_smoke(APIClient(), self.stdout)
        except (AuthSmokeFailure, PersonalAchievementsSmokeFailure, ChallengesSmokeFailure) as exc:
            raise CommandError(str(exc)) from exc
