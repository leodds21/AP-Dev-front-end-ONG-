export function aplicarMascara(campo) {
    const numeros = campo.value.replace(/\D/g, "");
    if (campo.id === "cpf") {
        campo.value = numeros.slice(0, 11)
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else if (campo.id === "telefone") {
        campo.value = numeros.slice(0, 11)
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{5})(\d)/, "$1-$2");
    } else if (campo.id === "cep") {
        campo.value = numeros.slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
    }
}

export function prepararFormulario(formulario) {
    // Mantém required/type/pattern e usa suas regras na validação JavaScript.
    formulario.noValidate = true;
    formulario.querySelectorAll(".field-error").forEach(mensagem => {
        mensagem.dataset.original = mensagem.textContent;
        mensagem.textContent = "";
    });
}

function campoValido(campo) {
    if (campo.type !== "radio" && campo.required && !campo.value.trim()) return false;
    if (campo.type === "email" && campo.value &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campo.value)) return false;
    return campo.validity.valid;
}

export function validarCampo(campo) {
    const grupo = campo.closest(".campo") || campo.closest("fieldset");
    const mensagem = campo.type === "radio" ? grupo.querySelector(".field-error") :
        document.getElementById(campo.getAttribute("aria-describedby"));
    const valido = campoValido(campo);
    grupo.classList.add("is-touched");
    grupo.classList.toggle("has-error", !valido);
    grupo.classList.toggle("is-valid", valido);
    campo.setAttribute("aria-invalid", String(!valido));
    if (campo.type === "radio") {
        grupo.querySelectorAll('input[type="radio"]').forEach(radio =>
            radio.setAttribute("aria-invalid", String(!valido)));
    }
    if (mensagem) mensagem.textContent = valido ? "" : mensagem.dataset.original;
    return valido;
}

export function validarFormulario(formulario) {
    let primeiroErro;
    formulario.querySelectorAll("fieldset").forEach(grupo => grupo.classList.add("is-submitted"));
    formulario.querySelectorAll("input, select").forEach(campo => {
        if (!validarCampo(campo) && !primeiroErro) primeiroErro = campo;
    });
    if (primeiroErro) primeiroErro.focus();
    return !primeiroErro;
}

export function formularioValido(formulario) {
    return Array.from(formulario.querySelectorAll("input, select")).every(campoValido);
}
