import Image from "next/image";
import { useRouter } from "next/router";

export default function App() {
  const router = useRouter();
  return (
    <div className="mx-40  desktop:mx-60">
      <div className="flex   items-center justify-between gap-1 ">
        <button
          className="flex  text-4xl my-10 items-center gap-3"
          onClick={() => router.push("/")}
        >
          <Image src="/stream.ico" width={45} height={14} alt="logo"></Image>
          <p className="font-['Anton'] tracking-widest uppercase">Unknown</p>
        </button>
      </div>
    </div>
  );
}
