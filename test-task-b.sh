#!/bin/bash

echo "🧪 Testing Task B Endpoints..."
echo ""

# Test 1: Register and get token
echo "1️⃣ POST /auth/register"
RESPONSE=$(curl -s -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "taskb@eventora.com",
    "password": "TaskB123!",
    "name": "Task B Tester",
    "phone": "+9999999999",
    "role": "ADMIN",
    "clinicId": "cm5hc5h3y0000l808dwzrp0qw"
  }')

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Response: $RESPONSE"
echo "Token extracted: ${TOKEN:0:50}..."
echo ""

# Test 2: GET /auth/me
echo "2️⃣ GET /auth/me"
curl -s -X GET http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 3: POST /auth/refresh
echo "3️⃣ POST /auth/refresh"
curl -s -X POST http://localhost:4000/api/v1/auth/refresh \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 4: GET /dashboard/stats
echo "4️⃣ GET /dashboard/stats"
curl -s -X GET http://localhost:4000/api/v1/dashboard/stats \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 5: POST /auth/logout
echo "5️⃣ POST /auth/logout"
curl -s -X POST http://localhost:4000/api/v1/auth/logout \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

echo "✅ Task B Testing Complete!"
