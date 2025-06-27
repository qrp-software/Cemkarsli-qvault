from django.shortcuts import render, redirect
from django.views.generic import ListView, DetailView, CreateView, View, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Project, Company, SystemShare, Activity
from django.urls import reverse_lazy
from django.contrib import messages
from django.http import HttpResponseRedirect, JsonResponse, HttpResponse
from .forms import ProjectForm, CompanyForm, ActivityForm
import json
from users.models import User
from django.db import models
import pandas as pd
from io import BytesIO
from django.utils import timezone
# PDF export için xhtml2pdf import'ları - isteğe bağlı
try:
    from xhtml2pdf import pisa
    from django.template.loader import render_to_string
    XHTML2PDF_AVAILABLE = True
except ImportError:
    XHTML2PDF_AVAILABLE = False

import os

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
        
        # Kullanıcının kendi projeleri
        own_projects = request.user.projects.all()
        
        # Paylaşılan sistemlerin projeleri
        shared_system_projects = Project.objects.filter(
            companies__shares__shared_with=request.user
        ).exclude(owner=request.user)
        
        # Herkese açık sistemlerin projeleri
        public_system_projects = Project.objects.filter(
            companies__shares__is_public=True
        ).exclude(owner=request.user).exclude(id__in=shared_system_projects)
        
        # Tüm projeleri birleştir
        all_projects = (own_projects | shared_system_projects | public_system_projects).distinct()
        
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
        user = self.request.user
        
        # Kullanıcının kendi projeleri
        own_projects = user.projects.all()
        
        # Paylaşılan sistemlerin projeleri
        shared_system_projects = Project.objects.filter(
            companies__shares__shared_with=user
        ).exclude(owner=user)
        
        # Herkese açık sistemlerin projeleri
        public_system_projects = Project.objects.filter(
            companies__shares__is_public=True
        ).exclude(owner=user).exclude(id__in=shared_system_projects)
        
        # Tüm projeleri birleştir
        all_projects = (own_projects | shared_system_projects | public_system_projects).distinct()
        
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
        user = self.request.user
        queryset = user.projects.all()
        return queryset

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
        user = self.request.user
        # Kullanıcının kendi sistemleri
        own_systems = user.companies.all()
        # Kullanıcıyla paylaşılan sistemler
        shared_systems = Company.objects.filter(
            shares__shared_with=user
        ).exclude(owner=user)
        # Herkese açık sistemler
        public_systems = Company.objects.filter(
            shares__is_public=True
        ).exclude(owner=user).exclude(id__in=shared_systems)
        
        return (own_systems | shared_systems | public_systems).distinct()
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["form"] = CompanyForm()
        
        # Kullanıcının kendi projeleri
        own_projects = self.request.user.projects.all()
        
        # Paylaşılan sistemlerin projeleri
        shared_system_projects = Project.objects.filter(
            companies__shares__shared_with=self.request.user
        ).exclude(owner=self.request.user)
        
        # Herkese açık sistemlerin projeleri
        public_system_projects = Project.objects.filter(
            companies__shares__is_public=True
        ).exclude(owner=self.request.user).exclude(id__in=shared_system_projects)
        
        # Tüm projeleri birleştir
        all_projects = (own_projects | shared_system_projects | public_system_projects).distinct()
        
        context["projects"] = all_projects
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
                'system_type': get_system_type_label(project.system_type)
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
                'system_type': get_system_type_label(project.system_type)
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


class CompanyCreateAPIView(LoginRequiredMixin, View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            
            project_id = data.get('project_id')
            project = None
            if project_id:
                try:
                    project = request.user.projects.get(id=project_id)
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
                'system_type': get_system_type_label(company.system_type)
            })
        except json.JSONDecodeError:
            return create_error_response('Invalid JSON data')
        except Exception as e:
            return create_error_response(str(e))


class CompanyUpdateAPIView(LoginRequiredMixin, View):
    def put(self, request, company_id):
        try:
            company = request.user.companies.get(id=company_id)
            data = json.loads(request.body)
            
            project_id = data.get('project_id')
            if project_id:
                try:
                    project = request.user.projects.get(id=project_id)
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
                'system_type': get_system_type_label(company.system_type)
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
            company = request.user.companies.get(id=company_id)
            
            # Önce sistemin paylaşımlarını sil
            SystemShare.objects.filter(system=company).delete()
            
            # Sonra sistemi sil
            company.delete()
            return create_success_response({'message': 'Company deleted successfully'})
        except Company.DoesNotExist:
            return create_error_response('Company not found')
        except Exception as e:
            return create_error_response(str(e))


