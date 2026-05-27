/* =====================================================
   script.js — Spice Land Kebabish
   - Navbar: scroll shadow + active link tracking
   - Slider: responsive, drag/touch, dots, arrows
   - Mobile menu, modals, ripple, keyboard nav
===================================================== */

// ========== NAVBAR SCROLL SHADOW ==========
const mainNavbar = document.getElementById('mainNavbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        mainNavbar.classList.add('scrolled');
    } else {
        mainNavbar.classList.remove('scrolled');
    }
});

// ========== ACTIVE NAV LINK ON SCROLL ==========
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.navbar-menu-desktop .nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, { threshold: 0.3, rootMargin: '-60px 0px -60px 0px' });

sections.forEach(section => sectionObserver.observe(section));

// ========== MOBILE MENU TOGGLE ==========
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const toggle = document.getElementById('hamburgerToggle');

    if (menu.classList.contains('open')) {
        menu.classList.remove('open');
        document.body.style.overflow = 'auto';
        toggle.classList.remove('active');
    } else {
        menu.classList.add('open');
        document.body.style.overflow = 'hidden';
        toggle.classList.add('active');
    }
}

document.addEventListener('click', (e) => {
    const menu = document.getElementById('mobileMenu');
    const toggle = document.getElementById('hamburgerToggle');
    if (
        menu.classList.contains('open') &&
        !menu.contains(e.target) &&
        !toggle.contains(e.target)
    ) {
        menu.classList.remove('open');
        document.body.style.overflow = 'auto';
        toggle.classList.remove('active');
    }
});

// ========== SLIDER FACTORY ==========
/**
 * Creates a fully responsive slider.
 * @param {object} cfg
 *   track       — the scrolling flex container
 *   prevBtn     — previous arrow button
 *   nextBtn     — next arrow button
 *   dotsEl      — container for dot buttons
 *   getPerView  — () => number of items visible
 */
function createSlider({ track, prevBtn, nextBtn, dotsEl, getPerView }) {
    if (!track) return;

    const items = Array.from(track.children);
    const total = items.length;
    let currentIndex = 0;
    let startX = 0;
    let isDragging = false;
    let dragOffset = 0;
    let animFrame;

    // ---- helpers ----
    function itemWidth() {
        if (!items[0]) return 200;
        const style = getComputedStyle(track);
        const gap = parseFloat(style.gap) || 20;
        const wrapperW = track.parentElement.clientWidth;
        const pv = getPerView();
        return (wrapperW - gap * (pv - 1)) / pv;
    }

    function stepWidth() {
        const style = getComputedStyle(track);
        const gap = parseFloat(style.gap) || 20;
        return itemWidth() + gap;
    }

    function maxIndex() {
        return Math.max(0, total - getPerView());
    }

    // Size all items
    function sizeItems() {
        const w = itemWidth();
        items.forEach(item => {
            item.style.width = w + 'px';
            item.style.minWidth = w + 'px';
            item.style.flexShrink = '0';
        });
    }

    // Move to index
    function goTo(index, instant = false) {
        currentIndex = Math.max(0, Math.min(index, maxIndex()));
        const offset = currentIndex * stepWidth();

        if (instant) {
            track.style.transition = 'none';
        } else {
            track.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
        }
        track.style.transform = `translateX(-${offset}px)`;

        updateButtons();
        updateDots();
    }

    function updateButtons() {
        if (prevBtn) prevBtn.disabled = currentIndex === 0;
        if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex();
    }

    function updateDots() {
        if (!dotsEl) return;
        const dots = dotsEl.querySelectorAll('.slider-dot');
        const pages = maxIndex() + 1;
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    function buildDots() {
        if (!dotsEl) return;
        dotsEl.innerHTML = '';
        const pages = maxIndex() + 1;
        for (let i = 0; i < pages; i++) {
            const btn = document.createElement('button');
            btn.className = 'slider-dot' + (i === 0 ? ' active' : '');
            btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
            btn.addEventListener('click', () => goTo(i));
            dotsEl.appendChild(btn);
        }
    }

    // ---- init ----
    function init() {
        sizeItems();
        buildDots();
        goTo(currentIndex, true);
    }

    // ---- arrows ----
    if (prevBtn) prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    // ---- drag (mouse) ----
    track.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        dragOffset = 0;
        track.classList.add('dragging');
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        dragOffset = e.clientX - startX;
        const base = currentIndex * stepWidth();
        track.style.transition = 'none';
        track.style.transform = `translateX(${-base + dragOffset}px)`;
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        track.classList.remove('dragging');
        const threshold = stepWidth() * 0.25;
        if (dragOffset < -threshold) goTo(currentIndex + 1);
        else if (dragOffset > threshold) goTo(currentIndex - 1);
        else goTo(currentIndex);
        dragOffset = 0;
    });

    // ---- touch ----
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        track.style.transition = 'none';
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
        const diff = e.touches[0].clientX - touchStartX;
        const base = currentIndex * stepWidth();
        track.style.transform = `translateX(${-base + diff}px)`;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        const diff = e.changedTouches[0].clientX - touchStartX;
        const threshold = stepWidth() * 0.2;
        if (diff < -threshold) goTo(currentIndex + 1);
        else if (diff > threshold) goTo(currentIndex - 1);
        else goTo(currentIndex);
    });

    // ---- resize ----
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            sizeItems();
            buildDots();
            goTo(Math.min(currentIndex, maxIndex()), true);
        }, 120);
    });

    init();

    return { goTo, getIndex: () => currentIndex };
}

