 const images = document.querySelectorAll(".gallery-image");
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modal-img");
  const captionText = document.getElementById("caption");
  const closeBtn = document.getElementById("close");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  let currentIndex = -1;
  let modalIsOpen = false;
  let touchStartX = 0;
  let touchEndX = 0;
  let isDragging = false;
  let currentTranslate = 0;
  let modalImgWrapper = document.querySelector(".modal-content-wrapper");

  const showModal = (index) => {
    const img = images[index];
    modal.style.display = "flex";
    modalImg.src = img.dataset.full;
    captionText.textContent = img.alt;
    captionText.style.color = img.dataset.color || "#fff";
    currentIndex = index;

    if (!modalIsOpen) {
      history.pushState({ modal: true }, "");
      document.body.classList.add("modal-open");
    }
    modalIsOpen = true;

    // Preload next and previous full images
    const preload = [ (index + 1) % images.length, (index - 1 + images.length) % images.length ];
    preload.forEach(i => {
      const preloadImg = new Image();
      preloadImg.src = images[i].dataset.full;
    });

    // Reset image position and transition (important for swipe)
    modalImg.style.transform = "translateX(0)";
  };

  const closeModal = () => {
    if (!modalIsOpen) return;
    modal.style.display = "none";
    modalIsOpen = false;
    document.body.classList.remove("modal-open");
    if (history.state && history.state.modal) {
      history.back();
    }
  };

  images.forEach((img, i) => {
    img.addEventListener("click", () => showModal(i));
  });

  const navigate = (dir) => {
    if (images.length === 0) return;

    const nextIndex = (currentIndex + dir + images.length) % images.length;
    const nextImg = new Image();
    nextImg.src = images[nextIndex].dataset.full;

    // Hide current image to avoid flicker/snapback
    modalImg.style.visibility = "hidden";

    nextImg.onload = () => {
      modalImg.src = nextImg.src;
      captionText.textContent = images[nextIndex].alt;
      captionText.style.color = images[nextIndex].dataset.color || "#fff";
      currentIndex = nextIndex;
      modalImg.style.transform = "translateX(0)";
      modalImg.style.transition = "none";
      modalImg.style.visibility = "visible";
    };
  };

  closeBtn.onclick = closeModal;
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };
  nextBtn.onclick = () => navigate(1);
  prevBtn.onclick = () => navigate(-1);

  document.addEventListener("keydown", (e) => {
    if (!modalIsOpen) return;
    if (e.key === "Escape") closeModal();
    else if (e.key === "ArrowRight") navigate(1);
    else if (e.key === "ArrowLeft") navigate(-1);
  });

  window.addEventListener("popstate", (e) => {
    if (modalIsOpen && (!e.state || !e.state.modal)) {
      closeModal();
    }
  });

  modal.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    isDragging = true;
  });

  modal.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const touchX = e.changedTouches[0].screenX;
    const dragDelta = touchX - touchStartX;
    currentTranslate = dragDelta;
    modalImg.style.transform = `translateX(${currentTranslate}px)`;
  });

  modal.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    isDragging = false;

    const deltaX = touchEndX - touchStartX;
    const swipeThreshold = 50;

    // Reset image position
    modalImg.style.transition = "transform 0.2s ease";
    modalImg.style.transform = "translateX(0)";
    setTimeout(() => {
      modalImg.style.transition = "";
    }, 200);

    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX < 0) {
        navigate(1);
      } else {
        navigate(-1);
      }
    }
  });

  function handleSwipeGesture() {
    const deltaX = touchEndX - touchStartX;
    const swipeThreshold = 50;

    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX < 0) {
        navigate(1);
      } else {
        navigate(-1);
      }
    }
  }