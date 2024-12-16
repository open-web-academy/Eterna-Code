import { Account, useAccount, useApi } from "@gear-js/react-hooks";
// import { KeyringPair, KeyringPair$Json } from '@polkadot/keyring/types';
import { KeyringPair, KeyringPair$Json } from '@polkadot/keyring/types';
import { Sails, ZERO_ADDRESS } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";
import { decodeAddress, GearApi, GearKeyring, HexString, IUpdateVoucherParams } from "@gear-js/api";

/**
 * ## Query options
 */
//export interface QueryI {
    /**
     * ### Contract id
     */
    //contractId: HexString;
    /**
     * ### Contract idl
     */
    //idl: string;
    /**
     * ### Contract service name to call
     */
    //serviceName: string;
    /**
     * ### Method name from contract service
     */
    //methodName: string;
    /**
     * ### User address to bind in the query - Optional
     * If not provided, will send the ZERO address in the query
     */
    //userAddress?: HexString;
    /**
     * ### Query arguments - Optional
     * If not provided, will not send arguments in the query
     */
    //args?: any[];
//}

/**
 * ## Command options
 */
//export interface CommandI {
    /**
     * ### Contract id
     */
    //contractId: HexString;
    /**
     * ### Contract idl
     */
    //idl: string;
    /**
     * ### Contract service name to call
     */
    //serviceName: string;
    /**
     * ### Method name from contract service
     */
    //methodName: string;
    /**
     * ### Command arguments - Optional
     * If not provided, will not send arguments in the command
     */
    //args?: any[];
    /**
     * ### Command signer - Optional
     * If not provided, connected account from extension will be used by default
     */
    //account?: Account | KeyringPair;
    /**
     * ### Command value - Optional
     * Send tokens in the message
     * If not provided, 0 is sent by default
     */
    //value?: bigint,
    /**
     * ### Command gas fees - Optional
     * If not provided, gas will be calculated automatically for message
     */
    //gasLimit?: bigint,
    /**
     * ### Command voucher - Optional
     * If not provided, transaction will be sent without voucher
     */
  //  voucherId?: HexString
//}

/**
 * # useMulticontractSails Hook
 * @returns Util functions to work with sails, vouchers, signless and walletless feature
 */
