import { getTelegramPlatformContext } from "./runtime"

export type TelegramLaunchParams = {
  startParam: string | null
  rawInitData: string | null
  telegramUserId: number | null
  username: string | null
}

export function getTelegramLaunchParams(): TelegramLaunchParams {
  const context = getTelegramPlatformContext()
  const user = context.initDataUnsafe?.user

  return {
    startParam: context.initDataUnsafe?.start_param ?? null,
    rawInitData: context.initData,
    telegramUserId: user?.id ?? null,
    username: user?.username ?? null,
  }
}
