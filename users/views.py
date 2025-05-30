from django.shortcuts import render
import logging
from django.shortcuts import redirect, render
from django.urls import reverse
from django.views import View
from django.contrib.auth.views import (
    LoginView as BaseLoginView,
    LogoutView as BaseLogoutView,
)
from django.contrib.auth.mixins import LoginRequiredMixin
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