import React, { useState } from "react";
import  Modal  from "react-bootstrap/Modal";
import  Button  from "react-bootstrap/Button";
import { Prism } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useWriteContract, useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { abi } from "../../config/abi";

export default function OpenModalCode(props) {
  const onHide = props.onHide;
  const code = props.code;
  const modelName = props.modelName;
  const show = props.show;
  const account = useAccount();
  const { writeContract, isSuccess, isPaused } = useWriteContract();

  // Check if model exists
  const { data: modelData, isLoading: checkingModel } = useReadContract({
    address: '0xB59f727832e52EADA1bE6f1a62e1d1806a2d1dfa',
    abi,
    functionName: 'getCurrentText',
    args: [account.address, modelName],
    enabled: Boolean(modelName && account.address)
  });

  const handleSave = () => {
    const exists = Boolean(modelData && modelData[0]); // Check if model exists

    writeContract({ 
      address: '0xB59f727832e52EADA1bE6f1a62e1d1806a2d1dfa',
      abi,
      functionName: exists ? 'updateEntry' : 'createEntry',
      args: [modelName, code]
    });
  };

  const [widgetSrc, setWidgetSrc] = useState("");
  let codeFormated = code ? code.replace(/\n$/, "") : "";

  return (
    <Modal size="xl" centered scrollable show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {checkingModel ? 'Checking model...' : 
           modelData ? 'Updating existing model' : 'Creating new model'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <div>
          <div style={{height: "250px"}}>
            <Prism
              children={codeFormated}
              style={tomorrow}
              language="javascript"
              PreTag="div"
              showLineNumbers="true"
              codeTagProps = {{
                "fontSize": "10",
              }}
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button 
          variant="success" 
          onClick={handleSave}
          disabled={checkingModel || isPaused}
        >
          {modelData ? 'Update Model' : 'Create Model'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
