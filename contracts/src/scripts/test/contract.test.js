import { expect } from "chai";
import {
  deploy,
  setup,
  addSeed,
  getExactSeed,
  getLastSeed,
  getFirstSeed,
  getSeed,
  algodClient,
} from "../command.js";

describe("RandomnessBeacon Testing", function () {
  let deployOptions = {
    type: "RandomnessBeacon",
    name: "RandomnessBeacon",
    debug: false,
  };
  let contract;
  let appId;
  let counter = 0;
  const timestamp = Date.now();
  beforeEach(async function () {
    const { appId: id, appClient } = await deploy({
      ...deployOptions,
      debug: true,
      name: `RandomnessBeacon-${timestamp}-${counter}`,
    });
    appId = id;
    counter++;
    contract = appClient;
    expect(appId).to.not.equal(0);
  });
  it("can add seed", async function () {
    console.log(appId);
    const seed = new Uint8Array(
      Buffer.from("rDrNn28sKF38l4LAHlVqQPCF/smvvwIPoztoMdYwydE=", "base64")
    );
    const params = {
      round: 5236666,
      seed: seed,
    };
    await addSeed(appId, params);
    const exactSeed = await getExactSeed(appId, {
      round: params.round,
    });
    expect(exactSeed.toString()).to.equal(seed.toString());
    const lastSeed = await getLastSeed(appId);
    expect(lastSeed.toString()).to.equal(seed.toString());
    const firstSeed = await getFirstSeed(appId);
    expect(firstSeed.toString()).to.equal(seed.toString());
    const aseed = await getSeed(appId);
    expect(aseed.toString()).to.equal(seed.toString());
    // const bi = BigInt("0x" + Buffer.from(seed).toString("hex"));
    // for (let i = 0; i < 1000; i++) {
    //   const bi = BigInt("0x" + Buffer.from(seed).toString("hex"));
    //   const n = Math.floor(Number(bi) % i);
    //   console.log(i, n);
    // }
  });
});

describe("NoLoss Testing", function () {
  let deployOptions = {
    type: "NoLoss",
    name: "NoLoss",
    debug: false,
  };
  let contract;
  let appId;
  let counter = 0;
  const timestamp = Date.now();

  beforeEach(async function () {
    const { appId: id, appClient } = await deploy({
      ...deployOptions,
      debug: true,
      name: `NoLoss-${timestamp}-${counter}`,
    });
    appId = id;
    counter++;
    contract = appClient;
    expect(appId).to.not.equal(0);
  });

  afterEach(async function () {});

  it("Should successfully setup the contract", async function () {
    const params = {
      deadline: 1000,
      stakedToken: 1000,
      price: 1000,
      rewardToken: 1000,
      rewardAmount: 1000,
    };
    console.log(appId, params);
    const setupResult = await setup(Number(appId), params);
    console.log(setupResult);
    expect(setupResult).to.not.be.undefined;
    expect(setupResult.success).to.be.true;
    // assert initialized values
    const state = await contract.getState();
    console.log(state);
  });

  it("Should fail setup with invalid appId", async function () {
    try {
      await setup(0);
      expect.fail("Setup should have failed with invalid appId");
    } catch (error) {
      expect(error).to.exist;
    }
  });

  // TODO complete test coverage
});
