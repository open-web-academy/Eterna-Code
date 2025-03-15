import React, { useEffect, useState } from "react";
import { Widget } from "near-social-vm";
import { useParams } from "react-router-dom";
import { useQuery } from "../hooks/useQuery";
import { useHashRouterLegacy } from "../hooks/useHashRouterLegacy";
import { Prism } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { abi } from "../config/abi";
import { useReadContract, useAccount } from 'wagmi'
import { set } from "local-storage";
import { create } from "zustand";

function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function isValidString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export default function ViewModelAIPage(props) {
  // 1. Todos los hooks primero
  useHashRouterLegacy();
  const { widgetSrc } = useParams();
  const query = useQuery();
  const [widgetProps, setWidgetProps] = useState({});
  const [code, setCode] = useState("");
  const account = useAccount();
  const [modelData, setModelData] = useState(null);

  // 2. Constantes derivadas de props y window
  const src = window?.InjectedConfig?.forcedWidget || 
              widgetSrc || 
              window?.InjectedConfig?.defaultWidget || 
              props.widgets.default;
              
  const showMenu = !window?.InjectedConfig?.hideMenu;
  const setWidgetSrc = props.setWidgetSrc;
  const viewSourceWidget = props.widgets.viewSource;
  const injectedProps = window?.InjectedConfig?.props;
  const srcValues = src.split('/');

  // 3. Validaciones
  const isAddressValid = isValidAddress(account.address);
  const isModelValid = isValidString(srcValues[1]);

  // 4. Hook de contrato después de validaciones
  const { data, isFetched, isFetching, error } = useReadContract({
    abi,
    address: '0xB59f727832e52EADA1bE6f1a62e1d1806a2d1dfa',
    functionName: 'getCurrentText',
    account: account.address,
    args: [srcValues[0], srcValues[1]],
  });

  // Efecto para manejar la actualización de modelData
  useEffect(() => {
    if (isFetched && data) {
      console.log(data)
      setModelData({name: data[0], code: data[1].replace(/\n$/, ""), created: data[2], updated: data[3]});
    }
  }, [isFetched, data]);

  // Efecto para widgetProps
  useEffect(() => {
    setWidgetProps(
      Object.assign(
        injectedProps || {},
        Object.fromEntries([...query.entries()])
      )
    );
  }, [query, injectedProps]);

  // 5. Efectos
  useEffect(() => {
    setTimeout(() => {
      setWidgetSrc(
        src === viewSourceWidget && query.get("src")
          ? {
              edit: query.get("src"),
              view: null,
            }
          : {
              edit: src,
              view: src,
            }
      );
      console.log(src)
      const code=`// Define the sigmoid activation function
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

// Define the derivative of the sigmoid function
function sigmoidPrime(x) {
  return x * (1 - x);
}

// Initialize random weights and biases
let InputHiddenWeights = [
  [Math.random(), Math.random(), Math.random()],
  [Math.random(), Math.random(), Math.random()],
];
let HiddenOutputWeight = [Math.random(), Math.random(), Math.random()];
let HiddenBias = [Math.random(), Math.random(), Math.random()];
let OutputBias = Math.random();

// Train the network using gradient descent
function train(inputs, targets, epochLimit = 10000, learningRate = 0.1) {
  for (let epoch = 0; epoch < epochLimit; epoch++) {
    for (let [x, y, target] of zip(inputs[0], inputs[1], targets)) {
      // Forward pass
      let HiddenLayer = InputHiddenWeights[0].map((w, i) =>
        sigmoid(x * w + y * InputHiddenWeights[1][i] + HiddenBias[i])
      );
      let Output = sigmoid(
        dotProduct(HiddenLayer, HiddenOutputWeight) + OutputBias
      );

      // Backward pass
      let OutputDelta = (Output - target) * sigmoidPrime(Output);
      let HiddenDeltas = HiddenLayer.map(
        (_, i) =>
          OutputDelta * HiddenOutputWeight[i] * sigmoidPrime(HiddenLayer[i])
      );

      // Update weights and biases
      HiddenOutputWeight = HiddenOutputWeight.map(
        (w, i) => w - learningRate * OutputDelta * HiddenLayer[i]
      );
      OutputBias -= learningRate * OutputDelta;
      InputHiddenWeights = InputHiddenWeights.map((input, i) => [
        input[0] - learningRate * HiddenDeltas[0] * x,
        input[1] - learningRate * HiddenDeltas[1] * x,
        input[2] - learningRate * HiddenDeltas[2] * x,
      ]);
      HiddenBias = HiddenBias.map(
        (bias, i) => bias - learningRate * HiddenDeltas[i]
      );

      // Log progress
      if (epoch % 1000 == 0) {
        console.log('Epoch: '+epoch+', Loss: '+(Output - target) ** 2);
      }
    }
  }
}

// Helper functions
function zip(...arrays) {
  return arrays[0].map((_, i) => arrays.map((array) => array[i]));
}

function dotProduct(a, b) {
  return a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);
}

// Train the XOR net
train(
  [
    [0, 0, 1, 1],
    [0, 1, 0, 1],
  ], //Inputs
  [0, 1, 1, 0], //Outputs
  10000, //Epoch limit
  0.1 //Learning rate
);
`
let codeFormated = code ? code.replace(/\n$/, "") : ""
setCode(codeFormated)
    }, 1);
  }, [src, query, setWidgetSrc, viewSourceWidget]);

  return (
    isFetched ?(
    modelData &&(
    <div className="p-5">
      <h1 className="fw-bold pb-2">{modelData.name}</h1>
      <div className="d-flex flex-row justify-content-between">
        <div className="pb-4">
          <h5 className="fw-bold">Owner:</h5>
          <p>{srcValues[0]}</p>
        </div>
      </div>
      <div className="pb-4">
        <p><b>Created at:</b>{parseInt(modelData.created)}</p>
        <p><b>Last update:</b>{parseInt(modelData.updated)}</p>
      </div>
      <div className="d-flex flex-row gap-2 pb-4">
        <button className="btn btn-success">Edit</button>
      </div>
      <div>
        <h5 className="fw-bold">AI Model Code</h5>
      </div>
      <Prism
        children={modelData.code}
        style={tomorrow}
        language="javascript"
        PreTag="div"
        showLineNumbers="true"
        codeTagProps = {{
          "fontSize": "10",
        }}
      />
      </div>
    )
    ) : (
      <h1>Loading...</h1>
    )
  );
}
