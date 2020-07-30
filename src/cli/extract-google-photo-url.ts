import { program } from "commander"
import { readFileSync } from "fs"
import { googlePhotoUrlRegexp } from "../libs/googlePhotoUrlRegexp"

program.parse(process.argv)

for (const file of program.args) {
  const source = readFileSync(file).toString()
  const m = source.match(googlePhotoUrlRegexp)
  if (m) {
    console.log(m.join("\n"))
  }
}
