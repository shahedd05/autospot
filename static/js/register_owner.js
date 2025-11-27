document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const registerNumberInput = document.getElementById("registerNumber");
    const nationalNumberInput = document.getElementById("nationalNumber");
    const ownerNameInput = document.getElementById("ownerName");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const passwordError = document.getElementById("passwordError");

    const otpBox = document.getElementById("otpBox");
    const otpInputs = document.querySelectorAll(".otp-digit");
    const confirmOtpBtn = document.getElementById("confirmOtpBtn");
    const resendOtpBtn = document.getElementById("resendOtpBtn");
    const otpMessage = document.getElementById("otpMessage");
    const otpTitle = document.getElementById("otpTitle");
    const timerDisplay = document.getElementById("timer");

    let otpTimerInterval;
    let isArabic = false;

    // تعبئة الحقول من LocalStorage
    const savedReg = localStorage.getItem("verifiedRegisterNumber");
    const savedNat = localStorage.getItem("verifiedNationalNumber");
    if (savedReg) registerNumberInput.value = savedReg;
    if (savedNat) nationalNumberInput.value = savedNat;

    // ======== وظائف OTP ========
    function startOtpTimer(seconds) {
        clearInterval(otpTimerInterval);
        resendOtpBtn.disabled = true;
        let remaining = seconds;

        otpTimerInterval = setInterval(() => {
            const min = String(Math.floor(remaining / 60)).padStart(2, "0");
            const sec = String(remaining % 60).padStart(2, "0");
            timerDisplay.textContent = `${min}:${sec}`;

            remaining -= 1;
            if (remaining < 0) {
                clearInterval(otpTimerInterval);
                resendOtpBtn.disabled = false;
                timerDisplay.textContent = isArabic ? "انتهى الوقت" : "Time expired";
            }
        }, 1000);
    }

    function getOtpCode() {
        return [...otpInputs].map(d => d.value.trim()).join("");
    }

    function resetOtpInputs() {
        otpInputs.forEach(i => i.value = "");
        confirmOtpBtn.disabled = true;
        otpInputs[0]?.focus();
        otpMessage.textContent = isArabic
            ? "✅ تم إرسال رمز التحقق إلى بريدك الإلكتروني 1234"
            : "✅ The verification code has been sent to your email 1234";
    }

    otpInputs.forEach((input, index) => {
        input.addEventListener("input", () => {
            input.value = input.value.replace(/[^0-9]/g, "").slice(0, 1);
            if (input.value.length === 1 && index < otpInputs.length - 1) otpInputs[index + 1].focus();
            confirmOtpBtn.disabled = (getOtpCode().length !== otpInputs.length);
        });
        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && input.value === "" && index > 0) otpInputs[index - 1].focus();
        });
        input.addEventListener("paste", (e) => {
            const pasted = (e.clipboardData || window.clipboardData).getData("text");
            if (/^\d{4}$/.test(pasted)) {
                e.preventDefault();
                for (let i = 0; i < otpInputs.length; i++) otpInputs[i].value = pasted[i];
                confirmOtpBtn.disabled = false;
                otpInputs[otpInputs.length - 1].focus();
            }
        });
    });

    confirmOtpBtn.addEventListener("click", async () => {
        const otpCode = getOtpCode();
        const registerNumber = localStorage.getItem("pendingOwnerRegisterNumber");
        const nationalNumber = localStorage.getItem("pendingOwnerNationalNumber");

        if (!otpCode || otpCode.length !== otpInputs.length) {
            otpMessage.textContent = isArabic ? "❌ أدخل رمز التحقق كامل" : "❌ Enter full OTP code";
            return;
        }

        try {
            const response = await fetch("/verify/owner-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ registerNumber, nationalNumber, otp: otpCode })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                otpMessage.textContent = isArabic ? "✅ تم تفعيل الحساب بنجاح" : "✅ Account activated successfully";
                setTimeout(() => window.location.href = "owner_dashboard.html", 1200);
            } else {
                otpMessage.textContent = "❌ " + (data.error || (isArabic ? "OTP غير صحيح" : "Incorrect OTP"));
            }
        } catch (err) {
            otpMessage.textContent = isArabic ? "❌ خطأ في الخادم، حاول لاحقاً" : "❌ Server error, please try again later";
        }
    });

    resendOtpBtn.addEventListener("click", async () => {
        const registerNumber = localStorage.getItem("pendingOwnerRegisterNumber");
        const nationalNumber = localStorage.getItem("pendingOwnerNationalNumber");
        if (!registerNumber || !nationalNumber) {
            otpMessage.textContent = isArabic ? "❌ بيانات التسجيل غير موجودة" : "❌ Registration data missing";
            return;
        }
        try {
            const response = await fetch("/resend/owner-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ registerNumber, nationalNumber })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                otpMessage.textContent = data.message || (isArabic ? "🔄 تم إعادة إرسال الرمز بنجاح (1234)" : "🔄 OTP resent successfully (1234)");
                alert(isArabic ? "🔄 تم إعادة إرسال الرمز بنجاح (1234)" : "🔄 OTP resent successfully (1234)");
                resetOtpInputs();
                startOtpTimer(60);
            } else {
                otpMessage.textContent = "❌ " + (data.error || (isArabic ? "فشل إعادة الإرسال" : "Resend failed"));
            }
        } catch (err) {
            otpMessage.textContent = isArabic ? "❌ خطأ في الخادم، حاول لاحقاً" : "❌ Server error, please try again later";
        }
    });

    // ======== إرسال الفورم ========
    registerForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        if (passwordInput.value !== confirmPasswordInput.value) {
            passwordError.style.display = "block";
            return;
        }
        passwordError.style.display = "none";

        const payload = {
            registerNumber: registerNumberInput.value.trim(),
            nationalNumber: nationalNumberInput.value.trim(),
            ownerName: ownerNameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value.trim()
        };

        try {
            const response = await fetch("/register_owner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                alert(isArabic
                    ? `✅ تم إنشاء الحساب بنجاح: ${data.ownerName}. يرجى إدخال رمز التحقق 1234 (تجريبي).`
                    : `✅ Account created successfully: ${data.ownerName}. Please enter your OTP 1234 (demo).`);

                localStorage.setItem("pendingOwnerRegisterNumber", payload.registerNumber);
                localStorage.setItem("pendingOwnerNationalNumber", payload.nationalNumber);

                document.getElementById("registerBox").style.display = "none";
                otpBox.style.display = "block";
                resetOtpInputs();
                startOtpTimer(60);

            } else {
                if (data.error && data.error.includes("pending verification")) {
                    localStorage.setItem("pendingOwnerRegisterNumber", payload.registerNumber);
                    localStorage.setItem("pendingOwnerNationalNumber", payload.nationalNumber);

                    alert(isArabic
                        ? "⚠️ الحساب قيد التحقق بالفعل، اضغط OK لإدخال OTP."
                        : "⚠️ Pending account already exists, press OK to enter OTP.");

                    document.getElementById("registerBox").style.display = "none";
                    otpBox.style.display = "block";
                    resetOtpInputs();
                    startOtpTimer(60);
                } else if (data.error && data.error.includes("Account already exists")) {
                    alert(isArabic
                        ? "⚠️ الحساب مفعل بالفعل. يرجى تسجيل الدخول."
                        : "⚠️ Account already activated. Please log in.");
                    window.location.href = "login_owner.html";
                } else {
                    alert(isArabic ? `❌ خطأ: ${data.error}` : `❌ Error: ${data.error}`);
                }
            }
        } catch (err) {
            alert(isArabic ? "❌ خطأ في الخادم، حاول لاحقاً" : "❌ Server error, please try again later");
        }
    });

    // ======== زر الترجمة ========
    const translateOption = document.getElementById("translateOption");
    translateOption.addEventListener("click", () => {
        isArabic = !isArabic;

        // ترجمة Register Box
        registerNumberInput.placeholder = isArabic ? "أدخل رقم تسجيل الشركة" : "Register Number";
        nationalNumberInput.placeholder = isArabic ? "أدخل الرقم الوطني للشركة" : "National Number";
        ownerNameInput.placeholder = isArabic ? "اسم المالك" : "Owner Name";
        emailInput.placeholder = isArabic ? "البريد الإلكتروني" : "Email";
        passwordInput.placeholder = isArabic ? "كلمة المرور" : "Password";
        confirmPasswordInput.placeholder = isArabic ? "تأكيد كلمة المرور" : "Confirm password";
        passwordError.textContent = isArabic ? "❌ كلمتا المرور غير متطابقتين!" : "Passwords do not match!";
        registerForm.querySelector("button[type='submit']").textContent = isArabic ? "تسجيل" : "Sign Up";
        registerBox.querySelector("h4").innerHTML = isArabic
            ? 'هل لديك حساب؟ <a href="login_user.html">تسجيل الدخول</a>'
            : 'Already have an account? <a href="login_user.html">Login</a>';

        // ترجمة OTP Box
        otpTitle.textContent = isArabic ? "التحقق من OTP" : "Enter Verification Code";
        otpMessage.textContent = isArabic ?  "✅ تم إرسال رمز التحقق إلى بريدك الإلكتروني 1234"
        : "✅ The verification code has been sent to your email  1234 ";
        confirmOtpBtn.textContent = isArabic ? "تحقق" : "Confirm";
        resendOtpBtn.textContent = isArabic ? "إعادة الإرسال" : "Resend Code";
        timerDisplay.textContent = isArabic && timerDisplay.textContent === "Time expired" ? "انتهى الوقت" : timerDisplay.textContent;
    });

});
