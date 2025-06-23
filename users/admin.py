from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'can_share_systems', 'is_staff', 'is_active')
    list_filter = ('can_share_systems', 'is_staff', 'is_active', 'is_superuser')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Sistem Paylaşım Yetkisi', {
            'fields': ('can_share_systems',),
            'classes': ('collapse',),
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Sistem Paylaşım Yetkisi', {
            'fields': ('can_share_systems',),
            'classes': ('collapse',),
        }),
    ) 