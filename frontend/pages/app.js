import Image from "next/image";
import { useState, useEffect } from "react";
import Wrapper from "@/components/Wrapper";
import Stream from "@/components/Stream";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import Transfer from "@/components/Transfer";
import Private from "@/components/Private";

export default function App() {
  const [wrap, setWrap] = useState(true);
  const [send, setSend] = useState(false);
  const [transfer, setTransfer] = useState(false);
  const [privateTransfer, setPrivateTransfer] = useState(false);
  const [signer, setSigner] = useState();
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState("");
  const router = useRouter();
  async function connect() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);

        await provider.send("eth_requestAccounts", []);

        const signer = await provider.getSigner();
        setSigner(signer);
        setAccount(signer.address);
        setConnected(true);
      } catch (err) {
        console.log("error connecting: ", err);
      }
    }
  }
  return (
    <div className="mx-40  desktop:mx-60">
      <div className="flex   py-4  items-center justify-between gap-1 ">
        <button
          className="flex  text-4xl items-center gap-3 "
          onClick={() => router.push("/")}
        >
          <Image src="/stream.ico" width={45} height={14} alt="logo"></Image>
          <p className="font-['Anton'] tracking-widest uppercase">Unknown</p>
        </button>
        {!connected ? (
          <button
            className="bg-[#1db227] hover:bg-green-500 tracking-wide text-[22px] px-10 py-3 rounded-full text-white"
            onClick={connect}
          >
            Connect Wallet
          </button>
        ) : (
          <p className="bg-[#1db227] hover:bg-green-500 tracking-wide text-[22px] px-10 py-3 rounded-full text-white">
            {account.slice(0, 6) + "..." + account.slice(-8)}
          </p>
        )}
      </div>
      <div className="flex flex-col items-center">
        <div className="flex gap-2   px-3 py-3 mt-6 text-gray-500 bg-white rounded-xl">
          <button
            className={`flex gap-2 items-center text-lg tracking-wider px-4 py-2 rounded-xl  ${
              wrap && "text-black bg-[#e5ffe7] "
            }`}
            onClick={() => {
              setWrap(true);
              setSend(false);
              setTransfer(false);
              setPrivateTransfer(false);
            }}
          >
            Wrap / UnWrap
          </button>

          <button
            className={`flex gap-2 items-center text-lg tracking-wider px-4 py-2 rounded-lg  ${
              send && "text-black bg-[#e5ffe7] "
            }`}
            onClick={() => {
              setSend(true);
              setWrap(false);
              setTransfer(false);
              setPrivateTransfer(false);
            }}
          >
            Send Stream
          </button>
          <button
            className={`flex gap-2 items-center text-lg tracking-wider px-4 py-2 rounded-xl  ${
              transfer && "text-black bg-[#e5ffe7] "
            }`}
            onClick={() => {
              setWrap(false);
              setSend(false);
              setTransfer(true);
              setPrivateTransfer(false);
            }}
          >
            Transfer
          </button>
          <button
            className={`flex gap-2 items-center text-lg tracking-wider px-4 py-2 rounded-xl  ${
              privateTransfer && "text-black bg-[#e5ffe7] "
            }`}
            onClick={() => {
              setWrap(false);
              setSend(false);
              setTransfer(false);
              setPrivateTransfer(true);
            }}
          >
            Private Transfer
          </button>
        </div>
        {wrap && (
          <Wrapper connected={connected} connect={connect} signer={signer} />
        )}
        {send && (
          <Stream connected={connected} connect={connect} signer={signer} />
        )}

        {transfer && (
          <Transfer connected={connected} connect={connect} signer={signer} />
        )}

        {privateTransfer && (
          <Private connected={connected} connect={connect} signer={signer} />
        )}
      </div>
    </div>
  );
}
