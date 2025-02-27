**[Project Overview]**
Carobar is a NextJS 15-based Multi-Tenent SaaS application for used car traders, focusing on the Japanese market. The application handles vehicle sales, purchases, stock management, reporting, invoicing, and accounting functionalities.

**[User Roles]**

Only Authenticated users can access the application. With 3 main roles:

* Admin (SA: Carobar administrators)   :  Full access to all system features, including admin functions.
* Company User (CU: Company STAFF)     : User who can only access the features and functions granted to their role.
* Company Admin (CA: Company Manager)  : Company administrator with elevated privileges within their company.


**[Database]**

* Prisma Schema is defined in `app/prisma/schema.prisma` file, While Prisma client is created centrally at `app/lib/prisma.ts`
* Make sure that whenever you use Prisma CLI, run npx prisma with `--schema=app/prisma/schema.prisma`
* Make sure you understand underlying database structure well by  thoroughly reading `app/testdata/crebas.sql` to understand tables, columns and relationships.
* Use comments in `app/testdata/crebas.sql` to understand  purpose of  tables and columns.
* To further understand data context, read sampke data from real world usage that I have prepared as json files in  `app/testdata/

`

  **This is how tables are categorized ...**

* All tables starting with prefix "ref_" are reference data tables used throughout the application.

- All tables starting with prefix "t_" are financial or  account transaction related tables.
- All tables starting with "vehicle..." are to manage Purchase, Sales, Shipment etc.


**Key relationships in the database...**

- Companies are the root entities (ref_companies)
- Users belong to companies (ref_users)
- All reference data is company-specific (includes company_id)
- Vehicles belong to companies and are identified by chassis number
- Transactions (purchase, sales, etc.) reference vehicles and contacts


**[Technical Stack]**

- **Framework**: NextJS 15
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with role-based access control
- **Password Security**: bcrypt hashing
- **UI**: React components with Tailwind CSS

**[Important Directory Structure]**
`/app`       >> Main application directory following Next.js 15+ conventions.
`/app/lib`   >> Core utilities and shared functionality:
`/app/api`   >> API routes handling server-side logic:

**[Core Infrastructure provided ]**
Please understand these key areas on infra that we intend to use consistently across the project while extending features.

1. Project structure and architecture setup with root of application in `app` folder.
2. Authentication and authorization system.
3. JWT token management
4. Role-based access control
5. Navigation and layout components
6. Error handling utilities


**[Key considerations]**

1. Date format we will use throughout the Project is  YYYY-MM-DD
   ** Pay special attention to a few fields in database INt4 which are organised as numeric YYYYMMDD.

2. Fields which are controlled by system and can't be modified by users are  ...
  created_at (timestamp), created_by (loggged in user) , updated_at (timestamp) updated_by(loggged in user)

