window.onscroll = function () {
  scrollFunction();
};

const navbar = document.querySelector("nav.navbar");

function scrollFunction() {
  if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
    navbar.className = "navbar lite";
  } else {
    navbar.className = "navbar";
  }
}
