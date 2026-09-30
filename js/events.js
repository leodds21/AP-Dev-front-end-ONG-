import { projetos } from "./templates.js";
import { aplicarMascara, prepararFormulario, validarCampo,
    validarFormulario, formularioValido } from "./validation.js";
import { lerCadastros, salvarCadastro, lerAltoContraste, salvarAltoContraste } from "./storage.js";

const mensagens = {
    info: {
        estado: "info", titulo: "Informação:",
        mensagem: "Os dados pessoais não são enviados nem armazenados. Apenas a forma de participação é salva neste navegador."
    },
    warning: {
        estado: "warning", titulo: "Atenção:",
        mensagem: "CPF, telefone e CEP são verificados apenas pelo formato indicado."
    },
    error: {
        estado: "error", titulo: "Revise os dados:",
        mensagem: "Corrija os campos destacados antes de continuar."
    },
    success: {
        estado: "success", titulo: "Cadastro salvo neste navegador:",
        mensagem: "A forma de participação foi registrada. Nenhum dado pessoal foi armazenado ou enviado."
    }
};
let temporizadorToast;
let botaoQueAbriu;

export function mostrarFeedback(elemento, dados) {
    if (!elemento) return;
    elemento.dataset.state = ["info", "warning", "error", "success"].includes(dados.estado)
        ? dados.estado : "info";
    const titulo = elemento.querySelector(".feedback-title");
    if (titulo) titulo.textContent = dados.titulo || "";
    elemento.querySelector(".feedback-message").textContent = dados.mensagem || "";
    if (elemento.hasAttribute("role")) {
        elemento.setAttribute("role", dados.estado === "error" ? "alert" : "status");
    }
    elemento.hidden = false;
}

export function atualizarBadge(elemento, dados) {
    elemento.dataset.state = dados.estado;
    elemento.textContent = dados.texto;
}

function fecharSubmenu() {
    const dropdown = document.querySelector(".dropdown");
    dropdown.classList.remove("is-open");
    if (window.innerWidth >= 1024) dropdown.classList.add("is-dismissed");
    const botao = document.querySelector(".submenu-toggle");
    botao.setAttribute("aria-expanded", "false");
    botao.setAttribute("aria-label", "Abrir projetos");
}

function sincronizarSubmenu() {
    const dropdown = document.querySelector(".dropdown");
    const aberto = window.innerWidth >= 1024
        ? !dropdown.classList.contains("is-dismissed") &&
            (dropdown.matches(":hover, :focus-within") || dropdown.classList.contains("is-open"))
        : dropdown.classList.contains("is-open");
    const botao = dropdown.querySelector(".submenu-toggle");
    botao.setAttribute("aria-expanded", String(aberto));
    botao.setAttribute("aria-label", aberto ? "Fechar projetos" : "Abrir projetos");
}

function fecharMenu() {
    document.querySelector(".main-nav").classList.remove("is-open");
    const botao = document.querySelector(".menu-toggle");
    botao.setAttribute("aria-expanded", "false");
    botao.setAttribute("aria-label", "Abrir menu");
    fecharSubmenu();
}

function fecharToast() {
    const toast = document.getElementById("validation-toast");
    if (toast.contains(document.activeElement)) {
        const destino = document.querySelector('#cadastro-form [type="submit"]') ||
            document.querySelector("#app h1");
        destino?.focus();
    }
    toast.hidden = true;
    clearTimeout(temporizadorToast);
}

function atualizarContagem(total = lerCadastros().length) {
    const resumo = document.getElementById("storage-summary");
    if (resumo) resumo.textContent = "Cadastros salvos neste navegador: " + total + ".";
}

export function prepararPagina() {
    fecharMenu();
    fecharToast();
    const modal = document.getElementById("project-modal");
    if (modal.open) modal.close();
    const formulario = document.getElementById("cadastro-form");
    if (formulario) {
        prepararFormulario(formulario);
        mostrarFeedback(document.getElementById("form-info"), mensagens.info);
        mostrarFeedback(document.getElementById("form-warning"), mensagens.warning);
    }
    atualizarContagem();
}

