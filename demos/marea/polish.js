// chapter-bootstrap owns page arrival; content stays readable beneath it.
document.querySelectorAll('[data-open="nav-dialog"]').forEach(button => {
  button.setAttribute('aria-controls', 'nav-dialog');
  button.setAttribute('aria-expanded', 'false');
});
