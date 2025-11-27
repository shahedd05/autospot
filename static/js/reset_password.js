document.addEventListener("DOMContentLoaded", () => {
  const resetForm = document.getElementById("resetForm");
  const usernameInput = document.getElementById("username");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const message = document.getElementById("message");
  const translateOption = document.getElementById("translateOption");

  // عناصر النصوص
  const resetTitle = document.getElementById("resetTitle");
  const resetSubtitle = document.getElementById("resetSubtitle");
  const usernameLabel = document.getElementById("usernameLabel");
  const newPasswordLabel = document.getElementById("newPasswordLabel");
  const confirmPasswordLabel = document.getElementById("confirmPasswordLabel");
  const updateBtn = document.getElementById("updateBtn");

  let isArabic = false;

  // ✅ زر الترجمة
  translateOption.addEventListener("click", () => {
    isArabic = !isArabic;
    applyTranslation();
  });

  // ✅ دالة الترجمة
  function applyTranslation() {
    resetTitle.textContent = isArabic ? "إعادة تعيين كلمة المرور" : "Reset Password";
    resetSubtitle.textContent = isArabic
      ? "يرجى إدخال اسم المستخدم وكلمة المرور الجديدة"
      : "Please enter your username and new password";

    usernameLabel.textContent = isArabic ? "اسم المستخدم" : "Username";
    newPasswordLabel.textContent = isArabic ? "كلمة المرور الجديدة" : "New Password";
    confirmPasswordLabel.textContent = isArabic ? "تأكيد كلمة المرور" : "Confirm Password";

    usernameInput.placeholder = isArabic ? "أدخل اسم المستخدم" : "Enter your username";
    newPasswordInput.placeholder = isArabic ? "أدخل كلمة مرور جديدة" : "Enter new password";
    confirmPasswordInput.placeholder = isArabic ? "تأكيد كلمة المرور" : "Confirm password";

    updateBtn.textContent = isArabic ? "تحديث كلمة المرور" : "Update Password";

    translateOption.textContent = isArabic ? "🌐 English" : "🌐 العربية";
  }

  // ✅ إرسال الطلب لتحديث كلمة المرور
  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!username || !newPassword || !confirmPassword) {
      message.textContent = isArabic ? "يرجى تعبئة جميع الحقول" : "Please fill in all fields";
      message.style.color = "red";
      return;
    }

    if (newPassword !== confirmPassword) {
      message.textContent = isArabic ? "كلمتا المرور غير متطابقتين" : "Passwords do not match";
      message.style.color = "red";
      return;
    }

    try {
      const res = await fetch('/reset_password/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, newPassword, confirmPassword })
      });

      const result = await res.json();

      if (result.success) {
        message.textContent = isArabic
          ? "✅ تم تغيير كلمة المرور بنجاح"
          : "✅ Password changed successfully";
        message.style.color = "green";

        setTimeout(() => {
          window.location.href = "/login_user";
        }, 1500);
      } else {
        message.textContent = result.error || (isArabic
          ? "حدث خطأ أثناء التحديث"
          : "Failed to update password");
        message.style.color = "red";
      }
    } catch (err) {
      message.textContent = isArabic
        ? "فشل الاتصال بالخادم"
        : "Server error. Please try again.";
      message.style.color = "red";
      console.error("Reset error:", err);
    }
  });

  // ✅ تفعيل الترجمة عند التحميل
  applyTranslation();
});