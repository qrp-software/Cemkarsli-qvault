// CSRF token alma
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

// Toast mesaj fonksiyonları
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} show`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="toast-body d-flex justify-content-between align-items-center">
            <span><i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>${message}</span>
            <button type="button" class="btn-close btn-close-white ms-2" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // 5 saniye sonra otomatik kaldır
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

// Form validasyon fonksiyonları
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(fieldId + '-error');
    
    if (field) {
        field.classList.remove('is-invalid');
    }
    if (errorDiv) {
        errorDiv.classList.remove('show');
    }
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(fieldId + '-error');
    
    if (field) {
        field.classList.add('is-invalid');
    }
    if (errorDiv) {
        if (message) {
            errorDiv.textContent = message;
        }
        errorDiv.classList.add('show');
    }
}

function clearAllErrors(prefix = '') {
    const fields = ['projeSelect', 'sure', 'faaliyetTarihi', 'faaliyetAciklama', 'kisiSelect'];
    fields.forEach(field => {
        clearFieldError(prefix + field);
    });
}

function validateField(fieldId, value, errorMessage) {
    if (!value || value.trim() === '') {
        showFieldError(fieldId, errorMessage);
        return false;
    }
    clearFieldError(fieldId);
    return true;
}

function validateNumberField(fieldId, value, errorMessage) {
    if (!value || isNaN(value) || parseFloat(value) <= 0) {
        showFieldError(fieldId, errorMessage);
        return false;
    }
    clearFieldError(fieldId);
    return true;
}

// Sayfa yüklendiğinde bugünün tarihini set et
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    const faaliyetTarihiInput = document.getElementById('faaliyetTarihi');
    if (faaliyetTarihiInput) {
        faaliyetTarihiInput.value = today;
    }
});

// Tarih filtreleme fonksiyonları
function applyDateFilter() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate && !endDate) {
        showToast('Lütfen en az bir tarih seçiniz!', 'error');
        return;
    }
    
    const url = new URL(window.location);
    if (startDate) url.searchParams.set('start_date', startDate);
    if (endDate) url.searchParams.set('end_date', endDate);
    
    window.location.href = url.toString();
}

function clearDateFilter() {
    const url = new URL(window.location);
    url.searchParams.delete('start_date');
    url.searchParams.delete('end_date');
    window.location.href = url.toString();
}

function setTodayFilter() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
    document.getElementById('endDate').value = today;
    applyDateFilter();
}

function setWeekFilter() {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    document.getElementById('startDate').value = monday.toISOString().split('T')[0];
    document.getElementById('endDate').value = sunday.toISOString().split('T')[0];
    applyDateFilter();
}

function setMonthFilter() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    document.getElementById('startDate').value = firstDay.toISOString().split('T')[0];
    document.getElementById('endDate').value = lastDay.toISOString().split('T')[0];
    applyDateFilter();
}

// Modern collapse animations
document.addEventListener('DOMContentLoaded', function() {
    const collapseElement = document.getElementById('dateFilterCollapse');
    const chevronIcon = document.querySelector('.chevron-container .fa-chevron-down');
    const filterCard = document.querySelector('.modern-filter-card');
    
    if (chevronIcon && collapseElement) {
        collapseElement.addEventListener('show.bs.collapse', function () {
            chevronIcon.style.transform = 'rotate(180deg)';
            filterCard.style.borderColor = 'rgba(13, 110, 253, 0.3)';
        });
        
        collapseElement.addEventListener('hide.bs.collapse', function () {
            chevronIcon.style.transform = 'rotate(0deg)';
            filterCard.style.borderColor = 'rgba(13, 110, 253, 0.1)';
        });
    }
});

// Faaliyet Ekleme
function faaliyetEkle() {
    // Hata mesajlarını temizle
    clearAllErrors();
    
    const projeId = document.getElementById('projeSelect').value;
    const sure = document.getElementById('sure').value;
    const faaliyetAciklama = document.getElementById('faaliyetAciklama').value;
    const faaliyetTarihi = document.getElementById('faaliyetTarihi').value;
    const faturlanabilirlik = document.getElementById('faturlanabilirlik').value;
    const kisiId = document.getElementById('kisiSelect').value;
    const ikincilKisiId = document.getElementById('ikincilKisiSelect').value;

    // Her alanı tek tek kontrol et
    let isValid = true;
    
    if (!validateField('projeSelect', projeId, 'Lütfen bir proje seçiniz.')) {
        isValid = false;
    }
    
    if (!validateNumberField('sure', sure, 'Lütfen geçerli bir süre giriniz.')) {
        isValid = false;
    }
    
    if (!validateField('faaliyetTarihi', faaliyetTarihi, 'Lütfen faaliyet tarihini seçiniz.')) {
        isValid = false;
    }
    
    if (!validateField('faaliyetAciklama', faaliyetAciklama, 'Lütfen faaliyet açıklamasını giriniz.')) {
        isValid = false;
    }
    
    if (!validateField('kisiSelect', kisiId, 'Lütfen bir kişi seçiniz.')) {
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }

    const data = {
        project_id: projeId,
        activity_description: faaliyetAciklama,
        duration: parseFloat(sure),
        activity_date: faaliyetTarihi,
        is_billable: faturlanabilirlik,
        primary_person_id: kisiId,
        secondary_person_id: ikincilKisiId || null
    };

    // Loading durumu
    const saveButton = document.querySelector('#faaliyetEkleModal .btn-primary');
    const originalText = saveButton.innerHTML;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Kaydediliyor...';
    saveButton.disabled = true;

    fetch('/keychain/add_activity/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('✅ Faaliyet başarıyla eklendi!', 'success');
            // Modal'ı kapat
            const modal = bootstrap.Modal.getInstance(document.getElementById('faaliyetEkleModal'));
            modal.hide();
            // Formu temizle
            document.querySelector('#faaliyetEkleModal form').reset();
            clearAllErrors();
            // Sayfayı yenile
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            showToast('❌ Hata: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('❌ Beklenmedik bir hata oluştu!', 'error');
    })
    .finally(() => {
        // Loading durumunu kaldır
        saveButton.innerHTML = originalText;
        saveButton.disabled = false;
    });
}

// Faaliyet Detaylarını Yükleme
function loadActivityDetails(activityId) {
    fetch(`/keychain/get_activity_details/${activityId}/`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('duzenle_faaliyetId').value = data.id;
            document.getElementById('duzenle_projeSelect').value = data.project_id;
            document.getElementById('duzenle_sure').value = data.duration;
            document.getElementById('duzenle_faaliyetAciklama').value = data.activity_description;
            document.getElementById('duzenle_faaliyetTarihi').value = data.activity_date;
            document.getElementById('duzenle_faturlanabilirlik').value = data.is_billable;
            document.getElementById('duzenle_kisiSelect').value = data.primary_person_id;
            document.getElementById('duzenle_ikincilKisiSelect').value = data.secondary_person_id || '';
            // Hata mesajlarını temizle
            clearAllErrors('duzenle_');
        } else {
            showToast('❌ Faaliyet detayları yüklenemedi: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('❌ Faaliyet detayları yüklenirken hata oluştu!', 'error');
    });
}

// Faaliyet Güncelleme
function faaliyetGuncelle() {
    // Hata mesajlarını temizle
    clearAllErrors('duzenle_');
    
    const faaliyetId = document.getElementById('duzenle_faaliyetId').value;
    const projeId = document.getElementById('duzenle_projeSelect').value;
    const sure = document.getElementById('duzenle_sure').value;
    const faaliyetAciklama = document.getElementById('duzenle_faaliyetAciklama').value;
    const faaliyetTarihi = document.getElementById('duzenle_faaliyetTarihi').value;
    const faturlanabilirlik = document.getElementById('duzenle_faturlanabilirlik').value;
    const kisiId = document.getElementById('duzenle_kisiSelect').value;
    const ikincilKisiId = document.getElementById('duzenle_ikincilKisiSelect').value;

    // Her alanı tek tek kontrol et
    let isValid = true;
    
    if (!validateField('duzenle_projeSelect', projeId, 'Lütfen bir proje seçiniz.')) {
        isValid = false;
    }
    
    if (!validateNumberField('duzenle_sure', sure, 'Lütfen geçerli bir süre giriniz.')) {
        isValid = false;
    }
    
    if (!validateField('duzenle_faaliyetTarihi', faaliyetTarihi, 'Lütfen faaliyet tarihini seçiniz.')) {
        isValid = false;
    }
    
    if (!validateField('duzenle_faaliyetAciklama', faaliyetAciklama, 'Lütfen faaliyet açıklamasını giriniz.')) {
        isValid = false;
    }
    
    if (!validateField('duzenle_kisiSelect', kisiId, 'Lütfen bir kişi seçiniz.')) {
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }

    const data = {
        project_id: projeId,
        activity_description: faaliyetAciklama,
        duration: parseFloat(sure),
        activity_date: faaliyetTarihi,
        is_billable: faturlanabilirlik,
        primary_person_id: kisiId,
        secondary_person_id: ikincilKisiId || ''
    };

    // Loading durumu
    const updateButton = document.querySelector('#faaliyetDuzenleModal .btn-primary');
    const originalText = updateButton.innerHTML;
    updateButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Güncelleniyor...';
    updateButton.disabled = true;

    fetch(`/keychain/update_activity/${faaliyetId}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('✅ Faaliyet başarıyla güncellendi!', 'success');
            // Modal'ı kapat
            const modal = bootstrap.Modal.getInstance(document.getElementById('faaliyetDuzenleModal'));
            modal.hide();
            clearAllErrors('duzenle_');
            // Sayfayı yenile
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            showToast('❌ Hata: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('❌ Beklenmedik bir hata oluştu!', 'error');
    })
    .finally(() => {
        // Loading durumunu kaldır
        updateButton.innerHTML = originalText;
        updateButton.disabled = false;
    });
}

