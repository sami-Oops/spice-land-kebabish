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
    const addButton = document.querySelector('.modal-add-btn');
    if (addButton) addButton.dataset.dishId = dishId;
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

function setupModalAddToCart() {
    const modalAddBtn = document.querySelector('.modal-add-btn');
    if (!modalAddBtn) return;
    modalAddBtn.addEventListener('click', () => {
        const dishId = modalAddBtn.dataset.dishId;
        const dish = dishData[dishId];
        if (!dish) return;
        addToCart({
            id: dishId,
            name: dish.name,
            price: Number(dish.price.replace(/[^0-9]/g, '')),
            image: dish.image,
            quantity: 1
        });
        showToast(`${dish.name} added to cart`);
        updateCartCountBadge();
        closeDishModal();
    });
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

// ===== CART / ORDER PAGE BEHAVIOR =====
const CART_STORAGE_KEY = 'spiceLandCart';

function getCartItems() {
    try {
        return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveCartItems(items) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    updateCartCountBadge();
}

function formatRs(value) {
    return `Rs.${value}`;
}

function getCartTotals(items) {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const delivery = itemCount > 0 ? 150 : 0;
    return { itemCount, subtotal, delivery, total: subtotal + delivery };
}

function updateCartCountBadge() {
    const total = getCartTotals(getCartItems()).itemCount;
    const cartLinks = document.querySelectorAll('.navbar-inner a[href="cart.html"], a.order-btn[href="cart.html"]');

    cartLinks.forEach(link => {
        let badge = link.querySelector('.cart-count-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'cart-count-badge';
            link.appendChild(badge);
        }
        badge.textContent = total;
        badge.style.display = total > 0 ? 'inline-flex' : 'none';
    });
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => toast.classList.remove('visible'), 1800);
    setTimeout(() => toast.remove(), 2200);
}

function addToCart(item) {
    const items = getCartItems();
    const existing = items.find(cartItem => cartItem.id === item.id);
    if (existing) {
        existing.quantity += item.quantity;
    } else {
        items.push({ ...item });
    }
    saveCartItems(items);
}

function setupOrderPage() {
    const orderWrapper = document.querySelector('.order-wrapper');
    if (!orderWrapper) return;

    const cards = orderWrapper.querySelectorAll('.food-card');
    cards.forEach(card => {
        const qtyValue = card.querySelector('.qty-value');
        const dec = card.querySelector('.qty-decrease');
        const inc = card.querySelector('.qty-increase');
        const addBtn = card.querySelector('.add-cart-btn');
        const price = Number(card.dataset.price || 0);

        function updateQty(delta) {
            let qty = Number(qtyValue.textContent.trim()) || 1;
            qty = Math.max(1, qty + delta);
            qtyValue.textContent = qty;
        }

        dec.addEventListener('click', () => updateQty(-1));
        inc.addEventListener('click', () => updateQty(1));

        addBtn.addEventListener('click', () => {
            const quantity = Number(qtyValue.textContent.trim()) || 1;
            const item = {
                id: card.dataset.id,
                name: card.dataset.name,
                price,
                image: card.dataset.image,
                quantity
            };
            addToCart(item);
            showToast(`${item.name} added to cart (${quantity})`);
            updateOrderSummary();
        });
    });

    const summaryItems = document.getElementById('orderSummaryItems');
    const summarySubtotal = document.getElementById('orderSummarySubtotal');
    const summaryDelivery = document.getElementById('orderSummaryDelivery');
    const summaryTotal = document.getElementById('orderSummaryTotal');

    function updateOrderSummary() {
        const totals = getCartTotals(getCartItems());
        if (summaryItems) summaryItems.textContent = totals.itemCount;
        if (summarySubtotal) summarySubtotal.textContent = formatRs(totals.subtotal);
        if (summaryDelivery) summaryDelivery.textContent = formatRs(totals.delivery);
        if (summaryTotal) summaryTotal.textContent = formatRs(totals.total);
    }

    updateOrderSummary();
    updateCartCountBadge();
}

function setupCartPage() {
    const cartLeft = document.querySelector('.cart-left');
    if (!cartLeft) return;

    const summaryItems = document.getElementById('cartItemCount');
    const summarySubtotal = document.getElementById('cartSubtotal');
    const summaryDelivery = document.getElementById('cartDelivery');
    const summaryTotal = document.getElementById('cartTotal');

    function updateCartSummary() {
        const totals = getCartTotals(getCartItems());
        if (summaryItems) summaryItems.textContent = totals.itemCount;
        if (summarySubtotal) summarySubtotal.textContent = formatRs(totals.subtotal);
        if (summaryDelivery) summaryDelivery.textContent = formatRs(totals.delivery);
        if (summaryTotal) summaryTotal.textContent = formatRs(totals.total);
        updateCartCountBadge();
    }

    function persistCart() {
        const items = Array.from(cartLeft.querySelectorAll('.cart-card')).map(card => ({
            id: card.dataset.id,
            name: card.querySelector('h3')?.textContent.trim(),
            price: Number(card.dataset.price || 0),
            quantity: Number(card.querySelector('.cart-qty')?.textContent.trim() || 0),
            image: card.querySelector('img')?.src || ''
        })).filter(item => item.quantity > 0);
        saveCartItems(items);
    }

    function bindCartEvents() {
        cartLeft.querySelectorAll('.cart-card').forEach(card => {
            const decrease = card.querySelector('.cart-decrease');
            const increase = card.querySelector('.cart-increase');
            const qtySpan = card.querySelector('.cart-qty');
            const priceNode = card.querySelector('.cart-price');
            const unitPrice = Number(card.dataset.price || 0);

            function updateCardQty(delta) {
                let qty = Number(qtySpan.textContent.trim()) || 0;
                qty = Math.max(0, qty + delta);
                qtySpan.textContent = qty;
                if (qty === 0) {
                    card.remove();
                } else {
                    priceNode.textContent = formatRs(unitPrice * qty);
                }
                persistCart();
                updateCartSummary();
            }

            decrease?.addEventListener('click', () => updateCardQty(-1));
            increase?.addEventListener('click', () => updateCardQty(1));
        });
    }

    function renderCart() {
        const items = getCartItems();
        cartLeft.innerHTML = '';

        if (!items.length) {
            cartLeft.innerHTML = '<div class="empty-cart"><p>Your cart is empty.</p></div>';
        } else {
            items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'cart-card';
                card.dataset.id = item.id;
                card.dataset.price = item.price.toString();
                card.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-details">
                        <h3>${item.name}</h3>
                        <p>Quantity</p>
                        <div class="qty-control">
                            <button class="cart-decrease">-</button>
                            <span class="cart-qty">${item.quantity}</span>
                            <button class="cart-increase">+</button>
                        </div>
                    </div>
                    <div class="cart-price">${formatRs(item.price * item.quantity)}</div>
                `;
                cartLeft.appendChild(card);
            });
        }

        bindCartEvents();
        updateCartSummary();
    }

    renderCart();
}

function setupCheckoutPage() {
    const checkoutSection = document.querySelector('.checkout-section');
    if (!checkoutSection) return;

    const itemsContainer = document.getElementById('checkoutItems');
    const summaryItems = document.getElementById('checkoutItemCount');
    const summarySubtotal = document.getElementById('checkoutSubtotal');
    const summaryDelivery = document.getElementById('checkoutDelivery');
    const summaryTotal = document.getElementById('checkoutTotal');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const emptyMessage = document.getElementById('checkoutEmptyMessage');

    if (!itemsContainer) return;

    function renderCheckoutItems() {
        const items = getCartItems();
        itemsContainer.innerHTML = '';

        if (!items.length) {
            if (emptyMessage) emptyMessage.style.display = 'block';
            return;
        }

        if (emptyMessage) emptyMessage.style.display = 'none';

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'cart-card';
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-details">
                    <h3>${item.name}</h3>
                    <p>Qty: ${item.quantity}</p>
                    <p>${formatRs(item.price)} each</p>
                </div>
                <div class="cart-price">${formatRs(item.price * item.quantity)}</div>
            `;
            itemsContainer.appendChild(card);
        });
    }

    function updateCheckoutSummary() {
        const totals = getCartTotals(getCartItems());
        if (summaryItems) summaryItems.textContent = totals.itemCount;
        if (summarySubtotal) summarySubtotal.textContent = formatRs(totals.subtotal);
        if (summaryDelivery) summaryDelivery.textContent = formatRs(totals.delivery);
        if (summaryTotal) summaryTotal.textContent = formatRs(totals.total);
        updateCartCountBadge();
    }

    renderCheckoutItems();
    updateCheckoutSummary();

    function validateCheckoutForm() {
        const name = document.getElementById('checkoutName');
        const phone = document.getElementById('checkoutPhone');
        const address = document.getElementById('checkoutAddress');
        const city = document.getElementById('checkoutCity');
        const postal = document.getElementById('checkoutPostal');
        const payment = document.getElementById('checkoutPayment');

        if (!name?.value.trim()) {
            showToast('Please enter your full name');
            return false;
        }
        if (!phone?.value.trim()) {
            showToast('Please enter your phone number');
            return false;
        }
        if (!address?.value.trim()) {
            showToast('Please enter your delivery address');
            return false;
        }
        if (!city?.value.trim()) {
            showToast('Please enter your city');
            return false;
        }
        if (!postal?.value.trim()) {
            showToast('Please enter your postal code');
            return false;
        }
        if (!payment?.value) {
            showToast('Please select a payment method');
            return false;
        }
        return true;
    }

    placeOrderBtn?.addEventListener('click', () => {
        const items = getCartItems();
        if (!items.length) {
            showToast('Your cart is empty');
            return;
        }
        if (!validateCheckoutForm()) {
            return;
        }
        saveCartItems([]);
        showToast('Order placed successfully!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1200);
    });
}

updateCartCountBadge();
setupOrderPage();
setupCartPage();
setupCheckoutPage();
setupModalAddToCart();

(function () {
	// helper: find closest ancestor matching selector
	function closest(el, sel) { return el ? el.closest(sel) : null; }

	// Forward mobile-order to desktop order button if present
	function forwardClick(sourceEl, desktopSelector, fallbackEventName, detail) {
		const desktop = document.querySelector(desktopSelector);
		if (desktop) {
			desktop.click();
			return true;
		}
		// fallback: emit custom event
		document.dispatchEvent(new CustomEvent(fallbackEventName, { detail: detail || {} }));
		return false;
	}

	// Toggle mobile menu overlay
	function toggleMobileMenu(open) {
		const overlay = document.querySelector('.mobile-menu-overlay');
		const hamburger = document.querySelector('.hamburger-toggle');
		if (!overlay || !hamburger) return;
		if (typeof open === 'undefined') open = !overlay.classList.contains('open');
		if (open) {
			overlay.classList.add('open');
			hamburger.classList.add('is-open');
			hamburger.setAttribute('aria-expanded', 'true');
			// prevent body scroll when menu open (optional)
			document.documentElement.style.overflow = 'hidden';
		} else {
			overlay.classList.remove('open');
			hamburger.classList.remove('is-open');
			hamburger.setAttribute('aria-expanded', 'false');
			document.documentElement.style.overflow = '';
		}
	}

	// Global click delegation
	document.addEventListener('click', function (ev) {
		const btn = closest(ev.target, '.mobile-order-btn, .add-cart-btn, .hamburger-toggle, .mobile-menu-close, .mobile-menu-link, .modal-close, .menu-btn, .checkout-btn');
		if (!btn) return;

		// mobile order button -> try forward to desktop handler
		if (btn.matches('.mobile-order-btn')) {
			ev.preventDefault();
			forwardClick(btn, '.order-btn-desktop', 'spice:mobile-order', { source: 'mobile-order-btn' });
			return;
		}

		// add-cart-btn: forward to first .menu-btn (desktop add) if exists
		if (btn.matches('.add-cart-btn')) {
			ev.preventDefault();
			forwardClick(btn, '.menu-btn', 'spice:mobile-add-to-cart', { source: 'mobile-add' });
			return;
		}

        // hamburger toggle
        if (btn.matches('.hamburger-toggle')) {
            ev.preventDefault();
            toggleMobileMenu();
            return;
        }

        // mobile menu close button -> close overlay and prevent default
        if (btn.matches('.mobile-menu-close')) {
            ev.preventDefault();
            toggleMobileMenu(false);
            return;
        }

        // mobile menu link -> close overlay but allow natural navigation (do NOT preventDefault)
        if (btn.matches('.mobile-menu-link')) {
            toggleMobileMenu(false);
            // navigation will proceed normally after handler returns
            return;
        }

		// modal close
		if (btn.matches('.modal-close')) {
			const mod = document.querySelector('.modal-overlay.active');
			if (mod) mod.classList.remove('active');
			return;
		}

		// menu-btn or checkout-btn fallback handling: dispatch events so desktop logic can catch them
		if (btn.matches('.menu-btn')) {
			// allow existing handlers to run naturally
			return;
		}
	});

	// Close overlays on Escape
	document.addEventListener('keydown', function (ev) {
		if (ev.key === 'Escape') {
			const overlay = document.querySelector('.mobile-menu-overlay.open');
			if (overlay) toggleMobileMenu(false);
			const modal = document.querySelector('.modal-overlay.active');
			if (modal) modal.classList.remove('active');
		}
	});

	// Ensure hamburger is visible on small screens if present (fixes pages where CSS might not apply)
	function ensureHamburgerVisibility() {
		const ham = document.querySelector('.hamburger-toggle');
		if (!ham) return;
		if (window.innerWidth <= 768) ham.style.display = 'flex';
		else ham.style.display = '';
	}
	window.addEventListener('resize', ensureHamburgerVisibility);
	document.addEventListener('DOMContentLoaded', ensureHamburgerVisibility);
})();
