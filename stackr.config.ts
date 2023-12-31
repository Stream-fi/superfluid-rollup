import { KeyPurpose, SignatureScheme, StackrConfig } from "@stackr/stackr-js";

// this file is generated by the deployment script
import * as deployment from "./deployment.json";

const stackrConfig: StackrConfig = {
  stackrApp: {
    appId: deployment.app_id,
    appInbox: deployment.app_inbox,
  },
  builder: {
    batchSize: 1,
    batchTime: 1000,
  },
  syncer: {
    slotTime: 1000,
    vulcanRPC: "http://vulcan.stf.xyz",
    L1RPC: "http://rpc.stf.xyz",
  },
  operator: {
    accounts: [
      {
        privateKey:
          "8bc97316dc6e535d41f94965495644310227b157e7b48a3f3c7acd1aaf77864c", // address: 0x8C6De00BE37d5fbE39056a88EdF9E66B66cCecaA
        purpose: KeyPurpose.BATCH,
        scheme: SignatureScheme.ECDSA,
      },
    ],
  },
  domain: {
    name: "FlowUp",
    version: "1",
    chainId: 69420,
    verifyingContract: deployment.app_inbox,
    salt: "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  },
  datastore: {
    filePath: "./datastore",
  },
};

export { stackrConfig };
