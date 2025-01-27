import { useEffect, useState } from 'react'
import Web3 from 'web3'
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk'

function useWeb3() {
  const [web3, setWeb3] = useState<Web3 | undefined>()
  const { sdk } = useSafeAppsSDK()

  useEffect(() => {
    const setWeb3Instance = async () => {
      const chainInfo = await sdk.safe.getChainInfo()

      if (!chainInfo) {
        return
      }

      const rpcUrlGetter = rpcUrlGetterByNetwork[chainInfo.chainId as CHAINS]

      if (!rpcUrlGetter) {
        throw Error(`RPC URL not defined for ${chainInfo.chainName} chain`)
      }

      const rpcUrl = rpcUrlGetter(process.env.REACT_APP_RPC_TOKEN)

      const web3Instance = new Web3(rpcUrl)
      if (['568', '2000', '10000', '10001'].includes(chainInfo.chainId)) {
        web3Instance.eth.ens.registryAddress = {
          '568': '0x08850859CE6B62A39918c8B806AfbE3442fE7b0b',
          '2000': '0x834C46666c1dE7367B252682B9ABAb458DD333bf',
          '10000': '0xCfb86556760d03942EBf1ba88a9870e67D77b627',
          '10001': '0x32f1FBE59D771bdB7FB247FE97A635f50659202b',
        }[chainInfo.chainId]!
      }
      setWeb3(web3Instance)
    }

    setWeb3Instance()
  }, [sdk.safe])

  return {
    web3,
  }
}

export default useWeb3

export enum CHAINS {
  MAINNET = '1',
  MORDEN = '2',
  ROPSTEN = '3',
  RINKEBY = '4',
  GOERLI = '5',
  OPTIMISM = '10',
  KOVAN = '42',
  BSC = '56',
  XDAI = '100',
  POLYGON = '137',
  ENERGY_WEB_CHAIN = '246',
  DOGECHAIN_TESTNET = '568',
  DOGECHAIN = '2000',
  ARBITRUM = '42161',
  AVALANCHE = '43114',
  VOLTA = '73799',
  AURORA = '1313161554',
  SMARTBCH = '10000',
  SMARTBCH_AMBER = '10001',
}

export const rpcUrlGetterByNetwork: {
  [key in CHAINS]: null | ((token?: string) => string)
} = {
  [CHAINS.MAINNET]: token => `https://mainnet.infura.io/v3/${token}`,
  [CHAINS.MORDEN]: null,
  [CHAINS.ROPSTEN]: null,
  [CHAINS.RINKEBY]: token => `https://rinkeby.infura.io/v3/${token}`,
  [CHAINS.GOERLI]: null,
  [CHAINS.OPTIMISM]: () => 'https://mainnet.optimism.io',
  [CHAINS.KOVAN]: null,
  [CHAINS.BSC]: () => 'https://bsc-dataseed.binance.org',
  [CHAINS.XDAI]: () => 'https://dai.poa.network',
  [CHAINS.POLYGON]: () => 'https://rpc-mainnet.matic.network',
  [CHAINS.ENERGY_WEB_CHAIN]: () => 'https://rpc.energyweb.org',
  [CHAINS.DOGECHAIN_TESTNET]: () => 'https://rpc-testnet.dogechain.dog',
  [CHAINS.DOGECHAIN]: () => 'https://rpc.ankr.com/dogechain',
  [CHAINS.ARBITRUM]: () => 'https://arb1.arbitrum.io/rpc',
  [CHAINS.AVALANCHE]: () => 'https://api.avax.network/ext/bc/C/rpc',
  [CHAINS.VOLTA]: () => 'https://volta-rpc.energyweb.org',
  [CHAINS.AURORA]: () => 'https://mainnet.aurora.dev',
  [CHAINS.SMARTBCH]: () => 'https://smartbch.fountainhead.cash/mainnet',
  [CHAINS.SMARTBCH_AMBER]: () => 'https://moeing.tech:9545',
}
