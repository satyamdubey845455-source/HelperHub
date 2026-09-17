// Dashboard management script for HelperHub

let currentProfile = null;

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
});

// Load all dashboard info
async function loadDashboardData() {
  currentProfile = await checkAuthState();
  
  if (!currentProfile) {
    showToast("Please login to access the dashboard", "error");
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }
  
  renderProfileInfo(currentProfile);
  loadBookings();
}

// Render profile details in sidebar
function renderProfileInfo(user) {
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-role').textContent = user.role === 'helper' ? 'Professional Helper' : 'Customer';
  document.getElementById('user-email').textContent = user.email;
  document.getElementById('user-phone').textContent = user.phone;
  
  if (user.role === 'helper') {
    document.getElementById('user-avatar').src = user.helper_profile?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png';
    document.getElementById('helper-service').textContent = user.helper_profile?.service_type || 'Not specified';
    document.getElementById('helper-experience').textContent = `${user.helper_profile?.experience || 0} Years`;
    document.getElementById('helper-rate').textContent = `₹${user.helper_profile?.hourly_rate || 0} / hr`;
    document.getElementById('helper-location').textContent = user.helper_profile?.location || 'Not specified';
    document.getElementById('helper-rating').textContent = `★ ★ ★ ★ ★ (${user.helper_profile?.rating || 5.0})`;
    document.getElementById('helper-desc').textContent = user.helper_profile?.description || 'No description provided.';
    
    document.getElementById('helper-profile-details').style.display = 'block';
    document.getElementById('edit-profile-btn').style.display = 'block';
  } else {
    document.getElementById('user-avatar').src = 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png';
    document.getElementById('helper-profile-details').style.display = 'none';
    document.getElementById('edit-profile-btn').style.display = 'none';
  }
}

// Load bookings list
async function loadBookings() {
  const container = document.getElementById('bookings-list-container');
  if (!container) return;
  
  try {
    const response = await fetch('/api/bookings');
    if (!response.ok) throw new Error("Failed to load bookings");
    
    const bookings = await response.json();
    document.getElementById('booking-count-badge').textContent = `${bookings.length} Total`;
    
    renderBookingsList(bookings);
  } catch (error) {
    console.error("Error loading bookings:", error);
    container.innerHTML = `<p class="no-results">Error loading bookings. Please try again later.</p>`;
  }
}

// Render bookings lists to UI
function renderBookingsList(bookings) {
  const container = document.getElementById('bookings-list-container');
  if (!container) return;
  
  if (bookings.length === 0) {
    container.innerHTML = `<p class="no-results">No bookings found.</p>`;
    return;
  }
  
  const isHelper = currentProfile.role === 'helper';
  
  container.innerHTML = bookings.map(booking => {
    let actionsHtml = '';
    
    if (isHelper) {
      if (booking.status === 'pending') {
        actionsHtml = `
          <button class="action-btn accept" onclick="updateBookingStatus(${booking.id}, 'accepted')">Accept</button>
          <button class="action-btn reject" onclick="updateBookingStatus(${booking.id}, 'rejected')">Reject</button>
        `;
      } else if (booking.status === 'accepted') {
        actionsHtml = `
          <button class="action-btn complete" onclick="updateBookingStatus(${booking.id}, 'completed')">Complete Job</button>
        `;
      }
    } else {
      // Customer view
      if (booking.status === 'pending') {
        actionsHtml = `
          <button class="action-btn cancel" onclick="updateBookingStatus(${booking.id}, 'cancelled')">Cancel</button>
        `;
      }
    }
    
    const statusClass = `status-${booking.status}`;
    const nameLabel = isHelper ? 'Customer' : 'Helper';
    const nameVal = isHelper ? booking.customer_name : booking.helper_name;
    const phoneVal = isHelper ? booking.customer_phone : booking.helper_phone;
    
    return `
      <div class="booking-card">
        <div class="booking-main">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h4 style="font-size:16px; color:#333;">Booking #${booking.id}</h4>
            <span class="status-badge ${statusClass}">${booking.status}</span>
          </div>
          
          <div class="booking-details-grid">
            <div class="booking-detail-item">
              <label>${nameLabel}</label>
              <p>${nameVal}</p>
            </div>
            <div class="booking-detail-item">
              <label>Contact Phone</label>
              <p>${phoneVal || 'N/A'}</p>
            </div>
            <div class="booking-detail-item">
              <label>Schedule</label>
              <p>📅 ${booking.booking_date} <br> 🕒 ${booking.booking_time}</p>
            </div>
            ${!isHelper ? `
            <div class="booking-detail-item">
              <label>Service Rate</label>
              <p>₹${booking.hourly_rate} / hr</p>
            </div>
            ` : ''}
          </div>
          
          <div class="booking-detail-item" style="margin-top: 12px; border-top: 1px dashed #f0f0f0; padding-top: 8px;">
            <label>Notes / Instructions</label>
            <p style="font-size: 13px; font-weight:normal; color:#555;">${booking.notes || 'No instructions provided.'}</p>
          </div>
        </div>
        
        ${actionsHtml ? `<div class="booking-actions">${actionsHtml}</div>` : ''}
      </div>
    `;
  }).join('');
}

