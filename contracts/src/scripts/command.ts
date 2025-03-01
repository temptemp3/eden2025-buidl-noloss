import { Command } from "commander";
import { NoLossClient } from "./clients/NoLossClient.js";
import { RandomnessBeaconClient } from "./clients/RandomnessBeaconClient.js";

import algosdk from "algosdk";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

export const program = new Command();

const { MN } = process.env;

export const acc = algosdk.mnemonicToSecretKey(MN || "");
export const { addr, sk } = acc;

export const addressses = {
  deployer: addr,
};

export const sks = {
  deployer: sk,
};

// DEVNET
const ALGO_SERVER = "http://localhost";
const ALGO_PORT = 4001;
const ALGO_INDEXER_SERVER = "http://localhost";
const ALGO_INDEXER_PORT = 8980;

// TESTNET
// const ALGO_SERVER = "https://testnet-api.voi.nodely.dev";
// const ALGO_INDEXER_SERVER = "https://testnet-idx.voi.nodely.dev";

// MAINNET
// const ALGO_SERVER = "https://mainnet-api.voi.nodely.dev";
// const ALGO_INDEXER_SERVER = "https://mainnet-idx.voi.nodely.dev";

const algodServerURL = process.env.ALGOD_SERVER || ALGO_SERVER;
const algodServerPort = process.env.ALGOD_PORT || ALGO_PORT;
export const algodClient = new algosdk.Algodv2(
  process.env.ALGOD_TOKEN ||
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  algodServerURL,
  algodServerPort
);

const indexerServerURL = process.env.INDEXER_SERVER || ALGO_INDEXER_SERVER;
const indexerServerPort = process.env.INDEXER_PORT || ALGO_INDEXER_PORT;
export const indexerClient = new algosdk.Indexer(
  process.env.INDEXER_TOKEN || "",
  indexerServerURL,
  indexerServerPort
);

type DeployType = "NoLoss" | "RandomnessBeacon";

interface DeployOptions {
  type: DeployType;
  name: string;
  debug?: boolean;
}

interface SetupParams {
  deadline: number;
  stakedToken: number;
  price: bigint;
  rewardToken: number;
  rewardAmount: bigint;
}

interface BuyTicketParams {
  amount: bigint;
}

interface CheckWinnerParams {
  address: string;
}

export const deploy: any = async (options: DeployOptions) => {
  if (options.debug) {
    console.log(options);
  }
  const deployer = {
    addr: addr,
    sk: sk,
  };
  let Client;
  switch (options.type) {
    case "NoLoss": {
      Client = NoLossClient;
      break;
    }
    case "RandomnessBeacon": {
      Client = RandomnessBeaconClient;
      break;
    }
    default: {
      throw new Error("Invalid contract type");
    }
  }
  const clientParams: any = {
    resolveBy: "creatorAndName",
    findExistingUsing: indexerClient,
    creatorAddress: deployer.addr,
    name: options.name || "",
    sender: deployer,
  };
  const appClient = Client ? new Client(clientParams, algodClient) : null;
  if (appClient) {
    const app = await appClient.deploy({
      deployTimeParams: {},
      onUpdate: "update",
      onSchemaBreak: "fail",
    });
    return { appId: app.appId, appClient: appClient };
  }
};

export const setup = async (appId: number, params: SetupParams) => {
  const appClient = new NoLossClient(
    {
      resolveBy: "id",
      id: appId,
      sender: { addr, sk },
    },
    algodClient
  );
  await appClient.setup({
    deadline: Number(params.deadline),
    stakedToken: Number(params.stakedToken),
    price: Number(params.price),
    rewardToken: Number(params.rewardToken),
    rewardAmount: Number(params.rewardAmount),
  });
};

// export const buyTicket = async (appId: number, params: BuyTicketParams) => {
//   const appClient = new NoLossClient(
//     {
//       resolveBy: "id",
//       id: appId,
//       sender: { addr, sk },
//     },
//     algodClient
//   );
//   await appClient.buyTicket(params);
// };

// export const withdraw = async (appId: number) => {
//   const appClient = new NoLossClient(
//     {
//       resolveBy: "id",
//       id: appId,
//       sender: { addr, sk },
//     },
//     algodClient
//   );
//   await appClient.withdraw();
// };

