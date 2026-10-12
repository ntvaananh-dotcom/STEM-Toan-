'use strict';
const data = window.STEM_CONTENT;
const $ = selector => document.querySelector(selector);
const money = n => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeImage = s => typeof s === 'string' && /^(assets\/[a-zA-Z0-9_./-]+|https:\/\/[^\s"<>]+)$/.test(s) && !s.includes('..') ? s : '';
const ORDERS_KEY = 'stem-orders-v1';
const REVIEWS_KEY = 'stem-reviews-v1';
const COUPON_KEY = 'stem-next-order-discount-v1';
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

let cart = [];
try {
  cart = JSON.parse(localStorage.getItem('stem-cart') || '[]');
  if (!Array.isArray(cart)) cart = [];
} catch { cart = []; }
cart = [...new Set(cart)].filter(id => data.products.some(p => p.id === id && p.available));

function readJSON(key, fallback = []) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value == null ? fallback : value;
  } catch { return fallback; }
}
function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}
function getOrders() { return readJSON(ORDERS_KEY, []); }
function getReviews() { return readJSON(REVIEWS_KEY, []); }
function hasDiscount() { try { return localStorage.getItem(COUPON_KEY) === 'true'; } catch { return false; } }
function setDiscount(value) {
  try {
    if (value) localStorage.setItem(COUPON_KEY, 'true');
    else localStorage.removeItem(COUPON_KEY);
  } catch { /* The demo still works for the current page if storage is disabled. */ }
}
function persist() {
  try { localStorage.setItem('stem-cart', JSON.stringify(cart)); } catch { /* Keep the current session usable. */ }
  $('#cart-count').textContent = cart.length;
}
let toastTimer;
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { $('#toast').style.display = 'none'; }, 2600);
}
function open(html) {
  $('#modal-content').innerHTML = html;
  if (!$('#modal').open) $('#modal').showModal();
}
$('#close').onclick = () => $('#modal').close();
$('#modal').addEventListener('click', e => {
  if (e.target === $('#modal')) {
    const rect = $('#modal').getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) $('#modal').close();
  }
});
$('#intro').textContent = data.shop.intro;
$('#footer-note').textContent = data.shop.footer;
const emailOK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.shop.email);
if (emailOK) $('#contact').href = 'mailto:' + data.shop.email;
else $('#contact').textContent = 'Thông tin liên hệ đang cập nhật';
const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
const kindLabel = kind => kind === 'Bản thiết kế' ? 'Bản thiết kế STEM' : kind;

function render() {
  let list = data.products.filter(p =>
    (!$('#level').value || p.level === $('#level').value) &&
    (!$('#kind').value || p.kind === $('#kind').value) &&
    normalize(p.title + ' ' + p.subtitle + ' ' + p.topic + ' ' + p.grade).includes(normalize($('#search').value))
  );
  if ($('#sort').value !== 'default') list.sort((a, b) => $('#sort').value === 'asc' ? a.price - b.price : b.price - a.price);
  $('#result-count').textContent = list.length + ' tài liệu • Sản phẩm và giá hiện là dữ liệu minh họa';
  $('#products').innerHTML = list.length ? list.map(p => `
    <article class="card">
      <div class="cover ${['mint', 'sand', 'blue', 'pink'].includes(p.color) ? p.color : 'mint'}">
        <span class="tag">${esc(kindLabel(p.kind))}</span><span class="symbol" aria-hidden="true">${esc(p.symbol)}</span><span class="topic">${esc(p.topic)}</span>
      </div>
      <div class="card-body">
        <div class="meta">${esc(p.level)} · ${esc(p.grade)} · ${esc(p.pages)} trang PDF</div>
        <h3>${esc(p.title)}</h3><p>${esc(p.subtitle)}</p><div class="price">${money(p.price)}</div>
        <div class="card-actions"><button class="outline" data-preview="${esc(p.id)}">Xem trước</button><button data-add="${esc(p.id)}">＋ Thêm vào giỏ</button></div>
      </div>
    </article>`).join('') : '<div class="empty">Chưa tìm thấy tài liệu phù hợp. Hãy thử từ khóa khác.</div>';
}
['search', 'level', 'kind', 'sort'].forEach(id => $('#' + id).addEventListener('input', render));

