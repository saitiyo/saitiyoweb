"use client"

import { store } from "../redux/store";
import { Provider } from "react-redux";
import { ConfigProvider } from 'antd';

import { 
  ApolloClient, 
  HttpLink, 
  split, 
  InMemoryCache 
} from "@apollo/client";


import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { GQL_URL } from "@/config/api";

import { Suspense, useMemo } from "react";
import Loader from "./components/Loader";
import { ApolloProvider } from "@apollo/client/react";

const theme = {
  token: {
    colorPrimary: '#4E46DD',
    borderRadius: 6,
    colorBgContainer: '#FFFFFF',
  },
}

/**
 * Converts HTTP URL to WebSocket URL
 * http://localhost:4000 → ws://localhost:4000
 * https://api.example.com → wss://api.example.com
 */
const getWebSocketUrl = (httpUrl: string): string => {
  // Remove trailing slashes
  const cleanUrl = httpUrl.replace(/\/$/, '');
  
  if (cleanUrl.startsWith("https://")) {
    return cleanUrl.replace(/^https/, "wss");
  }
  if (cleanUrl.startsWith("http://")) {
    return cleanUrl.replace(/^http/, "ws");
  }
  // Already WebSocket URL
  if (cleanUrl.startsWith("wss://") || cleanUrl.startsWith("ws://")) {
    return cleanUrl;
  }
  // Fallback
  return `ws://${cleanUrl}`;
};

// Debug logging for connection
if (typeof window !== "undefined") {
  console.log("📡 GraphQL HTTP URL:", GQL_URL);
  console.log("📡 GraphQL WS URL:", getWebSocketUrl(GQL_URL));
}

const LayoutPage = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  // ✅ CRITICAL: Create client in useMemo so it's client-side only
  const client = useMemo(() => {
    // HTTP link for queries and mutations
    const httpLink = new HttpLink({
      uri: GQL_URL,
      credentials: "include", // Send cookies with requests
    });

    // WebSocket link for subscriptions
    const wsLink = typeof window !== "undefined" 
      ? new GraphQLWsLink(
          createClient({
            url: getWebSocketUrl(GQL_URL),
            retryAttempts: 5,
            shouldRetry: () => true,
            connectionAckWaitTimeout: 10_000,
            on: {
              connected: () => {
                console.log("✅ GraphQL WebSocket connected");
              },
              error: (error) => {
                console.error("❌ GraphQL WebSocket error:", error);
              },
              closed: () => {
                console.log("📭 GraphQL WebSocket closed");
              },
            },
          })
        )
      : null;

    // ✅ Split link: subscriptions use WS, others use HTTP
    const splitLink =
      typeof window !== "undefined" && wsLink
        ? split(
            ({ query }) => {
              const definition = getMainDefinition(query);
              return (
                definition.kind === "OperationDefinition" &&
                definition.operation === "subscription"
              );
            },
            wsLink,
            httpLink
          )
        : httpLink;

    return new ApolloClient({
      link: splitLink,
      cache: new InMemoryCache(),
    });
  }, []);

  return (
    <ApolloProvider client={client}>
      <ConfigProvider theme={theme}>
        <Provider store={store}>
          <Suspense fallback={<Loader size="large" />}>
            {children}
          </Suspense>
        </Provider>
      </ConfigProvider>
    </ApolloProvider>
  );
};

export default LayoutPage;