document.addEventListener("DOMContentLoaded", () => {
  // Use requestAnimationFrame for smooth animations
  const raf =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    ((callback) => {
      setTimeout(callback, 1000 / 60);
    });

  // Initialize components
  initScrollAnimations();
  initHeroCarousel();
  initAnimatedText();
  initChatbot();
  initTestimonialSlider();
  initCounters();

  // Set current year in footer
  document.getElementById("currentYear").textContent = new Date().getFullYear();

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const nav = document.getElementById("nav-menu");
  const body = document.body;

  if (mobileMenuBtn && nav) {
    mobileMenuBtn.addEventListener("click", function () {
      const expanded = this.getAttribute("aria-expanded") === "true" || false;
      this.setAttribute("aria-expanded", !expanded);
      this.classList.toggle("active");
      nav.classList.toggle("active");

      // Prevent body scrolling when menu is open
      if (!expanded) {
        body.style.overflow = "hidden";
      } else {
        body.style.overflow = "";
      }
    });
  }

  // Close mobile menu when clicking a nav link
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (mobileMenuBtn && nav) {
        mobileMenuBtn.setAttribute("aria-expanded", "false");
        mobileMenuBtn.classList.remove("active");
        nav.classList.remove("active");
        body.style.overflow = "";
      }
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      nav &&
      nav.classList.contains("active") &&
      !nav.contains(e.target) &&
      !mobileMenuBtn.contains(e.target)
    ) {
      mobileMenuBtn.setAttribute("aria-expanded", "false");
      mobileMenuBtn.classList.remove("active");
      nav.classList.remove("active");
      body.style.overflow = "";
    }
  });

  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && nav && nav.classList.contains("active")) {
      mobileMenuBtn.setAttribute("aria-expanded", "false");
      mobileMenuBtn.classList.remove("active");
      nav.classList.remove("active");
      body.style.overflow = "";
    }
  });

  // Navbar highlighting based on scroll position
  function updateActiveNavLink() {
    const sections = document.querySelectorAll("section[id]");
    const scrollPosition = window.scrollY + 100;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        document.querySelectorAll(".nav-links a").forEach((link) => {
          link.classList.remove("active");
        });

        // Add active class to current section link
        const activeLink = document.querySelector(
          `.nav-links a[href="#${sectionId}"]`
        );
        if (activeLink) {
          activeLink.classList.add("active");
        }
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

  // Scroll-based animations
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(".animate-element");

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const delay = element.getAttribute("data-delay") || 0;

          setTimeout(() => {
            element.classList.add("visible");
          }, delay);

          observer.unobserve(element);
        }
      });
    }, observerOptions);

    animatedElements.forEach((element) => {
      observer.observe(element);
    });
  }

  // Hero Carousel
  function initHeroCarousel() {
    const slides = document.querySelectorAll(".carousel-slide");
    const indicators = document.querySelectorAll(".indicator");
    let currentSlide = 0;
    let slideInterval;
    let isTransitioning = false;

    function showSlide(index) {
      if (isTransitioning) return;
      isTransitioning = true;

      slides.forEach((slide) => slide.classList.remove("active"));
      indicators.forEach((indicator) => indicator.classList.remove("active"));

      currentSlide = (index + slides.length) % slides.length;
      slides[currentSlide].classList.add("active");
      indicators[currentSlide].classList.add("active");

      // Reset transition lock after animation completes
      setTimeout(() => {
        isTransitioning = false;
      }, 1500);
    }

    function nextSlide() {
      showSlide(currentSlide + 1);
    }

    // Set up click events for indicators
    indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", () => {
        if (isTransitioning) return;
        clearInterval(slideInterval);
        showSlide(index);
        startSlideInterval();
      });
    });

    function startSlideInterval() {
      clearInterval(slideInterval);
      slideInterval = setInterval(nextSlide, 4000);
    }

    // Initialize the carousel
    showSlide(0);
    startSlideInterval();

    // Preload images for smoother transitions
    function preloadImages() {
      slides.forEach((slide) => {
        const img = slide.querySelector("img");
        if (img) {
          const src = img.getAttribute("src");
          if (src) {
            const preloadImg = new Image();
            preloadImg.src = src;
          }
        }
      });
    }

    // Preload next slide's image
    function preloadNextSlide() {
      const nextIndex = (currentSlide + 1) % slides.length;
      const nextImg = slides[nextIndex].querySelector("img");
      if (nextImg) {
        const src = nextImg.getAttribute("src");
        if (src) {
          const preloadImg = new Image();
          preloadImg.src = src;
        }
      }
    }

    preloadImages();

    // Add event listener to preload next slide when current slide is shown
    slides.forEach((slide) => {
      slide.addEventListener("transitionend", () => {
        if (slide.classList.contains("active")) {
          preloadNextSlide();
        }
      });
    });
  }

  // Hero section animated text
  function initAnimatedText() {
    const container = document.querySelector(".animated-text-container");
    if (!container) return;

    const textElement = container.querySelector(".animated-text");

    // Lasallian values
    const words = [
      "Sharing",
      "Compassion",
      "Generosity",
      "Kindness",
      "Empathy",
      "Faith",
    ];

    let currentIndex = 0;

    // Type and delete a word
    function animateWord(word) {
      let i = 0;
      const typeInterval = setInterval(() => {
        // Typing phase
        if (i <= word.length) {
          textElement.textContent = word.substring(0, i);
          i++;
        } else {
          // Word is complete, clear interval
          clearInterval(typeInterval);

          // Wait before deleting
          setTimeout(() => {
            let j = word.length;
            const deleteInterval = setInterval(() => {
              // Deleting phase
              if (j > 0) {
                textElement.textContent = word.substring(0, j - 1);
                j--;
              } else {
                // Deletion complete, clear interval
                clearInterval(deleteInterval);

                // Move to next word
                currentIndex = (currentIndex + 1) % words.length;

                // Wait before typing next word
                setTimeout(() => {
                  animateWord(words[currentIndex]);
                }, 500);
              }
            }, 50); // Delete speed
          }, 2000); // Wait time before deleting
        }
      }, 100); // Type speed
    }

    // Start the animation
    animateWord(words[0]);
  }

  // Testimonial slider
  function initTestimonialSlider() {
    const testimonialSlides = document.querySelectorAll(".testimonial-slide");
    const testimonialDots = document.querySelectorAll(".slider-dots .dot");
    const prevTestimonialBtn = document.getElementById("prev-btn");
    const nextTestimonialBtn = document.getElementById("next-btn");
    let currentTestimonial = 0;
    let isTestimonialSliding = false;
    let testimonialInterval;

    function showTestimonial(n) {
      if (isTestimonialSliding) return;
      isTestimonialSliding = true;

      // Hide all slides first
      testimonialSlides.forEach((slide) => {
        slide.style.display = "none";
        slide.classList.remove("active");
      });

      testimonialDots.forEach((dot) => {
        dot.classList.remove("active");
        dot.setAttribute("aria-selected", "false");
      });

      // Calculate the new index with proper wrapping
      currentTestimonial =
        (n + testimonialSlides.length) % testimonialSlides.length;

      // Show the current slide with a fade effect
      testimonialSlides[currentTestimonial].style.display = "block";

      setTimeout(() => {
        testimonialSlides[currentTestimonial].classList.add("active");
        testimonialDots[currentTestimonial].classList.add("active");
        testimonialDots[currentTestimonial].setAttribute(
          "aria-selected",
          "true"
        );
        isTestimonialSliding = false;
      }, 10);
    }

    // Set up navigation buttons
    if (prevTestimonialBtn && nextTestimonialBtn) {
      prevTestimonialBtn.addEventListener("click", () => {
        clearInterval(testimonialInterval);
        showTestimonial(currentTestimonial - 1);
        startAutoSlide();
      });

      nextTestimonialBtn.addEventListener("click", () => {
        clearInterval(testimonialInterval);
        showTestimonial(currentTestimonial + 1);
        startAutoSlide();
      });
    }

    // Set up dot navigation
    testimonialDots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        clearInterval(testimonialInterval);
        showTestimonial(index);
        startAutoSlide();
      });

      dot.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          clearInterval(testimonialInterval);
          showTestimonial(index);
          startAutoSlide();
        }
      });
    });

    // Auto slide functionality
    function startAutoSlide() {
      clearInterval(testimonialInterval);
      testimonialInterval = setInterval(() => {
        showTestimonial(currentTestimonial + 1);
      }, 6000);
    }

    // Pause/resume on hover
    const testimonialSlider = document.querySelector(".testimonial-slider");
    if (testimonialSlider) {
      testimonialSlider.addEventListener("mouseenter", () => {
        clearInterval(testimonialInterval);
      });

      testimonialSlider.addEventListener("mouseleave", () => {
        startAutoSlide();
      });

      // Accessibility: pause on focus within
      testimonialSlider.addEventListener("focusin", () => {
        clearInterval(testimonialInterval);
      });

      testimonialSlider.addEventListener("focusout", () => {
        startAutoSlide();
      });
    }

    // Initialize the slider
    showTestimonial(0);
    startAutoSlide();
  }

  // FIXED: Improved counter animation for impact stats
  function initCounters() {
    const counters = document.querySelectorAll(".counter");

    if (!counters.length) return;

    function animateCounter(counter) {
      const target = parseInt(counter.getAttribute("data-target"), 10);
      const duration = 2000; // ms
      const startTime = performance.now();
      let currentValue = 0;

      function updateCounter(timestamp) {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        currentValue = Math.floor(progress * target);
        counter.textContent = currentValue.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target.toLocaleString();
        }
      }

      requestAnimationFrame(updateCounter);
    }

    // Use Intersection Observer to trigger counter animation when visible
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    counters.forEach((counter) => {
      // Set initial value to 0
      counter.textContent = "0";
      counterObserver.observe(counter);
    });
  }

  // FIXED: Enhanced form validation and submission
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    // Input validation functions
    const validators = {
      name: (value) => {
        if (value.trim() === "") return "Please enter your name";
        if (value.trim().length < 2)
          return "Name must be at least 2 characters";
        return "";
      },
      email: (value) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value))
          return "Please enter a valid email address";
        return "";
      },
      subject: (value) => {
        if (value.trim() === "") return "Please enter a subject";
        if (value.trim().length < 5)
          return "Subject must be at least 5 characters";
        return "";
      },
      message: (value) => {
        if (value.trim() === "") return "Please enter your message";
        if (value.trim().length < 10)
          return "Message must be at least 10 characters";
        return "";
      },
    };

    // Real-time validation
    const formInputs = contactForm.querySelectorAll("input, textarea");
    formInputs.forEach((input) => {
      input.addEventListener("blur", function () {
        validateInput(this);
      });

      input.addEventListener("input", function () {
        const errorElement = document.getElementById(`${this.id}-error`);
        if (errorElement && errorElement.style.display !== "none") {
          errorElement.style.display = "none";
        }
      });
    });

    function validateInput(input) {
      const errorElement = document.getElementById(`${input.id}-error`);
      if (!errorElement) return true;

      const validator = validators[input.id];
      if (!validator) return true;

      const errorMessage = validator(input.value);
      if (errorMessage) {
        errorElement.textContent = errorMessage;
        errorElement.style.display = "block";
        input.setAttribute("aria-invalid", "true");
        return false;
      } else {
        errorElement.style.display = "none";
        input.setAttribute("aria-invalid", "false");
        return true;
      }
    }

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Prevent form submission

      // Validate all fields
      let isValid = true;
      formInputs.forEach((input) => {
        if (!validateInput(input)) {
          isValid = false;
        }
      });

      // If form is valid, show success message
      if (isValid) {
        // Get form data
        const formData = {
          name: document.getElementById("name").value,
          email: document.getElementById("email").value,
          subject: document.getElementById("subject").value,
          message: document.getElementById("message").value,
        };

        console.log("Form submitted:", formData);

        // Create success message
        const formContainer = contactForm.parentElement;
        const successMessage = document.createElement("div");
        successMessage.className =
          "success-message animate-element fade-in visible";
        successMessage.innerHTML = `
          <div style="text-align: center; padding: 30px;">
            <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 20px;"></i>
            <h3 style="color: var(--primary-color); margin-bottom: 15px;">Thank you for your message!</h3>
            <p style="font-size: 1.2rem;">We appreciate your interest in the Lasallian Club.</p>
            <p>We will get back to you soon.</p>
          </div>
        `;

        // Replace form with success message
        formContainer.innerHTML = "";
        formContainer.appendChild(successMessage);
      }
    });
  }

  // Newsletter form submission
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get email value
      const emailInput = this.querySelector('input[type="email"]');
      const email = emailInput.value;

      // Basic validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        alert("Please enter a valid email address");
        emailInput.focus();
        return;
      }

      // Here we would typically send the email to a server
      console.log("Newsletter subscription:", email);

      // Show success message
      const successMessage = document.createElement("div");
      successMessage.className = "animate-element fade-in visible";
      successMessage.innerHTML = `
        <p style="color: var(--primary-color); font-weight: bold; display: flex; align-items: center; gap: 10px;">
          <i class="fas fa-check-circle"></i> Thank you for subscribing to our newsletter!
        </p>
      `;

      // Replace form with success message
      this.innerHTML = "";
      this.appendChild(successMessage);
    });
  }

  // FIXED: Enhanced AI chatbot with proper quick reply functionality
  function initChatbot() {
    const chatbotToggle = document.getElementById("chatbot-toggle");
    const chatbotClose = document.getElementById("chatbot-close");
    const chatbotBox = document.getElementById("chatbot-box");
    const chatbotMessages = document.getElementById("chatbot-messages");
    const chatbotInput = document.getElementById("chatbot-input-field");
    const chatbotSend = document.getElementById("chatbot-send");

    if (
      !chatbotToggle ||
      !chatbotClose ||
      !chatbotBox ||
      !chatbotMessages ||
      !chatbotInput ||
      !chatbotSend
    ) {
      return; // Exit if any element is missing
    }

    // Toggle chatbot visibility
    chatbotToggle.addEventListener("click", function () {
      chatbotBox.classList.add("active");
      // Add welcome message if it's the first open
      if (chatbotMessages.children.length === 0) {
        addBotMessage(
          "Hi! I'm the Lasallian Club AI. How can I help you today?"
        );
      }
    });

    chatbotClose.addEventListener("click", function () {
      chatbotBox.classList.remove("active");
    });

    // Send message function
    function sendMessage() {
      const message = chatbotInput.value.trim();
      if (message) {
        addUserMessage(message);
        chatbotInput.value = "";

        // Process with Coze API
        processWithCoze(message);
      }
    }

    // Add event listeners for sending messages
    chatbotSend.addEventListener("click", sendMessage);
    chatbotInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        sendMessage();
      }
    });

    // Add message to chat
    function addUserMessage(text) {
      const messageDiv = document.createElement("div");
      messageDiv.className = "message user-message";
      messageDiv.textContent = text;
      chatbotMessages.appendChild(messageDiv);
      scrollToBottom();
    }

    function addBotMessage(text, includeQuickReplies = false) {
      const messageDiv = document.createElement("div");
      messageDiv.className = "message bot-message";
      messageDiv.textContent = text;

      // Add quick replies to the first bot message only
      if (includeQuickReplies) {
        const quickReplies = createQuickReplies();
        messageDiv.appendChild(quickReplies);
      }

      chatbotMessages.appendChild(messageDiv);
      scrollToBottom();
    }

    // Create quick reply buttons for the chatbot
    function createQuickReplies() {
      const quickReplies = [
        { text: "Mission", query: "What is your mission?" },
        { text: "Join Club", query: "How can I join the club?" },
        { text: "Activities", query: "What activities do you organize?" },
        { text: "Contact", query: "How can I contact you?" },
      ];

      const repliesContainer = document.createElement("div");
      repliesContainer.className = "quick-replies";

      quickReplies.forEach((reply) => {
        const button = document.createElement("button");
        button.className = "quick-reply-btn";
        button.textContent = reply.text;
        button.addEventListener("click", () => {
          // FIXED: First add the user message to show what was clicked
          addUserMessage(reply.query);

          // Then process the query
          processWithCoze(reply.query);
        });
        repliesContainer.appendChild(button);
      });

      return repliesContainer;
    }

    function scrollToBottom() {
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Process message with Coze API
    function processWithCoze(message) {
      // Show typing indicator
      const typingDiv = document.createElement("div");
      typingDiv.className = "message bot-message typing";
      chatbotMessages.appendChild(typingDiv);
      scrollToBottom();

      // Replace this with actual Coze API integration
      setTimeout(() => {
        // Remove typing indicator
        chatbotMessages.removeChild(typingDiv);

        // For now, use a simple response system
        let response = getSimpleResponse(message);
        addBotMessage(response);
      }, 1000);
    }

    // Simple response system until Coze API is integrated
    function getSimpleResponse(message) {
      message = message.toLowerCase();

      if (message.includes("mission") || message.includes("purpose")) {
        return "Our mission is to spread the spirit of sharing and support those in need through community service, fundraising, and outreach programs that make a real difference in Adama.";
      } else if (
        message.includes("get involved") ||
        message.includes("join") ||
        message.includes("volunteer")
      ) {
        return "You can get involved by becoming a member, volunteering for our events, or making a donation. Visit the 'Get Involved' section on our website for more details.";
      } else if (message.includes("contact") || message.includes("reach")) {
        return "You can contact us at senjolasallians@stjosephadama.edu or call +251 123 456 789. We're also available every Friday from 3:30 PM to 5:00 PM at the School Library.";
      } else if (
        message.includes("activities") ||
        message.includes("programs") ||
        message.includes("events")
      ) {
        return "We organize various activities including elder care visits, meal preparation initiatives, educational outreach, community food drives, and our annual charity walk. Check the 'Activities' section for upcoming events.";
      } else if (
        message.includes("donate") ||
        message.includes("contribution")
      ) {
        return "You can make a donation by clicking the 'Donate Now' button at the top of our website or visiting the 'Get Involved' section. Your contribution helps us support those in need in the Adama community.";
      } else if (
        message.includes("name") ||
        message.includes("senjo") ||
        message.includes("lasallians")
      ) {
        return "SenjoLasallians is the name of our organization at St. Joseph Catholic School in Adama. The name combines 'Senjo' from St. Joseph and 'Lasallians' which reflects our connection to the Lasallian educational tradition.";
      } else {
        return "Thank you for your message. I'm still learning! For specific information, please check our website sections or contact us directly at senjolasallians@stjosephadama.edu.";
      }
    }

    // Initialize with welcome message and quick replies
    if (
      chatbotMessages.children.length === 0 &&
      chatbotBox.classList.contains("active")
    ) {
      addBotMessage(
        "Hi! I'm the Lasallian Club AI. How can I help you today?",
        true // Include quick replies
      );
    }
  }

  // Debounce function to limit how often a function can be called
  function debounce(func, wait) {
    let timeout;
    return function () {
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Add scroll event listeners with debounce for better performance
  window.addEventListener(
    "scroll",
    debounce(() => {
      handleHeaderScroll();
      updateActiveNavLink();
    }, 10)
  );

  // Initialize functions on page load
  handleHeaderScroll();
  updateActiveNavLink();

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

      // Add loading attribute for better performance
      element.setAttribute("loading", "lazy");
    }
  }

  // Apply to all images
  document.querySelectorAll("img").forEach(createPlaceholder);

  // Add loading="lazy" to all images below the fold
  document.querySelectorAll("img:not([loading])").forEach((img) => {
    if (!isElementInViewport(img)) {
      img.setAttribute("loading", "lazy");
    }
  });

  // Helper function to check if element is in viewport
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // Add smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      if (this.getAttribute("href") !== "#") {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          const headerOffset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }
    });
  });
});
