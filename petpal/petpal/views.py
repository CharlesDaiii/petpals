from django.http import FileResponse, JsonResponse
import os
from django.conf import settings

def index(request):
    # In production (Railway), return API status instead of React build
    if not settings.DEBUG or os.getenv('RAILWAY_ENVIRONMENT'):
        return JsonResponse({
            'status': 'ok',
            'message': 'PetPals API is running',
            'api_endpoints': [
                '/api/',
                '/admin/',
                '/auth/redirect/',
            ]
        })
    
    # In development, try to serve React build
    try:
        index_path = os.path.join(settings.BASE_DIR.parent, 'build', 'index.html')
        if os.path.exists(index_path):
            return FileResponse(open(index_path, 'rb'), content_type='text/html')
        else:
            return JsonResponse({
                'status': 'development',
                'message': 'React build not found. Run "npm run build" in the frontend.'
            })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': f'Error serving index: {str(e)}'
        })
