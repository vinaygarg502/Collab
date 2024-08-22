const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 4000 });

var collabData = {};
// {
//     17322:{ // Tenant ID
//             132123:{ //Table Id
//                 24234:{ //USer Id
//                     row:2,
//                     cell:3
//                 }
//             }
//     }
// }

server.on('connection', (ws) => {
    console.log('A new client connected');

  
    ws.send('Welcome to the WebSocket server!');


    ws.on('message', (data) => {
        console.log("Received message =>",data.toString());
        try{
            const responseData = data && data.toString();
            const response = responseData && responseData.includes("data")? JSON.parse(responseData)  : {};
            if(response && response.data){
                updateCollabData(response.data,{...collabData})
            }
        }catch(err){
            console.log("err",err)
        }
  
        server.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(collabData));
            }
        });
    });

    ws.on('close', () => {
        console.log('A client disconnected');
    });

    // Handle connection errors
    ws.on('error', (error) => {
        console.log('WebSocket error:', error);
    });

    function updateCollabData(data,collabDataParam){
        console.log("data",JSON.stringify(data))
        var gridData = {
            row: data.row,
            cell:data.cell,
            userName:data.userName
        }
        if(collabDataParam[data.tenantId]){
            if(collabDataParam[data.tenantId][data.tableId]){
                if(collabDataParam[data.tenantId][data.tableId][data.userId]){
                    collabDataParam[data.tenantId][data.tableId][data.userId] = gridData; 
                }else{
                    collabDataParam[data.tenantId][data.tableId] = {
                        ...collabDataParam[data.tenantId][data.tableId],
                        [data.userId]:gridData
                    }
                }
            }else{
                collabDataParam[data.tenantId] = {
                    ...collabDataParam[data.tenantId],
                    [data.tableId]:{
                        [data.userId]:gridData
                    }
                }
            }
        }else{
            collabDataParam={
                ...collabDataParam,
                [data.tenantId]:{
                    [data.tableId]:{
                        [data.userId]:gridData
                    }
                }
            }
        }
        collabData = {...collabDataParam};
        console.log("updated collab data",JSON.stringify(collabData));
    }

});

console.log('WebSocket server is running on ws://localhost:4000');
