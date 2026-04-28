const nodemailer = require('nodemailer');

const escapeHtml = (str) =>
  String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const formatAmount = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

const formatDate = (date) =>
  new Date(date).toLocaleString('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  });

const sendTransactionEmail = async ({ to, firstName, type, amount, reference, counterpartAccount, narration, balanceBefore, balanceAfter, date }) => {
  const isDebit = type === 'DEBIT';
  const color = isDebit ? '#dc2626' : '#16a34a';
  const label = isDebit ? 'Debit Alert' : 'Credit Alert';
  const sign = isDebit ? '-' : '+';
  const counterpartLabel = isDebit ? 'To Account' : 'From Account';

  // Escape all user-supplied values before embedding in HTML
  const safeName = escapeHtml(firstName);
  const safeRef = escapeHtml(reference);
  const safeCounterpart = escapeHtml(counterpartAccount);
  const safeNarration = escapeHtml(narration);

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <div style="background:#1e3a5f;padding:24px;text-align:center;">
        <h2 style="color:#ffffff;margin:0;font-size:20px;">${process.env.BANK_NAME || 'LYD Bank'}</h2>
        <p style="color:#93c5fd;margin:4px 0 0;font-size:13px;">Transaction Notification</p>
      </div>
      <div style="padding:24px;">
        <div style="background:${color}15;border-left:4px solid ${color};padding:12px 16px;border-radius:4px;margin-bottom:20px;">
          <p style="margin:0;color:${color};font-weight:700;font-size:18px;">${label}</p>
          <p style="margin:4px 0 0;color:${color};font-size:28px;font-weight:700;">${sign}${formatAmount(amount)}</p>
        </div>
        <p style="color:#374151;margin:0 0 16px;">Dear ${safeName},</p>
        <p style="color:#374151;margin:0 0 20px;">A transaction has been carried out on your account.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:10px 0;color:#6b7280;">Reference</td>
            <td style="padding:10px 0;color:#111827;font-weight:600;text-align:right;">${safeRef}</td>
          </tr>
          <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:10px 0;color:#6b7280;">${counterpartLabel}</td>
            <td style="padding:10px 0;color:#111827;font-weight:600;text-align:right;">${safeCounterpart}</td>
          </tr>
          <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:10px 0;color:#6b7280;">Narration</td>
            <td style="padding:10px 0;color:#111827;text-align:right;">${safeNarration}</td>
          </tr>
          <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:10px 0;color:#6b7280;">Balance Before</td>
            <td style="padding:10px 0;color:#111827;text-align:right;">${formatAmount(balanceBefore)}</td>
          </tr>
          <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:10px 0;color:#6b7280;">Balance After</td>
            <td style="padding:10px 0;color:#111827;font-weight:600;text-align:right;">${formatAmount(balanceAfter)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6b7280;">Date</td>
            <td style="padding:10px 0;color:#111827;text-align:right;">${formatDate(date)}</td>
          </tr>
        </table>
        <p style="color:#6b7280;font-size:12px;margin:24px 0 0;">If you did not authorise this transaction, please contact us immediately.</p>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:11px;margin:0;">© ${new Date().getFullYear()} ${process.env.BANK_NAME || 'LYD Bank'} · This is an automated notification.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"${process.env.BANK_NAME || 'LYD Bank'}" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${label}: ${sign}${formatAmount(amount)} — Ref: ${reference}`,
    html,
  });
};

module.exports = { sendTransactionEmail };
