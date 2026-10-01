(() => {
  const LEAD_ENDPOINT = "https://script.google.com/macros/s/AKfycbynJGYwj9_xwSg9G3jSekYv6o6Ape76-QGQ0uplS-bUerBEXqaaCtw_ptroZhl9jmCb/exec";
  const ACCESS_ENDPOINT = "https://script.google.com/macros/s/AKfycbwjRHpkKAyVp-BQTtYff-ypvTjbkG_TUxOzk-Axumm11W4RfC7n4JfpoayPSwikUr8j/exec";

  const states = [...document.querySelectorAll("[data-state]")];
  const siteHeader = document.getElementById("siteHeader");

  const form = document.getElementById("leadForm");
  const openButton = document.querySelector('[data-action="open-form"]');
  const submitButton = document.getElementById("submitButton");
  const submitLabel = submitButton.querySelector(".button-label");

  const category = document.getElementById("category");
  const categoryField = document.getElementById("categoryField");
  const categoryPicker = document.getElementById("categoryPicker");
  const categoryTrigger = document.getElementById("categoryTrigger");
  const categoryLabel = document.getElementById("categoryLabel");
  const categoryOptions = document.getElementById("categoryOptions");
  const categoryOtherField = document.getElementById("categoryOtherField");
  const categoryOther = document.getElementById("categoryOther");

  const salesOther = document.getElementById("salesOther");
  const salesOtherField = document.getElementById("salesOtherField");
  const salesOtherText = document.getElementById("salesOtherText");
  const comment = document.getElementById("comment");
  const commentCount = document.getElementById("commentCount");

  const accessForm = document.getElementById("accessForm");
  const accessCode = document.getElementById("accessCode");
  const accessError = document.getElementById("accessError");
  const accessSubmit = document.getElementById("accessSubmit");
  const accessSubmitLabel = accessSubmit.querySelector(".button-label");
  const clientBusinessName = document.getElementById("clientBusinessName");
  const demoLink = document.getElementById("demoLink");
  const proposalLink = document.getElementById("proposalLink");

  const showState = (name) => {
    states.forEach((state) => {
      const active = state.dataset.state === name;
      state.classList.toggle("is-active", active);
      state.setAttribute("aria-hidden", String(!active));
    });

  };

  openButton.addEventListener("click", () => {
    showState("form");
    window.setTimeout(() => document.getElementById("name").focus({ preventScroll: true }), 420);
  });

  // ---------- Selector ASTREA de rubro ----------
  const closeCategory = () => {
    categoryOptions.hidden = true;
    categoryTrigger.setAttribute("aria-expanded", "false");
  };

  const openCategory = () => {
    categoryOptions.hidden = false;
    categoryTrigger.setAttribute("aria-expanded", "true");
    const selected = categoryOptions.querySelector('[aria-selected="true"]') || categoryOptions.querySelector("button");
    selected?.focus();
  };

  categoryTrigger.addEventListener("click", () => {
    categoryOptions.hidden ? openCategory() : closeCategory();
  });

  categoryOptions.addEventListener("click", (event) => {
    const option = event.target.closest("[data-value]");
    if (!option) return;

    const value = option.dataset.value || "";
    category.value = value;
    categoryLabel.textContent = value || "Seleccioná un rubro";
    categoryOptions.querySelectorAll("[role='option']").forEach((item) => {
      item.setAttribute("aria-selected", String(item === option));
    });

    const otherVisible = value === "Otro";
    categoryOtherField.hidden = !otherVisible;
    categoryOther.required = otherVisible;
    if (!otherVisible) categoryOther.value = "";

    categoryField.classList.remove("has-error");
    closeCategory();
    categoryTrigger.focus();
  });

  categoryOptions.addEventListener("keydown", (event) => {
    const options = [...categoryOptions.querySelectorAll("[role='option']")];
    const current = options.indexOf(document.activeElement);

    if (event.key === "Escape") {
      event.preventDefault();
      closeCategory();
      categoryTrigger.focus();
      return;
    }

    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();

    const delta = event.key === "ArrowDown" ? 1 : -1;
    const next = (current + delta + options.length) % options.length;
    options[next]?.focus();
  });

  document.addEventListener("click", (event) => {
    if (!categoryPicker.contains(event.target)) closeCategory();
  });

  salesOther.addEventListener("change", () => {
    salesOtherField.hidden = !salesOther.checked;
    salesOtherText.required = salesOther.checked;
    if (!salesOther.checked) salesOtherText.value = "";
  });

  comment.addEventListener("input", () => {
    commentCount.textContent = `${comment.value.length} / 500`;
  });

  const fieldContainer = (control) => control.closest(".field") || control.closest("fieldset");

  const setError = (control, message) => {
    const field = fieldContainer(control);
    if (!field) return;
    field.classList.add("has-error");
    const error = field.querySelector(".field-error");
    if (error) error.textContent = message;
  };

  const clearErrors = () => {
    form.querySelectorAll(".has-error").forEach((field) => field.classList.remove("has-error"));
    form.querySelectorAll(".field-error").forEach((error) => error.textContent = "");
  };

  const validate = () => {
    clearErrors();
    let firstInvalid = null;

    [...form.elements].forEach((control) => {
      if (!(control instanceof HTMLElement)) return;
      if (control.disabled || control.type === "checkbox" || control.type === "radio" || control.id === "category") return;

      if (!control.checkValidity()) {
        if (!firstInvalid) firstInvalid = control;
        setError(control, control.validity.typeMismatch ? "Revisá el formato de este dato." : "Este campo es obligatorio.");
      }
    });

    if (!category.value) {
      setError(categoryTrigger, "Elegí un rubro.");
      firstInvalid ||= categoryTrigger;
    }

    const productRange = form.querySelector('input[name="productRange"]:checked');
    if (!productRange) {
      const firstRadio = form.querySelector('input[name="productRange"]');
      setError(firstRadio, "Elegí una opción.");
      firstInvalid ||= firstRadio;
    }

    const channels = [...form.querySelectorAll('input[name="salesChannels"]:checked')];
    if (!channels.length) {
      const firstCheckbox = form.querySelector('input[name="salesChannels"]');
      setError(firstCheckbox, "Seleccioná al menos una opción.");
      firstInvalid ||= firstCheckbox;
    }

    if (firstInvalid) {
      fieldContainer(firstInvalid)?.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => firstInvalid.focus({ preventScroll: true }), 260);
      return false;
    }
    return true;
  };

  form.addEventListener("input", (event) => fieldContainer(event.target)?.classList.remove("has-error"));
  form.addEventListener("change", (event) => fieldContainer(event.target)?.classList.remove("has-error"));

  const getTracking = () => {
    const qs = new URLSearchParams(window.location.search);
    return {
      source: qs.get("utm_source") || document.referrer || "direct",
      campaign: qs.get("utm_campaign") || "",
      medium: qs.get("utm_medium") || "",
      origin: "hello"
    };
  };

  const buildPayload = () => {
    const data = new FormData(form);
    const tracking = getTracking();
    return {
      name: String(data.get("name") || "").trim(),
      whatsapp: String(data.get("whatsapp") || "").trim(),
      email: String(data.get("email") || "").trim(),
      businessName: String(data.get("businessName") || "").trim(),
      city: String(data.get("city") || "").trim(),
      category: String(data.get("category") || ""),
      categoryOther: String(data.get("categoryOther") || "").trim(),
      productRange: String(data.get("productRange") || ""),
      salesChannels: data.getAll("salesChannels"),
      salesOtherText: String(data.get("salesOtherText") || "").trim(),
      digitalPresence: String(data.get("digitalPresence") || "").trim(),
      comment: String(data.get("comment") || "").trim(),
      source: tracking.source,
      medium: tracking.medium,
      campaign: tracking.campaign,
      origin: tracking.origin,
      pageUrl: window.location.href,
      status: "Nuevo"
    };
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validate()) return;

    submitButton.disabled = true;
    submitLabel.textContent = "ENVIANDO…";

    try {
      await fetch(LEAD_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(buildPayload())
      });

      showState("success");
      form.reset();

      category.value = "";
      categoryLabel.textContent = "Seleccioná un rubro";
      categoryOptions.querySelectorAll("[role='option']").forEach((item) => item.removeAttribute("aria-selected"));
      categoryOtherField.hidden = true;
      categoryOther.required = false;
      salesOtherField.hidden = true;
      salesOtherText.required = false;
      commentCount.textContent = "0 / 500";
    } catch (error) {
      console.error(error);
      alert("No pudimos enviar tus datos. Revisá tu conexión e intentá nuevamente.");
    } finally {
      submitLabel.textContent = "ENVIAR";
      submitButton.disabled = false;
    }
  });

  // ---------- Navegación ----------
  document.querySelectorAll('[data-action="go-home"]').forEach((button) => {
    button.addEventListener("click", () => {
      accessError.textContent = "";
      accessCode.value = "";
      showState("intro");
    });
  });

  // ---------- Acceso comercial por código ----------
  const normalizeCode = (value) => String(value || "").trim().toUpperCase();

  const openAccess = () => {
    accessError.textContent = "";
    showState("access");
  };

  document.querySelectorAll('[data-action="open-access"]').forEach((button) => {
    button.addEventListener("click", openAccess);
  });

  const requestAccessCode = (code) => new Promise((resolve, reject) => {
    if (!ACCESS_ENDPOINT.startsWith("https://script.google.com/macros/s/")) {
      reject(new Error("ACCESS_ENDPOINT_NOT_CONFIGURED"));
      return;
    }

    const callbackName = `__astreaAccess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    let settled = false;

    const cleanup = () => {
      window.clearTimeout(timeout);
      try { delete window[callbackName]; } catch (_) { window[callbackName] = undefined; }
      script.remove();
    };

    const finish = (error, data) => {
      if (settled) return;
      settled = true;
      cleanup();
      error ? reject(error) : resolve(data);
    };

    window[callbackName] = (data) => finish(null, data);

    const url = new URL(ACCESS_ENDPOINT);
    url.searchParams.set("code", code);
    url.searchParams.set("callback", callbackName);
    url.searchParams.set("_", Date.now().toString());

    script.src = url.toString();
    script.async = true;
    script.onerror = () => finish(new Error("NETWORK"));

    const timeout = window.setTimeout(() => finish(new Error("TIMEOUT")), 7000);
    document.head.appendChild(script);
  });

  const safeHttpUrl = (value) => {
    try {
      const url = new URL(String(value || ""));
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch {
      return "";
    }
  };


  const applyClientAccess = (data) => {
    clientBusinessName.textContent = data.businessName || "Tu comercio";

    const demoUrl = safeHttpUrl(data.demoUrl);
    const proposalUrl = safeHttpUrl(data.proposalUrl);

    demoLink.href = demoUrl || "#";
    proposalLink.href = proposalUrl || "#";
    demoLink.hidden = !demoUrl;
    proposalLink.hidden = !proposalUrl;

    showState("client");
  };

  accessForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const code = normalizeCode(accessCode.value);
    if (!code) {
      accessError.textContent = "Ingresá tu código para continuar.";
      accessCode.focus();
      return;
    }

    accessError.textContent = "";
    accessSubmit.disabled = true;
    accessSubmitLabel.textContent = "VALIDANDO…";

    try {
      const result = await requestAccessCode(code);

      if (!result?.valid) {
        accessError.textContent =
          result?.reason === "expired"
            ? "Este código ya venció. Contactá a ASTREA™ para solicitar uno nuevo."
            : "No encontramos un acceso activo con ese código.";
        return;
      }

      applyClientAccess(result);
    } catch (error) {
      console.error(error);
      accessError.textContent =
        error?.message === "ACCESS_ENDPOINT_NOT_CONFIGURED"
          ? "Falta configurar el endpoint de acceso."
          : "No pudimos validar el código. Intentá nuevamente.";
    } finally {
      accessSubmit.disabled = false;
      accessSubmitLabel.textContent = "CONTINUAR";
    }
  });
})();
