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
export const algodClient = new algosdk.Algodv2(process.env.ALGOD_TOKEN ||
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", algodServerURL, algodServerPort);
const indexerServerURL = process.env.INDEXER_SERVER || ALGO_INDEXER_SERVER;
const indexerServerPort = process.env.INDEXER_PORT || ALGO_INDEXER_PORT;
export const indexerClient = new algosdk.Indexer(process.env.INDEXER_TOKEN || "", indexerServerURL, indexerServerPort);
export const deploy = async (options) => {
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
    const clientParams = {
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
export const setup = async (appId, params) => {
    const appClient = new NoLossClient({
        resolveBy: "id",
        id: appId,
        sender: { addr, sk },
    }, algodClient);
    await appClient.setup({
        deadline: Number(params.deadline),
        stakedToken: Number(params.stakedToken),
        price: Number(params.price),
        rewardToken: Number(params.rewardToken),
        rewardAmount: Number(params.rewardAmount),
    });
};
export const addSeed = async (appId, params) => {
    const appClient = new RandomnessBeaconClient({
        resolveBy: "id",
        id: appId,
        sender: { addr, sk },
    }, algodClient);
    await appClient.addSeed(params);
};
export const getExactSeed = async (appId, params) => {
    const appClient = new RandomnessBeaconClient({
        resolveBy: "id",
        id: appId,
        sender: { addr, sk },
    }, algodClient);
    return (await appClient.getExactSeed(params)).return;
};
export const getLastSeed = async (appId, params) => {
    const appClient = new RandomnessBeaconClient({
        resolveBy: "id",
        id: appId,
        sender: { addr, sk },
    }, algodClient);
    return (await appClient.getLastSeed(params)).return;
};
export const getFirstSeed = async (appId, params) => {
    const appClient = new RandomnessBeaconClient({
        resolveBy: "id",
        id: appId,
        sender: { addr, sk },
    }, algodClient);
    return (await appClient.getFirstSeed(params)).return;
};
export const getSeed = async (appId, params) => {
    const appClient = new RandomnessBeaconClient({
        resolveBy: "id",
        id: appId,
        sender: { addr, sk },
    }, algodClient);
    return (await appClient.get(params)).return;
};
