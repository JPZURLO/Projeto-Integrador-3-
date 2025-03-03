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

    // Evento de mudança no select
    userTypeElement.addEventListener("change", function () {
        console.log("Mudança detectada: ", this.value);

        registroEngenheiroContainer.style.display = this.value === "Engenheiro" ? "block" : "none";
        gestorPEPContainer.style.display = this.value === "Gestor" ? "block" : "none";
    });


    // Envio do formulário
    document.getElementById("registerForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const templateParams = {
            fullName: document.getElementById("fullName").value,
            phone: document.getElementById("phone").value,
            email: document.getElementById("email").value,
            userType: userTypeElement.value,
            registroEngenheiro: document.getElementById("registroEngenheiro")?.value || "Não informado",
            politicamenteExposto: document.getElementById("politicamenteExposto")?.value || "Não informado"
        };

        emailjs.send('service_4zwx6ua', 'template_3okfhkm', templateParams)
            .then(function(response) {
                console.log("SUCESSO:", response);
                alert("Cadastro enviado! Você será contatado em breve.");
            })
            .catch(function(error) {
                console.error("ERRO AO ENVIAR E-MAIL:", error);
                alert("Erro ao enviar o e-mail. Tente novamente.");
            });
    });
});

