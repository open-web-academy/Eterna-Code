import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia, scroll, scrollSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import main from "../components/documentation/Main";

export const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [scrollSepolia],
    transports: {
      // RPC URL for each chain
      // [mainnet.id]: http(
      //   `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
      // ),
      // [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'),
      //[scroll.id]: http('https://scroll.drpc.org'),
      [scrollSepolia.id]: http('https://sepolia-rpc.scroll.io')
    },

    // Required API Keys
    walletConnectProjectId: "358a1edf2a7810b41b5e154630afe5f4",

    // Required App Info
    appName: "Eternacode",

    // Optional App Info
    appDescription: "Your App Description",
    appUrl: "https://eternacode.dev/", // your app's url
    appIcon: "https://raw.githubusercontent.com/yaairnaavaa/Maverick/refs/heads/main/Eterna.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  }),
);