function add(id) {
  const product = data.products.find(p => p.id === id);
  if (!product?.available) return;
  if (cart.includes(id)) return toast('Tài liệu đã có trong giỏ hàng');
  cart.push(id); persist(); toast('Đã thêm tài liệu vào giỏ hàng');
}
function preview(id) {
  const p = data.products.find(product => product.id === id);
  if (!p) return;
  const imgs = (p.previewImages || []).slice(0, 2).map(safeImage).filter(Boolean);
  open(`<div class="eyebrow">XEM TRƯỚC HỌC LIỆU</div><h2>${esc(p.title)}</h2><p>${esc(p.subtitle)}</p><p class="muted">${esc(p.grade)} · ${esc(kindLabel(p.kind))} · ${esc(p.pages)} trang</p>${imgs.length ? imgs.map((src, i) => `<img class="preview" src="${esc(src)}" alt="Trang mẫu ${i + 1} của ${esc(p.title)}">`).join('') : '<div class="notice">Trang mẫu đang được cập nhật. Đây là thông tin sản phẩm minh họa, chưa phải tài liệu hoàn chỉnh.</div>'}<p class="notice">Mỗi đơn hàng cần có ít nhất một kế hoạch bài dạy và một bản thiết kế STEM.</p><div class="actions"><strong>${money(p.price)}</strong><button data-add="${esc(p.id)}">Thêm vào giỏ hàng</button></div>`);
}
const selected = () => cart.map(id => data.products.find(p => p.id === id)).filter(Boolean);
const subtotal = (items = selected()) => items.reduce((sum, p) => sum + p.price, 0);
function orderHasBothKinds(items = selected()) {
  const kinds = new Set(items.map(p => p.kind));
  return kinds.has('Kế hoạch bài dạy') && kinds.has('Bản thiết kế');
}
function priceSummary(amount, discountActive = hasDiscount()) {
  const discount = discountActive ? Math.round(amount * 0.2) : 0;
  return { subtotal: amount, discount, total: Math.max(0, amount - discount) };
}
function summaryHTML(items = selected(), discountActive = hasDiscount()) {
  const summary = priceSummary(subtotal(items), discountActive);
  return `<div class="payment-summary"><div class="row"><span>Tạm tính</span><strong>${money(summary.subtotal)}</strong></div>${summary.discount ? `<div class="row discount-row"><span>Ưu đãi đánh giá video (20%)</span><strong>−${money(summary.discount)}</strong></div>` : ''}<div class="row final-total"><span>Thành tiền</span><strong>${money(summary.total)}</strong></div></div>`;
}
function showCart() {
  const items = selected();
  const hasRequiredPair = orderHasBothKinds(items);
  open(`<div class="eyebrow">HỌC LIỆU ĐÃ CHỌN</div><h2>Giỏ hàng của bạn</h2>${cart.length ? items.map(p => `<div class="row"><div><strong>${esc(p.title)}</strong><small>${esc(kindLabel(p.kind))} · ${money(p.price)}</small></div><button data-remove="${esc(p.id)}" aria-label="Xóa ${esc(p.title)}">Xóa</button></div>`).join('') + summaryHTML(items) + (hasRequiredPair ? '<p class="notice">Đơn hàng đã có đủ hai loại học liệu.</p>' : '<p class="notice">Để tạo đơn hàng, hãy thêm ít nhất một <b>Kế hoạch bài dạy</b> và một <b>Bản thiết kế STEM</b>.</p>') + `<button id="checkout" ${hasRequiredPair ? '' : 'disabled'}>Tiến hành thanh toán →</button>` : '<p>Giỏ hàng đang trống. Khám phá kho học liệu để chọn tài liệu phù hợp.</p><button id="browse">Tiếp tục khám phá</button>'}`);
  $('#checkout')?.addEventListener('click', checkout);
  $('#browse')?.addEventListener('click', () => { $('#modal').close(); location.hash = 'kho'; });
}
$('#cart-button').onclick = showCart;
document.addEventListener('click', e => {
  const button = e.target.closest('button');
  if (!button) return;
  if (button.dataset.add) add(button.dataset.add);
  if (button.dataset.preview) preview(button.dataset.preview);
  if (button.dataset.remove) { cart = cart.filter(id => id !== button.dataset.remove); persist(); showCart(); }
  if (button.dataset.reviewOrder) startReview(button.dataset.reviewOrder);
});

