from django.utils.deprecation import MiddlewareMixin
from django.middleware.csrf import CsrfViewMiddleware

class CsrfExemptMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Exempt API endpoints from CSRF
        if request.path.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
        return None 