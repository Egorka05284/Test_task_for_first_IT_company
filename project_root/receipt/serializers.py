from rest_framework.serializers import HyperlinkedModelSerializer, ModelSerializer
from .models import Receipt



class ReceiptSerializer(ModelSerializer):
    class Meta:
        model = Receipt
        fields = ["id", "fn_value", "fd_value", "fp_value", "total_sum", "purchase_day", "user", "status", "registered_at", "info"]