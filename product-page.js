document.addEventListener('DOMContentLoaded', function() {

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
  const openBtnModal = document.querySelector('.product-page-details-link');
  const closeBtnModal = document.querySelector('.slider-details-close');
  const openBtnCart = document.querySelector('.shopping-bag-wrapper');
  const closeBtnCart = document.querySelector('.cart-close-link');
  const openBtnEmbossing = document.querySelector('.embossing-trigger');
  const closeBtnEmbossing = document.querySelector('.embossing-modal-close');

  if (openBtnModal) {
    openBtnModal.addEventListener('click', function() {
      document.querySelector('.page-wrapper').style.overflowX = 'hidden';
      setTimeout(function() { document.querySelector('.page-wrapper').style.overflowX = ''; }, 1000);
    });
  }

  if (closeBtnModal) {
    closeBtnModal.addEventListener('click', function() {
      document.querySelector('.page-wrapper').style.overflowX = 'hidden';
      setTimeout(function() { document.querySelector('.page-wrapper').style.overflowX = ''; }, 1000);
    });
  }

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

  if (openBtnEmbossing) {
    openBtnEmbossing.addEventListener('click', function() {
      document.querySelector('.page-wrapper').style.overflowX = 'hidden';
      setTimeout(function() { document.querySelector('.page-wrapper').style.overflowX = ''; }, 1000);
    });
  }

  if (closeBtnEmbossing) {
    closeBtnEmbossing.addEventListener('click', function() {
      document.querySelector('.page-wrapper').style.overflowX = 'hidden';
      setTimeout(function() { document.querySelector('.page-wrapper').style.overflowX = ''; }, 1000);
    });
  }

  // Embossing trigger visibility
  setTimeout(function() {
    const productContainer = document.querySelectorAll('[sf-product]')[0];
    const embossingTrigger = document.querySelectorAll('.embossing-trigger')[0];

    if (productContainer && embossingTrigger) {
      const category = productContainer.getAttribute('data-product-category');
      console.log('Product category:', category);

      if (category === 'Bandanas & Headties') {
        embossingTrigger.classList.add('visible');
        console.log('Embossing trigger shown');
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

});
