#!/bin/bash

docker build -t piercecave/pong_client .
echo "✅  Local Docker Build Complete"
docker push piercecave/pong_client
echo "✅  Local Docker Push Complete"
ssh -i ./../../../../AWS_Key_Pair.pem -oStrictHostKeyChecking=no ec2-user@pong.piercecave.com 'bash -s' < upgrade-server.sh 
echo "🎊  Client Deployment Complete!"
read -p "Press any key..."