#!/usr/bin/env python
"""
Kullanıcı yetkilerini kontrol eden script
"""
import os
import sys
import django

# Django ayarlarını yükle
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qvaultapp.settings')
django.setup()

from users.models import User

def check_user_permissions():
    print("=== Kullanıcı Yetkileri Kontrolü ===\n")
    
    for user in User.objects.all():
        print(f"Kullanıcı: {user.username}")
        print(f"  - ID: {user.id}")
        print(f"  - is_superuser: {user.is_superuser}")
        print(f"  - is_staff: {user.is_staff}")
        print(f"  - can_share_systems: {user.can_share_systems}")
        
        # Yetki hesaplama
        has_share_permission = user.can_share_systems or user.is_superuser
        print(f"  - Sistem paylaşım yetkisi: {has_share_permission}")
        print("-" * 50)

if __name__ == "__main__":
    check_user_permissions() 