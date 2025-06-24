document.addEventListener('DOMContentLoaded', function() {
    // Sidebar kontrolü - eğer sidebar yoksa (login sayfası gibi) işlemleri atla
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) {
        return; // Sidebar yoksa, sidebar ile ilgili işlemleri yapma
    }

    const mainContent = document.getElementById('mainContent');
    const navbar = document.querySelector('.navbar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const body = document.body;
    
    // Sidebar durumunu localStorage'dan al
    const sidebarState = localStorage.getItem('sidebarCollapsed');
    if (sidebarState === 'true') {
        body.classList.add('sidebar-collapsed');
    }
    
    // Desktop sidebar toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            body.classList.toggle('sidebar-collapsed');
            
            // Sidebar durumunu localStorage'a kaydet
            localStorage.setItem('sidebarCollapsed', body.classList.contains('sidebar-collapsed'));
            
            // Console'a durum yazdır (debug için)
            console.log('Sidebar collapsed:', body.classList.contains('sidebar-collapsed'));
        });
    }
    
    // Mobil cihazlarda sidebar'ı açmak için
    if (window.innerWidth <= 768) {
        body.classList.add('sidebar-collapsed');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function() {
                body.classList.toggle('sidebar-mobile-open');
            });
        }
        
        // Sidebar dışına tıklandığında kapat
        document.addEventListener('click', function(e) {
            if (sidebar && sidebarToggle && 
                !sidebar.contains(e.target) && 
                !sidebarToggle.contains(e.target)) {
                body.classList.remove('sidebar-mobile-open');
            }
        });
    }
    
    // Pencere boyutu değiştiğinde kontrol et
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            body.classList.add('sidebar-collapsed');
        }
    });
}); 