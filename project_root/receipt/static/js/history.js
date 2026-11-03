(() => {
  'use strict';

  const registerLayer = document.getElementById('receiptRegistration');
  const form = document.getElementById('receiptRegistrationForm');
  const toast = document.getElementById('receiptToast');
  const successLayer = document.getElementById('receiptSuccess');
  const createdNotice = document.getElementById('receiptCreatedNotice');
  const formError = document.getElementById('receiptFormError');

  let lastFocusedElement = null;
  let toastTimer = null;

  // Display an informational toast (not a success dialog).
  const showToast = (title, message = '') => {
    if (!toast) return;

    const strong = toast.querySelector('strong');
    const span = toast.querySelector('span');

    if (strong) strong.textContent = title;
    if (span) span.textContent = message;

    toast.classList.add('is-visible');

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 3000);
  };

  // Open the registration modal.
  const openLayer = (layer) => {
    if (!layer) return;

    lastFocusedElement = document.activeElement;

    layer.classList.add('is-open');
    layer.setAttribute('aria-hidden', 'false');

    document.body.style.overflow = 'hidden';

    const firstInput = layer.querySelector('input, button');

    if (firstInput) {
      window.setTimeout(() => firstInput.focus(), 30);
    }
  };

// Open the success dialog only after Django confirms success.
  if (createdNotice && successLayer) {
      openLayer(successLayer);
  }
  // Close the registration modal.
  const closeLayer = (layer) => {
    if (!layer) return;

    layer.classList.remove('is-open');
    layer.setAttribute('aria-hidden', 'true');

    if (
      !registerLayer ||
      !registerLayer.classList.contains('is-open')
    ) {
      document.body.style.overflow = '';
    }

    if (
      lastFocusedElement &&
      typeof lastFocusedElement.focus === 'function'
    ) {
      lastFocusedElement.focus();
    }
  };

  const successHomeButton = document.querySelector('[data-success-home]');

  if (successHomeButton && successLayer) {
      successHomeButton.addEventListener('click', () => {
          closeLayer(successLayer);
      });
  }

  // Open registration modal buttons.
  document
    .querySelectorAll('[data-open-receipt-registration]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        openLayer(registerLayer);
      });
    });

  // Close modal buttons.
  document
    .querySelectorAll('[data-close-receipt-modal]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        closeLayer(button.closest('.receipt-modal-layer'));
      });
    });

  // Close the modal when clicking outside its contents.
  if (registerLayer) {
    registerLayer.addEventListener('click', (event) => {
      if (event.target === registerLayer) {
        closeLayer(registerLayer);
      }
    });
  }

  // Close the modal with Escape.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const open = document.querySelector(
        '#receiptRegistration.is-open'
      );

      if (open) closeLayer(open);
    }
  });

  // Clear field validation errors.
  const clearFieldError = (field) => {
    const wrapper = field.closest('.receipt-field');

    if (wrapper) {
      wrapper.classList.remove('has-error');

      const error = wrapper.querySelector('.receipt-field-error');

      if (error) error.textContent = '';
    }

    field.setAttribute('aria-invalid', 'false');
  };

  // Display a field validation error.
  const setFieldError = (field, message) => {
    const wrapper = field.closest('.receipt-field');

    if (!wrapper) return;

    wrapper.classList.add('has-error');

    field.setAttribute('aria-invalid', 'true');

    const error = wrapper.querySelector('.receipt-field-error');

    if (error) error.textContent = message;
  };

  // Form validation and Django POST submission.
  if (form) {
    form.querySelectorAll('input').forEach((field) => {
      field.addEventListener('input', () => {
        clearFieldError(field);
      });

      field.addEventListener('change', () => {
        clearFieldError(field);
      });
    });

    form.addEventListener('submit', (event) => {
    const fields = Array.from(
        form.querySelectorAll('input[required]')
    );

    let firstInvalid = null;

    fields.forEach((field) => {
        const value = field.value.trim();
        let message = '';

        if (!value) {
            message = 'Заполните это поле.';
        }

        if (
            field.name === 'amount' &&
            value &&
            Number(value) < 1000
        ) {
            message = 'Минимальная стоимость чека — 1 000 ₽.';
        }

        if (field.name === 'purchase_day' && value) {
            const picked = new Date(value);

            if (Number.isNaN(picked.getTime())) {
                message = 'Укажите корректную дату покупки.';
            } else if (picked.getTime() > Date.now()) {
                message = 'Дата покупки не может быть в будущем.';
            }
        }

        if (message) {
            setFieldError(field, message);
            if (!firstInvalid) firstInvalid = field;
        } else {
            clearFieldError(field);
        }
    });

    if (firstInvalid) {
        event.preventDefault();
        firstInvalid.focus();
        return;
    }

    // Valid form: allow the normal Django POST request.
    // Do not open the success dialog here.

      // Valid form: allow the normal Django POST request.
      // Do not call preventDefault().
      // Do not reset the form.
      // Do not display a local success dialog.
      if (formError) {
        formError.classList.remove('is-visible');
      }
    });
  }

  // Notifications button.
  const notificationButton = document.querySelector(
    '[data-receipt-notifications]'
  );

  if (notificationButton) {
    notificationButton.addEventListener('click', () => {
      showToast('Уведомления', 'Новых уведомлений нет.');
    });
  }

  // Information links.
  document.querySelectorAll('[data-receipt-more-info]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      showToast(
        'Условия акции',
        'Минимальная сумма чека — 1 000 ₽.'
      );
    });
  });

  // Table sorting.
  document
    .querySelectorAll('.receipt-sort[data-sort-index]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const table = button.closest('table');

        if (!table) return;

        const tbody = table.querySelector('tbody');

        if (!tbody) return;

        const colIndex = Number(button.dataset.sortIndex);
        const rows = Array.from(tbody.querySelectorAll('tr'));

        if (rows.length < 2) return;

        const ascending = button.dataset.sortDirection !== 'asc';

        button.dataset.sortDirection = ascending ? 'asc' : 'desc';

        rows.sort((a, b) => {
          const cellA = (a.cells[colIndex]?.innerText || '').trim();
          const cellB = (b.cells[colIndex]?.innerText || '').trim();

          const numA = Number(
            cellA.replace(/[^\d,.-]/g, '').replace(',', '.')
          );

          const numB = Number(
            cellB.replace(/[^\d,.-]/g, '').replace(',', '.')
          );

          let comparison;

          if (
            cellA &&
            cellB &&
            Number.isFinite(numA) &&
            Number.isFinite(numB) &&
            /\d/.test(cellA) &&
            /\d/.test(cellB)
          ) {
            comparison = numA - numB;
          } else {
            comparison = cellA.localeCompare(cellB, 'ru', {
              numeric: true,
              sensitivity: 'base'
            });
          }

          return (ascending ? 1 : -1) * comparison;
        });

        rows.forEach((row) => tbody.appendChild(row));
      });
    });

  // Demo pagination controls.
  document.querySelectorAll('[data-receipt-page]').forEach((button) => {
    button.addEventListener('click', () => {
      document
        .querySelectorAll('[data-receipt-page]')
        .forEach((item) => item.classList.remove('is-active'));

      button.classList.add('is-active');

      showToast(
        `Страница ${button.dataset.receiptPage}`,
        'Подключите пагинацию через Django view.'
      );
    });
  });
})();

async function loadProtectedData() {
    const url = '/api/receipts/'; // Shared domain, trailing slash included
    const container = document.getElementById('receipts-container');
    
    container.innerHTML = 'Loading...';

    try {
      const response = await fetch(url, {
        method: 'GET',
        // ⚠️ CRITICAL: Forces fetch to send the logged-in user's session cookie to DRF
        credentials: 'same-origin' 
      });

      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          throw new Error("You must be logged in to view this data.");
        }
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const receipts = await response.json();
      
      // Clear loading text and render data
      container.innerHTML = '';
      
      if (receipts.length === 0) {
        container.innerHTML = '<p>No receipts found.</p>';
        return;
      }

      // Build a simple list of the returned DRF objects
      const ul = document.createElement('ul');
      receipts.forEach(receipt => {
        const li = document.createElement('li');
        li.textContent = `${receipt.id}, ${receipt.fn_value}, ${receipt.fd_value}, ${receipt.fp_value}, ${receipt.total_sum}, ${receipt.status}`;
        ul.appendChild(li);
      });
      container.appendChild(ul);

    } catch (error) {
      console.error('Fetch Error:', error);
      container.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
  }

  // Event listener to trigger the fetch
  document.getElementById('load-btn').addEventListener('click', loadProtectedData);