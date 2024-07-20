import { BrowserProvider } from "ethers";
import { createInstance, FhevmInstance, initFhevm } from "fhevmjs/web";

export const init = async () => {
  await initFhevm();
};

let instance;

export const createFhevmInstance = async () => {
  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  const chainId = +network.chainId.toString();
  const publicKey = await provider.call({
    from: null,
    to: "0x0000000000000000000000000000000000000044",
  });
  instance = await createInstance({ chainId, publicKey });
  return instance;
};

export const getTokenSignature = async (contractAddress, userAddress) => {
  if (getInstance().hasKeypair(contractAddress)) {
    return getInstance().getTokenSignature(contractAddress);
  } else {
    const { publicKey, token } = getInstance().generateToken({
      verifyingContract: contractAddress,
    });
    const params = [userAddress, JSON.stringify(token)];
    const signature = await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params,
    });
    getInstance().setTokenSignature(contractAddress, signature);
    return { signature, publicKey };
  }
};

export const getInstance = () => {
  return instance;
};
