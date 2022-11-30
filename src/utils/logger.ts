export const logger = {
  info(context: unknown, message: string) {
    console.log(message, context)
  },
  warn(context: unknown, message: string) {
    console.log(message, context)
  },
  error(context: unknown, message: string) {
    console.error(message, context)
  },
}
