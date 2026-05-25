window.addEventListener("DOMContentLoaded", function () {
  const smoothLinks = document.querySelectorAll('a[href^="#"]');
  smoothLinks.forEach(function(link) {
    link.addEventListener("click", function(event) {
      event.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
});
 // ========== SCROLL ANIMATIONS ==========
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.dish-card, .testimonial-item, .hungry-section, .special-combo-section, .newsletter-final-section').forEach(el => {
            observer.observe(el);
        });

        // ========== DISH MODAL ==========
        const dishData = {
            'special-kebab': {
                name: 'Special Kebab',
                image: 'images/kebab.jpg',
                desc: 'Grilled to perfection with premium spices and herbs',
                spice: '5/5',
                serves: '1-2 persons',
                price: '$12.99'
            },
            'seekh-kebab': {
                name: 'Seekh Kebab',
                image: 'images/kebab.jpg',
                desc: 'Minced meat kebab with aromatic spices',
                spice: '4/5',
                serves: '2 persons',
                price: '$11.99'
            },
            'shami-kebab': {
                name: 'Shami Kebab',
                image: 'images/kebab.jpg',
                desc: 'Soft and tender with perfectly balanced flavors',
                spice: '3/5',
                serves: '2 persons',
                price: '$10.99'
            },
            'chicken-kebab': {
                name: 'Chicken Kebab',
                image: 'images/kebab.jpg',
                desc: 'Marinated in traditional yogurt and spices',
                spice: '4/5',
                serves: '2 persons',
                price: '$13.99'
            },
            'fish-kebab': {
                name: 'Fish Kebab',
                image: 'images/kebab.jpg',
                desc: 'Fresh seafood with light, aromatic seasoning',
                spice: '2/5',
                serves: '1-2 persons',
                price: '$14.99'
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
            const modal = document.getElementById('dishModal');
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        // ========== GALLERY MODAL ==========
        let currentGalleryIndex = 0;
        const galleryImages = [
            'images/kebab.jpg',
            'images/kebab.jpg',
            'images/kebab.jpg'
        ];

        function openGalleryModal(index = 0) {
            currentGalleryIndex = index;
            const modal = document.getElementById('galleryModal');
            document.getElementById('galleryImage').src = galleryImages[currentGalleryIndex];
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeGalleryModal() {
            const modal = document.getElementById('galleryModal');
            modal.classList.remove('active');
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

        // ========== DISH & TESTIMONIALS SCROLLING ==========
        function scrollDishes(direction) {
            const slider = document.getElementById('dishSlider');
            const scrollAmount = 250;
            if (direction === 1) {
                slider.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            } else {
                slider.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth'
                });
            }
        }

        function scrollTestimonials(direction) {
            const slider = document.getElementById('testimonialsSlider');
            const scrollAmount = 320;
            if (direction === 1) {
                slider.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            } else {
                slider.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth'
                });
            }
        }

        // ========== MODAL CLOSE ON OUTSIDE CLICK ==========
        document.addEventListener('click', (e) => {
            const dishModal = document.getElementById('dishModal');
            const galleryModal = document.getElementById('galleryModal');

            if (e.target === dishModal) closeDishModal();
            if (e.target === galleryModal) closeGalleryModal();
        });

        // ========== KEYBOARD NAVIGATION ==========
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeDishModal();
                closeGalleryModal();
            }
            const galleryModal = document.getElementById('galleryModal');
            if (galleryModal.classList.contains('active')) {
                if (e.key === 'ArrowRight') nextGalleryImage();
                if (e.key === 'ArrowLeft') prevGalleryImage();
            }
        });

        // ========== BUTTON RIPPLE EFFECT ==========
        document.querySelectorAll('button, .order-btn, .btn-select, .btn-subscribe-final').forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');

                this.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });

        // ========== SMOOTH SCROLL ==========
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });