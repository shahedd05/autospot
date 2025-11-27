let isArabic = false;

// ======== التحقق من الشركة ========
async function verifyCompany() {
  const reg = document.getElementById("registerNumber").value.trim();
  const nat = document.getElementById("nationalNumber").value.trim();
  const messageBox = document.getElementById("verifyMessage");

  // إخفاء الرسالة القديمة
  if (messageBox) {
    messageBox.style.display = "none";
    messageBox.textContent = "";
  }

  // تحقق من الحقول
  if (!reg || !nat) {
    if (messageBox) {
      messageBox.textContent = isArabic
        ? "❌ يرجى إدخال رقم التسجيل والرقم الوطني"
        : "❌ Please enter both Register Number and National Number";
      messageBox.className = "verify-message error";
      messageBox.style.display = "block";
    }
    return;
  }

  try {
    const response = await fetch("/owner/verify_company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registerNumber: reg, nationalNumber: nat })
    });

    const data = await response.json();

    if (!messageBox) return;

    switch (data.status) {
      case "not_found":
        messageBox.textContent = isArabic
          ? "❌ الشركة غير موجودة، لا يمكنك إنشاء حساب"
          : "❌ Company not found, you cannot create an account";
        messageBox.className = "verify-message error";
        break;

      case "inactive":
        messageBox.textContent = isArabic
          ? `❌ لا يمكنك إنشاء حساب، الشركة غير نشطة: ${data.companyName}`
          : `❌ Company is inactive: ${data.companyName}, cannot create account`;
        messageBox.className = "verify-message error";
        break;

      case "has_account":
        messageBox.textContent = isArabic
          ? "✅ الحساب موجود، سيتم تحويلك لتسجيل الدخول"
          : "✅ Account exists, redirecting to login";
        messageBox.className = "verify-message success";
        setTimeout(() => {
          window.location.href = data.redirect || "/login_owner";
        }, 3000);
        break;

      case "can_register":
        messageBox.textContent = isArabic
          ? "✅ الشركة صالحة للتسجيل، سيتم تحويلك للتسجيل"
          : "✅ Company verified, redirecting to registration";
        messageBox.className = "verify-message success";
        localStorage.setItem("verifiedRegisterNumber", reg);
        localStorage.setItem("verifiedNationalNumber", nat);
        setTimeout(() => {
          window.location.href = data.redirect || "/register_owner";
        }, 3000);
        break;

      default:
        messageBox.textContent = isArabic
          ? "❌ حالة غير معروفة"
          : "❌ Unknown status";
        messageBox.className = "verify-message error";
        break;
    }

    messageBox.style.display = "block";
  } catch (err) {
    if (messageBox) {
      messageBox.textContent = isArabic
        ? "❌ خطأ في الخادم، حاول لاحقاً"
        : "❌ Server error, please try again later";
      messageBox.className = "verify-message error";
      messageBox.style.display = "block";
    }
  }
}

// ======== ترجمة OTP ========
function updateOtpTranslation() {
  const otpTitle = document.getElementById("otpTitle");
  const otpMessage = document.getElementById("otpMessage");
  const confirmOtpBtn = document.getElementById("confirmOtpBtn");
  const resendOtpBtn = document.getElementById("resendOtpBtn");

  if (otpTitle) otpTitle.textContent = isArabic ? "التحقق من OTP" : "OTP Verification";
  if (otpMessage) otpMessage.textContent = isArabic ? "تم إرسال الرمز إلى بريدك الإلكتروني." : "We sent a code to your email.";
  if (confirmOtpBtn) confirmOtpBtn.textContent = isArabic ? "تحقق" : "Confirm";
  if (resendOtpBtn) resendOtpBtn.textContent = isArabic ? "إعادة الإرسال" : "Resend Code";
}

// ======== زر الترجمة ========
document.getElementById("translateOption").addEventListener("click", () => {
  isArabic = !isArabic;

  // تحديث الحقول الرئيسية
  const registerNumber = document.getElementById("registerNumber");
  const nationalNumber = document.getElementById("nationalNumber");
  const verifyTitle = document.getElementById("verifyTitle");
  const registerLabel = document.getElementById("registerLabel");
  const nationalLabel = document.getElementById("nationalLabel");
  const verifyBtn = document.getElementById("verifyBtn");

  if (registerNumber) registerNumber.placeholder = isArabic ? "أدخل رقم تسجيل الشركة" : "Enter company register number";
  if (nationalNumber) nationalNumber.placeholder = isArabic ? "أدخل الرقم الوطني للشركة" : "Enter company national number";
  if (verifyTitle) verifyTitle.textContent = isArabic ? "تحقق من شركتك" : "Verify Your Company";
  if (registerLabel) registerLabel.textContent = isArabic ? "رقم التسجيل" : "Register Number";
  if (nationalLabel) nationalLabel.textContent = isArabic ? "الرقم الوطني" : "National Number";
  if (verifyBtn) verifyBtn.textContent = isArabic ? "تحقق من الشركة" : "Check Company";

  // تحديث OTP
  updateOtpTranslation();
});

// ======== ربط زر التحقق ========
const verifyBtn = document.getElementById("verifyBtn");
if (verifyBtn) {
  verifyBtn.addEventListener("click", (e) => {
    e.preventDefault();
    verifyCompany();
  });
}
