from rest_framework.response import Response
from rest_framework.views import APIView

from apps.platform.infrastructure.db_health import check_database_health


class HealthView(APIView):
    authentication_classes: list = []
    permission_classes: list = []

    def get(self, request):
        return Response(
            {
                "status": "ok",
                "service": "achievno-api",
                "backend": "django",
            }
        )


class DatabaseHealthView(APIView):
    authentication_classes: list = []
    permission_classes: list = []

    def get(self, request):
        result = check_database_health()
        status_code = 200 if result.ok else 503
        status_value = "ok" if result.ok else "error"

        return Response(
            {
                "status": status_value,
                "service": "achievno-api",
                "database": result.as_database_payload(),
            },
            status=status_code,
        )
