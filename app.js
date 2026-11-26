/**
 * Eros Photo Booth Services — Application Controller
 *
 * Modules:
 *  1. Navigation, Sticky Header & Section Jumping
 *  2. Scroll Reveal & Active Nav Scroll-Spy
 *  3. Package Selection & Magnet Add-On Sync
 *  4. Filterable Keepsake Gallery
 *  5. Interactive Print Customizer, Slot Photo Upload & Canvas PNG Exporter
 *  6. Gmail Compose Redirect & Inquiry Summary Utilities
 */
(function () {
  "use strict";

  const CONFIG = {
    studioGmail: "erosphotobooth@gmail.com",
    maxUploadSlots: 4,
    defaultStartTime: "18:00"
  };

  const LAYOUTS = {
    "4r_1": { label: "4R One Photo • Single Full Frame", type: "4r", shots: 1, cols: "cols-1", slotH: 190 },
    "4r_2": { label: "4R Two Photo • Side-by-Side Duo", type: "4r", shots: 2, cols: "cols-2", slotH: 150 },
    "4r_3": { label: "4R Three Photo • Feature + 2 Stacked", type: "4r", shots: 3, cols: "layout-4r-3", slotH: 86 },
    "4r_4": { label: "4R Four Photo • Classic 2×2 Grid", type: "4r", shots: 4, cols: "cols-2", slotH: 86 },
    "polaroid": { label: "Polaroid Style • 2-Shot Frame (2 Copies)", type: "polaroid", shots: 2, cols: "cols-1", slotH: 88 },
    "strip2_3": { label: "2 Photostrip • 3 Photo (Twin Strips)", type: "strip", shots: 3, cols: "cols-1", slotH: 64 },
    "strip2_4": { label: "2 Photostrip • 4 Photo (Twin Strips)", type: "strip", shots: 4, cols: "cols-1", slotH: 50 },
    "strip2_2": { label: "2 Photostrip • 2 Photo (Twin Strips)", type: "strip", shots: 2, cols: "cols-1", slotH: 92 },
    "strip2_3_ded": { label: "2 Photostrip • 3 Photo + Dedication", type: "strip", shots: 3, cols: "cols-1", slotH: 58, forceDedication: true },
    "strip2_2_ded": { label: "2 Photostrip • 2 Photo + Dedication", type: "strip", shots: 2, cols: "cols-1", slotH: 82, forceDedication: true }
  };

  const GALLERY_ITEMS = [
    { cat: "Weddings", title: "Vineyard Arch & Pampas", caption: "4R Rustic Border • Claire & Julian", bg: "#6f4e37" },
    { cat: "Weddings", title: "Candlelit First Dance", caption: "2×6 Twin Strips • Classic Serif", bg: "#4a3525" },
    { cat: "Garden Parties", title: "Conservatory Linen Set", caption: "Polaroid Keepsake • Camille’s 30th", bg: "#5e6b52" },
    { cat: "Garden Parties", title: "Afternoon Tea & Brass", caption: "4R Three-Shot Collage • Sage Edition", bg: "#7d6b4f" },
    { cat: "Birthdays", title: "Vinyl & Edison Loft", caption: "2×6 Strip + Dedication • Lucas’s 50th", bg: "#9e472a" },
    { cat: "Birthdays", title: "Golden Hour Toast", caption: "Polaroid Double Copy • Warm Parchment", bg: "#8d623b" }
  ];

  const customizerState = {
    layout: "4r_1",
    font: "serif",
    brandPos: "bottom",
    showTitle: true,
    titlePos: "bottom",
    titleText: "Claire & Julian",
    subText: "October 17, 2026 • Hacienda Solano",
    showDedication: true,
    dedicationPos: "bottom",
    dedicationText: "Thank you for celebrating with us!",
    uploadedImages: []
  };

  /* ------------------------------------------------------------------------
   * DOM References
   * ------------------------------------------------------------------------ */
  const siteHeader = document.getElementById("site-header");
  const menuToggle = document.getElementById("menu-toggle");
  const menuIcon = document.getElementById("menu-toggle-icon");
  const primaryNav = document.getElementById("primary-nav");
  const navButtons = Array.from(primaryNav.querySelectorAll("button[data-target]"));
  const sections = Array.from(document.querySelectorAll("main section[id]"));

  const selectedPkgMsg = document.getElementById("selected-package-msg");
  const galleryGrid = document.getElementById("gallery-grid");
  const galleryFilters = document.getElementById("gallery-filters");

  const previewMount = document.getElementById("preview-mount");
  const specLabel = document.getElementById("strip-spec-label");
  const toggleTitleBtn = document.getElementById("toggle-title-btn");
  const toggleDedicationBtn = document.getElementById("toggle-dedication-btn");
  const inputTitle = document.getElementById("input-title");
  const inputSub = document.getElementById("input-sub");
  const inputDedication = document.getElementById("input-dedication");
  const slotPhotoInput = document.getElementById("slot-photo-input");
  const clearPhotosBtn = document.getElementById("clear-photos-btn");
  const uploadCountLabel = document.getElementById("upload-count-label");
  const exportPngBtn = document.getElementById("export-png-btn");
  const exportStatusMsg = document.getElementById("export-status-msg");
  const applyToBookingBtn = document.getElementById("apply-to-booking-btn");

  const bookingForm = document.getElementById("booking-form");
  const bkName = document.getElementById("bk-name");
  const bkContact = document.getElementById("bk-contact");
  const bkDate = document.getElementById("bk-date");
  const bkTime = document.getElementById("bk-time");
  const bkPackage = document.getElementById("bk-package");
  const bkMagnet = document.getElementById("bk-magnet");
  const bkVenue = document.getElementById("bk-venue");
  const bkNotes = document.getElementById("bk-notes");
  const bookingReceipt = document.getElementById("booking-receipt");
  const bookingReceiptBody = document.getElementById("booking-receipt-body");
  const copyInquiryBtn = document.getElementById("copy-inquiry-btn");
  const directGmailLink = document.getElementById("direct-gmail-link");
  const receiptGmailFallback = document.getElementById("receipt-gmail-fallback");
  const receiptMailtoFallback = document.getElementById("receipt-mailto-fallback");

  /* ------------------------------------------------------------------------
   * Shared Helpers
   * ------------------------------------------------------------------------ */
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function triggerPopAnimation(element) {
    element.classList.remove("pop");
    void element.offsetWidth;
    element.classList.add("pop");
  }

  /* ------------------------------------------------------------------------
   * 1. Navigation, Sticky Header & Section Jumping
   * ------------------------------------------------------------------------ */
  window.addEventListener(
    "scroll",
    () => {
      siteHeader.classList.toggle("scrolled", window.scrollY > 12);
    },
    { passive: true }
  );

  menuToggle.addEventListener("click", () => {
    const isOpen = primaryNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuIcon.textContent = isOpen ? "✕" : "☰";
  });

  function setActiveNav(sectionId) {
    navButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.target === sectionId);
    });
  }

  function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth" });
    setActiveNav(sectionId);
    primaryNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuIcon.textContent = "☰";
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => scrollToSection(btn.dataset.target));
  });

  document.querySelectorAll("[data-jump]").forEach((btn) => {
    btn.addEventListener("click", () => scrollToSection(btn.dataset.jump));
  });

  /* ------------------------------------------------------------------------
   * 2. Scroll Reveal & Active Nav Scroll-Spy
   * ------------------------------------------------------------------------ */
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    sections.forEach((section) => revealObserver.observe(section));

    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.id);
          }
        });
      },
      { rootMargin: "-35% 0px -50% 0px" }
    );
    sections.forEach((section) => spyObserver.observe(section));
  } else {
    sections.forEach((section) => section.classList.add("is-visible"));
  }

  /* ------------------------------------------------------------------------
   * 3. Package Selection & Magnet Add-On Sync
   * ------------------------------------------------------------------------ */
  document.querySelectorAll(".pkg-magnet-cb").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const pkgId = checkbox.dataset.pkg;
      const labelEl = document.getElementById(`addon-label-${pkgId}`);
      if (!labelEl) return;
      labelEl.textContent = checkbox.checked
        ? "With Magnet (+1000 Added)"
        : "Base • Add +1000 w/ Magnet";
      labelEl.classList.toggle("magnet-active", checkbox.checked);
    });
  });

  document.querySelectorAll("[data-select-pkg]").forEach((button) => {
    button.addEventListener("click", () => {
      const pkgId = button.dataset.selectPkg;
      const title = button.dataset.selectTitle;
      const checkbox = document.querySelector(`.pkg-magnet-cb[data-pkg="${pkgId}"]`);
      const magnetNote = checkbox && checkbox.checked ? "With Magnet (+1000)" : "Base Package (No Magnet)";

      selectedPkgMsg.textContent = `Selected: ${title} — ${magnetNote}. Synced to Gmail Booking Form below.`;
      triggerPopAnimation(selectedPkgMsg);

      bkPackage.value = title;
      bkMagnet.value = magnetNote;

      const defaultLayoutByPkg = { pkg1: "4r_4", pkg2: "polaroid", pkg3: "strip2_3" };
      if (defaultLayoutByPkg[pkgId]) {
        customizerState.layout = defaultLayoutByPkg[pkgId];
        syncChipGroup("layout-chips", customizerState.layout);
        renderPreview(true);
      }

      syncGmailLinks();
      scrollToSection("booking-section");
    });
  });

  /* ------------------------------------------------------------------------
   * 4. Filterable Keepsake Gallery
   * ------------------------------------------------------------------------ */
  function renderGallery(category) {
    const items =
      category === "All"
        ? GALLERY_ITEMS
        : GALLERY_ITEMS.filter((item) => item.cat === category);

    galleryGrid.innerHTML = items
      .map(
        (item, index) => `
        <article class="photo-tile" style="animation-delay: ${index * 0.06}s;">
          <div class="photo-art" style="background: ${item.bg};">${escapeHtml(item.title)}</div>
          <div class="photo-caption">
            <strong>${escapeHtml(item.cat)}</strong><br />
            ${escapeHtml(item.caption)}
          </div>
        </article>
      `
      )
      .join("");
  }

  galleryFilters.addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (!chip) return;
    galleryFilters.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    renderGallery(chip.dataset.cat);
  });

  /* ------------------------------------------------------------------------
   * 5. Interactive Print Customizer, Slot Photo Upload & Canvas PNG Exporter
   * ------------------------------------------------------------------------ */
  function syncChipGroup(containerId, value) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll(".chip").forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.value === value);
    });
  }

  function updateUploadUI() {
    const count = customizerState.uploadedImages.length;
    uploadCountLabel.textContent = `${count} of ${CONFIG.maxUploadSlots} slots filled`;
    clearPhotosBtn.style.display = count > 0 ? "inline-block" : "none";
  }

  slotPhotoInput.addEventListener("change", (event) => {
    const files = Array.from(event.target.files || []).slice(0, CONFIG.maxUploadSlots);
    if (!files.length) return;

    let loaded = 0;
    const decodedImages = [];

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const img = new Image();
        img.onload = () => {
          decodedImages[index] = img;
          loaded += 1;
          if (loaded === files.length) {
            customizerState.uploadedImages = decodedImages.filter(Boolean);
            updateUploadUI();
            renderPreview(true);
          }
        };
        img.src = loadEvent.target.result;
      };
      reader.readAsDataURL(file);
    });
  });

  clearPhotosBtn.addEventListener("click", () => {
    customizerState.uploadedImages = [];
    slotPhotoInput.value = "";
    updateUploadUI();
    renderPreview(true);
  });

  function buildHeaderFooterBlocks(position) {
    const blocks = [];
    const fontClass = `font-${customizerState.font}`;

    if (customizerState.brandPos === position) {
      blocks.push(`
        <div class="brand-mark-block">
          <div class="crest">EROS PHOTO BOOTH SERVICES</div>
        </div>
      `);
    }

    if (customizerState.showTitle && customizerState.titlePos === position) {
      blocks.push(`
        <div class="title-block">
          <div class="custom-title ${fontClass}">${escapeHtml(customizerState.titleText || "Event Title")}</div>
          ${customizerState.subText ? `<div class="custom-sub">${escapeHtml(customizerState.subText)}</div>` : ""}
        </div>
      `);
    }

    if (customizerState.showDedication && customizerState.dedicationPos === position) {
      blocks.push(`
        <div class="dedication-box">
          <div class="dedication-label">Guest Dedication</div>
          <div class="dedication-text ${fontClass}">${escapeHtml(customizerState.dedicationText || "Write a short note...")}</div>
        </div>
      `);
    }

    return blocks.join("");
  }

  function buildSlotsHtml(cfg) {
    const slots = [];
    for (let i = 1; i <= cfg.shots; i++) {
      const uploadedImg = customizerState.uploadedImages[i - 1];
      const content = uploadedImg
        ? `<img class="slot-photo" src="${uploadedImg.src}" alt="Pose ${i}" />`
        : `<span>POSE ${i}</span>`;

      slots.push(`
        <div class="photo-slot" style="height: ${cfg.slotH}px;">
          <span class="slot-num">0${i}</span>
          ${content}
        </div>
      `);
    }
    return `<div class="frames-container ${cfg.cols}" style="--slot-h: ${cfg.slotH}px;">${slots.join("")}</div>`;
  }

  function renderPreview(animate = false) {
    const cfg = LAYOUTS[customizerState.layout];
    const topHtml = buildHeaderFooterBlocks("top");
    const bottomHtml = buildHeaderFooterBlocks("bottom");
    const slotsHtml = buildSlotsHtml(cfg);
    const animClass = animate ? "preview-animate" : "";

    if (cfg.type === "strip") {
      const singleStripHtml = `
        <div class="single-strip">
          ${topHtml}
          ${slotsHtml}
          ${bottomHtml}
        </div>
      `;
      previewMount.innerHTML = `<div class="twin-strips-wrap ${animClass}">${singleStripHtml}${singleStripHtml}</div>`;
    } else {
      const sheetClass = cfg.type === "polaroid" ? "sheet-polaroid" : "sheet-4r";
      previewMount.innerHTML = `
        <div class="print-sheet print-sheet--framed ${sheetClass} ${animClass}">
          ${topHtml}
          ${slotsHtml}
          ${bottomHtml}
        </div>
      `;
    }

    specLabel.textContent = cfg.label;
  }

  function drawImageCover(ctx, img, x, y, w, h) {
    const imgRatio = img.width / img.height;
    const boxRatio = w / h;
    let sx = 0;
    let sy = 0;
    let sw = img.width;
    let sh = img.height;

    if (imgRatio > boxRatio) {
      sw = img.height * boxRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / boxRatio;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  function getCanvasFont(fontKey, sizePx, isBold = false) {
    const weight = isBold ? "700 " : "";
    switch (fontKey) {
      case "script":
        return `italic ${weight}${Math.round(sizePx * 1.18)}px "Brush Script MT", Georgia, cursive`;
      case "editorial":
        return `${weight}${Math.round(sizePx * 0.85)}px system-ui, -apple-system, sans-serif`;
      case "typewriter":
        return `${weight}${Math.round(sizePx * 0.9)}px "Courier New", monospace`;
      case "heirloom-italic":
        return `italic 600 ${sizePx}px Georgia, serif`;
      case "condensed":
        return `${weight}${Math.round(sizePx * 0.98)}px "Arial Narrow", system-ui, sans-serif`;
      default:
        return `${weight}${sizePx}px Georgia, serif`;
    }
  }

  function renderSheetToCanvas(ctx, offsetX, offsetY, sheetW, sheetH, cfg) {
    const pad = 28;
    const gap = 18;

    ctx.fillStyle = "#f7f1e5";
    ctx.fillRect(offsetX, offsetY, sheetW, sheetH);
    ctx.strokeStyle = "#b68d40";
    ctx.lineWidth = 4;
    ctx.strokeRect(offsetX + 2, offsetY + 2, sheetW - 4, sheetH - 4);

    function measureMetaHeight(pos) {
      let total = 0;
      if (customizerState.brandPos === pos) total += 28;
      if (customizerState.showTitle && customizerState.titlePos === pos) {
        total += customizerState.subText ? 66 : 44;
      }
      if (customizerState.showDedication && customizerState.dedicationPos === pos) total += 64;
      return total;
    }

    function drawMetaBlocks(pos, startY) {
      let curY = startY;
      const centerX = offsetX + sheetW / 2;
      const innerW = sheetW - pad * 2;
      const shouldUpper =
        customizerState.font === "editorial" || customizerState.font === "condensed";

      if (customizerState.brandPos === pos) {
        ctx.fillStyle = "#9e472a";
        ctx.font = "700 13px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("EROS PHOTO BOOTH SERVICES", centerX, curY + 16);
        curY += 28;
      }

      if (customizerState.showTitle && customizerState.titlePos === pos) {
        const rawTitle = customizerState.titleText || "Event Title";
        ctx.fillStyle = "#2e1f16";
        ctx.font = getCanvasFont(customizerState.font, 26, true);
        ctx.textAlign = "center";
        ctx.fillText(shouldUpper ? rawTitle.toUpperCase() : rawTitle, centerX, curY + 26, innerW);
        curY += 36;

        if (customizerState.subText) {
          ctx.fillStyle = "#5c4033";
          ctx.font = "600 13px system-ui, -apple-system, sans-serif";
          ctx.fillText(customizerState.subText, centerX, curY + 14, innerW);
          curY += 26;
        }
      }

      if (customizerState.showDedication && customizerState.dedicationPos === pos) {
        ctx.save();
        ctx.strokeStyle = "#5c4033";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(offsetX + pad, curY + 4, innerW, 52);
        ctx.restore();

        ctx.fillStyle = "#5c4033";
        ctx.font = "700 11px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("GUEST DEDICATION", centerX, curY + 21);

        const rawDed = customizerState.dedicationText || "Thank you for celebrating with us!";
        ctx.fillStyle = "#2e1f16";
        ctx.font = getCanvasFont(customizerState.font, 16, false);
        ctx.fillText(shouldUpper ? rawDed.toUpperCase() : rawDed, centerX, curY + 43, innerW - 16);
        curY += 64;
      }

      return curY;
    }

    const topH = measureMetaHeight("top");
    const bottomH = measureMetaHeight("bottom");
    const afterTopY = drawMetaBlocks("top", offsetY + pad);

    const slotsTop = afterTopY + (topH > 0 ? 8 : 0);
    const slotsBottom = offsetY + sheetH - pad - bottomH - (bottomH > 0 ? 8 : 0);
    const availW = sheetW - pad * 2;
    const availH = Math.max(120, slotsBottom - slotsTop);

    const rects = [];
    if (cfg.cols === "cols-2") {
      const rows = Math.ceil(cfg.shots / 2);
      const cellW = (availW - gap) / 2;
      const cellH = (availH - gap * (rows - 1)) / rows;
      for (let i = 0; i < cfg.shots; i++) {
        rects.push({
          x: offsetX + pad + (i % 2) * (cellW + gap),
          y: slotsTop + Math.floor(i / 2) * (cellH + gap),
          w: cellW,
          h: cellH
        });
      }
    } else if (cfg.cols === "layout-4r-3") {
      const leftW = availW * 0.52;
      const rightW = availW - leftW - gap;
      const rightH = (availH - gap) / 2;
      rects.push({ x: offsetX + pad, y: slotsTop, w: leftW, h: availH });
      rects.push({ x: offsetX + pad + leftW + gap, y: slotsTop, w: rightW, h: rightH });
      rects.push({ x: offsetX + pad + leftW + gap, y: slotsTop + rightH + gap, w: rightW, h: rightH });
    } else {
      const cellH = (availH - gap * (cfg.shots - 1)) / cfg.shots;
      for (let i = 0; i < cfg.shots; i++) {
        rects.push({
          x: offsetX + pad,
          y: slotsTop + i * (cellH + gap),
          w: availW,
          h: cellH
        });
      }
    }

    rects.forEach((rect, idx) => {
      const uploadedImg = customizerState.uploadedImages[idx];
      if (uploadedImg) {
        drawImageCover(ctx, uploadedImg, rect.x, rect.y, rect.w, rect.h);
      } else {
        ctx.fillStyle = "#8d623b";
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = "#fffdf9";
        ctx.font = "700 18px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`POSE ${idx + 1}`, rect.x + rect.w / 2, rect.y + rect.h / 2 + 6);
      }
      ctx.strokeStyle = "rgba(46, 31, 22, 0.28)";
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    });

    drawMetaBlocks("bottom", offsetY + sheetH - pad - bottomH);
  }

  exportPngBtn.addEventListener("click", () => {
    const cfg = LAYOUTS[customizerState.layout];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (cfg.type === "strip") {
      const stripW = 360;
      const stripH = 1080;
      const gap = 36;
      canvas.width = stripW * 2 + gap;
      canvas.height = stripH;
      ctx.fillStyle = "#fffdf9";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      renderSheetToCanvas(ctx, 0, 0, stripW, stripH, cfg);
      renderSheetToCanvas(ctx, stripW + gap, 0, stripW, stripH, cfg);
    } else if (cfg.type === "polaroid") {
      canvas.width = 640;
      canvas.height = 820;
      renderSheetToCanvas(ctx, 0, 0, canvas.width, canvas.height, cfg);
    } else {
      canvas.width = 800;
      canvas.height = 600;
      renderSheetToCanvas(ctx, 0, 0, canvas.width, canvas.height, cfg);
    }

    const slug = (customizerState.titleText || "eros-print")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const link = document.createElement("a");
    link.download = `${slug || "eros-print"}-${customizerState.layout}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    exportStatusMsg.textContent = `Exported ${link.download}!`;
    triggerPopAnimation(exportStatusMsg);
  });

  applyToBookingBtn.addEventListener("click", () => {
    const cfg = LAYOUTS[customizerState.layout];
    const packageByFormat = {
      "4r": "Package 1 — 4R Photo with Frame",
      "polaroid": "Package 2 — Polaroid Style with Frame",
      "strip": "Package 3 — Photo Strip with Frame"
    };
    if (packageByFormat[cfg.type]) {
      bkPackage.value = packageByFormat[cfg.type];
    }

    bkNotes.value = [
      `Custom Print Spec: ${cfg.label}`,
      `Font Style: ${customizerState.font}`,
      `Branding Placement: ${customizerState.brandPos}`,
      customizerState.showTitle
        ? `Event Title (${customizerState.titlePos}): "${customizerState.titleText}" | "${customizerState.subText}"`
        : "Event Title: Removed",
      customizerState.showDedication
        ? `Dedication (${customizerState.dedicationPos}): "${customizerState.dedicationText}"`
        : "Dedication: Removed"
    ].join("\n");

    syncGmailLinks();
    scrollToSection("booking-section");
  });

  function bindChipGroup(containerId, stateKey, onSelect) {
    const container = document.getElementById(containerId);
    container.addEventListener("click", (event) => {
      const chip = event.target.closest(".chip");
      if (!chip) return;
      customizerState[stateKey] = chip.dataset.value;
      syncChipGroup(containerId, customizerState[stateKey]);
      if (onSelect) onSelect(customizerState[stateKey]);
      renderPreview(true);
    });
  }

  function updateToggleUI() {
    toggleTitleBtn.textContent = customizerState.showTitle ? "Shown" : "Removed";
    toggleTitleBtn.classList.toggle("active", customizerState.showTitle);
    inputTitle.disabled = !customizerState.showTitle;
    inputSub.disabled = !customizerState.showTitle;

    toggleDedicationBtn.textContent = customizerState.showDedication ? "Shown" : "Removed";
    toggleDedicationBtn.classList.toggle("active", customizerState.showDedication);
    inputDedication.disabled = !customizerState.showDedication;
  }

  bindChipGroup("layout-chips", "layout", (val) => {
    if (LAYOUTS[val] && LAYOUTS[val].forceDedication && !customizerState.showDedication) {
      customizerState.showDedication = true;
      updateToggleUI();
    }
  });
  bindChipGroup("font-chips", "font");
  bindChipGroup("brand-pos-chips", "brandPos");
  bindChipGroup("title-pos-chips", "titlePos");
  bindChipGroup("dedication-pos-chips", "dedicationPos");

  toggleTitleBtn.addEventListener("click", () => {
    customizerState.showTitle = !customizerState.showTitle;
    updateToggleUI();
    renderPreview(true);
  });

  toggleDedicationBtn.addEventListener("click", () => {
    customizerState.showDedication = !customizerState.showDedication;
    updateToggleUI();
    renderPreview(true);
  });

  inputTitle.addEventListener("input", (event) => {
    customizerState.titleText = event.target.value;
    renderPreview(false);
  });

  inputSub.addEventListener("input", (event) => {
    customizerState.subText = event.target.value;
    renderPreview(false);
  });

  inputDedication.addEventListener("input", (event) => {
    customizerState.dedicationText = event.target.value;
    renderPreview(false);
  });

  /* ------------------------------------------------------------------------
   * 6. Gmail Compose Redirect & Inquiry Summary Utilities
   * ------------------------------------------------------------------------ */
  function buildBookingPayload() {
    const name = bkName.value.trim() || "(Client Name)";
    const contact = bkContact.value.trim() || "(Contact Info)";
    const date = bkDate.value || "(Date TBD)";
    const time = bkTime.value || CONFIG.defaultStartTime;
    const pkg = bkPackage.value;
    const magnet = bkMagnet.value;
    const venue = bkVenue.value.trim() || "(Venue TBD)";
    const notes = bkNotes.value.trim() || "Standard rustic frame";

    const subject = `Photo Booth Booking Inquiry — ${name} (${date})`;
    const body = [
      "Hello Eros Photo Booth Services,",
      "",
      "I would like to inquire about booking a photo booth for our event:",
      "",
      `• Client Name: ${name}`,
      `• Email / Mobile: ${contact}`,
      `• Event Date & Start Time: ${date} at ${time} (Unlimited 2 Hours)`,
      `• Event Venue: ${venue}`,
      `• Package: ${pkg}`,
      `• Magnet Add-On: ${magnet}`,
      "",
      "Custom Print Layout & Notes:",
      notes,
      "",
      "Looking forward to confirming availability!"
    ].join("\n");

    const gmailUrl =
      `https://mail.google.com/mail/?view=cm&fs=1` +
      `&to=${encodeURIComponent(CONFIG.studioGmail)}` +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    const mailtoUrl =
      `mailto:${encodeURIComponent(CONFIG.studioGmail)}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    return { subject, body, gmailUrl, mailtoUrl };
  }

  function syncGmailLinks() {
    const { gmailUrl, mailtoUrl } = buildBookingPayload();
    directGmailLink.href = gmailUrl;
    receiptGmailFallback.href = gmailUrl;
    receiptMailtoFallback.href = mailtoUrl;
  }

  bookingForm.addEventListener("input", syncGmailLinks);
  bookingForm.addEventListener("change", syncGmailLinks);

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const { body, gmailUrl, mailtoUrl } = buildBookingPayload();

    receiptGmailFallback.href = gmailUrl;
    receiptMailtoFallback.href = mailtoUrl;
    bookingReceiptBody.textContent = `To: ${CONFIG.studioGmail}\n\n${body}`;
    bookingReceipt.classList.remove("show");
    void bookingReceipt.offsetWidth;
    bookingReceipt.classList.add("show");

    const popup = window.open(gmailUrl, "_blank", "noopener,noreferrer");
    if (!popup) {
      window.location.href = gmailUrl;
    }
  });

  copyInquiryBtn.addEventListener("click", async () => {
    const { body } = buildBookingPayload();
    try {
      await navigator.clipboard.writeText(body);
      copyInquiryBtn.textContent = "Copied to Clipboard!";
      setTimeout(() => {
        copyInquiryBtn.textContent = "Copy Summary";
      }, 2200);
    } catch {
      bookingReceiptBody.textContent = body;
      bookingReceipt.classList.add("show");
    }
  });

  /* ------------------------------------------------------------------------
   * Initial Boot
   * ------------------------------------------------------------------------ */
  renderGallery("All");
  updateToggleUI();
  renderPreview(true);
  syncGmailLinks();
})();