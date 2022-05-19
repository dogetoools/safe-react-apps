import { createContext, useContext, useEffect, useState } from 'react'
import SafeAppsSDK, { ChainInfo, SafeInfo } from '@gnosis.pm/safe-apps-sdk'
import Web3 from 'web3'
import InterfaceRepository, { InterfaceRepo } from '../lib/interfaceRepository'
import { CHAINS, rpcUrlGetterByNetwork } from '../utils'
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk'

type NetworkContextProps = {
  sdk: SafeAppsSDK
  safe: SafeInfo
  chainInfo: ChainInfo | undefined
  web3: Web3 | undefined
  interfaceRepo: InterfaceRepo | undefined
  networkPrefix: string | undefined
  nativeCurrencySymbol: string | undefined
  getAddressFromDomain: (name: string) => Promise<string>
}

export const NetworkContext = createContext<NetworkContextProps | null>(null)

const NetworkProvider: React.FC = ({ children }) => {
  const { sdk, safe } = useSafeAppsSDK()
  const [web3, setWeb3] = useState<Web3 | undefined>()
  const [chainInfo, setChainInfo] = useState<ChainInfo>()
  const [interfaceRepo, setInterfaceRepo] = useState<InterfaceRepository | undefined>()

  useEffect(() => {
    if (!chainInfo) {
      return
    }

    const rpcUrlGetter = rpcUrlGetterByNetwork[chainInfo.chainId as CHAINS]
    if (!rpcUrlGetter) {
      throw Error(`RPC URL not defined for chain id ${chainInfo.chainId}`)
    }
    const rpcUrl = rpcUrlGetter(process.env.REACT_APP_RPC_TOKEN)

    const web3Instance = new Web3(rpcUrl)
    const interfaceRepo = new InterfaceRepository(chainInfo)

    if (['10000', '10001'].includes(chainInfo.chainId)) {
      web3Instance.eth.ens.registryAddress = {
        '10000': '0xCfb86556760d03942EBf1ba88a9870e67D77b627',
        '10001': '0x32f1FBE59D771bdB7FB247FE97A635f50659202b',
      }[chainInfo.chainId]!
    }
    setWeb3(web3Instance)
    setInterfaceRepo(interfaceRepo)
  }, [chainInfo])

  useEffect(() => {
    const getChainInfo = async () => {
      try {
        const chainInfo = await sdk.safe.getChainInfo()
        setChainInfo(chainInfo)
      } catch (error) {
        console.error('Unable to get chain info:', error)
      }
    }

    getChainInfo()
  }, [sdk.safe])

  const networkPrefix = chainInfo?.shortName

  const nativeCurrencySymbol = chainInfo?.nativeCurrency.symbol

  const getAddressFromDomain = (name: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const address = await web3?.eth.ens.getAddress(name)
        console.log(address)
        if (address === '0x0000000000000000000000000000000000000000') {
          reject(name)
        }
        resolve(address!)
      } catch {
        reject(name)
      }
    })
  }

  return (
    <NetworkContext.Provider
      value={{
        sdk,
        safe,
        chainInfo,
        web3,
        interfaceRepo,
        networkPrefix,
        nativeCurrencySymbol,
        getAddressFromDomain,
      }}
    >
      {children}
    </NetworkContext.Provider>
  )
}

export const useNetwork = () => {
  const contextValue = useContext(NetworkContext)
  if (contextValue === null) {
    throw new Error('Component must be wrapped with <TransactionProvider>')
  }

  return contextValue
}

export default NetworkProvider
