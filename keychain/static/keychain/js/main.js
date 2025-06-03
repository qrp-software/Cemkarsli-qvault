// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');
  const sidebarOverlay = document.querySelector('.sidebar-overlay');
  
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function() {
      sidebar.classList.toggle('show');
      sidebarOverlay.classList.toggle('show');
    });

    // Close sidebar when clicking overlay
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', function() {
        sidebar.classList.remove('show');
        sidebarOverlay.classList.remove('show');
      });
    }

    // Close sidebar when clicking on a nav link (mobile)
    const navLinks = sidebar.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('show');
          sidebarOverlay.classList.remove('show');
        }
      });
    });
  }

  // Sistem kartlarına tıklama olayı
  const systemCards = document.querySelectorAll('.system-card');
  systemCards.forEach(card => {
    card.addEventListener('click', function(e) {
      // Eğer tıklanan element dropdown menüsü veya dropdown menüsünün içindeki bir element ise
      if (e.target.closest('.dropdown')) {
        return; // İşlemi durdur
      }
      
      // Sistem ID'sini al
      const systemId = this.dataset.systemId;
      
      // Backend'den sistem detaylarını çek
      fetch(`/keychain/get_company_details/${systemId}/`, {
        method: 'GET',
        headers: {
          'X-CSRFToken': getCookie('csrftoken')
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Temel bilgileri doldur
          document.getElementById('detay_sistemAdi').textContent = data.name || '-';
          document.getElementById('detay_sistemNo').textContent = data.number || '-';
          document.getElementById('detay_projeAdi').textContent = data.project_name || '-';
          
          // Sistem tipi badge'ini oluştur
          let sistemTipiBadge = '';
          switch(data.system_type) {
            case 'Database':
              sistemTipiBadge = '<span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill"><i class="fas fa-database me-1"></i>Database</span>';
              break;
            case 'VPN':
              sistemTipiBadge = '<span class="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill"><i class="fas fa-shield-alt me-1"></i>VPN</span>';
              break;
            case 'SERVER':
              sistemTipiBadge = '<span class="badge bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill"><i class="fas fa-server me-1"></i>Server</span>';
              break;
            case 'Application':
              sistemTipiBadge = '<span class="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill"><i class="fas fa-desktop me-1"></i>Application</span>';
              break;
            default:
              sistemTipiBadge = '<span class="badge bg-secondary bg-opacity-10 text-secondary px-3 py-2 rounded-pill"><i class="fas fa-cog me-1"></i>' + data.system_type + '</span>';
          }
          document.getElementById('detay_sistemTipi').innerHTML = sistemTipiBadge;
          
          // Ek bilgileri göster
          showAdditionalInfo(data.additional_info || {}, data.system_type);
          
          // Modalı göster
          const detailModal = new bootstrap.Modal(document.getElementById('sistemDetayModal'));
          detailModal.show();
        } else {
          console.error('Error fetching system details:', data.error);
          alert('Sistem detayları yüklenirken bir hata oluştu: ' + data.error);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Bağlantı hatası: ' + error.message);
      });
    });
  });

  // Proje Düzenle Modal
  const projeDuzenleModal = document.getElementById('projeDuzenleModal');
  if (projeDuzenleModal) {
    projeDuzenleModal.addEventListener('show.bs.modal', function (event) {
      const button = event.relatedTarget;
      const projeId = button.getAttribute('data-id');
      const projeKodu = button.getAttribute('data-code');
      const projeAdi = button.getAttribute('data-name');
      const projeAciklama = button.getAttribute('data-description');
      
      document.getElementById('duzenle_projeId').value = projeId;
      document.getElementById('duzenle_projeKodu').value = projeKodu;
      document.getElementById('duzenle_projeAdi').value = projeAdi;
      document.getElementById('duzenle_projeAciklama').value = projeAciklama;
    });
  }

  // Proje Sil Modal
  const projeSilModal = document.getElementById('projeSilModal');
  if (projeSilModal) {
    projeSilModal.addEventListener('show.bs.modal', function (event) {
      const button = event.relatedTarget;
      const projeId = button.getAttribute('data-id');
      const projeAdi = button.getAttribute('data-name');
      
      document.getElementById('sil_projeId').value = projeId;
      document.getElementById('sil_projeAdi').textContent = projeAdi;
    });
  }

  // Sistem Düzenle Modal
  const sistemDuzenleModal = document.getElementById('sistemDuzenleModal');
  if (sistemDuzenleModal) {
    sistemDuzenleModal.addEventListener('show.bs.modal', function (event) {
      const button = event.relatedTarget;
      const sistemId = button.getAttribute('data-id');
      
      // Backend'den sistem detaylarını çek
      fetch(`/keychain/get_company_details/${sistemId}/`, {
        method: 'GET',
        headers: {
          'X-CSRFToken': getCookie('csrftoken')
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          document.getElementById('duzenle_sistemId').value = data.id;
          document.getElementById('duzenle_sistemAdi').value = data.name;
          document.getElementById('duzenle_sistemNo').value = data.number;
          
          // Proje seçimini set et
          if (data.project_name) {
            const projeSelect = document.getElementById('duzenle_projeAdi');
            for (let option of projeSelect.options) {
              if (option.text === data.project_name) {
                projeSelect.value = option.value;
                break;
              }
            }
          } else {
            document.getElementById('duzenle_projeAdi').value = '';
          }
          
          // Sistem tipini set et
          const sistemTipiMap = {
            'Database': '1',
            'VPN': '2',
            'SERVER': '3',
            'Application': '4'
          };
          const sistemTipiValue = sistemTipiMap[data.system_type] || '0';
          document.getElementById('duzenle_sistemTipi').value = sistemTipiValue;
          
          // Sistem tipine göre alanları göster
          duzenle_sistemTipiDegisti();
          
          // Mevcut ek bilgileri doldur
          const additionalInfo = data.additional_info || {};
          switch(data.system_type) {
            case 'Database':
              document.getElementById('duzenle_dbHost').value = additionalInfo.host || '';
              document.getElementById('duzenle_dbPort').value = additionalInfo.port || '';
              document.getElementById('duzenle_dbKullaniciAdi').value = additionalInfo.username || '';
              document.getElementById('duzenle_dbSifre').value = additionalInfo.password || '';
              break;
            case 'VPN':
              document.getElementById('duzenle_vpnServer').value = additionalInfo.server || '';
              document.getElementById('duzenle_vpnKullaniciAdi').value = additionalInfo.username || '';
              document.getElementById('duzenle_vpnSifre').value = additionalInfo.password || '';
              document.getElementById('duzenle_vpnPort').value = additionalInfo.port || '';
              break;
            case 'SERVER':
              document.getElementById('duzenle_serverIP').value = additionalInfo.ip_address || '';
              document.getElementById('duzenle_serverOS').value = additionalInfo.os || '';
              document.getElementById('duzenle_serverKullaniciAdi').value = additionalInfo.username || '';
              document.getElementById('duzenle_serverSifre').value = additionalInfo.password || '';
              break;
            case 'Application':
              document.getElementById('duzenle_appURL').value = additionalInfo.url || '';
              document.getElementById('duzenle_appVersiyon').value = additionalInfo.version || '';
              document.getElementById('duzenle_appKullaniciAdi').value = additionalInfo.username || '';
              document.getElementById('duzenle_appSifre').value = additionalInfo.password || '';
              break;
          }
        } else {
          console.error('Error fetching system details:', data.error);
          alert('Sistem detayları yüklenirken bir hata oluştu: ' + data.error);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Bağlantı hatası: ' + error.message);
      });
    });
  }

  // Sistem Ekle Modal
  const sistemEkleModal = document.getElementById('sistemEkleModal');
  if (sistemEkleModal) {
    sistemEkleModal.addEventListener('show.bs.modal', function (event) {
      modalTemizle();
    });
  }

  // Sistem Sil Modal
  const sistemSilModal = document.getElementById('sistemSilModal');
  if (sistemSilModal) {
    sistemSilModal.addEventListener('show.bs.modal', function (event) {
      const button = event.relatedTarget;
      const sistemId = button.getAttribute('data-id');
      const sistemAdi = button.getAttribute('data-name');
      
      document.getElementById('sil_sistemId').value = sistemId;
      document.getElementById('sil_sistemAdi').textContent = sistemAdi;
    });
  }

  // Sistem Detay Modal
  const sistemDetayModal = document.getElementById('sistemDetayModal');
  if (sistemDetayModal) {
    sistemDetayModal.addEventListener('show.bs.modal', function (event) {
      const button = event.relatedTarget;
      const sistemId = button.getAttribute('data-id');
      
      // Backend'den sistem detaylarını çek
      fetch(`/keychain/get_company_details/${sistemId}/`, {
        method: 'GET',
        headers: {
          'X-CSRFToken': getCookie('csrftoken')
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Temel bilgileri doldur
          document.getElementById('detay_sistemAdi').textContent = data.name || '-';
          document.getElementById('detay_sistemNo').textContent = data.number || '-';
          document.getElementById('detay_projeAdi').textContent = data.project_name || '-';
          
          // Sistem tipi badge'ini oluştur
          let sistemTipiBadge = '';
          switch(data.system_type) {
            case 'Database':
              sistemTipiBadge = '<span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill"><i class="fas fa-database me-1"></i>Database</span>';
              break;
            case 'VPN':
              sistemTipiBadge = '<span class="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill"><i class="fas fa-shield-alt me-1"></i>VPN</span>';
              break;
            case 'SERVER':
              sistemTipiBadge = '<span class="badge bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill"><i class="fas fa-server me-1"></i>Server</span>';
              break;
            case 'Application':
              sistemTipiBadge = '<span class="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill"><i class="fas fa-desktop me-1"></i>Application</span>';
              break;
            default:
              sistemTipiBadge = '<span class="badge bg-secondary bg-opacity-10 text-secondary px-3 py-2 rounded-pill"><i class="fas fa-cog me-1"></i>' + data.system_type + '</span>';
          }
          document.getElementById('detay_sistemTipi').innerHTML = sistemTipiBadge;
          
          // Ek bilgileri göster
          showAdditionalInfo(data.additional_info || {}, data.system_type);
        } else {
          console.error('Error fetching system details:', data.error);
          alert('Sistem detayları yüklenirken bir hata oluştu: ' + data.error);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Bağlantı hatası: ' + error.message);
      });
    });
  }
});

// Django CSRF token helper
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Sistem Tipi Değiştiğinde
function sistemTipiDegisti() {
  const sistemTipi = document.getElementById('sistemTipi').value;
  
  // Tüm özel alanları gizle
  document.getElementById('vpnAlanlari').style.display = 'none';
  document.getElementById('databaseAlanlari').style.display = 'none';
  document.getElementById('serverAlanlari').style.display = 'none';
  document.getElementById('applicationAlanlari').style.display = 'none';
  
  // Seçilen tipe göre ilgili alanları göster
  switch(sistemTipi) {
    case '1': // Database
      document.getElementById('databaseAlanlari').style.display = 'flex';
      break;
    case '2': // VPN
      document.getElementById('vpnAlanlari').style.display = 'flex';
      break;
    case '3': // Server
      document.getElementById('serverAlanlari').style.display = 'flex';
      break;
    case '4': // Application
      document.getElementById('applicationAlanlari').style.display = 'flex';
      break;
  }
}

// Düzenleme Modal'ı için Sistem Tipi Değiştiğinde
function duzenle_sistemTipiDegisti() {
  const sistemTipi = document.getElementById('duzenle_sistemTipi').value;
  
  // Tüm özel alanları gizle
  document.getElementById('duzenle_vpnAlanlari').style.display = 'none';
  document.getElementById('duzenle_databaseAlanlari').style.display = 'none';
  document.getElementById('duzenle_serverAlanlari').style.display = 'none';
  document.getElementById('duzenle_applicationAlanlari').style.display = 'none';
  
  // Seçilen tipe göre ilgili alanları göster
  switch(sistemTipi) {
    case '1': // Database
      document.getElementById('duzenle_databaseAlanlari').style.display = 'flex';
      break;
    case '2': // VPN
      document.getElementById('duzenle_vpnAlanlari').style.display = 'flex';
      break;
    case '3': // Server
      document.getElementById('duzenle_serverAlanlari').style.display = 'flex';
      break;
    case '4': // Application
      document.getElementById('duzenle_applicationAlanlari').style.display = 'flex';
      break;
  }
}

// Sistem Ekleme İşlemi
function sistemEkle() {
  const projeAdi = document.getElementById('projeAdi');
  const sistemAdi = document.getElementById('sistemAdi');
  const sistemNo = document.getElementById('sistemNo');
  const sistemTipi = document.getElementById('sistemTipi');

  // Elementlerin varlığını kontrol et
  if (!projeAdi || !sistemAdi || !sistemNo || !sistemTipi) {
    console.error('Gerekli form elementleri bulunamadı.');
    alert('Form elementleri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.');
    return;
  }

  // Değerleri al
  const projeAdiValue = projeAdi.value;
  const sistemAdiValue = sistemAdi.value;
  const sistemNoValue = sistemNo.value;
  const sistemTipiValue = sistemTipi.value;

  // Check if fields are empty
  if (!projeAdiValue || !sistemAdiValue || !sistemNoValue || !sistemTipiValue) {
    console.error('Tüm alanlar gereklidir.');
    alert('Lütfen tüm alanları doldurunuz!');
    return;
  }

  // Ek alanları topla
  let ekBilgiler = {};
  
  switch(sistemTipiValue) {
    case '1': // Database
      ekBilgiler = {
        host: document.getElementById('dbHost').value,
        port: document.getElementById('dbPort').value,
        username: document.getElementById('dbKullaniciAdi').value,
        password: document.getElementById('dbSifre').value
      };
      break;
    case '2': // VPN
      ekBilgiler = {
        server: document.getElementById('vpnServer').value,
        username: document.getElementById('vpnKullaniciAdi').value,
        password: document.getElementById('vpnSifre').value,
        port: document.getElementById('vpnPort').value
      };
      break;
    case '3': // Server
      ekBilgiler = {
        ip_address: document.getElementById('serverIP').value,
        os: document.getElementById('serverOS').value,
        username: document.getElementById('serverKullaniciAdi').value,
        password: document.getElementById('serverSifre').value
      };
      break;
    case '4': // Application
      ekBilgiler = {
        url: document.getElementById('appURL').value,
        version: document.getElementById('appVersiyon').value,
        username: document.getElementById('appKullaniciAdi').value,
        password: document.getElementById('appSifre').value
      };
      break;
  }

  console.log('Proje ID:', projeAdiValue);
  console.log('Sistem Adı:', sistemAdiValue);
  console.log('Sistem No:', sistemNoValue);
  console.log('Sistem Tipi:', sistemTipiValue);
  console.log('Ek Bilgiler:', ekBilgiler);

  // AJAX request to add system
  fetch('/keychain/add_company/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify({
      project_id: projeAdiValue,
      name: sistemAdiValue,
      number: sistemNoValue,
      system_type: sistemTipiValue,
      additional_info: ekBilgiler
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('AJAX Response:', data);
    if (data.success) {
      // Sayfayı yenile
      location.reload();
    } else {
      console.error('Error adding system:', data.error || data.errors);
      alert('Sistem eklenirken bir hata oluştu: ' + (data.error || 'Bilinmeyen hata'));
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Bağlantı hatası: ' + error.message);
  });
}

// Sistem Güncelleme İşlemi
function sistemGuncelle() {
  const sistemId = document.getElementById('duzenle_sistemId').value;
  const projeAdi = document.getElementById('duzenle_projeAdi').value;
  const sistemAdi = document.getElementById('duzenle_sistemAdi').value;
  const sistemNo = document.getElementById('duzenle_sistemNo').value;
  const sistemTipi = document.getElementById('duzenle_sistemTipi').value;
  
  // Validation
  if (!projeAdi || !sistemAdi || !sistemNo || !sistemTipi || sistemTipi === '0') {
    alert('Lütfen tüm alanları doldurunuz!');
    return;
  }
  
  // Ek alanları topla
  let ekBilgiler = {};
  
  switch(sistemTipi) {
    case '1': // Database
      ekBilgiler = {
        host: document.getElementById('duzenle_dbHost').value,
        port: document.getElementById('duzenle_dbPort').value,
        username: document.getElementById('duzenle_dbKullaniciAdi').value,
        password: document.getElementById('duzenle_dbSifre').value
      };
      break;
    case '2': // VPN
      ekBilgiler = {
        server: document.getElementById('duzenle_vpnServer').value,
        username: document.getElementById('duzenle_vpnKullaniciAdi').value,
        password: document.getElementById('duzenle_vpnSifre').value,
        port: document.getElementById('duzenle_vpnPort').value
      };
      break;
    case '3': // Server
      ekBilgiler = {
        ip_address: document.getElementById('duzenle_serverIP').value,
        os: document.getElementById('duzenle_serverOS').value,
        username: document.getElementById('duzenle_serverKullaniciAdi').value,
        password: document.getElementById('duzenle_serverSifre').value
      };
      break;
    case '4': // Application
      ekBilgiler = {
        url: document.getElementById('duzenle_appURL').value,
        version: document.getElementById('duzenle_appVersiyon').value,
        username: document.getElementById('duzenle_appKullaniciAdi').value,
        password: document.getElementById('duzenle_appSifre').value
      };
      break;
  }
  
  console.log('Güncelleme:', { id: sistemId, project_id: projeAdi, name: sistemAdi, number: sistemNo, system_type: sistemTipi, additional_info: ekBilgiler });
  
  // AJAX request to update company
  fetch(`/keychain/update_company/${sistemId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify({
      project_id: projeAdi,
      name: sistemAdi,
      number: sistemNo,
      system_type: sistemTipi,
      additional_info: ekBilgiler
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Modal'ı kapat ve sayfayı yenile
      const modal = bootstrap.Modal.getInstance(document.getElementById('sistemDuzenleModal'));
      modal.hide();
      location.reload();
    } else {
      console.error('Error updating system:', data.error);
      alert('Sistem güncellenirken bir hata oluştu: ' + data.error);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Bağlantı hatası: ' + error.message);
  });
}

// Sistem Silme İşlemi
function sistemSil() {
  const sistemId = document.getElementById('sil_sistemId').value;
  
  console.log('Silme:', { id: sistemId });
  
  // AJAX request to delete company
  fetch(`/keychain/delete_company/${sistemId}/`, {
    method: 'DELETE',
    headers: {
      'X-CSRFToken': getCookie('csrftoken')
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Modal'ı kapat ve sayfayı yenile
      const modal = bootstrap.Modal.getInstance(document.getElementById('sistemSilModal'));
      modal.hide();
      location.reload();
    } else {
      console.error('Error deleting system:', data.error);
      alert('Sistem silinirken bir hata oluştu: ' + data.error);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Bağlantı hatası: ' + error.message);
  });
}

// Modal Temizleme Fonksiyonları
function modalTemizle() {
  // Ekleme modal'ını temizle
  document.getElementById('projeAdi').value = '';
  document.getElementById('sistemTipi').value = '';
  document.getElementById('sistemAdi').value = '';
  document.getElementById('sistemNo').value = '';
  
  // Tüm ek alanları temizle ve gizle
  document.getElementById('vpnAlanlari').style.display = 'none';
  document.getElementById('databaseAlanlari').style.display = 'none';
  document.getElementById('serverAlanlari').style.display = 'none';
  document.getElementById('applicationAlanlari').style.display = 'none';
  
  // VPN alanları
  document.getElementById('vpnServer').value = '';
  document.getElementById('vpnKullaniciAdi').value = '';
  document.getElementById('vpnSifre').value = '';
  document.getElementById('vpnPort').value = '';
  
  // Database alanları
  document.getElementById('dbHost').value = '';
  document.getElementById('dbPort').value = '';
  document.getElementById('dbKullaniciAdi').value = '';
  document.getElementById('dbSifre').value = '';
  
  // Server alanları
  document.getElementById('serverIP').value = '';
  document.getElementById('serverOS').value = '';
  document.getElementById('serverKullaniciAdi').value = '';
  document.getElementById('serverSifre').value = '';
  
  // Application alanları
  document.getElementById('appURL').value = '';
  document.getElementById('appVersiyon').value = '';
  document.getElementById('appKullaniciAdi').value = '';
  document.getElementById('appSifre').value = '';
}

// Ek bilgileri gösterme fonksiyonu
function showAdditionalInfo(additionalInfo, sistemTipi) {
  const detayEkBilgilerIcerik = document.getElementById('detay_ekBilgilerIcerik');
  detayEkBilgilerIcerik.innerHTML = '';

  let fieldsToShow = [];
  
  // Sistem tipine göre gösterilecek alanları belirle
  switch(sistemTipi) {
    case 'Database':
      fieldsToShow = [
        { key: 'host', label: 'Host', icon: 'fas fa-server' },
        { key: 'port', label: 'Port', icon: 'fas fa-plug' },
        { key: 'username', label: 'Kullanıcı Adı', icon: 'fas fa-user' },
        { key: 'password', label: 'Şifre', icon: 'fas fa-key' }
      ];
      break;
    case 'VPN':
      fieldsToShow = [
        { key: 'server', label: 'VPN Server', icon: 'fas fa-server' },
        { key: 'port', label: 'Port', icon: 'fas fa-plug' },
        { key: 'username', label: 'Kullanıcı Adı', icon: 'fas fa-user' },
        { key: 'password', label: 'Şifre', icon: 'fas fa-key' }
      ];
      break;
    case 'SERVER':
      fieldsToShow = [
        { key: 'ip_address', label: 'IP Adresi', icon: 'fas fa-network-wired' },
        { key: 'os', label: 'İşletim Sistemi', icon: 'fas fa-desktop' },
        { key: 'username', label: 'Kullanıcı Adı', icon: 'fas fa-user' },
        { key: 'password', label: 'Şifre', icon: 'fas fa-key' }
      ];
      break;
    case 'Application':
      fieldsToShow = [
        { key: 'url', label: 'URL', icon: 'fas fa-link' },
        { key: 'version', label: 'Versiyon', icon: 'fas fa-code-branch' },
        { key: 'username', label: 'Kullanıcı Adı', icon: 'fas fa-user' },
        { key: 'password', label: 'Şifre', icon: 'fas fa-key' }
      ];
      break;
  }

  // Alanları oluştur ve göster
  fieldsToShow.forEach(field => {
    const value = additionalInfo[field.key] || '-';
    
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-6 mb-3';
    
    // Şifre alanı için özel HTML
    if (field.key === 'password') {
      colDiv.innerHTML = `
        <div class="d-flex align-items-center mb-2">
          <i class="${field.icon} text-primary me-2"></i>
          <label class="form-label fw-medium text-muted mb-0">${field.label}</label>
          ${value !== '-' ? `
            <button class="btn btn-outline-primary btn-sm ms-2" onclick="copyToClipboard('field-${field.key}')" title="Kopyala">
              <i class="fas fa-copy"></i>
            </button>
         
          ` : ''}
        </div>
        <div class="bg-white p-3 rounded border d-flex justify-content-between align-items-center">
          <span class="fw-bold text-dark" id="field-${field.key}">••••••••</span>
          <input type="hidden" id="field-${field.key}-value" value="${value}">
             <button class="btn btn-outline-secondary btn-sm ms-2" onclick="togglePasswordVisibility('field-${field.key}')" title="Göster/Gizle">
              <i class="fas fa-eye"></i>
            </button>
        </div>
      `;
    } else {
      colDiv.innerHTML = `
        <div class="d-flex align-items-center mb-2">
          <i class="${field.icon} text-primary me-2"></i>
          <label class="form-label fw-medium text-muted mb-0">${field.label}</label>
          ${value !== '-' ? `<button class="btn btn-outline-primary btn-sm ms-2" onclick="copyToClipboard('field-${field.key}')" title="Kopyala">
            <i class="fas fa-copy"></i>
          </button>` : ''}
        </div>
        <div class="bg-white p-3 rounded border d-flex justify-content-between align-items-center">
          <span class="fw-bold text-dark" id="field-${field.key}">${value}</span>
        </div>
      `;
    }
    
    detayEkBilgilerIcerik.appendChild(colDiv);
  });

  // Ek bilgileri göster
  if (fieldsToShow.length > 0) {
    document.getElementById('detay_ekBilgiler').style.display = 'block';
  }
}

// Şifre görünürlüğünü değiştirme fonksiyonu
function togglePasswordVisibility(fieldId) {
  const displayElement = document.getElementById(fieldId);
  const hiddenInput = document.getElementById(fieldId + '-value');
  const button = event.currentTarget;
  const icon = button.querySelector('i');
  
  if (displayElement.textContent === '••••••••') {
    displayElement.textContent = hiddenInput.value;
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    displayElement.textContent = '••••••••';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

// Kopyalama fonksiyonunu güncelle
function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  let text;
  
  // Eğer şifre alanı ise ve gizli ise, gizli değeri kullan
  if (elementId.includes('password')) {
    const hiddenInput = document.getElementById(elementId + '-value');
    text = hiddenInput.value;
  } else {
    text = element.textContent;
  }
  
  // Modern tarayıcılar için
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showCopySuccess();
    }).catch(err => {
      console.error('Kopyalama hatası:', err);
      fallbackCopyTextToClipboard(text);
    });
  } else {
    // Eski tarayıcılar için fallback
    fallbackCopyTextToClipboard(text);
  }
}

// Fallback kopyalama fonksiyonu
function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Görünmez hale getir
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      showCopySuccess();
    } else {
      console.error('Kopyalama başarısız');
    }
  } catch (err) {
    console.error('Kopyalama hatası:', err);
  }
  
  document.body.removeChild(textArea);
}

// Başarılı kopyalama mesajı
function showCopySuccess() {
  // Toast mesajı oluştur
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = `
    <div class="alert alert-success alert-dismissible fade show position-fixed" style="top: 20px; right: 20px; z-index: 9999;">
      <i class="fas fa-check-circle me-2"></i>
      Panoya kopyalandı!
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // 3 saniye sonra otomatik kaldır
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
}

// Proje Ekle
function projeEkle() {
  const projeKodu = document.getElementById('projeKodu').value;
  const projeAdi = document.getElementById('projeAdi').value;
  const projeAciklama = document.getElementById('projeAciklama').value;

  if (!projeKodu || !projeAdi) {
    alert('Proje kodu ve proje adı zorunludur!');
    return;
  }

  fetch('/keychain/add_project/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify({
      code: projeKodu,
      name: projeAdi,
      description: projeAciklama
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      window.location.reload();
    } else {
      alert('Hata: ' + data.error);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Bağlantı hatası: ' + error.message);
  });
}

// Proje Güncelle
function projeGuncelle() {
  const projeId = document.getElementById('duzenle_projeId').value;
  const projeKodu = document.getElementById('duzenle_projeKodu').value;
  const projeAdi = document.getElementById('duzenle_projeAdi').value;
  const projeAciklama = document.getElementById('duzenle_projeAciklama').value;

  if (!projeKodu || !projeAdi) {
    alert('Proje kodu ve proje adı zorunludur!');
    return;
  }

  fetch(`/keychain/update_project/${projeId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify({
      code: projeKodu,
      name: projeAdi,
      description: projeAciklama
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      window.location.reload();
    } else {
      alert('Hata: ' + data.error);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Bağlantı hatası: ' + error.message);
  });
}

// Proje Sil
function projeSil() {
  const projeId = document.getElementById('sil_projeId').value;

  fetch(`/keychain/delete_project/${projeId}/`, {
    method: 'DELETE',
    headers: {
      'X-CSRFToken': getCookie('csrftoken')
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      window.location.reload();
    } else {
      alert('Hata: ' + data.error);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Bağlantı hatası: ' + error.message);
  });
} 