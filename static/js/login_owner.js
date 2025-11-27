document.addEventListener("DOMContentLoaded", () => {

    let isArabic = false;
    let currentRegisterNumber = "";
    let isForgotFlow = false;

    const loginBox = document.getElementById("loginBox");
    const otpBox = document.getElementById("otpBox");
    const registerNumberInput = document.getElementById("registerNumber");
    const passwordInput = document.getElementById("password");
    const forgotPassword = document.getElementById("forgotPassword");
    const otpInputs = document.querySelectorAll(".otp-digit");
    const confirmOtpBtn = document.getElementById("confirmOtpBtn");
    const resendOtpBtn = document.getElementById("resendOtpBtn");
    const translateBtn = document.getElementById("translateOption");

    // ✔ زر Create One الفعلي بالـ HTML
    const createOneBtn = document.getElementById("createAccountLink");

    // 👉 التحويل إلى verify_company
    createOneBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/verify_company";
    });

    function applyTranslation() {

        if (isArabic) {
            // Login form
            document.getElementById("loginTitle").textContent = "تسجيل الدخول";
            registerNumberInput.placeholder = "رقم التسجيل";
            passwordInput.placeholder = "كلمة المرور";
            document.getElementById("forgotPassword").textContent = "نسيت كلمة المرور؟";
            document.getElementById("loginBtn").textContent = "تسجيل الدخول";
            document.getElementById("createAccountText").innerHTML =
                `لا تملك حسابًا؟ <a href="/verify_company" id="createAccountLink">إنشاء حساب</a>`;
            document.getElementById("rememberMeText").textContent = "تذكّرني";
            // OTP
            document.getElementById("otpTitle").textContent = "أدخل رمز التحقق";
            document.getElementById("otpMessage").textContent = "✅ تم إرسال رمز التحقق إلى بريدك الإلكتروني 1234";
            confirmOtpBtn.textContent = "تأكيد";
            resendOtpBtn.textContent = "إعادة إرسال الرمز";

            // Translate Button
            translateBtn.textContent = "🌐 English";


        } else {

            document.getElementById("loginTitle").textContent = "Login";
            registerNumberInput.placeholder = "Register Number";
            passwordInput.placeholder = "Password";
            document.getElementById("forgotPassword").textContent = "Forgot Password?";
            document.getElementById("loginBtn").textContent = "Login";
            document.getElementById("createAccountText").innerHTML =
                `Don't have an account? <a href="/verify_company" id="createAccountLink">Create one</a>`;
            document.getElementById("rememberMeText").textContent = "Remember Me";
            // OTP
            document.getElementById("otpTitle").textContent = "Enter Verification Code";
            document.getElementById("otpMessage").textContent = "✅ The verification code has been sent to your email  1234 ";
            confirmOtpBtn.textContent = "Confirm";
            resendOtpBtn.textContent = "Resend Code";

            // Translate Button
            translateBtn.textContent = "🌐 العربية";

            
        }
    }

    // تبديل اللغة
    translateBtn.addEventListener("click", () => {
        isArabic = !isArabic;
        applyTranslation();
    });

    function showOtp() {
        loginBox.style.display = "none";
        otpBox.style.display = "block";
        startTimer();
        resendOtpBtn.disabled = true;
        confirmOtpBtn.disabled = true;
        otpInputs.forEach(i => i.value = "");
        otpInputs[0].focus();
    }

    function startTimer() {
        let time = 60;
        resendOtpBtn.disabled = true;
        const timerElement = document.getElementById("timer");

        const interval = setInterval(() => {
            time--;
            timerElement.textContent = `00:${time < 10 ? "0" + time : time}`;

            if (time <= 0) {
                clearInterval(interval);
                resendOtpBtn.disabled = false;
            }
        }, 1000);
    }

    otpInputs.forEach((input, index) => {
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

    // ----------------------------------------------------
    // Login Process
    // ----------------------------------------------------
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const registerNumber = registerNumberInput.value.trim();
        const password = passwordInput.value;
        currentRegisterNumber = registerNumber;
        isForgotFlow = false;

        if (!registerNumber || !password) {
            alert(isArabic ? "يرجى إدخال جميع الحقول" : "Please fill in all fields");
            return;
        }

        try {
            const response = await fetch("/login/owner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ registerNumber, password })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert(isArabic ? "تم تسجيل الدخول بنجاح" : "Login successful");
                showOtp();
            } else {
                alert(result.error || (isArabic ? "فشل تسجيل الدخول" : "Login failed"));
            }
        } catch (err) {
            console.error(err);
            alert(isArabic ? "خطأ في السيرفر" : "Server error");
        }
    });

    // ----------------------------------------------------
    // Forgot Password
    // ----------------------------------------------------
    forgotPassword.addEventListener("click", async () => {

        const registerNumber = registerNumberInput.value.trim();
        currentRegisterNumber = registerNumber;
        isForgotFlow = true;

        if (!registerNumber) {
            alert(isArabic ? "يرجى إدخال رقم التسجيل" : "Please enter your register number");
            return;
        }

        try {
            const response = await fetch("/reset/owner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ registerNumber })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert(isArabic ? "✅ تم إرسال رمز التحقق إلى بريدك الإلكتروني  1234"
                    : "✅ The verification code has been sent to your email 1234 ");
                showOtp();
            } else {
                alert(result.error || (isArabic ? "فشل إرسال OTP" : "Failed to send OTP"));
            }

        } catch (err) {
            console.error(err);
            alert(isArabic ? "خطأ في السيرفر" : "Server error");
        }
    });

    // ----------------------------------------------------
    // Confirm OTP
    // ----------------------------------------------------
    confirmOtpBtn.addEventListener("click", async () => {
        const otp = [...otpInputs].map(i => i.value).join("");

        if (otp.length < 4) return;

        try {
            const response = await fetch("/verify/owner-login-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    registerNumber: currentRegisterNumber,
                    otp
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {

                alert(isArabic ? "تم التحقق من الرمز" : "OTP verified");

                if (isForgotFlow) {
                    window.location.href =
                        "/reset_password_owner?registerNumber=" + encodeURIComponent(currentRegisterNumber);
                } else {
                    window.location.href = "/dashboard";
                }

            } else {
                alert(result.error || (isArabic ? "رمز غير صحيح" : "Invalid OTP"));
            }

        } catch (err) {
            console.error(err);
            alert(isArabic ? "خطأ في السيرفر" : "Server error");
        }
    });

    // ----------------------------------------------------
    // Resend OTP
    // ----------------------------------------------------
    resendOtpBtn.addEventListener("click", async () => {
        resendOtpBtn.disabled = true;

        const url = isForgotFlow ? "/reset/owner" : "/resend/owner-otp";

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ registerNumber: currentRegisterNumber })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert(isArabic ? "🔄 تم إعادة إرسال الرمز بنجاح (1234)" : "🔄 OTP resent successfully (1234)");
                startTimer();
            } else {
                alert(result.error || (isArabic ? "فشل إعادة الإرسال" : "Failed to resend"));
                resendOtpBtn.disabled = false;
            }

        } catch (err) {
            console.error(err);
            alert(isArabic ? "خطأ في السيرفر" : "Server error");
            resendOtpBtn.disabled = false;
        }
    });

    applyTranslation();
});
