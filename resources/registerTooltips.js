var tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
var tooltip_list = [...tooltips].map((tool) => new bootstrap.Tooltip(tool));

var dropdowns = document.querySelectorAll('[data-bs-toggle="dropdown"]');
var dropdown_list = [...dropdowns].map((dropdown) => new bootstrap.Dropdown(dropdown));