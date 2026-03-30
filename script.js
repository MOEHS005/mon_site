/**
 * ZINWEAR — Premium African Streetwear
 * script.js — Main JavaScript
 * Author: Senior Web Developer / Art Director
 */

/* ============================================================
   1. NAVBAR SCROLL BEHAVIOR
   ============================================================ */
(function initNavbar() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  function onScroll() {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load
})();

/* ============================================================
   2. ACTIVE NAV LINK
   ============================================================ */
(function setActiveNav() {
  const links = document.querySelectorAll('.navbar-nav .nav-link');
  const current = window.location.pathname.split('/').pop() || 'index.html';

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

/* ============================================================
   3. SCROLL ANIMATIONS (Intersection Observer)
   ============================================================ */
(function initScrollAnimations() {
  const targets = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Respect delay attribute for staggered animations
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  targets.forEach(el => observer.observe(el));
})();

/* ============================================================
   4. HERO BACKGROUND PARALLAX + LOAD ANIMATION
   ============================================================ */
(function initHero() {
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    // Trigger subtle zoom-out effect on load
    setTimeout(() => heroBg.classList.add('loaded'), 100);

    // Subtle parallax on scroll
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroBg.style.transform = `scale(1) translateY(${scrollY * 0.2}px)`;
      }
    }, { passive: true });
  }
})();

/* ============================================================
   5. CART SIMULATION
   ============================================================ */
const Cart = (function () {
  let items = [];
  let count = 0;

  // Update cart badge in navbar
  function updateBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  }

  // Show notification
  function showNotification(productName) {
    let notif = document.getElementById('cart-notification');
    if (!notif) return;

    notif.querySelector('.notif-text').textContent = productName + ' ajouté au panier';
    notif.classList.add('show');

    setTimeout(() => notif.classList.remove('show'), 3500);
  }

  // Add item
  function addItem(productName, price) {
    items.push({ name: productName, price });
    count++;
    updateBadge();
    showNotification(productName);
  }

  return { addItem, getCount: () => count, getItems: () => items };
})();

// Bind "Add to cart" buttons
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const card = this.closest('.product-card');
      const name = card ? (card.querySelector('.product-name')?.textContent || 'Produit') : 'Produit';
      const priceEl = card ? card.querySelector('.product-price') : null;
      const price = priceEl ? priceEl.textContent : '0';

      Cart.addItem(name, price);

      // Button feedback
      const original = this.innerHTML;
      this.innerHTML = '<span>✓ Ajouté</span>';
      this.style.background = 'var(--violet)';
      this.style.borderColor = 'var(--violet)';
      this.style.color = 'var(--white)';

      setTimeout(() => {
        this.innerHTML = original;
        this.style.background = '';
        this.style.borderColor = '';
        this.style.color = '';
      }, 1800);
    });
  });
});

/* ============================================================
   6. CONTACT FORM VALIDATION
   ============================================================ */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const fieldRules = {
    name: {
      validate: v => v.trim().length >= 2,
      msg: 'Veuillez entrer votre nom (minimum 2 caractères).'
    },
    email: {
      validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      msg: 'Veuillez entrer une adresse email valide.'
    },
    subject: {
      validate: v => v.trim().length >= 2,
      msg: 'Veuillez choisir ou entrer un sujet.',
      optional: false
    },
    message: {
      validate: v => v.trim().length >= 10,
      msg: 'Votre message doit contenir au moins 10 caractères.'
    }
  };

  function showError(field, msg) {
    field.classList.add('is-invalid');
    let fb = field.parentElement.querySelector('.invalid-feedback-zin');
    if (fb) {
      fb.textContent = msg;
      fb.classList.add('visible');
    }
  }

  function clearError(field) {
    field.classList.remove('is-invalid');
    let fb = field.parentElement.querySelector('.invalid-feedback-zin');
    if (fb) fb.classList.remove('visible');
  }

  // Real-time validation on blur
  form.querySelectorAll('.form-control-zin').forEach(input => {
    input.addEventListener('blur', function () {
      const rule = fieldRules[this.id];
      if (rule && this.value) {
        if (!rule.validate(this.value)) showError(this, rule.msg);
        else clearError(this);
      }
    });

    input.addEventListener('input', function () {
      if (this.classList.contains('is-invalid')) clearError(this);
    });
  });

  // Submit
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    let isValid = true;

    Object.entries(fieldRules).forEach(([id, rule]) => {
      const field = form.querySelector('#' + id);
      if (!field) return;
      if (rule.optional && !field.value.trim()) return; // skip optional empty

      if (!rule.validate(field.value)) {
        showError(field, rule.msg);
        isValid = false;
      } else {
        clearError(field);
      }
    });

    if (!isValid) return;

    // Success feedback
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Envoi en cours...</span>';
    submitBtn.disabled = true;

    setTimeout(() => {
      const alertEl = document.getElementById('form-alert');
      if (alertEl) {
        alertEl.className = 'alert-zinwear alert-success-zin';
        alertEl.textContent = '✓ Message envoyé avec succès. Nous vous répondrons dans les 48h.';
        alertEl.style.display = 'block';
      }
      form.reset();
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      // Scroll to alert
      if (alertEl) alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 1500);
  });
})();

