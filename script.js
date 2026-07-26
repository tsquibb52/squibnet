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

document.querySelectorAll(".copy-button").forEach((button) => {
  const originalLabel = button.getAttribute("aria-label");
  const originalIcon = button.innerHTML;

  button.addEventListener("click", async () => {
    const value = button.dataset.copy;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = value;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      button.setAttribute("aria-label", "Copied");
      button.innerHTML =
        '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-9" /></svg>';
      button.classList.add("copied");
      window.setTimeout(() => {
        button.setAttribute("aria-label", originalLabel);
        button.innerHTML = originalIcon;
        button.classList.remove("copied");
      }, 1600);
    } catch {
      button.setAttribute("aria-label", "Copy failed. Try again.");
      window.setTimeout(() => button.setAttribute("aria-label", originalLabel), 1600);
    }
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
