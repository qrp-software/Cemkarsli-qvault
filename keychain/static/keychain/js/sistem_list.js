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
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('systemSearch');
  if (searchInput) {
    searchInput.addEventListener('focus', function() {
      this.parentElement.parentElement.classList.add('search-focused');
    });

    searchInput.addEventListener('blur', function() {
      this.parentElement.parentElement.classList.remove('search-focused');
    });

    searchInput.addEventListener('input', function() {
      const clearButton = document.querySelector('.search-clear');
      if (clearButton) {
        clearButton.style.display = this.value ? 'block' : 'none';
      }
    });
  }
});

function clearSearch() {
  const searchInput = document.getElementById('systemSearch');
  if (searchInput) {
    searchInput.value = '';
    const clearButton = document.querySelector('.search-clear');
    if (clearButton) {
      clearButton.style.display = 'none';
    }
    filterSystems();
    searchInput.focus();
  }
}

// Proje filtreleme fonksiyonu
let currentProjectFilter = 'all';

function filterByProject(projectName) {
  currentProjectFilter = projectName;
  
  // Dropdown butonunun metnini güncelle
  const dropdownButton = document.querySelector('.dropdown[aria-label="Projeler"] button');
  if (dropdownButton) {
    if (projectName === 'all') {
      dropdownButton.innerHTML = `<i class="fas fa-folder me-2"></i>Projeler`;
    } else {
      const dropdownItems = document.querySelectorAll('.dropdown[aria-label="Projeler"] .dropdown-menu .dropdown-item');
      dropdownItems.forEach(item => {
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(projectName)) {
          const text = item.textContent.trim();
          dropdownButton.innerHTML = `<i class="fas fa-folder me-2"></i>${text}`;
        }
      });
    }
  }
  
  // Sistemleri filtrele
  filterSystems();
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
  const searchInput = document.getElementById('systemSearch');
  if (!searchInput) return;
  
  const searchText = searchInput.value.toLowerCase();
  const activeFilterElement = document.querySelector('[data-filter].active');
  const activeFilter = activeFilterElement ? activeFilterElement.getAttribute('data-filter') : 'all';
  const systemCards = document.querySelectorAll('.system-card');
  const searchContainer = document.querySelector('.search-container');

  // Add loading animation
  if (searchContainer) {
    searchContainer.classList.add('searching');
    setTimeout(() => {
      searchContainer.classList.remove('searching');
    }, 300);
  }

  systemCards.forEach(card => {
    const systemTypeElement = card.querySelector('.system-type-badge');
    const systemNameElement = card.querySelector('.card-title');
    const systemNumberElement = card.querySelector('.text-muted:nth-of-type(2)');
    
    if (!systemTypeElement || !systemNameElement || !systemNumberElement) return;
    
    const systemType = systemTypeElement.textContent.trim().toLowerCase();
    const systemName = systemNameElement.textContent.toLowerCase();
    const systemNumber = systemNumberElement.textContent.toLowerCase();
    
    // Proje adını data attribute'dan al
    const projectName = card.getAttribute('data-project-name') || '';
    const actualProjectName = projectName === 'none' ? '' : projectName;

    const matchesFilter = activeFilter === 'all' || systemType.includes(activeFilter.toLowerCase());
    const matchesSearch = systemName.includes(searchText) || 
                        systemNumber.includes(searchText) || 
                        actualProjectName.toLowerCase().includes(searchText);
    const matchesProject = currentProjectFilter === 'all' || actualProjectName.toLowerCase().includes(currentProjectFilter.toLowerCase());

    const cardContainer = card.closest('.col-xl-3');
    if (cardContainer) {
      if (matchesFilter && matchesSearch && matchesProject) {
        cardContainer.style.display = '';
        cardContainer.classList.add('fade-in');
      } else {
        cardContainer.style.display = 'none';
        cardContainer.classList.remove('fade-in');
      }
    }
  });
}

