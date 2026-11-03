from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from .models import Receipt


class ReceiptForm(forms.Form):
    fn_value = forms.CharField(max_length=16, min_length=16, label="ФН", required=True, widget=forms.TextInput(attrs={
        "id": "fn_value",
        "name": "fn", 
        "type": "text", 
        "inputmode": "numeric", 
        "autocomplete": "off", 
        "placeholder": "Введите ФН"
    }))
    fd_value = forms.CharField(max_length=5, min_length=5, label="ФД", required=True, widget=forms.TextInput(attrs={
        "id": "fd_value",
        "name": "fd", 
        "type": "text", 
        "inputmode": "numeric", 
        "autocomplete": "off", 
        "placeholder": "Введите номер чека (ФД)"
    }))
    fp_value = forms.CharField(max_length=10, min_length=10, label="ФП", required=True, widget=forms.TextInput(attrs={
        "id": "fp_value",
        "name": "fp", 
        "type": "text", 
        "inputmode": "numeric", 
        "autocomplete": "off", 
        "placeholder": "Введите ФП"
    }))
    total_sum = forms.DecimalField(label="Сумма чека", required=True, decimal_places=2, max_digits=15, widget=forms.TextInput(attrs={
        "id": "total_sum",
        "name": "amount", 
        "type": "number", 
        "inputmode": "decimal", 
        "placeholder": "0.00 ₽",
        "min": "1000", 
        "step": "0.01"
    }))
    purchase_day = forms.DateTimeField(label="Дата покупки", required=True, widget=forms.TextInput(attrs={
        "id": "purchase_day",
        "name": "purchase_day", 
        "type": "datetime-local"
    }))

    def clean(self):
        cleaned_data = super().clean()
        fn = cleaned_data.get('fn_value')
        fd = cleaned_data.get('fd_value')
        fp = cleaned_data.get('fp_value')

        # Check whether these combo is unique.
        if fn and fd and fp:
            if Receipt.objects.filter(fn_value=fn, fd_value=fd, fp_value=fp).exists():
                raise forms.ValidationError("Чек с такими данными ФН, ФД и ФП уже зарегистрирован.")
        
        return cleaned_data


class UserLoginForm(AuthenticationForm):
    class Meta:
        model = User


class UserSignUpForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')