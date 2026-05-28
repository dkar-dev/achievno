from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from django.utils import timezone

from apps.platform.infrastructure.main_selectors import MainAggregateSelectors


@dataclass(frozen=True)
class MainAggregateQuery:
    selectors_class: type[MainAggregateSelectors] = MainAggregateSelectors

    def execute(self, *, account_id: UUID, profile_id: UUID) -> dict:
        selectors = self.selectors_class(profile_id=profile_id, account_id=account_id)
        return {
            "authenticated": True,
            "profile": selectors.profile(),
            "personal_space": selectors.personal_space(),
            "friends": selectors.friends(),
            "groups": selectors.groups(),
            "notifications": selectors.notifications(),
            "server_time": timezone.now().isoformat(),
        }
