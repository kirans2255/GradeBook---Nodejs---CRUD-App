const http = require('http');
const fs = require('fs');
const url = require('url');

const server = http.createServer((req, res) => {
    if (req.url === '/') { //check url in root

        fs.readFile('index.html', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('Error loading the HTML file.');
            }
            else {
                res.writeHead(200, { 'Content-Type': 'text/html' })
                res.write(data)
                res.end()
            }
        })
    }

    else if (req.method === 'GET' && req.url === '/userData') {
        //import here that json file then i can send to front end
        fs.readFile('pk.json', (err, userData) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('Error loading the HTML file.');
            } else {
                res.writeHead(200, { 'content-Type': 'application/json' })
                res.write(userData);
                res.end();
            }
        })

    }



    else if (req.method == 'POST' && req.url === '/submit') {
        let body = ''; //created variable in empty string 
        req.on('data', (data) => { //data chunks in body
            body += data; // body copied to this body string
        })
        req.on('end', () => { // recieved the body 
            //try ,catch method bcz its synchronous 
            try {
                const recievedData = JSON.parse(body) //parse the recieved json string to js object 
                console.log(recievedData);//log the data

                //read the existing data from json file 
                fs.readFile('pk.json', (err, eData) => {
                    if (err) {
                        console.error('Error processing data', err);
                        res.writeHead(500, { 'Content-Type': 'text/plain' })
                        res.end('error processing EXISTINGDATA')

                    } else {
                        let existingData = []
                        existingData = JSON.parse(eData) //preveious json data
                        const newId = existingData.length + 1;
                        recievedData.id = newId
                        existingData.push(recievedData) //pushed new user file to same array as object 

                        //updated array to database json file 
                        fs.writeFile('pk.json', JSON.stringify(existingData, null, 2), (writeError) => {
                            if (writeError) {
                                console.error('Error processing data', writeError);
                                res.writeHead(500, { 'Content-Type': 'text/plain' })
                                res.end('error while writing updated data to json file')

                            } else {
                                console.log("data updated to json file successfully");
                                res.writeHead(200, { 'Content-Type': 'text/plain' })
                                res.end("data recieved and saved")
                            }
                        })

                    }
                })

            }
            catch (error) {
                console.error('Error processing data', error);
                res.writeHead(500, { 'Content-Type': 'text/plain' })
                res.end('error processing DATA')
            }

        })

    }

    else if (req.url == "/open") {
        fs.readFile('open.html', (err, tableData) => {
            if (err) {
                console.error('Error processing data', err);
                res.writeHead(500, { 'Content-Type': 'text/html' })
                res.end("error")

            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(tableData)
                res.end();
            }
        })
    }


    //request to delete the user in database
    else if (req.method === 'DELETE' && req.url.startsWith('/deleteUser')) {
        const parsedUrl = url.parse(req.url, true); //parse the url and returns withobject
        const userId = parseInt(parsedUrl.pathname.split('/').pop(), 10);//user id extracting
        console.log("user id to delete", userId);
        const users = require('./pk.json');
        const upDatedUsers = users.filter(userFind => userFind.id !== userId)//NOW FILTERED THE ALL OBEJCT IN THIS VARIABLE,EXCEPT THIS ID(RECIEVED) CONTAINS

        for (var i = 0; i < upDatedUsers.length; i++) {
            upDatedUsers[i].id = i + 1
        }

        const upDatedUsersJSON = JSON.stringify(upDatedUsers, null, 2); //json format converted
        //2 NUMBER OF SPACES,NULL MEANS NOT ALTERING DURUING CONVERTION
        //NOW upDatedUsersJSON CONTAIN DATA TO REPLEC IN DATABASE


        fs.writeFile('pk.json', upDatedUsersJSON, (error) => { //read the data base and over wruted bew database 
            if (error) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end("error");
            } else {
                console.log("deleted the user details");
                res.end()
            }
        })
    }


    //request to modify the database
    else if (req.method === 'PUT' && req.url.startsWith('/modifyUser')) {
        const parsedUrl = url.parse(req.url, true); //parse the url and returns with object
        const userId = parseInt(parsedUrl.pathname.split('/').pop(), 10);//ITS TAKE THE GIVEN USER ID FRIOM THIS AND MAKE IT AN INTEGER WITH HELP OF BASE 10

        // reading the sented new type data
        let body = '';
        req.on('data', (data) => {
            body += data;
        });

        req.on('end', () => {
            try {
                const updatedUserData = JSON.parse(body);//parsed the content wand saved in variable 

                // read the existing data
                fs.readFile('pk.json', (err, userData) => {
                    if (err) {
                        console.error('Error reading user data', err);
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Error reading user data.');
                    } else {
                        let existingData = JSON.parse(userData);//old data stored
                        //NEED TO FIND THE COMING ID BELONGS TO WHICH OBJECT

                        // searching for that object
                        for (let i = 0; i < existingData.length; i++) { //THIS I ITERATE THROUGH EACH OBJECT AND FINFD THE OBJECT CONTAIN PROPEERTY ID
                            if (existingData[i].id === userId) {
                                existingData[i] = updatedUserData;//FINDED THE WHOLE OBJECT AND REPLACED OR OVER WRITED BY THE NEW DATA IN THAT VARIABLE
                                break;
                            }
                        }

                        //existing data has updated so it is to write in data base 
                        fs.writeFile('pk.json', JSON.stringify(existingData, null, 2), (writeError) => {
                            if (writeError) {
                                console.error('Error writing updated data', writeError);
                                res.writeHead(500, { 'Content-Type': 'text/plain' });
                                res.end('Error writing updated data to JSON file.');
                            } else {
                                console.log('User data updated successfully.');
                                res.writeHead(200, { 'Content-Type': 'text/plain' });
                                res.end('User data updated successfully.');
                            }
                        });
                    }
                });
            } catch (error) {
                console.error('Error processing data', error);
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Error processing data.');
            }
        });
    }


    else { //request url doesnt match
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('not found')
    }
})


server.listen(2000, () => {
    console.log("server is running");
})