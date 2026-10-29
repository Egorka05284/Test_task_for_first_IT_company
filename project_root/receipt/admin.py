from django.contrib import admin
from .models import Receipt

# Register your models here.


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ("fn_value", "user", "purchase_day", "total_sum", "status", "registered_at")
    search_fields = ("status",)
    ordering = ("total_sum",)