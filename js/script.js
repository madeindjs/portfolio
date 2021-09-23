window.addEventListener("DOMContentLoaded", () => {
  // REDUCE NAVBAR
  {
    const navbar = document.querySelector("nav.navbar");

    window.onscroll = function () {
      if (
        document.body.scrollTop > 50 ||
        document.documentElement.scrollTop > 50
      ) {
        navbar.classList.add("lite");
      } else {
        navbar.classList.remove("lite");
      }
    };
  }

  // TOC
  {
    const tocEntries = document.querySelectorAll("ul.section-nav li");

    const observer = new IntersectionObserver((entries) => {
      let entriesVisible = 0;
      entries.forEach((entry) => {
        const title = entry.target.textContent;

        if (entry.isIntersecting) {
          tocEntries.forEach((tocEntry) => {
            if (tocEntry.textContent === title) {
              entriesVisible += 1;
              tocEntry.classList.add("active");
            } else {
              tocEntry.classList.remove("active");
            }
          });
        }
      });
    });

    // Track all sections that have an `id` applied
    document.querySelectorAll("article h2").forEach((section) => {
      observer.observe(section);
    });
  }

  // hooks
  {
    document.querySelectorAll("h1, h2, h3").forEach((title) => {
      title.addEventListener("click", () => {
        window.location = `${window.location.origin}${window.location.pathname}#${title.id}`;
      });
    });
  }
});
