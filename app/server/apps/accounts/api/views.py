from __future__ import annotations

from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.api.serializers import SignInSerializer, SignUpSerializer, VerifyEmailSerializer
from apps.accounts.application.auth_service import AuthService
from apps.accounts.domain.errors import AuthError
from apps.accounts.infrastructure.authentication import CookieJWTAuthentication


def error_response(exc: AuthError) -> Response:
    return Response(
        {"error": {"code": exc.code, "message": exc.message}},
        status=exc.status_code,
    )


def validation_error_response(serializer) -> Response:
    return Response(
        {"error": {"code": "validation_error", "message": "Invalid request.", "fields": serializer.errors}},
        status=status.HTTP_400_BAD_REQUEST,
    )


def account_payload(account) -> dict:
    return {"account_id": str(account.account_id)}


def profile_payload(profile) -> dict:
    return {
        "profile_id": str(profile.profile_id),
        "display_name": profile.display_name,
        "username": profile.username,
    }


def set_access_cookie(response: Response, access_token: str) -> None:
    response.set_cookie(
        settings.ACHIEVNO_ACCESS_COOKIE_NAME,
        access_token,
        max_age=settings.ACHIEVNO_ACCESS_TOKEN_TTL_SECONDS,
        path=settings.ACHIEVNO_AUTH_COOKIE_PATH,
        secure=settings.ACHIEVNO_AUTH_COOKIE_SECURE,
        httponly=True,
        samesite=settings.ACHIEVNO_AUTH_COOKIE_SAMESITE,
    )


def set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        settings.ACHIEVNO_REFRESH_COOKIE_NAME,
        refresh_token,
        max_age=settings.ACHIEVNO_REFRESH_TOKEN_TTL_SECONDS,
        path=settings.ACHIEVNO_AUTH_COOKIE_PATH,
        secure=settings.ACHIEVNO_AUTH_COOKIE_SECURE,
        httponly=True,
        samesite=settings.ACHIEVNO_AUTH_COOKIE_SAMESITE,
    )


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(
        settings.ACHIEVNO_ACCESS_COOKIE_NAME,
        path=settings.ACHIEVNO_AUTH_COOKIE_PATH,
        samesite=settings.ACHIEVNO_AUTH_COOKIE_SAMESITE,
    )
    response.delete_cookie(
        settings.ACHIEVNO_REFRESH_COOKIE_NAME,
        path=settings.ACHIEVNO_AUTH_COOKIE_PATH,
        samesite=settings.ACHIEVNO_AUTH_COOKIE_SAMESITE,
    )


class SignUpView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = SignUpSerializer(data=request.data)
        if not serializer.is_valid():
            return validation_error_response(serializer)

        try:
            result = AuthService().sign_up(**serializer.validated_data)
        except AuthError as exc:
            return error_response(exc)

        payload = {
            "account_id": str(result.account.account_id),
            "profile_id": str(result.profile.profile_id),
            "email_verification_required": True,
            "verification_email_sent": result.verification_email_sent,
        }
        if result.dev_verification_token:
            payload["dev_verification_token"] = result.dev_verification_token
        return Response(payload, status=status.HTTP_201_CREATED)


class VerifyEmailView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        if not serializer.is_valid():
            return validation_error_response(serializer)

        try:
            AuthService().verify_email(**serializer.validated_data)
        except AuthError as exc:
            return error_response(exc)

        return Response({"verified": True})


class SignInView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = SignInSerializer(data=request.data)
        if not serializer.is_valid():
            return validation_error_response(serializer)

        try:
            result = AuthService().sign_in(
                **serializer.validated_data,
                user_agent=request.META.get("HTTP_USER_AGENT"),
                ip_address=request.META.get("REMOTE_ADDR"),
            )
        except AuthError as exc:
            return error_response(exc)

        response = Response(
            {
                "authenticated": True,
                "account": account_payload(result.account),
                "profile": profile_payload(result.profile),
            }
        )
        set_access_cookie(response, result.tokens.access_token)
        set_refresh_cookie(response, result.tokens.refresh_token)
        return response


class RefreshView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        try:
            result = AuthService().refresh(
                refresh_token=request.COOKIES.get(settings.ACHIEVNO_REFRESH_COOKIE_NAME),
            )
        except AuthError as exc:
            return error_response(exc)

        response = Response({"refreshed": True})
        set_access_cookie(response, result.access_token)
        return response


class SignOutView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        AuthService().sign_out(
            refresh_token=request.COOKIES.get(settings.ACHIEVNO_REFRESH_COOKIE_NAME),
        )
        response = Response({"signed_out": True})
        clear_auth_cookies(response)
        return response


class MeView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        principal = request.user
        try:
            result = AuthService().current_user(
                account_id=principal.account_id,
                profile_id=principal.profile_id,
                session_id=principal.session_id,
            )
        except AuthError as exc:
            return error_response(exc)

        return Response(
            {
                "authenticated": True,
                "account": account_payload(result.account),
                "profile": profile_payload(result.profile),
            }
        )
