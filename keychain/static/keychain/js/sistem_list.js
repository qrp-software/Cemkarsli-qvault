// CSRF token'ı al
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

const csrftoken = getCookie('csrftoken');

// Kart tıklama işleyicisi
function handleCardClick(event, systemId) {
    // Eğer tıklanan element dropdown veya paylaş butonu ise işlemi durdur
    if (event.target.closest('.dropdown') || event.target.closest('.btn-outline-success')) {
        return;
    }
    
    // Sistem detaylarını getir ve modalı aç
    showSystemDetails(systemId);
}

// Sayfa yüklendiğinde kart tıklama olaylarını ayarla
document.addEventListener('DOMContentLoaded', function() {
    // Kart tıklama olaylarını ayarla
    const systemCards = document.querySelectorAll('.system-card');
    systemCards.forEach(card => {
        const systemId = card.getAttribute('data-system-id');
        card.addEventListener('click', function(event) {
            handleCardClick(event, systemId);
        });
    });

    // Detay butonlarına tıklama olaylarını ayarla
    const detailButtons = document.querySelectorAll('[data-bs-target="#sistemDetayModal"]');
    detailButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const systemId = this.getAttribute('data-id');
            if (systemId) {
                showSystemDetails(systemId);
            }
        });
    });

    // Modal kapanma olayını dinle
    const detailModal = document.getElementById('sistemDetayModal');
    if (detailModal) {
        detailModal.addEventListener('hidden.bs.modal', function() {
            // Modal kapandığında içeriği temizle
            document.getElementById('detay_sistemAdi').textContent = '-';
            document.getElementById('detay_sistemNo').textContent = '-';
            document.getElementById('detay_projeAdi').textContent = '-';
            document.getElementById('detay_sistemTipi').textContent = '-';
            const ekBilgilerIcerik = document.getElementById('detay_ekBilgilerIcerik');
            const ekBilgilerDiv = document.getElementById('detay_ekBilgiler');
            if (ekBilgilerIcerik) ekBilgilerIcerik.innerHTML = '';
            if (ekBilgilerDiv) ekBilgilerDiv.style.display = 'none';
        });
    }
});

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const button = input.nextElementSibling;
  const icon = button.querySelector('i');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

// Search input focus effects
document.getElementById('systemSearch').addEventListener('focus', function() {
  this.parentElement.parentElement.classList.add('search-focused');
});

document.getElementById('systemSearch').addEventListener('blur', function() {
  this.parentElement.parentElement.classList.remove('search-focused');
});

// Show/hide clear button
document.getElementById('systemSearch').addEventListener('input', function() {
  const clearButton = document.querySelector('.search-clear');
  clearButton.style.display = this.value ? 'block' : 'none';
});

function clearSearch() {
  const searchInput = document.getElementById('systemSearch');
  searchInput.value = '';
  document.querySelector('.search-clear').style.display = 'none';
  filterSystems();
  searchInput.focus();
}

// Filtreleme ve arama fonksiyonu
document.addEventListener('DOMContentLoaded', function() {
  const filterButtons = document.querySelectorAll('[data-filter]');
  const systemCards = document.querySelectorAll('.system-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Aktif buton stilini güncelle
      filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === 'all') {
          btn.classList.remove('btn-light');
          btn.classList.add('btn-light');
        } else if (btn.getAttribute('data-filter') === 'Database') {
          btn.classList.remove('btn-primary');
          btn.classList.add('btn-primary');
        } else if (btn.getAttribute('data-filter') === 'VPN') {
          btn.classList.remove('btn-success');
          btn.classList.add('btn-success');
        } else if (btn.getAttribute('data-filter') === 'SERVER') {
          btn.classList.remove('btn-warning');
          btn.classList.add('btn-warning');
        } else if (btn.getAttribute('data-filter') === 'Application') {
          btn.classList.remove('btn-info');
          btn.classList.add('btn-info');
        }
      });

      // Seçili butonu aktif yap
      this.classList.add('active');
      if (this.getAttribute('data-filter') === 'all') {
        this.classList.remove('btn-light');
        this.classList.add('btn-light');
      } else if (this.getAttribute('data-filter') === 'Database') {
        this.classList.remove('btn-primary');
        this.classList.add('btn-primary');
      } else if (this.getAttribute('data-filter') === 'VPN') {
        this.classList.remove('btn-success');
        this.classList.add('btn-success');
      } else if (this.getAttribute('data-filter') === 'SERVER') {
        this.classList.remove('btn-warning');
        this.classList.add('btn-warning');
      } else if (this.getAttribute('data-filter') === 'Application') {
        this.classList.remove('btn-info');
        this.classList.add('btn-info');
      }

      filterSystems();
    });
  });
});

