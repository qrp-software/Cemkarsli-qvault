from django import forms
from django.contrib.auth.forms import (
    PasswordResetForm as BasePasswordResetForm,
    SetPasswordForm as BaseSetPasswordForm,
    PasswordChangeForm as BasePasswordChangeForm,
)
from django.utils.translation import gettext_lazy as _
from users.models import User


class PasswordResetForm(BasePasswordResetForm):
    def clean_email(self):
        email = self.cleaned_data["email"]
        if not User.objects.filter(email=email).exists():
            raise forms.ValidationError(
                _("Bu mail adresi ile kayıtlı kullanıcı yoktur!")
            )
        return email


class SetPasswordForm(BaseSetPasswordForm):
    pass


class PasswordChangeForm(BasePasswordChangeForm):
    pass