import axios from 'axios';
import React, {useState, useEffect} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import contractABI from "../Contract.json";
import Modal from "react-bootstrap/Modal";
import Button from 'react-bootstrap/Button';
import { mediaUrl } from '../api';
import { connectWallet, createWalletContract, EXPLORER_URL } from '../wallet';

const NFTDetails = () => {

  const [Products, setProducts] = useState([]);
  const [isRepair, setRepair] = useState(false);
  const [isCheck, setCheck] = useState(false);
  const [username, setUsername] = useState(null)
  const [acc, setAcc] = useState(null)
  const [response,setResponse] = useState([])
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state || {};
  const [trans,settrans]=useState(false);
  const date1=new Date(routeState.expiry_date);
  const date2=new Date();
  const [isShow, invokeModal] = React.useState(false)

  const initModal = () => {
     return invokeModal(!isShow)
  }
  const copyValue = value => { if (value && navigator.clipboard) navigator.clipboard.writeText(String(value)); }


  const getSingleProducts = async () => {
    if (!routeState.product_id) return;
    const { data } = await axios.get(`/api/product/${routeState.product_id}/`)
    console.log(data);
    setProducts(data);
  }

  async function transferHistory() {
    try {
      await connectWallet();
      const { web3, contract } = await createWalletContract(contractABI);
      const block = await web3.eth.getBlockNumber();
      const fromBlock = block > 999n ? block - 999n : 0n;
      const events = await contract.getPastEvents('Transfer', { fromBlock, toBlock: 'latest' });
      setResponse(events);
      settrans(true);
    } catch (error) { window.alert(error.message || 'Could not load transfer history.'); }
  }


  async function repair() {
    try {
      const account = await connectWallet();
      setRepair(account.toLowerCase() === String(routeState.acc_address).toLowerCase() && date1 > date2);
      setCheck(account.toLowerCase() !== String(routeState.acc_address).toLowerCase() || date1 <= date2);
    } catch (error) { window.alert(error.message || 'Could not connect MetaMask.'); }
  }

  async function transfer(receiverUsername, receiverAddress) {
    try {
      const account = await connectWallet();
      if (account.toLowerCase() !== String(routeState.acc_address).toLowerCase()) throw new Error('Switch MetaMask to the wallet that owns this token.');
      const { web3, contract } = await createWalletContract(contractABI);
      const receipt = await contract.methods.transfer(routeState.acc_address, receiverAddress, routeState.token_id).send({ from: account });
      await updateTransfer(receiverUsername, receiverAddress);
      window.alert(`Transfer confirmed: ${receipt.transactionHash}`);
    } catch (error) { window.alert(error.message || 'Token transfer failed.'); }
  }

  async function redeem() {
    try {
      const account = await connectWallet();
      if (account.toLowerCase() !== String(routeState.acc_address).toLowerCase()) throw new Error('Switch MetaMask to the wallet that owns this token.');
      const { contract } = await createWalletContract(contractABI);
      await contract.methods.applyExpiryDiscount(routeState.token_id).send({ from: account });
      await updateWarranty();
      await updateRedeem();
    } catch (error) { window.alert(error.message || 'Could not redeem this token.'); }
  }

  const updateWarranty=async ()=>{
    await axios({
      method: 'PUT',
      url: `/api/warranty/${routeState.token_id}/`,

  }).then(response => {
      alert('Surprise !! Your Warranty duration is extended !!')
      console.log(response.data);
      navigate('/UserProfile');
  })

  }
  const updateRedeem=async ()=>{
    await axios({
      method: 'PUT',
      url: `/api/redeem/${routeState.token_id}/`,

  }).then(response => {

      console.log(response.data);
      navigate('/UserProfile');
  })

  }

  const updateTransfer = async (username,acc) => {
    console.log(username,acc,routeState.token_id)

    await axios({
      method: 'PUT',
      url: `/api/nft/${routeState.token_id}/${username}/${acc}/update/`,

  }).then(response => {
      alert('Transfer Completed!!')
      console.log(response.data);
      navigate('/UserProfile');
  })

 }


  useEffect(() => {
    getSingleProducts();
    // The product id is supplied by the route state when this page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

    return (
      <main className="page-wrap"><div className="store-container">
      <div className="product-detail nft-detail">
          <div>
          <img className="product-detail-image" src={mediaUrl(Products.image)} alt={Products.name || 'Collectible'} />
          </div>
          <div className="product-detail-info">
          <p className="eyebrow">DIGITAL OWNERSHIP / WARRANTY</p><h1>{Products.name}</h1>
          <div className="onchain-panel"><h3>On-chain details</h3>
                <p><strong>Owner wallet:</strong> <span>{routeState.acc_address}</span> <button className="copy-button" onClick={() => copyValue(routeState.acc_address)}>Copy</button></p>
                <p><strong>Token ID:</strong> {routeState.token_id} <button className="copy-button" onClick={() => copyValue(routeState.token_id)}>Copy</button></p>
                <p><strong>Warranty expires:</strong> {routeState.expiry_date}</p>
                <p><strong>Time remaining:</strong> {routeState.diff}</p>
          </div>
                <p style={{fontFamily: "arial"}}>{Products.description}</p>
                <p className="product-price">Rs. {Products.price}</p>
          <p className="card-text" style={{fontFamily: "arial"}}><small className="text-muted">In case of any defect within the warranty period apply for
            repair/replacement!</small></p>

            <button style={{fontFamily: "arial",fontSize:14}} variant="outlined"
                     className="btn btn-outline-primary mr-2" disabled = {isRepair?true:false} onClick={()=>repair()}>
                     {isRepair?(
                        <p className="text-capitalize mb-0" disabled>
                          {""}
                          Repair initiated
                        </p>
                        ):(
                            <p className="text-capitalize mb-0" >Need Repair?</p>
                        )}</button>{' '}

                 <button style={{fontFamily: "arial",fontSize:14}} variant="outlined"
                     className="btn btn-outline-primary mr-2"onClick={initModal}>Transfer</button>{' '}
                      <Modal show={isShow}>
                        <Modal.Header closeButton onClick={initModal}>
                        <Modal.Title style={{fontFamily:"arial"}} >Add Receiver's Details</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>

                        <div>
                        <label style={{fontFamily:"arial",fontSize:14}}>Add Username:</label><br></br>
                            <div className="form-group">
                              <input style={{fontFamily: "arial",fontSize:14}}
                               type="text"
                               className="form-control form-control-lg"
                               placeholder="Enter Reciever's username"
                               name="username"
                               value={username}
                               onChange={(e) => setUsername(e.target.value)}

                              />
                            </div>
                            <label style={{fontFamily:"arial",fontSize:14}}>Add Receiver's Metamask Account address:</label><br></br>
                            <div className="form-group">
                              <input style={{fontFamily: "arial",fontSize:14}}
                               type="text"
                               className="form-control form-control-lg"
                               placeholder="Enter metamask account address"
                               name="acc"
                               value={acc}
                               onChange={(e) => setAcc(e.target.value)}

                              />
                            </div>
                        </div>

                        </Modal.Body>
                        <Modal.Footer>
                        <Button style={{fontFamily:"arial"}} variant="outlined" className="btn btn-outline-danger mb-3 px-5" onClick={initModal}>
                            Close
                        </Button>

                        <Button style={{fontFamily:"arial"}} variant="outlined" className="btn btn-outline-success mb-3 px-5"  onClick={() => transfer(username,acc)}>
                            Transfer
                        </Button>

                        </Modal.Footer>
                    </Modal>
                     <button style={{fontFamily: "arial",fontSize:14}}  variant="outlined"
                     className="btn btn-outline-primary mr-2"
                    onClick={() => transferHistory()}>See transfer History</button>{' '}
                    <button style={{fontFamily: "arial",fontSize:14}}  variant="outlined"  disabled = {routeState.redeem? false:true}
                       className="btn btn-outline-success mr-2" onClick={() => redeem()}>
                      {routeState.redeem?(
                        <p className="text-capitalize mb-0">
                          Redeem Gift</p>
                        ):(
                            <p className="text-capitalize mb-0" disabled>Already Redeemed</p>
                        )}</button><br></br>

                     <p> {isCheck?(
                        <p style={{fontFamily:"arial",color:"red"}} className="text-capitalize mb-0" disabled>
                          {""}<br></br>
                          Make sure you are connected with same metamask account. <br></br>if connected! then your warranty period is over!!! Repair cant be initiated.
                        </p>
                        ):(
                            <p className="text-capitalize mb-0" ></p>
                        )}</p>
                    <div >
                    {trans?(
                        <p style={{ color: 'red',fontFamily:"arial",fontSize:14}}>
                          {""}
                          Transfer history of this product is as follows:
                        </p>
                        ):(
                            <p></p>
                        )}
                    </div>
                    <div>
                      {response.filter(res => res.returnValues[0] !== "0x0000000000000000000000000000000000000000"
                        && res.returnValues[1] !== "0x0000000000000000000000000000000000000000").map((res, index) => {
                          return <div key={`${res.returnValues[2]}-${index}`} style={{ color: 'Brown',fontFamily:"arial",fontSize:12}}>
                          <p>{index}</p>
                          <p>from :{res.returnValues[0]}</p>
                          <p>to :{res.returnValues[1]}</p>
                          <p>Token ID :{res.returnValues[2]}</p>
                        </div>;

                      })}
                    </div>

          </div>
      </div></div></main>

    );
};

export default NFTDetails;
