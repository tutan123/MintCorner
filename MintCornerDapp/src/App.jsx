import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import { stark, uint256, AccountInterface, constants } from "starknet"
import './styles/App.css';
import ethLogo from './assets/ethlogo.png';
import twitterLogo from './assets/twitter-logo.svg';
import { useConnectors, useAccount, useNetwork, useTransactionReceipt } from '@starknet-react/core';

// Constants
const TWITTER_HANDLE = 'mintcorners';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

window.chainLogo = {};
chainLogo = ethLogo;

const NFT_ADDRESS = '0x071dd985caa45b1583a337a4497974bc8d50e786d5f3d3e53971cdb333858ebd';

const App = () => {
  const [value, setValue] = useState();
  const [minted, setMinted] = useState(false)

  const { connect, connectors, disconnect, available, refresh } = useConnectors()
  const { account, address, status } = useAccount()
  const { chain } = useNetwork()
  const [hash, setHash] = useState(undefined)
  const { data, loading, error } = useTransactionReceipt({ hash, watch: true })

  useEffect(() => {
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [refresh])

	// Create a function to render if wallet is not connected yet
	const renderNotConnectedContainer = () => (
		<div className="connect-wallet-container">
      <br></br>
      {available.map((connector) => (
        <div key={connector.id()}>
        <button className="cta-button connect-wallet-button" key={connector.id()} onClick={() => connect(connector)}>
          Connect {connector.id()}
        </button>
        </div>
      ))}
    </div>
	);

	// Form to enter domain name and data
	const renderInputForm = () => {
		if (chain.name !== 'StarkNet Görli') {
      console.log('chain:', chain)
			return (
				<div className="connect-wallet-container">
        <p>Please Switch to Starknet Goerli Testnet</p>
      </div>
			);
		}
		return (
			<div className="form-container">
            <button className='cta-button mint-button' onClick={claimNFT}>
              Mint
            </button> 
      </div>
		);
	}

  const mintedTip = () => {
    return (
      <p>Minted Successfuly!</p>
    )
  }
  
  const claimNFT = async () => {
    // console.log(chain)
    console.log(account)
    try {
      // const uint = uint256.bnToUint256(ethers.utils.parseEther(value)._hex);
      const callTx = await account.execute(
        {
            contractAddress: NFT_ADDRESS,
            entrypoint: "mint",
            calldata: stark.compileCalldata({
              to: address,
              tokenId: [Math.random() * 1000000]
            })
          }
      );
      const status = await account.waitForTransaction(callTx.transaction_hash);
      console.log(status)
      if (status.status === 'PENDING') {
        setMinted(() => {return true});
      }
      else {}
    }
    catch (error) {
      console.log(error);
    }
  }
    
	return (
		<div className="App">
			<div className="container">

				<div className="header-container">
          <header>
            <div className="left">
              <p className="title">✨ MintCorner</p><br></br>
              <p className="subtitle">This is a NFT Mint DAPP which alows you to mint an NFT on Starknet!</p>
            </div>
            {/* Display a logo and wallet connection status*/}
            <div className="right">
              <img alt="Network logo" className="logo" src={chainLogo} />
              { status == 'connected' ? <button onClick = {disconnect} className = 'ru-button'> Wallet: {address.slice(0, 6)}...{address.slice(-4)}</button> : <p> Not Connected </p> }
            </div>
          </header>
        </div>
      

        {!(status == 'connected') && renderNotConnectedContainer()}
        {(status == 'connected') && renderInputForm()}
        {minted && mintedTip()}

        <div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built with @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
}

export default App;
