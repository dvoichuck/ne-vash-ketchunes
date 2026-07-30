(() => {
  const i18n = window.NVK_I18N;
  if (!i18n) {
    console.error("NVK_I18N is missing");
    return;
  }

  const { getInitialLang, setLang, toggleLang } = i18n;

  const burger = document.querySelector(".burger");
  const mobileMenu = document.querySelector(".mobile-menu");
  const popup = document.querySelector("#popup");
  const form = document.querySelector("#order-form");

  let currentLang = getInitialLang();

  function syncLangCode(lang) {
    const code = lang === "ua" ? "UA" : "EN";
    document.querySelectorAll("[data-lang-code]").forEach((el) => {
      el.textContent = code;
    });
  }

  function applyLang(lang) {
    currentLang = setLang(lang);
    syncLangCode(currentLang);
  }

  applyLang(currentLang);

  // Event delegation — survives DOM swaps / late buttons
  document.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-lang-toggle]");
    if (toggle) {
      event.preventDefault();
      currentLang = toggleLang(currentLang);
      syncLangCode(currentLang);
      return;
    }

    const setBtn = event.target.closest("[data-set-lang]");
    if (setBtn) {
      event.preventDefault();
      applyLang(setBtn.getAttribute("data-set-lang"));
    }
  });

  function closeMenu() {
    document.body.classList.remove("menu-open");
    if (burger) burger.setAttribute("aria-expanded", "false");
    if (mobileMenu) mobileMenu.hidden = true;
  }

  burger?.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    burger.setAttribute("aria-expanded", String(open));
    mobileMenu.hidden = !open;
  });

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    popup.hidden = false;
    form.reset();
  });

  popup?.querySelector(".popup-close")?.addEventListener("click", () => {
    popup.hidden = true;
  });

  popup?.addEventListener("click", (event) => {
    if (event.target === popup) popup.hidden = true;
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      popup.hidden = true;
      closeMenu();
    }
  });

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
    );
    revealItems.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        el.classList.add("is-in");
      } else {
        observer.observe(el);
      }
    });
  } else {
    revealItems.forEach((el) => el.classList.add("is-in"));
  }
})();
