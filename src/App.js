import React, { useCallback, useEffect, useState } from "react";
import "error-polyfill";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@near-wallet-selector/modal-ui/styles.css";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-bootstrap-typeahead/css/Typeahead.bs5.css";
import "bootstrap/dist/js/bootstrap.bundle";
import "App.scss";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import EditorPage from "./pages/EditorPage";
import EditorAIPage from "./pages/EditorAIPage";
import ViewPage from "./pages/ViewPage";
import ViewModelAIPage from './pages/ViewModelAIPage'
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMintbaseWallet } from "@near-wallet-selector/mintbase-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupNeth } from "@near-wallet-selector/neth";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupModal } from "@near-wallet-selector/modal-ui";
import EmbedPage from "./pages/EmbedPage";
import {
  useAccount,
  useInitNear,
  useNear,
  utils,
  EthersProviderContext,
} from "near-social-vm";
import Big from "big.js";
import { NavigationWrapper } from "./components/navigation/NavigationWrapper";
import { Footer } from "./components/navigation/Footer";
import { NetworkId, Widgets, WssVara } from "./data/widgets";
import { useEthersProviderContext } from "./data/web3";
import SignInPage from "./pages/SignInPage";
import { isValidAttribute } from "dompurify";
import { ApiProvider, AccountProvider, useAccount as varaAccount } from "@gear-js/react-hooks";
import { GearWalletButton } from "./components/varaNetwork/gearWalletButton"
import { VaraProvider } from "./components/navigation/VaraProvider";
import { VaraNetwork } from './components/varaNetwork/VaraNetwork'
import {ReadState} from './components/varaNetwork/ReadState'
import Main from './components/documentation/Main'
import {config} from './config/Web3ProviderConfig'
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import ContractReader from "./components/ContractReader";
import TestModelPage from "./pages/TestModelPage";
import SearchModelsPage from "./pages/SearchModelsPage";

export const refreshAllowanceObj = {};
const documentationHref = "https://social.near-docs.io/";

