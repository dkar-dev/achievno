from django.urls import path

from apps.notifications.api.views import NotificationReadView, NotificationsView


urlpatterns = [
    path("", NotificationsView.as_view(), name="notifications"),
    path("<uuid:notification_id>/read", NotificationReadView.as_view(), name="notification-read"),
]
