'use strict';

var sidebar   = document.getElementById('sidebar');
var menuOpen  = document.getElementById('menuOpen');
var menuClose = document.getElementById('menuClose');
var navLinks  = Array.from(document.querySelectorAll('.side-nav a'));
var sections  = navLinks.map(function(a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);

function setSidebarOpen(open) {
  if (!sidebar) return;
  sidebar.classList.toggle('open', open);
}

function updateActiveLink() {
  var offset = window.scrollY + 160;
  var activeId = sections.length ? sections[0].id : '';
  for (var i = 0; i < sections.length; i++) {
    if (sections[i].offsetTop <= offset) activeId = sections[i].id;
  }
  navLinks.forEach(function(a) {
    a.classList.toggle('active', a.getAttribute('href') === '#' + activeId);
  });
}

if (menuOpen)  menuOpen.addEventListener('click',  function() { setSidebarOpen(true); });
if (menuClose) menuClose.addEventListener('click', function() { setSidebarOpen(false); });
navLinks.forEach(function(a) { a.addEventListener('click', function() { setSidebarOpen(false); }); });

window.addEventListener('scroll', updateActiveLink, { passive: true });
window.addEventListener('load',   updateActiveLink);