function sistemPaylas(sistemId, sistemAdi) {
  // Event propagation'ı durdur
  event.preventDefault();
  event.stopPropagation();
  
  // Modal'ın var olup olmadığını kontrol et
  const modalElement = document.getElementById('sistemPaylasModal');
  if (!modalElement) {
    console.error('Sistem paylaşım modal\'ı bulunamadı. Yetkiniz olmayabilir.');
    return;
  }
  
  // Modal'ı aç
  const paylasModal = new bootstrap.Modal(modalElement);
  
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
                <p class="mb-0 fw-bold" id="detay_dbPassword">${'*'.repeat(data.password?.length || 0)}</p>
                <input type="hidden" id="detay_dbPassword-value" value="${data.password || '-'}">
                <button class="btn btn-link btn-sm p-0 ms-2" onclick="togglePasswordVisibility('detay_dbPassword', '${data.password || '-'}')">
                  <i class="fas fa-eye"></i>
                </button>
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
                <p class="mb-0 fw-bold" id="detay_vpnPassword">${'*'.repeat(data.password?.length || 0)}</p>
                <input type="hidden" id="detay_vpnPassword-value" value="${data.password || '-'}">
                <button class="btn btn-link btn-sm p-0 ms-2" onclick="togglePasswordVisibility('detay_vpnPassword', '${data.password || '-'}')">
                  <i class="fas fa-eye"></i>
                </button>
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
                <p class="mb-0 fw-bold" id="detay_serverPassword">${'*'.repeat(data.password?.length || 0)}</p>
                <input type="hidden" id="detay_serverPassword-value" value="${data.password || '-'}">
                <button class="btn btn-link btn-sm p-0 ms-2" onclick="togglePasswordVisibility('detay_serverPassword', '${data.password || '-'}')">
                  <i class="fas fa-eye"></i>
                </button>
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
                <p class="mb-0 fw-bold" id="detay_appPassword">${'*'.repeat(data.password?.length || 0)}</p>
                <input type="hidden" id="detay_appPassword-value" value="${data.password || '-'}">
                <button class="btn btn-link btn-sm p-0 ms-2" onclick="togglePasswordVisibility('detay_appPassword', '${data.password || '-'}')">
                  <i class="fas fa-eye"></i>
                </button>
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

// Şifre görünürlüğünü değiştiren fonksiyon
function togglePasswordVisibility(elementId, password) {
  const passwordElement = document.getElementById(elementId);
  const hiddenInput = document.getElementById(elementId + '-value');
  const icon = passwordElement.nextElementSibling.querySelector('i');
  
  if (passwordElement.textContent === password) {
    passwordElement.textContent = '*'.repeat(password.length);
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  } else {
    passwordElement.textContent = password;
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  }
  
  // Gizli input alanının değerini güncelle
  if (hiddenInput) {
    hiddenInput.value = password;
  }
}

// Function to open system detail modal
function openSystemDetail(event, id, name, number, systemType, projectName) {
    // Prevent click if clicking on dropdown or buttons
    if (event.target.closest('.dropdown') || event.target.closest('.btn-group')) {
        return;
    }

    // Use showSystemDetails to get full system information
    showSystemDetails(id);
}

const ClipboardManager = {
    _capabilities: null,
    
    getCapabilities() {
        if (this._capabilities) return this._capabilities;
        
        this._capabilities = {
            modern: !!(navigator.clipboard && window.isSecureContext),
            legacy: !!document.execCommand
        };
        
        return this._capabilities;
    },
    
    async copy(text, element) {
        const caps = this.getCapabilities();
        const sanitizedText = this._sanitizeInput(text);
        
        if (!sanitizedText) {
            this._showFeedback(element, 'error', 'Geçersiz veri');
            return false;
        }
        
        let success = false;
        
        try {
            if (caps.modern) {
                success = await this._tryModern(sanitizedText);
            }
            
            if (!success && caps.legacy) {
                success = this._tryLegacy(sanitizedText);
            }
            
            if (!success) {
                this._showManualCopy(sanitizedText);
                return true;
            }
            
        } catch (error) {
            console.error('Clipboard error:', error);
        }
        
        if (success) {
            this._showFeedback(element, 'success', 'Kopyalandı!');
        } else {
            this._showFeedback(element, 'error', 'Kopyalanamadı');
        }
        
        return success;
    },
    
    async _tryModern(text) {
        try {
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 3000)
            );
            
            await Promise.race([
                navigator.clipboard.writeText(text),
                timeoutPromise
            ]);
            
            return true;
        } catch (error) {
            return false;
        }
    },
    
    _tryLegacy(text) {
        let textarea = null;
        
        try {
            textarea = document.createElement('textarea');
            textarea.value = text;
            
            Object.assign(textarea.style, {
                position: 'fixed',
                top: '-9999px',
                left: '-9999px',
                width: '2em',
                height: '2em',
                padding: '0',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                background: 'transparent',
                opacity: '0',
                pointerEvents: 'none'
            });
            
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            
            if (/iP(ad|od|hone)/.test(navigator.userAgent)) {
                textarea.setSelectionRange(0, 99999);
            }
            
            return document.execCommand('copy');
            
        } catch (error) {
            return false;
        } finally {
            if (textarea?.parentNode) {
                document.body.removeChild(textarea);
            }
        }
    },
    
    _showManualCopy(text) {
        const existing = document.querySelector('.clipboard-manual-modal');
        if (existing) existing.remove();
        
        const modal = document.createElement('div');
        modal.className = 'clipboard-manual-modal';
        modal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5><i class="fas fa-copy me-2"></i>Manuel Kopyalama</h5>
                            <button type="button" class="close-btn" onclick="this.closest('.clipboard-manual-modal').remove()">×</button>
                        </div>
                        <div class="modal-body">
                            <p>Otomatik kopyalama desteklenmiyor. Metni manuel olarak kopyalayın:</p>
                            <textarea readonly class="copy-textarea">${text}</textarea>
                            <div class="copy-instructions">
                                <small><strong>Nasıl kopyalarım?</strong></small>
                                <ul>
                                    <li>Metni seçin (Ctrl+A veya Cmd+A)</li>
                                    <li>Kopyalayın (Ctrl+C veya Cmd+C)</li>
                                </ul>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button onclick="this.closest('.clipboard-manual-modal').remove()" class="btn btn-primary">Tamam</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this._addModalStyles();
        document.body.appendChild(modal);
        
        const textarea = modal.querySelector('.copy-textarea');
        setTimeout(() => {
            textarea.focus();
            textarea.select();
        }, 100);
        
        setTimeout(() => modal.remove(), 30000);
    },
    
    _showFeedback(element, type, message) {
        if (!element) return;
        
        const original = {
            text: element.textContent,
            color: element.style.color,
            background: element.style.backgroundColor
        };
        
        element.textContent = message;
        element.style.color = '#ffffff';
        element.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
        element.style.padding = '4px 8px';
        element.style.borderRadius = '4px';
        element.style.transition = 'all 0.2s ease';
        element.style.fontSize = '0.85em';
        element.style.fontWeight = 'bold';
        
        setTimeout(() => {
            element.textContent = original.text;
            element.style.color = original.color;
            element.style.backgroundColor = original.background;
            element.style.padding = '';
            element.style.borderRadius = '';
            element.style.fontSize = '';
            element.style.fontWeight = '';
        }, 2000);
    },
    
    _sanitizeInput(text) {
        if (!text || typeof text !== 'string') return null;
        return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim().substring(0, 50000);
    },
    
    _addModalStyles() {
        if (document.querySelector('#clipboard-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'clipboard-modal-styles';
        style.textContent = `
            .clipboard-manual-modal .modal-backdrop {
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.6); z-index: 10000;
                display: flex; align-items: center; justify-content: center;
                animation: fadeIn 0.2s ease;
            }
            .clipboard-manual-modal .modal-dialog {
                max-width: 500px; width: 90%; margin: 20px;
            }
            .clipboard-manual-modal .modal-content {
                background: white; border-radius: 8px; overflow: hidden;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                animation: slideIn 0.3s ease;
            }
            .clipboard-manual-modal .modal-header {
                background: #f8f9fa; padding: 15px 20px; border-bottom: 1px solid #dee2e6;
                display: flex; justify-content: space-between; align-items: center;
            }
            .clipboard-manual-modal .close-btn {
                background: none; border: none; font-size: 24px; cursor: pointer;
                color: #6c757d; padding: 0; width: 30px; height: 30px;
            }
            .clipboard-manual-modal .modal-body {
                padding: 20px;
            }
            .clipboard-manual-modal .copy-textarea {
                width: 100%; height: 120px; padding: 12px; border: 2px solid #007bff;
                border-radius: 6px; font-family: monospace; font-size: 14px;
                background: #f8f9fa; resize: none; margin: 10px 0;
            }
            .clipboard-manual-modal .copy-instructions {
                background: #e7f3ff; padding: 12px; border-radius: 6px;
                border-left: 4px solid #007bff; margin-top: 15px;
            }
            .clipboard-manual-modal .copy-instructions ul {
                margin: 8px 0 0 0; padding-left: 20px;
            }
            .clipboard-manual-modal .modal-footer {
                padding: 15px 20px; text-align: right; border-top: 1px solid #dee2e6;
                background: #f8f9fa;
            }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideIn { from { transform: translateY(-50px) scale(0.95); } to { transform: translateY(0) scale(1); } }
        `;
        document.head.appendChild(style);
    }
};

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let text;
    if (elementId.includes('Password')) {
        const hiddenInput = document.getElementById(elementId + '-value');
        text = (hiddenInput?.value && hiddenInput.value !== '-') ? 
               hiddenInput.value : element.textContent;
    } else {
        text = element.textContent;
    }
    
    ClipboardManager.copy(text, element);
}

function showCopySuccess(element) {
    ClipboardManager._showFeedback(element, 'success', 'Kopyalandı!');
}

function showCopyError(element) {
    ClipboardManager._showFeedback(element, 'error', 'Kopyalanamadı');
}

function fallbackCopyTextToClipboard(text, element) {
    const success = ClipboardManager._tryLegacy(text);
    ClipboardManager._showFeedback(element, success ? 'success' : 'error', 
                                  success ? 'Kopyalandı!' : 'Kopyalanamadı');
}

document.addEventListener('DOMContentLoaded', function() {
    ClipboardManager.getCapabilities();
    
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}); 