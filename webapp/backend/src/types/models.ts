// Models based on our Prisma tables
// These are used for the response types in Repositories and Services

export interface User {
    id: number
    username: string
    email: string
    password: string
    account_type: string
}