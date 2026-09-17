// Homepage interaction script for HelperHub

let currentUser = null;

// Load helpers on page load
document.addEventListener('DOMContentLoaded', async () => {
  currentUser = await checkAuthState();
  
  // Set up search form listeners
  const searchBtn = document.getElementById('search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }
  
  // Set minimum date for booking picker to today
  const bookingDateInput = document.getElementById('booking-date');
  if (bookingDateInput) {
    const today = new Date().toISOString().split('T')[0];
    bookingDateInput.min = today;
  }
  
  // Load initial helpers
  loadHelpers();
});

// Load helpers dynamically
async function loadHelpers(service = '', location = '') {
  const grid = document.getElementById('helpers-grid');
  if (!grid) return;
  
  grid.innerHTML = `
    <div class="loader-container">
      <div class="loader"></div>
      <p style="margin-top: 15px; color: #666;">Searching for helpers...</p>
    </div>
  `;
  
  try {
    let url = '/api/helpers';
    const params = [];
    if (service) params.push(`service=${encodeURIComponent(service)}`);
    if (location) params.push(`location=${encodeURIComponent(location)}`);
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to load helpers");
    
    const helpers = await response.json();
    renderHelpersList(helpers);
  } catch (error) {
    console.error("Error loading helpers:", error);
    grid.innerHTML = `<p class="no-results">Error loading helpers. Please try again later.</p>`;
  }
}

// Render helpers list to UI
function renderHelpersList(helpers) {
  const grid = document.getElementById('helpers-grid');
  if (!grid) return;
  
  if (helpers.length === 0) {
    grid.innerHTML = `<p class="no-results">No local helpers found matching your request.</p>`;
    return;
  }
  
  grid.innerHTML = helpers.map(helper => `
    <div class="worker-card">
      <img src="${helper.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop'}" alt="${helper.name}">
      
      <div class="worker-info">
        <h3>${helper.name}</h3>
        <p style="font-weight: 500; color: #0077ff;">${helper.service_type}</p>
        <p class="experience">💼 ${helper.experience} years experience</p>
        <p class="experience">📍 Location: ${helper.location}</p>
        <div class="rating">★ ★ ★ ★ ★</div>
        <p class="rate">₹${helper.hourly_rate} / hr</p>
        
        <button onclick="openBookingModal(${helper.id}, '${helper.name}')">Book Now</button>
      </div>
    </div>
  `).join('');
}

// Perform search action
function performSearch() {
  const service = document.getElementById('search-service').value.trim();
  const location = document.getElementById('search-location').value.trim();
  
  const sectionTitle = document.getElementById('workers-section-title');
  if (sectionTitle) {
    if (service || location) {
      sectionTitle.textContent = `Search Results ${service ? 'for ' + service : ''} ${location ? 'in ' + location : ''}`;
    } else {
      sectionTitle.textContent = "Top Rated Helpers";
    }
  }
  
  loadHelpers(service, location);
  
  // Smooth scroll to helpers section
  document.getElementById('helpers').scrollIntoView({ behavior: 'smooth' });
}

// Filter helpers by service card click
function filterByService(service) {
  document.getElementById('search-service').value = service;
  document.getElementById('search-location').value = '';
  
  const sectionTitle = document.getElementById('workers-section-title');
  if (sectionTitle) {
    sectionTitle.textContent = `Available ${service}s`;
  }
  
  loadHelpers(service, '');
  
  document.getElementById('helpers').scrollIntoView({ behavior: 'smooth' });
}

// Booking Modal Actions
function openBookingModal(helperId, helperName) {
  if (!currentUser) {
    showToast("Please login or create an account to book helpers", "error");
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }
  
  if (currentUser.role !== 'customer') {
    showToast("Only customers can make helper bookings.", "error");
    return;
  }
  
  document.getElementById('booking-helper-id').value = helperId;
  document.getElementById('booking-helper-name').value = helperName;
  
  const modal = document.getElementById('booking-modal');
  modal.style.display = 'flex';
}

function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  modal.style.display = 'none';
  document.getElementById('booking-form').reset();
}

// Booking form submission
async function handleBookingSubmit(event) {
  event.preventDefault();
  
  const helperId = document.getElementById('booking-helper-id').value;
  const bookingDate = document.getElementById('booking-date').value;
  const bookingTime = document.getElementById('booking-time').value;
  const notes = document.getElementById('booking-notes').value.trim();
  
  if (!helperId || !bookingDate || !bookingTime) {
    showToast("Please fill in the date and time slot details.", "error");
    return;
  }
  
  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        helper_id: parseInt(helperId),
        booking_date: bookingDate,
        booking_time: bookingTime,
        notes: notes
      })
    });
    
    const data = await response.json();
    if (response.ok) {
      showToast("Booking requested successfully!", "success");
      closeBookingModal();
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    } else {
      showToast(data.error || "Booking request failed. Try again.", "error");
    }
  } catch (error) {
    console.error("Booking error:", error);
    showToast("Network error. Could not book helper.", "error");
  }
}

// Close modal when clicking outside contents
window.onclick = function(event) {
  const modal = document.getElementById('booking-modal');
  if (event.target === modal) {
    closeBookingModal();
  }
}