export const useMulticontractSails = () => {
    const { api: gearApi } = useApi();
    const { account: connectedAccount } = useAccount();

    /**
     * ## Function to read state with a query
     * @param options query options
     * @returns query result
     */
    const sendQuery = async (options) => {
        return new Promise(async (resolve, reject) => {
            if (!gearApi) return reject('Api is not ready');

            const {
                contractId,
                idl,
                serviceName,
                methodName,
                userAddress,
                args
            } = options;

            const parser = await SailsIdlParser.new();
            const sails = new Sails(parser);

            sails.setApi(gearApi);
            sails.parseIdl(idl);
            sails.setProgramId(contractId);

            try {
                const services = Object.keys(sails.services);

                if (services.indexOf(serviceName) === -1) {
                    reject(`Service does not exists: '${serviceName}'\nServices: [${services}]`);
                    return;
                }

                const queries = Object.keys(sails.services[serviceName].queries);

                if (queries.indexOf(methodName) === -1) {
                    reject(`Query does not exists in ${serviceName}: '${methodName}'\nQueries: [${queries}]`);
                    return;
                }
                
                const queryMethod = sails
                    .services[serviceName]
                    .queries[methodName];

                const address = userAddress
                    ? userAddress
                    : ZERO_ADDRESS;

                const queryResponse = args
                    ? await queryMethod(address, undefined, undefined, ...args)
                    : await queryMethod(address);

                resolve(queryResponse);
            } catch (e) {
                reject(e.message);
            }
        })
    }

    /**
     * ## Funtion to send a command
     * @param options command options
     * @returns transaction result
     */
    const sendCommand = async (options) => {
        return new Promise(async (resolve, reject) => {
            if (!gearApi) return reject('Api is not ready');

            const {
                contractId,
                idl,
                serviceName,
                methodName,
                args,
                account,
                value,
                gasLimit,
                voucherId
            } = options;

            const parser = await SailsIdlParser.new();
            const sails = new Sails(parser);
            
            sails.setApi(gearApi);
            sails.parseIdl(idl);
            sails.setProgramId(contractId);
        
            let transaction;

            try {
                const services = Object.keys(sails.services);

                if (services.indexOf(serviceName) === -1) {
                    reject(`Service does not exists: '${serviceName}'\nServices: [${services}]`);
                    return;
                }

                const functions = Object.keys(sails.services[serviceName].functions);

                if (functions.indexOf(methodName) === -1) {
                    reject(`Function does not exists in ${serviceName}: '${methodName}'\nFunctions: [${functions}]`);
                    return;
                }
                
                
                transaction = args
                    ? sails.services[serviceName].functions[methodName](...args)
                    : sails.services[serviceName].functions[methodName]();
            } catch (e) {
                reject('Error when building command');
                return;
            }
            
            if (account) {
                if ('signer' in account) {
                    const { address, signer } = account;
                    transaction.withAccount(decodeAddress(address), { signer });
                } else {
                    transaction.withAccount(account);
                }
            } else {
                if (!connectedAccount) return reject("Account is not found");

                const { decodedAddress, signer } = connectedAccount;
                transaction.withAccount(decodedAddress, { signer });
            }

            if (value) transaction.withValue(value);

            if (gasLimit) {
                transaction.withGas(gasLimit);
            } else {
                await transaction.calculateGas();
            }

            if (voucherId) transaction.withVoucher(voucherId);

            try {
                resolve(await transaction.signAndSend());
            } catch (e) {
                reject(e.message);
            }
            
        })
    }

    /**
     * ## Create new voucher
     * @param sponsorName sponsor name to sign the transaction
     * @param sponsorMnemonic sponsor mnemonic to sign the transaction
     * @param userAddress user address
     * @param contractsId contracts id to bind the voucher
     * @param initialTokensInVoucher voucher initial tokens (needs more than one)
     * @param initialExpiredTimeInBlocks voucher initial expiration time (in blocks)
     * @returns voucher id
     */
    const generateVoucher = (
        sponsorName,
        sponsorMnemonic,
        userAddress,
        contractsId,
        initialTokensInVoucher,
        initialExpiredTimeInBlocks
    ) => {
        return new Promise(async (resolve, reject) => {
            const sponsorSigner = await GearKeyring.fromMnemonic(sponsorMnemonic, sponsorName);

            if (!gearApi) {
                reject('Gear api is not initialized');
                return;
            }
           
            if (initialTokensInVoucher < 2) {
                reject('Min limit of initial tokens is 2');
                return;
            }

            if (initialExpiredTimeInBlocks < 20) {
                reject('Min limit of blocks is 20');
                return;
            }

            const voucherIssued = await gearApi.voucher.issue(
                userAddress,
                1e12 * initialTokensInVoucher,
                initialExpiredTimeInBlocks,
                contractsId
            );

            try {
                await signVoucherAction(
                    voucherIssued.extrinsic,
                    sponsorSigner
                );

                resolve(voucherIssued.voucherId);
            } catch (e) {
                reject(e);
            }
        });
    };

    /**
     * ## Renew voucher an amout of blocks
     * @param sponsorName sponsor name to sign the transaction
     * @param sponsorMnemonic sponsor mnemonic to sign the transaction
     * @param userAddress user address
     * @param voucherId voucher id
     * @param numOfBlocks num of blocks to renew the voucher 
     * @returns void
     */
    const renewVoucherAmountOfBlocks = (
        sponsorName,
        sponsorMnemonic,
        userAddress,
        voucherId,
        numOfBlocks,
    ) => {
        return new Promise(async (resolve, reject) => {
            const sponsorSigner = await GearKeyring.fromMnemonic(sponsorMnemonic, sponsorName);

            if (!gearApi) {
                reject('Gear api is not initialized');
                return;
            }
            
            if (numOfBlocks < 20) {
                reject('Minimum block quantity is 20!');
                return;
            }

            const newVoucherData = {
                prolongDuration: numOfBlocks,
            };

            const voucherUpdate = gearApi.voucher.update(userAddress, voucherId, newVoucherData);

            try {
                await signVoucherAction(
                    voucherUpdate,
                    sponsorSigner
                );

                resolve();
            } catch (e) {
                reject(e);
            }
        });
    };

    /**
     * ## Add tokens in voucher
     * @param sponsorName sponsor name to sign the transaction
     * @param sponsorMnemonic sponsor mnemonic to sign the transaction
     * @param userAddress user address
     * @param voucherId voucher id
     * @param numOfTokens tokens to add to the voucher
     * @returns void
     */
    const addTokensToVoucher = (
        sponsorName,
        sponsorMnemonic,
        userAddress,
        voucherId, 
        numOfTokens,
    ) => {
        return new Promise(async (resolve, reject) => {
            const sponsorSigner = await GearKeyring.fromMnemonic(sponsorMnemonic, sponsorName);

            if (!gearApi) {
                reject('Gear api is not initialized');
                return;
            }

            if (numOfTokens < 0) {
                reject('Cant assign negative tokens!');
                return;
            }

            const newVoucherData = {
                balanceTopUp: 1e12 * numOfTokens
            };

            const voucherUpdate = gearApi.voucher.update(userAddress, voucherId, newVoucherData);

            try {
                await signVoucherAction(
                    voucherUpdate,
                    sponsorSigner
                );

                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }  

    /**
     * ## Vouchers id from contract and user address
     * @param userAddress user address
     * @param contractId contract id
     * @returns vouchers id from contract and user address
     */
    const vouchersInContract = (
        userAddress, 
        contractId
    ) => {
        return new Promise(async (resolve, reject) => {
            if (!gearApi) {
                reject('Gear api is not initialized');
                return;
            }

            const vouchersData = await gearApi
                .voucher
                .getAllForAccount(
                    userAddress, 
                    contractId
                );

            const vouchersId = Object.keys(vouchersData);
            
            resolve(vouchersId);
        });
    }

    /**
     * ## Voucher is expired
     * @param userAddress user address
     * @param voucherId voucher id
     * @returns boolean - if voucher is expired
     */
    const voucherIsExpired = (
        userAddress, 
        voucherId
    ) => {
        return new Promise(async (resolve, reject) => {
            if (!gearApi) {
                reject('Gear api is not initialized');
                return;
            }

            const voucherData = await gearApi
                .voucher
                .getDetails(userAddress, voucherId);
            const blockHash = await gearApi
                .blocks
                .getFinalizedHead();
            const blocks = await gearApi
                .blocks
                .getBlockNumber(blockHash.toU8a);

            resolve(blocks.toNumber() > voucherData.expiry);
        });
    }

    /**
     * ## Voucher balance
     * @param voucherId voucher id
     * @returns balance from voucher id
     */
    const voucherBalance = (voucherId) => {
        return new Promise(async (resolve, reject) => {
            if (!gearApi) {
                reject('Gear api is not initialized');
                return;
            }

            const voucherBalance = await gearApi.balance.findOut(voucherId);
            const voucherBalanceFormated = Number(
                BigInt(voucherBalance.toString()) / 1_000_000_000_000n
            );

            resolve(voucherBalanceFormated);
        });
    }

    const signVoucherAction = (extrinsic, sponsorSigner) => {
        return new Promise(async (resolve, reject) => {
            try {
                await extrinsic.signAndSend(sponsorSigner, async (event) => {
                    console.log(event.toHuman());
                    const extrinsicJSON = event.toHuman();
                    if (extrinsicJSON && extrinsicJSON.status !== 'Ready') {
                        const objectKey = Object.keys(extrinsicJSON.status)[0];
                        if (objectKey === 'Finalized') {
                            resolve();
                        }
                    }
                });
            } catch (e) {
                console.error(e);
                reject('Error while sign voucher action');
            }
        });
    }

    /**
     * ## Create a new keyringpair
     * @param nameOfSignlessAccount keyringpair's name
     * @returns new keyringpair
     */
    const createNewKeyringPair = (nameOfSignlessAccount) => {
        return new Promise(async (resolve, reject) => {
            try {
                const name = nameOfSignlessAccount
                    ? nameOfSignlessAccount
                    : 'signlessPair';
                const newPair = await GearKeyring.create(name);
                resolve(newPair.keyring);
            } catch (e) {
                console.log("Error creating new account pair!");
                reject(e);
            }
        });
    }

    /**
     * ## Lock Keyringpair
     * @param pair keyringpair
     * @param password password to lock the keyringpair
     * @returns locked keyringpair
     */
    const lockkeyringPair = (pair, password) => {
        return pair.toJson(password);
    }

    /**
     * ## Unlocks keyringpair   
     * @param pair locked keyringpair
     * @param password password to unlock the locked keyringpair
     * @returns unlocked keyringpair
     */
    const unlockKeyringPair = (pair, password) => {
        return GearKeyring.fromJson(pair, password);
    }

    /**
     * ## Format keyringPair from contract
     * @param signlessData formated keyringpair account from contract
     * @param signlessName keyringpair's name
     * @returns correct locked keyringpair format
     */
    const formatContractSignlessData = (signlessData, signlessName) => {
        const temp = {
            encoding: {
                content: ['pkcs8','sr25519'],
                type: ['scrypt','xsalsa20-poly1305'],
                version: '3'
            },
            meta: {
                name: signlessName
            }
        };

        const formatEncryptedSignlessData = Object.assign(signlessData, temp);

        return formatEncryptedSignlessData;
    }

    /**
     * ## Modify KeyringPair
     * @param pair Locked keyringPair
     * @returns Formated KeyringPair to send to the signless-walletless service in the contract
     * Returns the formated locked keyringpair account to be able to send it to the contract (security)
     */
    const modifyPairToContract = (pair) => {
        const signlessToSend = JSON.parse(JSON.stringify(pair));
        delete signlessToSend['encoding'];
        delete signlessToSend['meta'];
    
        return signlessToSend;
    }

    return {
        sails: {
            sendCommand,
            sendQuery
        },
        voucherUtils: {
            generateVoucher,
            renewVoucherAmountOfBlocks,
            addTokensToVoucher,
            vouchersInContract,
            voucherIsExpired,
            voucherBalance
        },
        signlessUtils: {
            createNewKeyringPair,
            lockkeyringPair,
            unlockKeyringPair,
            formatContractSignlessData,
            modifyPairToContract
        }
    }
}