export function iniciarEventos(app) {
    const menuButton = document.querySelector(".menu-toggle");
    const mainNav = document.querySelector(".main-nav");
    const dropdown = document.querySelector(".dropdown");
    const submenuButton = document.querySelector(".submenu-toggle");
    const modal = document.getElementById("project-modal");
    const toast = document.getElementById("validation-toast");

    const contraste = document.querySelector(".contrast-toggle");
    function aplicarContraste(ativo) {
        document.body.classList.toggle("alto-contraste", ativo);
        contraste.setAttribute("aria-pressed", String(ativo));
    }
    aplicarContraste(lerAltoContraste());
    contraste.addEventListener("click", () => {
        const ativo = !document.body.classList.contains("alto-contraste");
        aplicarContraste(ativo);
        try {
            salvarAltoContraste(ativo);
        } catch {
            mostrarFeedback(toast, {
                estado: "warning",
                mensagem: "Contraste alterado. Não foi possível salvar a preferência neste navegador."
            });
            clearTimeout(temporizadorToast);
            temporizadorToast = setTimeout(fecharToast, 10000);
        }
    });

    menuButton.addEventListener("click", () => {
        const aberto = mainNav.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", String(aberto));
        menuButton.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
        if (!aberto) fecharSubmenu();
    });
    submenuButton.addEventListener("click", () => {
        if (submenuButton.getAttribute("aria-expanded") === "true") fecharSubmenu();
        else {
            dropdown.classList.remove("is-dismissed");
            dropdown.classList.add("is-open");
            sincronizarSubmenu();
        }
    });
    dropdown.addEventListener("mouseenter", () => {
        dropdown.classList.remove("is-dismissed");
        sincronizarSubmenu();
    });
    dropdown.addEventListener("mouseleave", () => {
        dropdown.classList.remove("is-dismissed");
        sincronizarSubmenu();
    });
    dropdown.addEventListener("focusin", evento => {
        if (!dropdown.contains(evento.relatedTarget)) dropdown.classList.remove("is-dismissed");
        sincronizarSubmenu();
    });
    dropdown.addEventListener("focusout", () => queueMicrotask(sincronizarSubmenu));
    window.matchMedia("(min-width: 1024px)").addEventListener("change", evento => {
        if (!evento.matches && mainNav.contains(document.activeElement)) menuButton.focus();
        fecharMenu();
    });
    document.addEventListener("click", evento => {
        if (!dropdown.contains(evento.target)) fecharSubmenu();
        if (evento.target.closest('a[href^="#"]') ||
            (window.innerWidth < 1024 && !menuButton.contains(evento.target) &&
                !mainNav.contains(evento.target))) fecharMenu();
    });
    document.addEventListener("keydown", evento => {
        if (evento.key !== "Escape" || modal.open) return;
        if ((window.innerWidth >= 1024 && dropdown.matches(":hover")) || dropdown.classList.contains("is-open") ||
            dropdown.contains(document.activeElement)) {
            fecharSubmenu();
            dropdown.classList.add("is-dismissed");
            if (window.innerWidth < 1024) menuButton.focus();
            else document.querySelector(".nav-list a").focus();
            evento.preventDefault();
        } else if (mainNav.classList.contains("is-open")) {
            fecharMenu();
            menuButton.focus();
            evento.preventDefault();
        }
    });

    // O mesmo contêiner recebe os eventos dos elementos de todas as rotas.
    app.addEventListener("click", evento => {
        const botao = evento.target.closest(".modal-open");
        if (!botao) return;
        const projeto = projetos.find(item => item.id === botao.dataset.project);
        if (!projeto) return;
        botaoQueAbriu = botao;
        document.getElementById("modal-title").textContent = projeto.titulo;
        document.getElementById("modal-description").textContent = projeto.detalhes;
        modal.showModal();
        modal.querySelector(".modal-close").focus();
    });
    modal.querySelector(".modal-close").addEventListener("click", () => modal.close());
    modal.addEventListener("close", () => {
        // Um evento de fechamento anterior não deve roubar o foco de um novo modal.
        if (modal.open) return;
        if (botaoQueAbriu?.isConnected) botaoQueAbriu.focus();
        botaoQueAbriu = undefined;
    });
    toast.querySelector(".toast-close").addEventListener("click", fecharToast);

    function aoEditar(campo) {
        const formulario = campo.closest("form");
        if (!formulario) return;
        const grupo = campo.closest(".campo") || campo.closest("fieldset");
        if (grupo.classList.contains("is-touched") ||
            campo.closest("fieldset").classList.contains("is-submitted")) validarCampo(campo);
        document.getElementById("form-success").hidden = true;
        fecharToast();
        if (formularioValido(formulario)) document.getElementById("form-error").hidden = true;
    }

    app.addEventListener("input", evento => {
        if (!evento.target.matches("input, select")) return;
        aplicarMascara(evento.target);
        aoEditar(evento.target);
    });
    app.addEventListener("change", evento => {
        if (evento.target.matches("input, select")) aoEditar(evento.target);
    });
    app.addEventListener("focusout", evento => {
        if (evento.target.matches("input, select") && app.contains(evento.target)) {
            validarCampo(evento.target);
        }
    });
    app.addEventListener("submit", evento => {
        const formulario = evento.target;
        if (!formulario.matches("#cadastro-form")) return;
        evento.preventDefault();
        const erro = document.getElementById("form-error");
        document.getElementById("form-success").hidden = true;
        fecharToast();
        if (!validarFormulario(formulario)) {
            mostrarFeedback(erro, mensagens.error);
            return;
        }
        let total;
        try {
            const participacao = new FormData(formulario).get("participacao");
            total = salvarCadastro(participacao);
        } catch {
            mostrarFeedback(erro, {
                estado: "error", titulo: "Não foi possível salvar:",
                mensagem: "O armazenamento deste navegador está indisponível. Nenhum registro foi salvo."
            });
            return;
        }
        atualizarContagem(total);
        erro.hidden = true;
        mostrarFeedback(document.getElementById("form-success"), mensagens.success);
        mostrarFeedback(toast, {
            estado: "success", mensagem: "Participação salva neste navegador. Nenhum dado pessoal foi enviado."
        });
        temporizadorToast = setTimeout(fecharToast, 10000);
    });
}
