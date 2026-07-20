# VANILLATO ERP

> Project Guide — Part 1
>
> Version: 1.0
>
> This document exists to provide the complete context of the project to any AI agent (Codex) or developer contributing to the project. The goal is to centralize architectural decisions, development philosophy, coding standards and project objectives.
>
> This document should always be considered the source of truth. Whenever there is a conflict between generated code and this document, this document takes precedence.

---

# 1. Project Overview

Vanillato ERP is an internal Enterprise Resource Planning (ERP) system developed exclusively for the confectionery business **Vanillato**.

Unlike generic ERPs, this project is designed specifically around the company's workflow and therefore prioritizes simplicity, maintainability, consistency and an excellent user experience over feature quantity.

The system is intended for desktop usage.

There is no intention, at least initially, to support mobile-first layouts.

The application should feel fast, elegant and professional while remaining extremely simple to use.

The objective is to replace spreadsheets and manual processes with an organized and centralized application.

The ERP is not intended to become a marketplace, social platform or multi-company SaaS.

Everything belongs to a single company.

---

# 2. Business Model

This ERP manages only one business.

Business Name:

> Vanillato

Every administrator works inside the same company.

There are no organizations.

There are no workspaces.

There are no teams.

There is no tenant separation.

There is no concept of ownership over records.

All administrators share exactly the same database.

Therefore:

If Administrator A creates a customer...

Administrator B must be able to:

- View
- Edit
- Delete

Exactly as if he had created it.

The only reason the creator of a record is stored is for audit purposes.

Never use the creator relation to restrict permissions.

---

# 3. Project Philosophy

The project follows a few important principles.

## Simplicity First

Never introduce unnecessary complexity.

Prefer readable code over clever code.

If there are two solutions with similar performance:

Choose the easiest one to understand.

---

## Explicit Code

Avoid magic.

Avoid hidden behaviors.

Prefer explicit naming.

Prefer descriptive methods.

Bad:

```ts
save()
```

Good:

```ts
createCustomer()
```

---

## Readability

Code is written for humans.

Future maintainability is much more important than writing fewer lines.

Never sacrifice readability.

---

## Consistency

The entire application must feel like it was written by one developer.

Naming conventions.

Folder organization.

Patterns.

Everything should remain consistent.

---

## Single Responsibility

Every module should have one clear responsibility.

Avoid God Components.

Avoid God Services.

Avoid utility files with hundreds of unrelated functions.

---

# 4. Project Architecture

This project does NOT have a separated backend.

Everything runs inside Next.js.

Architecture:

```text
Browser

↓

Next.js

↓

Server Components
Server Actions

↓

Prisma ORM

↓

PostgreSQL
```

There is no Express.

There is no NestJS.

There is no Fastify.

There is no REST API layer.

There is no GraphQL.

The application uses the App Router.

Server Actions are responsible for mutating data.

Server Components are preferred whenever possible.

Client Components should only exist when interactivity is required.

---

# 5. Technology Stack

Core:

- Next.js (App Router)
- React
- TypeScript

Database:

- PostgreSQL
- Prisma ORM

Styling:

- Tailwind CSS
- Shadcn UI

Icons:

- Lucide React

Forms:

- React Hook Form
- Zod

Utilities:

- tailwind-merge
- clsx
- class-variance-authority

Notifications:

- Sonner

Package Manager:

- pnpm

Containerization:

- Docker

Linting:

- ESLint

Formatting:

- Prettier

---

# 6. UI Philosophy

The interface should communicate:

Professionalism.

Elegance.

Minimalism.

Clean design.

The user should never feel overwhelmed.

Avoid visual noise.

Avoid excessive borders.

Avoid exaggerated shadows.

Avoid excessive colors.

Everything should have breathing room.

Use spacing intentionally.

---

# 7. Visual Identity

The visual identity is based on the Vanillato brand.

The attached logos are the official brand assets.

Two versions exist:

- Rounded logo
- Square logo

Use whichever fits better depending on the available space.

---

# 8. Color Palette

The interface should primarily follow a dark theme.

However, the application should preserve Vanillato's visual identity.

The brand colors must appear naturally throughout the interface.

