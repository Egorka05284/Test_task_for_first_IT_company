from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Receipt(models.Model):

    STATUSES = [
        ("...", "На проверке"),
        ("OK", "Принят"),
        ("NO", "Отклонен"),
        ]
    
    fn_value = models.CharField(max_length=16, verbose_name="ФН")
    fd_value = models.CharField(max_length=5, verbose_name="ФД")
    fp_value = models.CharField(max_length=10, verbose_name="ФП")
    total_sum = models.DecimalField(verbose_name="Сумма чека", decimal_places=2, max_digits=15)
    purchase_day = models.DateTimeField(verbose_name="Дата покупки")
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    status = models.CharField(verbose_name="Статус", choices=STATUSES, default="Being checked")
    registered_at = models.DateTimeField(verbose_name="Дата регистрации", auto_now_add=True, editable=False)
    info = models.CharField(max_length=60, verbose_name="Информация", blank=True)

    class Meta:
        verbose_name_plural = "Чеки"
        verbose_name = "Чек"

        constraints = [
            models.UniqueConstraint(
                fields=['fn_value', 'fd_value', 'fp_value'], 
                name='unique_receipt_fn_fd_fp'
            )
        ]

    def __str__(self):
        return f"Receipt №{self.pk}: {self.fn_value}"
