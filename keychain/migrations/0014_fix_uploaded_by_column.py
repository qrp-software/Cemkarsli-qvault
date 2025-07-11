
from django.db import migrations


def add_uploaded_by_column(apps, schema_editor):
    """uploaded_by_id kolonunu ekle"""
    from django.db import connection
    
    cursor = connection.cursor()
    
    
    cursor.execute("PRAGMA table_info(keychain_activityattachment)")
    existing_columns = [row[1] for row in cursor.fetchall()]
    
  
    if 'uploaded_by_id' not in existing_columns:
        cursor.execute("ALTER TABLE keychain_activityattachment ADD COLUMN uploaded_by_id INTEGER REFERENCES auth_user(id)")


class Migration(migrations.Migration):

    dependencies = [
        ('keychain', '0012_remove_activity_attachment_activityattachment'),
    ]

    operations = [
        migrations.RunPython(add_uploaded_by_column),
    ] 