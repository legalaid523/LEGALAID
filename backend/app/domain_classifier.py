"""
Domain Classification Module
Uses a pre-trained transformer model to classify documents into domains
"""

import os
from pathlib import Path
from typing import Dict, List, Tuple
try:
    from torch import Tensor
    import torch
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False

# Get the path to the model directory
MODEL_DIR = Path(__file__).parent / "models" / "domain_classifier"


class KeywordDomainClassifier:
    """Fallback classifier based on domain keywords when deep learning dependencies or weights are absent."""

    def __init__(self):
        self.device = "cpu"
        self.labels = {0: "consumer", 1: "labor", 2: "tenant"}
        self.keywords = {
            "tenant": ["rent", "landlord", "deposit", "lease", "evict", "flat", "house", "tenant", "apartment", "owner"],
            "labor": ["salary", "employer", "employee", "wage", "boss", "work", "job", "terminate", "fired", "labor", "overtime"],
            "consumer": ["refund", "product", "defective", "warranty", "seller", "bought", "amazon", "flipkart", "service", "charge", "consumer"],
        }

    def classify(self, text: str, top_k: int = 1) -> List[Dict]:
        lower_text = text.lower()
        scores = {"tenant": 0, "labor": 0, "consumer": 0}
        for dom, kw_list in self.keywords.items():
            for kw in kw_list:
                if kw in lower_text:
                    scores[dom] += 1

        total = sum(scores.values())
        if total == 0:
            results = [
                {"domain": "tenant", "confidence": 0.85},
                {"domain": "labor", "confidence": 0.10},
                {"domain": "consumer", "confidence": 0.05},
            ]
        else:
            sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
            results = [
                {"domain": dom, "confidence": round(score / total, 4) if total > 0 else 0.33}
                for dom, score in sorted_scores
            ]

        return results[:top_k]

    def batch_classify(self, texts: List[str], top_k: int = 1) -> List[List[Dict]]:
        return [self.classify(t, top_k=top_k) for t in texts]


class DomainClassifier:
    def __init__(self, model_path: str = None):
        if model_path is None:
            model_path = str(MODEL_DIR)

        self.fallback = None
        if not HAS_TORCH:
            print("PyTorch or Transformers not installed. Using lightweight fallback domain classifier.")
            self.fallback = KeywordDomainClassifier()
            self.labels = self.fallback.labels
            self.device = "cpu"
            return

        weights_exist = any(
            (Path(model_path) / f).exists() for f in ["pytorch_model.bin", "model.safetensors"]
        )
        if not weights_exist or not Path(model_path).exists():
            print(f"Model weights not found at {model_path}. Using lightweight fallback domain classifier.")
            self.fallback = KeywordDomainClassifier()
            self.labels = self.fallback.labels
            self.device = "cpu"
            return

        try:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self.tokenizer = AutoTokenizer.from_pretrained(model_path)
            self.model = AutoModelForSequenceClassification.from_pretrained(model_path)
            self.model.to(self.device)
            self.model.eval()
            self.labels = self.model.config.id2label
        except Exception as e:
            print(f"Error loading transformer model ({e}). Falling back to keyword classifier.")
            self.fallback = KeywordDomainClassifier()
            self.labels = self.fallback.labels
            self.device = "cpu"

    def classify(self, text: str, top_k: int = 1) -> List[Dict]:
        if self.fallback is not None:
            return self.fallback.classify(text, top_k=top_k)
        """
        Classify text into domains
        
        Args:
            text: Input text to classify
            top_k: Return top k predictions (default: 1)
        
        Returns:
            List of dicts with 'domain' and 'confidence' keys
        """
        # Tokenize input
        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True
        )
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        # Get predictions
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probabilities = torch.nn.functional.softmax(logits, dim=-1)
        
        # Get top predictions
        top_probs, top_indices = torch.topk(
            probabilities[0], 
            k=min(top_k, len(self.labels))
        )
        
        # Format results
        results = []
        for prob, idx in zip(top_probs, top_indices):
            domain = self.labels.get(idx.item(), "Unknown")
            confidence = prob.item()
            results.append({
                "domain": domain,
                "confidence": round(confidence, 4)
            })
        
        return results
    
    def batch_classify(
        self, 
        texts: List[str], 
        top_k: int = 1
    ) -> List[List[Dict]]:
        """
        Classify multiple texts
        
        Args:
            texts: List of texts to classify
            top_k: Return top k predictions for each text
        
        Returns:
            List of classification results for each text
        """
        results = []
        for text in texts:
            result = self.classify(text, top_k=top_k)
            results.append(result)
        return results


# Global classifier instance (lazy loaded)
_classifier_instance = None


def get_classifier() -> DomainClassifier:
    """
    Get or create the domain classifier instance
    (Singleton pattern to avoid reloading the model)
    """
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = DomainClassifier()
    return _classifier_instance


# Example usage
if __name__ == "__main__":
    # Initialize classifier
    classifier = DomainClassifier()
    
    # Example: Single prediction
    text = "Consumer protection regulations require disclosure of rights"
    result = classifier.classify(text, top_k=2)
    print(f"\nText: {text}")
    print(f"Predictions: {result}")
    
    # Example: Batch prediction
    texts = [
        "All employees must follow labor laws",
        "Tenants have rights under housing regulations",
        "Consumer protection is important"
    ]
    batch_results = classifier.batch_classify(texts, top_k=1)
    print(f"\nBatch results:")
    for text, results in zip(texts, batch_results):
        print(f"  {text} → {results[0]['domain']}")
