<<<<<<< HEAD
// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Set min date to today and disable Sundays
const dateInput = document.getElementById('date');
if (dateInput) {
    // Set min date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
    
    // Add event listener to disable Sundays
    dateInput.addEventListener('input', function() {
        const selectedDate = new Date(this.value);
        if (selectedDate.getDay() === 0) { // 0 is Sunday
            showNotification('We are closed on Sundays. Please select another day.', 'error');
            this.value = ''; // Clear the input
        }
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Header background change on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Add animation to elements when they come into view
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.service-card, .gallery-item, .contact-card, .stat-item');
    animateElements.forEach(el => {
        observer.observe(el);
    });
});

// Initialize EmailJS
(function() {
    emailjs.init("0TZg_S2PMqbCnGr28"); // Your EmailJS public key
})();

// Form submission
document.getElementById('appointmentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    // Simple validation
    if (!data.name || !data.email || !data.phone || !data.date || !data.time || !data.service) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    // Phone validation (basic)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
        showNotification('Please enter a valid phone number.', 'error');
        return;
    }
    
    // Date validation (not in the past and not Sunday)
const selectedDate = new Date(data.date);
const today = new Date();
today.setHours(0, 0, 0, 0);

if (selectedDate < today) {
    showNotification('Please select a future date.', 'error');
    return;
}

// Check if the selected day is Sunday (0 = Sunday, 1 = Monday, etc.)
if (selectedDate.getDay() === 0) {
    showNotification('We are closed on Sundays. Please select another day.', 'error');
    return;
}

// Time validation (must be between 4pm and 8pm)
const timeValue = data.time;
const [hours] = timeValue.split(':').map(Number);
if (hours < 16 || hours >= 20) {
    showNotification('Appointments are only available between 4:00 PM and 8:00 PM.', 'error');
    return;
}
    
    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    // Send email using EmailJS
    sendAppointmentEmail(data)
        .then(() => {
            // Show success message
            showNotification('Thank you for your appointment request! Dr. Anitha will contact you soon to confirm your appointment.', 'success');
            
            // Reset form
            this.reset();
            
            // Optional: Send to WhatsApp
            sendToWhatsApp(data);
        })
        .catch((error) => {
            console.error('Email sending failed:', error);
            showNotification('There was an error sending your appointment request. Please try calling us directly.', 'error');
        })
        .finally(() => {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
});

// Function to send appointment email
async function sendAppointmentEmail(data) {
    // Format the date for better readability
    const appointmentDate = new Date(data.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Format the time (convert from 24h to 12h format if needed)
    const timeFormat = formatAppointmentTime(data.time);
    
    // Prepare email template parameters
    const templateParams = {
        to_email: 'testingkiro@gmail.com',
        from_name: data.name,
        from_email: data.email,
        phone: data.phone,
        appointment_date: appointmentDate,
        appointment_time: timeFormat,
        service: getServiceName(data.service),
        message: data.message || 'No additional message',
        clinic_name: 'Sri Sai Specialty Dental Clinic',
        doctor_name: 'Dr. Anitha'
    };
    
    // Send email using EmailJS
    return emailjs.send('service_xzz0lcn', 'template_ckn8f1f', templateParams);
}

// Helper function to get service name
function getServiceName(serviceValue) {
    const services = {
        'dental-implants': 'Dental Implants',
        'root-canal': 'Root Canal Treatment',
        'teeth-whitening': 'Teeth Whitening',
        'laser-treatment': 'Laser Treatment',
        'smile-design': 'Smile Design',
        'orthodontics': 'Orthodontics',
        'dental-spacing': 'Dental Spacing',
        'crowns-bridges': 'Crowns & Bridges',
        'wisdom-tooth': 'Wisdom Tooth Removal',
        'gum-care': 'Complete Gum Care',
        'invisalign': 'Invisalign Braces',
        'dental-bridges': 'Dental Bridges',
        'dentures': 'Dentures',
        'full-rehabilitation': 'Full Mouth Rehabilitation',
        'clear-aligners': 'Clear Aligners',
        'other': 'Other (Please specify in message)'
    };
    return services[serviceValue] || serviceValue;
}

// Helper function to format time from 24h to 12h format
function formatAppointmentTime(timeString) {
    if (!timeString) return '';
    
    try {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM
        
        return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
        console.error('Error formatting time:', error);
        return timeString; // Return original if there's an error
    }
}

// Show notification function
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
        color: ${type === 'success' ? '#155724' : '#721c24'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
        border-radius: 10px;
        padding: 15px 20px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Send appointment details to WhatsApp
function sendToWhatsApp(data) {
    const message = `New Appointment Request:
Name: ${data.name}
Phone: ${data.phone}
Email: ${data.email}
Date: ${data.date}
Time: ${data.time}
Service: ${data.service}
Message: ${data.message || 'None'}`;
    
    const whatsappUrl = `https://wa.me/91[YourWhatsAppNumber]?text=${encodeURIComponent(message)}`;
    // Uncomment the line below to automatically open WhatsApp
    // window.open(whatsappUrl, '_blank');
}

// Add loading animation to buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (this.type !== 'submit') {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        }
    });
});

