# file_uploader

- no validation and sanitization done to keep practice focus on other topics
- need fix cant click see file details in folder

### Used

- supabase storage
- multer
- passport js
- prisma

# Notes

### Lesson

- Prisma not normally used for small scale projects, but common for large projects
- raw SQLing need more code bc manually write every query
- with raw SQL, to understand database need connect to it, but with ORMs can look at schema file
- changing database structure way easier with ORMs via migrations
- Prisma ORM consists of many libraries
- Prisma client is library used to interact with db
- Prisma supports raw queries too if can't get query right w Prisma client
- When make change to schema file, apply it to db w Prisma migrate

### Prisma docs getting started

- https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-node-postgresql
- `npx prisma migrate dev` and `npx prisma db push` essentially same but former has version control
- `npx prisma studio` for visual database editor

### What is Prisma ORM?

- https://www.prisma.io/docs/orm/overview/introduction/what-is-prisma

### Prisma schema overview

- https://www.prisma.io/docs/orm/prisma-schema/overview
- can split Prisma schema into multiple files

### Data models

- https://www.prisma.io/docs/orm/prisma-schema/data-model/models
- Prisma models in schemas map to tables in relational databases or collections for MongoDB
- migrating is starting with Prisma from scratch, introspecting is adding Prisma to existing database
- @@map and @map maps Prisma names to database names
- @@whatever is for models and @whatever is for fields
- Prisma field types include scalar (ex int, string, enum) and relations (other models)
- field attributes are like @id, @default, @unique, etc...

### Relations

- https://www.prisma.io/docs/orm/prisma-schema/data-model/relations
- relations are connections btwn two Prisma models
- one-to-one (1-1), one-to-many (1-n), many-to-many (m-n)
- implicit many-to-many intermediary table handled by Prisma, explicit many-to-many intermediary table created yourself
- reason might need explicit many-to-many is bc implicit need both models to have an id
- every relation needs exactly two relation fields, one on each model (maybe another ex if want author and authorId foreign key)
- in example above author is relation field, authorId is relation scalar field

### Prisma client CRUD

- https://www.prisma.io/docs/orm/prisma-client/queries/crud
- basically bunch of examples on using the Prisma client CRUD operations
- good reference if need examples
- SIDE NOTE faker.js cool can use to seed databases from now on

### Raw SQL

- https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/typedsql
- TypedSQL is a feature in Prisma for making custom queries with raw SQL
- TypedSQL no work w mongo

### Prisma migrate getting started

- https://www.prisma.io/docs/orm/prisma-migrate/getting-started
- basically create Prisma schema, do first migration, if change schema, do second migration, and on...
- also example provided for introspecting

### Prisma migrate mental model

- https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/mental-model
- model/entity-first migration is defining structure, writing schema, migrating
- database-first migration is defining structure, creating db in SQL, introspecting

### Data migrations

- https://www.prisma.io/docs/guides/data-migration
- the "expand and contract" pattern helps changing database schemas in production effectively