/* ============================================================
   7. PRODUCTS FILTER (products page)
   ============================================================ */
(function initProductsFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card-wrapper');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const filter = this.dataset.filter;

      productCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'block';
          card.style.animation = 'none';
          card.offsetHeight; // reflow
          card.style.animation = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();

/* ============================================================
   8. BACK TO TOP BUTTON
   ============================================================ */
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) btn.classList.add('show');
    else btn.classList.remove('show');
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================================
   9. CHATBOT — AI-POWERED ASSISTANT
   ============================================================ */
(function initChatbot() {
  const trigger = document.getElementById('chatbot-trigger');
  const window_el = document.getElementById('chatbot-window');
  const closeBtn = document.getElementById('chatbot-close');
  const input = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send');
  const messages = document.getElementById('chatbot-messages');

  if (!trigger || !window_el) return;

  let isOpen = false;
  let hasGreeted = false;

  // --- Toggle chatbot window ---
  trigger.addEventListener('click', () => {
    isOpen = !isOpen;
    window_el.classList.toggle('open', isOpen);

    // Greeting on first open
    if (isOpen && !hasGreeted) {
      hasGreeted = true;
      setTimeout(() => {
        addBotMessage("Bonjour, je suis l'assistant de ZINWEAR. Comment puis-je vous aider aujourd'hui ? 🖤");
      }, 400);
    }

    // Update trigger icon
    trigger.innerHTML = isOpen
      ? `<svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>`
      : `<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`;
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      isOpen = false;
      window_el.classList.remove('open');
      trigger.innerHTML = `<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`;
    });
  }

  // --- Add message to chat ---
  function addBotMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'chat-msg bot';
    msg.innerHTML = `<div class="chat-msg-bubble">${text}</div>`;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function addUserMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'chat-msg user';
    msg.innerHTML = `<div class="chat-msg-bubble">${text}</div>`;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function addTypingIndicator() {
    const typing = document.createElement('div');
    typing.className = 'chat-msg bot';
    typing.id = 'typing-indicator';
    typing.innerHTML = `
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>`;
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
    return typing;
  }

  // --- ZINWEAR knowledge base for intelligent responses ---
  const zinwearKB = {
    brand: `ZINWEAR est une marque de streetwear haut de gamme africaine, fondée à Abomey-Calavi, Bénin. Elle fusionne l'héritage culturel africain, la sophistication contemporaine et une vision futuriste.`,
    founders: `ZINWEAR a été fondée par trois visionnaires : MOMBO OMIAGA Emmanuel (Directeur Créatif), AGBO Helvis (Directeur Artistique) et DAVAKAN Laïs Morgan (Directrice de Collection).`,
    slogan: `Notre slogan : <em>"Born in Africa. Worn by the World."</em> 🌍`,
    products: `Notre collection inclut des hoodies premium, t-shirts oversize, vestes streetwear, pantalons cargo et accessoires exclusifs. Tous disponibles sur notre page <a href="products.html" style="color:var(--violet-glow)">Produits</a>.`,
    location: `Nous sommes basés à Abomey-Calavi, Bénin. Contact : contact@zinwear.com | +229 97 00 00 00`,
    style: `L'ADN visuel de ZINWEAR repose sur le luxe minimaliste, l'esthétique urbaine et les symboles africains abstraits. Notre palette : noir profond, blanc ivoire, et un accent violet signature.`,
    price: `Nos prix varient de 18 000 FCFA pour un t-shirt à 85 000 FCFA pour une veste premium. Chaque pièce est une édition limitée.`,
    shipping: `Nous livrons dans tout le Bénin, en Afrique de l'Ouest et internationalement. Délai : 3-5 jours ouvrés localement, 7-14 jours à l'international.`,
    contact: `Pour nous contacter, visitez notre <a href="contact.html" style="color:var(--violet-glow)">page contact</a> ou écrivez à contact@zinwear.com`,
    default: `Je suis l'assistant ZINWEAR. Je peux vous parler de notre marque, nos produits, les fondateurs, notre esthétique ou vous aider à trouver une pièce. Que souhaitez-vous savoir ? 🖤`
  };

  /**
   * Simulate intelligent AI response via fetch().
   * In production, this points to a backend proxy that holds the API key.
   * The key is never exposed client-side.
   */
  async function getAIResponse(userMessage) {
    const msg = userMessage.toLowerCase();

    // Intent detection — local knowledge base
    if (msg.includes('bonjour') || msg.includes('salut') || msg.includes('hello') || msg.includes('bonsoir')) {
      return 'Bonjour ! Bienvenue chez ZINWEAR. Comment puis-je vous aider ? 🖤';
    }
    if (msg.includes('marque') || msg.includes('brand') || msg.includes('qui êtes') || msg.includes('zinwear c')) {
      return zinwearKB.brand;
    }
    if (msg.includes('fondateur') || msg.includes('founder') || msg.includes('créé') || msg.includes('mombo') || msg.includes('agbo') || msg.includes('davakan')) {
      return zinwearKB.founders;
    }
    if (msg.includes('slogan') || msg.includes('born') || msg.includes('worn')) {
      return zinwearKB.slogan;
    }
    if (msg.includes('produit') || msg.includes('collection') || msg.includes('hoodie') || msg.includes('veste') || msg.includes('t-shirt') || msg.includes('tshirt')) {
      return zinwearKB.products;
    }
    if (msg.includes('adresse') || msg.includes('localisation') || msg.includes('où') || msg.includes('bénin') || msg.includes('calavi')) {
      return zinwearKB.location;
    }
    if (msg.includes('style') || msg.includes('esthétique') || msg.includes('design') || msg.includes('adn') || msg.includes('couleur')) {
      return zinwearKB.style;
    }
    if (msg.includes('prix') || msg.includes('tarif') || msg.includes('combien') || msg.includes('fcfa')) {
      return zinwearKB.price;
    }
    if (msg.includes('livraison') || msg.includes('shipping') || msg.includes('délai') || msg.includes('envoyer')) {
      return zinwearKB.shipping;
    }
    if (msg.includes('contact') || msg.includes('email') || msg.includes('téléphone') || msg.includes('joindre')) {
      return zinwearKB.contact;
    }
    if (msg.includes('merci') || msg.includes('thanks')) {
      return 'Avec plaisir ! N\'hésitez pas si vous avez d\'autres questions. Stay ZINWEAR. 🖤';
    }

    /**
     * For queries outside local KB, attempt a call to backend API proxy.
     * This demonstrates the fetch() + API integration pattern.
     * The actual API key lives only on the server.
     */
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: 'ZINWEAR streetwear premium brand assistant, based in Abomey-Calavi, Benin'
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        return data.reply || zinwearKB.default;
      }
    } catch (_) {
      // API unavailable or timeout — fall back to local response
    }

    return zinwearKB.default;
  }

  // --- Handle send ---
  async function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    addUserMessage(text);
    input.value = '';
    input.focus();

    const typing = addTypingIndicator();
    sendBtn.disabled = true;

    // Simulate realistic thinking delay (600–1200ms)
    const delay = 600 + Math.random() * 600;

    const reply = await getAIResponse(text);

    await new Promise(res => setTimeout(res, delay));

    // Remove typing indicator
    const tyEl = document.getElementById('typing-indicator');
    if (tyEl) tyEl.remove();

    addBotMessage(reply);
    sendBtn.disabled = false;
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
})();

/* ============================================================
   10. MOBILE MENU CLOSE ON LINK CLICK
   ============================================================ */
(function initMobileMenu() {
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const navCollapse = document.getElementById('navbarNav');

  if (!navCollapse) return;

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 992) {
        const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
        if (bsCollapse) bsCollapse.hide();
      }
    });
  });
})();

/* ============================================================
   11. COUNTER ANIMATION (for stats)
   ============================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.counter);
        const duration = 1500;
        const start = performance.now();

        function step(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
          el.textContent = Math.floor(eased * target) + (el.dataset.suffix || '');
          if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ============================================================
   12. SMOOTH HOVER CURSOR EFFECT (desktop only)
   ============================================================ */
(function initHoverGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch

  const cards = document.querySelectorAll('.product-card, .team-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', function (e) {
      const rect = this.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      this.style.setProperty('--mouse-x', x + '%');
      this.style.setProperty('--mouse-y', y + '%');
    });
  });
})();
