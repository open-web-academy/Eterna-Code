import React, { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function SolanaWalletButton () {
    return(
        <WalletMultiButton style={{"margin-left":"10px"}} />
    )
}