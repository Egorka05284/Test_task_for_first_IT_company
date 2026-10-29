from typing import Any
from django.http import HttpRequest
from django.http.response import HttpResponse as HttpResponse
from django.shortcuts import redirect
from django.urls import reverse
from django.views.generic import CreateView, TemplateView
from django.contrib.auth.views import LoginView
from .models import Receipt
from .forms import ReceiptForm
from django.contrib import messages

# Create your views here.
class ReceiptAddAndSeeView(TemplateView):
    template_name = "receipt/history.html"
    http_method_names = ["get", "post"]

    def get_context_data(self, **kwargs: Any) -> dict[str, Any]:
        context = super().get_context_data(**kwargs)
        user_id = self.request.user.id
        receipts = Receipt.objects.filter(user=user_id)
        receipt_count = receipts.count()
        context["receipts"] = receipts
        context["receipt_count"] = receipt_count
        context["receipt_form"] = ReceiptForm()
        return context
    
    def get(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        if not self.request.user.is_authenticated:
            return HttpResponse("<h1>Log in first</h1>")
        return super().get(request, **kwargs)
    
    def post(self, request, *args, **kwargs):
        receipt_form = ReceiptForm(request.POST)

        if receipt_form.is_valid():
            Receipt.objects.create(
                fn_value=receipt_form.cleaned_data["fn_value"],
                fd_value=receipt_form.cleaned_data["fd_value"],
                fp_value=receipt_form.cleaned_data["fp_value"],
                total_sum=receipt_form.cleaned_data["total_sum"],
                purchase_day=receipt_form.cleaned_data["purchase_day"],
                user=self.request.user
            )
            messages.success(
                request,
                "Чек зарегистрирован.",
                extra_tags="receipt_created",
            )
        
            return redirect(reverse("receipt:get-post-receipts"))

        context = self.get_context_data()
        context["receipt_form"] = receipt_form
        return self.render_to_response(context)

