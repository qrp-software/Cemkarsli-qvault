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
    
    if (startDate) {
        startDateInput.value = startDate.toISOString().split('T')[0];
    }
    if (endDate) {
        endDateInput.value = endDate.toISOString().split('T')[0];
    }
}

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

function faaliyetEkle() {
    const form = document.getElementById("faaliyetEkleForm");
    const formData = new FormData();
    
    const activityDate = document.getElementById("activityDate").value;
    const projectId = document.getElementById("projectSelect").value;
    const activityName = document.getElementById("activityName").innerHTML;
    const isBillable = document.getElementById("isBillable").value;
    const duration = document.getElementById("duration").value;
    const primaryPersonId = document.getElementById("primaryPerson").value;
    const secondaryPersonId = document.getElementById("secondaryPerson").value;
    const activityFiles = document.getElementById("activityFile").files;
    
    const textContent = activityName.replace(/<[^>]*>/g, '').trim();
    if (!activityDate || !projectId || !textContent || !duration || !primaryPersonId) {
        alert("Lütfen tüm zorunlu alanları doldurun.");
        return;
    }
    
    formData.append('activity_date', activityDate);
    formData.append('project_id', projectId);
    formData.append('activity_name', activityName);
    formData.append('is_billable', isBillable);
    formData.append('duration', duration);
    formData.append('primary_person_id', primaryPersonId);
    if (secondaryPersonId) formData.append('secondary_person_id', secondaryPersonId);
    
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

function faaliyetGuncelle() {
    const form = document.getElementById("faaliyetDuzenleForm");
    const activityId = document.getElementById("duzenle_faaliyetId").value;
    const formData = new FormData();
    
    const activityDate = document.getElementById("duzenle_activityDate").value;
    const projectId = document.getElementById("duzenle_projectSelect").value;
    const activityName = document.getElementById("duzenle_activityName").innerHTML;
    const isBillable = document.getElementById("duzenle_isBillable").value;
    const isProcessed = document.getElementById("duzenle_isProcessed").value;
    const isPaid = document.getElementById("duzenle_isPaid").value;
    const duration = document.getElementById("duzenle_duration").value;
    const primaryPersonId = document.getElementById("duzenle_primaryPerson").value;
    const secondaryPersonId = document.getElementById("duzenle_secondaryPerson").value;
    const activityFiles = document.getElementById("duzenle_activityFile").files;
    
    const textContent = activityName.replace(/<[^>]*>/g, '').trim();
    if (!activityDate || !projectId || !textContent || !duration || !primaryPersonId) {
        alert("Lütfen tüm zorunlu alanları doldurun.");
        return;
    }
    
    formData.append('activity_date', activityDate);
    formData.append('project_id', projectId);
    formData.append('activity_name', activityName);
    formData.append('is_billable', isBillable);
    formData.append('is_processed', isProcessed);
    formData.append('is_paid', isPaid);
    formData.append('duration', duration);
    formData.append('primary_person_id', primaryPersonId);
    if (secondaryPersonId) formData.append('secondary_person_id', secondaryPersonId);
    
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

function updateFaaliyetSilModal(button) {
    const activityId = button.getAttribute('data-id');
    const activityName = button.getAttribute('data-name');
    
    document.getElementById('sil_faaliyetId').value = activityId;
    document.getElementById('sil_faaliyetAdi').textContent = activityName;
}

function formatText(elementId, command) {
    const element = document.getElementById(elementId);
    element.focus();
    
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

function loadCurrentAttachments(activityId) {
    const currentFilesDiv = document.getElementById('duzenle_currentFiles');
    const currentFilesList = document.getElementById('duzenle_currentFilesList');
    
    fetch(`/keychain/get_activity_attachments/${activityId}/`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.attachments.length > 0) {
                currentFilesList.innerHTML = '';
                currentFilesDiv.style.display = 'block';
                
                data.attachments.forEach(attachment => {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                    
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
                const activityId = document.getElementById('duzenle_faaliyetId').value;
                loadCurrentAttachments(activityId);
                
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

function toggleAllCheckboxes() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.activity-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
    
    updateExportButtons();
}

function updateExportButtons() {
    const checkboxes = document.querySelectorAll('.activity-checkbox:checked');
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    const exportPDFBtn = document.getElementById('exportPDFBtn');
    
    if (exportExcelBtn && exportPDFBtn) {
        const hasSelection = checkboxes.length > 0;
        exportExcelBtn.disabled = !hasSelection;
        exportPDFBtn.disabled = !hasSelection;
        
        if (hasSelection) {
            exportExcelBtn.innerHTML = `<i class="fas fa-file-excel me-2"></i>Excel (${checkboxes.length})`;
            exportPDFBtn.innerHTML = `<i class="fas fa-file-pdf me-2"></i>PDF (${checkboxes.length})`;
        } else {
            exportExcelBtn.innerHTML = `<i class="fas fa-file-excel me-2"></i>Excel`;
            exportPDFBtn.innerHTML = `<i class="fas fa-file-pdf me-2"></i>PDF`;
        }
    }
}

function exportToExcel() {
    const checkboxes = document.querySelectorAll('.activity-checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert('Lütfen export için en az bir faaliyet seçin.');
        return;
    }
    
    const exportBtn = document.getElementById('exportExcelBtn');
    const originalText = exportBtn.innerHTML;
    exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>İşleniyor...';
    exportBtn.disabled = true;
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/keychain/export_excel/';
    form.style.display = 'none';
    
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrfmiddlewaretoken';
    csrfInput.value = getCookie('csrftoken');
    form.appendChild(csrfInput);
    
    checkboxes.forEach(checkbox => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'activity_ids';
        input.value = checkbox.value;
        form.appendChild(input);
    });
    
    document.body.appendChild(form);
    form.submit();
    
    setTimeout(() => {
        exportBtn.innerHTML = originalText;
        updateExportButtons();
        document.body.removeChild(form);
    }, 3000);
}

function exportToPDF() {
    const checkboxes = document.querySelectorAll('.activity-checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert('Lütfen export için en az bir faaliyet seçin.');
        return;
    }
    
    const exportBtn = document.getElementById('exportPDFBtn');
    const originalText = exportBtn.innerHTML;
    exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>İşleniyor...';
    exportBtn.disabled = true;
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/keychain/export_pdf/';
    form.style.display = 'none';
    
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrfmiddlewaretoken';
    csrfInput.value = getCookie('csrftoken');
    form.appendChild(csrfInput);
    
    checkboxes.forEach(checkbox => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'activity_ids';
        input.value = checkbox.value;
        form.appendChild(input);
    });
    
    document.body.appendChild(form);
    form.submit();
    
    setTimeout(() => {
        exportBtn.innerHTML = originalText;
        updateExportButtons();
        document.body.removeChild(form);
    }, 3000);
}

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

document.addEventListener('DOMContentLoaded', function() {
    const csrftoken = getCookie('csrftoken');
    
    updateExportButtons();
    
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
    
    const addModal = document.getElementById('faaliyetEkleModal');
    if (addModal) {
        addModal.addEventListener('show.bs.modal', function (event) {
            const today = new Date();
            const activityDateInput = document.getElementById('activityDate');
            if (activityDateInput) {
                activityDateInput.value = today.toISOString().split('T')[0];
            }
        });
    }
    
    const editModal = document.getElementById('faaliyetDuzenleModal');
    if (editModal) {
        editModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            
            const activityId = button.getAttribute('data-id');
            const projectId = button.getAttribute('data-project-id');
            const activityName = button.getAttribute('data-activity-name');
            const duration = button.getAttribute('data-duration');
            const isBillable = button.getAttribute('data-is-billable');
            const isProcessed = button.getAttribute('data-is-processed');
            const isPaid = button.getAttribute('data-is-paid');
            const primaryPersonId = button.getAttribute('data-primary-person-id');
            const secondaryPersonId = button.getAttribute('data-secondary-person-id');
            const activityDate = button.getAttribute('data-activity-date');
            const attachment = button.getAttribute('data-attachment');
            
            console.log('Modal açılıyor - Veriler:', {
                activityId, projectId, activityName, duration, isBillable, isProcessed, isPaid,
                primaryPersonId, secondaryPersonId, activityDate, attachment
            });
            
            function decodeHtml(html) {
                const txt = document.createElement('textarea');
                txt.innerHTML = html;
                return txt.value;
            }
            
            function normalizeDuration(durationStr) {
                if (!durationStr) return '';
                return durationStr.replace(',', '.');
            }
            
            const faaliyetIdField = document.getElementById('duzenle_faaliyetId');
            const activityDateField = document.getElementById('duzenle_activityDate');
            const projectSelectField = document.getElementById('duzenle_projectSelect');
            const activityNameField = document.getElementById('duzenle_activityName');
            const isBillableField = document.getElementById('duzenle_isBillable');
            const isProcessedField = document.getElementById('duzenle_isProcessed');
            const isPaidField = document.getElementById('duzenle_isPaid');
            const durationField = document.getElementById('duzenle_duration');
            const primaryPersonField = document.getElementById('duzenle_primaryPerson');
            const secondaryPersonField = document.getElementById('duzenle_secondaryPerson');
            
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
            
            if (isProcessedField) {
                isProcessedField.value = isProcessed || 'true';
                console.log('İşlenme durumu set edildi:', isProcessed);
            }
            
            if (isPaidField) {
                isPaidField.value = isPaid || 'true';
                console.log('Ödeme durumu set edildi:', isPaid);
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
            
            loadCurrentAttachments(activityId);
        });
    }

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
    
    const collapseElement = document.getElementById('searchFiltersCollapse');
    const toggleIcon = document.querySelector('#toggleIcon i');
    
    if (collapseElement && toggleIcon) {
        collapseElement.addEventListener('show.bs.collapse', function () {
            toggleIcon.style.transform = 'rotate(180deg)';
        });
        
        collapseElement.addEventListener('hide.bs.collapse', function () {
            toggleIcon.style.transform = 'rotate(0deg)';
        });
        
        if (collapseElement.classList.contains('show')) {
            toggleIcon.style.transform = 'rotate(180deg)';
        }
    }
    
    const dateCollapseElement = document.getElementById('dateFiltersCollapse');
    const dateToggleIcon = document.querySelector('#dateToggleIcon i');
    
    if (dateCollapseElement && dateToggleIcon) {
        dateCollapseElement.addEventListener('show.bs.collapse', function () {
            dateToggleIcon.style.transform = 'rotate(180deg)';
        });
        
        dateCollapseElement.addEventListener('hide.bs.collapse', function () {
            dateToggleIcon.style.transform = 'rotate(0deg)';
        });
        
        if (dateCollapseElement.classList.contains('show')) {
            dateToggleIcon.style.transform = 'rotate(180deg)';
        }
    }
    
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