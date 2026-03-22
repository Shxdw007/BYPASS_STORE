// === ЛОГИКА КОРЗИНЫ С LOCALSTORAGE ===

// Загружаем корзину из памяти браузера или создаем пустую
let cart = JSON.parse(localStorage.getItem('dedsec_cart')) || [];

// Функция сохранения корзины в память
function saveCart() {
    localStorage.setItem('dedsec_cart', JSON.stringify(cart));
    updateCartCount(); // Обновляем цифру в шапке
}

// Добавление товара (Работает на shop.html)
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name: name, price: price, quantity: 1 });
    }
    
    saveCart(); // Сохраняем!
    showNotification('ADDED', `${name} -> CART`);
    console.log(`[+] Added: ${name}`);
}

// Удаление товара (Работает на cart.html)
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCartPage(); // Перерисовываем страницу корзины
    showNotification('DELETED', 'Item removed');
}

// Обновление счетчика в шапке (Работает ВЕЗДЕ)
function updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

// Отрисовка страницы корзины (Только для cart.html)
function renderCartPage() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');

    // Если мы не на странице корзины — выходим
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">> MEMORY BUFFER EMPTY...</p>';
        cartTotalElement.textContent = '0';
        return;
    }

    let cartHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>QTY: ${item.quantity} | UNIT: ${item.price} ₽</p>
                </div>
                <div class="cart-item-price">${itemTotal.toLocaleString()} ₽</div>
                <button class="btn-remove" onclick="removeFromCart(${index})">[DEL]</button>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = cartHTML;
    cartTotalElement.textContent = total.toLocaleString();
}

// Оформление заказа
function checkout() {
    if (cart.length === 0) return;
    
    alert(`TRANSACTION COMPLETED.\nTOTAL: ${document.getElementById('cartTotal').textContent} ₽\n\nTRACKING ID GENERATED.`);
    
    cart = []; // Очищаем массив
    saveCart(); // Очищаем память
    renderCartPage();
}

// Уведомления
function showNotification(title, message) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        background: #000; border: 1px solid #39ff14;
        color: #39ff14; padding: 15px; z-index: 9999;
        font-family: 'VT323'; font-size: 1.2rem;
    `;
    notif.innerHTML = `<strong>[${title}]</strong><br>${message}`;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
}

// === ЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ===
window.addEventListener('load', () => {
    updateCartCount(); // Обновляем цифру в шапке на любой странице
    renderCartPage();  // Если мы в корзине — рисуем товары
    
    // Matrix effect только если есть canvas (на главной)
    const canvas = document.getElementById('matrixCanvas');
    if (canvas) startMatrix(canvas);
});

// === MATRIX ЭФФЕКТ (Тот же, что и был, обернутый в функцию) ===
function startMatrix(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const chars = '01XYZ';
    const drops = Array(Math.floor(canvas.width / 14)).fill(1);
    
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#39ff14';
        drops.forEach((y, i) => {
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 14, y * 14);
            if (y * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        });
    }
    setInterval(draw, 35);
}
// === ЭФФЕКТ ДЕШИФРОВКИ ТЕКСТА ПРИ НАВЕДЕНИИ ===
document.addEventListener('DOMContentLoaded', () => {
    const listItems = document.querySelectorAll('.feature-list li');
    // Символы, которые будут мелькать во время глитча
    const glitchChars = '!<>-_\\/[]{}—=+*^?#_01XTZ';

    listItems.forEach(item => {
        // Запоминаем оригинальный текст каждого пункта
        const originalText = item.textContent;

        item.addEventListener('mouseenter', () => {
            let iterations = 0;
            
            const interval = setInterval(() => {
                item.textContent = originalText
                    .split('')
                    .map((char, index) => {
                        // Не трогаем пробелы, чтобы текст не прыгал
                        if (char === ' ') return char;
                        // Если итерация дошла до этого символа — показываем оригинал
                        if (index < iterations) return originalText[index];
                        // Иначе показываем случайный глитч-символ
                        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
                    })
                    .join('');

                // Когда расшифровали всё — останавливаем таймер
                if (iterations >= originalText.length) {
                    clearInterval(interval);
                    item.textContent = originalText; // Подстраховка: возвращаем чистый оригинал
                }
                
                // Скорость расшифровки (чем больше число, тем быстрее восстановится текст)
                iterations += 3; 
            }, 30); // 30 миллисекунд между кадрами анимации
        });
    });
});