function filterSystems() {
  const searchText = document.getElementById('systemSearch').value.toLowerCase();
  const activeFilter = document.querySelector('[data-filter].active').getAttribute('data-filter');
  const systemCards = document.querySelectorAll('.system-card');
  const searchContainer = document.querySelector('.search-container');

  // Add loading animation
  searchContainer.classList.add('searching');
  setTimeout(() => {
    searchContainer.classList.remove('searching');
  }, 300);

  systemCards.forEach(card => {
    const systemType = card.querySelector('.system-type-badge').textContent.trim().toLowerCase();
    const systemName = card.querySelector('.card-title').textContent.toLowerCase();
    const systemNumber = card.querySelector('.text-muted:nth-of-type(2)').textContent.toLowerCase();
    const projectName = card.querySelector('.text-muted:nth-of-type(1)')?.textContent.toLowerCase() || '';

    const matchesFilter = activeFilter === 'all' || systemType.includes(activeFilter.toLowerCase());
    const matchesSearch = systemName.includes(searchText) || 
                        systemNumber.includes(searchText) || 
                        projectName.includes(searchText);

    if (matchesFilter && matchesSearch) {
      card.closest('.col-xl-3').style.display = '';
      card.closest('.col-xl-3').classList.add('fade-in');
    } else {
      card.closest('.col-xl-3').style.display = 'none';
      card.closest('.col-xl-3').classList.remove('fade-in');
    }
  });
}

function sistemPaylas(sistemId, sistemAdi) {
  // Event propagation'ı durdur
  event.preventDefault();
  event.stopPropagation();
  
  // Modal'ı aç
  const paylasModal = new bootstrap.Modal(document.getElementById('sistemPaylasModal'));
  
  // Sistem bilgilerini modal'a aktar
  document.getElementById('paylas_sistemId').value = sistemId;
  
  // Kullanıcı listesini getir
  fetch('/keychain/system/share/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRFToken': csrftoken
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      const select = document.getElementById('ozelKullanicilar');
      select.innerHTML = '';
      data.users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.username;
        select.appendChild(option);
      });
    } else {
      throw new Error(data.error || 'Kullanıcı listesi alınamadı');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Kullanıcı listesi yüklenirken bir hata oluştu: ' + error.message);
  });
  
  // Modal'ı göster
  paylasModal.show();
}

function paylasimiKaydet() {
  const sistemId = document.getElementById('paylas_sistemId').value;
  const erisimTipi = document.querySelector('input[name="erisimTipi"]:checked').value;
  const isPublic = erisimTipi === 'herkes';
  
  let sharedWith = [];
  if (!isPublic) {
    const select = document.getElementById('ozelKullanicilar');
    sharedWith = Array.from(select.selectedOptions).map(option => option.value);
  }
  
  const data = {
    system_id: sistemId,
    is_public: isPublic,
    shared_with: sharedWith
  };
  
  fetch('/keychain/system/share/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRFToken': csrftoken
    },
    body: JSON.stringify(data)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      // Modal'ı kapat
      bootstrap.Modal.getInstance(document.getElementById('sistemPaylasModal')).hide();
      
      // Başarılı bildirimi göster
      const toast = document.createElement('div');
      toast.className = 'position-fixed bottom-0 end-0 p-3';
      toast.style.zIndex = '5';
      toast.innerHTML = `
        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header bg-success text-white">
            <i class="fas fa-check-circle me-2"></i>
            <strong class="me-auto">Başarılı</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div class="toast-body">
            Paylaşım başarıyla oluşturuldu!
          </div>
        </div>
      `;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 3000);

      // Sayfayı yenile
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      throw new Error(data.error || 'Paylaşım oluşturulamadı');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Paylaşım oluşturulurken bir hata oluştu: ' + error.message);
  });
}

// Kullanıcı arama fonksiyonu
function filterUsers() {
  const searchText = document.getElementById('userSearch').value.toLowerCase();
  const select = document.getElementById('ozelKullanicilar');
  const options = select.getElementsByTagName('option');

  for (let option of options) {
    const text = option.text.toLowerCase();
    if (text.includes(searchText)) {
      option.style.display = '';
    } else {
      option.style.display = 'none';
    }
  }
}

// Erişim tipi değiştiğinde kart stillerini güncelle
document.querySelectorAll('input[name="erisimTipi"]').forEach(radio => {
  radio.addEventListener('change', function() {
    const ozelAyarlar = document.getElementById('ozelErisimAyarlari');
    const herkesCard = document.querySelector('#erisimHerkes').closest('.card');
    const ozelCard = document.querySelector('#erisimOzel').closest('.card');
    
    if (this.value === 'ozel') {
      ozelAyarlar.style.display = 'block';
      herkesCard.classList.remove('border-primary');
      ozelCard.classList.add('border-primary');
    } else {
      ozelAyarlar.style.display = 'none';
      ozelCard.classList.remove('border-primary');
      herkesCard.classList.add('border-primary');
    }
  });
});

