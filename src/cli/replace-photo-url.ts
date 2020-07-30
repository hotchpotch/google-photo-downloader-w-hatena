import { program } from "commander"
import { readFileSync, writeFileSync } from "fs"
import { glob } from "glob"

program
  .requiredOption("-l, --replace-list <csv file>", "replace list csv file", "")
  .option("-d, --dry-run", "dry run")
  .parse(process.argv)

function escapeRegex(string) {
  return string.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
}

const mappings = readFileSync(program.replaceList)
  .toString()
  .split(/\r?\n/)
  .map((line) => {
    const [url, fotolifeUrl] = line.split(",")
    if (!fotolifeUrl) {
      return null
    }
    return {
      url,
      urlRegexp: new RegExp(escapeRegex(url), "g"),
      fotolifeUrl,
    }
  })
  .filter((d) => d)

const dryRun = program.dryRun

for (const arg of program.args) {
  let files = []
  if (arg.indexOf("*") >= 0) {
    files = glob.sync(arg)
  } else {
    files = [arg]
  }

  for (const file of files) {
    let source = readFileSync(file).toString()
    let matched = false
    for (const { url, urlRegexp, fotolifeUrl } of mappings) {
      const replaced = source.replace(urlRegexp, fotolifeUrl)
      if (replaced !== source) {
        if (!matched) {
          matched = true
          if (dryRun) {
            console.log(file)
          }
        }
        source = replaced
        if (dryRun) {
          console.log(`REPLACE: ${url} => ${fotolifeUrl}`)
        }
      }

      if (!dryRun && matched) {
        writeFileSync(file, source)
        console.log("WROTE: ", file)
      }
    }
  }
}
