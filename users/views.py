from django.shortcuts import render
import logging
from django.shortcuts import redirect, render, get_object_or_404
from django.urls import reverse
from django.views import View
from django.contrib.auth.views import (
    LoginView as BaseLoginView,
    LogoutView as BaseLogoutView,
)
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth import get_user_model
from django.contrib import messages
from django.utils.translation import gettext_lazy as _
from users import forms

User = get_user_model()
logger = logging.getLogger(__name__)


class LoginView(BaseLoginView):
    template_name = "users/login.html"
    authentication_form = forms.LoginForm


class LogoutView(BaseLogoutView):
    pass


class ProfileView(LoginRequiredMixin, View):
    """Kullanıcı profil sayfası - herkes erişebilir"""
    template_name = "users/profile.html"
    form_class = forms.EditUserForm

    def get(self, request):
        form = self.form_class(instance=request.user)
        return render(request, self.template_name, {"form": form})

    def post(self, request):
        form = self.form_class(instance=request.user, data=request.POST)
        if form.is_valid():
            form.save(commit=True)
            messages.success(request, _("Profil bilgileriniz başarıyla güncellendi."))
            return redirect(reverse("users:profile"))
        return render(request, self.template_name, {"form": form})


class EditUserInfoView(LoginRequiredMixin, View):
    """Eski view - geriye dönük uyumluluk için"""
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


class SuperUserRequiredMixin(UserPassesTestMixin):
    """Sadece superuser'ların erişebileceği view'lar için mixin"""
    def test_func(self):
        return self.request.user.is_superuser


class AdminSettingsView(LoginRequiredMixin, SuperUserRequiredMixin, View):
    """Yönetici ayarları ana sayfası - sadece superuser"""
    template_name = "users/admin_settings.html"

    def get(self, request):
        users_count = User.objects.count()
        recent_users = User.objects.order_by('-date_joined')[:5]
        return render(request, self.template_name, {
            'users_count': users_count,
            'recent_users': recent_users,
        })


class UserManagementView(LoginRequiredMixin, SuperUserRequiredMixin, View):
    """Kullanıcı yönetimi - kullanıcı listesi ve arama"""
    template_name = "users/user_management.html"

    def get(self, request):
        search_query = request.GET.get('search', '')
        users = User.objects.all()
        
        if search_query:
            users = users.filter(
                username__icontains=search_query
            ) | users.filter(
                first_name__icontains=search_query
            ) | users.filter(
                last_name__icontains=search_query
            ) | users.filter(
                email__icontains=search_query
            )
        
        users = users.order_by('-date_joined')
        
        return render(request, self.template_name, {
            'users': users,
            'search_query': search_query,
        })


class CreateUserView(LoginRequiredMixin, SuperUserRequiredMixin, View):
    """Yeni kullanıcı oluşturma"""
    template_name = "users/create_user.html"
    form_class = forms.CreateUserForm

    def get(self, request):
        form = self.form_class()
        return render(request, self.template_name, {"form": form})

    def post(self, request):
        form = self.form_class(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, _(f"Kullanıcı '{user.username}' başarıyla oluşturuldu."))
            return redirect(reverse("users:user_management"))
        return render(request, self.template_name, {"form": form})


class EditUserPermissionsView(LoginRequiredMixin, SuperUserRequiredMixin, View):
    """Kullanıcı yetkilerini düzenleme"""
    template_name = "users/edit_user_permissions.html"
    form_class = forms.EditUserPermissionsForm

    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        if user == request.user:
            messages.warning(request, _("Kendi yetkilendirinizi düzenleyemezsiniz."))
            return redirect(reverse("users:user_management"))
        
        form = self.form_class(instance=user)
        return render(request, self.template_name, {"form": form, "user": user})

    def post(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        if user == request.user:
            messages.warning(request, _("Kendi yetkilendirinizi düzenleyemezsiniz."))
            return redirect(reverse("users:user_management"))
        
        form = self.form_class(instance=user, data=request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, _(f"'{user.username}' kullanıcısının yetkileri güncellendi."))
            return redirect(reverse("users:user_management"))
        return render(request, self.template_name, {"form": form, "user": user})