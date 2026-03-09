"use client";

import saityohome from "../app/assets/saityohome.png";
import saitiyologo from "../app/assets/saitiyologo.png";
import Image from "next/image";
import QRCode from "react-qr-code";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import Loader from "./components/Loader";
import { useEffect, useState } from "react";
import { _getQRcodeData } from "@/redux/actions/auth.actions";
import { useRouter } from "next/navigation";
import { gql} from "@apollo/client";
import { useSubscription } from "@apollo/client/react";

// GraphQL Subscription for listening to QR code scans
const NEW_QR_CODE_SCANNED_SUBSCRIPTION = gql`
  subscription OnNewQRCodeScanned {
    newQRCodeScanned {
      session_id
      token
    }
  }
`;

export default function Home() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const { webSessionId, expiresAt,loading } = useAppSelector(
    (state: RootState) => state.authSlice
  );

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatus, setAuthStatus] = useState<"waiting" | "scanning" | "success" | "error">("waiting");
  const [errorMessage, setErrorMessage] = useState("");

  // Subscribe to QR code scan events
  const { data: subscriptionData, loading: subscriptionLoading, error: subscriptionError } = useSubscription<any>(
    NEW_QR_CODE_SCANNED_SUBSCRIPTION,
    {
      skip: !webSessionId, // Only subscribe when we have a session ID
      onData: ({ data }) => {
        if (data.data?.newQRCodeScanned) {
          console.log(data.data?.newQRCodeScanned,"==========event data")
          handleQRCodeScanned(data.data.newQRCodeScanned);
        }
      },
      onError: (err) => {
        console.error("Subscription error:", err);
        setAuthStatus("error");
        setErrorMessage("Connection lost. Please refresh and try again.");
      },
    }
  );



  useEffect(()=>{

    if(subscriptionData && subscriptionData.newQRCodeScanned){
       console.log(subscriptionData.newQRCodeScanned,"sub result on use effect")
    }

    if(subscriptionError){
      console.log(subscriptionError,"----------sub error")
    }

  },[subscriptionData,subscriptionError])

  // Handle incoming QR code scan event
  const handleQRCodeScanned = (payload: { session_id: string; token: string }) => {
    try {
      console.log("QR code scanned with session ID:", payload.session_id);
      // Validate that the session IDs match
      if (payload.session_id !== webSessionId) {
        console.warn("Session ID mismatch - ignoring scan");
        return;
      }

      // Session IDs match - authentication successful
      setIsAuthenticating(true);
      setAuthStatus("scanning");

      // Store the token in localStorage
      //0708515229
      if (payload.token) {
        localStorage.setItem("authToken", payload.token);
        localStorage.setItem("sessionId", payload.session_id);
        localStorage.setItem("loginTimestamp", new Date().toISOString());

        // Set authentication status to success
        setAuthStatus("success");

        // Redirect to profile after a brief delay to show success state
        setTimeout(() => {
          router.push("/my/sites");
        }, 800);
      } else {
        throw new Error("No token received");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setAuthStatus("error");
      setErrorMessage("Authentication failed. Please try again.");
      setIsAuthenticating(false);
    }
  };

  // Fetch QR code data on component mount
  useEffect(() => {
    dispatch(_getQRcodeData());
  }, [dispatch]);

  // Check if QR code has expired
  useEffect(() => {
    if (expiresAt) {
      const timeLeft = expiresAt - Date.now();
      if (timeLeft <= 0) {
        setAuthStatus("error");
        setErrorMessage("QR code expired. Refreshing...");
        // Refresh QR code after 2 seconds
        setTimeout(() => {
          dispatch(_getQRcodeData());
          setAuthStatus("waiting");
          setErrorMessage("");
        }, 2000);
      }
    }
  }, [expiresAt, dispatch]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-white relative">
      {/* LEFT SECTION: QR & AUTH */}
      <div className="w-1/2 h-screen text-center flex flex-col items-center justify-center gap-6 pt-12 pb-12 px-8 relative z-10">
        {/* Logo and Brand */}
        <div className="mb-8">
          <div className="transition-transform duration-300 hover:scale-105">
            <Image
              src={saitiyologo}
              alt="Saitiyo Logo"
              width={80}
              height={80}
              className="mx-auto"
            />
          </div>
          <h1 className="text-4xl font-bold mt-2 text-black">Saitiyo</h1>
        </div>

        {/* Instructions */}
        <div className="max-w-[320px] mb-8 border border-blue-400 p-4 border-dashed relative">
          <p className="text-xl text-gray-800 leading-tight">
            Scan the QR code below using the <br />
            <span className="font-semibold text-black">Saitkit app</span> <br />
            to connect this device
          </p>
        </div>

        {/* QR Code Container */}
        <div className="relative mb-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100 transition-all duration-300"
          style={{
            opacity: authStatus === "success" ? 0.6 : 1,
            transform: authStatus === "success" ? "scale(0.95)" : "scale(1)",
          }}>
          
          {/* QR Code Display */}
          <div className="w-80 h-80 bg-linear-to-br from-gray-50 to-white flex items-center justify-center rounded-lg border-2 border-gray-200 overflow-hidden">
            {webSessionId && !loading ? (
              <div className="bg-white p-4 rounded-lg">
                <QRCode 
                  value={webSessionId} 
                  size={280}
                  level="H"
                  // includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Loader />
                <span className="text-sm text-gray-500">Loading QR code...</span>
              </div>
            )}
          </div>

          {/* Coordinate Tag */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] px-3 py-1 rounded-full font-mono font-bold shadow-md">
            433 || 114
          </div>

          {/* Status Indicator */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              authStatus === "success" ? "bg-green-500" :
              authStatus === "error" ? "bg-red-500" :
              subscriptionLoading ? "bg-yellow-500 animate-pulse" :
              "bg-green-500 animate-pulse"
            }`} />
            <span className="text-sm font-medium text-gray-700">
              {authStatus === "success" ? "✓ Authenticated" :
               authStatus === "error" ? "✗ Error" :
               authStatus === "scanning" ? "Scanning..." :
               subscriptionLoading ? "Connecting..." :
               "Waiting for scan..."}
            </span>
          </div>

          {/* Error Message */}
          {authStatus === "error" && errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          {/* Session Expiry Warning */}
          {expiresAt && Date.now() < expiresAt && (
            <div className="mt-4 text-xs text-gray-500">
              QR expires in {Math.ceil((expiresAt - Date.now()) / 1000)}s
            </div>
          )}
        </div>

        {/* Divider */}
        <p className="text-gray-400 uppercase text-xs mb-6 font-medium tracking-widest">OR</p>

        {/* Subscription Error Display */}
        {subscriptionError && (
          <div className="max-w-sm p-4 bg-amber-50 border border-amber-200 rounded-lg text-left">
            <p className="text-sm font-medium text-amber-900 mb-1">Connection Issue</p>
            <p className="text-xs text-amber-700">
              Unable to establish real-time connection. Retrying...
            </p>
          </div>
        )}
      </div>

      {/* RIGHT SECTION: BACKGROUND IMAGE & OVERLAY */}
      <div className="w-1/2 relative overflow-hidden">
        <Image
          src={saityohome}
          alt="Worker on site"
          fill
          className="object-cover"
          priority
        />
        
        {/* Animated Overlay - Intensifies on successful auth */}
        <div 
          className="absolute inset-0 bg-black transition-opacity duration-500"
          style={{
            opacity: authStatus === "success" ? 0.4 : 0.1,
          }}
        />

        {/* Success Animation Overlay */}
        {authStatus === "success" && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="text-center animate-pulse">
              <div className="text-6xl mb-4">✓</div>
              <p className="text-white text-2xl font-bold">Connected!</p>
            </div>
          </div>
        )}
        
        {/* Text Overlay */}
        <div className="absolute top-20 left-12 max-w-md z-10">
          <h2 className="text-white text-6xl font-bold leading-tight drop-shadow-lg">
            Manage Your Site <br />
            On The Go
          </h2>
        </div>
      </div>

      {/* Loading State Backdrop */}
      {isAuthenticating && authStatus === "scanning" && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-2xl">
            <Loader />
            <p className="mt-4 text-center text-gray-700 font-medium">
              Authenticating...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}