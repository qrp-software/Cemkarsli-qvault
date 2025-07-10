// Hızlı tarih seçimi fonksiyonları
function setQuickDate(option) {
    const today = new Date();
    const startDateInput = document.querySelector('input[name="start_date"]');
    const endDateInput = document.querySelector('input[name="end_date"]');
    
    let startDate, endDate;
    
    switch(option) {
        case 'today':
            startDate = today;
            endDate = today;
            break;
        case 'yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            startDate = yesterday;
            endDate = yesterday;
            break;
        case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            startDate = weekStart;
            endDate = weekEnd;
            break;
        case 'month':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            startDate = monthStart;
            endDate = monthEnd;
            break;
        case 'last30':
            const last30Start = new Date(today);
            last30Start.setDate(today.getDate() - 30);
            startDate = last30Start;
            endDate = today;
            break;
    }
    
    // Tarih formatını YYYY-MM-DD olarak ayarla
    if (startDate) {
        startDateInput.value = startDate.toISOString().split('T')[0];
    }
    if (endDate) {
        endDateInput.value = endDate.toISOString().split('T')[0];
    }
}

// Cookie alma fonksiyonu
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

// Faaliyet Ekleme
function faaliyetEkle() {
    const form = document.getElementById("faaliyetEkleForm");
    const formData = new FormData();
    
    // Form verilerini topla
    const activityDate = document.getElementById("activityDate").value;
    const projectId = document.getElementById("projectSelect").value;
    const activityName = document.getElementById("activityName").innerHTML; // HTML formatlarını koru
    const isBillable = document.getElementById("isBillable").value;
    const duration = document.getElementById("duration").value;
    const primaryPersonId = document.getElementById("primaryPerson").value;
    const secondaryPersonId = document.getElementById("secondaryPerson").value;
    const activityFiles = document.getElementById("activityFile").files;
    
    // Validasyon - sadece içerik kontrolü için stripHtml kullan
    const textContent = activityName.replace(/<[^>]*>/g, '').trim();
    if (!activityDate || !projectId || !textContent || !duration || !primaryPersonId) {
        alert("Lütfen tüm zorunlu alanları doldurun.");
        return;
    }
    
    // FormData'ya ekle - HTML formatlarını koru
    formData.append('activity_date', activityDate);
    formData.append('project_id', projectId);
    formData.append('activity_name', activityName);
    formData.append('is_billable', isBillable);
    formData.append('duration', duration);
    formData.append('primary_person_id', primaryPersonId);
    if (secondaryPersonId) formData.append('secondary_person_id', secondaryPersonId);
    
    // Birden fazla dosyayı ekle
    for (let i = 0; i < activityFiles.length; i++) {
        formData.append('attachments', activityFiles[i]);
    }
    
    const csrftoken = getCookie('csrftoken');
 
    fetch("/keychain/add_activity/", {
        method: "POST",
        headers: {
            "X-CSRFToken": csrftoken,
        },
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('faaliyetEkleModal'));
            modal.hide();
            form.reset();
            document.getElementById("activityName").innerHTML = '';
            clearFileDisplay('selectedFiles');
            location.reload();
        } else {
            alert(data.error || "Bir hata oluştu.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Bir hata oluştu.");
    });
}

// Faaliyet Güncelleme
function faaliyetGuncelle() {
    const form = document.getElementById("faaliyetDuzenleForm");
    const activityId = document.getElementById("duzenle_faaliyetId").value;
    const formData = new FormData();
    
    // Form verilerini topla
    const activityDate = document.getElementById("duzenle_activityDate").value;
    const projectId = document.getElementById("duzenle_projectSelect").value;
    const activityName = document.getElementById("duzenle_activityName").innerHTML; // HTML formatlarını koru
    const isBillable = document.getElementById("duzenle_isBillable").value;
    const duration = document.getElementById("duzenle_duration").value;
    const primaryPersonId = document.getElementById("duzenle_primaryPerson").value;
    const secondaryPersonId = document.getElementById("duzenle_secondaryPerson").value;
    const activityFiles = document.getElementById("duzenle_activityFile").files;
    
    // Validasyon - sadece içerik kontrolü için stripHtml kullan
    const textContent = activityName.replace(/<[^>]*>/g, '').trim();
    if (!activityDate || !projectId || !textContent || !duration || !primaryPersonId) {
        alert("Lütfen tüm zorunlu alanları doldurun.");
        return;
    }
    
    // FormData'ya ekle - HTML formatlarını koru
    formData.append('activity_date', activityDate);
    formData.append('project_id', projectId);
    formData.append('activity_name', activityName);
    formData.append('is_billable', isBillable);
    formData.append('duration', duration);
    formData.append('primary_person_id', primaryPersonId);
    if (secondaryPersonId) formData.append('secondary_person_id', secondaryPersonId);
    
    // Birden fazla dosyayı ekle
    for (let i = 0; i < activityFiles.length; i++) {
        formData.append('attachments', activityFiles[i]);
    }
    
    const csrftoken = getCookie('csrftoken');
 
    fetch(`/keychain/update_activity/${activityId}/`, {
        method: "POST",
        headers: {
            "X-CSRFToken": csrftoken,
        },
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('faaliyetDuzenleModal'));
            modal.hide();
            location.reload();
        } else {
            alert(data.error || "Güncelleme başarısız.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Bir hata oluştu.");
    });
}

