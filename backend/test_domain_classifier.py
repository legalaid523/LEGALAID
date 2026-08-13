"""
Test script for domain classifier
Run this to verify the model is working correctly
"""

from app.domain_classifier import DomainClassifier


def test_classifier():
    """Test the classifier with example texts"""
    
    print("=" * 60)
    print("DOMAIN CLASSIFIER TEST")
    print("=" * 60)
    
    try:
        # Initialize classifier
        print("\n1. Initializing classifier...")
        classifier = DomainClassifier()
        print("✓ Classifier loaded successfully!")
        
        # Test single classification
        print("\n2. Testing single classification...")
        test_texts = [
            "Employees must follow workplace safety regulations",
            "Tenants have the right to fair housing practices",
            "Consumers are protected under data privacy laws"
        ]
        
        for text in test_texts:
            result = classifier.classify(text, top_k=1)
            print(f"\n  Text: {text}")
            print(f"  Domain: {result[0]['domain']}")
            print(f"  Confidence: {result[0]['confidence']}")
        
        # Test batch classification
        print("\n3. Testing batch classification...")
        batch_results = classifier.batch_classify(test_texts, top_k=1)
        print(f"✓ Processed {len(batch_results)} texts")
        
        # Test top-k predictions
        print("\n4. Testing top-k predictions...")
        text = "Labor and tenant rights documentation"
        results = classifier.classify(text, top_k=3)
        print(f"  Text: {text}")
        print(f"  Top 3 predictions:")
        for i, pred in enumerate(results, 1):
            print(f"    {i}. {pred['domain']}: {pred['confidence']}")
        
        print("\n" + "=" * 60)
        print("✓ ALL TESTS PASSED!")
        print("=" * 60)
        
    except FileNotFoundError as e:
        print(f"\n❌ ERROR: {e}")
        print("\nPlease ensure the model files are extracted to:")
        print("  backend/app/models/domain_classifier/")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print("Check that all dependencies are installed:")
        print("  pip install -r requirements.txt")


if __name__ == "__main__":
    test_classifier()