// Animate statistics on scroll
const animateStats = () => {
    const stats = document.querySelectorAll('.stat-item h4');
    stats.forEach(stat => {
        const finalValue = stat.textContent;
        const number = parseInt(finalValue.replace(/\D/g, ''));
        
        if (number > 0) {
            let current = 0;
            const increment = number / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= number) {
                    stat.textContent = finalValue;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(current) + (finalValue.includes('+') ? '+' : '');
                }
            }, 30);
        }
    });
};

// Trigger stats animation when about section is visible
const aboutSection = document.querySelector('.about');
if (aboutSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statsObserver.observe(aboutSection);
}

// Add hover effects to service cards
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Gallery lightbox effect (simple version)
document.querySelectorAll('.gallery-item img').forEach(img => {
    img.addEventListener('click', function() {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <img src="${this.src}" alt="${this.alt}">
                <button class="lightbox-close">&times;</button>
            </div>
        `;
        
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            cursor: pointer;
        `;
        
        const content = lightbox.querySelector('.lightbox-content');
        content.style.cssText = `
            position: relative;
            max-width: 90%;
            max-height: 90%;
        `;
        
        const lightboxImg = lightbox.querySelector('img');
        lightboxImg.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 10px;
        `;
        
        const closeBtn = lightbox.querySelector('.lightbox-close');
        closeBtn.style.cssText = `
            position: absolute;
            top: -40px;
            right: -40px;
            background: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        document.body.appendChild(lightbox);
        
        // Close lightbox
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target === closeBtn) {
                lightbox.remove();
            }
        });
        
        // Close with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                lightbox.remove();
            }
        });
    });
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        margin-left: auto;
        opacity: 0.7;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(style);

