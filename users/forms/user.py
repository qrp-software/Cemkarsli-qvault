from django import forms
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from users.models import User

User = get_user_model()


class EditUserForm(forms.ModelForm):
    class Meta:
        fields = ("first_name", "last_name", "email")
        model = User

user = User.objects.get(username='cem.karsli')
user.can_share_systems = True
user.save()

print(f"Kullanıcı: {user.username}")
print(f"Sistem paylaşım yetkisi: {user.can_share_systems}")