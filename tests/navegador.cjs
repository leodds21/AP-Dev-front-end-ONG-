const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require("playwright");

const base = process.env.BASE_URL || "http://127.0.0.1:5173";

async function executar() {
    const navegador = await chromium.launch(process.env.CHROME_PATH
        ? { executablePath: process.env.CHROME_PATH }
        : { channel: process.env.BROWSER_CHANNEL || "chrome" });
    const erros = [];
    fs.mkdirSync("test-results", { recursive: true });
    try {
        const page = await navegador.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
        page.on("pageerror", erro => erros.push(erro.message));
        page.on("console", mensagem => {
            if (mensagem.type() === "error") erros.push(mensagem.text());
        });
        page.on("response", resposta => {
            if (resposta.status() >= 400) erros.push(resposta.status() + " " + resposta.url());
        });
        async function abrir(rota = "inicio") {
            await page.goto(base + "/#" + rota, { waitUntil: "networkidle" });
            await page.waitForSelector('#app[data-route="' + rota + '"]');
        }
        async function conferirPagina() {
            assert.equal(await page.locator("h1").count(), 1);
            assert.deepEqual(await page.evaluate(() => {
                const problemas = [];
                const ids = [...document.querySelectorAll("[id]")].map(el => el.id);
                if (new Set(ids).size !== ids.length) problemas.push("IDs duplicados");
                document.querySelectorAll("input, select").forEach(campo => {
                    if (!campo.labels.length) problemas.push("Campo sem label: " + campo.id);
                    (campo.getAttribute("aria-describedby") || "").split(" ").filter(Boolean).forEach(id => {
                        if (!document.getElementById(id)) problemas.push("Descrição ausente: " + id);
                    });
                });
                document.querySelectorAll("fieldset").forEach(grupo => {
                    if (!grupo.querySelector("legend")) problemas.push("Fieldset sem legend");
                });
                document.querySelectorAll("img").forEach(img => {
                    if (!img.hasAttribute("alt")) problemas.push("Imagem sem alt");
                });
                if (document.documentElement.scrollWidth > innerWidth) problemas.push("Rolagem horizontal");
                return problemas;
            }), []);
            for (const img of await page.locator("img").all()) {
                await img.scrollIntoViewIfNeeded();
                await img.evaluate(el => el.decode());
            }
        }
        async function conferirContraste() {
            const pares = await page.evaluate(() => {
                const css = getComputedStyle(document.body);
                const pares = [["text", "background"], ["text", "surface"], ["on-primary", "primary"],
                    ["primary-dark", "background"], ...["info", "success", "warning", "error"]
                        .map(estado => [estado, estado + "-light"])];
                const amostra = document.createElement("span");
                document.body.append(amostra);
                function normalizar(nome) {
                    amostra.style.color = css.getPropertyValue("--color-" + nome).trim();
                    return getComputedStyle(amostra).color;
                }
                const resultado = pares.map(([frente, fundo]) => [frente, fundo, normalizar(frente), normalizar(fundo)]);
                amostra.remove();
                return resultado;
            });
            function luminancia(rgb) {
                const canais = rgb.match(/[0-9.]+/g).slice(0, 3).map(c => Number(c) / 255)
                    .map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
                return canais[0] * 0.2126 + canais[1] * 0.7152 + canais[2] * 0.0722;
            }
            for (const [frente, fundo, cor, background] of pares) {
                const a = luminancia(cor), b = luminancia(background);
                const razao = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
                assert.ok(razao >= 4.5, `Contraste ${frente}/${fundo}: ${razao.toFixed(2)}`);
            }
        }
        for (const largura of [320, 375, 390, 480, 768, 1024, 1280, 1440]) {
            await page.setViewportSize({ width: largura, height: 900 });
            for (const rota of ["inicio", "projetos", "cadastro"]) {
                await abrir(rota);
                await conferirPagina();
            }
            console.log(`Rotas e layout: ${largura}px OK`);
        }
        for (const rota of ["inicio", "projetos", "cadastro"]) {
            await abrir(rota);
            await page.reload({ waitUntil: "networkidle" });
            assert.equal(await page.locator("#app").getAttribute("data-route"), rota);
        }
        await page.setViewportSize({ width: 1440, height: 900 });
        await abrir();
        await page.reload({ waitUntil: "networkidle" });
        await conferirContraste();
        await page.keyboard.press("Tab");
        assert.equal(await page.locator(".skip-link").evaluate(el => document.activeElement === el), true);
        await page.keyboard.press("Enter");
        assert.equal(await page.locator("#app").evaluate(el => document.activeElement === el), true);
        const projetos = page.getByRole("link", { name: "Projetos", exact: true });
        await projetos.hover();
        assert.equal(await page.locator(".submenu-toggle").getAttribute("aria-expanded"), "true");
        await page.mouse.move(0, 0);
        await projetos.focus();
        assert.equal(await page.getByRole("link", { name: "Educação" }).isVisible(), true);
        await page.keyboard.press("Tab");
        await page.keyboard.press("Escape");
        assert.equal(await page.getByRole("link", { name: "Educação" }).isVisible(), false);
        await page.keyboard.press("Tab");
        assert.equal(await page.getByRole("link", { name: "Educação" }).isVisible(), true);
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        await page.keyboard.press("Enter");
        assert.equal(await page.locator(".submenu-toggle").getAttribute("aria-expanded"), "false");
        await page.keyboard.press("Space");
        assert.equal(await page.locator(".submenu-toggle").getAttribute("aria-expanded"), "true");
        await page.keyboard.press("Tab");
        await page.keyboard.press("Enter");
        await page.waitForSelector('#app[data-route="projetos"]');
        assert.equal(await page.locator(".project-card").count(), 3);
        assert.equal(await page.locator(".badge").count(), 3);
        await page.evaluate(() => window.marcadorSPA = "preservado");
        await page.getByRole("link", { name: "Cadastro", exact: true }).click();
        await page.waitForSelector("#cadastro-form");
        assert.equal(await page.evaluate(() => window.marcadorSPA), "preservado");
        await page.goBack();
        await page.waitForSelector(".project-card");
        await page.goForward();
        await page.waitForSelector("#cadastro-form");
        await abrir("projetos");
        const primeiroBotao = page.locator(".modal-open").first();
        await primeiroBotao.focus();
        await page.keyboard.press("Space");
        assert.equal(await page.locator("#project-modal").isVisible(), true);
        assert.equal(await page.locator(".modal-close").evaluate(el => document.activeElement === el), true);
        await page.keyboard.press("Tab");
        assert.equal(await page.locator("#project-modal a").evaluate(el => document.activeElement === el), true);
        await page.keyboard.press("Shift+Tab");
        assert.equal(await page.locator(".modal-close").evaluate(el => document.activeElement === el), true);
        await page.keyboard.press("Escape");
        assert.equal(await primeiroBotao.evaluate(el => document.activeElement === el), true);
        await page.evaluate(() => {
            document.querySelector(".modal-open").click();
            document.getElementById("project-modal").close();
            document.querySelectorAll(".modal-open")[1].click();
        });
        await page.waitForTimeout(50);
        assert.equal(await page.locator(".modal-close").evaluate(el => document.activeElement === el), true);
        await page.keyboard.press("Escape");
        await abrir("cadastro");
        const enviar = page.getByRole("button", { name: "Salvar cadastro" });
        await enviar.click();
        assert.equal(await page.locator("#form-error").isVisible(), true);
        assert.equal(await page.locator("#nome").getAttribute("aria-invalid"), "true");
        for (const [id, valor] of Object.entries({ nome: "Maria de Exemplo", email: "maria@example.org",
            cpf: "12345678901", nascimento: "2000-01-15", telefone: "21987654321", cep: "20000000",
            endereco: "Rua Exemplo, 10", cidade: "Rio de Janeiro" })) await page.locator("#" + id).fill(valor);
        await page.locator("#estado").selectOption("RJ");
        await page.locator("#voluntariado").check();
        for (const [id, valor] of [["cpf", "123.456.789-01"], ["telefone", "(21) 98765-4321"], ["cep", "20000-000"]]) {
            assert.equal(await page.locator("#" + id).inputValue(), valor);
            await page.locator("#" + id).fill("1");
            await enviar.click();
            assert.equal(await page.locator("#" + id).getAttribute("aria-invalid"), "true");
            assert.equal(await page.evaluate(() => localStorage.getItem("cadastros")), null);
            await page.locator("#" + id).fill(valor);
        }
        await page.locator("#nome").fill("   ");
        await enviar.click();
        assert.equal(await page.locator("#nome").getAttribute("aria-invalid"), "true");
        await page.locator("#nome").fill("Maria de Exemplo");
        await page.locator("#email").fill("maria@exemplo");
        await enviar.click();
        assert.equal(await page.locator("#email-error").isVisible(), true);
        await page.locator("#email").fill("maria@example.org");
        await enviar.click();
        assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem("cadastros"))), [{ participacao: "voluntariado" }]);
        assert.equal(await page.locator("#email").getAttribute("aria-invalid"), "false");
        assert.equal(await page.locator("#form-success").isVisible(), true);
        assert.equal(await page.locator("#validation-toast").isVisible(), true);
        await page.getByRole("button", { name: "Fechar notificação" }).click();
        assert.equal(await page.locator("#validation-toast").isVisible(), false);
        for (const metodo of ["getItem", "setItem"]) {
            await page.evaluate(metodo => {
                window.metodoOriginal = Storage.prototype[metodo];
                Storage.prototype[metodo] = () => { throw new Error("Falha simulada no armazenamento"); };
            }, metodo);
            await enviar.click();
            assert.equal(await page.locator("#form-success").isVisible(), false);
            assert.ok((await page.locator("#form-error").textContent()).includes("indisponível"));
            await page.evaluate(metodo => Storage.prototype[metodo] = window.metodoOriginal, metodo);
            assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("cadastros")).length), 1);
        }
        await page.reload({ waitUntil: "networkidle" });
        assert.ok((await page.locator("#storage-summary").textContent()).includes("1"));
        assert.equal(await page.locator("#nome").inputValue(), "");
        const contraste = page.getByRole("button", { name: "Alto contraste", exact: true });
        await contraste.focus();
        await page.keyboard.press("Space");
        assert.equal(await contraste.getAttribute("aria-pressed"), "true");
        await conferirContraste();
        await page.screenshot({ path: "test-results/alto-contraste.png", fullPage: true });
        await page.reload({ waitUntil: "networkidle" });
        assert.equal(await contraste.getAttribute("aria-pressed"), "true");
        for (const rota of ["inicio", "projetos", "cadastro", "inicio"]) {
            await page.evaluate(rota => location.hash = rota, rota);
            await page.waitForSelector('#app[data-route="' + rota + '"]');
        }
        await contraste.click();
        assert.equal(await contraste.getAttribute("aria-pressed"), "false");
        await page.setViewportSize({ width: 320, height: 844 });
        await abrir();
        const menu = page.locator(".menu-toggle");
        await menu.focus();
        await page.keyboard.press("Enter");
        assert.equal(await menu.getAttribute("aria-expanded"), "true");
        await page.getByRole("button", { name: "Abrir projetos" }).click();
        assert.equal(await page.getByRole("link", { name: "Educação" }).isVisible(), true);
        await page.keyboard.press("Escape");
        assert.equal(await page.locator(".submenu-toggle").getAttribute("aria-expanded"), "false");
        await page.keyboard.press("Escape");
        assert.equal(await menu.getAttribute("aria-expanded"), "false");
        await menu.click();
        await page.getByRole("link", { name: "Cadastro", exact: true }).click();
        await page.waitForSelector("#cadastro-form");
        assert.equal(await page.locator(".main-nav").isVisible(), false);
        await page.goto(base + "/#rota-inexistente", { waitUntil: "networkidle" });
        assert.equal(await page.locator("#app").getAttribute("data-route"), "inicio");
        assert.ok(page.url().endsWith("#inicio"));
        await page.evaluate(() => localStorage.setItem("cadastros", "{JSON inválido"));
        await abrir("cadastro");
        assert.ok((await page.locator("#storage-summary").textContent()).includes("0"));
        await abrir("inicio");
        await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
        await page.setViewportSize({ width: 1440, height: 900 });
        await abrir("projetos");
        await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
        await primeiroBotao.click();
        await page.screenshot({ path: "test-results/modal.png" });
        assert.deepEqual(erros, []);
        console.log("SPA, teclado, validação, armazenamento, temas e contrastes: OK; console sem erros.");
    } finally {
        await navegador.close();
    }
}
executar().catch(erro => { console.error(erro); process.exitCode = 1; });
