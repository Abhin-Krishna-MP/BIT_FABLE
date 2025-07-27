from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator

class User(AbstractUser):
    email = models.EmailField(unique=True)
    level = models.IntegerField(default=1)
    xp = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Custom username field with more permissive validation
    username = models.CharField(
        max_length=150,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9\s@.+\-_]+$',
                message='Username can contain letters, numbers, spaces, and @/./+/-/_ characters.'
            )
        ],
        help_text='Required. 150 characters or fewer. Letters, digits, spaces, and @/./+/-/_ only.'
    )

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

    class Meta:
        db_table = 'auth_user'
