/* ── Wardrobe Audit Worksheet — MailerLite delivery ──────────────
 *
 * Flow:
 *   1. User submits email on homepage or resources page
 *   2. JS posts to subscribe.php
 *   3. subscribe.php adds them to MailerLite group
 *   4. MailerLite automation fires → sends welcome email with PDF link
 *
 * MailerLite automation setup:
 *   Automations → New → Trigger: "When subscriber joins a group"
 *   → Select: "Worksheet Subscribers"
 *   → Add step: Send email
 *   → In the email body include:
 *     "Download your free worksheet here: https://yourdomain.com/assets/downloads/wardrobe-audit-worksheet.pdf"
 *
 * ─────────────────────────────────────────────────────────────── */

(function () {
  function handleWorksheetForm(formId) {
    var form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var emailInput = form.querySelector('input[type="email"]');
      var btn        = form.querySelector('button[type="submit"]');
      var email      = emailInput.value.trim();

      if (!email) return;

      btn.textContent = 'Sending…';
      btn.disabled    = true;
      emailInput.disabled = true;

      fetch('/subscribe.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email })
      })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          btn.textContent = '✦ Check your inbox!';
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      })
      .catch(function () {
        btn.textContent     = 'Try again';
        btn.disabled        = false;
        emailInput.disabled = false;
      });
    });
  }

  handleWorksheetForm('worksheet-form');
  handleWorksheetForm('resources-worksheet-form');
})();