console.log('Sri Sai Specialty Dental Clinic website loaded successfully!');
=======
// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Set min date to today and disable Sundays
const dateInput = document.getElementById('date');
if (dateInput) {
    // Set min date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
    
    // Add event listener to disable Sundays
    dateInput.addEventListener('input', function() {
        const selectedDate = new Date(this.value);
        if (selectedDate.getDay() === 0) { // 0 is Sunday
            showNotification('We are closed on Sundays. Please select another day.', 'error');
            this.value = ''; // Clear the input
        }
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ─── ContainerScroll Hero Animation ───────────────────────────────────────────
// Translates the Framer Motion ContainerScroll from dr-anita-dental into
// vanilla JS: rotateX 20→0 deg and scale 1.05→1 as the hero scrolls into view.
(function initContainerScroll() {
    const card   = document.getElementById('heroScrollCard');
    const header = document.querySelector('.hero-scroll-header');
    const section = document.querySelector('.hero-scroll-section');
    if (!card || !section) return;

    const isMobile = () => window.innerWidth <= 768;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function onScroll() {
        const rect = section.getBoundingClientRect();
        const sectionH = section.offsetHeight;
        // progress 0 (top of section at viewport top) → 1 (bottom scrolled past)
        const rawProgress = -rect.top / (sectionH * 0.8);
        const progress = Math.min(Math.max(rawProgress, 0), 1);

        // Rotate: start 20deg, end 0deg
        const rotate = lerp(20, 0, progress);
        // Scale: mobile 0.7→0.9, desktop 1.05→1
        const [scaleStart, scaleEnd] = isMobile() ? [0.7, 0.9] : [1.05, 1.0];
        const scale  = lerp(scaleStart, scaleEnd, progress);
        // Header translateY: 0 → -80px
        const translateY = lerp(0, -80, progress);

        card.style.transform   = `rotateX(${rotate}deg) scale(${scale})`;
        if (header) header.style.transform = `translateY(${translateY}px)`;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll(); // run once on load
})();

// ─── Fade-in-up for gallery items ─────────────────────────────────────────────
(function initFadeInUp() {
    const fadeEls = document.querySelectorAll('.fade-in-up');
    if (!fadeEls.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // stagger each item by 80ms
                const delay = (Array.from(fadeEls).indexOf(entry.target)) * 80;
                setTimeout(() => entry.target.classList.add('visible'), delay);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(el => obs.observe(el));
})();

// ─── Header background change on scroll ───────────────────────────────────────
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Add animation to elements when they come into view
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.service-card, .gallery-item, .contact-card, .stat-item');
    animateElements.forEach(el => {
        observer.observe(el);
    });
});

// Initialize EmailJS
(function() {
    emailjs.init("0TZg_S2PMqbCnGr28"); // Your EmailJS public key
})();

// Form submission
document.getElementById('appointmentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    // Simple validation
    if (!data.name || !data.email || !data.phone || !data.date || !data.time || !data.service) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    // Phone validation (basic)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
        showNotification('Please enter a valid phone number.', 'error');
        return;
    }
    
    // Date validation (not in the past and not Sunday)
const selectedDate = new Date(data.date);
const today = new Date();
today.setHours(0, 0, 0, 0);

if (selectedDate < today) {
    showNotification('Please select a future date.', 'error');
    return;
}

// Check if the selected day is Sunday (0 = Sunday, 1 = Monday, etc.)
if (selectedDate.getDay() === 0) {
    showNotification('We are closed on Sundays. Please select another day.', 'error');
    return;
}

// Time validation (must be between 4pm and 8pm)
const timeValue = data.time;
const [hours] = timeValue.split(':').map(Number);
if (hours < 16 || hours >= 20) {
    showNotification('Appointments are only available between 4:00 PM and 8:00 PM.', 'error');
    return;
}
    
    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    // Send email using EmailJS
    sendAppointmentEmail(data)
        .then(() => {
            // Show success message
            showNotification('Thank you for your appointment request! Dr. Anitha will contact you soon to confirm your appointment.', 'success');
            
            // Reset form
            this.reset();
            
            // Optional: Send to WhatsApp
            sendToWhatsApp(data);
        })
        .catch((error) => {
            console.error('Email sending failed:', error);
            showNotification('There was an error sending your appointment request. Please try calling us directly.', 'error');
        })
        .finally(() => {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
});

// Function to send appointment email
async function sendAppointmentEmail(data) {
    // Format the date for better readability
    const appointmentDate = new Date(data.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Format the time (convert from 24h to 12h format if needed)
    const timeFormat = formatAppointmentTime(data.time);
    
    // Prepare email template parameters
    const templateParams = {
        to_email: 'testingkiro@gmail.com',
        from_name: data.name,
        from_email: data.email,
        phone: data.phone,
        appointment_date: appointmentDate,
        appointment_time: timeFormat,
        service: getServiceName(data.service),
        message: data.message || 'No additional message',
        clinic_name: 'Sri Sai Specialty Dental Clinic',
        doctor_name: 'Dr. Anitha'
    };
    
    // Send email using EmailJS
    return emailjs.send('service_xzz0lcn', 'template_ckn8f1f', templateParams);
}

// Helper function to get service name
function getServiceName(serviceValue) {
    const services = {
        'scaling-polishing': 'Scaling / Polishing',
        'dentures': 'Complete/Partial Dentures Fixing',
        'aesthetic-fillings': 'Aesthetic Fillings',
        'gum-care': 'Gum Care',
        'crowns-bridges': 'Crowns and Bridges Fixing',
        'root-canal': 'Root Canal Treatment',
        'dental-implants': 'Dental Implants',
        'pediatric-dentistry': 'Pediatric Dentistry',
        'teeth-whitening': 'Teeth Whitening',
        'orthodontic-treatment': 'Orthodontic Treatment',
        'oral-surgery': 'Oral Surgery',
        'cosmetic-dentistry': 'Cosmetic Dentistry',
        'other': 'Other (Please specify in message)'
    };
    return services[serviceValue] || serviceValue;
}

// Helper function to format time from 24h to 12h format
function formatAppointmentTime(timeString) {
    if (!timeString) return '';

    
    try {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM
        
        return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
        console.error('Error formatting time:', error);
        return timeString; // Return original if there's an error
    }
}

// Show notification function
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
        color: ${type === 'success' ? '#155724' : '#721c24'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
        border-radius: 10px;
        padding: 15px 20px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Send appointment details to WhatsApp
function sendToWhatsApp(data) {
    const message = `New Appointment Request:
Name: ${data.name}
Phone: ${data.phone}
Email: ${data.email}
Date: ${data.date}
Time: ${data.time}
Service: ${data.service}
Message: ${data.message || 'None'}`;
    
    const whatsappUrl = `https://wa.me/91[YourWhatsAppNumber]?text=${encodeURIComponent(message)}`;
    // Uncomment the line below to automatically open WhatsApp
    // window.open(whatsappUrl, '_blank');
}

// Add loading animation to buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (this.type !== 'submit') {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        }
    });
});

// Animate statistics on scroll
const animateStats = () => {
    const stats = document.querySelectorAll('.stat-item h4');
    stats.forEach(stat => {
        const finalValue = stat.textContent;
        const number = parseInt(finalValue.replace(/\D/g, ''));
        
        if (number > 0) {
            let current = 0;
            const increment = number / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= number) {
                    stat.textContent = finalValue;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(current) + (finalValue.includes('+') ? '+' : '');
                }
            }, 30);
        }
    });
};

