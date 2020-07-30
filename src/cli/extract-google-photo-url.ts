import { program } from "commander"
import { readFileSync } from "fs"
import { googlePhotoUrlRegexp } from "../libs/googlePhotoUrlRegexp"
import { glob } from 'glob'

program.parse(process.argv)

for (const arg of program.args) {
  let files = []
  if (arg.indexOf('*') >= 0) {
    files = glob.sync(arg)
  } else {
    files = [arg]
  }
  for (const file of files) {
    const source = readFileSync(file).toString()
    const m = source.match(googlePhotoUrlRegexp)
    if (m) {
      console.log(m.join("\n"))
    }
  }
}
