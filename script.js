/* ==========================================
   1. ДАННЫЕ ТОВАРОВ
   В реальном проекте здесь был бы fetch() к API,
   но для GitHub Pages используем массив.
   ========================================== */
const products = [
    {
        id: 1,
        name: "Гантель разборная 20 кг",
        category: "fitness",
        price: 120.00,
        image: "images/products/dumbbell.jpg"
    },
    {
        id: 2,
        name: "Коврик для йоги",
        category: "fitness",
        price: 45.50,
        image: "images/products/yoga-mat.jpg"
    },
    {
        id: 3,
        name: "Боксёрские перчатки",
        category: "combat",
        price: 85.00,
        image: "images/products/boxing-gloves.jpg"
    },
    {
        id: 4,
        name: "Скакалка профессиональная",
        category: "fitness",
        price: 25.00,
        image: "images/products/jump-rope.jpg"
    },
    {
        id: 5,
        name: "Палатка 2-местная",
        category: "outdoor",
        price: 250.00,
        image: "images/products/tent.jpg"
    },
    {
        id: 6,
        name: "Спальный мешок",
        category: "outdoor",
        price: 95.00,
        image: "images/products/sleeping-bag.jpg"
    },
    {
        id: 7,
        name: "Кимоно для дзюдо",
        category: "combat",
        price: 180.00,
        image: "images/products/judo-gi.jpg"
    },
    {
        id: 8,
        name: "Термос 1 литр",
        category: "outdoor",
        price: 55.00,
        image: "images/products/thermos.jpg"
    }
];

/* ==========================================
   2. СОСТОЯНИЕ ПРИЛОЖЕНИЯ
   ========================================== */
let cart = JSON.parse(localStorage.getItem('optus_cart')) || [];
let currentFilter = 'all';
let searchQuery = '';

/* ==========================================
   3. DOM-ЭЛЕМЕНТЫ
   ========================================== */
const productGrid = document.getElementById('productGrid');
const cartCount = document.getElementById('cartCount');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartToggle = document.getElementById('cartToggle');
const cartClose = document.getElementById('cartClose');
const checkoutBtn = document.getElementById('checkoutBtn');

const searchToggle = document.getElementById('searchToggle');
const searchPanel = document.getElementById('searchPanel');
const searchInput = document.getElementById('searchInput');
const searchClose = document.getElementById('searchClose');

const filterBtns = document.querySelectorAll('.filter-btn');

/* ==========================================
   4. РЕНДЕРИНГ ТОВАРОВ
   ========================================== */
function renderProducts() {
    // Фильтрация
    let filtered = products;

    if (currentFilter !== 'all') {
        filtered = filtered.filter(p => p.category === currentFilter);
    }

    if (searchQuery.trim() !== '') {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Если ничего не найдено
    if (filtered.length === 0) {
        productGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;color:#666;">Товары не найдены</p>';
        return;
    }

    // Генерация HTML для карточек
    productGrid.innerHTML = filtered.map(product => `
        <article class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="product-actions">
                    <button class="action-btn like-btn" data-id="${product.id}" title="В избранное">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <span class="product-category">${getCategoryName(product.category)}</span>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${product.price.toFixed(2)} BYN</div>
                <button class="btn-add" data-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> В корзину
                </button>
            </div>
        </article>
    `).join('');

    // Навешиваем обработчики на кнопки "В корзину"
    document.querySelectorAll('.btn-add').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            addToCart(id);
        });
    });

    // Обработчики на "лайки"
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.currentTarget.classList.toggle('liked');
            const icon = e.currentTarget.querySelector('i');
            if (e.currentTarget.classList.contains('liked')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        });
    });
}

function getCategoryName(cat) {
    const names = {
        fitness: 'Фитнес',
        combat: 'Единоборства',
        outdoor: 'Активный отдых'
    };
    return names[cat] || cat;
}

/* ==========================================
   5. КОРЗИНА: ДОБАВЛЕНИЕ, УДАЛЕНИЕ, ОТОБРАЖЕНИЕ
   ========================================== */
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showNotification(`"${product.name}" добавлен в корзину`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function changeQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;

    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        updateCartUI();
    }
}

function saveCart() {
    localStorage.setItem('optus_cart', JSON.stringify(cart));
}

function updateCartUI() {
    // Обновляем счётчик на иконке
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Если корзина пуста
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="cart-empty">Корзина пуста</p>';
        cartTotal.textContent = '0 BYN';
        return;
    }

    // Рендерим товары в корзине
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${(item.price * item.quantity).toFixed(2)} BYN</div>
                <div class="cart-item-controls">
                    <button class="qty-btn" data-id="${item.id}" data-delta="-1">−</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
                    <button class="cart-item-remove" data-id="${item.id}" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Считаем итог
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotal.textContent = total.toFixed(2) + ' BYN';

    // Обработчики для кнопок количества и удаления
    cartItemsContainer.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            const delta = parseInt(e.currentTarget.dataset.delta);
            changeQuantity(id, delta);
        });
    });

    cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            removeFromCart(id);
        });
    });
}

/* ==========================================
   6. УВЕДОМЛЕНИЯ
   ========================================== */
function showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    document.body.appendChild(notif);

    setTimeout(() => notif.classList.add('show'), 10);
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 2500);
}

/* ==========================================
   7. ФИЛЬТРАЦИЯ И ПОИСК
   ========================================== */
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.category;
        renderProducts();
    });
});

searchToggle.addEventListener('click', () => {
    searchPanel.classList.toggle('active');
    if (searchPanel.classList.contains('active')) {
        searchInput.focus();
    }
});

searchClose.addEventListener('click', () => {
    searchPanel.classList.remove('active');
    searchInput.value = '';

    /* ==========================================
   8. ПРИЛИПАЮЩАЯ ШАПКА (STICKY NAVBAR)
   ========================================== */
document.addEventListener('DOMContentLoaded', function() {
    var ticking = false;
    var navbarTop = document.getElementById('navbar-top');
    var navbarFixed = document.getElementById('navbar-fixed');
    var navbarFixedSpacer = document.getElementById('navbar-fixed-spacer');

    if (!navbarTop || !navbarFixed) return; // защита от ошибок

    function updateNavbar() {
        var navbarTopHeight = navbarTop.offsetHeight;
        var navbarFixedHeight = navbarFixed.offsetHeight;
        var scrollTop = window.scrollY;

        if (scrollTop >= navbarTopHeight) {
            navbarFixed.classList.add('fixed-top');
            navbarFixed.classList.remove('d-none');
            navbarFixedSpacer.style.minHeight = navbarFixedHeight + 'px';
            navbarFixedSpacer.classList.remove('d-none');
        } else {
            navbarFixed.classList.remove('fixed-top');
            navbarFixed.classList.add('d-none');
            navbarFixedSpacer.classList.add('d-none');
        }
    }

    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateNavbar();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchmove', onScroll, { passive: true });
    window.addEventListener('resize', updateNavbar);
    updateNavbar();
});