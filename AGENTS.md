В задачах на новый функционал бэкенда сначала пиши тесты, затем реализацию
После реализации прогоняй бэкенд и фронтенд тесты



## Что где хранить
**TanStack Query**
- jobs list
- single job
- companies
- contacts
- tasks
- analytics data
**React Hook Form + Zod**
- job form
- company form
- contact form
- interview form
- task form
**URL state**
- search
- filters
- sort
- current view: kanban/table
**local UI state**
- modals
- drawer
- selected columns
- open/close panels




#  Что входит в v1

### 1. Авторизация

- sign up / sign in
- protected routes
- logout
### 2. Dashboard
- summary cards:
    - total jobs
    - active applications
    - interviews
    - offers
- блок overdue follow-ups
- recent activity
### 3. Jobs page
Два режима:
- **Kanban**
- **Table**
#### Kanban
Колонки:
- Wishlist
- Applied
- HR Screen
- Tech Interview
- Final Interview
- Offer
- Rejected

Функции:
- drag-and-drop карточек
- смена статуса
- быстрый просмотр основных данных

#### Table
- поиск
- фильтры
- сортировка
- пагинация
- переключение колонок
### 4. Job details page
- основная информация по вакансии
- компания
- зарплата
- ссылка
- описание
- status
- timeline изменений
- заметки
- интервью
- follow-up задачи
- контакты
### 5. Companies page
- список компаний
- количество вакансий по компании
- средний статус по воронке
- переход к вакансиям компании
### 6. Contacts page
- recruiter / hiring manager
- email
- linkedin
- company
- notes
### 7. Tasks / follow-ups
- due date
- completed / overdue
- связка с вакансией
### 8. Analytics page
- funnel: wishlist → applied → interview → offer
- response rate
- interview rate
- rejection count
- applications by source