// Sayfa yüklendiğinde ilk kartı seç
document.addEventListener('DOMContentLoaded', function() {
  const herkesCard = document.querySelector('#erisimHerkes').closest('.card');
  herkesCard.classList.add('border-primary');
});

function showSystemDetails(systemId) {
  if (!systemId) {
    console.error('Geçersiz sistem ID');
    return;
  }

  fetch(`/keychain/get_company_details/${systemId}/`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Temel bilgileri doldur
        document.getElementById('detay_sistemAdi').textContent = data.name;
        document.getElementById('detay_sistemNo').textContent = data.number;
        document.getElementById('detay_projeAdi').textContent = data.project_name || '-';
        document.getElementById('detay_sistemTipi').textContent = data.system_type;

        // Ek bilgileri göster
        const ekBilgilerDiv = document.getElementById('detay_ekBilgiler');
        const ekBilgilerIcerik = document.getElementById('detay_ekBilgilerIcerik');
        ekBilgilerIcerik.innerHTML = '';

        // Sistem tipine göre ek bilgileri göster
        if (data.system_type === 'Database') {
          ekBilgilerIcerik.innerHTML = `
            <div class="col-md-6">
              <label class="form-label fw-medium text-muted">Host</label>
              <button class="btn btn-outline-primary btn-sm ms-2" onclick="copyToClipboard('detay_dbHost')" title="Kopyala">
                <i class="fas fa-copy"></i>
              </button>
              <div class="bg-white p-3 rounded border d-flex justify-content-between align-items-center">
                <p class="mb-0 fw-bold" id="detay_dbHost">${data.host || '-'}</p>
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium text-muted">Port</label>
              <button class="btn btn-outline-primary btn-sm ms-2" onclick="copyToClipboard('detay_dbPort')" title="Kopyala">
                <i class="fas fa-copy"></i>
              </button>
              <div class="bg-white p-3 rounded border d-flex justify-content-between align-items-center">
                <p class="mb-0 fw-bold" id="detay_dbPort">${data.port || '-'}</p>
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium text-muted">Kullanıcı Adı</label>
              <button class="btn btn-outline-primary btn-sm ms-2" onclick="copyToClipboard('detay_dbUsername')" title="Kopyala">
                <i class="fas fa-copy"></i>
              </button>
              <div class="bg-white p-3 rounded border d-flex justify-content-between align-items-center">
                <p class="mb-0 fw-bold" id="detay_dbUsername">${data.username || '-'}</p>
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium text-muted">Şifre</label>
              <button class="btn btn-outline-primary btn-sm ms-2" onclick="copyToClipboard('detay_dbPassword')" title="Kopyala">
                <i class="fas fa-copy"></i>
              </button>
              <div class="bg-white p-3 rounded border d-flex justify-content-between align-items-center">
                <p class="mb-0 fw-bold" id="detay_dbPassword">${data.password || '-'}</p>
              </div>
            </div>
          `;
        } else if (data.system_type === 'VPN') {
          ekBilgilerIcerik.innerHTML = `
            <div class="col-md-6">
              <label class="form-label fw-medium text-muted">Server</label>
              <button class="btn btn-outline-primary btn-sm ms-2" onclick="copyToClipboard('detay_vpnServer')" title="Kopyala">
                <i class="fas fa-copy"></i>
              </button>
              <div class="bg-white p-3 rounded border d-flex justify-content-between align-items-center">
                <p class="mb-0 fw-bold" id="detay_vpnServer">${data.server || '-'}</p>
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium text-muted">Port</label>
              <button class="btn btn-outline-primary btn-sm ms-2" onclick="copyToClipboard('detay_vpnPort')" title="Kopyala">
                <i class="fas fa-copy"></i>
              </button>
              <div class="bg-white p-3 rounded border d-flex justify-content-between align-items-center">
                <p class="mb-0 fw-bold" id="detay_vpnPort">${data.port || '-'}</p>
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium text-muted">Kullanıcı Adı</label>
              <button class="btn btn-outline-primary btn-sm ms-2" onclick="copyToClipboard('detay_vpnUsername')" title="Kopyala">
                <i class="fas fa-copy"></i>
              </button>
              <div class="bg-white p-3 rounded border d-flex justify-content-between align-items-center">
                <p class="mb-0 fw-bold" id="detay_vpnUsername">${data.username || '-'}</p>
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium text-muted">Şifre</label>
              <button class="btn btn-outline-primary btn-sm ms-2" onclick="copyToClipboard('detay_vpnPassword')" title="Kopyala">
                <i class="fas fa-copy"></i>
              </button>
              <div class="bg-white p-3 rounded border d-flex justify-content-between align-items-center">
                <p class="mb-0 fw-bold" id="detay_vpnPassword">${data.password || '-'}</p>
              </div>
            </div>
          `;
        } else if (data.system_type === 'SERVER') {
          ekBilgilerIcerik.innerHTML = `
            <div class="col-md-6">
              <label class="form-label fw-medium text-muted">IP Adresi</label>
              <button class="btn btn-outline-primary btn-sm ms-2" onclick="copyToClipboard('detay_serverIP')" title="Kopyala">
                <i class="fas fa-copy"></i>
              </button>
              <div class="bg-white p-3 rounded border d-flex justify-content-between align-items-center">
                <p class="mb-0 fw-bold" id="detay_serverIP">${data.ip || '-'}</p>
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium text-muted">İşletim Sistemi</label>
              <button class="btn btn-outline-primary btn-sm ms-2" onclick="copyToClipboard('detay_serverOS')" title="Kopyala">
                <i class="fas fa-copy"></i>
              </button>
              <div class="bg-white p-3 rounded border d-flex justify-content-between align-items-center">
                <p class="mb-0 fw-bold" id="detay_serverOS">${data.os || '-'}</p>
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium text-muted">Kullanıcı Adı</label>
              <button class="btn btn-outline-primary btn-sm ms-2" onclick="copyToClipboard('detay_serverUsername')" title="Kopyala">
                <i class="fas fa-copy"></i>
              </button>
              <div class="bg-white p-3 rounded border d-flex justify-content-between align-items-center">
                <p class="mb-0 fw-bold" id="detay_serverUsername">${data.username || '-'}</p>
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium text-muted">Şifre</label>
              <button class="btn btn-outline-primary btn-sm ms-2" onclick="copyToClipboard('detay_serverPassword')" title="Kopyala">
                <i class="fas fa-copy"></i>
              </button>
              <div class="bg-white p-3 rounded border d-flex justify-content-between align-items-center">
                <p class="mb-0 fw-bold" id="detay_serverPassword">${data.password || '-'}</p>
              </div>
            </div>
          `;
        } else if (data.system_type === 'Application') {
          ekBilgilerIcerik.innerHTML = `
            <div class="col-md-6">
              <label class="form-label fw-medium text-muted">URL</label>
              <button class="btn btn-outline-primary btn-sm ms-2" onclick="copyToClipboard('detay_appURL')" title="Kopyala">
                <i class="fas fa-copy"></i>
              </button>
              <div class="bg-white p-3 rounded border d-flex justify-content-between align-items-center">
                <p class="mb-0 fw-bold" id="detay_appURL">${data.url || '-'}</p>
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium text-muted">Versiyon</label>
              <button class="btn btn-outline-primary btn-sm ms-2" onclick="copyToClipboard('detay_appVersion')" title="Kopyala">
                <i class="fas fa-copy"></i>
              </button>
              <div class="bg-white p-3 rounded border d-flex justify-content-between align-items-center">
                <p class="mb-0 fw-bold" id="detay_appVersion">${data.version || '-'}</p>
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium text-muted">Kullanıcı Adı</label>
              <button class="btn btn-outline-primary btn-sm ms-2" onclick="copyToClipboard('detay_appUsername')" title="Kopyala">
                <i class="fas fa-copy"></i>
              </button>
              <div class="bg-white p-3 rounded border d-flex justify-content-between align-items-center">
                <p class="mb-0 fw-bold" id="detay_appUsername">${data.username || '-'}</p>
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium text-muted">Şifre</label>
              <button class="btn btn-outline-primary btn-sm ms-2" onclick="copyToClipboard('detay_appPassword')" title="Kopyala">
                <i class="fas fa-copy"></i>
              </button>
              <div class="bg-white p-3 rounded border d-flex justify-content-between align-items-center">
                <p class="mb-0 fw-bold" id="detay_appPassword">${data.password || '-'}</p>
              </div>
            </div>
          `;
        }

        ekBilgilerDiv.style.display = 'block';
        
        // Modal'ı göster
        const modalElement = document.getElementById('sistemDetayModal');
        const detailModal = new bootstrap.Modal(modalElement, {
          backdrop: 'static',
          keyboard: false
        });

        // Modal kapanma olayını dinle
        modalElement.addEventListener('hidden.bs.modal', function() {
          // Modal kapandığında içeriği temizle
          document.getElementById('detay_sistemAdi').textContent = '-';
          document.getElementById('detay_sistemNo').textContent = '-';
          document.getElementById('detay_projeAdi').textContent = '-';
          document.getElementById('detay_sistemTipi').textContent = '-';
          ekBilgilerIcerik.innerHTML = '';
          ekBilgilerDiv.style.display = 'none';
        }, { once: true });

        detailModal.show();
      } else {
        alert('Sistem detayları alınamadı: ' + data.error);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Sistem detayları alınırken bir hata oluştu!');
    });
} 