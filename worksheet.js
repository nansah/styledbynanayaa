/* ── Wardrobe Audit Worksheet — EmailJS delivery ─────────────────
 *
 * Setup (one-time, takes ~10 minutes):
 *
 * 1. Create a free account at https://emailjs.com
 * 2. Add an Email Service (Gmail works fine) → copy the Service ID
 * 3. Create an Email Template with these variables:
 *      {{to_email}}   — subscriber's email address
 *      {{pdf_url}}    — the PDF download link
 *    Subject:  Your Free Wardrobe Audit Worksheet is here! ✦
 *    Body example:
 *      Hi there,
 *      Thank you for signing up — here is your free Wardrobe Audit Worksheet:
 *      {{pdf_url}}
 *      — Nana Yaa
 * 4. Copy the Template ID
 * 5. Go to Account → General → copy your Public Key
 * 6. Fill in the three values below
 * 7. Upload your PDF to your server and update PDF_URL below
 *
 * ──────────────────────────────────────────────────────────────── */

var EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // e.g. 'abc123XYZ'
var EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // e.g. 'service_xxxxxx'
var EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // e.g. 'template_xxxxxx'
var PDF_URL = window.location.origin + '/assets/downloads/wardrobe-audit-worksheet.pdf';

(function () {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

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

      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: email,
        pdf_url:  PDF_URL
      }).then(function () {
        btn.textContent = '✦ Check your inbox!';
        form.querySelector('.worksheet-success-msg') && (form.querySelector('.worksheet-success-msg').style.display = 'block');
      }).catch(function (err) {
        console.error('EmailJS error:', err);
        btn.textContent   = 'Try again';
        btn.disabled      = false;
        emailInput.disabled = false;
      });
    });
  }

  handleWorksheetForm('worksheet-form');
  handleWorksheetForm('resources-worksheet-form');
})();
