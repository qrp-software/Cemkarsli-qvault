import time
from django.contrib.auth import logout
from django.shortcuts import redirect
from django.urls import reverse
from django.contrib import messages


class IdleTimeoutMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Kullanıcı giriş yapmışsa idle timeout kontrolü yap
        if request.user.is_authenticated:
            current_time = time.time()
            last_activity = request.session.get('last_activity', current_time)
            
            # 1 saat = 3600 saniye
            idle_timeout = 3600
            
            # Son aktiviteden bu yana geçen süre
            time_since_last_activity = current_time - last_activity
            
            # Eğer idle timeout süresini aştıysa kullanıcıyı çıkış yaptır
            if time_since_last_activity > idle_timeout:
                logout(request)
                messages.warning(request, "1 saat boyunca hiçbir aktivite olmadığı için otomatik olarak çıkış yapıldınız.")
                return redirect('keychain:login')
            
            # Son aktivite zamanını güncelle
            request.session['last_activity'] = current_time
        
        response = self.get_response(request)
        return response 