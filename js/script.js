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

// Close mobile menu on outside click
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

// ========== SCROLL ANIMATIONS ==========
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

document.querySelectorAll(
    '.dish-card, .testimonial-item, .hungry-section, .special-combo-section, .newsletter-final-section'
).forEach(el => observer.observe(el));

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

    const modal = document.getElementById('dishModal');
    modal.classList.add('active');
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

// ========== DISH SLIDER ==========
function scrollDishes(direction) {
    const slider = document.getElementById('dishSlider');
    slider.scrollBy({ left: direction * 240, behavior: 'smooth' });
}

// ========== TESTIMONIALS SLIDER ==========
function scrollTestimonials(direction) {
    const slider = document.getElementById('testimonialsSlider');
    slider.scrollBy({ left: direction * 300, behavior: 'smooth' });
}

// ========== MODAL CLOSE ON OUTSIDE CLICK ==========
document.addEventListener('click', (e) => {
    const dishModal    = document.getElementById('dishModal');
    const galleryModal = document.getElementById('galleryModal');
    if (e.target === dishModal)    closeDishModal();
    if (e.target === galleryModal) closeGalleryModal();
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
        // Skip ripple on hamburger and close buttons
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

// ========== SMOOTH SCROLL FOR ANCHORS ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});