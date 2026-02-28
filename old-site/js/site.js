/* yortuc.com — shared site behavior */

(function () {
  'use strict';

  // Theme: persist choice, apply on load
  var STORAGE_KEY = 'yortuc-theme';
  var themeToggle = document.querySelector('.theme-toggle');

  function getPreferredTheme() {
    if (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) {
      return localStorage.getItem(STORAGE_KEY);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      themeToggle.textContent = theme === 'dark' ? '☀' : '☾';
    }
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, theme);
  }

  if (themeToggle) {
    setTheme(getPreferredTheme());
    themeToggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Project tag filter
  var projectList = document.querySelector('.project-list');
  var tagButtons = document.querySelectorAll('.tag[data-filter]');

  if (projectList && tagButtons.length) {
    tagButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tag = this.getAttribute('data-filter');
        var tiles = projectList.querySelectorAll('.tile[data-tags]');

        tagButtons.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');

        tiles.forEach(function (tile) {
          var tags = (tile.getAttribute('data-tags') || '').toLowerCase();
          var show = tag === 'all' || tags.indexOf(tag.toLowerCase()) !== -1;
          tile.setAttribute('data-hidden', show ? 'false' : 'true');
        });
      });
    });
  }

  // Copy email button
  var copyBtn = document.querySelector('.copy-btn');
  if (copyBtn) {
    var emailEl = document.getElementById('contact-email');
    var email = emailEl ? emailEl.textContent.trim() : '';
    copyBtn.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function () {
          copyBtn.textContent = 'Copied';
          setTimeout(function () { copyBtn.textContent = 'Copy'; }, 2000);
        });
      }
    });
  }
})();
