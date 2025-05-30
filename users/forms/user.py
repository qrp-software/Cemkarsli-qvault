from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm as BaseUserCreationForm
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class UserCreationForm(BaseUserCreationForm):
    class Meta:
        fields = (
            "username",
            "email",
            "password1",
            "password2",
            "first_name",
            "last_name",
        )
        model = User

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        for f in self.fields.keys():
            self.fields[f].widget.attrs.update({"class": "form-control"})

    def clean_username(self):
        username = self.cleaned_data["username"]
        if "@" in username:
            raise forms.ValidationError(_('Kullanıcı adında "@" sembolü olamaz!'))
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError(_("Bu kullanıcı adı zaten kullanımdadır!"))
        if len(username) < 5:
            raise forms.ValidationError(_("Kullanıcı adınız 5 karakterden az olamaz!"))
        return username

    def clean_email(self):
        email = self.cleaned_data["email"]
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError(
                _("Bu mail adresi daha önceden sisteme girilmiştir!")
            )
        return email


class EditUserForm(forms.ModelForm):
    class Meta:
        fields = ("first_name", "last_name", "email")
        model = User