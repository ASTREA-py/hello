(() => {
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

  const fieldContainer = (control) =>
    control.closest(".field") || control.closest("fieldset");

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
        const message = control.validity.typeMismatch
          ? "Revisá el formato de este dato."
          : "Este campo es obligatorio.";
        setError(control, message);
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
      const field = fieldContainer(firstInvalid);
      field?.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => firstInvalid.focus({ preventScroll: true }), 260);
      return false;
    }
    return true;
  };

  form.addEventListener("input", (event) => {
    const field = fieldContainer(event.target);
    if (field) field.classList.remove("has-error");
  });
  form.addEventListener("change", (event) => {
    const field = fieldContainer(event.target);
    if (field) field.classList.remove("has-error");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validate()) return;

    submitButton.disabled = true;
    submitLabel.textContent = "ENVIANDO…";

    // v0.1: envío simulado. En la siguiente etapa se reemplaza por el endpoint real.
    await new Promise((resolve) => window.setTimeout(resolve, 850));

    submitLabel.textContent = "ENVIAR";
    submitButton.disabled = false;
    showState("success");
  });
})();
