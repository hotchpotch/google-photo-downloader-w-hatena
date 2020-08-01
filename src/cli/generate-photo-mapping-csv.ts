import { program } from "commander"
import { readFileSync, read, existsSync } from "fs"
import { join, basename } from "path"

program.parse(process.argv)

const fotolifeResultsDir = program.args[0]
const downloadResultFile = program.args[1]

readFileSync(downloadResultFile)
  .toString()
  .split(/\r?\n/)
  .forEach((line) => {
    const [url, file] = line.split(",")
    const resultPath = join(fotolifeResultsDir, basename(file) + ".data")
    if (existsSync(resultPath)) {
      const fotolifeUrl = readFileSync(resultPath).toString().trim()
      console.log([url, fotolifeUrl].join(","))
    }
  })
