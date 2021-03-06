export function downloadFilename(url: string): string {
  const splitted = url.split("/")
  let last = splitted[splitted.length - 1].split("?")[0]
  last = decodeURI(decodeURIComponent(last))
    .replace(/([+]|%20)/g, " ")
    .replace("~", "_") // ~ はダウンロード時には _ に変換されている
  return last
}
