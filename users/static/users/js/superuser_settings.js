// 🚀 ULTRA MODERN ADMIN PANEL JAVASCRIPT

class ModernAdminPanel {
    constructor() {
        this.init();
    }

    init() {
        if (typeof bootstrap === 'undefined') {
            console.error('⚠️ Bootstrap bulunamadı!');
            return;
        }

        this.bindEvents();
        this.addModernEffects();
        console.log('✨ Modern Admin Panel başlatıldı!');
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-user-btn')) {
                e.preventDefault();
                const button = e.target.closest('.edit-user-btn');
                const userId = button.getAttribute('data-user-id');
                this.editUser(userId);
            }
            
            if (e.target.closest('.delete-user-btn')) {
                e.preventDefault();
                const button = e.target.closest('.delete-user-btn');
                const userId = button.getAttribute('data-user-id');
                const username = button.getAttribute('data-username');
                this.deleteUser(userId, username);
            }
        });
    }

    addModernEffects() {
        document.querySelectorAll('.admin-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    editUser(userId) {
        console.log('🔧 Kullanıcı düzenleniyor:', userId);
        
        const modalElement = document.getElementById('editUserModal');
        if (!modalElement) {
            console.error('❌ Modal element bulunamadı!');
            this.showAlert('Modal bulunamadı!', 'danger');
            return;
        }

        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        this.showModalLoading(true);
        this.showModalForm(false);
        
        fetch(`/users/api/user/${userId}/permissions/`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': this.getCSRFToken(),
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                this.populateEditForm(data.user, userId);
                this.showModalLoading(false);
                this.showModalForm(true);
                this.showAlert(`✅ ${data.user.username} kullanıcısı yüklendi`, 'success');
            } else {
                modal.hide();
                this.showAlert('❌ Kullanıcı bilgileri yüklenemedi: ' + (data.error || 'Bilinmeyen hata'), 'danger');
            }
        })
        .catch(error => {
            console.error('🚨 API Hatası:', error);
            modal.hide();
            this.showAlert('❌ Kullanıcı bilgileri yüklenirken hata oluştu: ' + error.message, 'danger');
        });
    }

    populateEditForm(user, userId) {
        const titleElement = document.getElementById('editModalTitle');
        if (titleElement) {
            titleElement.textContent = `${user.username} - Kullanıcı Yetkilerini Düzenle`;
        }
        
        const userIdInput = document.getElementById('editUserId');
        if (userIdInput) {
            userIdInput.value = userId;
        }
        
        const checkboxes = [
            { id: 'editIsSuperuser', value: user.is_superuser },
            { id: 'editIsStaff', value: user.is_staff },
            { id: 'editCanShareSystems', value: user.can_share_systems },
            { id: 'editIsActive', value: user.is_active }
        ];
        
        checkboxes.forEach((checkbox) => {
            const element = document.getElementById(checkbox.id);
            if (element) {
                element.checked = checkbox.value;
            }
        });
    }

    saveUserPermissions() {
        const userId = document.getElementById('editUserId').value;
        const data = {
            is_superuser: document.getElementById('editIsSuperuser').checked,
            is_staff: document.getElementById('editIsStaff').checked,
            can_share_systems: document.getElementById('editCanShareSystems').checked,
            is_active: document.getElementById('editIsActive').checked
        };

        fetch(`/users/api/user/${userId}/permissions/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken()
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showAlert('✅ ' + data.message, 'success');
                const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
                if (modal) {
                    modal.hide();
                }
                setTimeout(() => location.reload(), 1500);
            } else {
                this.showAlert('❌ ' + data.error, 'danger');
            }
        })
        .catch(error => {
            this.showAlert('❌ Yetkiler güncelleme hatası: ' + error.message, 'danger');
        });
    }

    deleteUser(userId, username) {
        if (!confirm(`"${username}" kullanıcısını silmek istediğinizden emin misiniz?`)) {
            return;
        }

        fetch(`/users/api/user/${userId}/delete/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': this.getCSRFToken()
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showAlert('✅ ' + data.message, 'success');
                const userRow = document.getElementById(`user-row-${userId}`);
                if (userRow) {
                    userRow.style.transition = 'all 0.6s ease';
                    userRow.style.transform = 'translateX(-100%)';
                    userRow.style.opacity = '0';
                    setTimeout(() => userRow.remove(), 600);
                }
            } else {
                this.showAlert('❌ ' + data.error, 'danger');
            }
        })
        .catch(error => {
            this.showAlert('❌ Silme hatası: ' + error.message, 'danger');
        });
    }

    showModalLoading(show) {
        const loadingElement = document.getElementById('editModalLoading');
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
    }

    showModalForm(show) {
        const formElement = document.getElementById('editUserForm');
        if (formElement) {
            formElement.style.display = show ? 'block' : 'none';
        }
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'danger' ? 'danger' : type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="flex-grow-1">${message}</div>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        alertDiv.style.cssText = `
            border-radius: 15px !important;
            margin-bottom: 1rem;
            transform: translateY(-20px);
            opacity: 0;
            transition: all 0.4s ease;
        `;
        
        const container = document.querySelector('.container-fluid');
        if (container) {
            container.insertBefore(alertDiv, container.children[1]);
            setTimeout(() => {
                alertDiv.style.transform = 'translateY(0)';
                alertDiv.style.opacity = '1';
            }, 100);
            
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.style.transform = 'translateY(-20px)';
                    alertDiv.style.opacity = '0';
                    setTimeout(() => {
                        if (alertDiv.parentNode) alertDiv.remove();
                    }, 400);
                }
            }, 5000);
        }
    }

    getCSRFToken() {
        const token = document.querySelector('[name=csrfmiddlewaretoken]');
        return token ? token.value : '';
    }
}

// Global instance ve initialization
let modernAdminPanel;

document.addEventListener('DOMContentLoaded', function() {
    modernAdminPanel = new ModernAdminPanel();
    
    // Global function for modal save button
    window.saveUserPermissions = function() {
        if (modernAdminPanel) {
            modernAdminPanel.saveUserPermissions();
        }
    };
    
    console.log('🎉 Admin Panel hazır!');
});}
