"use client"

import { _getUserByToken } from "@/redux/actions/auth.actions";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  
  const router = useRouter();
  const dispatch = useAppDispatch()

  const {user} = useAppSelector((state:RootState)=>state.authSlice)
  //handle auth

  useEffect(()=>{
    //check for authToken in localstorage
    const token = localStorage.getItem("authToken")

    if(!token){
      //completely logout
      localStorage.removeItem("sessionId")
      router.replace("/")
      return
    }
    
    //get user by authtoken
    dispatch(_getUserByToken({token}))


  },[])

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center gap-3 p-3">
        <div className="relative w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 bg-black">
          {user && (
            <span className="text-white font-bold text-lg">
              {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
            </span>
          )}
        </div>
        <div className="h-12 flex flex-col justify-center relative">
          <div className="text-lg font-semibold text-gray-900">{user && `${user.firstName} ${user.lastName}`}</div>
          <div className="w-full text-xs text-gray-500 absolute bottom-0.5 text-center">Architect</div>
        </div>
      </header>
      {children}
    </div>
  );
};

export default ProfileLayout;
