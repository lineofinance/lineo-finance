// Form submission handler for Lineo Finance
(function() {
  'use strict';

  // API Configuration - will be replaced with actual API Gateway URL after Terraform deployment
  const API_BASE_URL = window.LINEO_API_URL || 'https://YOUR-API-ID.execute-api.eu-central-1.amazonaws.com/test';
  
  // Initialize forms when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
    initCareerForm();
    initFormAccessibility();
  });
  
  // Initialize form accessibility features
  function initFormAccessibility() {
    // Add ARIA live region for form announcements
    const liveRegion = document.createElement('div');
    liveRegion.className = 'form-live-region sr-only';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.setAttribute('role', 'status');
    document.body.appendChild(liveRegion);
    
    // Add error summary container to all forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const errorSummary = document.createElement('div');
      errorSummary.className = 'error-summary';
      errorSummary.setAttribute('role', 'alert');
      errorSummary.setAttribute('aria-live', 'assertive');
      errorSummary.setAttribute('tabindex', '-1');
      errorSummary.hidden = true;
      errorSummary.innerHTML = `
        <h3 class="error-summary-title">Es gibt Fehler im Formular:</h3>
        <ul class="error-summary-list" id="${form.id}-errors"></ul>
      `;
      form.insertBefore(errorSummary, form.firstChild);
    });
  }

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
        
        // Clear previous errors
        clearFormErrors(form);
        
        // Validate required fields with specific error messages
        const errors = [];
        
        if (!firstname) {
          errors.push({ field: 'firstname', message: 'Vorname ist erforderlich' });
        }
        if (!lastname) {
          errors.push({ field: 'lastname', message: 'Nachname ist erforderlich' });
        }
        if (!formData.email) {
          errors.push({ field: 'email', message: 'E-Mail-Adresse ist erforderlich' });
        } else if (!isValidEmail(formData.email)) {
          errors.push({ field: 'email', message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein' });
        }
        if (!formData.message) {
          errors.push({ field: 'message', message: 'Nachricht ist erforderlich' });
        }
        
        // Check consent checkbox
        const consentField = form.querySelector('#consent');
        if (consentField && !consentField.checked) {
          errors.push({ field: 'consent', message: 'Bitte stimmen Sie der Datenschutzerklärung zu' });
        }
        
        if (errors.length > 0) {
          showFormErrors(form, errors);
          throw new Error('Bitte korrigieren Sie die markierten Fehler.');
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
        
        // Track successful form submission with custom GA4 events
        if (typeof trackFormSubmission === 'function') {
          trackFormSubmission('contact', 'contact-page');
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
        
        // Clear previous errors
        clearFormErrors(form);
        
        // Validate required fields with specific error messages
        const errors = [];
        
        if (!formData.position) {
          errors.push({ field: 'position', message: 'Position ist erforderlich' });
        }
        if (!formData.name) {
          errors.push({ field: 'name', message: 'Name ist erforderlich' });
        }
        if (!formData.email) {
          errors.push({ field: 'email', message: 'E-Mail-Adresse ist erforderlich' });
        } else if (!isValidEmail(formData.email)) {
          errors.push({ field: 'email', message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein' });
        }
        if (!formData.message) {
          errors.push({ field: 'message', message: 'Nachricht ist erforderlich' });
        }
        
        if (errors.length > 0) {
          showFormErrors(form, errors);
          throw new Error('Bitte korrigieren Sie die markierten Fehler.');
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
        
        // Track successful career form submission with custom GA4 events
        if (typeof trackJobEngagement === 'function') {
          const jobTitle = document.querySelector('h1')?.textContent || 'Unknown Position';
          trackJobEngagement(jobTitle, 'application_submit');
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
  
  // Clear all form errors
  function clearFormErrors(form) {
    // Remove error classes and aria-invalid attributes
    const errorFields = form.querySelectorAll('.error');
    errorFields.forEach(field => {
      field.classList.remove('error');
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    });
    
    // Clear error messages
    const errorMessages = form.querySelectorAll('.field-error');
    errorMessages.forEach(msg => msg.remove());
    
    // Hide error summary
    const errorSummary = form.querySelector('.error-summary');
    if (errorSummary) {
      errorSummary.hidden = true;
      const errorList = errorSummary.querySelector('.error-summary-list');
      if (errorList) {
        errorList.innerHTML = '';
      }
    }
  }
  
  // Show form errors with ARIA announcements
  function showFormErrors(form, errors) {
    const errorSummary = form.querySelector('.error-summary');
    const errorList = errorSummary ? errorSummary.querySelector('.error-summary-list') : null;
    
    // Build error summary
    if (errorSummary && errorList) {
      errorList.innerHTML = '';
      errors.forEach((error, index) => {
        const field = form.querySelector(`#${error.field}`);
        if (field) {
          // Mark field as invalid
          field.classList.add('error');
          field.setAttribute('aria-invalid', 'true');
          
          // Create unique error ID
          const errorId = `${error.field}-error-${index}`;
          
          // Add error message below field
          const errorMsg = document.createElement('span');
          errorMsg.className = 'field-error';
          errorMsg.id = errorId;
          errorMsg.textContent = error.message;
          errorMsg.setAttribute('role', 'alert');
          
          // Insert error message after field or its label
          const fieldContainer = field.closest('.kontakt-form__group, .career-form__field') || field.parentElement;
          const existingError = fieldContainer.querySelector('.field-error');
          if (existingError) {
            existingError.remove();
          }
          fieldContainer.appendChild(errorMsg);
          
          // Associate error with field
          field.setAttribute('aria-describedby', errorId);
          
          // Add to error summary
          const li = document.createElement('li');
          const link = document.createElement('a');
          link.href = `#${error.field}`;
          link.textContent = error.message;
          link.addEventListener('click', (e) => {
            e.preventDefault();
            field.focus();
            field.scrollIntoView({ behavior: 'smooth', block: 'center' });
          });
          li.appendChild(link);
          errorList.appendChild(li);
        }
      });
      
      // Show error summary and focus it
      errorSummary.hidden = false;
      errorSummary.focus();
      errorSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Announce to screen readers
    const liveRegion = document.querySelector('.form-live-region');
    if (liveRegion) {
      liveRegion.textContent = `Es gibt ${errors.length} Fehler im Formular. Bitte korrigieren Sie die markierten Felder.`;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 100);
    }
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