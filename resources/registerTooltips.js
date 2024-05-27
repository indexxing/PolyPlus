var tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
var list = [...tooltips].map((tool) => new bootstrap.Tooltip(tool));
