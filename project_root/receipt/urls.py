from django.urls import path
from .views import ReceiptAddAndSeeView


app_name = 'receipt'

urlpatterns = [
    path("", ReceiptAddAndSeeView.as_view(), name="get-post-receipts")
]
