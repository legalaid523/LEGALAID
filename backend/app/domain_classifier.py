"""
Domain Classification Module
Uses a pre-trained transformer model to classify documents into domains
"""

import os
from pathlib import Path
from typing import Dict, List, Tuple
from torch import Tensor
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Get the path to the model directory
MODEL_DIR = Path(__file__).parent / "models" / "domain_classifier"


class DomainClassifier:
    """
    Domain Classifier using transformer model
    
    Attributes:
        model: The pre-trained transformer model
        tokenizer: The model's tokenizer
        device: GPU or CPU device
        labels: List of domain labels
    """
    
    def __init__(self, model_path: str = None):
        """
        Initialize the domain classifier
        
        Args:
            model_path: Path to model directory. 
                       If None, uses default MODEL_DIR
        
        Raises:
            FileNotFoundError: If model files not found
        """
        if model_path is None:
            model_path = str(MODEL_DIR)
        
        if not Path(model_path).exists():
            raise FileNotFoundError(
                f"Model directory not found at {model_path}\n"
                f"Please extract the model zip to: {MODEL_DIR}"
            )
        
        # Set device (GPU if available, else CPU)
        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )
        print(f"Using device: {self.device}")
        
        # Load tokenizer and model
        print(f"Loading model from {model_path}...")
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForSequenceClassification.from_pretrained(
            model_path
        )
        self.model.to(self.device)
        self.model.eval()  # Set to evaluation mode
        
        # Get label names from model config
        self.labels = self.model.config.id2label
        print(f"Model loaded successfully with {len(self.labels)} domains")
    
    def classify(
        self, 
        text: str, 
        top_k: int = 1
    ) -> List[Dict]:
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
