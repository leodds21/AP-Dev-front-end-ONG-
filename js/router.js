import { obterTemplate } from "./templates.js";

export function iniciarRouter(app, aoRenderizar) {
    const titulos = { inicio: "Início", projetos: "Projetos", cadastro: "Cadastro" };
    const arquivo = location.pathname.split("/").pop();
    const inicial = arquivo === "projetos.html" ? "projetos" :
        arquivo === "cadastro.html" ? "cadastro" : "inicio";
    let alvoPendente;

    function renderizar(focar = true) {
        const hash = window.location.hash.slice(1);
        const rota = Object.hasOwn(titulos, hash) ? hash : inicial;
        if (hash !== rota) history.replaceState(null, "", "#" + rota);
        app.innerHTML = obterTemplate(rota);
        app.dataset.route = rota;
        document.title = "ONG Transformando Vidas - " + titulos[rota];
        document.querySelectorAll(".nav-list a:not([data-project-target])").forEach(link => {
            if (link.hash === "#" + rota) link.setAttribute("aria-current", "page");
            else link.removeAttribute("aria-current");
        });
        aoRenderizar(rota);
        const titulo = app.querySelector("h1");
        if (focar && titulo) {
            titulo.tabIndex = -1;
            titulo.focus({ preventScroll: true });
        }
        const alvo = alvoPendente && app.querySelector("#" + alvoPendente);
        if (alvo) alvo.scrollIntoView();
        else window.scrollTo(0, 0);
        alvoPendente = undefined;
    }

    window.addEventListener("hashchange", () => renderizar());
    document.addEventListener("click", evento => {
        const link = evento.target.closest("a[data-project-target]");
        if (!link || evento.button !== 0 || evento.ctrlKey || evento.metaKey ||
            evento.shiftKey || evento.altKey || link.target === "_blank") return;
        evento.preventDefault();
        alvoPendente = link.dataset.projectTarget;
        if (window.location.hash === "#projetos") renderizar();
        else window.location.hash = "projetos";
    });
    renderizar(false);
}
