window.addEventListener("DOMContentLoaded", () => {
  // REDUCE NAVBAR

  const navbar = document.querySelector("nav.navbar");

  function scrollFunction() {
    if (
      document.body.scrollTop > 50 ||
      document.documentElement.scrollTop > 50
    ) {
      navbar.classList.add("lite");
    } else {
      navbar.classList.remove("lite");
    }

    // tocEntries.forEach((entry) => {
    //   console.log(entry.textContent);
    // });
  }
  window.onscroll = function () {
    scrollFunction();
  };

  const tocEntries = document.querySelectorAll("ul.section-nav li");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const title = entry.target.textContent;
      // entry.
      if (entry.isIntersecting) {
        console.log("%s is visible %o", title, entry.isIntersecting);

        tocEntries.forEach((tocEntry) => {
          if (tocEntry.textContent === title) {
            tocEntry.classList.add("active");
          } else {
            console.log(tocEntry.textContent, title);
            tocEntry.classList.remove("active");
          }
        });

        // document
        //   .querySelector(`nav li a[href="#${id}"]`)
        //   .parentElement.classList.add("active");
        // } else {
        //   console.log("%s is invisible %o", title, entry.intersectionRatio);
        // document
        //   .querySelector(`nav li a[href="#${id}"]`)
        //   .parentElement.classList.remove("active");
      }
    });
  });

  // Track all sections that have an `id` applied
  document.querySelectorAll("article h2").forEach((section) => {
    observer.observe(section);
  });
});
