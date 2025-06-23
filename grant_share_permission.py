#!/usr/bin/env python
"""
Sistem paylaşım yetkisi veren script
"""
import os
import sys
import django

# Django ayarlarını yükle
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qvaultapp.settings')
django.setup()

from users.models import User

def grant_share_permission(username):
    try:
        # Kullanıcıyı bul
        user = User.objects.get(username=username)
        
        # Mevcut durumu göster
        print(f"Kullanıcı: {user.username}")
        print(f"Mevcut sistem paylaşım yetkisi: {user.can_share_systems}")
        
        # Yetkiyi ver
        user.can_share_systems = True
        user.save()
        
        # Güncellenmiş durumu göster
        user.refresh_from_db()
        print(f"Güncellenmiş sistem paylaşım yetkisi: {user.can_share_systems}")
        print(f"✅ {username} kullanıcısına sistem paylaşım yetkisi başarıyla verildi!")
        
    except User.DoesNotExist:
        print(f"❌ {username} kullanıcısı bulunamadı!")
        print("Mevcut kullanıcılar:")
        for u in User.objects.all():
            print(f"  - {u.username} (ID: {u.id})")
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")

def list_users():
    print("Mevcut kullanıcılar:")
    for user in User.objects.all():
        print(f"  - {user.username} (ID: {user.id}, Sistem paylaşım yetkisi: {user.can_share_systems})")

if __name__ == "__main__":
    print("=== Sistem Paylaşım Yetkisi Verme Scripti ===\n")
    
    # Tüm kullanıcıları listele
    list_users()
    print()
    
    # cem.karsli kullanıcısına yetki ver
    grant_share_permission('cem.karsli') 