// Faaliyet Düzenle Modal
document.addEventListener('DOMContentLoaded', function() {
    const faaliyetDuzenleModal = document.getElementById('faaliyetDuzenleModal');
    if (faaliyetDuzenleModal) {
        faaliyetDuzenleModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            const activityId = button.getAttribute('data-activity-id');
            
            if (activityId) {
                loadActivityDetails(activityId);
            }
        });
        
        // Modal kapandığında hata mesajlarını temizle
        faaliyetDuzenleModal.addEventListener('hidden.bs.modal', function () {
            clearAllErrors('duzenle_');
        });
    }
    
    // Faaliyet Ekle Modal'ı için de aynı işlemi yap
    const faaliyetEkleModal = document.getElementById('faaliyetEkleModal');
    if (faaliyetEkleModal) {
        faaliyetEkleModal.addEventListener('hidden.bs.modal', function () {
            clearAllErrors();
        });
    }
});

// Faaliyet Silme Modal
document.addEventListener('DOMContentLoaded', function() {
    const faaliyetSilModal = document.getElementById('faaliyetSilModal');
    if (faaliyetSilModal) {
        faaliyetSilModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            const faaliyetId = button.getAttribute('data-id');
            const faaliyetAciklama = button.getAttribute('data-description');
            
            document.getElementById('sil_faaliyetId').value = faaliyetId;
            document.getElementById('sil_faaliyetAciklama').textContent = faaliyetAciklama;
        });
    }
});

// Faaliyet Silme 
function faaliyetSil() {
    const faaliyetId = document.getElementById('sil_faaliyetId').value;
    
    // Loading durumu
    const deleteButton = document.querySelector('#faaliyetSilModal .btn-danger');
    const originalText = deleteButton.innerHTML;
    deleteButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Siliniyor...';
    deleteButton.disabled = true;
    
    fetch(`/keychain/delete_activity/${faaliyetId}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrftoken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('✅ Faaliyet başarıyla silindi!', 'success');
            // Modal'ı kapat
            const modal = bootstrap.Modal.getInstance(document.getElementById('faaliyetSilModal'));
            modal.hide();
            // Sayfayı yenile
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            showToast('❌ Hata: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('❌ Beklenmedik bir hata oluştu!', 'error');
    })
    .finally(() => {
        // Loading durumunu kaldır
        deleteButton.innerHTML = originalText;
        deleteButton.disabled = false;
    });
} 