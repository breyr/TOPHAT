docker build -t capstone-fastapi .
docker run -d -p 8000:8000 --name capstone_app capstone-fastapi

curl -X POST http://localhost:8000/create_link \
     -H "Content-Type: application/json" \
     -d '{
       "ip1":"10.100.2.82",
       "ip2":"10.100.2.83",
       "port1":"Gig1/0/10",
       "port2":"Gig1/0/5",
       "username":"admin",
       "password":"cisco",
       "secret":"enable"
     }'