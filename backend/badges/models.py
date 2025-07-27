from django.db import models
from django.conf import settings

class Badge(models.Model):
    BADGE_TYPES = [
        ('pitch-master', 'Pitch Master'),
        ('ideation-expert', 'Ideation Expert'),
        ('validation-pro', 'Validation Pro'),
        ('mvp-builder', 'MVP Builder'),
        ('launch-champion', 'Launch Champion'),
        ('feedback-guru', 'Feedback Guru'),
        ('monetization-master', 'Monetization Master'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('minted', 'Minted'),
        ('failed', 'Failed'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='badges')
    wallet_address = models.CharField(max_length=42)  # Ethereum address
    badge_type = models.CharField(max_length=50, choices=BADGE_TYPES)
    badge_name = models.CharField(max_length=100)
    badge_description = models.TextField()
    transaction_hash = models.CharField(max_length=66, blank=True, null=True)  # Ethereum tx hash
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    phase_completed = models.CharField(max_length=50)  # Which phase triggered this badge
    minted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'badge_type']
        ordering = ['-minted_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.badge_name}"
    
    @property
    def is_minted(self):
        return self.status == 'minted'
    
    @property
    def is_pending(self):
        return self.status == 'pending'
    
    @property
    def is_failed(self):
        return self.status == 'failed' 