// ========== INIT DISH SLIDER ==========
const dishSlider = createSlider({
    track: document.getElementById('dishSlider'),
    prevBtn: document.getElementById('dishPrev'),
    nextBtn: document.getElementById('dishNext'),
    dotsEl: document.getElementById('dishDots'),
    getPerView: () => {
        const w = window.innerWidth;
        if (w >= 1200) return 4;
        if (w >= 900) return 3;
        if (w >= 600) return 2;
        return 1.5;  // partial peek on small mobile
    }
});

// ========== INIT TESTIMONIALS SLIDER ==========
const testSlider = createSlider({
    track: document.getElementById('testimonialsSlider'),
    prevBtn: document.getElementById('testPrev'),
    nextBtn: document.getElementById('testNext'),
    dotsEl: document.getElementById('testDots'),
    getPerView: () => {
        const w = window.innerWidth;
        if (w >= 1100) return 3;
        if (w >= 720) return 2;
        return 1;
    }
});

// ========== SCROLL ANIMATIONS ==========
const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll(
    '.hungry-section, .special-combo-section, .newsletter-final-section'
).forEach(el => animObserver.observe(el));

// ========== DISH MODAL ==========
const dishData = {
    'reshmi-kebab': {
        name: 'Reshmi Kebab',
        image: 'images/RESHMI KEBAB.jpeg',
        desc: 'Silky smooth kebab made with minced chicken and cream, grilled to golden perfection.',
        spice: '3/5',
        serves: '2 persons',
        price: 'Rs. 660'
    },
    'chicken-tikka': {
        name: 'Chicken Tikka',
        image: 'images/CHICKEN TIKKA.jpeg',
        desc: 'Tender chicken marinated in yogurt and aromatic spices, charcoal grilled.',
        spice: '4/5',
        serves: '2 persons',
        price: 'Rs. 600'
    },
    'seekh-kebab': {
        name: 'Seekh Kebab',
        image: 'images/SEEKH KEBAB.jpeg',
        desc: 'Minced meat seasoned with fresh herbs and spices, skewered and grilled.',
        spice: '4/5',
        serves: '2 persons',
        price: 'Rs. 550'
    },
    'bbq-platter': {
        name: 'BBQ Platter',
        image: 'images/BBQ PLATTER.png',
        desc: 'A grand assortment of our finest grilled meats — perfect for sharing.',
        spice: '4/5',
        serves: '3-4 persons',
        price: 'Rs. 1200'
    },
    'zinger-burger': {
        name: 'Zinger Burger',
        image: 'images/ZINGER BURGER.jpeg',
        desc: 'Crispy spiced chicken fillet stacked in a soft bun with fresh veggies and sauce.',
        spice: '3/5',
        serves: '1 person',
        price: 'Rs. 550'
    }
};

function openDishModal(dishId) {
    const dish = dishData[dishId];
    if (!dish) return;
    document.getElementById('modalDishImage').src = dish.image;
    document.getElementById('modalDishName').textContent = dish.name;
    document.getElementById('modalDishDesc').textContent = dish.desc;
    document.getElementById('modalSpiceLevel').textContent = dish.spice;
    document.getElementById('modalServes').textContent = dish.serves;
    document.getElementById('modalPrice').textContent = dish.price;
    document.getElementById('dishModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDishModal() {
    document.getElementById('dishModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ========== GALLERY MODAL ==========
let currentGalleryIndex = 0;
const galleryImages = [
    'images/RESHMI KEBAB.jpeg',
    'images/CHICKEN TIKKA.jpeg',
    'images/SEEKH KEBAB.jpeg',
    'images/BBQ PLATTER.png',
    'images/ZINGER BURGER.jpeg'
];

function openGalleryModal(index = 0) {
    currentGalleryIndex = index;
    document.getElementById('galleryImage').src = galleryImages[currentGalleryIndex];
    document.getElementById('galleryModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeGalleryModal() {
    document.getElementById('galleryModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function nextGalleryImage() {
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
    document.getElementById('galleryImage').src = galleryImages[currentGalleryIndex];
}

function prevGalleryImage() {
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
    document.getElementById('galleryImage').src = galleryImages[currentGalleryIndex];
}

// ========== MODAL CLOSE ON OUTSIDE CLICK ==========
document.addEventListener('click', (e) => {
    if (e.target === document.getElementById('dishModal'))    closeDishModal();
    if (e.target === document.getElementById('galleryModal')) closeGalleryModal();
});

// ========== KEYBOARD NAVIGATION ==========
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeDishModal(); closeGalleryModal(); }
    const galleryModal = document.getElementById('galleryModal');
    if (galleryModal.classList.contains('active')) {
        if (e.key === 'ArrowRight') nextGalleryImage();
        if (e.key === 'ArrowLeft')  prevGalleryImage();
    }
});

// ========== BUTTON RIPPLE EFFECT ==========
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function(e) {
        if (this.id === 'hamburgerToggle') return;
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
        ripple.classList.add('ripple');
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});