class CompanyDetailAPIView(LoginRequiredMixin, View):
    def get(self, request, company_id):
        try:
            # Önce kullanıcının kendi sistemlerinde ara
            try:
                company = request.user.companies.get(id=company_id)
            except Company.DoesNotExist:
                # Kendi sistemlerinde yoksa, paylaşılan sistemlerde ara
                company = Company.objects.filter(
                    models.Q(shares__shared_with=request.user) |  # Kullanıcıyla paylaşılan
                    models.Q(shares__is_public=True)  # Herkese açık
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


class ActivityListView(LoginRequiredMixin, ListView):
    model = Activity
    template_name = "keychain/activity_list.html"
    context_object_name = "activities"

    def get_queryset(self):
        user = self.request.user
        # Kullanıcının kendi faaliyetleri ve kişi/ikincil kişi olduğu faaliyetler
        queryset = Activity.objects.filter(
            models.Q(owner=user) |
            models.Q(primary_person=user) |
            models.Q(secondary_person=user)
        ).distinct().select_related('project', 'primary_person', 'secondary_person', 'owner')
        
        # Tarih filtreleme
        start_date = self.request.GET.get('start_date')
        end_date = self.request.GET.get('end_date')
        
        if start_date:
            queryset = queryset.filter(activity_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(activity_date__lte=end_date)
        
        # Sıralama parametresini al
        sort_by = self.request.GET.get('sort', 'id')
        order = self.request.GET.get('order', 'desc')
        
        # Sıralama alanını belirle
        if sort_by == 'project_code':
            sort_field = 'project__code'
        elif sort_by == 'project_name':
            sort_field = 'project__name'
        elif sort_by == 'duration':
            sort_field = 'duration'
        elif sort_by == 'is_billable':
            sort_field = 'is_billable'
        elif sort_by == 'primary_person':
            sort_field = 'primary_person__username'
        elif sort_by == 'activity_date':
            sort_field = 'activity_date'
        elif sort_by == 'created_date':
            sort_field = 'created_date'
        elif sort_by == 'modified_date':
            sort_field = 'modified_date'
        else:
            sort_field = 'id'
        
        # Sıralama yönünü belirle
        if order == 'desc':
            sort_field = '-' + sort_field
        
        return queryset.order_by(sort_field)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["form"] = ActivityForm()
        context["current_sort"] = self.request.GET.get('sort', 'id')
        context["current_order"] = self.request.GET.get('order', 'desc')
        
        # Tarih filtreleme bilgileri
        context["start_date"] = self.request.GET.get('start_date', '')
        context["end_date"] = self.request.GET.get('end_date', '')
        context["filtered_count"] = self.get_queryset().count()
        
        # Kullanıcının erişebileceği projeler
        user = self.request.user
        own_projects = user.projects.all()
        shared_system_projects = Project.objects.filter(
            companies__shares__shared_with=user
        ).exclude(owner=user)
        public_system_projects = Project.objects.filter(
            companies__shares__is_public=True
        ).exclude(owner=user).exclude(id__in=shared_system_projects)
        all_projects = (own_projects | shared_system_projects | public_system_projects).distinct()
        
        context["projects"] = all_projects
        context["users"] = User.objects.all()
        return context


class ActivityCreateAPIView(LoginRequiredMixin, View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            
            project_id = data.get('project_id')
            try:
                # Kullanıcının erişebileceği projelerden birini seç
                user = request.user
                own_projects = user.projects.all()
                shared_system_projects = Project.objects.filter(
                    companies__shares__shared_with=user
                ).exclude(owner=user)
                public_system_projects = Project.objects.filter(
                    companies__shares__is_public=True
                ).exclude(owner=user).exclude(id__in=shared_system_projects)
                all_projects = (own_projects | shared_system_projects | public_system_projects).distinct()
                
                project = all_projects.get(id=project_id)
            except Project.DoesNotExist:
                return create_error_response('Proje bulunamadı veya erişim yetkiniz yok')
            
            # Kişileri kontrol et
            primary_person_id = data.get('primary_person_id')
            secondary_person_id = data.get('secondary_person_id')
            
            try:
                primary_person = User.objects.get(id=primary_person_id)
            except User.DoesNotExist:
                return create_error_response('Kişi bulunamadı')
            
            secondary_person = None
            if secondary_person_id:
                try:
                    secondary_person = User.objects.get(id=secondary_person_id)
                except User.DoesNotExist:
                    return create_error_response('İkincil kişi bulunamadı')
            
            activity = Activity.objects.create(
                project=project,
                activity_description=data.get('activity_description'),
                duration=data.get('duration'),
                activity_date=data.get('activity_date'),
                is_billable=data.get('is_billable', 'yes'),
                primary_person=primary_person,
                secondary_person=secondary_person,
                owner=request.user
            )
            
            return create_success_response({
                'id': activity.id,
                'project_code': project.code,
                'project_name': project.name,
                'activity_description': activity.activity_description,
                'duration': float(activity.duration),
                'is_billable': activity.get_is_billable_display(),
                'primary_person': activity.primary_person.get_full_name() or activity.primary_person.username,
                'secondary_person': activity.secondary_person.get_full_name() or activity.secondary_person.username if activity.secondary_person else '',
                'created_date': activity.created_date.strftime('%d.%m.%Y %H:%M')
            })
        except json.JSONDecodeError:
            return create_error_response('Geçersiz JSON verisi')
        except Exception as e:
            return create_error_response(str(e))


class ActivityUpdateAPIView(LoginRequiredMixin, View):
    def put(self, request, activity_id):
        try:
            # Sadece sahip olduğu faaliyetleri güncelleyebilir
            activity = Activity.objects.get(id=activity_id, owner=request.user)
            data = json.loads(request.body)
            
            # Proje güncellemesi
            project_id = data.get('project_id')
            if project_id:
                try:
                    user = request.user
                    own_projects = user.projects.all()
                    shared_system_projects = Project.objects.filter(
                        companies__shares__shared_with=user
                    ).exclude(owner=user)
                    public_system_projects = Project.objects.filter(
                        companies__shares__is_public=True
                    ).exclude(owner=user).exclude(id__in=shared_system_projects)
                    all_projects = (own_projects | shared_system_projects | public_system_projects).distinct()
                    
                    project = all_projects.get(id=project_id)
                    activity.project = project
                except Project.DoesNotExist:
                    return create_error_response('Proje bulunamadı veya erişim yetkiniz yok')
            
            # Diğer alanları güncelle
            activity.activity_description = data.get('activity_description', activity.activity_description)
            activity.duration = data.get('duration', activity.duration)
            activity.activity_date = data.get('activity_date', activity.activity_date)
            activity.is_billable = data.get('is_billable', activity.is_billable)
            
            # Kişi güncellemeleri
            primary_person_id = data.get('primary_person_id')
            if primary_person_id:
                try:
                    activity.primary_person = User.objects.get(id=primary_person_id)
                except User.DoesNotExist:
                    return create_error_response('Kişi bulunamadı')
            
            secondary_person_id = data.get('secondary_person_id')
            if secondary_person_id:
                try:
                    activity.secondary_person = User.objects.get(id=secondary_person_id)
                except User.DoesNotExist:
                    return create_error_response('İkincil kişi bulunamadı')
            elif secondary_person_id == '':  # Boş string ise ikincil kişiyi kaldır
                activity.secondary_person = None
            
            activity.save()
            
            return create_success_response({
                'id': activity.id,
                'project_code': activity.project.code,
                'project_name': activity.project.name,
                'activity_description': activity.activity_description,
                'duration': float(activity.duration),
                'is_billable': activity.get_is_billable_display(),
                'primary_person': activity.primary_person.get_full_name() or activity.primary_person.username,
                'secondary_person': activity.secondary_person.get_full_name() or activity.secondary_person.username if activity.secondary_person else '',
                'modified_date': activity.modified_date.strftime('%d.%m.%Y %H:%M')
            })
        except Activity.DoesNotExist:
            return create_error_response('Faaliyet bulunamadı')
        except json.JSONDecodeError:
            return create_error_response('Geçersiz JSON verisi')
        except Exception as e:
            return create_error_response(str(e))


class ActivityDeleteAPIView(LoginRequiredMixin, View):
    def delete(self, request, activity_id):
        try:
            # Sadece sahip olduğu faaliyetleri silebilir
            activity = Activity.objects.get(id=activity_id, owner=request.user)
            activity.delete()
            return create_success_response({'message': 'Faaliyet başarıyla silindi'})
        except Activity.DoesNotExist:
            return create_error_response('Faaliyet bulunamadı')
        except Exception as e:
            return create_error_response(str(e))


class ActivityExportExcelView(LoginRequiredMixin, View):
    def get(self, request):
        try:
            # ActivityListView'deki queryset mantığını kullan
            user = request.user
            queryset = Activity.objects.filter(
                models.Q(owner=user) |
                models.Q(primary_person=user) |
                models.Q(secondary_person=user)
            ).distinct().select_related('project', 'primary_person', 'secondary_person', 'owner')
            
            # Tarih filtreleme
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            
            if start_date:
                queryset = queryset.filter(activity_date__gte=start_date)
            if end_date:
                queryset = queryset.filter(activity_date__lte=end_date)
            
            # Sıralama
            sort_by = request.GET.get('sort', 'id')
            order = request.GET.get('order', 'desc')
            
            if sort_by == 'project_code':
                sort_field = 'project__code'
            elif sort_by == 'project_name':
                sort_field = 'project__name'
            elif sort_by == 'duration':
                sort_field = 'duration'
            elif sort_by == 'is_billable':
                sort_field = 'is_billable'
            elif sort_by == 'primary_person':
                sort_field = 'primary_person__username'
            elif sort_by == 'activity_date':
                sort_field = 'activity_date'
            elif sort_by == 'created_date':
                sort_field = 'created_date'
            elif sort_by == 'modified_date':
                sort_field = 'modified_date'
            else:
                sort_field = 'id'
            
            if order == 'desc':
                sort_field = '-' + sort_field
            
            activities = queryset.order_by(sort_field)
            
            # Excel verisi hazırla
            data = []
            for activity in activities:
                data.append({
                    'ID': activity.id,
                    'Proje Kodu': activity.project.code,
                    'Proje Adı': activity.project.name,
                    'Faaliyet Açıklaması': activity.activity_description,
                    'Süre (Saat)': float(activity.duration),
                    'Faturlanabilirlik': 'Evet' if activity.is_billable == 'yes' else 'Hayır',
                    'Kişi': activity.primary_person.get_full_name() or activity.primary_person.username if activity.primary_person else '',
                    'İkincil Kişi': activity.secondary_person.get_full_name() or activity.secondary_person.username if activity.secondary_person else '',
                    'Faaliyet Tarihi': activity.activity_date.strftime('%d.%m.%Y'),
                    'Oluşturan': activity.owner.get_full_name() or activity.owner.username,
                    'Oluşturma Tarihi': activity.created_date.strftime('%d.%m.%Y %H:%M'),
                    'Güncelleme Tarihi': activity.modified_date.strftime('%d.%m.%Y %H:%M')
                })
            
            # DataFrame oluştur
            df = pd.DataFrame(data)
            
            # Excel dosyası oluştur
            output = BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Faaliyetler', index=False)
                
                # Worksheet'i al ve formatla
                worksheet = writer.sheets['Faaliyetler']
                
                # Sütun genişliklerini ayarla
                for column in worksheet.columns:
                    max_length = 15
                    column_letter = column[0].column_letter
                    for cell in column:
                        try:
                            if len(str(cell.value)) > max_length:
                                max_length = len(str(cell.value))
                        except:
                            pass
                    adjusted_width = min(max_length + 2, 50)
                    worksheet.column_dimensions[column_letter].width = adjusted_width
            
            output.seek(0)
            
            # Dosya adı oluştur
            current_date = timezone.now().strftime('%Y%m%d_%H%M%S')
            filename = f'faaliyetler_{current_date}.xlsx'
            
            # Response oluştur
            response = HttpResponse(
                output.read(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            
            return response
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})


class ActivityExportPDFView(LoginRequiredMixin, View):
    def get(self, request):
        # xhtml2pdf kontrolü
        if not XHTML2PDF_AVAILABLE:
            return JsonResponse({
                'success': False, 
                'error': 'PDF export özelliği için xhtml2pdf kütüphanesi gereklidir. Lütfen "pip install xhtml2pdf" komutunu çalıştırın.'
            })
        
        try:
            # ActivityListView'deki queryset mantığını kullan
            user = request.user
            queryset = Activity.objects.filter(
                models.Q(owner=user) |
                models.Q(primary_person=user) |
                models.Q(secondary_person=user)
            ).distinct().select_related('project', 'primary_person', 'secondary_person', 'owner')
            
            # Tarih filtreleme
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            
            if start_date:
                queryset = queryset.filter(activity_date__gte=start_date)
            if end_date:
                queryset = queryset.filter(activity_date__lte=end_date)
            
            # Sıralama
            sort_by = request.GET.get('sort', 'id')
            order = request.GET.get('order', 'desc')
            
            if sort_by == 'project_code':
                sort_field = 'project__code'
            elif sort_by == 'project_name':
                sort_field = 'project__name'
            elif sort_by == 'duration':
                sort_field = 'duration'
            elif sort_by == 'is_billable':
                sort_field = 'is_billable'
            elif sort_by == 'primary_person':
                sort_field = 'primary_person__username'
            elif sort_by == 'activity_date':
                sort_field = 'activity_date'
            elif sort_by == 'created_date':
                sort_field = 'created_date'
            elif sort_by == 'modified_date':
                sort_field = 'modified_date'
            else:
                sort_field = 'id'
            
            if order == 'desc':
                sort_field = '-' + sort_field
            
            activities = queryset.order_by(sort_field)
            
            # İstatistikler hesapla
            total_duration = sum(float(a.duration) for a in activities)
            billable_activities = activities.filter(is_billable='yes').count()
            billable_duration = sum(float(a.duration) for a in activities.filter(is_billable='yes'))
            
            # Tarih objelerini düzenle
            start_date_obj = None
            end_date_obj = None
            
            if start_date:
                try:
                    import datetime
                    start_date_obj = datetime.datetime.strptime(start_date, '%Y-%m-%d').date()
                except:
                    pass
            
            if end_date:
                try:
                    import datetime
                    end_date_obj = datetime.datetime.strptime(end_date, '%Y-%m-%d').date()
                except:
                    pass
            
            # Template context hazırla
            context = {
                'activities': activities,
                'start_date': start_date_obj,
                'end_date': end_date_obj,
                'total_duration': total_duration,
                'billable_activities': billable_activities,
                'billable_duration': billable_duration,
                'current_date': timezone.now(),
                'user': request.user,
            }
            
            # HTML'i render et
            html_string = render_to_string('keychain/pdf_export.html', context)
            
            # PDF buffer oluştur
            result = BytesIO()
            
            # HTML'i PDF'e dönüştür
            pdf = pisa.pisaDocument(BytesIO(html_string.encode("UTF-8")), result)
            
            if not pdf.err:
                # Dosya adı oluştur
                current_date = timezone.now().strftime('%Y%m%d_%H%M%S')
                filename = f'faaliyetler_{current_date}.pdf'
                
                # Response oluştur
                response = HttpResponse(result.getvalue(), content_type='application/pdf')
                response['Content-Disposition'] = f'attachment; filename="{filename}"'
                
                return response
            else:
                return JsonResponse({'success': False, 'error': 'PDF oluşturulurken hata oluştu'})
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})


class ActivityDetailAPIView(LoginRequiredMixin, View):
    def get(self, request, activity_id):
        try:
            # Kendi faaliyetleri veya kişi/ikincil kişi olduğu faaliyetler
            activity = Activity.objects.filter(
                models.Q(owner=request.user) |
                models.Q(primary_person=request.user) |
                models.Q(secondary_person=request.user)
            ).select_related('project', 'primary_person', 'secondary_person', 'owner').get(id=activity_id)
            
            return create_success_response({
                'id': activity.id,
                'project_id': activity.project.id,
                'project_code': activity.project.code,
                'project_name': activity.project.name,
                'activity_description': activity.activity_description,
                'duration': float(activity.duration),
                'activity_date': activity.activity_date.strftime('%Y-%m-%d'),
                'is_billable': activity.is_billable,
                'is_billable_display': activity.get_is_billable_display(),
                'primary_person_id': activity.primary_person.id,
                'primary_person': activity.primary_person.get_full_name() or activity.primary_person.username,
                'secondary_person_id': activity.secondary_person.id if activity.secondary_person else None,
                'secondary_person': activity.secondary_person.get_full_name() or activity.secondary_person.username if activity.secondary_person else '',
                'owner': activity.owner.get_full_name() or activity.owner.username,
                'created_date': activity.created_date.strftime('%d.%m.%Y %H:%M'),
                'modified_date': activity.modified_date.strftime('%d.%m.%Y %H:%M')
            })
        except Activity.DoesNotExist:
            return create_error_response('Faaliyet bulunamadı')
        except Exception as e:
            return create_error_response(str(e))