import saityohome from "../app/assets/saityohome.png";
import saitiyologo from "../app/assets/saitiyologo.png";
import Button from "./components/Button";
import Image from "next/image";
import QRCode from "react-qr-code";

export default function Home() {
  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      {/* LEFT SECTION: QR & AUTH */}
      <div className="w-1/2 h-screen text-center flex flex-col items-center gap-6 pt-12 pb-12" style={{ padding: "40px 20px" }}>
        {/* Logo and Brand */}
        <div className="mb-8">
          <Image
            src={saitiyologo}
            alt="Saitiyo Logo"
            width={80}
            height={80}
            className="mx-auto"
          />
          <h1 className="text-4xl font-bold mt-2 text-black">Saitiyo</h1>
        </div>

        {/* Instructions */}
        <div className="max-w-[320px] mb-8 border border-blue-400 p-4 border-dashed relative">
           {/* This replicates the blue guide box in your reference image */}
          <p className="text-xl text-gray-800 leading-tight">
            Scan the QR code below using the <br />
            <span className="font-semibold text-black">Saitkit app</span> <br />
            to connect this device
          </p>
        </div>

        {/* Placeholder for QR Code */}
        <div className="relative mb-8 bg-gray-100 p-4 rounded-lg">
           {/* Using a placeholder div for the QR area shown in the image */}
           <div className="w-64 h-64 bg-black flex items-center justify-center text-white text-xs">
              <QRCode value="hey frank" />
           </div>
           {/* The blue coordinate tags from your image */}
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] px-2 py-1 rounded">
              433 || 114
           </div>
        </div>

        <p className="text-gray-500 uppercase text-sm mb-6 font-medium">OR</p>

        {/* Action Button */}
        {/* <button className="bg-[#2d2d2d] text-white px-10 py-3 rounded-md text-sm transition hover:bg-black">
          Use another method
        </button>  */}
      </div>

      {/* RIGHT SECTION: BACKGROUND IMAGE & OVERLAY */}
      <div className="w-1/2 relative">
        <Image
          src={saityohome}
          alt="Worker on site"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/10" />
        
        {/* Text Overlay */}
        <div className="absolute top-20 left-12 max-w-md">
          <h2 className="text-white text-6xl font-bold leading-tight ">
            Manage Your Site <br />
            On The Go
          </h2>
        </div>
      </div>
    </div>
  );
}