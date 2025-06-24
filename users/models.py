from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["first_name", "last_name", "email"]

    email = models.EmailField(_("Email"), unique=True)
    can_share_systems = models.BooleanField(
        _("Sistem Paylaşım Yetkisi"), 
        default=False,
        help_text=_("Bu kullanıcının sistem paylaşımı yapabilmesine izin ver")
    )