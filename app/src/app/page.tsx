"use client";

import Image from "next/image";
import { PoolList } from "../components/PoolList";
import {
  WalletManager,
  WalletId,
  NetworkId,
  WalletProvider,
  useWallet,
} from "@txnlab/use-wallet-react";

const manager = new WalletManager({
  wallets: [
    {
      id: WalletId.LUTE,
      options: {
        siteName: "V Pools",
      },
    },
  ],
  defaultNetwork: NetworkId.LOCALNET,
});

export default function Home() {
  return (
    <WalletProvider manager={manager}>
      <App />
    </WalletProvider>
  );
}

function App() {
  const { activeAccount, wallets } = useWallet();
  console.log({ activeAccount, wallets });
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 border-b w-full">
        <div className="container mx-auto flex justify-between items-center max-w-7xl px-4">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-xs text-white">V</span>
            </div>
            Pools
          </div>
          <button
            className="rounded-full bg-foreground text-background px-4 py-2 hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors flex-shrink-0"
            onClick={() => {
              if (activeAccount) {
                wallets[0].disconnect();
              } else {
                wallets[0].connect();
              }
            }}
          >
            {activeAccount
              ? `${activeAccount.address.slice(
                  0,
                  6
                )}...${activeAccount.address.slice(-4)}`
              : "Connect"}
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="container mx-auto max-w-7xl px-4 flex flex-col items-center justify-center py-8 gap-8">
        <PoolList />
      </main>

      <footer className="fixed bottom-0 w-full p-4 bg-background/80 backdrop-blur-sm border-t">
        <div className="container mx-auto max-w-7xl px-4 flex gap-6 flex-wrap items-center justify-center">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/file.svg"
              alt="File icon"
              width={16}
              height={16}
            />
            Docs
          </a>
        </div>
      </footer>
    </div>
  );
}
