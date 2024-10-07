import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import 'dotenv/config'

export default buildModule('DeployFilesystem', m => {
  const fileSystemChanges = m.contract('FilesystemChanges', [])

  return { fileSystemChanges }
})
