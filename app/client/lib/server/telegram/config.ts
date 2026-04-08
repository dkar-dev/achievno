export type TelegramServerConfig = {
  botToken: string | null
}

export function getTelegramServerConfig(): TelegramServerConfig {
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN ?? null,
  }
}