Primary inspiration:

Background:

Near black.

Dark chocolate.

Dark coffee.

Surface colors:

Dark gray.

Warm dark tones.

Primary accent:

Golden.

Secondary accents:

Cream.

Vanilla.

Subtle green.

Subtle red.

These colors already exist inside the logo and should inspire the entire interface.

Avoid saturated colors.

Avoid neon colors.

Avoid material-design style colorful interfaces.

The application should look elegant.

---

# 9. Visual Style

Think about products like:

Linear

Raycast

Vercel Dashboard

GitHub

Stripe Dashboard

Not by copying them.

But by understanding their design philosophy.

Characteristics:

Large spacing.

Rounded corners.

Few borders.

Simple typography.

Subtle hover animations.

Soft transitions.

Little visual noise.

Professional feeling.

---

# 10. Header

The application should contain a global header.

The header is always visible after authentication.

Responsibilities:

Display the Vanillato logo.

Display navigation.

Display authenticated user.

Display logout button.

The logo should reinforce the business identity.

It is recommended to use the square logo inside the header.

The rounded logo can be used in empty states, login page or branding sections.

---

# 11. Layout

The application should always have a consistent layout.

Basic structure:

```text
+------------------------------------------+
| Header                                   |
+------------------------------------------+

| Sidebar | Main Content                   |
|         |                                |
|         |                                |
|         |                                |
|         |                                |
|         |                                |
+------------------------------------------+
```

Future pages must reuse this layout.

Avoid recreating layouts.

---

# 12. Typography

Typography should be simple.

Readable.

Modern.

Avoid decorative fonts.

Hierarchy should be achieved using:

Weight.

Spacing.

Size.

Not colors.

---

# 13. Components

The entire UI should be built using Shadcn UI whenever possible.

Never reinvent components that already exist.

Examples:

Button

Dialog

Dropdown Menu

Popover

Tooltip

Toast

Card

Input

Textarea

Badge

Select

Checkbox

Switch

Command

Sheet

Alert Dialog

Table

Skeleton

Pagination

Etc.

Whenever Shadcn already provides a solution:

Use it.

Only customize styling.

---

# 14. Tailwind Philosophy

Tailwind is the only styling solution.

Do not introduce:

Styled Components

Emotion

CSS Modules

SASS

LESS

Styled JSX

Avoid inline styles.

Utility classes should be preferred.

When utility repetition becomes excessive:

Extract components.

---

# 15. Component Design

Components should be reusable.

Avoid page-specific implementations whenever possible.

Example:

Bad

CustomerCreateButton

CustomerEditButton

CustomerDeleteButton

Good

PrimaryButton

DangerButton

ConfirmDialog

EntityTable

SearchInput

StatusBadge

These generic components can later be reused everywhere.

---

# 16. Icons

Only use Lucide React.

Never mix icon libraries.

Icons should be minimal.

Do not decorate interfaces with icons unnecessarily.

Icons should communicate information.

Not decoration.

---

# 17. Animations

Animations should exist.

But should be subtle.

Preferred:

Opacity

Transform

Scale

Translate

Duration:

150ms–250ms

Avoid long animations.

Avoid bouncing animations.

Avoid distracting transitions.

---

# 18. Accessibility

Always prioritize accessibility.

Buttons must be buttons.

Links must be links.

Labels must exist.

Keyboard navigation should work.

Focus rings should remain visible.

ARIA attributes should be added whenever necessary.

Never sacrifice accessibility for aesthetics.

---

# 19. Responsiveness

Desktop is the priority.

Tablet support is welcome.

Mobile is not the current priority.

However, avoid creating layouts that completely break on smaller screens.

---

# 20. General Development Rules

Every decision should prioritize:

Maintainability.

Consistency.

Readability.

Scalability.

Developer Experience.

Never generate code simply because it works.

Generate code that another experienced developer would enjoy maintaining years later.

This project should always look like a carefully crafted professional application rather than a rapidly assembled prototype.

# VANILLATO ERP

> Project Guide — Part 2
>
> Architecture, Development Standards, Code Organization and Engineering Guidelines.

---

