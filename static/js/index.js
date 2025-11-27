const rolesPageTranslations = {
  ar: { title: "اختر دورك", user: "مستخدم", owner: "مالك" },
  en: { title: "Choose Your Role", user: "User", owner: "Owner" }
};

function translateRolesPage(lang) {
  document.getElementById("title").textContent = rolesPageTranslations[lang].title;
  document.getElementById("userLabel").textContent = rolesPageTranslations[lang].user;
  document.getElementById("ownerLabel").textContent = rolesPageTranslations[lang].owner;
}

document.addEventListener("DOMContentLoaded", () => {
  const translateBtn = document.getElementById("translateOption");
  if (!translateBtn) return;

  translateBtn.addEventListener("click", () => {
    let currentLang = document.body.getAttribute("lang") || "en";
    const newLang = currentLang === "en" ? "ar" : "en";
    document.body.setAttribute("lang", newLang);

    translateRolesPage(newLang);

    // تغيير نص زر الترجمة نفسه
    translateBtn.textContent = newLang === "ar" ? "🌐 English" : "🌐 العربية";
  });
});
