#!/bin/bash

export DOCKERNAME=$1

docker pull $DOCKERNAME/ponggateway
docker pull $DOCKERNAME/pongdatabase
echo "✅  Pulled Docker Containers"

docker rm -f ponggateway
docker rm -f pongdatabase
docker rm -f redisserver
echo "✅  Current Docker Containers Stopped & Removed"

docker volume rm $(docker volume ls -qf dangling=true)
echo "✅  Docker Volumes Removed"

docker network rm backendnetwork
echo "✅  Current Docker Network Stopped & Removed"

export HOST="pongdatabase"
export PORT="3306"
export USER="root"
export MYSQL_ROOT_PASSWORD="testpwd"
export DATABASE="pongdb"
export SESSIONKEY="key"
export REDISADDR="redisserver:6379"
export DSN="root:testpwd@tcp(pongdatabase:3306)/pongdb"
export TLSCERT=/etc/letsencrypt/live/pongapi.piercecave.com/fullchain.pem
export TLSKEY=/etc/letsencrypt/live/pongapi.piercecave.com/privkey.pem
echo "✅  Environment Variables Set"

docker network create -d bridge backendnetwork
echo "✅  Docker Network Created"

docker run -d --network backendnetwork --name pongdatabase -e MYSQL_USER=$USER -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD -e MYSQL_DATABASE=$DATABASE $DOCKERNAME/pongdatabase
docker run -d --network backendnetwork --name ponggateway -p 80:80 -p 443:443 -v /etc/letsencrypt:/etc/letsencrypt:ro -e TLSCERT=$TLSCERT -e TLSKEY=$TLSKEY -e REDISADDR=$REDISADDR -e SESSIONKEY=$SESSIONKEY -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD -e DSN=$DSN $DOCKERNAME/ponggateway
docker run -d --network backendnetwork --name redisserver redis
echo "✅  Docker Containers Successfully Running"