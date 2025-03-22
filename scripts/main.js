// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Set current year in footer
  document.getElementById("currentYear").textContent = new Date().getFullYear();

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const nav = document.getElementById("nav-menu");

  if (mobileMenuBtn && nav) {
    mobileMenuBtn.addEventListener("click", function () {
      this.classList.toggle("active");
      nav.classList.toggle("active");
    });
  }

  // Close mobile menu when clicking a nav link
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      if (mobileMenuBtn && nav) {
        mobileMenuBtn.classList.remove("active");
        nav.classList.remove("active");
      }
    });
  });

  // Highlight active nav link based on scroll position
  function updateActiveNavLink() {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-links a");

    let currentSection = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (
        window.scrollY >= sectionTop &&
        window.scrollY < sectionTop + sectionHeight
      ) {
        currentSection = sectionId;
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSection}`) {
        link.classList.add("active");
      }
    });
  }

  // Header scroll effect
  const header = document.getElementById("header");

  function handleHeaderScroll() {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  // Back to top button
  const backToTopBtn = document.getElementById("backToTop");

  function handleBackToTopBtn() {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add("active");
    } else {
      backToTopBtn.classList.remove("active");
    }
  }

  backToTopBtn.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Impact slider
  const slides = document.querySelectorAll(".impact-slide");
  const dots = document.querySelectorAll(".dot");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  let currentSlide = 0;

  function showSlide(n) {
    // First hide all slides
    slides.forEach((slide) => {
      slide.style.display = "none";
      slide.classList.remove("active");
    });

    dots.forEach((dot) => dot.classList.remove("active"));

    currentSlide = (n + slides.length) % slides.length;

    // Then show the current slide with a fade effect
    slides[currentSlide].style.display = "block";

    // Small timeout to allow the display change to take effect before adding the active class
    setTimeout(() => {
      slides[currentSlide].classList.add("active");
      dots[currentSlide].classList.add("active");
    }, 10);
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => showSlide(currentSlide - 1));
    nextBtn.addEventListener("click", () => showSlide(currentSlide + 1));
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showSlide(index));
  });

  // Auto slide for impact slider
  let slideInterval = setInterval(() => showSlide(currentSlide + 1), 5000);

  // Pause auto slide on hover
  const impactSlider = document.querySelector(".impact-slider");
  if (impactSlider) {
    impactSlider.addEventListener("mouseenter", () =>
      clearInterval(slideInterval)
    );
    impactSlider.addEventListener("mouseleave", () => {
      clearInterval(slideInterval);
      slideInterval = setInterval(() => showSlide(currentSlide + 1), 5000);
    });
  }

  // Form submission handling
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form values
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const subject = document.getElementById("subject").value;
      const message = document.getElementById("message").value;

      // Here we would typically send the form data to a server
      // For now, we'll just log it and show a success message
      console.log("Form submitted:", { name, email, subject, message });

      // Show success message (in a real implementation, this would happen after successful AJAX)
      alert("Thank you for your message! We will get back to you soon.");

      // Reset form
      contactForm.reset();
    });
  }

  // Newsletter form submission
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get email value
      const email = this.querySelector('input[type="email"]').value;

      // Here we would typically send the email to a server
      console.log("Newsletter subscription:", email);

      // Show success message
      alert("Thank you for subscribing to our newsletter!");

      // Reset form
      newsletterForm.reset();
    });
  }

  // Add scroll event listeners
  window.addEventListener("scroll", function () {
    handleHeaderScroll();
    handleBackToTopBtn();
    updateActiveNavLink();
  });

  // Initialize functions on page load
  handleHeaderScroll();
  handleBackToTopBtn();
  updateActiveNavLink();
  showSlide(0);

  // Create placeholder images if needed
  function createPlaceholder(element) {
    if (
      element.getAttribute("src") &&
      element.getAttribute("src").includes("placeholder.svg")
    ) {
      const width = element.getAttribute("width") || 300;
      const height = element.getAttribute("height") || 200;
      element.setAttribute(
        "src",
        `https://via.placeholder.com/${width}x${height}/2d56a4/ffffff?text=Lasallian+Club`
      );
    }
  }

  // Apply to all images
  document.querySelectorAll("img").forEach(createPlaceholder);
});
