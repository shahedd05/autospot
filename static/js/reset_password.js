document.addEventListener("DOMContentLoaded", () => {
  const resetForm = document.getElementById("resetForm");
  const usernameInput = document.getElementById("username");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const message = document.getElementById("message");

  // إعدادات الترجمة (يمكن ربطها لاحقًا)
  let isArabic = false;

  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // تحقق من الحقول
    if (!username || !newPassword || !confirmPassword) {
      message.textContent = isArabic ? "يرجى تعبئة جميع الحقول" : "Please fill in all fields";
      message.style.color = "red";
      return;
    }

    // تحقق من تطابق كلمة المرور
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

      if (result.message) {
        message.textContent = isArabic ? "تم تحديث كلمة المرور بنجاح" : result.message;
        message.style.color = "green";

        setTimeout(() => {
          window.location.href = "/login_user";  // ✅ تعديل المسار ليتوافق مع Flask
        }, 2000);
      } else {
        message.textContent = isArabic ? "حدث خطأ أثناء التحديث" : result.error;
        message.style.color = "red";
      }
    } catch (err) {
      message.textContent = isArabic ? "فشل الاتصال بالخادم" : "Server error. Please try again.";
      message.style.color = "red";
    }
  });
});