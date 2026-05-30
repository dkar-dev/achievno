from __future__ import annotations

import os
from dataclasses import dataclass
from uuid import uuid4

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import DEFAULT_DB_ALIAS, connections
from django.test import override_settings
from rest_framework.test import APIClient


@dataclass(frozen=True)
class SmokeIdentity:
    email: str
    password: str
    display_name: str
    username: str


class AuthSmokeFailure(Exception):
    pass


def ensure_live_postgresql_database() -> None:
    if not os.environ.get("DATABASE_URL"):
        raise AuthSmokeFailure("auth smoke requires DATABASE_URL for live PostgreSQL")

    database = settings.DATABASES[DEFAULT_DB_ALIAS]
    engine = str(database.get("ENGINE", ""))
    if "sqlite" in engine:
        raise AuthSmokeFailure("auth smoke requires live PostgreSQL; sqlite fallback is not allowed")

    connection = connections[DEFAULT_DB_ALIAS]
    if connection.vendor != "postgresql":
        raise AuthSmokeFailure("auth smoke requires live PostgreSQL")


def make_smoke_identity() -> SmokeIdentity:
    suffix = uuid4().hex[:12]
    return SmokeIdentity(
        email=f"auth-smoke-{suffix}@example.test",
        password=f"auth-smoke-password-{suffix}",
        display_name="Achievno Smoke User",
        username=f"auth_smoke_{suffix}",
    )


def run_auth_smoke(client: APIClient, identity: SmokeIdentity, stdout) -> None:
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
    account_id = sign_up_body.get("account_id")
    profile_id = sign_up_body.get("profile_id")
    if not account_id or not profile_id:
        raise AuthSmokeFailure("sign-up returned incomplete identity")
    verification_token = sign_up_body.get("dev_verification_token")
    if not verification_token:
        raise AuthSmokeFailure("sign-up did not return a dev verification token")
    stdout.write("sign-up ok")

    verify_response = client.post(
        "/api/v1/auth/verify-email",
        {"token": verification_token},
        format="json",
    )
    expect_status("verify-email", verify_response, 200)
    expect_json_value("verify-email", verify_response, "verified", True)
    stdout.write("verify-email ok")

    sign_in_response = client.post(
        "/api/v1/auth/sign-in",
        {"email": identity.email, "password": identity.password},
        format="json",
    )
    expect_status("sign-in", sign_in_response, 200)
    expect_json_value("sign-in", sign_in_response, "authenticated", True)
    expect_cookie("sign-in", sign_in_response, settings.ACHIEVNO_ACCESS_COOKIE_NAME)
    expect_cookie("sign-in", sign_in_response, settings.ACHIEVNO_REFRESH_COOKIE_NAME)
    stdout.write("sign-in ok")

    me_response = client.get("/api/v1/auth/me", format="json")
    expect_status("me", me_response, 200)
    expect_json_value("me", me_response, "authenticated", True)
    expect_identity("me", me_response, account_id=account_id, profile_id=profile_id)
    stdout.write("me ok")

    refresh_response = client.post("/api/v1/auth/refresh", format="json")
    expect_status("refresh", refresh_response, 200)
    expect_json_value("refresh", refresh_response, "refreshed", True)
    expect_cookie("refresh", refresh_response, settings.ACHIEVNO_ACCESS_COOKIE_NAME)
    stdout.write("refresh ok")

    sign_out_response = client.post("/api/v1/auth/sign-out", format="json")
    expect_status("sign-out", sign_out_response, 200)
    expect_json_value("sign-out", sign_out_response, "signed_out", True)
    expect_cleared_cookie("sign-out", sign_out_response, settings.ACHIEVNO_ACCESS_COOKIE_NAME)
    expect_cleared_cookie("sign-out", sign_out_response, settings.ACHIEVNO_REFRESH_COOKIE_NAME)
    stdout.write("sign-out ok")

    post_sign_out_response = client.get("/api/v1/auth/me", format="json")
    if post_sign_out_response.status_code not in {401, 403}:
        raise AuthSmokeFailure(
            f"post-sign-out auth rejected failed with HTTP {post_sign_out_response.status_code}"
        )
    stdout.write("post-sign-out auth rejected ok")
    stdout.write("auth smoke ok")


def expect_status(step: str, response, expected_status: int) -> None:
    if response.status_code != expected_status:
        raise AuthSmokeFailure(f"{step} failed with HTTP {response.status_code}")


def safe_json(response, step: str) -> dict:
    try:
        body = response.json()
    except ValueError as exc:
        raise AuthSmokeFailure(f"{step} returned non-JSON response") from exc
    if not isinstance(body, dict):
        raise AuthSmokeFailure(f"{step} returned invalid JSON response")
    return body


def expect_json_value(step: str, response, key: str, expected_value: object) -> None:
    body = safe_json(response, step)
    if body.get(key) != expected_value:
        raise AuthSmokeFailure(f"{step} returned unexpected response")


def expect_cookie(step: str, response, cookie_name: str) -> None:
    cookie = response.cookies.get(cookie_name)
    if cookie is None or not cookie.value:
        raise AuthSmokeFailure(f"{step} did not set required auth cookie")
    if not cookie["httponly"]:
        raise AuthSmokeFailure(f"{step} auth cookie is not httpOnly")


def expect_cleared_cookie(step: str, response, cookie_name: str) -> None:
    cookie = response.cookies.get(cookie_name)
    if cookie is None or cookie.value:
        raise AuthSmokeFailure(f"{step} did not clear required auth cookie")


def expect_identity(step: str, response, *, account_id: str, profile_id: str) -> None:
    body = safe_json(response, step)
    account = body.get("account")
    profile = body.get("profile")
    if not isinstance(account, dict) or not isinstance(profile, dict):
        raise AuthSmokeFailure(f"{step} returned incomplete identity")
    if account.get("account_id") != account_id or profile.get("profile_id") != profile_id:
        raise AuthSmokeFailure(f"{step} returned mismatched identity")


class Command(BaseCommand):
    help = "Run live PostgreSQL auth smoke flow through the DRF API routes."

    def handle(self, *args, **options):
        try:
            ensure_live_postgresql_database()
            with override_settings(
                ACHIEVNO_RETURN_DEV_VERIFICATION_TOKEN=True,
                ACHIEVNO_SEND_VERIFICATION_EMAIL=False,
            ):
                run_auth_smoke(APIClient(), make_smoke_identity(), self.stdout)
        except AuthSmokeFailure as exc:
            raise CommandError(str(exc)) from exc
