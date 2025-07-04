from django.shortcuts import render, redirect
from django.views.generic import ListView, DetailView, CreateView, View, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Project, Company, SystemShare
from django.urls import reverse_lazy
from django.contrib import messages
from django.http import HttpResponseRedirect, JsonResponse
from .forms import ProjectForm, CompanyForm
import json
from users.models import User
from django.db import models

# Constants
SYSTEM_TYPE_CHOICES = {
    '1': 'Database',
    '2': 'VPN',
    '3': 'SERVER',
    '4': 'Application'
}

# Utility functions
def get_system_type_label(system_type):
    return SYSTEM_TYPE_CHOICES.get(system_type, system_type)

def create_success_response(data):
    return JsonResponse({'success': True, **data})

def create_error_response(error_message):
    return JsonResponse({'success': False, 'error': error_message})


class LoginView(View):
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('keychain:home')
        return render(request, 'keychain/login.html')
    
    def post(self, request):
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            messages.success(request, f"Hoş geldiniz, {user.username}!")
            print(f"User logged in: {user.username}")  # Debug
            return redirect('keychain:home')
        else:
            messages.error(request, "Kullanıcı adı veya şifre hatalı!")
            return render(request, 'keychain/login.html')


class HomeView(LoginRequiredMixin, TemplateView):
    template_name = 'keychain/home.html'

    def get(self, request, *args, **kwargs):
        print(f"Home view accessed. User authenticated: {request.user.is_authenticated}")  # Debug
        
        # Herkese açık projeler + kendi özel projeleri
        all_projects = Project.objects.filter(
            models.Q(is_private=False) | models.Q(owner=request.user)
        )
        
        user_projects_count = all_projects.count()
        recent_projects = all_projects.order_by('-created_date')[:5]
        
        context = {
            'user': request.user,
            'projects_count': user_projects_count,
            'recent_projects': recent_projects,
        }
        print(f"Rendering home.html for user: {request.user.username}")  # Debug
        return self.render_to_response(context)


class LogoutView(LoginRequiredMixin, View):
    def get(self, request):
        logout(request)
        messages.info(request, "Başarıyla çıkış yaptınız.")
        return redirect('keychain:login')


class ProjectListView(LoginRequiredMixin, ListView):
    model = Project
    template_name = "keychain/project_list.html"
    context_object_name = "projects"

    def get_queryset(self):
        # Herkese açık projeler + kendi özel projeleri
        all_projects = Project.objects.filter(
            models.Q(is_private=False) | models.Q(owner=self.request.user)
        )
        
        # Sıralama parametresini al
        sort_by = self.request.GET.get('sort', 'id')
        order = self.request.GET.get('order', 'asc')
        
        # Sıralama alanını belirle
        if sort_by == 'code':
            sort_field = 'code'
        elif sort_by == 'name':
            sort_field = 'name'
        elif sort_by == 'created_date':
            sort_field = 'created_date'
        elif sort_by == 'modified_date':
            sort_field = 'modified_date'
        else:
            sort_field = 'id'
        
        # Sıralama yönünü belirle
        if order == 'desc':
            sort_field = '-' + sort_field
        
        return all_projects.order_by(sort_field)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["form"] = ProjectForm()
        context["current_sort"] = self.request.GET.get('sort', 'id')
        context["current_order"] = self.request.GET.get('order', 'asc')
        return context


class ProjectDetailView(LoginRequiredMixin, DetailView):
    model = Project
    template_name = "keychain/project_detail.html"
    context_object_name = "project"

    def get_queryset(self):
        # Herkese açık projeler + kendi özel projeleri
        return Project.objects.filter(
            models.Q(is_private=False) | models.Q(owner=self.request.user)
        )

class ProjectCreateView(LoginRequiredMixin, CreateView):
    model = Project
    fields = ["code","name", "description"] 
    template_name = "keychain/project_form.html"
    success_url = reverse_lazy("keychain:project_list")

    def form_valid(self, form):
        form.instance.owner = self.request.user  
        messages.success(self.request, "Proje başarıyla oluşturuldu.")
        return super().form_valid(form)


class SistemListView(LoginRequiredMixin, ListView):
    model = Company
    template_name = "keychain/sistem_list.html"
    context_object_name = "systems"

    def get_queryset(self):
        # Herkese açık sistemler + kendi özel sistemleri
        return Company.objects.filter(
            models.Q(is_private=False) | models.Q(owner=self.request.user)
        )
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["form"] = CompanyForm()
        
        # Herkese açık projeler + kendi özel projeleri
        context["projects"] = Project.objects.filter(
            models.Q(is_private=False) | models.Q(owner=self.request.user)
        )
        return context


