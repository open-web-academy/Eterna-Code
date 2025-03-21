import React from "react";
import { useAccount, useApi } from "@gear-js/react-hooks";
import { ProgramMetadata } from "@gear-js/api";
import { web3FromSource, web3Enable } from "@polkadot/extension-dapp";
import Swal from "sweetalert2";

export const Interaction = ({ trigger, children }) => {
  const varaAccount = useAccount();
  const varaApi = useApi();
  const testFunction = (data) => {
    console.log(data);
    return data;
  };

  const getAccountInfo = () =>{
    return varaAccount.account
  }

  const readState = async (programId, meta, params) => {
    let readParams
    if(params==""||params==undefined){
      readParams = { programId: programId }
    }
    else{
      readParams = { programId: programId, payload: params }
    }
    const metadata = ProgramMetadata.from(meta);
    const info = (
      await varaApi.api.programState.read(
        readParams,
        metadata
      )
    ).toJSON();
    return info;
  };

  const signTransaction = async (programId, meta, params, gas, value) => {
    // const programIDFT =
    //   "0x4c2e3903604069a39a82540bbdcae9fe02d19541cf1212ad89a5db58d2b90b25";
    //0x4c2e3903604069a39a82540bbdcae9fe02d19541cf1212ad89a5db58d2b90b25
    // const meta =
    //   "00010001000000000001030000000107000000000000000108000000a90b3400081466745f696f28496e6974436f6e66696700000c01106e616d65040118537472696e6700011873796d626f6c040118537472696e67000120646563696d616c73080108753800000400000502000800000503000c081466745f696f204654416374696f6e000118104d696e74040010011075313238000000104275726e040010011075313238000100205472616e736665720c011066726f6d14011c4163746f724964000108746f14011c4163746f724964000118616d6f756e74100110753132380002001c417070726f7665080108746f14011c4163746f724964000118616d6f756e74100110753132380003002c546f74616c537570706c790004002442616c616e63654f66040014011c4163746f724964000500001000000507001410106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004001801205b75383b2033325d0000180000032000000008001c081466745f696f1c46544576656e74000110205472616e736665720c011066726f6d14011c4163746f724964000108746f14011c4163746f724964000118616d6f756e74100110753132380000001c417070726f76650c011066726f6d14011c4163746f724964000108746f14011c4163746f724964000118616d6f756e74100110753132380001002c546f74616c537570706c790400100110753132380002001c42616c616e63650400100110753132380003000020081466745f696f3c496f46756e6769626c65546f6b656e00001801106e616d65040118537472696e6700011873796d626f6c040118537472696e67000130746f74616c5f737570706c791001107531323800012062616c616e6365732401505665633c284163746f7249642c2075313238293e000128616c6c6f77616e6365732c01905665633c284163746f7249642c205665633c284163746f7249642c2075313238293e293e000120646563696d616c730801087538000024000002280028000004081410002c00000230003000000408142400";
    //00010001000000000001030000000107000000000000000108000000a90b3400081466745f696f28496e6974436f6e66696700000c01106e616d65040118537472696e6700011873796d626f6c040118537472696e67000120646563696d616c73080108753800000400000502000800000503000c081466745f696f204654416374696f6e000118104d696e74040010011075313238000000104275726e040010011075313238000100205472616e736665720c011066726f6d14011c4163746f724964000108746f14011c4163746f724964000118616d6f756e74100110753132380002001c417070726f7665080108746f14011c4163746f724964000118616d6f756e74100110753132380003002c546f74616c537570706c790004002442616c616e63654f66040014011c4163746f724964000500001000000507001410106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004001801205b75383b2033325d0000180000032000000008001c081466745f696f1c46544576656e74000110205472616e736665720c011066726f6d14011c4163746f724964000108746f14011c4163746f724964000118616d6f756e74100110753132380000001c417070726f76650c011066726f6d14011c4163746f724964000108746f14011c4163746f724964000118616d6f756e74100110753132380001002c546f74616c537570706c790400100110753132380002001c42616c616e63650400100110753132380003000020081466745f696f3c496f46756e6769626c65546f6b656e00001801106e616d65040118537472696e6700011873796d626f6c040118537472696e67000130746f74616c5f737570706c791001107531323800012062616c616e6365732401505665633c284163746f7249642c2075313238293e000128616c6c6f77616e6365732c01905665633c284163746f7249642c205665633c284163746f7249642c2075313238293e293e000120646563696d616c730801087538000024000002280028000004081410002c00000230003000000408142400
    const metadata = ProgramMetadata.from(meta);
    const message = {
      destination: programId, // programId
      payload: params,
      gasLimit: gas,
      value: value,
    };
    await web3Enable('Eternacode')
    const transferExtrinsic = await varaApi.api.message.send(message, metadata);
    const injector = await web3FromSource(varaAccount.account.meta.source);
     transferExtrinsic
      .signAndSend(
        varaAccount.account?.address ?? console.log("no hay cuenta"),
        { signer: injector.signer },
        ({ status }) => {
          if (status.isInBlock) {
            console.log("transaccion en bloque");
            Swal.fire({
              toast: true,
              position: "top-end",
              title: "Executing transaction",
              text: status.asInBlock.toString(),
              showConfirmButton: false,
              icon: "info",
              timer: 7000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
              },
            });
            //alert.success(status.asInBlock.toString());
          } else {
            if (status.type === "Finalized") {
              console.log("finalizada");
              //alert.success(status.type);
              Swal.fire({
                toast: true,
                position: "top-end",
                title: "Transaction executed",
                text: status.type,
                showConfirmButton: false,
                icon: "success",
                timer: 7000,
                timerProgressBar: true,
                didOpen: (toast) => {
                  toast.onmouseenter = Swal.stopTimer;
                  toast.onmouseleave = Swal.resumeTimer;
                },
              });
            }
          }
        }
      ).catch((err) => {
        console.log(":( transaction failed", err);
        Swal.fire({
          toast: true,
          position: "top-end",
          title: "Transaction failed",
          text: err,
          showConfirmButton: false,
          icon: "error",
          timer: 7000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
      });
  };

  const varaInteraction = {
    testFunction,
    readState,
    signTransaction,
    getAccountInfo,
  };
  return (
    <>
      {trigger(varaInteraction)}
      {children}
    </>
  );
};
