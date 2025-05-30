from django.shortcuts import render
import logging
from django.contrib.auth import login
from django.shortcuts import redirect, render
from django.urls import reverse
from django.views import View
from django.contrib.auth.views import (
    LoginView as BaseLoginView,
    LogoutView as BaseLogoutView,
)
from django.contrib.auth.mixins import LoginRequiredMixin

from django.contrib.auth import views as auth_views
from django.urls import reverse_lazy
from users import forms

logger = logging.getLogger(__name__)


class LoginView(BaseLoginView):
    template_name = "users/login.html"
    authentication_form = forms.LoginForm


class LogoutView(BaseLogoutView):
    pass


class EditUserInfoView(LoginRequiredMixin, View):
    template_name = "users/edit_user_info.html"
    form_class = forms.EditUserForm

    def get(self, request):
        form = self.form_class(instance=request.user)
        return render(request, self.template_name, {"form": form})

    def post(self, request):
        form = self.form_class(instance=request.user, data=request.POST)
        if form.is_valid():
            form.save(commit=True)
            return redirect(reverse("home"))
        return render(request, self.template_name, {"form": form})


class PasswordResetView(auth_views.PasswordResetView):
    form_class = forms.PasswordResetForm
    template_name = "users/password/password_reset_form.html"
    html_email_template_name = "users/password/password_reset_email.html"
    email_template_name = "users/password/password_reset_email.html"
    subject_template_name = "users/password/password_reset_subject.txt"
    success_url = reverse_lazy("users:password_reset_done")


class PasswordResetDoneView(auth_views.PasswordResetDoneView):
    template_name = "users/password/password_change_done.html"


class PasswordResetConfirmView(auth_views.PasswordResetConfirmView):
    form_class = forms.SetPasswordForm
    template_name = "users/password/password_reset_confirm.html"
    success_url = reverse_lazy("users:password_reset_complete")


class PasswordResetCompleteView(auth_views.PasswordResetCompleteView):
    template_name = "users/password/password_reset_complete.html"


class PasswordChangeView(auth_views.PasswordChangeView):
    success_url = reverse_lazy("users:password_change_done")
    template_name = "users/password/password_change_form.html"
    form_class = forms.PasswordChangeForm


class PasswordChangeDoneView(auth_views.PasswordChangeDoneView):
    template_name = "users/password/password_change_done.html"