// Faaliyet Silme
function faaliyetSil() {
    const activityId = document.getElementById("sil_faaliyetId").value;
    const csrftoken = getCookie('csrftoken');
    
    fetch(`/keychain/delete_activity/${activityId}/`, {
        method: "DELETE",
        headers: {
            "X-CSRFToken": csrftoken,
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('faaliyetSilModal'));
            modal.hide();
            location.reload();
        } else {
            alert(data.error || "Silme işlemi başarısız.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Bir hata oluştu.");
    });
}

// Silme modalını güncelleme
function updateFaaliyetSilModal(button) {
    const activityId = button.getAttribute('data-id');
    const activityName = button.getAttribute('data-name');
    
    document.getElementById('sil_faaliyetId').value = activityId;
    document.getElementById('sil_faaliyetAdi').textContent = activityName;
}

// Text formatlama fonksiyonları
function formatText(elementId, command) {
    const element = document.getElementById(elementId);
    element.focus();
    
    // Liste komutları için doğru execCommand komutlarını kullan
    let execCommand = command;
    if (command === 'ul') {
        execCommand = 'insertUnorderedList';
    } else if (command === 'ol') {
        execCommand = 'insertOrderedList';
    }
    
    document.execCommand(execCommand, false, null);
}

function clearFormatting(elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = element.innerText;
}

// Mevcut dosyaları yükleme ve gösterme
function loadCurrentAttachments(activityId) {
    const currentFilesDiv = document.getElementById('duzenle_currentFiles');
    const currentFilesList = document.getElementById('duzenle_currentFilesList');
    
    // AJAX ile mevcut dosyaları yükle
    fetch(`/keychain/get_activity_attachments/${activityId}/`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.attachments.length > 0) {
                currentFilesList.innerHTML = '';
                currentFilesDiv.style.display = 'block';
                
                data.attachments.forEach(attachment => {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                    
                    // Dosya ikonu belirleme
                    let iconClass = 'fas fa-file';
                    if (attachment.is_image) {
                        iconClass = 'fas fa-file-image text-info';
                    } else if (attachment.is_pdf) {
                        iconClass = 'fas fa-file-pdf text-danger';
                    } else if (attachment.is_document) {
                        iconClass = 'fas fa-file-word text-primary';
                    }
                    
                    fileItem.innerHTML = `
                        <div class="d-flex align-items-center">
                            <i class="${iconClass} me-2"></i>
                            <div>
                                <div class="fw-medium">${attachment.original_name}</div>
                                <small class="text-muted">${formatFileSize(attachment.file_size)} • ${new Date(attachment.uploaded_at).toLocaleDateString('tr-TR')}</small>
                            </div>
                        </div>
                        <div class="btn-group" role="group">
                            <a href="/keychain/download_attachment/${activityId}/${attachment.id}/" 
                               class="btn btn-sm btn-outline-primary" title="İndir">
                                <i class="fas fa-download"></i>
                            </a>
                            <button type="button" class="btn btn-sm btn-outline-danger" 
                                    onclick="removeCurrentFile(${attachment.id})" title="Sil">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    
                    currentFilesList.appendChild(fileItem);
                });
            } else {
                currentFilesDiv.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Dosyalar yüklenirken hata:', error);
            currentFilesDiv.style.display = 'none';
        });
}

// Mevcut dosyayı kaldırma
function removeCurrentFile(attachmentId) {
    if (confirm('Bu dosyayı kalıcı olarak silmek istediğinizden emin misiniz?')) {
        const csrftoken = getCookie('csrftoken');
        
        fetch(`/keychain/delete_attachment/${attachmentId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrftoken,
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Başarılı silme sonrası dosyaları yeniden yükle
                const activityId = document.getElementById('duzenle_faaliyetId').value;
                loadCurrentAttachments(activityId);
                
                // Success mesajı
                alert('Dosya başarıyla silindi.');
            } else {
                alert(data.error || 'Dosya silinirken hata oluştu.');
            }
        })
        .catch(error => {
            console.error('Dosya silinirken hata:', error);
            alert('Dosya silinirken hata oluştu.');
        });
    }
}

