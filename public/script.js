document.addEventListener("DOMContentLoaded", function() {
    let usersData = [];
    let isInverted = false;
    const history = [];

    // Функция для отображения пользователей
    function displayUsers(users) {
        const peopleContainer = document.getElementById('people');
        peopleContainer.innerHTML = '';
        users.forEach(person => {
            const personDiv = document.createElement('div');
            personDiv.className = 'person';
            personDiv.innerHTML = `
                <h2>${person.name}</h2>
                <p>ID: ${person.id}</p>
                <p>Возраст: ${person.age}</p>
                <p>Город: ${person.city}</p>
            `;
            peopleContainer.appendChild(personDiv);
        });
    }

    // Функция для обновления истории изменений
    function updateHistory(action) {
        history.push(action);
    }

    // Загрузка данных пользователей
    fetch('http://localhost:3000/data')
        .then(response => response.json())
        .then(data => {
            usersData = data;
            // Явная сортировка данных по возрастанию ID при загрузке
            usersData.sort((a, b) => a.id - b.id);
            displayUsers(usersData);
            // Установка начального состояния кнопки сортировки
            const sortButton = document.getElementById('sortButton');
            sortButton.setAttribute('data-sort', 'asc');
            sortButton.textContent = 'Сортировать по id ▲';
        })
        .catch(error => console.error('Ошибка загрузки данных:', error));

    // Обработка формы добавления пользователя
    const addUserForm = document.getElementById('addUserForm');
    addUserForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const age = document.getElementById('age').value;
        const city = document.getElementById('city').value;

        const newUser = { name, age, city };

        fetch('http://localhost:3000/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        })
        .then(response => response.json())
        .then(data => {
            usersData.push(data);
            displayUsers(usersData);
            updateHistory(`Добавлен новый пользователь ${data.name}`);
            addUserForm.reset();
        })
        .catch(error => console.error('Ошибка добавления пользователя:', error));
    });

    // Обработка формы удаления пользователя
    const deleteUserForm = document.getElementById('deleteUserForm');
    deleteUserForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const id = document.getElementById('deleteId').value;

        fetch(`http://localhost:3000/data/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                usersData = data.users;
                displayUsers(usersData);
                updateHistory(`Удалён пользователь id=${id}`);
                deleteUserForm.reset();
            } else {
                console.error('Ошибка удаления пользователя:', data.message);
            }
        })
        .catch(error => console.error('Ошибка удаления пользователя:', error));
    });

    // Обработка формы удаления первых N пользователей
    const deleteFirstNForm = document.getElementById('deleteFirstNForm');
    deleteFirstNForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const n = parseInt(document.getElementById('deleteFirstN').value, 10);
        if (n < 0) {
            alert('Число N должно быть не меньше 0');
            return;
        }

        fetch(`http://localhost:3000/data/deleteFirstN/${n}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                usersData = data.users;
                displayUsers(usersData);
                updateHistory(`Удалены первые ${n} пользователей`);
                deleteFirstNForm.reset();
            } else {
                console.error('Ошибка удаления пользователей:', data.message);
            }
        })
        .catch(error => console.error('Ошибка удаления пользователей:', error));
    });

    // Обработка формы удаления последних N пользователей
    const deleteLastNForm = document.getElementById('deleteLastNForm');
    deleteLastNForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const n = parseInt(document.getElementById('deleteLastN').value, 10);
        if (n < 0) {
            alert('Число N должно быть не меньше 0');
            return;
        }

        fetch(`http://localhost:3000/data/deleteLastN/${n}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                usersData = data.users;
                displayUsers(usersData);
                updateHistory(`Удалены последние ${n} пользователей`);
                deleteLastNForm.reset();
            } else {
                console.error('Ошибка удаления пользователей:', data.message);
            }
        })
        .catch(error => console.error('Ошибка удаления пользователей:', error));
    });

    // Обработка формы изменения данных пользователя
    const updateUserForm = document.getElementById('updateUserForm');
    updateUserForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const id = document.getElementById('updateId').value;
        const name = document.getElementById('updateName').value;
        const age = document.getElementById('updateAge').value;
        const city = document.getElementById('updateCity').value;

        const updatedUser = {};
        if (name) updatedUser.name = name;
        if (age) updatedUser.age = age;
        if (city) updatedUser.city = city;

        fetch(`http://localhost:3000/data/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedUser)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                usersData = data.users;
                displayUsers(usersData);
                updateHistory(`Изменён пользователь id=${id}`);
                updateUserForm.reset();
            } else {
                console.error('Ошибка изменения данных пользователя:', data.message);
            }
        })
        .catch(error => console.error('Ошибка изменения данных пользователя:', error));
    });

    // Обработка ползунка для изменения количества пользователей в ряду
    const columnsInput = document.getElementById('columns');
    const columnsValue = document.getElementById('columnsValue');
    columnsInput.addEventListener('input', function(event) {
        const columns = event.target.value;
        columnsValue.textContent = columns;
        const peopleContainer = document.getElementById('people');
        peopleContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

        // Изменение размера карточек и шрифта в зависимости от количества колонок
        const personElements = document.querySelectorAll('.person');
        personElements.forEach(person => {
            const personTitle = person.querySelector('h2');
            if (columns > 3) {
                person.style.padding = '0.5em';
                personTitle.style.fontSize = '0.875em'; // 14px в em
                personTitle.style.fontWeight = 'normal';
            } else {
                person.style.padding = '1em';
                personTitle.style.fontSize = '1.5em'; // 16px в em
                personTitle.style.fontWeight = 'bold';
            }
        });
    });

    // Обработка кнопки сортировки по ID
    const sortButton = document.getElementById('sortButton');
    sortButton.addEventListener('click', function() {
        const sortOrder = sortButton.getAttribute('data-sort');
        if (sortOrder === 'asc') {
            usersData.sort((a, b) => b.id - a.id);
            sortButton.setAttribute('data-sort', 'desc');
            sortButton.textContent = 'Сортировать по id ▼';
        } else {
            usersData.sort((a, b) => a.id - b.id);
            sortButton.setAttribute('data-sort', 'asc');
            sortButton.textContent = 'Сортировать по id ▲';
        }
        displayUsers(usersData);
    });

    // Обработка строки поиска
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function(event) {
        const searchTerm = event.target.value.toLowerCase();
        const filteredUsers = usersData.filter(user => user.name.toLowerCase().includes(searchTerm));
        displayUsers(filteredUsers);
    });

    // Обработка кнопки истории изменений
    const historyButton = document.getElementById('historyButton');
    const historyModal = document.getElementById('historyModal');
    const historyList = document.getElementById('historyList');
    const closeModal = historyModal.querySelector('.close');

    historyButton.addEventListener('click', function() {
        historyList.innerHTML = '';
        history.forEach(action => {
            const listItem = document.createElement('li');
            listItem.textContent = action;
            historyList.appendChild(listItem);
        });
        historyModal.style.display = 'block';
    });

    closeModal.addEventListener('click', function() {
        historyModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === historyModal) {
            historyModal.style.display = 'none';
        }
    });

    // Обработка кнопки дополнительных опций удаления
    const additionalOptionsButton = document.getElementById('additionalOptionsButton');
    const additionalOptionsModal = document.getElementById('additionalOptionsModal');
    const closeAdditionalOptionsModal = additionalOptionsModal.querySelector('.close');

    additionalOptionsButton.addEventListener('click', function() {
        additionalOptionsModal.style.display = 'block';
    });

    closeAdditionalOptionsModal.addEventListener('click', function() {
        additionalOptionsModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === additionalOptionsModal) {
            additionalOptionsModal.style.display = 'none';
        }
    });
});
