document.addEventListener("DOMContentLoaded", function () {
    emailjs.init("Nzp2eeuZSm4kHgvaU");

    document.getElementById("registerForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const templateParams = {
            fullName: document.getElementById("fullName").value,
            phone: document.getElementById("phone").value,
            email: document.getElementById("email").value,
            userType: document.getElementById("userType").value,
            registroEng: document.getElementById("registroEngenheiro")?.value || "Não informado",
            politicamenteExposto: document.getElementById("politicamenteExposto")?.value || "Não informado"
        };

        emailjs.send("service_4zwx6ua", "template_3okfhkm", templateParams)
            .then(response => {
                console.log("SUCESSO:", response);
                alert("Cadastro enviado! Você será contatado em breve.");
            })
            .catch(error => {
                console.error("ERRO AO ENVIAR EMAIL:", error);
                alert("Erro ao enviar o e-mail. Tente novamente.");
            });
    });
});
