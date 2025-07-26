from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.conf import settings
import google.generativeai as genai

# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

class ChatbotView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        message = request.data.get("message")
        if not message:
            return Response({"error": "Message is required"}, status=400)

        try:
            # Create a startup-focused prompt
            startup_prompt = f"""
            You are an AI Startup Mentor, an expert in entrepreneurship, startup development, and business strategy. 
            You provide practical, actionable advice to founders and entrepreneurs.
            
            Context: You're helping a startup founder with their question or challenge.
            
            User's question: {message}
            
            Please provide a helpful, practical response that:
            1. Addresses their specific question or challenge
            2. Provides actionable advice when possible
            3. Uses startup terminology and frameworks appropriately
            4. Is encouraging but realistic
            5. Keeps responses concise but informative (2-4 sentences)
            6. Uses emojis sparingly to make responses engaging
            
            Focus on startup-specific advice like:
            - MVP development and validation
            - Customer discovery and market research
            - Funding and fundraising strategies
            - Product-market fit
            - Growth and scaling
            - Team building and leadership
            - Business model development
            - Marketing and customer acquisition
            """
            
            model = genai.GenerativeModel("models/gemini-1.5-flash")
            response = model.generate_content(startup_prompt)
            
            return Response({
                "message": response.text,
                "success": True
            })
            
        except Exception as e:
            print(f"Gemini API Error: {str(e)}")
            # Fallback response if API fails
            fallback_responses = [
                "I'm having trouble connecting right now, but here's a general tip: focus on validating your core hypothesis with real customers before building too much.",
                "Let me get back to you on that. In the meantime, remember that the best startups solve real problems that people are willing to pay for.",
                "I'm experiencing a technical issue. A key startup principle to consider: measure what matters and iterate based on real user feedback."
            ]
            import random
            return Response({
                "message": random.choice(fallback_responses),
                "success": False,
                "error": "API temporarily unavailable"
            }, status=500)