# 21. General Architecture

The project must follow a feature-oriented architecture while maintaining a centralized folder organization.

The architecture should prioritize:

- Low coupling
- High cohesion
- Readability
- Scalability
- Easy maintenance

Although this project is relatively small, the codebase should be written as if it were expected to grow for years.

Every folder must have a clear responsibility.

Never mix unrelated concerns.

---

# 22. Current Folder Structure

The current project already contains an initial structure that should be preserved.

```
src
│
├── actions
├── app
├── assets
├── components
├── http
├── lib
├── pages
├── styles
├── utils
└── @types
```

This organization is intentional.

New code should respect this structure.

---

# 23. Barrel Export Pattern

Whenever a folder exports modules, it must also contain an `index.ts`.

Example:

```
components/

Button/
    button.tsx
    button.styles.ts
    index.ts
```

index.ts

```ts
export * from './button'
```

Never import files directly when an index already exists.

Correct:

```ts
import { Button } from '@/components/button'
```

Avoid:

```ts
import { Button } from '@/components/button/button'
```

This rule applies to every folder that exports reusable modules.

---

# 24. Components

Components should be highly reusable.

Avoid components tightly coupled to business rules.

Bad

```
CustomerCreateCard
```

Good

```
Card
FormCard
EntityTable
ConfirmDialog
SearchInput
```

Business logic belongs elsewhere.

Components should focus on presentation.

---

# 25. Server Actions

The project uses Next.js Server Actions.

Every database mutation must happen through Actions.

Examples:

```
createCustomer

updateCustomer

deleteCustomer

createProduct

updateProduct

deleteProduct

createPackage

updatePackage

deletePackage
```

Do not create generic actions.

Bad

```
saveCustomer()
```

Good

```
createCustomer()

updateCustomer()

deleteCustomer()
```

Every action should have one responsibility.

---

# 26. Organization of Actions

Organize actions by entity.

```
actions/

customer/
    create-customer.ts
    update-customer.ts
    delete-customer.ts
    index.ts

product/
package/
order/
category/
```

Avoid putting every action inside one folder.

---

# 27. HTTP Folder

The project already contains an `http` folder.

This folder exists to centralize external HTTP requests.

Examples:

- CEP lookup
- External APIs
- IBGE
- ViaCEP
- Payment APIs
- Future integrations

Never place database access here.

Prisma is not HTTP.

---

# 28. Prisma

Prisma is the only database access layer.

Never use raw SQL unless absolutely necessary.

Always prefer Prisma Client.

All queries should be centralized.

Whenever a query becomes reused multiple times, extract helper functions.

---

# 29. Lib Folder

The lib folder stores project libraries and shared configurations.

Examples:

```
prisma.ts

auth.ts

env.ts

cn.ts

date.ts

currency.ts
```

Do not place business logic inside lib.

---

# 30. Utils Folder

Utils contain only pure utility functions.

Examples:

Currency formatting.

CPF formatting.

Phone formatting.

Mask helpers.

Date helpers.

Slug generation.

Never place database access.

Never place React Hooks.

Never place business rules.

---

# 31. Types

The @types folder centralizes reusable TypeScript types.

Avoid duplicating interfaces.

Bad

```
interface Customer

interface Customer
```

Good

```
@types/customer.ts
```

Whenever multiple components need the same type, move it here.

---

# 32. Business Logic

Business logic should never be inside components.

Bad

```tsx
<Button
    onClick={() => {
        ...
        prisma.customer.create(...)
    }}
/>
```

Good

```
Button

↓

Action

↓

Prisma
```

---

# 33. Database Layer

The current Prisma schema represents the source of truth.

Every future feature should respect the existing schema.

Never create duplicated information.

Never denormalize without necessity.

Prefer relations.

Avoid unnecessary columns.

---

# 34. Naming Convention

Everything must use English.

Variables

```
customer

package

product

paymentMethod

orderItem
```

Functions

```
createCustomer()

deleteCustomer()

findCustomer()

updateCustomer()
```

Folders

```
customer

order

payment-method
```

Components

```
CustomerCard

CustomerForm

CustomerTable
```

Enums

