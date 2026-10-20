import { Web3 } from 'web3';

export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 80002);
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
export const EXPLORER_URL = import.meta.env.VITE_EXPLORER_URL || 'https://amoy.polygonscan.com';
const CHAIN_HEX = `0x${CHAIN_ID.toString(16)}`;

function getWalletProvider() {
  if (!window.ethereum) throw new Error('Install MetaMask to connect your wallet.');
  return window.ethereum;
}

export async function connectWallet() {
  const provider = getWalletProvider();
  try {
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_HEX }] });
  } catch (error) {
    if (error.code !== 4902) throw error;
    const rpcUrl = import.meta.env.VITE_POLYGON_RPC_URL;
    if (!rpcUrl) throw new Error(`Add Polygon Amoy (${CHAIN_ID}) in MetaMask, then retry. Configure VITE_POLYGON_RPC_URL to enable auto-add.`);
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [{ chainId: CHAIN_HEX, chainName: 'Polygon Amoy', nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 }, rpcUrls: [rpcUrl], blockExplorerUrls: [EXPLORER_URL] }],
    });
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_HEX }] });
  }
  const chainId = Number(await provider.request({ method: 'eth_chainId' }));
  if (chainId !== CHAIN_ID) throw new Error(`MetaMask is connected to chain ${chainId}; switch to Polygon Amoy (${CHAIN_ID}) and retry.`);
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  if (!accounts || !accounts[0]) throw new Error('No MetaMask account is available.');
  return accounts[0];
}

export async function createWalletContract(abi) {
  const provider = getWalletProvider();
  if (!Web3.utils.isAddress(CONTRACT_ADDRESS)) throw new Error('Set VITE_CONTRACT_ADDRESS to the deployed contract on the configured network.');
  const chainId = Number(await provider.request({ method: 'eth_chainId' }));
  if (chainId !== CHAIN_ID) throw new Error(`MetaMask is on chain ${chainId}. Connect to Polygon Amoy (${CHAIN_ID}) before using this contract.`);
  const web3 = new Web3(provider);
  const deployedCode = await web3.eth.getCode(CONTRACT_ADDRESS);
  if (!deployedCode || /^0x0*$/i.test(deployedCode)) throw new Error('No contract is deployed at VITE_CONTRACT_ADDRESS on Polygon Amoy. Check the address and network.');
  return { web3, contract: new web3.eth.Contract(abi, CONTRACT_ADDRESS) };
}
