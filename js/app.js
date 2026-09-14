(() => {
 
  const LEAD_ENDPOINT = "https://script.google.com/macros/s/AKfycbynJGYwj9_xwSg9G3jSekYv6o6Ape76-QGQ0uplS-bUerBEXqaaCtw_ptroZhl9jmCb/exec";

  const states = [...document.querySelectorAll("[data-state]")];
  const form = document.getElementById("leadForm");
  const openButton = document.querySelector('[data-action="open-form"]');
  const submitButton = document.getElementById("submitButton");
  const submitLabel = submitButton.querySelector(".button-label");
  const category = document.getElementById("category");
  const categoryOtherField = document.getElementById("categoryOtherField");
  const categoryOther = document.getElementById("categoryOther");
  const salesOther = document.getElementById("salesOther");
  const salesOtherField = document.getElementById("salesOtherField");
  const salesOtherText = document.getElementById("salesOtherText");
  const comment = document.getElementById("comment");
  const commentCount = document.getElementById("commentCount");

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

  category.addEventListener("change", () => {
    const visible = category.value === "Otro";
    categoryOtherField.hidden = !visible;
    categoryOther.required = visible;
    if (!visible) categoryOther.value = "";
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
      if (!(control instanceof HTMLElement) || control.disabled || control.type === "checkbox" || control.type === "radio") return;
      if (!control.checkValidity()) {
        if (!firstInvalid) firstInvalid = control;
        setError(control, control.validity.typeMismatch ? "Revisá el formato de este dato." : "Este campo es obligatorio.");
      }
    });

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

    if (!LEAD_ENDPOINT.startsWith("https://script.google.com/")) {
      alert("Falta configurar la URL del endpoint de Google Apps Script en js/app.js.");
      return;
    }

    submitButton.disabled = true;
    submitLabel.textContent = "ENVIANDO…";

    try {
      // Apps Script Web Apps no garantizan una respuesta CORS legible desde GitHub Pages.
      // no-cors permite entregar el POST; la confirmación definitiva queda registrada
      // en la Sheet y por correo. Para un backend con ACK verificable se requerirá
      // un endpoint con CORS explícito en una etapa posterior.
      await fetch(LEAD_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(buildPayload())
      });

      showState("success");
      form.reset();
    } catch (error) {
      console.error(error);
      alert("No pudimos enviar tus datos. Revisá tu conexión e intentá nuevamente.");
    } finally {
      submitLabel.textContent = "ENVIAR";
      submitButton.disabled = false;
    }
  });
})();
