// System List Functions
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
      clearButton.style.display = this.value ? 'block' : 'none';
    });
  }

  // Filter buttons
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

function clearSearch() {
  const searchInput = document.getElementById('systemSearch');
  searchInput.value = '';
  document.querySelector('.search-clear').style.display = 'none';
  filterSystems();
  searchInput.focus();
}

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
    const systemType = card.querySelector('.system-type-badge').textContent.trim();
    const systemName = card.querySelector('.card-title').textContent.toLowerCase();
    const systemNumber = card.querySelector('.text-muted:nth-of-type(2)').textContent.toLowerCase();
    const projectName = card.querySelector('.text-muted:nth-of-type(1)')?.textContent.toLowerCase() || '';

    const matchesFilter = activeFilter === 'all' || systemType.includes(activeFilter);
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