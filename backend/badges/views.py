from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Badge
from .serializers import BadgeSerializer, BadgeCreateSerializer, BadgeUpdateSerializer

class BadgeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BadgeSerializer
    
    def get_queryset(self):
        return Badge.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BadgeCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return BadgeUpdateSerializer
        return BadgeSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def user_badges(self, request):
        """Get badges for a specific user"""
        user_id = request.query_params.get('user_id')
        if user_id:
            badges = Badge.objects.filter(user_id=user_id)
        else:
            badges = Badge.objects.filter(user=request.user)
        
        serializer = self.get_serializer(badges, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def types(self, request):
        """Get all available badge types"""
        badge_types = [
            {
                'type': choice[0],
                'name': choice[1],
                'description': self.get_badge_description(choice[0])
            }
            for choice in Badge.BADGE_TYPES
        ]
        return Response(badge_types)
    
    def get_badge_description(self, badge_type):
        descriptions = {
            'pitch-master': 'Awarded for completing the Pitch & Scale phase.',
            'ideation-expert': 'Awarded for completing the Ideation phase.',
            'validation-pro': 'Awarded for completing the Validation phase.',
            'mvp-builder': 'Awarded for completing the MVP phase.',
            'launch-champion': 'Awarded for completing the Launch phase.',
            'feedback-guru': 'Awarded for completing the Feedback & Iterate phase.',
            'monetization-master': 'Awarded for completing the Monetization phase.',
        }
        return descriptions.get(badge_type, 'Achievement badge for completing a phase.')
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update badge status"""
        badge = self.get_object()
        serializer = BadgeUpdateSerializer(badge, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 