```
OrderStatus

Role

OrderItemType
```

Never mix Portuguese and English.

---

# 35. File Naming

Prefer kebab-case.

```
customer-form.tsx

customer-table.tsx

create-customer.ts

update-customer.ts
```

Avoid camelCase filenames.

---

# 36. Validation

The project uses Zod.

Every input coming from the user must be validated.

Never trust frontend data.

Every Server Action should validate its input before interacting with Prisma.

Example flow

```
Form

↓

Zod

↓

Action

↓

Prisma
```

---

# 37. Environment Variables

The project already uses dotenv.

A dedicated env validation should be implemented using Zod.

Example

```
DATABASE_URL

AUTH_SECRET

NODE_ENV
```

The application should fail immediately if required environment variables are missing.

Never ignore invalid configuration.

---

# 38. Forms

Every form must use

React Hook Form

+

Zod Resolver

Never manually control dozens of useState calls.

---

# 39. Error Handling

Errors should be explicit.

Avoid silent failures.

Return meaningful messages.

Unexpected errors should be logged.

Expected validation errors should be shown to users.

---

# 40. Notifications

Use Sonner.

Examples

Customer created.

Order deleted.

Payment method updated.

Validation failed.

Never use alert().

---

# 41. Authentication

Authentication is mandatory.

No page except Login can be accessed without authentication.

Unauthenticated users must always be redirected.

No exceptions.

---

# 42. Authorization

Only ADMIN users can access the application.

USER exists only for future extensibility.

If a USER somehow authenticates,

access must be denied.

---

# 43. User Management

There is no registration screen.

There is no public signup.

Users are inserted manually into the database.

Only login exists.

Password recovery does not exist for now.

---

# 44. Route Protection

Every protected route must verify authentication.

Flow

```
Request

↓

Authenticated?

↓

No

↓

Redirect Login

↓

Yes

↓

Continue
```

Never rely only on frontend protection.

The server must also verify permissions.

---

# 45. Database Mutations

Every mutation should happen inside Server Actions.

Avoid exposing unnecessary endpoints.

Prefer direct interaction with Prisma.

---

# 46. Code Quality

SOLID principles should guide development whenever appropriate.

Especially

Single Responsibility

Dependency Inversion

Interface Segregation

Do not overengineer.

SOLID exists to simplify maintenance.

Not to increase abstraction unnecessarily.

---

# 47. Clean Code

Avoid nested ifs.

Prefer early returns.

Prefer descriptive variable names.

Small functions.

Small components.

Predictable behavior.

---

# 48. Comments

Code should explain itself.

Comments should explain WHY.

Not WHAT.

Bad

```ts
// increment x
x++
```

Good

```ts
// Stock is decremented only after payment confirmation.
```

---

# 49. Performance

Avoid premature optimization.

However,

avoid unnecessary re-renders.

Avoid duplicate database queries.

Prefer Server Components whenever possible.

Cache only when it makes sense.

---

# 50. Future Scalability

Every feature should be implemented thinking about future growth.

The current project is intentionally small.

However,

new entities,

new reports,

financial modules,

inventory,

dashboard,

analytics,

and integrations

should be easy to add without requiring a complete architectural rewrite.

Every implementation should leave the codebase cleaner than it was before.

# VANILLATO ERP

> Project Guide — Part 3
>
> Business Rules, Screens, Future Features and AI Development Guidelines.

---

# 51. Current MVP Scope

The first version of the ERP should focus only on the essential features required for the daily operation of Vanillato.

The MVP consists of the following modules:

- Authentication
- Dashboard
- Customers
- Categories
- Subcategories
- Products
- Packages
- Payment Methods
- Orders

Anything outside this scope should only be implemented if explicitly requested.

---

# 52. Authentication

Authentication is the first feature that must exist.

Without authentication the application cannot be used.

Requirements:

- Login screen
- Password verification
- Session persistence
- Secure logout
- Route protection
- Authentication middleware

Only administrators are allowed to access the ERP.

Users with the USER role must never access internal pages.

---

# 53. Login Page

The login page should represent the Vanillato brand.

Requirements:

- Dark theme
- Brand logo
- Minimal design
- Email field
- Password field
- Login button

