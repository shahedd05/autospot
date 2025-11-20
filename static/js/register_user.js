document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  const registerBox = document.getElementById("registerBox");
  const otpBox = document.getElementById("otpBox");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const passwordError = document.getElementById("passwordError");
  const timerDisplay = document.getElementById("timer");
  const resendBtn = document.getElementById("resendOtpBtn");
  const confirmOtpBtn = document.getElementById("confirmOtpBtn");
  const otpInputs = document.querySelectorAll(".otp-digit");
  const translateOption = document.getElementById("translateOption");
  const otpMessage = document.getElementById("otpMessage");
  const otpTitle = document.getElementById("otpTitle");

  let isArabic = false;
  let countdown;
  let timeLeft = 60;
  let registeredUsername = ""; // ✅ تخزين اسم المستخدم

  translateOption.addEventListener("click", function () {
    isArabic = !isArabic;
    applyTranslation();
  });

  function applyTranslation() {
    document.querySelector("#registerBox h1").textContent = isArabic ? "إنشاء حساب" : "Create Account";
    fullname.placeholder = isArabic ? "اسم المستخدم" : "Username";
    email.placeholder = isArabic ? "البريد الإلكتروني" : "Email";
    password.placeholder = isArabic ? "كلمة المرور" : "Password";
    confirmPassword.placeholder = isArabic ? "تأكيد كلمة المرور" : "Confirm password";
    document.querySelector("#registerForm button[type='submit']").textContent = isArabic ? "تسجيل" : "Sign Up";
    document.querySelector("#registerBox h4").innerHTML = isArabic
      ? "هل لديك حساب بالفعل؟ <a href='userlogin.html'>تسجيل الدخول</a>"
      : "Already have an account? <a href='userlogin.html'>Login</a>";
    passwordError.textContent = isArabic
      ? "كلمتا المرور غير متطابقتين!"
      : "Passwords do not match!";
    otpTitle.textContent = isArabic ? "أدخل رمز التحقق" : "Enter Verification Code";
    otpMessage.textContent = isArabic
      ? "رمز التحقق هو 1234 (تجريبي)"
      : "Your verification code is 1234 (demo)";
    confirmOtpBtn.textContent = isArabic ? "تأكيد" : "Confirm";
    resendBtn.textContent = isArabic ? "إعادة إرسال الرمز" : "Resend Code";
    translateOption.textContent = isArabic ? "🌐 English" : "🌐 العربية";
  }

  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (passwordInput.value !== confirmPasswordInput.value) {
      passwordError.style.display = "block";
      return;
    }

    passwordError.style.display = "none";

    const userData = {
      username: document.getElementById("fullname").value,
      email: document.getElementById("email").value,
      password: passwordInput.value,
      confirm: confirmPasswordInput.value
    };

    registeredUsername = userData.username; // ✅ حفظ الاسم

    fetch("http://localhost:5000/register/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        registerBox.style.display = "none";
        otpBox.style.display = "block";
        startTimer();
      }
    })
    .catch(err => {
      alert("Server error. Please try again.");
      console.error(err);
    });
  });

  function startTimer() {
    timeLeft = 60;
    resendBtn.disabled = true;
    timerDisplay.textContent = formatTime(timeLeft);
    countdown = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = formatTime(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(countdown);
        resendBtn.disabled = false;
        timerDisplay.textContent = isArabic ? "⏱️ انتهى الوقت" : "⏱️ Time expired";
      }
    }, 1000);
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  resendBtn.addEventListener("click", async function () {
    const email = document.getElementById("email").value;

    const response = await fetch("http://localhost:5000/resend/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const result = await response.json();
    alert(result.message || result.error);
    startTimer();
  });

  confirmOtpBtn.addEventListener("click", async function () {
    const otpCode = Array.from(otpInputs).map(input => input.value).join("");

    const response = await fetch("http://localhost:5000/verify/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: registeredUsername, otp: otpCode }) // ✅ إرسال الاسم المحفوظ
    });

    const result = await response.json();

    if (result.success) {
      alert(isArabic ? "✅ تم التحقق من الحساب بنجاح!" : "✅ Account verified successfully!");
      window.location.href = "/dashboard";
    } else {
      alert(result.error || "OTP verification failed.");
    }
  });

  otpInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      if (input.value.length === 1 && index < otpInputs.length - 1) otpInputs[index + 1].focus();
      checkOtpFilled();
    });
    input.addEventListener("keydown", e => {
      if (e.key === "Backspace" && input.value === "" && index > 0) otpInputs[index - 1].focus();
    });
  });

  function checkOtpFilled() {
    confirmOtpBtn.disabled = ![...otpInputs].every(input => input.value.trim() !== "");
  }
});