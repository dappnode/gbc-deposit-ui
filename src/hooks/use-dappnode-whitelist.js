
import { useEffect, useState } from 'react'

import useDappnodeContract from './use-dappnode-contract'

function useDappnodeWhitelist (address, provider) {
  const contract = useDappnodeContract(address, provider)
  const [dappnodeWhitelist, setDappnodeWhitelist] = useState()

  useEffect(() => {
    const getDappnodeWhitelist = async (contract) => {
    // Check requirements: address is whitelisted and must not be expired
    // addressToIncentive: https://blockscout.com/xdai/mainnet/address/0x6C68322cf55f5f025F2aebd93a28761182d077c3/contracts
      const addressToIncentive = await contract.addressToIncentive(provider.address) // returns struct {endTime, isClaimed}

      const isClaimed = addressToIncentive.isClaimed
      const endTime = parseInt(addressToIncentive.endTime)

      if (isClaimed) return { isWhitelisted: false, message: 'Address has already been claimed' }
      if (endTime !== 0) return { isWhitelisted: false, message: 'Address is not whitelisted' }
      if (endTime < Math.floor(Date.now()/1000)) return { isWhitelisted: false, message: 'Address has expired' }
      return { isWhitelisted: true, message: 'Address is whitelisted' }
    }

    if (contract) {
      getDappnodeWhitelist(contract).then(setDappnodeWhitelist).catch(() => setDappnodeWhitelist())
    }
  }, [contract, provider])

  return dappnodeWhitelist
}

export default useDappnodeWhitelist
