document.addEventListener("DOMContentLoaded", function () {
    emailjs.init("Lpxz9l1GXQuO_swT3");  // Inicializa o EmailJS com o seu user_id.

    // Lida com a mudança no tipo de usuário e exibe os campos apropriados
    document.getElementById("userType").addEventListener("change", function () {
        const userType = this.value;

        // Mostrar/ocultar campo de número de registro
        if (userType === "Engenheiro") {
            document.getElementById("registroEngenheiroContainer").style.display = "block";
        } else {
            document.getElementById("registroEngenheiroContainer").style.display = "none";
        }

        // Mostrar/ocultar campo de "Politicamente Exposto?"
        if (userType === "Gestor") {
            document.getElementById("gestorPEPContainer").style.display = "block";
        } else {
            document.getElementById("gestorPEPContainer").style.display = "none";
        }
    });

    // Envio do formulário
    document.getElementById("registerForm").addEventListener("submit", function (event) {
        event.preventDefault();  // Impede o envio do formulário padrão

        const templateParams = {
            fullName: document.getElementById("fullName").value,
            phone: document.getElementById("phone").value,
            email: document.getElementById("email").value,
            userType: document.getElementById("userType").value,
            registroEngenheiro: document.getElementById("registroEngenheiro")?.value || "Não informado", // Corrigido
            politicamenteExposto: document.getElementById("politicamenteExposto")?.value || "Não informado"
        };
        
        // Envio do e-mail usando o EmailJS
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

