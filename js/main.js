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
    syncCustomSelectLabels();
  }

  // Event delegation — survives DOM swaps / late buttons
  document.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-lang-toggle]");
    if (toggle) {
      event.preventDefault();
      currentLang = toggleLang(currentLang);
      syncLangCode(currentLang);
      syncCustomSelectLabels();
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

  /* Custom select — Figma form selector dropdown */
  const selectRoots = [...document.querySelectorAll("[data-custom-select]")];

  function getSelectParts(root) {
    return {
      root,
      field: root.closest("[data-select-field]"),
      input: root.querySelector('input[type="hidden"]'),
      trigger: root.querySelector(".select-trigger"),
      valueEl: root.querySelector(".select-value"),
      menu: root.querySelector(".select-menu"),
      options: [...root.querySelectorAll('[role="option"]')],
      error: root.closest("[data-select-field]")?.querySelector(".form-error"),
    };
  }

  function closeSelect(parts) {
    parts.root.classList.remove("is-open");
    parts.menu.hidden = true;
    parts.trigger.setAttribute("aria-expanded", "false");
    parts.options.forEach((opt) => opt.classList.remove("is-active"));
  }

  function closeAllSelects(except) {
    selectRoots.forEach((root) => {
      if (root === except) return;
      closeSelect(getSelectParts(root));
    });
  }

  function openSelect(parts) {
    closeAllSelects(parts.root);
    parts.root.classList.add("is-open");
    parts.menu.hidden = false;
    parts.trigger.setAttribute("aria-expanded", "true");
    const selected = parts.options.find((opt) => opt.getAttribute("aria-selected") === "true");
    const focusOpt = selected || parts.options[0];
    focusOpt?.classList.add("is-active");
    focusOpt?.focus();
  }

  function setSelectValue(parts, option) {
    const value = option?.dataset.value || "";
    const label = option?.textContent?.trim() || "";
    parts.input.value = value;
    parts.options.forEach((opt) => {
      const on = opt === option;
      opt.setAttribute("aria-selected", on ? "true" : "false");
    });

    if (option) {
      parts.valueEl.textContent = label;
      parts.valueEl.classList.remove("is-placeholder");
      parts.valueEl.removeAttribute("data-i18n");
      parts.field?.classList.remove("is-error");
      if (parts.error) parts.error.hidden = true;
    } else {
      const dict = i18n.translations[currentLang] || i18n.translations.ua;
      parts.valueEl.textContent = dict["form.need.ph"];
      parts.valueEl.classList.add("is-placeholder");
      parts.valueEl.setAttribute("data-i18n", "form.need.ph");
    }
  }

  function syncCustomSelectLabels() {
    selectRoots.forEach((root) => {
      const parts = getSelectParts(root);
      const selected = parts.options.find((opt) => opt.getAttribute("aria-selected") === "true");
      if (selected) {
        parts.valueEl.textContent = selected.textContent.trim();
        parts.valueEl.classList.remove("is-placeholder");
      }
    });
  }

  applyLang(currentLang);

  function resetCustomSelects() {
    selectRoots.forEach((root) => {
      const parts = getSelectParts(root);
      closeSelect(parts);
      setSelectValue(parts, null);
      parts.field?.classList.remove("is-error");
      if (parts.error) parts.error.hidden = true;
    });
  }

  selectRoots.forEach((root) => {
    const parts = getSelectParts(root);

    parts.trigger.addEventListener("click", () => {
      if (parts.root.classList.contains("is-open")) {
        closeSelect(parts);
      } else {
        openSelect(parts);
      }
    });

    parts.options.forEach((option) => {
      option.addEventListener("click", () => {
        setSelectValue(parts, option);
        closeSelect(parts);
        parts.trigger.focus();
      });

      option.addEventListener("mousemove", () => {
        parts.options.forEach((opt) => opt.classList.remove("is-active"));
        option.classList.add("is-active");
      });
    });

    parts.trigger.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openSelect(parts);
      }
    });

    parts.menu.addEventListener("keydown", (event) => {
      const active = parts.options.find((opt) => opt.classList.contains("is-active")) || parts.options[0];
      const index = parts.options.indexOf(active);

      if (event.key === "Escape") {
        event.preventDefault();
        closeSelect(parts);
        parts.trigger.focus();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const next = parts.options[Math.min(index + 1, parts.options.length - 1)];
        parts.options.forEach((opt) => opt.classList.remove("is-active"));
        next.classList.add("is-active");
        next.focus();
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        const prev = parts.options[Math.max(index - 1, 0)];
        parts.options.forEach((opt) => opt.classList.remove("is-active"));
        prev.classList.add("is-active");
        prev.focus();
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (active) {
          setSelectValue(parts, active);
          closeSelect(parts);
          parts.trigger.focus();
        }
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-custom-select]")) return;
    closeAllSelects();
  });

  function closePopup() {
    if (popup) popup.hidden = true;
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const selectField = form.querySelector("[data-select-field]");
    const needInput = form.querySelector('input[name="need"]');
    const error = selectField?.querySelector(".form-error");
    const name = form.querySelector('input[name="name"]');
    const contact = form.querySelector('input[name="contact"]');

    let valid = true;

    if (name && !name.value.trim()) {
      valid = false;
      name.focus();
    } else if (contact && !contact.value.trim()) {
      valid = false;
      contact.focus();
    } else if (needInput && !needInput.value) {
      valid = false;
      selectField?.classList.add("is-error");
      if (error) error.hidden = false;
      form.querySelector(".select-trigger")?.focus();
    }

    if (!valid) return;

    popup.hidden = false;
    form.reset();
    resetCustomSelects();
  });

  popup?.querySelector(".popup-ok")?.addEventListener("click", closePopup);

  popup?.addEventListener("click", (event) => {
    if (event.target === popup) closePopup();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePopup();
      closeMenu();
      closeAllSelects();
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
