from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('user', '0001_initial')]
    operations = [
        migrations.AlterField(
            model_name='user', name='mobile_no',
            field=models.CharField(max_length=15),
        ),
    ]
