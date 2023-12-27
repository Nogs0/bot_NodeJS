const express = require("express");

console.log("sssssssssssssssssssss");

const app = express();  

app.get('/', (request, response) => {
    return response.json({message: 'Server is up'});
})   

app.listen(3333)