function checkout() {
  const items = selected();
  if (!items.length) return showCart();
  if (!orderHasBothKinds(items)) {
    open('<h2>Đơn hàng chưa đủ học liệu</h2><p>Vui lòng chọn ít nhất một kế hoạch bài dạy và một bản thiết kế STEM trong cùng đơn hàng.</p><button id="back-to-cart">Quay lại giỏ hàng</button>');
    $('#back-to-cart').onclick = showCart;
    return;
  }
  open(`<div class="eyebrow">THANH TOÁN MÔ PHỎNG</div><h2>Thông tin đơn hàng</h2><div class="notice">Đây là bản thử nghiệm: khi nhấn nút xác nhận, đơn sẽ được đánh dấu thành công ngay. Không có giao dịch ngân hàng hoặc khoản tiền thật.</div><div class="order-lines">${items.map(p => `<div class="row"><span>${esc(p.title)}<small>${esc(kindLabel(p.kind))}</small></span><strong>${money(p.price)}</strong></div>`).join('')}</div>${summaryHTML(items)}<form id="buyer-form" class="stack"><label>Họ và tên<input name="name" required maxlength="100" autocomplete="name"></label><label>Email<input name="email" type="email" required maxlength="160" autocomplete="email"></label><p class="muted">Thông tin chỉ lưu trên trình duyệt này trong bản demo.</p><button type="submit">Xác nhận thanh toán thành công →</button></form>`);
  $('#buyer-form').onsubmit = e => {
    e.preventDefault();
    const form = new FormData(e.target);
    completeDemoPayment({ name: String(form.get('name') || '').trim(), email: String(form.get('email') || '').trim() });
  };
}
function makeOrderId() {
  return 'STEM-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}
function completeDemoPayment(buyer) {
  const items = selected().map(p => ({ id: p.id, title: p.title, kind: p.kind, price: p.price }));
  const usedDiscount = hasDiscount();
  const amounts = priceSummary(subtotal(items.map(p => ({ price: p.price }))), usedDiscount);
  const order = {
    id: makeOrderId(), createdAt: new Date().toISOString(), buyerName: buyer.name, buyerEmail: buyer.email,
    items, subtotal: amounts.subtotal, discount: amounts.discount, total: amounts.total, reviewed: false
  };
  const orders = getOrders();
  orders.unshift(order);
  writeJSON(ORDERS_KEY, orders);
  if (usedDiscount) setDiscount(false);
  cart = []; persist();
  open(`<div class="success-mark" aria-hidden="true">✓</div><div class="eyebrow">ĐƠN HÀNG ĐÃ HOÀN TẤT</div><h2>Thanh toán thành công!</h2><p>Đơn hàng <strong>${esc(order.id)}</strong> đã được ghi nhận trong bản demo.</p><div class="notice">Đây là trạng thái thanh toán mô phỏng, không phát sinh giao dịch thật.</div><div class="row"><span>Học liệu trong đơn</span><strong>${items.length} mục</strong></div><div class="row"><span>Tổng thanh toán</span><strong>${money(order.total)}</strong></div><p class="muted">Sau khi sử dụng học liệu, hãy gửi video dạy học để đánh giá đơn hàng này và nhận giảm 20% cho đơn kế tiếp.</p><div class="actions"><button id="review-now">Đánh giá bằng video · Nhận giảm 20%</button><button id="continue-shopping" class="outline">Tiếp tục mua sắm</button></div>`);
  $('#review-now').onclick = () => startReview(order.id);
  $('#continue-shopping').onclick = () => { $('#modal').close(); location.hash = 'kho'; };
  renderReviewHub();
}

// The selected video remains only in this page session. The upload indicator is simulated;
// this static demo does not transmit files to a server.
const demoUploadedVideos = new Map();
function simulateUploadProgress(submitButton) {
  return new Promise(resolve => {
    const panel = document.createElement('div');
    panel.className = 'upload-progress';
    panel.innerHTML = '<div class="upload-progress-label"><span>Đang tải video lên...</span><strong>0%</strong></div><div class="upload-progress-track"><span></span></div><p class="muted">Đang xử lý video trong bản trình diễn.</p>';
    submitButton.before(panel);
    const label = panel.querySelector('.upload-progress-label span');
    const percent = panel.querySelector('.upload-progress-label strong');
    const bar = panel.querySelector('.upload-progress-track span');
    const steps = [18, 37, 62, 84, 100];
    let index = 0;
    const timer = setInterval(() => {
      const value = steps[index++];
      percent.textContent = value + '%';
      bar.style.width = value + '%';
      if (value === 100) {
        clearInterval(timer);
        label.textContent = 'Tải video hoàn tất';
        panel.classList.add('is-complete');
        setTimeout(resolve, 220);
      }
    }, 220);
  });
}
function isVideoFile(file) {
  if (!file) return false;
  const extensionOk = /\.(mp4|webm|mov|m4v|ogv)$/i.test(file.name || '');
  return (String(file.type || '').startsWith('video/') || extensionOk) && file.size > 0 && file.size <= MAX_VIDEO_SIZE;
}
function startReview(orderId) {
  const order = getOrders().find(item => item.id === orderId);
  if (!order || order.reviewed) {
    toast('Đơn hàng này đã được đánh giá hoặc không còn khả dụng.');
    renderReviewHub();
    return;
  }
  open(`<div class="eyebrow">CHIA SẺ TRẢI NGHIỆM</div><h2>Đánh giá bằng video</h2><p>Đơn hàng <strong>${esc(order.id)}</strong></p><div class="notice">Chọn video dạy học từ thiết bị, gửi đánh giá để nhận ưu đãi 20% cho một đơn hàng tiếp theo.</div><form id="review-form" class="stack"><label>Số sao đánh giá<select name="rating" required><option value="5">★★★★★ — Rất hài lòng</option><option value="4">★★★★☆ — Hài lòng</option><option value="3">★★★☆☆ — Bình thường</option><option value="2">★★☆☆☆ — Chưa hài lòng</option><option value="1">★☆☆☆☆ — Không hài lòng</option></select></label><label>Nhận xét của bạn<textarea name="comment" rows="3" maxlength="800" placeholder="Chia sẻ ngắn gọn trải nghiệm sử dụng học liệu…"></textarea></label><label class="upload-box"><span class="upload-icon">↑</span><strong>Chọn video dạy học của bạn</strong><span class="muted">MP4, WebM, MOV hoặc video tương thích · tối đa 100 MB</span><input id="review-video" name="video" type="file" accept="video/*,.mp4,.webm,.mov,.m4v,.ogv" required></label><div id="video-preview" class="video-preview" hidden></div><p class="muted">Bản bài tập: thanh tiến trình tải video được mô phỏng, không gửi tệp lên máy chủ.</p><button type="submit">Tải video lên và gửi đánh giá →</button></form>`);
  let previewUrl = null;
  $('#review-video').addEventListener('change', e => {
    const file = e.target.files?.[0];
    const area = $('#video-preview');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    if (!file) { area.hidden = true; area.innerHTML = ''; return; }
    if (!isVideoFile(file)) {
      e.target.value = '';
      area.hidden = true;
      area.innerHTML = '';
      toast(file.size > MAX_VIDEO_SIZE ? 'Video quá lớn. Vui lòng chọn tệp dưới 100 MB.' : 'Vui lòng chọn một tệp video hợp lệ.');
      return;
    }
    previewUrl = URL.createObjectURL(file);
    area.hidden = false;
    area.innerHTML = `<video controls preload="metadata" src="${previewUrl}"></video><p class="muted">${esc(file.name)} · ${(file.size / (1024 * 1024)).toFixed(1)} MB</p>`;
  });
  $('#review-form').onsubmit = async e => {
    e.preventDefault();
    const form = e.target;
    const file = $('#review-video').files?.[0];
    if (!isVideoFile(file)) return toast('Bạn cần chọn video hợp lệ (tối đa 100 MB).');
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    submit.textContent = 'Đang tải video lên…';
    try {
      await simulateUploadProgress(submit);
      const values = new FormData(form);
      const reviewId = 'REV-' + Date.now().toString(36).toUpperCase();
      const review = {
        id: reviewId, orderId: order.id, reviewerName: order.buyerName || 'Khách hàng',
        rating: Number(values.get('rating')) || 5, comment: String(values.get('comment') || '').trim(),
        videoName: file.name, createdAt: new Date().toISOString()
      };
      const reviews = getReviews();
      reviews.unshift(review);
      if (!writeJSON(REVIEWS_KEY, reviews)) throw new Error('Không lưu được thông tin đánh giá. Hãy kiểm tra dung lượng lưu trữ của trình duyệt.');
      const orders = getOrders();
      const orderIndex = orders.findIndex(item => item.id === order.id);
      if (orderIndex >= 0) orders[orderIndex].reviewed = true;
      writeJSON(ORDERS_KEY, orders);
      // Keep the selected clip available for in-page preview only. It is not uploaded remotely.
      if (previewUrl) demoUploadedVideos.set(reviewId, previewUrl);
      previewUrl = null;
      setDiscount(true);
      open(`<div class="success-mark" aria-hidden="true">✓</div><div class="eyebrow">CẢM ƠN BẠN ĐÃ CHIA SẺ</div><h2>Tải video lên thành công!</h2><p>Video <strong>${esc(file.name)}</strong> đã được ghi nhận trong bản demo.</p><div class="notice">Trạng thái tải lên và thanh tiến trình chỉ được mô phỏng để phục vụ bài tập; tệp chưa được gửi lên máy chủ.</div><div class="reward-panel"><strong>Ưu đãi 20% đã được kích hoạt</strong><p>Giảm giá sẽ tự động áp dụng cho đơn hàng kế tiếp trên trình duyệt này.</p><div class="reward-code">VIDEO20</div></div><button id="browse-after-review">Khám phá học liệu →</button>`);
      $('#browse-after-review').onclick = () => { $('#modal').close(); location.hash = 'kho'; };
      renderReviewHub();
    } catch (error) {
      form.querySelector('.upload-progress')?.remove();
      submit.disabled = false;
      submit.textContent = 'Tải video lên và gửi đánh giá →';
      toast(error?.message || 'Chưa gửi được đánh giá. Hãy thử lại.');
    }
  };
}

function renderReviewList() {
  const container = $('#reviews-list');
  const reviews = getReviews();
  if (!reviews.length) {
    container.innerHTML = '<div class="empty">Chưa có đánh giá nào. Hãy hoàn tất một đơn hàng demo, sau đó chia sẻ video dạy học để trở thành người đánh giá đầu tiên.</div>';
    return;
  }
  const rendered = reviews.slice(0, 12).map(review => {
    let videoMarkup = '<div class="video-missing">Video đã được ghi nhận trong bản demo. Tệp không được lưu trên máy chủ.</div>';
    const videoUrl = demoUploadedVideos.get(review.id);
    if (videoUrl) videoMarkup = `<video controls preload="metadata" src="${videoUrl}" aria-label="Video đánh giá của ${esc(review.reviewerName)}"></video>`;
    const rating = Math.max(1, Math.min(5, Number(review.rating) || 5));
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : '';
    return `<article class="review-card"><div class="review-card-head"><strong>${esc(review.reviewerName || 'Khách hàng')}</strong><span class="stars" aria-label="${rating} trên 5 sao">${stars}</span></div><p class="review-date">${esc(date)} · Đơn ${esc(review.orderId || '')}</p>${review.comment ? `<p class="review-comment">${esc(review.comment)}</p>` : ''}${videoMarkup}<p class="muted">${esc(review.videoName || 'Video dạy học')}</p></article>`;
  });
  container.innerHTML = rendered.join('');
}
function renderReviewHub() {
  const status = $('#review-coupon-status');
  if (status) status.innerHTML = hasDiscount()
    ? '<strong>Ưu đãi đã sẵn sàng:</strong> giảm 20% tự động áp dụng cho đơn hàng kế tiếp trên trình duyệt này.'
    : '<strong>Nhận ưu đãi 20%:</strong> hoàn tất đơn hàng, gửi đánh giá kèm video dạy học để mở ưu đãi cho đơn tiếp theo.';
  const actions = $('#review-order-actions');
  if (actions) {
    const pending = getOrders().filter(order => !order.reviewed);
    actions.innerHTML = pending.length
      ? `<p class="muted">Đơn hàng có thể đánh giá</p>` + pending.map(order => `<div class="row pending-review"><div><strong>${esc(order.id)}</strong><small>${esc(new Date(order.createdAt).toLocaleDateString('vi-VN'))} · ${money(order.total)}</small></div><button data-review-order="${esc(order.id)}">Đánh giá bằng video</button></div>`).join('')
      : '<p class="muted">Sau khi hoàn tất đơn hàng demo, bạn có thể quay lại đây để gửi video đánh giá.</p>';
  }
  renderReviewList();
}

persist();
render();
renderReviewHub();
