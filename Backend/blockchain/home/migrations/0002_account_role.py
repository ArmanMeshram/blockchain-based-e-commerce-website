from django.db import migrations, models


def set_legacy_roles(apps, schema_editor):
    Account = apps.get_model('home', 'Account')
    Account.objects.filter(is_admin=True).update(role='admin')


class Migration(migrations.Migration):
    dependencies = [('home', '0001_initial')]
    operations = [
        migrations.AddField(
            model_name='account', name='role',
            field=models.CharField(choices=[('customer', 'Customer'), ('admin', 'Admin')], default='customer', max_length=12),
        ),
        migrations.RunPython(set_legacy_roles, migrations.RunPython.noop),
    ]
