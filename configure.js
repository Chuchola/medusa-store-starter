const { createInterface } = require("node:readline/promises")
const { readFile, writeFile } = require("node:fs/promises")
const { resolve, basename } = require("node:path")
const { stdin: input, stdout: output } = require("node:process")
const { execFileSync } = require("node:child_process")

async function prompt(rl, question, defaultValue) {
  const answer = await rl.question(`${question} [${defaultValue}]: `)
  return answer.trim() || defaultValue
}

async function main() {
  const envPath = resolve(__dirname, "server/.env")
  const defaultDbName = basename(__dirname)

  const rl = createInterface({ input, output })

  const dbName = await prompt(rl, "Database name", defaultDbName)
  const username = await prompt(rl, "Username", "postgres")
  const password = await prompt(rl, "Password", "postgres")
  const host = await prompt(rl, "Host", "localhost")

  rl.close()

  const databaseUrl = `postgres://${username}:${password}@${host}/${dbName}`
  const newLine = `DATABASE_URL=${databaseUrl}`

  let content = await readFile(envPath, "utf-8")

  if (/^DATABASE_URL=.*$/m.test(content)) {
    content = content.replace(/^DATABASE_URL=.*$/m, newLine)
  } else {
    content = content.endsWith("\n") ? content + newLine + "\n" : content + "\n" + newLine + "\n"
  }

  await writeFile(envPath, content, "utf-8")

  console.log(`\nUpdated DATABASE_URL=${databaseUrl}`)

  console.log("\nRunning db:setup...")
  execFileSync("yarn", ["--cwd", "server", "run", "medusa", "db:setup", "--db", dbName, "--no-interactive"], {
    cwd: __dirname,
    stdio: "inherit",
  })

  console.log("\nRunning seed script...")
  execFileSync("yarn", ["--cwd", "server", "run", "medusa", "exec", "./src/scripts/seed.ts"], {
    cwd: __dirname,
    stdio: "inherit",
  })
}

main()
