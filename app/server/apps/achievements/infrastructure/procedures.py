from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from django.db import connection


class AchievementProgressProcedure:
    def submit(
        self,
        *,
        achievement_id: UUID,
        actor_profile_id: UUID,
        delta_value: Decimal,
        note_text: str | None,
    ) -> UUID:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT public.sp_submit_achievement_progress(%s, %s, %s, %s)",
                [achievement_id, actor_profile_id, delta_value, note_text],
            )
            row = cursor.fetchone()
        return row[0]
