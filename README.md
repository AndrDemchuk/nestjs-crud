# nestjs-crud

Навчальний проєкт на [NestJS](https://nestjs.com/) з CRUD API для користувачів (users). Дані зберігаються в пам'яті (масив у сервісі), бази даних поки немає, тому після перезапуску сервера всі зміни зникають.

## Стек

- NestJS 12 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`)
- TypeScript (`strict`, ES-модулі)
- `@nestjs/mapped-types` для `PartialType` в `UpdateUserDto`
- Vitest для тестів, oxlint для лінтингу, Prettier для форматування

## Що зроблено

### Модуль `user`

| Файл | Що робить |
| --- | --- |
| [`user.module.ts`](src/user/user.module.ts) | Модуль користувачів: реєструє `UserController`, `UserService` і `LoggerService`, підключений в `AppModule` |
| [`user.controller.ts`](src/user/user.controller.ts) | REST-контролер на маршруті `/user` з усіма CRUD-ендпоінтами |
| [`user.service.ts`](src/user/user.service.ts) | Бізнес-логіка: пошук, створення, оновлення та видалення користувачів у масиві в пам'яті, інтерфейси `User` і `SuccessResponse<T>` |
| [`user.logger.ts`](src/user/user.logger.ts) | Простий `LoggerService` (обгортка над `console.log` з префіксом `[LOG]`), який впроваджується в сервіс через DI |
| [`dto/create-user.dto.ts`](src/user/dto/create-user.dto.ts) | DTO для створення користувача (`id`, `name`, `email`) |
| [`dto/update-user.dto.ts`](src/user/dto/update-user.dto.ts) | DTO для оновлення: `PartialType(CreateUserDto)`, тобто всі поля необов'язкові |

### CRUD-операції

- **Create**: `createUser` додає користувача в масив
- **Read**: `findAllUsers` повертає список з фільтром за ім'ям (без урахування регістру), `findOneUser` шукає користувача за `id`
- **Update**: `updateUser` зливає наявного користувача з DTO, `id` при цьому не змінюється
- **Delete**: `deleteUser` видаляє користувача за `id`

### Обробка помилок і валідація параметрів

- Якщо користувача не знайдено, кидається `NotFoundException`, і клієнт отримує `404`
- `:id` в маршрутах перетворюється на число через `ParseIntPipe`. Нечисловий `id` дає `400 Bad Request`
- `create` і `update` повертають відповідь у форматі `{ data, message }` (інтерфейс `SuccessResponse<T>`)

### Тести

- Unit-тести `UserController` і `UserService` перевіряють, що вони коректно створюються з усіма залежностями (`npm test`)

## API

Базова адреса: `http://localhost:3000`

| Метод | Маршрут | Опис |
| --- | --- | --- |
| `GET` | `/` | `Hello World!` |
| `GET` | `/user?name=` | Список користувачів, `name` необов'язковий фільтр |
| `GET` | `/user/name?name=` | Демо-ендпоінт із захардкодженим списком (без сервісу) |
| `GET` | `/user/:id` | Користувач за `id` або `404` |
| `POST` | `/user` | Створити користувача |
| `PUT` | `/user/:id` | Оновити користувача (часткове оновлення) або `404` |
| `DELETE` | `/user/:id` | Видалити користувача, повертає його `id`, або `404` |

Приклади:

```bash
# create
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"id": 3, "name": "Alice", "email": "alice@example.com"}'

# update
curl -X PUT http://localhost:3000/user/3 \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Smith"}'

# delete
curl -X DELETE http://localhost:3000/user/3
```

## Запуск

```bash
npm install

npm run start:dev   # режим розробки з перезапуском
npm run start       # звичайний запуск
npm run build && npm run start:prod
```

## Тести та лінтинг

```bash
npm test            # unit-тести
npm run test:e2e    # e2e-тести
npm run test:cov    # покриття
npm run lint
```

## Що ще можна покращити

- Додати валідацію тіла запиту (`class-validator` + глобальний `ValidationPipe`), зараз `POST`/`PUT` приймають будь-які поля
- Генерувати `id` на сервері, а не приймати його від клієнта (зараз можливі дублікати)
- Використати `@Patch` для часткового оновлення замість `@Put`
- Прибрати демо-ендпоінт `GET /user/name` і непотрібні перевірки після `findOneUser`
- Підключити базу даних (наприклад, PostgreSQL + TypeORM/Prisma)
