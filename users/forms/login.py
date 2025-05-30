from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import AuthenticationForm
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class LoginForm(AuthenticationForm):
    class Meta:
        fields = ("username", "password")
        model = get_user_model()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields["username"].label = _("Kullanıcı Adı veya Email")
        
    def clean_username(self):
        username = self.cleaned_data["username"]
        if not (
            User.objects.filter(username=username).exists()
            or User.objects.filter(email=username).exists()
        ):
            raise forms.ValidationError(
                _("Bu kullanıcı ismi ile kayıtlı kullanıcı yoktur!")
            )
        return username