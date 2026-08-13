"""
Test script for Domain Classification API
Tests all endpoints without the server running in the background
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test health check endpoint"""
    print("\n" + "="*60)
    print("TEST 1: Health Check")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✓ Status Code: {response.status_code}")
        print(f"✓ Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_single_classification():
    """Test single text classification"""
    print("\n" + "="*60)
    print("TEST 2: Single Text Classification")
    print("="*60)
    try:
        test_cases = [
            {
                "text": "The landlord hasn't returned my security deposit",
                "expected_domain": "tenant"
            },
            {
                "text": "My employer hasn't paid overtime compensation",
                "expected_domain": "labor"
            },
            {
                "text": "I need to know my consumer privacy rights",
                "expected_domain": "consumer"
            }
        ]
        
        all_passed = True
        for i, test in enumerate(test_cases, 1):
            payload = {
                "text": test["text"],
                "top_k": 1
            }
            response = requests.post(f"{BASE_URL}/classify", json=payload)
            
            if response.status_code == 200:
                predictions = response.json()
                domain = predictions[0]["domain"]
                confidence = predictions[0]["confidence"]
                
                print(f"\n  Test {i}:")
                print(f"    Text: {test['text']}")
                print(f"    Predicted Domain: {domain}")
                print(f"    Confidence: {confidence:.4f}")
                print(f"    ✓ Success")
            else:
                print(f"  ❌ Test {i} Failed: {response.status_code}")
                all_passed = False
        
        return all_passed
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_batch_classification():
    """Test batch text classification"""
    print("\n" + "="*60)
    print("TEST 3: Batch Classification")
    print("="*60)
    try:
        payload = {
            "texts": [
                "Tenant rights and security deposits",
                "Labor law and workplace safety",
                "Consumer protection regulations"
            ],
            "top_k": 1
        }
        
        response = requests.post(f"{BASE_URL}/classify/batch", json=payload)
        
        if response.status_code == 200:
            batch_results = response.json()
            print(f"✓ Processed {len(batch_results)} texts")
            
            for i, result in enumerate(batch_results, 1):
                print(f"\n  Result {i}:")
                print(f"    Text: {result['text']}")
                print(f"    Domain: {result['predictions'][0]['domain']}")
                print(f"    Confidence: {result['predictions'][0]['confidence']:.4f}")
            
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_model_info():
    """Test model info endpoint"""
    print("\n" + "="*60)
    print("TEST 4: Model Info")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/model/info")
        
        if response.status_code == 200:
            info = response.json()
            print(f"✓ Status: {info['status']}")
            print(f"✓ Device: {info['device']}")
            print(f"✓ Number of Domains: {info['num_domains']}")
            print(f"✓ Domains: {list(info['domains'].values())}")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_top_k_predictions():
    """Test top-k predictions"""
    print("\n" + "="*60)
    print("TEST 5: Top-K Predictions (top_k=3)")
    print("="*60)
    try:
        payload = {
            "text": "Labor and tenant rights documentation",
            "top_k": 3
        }
        
        response = requests.post(f"{BASE_URL}/classify", json=payload)
        
        if response.status_code == 200:
            predictions = response.json()
            print(f"\n  Text: {payload['text']}")
            print(f"  Top 3 Predictions:")
            
            for i, pred in enumerate(predictions, 1):
                print(f"    {i}. {pred['domain']}: {pred['confidence']:.4f}")
            
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("DOMAIN CLASSIFICATION API - INTEGRATION TEST")
    print("="*60)
    print(f"API Base URL: {BASE_URL}")
    
    # Wait for server to be ready
    print("\n⏳ Waiting for server to be ready...")
    max_retries = 10
    for i in range(max_retries):
        try:
            requests.get(f"{BASE_URL}/")
            print("✓ Server is ready!")
            break
        except:
            if i < max_retries - 1:
                time.sleep(1)
            else:
                print("❌ Server not responding. Make sure it's running on port 8000")
                return
    
    # Run tests
    results = {
        "Health Check": test_health_check(),
        "Single Classification": test_single_classification(),
        "Batch Classification": test_batch_classification(),
        "Model Info": test_model_info(),
        "Top-K Predictions": test_top_k_predictions()
    }
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    for test_name, passed in results.items():
        status = "✓ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    total = len(results)
    passed = sum(results.values())
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! API is ready for use")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")


if __name__ == "__main__":
    main()
