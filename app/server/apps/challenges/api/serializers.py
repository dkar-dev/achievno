from __future__ import annotations

from rest_framework import serializers


class ChallengeListSerializer(serializers.Serializer):
    status = serializers.CharField(required=False, allow_blank=False)
    limit = serializers.IntegerField(required=False, min_value=1, max_value=100, default=50)


class ChallengeCreateSerializer(serializers.Serializer):
    title = serializers.CharField(min_length=2, max_length=180, trim_whitespace=True)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    goal_title = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=255)
    target_value = serializers.DecimalField(
        required=False,
        allow_null=True,
        max_digits=14,
        decimal_places=2,
    )
    unit_label = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=64)
    starts_at = serializers.DateTimeField(required=False, allow_null=True)
    ends_at = serializers.DateTimeField(required=False, allow_null=True)

    def validate_target_value(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Target value must be positive.")
        return value

    def validate(self, attrs):
        starts_at = attrs.get("starts_at")
        ends_at = attrs.get("ends_at")
        if starts_at is not None and ends_at is not None and ends_at < starts_at:
            raise serializers.ValidationError({"ends_at": ["End time must be after start time."]})
        return attrs

    def validate_description(self, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None

    def validate_goal_title(self, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None

    def validate_unit_label(self, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class ChallengeProgressSerializer(serializers.Serializer):
    delta_value = serializers.DecimalField(max_digits=14, decimal_places=2)
    note_text = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_delta_value(self, value):
        if value == 0:
            raise serializers.ValidationError("Delta value must be non-zero.")
        return value

    def validate_note_text(self, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class ChallengeNoteSerializer(serializers.Serializer):
    note_text = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_note_text(self, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None
