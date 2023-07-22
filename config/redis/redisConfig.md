# show the occupied ports
netstat -an | grep LISTEN

# show the process id of the process using the port
lsof -i :6379

# kill the process
kill <PID>

# start redis stack
# [NOT IN USE] [OPTION 1]: without saving config, probably problemS with saving the snapshot
docker run -d --name redis-stack \
-p 6379:6379 -p 8001:8001 \
-v /Users/leonardovicentini/Desktop/Magistrale/Blockchain/Redis:/data \
redis/redis-stack:latest

# [NOT IN USE] [OPTION 2]: using latest image, not good since could led to reproducibility issues
docker run -d --name redis-stack \
-p 6379:6379 -p 8001:8001 \
-v /Users/leonardovicentini/Desktop/Magistrale/Blockchain/Redis:/data \
-v /Users/leonardovicentini/Desktop/Magistrale/Blockchain/projectschain/config/redis.conf:/usr/local/etc/redis/redis.conf \
redis/redis-stack:latest \
redis-server /usr/local/etc/redis/redis.conf

# [IN USE] [CURRENT OPTION], using a specific version

generic:

docker run -d --name redis-stack \
-p 6379:6379 \
-p 8001:8001 \
-v <path-to-local-folder-to-mount>:/data \
-v <path-to-local-project-folder>/projectschain/config/redis/redis.conf:/usr/local/etc/redis/redis.conf \
redis/redis-stack:6.2.6-v7 \
redis-server /usr/local/etc/redis/redis.conf


personal (machine: mac M1):

docker run -d --name redis-stack \
-p 6379:6379 \
-p 8001:8001 \
-v /Users/leonardovicentini/Desktop/Magistrale/Blockchain/Redis:/data \
-v /Users/leonardovicentini/Desktop/Magistrale/Blockchain/projectschain/config/redis/redis.conf:/usr/local/etc/redis/redis.conf \
redis/redis-stack:6.2.6-v7 \
redis-server /usr/local/etc/redis/redis.conf

note: this works even if the container is stopped or removed since the dump of the redis data is stored (and recovered) in the mounted folder


# localize the .so file, it is the module to be loaded in the config file
docker exec -it redis-stack sh
find . -name rejson.so
find . -name redisearch.so
