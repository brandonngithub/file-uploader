# file_uploader

- no validation and sanitization done to keep practice focus on other topics

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
