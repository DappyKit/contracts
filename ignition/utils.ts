import path from 'path'
import fs from 'fs'

export function writeContractsJson(data: {
  socialConnections?: string
  filesystemChanges?: string
  userVerification?: string
}) {
  const filePath = path.join(process.cwd(), 'deployed-contracts.json')

  try {
    let fileData = {}

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8')
      fileData = JSON.parse(fileContent)
    }

    const updatedData = { ...fileData, ...data }
    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2))
    // eslint-disable-next-line no-console
    console.log(`File written successfully to ${filePath}`)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error writing file:', error)
  }
}
