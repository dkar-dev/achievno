from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from uuid import UUID

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from apps.achievements.application.personal_query import datetime_to_iso
from apps.achievements.domain.errors import (
    PersonalAchievementArchived,
    PersonalAchievementNotFound,
    PersonalAchievementValidationError,
)
from apps.achievements.infrastructure.repositories import PersonalAchievementRepository
from apps.platform.infrastructure.storage import get_evidence_storage


@dataclass(frozen=True)
class EvidenceAttachCommand:
    kind: str
    url: str | None = None
    note_text: str | None = None
    file_name: str | None = None
    mime_type: str | None = None
    content: bytes | None = None


def evidence_link_to_dto(link) -> dict:
    metadata = _decode_caption(link.caption)
    asset = link.asset
    return {
        "evidence_link_id": str(link.evidence_link_id),
        "target_kind": link.target_kind,
        "target_id": str(link.target_id),
        "kind": metadata.get("kind") or "file",
        "url": metadata.get("url"),
        "note_text": metadata.get("note_text"),
        "file_name": asset.file_name,
        "mime_type": asset.mime_type,
        "size_bytes": asset.size_bytes,
        "created_at": datetime_to_iso(link.created_at),
    }


class EvidenceService:
    def __init__(self, repository: PersonalAchievementRepository | None = None):
        self.repository = repository or PersonalAchievementRepository()

    def list_for_achievement(self, *, profile_id: UUID, achievement_id: UUID) -> dict | None:
        achievement = self.repository.get_visible(profile_id=profile_id, achievement_id=achievement_id)
        if achievement is None:
            return None
        links = self._links_for_achievement(achievement_id=achievement.achievement_id)
        return {"items": [evidence_link_to_dto(link) for link in links]}

    def attach_to_achievement(
        self,
        *,
        profile_id: UUID,
        achievement_id: UUID,
        command: EvidenceAttachCommand,
    ) -> dict:
        achievement = self.repository.get_visible(profile_id=profile_id, achievement_id=achievement_id)
        if achievement is None:
            raise PersonalAchievementNotFound()
        if achievement.status == "archived":
            raise PersonalAchievementArchived()
        self._validate(command)

        payload = self._payload_for(command)
        content = command.content or json.dumps(payload, sort_keys=True).encode("utf-8")
        file_name = command.file_name or self._metadata_file_name(command.kind)
        mime_type = command.mime_type or "application/json"
        checksum = hashlib.sha256(content).hexdigest()
        storage_key = self._storage_key(
            profile_id=profile_id,
            achievement_id=achievement.achievement_id,
            file_name=file_name,
        )

        with transaction.atomic():
            saved = get_evidence_storage().save(storage_key, content, content_type=mime_type)
            asset = self.repository.create_evidence_asset(
                owner_profile_id=profile_id,
                storage_provider=settings.EVIDENCE_STORAGE_BACKEND,
                storage_key=saved.key,
                file_name=file_name,
                mime_type=mime_type,
                size_bytes=len(content),
                checksum_sha256=checksum,
            )
            log = self.repository.create_evidence_log(
                achievement=achievement,
                profile_id=profile_id,
                note_text=command.note_text,
            )
            link = self.repository.create_evidence_link(
                target_kind="achievement_log",
                target_id=log.achievement_log_id,
                asset=asset,
                caption=json.dumps(payload, sort_keys=True),
            )

        return {"evidence": evidence_link_to_dto(link)}

    def _links_for_achievement(self, *, achievement_id: UUID) -> list[object]:
        logs = self.repository.evidence_logs(achievement_id=achievement_id)
        requests = self.repository.approval_requests_for_achievement(achievement_id=achievement_id)
        return self.repository.list_evidence_links(
            target_ids_by_kind={
                "achievement_log": [log.achievement_log_id for log in logs],
                "approval_request": [request.approval_request_id for request in requests],
            }
        )

    def _validate(self, command: EvidenceAttachCommand) -> None:
        if command.kind not in {"note", "link", "file"}:
            raise PersonalAchievementValidationError({"kind": ["Use note, link, or file."]})
        if command.kind == "link" and not command.url:
            raise PersonalAchievementValidationError({"url": ["URL evidence requires a URL."]})
        if command.kind == "note" and not command.note_text:
            raise PersonalAchievementValidationError({"note_text": ["Note evidence requires text."]})
        if command.kind == "file" and not command.content:
            raise PersonalAchievementValidationError({"file": ["File evidence requires an uploaded file."]})

    def _payload_for(self, command: EvidenceAttachCommand) -> dict:
        return {
            "kind": command.kind,
            "url": command.url,
            "note_text": command.note_text,
        }

    def _metadata_file_name(self, kind: str) -> str:
        return f"{kind}-evidence.json"

    def _storage_key(self, *, profile_id: UUID, achievement_id: UUID, file_name: str) -> str:
        timestamp = timezone.now().strftime("%Y%m%d%H%M%S%f")
        safe_name = file_name.strip().replace("/", "_").replace("\\", "_") or "evidence"
        return f"profiles/{profile_id}/achievements/{achievement_id}/{timestamp}-{safe_name}"


def _decode_caption(caption: str | None) -> dict:
    if not caption:
        return {}
    try:
        value = json.loads(caption)
    except json.JSONDecodeError:
        return {"note_text": caption}
    if not isinstance(value, dict):
        return {}
    return value
