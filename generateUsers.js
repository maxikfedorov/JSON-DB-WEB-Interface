const Chance = require('chance');
const fs = require('fs');

const chance = new Chance();

function generateUsers(startId, count) {
    const users = [];
    for (let i = 0; i < count; i++) {
        const user = {
            id: startId + i,
            name: chance.name(),
            age: chance.age({ type: 'adult' }),
            city: chance.city()
        };
        users.push(user);
    }
    return users;
}

const userCount = parseInt(process.argv[2], 10) || 20; // Количество пользователей можно передать как аргумент командной строки

// Чтение существующего файла data.json
let existingUsers = [];
try {
    const data = fs.readFileSync('data.json', 'utf-8');
    existingUsers = JSON.parse(data);
} catch (err) {
    console.log('Файл data.json не найден или пуст, создаем новый файл.');
}

// Определение последнего ID
const lastId = existingUsers.length > 0 ? existingUsers[existingUsers.length - 1].id : 0;

// Генерация новых пользователей
const newUsers = generateUsers(lastId + 1, userCount);

// Объединение существующих и новых пользователей
const allUsers = existingUsers.concat(newUsers);

// Запись всех пользователей в файл data.json
fs.writeFileSync('data.json', JSON.stringify(allUsers, null, 2), 'utf-8');
console.log(`Generated ${userCount} users and saved to data.json`);