// Tüm checkbox'ları değiştirme
function toggleAllCheckboxes() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.activity-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
    
    updateExportButtons();
}

// Export butonlarını güncelleme
function updateExportButtons() {
    const checkboxes = document.querySelectorAll('.activity-checkbox:checked');
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    const exportPDFBtn = document.getElementById('exportPDFBtn');
    
    if (exportExcelBtn && exportPDFBtn) {
        const hasSelection = checkboxes.length > 0;
        exportExcelBtn.disabled = !hasSelection;
        exportPDFBtn.disabled = !hasSelection;
        
        // Buton metinlerini güncelle
        if (hasSelection) {
            exportExcelBtn.innerHTML = `<i class="fas fa-file-excel me-2"></i>Excel (${checkboxes.length})`;
            exportPDFBtn.innerHTML = `<i class="fas fa-file-pdf me-2"></i>PDF (${checkboxes.length})`;
        } else {
            exportExcelBtn.innerHTML = `<i class="fas fa-file-excel me-2"></i>Excel`;
            exportPDFBtn.innerHTML = `<i class="fas fa-file-pdf me-2"></i>PDF`;
        }
    }
}

// Excel Export işlemi
function exportToExcel() {
    const checkboxes = document.querySelectorAll('.activity-checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert('Lütfen export için en az bir faaliyet seçin.');
        return;
    }
    
    // Loading durumu göster
    const exportBtn = document.getElementById('exportExcelBtn');
    const originalText = exportBtn.innerHTML;
    exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>İşleniyor...';
    exportBtn.disabled = true;
    
    // Form oluştur ve gönder
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/keychain/export_excel/';
    form.style.display = 'none';
    
    // CSRF token ekle
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrfmiddlewaretoken';
    csrfInput.value = getCookie('csrftoken');
    form.appendChild(csrfInput);
    
    // Seçili faaliyet ID'lerini ekle
    checkboxes.forEach(checkbox => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'activity_ids';
        input.value = checkbox.value;
        form.appendChild(input);
    });
    
    document.body.appendChild(form);
    form.submit();
    
    // 3 saniye sonra butonu eski haline çevir
    setTimeout(() => {
        exportBtn.innerHTML = originalText;
        updateExportButtons(); // Checkbox durumuna göre enable/disable yap
        document.body.removeChild(form);
    }, 3000);
}

// PDF Export işlemi  
function exportToPDF() {
    const checkboxes = document.querySelectorAll('.activity-checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert('Lütfen export için en az bir faaliyet seçin.');
        return;
    }
    
    // Loading durumu göster
    const exportBtn = document.getElementById('exportPDFBtn');
    const originalText = exportBtn.innerHTML;
    exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>İşleniyor...';
    exportBtn.disabled = true;
    
    // Form oluştur ve gönder
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/keychain/export_pdf/';
    form.style.display = 'none';
    
    // CSRF token ekle
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrfmiddlewaretoken';
    csrfInput.value = getCookie('csrftoken');
    form.appendChild(csrfInput);
    
    // Seçili faaliyet ID'lerini ekle
    checkboxes.forEach(checkbox => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'activity_ids';
        input.value = checkbox.value;
        form.appendChild(input);
    });
    
    document.body.appendChild(form);
    form.submit();
    
    // 3 saniye sonra butonu eski haline çevir
    setTimeout(() => {
        exportBtn.innerHTML = originalText;
        updateExportButtons(); // Checkbox durumuna göre enable/disable yap
        document.body.removeChild(form);
    }, 3000);
}

