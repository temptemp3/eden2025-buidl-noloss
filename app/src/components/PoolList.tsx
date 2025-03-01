import React, { useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";

export function PoolList() {
  const { activeAccount } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);

  const handleJoinPool = () => {
    // TODO: Implement actual pool joining logic
    console.log(`Joining pool with ${ticketCount} tickets`);
    alert(`Joining pool with ${ticketCount} tickets`);
    setIsModalOpen(false);
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6">Available Pools</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder for pool items - you can map through actual pool data here */}
        <div className="p-6 rounded-lg border border-black/[.08] dark:border-white/[.145] hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a]">
          <h3 className="text-lg font-semibold mb-2">ETH-USDC Pool</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <p>TVL: $1,234,567</p>
            <p>APR: 12.34%</p>
          </div>
          <button
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            Join Pool
          </button>
        </div>
      </div>

      {/* Join Pool Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Join Pool</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Number of Tickets
              </label>
              <input
                type="number"
                min="1"
                value={ticketCount}
                onChange={(e) => setTicketCount(Number(e.target.value))}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleJoinPool}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
