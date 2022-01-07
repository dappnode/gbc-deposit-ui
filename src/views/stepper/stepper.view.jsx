import { useState, useCallback } from 'react'
import useStepperStyles from './stepper.styles'
import useWallet from '../../hooks/use-wallet'
import useStep, { Step } from '../../hooks/use-stepper-data'
import Login from '../login/login.view'
import SwapForm from '../swap-form/swap-form.view'
import Deposit from '../deposit/deposit.view'
import useTokenContract from '../../hooks/use-token-contract'
import useSwapContract from '../../hooks/use-swap-contract'
import useSwapContractInfo from '../../hooks/use-swap-contract-info'
import useTokenInfo from '../../hooks/use-token-info'
import useTokenBalance from '../../hooks/use-token-balance'
import TxConfirm from '../tx-confirm/tx-confirm.view'
import useSwap from '../../hooks/use-swap'
import useDeposit from '../../hooks/use-deposit'
import useDappNodeDeposit from '../../hooks/use-dappnode-deposit'
import TxPending from '../tx-pending/tx-pending.view'
import TxOverview from '../tx-overview/tx-overview.view'
import NetworkError from '../network-error/network-error.view'
import DataLoader from '../data-loader/data-loader'
import LearnMoreLink from '../shared/learnMoreLink/learMoreLink.view'
import DepositTxConfirm from '../deposit-tx-confirm/deposit-tx-confirm.view'
import DepositTxPending from '../deposit-tx-pending/deposit-tx-pending.view'
import DepositTxOverview from '../deposit-tx-overview/deposit-tx-overview.view'
import DepositRisksInfo from '../deposit-risks-info/deposit-risks-info.view'
import useDappnodeWhitelist from '../../hooks/use-dappnode-whitelist'
import useDappnodeContract from '../../hooks/use-dappnode-contract'

