import { API_URL } from "@/config/api";
import { AppDispatch } from "../store"
import { createAsyncThunk } from "@reduxjs/toolkit"
import  axios from "axios"


export const _getUserByToken = createAsyncThunk<
  any,
  { token: string },
  { dispatch: AppDispatch }
>("get/user", async function (payload) {
  try {
      let { data } = await axios.post(`${API_URL}/user/authenticate`, payload)
    return data
  } catch (error) {
    console.log(error)
    return {
      isError: true,
      msg: "Error ! try again",
    }
  }
})
