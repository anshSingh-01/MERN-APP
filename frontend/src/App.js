import { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios'

function App() {
  const [datas , setData] = useState([])

  useEffect(()=>{
    // here the concept of proxy server came 
    axios.get('/api/data')
    .then((response)=>{
      // console.log(content)
      setData(response.data)
    })
    .catch((err)=> {
        console.log(err);
    })
  } , [datas])
  return (
    <div className="App">
     
        <h1>Data fetching</h1>
        <p> DATA : {datas.length}</p>
        {
           datas.map((data , index) => {
           return (     <div key={data.id}>
                  <h3>{data.title}</h3>
                  <h3>{data.content}</h3>
                </div>)
        })
        }
      
    </div>
  );
}

export default App;
