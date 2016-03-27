# books

инициализация
```javascript
bower install
npm install
```
---
Папки проекта

**app/** - приложение
**public/** - сборка приложения 

---
Текущая настройка окружения в файле **.env**

Инициализация dotenv окружения через npm

```javascript
npm run env:dev
npm run env:prod
```
---
Сборка

файлы из папки app обрабатываются препроцессорами и помещаются в public
```javascript
npm run build
```
---
Старт сервера и ватчеров (browser-sync)
```javascript
npm start
```
