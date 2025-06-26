from django.urls import path
from keychain import views

app_name = "keychain"

urlpatterns = [
    path("", views.HomeView.as_view(), name="home"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("projects/", views.ProjectListView.as_view(), name="project_list"),
    path("projects/<int:pk>/", views.ProjectDetailView.as_view(), name="project_detail"),
    path("projects/create/", views.ProjectCreateView.as_view(), name="project_create"),
    path("systems/", views.SistemListView.as_view(), name="sistem_list"),
    path('add_project/', views.ProjectCreateAPIView.as_view(), name='add_project'),
    path('update_project/<int:project_id>/', views.ProjectUpdateAPIView.as_view(), name='update_project'),
    path('delete_project/<int:project_id>/', views.ProjectDeleteAPIView.as_view(), name='delete_project'),
    path('add_company/', views.CompanyCreateAPIView.as_view(), name='add_company'),
    path('update_company/<int:company_id>/', views.CompanyUpdateAPIView.as_view(), name='update_company'),
    path('delete_company/<int:company_id>/', views.CompanyDeleteAPIView.as_view(), name='delete_company'),
    path('get_company_details/<int:company_id>/', views.CompanyDetailAPIView.as_view(), name='get_company_details'),
    path('system/share/', views.SystemShareAPIView.as_view(), name='system_share'),
    path("activities/", views.ActivityListView.as_view(), name="activity_list"),
    path('add_activity/', views.ActivityCreateAPIView.as_view(), name='add_activity'),
    path('update_activity/<int:activity_id>/', views.ActivityUpdateAPIView.as_view(), name='update_activity'),
    path('delete_activity/<int:activity_id>/', views.ActivityDeleteAPIView.as_view(), name='delete_activity'),
    path('get_activity_details/<int:activity_id>/', views.ActivityDetailAPIView.as_view(), name='get_activity_details'),
]