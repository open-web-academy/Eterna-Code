import React, { useCallback, useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { Prism } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

export const SaveCodeModal = (props) => {
    console.log(props)
    const {show, handleClose, code} = props
    let codeFormated = code ? code.replace(/\n$/, "") : ""
  return (
    <Modal size="xl" centered scrollable show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Saving model data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <div>
            <Prism
              children={codeFormated}
              style={tomorrow}
              language="javascript"
              PreTag="div"
              showLineNumbers="true"
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-success">Save Data</button>
        <button
          className="btn btn-secondary"
          onClick={handleClose}
        >
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};
