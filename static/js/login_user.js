document.addEventListener("DOMContentLoaded", () => {
  let isArabic = false;
  let loggedInUsername = "";

  const loginBox = document.getElementById("loginBox");
  const otpBox = document.getElementById("otpBox");
  const loginTitle = document.getElementById("loginTitle");
  const createAccountText = document.getElementById("createAccountText");
  const forgotPassword = document.getElementById("forgotPassword");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const otpTitle = document.getElementById("otpTitle");
  const otpMessage = document.getElementById("otpMessage");
  const confirmOtpBtn = document.getElementById("confirmOtpBtn");
  const resendOtpBtn = document.getElementById("resendOtpBtn");
  const translateBtn = document.getElementById("translateOption");
  const otpInputs = document.querySelectorAll(".otp-digit");

  translateBtn.addEventListener("click", () => {
    isArabic = !isArabic;
    applyTranslation();
  });

  function applyTranslation() {
    loginTitle.textContent = isArabic ? "تسجيل الدخول" : "Login";
    createAccountText.innerHTML = isArabic
      ? "ليس لديك حساب؟ <a href='/register_user'>أنشئ واحدًا</a>"
      : "Don't have an account? <a href='/register_user'>Create one</a>";
    forgotPassword.textContent = isArabic ? "هل نسيت كلمة المرور؟" : "Forgot Password?";
    usernameInput.placeholder = isArabic ? "اسم المستخدم" : "Username";
    passwordInput.placeholder = isArabic ? "كلمة المرور" : "Password";
    otpTitle.textContent = isArabic ? "أدخل رمز التحقق" : "Enter Verification Code";
    otpMessage.textContent = isArabic
      ? "تم إرسال الرمز إلى بريدك الإلكتروني"
      : "We sent a code to your email.";
    confirmOtpBtn.textContent = isArabic ? "تأكيد" : "Confirm";
    resendOtpBtn.textContent = isArabic ? "إعادة إرسال الرمز" : "Resend Code";
  }

  document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    try {
      const response = await fetch("/login/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const result = await response.json();

      if (result.success) {
        loggedInUsername = username;
        alert(isArabic ? "✅ تم تسجيل الدخول بنجاح!" : "✅ Login successful!");
        showOtp();
      } else {
        alert(result.error || (isArabic ? "فشل تسجيل الدخول." : "Login failed."));
      }
    } catch (err) {
      alert(isArabic ? "خطأ في السيرفر، حاول مرة أخرى." : "Server error. Please try again.");
      console.error("Login error:", err);
    }
  });

  function showOtp() {
    loginBox.style.display = "none";
    otpBox.style.display = "block";
    startTimer();
    resendOtpBtn.disabled = true;
    confirmOtpBtn.disabled = true;
    otpInputs.forEach(input => input.value = "");
    otpInputs[0].focus();
    applyTranslation();
  }

  otpInputs.forEach((input, index) => {
    input.setAttribute("inputmode", "numeric");
    input.setAttribute("autocomplete", "off");

    input.addEventListener("input", () => {
      if (input.value.length > 0 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
      confirmOtpBtn.disabled = [...otpInputs].some(i => i.value === "");
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && input.value === "" && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });

  function startTimer() {
    let time = 60;
    const timerElement = document.getElementById("timer");
    resendOtpBtn.disabled = true;

    const interval = setInterval(() => {
      time--;
      timerElement.textContent = `00:${time < 10 ? "0" + time : time}`;

      if (time <= 0) {
        clearInterval(interval);
        resendOtpBtn.disabled = false;
      }
    }, 1000);
  }

  confirmOtpBtn.addEventListener("click", async () => {
    const otp = [...otpInputs].map(i => i.value).join("");

    confirmOtpBtn.disabled = true;

    try {
      const response = await fetch("/verify/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loggedInUsername, otp })
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const result = await response.json();

      if (result.success) {
        alert(isArabic ? "✅ تم التحقق من الرمز!" : "✅ OTP verified!");
        window.location.href = "/dashboard";
      } else {
        alert(result.error || (isArabic ? "فشل التحقق من الرمز." : "OTP verification failed."));
        confirmOtpBtn.disabled = false;
      }
    } catch (err) {
      alert(isArabic ? "خطأ أثناء التحقق من الرمز." : "Error verifying OTP.");
      console.error("OTP error:", err);
      confirmOtpBtn.disabled = false;
    }
  });

  resendOtpBtn.addEventListener("click", () => {
    startTimer();
    alert(isArabic ? "تمت إعادة إرسال الرمز (ثابت: 1234)" : "OTP resent (fixed: 1234)");
  });

  forgotPassword.addEventListener("click", showOtp);
});