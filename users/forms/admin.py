from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class CreateUserForm(UserCreationForm):
    """Yeni kullanıcı oluşturma formu"""
    email = forms.EmailField(required=True, label=_("Email"))
    first_name = forms.CharField(max_length=30, required=True, label=_("İsim"))
    last_name = forms.CharField(max_length=30, required=True, label=_("Soyisim"))
    is_superuser = forms.BooleanField(required=False, label=_("Süper Kullanıcı"))
    can_share_systems = forms.BooleanField(required=False, label=_("Sistem Paylaşım Yetkisi"))

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'password1', 'password2', 'is_superuser', 'can_share_systems')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.update({'class': 'form-control'})
        
        # Checkbox'lar için farklı class
        self.fields['is_superuser'].widget.attrs.update({'class': 'form-check-input'})
        self.fields['can_share_systems'].widget.attrs.update({'class': 'form-check-input'})

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        user.first_name = self.cleaned_data["first_name"]
        user.last_name = self.cleaned_data["last_name"]
        user.is_superuser = self.cleaned_data["is_superuser"]
        user.is_staff = self.cleaned_data["is_superuser"]  # Superuser'lar staff da olmalı
        user.can_share_systems = self.cleaned_data["can_share_systems"]
        if commit:
            user.save()
        return user


class EditUserPermissionsForm(forms.ModelForm):
    """Kullanıcı yetkilerini düzenleme formu"""
    class Meta:
        model = User
        fields = ('is_superuser', 'is_staff', 'is_active', 'can_share_systems')
        labels = {
            'is_superuser': _('Süper Kullanıcı'),
            'is_staff': _('Yönetici'),
            'is_active': _('Aktif'),
            'can_share_systems': _('Sistem Paylaşım Yetkisi'),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.update({'class': 'form-check-input'}) 