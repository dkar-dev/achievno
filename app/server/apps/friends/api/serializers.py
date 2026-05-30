from __future__ import annotations

from rest_framework import serializers


class FriendListSerializer(serializers.Serializer):
    limit = serializers.IntegerField(required=False, min_value=1, max_value=100, default=50)


class FriendAchievementCreateSerializer(serializers.Serializer):
    base_type = serializers.ChoiceField(choices=["done", "progress"])
    title = serializers.CharField(min_length=2, max_length=180, trim_whitespace=True)
    short_definition = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        max_length=255,
        trim_whitespace=True,
    )
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    progress_target = serializers.DecimalField(
        required=False,
        allow_null=True,
        max_digits=14,
        decimal_places=2,
    )
    unit_label = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=64)
    deadline_at = serializers.DateTimeField(required=False, allow_null=True)

    def validate(self, attrs):
        base_type = attrs.get("base_type")
        progress_target = attrs.get("progress_target")
        if base_type == "done" and progress_target is not None:
            raise serializers.ValidationError(
                {"progress_target": ["Progress target must be null for done achievements."]}
            )
        if base_type == "progress" and (progress_target is None or progress_target <= 0):
            raise serializers.ValidationError(
                {"progress_target": ["Progress target is required and must be positive for progress achievements."]}
            )
        return attrs

    def validate_short_definition(self, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None

    def validate_description(self, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None

    def validate_unit_label(self, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None

