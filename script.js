const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".site-nav");

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  navigation.classList.toggle("open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton?.setAttribute("aria-expanded", "false");
    navigation.classList.remove("open");
    document.body.classList.remove("menu-open");
  });
});

document.getElementById("current-year").textContent = new Date().getFullYear();

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

const quoteForm = document.getElementById("quote-form");
const formStatus = quoteForm?.querySelector(".form-status");

quoteForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!quoteForm.checkValidity()) {
    quoteForm.reportValidity();
    return;
  }

  const data = new FormData(quoteForm);
  const fields = {
    name: data.get("name"),
    company: data.get("company") || "Not provided",
    email: data.get("email"),
    phone: data.get("phone") || "Not provided",
    category: data.get("category"),
    timeline: data.get("timeline"),
    budget: data.get("budget"),
    details: data.get("details"),
  };

  const subject = `New SquibNET sourcing request — ${fields.category}`;
  const body = [
    "NEW SOURCING REQUEST",
    "",
    `Name: ${fields.name}`,
    `Company: ${fields.company}`,
    `Email: ${fields.email}`,
    `Phone: ${fields.phone}`,
    "",
    `Category: ${fields.category}`,
    `Ideal timeline: ${fields.timeline}`,
    `Estimated budget: ${fields.budget}`,
    "",
    "PROJECT DETAILS",
    fields.details,
  ].join("\n");

  formStatus.textContent =
    "Your request is ready. Your email app will open with the details filled in—send that message to complete your request.";
  formStatus.classList.add("show");

  window.location.href = `mailto:tyler@squibnet.ca?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
