from __future__ import annotations

from dataclasses import dataclass
from uuid import uuid4

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.test import override_settings
from rest_framework.test import APIClient

from apps.accounts.management.commands.achievno_smoke_auth import (
    AuthSmokeFailure,
    ensure_live_postgresql_database,
    expect_cookie,
    expect_json_value,
    expect_status,
    make_smoke_identity,
    safe_json,
)


class PersonalAchievementsSmokeFailure(Exception):
    pass


@dataclass(frozen=True)
class SignedInSmokeUser:
    account_id: str
    profile_id: str


def sign_in_smoke_user(client: APIClient, stdout) -> SignedInSmokeUser:
    identity = make_smoke_identity()
    sign_up_response = client.post(
        "/api/v1/auth/sign-up",
        {
            "email": identity.email,
            "password": identity.password,
            "display_name": identity.display_name,
            "username": identity.username,
        },
        format="json",
    )
    expect_status("sign-up", sign_up_response, 201)
    sign_up_body = safe_json(sign_up_response, "sign-up")
    verification_token = sign_up_body.get("dev_verification_token")
    if not verification_token:
        raise PersonalAchievementsSmokeFailure("sign-up did not return a dev verification token")

    verify_response = client.post("/api/v1/auth/verify-email", {"token": verification_token}, format="json")
    expect_status("verify-email", verify_response, 200)
    expect_json_value("verify-email", verify_response, "verified", True)

    sign_in_response = client.post(
        "/api/v1/auth/sign-in",
        {"email": identity.email, "password": identity.password},
        format="json",
    )
    expect_status("sign-in", sign_in_response, 200)
    expect_json_value("sign-in", sign_in_response, "authenticated", True)
    expect_cookie("sign-in", sign_in_response, settings.ACHIEVNO_ACCESS_COOKIE_NAME)
    expect_cookie("sign-in", sign_in_response, settings.ACHIEVNO_REFRESH_COOKIE_NAME)

    stdout.write("auth setup ok")
    return SignedInSmokeUser(
        account_id=sign_up_body["account_id"],
        profile_id=sign_up_body["profile_id"],
    )


def run_personal_achievements_smoke(client: APIClient, stdout) -> None:
    sign_in_smoke_user(client, stdout)
    suffix = uuid4().hex[:8]

    create_progress_response = client.post(
        "/api/v1/achievements/personal",
        {
            "base_type": "progress",
            "title": f"Smoke progress {suffix}",
            "short_definition": "Track smoke progress",
            "description": "Created by personal achievements smoke command.",
            "progress_target": "3.00",
            "unit_label": "steps",
        },
        format="json",
    )
    expect_status("create progress achievement", create_progress_response, 201)
    progress_achievement = safe_json(create_progress_response, "create progress achievement")["achievement"]
    progress_achievement_id = progress_achievement["achievement_id"]
    stdout.write("create progress achievement ok")

    list_response = client.get("/api/v1/achievements/personal", format="json")
    expect_status("list personal achievements", list_response, 200)
    list_body = safe_json(list_response, "list personal achievements")
    if not any(item.get("achievement_id") == progress_achievement_id for item in list_body.get("items", [])):
        raise PersonalAchievementsSmokeFailure("created progress achievement was not listed")
    stdout.write("list personal achievements ok")

    detail_response = client.get(f"/api/v1/achievements/{progress_achievement_id}", format="json")
    expect_status("detail achievement", detail_response, 200)
    expect_achievement_id("detail achievement", detail_response, progress_achievement_id)
    stdout.write("detail achievement ok")

    progress_response = client.post(
        f"/api/v1/achievements/{progress_achievement_id}/progress",
        {"delta_value": "1.00", "note_text": "smoke progress"},
        format="json",
    )
    expect_status("log progress", progress_response, 200)
    progress_body = safe_json(progress_response, "log progress")
    if progress_body["achievement"].get("progress_current") != 1.0 or not progress_body.get("log"):
        raise PersonalAchievementsSmokeFailure("progress log did not update current value")
    stdout.write("log progress ok")

    complete_progress_response = client.post(
        f"/api/v1/achievements/{progress_achievement_id}/complete",
        {"note_text": "smoke complete progress"},
        format="json",
    )
    expect_status("complete progress achievement", complete_progress_response, 200)
    expect_achievement_status("complete progress achievement", complete_progress_response, "completed")
    stdout.write("complete progress achievement ok")

    create_done_response = client.post(
        "/api/v1/achievements/personal",
        {
            "base_type": "done",
            "title": f"Smoke done {suffix}",
            "short_definition": "Complete smoke done item",
            "description": "Created by personal achievements smoke command.",
        },
        format="json",
    )
    expect_status("create done achievement", create_done_response, 201)
    done_achievement_id = safe_json(create_done_response, "create done achievement")["achievement"]["achievement_id"]
    stdout.write("create done achievement ok")

    complete_done_response = client.post(
        f"/api/v1/achievements/{done_achievement_id}/complete",
        {"note_text": "smoke complete done"},
        format="json",
    )
    expect_status("complete done achievement", complete_done_response, 200)
    expect_achievement_status("complete done achievement", complete_done_response, "completed")
    stdout.write("complete done achievement ok")

    archive_response = client.post(
        f"/api/v1/achievements/{done_achievement_id}/archive",
        {},
        format="json",
    )
    expect_status("archive achievement", archive_response, 200)
    expect_achievement_status("archive achievement", archive_response, "archived")
    stdout.write("archive achievement ok")

    main_response = client.get("/api/v1/main", format="json")
    expect_status("main aggregate counts", main_response, 200)
    main_body = safe_json(main_response, "main aggregate counts")
    personal_space = main_body.get("personal_space")
    if not isinstance(personal_space, dict) or personal_space.get("completed_achievements_count", 0) < 1:
        raise PersonalAchievementsSmokeFailure("main aggregate counts did not include completed smoke achievements")
    stdout.write("main aggregate counts ok")
    stdout.write("personal achievements smoke ok")


def expect_achievement_id(step: str, response, achievement_id: str) -> None:
    body = safe_json(response, step)
    achievement = body.get("achievement")
    if not isinstance(achievement, dict) or achievement.get("achievement_id") != achievement_id:
        raise PersonalAchievementsSmokeFailure(f"{step} returned unexpected achievement")


def expect_achievement_status(step: str, response, status: str) -> None:
    body = safe_json(response, step)
    achievement = body.get("achievement")
    if not isinstance(achievement, dict) or achievement.get("status") != status:
        raise PersonalAchievementsSmokeFailure(f"{step} returned unexpected status")


class Command(BaseCommand):
    help = "Run live PostgreSQL personal achievements smoke flow through the DRF API routes."

    def handle(self, *args, **options):
        try:
            ensure_live_postgresql_database()
            with override_settings(ACHIEVNO_RETURN_DEV_VERIFICATION_TOKEN=True):
                run_personal_achievements_smoke(APIClient(), self.stdout)
        except (AuthSmokeFailure, PersonalAchievementsSmokeFailure) as exc:
            raise CommandError(str(exc)) from exc
