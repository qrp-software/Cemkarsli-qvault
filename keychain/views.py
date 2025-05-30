from django.shortcuts import render, redirect
from django.shortcuts import render
from django.views.generic import ListView, DetailView, CreateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .models import Project, Company
from django.urls import reverse_lazy
from django.contrib import messages
from django.http import HttpResponseRedirect, JsonResponse
from .forms import ProjectForm, CompanyForm


def login_view(request):
    if request.user.is_authenticated:
        return redirect('keychain:home')
    
    if request.method == 'POST':
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


def home_view(request):
    print(f"Home view accessed. User authenticated: {request.user.is_authenticated}")  # Debug
    if not request.user.is_authenticated:
        return redirect('keychain:login')
        
    user_projects_count = request.user.projects.count()
    recent_projects = request.user.projects.order_by('-created_date')[:5]
    
    context = {
        'user': request.user,
        'projects_count': user_projects_count,
        'recent_projects': recent_projects,
    }
    print(f"Rendering home.html for user: {request.user.username}")  # Debug
    return render(request, 'keychain/home.html', context)


@login_required
def logout_view(request):
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


@login_required
def add_project(request):
    if request.method == 'POST':
        import json
        try:
            # JSON verisini parse et
            data = json.loads(request.body)
            
            # Project oluştur
            project = Project.objects.create(
                code=data.get('code'),
                name=data.get('name'),
                description=data.get('description', ''),
                system_type=data.get('system_type', ''),
                owner=request.user
            )
            
            # Kullanıcıyı projeye ekle
            project.users.add(request.user)
            
            # Sistem tipi için label'ı al
            system_type_choices = {
                '1': 'Database',
                '2': 'VPN',
                '3': 'SERVER',
                '4': 'Application'
            }
            system_type_label = system_type_choices.get(project.system_type, project.system_type)
            
            return JsonResponse({
                'success': True,
                'id': project.id,
                'code': project.code,
                'name': project.name,
                'description': project.description,
                'system_type': system_type_label
            })
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Invalid JSON data'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})


@login_required
def update_project(request, project_id):
    if request.method == 'PUT':
        import json
        try:
            # Project'i bul
            project = Project.objects.get(id=project_id, owner=request.user)
            
            # JSON verisini parse et
            data = json.loads(request.body)
            
            # Project'i güncelle
            project.code = data.get('code', project.code)
            project.name = data.get('name', project.name)
            project.description = data.get('description', project.description)
            project.system_type = data.get('system_type', project.system_type)
            project.save()
            
            # Sistem tipi için label'ı al
            system_type_choices = {
                '1': 'Database',
                '2': 'VPN',
                '3': 'SERVER',
                '4': 'Application'
            }
            system_type_label = system_type_choices.get(project.system_type, project.system_type)
            
            return JsonResponse({
                'success': True,
                'id': project.id,
                'code': project.code,
                'name': project.name,
                'description': project.description,
                'system_type': system_type_label
            })
        except Project.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Project not found'})
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Invalid JSON data'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})


@login_required
def delete_project(request, project_id):
    if request.method == 'DELETE':
        try:
            # Project'i bul ve sil
            project = Project.objects.get(id=project_id, owner=request.user)
            project.delete()
            
            return JsonResponse({'success': True})
        except Project.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Project not found'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})


@login_required
def add_company(request):
    if request.method == 'POST':
        import json
        try:
            # JSON verisini parse et
            data = json.loads(request.body)
            
            # Project'i al
            project_id = data.get('project_id')
            project = None
            if project_id:
                try:
                    # Sadece kullanıcının sahip olduğu projelerden seç
                    project = request.user.projects.get(id=project_id)
                except Project.DoesNotExist:
                    return JsonResponse({'success': False, 'error': 'Project not found'})
            
            # Company oluştur
            company = Company.objects.create(
                project=project,
                name=data.get('name'),
                number=data.get('number'),
                system_type=data.get('system_type'),
                additional_info=data.get('additional_info', {}),
                owner=request.user  # Owner'ı mevcut kullanıcı olarak set et
            )
            
            # Kullanıcıyı company'ye ekle
            company.users.add(request.user)
            
            # Sistem tipi için label'ı al
            system_type_choices = {
                '1': 'Database',
                '2': 'VPN',
                '3': 'SERVER',
                '4': 'Application'
            }
            system_type_label = system_type_choices.get(company.system_type, company.system_type)
            
            return JsonResponse({
                'success': True,
                'id': company.id,
                'project_name': project.name if project else '',
                'name': company.name,
                'number': company.number,
                'system_type': system_type_label
            })
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Invalid JSON data'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})


@login_required
def update_company(request, company_id):
    if request.method == 'PUT':
        import json
        try:
            # Company'yi bul - sadece kullanıcının sahip olduğu şirketlerden
            company = request.user.companies.get(id=company_id)
            
            # JSON verisini parse et
            data = json.loads(request.body)
            
            # Project'i al
            project_id = data.get('project_id')
            if project_id:
                try:
                    # Sadece kullanıcının sahip olduğu projelerden seç
                    project = request.user.projects.get(id=project_id)
                    company.project = project
                except Project.DoesNotExist:
                    return JsonResponse({'success': False, 'error': 'Project not found'})
            else:
                company.project = None
            
            # Company'yi güncelle
            company.name = data.get('name', company.name)
            company.number = data.get('number', company.number)
            company.system_type = data.get('system_type', company.system_type)
            company.additional_info = data.get('additional_info', company.additional_info)
            company.save()
            
            # Sistem tipi için label'ı al
            system_type_choices = {
                '1': 'Database',
                '2': 'VPN',
                '3': 'SERVER',
                '4': 'Application'
            }
            system_type_label = system_type_choices.get(company.system_type, company.system_type)
            
            return JsonResponse({
                'success': True,
                'id': company.id,
                'project_name': company.project.name if company.project else '',
                'name': company.name,
                'number': company.number,
                'system_type': system_type_label
            })
        except Company.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Company not found'})
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Invalid JSON data'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})


@login_required
def delete_company(request, company_id):
    if request.method == 'DELETE':
        try:
            # Company'yi bul ve sil - sadece kullanıcının sahip olduğu şirketlerden
            company = request.user.companies.get(id=company_id)
            company.delete()
            
            return JsonResponse({'success': True, 'message': 'Company deleted successfully'})
        except Company.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Company not found'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})


@login_required
def get_company_details(request, company_id):
    if request.method == 'GET':
        try:
            # Company'yi bul - sadece kullanıcının sahip olduğu şirketlerden
            company = request.user.companies.get(id=company_id)
            
            # Sistem tipi için label'ı al
            system_type_choices = {
                '1': 'Database',
                '2': 'VPN',
                '3': 'SERVER',
                '4': 'Application'
            }
            system_type_label = system_type_choices.get(company.system_type, company.system_type)
            
            return JsonResponse({
                'success': True,
                'id': company.id,
                'project_name': company.project.name if company.project else '',
                'name': company.name,
                'number': company.number,
                'system_type': system_type_label,
                'additional_info': company.additional_info
            })
        except Company.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Company not found'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})