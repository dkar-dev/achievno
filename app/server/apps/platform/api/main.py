from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.infrastructure.authentication import CookieJWTAuthentication
from apps.platform.application.main_query import MainAggregateQuery


class MainAggregateView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        principal = request.user
        payload = MainAggregateQuery().execute(
            account_id=principal.account_id,
            profile_id=principal.profile_id,
        )
        return Response(payload)
