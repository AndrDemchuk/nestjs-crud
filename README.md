# nestjs-crud

Навчальний проєкт на [NestJS](https://nestjs.com/) з CRUD API для користувачів (users). Дані зберігаються в пам'яті (масив у сервісі), бази даних поки немає, тому після перезапуску сервера всі зміни зникають.

## Стек

- NestJS 12 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`)
- TypeScript (`strict`, ES-модулі)
- `@nestjs/mapped-types` для `PartialType` в `UpdateUserDto`
- `class-validator` + `class-transformer` для валідації DTO
- Vitest для тестів, oxlint для лінтингу, Prettier для форматування

## Що зроблено

### Модуль `user`

| Файл | Що робить |
| --- | --- |
| [`user.module.ts`](src/user/user.module.ts) | Модуль користувачів: реєструє `UserController`, `UserService` і `LoggerService`, підключений в `AppModule` |
| [`user.controller.ts`](src/user/user.controller.ts) | REST-контролер на маршруті `/user` з усіма CRUD-ендпоінтами |
| [`user.service.ts`](src/user/user.service.ts) | Бізнес-логіка: пошук, створення, оновлення та видалення користувачів у масиві в пам'яті, інтерфейси `User` і `SuccessResponse<T>` |
| [`user.logger.ts`](src/user/user.logger.ts) | Простий `LoggerService` (обгортка над `console.log` з префіксом `[LOG]`), який впроваджується в сервіс через DI і логує всі операції |
| [`dto/create-user.dto.ts`](src/user/dto/create-user.dto.ts) | DTO для створення користувача з валідацією: `name` (рядок, мінімум 3 символи), `email` (коректний email) |
| [`dto/update-user.dto.ts`](src/user/dto/update-user.dto.ts) | DTO для оновлення: `PartialType(CreateUserDto)`, тобто всі поля необов'язкові, але валідуються, якщо передані |

### CRUD-операції

- **Create**: `createUser` генерує `id` на сервері й додає користувача в масив
- **Read**: `findAllUsers` повертає список з фільтром за ім'ям (без урахування регістру), `findOneUser` шукає користувача за `id`
- **Update**: `updateUser` зливає наявного користувача з DTO, `id` при цьому не змінюється
- **Delete**: `deleteUser` видаляє користувача за `id` (тільки для адміна)

### Middleware, guard, pipe, interceptor

| Що | Файл | Що робить |
| --- | --- | --- |
| Middleware | [`middleware/api-key.middleware.ts`](src/middleware/api-key.middleware.ts) | `ApiKeyMiddleware` перевіряє заголовок `x-api-key` для всіх маршрутів `UserController`. Неправильний ключ дає `401`. Підключений в `AppModule.configure()` |
| Guard | [`guards/role.guard.ts`](src/guards/role.guard.ts) | `RoleGuard` пропускає запит лише із заголовком `role: admin`, інакше `401`. Стоїть на `DELETE /user/:id` через `@UseGuards` |
| Pipe | [`main.ts`](src/main.ts) | Глобальний `ValidationPipe` перевіряє тіло запиту за декораторами `class-validator` у DTO. Невалідні дані дають `400` |
| Interceptor | [`utils/transform.interceptor.ts`](src/utils/transform.interceptor.ts) | Глобальний `TransformInterceptor` обгортає кожну успішну відповідь у формат `{ statusCode, data, message }` |

### Обробка помилок

- Якщо користувача не знайдено, кидається `NotFoundException`, і клієнт отримує `404`
- `:id` в маршрутах перетворюється на число через `ParseIntPipe`. Нечисловий `id` дає `400 Bad Request`

### Тести

- Unit-тести (`npm test`) перевіряють, що `UserController`, `UserService`, `RoleGuard`, `ApiKeyMiddleware` і `TransformInterceptor` коректно створюються

## API

Базова адреса: `http://localhost:3000`

Для всіх маршрутів `/user` потрібен заголовок `x-api-key: secret-key-123`. Для `DELETE` потрібен ще й `role: admin`.

| Метод | Маршрут | Опис |
| --- | --- | --- |
| `GET` | `/` | `Hello World!` |
| `GET` | `/user?name=` | Список користувачів, `name` необов'язковий фільтр |
| `GET` | `/user/name?name=` | Демо-ендпоінт із захардкодженим списком (без сервісу) |
| `GET` | `/user/:id` | Користувач за `id` або `404` |
| `POST` | `/user` | Створити користувача |
| `PUT` | `/user/:id` | Оновити користувача (часткове оновлення) або `404` |
| `DELETE` | `/user/:id` | Видалити користувача (тільки `role: admin`), повертає його `id`, або `404` |

Приклади:

```bash
# create
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -H "x-api-key: secret-key-123" \
  -d '{"name": "Alice", "email": "alice@example.com"}'

# update
curl -X PUT http://localhost:3000/user/3 \
  -H "Content-Type: application/json" \
  -H "x-api-key: secret-key-123" \
  -d '{"name": "Alice Smith"}'

# delete (admin only)
curl -X DELETE http://localhost:3000/user/3 \
  -H "x-api-key: secret-key-123" \
  -H "role: admin"
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

- Винести API-ключ у змінні оточення (`.env` + `@nestjs/config`) замість хардкоду в middleware
- Брати роль з перевіреного токена (JWT), а не з заголовка, і віддавати `403 Forbidden` замість `401` при недостатніх правах
- Додати `whitelist: true` у `ValidationPipe`, щоб відкидати зайві поля в тілі запиту
- Генерувати `id` як `max(id) + 1`: зараз `length + 1` після видалення може дати дублікат
- Використати `@Patch` для часткового оновлення замість `@Put`
- Прибрати демо-ендпоінт `GET /user/name` і непотрібні перевірки після `findOneUser`
- Підключити базу даних (наприклад, PostgreSQL + TypeORM/Prisma)
