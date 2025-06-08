#!/usr/bin/env python3
import requests
import json
import sys
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from frontend/.env to get the backend URL
frontend_env_path = Path('/app/frontend/.env')
load_dotenv(frontend_env_path)

# Get the backend URL from environment variables
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL')
if not BACKEND_URL:
    print("Error: REACT_APP_BACKEND_URL not found in frontend/.env")
    sys.exit(1)

# Ensure the URL ends with /api
API_URL = f"{BACKEND_URL}/api"
print(f"Using API URL: {API_URL}")

def test_root_endpoint():
    """Test the root API endpoint"""
    print("\n=== Testing Root Endpoint ===")
    try:
        response = requests.get(f"{API_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "message" in response.json(), "Response does not contain 'message' field"
        assert response.json()["message"] == "Hello World", f"Expected 'Hello World', got {response.json()['message']}"
        
        print("✅ Root endpoint test passed")
        return True
    except Exception as e:
        print(f"❌ Root endpoint test failed: {str(e)}")
        return False

def test_status_post_endpoint():
    """Test the POST /status endpoint"""
    print("\n=== Testing POST Status Endpoint ===")
    try:
        data = {"client_name": "TestClient"}
        response = requests.post(f"{API_URL}/status", json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "id" in response.json(), "Response does not contain 'id' field"
        assert "client_name" in response.json(), "Response does not contain 'client_name' field"
        assert "timestamp" in response.json(), "Response does not contain 'timestamp' field"
        assert response.json()["client_name"] == "TestClient", f"Expected 'TestClient', got {response.json()['client_name']}"
        
        print("✅ POST status endpoint test passed")
        return True, response.json()["id"]
    except Exception as e:
        print(f"❌ POST status endpoint test failed: {str(e)}")
        return False, None

def test_status_get_endpoint(expected_id=None):
    """Test the GET /status endpoint"""
    print("\n=== Testing GET Status Endpoint ===")
    try:
        response = requests.get(f"{API_URL}/status")
        print(f"Status Code: {response.status_code}")
        print(f"Response contains {len(response.json())} status checks")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert isinstance(response.json(), list), "Response is not a list"
        
        # If we have an expected ID from a previous POST, verify it exists in the response
        if expected_id:
            found = False
            for status in response.json():
                if status.get("id") == expected_id:
                    found = True
                    break
            assert found, f"Could not find status with ID {expected_id} in the response"
            print(f"✅ Successfully found status with ID {expected_id}")
        
        print("✅ GET status endpoint test passed")
        return True
    except Exception as e:
        print(f"❌ GET status endpoint test failed: {str(e)}")
        return False

def test_cors_configuration():
    """Test CORS configuration"""
    print("\n=== Testing CORS Configuration ===")
    try:
        # Instead of OPTIONS, use a GET request with Origin header to test CORS
        headers = {"Origin": "http://example.com"}
        response = requests.get(f"{API_URL}/", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin')}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert 'Access-Control-Allow-Origin' in response.headers, "Access-Control-Allow-Origin header not found"
        
        # Check if the CORS headers allow our origin or use a wildcard
        allow_origin = response.headers.get('Access-Control-Allow-Origin')
        assert allow_origin == '*' or allow_origin == 'http://example.com', f"Expected '*' or 'http://example.com', got {allow_origin}"
        
        print("✅ CORS configuration test passed")
        return True
    except Exception as e:
        print(f"❌ CORS configuration test failed: {str(e)}")
        return False

def test_mongodb_connectivity():
    """Test MongoDB connectivity by verifying data persistence"""
    print("\n=== Testing MongoDB Connectivity ===")
    try:
        # First, post a new status check
        data = {"client_name": "MongoDBTest"}
        post_response = requests.post(f"{API_URL}/status", json=data)
        assert post_response.status_code == 200, f"Expected status code 200, got {post_response.status_code}"
        
        new_id = post_response.json()["id"]
        print(f"Created status check with ID: {new_id}")
        
        # Then, get all status checks and verify our new one is there
        get_response = requests.get(f"{API_URL}/status")
        assert get_response.status_code == 200, f"Expected status code 200, got {get_response.status_code}"
        
        found = False
        for status in get_response.json():
            if status.get("id") == new_id:
                found = True
                break
        
        assert found, f"Could not find status with ID {new_id} in the response"
        print(f"✅ Successfully verified data persistence for status with ID {new_id}")
        
        print("✅ MongoDB connectivity test passed")
        return True
    except Exception as e:
        print(f"❌ MongoDB connectivity test failed: {str(e)}")
        return False

def run_all_tests():
    """Run all tests and return overall result"""
    print("\n=== Running All Backend Tests ===")
    
    tests = [
        ("Root Endpoint", test_root_endpoint),
        ("Status POST Endpoint", lambda: test_status_post_endpoint()[0]),
        ("Status GET Endpoint", test_status_get_endpoint),
        ("CORS Configuration", test_cors_configuration),
        ("MongoDB Connectivity", test_mongodb_connectivity)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\nRunning test: {test_name}")
        result = test_func()
        results.append(result)
        print(f"Test {test_name}: {'PASSED' if result else 'FAILED'}")
    
    # Calculate overall result
    passed = sum(results)
    total = len(results)
    print(f"\n=== Test Summary ===")
    print(f"Passed: {passed}/{total} tests")
    
    if passed == total:
        print("✅ All tests passed!")
        return True
    else:
        print("❌ Some tests failed.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)