from django.contrib import admin
from .models import *

# Register your models here.
class EmailAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'sender', 'subject')

admin.site.register(Email, EmailAdmin)
admin.site.register(User)
