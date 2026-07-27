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

const mobilePlaceholderQuery = window.matchMedia("(max-width: 600px)");
const responsivePlaceholderFields = document.querySelectorAll("[data-mobile-placeholder]");

responsivePlaceholderFields.forEach((field) => {
  field.dataset.desktopPlaceholder = field.placeholder;
});

const updateResponsivePlaceholders = () => {
  responsivePlaceholderFields.forEach((field) => {
    field.placeholder = mobilePlaceholderQuery.matches
      ? field.dataset.mobilePlaceholder
      : field.dataset.desktopPlaceholder;
  });
};

updateResponsivePlaceholders();

if (mobilePlaceholderQuery.addEventListener) {
  mobilePlaceholderQuery.addEventListener("change", updateResponsivePlaceholders);
} else {
  mobilePlaceholderQuery.addListener(updateResponsivePlaceholders);
}

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

quoteForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!quoteForm.checkValidity()) {
    quoteForm.reportValidity();
    return;
  }

  const submitButton = quoteForm.querySelector(".form-submit");
  const originalButtonContent = submitButton.innerHTML;

  submitButton.disabled = true;
  submitButton.textContent = "Sending...";
  formStatus.classList.remove("show", "error");

  try {
    const response = await fetch(quoteForm.action, {
      method: "POST",
      body: new FormData(quoteForm),
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Formspree could not accept the request.");
    }

    quoteForm.reset();
    formStatus.textContent = "Form submitted.";
    formStatus.classList.add("show");
  } catch {
    formStatus.textContent =
      "Your request could not be sent. Please try again or contact us directly.";
    formStatus.classList.add("show", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonContent;
  }
});