class ProjectCreateAPIView(LoginRequiredMixin, View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            
            project = Project.objects.create(
                code=data.get('code'),
                name=data.get('name'),
                description=data.get('description', ''),
                system_type=data.get('system_type', ''),
                owner=request.user
            )
            
            project.users.add(request.user)
            
            return create_success_response({
                'id': project.id,
                'code': project.code,
                'name': project.name,
                'description': project.description,
                'system_type': get_system_type_label(project.system_type),
                'is_private': project.is_private,
                'status': "Bana Özel" if project.is_private else "Herkese Açık"
            })
        except json.JSONDecodeError:
            return create_error_response('Invalid JSON data')
        except Exception as e:
            return create_error_response(str(e))


class ProjectUpdateAPIView(LoginRequiredMixin, View):
    def put(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id, owner=request.user)
            data = json.loads(request.body)
            
            project.code = data.get('code', project.code)
            project.name = data.get('name', project.name)
            project.description = data.get('description', project.description)
            project.system_type = data.get('system_type', project.system_type)
            project.save()
            
            return create_success_response({
                'id': project.id,
                'code': project.code,
                'name': project.name,
                'description': project.description,
                'system_type': get_system_type_label(project.system_type),
                'is_private': project.is_private,
                'status': "Bana Özel" if project.is_private else "Herkese Açık"
            })
        except Project.DoesNotExist:
            return create_error_response('Project not found')
        except json.JSONDecodeError:
            return create_error_response('Invalid JSON data')
        except Exception as e:
            return create_error_response(str(e))


class ProjectDeleteAPIView(LoginRequiredMixin, View):
    def delete(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id, owner=request.user)
            project.delete()
            return JsonResponse({'success': True})
        except Project.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Project not found'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})


class ProjectTogglePrivacyAPIView(LoginRequiredMixin, View):
    def put(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id, owner=request.user)
            # is_private değerini tersine çevir
            project.is_private = not project.is_private
            project.save()
            
            status = "Bana Özel" if project.is_private else "Herkese Açık"
            return create_success_response({
                'id': project.id,
                'is_private': project.is_private,
                'status': status,
                'message': f'Proje durumu "{status}" olarak güncellendi.'
            })
        except Project.DoesNotExist:
            return create_error_response('Project not found')
        except Exception as e:
            return create_error_response(str(e))


class CompanyCreateAPIView(LoginRequiredMixin, View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            
            project_id = data.get('project_id')
            project = None
            if project_id:
                try:
                    # Herkese açık projeler + kendi özel projeleri
                    project = Project.objects.filter(
                        models.Q(is_private=False) | models.Q(owner=request.user)
                    ).get(id=project_id)
                except Project.DoesNotExist:
                    return create_error_response('Project not found')
            
            company = Company.objects.create(
                project=project,
                name=data.get('name'),
                number=data.get('number'),
                system_type=data.get('system_type'),
                additional_info=data.get('additional_info', {}),
                owner=request.user
            )
            
            company.users.add(request.user)
            
            return create_success_response({
                'id': company.id,
                'project_name': project.name if project else '',
                'name': company.name,
                'number': company.number,
                'system_type': get_system_type_label(company.system_type),
                'is_private': company.is_private,
                'status': "Bana Özel" if company.is_private else "Herkese Açık"
            })
        except json.JSONDecodeError:
            return create_error_response('Invalid JSON data')
        except Exception as e:
            return create_error_response(str(e))


class CompanyUpdateAPIView(LoginRequiredMixin, View):
    def put(self, request, company_id):
        try:
            company = Company.objects.get(id=company_id)
            data = json.loads(request.body)
            
            project_id = data.get('project_id')
            if project_id:
                try:
                    # Herkese açık projeler + kendi özel projeleri
                    project = Project.objects.filter(
                        models.Q(is_private=False) | models.Q(owner=request.user)
                    ).get(id=project_id)
                    company.project = project
                except Project.DoesNotExist:
                    return create_error_response('Project not found')
            else:
                company.project = None
            
            company.name = data.get('name', company.name)
            company.number = data.get('number', company.number)
            company.system_type = data.get('system_type', company.system_type)
            company.additional_info = data.get('additional_info', company.additional_info)
            company.save()
            
            return create_success_response({
                'id': company.id,
                'project_name': company.project.name if company.project else '',
                'name': company.name,
                'number': company.number,
                'system_type': get_system_type_label(company.system_type),
                'is_private': company.is_private,
                'status': "Bana Özel" if company.is_private else "Herkese Açık"
            })
        except Company.DoesNotExist:
            return create_error_response('Company not found')
        except json.JSONDecodeError:
            return create_error_response('Invalid JSON data')
        except Exception as e:
            return create_error_response(str(e))


class CompanyDeleteAPIView(LoginRequiredMixin, View):
    def delete(self, request, company_id):
        try:
            company = Company.objects.get(id=company_id)
            
            # Önce sistemin paylaşımlarını sil
            SystemShare.objects.filter(system=company).delete()
            
            # Sonra sistemi sil
            company.delete()
            return create_success_response({'message': 'Company deleted successfully'})
        except Company.DoesNotExist:
            return create_error_response('Company not found')
        except Exception as e:
            return create_error_response(str(e))


class CompanyTogglePrivacyAPIView(LoginRequiredMixin, View):
    def put(self, request, company_id):
        try:
            company = Company.objects.get(id=company_id, owner=request.user)
            # is_private değerini tersine çevir
            company.is_private = not company.is_private
            company.save()
            
            status = "Bana Özel" if company.is_private else "Herkese Açık"
            return create_success_response({
                'id': company.id,
                'is_private': company.is_private,
                'status': status,
                'message': f'Sistem durumu "{status}" olarak güncellendi.'
            })
        except Company.DoesNotExist:
            return create_error_response('System not found')
        except Exception as e:
            return create_error_response(str(e))


class CompanyDetailAPIView(LoginRequiredMixin, View):
    def get(self, request, company_id):
        try:
            # Herkese açık sistemler + kendi özel sistemleri
            company = Company.objects.filter(
                models.Q(is_private=False) | models.Q(owner=request.user)
            ).get(id=company_id)

            # Sistem tipine göre ek bilgileri hazırla
            additional_info = company.additional_info or {}
            system_type = get_system_type_label(company.system_type)
            
            # Sistem tipine göre detaylı bilgileri ekle
            detailed_info = {
                'id': company.id,
                'project_name': company.project.name if company.project else '',
                'name': company.name,
                'number': company.number,
                'system_type': system_type,
                'additional_info': additional_info
            }

            # Sistem tipine göre özel alanları ekle
            if system_type == 'Database':
                detailed_info.update({
                    'host': additional_info.get('host', ''),
                    'port': additional_info.get('port', ''),
                    'username': additional_info.get('username', ''),
                    'password': additional_info.get('password', '')
                })
            elif system_type == 'VPN':
                detailed_info.update({
                    'server': additional_info.get('server', ''),
                    'port': additional_info.get('port', ''),
                    'username': additional_info.get('username', ''),
                    'password': additional_info.get('password', '')
                })
            elif system_type == 'SERVER':
                detailed_info.update({
                    'ip': additional_info.get('ip', ''),
                    'os': additional_info.get('os', ''),
                    'username': additional_info.get('username', ''),
                    'password': additional_info.get('password', '')
                })
            elif system_type == 'Application':
                detailed_info.update({
                    'url': additional_info.get('url', ''),
                    'version': additional_info.get('version', ''),
                    'username': additional_info.get('username', ''),
                    'password': additional_info.get('password', '')
                })

            return create_success_response(detailed_info)
        except Company.DoesNotExist:
            return create_error_response('System not found')
        except Exception as e:
            return create_error_response(str(e))


@method_decorator(csrf_exempt, name='dispatch')
class SystemShareAPIView(LoginRequiredMixin, View):
    def get(self, request):
        try:
            # Tüm kullanıcıları getir (mevcut kullanıcı hariç)
            users = User.objects.exclude(id=request.user.id)
            users_data = [{'id': user.id, 'username': user.username} for user in users]
            return JsonResponse({'success': True, 'users': users_data})
        except Exception as e:
            return create_error_response(str(e))

    def post(self, request):
        # Sistem paylaşım yetkisi kontrolü
        if not request.user.can_share_systems:
            return create_error_response('Sistem paylaşım yetkiniz bulunmamaktadır.')
        
        try:
            data = json.loads(request.body)
            system_id = data.get('system_id')
            is_public = data.get('is_public', False)
            shared_with_ids = data.get('shared_with', [])

            system = request.user.companies.get(id=system_id)
            
            # Mevcut paylaşımı kontrol et ve güncelle
            share, created = SystemShare.objects.get_or_create(
                system=system,
                shared_by=request.user,
                defaults={'is_public': is_public}
            )
            
            if not created:
                share.is_public = is_public
                share.save()
            
            # Paylaşım listesini güncelle
            if not is_public:
                share.shared_with.clear()
                for user_id in shared_with_ids:
                    try:
                        user = User.objects.get(id=user_id)
                        share.shared_with.add(user)
                    except User.DoesNotExist:
                        continue
            else:
                share.shared_with.clear()

            return create_success_response({
                'message': 'System shared successfully',
                'is_public': share.is_public,
                'shared_with': [user.id for user in share.shared_with.all()]
            })
        except Company.DoesNotExist:
            return create_error_response('System not found')
        except json.JSONDecodeError:
            return create_error_response('Invalid JSON data')
        except Exception as e:
            return create_error_response(str(e))