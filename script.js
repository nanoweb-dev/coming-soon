/**
 * nanoweb.dev — Early Access Waitlist Client
 */
const WORKER_URL = 'https://itguide-waitlist.mikhail-kriya.workers.dev';

const form = document.getElementById('waitlist');
const emailInput = document.getElementById('email');
const btn = document.getElementById('btn');
const btnText = btn?.querySelector('.btn-text');
const msg = document.getElementById('msg');

function showMsg(html, type = 'success') {
  if (!msg) return;
  msg.className = 'waitlist-msg ' + type;
  msg.innerHTML = html;
  msg.style.display = 'block';
}

function resetForm() {
  if (!msg || !form || !emailInput || !btn || !btnText) return;
  msg.style.display = 'none';
  msg.innerHTML = '';
  form.style.display = 'block';
  emailInput.value = '';
  btn.disabled = false;
  btnText.textContent = 'NOTIFY ME';
  emailInput.focus();
}

if (form && emailInput && btn && btnText) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (msg) msg.style.display = 'none';

    const email = emailInput.value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMsg('<span class="status-symbol">✗</span> Please enter a valid email address.', 'error');
      emailInput.focus();
      return;
    }

    btn.disabled = true;
    const originalText = btnText.textContent;
    btnText.textContent = 'SENDING...';

    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        form.style.display = 'none';
        const safeEmail = email.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        showMsg(
          '<span class="status-symbol">✓</span> You are on the waitlist! We will notify you at <em>' + safeEmail + '</em> on launch day.' +
          '<div style="margin-top: 10px;"><button type="button" id="reset-btn" class="reset-link">[ submit another email ]</button></div>'
        );
        document.getElementById('reset-btn')?.addEventListener('click', resetForm);
      } else {
        const data = await res.json().catch(() => ({}));
        showMsg('<span class="status-symbol">✗</span> ' + (data.error === 'Invalid email' ? 'Invalid email address.' : 'Could not register email. Please try again.'), 'error');
        btn.disabled = false;
        btnText.textContent = originalText;
      }
    } catch {
      showMsg('<span class="status-symbol">✗</span> Network error. Please check your connection.', 'error');
      btn.disabled = false;
      btnText.textContent = originalText;
    }
  });
}
