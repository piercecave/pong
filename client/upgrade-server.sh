#!/bin/bash
docker rm -f pong_client
echo "✅  Current Docker Container Stopped & Removed"
docker pull piercecave/pong_client
echo "✅  Lastest Docker Image Pulled To Server"
docker run -d --name pong_client -p 443:443 -p 80:80 -v /etc/letsencrypt:/etc/letsencrypt:ro piercecave/pong_client
echo "✅  Updated Docker Container Successfully Running"