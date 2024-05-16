const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Включение CORS для всех маршрутов
app.use(cors());

// Middleware для обработки JSON тела запроса
app.use(express.json());

// Обслуживание статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Маршрут для получения данных из data.json
app.get('/data', (req, res) => {
  const filePath = path.join(__dirname, 'data.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Ошибка при чтении файла');
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

// Маршрут для добавления нового пользователя
app.post('/data', (req, res) => {
  const newUser = req.body;
  const filePath = path.join(__dirname, 'data.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Ошибка при чтении файла');
      return;
    }
    const users = JSON.parse(data);
    const lastUser = users[users.length - 1];
    const newId = lastUser ? lastUser.id + 1 : 1;
    newUser.id = newId;
    users.push(newUser);
    fs.writeFile(filePath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        res.status(500).send('Ошибка при записи файла');
        return;
      }
      res.setHeader('Content-Type', 'application/json');
      res.send(newUser);
    });
  });
});

// Маршрут для удаления пользователя по ID
app.delete('/data/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const filePath = path.join(__dirname, 'data.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Ошибка при чтении файла');
      return;
    }
    let users = JSON.parse(data);
    const initialLength = users.length;
    users = users.filter(user => user.id !== userId);
    if (users.length === initialLength) {
      res.status(404).send({ success: false, message: 'Пользователь не найден' });
      return;
    }
    fs.writeFile(filePath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        res.status(500).send('Ошибка при записи файла');
        return;
      }
      res.setHeader('Content-Type', 'application/json');
      res.send({ success: true, users });
    });
  });
});

// Маршрут для удаления первых N пользователей
app.delete('/data/deleteFirstN/:n', (req, res) => {
  const n = parseInt(req.params.n, 10);
  const filePath = path.join(__dirname, 'data.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Ошибка при чтении файла');
      return;
    }
    let users = JSON.parse(data);
    if (n > users.length) {
      res.status(400).send({ success: false, message: 'Количество пользователей для удаления превышает общее количество пользователей' });
      return;
    }
    users = users.slice(n);
    fs.writeFile(filePath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        res.status(500).send('Ошибка при записи файла');
        return;
      }
      res.setHeader('Content-Type', 'application/json');
      res.send({ success: true, users });
    });
  });
});

// Маршрут для удаления последних N пользователей
app.delete('/data/deleteLastN/:n', (req, res) => {
  const n = parseInt(req.params.n, 10);
  const filePath = path.join(__dirname, 'data.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Ошибка при чтении файла');
      return;
    }
    let users = JSON.parse(data);
    if (n > users.length) {
      res.status(400).send({ success: false, message: 'Количество пользователей для удаления превышает общее количество пользователей' });
      return;
    }
    users = users.slice(0, users.length - n);
    fs.writeFile(filePath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        res.status(500).send('Ошибка при записи файла');
        return;
      }
      res.setHeader('Content-Type', 'application/json');
      res.send({ success: true, users });
    });
  });
});

// Маршрут для изменения данных пользователя по ID
app.patch('/data/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const updatedData = req.body;
  const filePath = path.join(__dirname, 'data.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Ошибка при чтении файла');
      return;
    }
    let users = JSON.parse(data);
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      res.status(404).send({ success: false, message: 'Пользователь не найден' });
      return;
    }
    users[userIndex] = { ...users[userIndex], ...updatedData };
    fs.writeFile(filePath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        res.status(500).send('Ошибка при записи файла');
        return;
      }
      res.setHeader('Content-Type', 'application/json');
      res.send({ success: true, users });
    });
  });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
