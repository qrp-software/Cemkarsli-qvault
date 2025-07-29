from django.db import models
from django.db import models
from utils.models import StarterModel
from users.models import User


class Project(StarterModel):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    system_type = models.CharField(max_length=50, blank=True, null=True)
    is_private = models.BooleanField(default=False) 
    owner = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="owned_projects",
    )
    users = models.ManyToManyField(User, related_name="projects")


class Crediental(StarterModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    code = models.CharField(max_length=10)
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="owned_credentials",
    )
    users = models.ManyToManyField(User, related_name="credentials")
    system_type = models.CharField(max_length=50)
    username = models.CharField(max_length=255, blank=True, null=True)
    password = models.CharField(max_length=255, blank=True, null=True)
    values = models.JSONField(default=list)
    description = models.TextField(blank=True)
    note = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    parent = models.ForeignKey("self", on_delete=models.PROTECT, null=True, blank=True)

    class Meta:
        unique_together = ("code", "project")


class Company(models.Model):
    project = models.ForeignKey(Project, on_delete=models.PROTECT, related_name="companies", null=True, blank=True)
    name = models.CharField(max_length=100)
    number = models.CharField(max_length=20)
    system_type = models.CharField(max_length=50)
    additional_info = models.JSONField(default=dict, blank=True)
    is_private = models.BooleanField(default=False) 
    owner = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="owned_companies",
        null=True,
        blank=True
    )
    users = models.ManyToManyField(User, related_name="companies")
    def __str__(self):
        return self.name


class SystemShare(models.Model):
    system = models.ForeignKey(Company, on_delete=models.PROTECT, related_name='shares')
    shared_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='shared_systems')
    shared_with = models.ManyToManyField(User, related_name='shared_systems_with_me', blank=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('system', 'shared_by')

    def __str__(self):
        return f"{self.system.name} shared by {self.shared_by.username}"


class Activity(StarterModel):
    
    project = models.ForeignKey(
        Project, 
        on_delete=models.PROTECT, 
        related_name="activities",
        verbose_name="Proje"
    )
    activity_name = models.TextField(
        verbose_name="Faaliyet"
    )
    duration = models.DurationField(
        verbose_name="Süre",
        help_text="Faaliyetin süresi (saat:dakika:saniye formatında)"
    )
    is_billable = models.BooleanField(
        default=True, 
        verbose_name="Faturalanabilir"
    )
    primary_person = models.ForeignKey(
        User, 
        on_delete=models.PROTECT, 
        related_name="primary_activities",
        verbose_name="Kişi"
    )
    secondary_person = models.ForeignKey(
        User, 
        on_delete=models.PROTECT, 
        related_name="secondary_activities",
        blank=True,
        null=True,
        verbose_name="İkincil Kişi"
    )
    activity_date = models.DateField(
        verbose_name="Tarih"
    )
    description = models.TextField(
        blank=True, 
        verbose_name="Açıklama"
    )
    owner = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="owned_activities",
        verbose_name="Sahibi"
    )

    class Meta:
        verbose_name = "Faaliyet"
        verbose_name_plural = "Faaliyetler"
        ordering = ['-activity_date', '-created_date']

    def __str__(self):
        return f"{self.project.code} - {self.activity_name} ({self.activity_date})"

    @property
    def duration_hours(self):
     
        if self.duration:
            return self.duration.total_seconds() / 3600
        return 0

    @property
    def billable_status(self):
      
        return "Evet" if self.is_billable else "Hayır"
    
    @property
    def attachment(self):
        
        first_attachment = self.attachments.first()
        return first_attachment.file if first_attachment else None
    
    @property
    def all_attachments(self):
        
        return self.attachments.all()


class ActivityAttachment(models.Model):
    
    activity = models.ForeignKey(
        Activity,
        on_delete=models.CASCADE,
        related_name="attachments",
        verbose_name="Faaliyet"
    )
    file = models.FileField(
        upload_to='activity_files/%Y/%m/',
        verbose_name="Dosya",
        help_text="Faaliyetle ilgili dosya, resim veya PDF yükleyebilirsiniz"
    )
    original_name = models.CharField(
        max_length=255,
        verbose_name="Orijinal Dosya Adı",
        help_text="Dosyanın yüklendiği andaki orijinal adı",
        db_column="original_filename"
    )
    file_size = models.PositiveIntegerField(
        verbose_name="Dosya Boyutu (bytes)",
        default=0
    )
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Yüklenme Tarihi"
    )
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="uploaded_attachments",
        verbose_name="Yükleyen"
    )

    class Meta:
        verbose_name = "Faaliyet Dosyası"
        verbose_name_plural = "Faaliyet Dosyaları"
        ordering = ['uploaded_at']

    def __str__(self):
        return f"{self.activity} - {self.original_name}"
    
    @property
    def file_extension(self):
        
        import os
        return os.path.splitext(self.original_name)[1].lower()
    
    @property
    def is_image(self):
        
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
        return self.file_extension in image_extensions
    
    @property
    def is_pdf(self):
        
        return self.file_extension == '.pdf'
    
    @property
    def is_document(self):
        
        doc_extensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf']
        return self.file_extension in doc_extensions
