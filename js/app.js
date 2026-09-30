import { carregarTemplates, prepararFeedback } from "./templates.js";
import { iniciarRouter } from "./router.js";
import { iniciarEventos, prepararPagina } from "./events.js";

async function iniciar() {
    const app = document.querySelector("#app");
    if (!app) {
        console.error("Contêiner principal não encontrado.");
        return;
    }
    try {
        await carregarTemplates();
        prepararFeedback();
        iniciarEventos(app);
        iniciarRouter(app, prepararPagina);
    } catch (erro) {
        const aviso = document.createElement("p");
        aviso.className = "alert";
        aviso.dataset.state = "error";
        aviso.setAttribute("role", "alert");
        aviso.textContent = "Não foi possível iniciar o site. Abra-o pelo servidor local indicado no README.";
        app.prepend(aviso);
        console.error(erro);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar, { once: true });
} else {
    iniciar();
}