No registration button.

No forgot password.

No social login.

No OAuth.

No external authentication providers.

The application uses only local authentication.

---

# 54. Initial Navigation

After authentication, the user should land on the Dashboard.

Suggested navigation:

```
Dashboard

Customers

Orders

Products

Packages

Categories

Payment Methods

Settings (future)
```

Navigation should be intuitive.

Do not overload the sidebar.

---

# 55. Dashboard

The dashboard should become the operational center of the ERP.

Initially it can be simple.

Future cards may include:

Total customers

Orders today

Revenue today

Orders pending

Orders in production

Ready orders

Monthly revenue

Recent orders

Recent customers

Quick actions

The dashboard should evolve over time.

---

# 56. Customers Module

Responsible for customer management.

Operations:

Create

Edit

Delete

Search

List

Fields:

Name

Phone

Instagram

City

District

Address

Notes

Customers belong to the company.

Never to a specific administrator.

---

# 57. Categories

Categories organize products.

Examples:

Cake

Dessert

Candy

Snack

Drink

Categories may have multiple subcategories.

---

# 58. Subcategories

Subcategories refine organization.

Example:

Cake

↓

Chocolate

↓

Strawberry

↓

Ninho

Avoid duplicate names inside the same category.

The current Prisma schema already enforces this.

---

# 59. Products

Products represent individual items.

Examples:

Chocolate Cake

Brigadeiro

Cone

Truffle

Every product contains:

Name

Cost Price

Sale Price

Subcategory

Active Status

Future inventory information may be added later.

Current implementation should not assume inventory.

---

# 60. Packages

Packages represent combinations of products.

Example:

Party Kit

Contains:

2 Cakes

4 Truffles

3 Cones

Package items already exist in the database.

The UI should make package composition intuitive.

---

# 61. Payment Methods

Initially:

Pix

Cash

Credit Card

Debit Card

Future methods may be added.

Therefore they remain stored in the database.

Do not hardcode payment methods.

---

# 62. Orders

Orders are the heart of the ERP.

Each order belongs to:

One customer

One payment method

One creator

One status

One or more items

Items may reference:

Products

or

Packages

Orders should calculate totals correctly.

Never trust frontend calculations.

The server is always responsible for financial calculations.

---

# 63. Pricing

Whenever possible,

totals should be recalculated on the server.

Avoid trusting values sent by the browser.

Server should calculate:

Subtotal

Discount

Delivery Fee

Final Total

Future taxes can be added later.

---

# 64. Audit

The creator relation exists only for history.

Example:

Created by Lucas

Created at 2026-07-20

This relation must never restrict editing.

Every administrator has full access.

---

# 65. Permissions

Current permissions:

ADMIN

Everything.

USER

Nothing.

Future versions may introduce:

Manager

Sales

Kitchen

Finance

Delivery

Current architecture should make this evolution easy.

---

# 66. Deletion Policy

Prefer soft deletion whenever possible.

Instead of deleting records,

set:

```
isActive = false
```

Historical data should remain available.

Especially:

Products

Customers

Packages

Payment Methods

Categories

Orders should never be physically deleted unless explicitly required.

---

# 67. Search Experience

Every listing page should eventually support:

Search

Sorting

Pagination

Filtering

These features should share a common behavior.

Consistency is important.

---

# 68. Empty States

Never leave blank pages.

Every empty list should explain:

What the page represents.

Why nothing is displayed.

How to create the first record.

Example:

"No customers have been created yet."

Display an action button whenever possible.

---

# 69. Loading States

Loading feedback should exist.

Prefer Skeletons.

Avoid infinite spinners.

Loading should feel natural.

---

# 70. Confirmation Dialogs

Destructive actions require confirmation.

Delete

Deactivate

Cancel

Never perform destructive operations immediately.

---

# 71. Future Modules

The architecture should support future additions without major refactoring.

Possible future modules:

Financial

Cash Flow

Expenses

Income

Inventory

Suppliers

Purchases

Production

Reports

Charts

Dashboard Analytics

Notifications

Calendar

Delivery Control

Employee Management

