const btnlogin = document.getElementById("logintop");
const secaoLoja = document.getElementById("abloja");
const secaoLogin = document.getElementById("pglog");
const secaoAdm = document.getElementById("pgadm");
const btnlogar = document.getElementById("botaodelogarusu");
const btnabausu = document.getElementById("usutop");
const banner = document.getElementById("blban");
const botoesEstoque = document.querySelectorAll(".btnestq");
let clico = false;

function mostrarSecao(id) {
    const secoes = [secaoLoja, secaoLogin, secaoAdm];

    secoes.forEach((secao) => {
        secao.style.display = secao.id === id ? "block" : "none";
    });

    banner.style.display = id === "abloja" ? "block" : "none";
}

if (btnlogin) {
    btnlogin.addEventListener("click", (event) => {
        event.preventDefault();

        if (clico) {
            const sair = confirm("Deseja sair da sessão?");
            if (sair) {
                clico = false;
                mostrarSecao("abloja");
                btnlogin.textContent = "Login";
            }
            return;
        }
        mostrarSecao("pglog");
    });
}

if (btnabausu) {
    btnabausu.addEventListener("click", (event) => {
        event.preventDefault();
        mostrarSecao("abloja");
    });
}

if (btnlogar) {
    btnlogar.addEventListener("click", logar);
}

function normalizarTexto(texto) {
    return (texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

function encontrarCardPorNome(nomeProduto) {
    const nomeNormalizado = normalizarTexto(nomeProduto);

    return [...document.querySelectorAll(".flor")].find((card) => {
        const titulo = card.querySelector(".titflor")?.textContent.trim();
        return normalizarTexto(titulo) === nomeNormalizado;
    });
}

function getProdutoDoBotao(botao) {
    const botoes = [...document.querySelectorAll(".btnestq")];
    const nomesAdm = [...document.querySelectorAll(".nomedasfloradm")];
    const inputsPreco = [...document.querySelectorAll("input[placeholder='Digite o preço do produto']")];
    const inputsEstoque = [...document.querySelectorAll("input[placeholder='Digite a quantidade em estoque']")];
    const indice = botoes.indexOf(botao);

    return {
        nomeProduto: nomesAdm[indice]?.textContent.trim(),
        inputPreco: inputsPreco[indice],
        inputEstoque: inputsEstoque[indice]
    };
}

function definirStatusEstoque(valor) {
    const numero = Number(valor);

    if (valor === "" || Number.isNaN(numero)) {
        return "Sem valor";
    }

    if (numero === 0) {
        return "Esgotado";
    }

    if (numero <= 5) {
        return "Poucas unidades";
    }

    return "Em estoque";
}

function atualizarStatusEstoque(inputEstoque) {
    if (!inputEstoque) return;

    const status = inputEstoque.parentElement?.querySelector(".status-estoque");
    if (!status) return;

    status.textContent = definirStatusEstoque(inputEstoque.value);

    if (inputEstoque.value === "0") {
        status.classList.add("status-esgotado");
        status.classList.remove("status-poucas", "status-normal");
    } else if (Number(inputEstoque.value) <= 5 && Number(inputEstoque.value) > 0) {
        status.classList.add("status-poucas");
        status.classList.remove("status-esgotado", "status-normal");
    } else {
        status.classList.add("status-normal");
        status.classList.remove("status-esgotado", "status-poucas");
    }
}

function criarIndicadorEstoque() {
    const inputsEstoque = document.querySelectorAll("input[placeholder='Digite a quantidade em estoque']");

    inputsEstoque.forEach((input) => {
        if (input.parentElement?.classList.contains("campo-estoque")) {
            atualizarStatusEstoque(input);
            return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "campo-estoque";

        const status = document.createElement("span");
        status.className = "status-estoque status-normal";

        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        wrapper.appendChild(status);
        atualizarStatusEstoque(input);
    });
}

function preencherPrecosPadrao() {
    const nomesAdm = [...document.querySelectorAll(".nomedasfloradm")];
    const inputsPreco = [...document.querySelectorAll("input[placeholder='Digite o preço do produto']")];

    nomesAdm.forEach((nomeEl, indice) => {
        const nomeProduto = nomeEl.textContent.trim();
        const inputPreco = inputsPreco[indice];

        if (!nomeProduto || !inputPreco) return;

        const card = encontrarCardPorNome(nomeProduto);
        const valorAtual = card?.querySelector(".precoflor")?.textContent.trim() || "";
        inputPreco.value = valorAtual.replace("R$", "").trim();
    });
}

function preencherEstoquesPadrao() {
    const nomesAdm = [...document.querySelectorAll(".nomedasfloradm")];
    const inputsEstoque = [...document.querySelectorAll("input[placeholder='Digite a quantidade em estoque']")];

    nomesAdm.forEach((nomeEl, indice) => {
        const nomeProduto = nomeEl.textContent.trim();
        const inputEstoque = inputsEstoque[indice];

        if (!nomeProduto || !inputEstoque) return;

        const card = encontrarCardPorNome(nomeProduto);
        const valorAtual = card?.querySelector(".qtdestoq")?.textContent.trim() || "0";
        inputEstoque.value = valorAtual;
        atualizarStatusEstoque(inputEstoque);
    });
}

botoesEstoque.forEach((botao) => {
    botao.type = "button";

    botao.addEventListener("click", (event) => {
        event.preventDefault();

        const { nomeProduto, inputPreco, inputEstoque } = getProdutoDoBotao(botao);
        const novoPreco = inputPreco?.value.trim();
        const novaQuantidade = inputEstoque?.value.trim();

        if (!nomeProduto) {
            alert("Produto não encontrado.");
            return;
        }

        const card = encontrarCardPorNome(nomeProduto);

        if (!card) {
            alert("Produto não encontrado na loja.");
            return;
        }

        if (novoPreco) {
            const precoLoja = card.querySelector(".precoflor");
            if (precoLoja) {
                precoLoja.textContent = `R$${novoPreco}`;
                inputPreco.value = novoPreco;
            }
        }

        if (novaQuantidade) {
            const qtdLoja = card.querySelector(".qtdestoq");
            if (qtdLoja) {
                qtdLoja.textContent = novaQuantidade;
                inputEstoque.value = novaQuantidade;
                atualizarStatusEstoque(inputEstoque);
            }
        }

        if (!novoPreco && !novaQuantidade) {
            alert("Digite um preço ou quantidade antes de alterar.");
            return;
        }

        alert(`Produto ${nomeProduto} atualizado com sucesso.`);
    });
});

window.addEventListener("DOMContentLoaded", () => {
    criarIndicadorEstoque();
    preencherPrecosPadrao();
    preencherEstoquesPadrao();
    document.querySelectorAll("input[placeholder='Digite a quantidade em estoque']").forEach((input) => {
        input.addEventListener("input", () => atualizarStatusEstoque(input));
    });
});




function logar() {
    const email = document.getElementById("email/nome");
    const senha = document.getElementById("senha");

    if (email.value == "moises" &&
        senha.value == "adm1234") {
        mostrarSecao("pgadm");
        email.value = "";
        senha.value = "";
        btnlogin.textContent = "Moises";
        clico = true;
    } else {
        alert("bota a senha certa");
        mostrarSecao("pglog");
    }
}

