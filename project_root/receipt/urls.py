from math import log
from django.urls import path
from .views import ReceiptAddAndSeeView, UserLoginView, UserSignUpView, ResetPasswordView


app_name = 'receipt'

urlpatterns = [
    path("", ReceiptAddAndSeeView.as_view(), name="get-post-receipts"),
    path("login/", UserLoginView.as_view(), name='login'),
    path("signup/", UserSignUpView.as_view(), name='register'),
    path("login/", ResetPasswordView.as_view(), name='password_reset'),
]
