document.addEventListener("DOMContentLoaded", () => {
    let isArabic = false;
    const translateBtn = document.getElementById("translateOption");
  
    function applyTranslation() {
      if (isArabic) {
        // OTP Box
        document.getElementById("otpTitle").textContent = "أدخل رمز التحقق";
        document.getElementById("otpMessage").textContent = "تم إرسال رمز إلى بريدك الإلكتروني";
        document.getElementById("confirmOtpBtn").textContent = "تأكيد";
        document.getElementById("resendOtpBtn").textContent = "إعادة إرسال الرمز";
  
        // Reset Password
        document.getElementById("resetTitle").textContent = "إعادة تعيين كلمة المرور";
        document.getElementById("resetSubtitle").textContent =
          "يرجى إدخال رقم التسجيل وكلمة المرور الجديدة";
  
        document.getElementById("registerLabel").textContent = "رقم التسجيل";
        document.getElementById("newPasswordLabel").textContent = "كلمة المرور الجديدة";
        document.getElementById("confirmPasswordLabel").textContent = "تأكيد كلمة المرور";
  
        document.getElementById("registerNumber").placeholder = "أدخل رقم التسجيل";
        document.getElementById("newPassword").placeholder = "أدخل كلمة المرور الجديدة";
        document.getElementById("confirmPassword").placeholder = "أكد كلمة المرور";
  
        document.getElementById("updateBtn").textContent = "تحديث كلمة المرور";
  
        translateBtn.textContent = "🌐 English";
       
      } else {
        // OTP Box
        document.getElementById("otpTitle").textContent = "Enter Verification Code";
        document.getElementById("otpMessage").textContent = "We sent a code to your email.";
        document.getElementById("confirmOtpBtn").textContent = "Confirm";
        document.getElementById("resendOtpBtn").textContent = "Resend Code";
  
        // Reset Password
        document.getElementById("resetTitle").textContent = "Reset Password";
        document.getElementById("resetSubtitle").textContent =
          "Please enter your register number and new password";
  
        document.getElementById("registerLabel").textContent = "Register Number";
        document.getElementById("newPasswordLabel").textContent = "New Password";
        document.getElementById("confirmPasswordLabel").textContent = "Confirm Password";
  
        document.getElementById("registerNumber").placeholder =
          "Enter your register number";
        document.getElementById("newPassword").placeholder =
          "Enter new password";
        document.getElementById("confirmPassword").placeholder =
          "Confirm password";
  
        document.getElementById("updateBtn").textContent = "Update Password";
  
        translateBtn.textContent = "🌐 العربية";
        document.documentElement.dir = "ltr";
      }
    }
  
    translateBtn.addEventListener("click", (e) => {
      e.preventDefault();
      isArabic = !isArabic;
      applyTranslation();
    });
  });
  

document.addEventListener("DOMContentLoaded", () => {
    const resetForm = document.getElementById("resetForm");
    const registerInput = document.getElementById("registerNumber");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const message = document.getElementById("message");

    // تعبئة رقم التسجيل من الرابط إذا موجود
    const params = new URLSearchParams(window.location.search);
    const prefillRegister = params.get("registerNumber");
    if (prefillRegister) {
        registerInput.value = prefillRegister;
        registerInput.readOnly = true;
    }

    // إرسال نموذج إعادة التعيين
    resetForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!registerInput.value || !newPasswordInput.value || !confirmPasswordInput.value) {
            message.textContent = "❌ يرجى تعبئة جميع الحقول";
            message.style.color = "red";
            return;
        }

        if (newPasswordInput.value !== confirmPasswordInput.value) {
            message.textContent = "❌ كلمة المرور غير متطابقة";
            message.style.color = "red";
            return;
        }

        try {
            const response = await fetch("/reset/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    registerNumber: registerInput.value.trim(),
                    newPassword: newPasswordInput.value.trim()
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                message.textContent = "✅ تم تحديث كلمة المرور بنجاح";
                message.style.color = "green";

                setTimeout(() => {
                    window.location.href = "/login_owner";
                }, 1500);
            } else {
                message.textContent = "❌ " + (result.error || "فشل تحديث كلمة المرور");
                message.style.color = "red";
            }
        } catch (err) {
            message.textContent = "❌ خطأ في الخادم، حاول لاحقاً";
            message.style.color = "red";
            console.error(err);
        }
    });
});
