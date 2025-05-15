document.addEventListener('DOMContentLoaded', () => {
     const notificationIcon = document.querySelector('.notification-icon');
            const notificationsModal = document.getElementById('notifications-modal');
            const notificationsList = document.getElementById('notifications-list');
            const notificationCount = document.getElementById('notification-count');
            const closeButton = document.querySelector('.close-button');
            let notifications = [];

            notificationIcon.addEventListener('click', () => {
                notificationsModal.style.display = 'block';
                // Marcar notificações como lidas ao abrir
                notifications.forEach(notification => notification.unread = false);
                updateNotificationDisplay();
            });

            closeButton.addEventListener('click', () => {
                notificationsModal.style.display = 'none';
            });

            window.addEventListener('click', (event) => {
                if (event.target == notificationsModal) {
                    notificationsModal.style.display = 'none';
                }
            });

            function updateNotificationDisplay() {
                notificationCount.textContent = notifications.filter(n => n.unread).length;
                notificationsList.innerHTML = '';
                if (notifications.length === 0) {
                    notificationsList.innerHTML = '<div class="no-notifications">Nenhuma notificação.</div>';
                    return;
                }
                notifications.forEach(notification => {
                    const notificationItem = document.createElement('div');
                    notificationItem.classList.add('notification-item');
                    if (notification.unread) {
                        notificationItem.classList.add('unread');
                    }
                    notificationItem.textContent = notification.message;
                    notificationsList.appendChild(notificationItem);
                });
            }

            function fetchNotifications() {
                const token = localStorage.getItem('token');
                if (token) {
                    fetch('/api/notifications', { // Crie esta rota no seu servidor Flask
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.notifications) {
                            notifications = data.notifications.map(n => ({ ...n, unread: true }));
                            updateNotificationDisplay();
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao buscar notificações:', error);
                    });
                }
            }

            // Verificar notificações a cada minuto (ajuste o intervalo conforme necessário)
            setInterval(fetchNotifications, 60000);

            // Chamar a função para buscar notificações assim que a página carregar
            fetchNotifications();

            // Simulação de novas notificações (para teste)
            function addFakeNotification() {
                 const obraNome = "Nova Obra Pública";
                 notifications.unshift({
                     message: `Nova obra cadastrada: "${obraNome}".`,
                     unread: true
                 });
                 updateNotificationDisplay();
             }
             setTimeout(addFakeNotification, 5000);

            // Simulação de notificação de data final (para teste)
            function addFakeDeadlineNotification() {
                 const obraNome = "Construção da Escola Municipal";
                 const dataFinal = new Date();
                dataFinal.setDate(dataFinal.getDate() + 3);
                 notifications.unshift({
                     message: `Atenção: A data final da obra "${obraNome}" está se aproximando (${dataFinal.toLocaleDateString()}).`,
                     unread: true
                 });
                 updateNotificationDisplay();
             }
             setTimeout(addFakeDeadlineNotification, 8000);
        
});