from django.shortcuts import render, redirect
from django.views.generic import ListView, DetailView, CreateView, View, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .models import Project, Company
from django.urls import reverse_lazy
from django.contrib import messages
from django.http import HttpResponseRedirect, JsonResponse
from .forms import ProjectForm, CompanyForm
import json

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
        user_projects_count = request.user.projects.count()
        recent_projects = request.user.projects.order_by('-created_date')[:5]
        
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
        queryset = user.projects.all()
        return queryset
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["form"] = ProjectForm()
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
        return self.request.user.companies.all()
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["form"] = CompanyForm()
        # Kullanıcının projelerini context'e ekle
        context["projects"] = self.request.user.projects.all()
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
            company.delete()
            return create_success_response({'message': 'Company deleted successfully'})
        except Company.DoesNotExist:
            return create_error_response('Company not found')
        except Exception as e:
            return create_error_response(str(e))


class CompanyDetailAPIView(LoginRequiredMixin, View):
    def get(self, request, company_id):
        try:
            company = request.user.companies.get(id=company_id)
            
            return create_success_response({
                'id': company.id,
                'project_name': company.project.name if company.project else '',
                'name': company.name,
                'number': company.number,
                'system_type': get_system_type_label(company.system_type),
                'additional_info': company.additional_info
            })
        except Company.DoesNotExist:
            return create_error_response('Company not found')
        except Exception as e:
            return create_error_response(str(e))