function App(props) {
  const queryClient = new QueryClient();
  const [connected, setConnected] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [signedAccountId, setSignedAccountId] = useState(null);
  const [availableStorage, setAvailableStorage] = useState(null);
  const [walletModal, setWalletModal] = useState(null);
  const [widgetSrc, setWidgetSrc] = useState(null);

  const ethersProviderContext = useEthersProviderContext();
  const { initNear } = useInitNear();
  const near = useNear();
  const account = useAccount();

  const accountId = account.accountId;



  useEffect(() => {
    initNear &&
      initNear({
        networkId: NetworkId,
        selector: setupWalletSelector({
          network: NetworkId,
          modules: [
            setupNearWallet(),
            setupMintbaseWallet(),
            setupMyNearWallet(),
            setupSender(),
            setupHereWallet(),
            setupMeteorWallet(),
            setupNeth({
              gas: "300000000000000",
              bundle: false,
            }),
            setupNightly(),
          ],
        }),
        customElements: {
          Link: (props) => {
            if (!props.to && props.href) {
              props.to = props.href;
              delete props.href;
            }
            if (props.to) {
              props.to =
                typeof props.to === "string" &&
                isValidAttribute("a", "href", props.to)
                  ? props.to
                  : "about:blank";
            }
            return <Link {...props} />;
          },
          GearWalletButton: (props) => {
            return <GearWalletButton {...props} />;
          },
          VaraProvider: (props) => {
            return <VaraProvider {...props} />;
          },
          VaraNetwork: (props) => {
            return <VaraNetwork {...props}/>;
          },
          "VaraNetwork.Account": (props) => {
            return <VaraNetwork.Account {...props}/>;
          },
          "VaraNetwork.Wrapper": (props) => {
            return <VaraNetwork.Wrapper {...props}/>;
          },
          "VaraNetwork.Provider": (props) => {
            return <VaraNetwork.Provider {...props}/>;
          },
          "VaraNetwork.Interaction": (props) => {
            return <VaraNetwork.Interaction {...props}/>;
          },
          "VaraNetwork.ReadState": (props) => {
            return <VaraNetwork.ReadState {...props}/>;
          },
          "VaraNetwork.Identicon": (props) => {
            return <VaraNetwork.Identicon {...props}/>
          },
          "VaraNetwork.SailsInteraction": (props) => {
            return <VaraNetwork.SailsInteraction {...props}/>
          },
        },
        config: {
          defaultFinality: undefined,
        },
      });
  }, [initNear]);

  useEffect(() => {
    if (!near) {
      return;
    }
    near.selector.then((selector) => {
      setWalletModal(
        setupModal(selector, { contractId: near.config.contractName })
      );
    });
  }, [near]);

  const requestSignIn = useCallback(
    (e) => {
      e && e.preventDefault();
      walletModal.show();
      return false;
    },
    [walletModal]
  );

  const logOut = useCallback(async () => {
    if (!near) {
      return;
    }
    const wallet = await (await near.selector).wallet();
    wallet.signOut();
    near.accountId = null;
    setSignedIn(false);
    setSignedAccountId(null);
  }, [near]);

  const refreshAllowance = useCallback(async () => {
    alert(
      "You're out of access key allowance. Need sign in again to refresh it"
    );
    await logOut();
    requestSignIn();
  }, [logOut, requestSignIn]);
  refreshAllowanceObj.refreshAllowance = refreshAllowance;

  useEffect(() => {
    if (!near) {
      return;
    }
    setSignedIn(!!accountId);
    setSignedAccountId(accountId);
    setConnected(true);
  }, [near, accountId]);

  useEffect(() => {
    setAvailableStorage(
      account.storageBalance
        ? Big(account.storageBalance.available).div(utils.StorageCostPerByte)
        : Big(0)
    );
  }, [account]);

  const passProps = {
    refreshAllowance: () => refreshAllowance(),
    setWidgetSrc,
    signedAccountId,
    signedIn,
    connected,
    availableStorage,
    widgetSrc,
    logOut,
    requestSignIn,
    widgets: Widgets,
    documentationHref,
  };

  return (
    <div className="App">
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider theme="rounded">
            <ApiProvider initialArgs={{ endpoint: WssVara }}>
              <AccountProvider>
                <EthersProviderContext.Provider value={ethersProviderContext}>
                  <Router basename={process.env.PUBLIC_URL}>
                    <Switch>
                      <Route path={"/signin"}>
                        <NavigationWrapper {...passProps} />
                        <SignInPage {...passProps} />
                        <Footer/>
                      </Route>
                      <Route path={"/embed/:widgetSrc*"}>
                        <EmbedPage {...passProps} />
                        <Footer/>
                      </Route>
                      <Route path={"/edit/:widgetSrc*"}>
                        <NavigationWrapper {...passProps} />
                        <EditorPage {...passProps} />
                        <Footer/>
                      </Route>
                      <Route path={"/editai/:widgetSrc*"}>
                        <NavigationWrapper {...passProps} />
                        <EditorAIPage {...passProps} />
                        <Footer/>
                      </Route>
                      <Route path={"/docs/:docsRoute*"}>
                        <NavigationWrapper {...passProps} />
                        <Main {...passProps} />
                        <Footer/>
                      </Route>
                      <Route path={"/searchmodel"}>
                        <NavigationWrapper {...passProps} />
                        <SearchModelsPage {...passProps} />
                        <Footer/>
                      </Route>
                      <Route path={"/aimodel/:widgetSrc*"}>
                        <NavigationWrapper {...passProps} />
                        <TestModelPage {...passProps} />
                        <Footer/>
                      </Route>
                      <Route path={"/:widgetSrc*"}>
                        <NavigationWrapper {...passProps} />
                        <ViewPage {...passProps} />
                        <Footer/>
                      </Route>
                    </Switch>
                  </Router>
                </EthersProviderContext.Provider>
              </AccountProvider>
            </ApiProvider>
          </ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
}

export default App;
