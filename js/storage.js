export function lerCadastros(exigirLeitura = false) {
    let conteudo;
    try {
        conteudo = localStorage.getItem("cadastros");
    } catch (erro) {
        // A consulta pode falhar sem impedir a navegação, mas não a gravação.
        if (exigirLeitura) throw erro;
        return [];
    }
    try {
        const dados = JSON.parse(conteudo) || [];
        if (!Array.isArray(dados)) return [];
        return dados
            .filter(item => item && ["voluntariado", "doacao"].includes(item.participacao))
            .map(item => ({ participacao: item.participacao }));
    } catch {
        // JSON corrompido é tratado como uma lista vazia.
        return [];
    }
}

export function salvarCadastro(participacao) {
    if (!["voluntariado", "doacao"].includes(participacao)) {
        throw new Error("Forma de participação inválida.");
    }
    const dados = lerCadastros(true);
    // Somente a escolha de participação é persistida, sem dados pessoais.
    dados.push({ participacao });
    localStorage.setItem("cadastros", JSON.stringify(dados));
    return dados.length;
}

export function lerAltoContraste() {
    try {
        return localStorage.getItem("alto-contraste") === "true";
    } catch {
        return false;
    }
}

export function salvarAltoContraste(ativo) {
    localStorage.setItem("alto-contraste", String(ativo));
}