// Update booking status API call
async function updateBookingStatus(bookingId, status) {
  let confirmMsg = `Are you sure you want to ${status} this booking?`;
  if (status === 'cancelled') confirmMsg = "Are you sure you want to cancel this booking?";
  
  if (!confirm(confirmMsg)) return;
  
  try {
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    
    const data = await response.json();
    if (response.ok) {
      showToast(`Booking ${status} successfully!`, "success");
      loadBookings();
    } else {
      showToast(data.error || "Failed to update booking status", "error");
    }
  } catch (error) {
    console.error("Error updating booking status:", error);
    showToast("Network error. Could not update booking.", "error");
  }
}

// Helper Profile Edit Modal Actions
function openEditProfileModal() {
  const profile = currentProfile.helper_profile;
  if (!profile) return;
  
  document.getElementById('edit-service').value = profile.service_type || 'Plumber';
  document.getElementById('edit-experience').value = profile.experience || 0;
  document.getElementById('edit-rate').value = profile.hourly_rate || 0;
  document.getElementById('edit-location').value = profile.location || '';
  document.getElementById('edit-desc').value = profile.description || '';
  document.getElementById('edit-avatar').value = profile.avatar_url || '';
  
  const modal = document.getElementById('edit-profile-modal');
  modal.style.display = 'flex';
}

function closeEditProfileModal() {
  const modal = document.getElementById('edit-profile-modal');
  modal.style.display = 'none';
}

// Submit updated helper profile info
async function handleProfileUpdate(event) {
  event.preventDefault();
  
  const service_type = document.getElementById('edit-service').value;
  const experience = parseInt(document.getElementById('edit-experience').value);
  const hourly_rate = parseFloat(document.getElementById('edit-rate').value);
  const location = document.getElementById('edit-location').value.trim();
  const description = document.getElementById('edit-desc').value.trim();
  const avatar_url = document.getElementById('edit-avatar').value.trim();
  
  if (!service_type || isNaN(experience) || isNaN(hourly_rate) || !location || !description) {
    showToast("Please fill in all profile fields.", "error");
    return;
  }
  
  try {
    const response = await fetch('/api/helpers/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_type,
        experience,
        hourly_rate,
        location,
        description,
        avatar_url
      })
    });
    
    const data = await response.json();
    if (response.ok) {
      showToast("Profile updated successfully!", "success");
      closeEditProfileModal();
      loadDashboardData(); // Reload profile & details
    } else {
      showToast(data.error || "Failed to update profile", "error");
    }
  } catch (error) {
    console.error("Error updating helper profile:", error);
    showToast("Network error. Could not update profile.", "error");
  }
}

// Close modal when clicking outside contents
window.onclick = function(event) {
  const modal = document.getElementById('edit-profile-modal');
  if (event.target === modal) {
    closeEditProfileModal();
  }
}
