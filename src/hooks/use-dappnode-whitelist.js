
import { useEffect, useState } from 'react'

function useDappnodeWhitelist (address, contract) {
  const [dappnodeWhitelist, setDappnodeWhitelist] = useState()

  useEffect(() => {
    const getDappnodeWhitelist = async (contract) => {
      // Check requirements: address is whitelisted and must not be expired
      // addressToIncentive: https://blockscout.com/xdai/mainnet/address/0x6C68322cf55f5f025F2aebd93a28761182d077c3/contracts
      const addressToIncentive = await contract.addressToIncentive(address) // returns struct {endTime, isClaimed}
      console.log(addressToIncentive)

      const isClaimed = addressToIncentive.isClaimed
      const endTime = parseInt(addressToIncentive.endTime)
      console.log("isClaimed:", isClaimed)
      console.log("endTime: ", endTime)

      if (isClaimed) return { isWhitelisted: false, message: 'Address has already been claimed' }
      if (endTime !== 0) return { isWhitelisted: false, message: 'Address is not whitelisted' }
      if (endTime < Math.floor(Date.now()/1000)) return { isWhitelisted: false, message: 'Address has expired' }
      return { isWhitelisted: true, message: 'Address is whitelisted' }
    }

    if (address && contract) {
      getDappnodeWhitelist(contract).then(setDappnodeWhitelist).catch(() => setDappnodeWhitelist())
    } else {
      setDappnodeWhitelist()
    }
  }, [address, contract])

  return dappnodeWhitelist
}

export default useDappnodeWhitelist
