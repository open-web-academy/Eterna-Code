import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAccount } from "@gear-js/react-hooks";
import Button from 'react-bootstrap/Button';
import Identicon from '@polkadot/react-identicon';
import { useStore } from './state'
import { WalletModal } from '@gear-js/wallet-connect';
import '@gear-js/vara-ui/dist/style.css';


export function GearWalletButton() {
  const varaAccount = useAccount();
  const { account, setAccount } = useStore()
  const [modalShow, setModalShow] = React.useState(false);
  const [loggedAccount, setLoggedAccount] = useState(undefined);
  useEffect(() => {
    if(varaAccount.isAccountReady){
        setLoggedAccount(varaAccount.account);
        setAccount(varaAccount.account)
    }
  }, [varaAccount]);

  const logout = async () => {
    varaAccount.logout();
    setAccount(undefined)
  };


  return (
    <>
    <style type="text/css">
    {`
    .btn-login {
      background-color: #313438;
      color: white;
      font-size: 16px;
      padding: 10px;
      border-style: solid;
      border-radius: 4px;
      border-width: 1px;
      border-color: var(--slate-vara-1);
      font-weight: var(--font-weight-bold);
    }
    .btn-login:hover {
        background-color: white;
        color: black;
        border-style: solid;
        border-radius: 4px;
        border-width: 1px;
        border-color: var(--slate-vara-1);
      }

      .btn-varaWallet {
        background-color: #313438;
        color: white;
        font-size: 16px;
        padding: 10px;
        border-style: solid;
        border-radius: 4px;
        border-width: 1px;
        border-color: var(--slate-vara-1);
        font-weight: var(--font-weight-bold);
      }
      .btn-varaWallet:hover {
          background-color: white;
          color: black;
          border-style: solid;
          border-radius: 4px;
          border-width: 1px;
          border-color: var(--slate-vara-1);
        }
      .btn-varaWallet:hover::after {
          content: "Logout";
        }
    `}
    </style>
      {loggedAccount ? (
        <div>
          <Button variant="varaWallet" onClick={logout} className="d-flex flex-row gap-2 align-items-center">
            <Identicon value={loggedAccount.address} size={24} theme={"polkadot"}/>
            <p className="fw-semibold m-0">{loggedAccount.meta.name}</p>
          </Button>
          {/* <p>{loggedAccount.balance.value} Vara</p> */}
        </div>
      ) : (
        <Button variant="login" onClick={modalShow?() => setModalShow(false):() => setModalShow(true)}>
        {modalShow? "Close modal" : "Connect Vara Wallet"}
        </Button>
      )}
      {modalShow && <WalletModal theme='vara' close={() => setModalShow(false)} />}
    </>
  );
}
