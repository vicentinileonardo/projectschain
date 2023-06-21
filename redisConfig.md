# show the occupied ports
netstat -an | grep LISTEN

# show the process id of the process using the port
lsof -i :6379

# kill the process
kill <PID>

# start redis stack
# option1: without saving config, probably problem with saving the snapshot
docker run -d --name redis-stack \
-p 6379:6379 -p 8001:8001 \
-v /Users/leonardovicentini/Desktop/Magistrale/Blockchain/Redis:/data \
redis/redis-stack:latest

# option2: latest, not good since could led to reproducibility issues
docker run -d --name redis-stack \
-p 6379:6379 -p 8001:8001 \
-v /Users/leonardovicentini/Desktop/Magistrale/Blockchain/Redis:/data \
-v /Users/leonardovicentini/Desktop/Magistrale/Blockchain/blockchain-project/redis.conf:/usr/local/etc/redis/redis.conf \
redis/redis-stack:latest \
redis-server /usr/local/etc/redis/redis.conf

# CURRENT OPTION, using a specific version
docker run -d --name redis-stack \
-p 6379:6379 \
-p 8001:8001 \
-v /Users/leonardovicentini/Desktop/Magistrale/Blockchain/Redis:/data \
-v /Users/leonardovicentini/Desktop/Magistrale/Blockchain/blockchain-project/redis.conf:/usr/local/etc/redis/redis.conf \
redis/redis-stack:6.2.6-v7 \
redis-server /usr/local/etc/redis/redis.conf

note: this works even if the container is stopped: when restarted, the data is still there
however, when the container is removed, the data is lost, even if the volume is still there
for the MVP, this is not a problem, in real life, backup policies should be implemented


# localize the .so file, it is the module to be loaded in the config file
find . -name rejson.so
