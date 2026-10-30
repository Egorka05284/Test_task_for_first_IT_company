(() => {
  'use strict';

  const root = document.querySelector('.auth-layout');
  if (!root) return;

  const tabs = [...root.querySelectorAll('[data-auth-tab]')];
  const panels = [...root.querySelectorAll('[data-auth-panel]')];
  const tabList = root.querySelector('.auth-tabs');
  const title = root.querySelector('#form-title');
  const subtitle = root.querySelector('#form-subtitle');

  const copy = {
    login: {
      title: 'Welcome back',
      subtitle: 'Sign in to pick up where you left off.'
    },
    register: {
      title: 'Create your account',
      subtitle: 'A fresh start is just a few details away.'
    }
  };

  function activate(name, focus = false) {
    const activeName = name === 'register' ? 'register' : 'login';
    root.dataset.active = activeName;
    if (tabList) tabList.dataset.active = activeName;

    tabs.forEach((tab) => {
      const active = tab.dataset.authTab === activeName;
      if (tab.matches('[role="tab"]')) {
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      }
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.authPanel !== activeName;
    });

    if (title) title.textContent = copy[activeName].title;
    if (subtitle) subtitle.textContent = copy[activeName].subtitle;

    if (focus) {
      const firstInput = root.querySelector(`[data-auth-panel="${activeName}"] input:not([type="hidden"])`);
      firstInput?.focus();
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activate(tab.dataset.authTab, false));
  });

  root.querySelectorAll('[data-password-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.passwordToggle);
      if (!input) return;
      const reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password';
      button.textContent = reveal ? 'Hide' : 'Show';
      button.setAttribute('aria-label', `${reveal ? 'Hide' : 'Show'} password`);
    });
  });

  activate(root.dataset.active || 'login');
})();
