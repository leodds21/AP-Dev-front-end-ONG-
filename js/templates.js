import inicioHtml from "../html/inicio.html?raw";
import projetosHtml from "../html/projetos.html?raw";
import cadastroHtml from "../html/cadastro.html?raw";

const imagens = {
    "projeto-educacao": {
        webp: new URL("../imagens/projeto-educacao.webp", import.meta.url).href,
        jpg: new URL("../imagens/projeto-educacao.jpg", import.meta.url).href
    },
    "voluntariado-arvore": {
        webp: new URL("../imagens/voluntariado-arvore.webp", import.meta.url).href,
        jpg: new URL("../imagens/voluntariado-arvore.jpg", import.meta.url).href
    },
    "doacoes-alimentos": {
        webp: new URL("../imagens/doacoes-alimentos.webp", import.meta.url).href,
        jpg: new URL("../imagens/doacoes-alimentos.jpg", import.meta.url).href
    }
};

export const projetos = [
    {
        id: "educacao",
        titulo: "Projeto de educação",
        imagem: "projeto-educacao",
        alt: "Crianças participando de uma atividade educativa",
        descricao: "Oferecemos atividades de leitura e reforço escolar para crianças da comunidade.",
        participacao: "Quero participar deste projeto",
        badge: { estado: "info", texto: "Educação" },
        detalhes: "As atividades de leitura e reforço escolar acontecem com a ajuda de pessoas voluntárias."
    },
    {
        id: "voluntariado",
        titulo: "Voluntariado",
        imagem: "voluntariado-arvore",
        alt: "Voluntários plantando uma árvore",
        descricao: "Promovemos encontros de voluntariado para cuidar de espaços públicos e plantar árvores.",
        participacao: "Quero ser voluntário",
        badge: { estado: "success", texto: "Voluntariado" },
        detalhes: "Os encontros reúnem pessoas interessadas em cuidar de espaços públicos e plantar árvores."
    },
    {
        id: "doacoes",
        titulo: "Campanha de doações",
        imagem: "doacoes-alimentos",
        alt: "Alimentos separados para doação",
        descricao: "Arrecadamos alimentos para montar cestas destinadas a famílias atendidas pela ONG.",
        participacao: "Quero contribuir com doações",
        badge: { estado: "warning", texto: "Doações" },
        detalhes: "Os alimentos arrecadados são organizados em cestas para famílias atendidas pela ONG."
    }
];

export function projetoCardTemplate(projeto) {
    return `
        <article class="project-card" id="${projeto.id}">
            <span class="badge" data-state="${projeto.badge.estado}">${projeto.badge.texto}</span>
            <h2>${projeto.titulo}</h2>
            <picture>
                <source srcset="${imagens[projeto.imagem].webp}" type="image/webp">
                <img src="${imagens[projeto.imagem].jpg}" alt="${projeto.alt}" width="800" height="533" loading="lazy">
            </picture>
            <p>${projeto.descricao}</p>
            <div class="card-actions">
                <a class="button" href="#cadastro">${projeto.participacao}</a>
                <button class="button button-secondary modal-open" type="button" data-project="${projeto.id}">Saiba mais</button>
            </div>
        </article>`;
}

// Fragmentos locais são incluídos na build, sem requisições adicionais de HTML.
const templates = {
    inicio: inicioHtml
        .replaceAll("imagens/projeto-educacao.webp", imagens["projeto-educacao"].webp)
        .replaceAll("imagens/projeto-educacao.jpg", imagens["projeto-educacao"].jpg),
    projetos: projetosHtml,
    cadastro: cadastroHtml
};

export function obterTemplate(rota) {
    if (rota !== "projetos") return templates[rota];
    const documento = new DOMParser().parseFromString(projetosHtml, "text/html");
    documento.querySelector(".projects-grid").innerHTML = projetos.map(projetoCardTemplate).join("");
    return documento.body.innerHTML;
}

export function prepararFeedback() {
    if (!document.getElementById("project-modal")) {
        document.body.insertAdjacentHTML("beforeend", `
            <dialog class="project-modal" id="project-modal" aria-labelledby="modal-title">
                <div class="modal-header">
                    <h2 id="modal-title"></h2>
                    <button class="modal-close" type="button" aria-label="Fechar informações">×</button>
                </div>
                <p id="modal-description"></p>
                <a class="button" href="#cadastro">Ir para o cadastro</a>
            </dialog>`);
    }
    if (!document.getElementById("validation-toast")) {
        document.body.insertAdjacentHTML("beforeend", `
            <div class="toast" id="validation-toast" role="status" aria-live="polite" hidden>
                <span class="feedback-message"></span>
                <button type="button" class="toast-close" aria-label="Fechar notificação">×</button>
            </div>`);
    }
}