Recipe Cost Calculation

These modules should integrate naturally.

---

# 72. Future Reports

Potential reports:

Monthly Sales

Top Products

Top Customers

Revenue by Category

Revenue by Product

Orders by Status

Average Ticket

Customer Growth

These reports should use existing database relationships.

Avoid duplicating information.

---

# 73. AI Development Guidelines

This repository is expected to be developed primarily with AI assistance.

Every generated implementation should prioritize:

Consistency

Readability

Maintainability

Correctness

Never generate code simply to satisfy the prompt.

Understand the project before modifying it.

Respect previous architectural decisions.

If a better implementation exists,

prefer improving existing code instead of replacing everything.

---

# 74. Refactoring

Small continuous improvements are encouraged.

Large rewrites are discouraged unless explicitly requested.

Preserve project consistency.

---

# 75. Generated Code Expectations

Generated code should always be production-ready.

Avoid placeholders.

Avoid TODO comments unless explicitly requested.

Avoid fake implementations.

Avoid mock data unless specifically needed.

Deliver complete solutions.

---

# 76. Dependencies

Before introducing any dependency,

verify whether the project already contains an equivalent solution.

Prefer existing tools.

Avoid dependency bloat.

Every new dependency should have a clear justification.

---

# 77. Consistency Rules

The codebase should feel cohesive.

Naming.

Architecture.

Imports.

Folder structure.

Formatting.

Everything should remain consistent across the repository.

If there is an existing pattern,

follow it.

Do not introduce competing patterns.

---

# 78. Long-Term Vision

The objective is not simply to create an ERP.

The objective is to build a high-quality internal management system that can evolve for years while remaining pleasant to maintain.

Every decision should contribute toward this goal.

---

# 79. Source of Truth

Whenever new documentation is added,

it should complement this guide.

Never contradict it.

Business rules should remain centralized.

The Prisma schema is the source of truth for persistence.

This Project Guide is the source of truth for architecture and development.

---

# 80. Final Principle

Always write code as if another experienced developer will maintain this project for the next five years.

Prioritize:

- Clarity over cleverness.
- Simplicity over unnecessary abstraction.
- Consistency over personal preference.
- Maintainability over speed of implementation.
- User experience over visual excess.

Every contribution should leave the project cleaner, more organized and easier to evolve than before.

# 81. Application Layout

After authentication, every page in the application must share the same layout.

The objective is to create a consistent user experience where only the page content changes.

The layout should never be recreated for each page.

Instead, a single global layout component should be responsible for the application's structure.

Basic layout:

```text
┌──────────────────────────────────────────────────────┐
│ ☰  Vanillato ERP                          Lucas      │
├───────────────┬──────────────────────────────────────┤
│ Dashboard     │                                      │
│ Orders        │                                      │
│ Customers     │        Page Content                  │
│ Products      │                                      │
│ Packages      │                                      │
│ Categories    │                                      │
│ Payment       │                                      │
│ Methods       │                                      │
│               │                                      │
└───────────────┴──────────────────────────────────────┘
```

The sidebar and header should always remain visible.

Only the main content area changes according to the current route.

---

# 82. Sidebar Navigation

The sidebar is the primary navigation component of the ERP.

Its purpose is to provide quick access to every operational module.

Current navigation:

- Dashboard
- Orders
- Customers
- Products
- Packages
- Categories
- Payment Methods

At the bottom of the sidebar:

- User Profile
- Logout

Avoid adding unnecessary navigation items.

The sidebar should remain clean and focused on daily operations.

Future modules may be added later without changing the overall navigation philosophy.

---

# 83. Header

Every authenticated page should contain a global header.

Responsibilities:

- Toggle sidebar on mobile devices.
- Display the current page title.
- Display the authenticated user.
- Display access to the user menu.

The header should remain minimal.

Avoid placing dashboards, statistics or secondary navigation inside it.

---

# 84. Dashboard Philosophy

The Dashboard is **not** a Business Intelligence page.

Business Intelligence, reports, charts and financial indicators will be handled by external BI tools connected directly to the PostgreSQL database.

The ERP Dashboard exists only to assist daily operations.

It should answer one question:

