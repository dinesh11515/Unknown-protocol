import { useState } from "react";
import Image from "next/image";
import { BsArrowDownCircleFill } from "react-icons/bs";
import { ethers, parseEther, parseUnits } from "ethers";
import { contractAbi, contractAdd } from "@/constants";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function Wrapper({ connected, connect, signer }) {
  const [wrap, setWrap] = useState(true);
  const [amount, setAmount] = useState();

  const wrapTokens = async () => {
    try {
      const amountTo = parseEther(amount);
      const contract = new ethers.Contract(contractAdd, contractAbi, signer);

      const tx = await contract.wrap({ value: amountTo });
      await tx.wait();

      toast.success("Wrapped tokens");
    } catch (e) {
      console.log(e, "wrapTokens");
    }
  };
  const unwrapTokens = async () => {
    try {
      const amountTo = parseUnits(amount, 9);
      const contract = new ethers.Contract(contractAdd, contractAbi, signer);

      const tx = await contract.unwrap(amountTo);
      await tx.wait();

      toast.success("Unwrapped tokens");
    } catch (e) {
      console.log(e, "unwrapTokens");
    }
  };
  return (
    <div className="mt-10 flex flex-col items-center  rounded-xl w-[40%]">
      <div className="rounded-xl   py-7 px-8 w-full bg-white">
        <div className="flex gap-4 items-center ">
          <button
            className={`${
              wrap && "bg-[#e5ffe7] text-[#1db227]"
            } px-4 py-2 rounded-lg text-xl`}
            onClick={() => setWrap(true)}
          >
            Wrap
          </button>
          <button
            className={`${
              !wrap && "bg-[#e5ffe7] text-[#1db227]"
            } px-4 py-2 rounded-lg text-xl`}
            onClick={() => setWrap(false)}
          >
            Unwrap
          </button>
        </div>
        <div>
          <div className="flex items-center justify-between border-[2px] border-gray-300 hover:ring-1 hover:ring-green-500 rounded-lg mt-5 px-4 py-2">
            <input
              type="text"
              placeholder="0.0"
              className="rounded-lg text-2xl w-[80%] focus:outline-none "
              onChange={(e) => setAmount(e.target.value)}
            />
            {wrap ? (
              <div className="flex item-center gap-2 border-[2px] border-gray-300 text-xl px-6 py-2 rounded-xl">
                <p>INCO</p>
              </div>
            ) : (
              <div className="flex item-center gap-2 border-[2px] border-gray-300 text-xl px-6 py-2 rounded-xl">
                <p>sINCO</p>
              </div>
            )}
          </div>
          <div className="mt-1 flex flex-col items-center text-3xl text-[#1db227]">
            <button onClick={() => setWrap(!wrap)}>
              <BsArrowDownCircleFill />
            </button>
          </div>
          <div className="flex items-center justify-between border-[2px] border-gray-300 rounded-lg mt-1 px-4 py-2">
            <input
              type="text"
              placeholder="0.0"
              value={amount}
              className="rounded-lg bg-white text-2xl w-[80%] focus:outline-none "
              disabled
            />
            {!wrap ? (
              <div className="flex item-center gap-2 border-[2px] border-gray-300 text-xl px-6 py-2 rounded-xl">
                <p>INCO</p>
              </div>
            ) : (
              <div className="flex item-center gap-2 border-[2px] border-gray-300 text-xl px-6 py-2 rounded-xl">
                <p>sINCO</p>
              </div>
            )}
          </div>
        </div>
        <div>
          {connected ? (
            <button
              className="bg-[#1db227] hover:bg-green-500 tracking-wide text-[22px] px-10 py-3 rounded-lg w-full text-white mt-7"
              onClick={wrap ? wrapTokens : unwrapTokens}
            >
              {wrap ? "Wrap" : "Unwrap"}
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
