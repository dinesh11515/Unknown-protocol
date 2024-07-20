import { useState, useEffect } from "react";
import { parseUnits, ethers } from "ethers";
import { contractAbi, contractAdd } from "@/constants";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { init, createFhevmInstance, getInstance } from "./fhevm.js";
export default function Stream({ connected, connect, signer }) {
  const [timePeriod, setTimePeriod] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const sendStream = async () => {
    try {
      let instance = await getInstance();

      let formattedFlowRate = document.getElementById("flowrate").value;
      if (timePeriod === "minute") {
        formattedFlowRate /= 60;
      } else if (timePeriod === "hour") {
        formattedFlowRate /= 60 * 60;
      } else if (timePeriod === "day") {
        formattedFlowRate /= 24 * 60 * 60;
      } else if (timePeriod === "month") {
        formattedFlowRate /= 30 * 24 * 60 * 60;
      }
      let flow = parseUnits(formattedFlowRate, 9);
      const resultUint32 = instance.encrypt32(Number(flow));
      let receiver = document.getElementById("receiver").value;
      const contract = new ethers.Contract(contractAdd, contractAbi, signer);

      const tx = await contract.createStream(receiver, resultUint32);
      await tx.wait();

      toast.success("Started Stream");
    } catch (err) {
      toast.error("Not Started");
      console.log(err);
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
        <p className="text-black text-xl font-bold">Send Stream</p>
        <div className="mt-4">
          <p className="text-lg">Receiver Wallet Address</p>
          <input
            type="text"
            placeholder="Enter Wallet Address"
            id="receiver"
            className="rounded-lg text-lg py-2 px-2 w-full border-[3px] border-gray-300 focus:outline-none mt-2"
          />
        </div>
        <div className="mt-4">
          <p className="text-lg">Flow Rate</p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Flow Rate"
              className=" rounded-lg text-lg py-2 px-2 w-full border-[3px] border-gray-300 focus:outline-none mt-2 "
              id="flowrate"
            />
            <select
              className="  flex items-center border-[3px] border-gray-300 p-2 px-4 rounded-md justify-center outline-none mt-2"
              onChange={(e) => {
                setTimePeriod(e.target.value);
              }}
            >
              <option value="second">/second</option>
              <option value="minute">/minute</option>
              <option value="hour">/hour</option>
              <option value="day">/day</option>
              <option value="month">/month</option>
            </select>
          </div>
        </div>
        <div>
          {connected ? (
            <button
              className="bg-[#1db227] hover:bg-green-500 tracking-wide text-[22px] px-10 py-3 rounded-lg w-full text-white mt-7"
              onClick={sendStream}
            >
              Send Stream
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
