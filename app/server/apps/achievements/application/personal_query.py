from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from apps.achievements.infrastructure.repositories import PersonalAchievementRepository


def decimal_to_number(value: Decimal | None) -> float | None:
    if value is None:
        return None
    return float(value)


def datetime_to_iso(value) -> str | None:
    if value is None:
        return None
    return value.isoformat()


def category_to_dto(category) -> dict | None:
    if category is None:
        return None
    return {
        "category_id": str(category.category_id),
        "code": category.code,
        "title": category.title,
    }


def rank_to_dto(rank) -> dict | None:
    if rank is None:
        return None
    return {
        "rank_id": str(rank.rank_id),
        "code": rank.code,
        "label": rank.label,
        "color_token": rank.color_token,
    }


def achievement_to_dto(achievement) -> dict:
    return {
        "achievement_id": str(achievement.achievement_id),
        "owner_context_id": str(achievement.owner_context_id),
        "base_type": achievement.base_type,
        "assignment_mode": achievement.assignment_mode,
        "title": achievement.title,
        "short_definition": achievement.short_definition,
        "description": achievement.description,
        "status": achievement.status,
        "progress_current": decimal_to_number(achievement.progress_current),
        "progress_target": decimal_to_number(achievement.progress_target),
        "unit_label": achievement.unit_label,
        "deadline_at": datetime_to_iso(achievement.deadline_at),
        "completed_at": datetime_to_iso(achievement.completed_at),
        "archived_at": datetime_to_iso(achievement.archived_at),
        "created_at": datetime_to_iso(achievement.created_at),
        "updated_at": datetime_to_iso(achievement.updated_at),
        "primary_category": category_to_dto(getattr(achievement, "primary_category", None)),
        "rank": rank_to_dto(getattr(achievement, "rank", None)),
    }


def log_to_dto(log) -> dict:
    return {
        "achievement_log_id": str(log.achievement_log_id),
        "action_type": log.action_type,
        "delta_value": decimal_to_number(log.delta_value),
        "resulting_value": decimal_to_number(log.resulting_value),
        "note_text": log.note_text,
        "created_at": datetime_to_iso(log.created_at),
    }


class PersonalAchievementQuery:
    def __init__(self, repository: PersonalAchievementRepository | None = None):
        self.repository = repository or PersonalAchievementRepository()

    def list(self, *, profile_id: UUID, status_filter: str | None = None, limit: int = 50) -> dict:
        achievements, total_count = self.repository.list_personal(
            profile_id=profile_id,
            status_filter=status_filter,
            limit=limit,
        )
        return {
            "items": [achievement_to_dto(achievement) for achievement in achievements],
            "total_count": total_count,
        }

    def detail(self, *, profile_id: UUID, achievement_id: UUID) -> dict | None:
        achievement = self.repository.get_personal(profile_id=profile_id, achievement_id=achievement_id)
        if achievement is None:
            return None
        logs = self.repository.recent_logs(achievement_id=achievement.achievement_id)
        return {
            "achievement": achievement_to_dto(achievement),
            "recent_logs": [log_to_dto(log) for log in logs],
        }
