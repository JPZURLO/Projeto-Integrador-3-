let obras = [
    { img: "obra1.jpg", desc: "Descrição da Obra 1" },
    { img: "obra2.jpg", desc: "Descrição da Obra 2" },
    { img: "obra3.jpg", desc: "Descrição da Obra 3" },
    { img: "obra4.jpg", desc: "Descrição da Obra 4" },
    { img: "obra5.jpg", desc: "Descrição da Obra 5" },
    { img: "obra6.jpg", desc: "Descrição da Obra 6" }
];
let index = 0;

function carregarObras() {
    let container = document.getElementById("obrasRecentes");
    container.innerHTML = "";
    for (let i = index; i < index + 3 && i < obras.length; i++) {
        let obraDiv = document.createElement("div");
        obraDiv.classList.add("obra");
        obraDiv.innerHTML = `<img src="${obras[i].img}" alt="Obra"><p>${obras[i].desc}</p>`;
        container.appendChild(obraDiv);
    }
    document.getElementById("prevBtn").disabled = index === 0;
    document.getElementById("nextBtn").disabled = index + 3 >= obras.length;
}

function mudarObras(direcao) {
    index += direcao * 3;
    carregarObras();
}

carregarObras();