// Trigger stats animation when about section is visible
const aboutSection = document.querySelector('.about');
if (aboutSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statsObserver.observe(aboutSection);
}

// Add hover effects to service cards
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Gallery lightbox effect (simple version)
document.querySelectorAll('.gallery-item img').forEach(img => {
    img.addEventListener('click', function() {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <img src="${this.src}" alt="${this.alt}">
                <button class="lightbox-close">&times;</button>
            </div>
        `;
        
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            cursor: pointer;
        `;
        
        const content = lightbox.querySelector('.lightbox-content');
        content.style.cssText = `
            position: relative;
            max-width: 90%;
            max-height: 90%;
        `;
        
        const lightboxImg = lightbox.querySelector('img');
        lightboxImg.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 10px;
        `;
        
        const closeBtn = lightbox.querySelector('.lightbox-close');
        closeBtn.style.cssText = `
            position: absolute;
            top: -40px;
            right: -40px;
            background: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        document.body.appendChild(lightbox);
        
        // Close lightbox
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target === closeBtn) {
                lightbox.remove();
            }
        });
        
        // Close with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                lightbox.remove();
            }
        });
    });
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        margin-left: auto;
        opacity: 0.7;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(style);

console.log('Sri Sai Specialty Dental Clinic website loaded successfully!');

// ─── Services Slider Animation ───────────────────────────────────────────────
(function initServicesSlider() {
    const slider = document.getElementById('servicesSlider');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('sliderDots');
    
    if (!slider || !prevBtn || !nextBtn || !dotsContainer) return;
    
    const slides = slider.querySelectorAll('.services-slide');
    const totalSlides = slides.length;
    let currentSlide = 0;
    let isAnimating = false;
    
    // Create dots
    function createDots() {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }
    
    // Update slider position
    function updateSlider() {
        if (isAnimating) return;
        isAnimating = true;
        
        const offset = -currentSlide * 100;
        slider.style.transform = `translateX(${offset}%)`;
        
        // Update dots
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
        
        // Update button states
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;
        
        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }
    
    // Go to specific slide
    function goToSlide(slideIndex) {
        if (slideIndex >= 0 && slideIndex < totalSlides && !isAnimating) {
            currentSlide = slideIndex;
            updateSlider();
        }
    }
    
    // Next slide
    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            goToSlide(currentSlide + 1);
        }
    }
    
    // Previous slide
    function prevSlide() {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1);
        }
    }
    
    // Auto-play functionality
    let autoplayInterval;
    
    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            if (currentSlide === totalSlides - 1) {
                goToSlide(0); // Loop back to first slide
            } else {
                nextSlide();
            }
        }, 5000); // Change slide every 5 seconds
    }
    
    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }
    
    // Event listeners
    prevBtn.addEventListener('click', () => {
        prevSlide();
        stopAutoplay();
        startAutoplay(); // Restart autoplay
    });
    
    nextBtn.addEventListener('click', () => {
        nextSlide();
        stopAutoplay();
        startAutoplay(); // Restart autoplay
    });
    
    // Pause autoplay on hover
    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            stopAutoplay();
            startAutoplay();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            stopAutoplay();
            startAutoplay();
        }
    });
    
    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
    });
    
    slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoplay();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide(); // Swipe left, go to next slide
            } else {
                prevSlide(); // Swipe right, go to previous slide
            }
        }
    }
    
    // Initialize
    createDots();
    updateSlider();
    startAutoplay();
    
    // Pause autoplay when page is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoplay();
        } else {
            startAutoplay();
        }
    });
})();
>>>>>>> 73ff963 (Add dental clinic website with reviews section and fix hero card cropping)
