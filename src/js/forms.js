// Form submission handler for Lineo Finance
(function() {
  'use strict';

  // API Configuration - will be replaced with actual API Gateway URL after Terraform deployment
  const API_BASE_URL = window.LINEO_API_URL || 'https://YOUR-API-ID.execute-api.eu-central-1.amazonaws.com/test';
  
  // Initialize forms when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
    initCareerForm();
  });

  // Contact Form Handler
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      try {
        // Disable submit button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Wird gesendet...';
        
        // Collect form data
        const firstnameField = form.querySelector('#firstname');
        const lastnameField = form.querySelector('#lastname');
        const emailField = form.querySelector('#email');
        const phoneField = form.querySelector('#phone');
        const companyField = form.querySelector('#company');
        const messageField = form.querySelector('#message');
        
        const firstname = firstnameField ? firstnameField.value.trim() : '';
        const lastname = lastnameField ? lastnameField.value.trim() : '';
        
        const formData = {
          name: `${firstname} ${lastname}`.trim(),
          email: emailField ? emailField.value.trim() : '',
          phone: phoneField ? phoneField.value.trim() : '',
          company: companyField ? companyField.value.trim() : '',
          message: messageField ? messageField.value.trim() : ''
        };
        
        // Validate required fields
        if (!firstname || !lastname || !formData.email || !formData.message) {
          throw new Error('Bitte füllen Sie alle Pflichtfelder aus.');
        }
        
        // Validate email format
        if (!isValidEmail(formData.email)) {
          throw new Error('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
        }
        
        // Send to API
        const response = await fetch(`${API_BASE_URL}/contact`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Ein Fehler ist aufgetreten.');
        }
        
        // Show success message and hide form
        showSuccessAndHideForm(form, result.message || 'Vielen Dank für Ihre Nachricht! Wir werden uns zeitnah bei Ihnen melden.');
        
      } catch (error) {
        console.error('Form submission error:', error);
        showMessage(form, 'error', error.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // Career Form Handler with File Upload
  function initCareerForm() {
    const form = document.getElementById('career-form');
    if (!form) return;

    const fileInput = form.querySelector('#cv-upload');
    const fileLabel = form.querySelector('.file-upload-label');
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    // Handle file selection
    if (fileInput) {
      fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
          // Validate file type
          if (!file.name.toLowerCase().endsWith('.pdf')) {
            showMessage(form, 'error', 'Nur PDF-Dateien sind erlaubt.');
            this.value = '';
            return;
          }
          
          // Validate file size
          if (file.size > maxFileSize) {
            showMessage(form, 'error', 'Die Datei ist zu groß. Maximale Größe: 10MB.');
            this.value = '';
            return;
          }
          
          // Update label with filename
          if (fileLabel) {
            fileLabel.textContent = `Ausgewählt: ${file.name}`;
            fileLabel.classList.add('file-selected');
          }
        }
      });
    }

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      try {
        // Disable submit button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Wird gesendet...';
        
        // Collect form data
        const positionField = form.querySelector('#position');
        const nameField = form.querySelector('#name');
        const emailField = form.querySelector('#email');
        const phoneField = form.querySelector('#phone');
        const availabilityField = form.querySelector('#availability');
        const salaryField = form.querySelector('#salary');
        const messageField = form.querySelector('#message');
        
        const formData = {
          position: positionField ? positionField.value.trim() : '',
          name: nameField ? nameField.value.trim() : '',
          email: emailField ? emailField.value.trim() : '',
          phone: phoneField ? phoneField.value.trim() : '',
          availability: availabilityField ? availabilityField.value.trim() : '',
          salary: salaryField ? salaryField.value.trim() : '',
          message: messageField ? messageField.value.trim() : ''
        };
        
        // Validate required fields
        if (!formData.position || !formData.name || !formData.email || !formData.message) {
          throw new Error('Bitte füllen Sie alle Pflichtfelder aus.');
        }
        
        // Validate email format
        if (!isValidEmail(formData.email)) {
          throw new Error('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
        }
        
        // Handle file upload if present
        const file = fileInput && fileInput.files ? fileInput.files[0] : null;
        if (file) {
          // Convert file to base64
          const base64 = await fileToBase64(file);
          formData.cv = base64.split(',')[1]; // Remove data:application/pdf;base64, prefix
          formData.cvFileName = file.name;
        }
        
        // Send to API
        const response = await fetch(`${API_BASE_URL}/career`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Ein Fehler ist aufgetreten.');
        }
        
        // Show success message and hide form
        showSuccessAndHideForm(form, result.message || 'Vielen Dank für Ihre Bewerbung! Wir werden uns zeitnah bei Ihnen melden.');
        
      } catch (error) {
        console.error('Form submission error:', error);
        showMessage(form, 'error', error.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // Helper Functions
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  function showMessage(form, type, message) {
    // Remove existing messages
    const existingMsg = form.querySelector('.form-message');
    if (existingMsg) {
      existingMsg.remove();
    }
    
    // Create and insert message element
    const msgDiv = document.createElement('div');
    msgDiv.className = `form-message form-message-${type}`;
    msgDiv.textContent = message;
    
    // Add appropriate icon
    const icon = document.createElement('span');
    icon.className = 'form-message-icon';
    icon.textContent = type === 'success' ? '✓' : '⚠';
    msgDiv.prepend(icon);
    
    // Insert before submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn && submitBtn.parentNode) {
      submitBtn.parentNode.insertBefore(msgDiv, submitBtn);
    } else {
      form.appendChild(msgDiv);
    }
    
    // Auto-remove success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        msgDiv.remove();
      }, 5000);
    }
  }
  
  function showSuccessAndHideForm(form, message) {
    // Hide all form fields and submit button
    const formFields = form.querySelectorAll('.kontakt-form__row, .kontakt-form__group, .kontakt-form__submit, .kontakt-form__note');
    formFields.forEach(field => {
      field.style.display = 'none';
    });
    
    // Also hide career form specific elements
    const careerFields = form.querySelectorAll('.career-form__field, .career-form__submit');
    careerFields.forEach(field => {
      field.style.display = 'none';
    });
    
    // Create success message container
    const successDiv = document.createElement('div');
    successDiv.className = 'form-success-container';
    successDiv.innerHTML = `
      <div class="form-success-icon">✓</div>
      <h3 class="form-success-title">Vielen Dank!</h3>
      <p class="form-success-message">${message}</p>
      <button class="form-success-button" onclick="location.reload()">Neue Anfrage senden</button>
    `;
    
    // Clear form and add success message
    form.innerHTML = '';
    form.appendChild(successDiv);
    
    // Add success animation class
    setTimeout(() => {
      successDiv.classList.add('show');
    }, 100);
  }
})();