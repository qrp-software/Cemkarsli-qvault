from django import forms
from .models import Project

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