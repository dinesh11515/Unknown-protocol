import { useState, useEffect } from "react";
import Image from "next/image";
import { BsArrowDownCircleFill } from "react-icons/bs";
import { ethers, parseEther, parseUnits } from "ethers";
import { contractAbi, contractAdd } from "@/constants";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { init, createFhevmInstance, getInstance } from "./fhevm.js";

export default function Transfer({ connected, connect, signer }) {
  const [wrap, setWrap] = useState(true);
  const [amount, setAmount] = useState();
  const [isInitialized, setIsInitialized] = useState(false);

  const transferTokens = async () => {
    try {
      let instance = await getInstance();
      const amountTo = parseUnits(amount, 9);
      const contract = new ethers.Contract(contractAdd, contractAbi, signer);
      let receiver = document.getElementById("receiver").value;
      const resultUint32 = instance.encrypt32(Number(amountTo));

      const tx = await contract.transfer(receiver, resultUint32);
      await tx.wait();

      toast.success("Wrapped tokens");
    } catch (e) {
      console.log(e, "wrapTokens");
    }
  };

  useEffect(() => {
    init()
      .then(() => {
        setIsInitialized(true);
      })
      .catch(() => setIsInitialized(false));
  }, []);

  if (!isInitialized) return null;

  return (
    <div className="mt-10 flex flex-col items-center  rounded-xl w-[40%]">
      <div className="rounded-xl   py-7 px-8 w-full bg-white">
        <p className="text-black text-xl font-semibold">
          Transfer tokens without revealing the amount
        </p>
        <div className="mt-4">
          <p className="text-lg">Receiver Wallet Address</p>
          <input
            type="text"
            placeholder="Enter Wallet Address"
            id="receiver"
            className="rounded-lg text-lg py-2 px-2 w-full border-[3px] border-gray-300 focus:outline-none mt-2"
          />
        </div>
        <div>
          <div className="flex items-center justify-between border-[2px] border-gray-300 hover:ring-1 hover:ring-green-500 rounded-lg mt-5 px-4 py-2">
            <input
              type="text"
              placeholder="0.0"
              className="rounded-lg text-2xl w-[80%] focus:outline-none "
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
        <div>
          {connected ? (
            <button
              className="bg-[#1db227] hover:bg-green-500 tracking-wide text-[22px] px-10 py-3 rounded-lg w-full text-white mt-7"
              onClick={transferTokens}
            >
              Transfer
            </button>
          ) : (
            <button
              className="bg-[#1db227] hover:bg-green-500 tracking-wide text-[22px] px-10 py-3 rounded-lg w-full text-white mt-7"
              onClick={connect}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
