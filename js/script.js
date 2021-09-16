window.onscroll = function () {
  scrollFunction();
};

const nav = document.querySelector("nav");

function scrollFunction() {
  if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
    nav.className = "lite";
  } else {
    nav.className = "";
  }
}