// Dosya seçimi gösterme fonksiyonları
function displaySelectedFiles(fileInputId, displayContainerId, fileListId) {
    const fileInput = document.getElementById(fileInputId);
    const displayContainer = document.getElementById(displayContainerId);
    const fileList = document.getElementById(fileListId);
    
    if (fileInput.files.length > 0) {
        fileList.innerHTML = '';
        displayContainer.style.display = 'block';
        
        Array.from(fileInput.files).forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            
            // Dosya ikonu belirleme
            let iconClass = 'fas fa-file';
            if (file.type.startsWith('image/')) {
                iconClass = 'fas fa-file-image text-info';
            } else if (file.type === 'application/pdf') {
                iconClass = 'fas fa-file-pdf text-danger';
            } else if (file.type.includes('word') || file.type.includes('document')) {
                iconClass = 'fas fa-file-word text-primary';
            } else if (file.type.includes('excel') || file.type.includes('sheet')) {
                iconClass = 'fas fa-file-excel text-success';
            }
            
            fileItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="${iconClass} me-2"></i>
                    <div>
                        <div class="fw-medium">${file.name}</div>
                        <small class="text-muted">${formatFileSize(file.size)}</small>
                    </div>
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeFile('${fileInputId}', ${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            fileList.appendChild(fileItem);
        });
    } else {
        displayContainer.style.display = 'none';
    }
}

