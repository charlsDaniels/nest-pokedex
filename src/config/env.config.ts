export const EnvConfig = () => ({
  environment: process.env.NODE_ENV || 'dev',
  mongoDb: process.env.MONGODB,
  port: process.env.PORT,
  defaultPageLimit: +process.env.DEFAULT_PAGE_LIMIT
})