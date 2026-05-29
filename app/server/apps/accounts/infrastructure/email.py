from __future__ import annotations

from urllib.parse import urlencode

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.mail import EmailMultiAlternatives
from django.utils.html import escape


def build_email_verification_url(token: str) -> str:
    base_url = settings.ACHIEVNO_PUBLIC_APP_URL.rstrip("/")
    path = settings.ACHIEVNO_EMAIL_VERIFICATION_PATH
    if not path.startswith("/"):
        path = f"/{path}"
    return f"{base_url}{path}?{urlencode({'token': token})}"


def send_verification_email(*, email: str, display_name: str, token: str) -> bool:
    if not settings.ACHIEVNO_SEND_VERIFICATION_EMAIL:
        return False

    if "smtp.EmailBackend" in settings.EMAIL_BACKEND and not settings.EMAIL_HOST:
        raise ImproperlyConfigured(
            "EMAIL_HOST is required when ACHIEVNO_SEND_VERIFICATION_EMAIL=true"
        )
    if not settings.DEFAULT_FROM_EMAIL:
        raise ImproperlyConfigured(
            "DEFAULT_FROM_EMAIL is required when ACHIEVNO_SEND_VERIFICATION_EMAIL=true"
        )

    verification_url = build_email_verification_url(token)
    safe_display_name = display_name.strip() or "there"
    escaped_display_name = escape(safe_display_name)
    escaped_url = escape(verification_url)

    subject = "Verify your Achievno email"
    text_body = (
        f"Hi {safe_display_name},\n\n"
        "Confirm your Achievno account by opening this link:\n"
        f"{verification_url}\n\n"
        "If you did not create an Achievno account, ignore this email."
    )
    html_body = (
        f"<p>Hi {escaped_display_name},</p>"
        "<p>Confirm your Achievno account by opening this link:</p>"
        f'<p><a href="{escaped_url}">Verify email</a></p>'
        "<p>If you did not create an Achievno account, ignore this email.</p>"
    )

    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email],
    )
    message.attach_alternative(html_body, "text/html")
    message.send(fail_silently=False)
    return True
