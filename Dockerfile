FROM ubuntu
MAINTAINER Thai Pangsakulyanont "org.yi.dttvb@gmail.com"
RUN apt-get update -y
RUN apt-get install -y libzmq-dev wget build-essential
RUN wget http://nodejs.org/dist/v0.10.26/node-v0.10.26-linux-x64.tar.gz -O- | (cd /usr/local && tar xvz --strip=1)
RUN npm install -g pm2 --unsafe-perms
ADD . /pushnot
RUN cd /pushnot && npm install
