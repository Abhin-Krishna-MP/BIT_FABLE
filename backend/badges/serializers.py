from rest_framework import serializers
from .models import Badge

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = [
            'id', 'user', 'wallet_address', 'badge_type', 'badge_name', 
            'badge_description', 'transaction_hash', 'status', 'phase_completed',
            'minted_at', 'updated_at'
        ]
        read_only_fields = ['id', 'minted_at', 'updated_at']

class BadgeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = [
            'user', 'wallet_address', 'badge_type', 'badge_name', 
            'badge_description', 'transaction_hash', 'phase_completed'
        ]

class BadgeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['status', 'transaction_hash'] 