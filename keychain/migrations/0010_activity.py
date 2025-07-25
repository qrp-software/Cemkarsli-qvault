# Generated by Django 4.2.7 on 2025-06-30 10:32

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('keychain', '0009_company_is_private_project_is_private_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Activity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('modified_date', models.DateTimeField(auto_now=True)),
                ('created_date', models.DateTimeField(auto_now_add=True)),
                ('activity_name', models.CharField(max_length=255, verbose_name='Faaliyet')),
                ('duration', models.DurationField(help_text='Faaliyetin süresi (saat:dakika:saniye formatında)', verbose_name='Süre')),
                ('is_billable', models.BooleanField(default=True, verbose_name='Faturalanabilir')),
                ('activity_date', models.DateField(verbose_name='Tarih')),
                ('description', models.TextField(blank=True, verbose_name='Açıklama')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='owned_activities', to=settings.AUTH_USER_MODEL, verbose_name='Sahibi')),
                ('primary_person', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='primary_activities', to=settings.AUTH_USER_MODEL, verbose_name='Kişi')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='activities', to='keychain.project', verbose_name='Proje')),
                ('secondary_person', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='secondary_activities', to=settings.AUTH_USER_MODEL, verbose_name='İkincil Kişi')),
            ],
            options={
                'verbose_name': 'Faaliyet',
                'verbose_name_plural': 'Faaliyetler',
                'ordering': ['-activity_date', '-created_date'],
            },
        ),
    ]
