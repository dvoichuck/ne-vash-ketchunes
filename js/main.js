const burger = document.querySelector(".burger");
const mobileMenu = document.querySelector(".mobile-menu");
const popup = document.querySelector("#popup");
const form = document.querySelector("#order-form");

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
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  revealItems.forEach((el) => observer.observe(el));
} else {
  revealItems.forEach((el) => el.classList.add("is-in"));
}