function clearFileDisplay(displayContainerId) {
    const displayContainer = document.getElementById(displayContainerId);
    if (displayContainer) {
        displayContainer.style.display = 'none';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function removeFile(fileInputId, index) {
    const fileInput = document.getElementById(fileInputId);
    const dt = new DataTransfer();
    
    Array.from(fileInput.files).forEach((file, i) => {
        if (i !== index) {
            dt.items.add(file);
        }
    });
    
    fileInput.files = dt.files;
    
    // Görüntüyü güncelle
    if (fileInputId === 'activityFile') {
        displaySelectedFiles('activityFile', 'selectedFiles', 'fileList');
    } else if (fileInputId === 'duzenle_activityFile') {
        displaySelectedFiles('duzenle_activityFile', 'duzenle_selectedFiles', 'duzenle_fileList');
    }
}

// Sayfa yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', function() {
    const csrftoken = getCookie('csrftoken');
    
    // Export butonlarının başlangıç durumunu ayarla
    updateExportButtons();
    
    // Dosya seçimi event listener'ları
    const activityFileInput = document.getElementById('activityFile');
    if (activityFileInput) {
        activityFileInput.addEventListener('change', function() {
            displaySelectedFiles('activityFile', 'selectedFiles', 'fileList');
        });
    }
    
    const duzenleActivityFileInput = document.getElementById('duzenle_activityFile');
    if (duzenleActivityFileInput) {
        duzenleActivityFileInput.addEventListener('change', function() {
            displaySelectedFiles('duzenle_activityFile', 'duzenle_selectedFiles', 'duzenle_fileList');
        });
    }
    
    // Modal açılırken verileri doldurmak için event listener
    const editModal = document.getElementById('faaliyetDuzenleModal');
    if (editModal) {
        editModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            
            // Button'dan data attribute'larını al
            const activityId = button.getAttribute('data-id');
            const projectId = button.getAttribute('data-project-id');
            const activityName = button.getAttribute('data-activity-name');
            const duration = button.getAttribute('data-duration');
            const isBillable = button.getAttribute('data-is-billable');
            const primaryPersonId = button.getAttribute('data-primary-person-id');
            const secondaryPersonId = button.getAttribute('data-secondary-person-id');
            const activityDate = button.getAttribute('data-activity-date');
            const attachment = button.getAttribute('data-attachment');
            
            // Debug için console'da göster
            console.log('Modal açılıyor - Veriler:', {
                activityId, projectId, activityName, duration, isBillable, 
                primaryPersonId, secondaryPersonId, activityDate, attachment
            });
            
            // HTML entity decode fonksiyonu
            function decodeHtml(html) {
                const txt = document.createElement('textarea');
                txt.innerHTML = html;
                return txt.value;
            }
            
            // Duration değerini normalize et (virgülü noktaya çevir)
            function normalizeDuration(durationStr) {
                if (!durationStr) return '';
                return durationStr.replace(',', '.');
            }
            
            // Modal içindeki form alanlarını doldur
            const faaliyetIdField = document.getElementById('duzenle_faaliyetId');
            const activityDateField = document.getElementById('duzenle_activityDate');
            const projectSelectField = document.getElementById('duzenle_projectSelect');
            const activityNameField = document.getElementById('duzenle_activityName');
            const isBillableField = document.getElementById('duzenle_isBillable');
            const durationField = document.getElementById('duzenle_duration');
            const primaryPersonField = document.getElementById('duzenle_primaryPerson');
            const secondaryPersonField = document.getElementById('duzenle_secondaryPerson');
            
            // Her alanı kontrol et ve değer ata
            if (faaliyetIdField) {
                faaliyetIdField.value = activityId || '';
                console.log('Faaliyet ID set edildi:', activityId);
            }
            
            if (activityDateField) {
                activityDateField.value = activityDate || '';
                console.log('Tarih set edildi:', activityDate);
            }
            
            if (projectSelectField) {
                projectSelectField.value = projectId || '';
                console.log('Proje ID set edildi:', projectId);
            }
            
            if (activityNameField) {
                if (activityName) {
                    activityNameField.innerHTML = decodeHtml(activityName);
                } else {
                    activityNameField.innerHTML = '';
                }
                console.log('Activity name set edildi:', activityName);
            }
            
            if (isBillableField) {
                isBillableField.value = isBillable || 'true';
                console.log('Faturalanabilir set edildi:', isBillable);
            }
            
            if (durationField) {
                const normalizedDuration = normalizeDuration(duration);
                durationField.value = normalizedDuration;
                console.log('Süre set edildi:', duration, '→', normalizedDuration);
            }
            
            if (primaryPersonField) {
                primaryPersonField.value = primaryPersonId || '';
                console.log('Ana kişi set edildi:', primaryPersonId);
            }
            
            if (secondaryPersonField) {
                secondaryPersonField.value = secondaryPersonId || '';
                console.log('İkincil kişi set edildi:', secondaryPersonId);
            }
            
            // Mevcut dosyaları göster (çoklu dosya desteği ile)
            loadCurrentAttachments(activityId);
        });
    }

    // Buton hover efektleri
    const quickButtons = document.querySelectorAll('.btn-outline-primary');
    quickButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Filtre butonu animasyonu
    const filterButton = document.querySelector('button[type="submit"]');
    if (filterButton) {
        filterButton.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
        });
        
        filterButton.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
        });
    }
    
    // Collapse toggle animasyonu
    const collapseElement = document.getElementById('searchFiltersCollapse');
    const toggleIcon = document.querySelector('#toggleIcon i');
    
    if (collapseElement && toggleIcon) {
        collapseElement.addEventListener('show.bs.collapse', function () {
            toggleIcon.style.transform = 'rotate(180deg)';
        });
        
        collapseElement.addEventListener('hide.bs.collapse', function () {
            toggleIcon.style.transform = 'rotate(0deg)';
        });
        
        // İlk yüklemede state kontrolü
        if (collapseElement.classList.contains('show')) {
            toggleIcon.style.transform = 'rotate(180deg)';
        }
    }
    
    // Tarih Filtreleri toggle animasyonu
    const dateCollapseElement = document.getElementById('dateFiltersCollapse');
    const dateToggleIcon = document.querySelector('#dateToggleIcon i');
    
    if (dateCollapseElement && dateToggleIcon) {
        dateCollapseElement.addEventListener('show.bs.collapse', function () {
            dateToggleIcon.style.transform = 'rotate(180deg)';
        });
        
        dateCollapseElement.addEventListener('hide.bs.collapse', function () {
            dateToggleIcon.style.transform = 'rotate(0deg)';
        });
        
        // İlk yüklemede state kontrolü
        if (dateCollapseElement.classList.contains('show')) {
            dateToggleIcon.style.transform = 'rotate(180deg)';
        }
    }
    
    // Toggle header'lara hover efektleri
    const toggleHeaders = document.querySelectorAll('[data-bs-toggle="collapse"]');
    toggleHeaders.forEach(header => {
        if (header) {
            header.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(102, 126, 234, 0.05)';
                this.style.borderRadius = '12px';
                this.style.transition = 'all 0.3s ease';
            });
            
            header.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'transparent';
            });
        }
    });
}); 