function Stepper () {
  const classes = useStepperStyles()
  const { wallet, loadWallet, disconnectWallet, isMetamask, switchChainInMetaMask } = useWallet()
  const swapContract = useSwapContract(wallet)
  const { swapRatio } = useSwapContractInfo(wallet)
  const dappnodeContract = useDappnodeContract(process.env.REACT_APP_DAPPNODE_CONTRACT_ADDRESS, wallet)
  const fromTokenContract = useTokenContract(process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS, wallet)
  const toTokenContract = useTokenContract(process.env.REACT_APP_WRAPPED_TOKEN_CONTRACT_ADDRESS, wallet)
  const fromTokenInfo = useTokenInfo(process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS, wallet)
  const toTokenInfo = useTokenInfo(process.env.REACT_APP_WRAPPED_TOKEN_CONTRACT_ADDRESS, wallet)
  const toTokenBalance = useTokenBalance(wallet?.address, toTokenContract)
  const fromTokenBalance = useTokenBalance(wallet?.address, fromTokenContract)
  const dappnodeWhitelist = useDappnodeWhitelist(wallet?.address, dappnodeContract)
  const { step, switchStep } = useStep()
  const { swap, data: swapData, resetData: resetSwapData } = useSwap()
  const {
    deposit, txData: depositTxData, depositData, setDepositData
  } = useDeposit(wallet, toTokenInfo)
  const {
    dappNodeDeposit, txData: dappNodeDepositTxData, dappNodeDepositData, setDappNodeDepositData
  } = useDappNodeDeposit(wallet, toTokenInfo)

  const tabs = [
    { name: 'Deposit', step: Step.Deposit },
    { name: 'Swap', step: Step.Swap },
    { name: 'DAppNode', step: Step.DappNodeDeposit }
  ]
  const [activeTab, setActiveTab] = useState(tabs[0].name)

  const selectTab = useCallback((tab) => {
    if (activeTab === tab.name) return
    setDepositData(null, null)
    setActiveTab(tab.name)
    switchStep(tab.step)
  }, [activeTab, switchStep, setDepositData])

  if (wallet && wallet.chainId !== process.env.REACT_APP_NETWORK_ID) {
    return (
      <div className={classes.stepper}>
        <NetworkError {...{ isMetamask, switchChainInMetaMask }} />
      </div>
    )
  }

  return (
    <div className={classes.container}>
      {![Step.Login, Step.Loading].includes(step) && (
        <div className={classes.tabs}>
          {tabs.map(tab =>
            <button
              key={tab.name}
              className={activeTab === tab.name ? classes.tabActive : classes.tab}
              onClick={() => selectTab(tab)}
              disabled={![Step.Swap, Step.Deposit, Step.DappNodeDeposit, Step.Overview, Step.DepositOverview].includes(step)}
            >
              <span className={classes.tabName}>{tab.name}</span>
            </button>
          )}
        </div>
      )}
      <div className={classes.stepper}>
        {(() => {
          switch (step) {
            case Step.Loading: {
              return (
                <DataLoader
                  fromTokenInfo={fromTokenInfo}
                  toTokenInfo={toTokenInfo}
                  onFinishLoading={() => switchStep(Step.Deposit)}
                />
              )
            }
            case Step.Login: {
              return (
                <Login
                  wallet={wallet}
                  onLoadWallet={loadWallet}
                  onGoToNextStep={() => switchStep(Step.Loading)}
                />
              )
            }
            case Step.Swap: {
              return (
                <SwapForm
                  wallet={wallet}
                  fromTokenInfo={fromTokenInfo}
                  toTokenInfo={toTokenInfo}
                  fromTokenBalance={fromTokenBalance}
                  toTokenBalance={toTokenBalance}
                  swapData={swapData}
                  onAmountChange={resetSwapData}
                  onSubmit={(fromAmount) => {
                    swap(wallet, fromTokenContract, swapContract, fromAmount)
                    switchStep(Step.Confirm)
                  }}
                  onDisconnectWallet={disconnectWallet}
                  isMetamask={isMetamask}
                  switchChainInMetaMask={switchChainInMetaMask}
                  swapRatio={swapRatio}
                />
              )
            }
            case Step.Confirm: {
              return (
                <TxConfirm
                  wallet={wallet}
                  fromTokenInfo={fromTokenInfo}
                  toTokenInfo={toTokenInfo}
                  toTokenBalance={toTokenBalance}
                  swapData={swapData}
                  onGoBack={() => switchStep(Step.Swap)}
                  onGoToPendingStep={() => switchStep(Step.Pending)}
                />
              )
            }
            case Step.Pending: {
              return (
                <TxPending
                  wallet={wallet}
                  fromTokenInfo={fromTokenInfo}
                  toTokenInfo={toTokenInfo}
                  toTokenBalance={toTokenBalance}
                  swapData={swapData}
                  onGoBack={() => switchStep(Step.Swap)}
                  onGoToOverviewStep={() => switchStep(Step.Overview)}
                />
              )
            }
            case Step.Overview: {
              return (
                <TxOverview
                  wallet={wallet}
                  fromTokenInfo={fromTokenInfo}
                  toTokenInfo={toTokenInfo}
                  toTokenBalance={toTokenBalance}
                  swapData={swapData}
                  onGoBack={() => window.location.reload()}
                  onDisconnectWallet={disconnectWallet}
                  isMetamask={isMetamask}
                />
              )
            }
            case Step.DappNodeDeposit: {
              return (
                <Deposit
                  wallet={wallet}
                  tokenInfo={toTokenInfo}
                  balance={toTokenBalance}
                  onDisconnectWallet={disconnectWallet}
                  onGoNext={() => switchStep(Step.DepositRisksInfo)}
                  depositData={dappNodeDepositData}
                  setDepositData={setDappNodeDepositData}
                  dappNode={true}
                  dappnodeWhitelist={dappnodeWhitelist}
                />
              )
            }
            case Step.Deposit: {
              return (
                <Deposit
                  wallet={wallet}
                  tokenInfo={toTokenInfo}
                  balance={toTokenBalance}
                  onDisconnectWallet={disconnectWallet}
                  onGoNext={() => switchStep(Step.DepositRisksInfo)}
                  depositData={depositData}
                  setDepositData={setDepositData}
                  dappNode={false}
                  dappnodeWhitelist={dappnodeWhitelist}
                />
              )
            }
            case Step.DepositRisksInfo: {
              return (
                <DepositRisksInfo
                  deposit={() => {
                    if(activeTab === "DAppNode") {
                      dappNodeDeposit()
                    } else {
                      deposit()
                    }
                    switchStep(Step.DepositConfirm)
                  }}
                  wallet={wallet}
                  onClose={() => switchStep(Step.Deposit)}
                />
              )
            }
            case Step.DepositConfirm: {
              return (
                <DepositTxConfirm
                  wallet={wallet}
                  tokenInfo={toTokenInfo}
                  balance={toTokenBalance}
                  txData={activeTab === "DAppNode" ? dappNodeDepositTxData : depositTxData}
                  onGoBack={() => switchStep(Step.Deposit)}
                  onGoToPendingStep={() => switchStep(Step.DepositPending)}
                />
              )
            }
            case Step.DepositPending: {
              return (
                <DepositTxPending
                  wallet={wallet}
                  tokenInfo={toTokenInfo}
                  balance={toTokenBalance}
                  txData={activeTab === "DAppNode" ? dappNodeDepositTxData : depositTxData}
                  onGoBack={() => switchStep(Step.Deposit)}
                  onGoToOverviewStep={() => switchStep(Step.DepositOverview)}
                />
              )
            }
            case Step.DepositOverview: {
              return (
                <DepositTxOverview
                  wallet={wallet}
                  tokenInfo={toTokenInfo}
                  balance={toTokenBalance}
                  txData={activeTab === "DAppNode" ? dappNodeDepositTxData : depositTxData}
                  onGoBack={() => window.location.reload()}
                  onDisconnectWallet={disconnectWallet}
                  isMetamask={isMetamask}
                />
              )
            }
            default: {
              return <></>
            }
          }
        })()}
        <LearnMoreLink />
      </div>
    </div>
  )
}

export default Stepper
