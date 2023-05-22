import React, { useState , useCallback , useRef , useEffect} from 'react';
import './App.css';
import {db} from './firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { storage } from "./firebase";
import { toPng } from 'html-to-image';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  list,
} from "firebase/storage";
import 'bootstrap/dist/css/bootstrap.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

function App() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [randomNumber, setRandomNumber] = useState('');
  const [userComment, setComment] = useState('');
  const [score, setScore] = useState(0);
  const [isFirstTweet, setIsFirstTweet] = useState(true);
  const [data, setData] = useState([]);

  const divRef = useRef(null)

  const CaptureScreen = useCallback(async(name) => {
    return new Promise( async (resolve, reject) => {
      if (divRef.current === null) {
        return
      }
     

      const dataUrl = await toPng(divRef.current, { cacheBust: true });
     
      

    const storageRef = ref(storage, "images/"+name);
    // Convert the data URL to a Blob
    const blob = await (await fetch(dataUrl)).blob();

    uploadBytes(storageRef,blob ).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
       resolve(url);
      });
    });

    
      // Perform further actions with the download URL, such as saving it in a database or displaying it to the user
  

    });
    
  
  }, [ref])

  const handleTweet = async (data) => {
  
  

    // Post the tweet using the desired method (e.g., using the Twitter API)

    console.log(data)   
    try {
      const url="https://us-central1-twitter-game-ed473.cloudfunctions.net/handleTweets"
      fetch(url, {
				method: "POST",
				mode: "no-cors",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
				},
				body: JSON.stringify(data),
			})
      // Process the response from the Cloud Function
    } catch (error) {
      console.error(error);
      // Handle any errors
    }
  };




  const Login = () => {
    return new Promise((resolve, reject) => {
      // Perform login logic here
      // When login is successful, call resolve() with the credential
      // When there's an error, call reject() with the error
      var provider = new firebase.auth.TwitterAuthProvider();
      console.log("aut")
      firebase.auth().signInWithPopup(provider)
      .then(function(result) {
       
          const token = result.credential.accessToken;
          const secretAccesToken = result.credential.secret;
         
         
          const credential= {
            accessToken:token,
            secretAccesToken:secretAccesToken
          }
          resolve(credential)
       }).catch(function(error) {
          console.log(error.code)
          console.log(error.message)
       });
    });
    // Configure FirebaseUI options

  }

  const checkUserWallet = async (wallet)=>{
    setWalletAddress(wallet)
    let userSnap= await db.collection('User').doc(wallet).get()
    let user= userSnap.data()
    if(user){
      setIsFirstTweet(true)
      setFirstName(user.firstName)
      setLastName(user.lastName)
     
      setScore(user.score)
    }else(
      setIsFirstTweet(false)
    )

  }

 async function saveDataToFirestore(data) {

    const credential= await Login()
    console.log(credential)
    let image = await CaptureScreen(data.walletAddress)
    console.log(image)
  
    console.log(data)
    
    //check if the user already exist in the database
    const userSnap= await db.collection('User').doc(data.walletAddress).get();
    const user = userSnap.data()
    if(user){
      //if user exist increment the score with 77
      const score= user.score
       data={
        ...data,
        score:score+77,
        credential:credential
       }
    }else{
      //if not give it 77 as it's the first time he tweets
      data={
        ...data,
        score:77,
        credential:credential
        
      }
    }
    await db.collection('User').doc(data.walletAddress).set(data).then(()=>{
      data['image']=image
      console.log(data)
      handleTweet(data)
    })
    
    
  }

  const generateRandomNumber = () => {
    const randomNum = Math.floor(Math.random() * 99999) + 1;
    const formattedNum = randomNum.toString().padStart(5, '0');
    setRandomNumber(formattedNum);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      firstName,
      lastName,
      walletAddress,
      randomNumber,
      userComment
    };

    saveDataToFirestore(data);

   
  };





  useEffect(() => {
    // Fetch data from Firestore
    const fetchData = async () => {
      try {
        const snapshot = await db.collection('User').orderBy('score', 'desc')
          .limit(10).get();
        const scores = snapshot.docs.map((doc) => doc.data());
        setData(scores);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);



 

  return (
    <div className="App" ref={divRef}>
      <header className="App-header" style={{"width":"100%"}} >
      <div className="" style={{ "display":"flex" , "justifyContent":"space-between"  ,"width":"60%" }}>
      <div className="form-frame">
      <h1>Post a tweet</h1>
        <form className="tweet-form">
        <div className="mb-3">
        <label className="form-label">
          Wallet Address:
          <input
            type="text"
            className="form-control"
            value={walletAddress}
            onChange={(e) => checkUserWallet(e.target.value)}
          />
        </label>
      </div>

      { !isFirstTweet?(
        <>
        <div className="mb-3">
        <label className="form-label">
          First Name:
          <input
            type="text"
            className="form-control"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </label>
      </div>
      <div className="mb-3">
        <label className="form-label">
          Last Name:
          <input
            type="text"
            className="form-control"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </label>
      </div>
    
      <div className="mb-3">
        <label className="form-label">
          Tweet Comment:
          <textarea
            type="text"
            className="form-control"
            value={userComment}
            onChange={(e) => setComment(e.target.value)}
          />
        </label>
      </div>
      <div className="mb-3">
        <label className="form-label">
          Random Number:
          <input
            type="text"
            className="form-control random-number-input"
            value={randomNumber}
            readOnly
          />
        </label>
        <br/>
        <button
        type="button"
        className="btn btn-success"
        onClick={generateRandomNumber}
      >
        Generate number
      </button>
      </div>
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleSubmit}
      >
        Tweet
      </button>
        </>
      ):(
        <>
        
      <div className="mb-3">
      <label className="form-label">
        Your Score:
        <input
          type="text"
          className="form-control"
          value={score}
          
        />
      </label>
      <div className="mb-3">
      <label className="form-label">
        Tweet Comment:
        <textarea
          type="text"
          className="form-control"
          value={userComment}
          onChange={(e) => setComment(e.target.value)}
        />
      </label>
    </div>
    </div>
        <div className="mb-3">
        <label className="form-label">
          Random Number:
          <input
            type="text"
            className="form-control random-number-input"
            value={randomNumber}
            readOnly
          />
        </label>
        <br/>
        <button
        type="button"
        className="btn btn-success"
        onClick={generateRandomNumber}
      >
        Generate number
      </button>
      </div>
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleSubmit}
      >
        Tweet
      </button>
        </>

      )
    }
      

        
        </form>
      </div>
      <div className=""  >
      <h1>Highest score</h1>
        <br />
        <table>
      <thead>
        <tr>
          <th> Wallet address</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td>{item. walletAddress}</td>
            <td>{item.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
      
      </div>
    
        </div>
      </header>
    </div>
  );
}

export default App;
