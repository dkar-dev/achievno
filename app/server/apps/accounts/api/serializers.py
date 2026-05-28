from rest_framework import serializers


def normalize_email(value: str) -> str:
    return value.strip().lower()


def normalize_username(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip().lower()
    return normalized or None


class SignUpSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(trim_whitespace=False)
    display_name = serializers.CharField()
    username = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_email(self, value: str) -> str:
        email = normalize_email(value)
        local, separator, domain = email.partition("@")
        if separator != "@" or not local or not domain or "@" in domain:
            raise serializers.ValidationError("Enter a valid email address.")
        return email

    def validate_password(self, value: str) -> str:
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters.")
        return value

    def validate_display_name(self, value: str) -> str:
        display_name = value.strip()
        if len(display_name) < 2:
            raise serializers.ValidationError("Display name must be at least 2 characters.")
        return display_name

    def validate_username(self, value: str | None) -> str | None:
        return normalize_username(value)


class VerifyEmailSerializer(serializers.Serializer):
    token = serializers.CharField()

    def validate_token(self, value: str) -> str:
        token = value.strip()
        if not token:
            raise serializers.ValidationError("Token is required.")
        return token


class SignInSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(trim_whitespace=False)

    def validate_email(self, value: str) -> str:
        email = normalize_email(value)
        local, separator, domain = email.partition("@")
        if separator != "@" or not local or not domain or "@" in domain:
            raise serializers.ValidationError("Enter a valid email address.")
        return email
