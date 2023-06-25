# get the ip address of the machine and store it in a env variable of the .env file
# on Mac OS, use the following command
IP_ADDRESS=$(ifconfig | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "\nIP_ADDRESS=$IP_ADDRESS" >> .env

# start the redis-stack container

#start the postgres container for the chainlink node
#start the chainlink node container

# start server
#start frontend