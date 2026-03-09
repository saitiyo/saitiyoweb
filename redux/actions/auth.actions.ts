import { API_URL } from "@/config/api";
import { AppDispatch } from "../store"
import { createAsyncThunk } from "@reduxjs/toolkit"
import  axios from "axios"



export const _getQRcodeData = createAsyncThunk(
  "qrcode/data", 
  async function () {
  try {
      let { data } = await axios.get(`${API_URL}/auth/web/get-qrcode`)

      console.log(data, "data from qrcode api")
      return data
  } catch (error) {
    console.log(error)
    return {
      isError: true,
      msg: "Error ! try again",
    }
  }
})

export const _getUserByToken = createAsyncThunk<
  any,
  { token: string },
  { dispatch: AppDispatch }
>("get/user", async function (payload) {
  try {
      let { data } = await axios.post(`${API_URL}/auth/authenticate`, payload , {
        headers:{
          "Content-Type":"application/json",
          "Authorization":`Bearer ${payload.token}`
        }
      })
      return data
  } catch (error) {
    console.log(error)
    return {
      isError: true,
      msg: "Error ! try again",
    }
  }
})


