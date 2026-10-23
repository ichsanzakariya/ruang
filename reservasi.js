(() => {
  const ROOMS = {
    aria: {
      name: "Aria",
      place: "Gedung A · Lt. 3",
      type: "Diskusi",
      status: "free",
      statusLabel: "Tersedia",
      capacity: 6,
      img: "/assets/img/study.jpg",
      alt: "Ruang diskusi Aria dengan jendela lebar dan meja panjang",
      desc: "Meja bundar, layar 55 inci, dan papan tulis untuk diskusi kelompok.",
      facilities: ["Wi-Fi", "Layar 55 inci", "Papan tulis", "Stop kontak", "AC"],
      busy: [8, 9, 12, 13, 16, 17]
    },
    nusa: {
      name: "Nusa",
      place: "Gedung C · Lt. 2",
      type: "Kolaborasi",
      status: "free",
      statusLabel: "Tersedia",
      capacity: 12,
      img: "/assets/img/collab.jpg",
      alt: "Mahasiswa berdiskusi bersama di meja kolaborasi Nusa",
      desc: "Meja modular dan area presentasi untuk kerja tim lintas disiplin.",
      facilities: ["Wi-Fi", "Layar 65 inci", "Papan tulis", "Meja modular", "Stop kontak"],
      busy: [9, 10, 13, 14]
    },
    sunyi: {
      name: "Sunyi",
      place: "Perpustakaan Pusat · Lt. 4",
      type: "Fokus",
      status: "limited",
      statusLabel: "Terbatas",
      capacity: 1,
      img: "/assets/img/workspace.jpg",
      alt: "Meja fokus Sunyi dengan komputer dan pemandangan kota",
      desc: "Kubikel tenang dengan meja ergonomis dan lampu baca personal.",
      facilities: ["Wi-Fi", "Monitor 24 inci", "Lampu baca", "Stop kontak", "Kubikel kedap suara"],
      busy: [8, 9, 10, 11, 16, 17]
    },
    cakra: {
      name: "Cakra",
      place: "Gedung B · Lt. 1",
      type: "Bimbingan",
      status: "free",
      statusLabel: "Tersedia",
      capacity: 4,
      img: "/assets/img/meeting.jpg",
      alt: "Ruang bimbingan Cakra dengan partisi kaca dan pencahayaan hangat",
      desc: "Ruang privat untuk bimbingan skripsi dan konsultasi akademik.",
      facilities: ["Wi-Fi", "Layar 43 inci", "Papan tulis", "Meja privat", "Stop kontak"],
      busy: [10, 11, 12, 13, 16, 17]
    },
    loka: {
      name: "Loka",
      place: "Gedung D · Lt. 5",
      type: "Kreatif",
      status: "free",
      statusLabel: "Tersedia",
      capacity: 8,
      img: "/assets/img/lounge.jpg",
      alt: "Studio kreatif Loka dengan sofa, meja kerja, dan cahaya alami",
      desc: "Area fleksibel untuk riset visual, rekaman, dan kerja kreatif.",
      facilities: ["Wi-Fi", "Monitor", "Audio", "Papan ide", "Stop kontak"],
      busy: [8, 9, 12, 13, 14, 15]
    },
    sabha: {
      name: "Sabha",
      place: "Gedung Utama · Lt. 1",
      type: "Acara",
      status: "free",
      statusLabel: "Tersedia",
      capacity: 120,
      img: "/assets/img/auditorium.jpg",
      alt: "Aula serbaguna Sabha dengan deretan kursi dan panggung",
      desc: "Aula serbaguna dengan tata suara dan proyektor untuk acara kampus.",
      facilities: ["Wi-Fi", "Proyektor", "Tata suara", "Panggung", "Kursi 120"],
      busy: [8, 13, 14, 15, 16, 17]
    }
  };

  const OPEN_HOUR = 8;
  const CLOSE_HOUR = 18;
  const JAKARTA_TIME_ZONE = "Asia/Jakarta";
  const DAY_MS = 24 * 60 * 60 * 1000;

  const params = new URLSearchParams(window.location.search);
  let slug = (params.get("ruang") || "aria").trim().toLowerCase();

  if (!Object.prototype.hasOwnProperty.call(ROOMS, slug)) {
    slug = "aria";
    params.set("ruang", slug);

    try {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?${params.toString()}`
      );
    } catch (error) {
      /* History API can be unavailable on file:// previews. */
    }
  }

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const els = {
    name: $("#roomName"),
    place: $("#roomPlace"),
    type: $("#roomType"),
    desc: $("#roomDesc"),
    cap: $("#roomCap"),
    image: $("#roomImage"),
    status: $("#roomStatus"),
    facilities: $("#roomFacilities"),
    sumRoom: $("#sumRoom"),
    sumPlace: $("#sumPlace"),
    sumDate: $("#sumDate"),
    sumTime: $("#sumTime"),
    sumDuration: $("#sumDuration"),
    sumPeople: $("#sumPeople"),
    summaryNote: $("#summaryNote"),
    slotDate: $("#slotDate"),
    slotGrid: $("#slotGrid"),
    slotEmpty: $("#slotEmpty"),
    slotHint: $("#slotHint"),
    dateGrid: $("#dateGrid"),
    form: $("#bookingForm"),
    preview: $("#roomPreview"),
    prep: $(".prep"),
    alert: $("#formAlert"),
    peserta: $("#peserta"),
    capacityHint: $("#capacityHint"),
    nama: $("#nama"),
    nim: $("#nim"),
    email: $("#email"),
    agenda: $("#agenda"),
    setuju: $("#setuju"),
    success: $("#success"),
    successTitle: $("#successTitle"),
    successRoom: $("#successRoom"),
    successPlace: $("#successPlace"),
    successDate: $("#successDate"),
    successTime: $("#successTime"),
    successPeople: $("#successPeople"),
    successName: $("#successName"),
    successAgenda: $("#successAgenda"),
    successCode: $("#successCode"),
    again: $("#againBtn"),
    submit: $(".summary__submit")
  };

  const readParts = (formatter, date = new Date()) =>
    Object.fromEntries(
      formatter
        .formatToParts(date)
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value])
    );

  const jakartaDateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  const jakartaClockFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: JAKARTA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });

  const dateKey = (date) => {
    const parts = readParts(jakartaDateFormatter, date);
    return `${parts.year}-${parts.month}-${parts.day}`;
  };

  /* 05.00 UTC is 12.00 WIB, safely inside the Jakarta calendar day. */
  const buildDayWindow = () => {
    const parts = readParts(jakartaDateFormatter);
    const start = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      5,
      0,
      0
    );

    return {
      start,
      days: Array.from({ length: 7 }, (_, index) => new Date(start + index * DAY_MS))
    };
  };

  const initialDayWindow = buildDayWindow();
  let dayWindowStart = initialDayWindow.start;
  let days = initialDayWindow.days;

  const getJakartaMinutes = () => {
    const clock = readParts(jakartaClockFormatter);
    return Number(clock.hour) * 60 + Number(clock.minute);
  };

  /* After the last possible start time, today has no usable slots left. */
  const defaultDayIndex = () =>
    getJakartaMinutes() >= (CLOSE_HOUR - 1) * 60 ? 1 : 0;

  const state = {
    day: defaultDayIndex(),
    start: null,
    duration: 2
  };

  let isBooked = false;
  let successFocusTimer = 0;

  const bookedSlots = new Set();

  const isPastSlot = (hour, nowMinutes = getJakartaMinutes()) =>
    state.day === 0 && hour * 60 <= nowMinutes;

  const isPastDay = (dayIndex) => dateKey(days[dayIndex]) < dateKey(new Date());

  const fmtFull = new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const fmtWeekday = new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TIME_ZONE,
    weekday: "short"
  });
  const fmtMonth = new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TIME_ZONE,
    month: "short"
  });

  const clean = (value) => value.replace(/\./g, "");
  const fmtHour = (hour) => `${String(hour).padStart(2, "0")}.00`;

  const slotKey = (roomSlug, dayIndex, hour) =>
    `${roomSlug}|${dateKey(days[dayIndex])}|${hour}`;

  const busyFor = (roomSlug, dayIndex) => {
    const base = ROOMS[roomSlug].busy;
    const shift = (dayIndex * 3 + roomSlug.length) % 10;
    const busy =
      dayIndex === 0
        ? new Set(base)
        : new Set(
            base.map((hour) => OPEN_HOUR + ((hour - OPEN_HOUR + shift) % 10))
          );

    for (let hour = OPEN_HOUR; hour < CLOSE_HOUR; hour += 1) {
      if (bookedSlots.has(slotKey(roomSlug, dayIndex, hour))) busy.add(hour);
    }

    return busy;
  };

  const blockReason = (start, busy, duration) => {
    if (start + duration > CLOSE_HOUR) return "close";
    if (busy.has(start)) return "busy";

    for (let hour = start + 1; hour < start + duration; hour += 1) {
      if (busy.has(hour)) return "conflict";
    }

    return null;
  };

  const updatePressed = (buttons, activeValue) => {
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.day === activeValue || button.dataset.start === activeValue));
    });
  };

  /* ---------- Room identity ---------- */

  const applyRoom = () => {
    const room = ROOMS[slug];

    els.name.textContent = room.name;
    els.place.textContent = room.place;
    els.type.textContent = room.type;
    els.desc.textContent = room.desc;
    els.cap.textContent = `${room.capacity} orang`;
    els.image.src = room.img;
    els.image.alt = room.alt;
    els.status.className = `status status--${room.status}`;

    const statusText = els.status.querySelector(".status__text");
    if (statusText) statusText.textContent = room.statusLabel;

    els.facilities.replaceChildren(
      ...room.facilities.map((facility) => {
        const item = document.createElement("li");
        item.textContent = facility;
        return item;
      })
    );

    els.sumRoom.textContent = room.name;
    els.sumPlace.textContent = room.place;

    els.capacityHint.textContent = `Maks. ${room.capacity} orang`;
    els.peserta.max = String(room.capacity);
    if (Number(els.peserta.value) > room.capacity) {
      els.peserta.value = String(room.capacity);
    }

    $$(".room-chip").forEach((chip) => {
      const active = chip.dataset.slug === slug;
      chip.classList.toggle("is-active", active);

      if (active) {
        chip.setAttribute("aria-current", "true");
      } else {
        chip.removeAttribute("aria-current");
      }
    });

    document.title = `${room.name} · Reservasi ruang · Ruang`;
  };

  /* ---------- Dates ---------- */

  const renderDates = () => {
    const fragment = document.createDocumentFragment();

    days.forEach((date, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "date-chip";
      button.dataset.day = String(index);
      button.style.setProperty("--i", String(index));
      button.setAttribute("aria-pressed", String(index === state.day));
      button.title = fmtFull.format(date);

      const weekday = document.createElement("span");
      weekday.className = "date-chip__wd";
      weekday.textContent = clean(fmtWeekday.format(date));

      const day = document.createElement("span");
      day.className = "date-chip__d";
      day.textContent = String(date.getUTCDate());

      const month = document.createElement("span");
      month.className = "date-chip__m";
      month.textContent = clean(fmtMonth.format(date));

      button.append(weekday, " ", day, " ", month);

      button.addEventListener("click", () => {
        if (state.day === index) return;

        state.day = index;
        state.start = null;

        els.slotDate.textContent = fmtFull.format(date);
        updatePressed($$(".date-chip"), String(index));
        renderSlots();
        updateSummary();
        setHint(`Tanggal diganti ke ${fmtFull.format(date)}. Pilih jam mulai.`, false);
      });

      fragment.append(button);
    });

    els.dateGrid.replaceChildren(fragment);
    els.slotDate.textContent = fmtFull.format(days[state.day]);
  };

  /* ---------- Slots ---------- */

  const updateSummary = () => {
    const room = ROOMS[slug];

    setSummary(els.sumDate, fmtFull.format(days[state.day]));
    setSummary(els.sumDuration, `${state.duration} jam`);
    setSummary(els.sumRoom, room.name);
    setSummary(els.sumPlace, room.place);

    if (state.start === null) {
      setSummary(els.sumTime, "Belum dipilih");
      els.summaryNote.textContent = "Pilih jam mulai untuk melanjutkan.";
      els.summaryNote.classList.remove("is-warn");
    } else {
      setSummary(els.sumTime, `${fmtHour(state.start)}–${fmtHour(state.start + state.duration)}`);
      els.summaryNote.textContent = "Periksa ringkasan, lalu konfirmasi.";
      els.summaryNote.classList.remove("is-warn");
    }

    const people = Number(els.peserta.value) || 0;
    setSummary(els.sumPeople, people > 0 ? `${people} orang` : "Belum diisi");
    els.submit.classList.toggle("is-ready", state.start !== null);
  };

  const setHint = (message, picked) => {
    els.slotHint.textContent = message;
    els.slotHint.classList.toggle("is-picked", Boolean(picked));
  };

  const bumpTimers = new WeakMap();

  const bump = (element) => {
    if (!element || prefersReducedMotion) return;

    element.classList.remove("is-bump");
    void element.offsetWidth;
    element.classList.add("is-bump");

    window.clearTimeout(bumpTimers.get(element));
    bumpTimers.set(
      element,
      window.setTimeout(() => {
        element.classList.remove("is-bump");
        bumpTimers.delete(element);
      }, 540)
    );
  };

  const setSummary = (element, value) => {
    if (!element || element.textContent === value) return;
    element.textContent = value;
    bump(element);
  };

  const selectSlot = (hour) => {
    state.start = hour;
    updatePressed($$(".slot:not(:disabled)"), String(hour));
    updateSummary();
    setHint(
      `Jam ${fmtHour(hour)} sampai ${fmtHour(hour + state.duration)} dipilih. Lanjutkan ke detail pemesan.`,
      true
    );
  };

  const renderSlots = () => {
    const busy = busyFor(slug, state.day);
    const nowMinutes = getJakartaMinutes();
    const fragment = document.createDocumentFragment();
    let available = 0;

    for (let hour = OPEN_HOUR; hour <= CLOSE_HOUR - 1; hour += 1) {
      const past = isPastSlot(hour, nowMinutes);
      const reason = past ? "past" : blockReason(hour, busy, state.duration);
      const button = document.createElement("button");

      button.type = "button";
      button.className = "slot";
      button.dataset.start = String(hour);
      button.style.setProperty("--i", String(hour - OPEN_HOUR));

      const time = document.createElement("span");
      time.className = "slot__time";
      time.textContent = fmtHour(hour);

      const label = document.createElement("span");
      label.className = "slot__state";

      if (reason) {
        button.disabled = true;

        if (reason === "past") {
          label.textContent = "Lewat";
          button.title = "Waktu mulai sudah lewat";
        } else if (reason === "busy") {
          label.textContent = "Terisi";
          button.title = "Sudah terisi";
        } else if (reason === "conflict") {
          label.textContent = "Bentrok";
          button.title = `Bentrok dengan jadwal lain untuk durasi ${state.duration} jam`;
        } else {
          label.textContent = "Tutup";
          button.title = "Tidak cukup waktu sebelum 18.00";
        }
      } else {
        available += 1;
        label.textContent = "Tersedia";
        button.title = `Tersedia untuk durasi ${state.duration} jam`;
        button.setAttribute("aria-pressed", String(state.start === hour));

        button.addEventListener("click", () => selectSlot(hour));
      }

      button.append(time, " ", label);
      fragment.append(button);
    }

    els.slotGrid.replaceChildren(fragment);
    els.slotEmpty.hidden = available > 0;
  };

  const refreshDayWindow = () => {
    const nextWindow = buildDayWindow();

    if (nextWindow.start === dayWindowStart) return false;

    const selectedKey = dateKey(days[state.day]);
    const hadDateFocus = els.dateGrid.contains(document.activeElement);
    const hadSlotFocus = els.slotGrid.contains(document.activeElement);

    dayWindowStart = nextWindow.start;
    days = nextWindow.days;

    const preserved = days.findIndex((date) => dateKey(date) === selectedKey);
    state.day = preserved >= 0 ? preserved : defaultDayIndex();
    state.start = null;

    renderDates();
    renderSlots();
    updateSummary();
    setHint("Tanggal diperbarui. Pilih jam mulai lagi.", false);

    const activeDate = els.dateGrid.querySelector('.date-chip[aria-pressed="true"]');

    if (hadDateFocus) {
      activeDate?.focus({ preventScroll: true });
    } else if (hadSlotFocus) {
      const firstSlot = els.slotGrid.querySelector(".slot:not(:disabled)");
      (firstSlot || activeDate)?.focus({ preventScroll: true });
    }

    return true;
  };

  /* ---------- Duration ---------- */

  $$(".duration__btn").forEach((button) => {
    button.addEventListener("click", () => {
      const duration = Number(button.dataset.duration);

      if (!duration || duration === state.duration) return;

      state.duration = duration;

      $$(".duration__btn").forEach((item) => {
        const active = Number(item.dataset.duration) === duration;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      const busy = busyFor(slug, state.day);
      const wasPicked = state.start !== null;

      if (state.start !== null && (isPastSlot(state.start) || blockReason(state.start, busy, duration))) {
        state.start = null;
      }

      renderSlots();
      updateSummary();

      if (state.start !== null) {
        setHint(
          `Jam ${fmtHour(state.start)} sampai ${fmtHour(state.start + duration)} dipilih.`,
          true
        );
      } else if (wasPicked) {
        setHint("Durasi baru tidak cocok dengan jam sebelumnya. Pilih jam mulai lagi.", false);
      } else {
        setHint("Pilih jam mulai untuk melihat ringkasan.", false);
      }
    });
  });

  /* ---------- Validation ---------- */

  const validators = {
    nama: (value) =>
      value.trim().length >= 3 ? "" : "Tulis nama lengkap minimal 3 karakter.",
    nim: (value) =>
      /^[0-9]{6,15}$/.test(value.trim())
        ? ""
        : "NIM atau NIDN berisi 6 sampai 15 angka.",
    email: (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
        ? ""
        : "Gunakan email kampus yang valid, misalnya nama@kampus.ac.id.",
    peserta: (value) => {
      const people = Number(value);
      const max = ROOMS[slug].capacity;
      return Number.isInteger(people) && people >= 1 && people <= max
        ? ""
        : `Jumlah peserta antara 1 dan ${max}.`;
    },
    agenda: (value) =>
      value.trim().length >= 10
        ? ""
        : "Tulis agenda atau tujuan minimal 10 karakter."
  };

  const fieldElements = {
    nama: els.nama,
    nim: els.nim,
    email: els.email,
    peserta: els.peserta,
    agenda: els.agenda
  };

  const errorElements = {
    nama: $("#err-nama"),
    nim: $("#err-nim"),
    email: $("#err-email"),
    peserta: $("#err-peserta"),
    agenda: $("#err-agenda"),
    setuju: $("#err-setuju")
  };

  const clearError = (name) => {
    const error = errorElements[name];
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }

    if (fieldElements[name]) {
      fieldElements[name].removeAttribute("aria-invalid");
    }

    if (els.setuju && name === "setuju") {
      els.setuju.removeAttribute("aria-invalid");
    }
  };

  const clearErrors = () => {
    Object.keys(errorElements).forEach(clearError);
    els.alert.hidden = true;
  };

  const showError = (name, message) => {
    const error = errorElements[name];
    if (error) {
      error.textContent = message;
      error.hidden = false;
    }

    if (fieldElements[name]) {
      fieldElements[name].setAttribute("aria-invalid", "true");
    }

    if (name === "setuju") {
      els.setuju.setAttribute("aria-invalid", "true");
    }
  };

  const syncAlert = () => {
    const count = $$(".field__error:not([hidden])").length;

    if (!count) {
      els.alert.hidden = true;
      return;
    }

    if (els.alert.hidden) return;

    const message = `Ada ${count} bagian yang perlu diperbaiki. Periksa kolom bertanda.`;
    if (els.alert.textContent !== message) els.alert.textContent = message;
  };

  Object.entries(fieldElements).forEach(([name, input]) => {
    input.addEventListener("input", () => {
      clearError(name);
      syncAlert();
    });
  });

  els.setuju?.addEventListener("change", () => {
    clearError("setuju");
    syncAlert();
  });
  els.peserta?.addEventListener("input", updateSummary);

  const validate = () => {
    const errors = [];

    Object.entries(validators).forEach(([name, check]) => {
      const message = check(fieldElements[name].value);
      if (message) {
        showError(name, message);
        errors.push(name);
      }
    });

    if (!els.setuju.checked) {
      showError("setuju", "Centang persetujuan sebelum melanjutkan.");
      errors.push("setuju");
    }

    return errors;
  };

  /* ---------- Confirmation ---------- */

  const generateCode = () => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";

    for (let index = 0; index < 4; index += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    return `RNG-${code}`;
  };

  const confirmBooking = () => {
    if (isBooked) return;

    const room = ROOMS[slug];
    const people = Number(els.peserta.value);

    for (let hour = state.start; hour < state.start + state.duration; hour += 1) {
      bookedSlots.add(slotKey(slug, state.day, hour));
    }

    isBooked = true;
    els.successRoom.textContent = room.name;
    els.successPlace.textContent = `${room.name} · ${room.place}`;
    els.successDate.textContent = fmtFull.format(days[state.day]);
    els.successTime.textContent = `${fmtHour(state.start)}–${fmtHour(state.start + state.duration)} WIB`;
    els.successPeople.textContent = `${people} orang`;
    els.successName.textContent = els.nama.value.trim();
    els.successAgenda.textContent = els.agenda.value.trim();
    els.successCode.textContent = generateCode();

    els.preview.hidden = true;
    els.form.hidden = true;
    els.prep.hidden = true;
    els.success.hidden = false;

    document.title = `Reservasi terkonfirmasi · ${room.name} · Ruang`;
    els.summaryNote.textContent = "Reservasi tercatat.";
    els.summaryNote.classList.remove("is-warn");

    els.success.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });

    window.clearTimeout(successFocusTimer);
    successFocusTimer = window.setTimeout(
      () => els.successTitle.focus({ preventScroll: true }),
      prefersReducedMotion ? 0 : 420
    );
  };

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();

    const dateWasPast = isPastDay(state.day);
    if (dateWasPast) refreshDayWindow();

    if (state.start === null || isPastSlot(state.start)) {
      if (state.start !== null) {
        state.start = null;
        renderSlots();
        updateSummary();
      }

      els.summaryNote.textContent = dateWasPast
        ? "Tanggal yang dipilih sudah lewat. Pilih tanggal baru, ya."
        : "Pilih tanggal dan jam mulai dulu, ya.";
      els.summaryNote.classList.add("is-warn");
      setHint("Belum ada jam yang dipilih.", false);

      const firstSlot = els.slotGrid.querySelector(".slot:not(:disabled)");
      const activeDate =
        els.dateGrid.querySelector('.date-chip[aria-pressed="true"]') ||
        els.dateGrid.querySelector(".date-chip");
      const focusTarget = dateWasPast ? activeDate : firstSlot || activeDate;
      focusTarget?.focus();
      return;
    }

    clearErrors();
    const errors = validate();

    if (errors.length) {
      els.alert.hidden = false;
      els.alert.textContent = `Ada ${errors.length} bagian yang perlu diperbaiki. Periksa kolom bertanda.`;

      const first = errors[0] === "setuju" ? els.setuju : fieldElements[errors[0]];
      first?.focus();
      return;
    }

    confirmBooking();
  });

  els.again?.addEventListener("click", () => {
    els.success.hidden = true;
    els.preview.hidden = false;
    els.form.hidden = false;
    els.prep.hidden = false;

    isBooked = false;
    window.clearTimeout(successFocusTimer);
    successFocusTimer = 0;

    els.form.reset();
    clearErrors();

    state.start = null;
    state.duration = 2;

    $$(".duration__btn").forEach((button) => {
      const active = Number(button.dataset.duration) === 2;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    renderSlots();
    updateSummary();
    setHint("Pilih jam mulai untuk melihat ringkasan.", false);
    document.title = `${ROOMS[slug].name} · Reservasi ruang · Ruang`;

    const activeDate =
      els.dateGrid.querySelector('.date-chip[aria-pressed="true"]') ||
      els.dateGrid.querySelector(".date-chip");
    activeDate?.focus({ preventScroll: true });

    document.getElementById("tanggal").scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  });

  $$('a[href="/reservasi/tanggal"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      if (els.success.hidden) return;

      event.preventDefault();
      els.again.click();
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refreshDayWindow();
  });

  window.setInterval(() => {
    if (document.visibilityState === "visible") refreshDayWindow();
  }, 60000);

  /* ---------- Boot ---------- */

  applyRoom();
  renderDates();
  renderSlots();
  updateSummary();
})();
