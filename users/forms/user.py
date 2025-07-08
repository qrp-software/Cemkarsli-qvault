from django import forms
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.forms import UserCreationForm, PasswordChangeForm
from users.models import User

User = get_user_model()


class EditUserForm(forms.ModelForm):
    class Meta:
        fields = ("first_name", "last_name", "email")
        model = User
        widgets = {
            'first_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Adınız'
            }),
            'last_name': forms.TextInput(attrs={
                'class': 'form-control', 
                'placeholder': 'Soyadınız'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'E-posta adresiniz'
            }),
        }
        labels = {
            'first_name': _('Ad'),
            'last_name': _('Soyad'),
            'email': _('E-posta'),
        }


class CreateUserForm(UserCreationForm):
    email = forms.EmailField(required=True)
    first_name = forms.CharField(max_length=30, required=True)
    last_name = forms.CharField(max_length=30, required=True)

    class Meta:
        model = User
        fields = ("username", "email", "first_name", "last_name", "password1", "password2")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Ad field'ı
        self.fields['first_name'].widget = forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Adınızı girin',
            'autocomplete': 'given-name'
        })
        
        # Soyad field'ı
        self.fields['last_name'].widget = forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Soyadınızı girin',
            'autocomplete': 'family-name'
        })
        
        # Kullanıcı adı field'ı
        self.fields['username'].widget = forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Kullanıcı adını girin',
            'autocomplete': 'username'
        })
        
        # E-posta field'ı
        self.fields['email'].widget = forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'E-posta adresinizi girin',
            'autocomplete': 'email'
        })
        
        # Şifre field'ları
        self.fields['password1'].widget = forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Güçlü bir şifre oluşturun',
            'autocomplete': 'new-password'
        })
        
        self.fields['password2'].widget = forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Şifrenizi tekrar girin',
            'autocomplete': 'new-password'
        })
        
        # Field labels
        self.fields['first_name'].label = _('Ad')
        self.fields['last_name'].label = _('Soyad')
        self.fields['username'].label = _('Kullanıcı Adı')
        self.fields['email'].label = _('E-posta')
        self.fields['password1'].label = _('Şifre')
        self.fields['password2'].label = _('Şifre (Tekrar)')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        user.first_name = self.cleaned_data["first_name"]
        user.last_name = self.cleaned_data["last_name"]
        if commit:
            user.save()
        return user


class EditUserPermissionsForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ("is_active", "is_staff", "is_superuser", "can_share_systems")
        widgets = {
            'is_active': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'is_staff': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'is_superuser': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'can_share_systems': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
        }
        labels = {
            'is_active': _('Aktif'),
            'is_staff': _('Moderatör Yetkisi'),
            'is_superuser': _('Yönetici'),
            'can_share_systems': _('Sistem Paylaşım Yetkisi'),
        }
        help_texts = {
            'is_active': _('Kullanıcının giriş yapabilmesini sağlar'),
            'is_staff': _('Admin paneline erişim sağlar'),
            'is_superuser': _('Tüm yönetici yetkilerini verir'),
            'can_share_systems': _('Sistem paylaşımı yapabilmesine izin verir'),
        }


class CustomPasswordChangeForm(PasswordChangeForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Mevcut şifre field'ı
        self.fields['old_password'].widget = forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Mevcut şifrenizi girin',
            'autocomplete': 'current-password'
        })
        
        # Yeni şifre field'ı
        self.fields['new_password1'].widget = forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Yeni şifrenizi girin',
            'autocomplete': 'new-password'
        })
        
        # Yeni şifre tekrar field'ı
        self.fields['new_password2'].widget = forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Yeni şifrenizi tekrar girin',
            'autocomplete': 'new-password'
        })
        
        # Field labels
        self.fields['old_password'].label = _('Mevcut Şifre')
        self.fields['new_password1'].label = _('Yeni Şifre')
        self.fields['new_password2'].label = _('Yeni Şifre (Tekrar)')
