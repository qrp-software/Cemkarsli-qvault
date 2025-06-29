from django import forms
from .models import Project, Activity
from users.models import User

class ProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = ["code","name", "description"]

class CompanyForm(forms.Form):
    name = forms.CharField(max_length=100, label='Firma Adı')
    number = forms.CharField(max_length=20, label='Firma No')
    system_type = forms.ChoiceField(
        choices=[
            ('1', 'Database'),
            ('2', 'VPN'),
            ('3', 'SERVER'),
            ('4', 'Application')
        ],
        label='Sistem Tipi'
    )

class ActivityForm(forms.ModelForm):
    class Meta:
        model = Activity
        fields = [
            'project', 
            'activity_description', 
            'duration', 
            'is_billable', 
            'primary_person', 
            'secondary_person'
        ]
        widgets = {
            'project': forms.Select(attrs={'class': 'form-control'}),
            'activity_description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
            'duration': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.1', 'min': '0'}),
            'is_billable': forms.Select(attrs={'class': 'form-control'}),
            'primary_person': forms.Select(attrs={'class': 'form-control'}),
            'secondary_person': forms.Select(attrs={'class': 'form-control'}),
        }
        labels = {
            'project': 'Proje',
            'activity_description': 'Faaliyet Açıklaması',
            'duration': 'Süre (saat)',
            'is_billable': 'Faturlanabilirlik',
            'primary_person': 'Kişi',
            'secondary_person': 'İkincil Kişi',
        } 