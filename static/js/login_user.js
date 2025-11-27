document.addEventListener("DOMContentLoaded", () => {
  let isArabic = false;
  let loggedInUsername = "";
  let isForgotFlow = false;

  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const otpBox = document.getElementById("otpBox");
  const confirmOtpBtn = document.getElementById("confirmOtpBtn");
  const resendOtpBtn = document.getElementById("resendOtpBtn");
  const otpInputs = document.querySelectorAll(".otp-digit");
  const otpMessage = document.getElementById("otpMessage");
  const forgotPassword = document.getElementById("forgotPassword");
  const timerElement = document.getElementById("timer");
  const loginBox = document.getElementById("loginBox");
  const translateOption = document.getElementById("translateOption");
  const loginTitle = document.getElementById("loginTitle");
  const loginBtn = document.getElementById("loginBtn");
  const rememberMeLabel = document.getElementById("rememberMeLabel");
  const createAccountText = document.getElementById("createAccountText");
  const otpTitle = document.getElementById("otpTitle");

  // ✅ زر الترجمة
  translateOption.addEventListener("click", () => {
    isArabic = !isArabic;
    applyTranslation();
  });

  // ✅ دالة الترجمة
  function applyTranslation() {
    loginTitle.textContent = isArabic ? "تسجيل الدخول" : "Login";
    usernameInput.placeholder = isArabic ? "اسم المستخدم" : "Username";
    passwordInput.placeholder = isArabic ? "كلمة المرور" : "Password";
    loginBtn.textContent = isArabic ? "دخول" : "Login";
    rememberMeLabel.innerHTML = isArabic
      ? '<input type="checkbox" id="rememberMe"> تذكرني'
      : '<input type="checkbox" id="rememberMe"> Remember Me';
    forgotPassword.textContent = isArabic ? "نسيت كلمة المرور؟" : "Forgot Password?";
    createAccountText.innerHTML = isArabic
      ? 'ليس لديك حساب؟ <a href="/register_user">أنشئ واحداً</a>'
      : 'Don\'t have an account? <a href="/register_user">Create one</a>';

    // ✅ ترجمة عناصر OTP
    otpTitle.textContent = isArabic ? "أدخل رمز التحقق" : "Enter Verification Code";
    otpMessage.textContent = isArabic
      ? "✅ تم إرسال رمز التحقق إلى بريدك الإلكتروني 1234"
      : "✅ The verification code has been sent to your email  1234 ";
    confirmOtpBtn.textContent = isArabic ? "تأكيد" : "Confirm";
    resendOtpBtn.textContent = isArabic ? "إعادة إرسال الرمز" : "Resend Code";
    timerElement.textContent = isArabic ? "الوقت: 01:00" : "Time: 01:00";

    translateOption.textContent = isArabic ? "🌐 English" : "🌐 العربية";
  }

  // ✅ تسجيل الدخول
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    try {
      const response = await fetch("/login/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // ✅ الحساب موجود في users
        loggedInUsername = username;
        isForgotFlow = false;
        alert(isArabic ? "✅ تم تسجيل الدخول بنجاح!" : "✅ Login successful!");
        showOtp();
      } else if (result.status === "pending") {
        // ✅ الحساب موجود في pending_users
        loggedInUsername = username;
        isForgotFlow = false;
        alert(isArabic ? "⚠️ الحساب غير مفعل، أدخل رمز التحقق" : "⚠️ Account is pending, please verify OTP");
        showOtp();
      } else {
        // ❌ أي خطأ آخر
        alert(result.error || (isArabic ? "❌ فشل تسجيل الدخول" : "❌ Login failed"));
      }
    } catch (err) {
      alert(isArabic ? "❌ خطأ في السيرفر" : "❌ Server error");
      console.error("Login error:", err);
    }
  });

  // ✅ Forgot Password → إرسال OTP
  forgotPassword.addEventListener("click", async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    if (!username) {
      alert(isArabic ? "يرجى إدخال اسم المستخدم أولاً" : "Please enter your username first");
      return;
    }

    try {
      const response = await fetch("/resend/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        loggedInUsername = username;
        isForgotFlow = true;
        alert(isArabic ?  "✅ تم إرسال رمز التحقق إلى بريدك الإلكتروني 1234"
          : "✅ The verification code has been sent to your email  1234 ");
        showOtp();
      } else {
        alert(result.error || (isArabic ? "❌ فشل إرسال الرمز" : "❌ Failed to send OTP"));
      }
    } catch (err) {
      alert(isArabic ? "❌ خطأ في إرسال الرمز" : "❌ Error sending OTP");
      console.error("Forgot error:", err);
    }
  });

  // ✅ إظهار صندوق OTP مع مؤقت
  function showOtp() {
    loginBox.style.display = "none";
    otpBox.style.display = "block";
    otpInputs.forEach(i => i.value = "");
    confirmOtpBtn.disabled = true;
    resendOtpBtn.disabled = true;
    otpMessage.textContent = isArabic
    ? "✅ تم إرسال رمز التحقق إلى بريدك الإلكتروني 1234"
    : "✅ The verification code has been sent to your email  1234 ";
    startTimer();
  }

  // ✅ مؤقت لإعادة تفعيل زر إعادة الإرسال
  function startTimer() {
    let time = 60;
    timerElement.textContent = isArabic ? "الوقت: 01:00" : "Time: 01:00";
    resendOtpBtn.disabled = true;

    const interval = setInterval(() => {
      time--;
      timerElement.textContent = isArabic
        ? `الوقت: 00:${time < 10 ? "0" + time : time}`
        : `Time: 00:${time < 10 ? "0" + time : time}`;
      if (time <= 0) {
        clearInterval(interval);
        resendOtpBtn.disabled = false;
      }
    }, 1000);
  }

  // ✅ إدخال OTP
  otpInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      if (input.value.length > 0 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
      const otpCode = [...otpInputs].map(i => i.value).join("");
      confirmOtpBtn.disabled = otpCode.length !== otpInputs.length;
    });
  });

  // ✅ تأكيد OTP
  confirmOtpBtn.addEventListener("click", async () => {
    const otpCode = [...otpInputs].map(i => i.value).join("");
    try {
      const response = await fetch("/verify/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loggedInUsername, otp: otpCode })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        alert(isArabic ?  "✅ تم التحقق من الحساب بنجاح" 
    : "✅ Account verified successfully"
);
        window.location.href = isForgotFlow ? "/reset_password" : "/user_dashboard.html";
      } else {
        alert(result.error || (isArabic ? "❌ رمز غير صحيح" : "❌ Incorrect OTP"));
      }
    } catch (err) {
      alert(isArabic ? "❌ خطأ أثناء التحقق" : "❌ Error verifying OTP");
    }
  });

  // ✅ إعادة إرسال OTP
  resendOtpBtn.addEventListener("click", async () => {
    try {
      const response = await fetch("/resend/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loggedInUsername })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        alert(isArabic ? "🔄 تم إعادة إرسال الرمز بنجاح (1234)" : "🔄 OTP resent successfully (1234)");
        startTimer();
      } else {
        alert(result.error || (isArabic ? "❌ فشل إعادة الإرسال" : "❌ Resend failed"));
      }
    } catch (err) {
      alert(isArabic ? "❌ خطأ أثناء إعادة الإرسال" : "❌ Error resending OTP");
    }
  });

  // ✅ تفعيل الترجمة عند التحميل
  applyTranslation();
});