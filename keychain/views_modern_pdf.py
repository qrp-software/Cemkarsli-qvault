from django.shortcuts import render
from django.views.generic import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse, HttpResponse
from .models import Activity
from django.db import models
from django.utils import timezone
from django.template.loader import render_to_string
import datetime

# PDF export için weasyprint import'ları - isteğe bağlı
try:
    import weasyprint
    WEASYPRINT_AVAILABLE = True
except ImportError:
    WEASYPRINT_AVAILABLE = False


class ModernActivityExportPDFView(LoginRequiredMixin, View):
    def get(self, request):
        # Weasyprint kontrolü
        if not WEASYPRINT_AVAILABLE:
            return JsonResponse({
                'success': False
                
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
                start_date_obj = datetime.datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(activity_date__gte=start_date_obj)
            else:
                start_date_obj = None
            
            if end_date:
                end_date_obj = datetime.datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(activity_date__lte=end_date_obj)
            else:
                end_date_obj = None
            
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
            
            # HTML'i PDF'e dönüştür
            pdf_file = weasyprint.HTML(string=html_string).write_pdf()
            
            # Dosya adı oluştur
            current_date = timezone.now().strftime('%Y%m%d_%H%M%S')
            filename = f'faaliyetler_{current_date}.pdf'
            
            # Response oluştur
            response = HttpResponse(pdf_file, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            
            return response
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}) 