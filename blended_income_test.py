#!/usr/bin/env python3
"""
Additional tests for blended income feature compatibility.
Tests that the backend can handle blended income data structures if sent from frontend.
"""
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

def test_blended_income_data_handling():
    """Test that backend can handle blended income data structures"""
    print("\n=== Testing Blended Income Data Handling ===")
    try:
        # Simulate blended income data that might be sent from frontend
        blended_income_data = {
            "client_name": "BlendedIncomeUser",
            "income_type": "blended",
            "w2_income": 150000,
            "business_profit": 350000,
            "combined_income": 500000,
            "w2_percentage": 30,
            "business_percentage": 70,
            "profile_data": {
                "user_type": "blended",
                "has_partners": False,
                "entity_structure": "S-Corp",
                "capital_available": 250000,
                "strategy_goals": ["tax_reduction", "wealth_building"]
            }
        }
        
        # Test that the backend accepts this data structure in status endpoint
        response = requests.post(f"{API_URL}/status", json=blended_income_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "id" in response.json(), "Response does not contain 'id' field"
        assert "client_name" in response.json(), "Response does not contain 'client_name' field"
        assert response.json()["client_name"] == "BlendedIncomeUser", f"Expected 'BlendedIncomeUser', got {response.json()['client_name']}"
        
        print("✅ Backend successfully handled blended income data structure")
        return True, response.json()["id"]
    except Exception as e:
        print(f"❌ Blended income data handling test failed: {str(e)}")
        return False, None

def test_complex_strategy_data():
    """Test that backend can handle complex strategy data from JSON-driven approach"""
    print("\n=== Testing Complex Strategy Data Handling ===")
    try:
        # Simulate complex strategy data that might be sent from frontend
        strategy_data = {
            "client_name": "StrategyTestUser",
            "selected_strategies": [
                {
                    "id": "f-reorg-c-corp",
                    "name": "F-Reorg to C-Corp",
                    "category": "Setup & Structure",
                    "complexity": "Advanced",
                    "estimated_savings": 45000,
                    "implementation_status": "not_started",
                    "eligibility_met": True,
                    "quantified_example": {
                        "scenario": "High-income business owner",
                        "savings_amount": 45000,
                        "tax_rate_reduction": "15%"
                    }
                },
                {
                    "id": "tax-aware-hedge-fund",
                    "name": "Tax-Aware Hedge Fund",
                    "category": "Deduction Strategies",
                    "complexity": "Advanced",
                    "estimated_savings": 75000,
                    "implementation_status": "in_progress",
                    "eligibility_met": True
                }
            ],
            "total_estimated_savings": 120000,
            "forecast_data": {
                "time_horizon": 10,
                "return_rate": 0.08,
                "wealth_multiplier_enabled": True,
                "lifetime_impact": 1500000
            }
        }
        
        response = requests.post(f"{API_URL}/status", json=strategy_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "id" in response.json(), "Response does not contain 'id' field"
        assert response.json()["client_name"] == "StrategyTestUser", f"Expected 'StrategyTestUser', got {response.json()['client_name']}"
        
        print("✅ Backend successfully handled complex strategy data")
        return True
    except Exception as e:
        print(f"❌ Complex strategy data handling test failed: {str(e)}")
        return False

def test_backward_compatibility():
    """Test that existing simple data structures still work"""
    print("\n=== Testing Backward Compatibility ===")
    try:
        # Test with simple data structure (original format)
        simple_data = {"client_name": "SimpleUser"}
        
        response = requests.post(f"{API_URL}/status", json=simple_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert response.json()["client_name"] == "SimpleUser", f"Expected 'SimpleUser', got {response.json()['client_name']}"
        
        print("✅ Backward compatibility maintained for simple data structures")
        return True
    except Exception as e:
        print(f"❌ Backward compatibility test failed: {str(e)}")
        return False

def test_data_persistence_with_complex_data():
    """Test that complex data persists correctly in MongoDB"""
    print("\n=== Testing Data Persistence with Complex Data ===")
    try:
        # Create a complex data entry
        complex_data = {
            "client_name": "PersistenceTestUser",
            "income_profile": {
                "type": "blended",
                "w2_income": 200000,
                "business_profit": 300000,
                "total": 500000
            },
            "strategy_selections": ["qof", "cost-segregation", "installment-sale"],
            "forecast_settings": {
                "time_horizon": 15,
                "return_rate": 0.07,
                "wealth_loop": True
            }
        }
        
        # Post the data
        post_response = requests.post(f"{API_URL}/status", json=complex_data)
        assert post_response.status_code == 200, f"Expected status code 200, got {post_response.status_code}"
        
        created_id = post_response.json()["id"]
        print(f"Created complex data entry with ID: {created_id}")
        
        # Retrieve all data and verify our complex entry exists
        get_response = requests.get(f"{API_URL}/status")
        assert get_response.status_code == 200, f"Expected status code 200, got {get_response.status_code}"
        
        found = False
        for status in get_response.json():
            if status.get("id") == created_id:
                found = True
                assert status["client_name"] == "PersistenceTestUser"
                print(f"✅ Complex data persisted correctly with ID {created_id}")
                break
        
        assert found, f"Could not find complex data entry with ID {created_id}"
        
        print("✅ Data persistence test with complex data passed")
        return True
    except Exception as e:
        print(f"❌ Data persistence test with complex data failed: {str(e)}")
        return False

def run_blended_income_tests():
    """Run all blended income compatibility tests"""
    print("\n=== Running Blended Income Compatibility Tests ===")
    
    tests = [
        ("Blended Income Data Handling", lambda: test_blended_income_data_handling()[0]),
        ("Complex Strategy Data Handling", test_complex_strategy_data),
        ("Backward Compatibility", test_backward_compatibility),
        ("Data Persistence with Complex Data", test_data_persistence_with_complex_data)
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
    print(f"\n=== Blended Income Test Summary ===")
    print(f"Passed: {passed}/{total} tests")
    
    if passed == total:
        print("✅ All blended income compatibility tests passed!")
        return True
    else:
        print("❌ Some blended income compatibility tests failed.")
        return False

if __name__ == "__main__":
    success = run_blended_income_tests()
    sys.exit(0 if success else 1)