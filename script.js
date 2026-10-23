(() => {
  const root = document.documentElement;
  const body = document.body;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const random = (min, max) => Math.random() * (max - min) + min;

  root.classList.add("js");

  /* ---------- Atmosphere ---------- */

  const createStars = (field, total, topMax) => {
    if (!field) return;

    const fragment = document.createDocumentFragment();

    for (let index = 0; index < total; index += 1) {
      const star = document.createElement("span");
      const bright = Math.random() > 0.9;
      const warm = Math.random() > 0.9;
      const size = bright ? random(1.8, 2.7) : random(0.55, 1.55);

      star.className = `star${bright ? " star--bright" : ""}${warm ? " star--warm" : ""}`;
      star.style.left = `${random(0, 100).toFixed(2)}%`;
      star.style.top = `${random(0, topMax).toFixed(2)}%`;
      star.style.setProperty("--size", `${size.toFixed(2)}px`);
      star.style.setProperty("--opacity", random(bright ? 0.65 : 0.16, bright ? 0.95 : 0.68).toFixed(2));
      star.style.setProperty("--duration", `${random(3.5, 9).toFixed(2)}s`);
      star.style.setProperty("--delay", `${random(-9, 0).toFixed(2)}s`);

      fragment.appendChild(star);
    }

    field.appendChild(fragment);
  };

  const compact = window.innerWidth < 680;
  createStars(document.querySelector("#stars"), compact ? 80 : 150, 70);
  createStars(document.querySelector("#ctaStars"), compact ? 24 : 40, 100);

  const fireflyField = document.querySelector("#fireflies");

  if (fireflyField && !prefersReducedMotion) {
    const fragment = document.createDocumentFragment();
    const totalFireflies = compact ? 8 : 12;

    for (let index = 0; index < totalFireflies; index += 1) {
      const firefly = document.createElement("span");
      const edgeBiased = Math.random() > 0.35;
      const left = edgeBiased
        ? Math.random() > 0.5
          ? random(2, 34)
          : random(66, 98)
        : random(16, 84);

      firefly.className = "firefly";
      firefly.style.setProperty("--left", `${left.toFixed(2)}%`);
      firefly.style.setProperty("--top", `${random(54, 91).toFixed(2)}%`);
      firefly.style.setProperty("--size", `${random(1.6, 3.4).toFixed(2)}px`);
      firefly.style.setProperty("--alpha", random(0.35, 0.85).toFixed(2));
      firefly.style.setProperty("--drift", `${random(10, 34).toFixed(1)}px`);
      firefly.style.setProperty("--duration", `${random(8, 16).toFixed(2)}s`);
      firefly.style.setProperty("--delay", `${random(-16, 0).toFixed(2)}s`);

      fragment.appendChild(firefly);
    }

    fireflyField.appendChild(fragment);
  }

  /* ---------- Sticky header + scroll spy ---------- */

  const topbar = document.querySelector("#topbar");
  const navLinks = Array.from(document.querySelectorAll(".nav__link"));
  const isBookingPage = Boolean(document.getElementById("tanggal"));

  const sectionRoutes = new Map(
    isBookingPage
      ? [
          ["atas", "/reservasi"],
          ["tanggal", "/reservasi/tanggal"],
          ["kontak", "/reservasi/kontak"]
        ]
      : [
          ["beranda", "/"],
          ["tentang", "/tentang"],
          ["ruang", "/ruang"],
          ["cara-kerja", "/cara-kerja"],
          ["jadwal", "/jadwal"],
          ["faq", "/faq"],
          ["reservasi", "/mulai"],
          ["kontak", "/kontak"]
        ]
  );

  const normalizePath = (path) => path.replace(/\/+$/, "") || "/";
  const routeToSection = new Map(
    Array.from(sectionRoutes.entries()).map(([id, path]) => [path, id])
  );

  if (!isBookingPage) routeToSection.set("/beranda", "beranda");

  const pageSections = Array.from(sectionRoutes.keys())
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navSections = navLinks
    .map((link) => {
      const url = new URL(link.href, window.location.href);

      if (url.origin !== window.location.origin) return null;

      const id = routeToSection.get(normalizePath(url.pathname));
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  let frameRequested = false;
  let lastProgress = -1;
  let lastScrolled = null;
  let activeNavId = "";

  const findSectionAtProbe = (sections, scrollY, viewportHeight, scrollHeight) => {
    const visible = sections.filter((section) => section.offsetParent !== null);

    if (!visible.length) return null;

    const probe = scrollY + viewportHeight * 0.34;
    let active = visible[0];

    visible.forEach((section) => {
      if (section.getBoundingClientRect().top + scrollY <= probe) {
        active = section;
      }
    });

    if (scrollY + viewportHeight >= scrollHeight - 6) {
      active = visible[visible.length - 1];
    }

    return active;
  };

  const replacePath = (path, sectionId) => {
    const target = `${path}${window.location.search}`;

    if (
      window.location.pathname + window.location.search + window.location.hash ===
      target
    ) {
      return;
    }

    try {
      window.history.replaceState({ section: sectionId }, "", target);
    } catch {
      /* History API can be unavailable in local previews. */
    }
  };

  const updateRoute = (section) => {
    const path = sectionRoutes.get(section.id);
    if (path) replacePath(path, section.id);
  };

  const scrollToSection = (sectionId, smooth = true) => {
    const target = sectionId === "atas" ? null : document.getElementById(sectionId);
    const behavior = smooth && !prefersReducedMotion ? "smooth" : "auto";

    if (target && target.offsetParent === null) return;

    if (!target) {
      if (behavior === "auto") {
        const previous = root.style.scrollBehavior;
        root.style.scrollBehavior = "auto";
        window.scrollTo(0, 0);
        root.style.scrollBehavior = previous;
      } else {
        window.scrollTo({ top: 0, behavior });
      }
      return;
    }

    if (behavior === "auto") {
      const previous = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      target.scrollIntoView({ behavior: "auto", block: "start" });
      root.style.scrollBehavior = previous;
      return;
    }

    target.scrollIntoView({ behavior, block: "start" });
  };

  const initialHash = window.location.hash.slice(1);
  const hashSection =
    initialHash && sectionRoutes.has(initialHash) ? initialHash : null;
  const initialSection =
    hashSection ||
    routeToSection.get(normalizePath(window.location.pathname)) ||
    null;

  if (initialHash) {
    const cleanPath = hashSection
      ? sectionRoutes.get(hashSection)
      : normalizePath(window.location.pathname);
    replacePath(cleanPath, hashSection || initialSection || "");
  }

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  if (initialSection) {
    scrollToSection(initialSection, false);
  }

  let initialScrollActive = Boolean(initialSection);
  const cancelInitialScroll = () => {
    initialScrollActive = false;
  };

  const updateScrollUI = () => {
    frameRequested = false;

    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const scrollHeight = document.documentElement.scrollHeight;
    const scrolled = scrollY > 26;
    const scrollable = scrollHeight - viewportHeight;
    const progress = scrollable > 0 ? Math.min(scrollY / scrollable, 1) : 0;
    const navActive = findSectionAtProbe(
      navSections,
      scrollY,
      viewportHeight,
      scrollHeight
    );
    const pageActive = findSectionAtProbe(
      pageSections,
      scrollY,
      viewportHeight,
      scrollHeight
    );

    if (scrolled !== lastScrolled) {
      lastScrolled = scrolled;
      topbar?.classList.toggle("is-scrolled", scrolled);
    }

    if (progress !== lastProgress) {
      lastProgress = progress;
      root.style.setProperty("--scroll-progress", progress.toFixed(4));
    }

    if (pageActive) updateRoute(pageActive);

    if (!navActive || navActive.id === activeNavId) return;

    activeNavId = navActive.id;

    navLinks.forEach((link) => {
      const isActive = link.dataset.nav === navActive.id;
      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const requestScrollUpdate = () => {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updateScrollUI);
  };

  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");

    if (!href || href.startsWith("#")) return;

    const url = new URL(link.href, window.location.href);

    if (url.origin !== window.location.origin) return;
    if (url.search && url.search !== window.location.search) return;

    const sectionId = routeToSection.get(normalizePath(url.pathname));
    if (!sectionId) return;

    link.addEventListener("click", (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();
      cancelInitialScroll();

      const nextPath = normalizePath(url.pathname);
      const search = url.search || window.location.search;

      if (
        window.location.pathname !== nextPath ||
        window.location.search !== search
      ) {
        try {
          window.history.pushState(
            { section: sectionId },
            "",
            `${nextPath}${search}`
          );
        } catch {
          /* If history is unavailable, scroll without changing the URL. */
        }
      }

      scrollToSection(sectionId, true);
    });
  });

  window.addEventListener("popstate", () => {
    cancelInitialScroll();

    const sectionId = routeToSection.get(normalizePath(window.location.pathname));

    if (sectionId) scrollToSection(sectionId, false);

    requestScrollUpdate();
  });

  ["pointerdown", "keydown", "wheel", "touchstart"].forEach((eventName) => {
    window.addEventListener(eventName, cancelInitialScroll, {
      passive: true,
      once: true
    });
  });

  const correctInitialScroll = () => {
    if (!initialScrollActive || !initialSection) return;

    const currentSection = routeToSection.get(
      normalizePath(window.location.pathname)
    );

    if (currentSection !== initialSection) {
      cancelInitialScroll();
      return;
    }

    scrollToSection(initialSection, false);
    requestScrollUpdate();
  };

  window.addEventListener(
    "load",
    () => {
      correctInitialScroll();
      requestScrollUpdate();
    },
    { passive: true }
  );
  window.addEventListener("resize", requestScrollUpdate, { passive: true });
  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("pageshow", requestScrollUpdate);
  document.fonts?.ready.then(() => {
    correctInitialScroll();
    requestScrollUpdate();
  });
  updateScrollUI();

  /* ---------- Mobile menu ---------- */

  const menuToggle = document.querySelector("#menuToggle");
  const mobileMenu = document.querySelector("#mobileMenu");
  let menuIsOpen = false;
  let menuFocusTimer = 0;

  const menuFocusables = () =>
    Array.from(mobileMenu?.querySelectorAll("a, button") ?? []).filter(
      (element) => element.offsetParent !== null
    );

  const openMenu = () => {
    if (!mobileMenu || !menuToggle) return;

    menuIsOpen = true;
    body.classList.add("menu-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Tutup menu");
    mobileMenu.removeAttribute("inert");
    mobileMenu.setAttribute("aria-hidden", "false");

    window.clearTimeout(menuFocusTimer);
    menuFocusTimer = window.setTimeout(
      () => menuFocusables()[0]?.focus({ preventScroll: true }),
      80
    );
  };

  const closeMenu = (restoreFocus = true) => {
    if (!mobileMenu || !menuToggle) return;

    window.clearTimeout(menuFocusTimer);
    menuIsOpen = false;
    body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Buka menu");
    mobileMenu.setAttribute("aria-hidden", "true");
    mobileMenu.setAttribute("inert", "");

    if (restoreFocus) {
      menuToggle.focus({ preventScroll: true });
    }
  };

  menuToggle?.addEventListener("click", () => {
    if (menuIsOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  document.querySelectorAll(".topbar a").forEach((link) => {
    link.addEventListener("click", () => {
      if (menuIsOpen) closeMenu(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (!menuIsOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== "Tab") return;

    const focusables = menuFocusables();
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const desktopQuery = window.matchMedia("(min-width: 981px)");

  desktopQuery.addEventListener("change", (event) => {
    if (event.matches && menuIsOpen) closeMenu(false);
  });

  /* ---------- Board entrance stagger ---------- */

  document.querySelectorAll(".board__grid").forEach((grid) => {
    const headerCells = 11;

    Array.from(grid.children).forEach((cell, index) => {
      if (index < headerCells) {
        cell.style.setProperty("--bi", String(index));
        return;
      }

      const slot = index - headerCells;
      cell.style.setProperty(
        "--bi",
        String((slot % 10) + Math.floor(slot / 10) * 2)
      );
    });
  });

  /* ---------- Reveal on scroll ---------- */

  document.querySelectorAll("[data-stagger]").forEach((group) => {
    Array.from(group.querySelectorAll(".reveal")).forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${Math.min(index * 65, 330)}ms`);
    });
  });

  const reveals = Array.from(document.querySelectorAll(".reveal"));

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -54px 0px" }
    );

    reveals.forEach((item) => revealObserver.observe(item));
  }

  /* ---------- Stat count-up ---------- */

  const formatNumber = (value) =>
    new Intl.NumberFormat("id-ID").format(Math.round(value));

  const animateCount = (element) => {
    const target = Number(element.dataset.count);
    if (!Number.isFinite(target)) return;

    if (prefersReducedMotion || target === 0) {
      element.textContent = formatNumber(target);
      return;
    }

    const duration = 1300;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = formatNumber(target * eased);

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      } else {
        element.textContent = formatNumber(target);
      }
    };

    window.requestAnimationFrame(tick);
  };

  const statValues = Array.from(document.querySelectorAll("[data-count]"));

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    statValues.forEach((element) => {
      element.textContent = formatNumber(Number(element.dataset.count));
    });
  } else {
    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.7 }
    );

    statValues.forEach((element) => statObserver.observe(element));
  }

  /* ---------- Room filters ---------- */

  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const roomCards = Array.from(document.querySelectorAll(".room-card"));
  const roomCount = document.querySelector("#roomCount");

  const applyRoomFilter = (filter) => {
    let visible = 0;

    filterButtons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    roomCards.forEach((card) => {
      const show = filter === "semua" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !show);

      if (show) visible += 1;
    });

    if (roomCount) roomCount.textContent = String(visible);

    requestScrollUpdate();

    if (prefersReducedMotion) return;

    roomCards.forEach((card) => {
      if (card.classList.contains("is-hidden") || !card.animate) return;
      card.animate(
        [
          { opacity: 0, transform: "translateY(10px)" },
          { opacity: 1, transform: "translateY(0)" }
        ],
        { duration: 320, easing: "cubic-bezier(0.2, 0.75, 0.2, 1)" }
      );
    });
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyRoomFilter(button.dataset.filter || "semua");
    });
  });

  /* ---------- Availability refresh ---------- */

  const boardDate = document.querySelector("#boardDate");
  const boardRefresh = document.querySelector("#boardRefresh");
  const boardUpdated = document.querySelector("#boardUpdated");
  let refreshTimer = 0;

  if (boardDate) {
    const formattedDate = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "Asia/Jakarta"
    }).format(new Date());

    boardDate.textContent = `${formattedDate} · WIB`;
  }

  boardRefresh?.addEventListener("click", () => {
    window.clearTimeout(refreshTimer);
    boardRefresh.setAttribute("aria-busy", "true");
    boardRefresh.classList.remove("is-spinning");
    void boardRefresh.offsetWidth;
    boardRefresh.classList.add("is-spinning");

    refreshTimer = window.setTimeout(() => {
      if (boardUpdated) boardUpdated.textContent = "Baru saja diperbarui";
      boardRefresh.classList.remove("is-spinning");
      boardRefresh.removeAttribute("aria-busy");
    }, 620);
  });

  /* ---------- FAQ accordion ---------- */

  const faqItems = Array.from(document.querySelectorAll(".faq__item"));

  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
      requestScrollUpdate();
    });
  });

  /* ---------- Placeholder links ---------- */

  document.querySelectorAll('a[href="#"]').forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
  });
})();
