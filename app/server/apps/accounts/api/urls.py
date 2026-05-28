from django.urls import path

from apps.accounts.api.views import MeView, RefreshView, SignInView, SignOutView, SignUpView, VerifyEmailView


urlpatterns = [
    path("sign-up", SignUpView.as_view(), name="auth-sign-up"),
    path("verify-email", VerifyEmailView.as_view(), name="auth-verify-email"),
    path("sign-in", SignInView.as_view(), name="auth-sign-in"),
    path("refresh", RefreshView.as_view(), name="auth-refresh"),
    path("sign-out", SignOutView.as_view(), name="auth-sign-out"),
    path("me", MeView.as_view(), name="auth-me"),
]
