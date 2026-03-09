import { createSlice } from '@reduxjs/toolkit'
import { _getQRcodeData, _getUserByToken } from '../actions/auth.actions'



interface InitialStateType {
    loading:boolean
    isSuccess:boolean
    isError:boolean
    msg:string
    token:string | null
    user:User | null
    webSessionId?:string | null
    expiresAt?:any | null
}


const initialState:InitialStateType = {
    loading:false,
    isSuccess:false,
    isError:false,
    msg:"",
    token:null,
    user:null,
    webSessionId:null,
    expiresAt:null
}

const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers:{
        clearAuthLoginState: state => {
            state.isError = false;
            state.isSuccess = false;
            state.msg ="";
        },
        logoutAuth: state => {

            localStorage.removeItem("user")
            state.token = null;
        },
    },
    extraReducers: builder =>{

        builder.addCase(_getUserByToken.pending, state => {
            state.loading = true;
        });

        builder.addCase(_getUserByToken.fulfilled, (state, action) => {
            state.loading = false;
            state.isError = action.payload.isError;
            if(!action.payload.isError){
                state.user = action.payload.payload
            }

        });

        builder.addCase(_getUserByToken.rejected, (state, action: any) => {
            state.loading = false;
            state.isError = action.payload.isError;
            state.isSuccess = !action.payload.isError;
            state.msg = action.payload.msg;
        });

        builder.addCase(_getQRcodeData.pending, state => {
            state.loading = true;
        });

        builder.addCase(_getQRcodeData.fulfilled, (state, action) => {
            state.loading = false;
            state.isError = action.payload.isError;
            if(!action.payload.isError){
                state.webSessionId = action.payload.payload.webSessionId
                state.expiresAt = action.payload.payload.expiresAt
            }
        });

        builder.addCase(_getQRcodeData.rejected, (state, action: any) => {
            state.loading = false;
            state.isError = action.payload.isError;
            state.isSuccess = !action.payload.isError;
            state.msg = action.payload.msg;
        });

    }
})

export const {
    clearAuthLoginState,
    logoutAuth
} = authSlice.actions
export default authSlice.reducer