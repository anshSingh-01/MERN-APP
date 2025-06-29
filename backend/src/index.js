import dotenv from 'dotenv'
dotenv.config({
        path : './.env'
})
import {connectDb} from './db/Db.js'
import {PORT} from './constants.js'
import {app} from './app.js'



// connecting the DB (this fuction send promises)
connectDb()
.then( () => {
                app.listen(PORT , () =>{
                console.log("Listening at Port : " ,PORT  );
})
} )
.catch((err) =>{
        console.error(err.message);
})


// initializing server at port 8080


app.get('/' , (req , res) => {
        // res.send(req.params)
        const body = req.header
        res.send(`<h1>HELLO WORLD</h1><br><h2>${body.name}<h2>`);  
})

app.get('/api/data' , (req , res) => {
        // res.send(req.params)
       const datas =  [{
                id : 1,
                title : 'Jhon Wick',
                content : 'Movie'
        }]
        res.send(datas)
})





