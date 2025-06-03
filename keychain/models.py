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
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="owned_projects",
    )
    users = models.ManyToManyField(User, related_name="projects")


class Crediental(StarterModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    code = models.CharField(max_length=10)
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
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

    parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        unique_together = ("code", "project")


class Company(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="companies", null=True, blank=True)
    name = models.CharField(max_length=100)
    number = models.CharField(max_length=20)
    system_type = models.CharField(max_length=50)
    additional_info = models.JSONField(default=dict, blank=True)
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="owned_companies",
        null=True,
        blank=True
    )
    users = models.ManyToManyField(User, related_name="companies")
    def __str__(self):
        return self.name


class SystemShare(models.Model):
    system = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='shares')
    shared_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_systems')
    shared_with = models.ManyToManyField(User, related_name='shared_systems_with_me', blank=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('system', 'shared_by')

    def __str__(self):
        return f"{self.system.name} shared by {self.shared_by.username}"
