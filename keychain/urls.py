from django.urls import path
from keychain import views

app_name = "keychain"

urlpatterns = [
    path("", views.home_view, name="home"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("projects/", views.ProjectListView.as_view(), name="project_list"),
    path("projects/<int:pk>/", views.ProjectDetailView.as_view(), name="project_detail"),
    path("projects/create/", views.ProjectCreateView.as_view(), name="project_create"),
    path("systems/", views.SistemListView.as_view(), name="sistem_list"),
    path('add_project/', views.add_project, name='add_project'),
    path('update_project/<int:project_id>/', views.update_project, name='update_project'),
    path('delete_project/<int:project_id>/', views.delete_project, name='delete_project'),
    path('add_company/', views.add_company, name='add_company'),
    path('update_company/<int:company_id>/', views.update_company, name='update_company'),
    path('delete_company/<int:company_id>/', views.delete_company, name='delete_company'),
    path('get_company_details/<int:company_id>/', views.get_company_details, name='get_company_details'),
]