// export const checkWinner = async (appId: number, params: CheckWinnerParams) => {
//   const appClient = new NoLossClient(
//     {
//       resolveBy: "id",
//       id: appId,
//       sender: { addr, sk },
//     },
//     algodClient
//   );
//   return await appClient.checkWinner(params);
// };

// program
//   .command("deploy")
//   .requiredOption("-t, --type <string>", "Specify factory type")
//   .requiredOption("-n, --name <string>", "Specify contract name")
//   .option("--debug", "Debug the deployment", false)
//   .description("Deploy a specific contract type")
//   .action(async (options: DeployOptions) => {
//     const apid = await deploy(options);
//     if (!apid) {
//       console.log("Failed to deploy contract");
//       return;
//     }
//     console.log(apid);
//   });

// program
//   .command("setup")
//   .requiredOption("--app-id <number>", "Application ID")
//   .requiredOption("--deadline <number>", "Deadline in seconds")
//   .requiredOption("--staked-token <number>", "Staked token ID")
//   .requiredOption("--price <number>", "Ticket price")
//   .requiredOption("--reward-token <number>", "Reward token ID")
//   .requiredOption("--reward-amount <number>", "Reward amount")
//   .action(async (options) => {
//     await setup(parseInt(options.appId), {
//       deadline: parseInt(options.deadline),
//       stakedToken: parseInt(options.stakedToken),
//       price: BigInt(options.price),
//       rewardToken: parseInt(options.rewardToken),
//       rewardAmount: BigInt(options.rewardAmount),
//     });
//   });

// program
//   .command("buy-ticket")
//   .requiredOption("--app-id <number>", "Application ID")
//   .requiredOption("--amount <number>", "Amount of tickets to buy")
//   .action(async (options) => {
//     await buyTicket(parseInt(options.appId), {
//       amount: BigInt(options.amount),
//     });
//   });

// program
//   .command("withdraw")
//   .requiredOption("--app-id <number>", "Application ID")
//   .action(async (options) => {
//     await withdraw(parseInt(options.appId));
//   });

// program
//   .command("check-winner")
//   .requiredOption("--app-id <number>", "Application ID")
//   .requiredOption("--address <string>", "Address to check")
//   .action(async (options) => {
//     const result = await checkWinner(parseInt(options.appId), {
//       address: options.address,
//     });
//     console.log("Is winner:", result);
//   });

interface AddSeedParams {
  round: number;
  seed: Uint8Array;
}

export const addSeed = async (appId: number, params: AddSeedParams) => {
  const appClient = new RandomnessBeaconClient(
    {
      resolveBy: "id",
      id: appId,
      sender: { addr, sk },
    },
    algodClient
  );
  await appClient.addSeed(params);
};

interface GetExactSeedParams {
  round: number;
}

export const getExactSeed = async (
  appId: number,
  params: GetExactSeedParams
) => {
  const appClient = new RandomnessBeaconClient(
    {
      resolveBy: "id",
      id: appId,
      sender: { addr, sk },
    },
    algodClient
  );
  return (await appClient.getExactSeed(params)).return;
};

interface GetLastSeedParams {}

export const getLastSeed = async (appId: number, params: GetLastSeedParams) => {
  const appClient = new RandomnessBeaconClient(
    {
      resolveBy: "id",
      id: appId,
      sender: { addr, sk },
    },
    algodClient
  );
  return (await appClient.getLastSeed(params)).return;
};

interface GetFirstSeedParams {
  appId: number;
}

export const getFirstSeed = async (
  appId: number,
  params: GetFirstSeedParams
) => {
  const appClient = new RandomnessBeaconClient(
    {
      resolveBy: "id",
      id: appId,
      sender: { addr, sk },
    },
    algodClient
  );
  return (await appClient.getFirstSeed(params)).return;
};

interface GetSeedParams {
  appId: number;
}

export const getSeed = async (appId: number, params: GetSeedParams) => {
  const appClient = new RandomnessBeaconClient(
    {
      resolveBy: "id",
      id: appId,
      sender: { addr, sk },
    },
    algodClient
  );
  return (await appClient.get(params)).return;
};
