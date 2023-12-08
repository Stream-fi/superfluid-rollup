import { ActionSchema, FIFOStrategy, MicroRollup } from "@stackr/stackr-js";
import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { stackrConfig } from "../stackr.config";
import { FlowUpNetwork, flowupSTF } from "./state";
import { StateMachine } from "@stackr/stackr-js/execution";
const cors = require("cors");

// this file is generated by the deployment script
import * as genesisState from "../genesis-state.json";

const rollup = async () => {
  const flowupFsm = new StateMachine({
    state: new FlowUpNetwork(genesisState.state),
    stf: flowupSTF,
  });

  const actionSchemaType = {
    from: "String",
    type: {
      move: "String",
      stream: "String",
    },
    params: {
      move: {
        amount: "Uint",
      },
      stream: {
        flowRate: "Uint",
      },
      to: "String",
    },
    nonce: "Uint",
  };

  // {
  //   from: string;
  //   type: {
  //     move?: "mint" | "burn" | "transfer";
  //     stream?: "create" | "update" | "delete";
  //   };
  //   params:{
  //     move?: {
  //       amount: number;
  //     };
  //     stream?: {
  //       flowRate?: number;
  //     };
  //     to: string;
  //   }
  //   nonce: number;
  //   actualTimestamp: number; // this is the timestamp of the block that the action is included in
  // }

  const actionInput = new ActionSchema("update-flowup", actionSchemaType);

  const buildStrategy = new FIFOStrategy();

  const { state, actions, events } = await MicroRollup({
    config: stackrConfig,
    useState: flowupFsm,
    useAction: actionInput,
    useBuilder: { strategy: buildStrategy, autorun: true },
    useSyncer: { autorun: true },
  });
  
  return { state, actions };
};

const app = express();
const corsOptions = {
  origin: true, // or true to allow any origin
  optionsSuccessStatus: 200,
};
app.options("*", cors(corsOptions)); // Enable pre-flight for all routes
app.use(cors(corsOptions));
app.use(bodyParser.json());
const { actions, state } = await rollup();

app.get("/", (req: Request, res: Response) => {
  res.send({ allAccounts: state.get().state.getState() });
});

app.post("/", async (req: Request, res: Response) => {
  const schema = actions.getSchema("update-flowup");

  if (!schema) {
    res.status(400).send({ message: "error" });
    return;
  }

  try {
    console.log(req.body);
    let newObj = { ...req.body.payload, actualTimestamp: Date.now() };
    req.body.payload = newObj;
    console.log(req.body);
    const newAction = schema.newAction(req.body);
    const ack = await actions.submit(newAction);
    res.status(201).send({ ack });
  } catch (e: any) {
    res.status(400).send({ error: e.message });
  }
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});

// actionEventsEmitter.on(ActionEvents.SUBMIT_ACTION, (data) => {
//   console.log("submit_action - Event triggered : ", data.payload);
// });

// executorEventsEmitter.on(ExecutorEvents.EXECUTE_SINGLE, (data) => {
//   console.log("execute_single - Event triggered : ", data);
// });
