import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { Logotype } from "../Logotype";
import { NavigationButton } from "../NavigationButton";
import { ArrowUpRight } from "../../icons/ArrowUpRight";
import { SignInButton } from "../SignInButton";
import { UserDropdown } from "./UserDropdown";
import { DevActionsDropdown } from "./DevActionsDropdown";
import { NotificationWidget } from "../NotificationWidget";
import { StarButton } from "../StarButton";
import { useAccount, useApi } from "@gear-js/react-hooks";
import { ProgramMetadata } from "@gear-js/api";
import { web3FromSource } from "@polkadot/extension-dapp";
import { Button } from "react-bootstrap";
import logo from "../../../images/ETERNACODE_LOGO-NEW.png";
import { GearWalletButton } from "../../varaNetwork/gearWalletButton";
import { SolanaWalletButton } from "../../solana/solanaWalletButton";
import Swal from "sweetalert2";

const StyledNavigation = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  background-color: var(--white-light-2);
  z-index: 1000;
  padding: 4px 0;

  .user-section {
    margin-left: auto;
    > button {
      font-size: 16px;
    }
  }

  .container {
    display: flex;
    align-items: center;

    .navigation-section {
      margin-left: 5px;
      display: flex;

      > div {
        > a {
          margin-right: 10px;
        }
      }
    }

    .user-section {
      display: flex;
      align-items: center;

      .nav-create-btn {
        margin-left: 10px;
      }

      .nav-sign-in-btn {
        margin-left: 10px;
      }
    }

    .arrow-up-right {
      margin-left: 4px;
    }
  }
`;

const StyledLogo = styled.img`
  height: 50px;
  margin-right: 10px;
`;

export function DesktopNavigation(props) {
  const varaAccount = useAccount();
  const varaApi = useApi();


  return (
    <StyledNavigation>
      <div className="container">
        <Link
          to="/"
          className="logo-link"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <StyledLogo src={logo} />
        </Link>
        <div className="navigation-section">
          <NavigationButton route="/">Home</NavigationButton>
          <NavigationButton route="/edit">Editor</NavigationButton>
          <NavigationButton route="/docs">Docs</NavigationButton>
          <GearWalletButton/>
          <SolanaWalletButton/>
        </div>
        <div className="user-section">
          <DevActionsDropdown {...props} />
          {!props.signedIn && (
            <SignInButton onSignIn={() => props.requestSignIn()} />
          )}
          {props.signedIn && (
            <>
              <UserDropdown {...props} />
            </>
          )}
        </div>
      </div>
    </StyledNavigation>
  );
}
