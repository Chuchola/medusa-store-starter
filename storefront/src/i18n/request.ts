import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"

const SUPPORTED_LOCALES = ["en"] as const
const DEFAULT_LOCALE = "en"

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const raw = cookieStore.get("_medusa_locale")?.value ?? DEFAULT_LOCALE

  // Normalise: "en-US" → "en"
  const base = raw.split("-")[0].toLowerCase()
  const locale = (SUPPORTED_LOCALES as readonly string[]).includes(base)
    ? base
    : DEFAULT_LOCALE

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
