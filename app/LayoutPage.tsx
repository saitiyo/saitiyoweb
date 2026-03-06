"use client"

import {store} from "../redux/store";
import {Provider} from "react-redux";
import {ConfigProvider} from 'antd';

import { ApolloClient, HttpLink } from "@apollo/client";
import { GQL_URL } from "@/config/api";
import { InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";

import { Suspense} from "react";
import Loader from "./components/Loader";



const theme={
    token: {
      // Seed Token
      colorPrimary: '#4E46DD',
      borderRadius: 6,
  
      // Alias Token
      colorBgContainer: '#FFFFFF',
    },
  }

  //graphQL
const httpLink = new HttpLink({
  uri:GQL_URL
})

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

const LayoutPage=({children}:Readonly<{children: React.ReactNode}>)=>{

    return(
        <ApolloProvider client={client}>
        <ConfigProvider theme={theme}> 
        <Provider store={store}>
        <Suspense fallback={<Loader size="large"/>}> 
          {children}
        </Suspense>
          </Provider> 
         </ConfigProvider> 
         </ApolloProvider>
    )
}

export default LayoutPage