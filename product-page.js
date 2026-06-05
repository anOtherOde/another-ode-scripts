function switchTab(tabName) {
  const tabs = document.querySelectorAll('.info-modal-tab');
  const panels = document.querySelectorAll('.info-panel');
  
  tabs.forEach(function(tab) {
    tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
  });
  panels.forEach(function(panel) {
    panel.classList.toggle('active', panel.getAttribute('data-panel') === tabName);
  });
}

function formatDate(text) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  let day, month, year;

  if (text.includes('-')) {
    const parts = text.split('-');
    if (parts.length === 3) {
      day = parseInt(parts[2]);
      month = months[parseInt(parts[1]) - 1];
      year = parts[0];
    }
  } else if (text.includes('/')) {
    const parts = text.split('/');
    if (parts.length === 3) {
      day = parseInt(parts[0]);
      month = months[parseInt(parts[1]) - 1];
      year = parts[2];
    }
  }

  if (day && month && year) return day + ' ' + month + ' ' + year;
  return null;
}

function getCartId() {
  return localStorage.getItem('_sf-cart-id');
}

function fetchCartMetafields() {
  const cartId = getCartId();
  if (!cartId) return;

  fetch('https://knmwuk-mi.myshopify.com/api/2024-01/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': '74907398b8e879f18fc5849bffef16f8'
    },
    body: JSON.stringify({
      query: `{
        cart(id: "${cartId}") {
          lines(first: 10) {
            edges {
              node {
                id
                merchandise {
                  ... on ProductVariant {
                    product {
                      metafield(namespace: "custom", key: "expected_ship_date") {
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }`
    })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (!data.data || !data.data.cart) return;
    
    const lines = data.data.cart.lines.edges;

    const populatedCartItems = Array.from(document.querySelectorAll('[sf-cart-item]')).filter(function(item) {
      const title = item.querySelector('[sf-show-title]');
      return title && title.textContent.trim() !== '' && title.textContent.trim() !== 'Product Name';
    });

    lines.forEach(function(line, index) {
      const metafield = line.node.merchandise.product.metafield;
      const cartItem = populatedCartItems[index];
      if (!cartItem) return;
      
      const wrapper = cartItem.querySelector('[sf-metafield-wrapper]');
      const dateEl = cartItem.querySelector('[sf-show-metafield="expected_ship_date"]');
      
      if (metafield && metafield.value && dateEl) {
  const formatted = formatDate(metafield.value);
  if (formatted) {
    dateEl.textContent = formatted;
    if (wrapper) wrapper.classList.add('metafield-visible');
  }
} else {
  if (wrapper) wrapper.classList.remove('metafield-visible');
}
    });
  })
  .catch(function(err) {
    console.log('Cart metafield fetch error:', err);
  });
}

