(() => {
  const trip = document.getElementById('tripView');
  if (!trip) return;
  function enhance() {
    trip.querySelectorAll('.section-title').forEach(title => {
      if (title.getAttribute('role') === 'button') {
        // Keep the disclosure button semantics and the title/panel CSS adjacency.
        const panel = title.nextElementSibling;
        if (panel && !panel.querySelector(':scope > .a11y-panel-heading')) {
          const heading = document.createElement('h2');
          heading.className = 'sr-only a11y-panel-heading';
          heading.textContent = title.textContent.replace('⌄', '').trim();
          panel.prepend(heading);
        }
      } else {
        title.setAttribute('role', 'heading');
        title.setAttribute('aria-level', '2');
      }
    });
  }
  new MutationObserver(enhance).observe(trip, { childList: true, subtree: true });
  enhance();
})();
