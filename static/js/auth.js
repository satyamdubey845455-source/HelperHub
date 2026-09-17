// Shared authentication and utility script for HelperHub

// Show custom toast notifications
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast-notification');
  const toastMsg = document.getElementById('toast-message');
  
  if (!toast || !toastMsg) return;
  
  toastMsg.textContent = message;
  toast.className = `toast show ${type}`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// Check if user is logged in and update the navbar
async function checkAuthState() {
  try {
    const response = await fetch('/api/auth/me');
    if (response.ok) {
      const data = await response.json();
      updateNavbar(data.user);
      return data.user;
    } else {
      updateNavbar(null);
      return null;
    }
  } catch (error) {
    console.error("Error checking auth state:", error);
    updateNavbar(null);
    return null;
  }
}

// Update navbar with user buttons
function updateNavbar(user) {
  const authContainer = document.getElementById('auth-nav-container');
  if (!authContainer) return;
  
  if (user) {
    authContainer.innerHTML = `
      <a href="dashboard.html">
        <button class="nav-btn secondary">Dashboard</button>
      </a>
      <button class="nav-btn" onclick="handleLogout()">Logout</button>
    `;
  } else {
    authContainer.innerHTML = `
      <a href="login.html">
        <button class="nav-btn">Join Now</button>
      </a>
    `;
  }
}

// Handle Logout
async function handleLogout() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      showToast("Logged out successfully!", "success");
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } else {
      showToast("Logout failed. Please try again.", "error");
    }
  } catch (error) {
    console.error("Logout error:", error);
    showToast("Logout error. Please try again.", "error");
  }
}

// Login Form Submit handler
async function handleLoginSubmit(event) {
  event.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showToast("Logged in successfully! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = data.user.role === 'helper' ? 'dashboard.html' : 'index.html';
      }, 1500);
    } else {
      showToast(data.error || "Invalid login credentials", "error");
    }
  } catch (error) {
    console.error("Login error:", error);
    showToast("Network error. Could not complete request.", "error");
  }
}

// Signup Form Submit handler
async function handleSignupSubmit(event) {
  event.preventDefault();
  
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const phone = document.getElementById('signup-phone').value;
  const role = document.getElementById('signup-role').value;
  
  const payload = { name, email, password, phone, role };
  
  if (role === 'helper') {
    payload.service_type = document.getElementById('helper-service').value;
    payload.experience = parseInt(document.getElementById('helper-experience').value);
    payload.hourly_rate = parseFloat(document.getElementById('helper-rate').value);
    payload.location = document.getElementById('helper-location').value;
    payload.description = document.getElementById('helper-desc').value;
    payload.avatar_url = document.getElementById('helper-avatar').value;
    
    if (!payload.service_type || isNaN(payload.experience) || isNaN(payload.hourly_rate) || !payload.location) {
      showToast("Please fill in all helper professional fields.", "error");
      return;
    }
  }
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showToast("Account created successfully! Logging in...", "success");
      setTimeout(() => {
        window.location.href = data.user.role === 'helper' ? 'dashboard.html' : 'index.html';
      }, 1500);
    } else {
      showToast(data.error || "Registration failed. Try again.", "error");
    }
  } catch (error) {
    console.error("Signup error:", error);
    showToast("Network error. Could not complete request.", "error");
  }
}

// Proactively run check auth state when page loads
document.addEventListener('DOMContentLoaded', () => {
  checkAuthState();
});
