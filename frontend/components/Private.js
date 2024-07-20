import { BsArrowDownCircleFill } from "react-icons/bs";

export default function Private({ connected, connect, signer }) {
  return (
    <div className="mt-10 flex flex-col items-center  rounded-xl w-[40%]">
      <div className="rounded-xl   py-7 px-8 w-full bg-white">
        <div className="flex  items-center gap-1 text-black text-xl ">
          <p className=" font-bold">Private Transfer</p>

          <p className="text-gray-700 text-md">(upcoming)</p>
        </div>
        <p className="mt-4">
          This enables privately sending and receiving tokens without revealing
          the address and amount by using ZKProofs and FHE, Inco Network.
        </p>
      </div>
    </div>
  );
}
