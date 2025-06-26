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
from django.contrib.auth import get_user_model
from django.contrib import messages
from django.http import JsonResponse
import json

logger = logging.getLogger(__name__)

User = get_user_model()


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


class SuperuserSettingsView(LoginRequiredMixin, View):
    """Superuser ayarları sayfası"""
    template_name = "users/superuser_settings.html"
    
    def dispatch(self, request, *args, **kwargs):
        # Sadece superuser'lar erişebilir
        if not request.user.is_superuser:
            messages.error(request, "Bu sayfaya erişim yetkiniz bulunmamaktadır.")
            return redirect('keychain:home')
        return super().dispatch(request, *args, **kwargs)
    
    def get(self, request):
        create_user_form = forms.CreateUserForm()
        users = User.objects.all().order_by('-date_joined')
        
        context = {
            'create_user_form': create_user_form,
            'users': users,
        }
        return render(request, self.template_name, context)
    
    def post(self, request):
        create_user_form = forms.CreateUserForm(request.POST)
        users = User.objects.all().order_by('-date_joined')
        
        if create_user_form.is_valid():
            user = create_user_form.save()
            messages.success(request, f"Kullanıcı '{user.username}' başarıyla oluşturuldu.")
            return redirect('users:superuser_settings')
        
        context = {
            'create_user_form': create_user_form,
            'users': users,
        }
        return render(request, self.template_name, context)


class UserPermissionsAPIView(LoginRequiredMixin, View):
    """Kullanıcı yetkilerini API ile güncelleme"""
    
    def dispatch(self, request, *args, **kwargs):
        # Sadece superuser'lar erişebilir
        if not request.user.is_superuser:
            return JsonResponse({'success': False, 'error': 'Yetkisiz erişim'})
        return super().dispatch(request, *args, **kwargs)
    
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            return JsonResponse({
                'success': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'is_superuser': user.is_superuser,
                    'is_staff': user.is_staff,
                    'is_active': user.is_active,
                    'can_share_systems': user.can_share_systems,
                }
            })
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Kullanıcı bulunamadı'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    def post(self, request, user_id):
        try:
            data = json.loads(request.body)
            user = User.objects.get(id=user_id)
            
            # Kendi hesabını deaktive etmesini engelle
            if user == request.user and data.get('is_active') == False:
                return JsonResponse({
                    'success': False, 
                    'error': 'Kendi hesabınızı deaktive edemezsiniz.'
                })
            
            user.is_superuser = data.get('is_superuser', user.is_superuser)
            user.is_staff = data.get('is_staff', user.is_staff)
            user.is_active = data.get('is_active', user.is_active)
            user.can_share_systems = data.get('can_share_systems', user.can_share_systems)
            user.save()
            
            return JsonResponse({
                'success': True,
                'message': f"Kullanıcı '{user.username}' yetkileri güncellendi."
            })
            
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Kullanıcı bulunamadı'})
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Geçersiz JSON verisi'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})


class DeleteUserAPIView(LoginRequiredMixin, View):
    
    
    def dispatch(self, request, *args, **kwargs):
        # Sadece superuser'lar erişebilir
        if not request.user.is_superuser:
            return JsonResponse({'success': False, 'error': 'Yetkisiz erişim'})
        return super().dispatch(request, *args, **kwargs)
    
    def delete(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            
            # Kendi hesabını silmesini engelle
            if user == request.user:
                return JsonResponse({
                    'success': False, 
                    'error': 'Kendi hesabınızı silemezsiniz.'
                })
            
            username = user.username
            user.delete()
            
            return JsonResponse({
                'success': True,
                'message': f"Kullanıcı '{username}' başarıyla silindi."
            })
            
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Kullanıcı bulunamadı'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})