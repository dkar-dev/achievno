from __future__ import annotations

from rest_framework import serializers


class PersonalAchievementListSerializer(serializers.Serializer):
    status = serializers.CharField(required=False, allow_blank=False)
    limit = serializers.IntegerField(required=False, min_value=1, max_value=100, default=50)


class PersonalAchievementCreateSerializer(serializers.Serializer):
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
    primary_category_id = serializers.UUIDField(required=False, allow_null=True)
    rank_id = serializers.UUIDField(required=False, allow_null=True)

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


class PersonalAchievementPatchSerializer(serializers.Serializer):
    title = serializers.CharField(required=False, min_length=2, max_length=180, trim_whitespace=True)
    short_definition = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        max_length=255,
        trim_whitespace=True,
    )
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    deadline_at = serializers.DateTimeField(required=False, allow_null=True)
    progress_target = serializers.DecimalField(
        required=False,
        allow_null=True,
        max_digits=14,
        decimal_places=2,
    )
    unit_label = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=64)
    primary_category_id = serializers.UUIDField(required=False, allow_null=True)
    rank_id = serializers.UUIDField(required=False, allow_null=True)

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


class PersonalAchievementProgressSerializer(serializers.Serializer):
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


class PersonalAchievementNoteSerializer(serializers.Serializer):
    note_text = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_note_text(self, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class EvidenceAttachSerializer(serializers.Serializer):
    kind = serializers.ChoiceField(choices=["note", "link", "file"])
    url = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    note_text = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    file = serializers.FileField(required=False, allow_null=True)

    def validate_note_text(self, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None

    def validate_url(self, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None

    def validate(self, attrs):
        kind = attrs.get("kind")
        if kind == "link" and not attrs.get("url"):
            raise serializers.ValidationError({"url": ["URL evidence requires a URL."]})
        if kind == "note" and not attrs.get("note_text"):
            raise serializers.ValidationError({"note_text": ["Note evidence requires text."]})
        if kind == "file" and not attrs.get("file"):
            raise serializers.ValidationError({"file": ["File evidence requires an uploaded file."]})
        return attrs


class ApprovalListSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        required=False,
        choices=["pending", "approved", "rejected", "cancelled"],
    )


class ApprovalDecisionSerializer(serializers.Serializer):
    note_text = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_note_text(self, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None
