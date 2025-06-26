from django.urls import path
from users import views

app_name = "users"

urlpatterns = [
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("profile/", views.EditUserInfoView.as_view(), name="profile"),
    path("superuser-settings/", views.SuperuserSettingsView.as_view(), name="superuser_settings"),
    path("api/user/<int:user_id>/permissions/", views.UserPermissionsAPIView.as_view(), name="user_permissions_api"),
    path("api/user/<int:user_id>/delete/", views.DeleteUserAPIView.as_view(), name="delete_user_api"),
]