import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import 'dotenv/config'

export default buildModule('DeploySocialConnections', m => {
  const socialConnections = m.contract('SocialConnections', [])

  return { socialConnections }
})
