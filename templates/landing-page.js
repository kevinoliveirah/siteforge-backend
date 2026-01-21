// Smooth scrolling para links de navegação
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animação de entrada para elementos quando ficam visíveis
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observar elementos que devem ser animados
document.querySelectorAll('.feature-card, .stat, .info-item').forEach(el => {
    observer.observe(el);
});

// Header transparente ao scroll
const header = document.querySelector('.header');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 100) {
        header.classList.add('header-scrolled');
    } else {
        header.classList.remove('header-scrolled');
    }

    lastScrollY = currentScrollY;
});

// Validação do formulário de contato
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        // Simulação de envio
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        // Simular delay de envio
        setTimeout(() => {
            alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
            this.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
}

// Animação de contadores nas estatísticas
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');

    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const duration = 2000; // 2 segundos
        const step = target / (duration / 16); // 60fps
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 16);
    });
}

// Executar animação quando a seção about estiver visível
const aboutSection = document.querySelector('.about');
if (aboutSection) {
    const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                aboutObserver.unobserve(entry.target);
            }
        });
    });
    aboutObserver.observe(aboutSection);
}

// Menu mobile (se necessário no futuro)
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('mobile-menu-open');
    }
}

// Adicionar classes CSS para animações
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: fadeInUp 0.6s ease-out forwards;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .header-scrolled {
        background: rgba(255, 255, 255, 0.98) !important;
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    }

    .mobile-menu-open {
        display: flex !important;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        padding: 1rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    @media (min-width: 769px) {
        .mobile-menu-open {
            display: flex !important;
        }
    }
`;
document.head.appendChild(style);

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('{{project.name}} - Site carregado com sucesso!');
});