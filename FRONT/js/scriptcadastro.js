document.addEventListener("DOMContentLoaded", function () {
    const userTypeElement = document.getElementById("userType");
    const registroEngenheiroContainer = document.getElementById("registroEngenheiroContainer");
    const gestorPEPContainer = document.getElementById("gestorPEPContainer");

    if (!userTypeElement) {
        console.error("Elemento #userType não encontrado!");
        return;
    }

    // Esconde os campos ao iniciar
    registroEngenheiroContainer.style.display = "none";
    gestorPEPContainer.style.display = "none";

    // Exibe os campos corretos conforme o tipo selecionado
    userTypeElement.addEventListener("change", function () {
        registroEngenheiroContainer.style.display = this.value === "Engenheiro" ? "block" : "none";
        gestorPEPContainer.style.display = this.value === "Gestor" ? "block" : "none";
    });

    // Nenhum código de envio via JS é necessário com o Formspree
});
