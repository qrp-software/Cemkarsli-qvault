from django.urls import path
from users import views

app_name = "users"

urlpatterns = [
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    
    # Profil sayfası (herkes erişebilir)
    path("profile/", views.ProfileView.as_view(), name="profile"),
    
    # Geriye dönük uyumluluk için eski URL
    path("edit-profile/", views.EditUserInfoView.as_view(), name="edit_profile"),
    
    # Yönetici ayarları (sadece superuser)
    path("admin/", views.AdminSettingsView.as_view(), name="admin_settings"),
    path("admin/users/", views.UserManagementView.as_view(), name="user_management"),
    path("admin/users/create/", views.CreateUserView.as_view(), name="create_user"),
    path("admin/users/<int:user_id>/permissions/", views.EditUserPermissionsView.as_view(), name="edit_user_permissions"),
]