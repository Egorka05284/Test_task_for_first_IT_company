from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo
from django.http import HttpRequest
from django.http.response import HttpResponse as HttpResponse
from django.shortcuts import redirect
from django.urls import reverse
from django.views.generic import CreateView, TemplateView
from django.contrib.auth.views import LoginView
from .models import Receipt
from .forms import ReceiptForm
from django.contrib import messages
from promo.settings import START_PROMO, END_PROMO

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
        context["start_promo"] = datetime.strptime(START_PROMO, "%d/%m/%Y")
        context["end_promo"] = datetime.strptime(END_PROMO, "%d/%m/%Y")
        return context
    
    def get(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        if not self.request.user.is_authenticated:
            return HttpResponse("<h1>Log in first</h1>")
        return super().get(request, **kwargs)
    
    def post(self, request, *args, **kwargs):
        receipt_form = ReceiptForm(request.POST)
        start_promo = datetime.strptime(START_PROMO, "%d/%m/%Y")
        end_promo = datetime.strptime(END_PROMO, "%d/%m/%Y")
        msk_tz = ZoneInfo("Europe/Moscow")
        if receipt_form.is_valid():
            if start_promo.replace(tzinfo=msk_tz) >= receipt_form.cleaned_data['purchase_day'] or receipt_form.cleaned_data['purchase_day'] >= end_promo.replace(tzinfo=msk_tz):
                Receipt.objects.create(
                    fn_value=receipt_form.cleaned_data["fn_value"],
                    fd_value=receipt_form.cleaned_data["fd_value"],
                    fp_value=receipt_form.cleaned_data["fp_value"],
                    total_sum=receipt_form.cleaned_data["total_sum"],
                    purchase_day=receipt_form.cleaned_data["purchase_day"],
                    user=self.request.user,
                    status="NO",
                    info="Ваша покупка была вне рамок акции."
                )
                messages.success(
                    request,
                    "Чек зарегистрирован.",
                    extra_tags="receipt_created",
                )
            else:
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

