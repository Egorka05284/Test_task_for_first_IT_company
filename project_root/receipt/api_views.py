from django.shortcuts import redirect
from django.urls import reverse
from rest_framework.generics import ListAPIView
from .serializers import ReceiptSerializer
from .models import Receipt



class ReceiptListAPIView(ListAPIView):
    serializer_class = ReceiptSerializer

    def get_queryset(self):
        return Receipt.objects.filter(user=self.request.user)
    
    def get(self, request, *args, **kwargs):
        if not self.request.user.is_authenticated:
            return redirect(reverse('receipt:login'))
        return super().get(request, *args, **kwargs)
    