> "What do I need to work on right now?"

Examples of useful information:

- Pending orders
- Orders in production
- Ready orders
- Recently created orders
- Recently created customers
- Quick actions

Avoid financial charts.

Avoid sales reports.

Avoid management indicators.

The Dashboard should remain simple, practical and operational.

---

# 85. Application Pages

The MVP contains only the pages necessary for operating the business.

## Login

Purpose:

Authenticate administrators.

---

## Dashboard

Purpose:

Operational overview and quick access.

---

## Customers

Purpose:

Manage customers.

Features:

- List
- Search
- Create
- Edit
- Deactivate

---

## Orders

Purpose:

Manage customer orders.

Features:

- List
- Search
- Filter
- Create
- Edit
- Change Status
- Cancel
- View Details

Because orders are the most complex entity in the ERP, they should use dedicated pages instead of dialogs.

Routes:

```text
/orders
/orders/new
/orders/[id]
```

---

## Products

Purpose:

Manage individual products.

Features:

- List
- Search
- Create
- Edit
- Deactivate

Simple forms should use dialogs or drawers.

---

## Packages

Purpose:

Manage product bundles.

Features:

- List
- Search
- Create
- Edit
- Add Products
- Remove Products

Since packages contain multiple products, dedicated pages are preferred.

Routes:

```text
/packages
/packages/new
/packages/[id]
```

---

## Categories

Purpose:

Manage categories and subcategories.

Subcategories should not have a separate page.

Instead, categories should expand to display their subcategories, allowing both to be managed from a single screen.

This reduces navigation and provides better context for the user.

---

## Payment Methods

Purpose:

Manage accepted payment methods.

Features:

- List
- Create
- Edit
- Deactivate

The module should remain intentionally simple.

---

# 86. Modal vs Dedicated Pages

Not every entity deserves its own page.

Simple entities should use dialogs or drawers.

Examples:

- Customer
- Product
- Category
- Payment Method

Complex entities should use dedicated pages.

Examples:

- Orders
- Packages

The decision should always prioritize user experience rather than architectural symmetry.

---

# 87. Responsive Design

Although desktop remains the primary platform, the application **must be fully responsive**.

The ERP should work correctly on:

- Desktop
- Tablet
- Mobile

On large screens:

- Sidebar remains visible.

On small screens:

- Sidebar becomes a collapsible Drawer.
- Navigation is opened through the hamburger menu located in the header.

The mobile experience should never feel like a reduced desktop version.

Every page should remain usable with touch interactions.

Tables, forms and dialogs must adapt naturally to smaller screens without horizontal scrolling whenever possible.

Responsiveness is considered a core requirement of the project.

---

# 88. Layout Consistency

Every authenticated page must reuse the same application layout.

Never create different navigation systems for different modules.

Every screen should immediately feel familiar to the user.

Consistency throughout the application is more important than making each page visually unique.

# 89. Language Convention

The project adopts two different languages depending on the context.

## User Interface

Everything displayed to the end user must be written in **Brazilian Portuguese (pt-BR)**.

Examples:

- Dashboard
- Pedidos
- Clientes
- Produtos
- Pacotes
- Categorias
- Formas de Pagamento
- Novo Pedido
- Salvar
- Cancelar
- Editar
- Excluir
- Pedido criado com sucesso.
- Cliente não encontrado.

The application is intended for internal use by a Brazilian company, therefore the entire user experience should be in Portuguese.

---

## Source Code

All source code must be written in **English**.

This includes:

- Variables
- Functions
- Classes
- Interfaces
- Types
- Enums
- Components
- File names
- Folder names
- Routes
- Database models
- Prisma models
- Comments
- Documentation intended for developers

Examples:

```ts
createCustomer()

updateOrder()

paymentMethod

orderItem

CustomerTable

DashboardPage
```

Never mix Portuguese and English inside the codebase.

Example:

❌

```ts
criarCliente()

buscarPedidos()

formaPagamento
```

✅

```ts
createCustomer()

findOrders()

paymentMethod
```

In summary:

- **User-facing content → Portuguese (pt-BR).**
- **Developer-facing code and documentation → English.**