function init() {

  // Show image group matching the active swatch on page load
  function showActiveVariantImages(attempt) {
    attempt = attempt || 1;
    const maxAttempts = 10;
    const retryDelay = 300;

    const activeSwatch = document.querySelector('[sf-option-value].sf-active');
    
    if (activeSwatch) {
      const activeColour = activeSwatch.getAttribute('data-color');
      document.querySelectorAll('.variant-images[data-color]').forEach(function(group) {
        group.style.display =
          group.getAttribute('data-color') === activeColour ? 'flex' : 'none';
      });
      console.log('Active variant shown on attempt', attempt);
    } else if (attempt < maxAttempts) {
      setTimeout(function() {
        showActiveVariantImages(attempt + 1);
      }, retryDelay);
    } else {
      console.log('Fallback to first group');
      const firstGroup = document.querySelector('.variant-images[data-color]');
      if (firstGroup) firstGroup.style.display = 'flex';
    }
  }

  showActiveVariantImages();

  // Format product page date
  setTimeout(function() {
    const dateEl = document.querySelector('[sf-show-metafield="expected_ship_date"]:not([sf-cart-item] *)');
    if (dateEl && dateEl.textContent.trim()) {
      const formatted = formatDate(dateEl.textContent.trim());
      if (formatted) dateEl.textContent = formatted;
    }
  }, 1500);

  // Gallery lightbox
  setTimeout(function() {

    document.querySelectorAll('.gallery-image').forEach(function(img) {
      img.style.cursor = 'pointer';
      img.setAttribute('data-glightbox', '');
      img.setAttribute('data-src', img.src);
    });

    document.querySelectorAll('.gallery-image').forEach(function(img) {
      img.addEventListener('click', function() {
        const activeGroup = document.querySelector('.variant-images[data-color]:not([style*="display: none"])');
        if (!activeGroup) return;

        const images = activeGroup.querySelectorAll('.gallery-image');
        const clickedIndex = Array.from(images).indexOf(this);

        const elements = Array.from(images).map(function(el) {
          return { href: el.src, type: 'image' };
        });

        const lightbox = GLightbox({
          elements: elements,
          startAt: clickedIndex,
          loop: true,
          touchNavigation: true,
          closeButton: true
        });

        lightbox.on('open', function() {
          const closeBtn = document.createElement('div');
          closeBtn.className = 'custom-close';
          closeBtn.textContent = 'Close';
          closeBtn.style.display = 'block';
          closeBtn.addEventListener('click', function() {
            lightbox.close();
          });

          const navBtn = document.createElement('div');
          navBtn.className = 'custom-nav';
          navBtn.innerHTML = '<span class="custom-prev">Prev</span> / <span class="custom-next">Next</span>';
          navBtn.style.display = 'block';

          navBtn.querySelector('.custom-prev').addEventListener('click', function() {
            lightbox.prevSlide();
          });

          navBtn.querySelector('.custom-next').addEventListener('click', function() {
            lightbox.nextSlide();
          });

          document.body.appendChild(closeBtn);
          document.body.appendChild(navBtn);
        });

        lightbox.on('close', function() {
          const closeBtn = document.querySelector('.custom-close');
          const navBtn = document.querySelector('.custom-nav');
          if (closeBtn) closeBtn.remove();
          if (navBtn) navBtn.remove();
        });

        lightbox.open();
      });
    });

  }, 1200);

  // Modal/cart scrollbar fix
  const openBtnCart = document.querySelector('.shopping-bag-wrapper');
  const closeBtnCart = document.querySelector('.cart-close-link');
  const infoModalClose = document.querySelector('.info-modal-close');
  const detailsBtn = document.querySelector('.product-page-details-link');
  const personalisationBtn = document.querySelector('.embossing-trigger');

  if (openBtnCart) {
    openBtnCart.addEventListener('click', function() {
      document.querySelector('.page-wrapper').style.overflowX = 'hidden';
      setTimeout(function() { document.querySelector('.page-wrapper').style.overflowX = ''; }, 1000);
    });
  }

  if (closeBtnCart) {
    closeBtnCart.addEventListener('click', function() {
      document.querySelector('.page-wrapper').style.overflowX = 'hidden';
      setTimeout(function() { document.querySelector('.page-wrapper').style.overflowX = ''; }, 1000);
    });
  }

  if (infoModalClose) {
    infoModalClose.addEventListener('click', function() {
      document.querySelector('.page-wrapper').style.overflowX = 'hidden';
      setTimeout(function() { document.querySelector('.page-wrapper').style.overflowX = ''; }, 1000);
    });
  }

  if (detailsBtn) {
    detailsBtn.addEventListener('click', function() {
      document.querySelector('.page-wrapper').style.overflowX = 'hidden';
      setTimeout(function() { document.querySelector('.page-wrapper').style.overflowX = ''; }, 1000);
      switchTab('description');
    });
  }

  if (personalisationBtn) {
    personalisationBtn.addEventListener('click', function() {
      document.querySelector('.page-wrapper').style.overflowX = 'hidden';
      setTimeout(function() { document.querySelector('.page-wrapper').style.overflowX = ''; }, 1000);
      switchTab('personalisation');
    });
  }

  // Tab switching
  document.querySelectorAll('.info-modal-tab').forEach(function(tab) {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      switchTab(this.getAttribute('data-tab'));
    });
  });

  // Embossing trigger visibility
  setTimeout(function() {
    const productContainer = document.querySelectorAll('[sf-product]')[0];
    const embossingTrigger = document.querySelectorAll('.embossing-trigger')[0];
    const personalisationTab = document.querySelector('[data-tab="personalisation"]');
    const personalisationPanel = document.querySelector('[data-panel="personalisation"]');

    if (productContainer) {
      const category = productContainer.getAttribute('data-product-category');
      console.log('Product category:', category);

      if (category === 'Bandanas & Headties') {
        if (embossingTrigger) {
          embossingTrigger.classList.add('visible');
          console.log('Embossing trigger shown');
        }
      } else {
        if (personalisationTab) personalisationTab.style.display = 'none';
        if (personalisationPanel) personalisationPanel.style.display = 'none';
      }
    }
  }, 1200);

  // Pre-order button text
  setTimeout(function() {
    const productContainer = document.querySelectorAll('[sf-product]')[0];
    if (productContainer) {
      const tag = productContainer.getAttribute('data-product-tag');
      if (tag === 'pre-order') {
        const addToCartBtn = document.querySelector('[sf-add-to-cart]');
        if (addToCartBtn) {
          const btnText = addToCartBtn.querySelector('div');
          if (btnText) btnText.textContent = 'Available to Pre-order';
        }
      }
    }
  }, 1200);

  // Sync embossing modal values to hidden inputs
  document.querySelectorAll('.embossing-input, .embossing-font-select, .embossing-colour-select').forEach(function(field) {
    field.addEventListener('change', function() {
      if (field.classList.contains('embossing-input')) {
        const hidden = document.querySelector('.hidden-embossing-characters');
        if (hidden) hidden.value = field.value;
      }
      if (field.classList.contains('embossing-font-select')) {
        const hidden = document.querySelector('.hidden-embossing-font');
        if (hidden) hidden.value = field.value;
      }
      if (field.classList.contains('embossing-colour-select')) {
        const hidden = document.querySelector('.hidden-embossing-colour');
        if (hidden) hidden.value = field.value;
      }
    });
  });

  // Clear embossing fields after Add to Cart
  const addToCartBtn = document.querySelector('[sf-add-to-cart]');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', function() {
      setTimeout(function() {
        const input = document.querySelector('.embossing-input');
        const font = document.querySelector('.embossing-font-select');
        const colour = document.querySelector('.embossing-colour-select');
        if (input) input.value = '';
        if (font) font.value = '';
        if (colour) colour.value = '';

        const hiddenChars = document.querySelector('.hidden-embossing-characters');
        const hiddenFont = document.querySelector('.hidden-embossing-font');
        const hiddenColour = document.querySelector('.hidden-embossing-colour');
        if (hiddenChars) hiddenChars.value = '';
        if (hiddenFont) hiddenFont.value = '';
        if (hiddenColour) hiddenColour.value = '';
      }, 2000);
    });
  }

  // Waitlist
  function initWaitlist(attempt) {
    attempt = attempt || 1;
    const maxAttempts = 10;
    const retryDelay = 300;

    const addToCartBtn = document.querySelector('[sf-add-to-cart]');
    const waitlistWrapper = document.querySelector('.waitlist-wrapper');
    const waitlistForm = document.querySelector('.waitlist-form');
    const waitlistTrigger = document.querySelector('.waitlist-trigger');
    const form = document.querySelector('#wf-form-Waitlist');
    const productTitle = document.querySelector('.product-description-title');

    if (addToCartBtn) {
      if (addToCartBtn.classList.contains('sf-out-of-stock')) {
        addToCartBtn.style.display = 'none';
        if (waitlistWrapper) waitlistWrapper.style.display = 'block';

        if (form && productTitle && !form.querySelector('input[name="Product"]')) {
          const hiddenField = document.createElement('input');
          hiddenField.type = 'hidden';
          hiddenField.name = 'Product';
          hiddenField.value = productTitle.textContent.trim();
          form.appendChild(hiddenField);
        }
      } else if (attempt < maxAttempts) {
        setTimeout(function() {
          initWaitlist(attempt + 1);
        }, retryDelay);
      }
    } else if (attempt < maxAttempts) {
      setTimeout(function() {
        initWaitlist(attempt + 1);
      }, retryDelay);
    }

    if (waitlistTrigger && !waitlistTrigger.dataset.listenerAdded) {
      waitlistTrigger.dataset.listenerAdded = 'true';
      waitlistTrigger.addEventListener('click', function(e) {
        e.preventDefault();
        if (waitlistForm) waitlistForm.style.display = 'block';
        waitlistTrigger.style.display = 'none';
      });
    }
  }

  initWaitlist();

  // Watch cart for changes and fetch metafields
  const cartContainer = document.querySelector('[sf-cart]');
  if (cartContainer) {
    let fetchTimeout;
    let fetchTimeout2;
    new MutationObserver(function() {
      clearTimeout(fetchTimeout);
      clearTimeout(fetchTimeout2);
      fetchTimeout = setTimeout(fetchCartMetafields, 2000);
      fetchTimeout2 = setTimeout(fetchCartMetafields, 4000);
    }).observe(cartContainer, { childList: true, subtree: true });
  }

}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
