# Domain Classification - Complete Integration Guide

## ✅ Current Status

All domain classification components are fully operational:
- ✓ Model loaded and tested
- ✓ FastAPI server running
- ✓ All endpoints tested (5/5 passing)
- ✓ Frontend component ready

---

## 🎯 Quick Start - Using Domain Classification

### **Backend: API Server**

The server is running at: **http://localhost:8000**

To start it manually:
```bash
cd e:\HackOrbit\backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Interactive API docs: **http://localhost:8000/docs**

---

## 🔗 API Endpoints

### **1. Health Check**
```bash
GET /
```
Returns server status.

**Response:**
```json
{
  "status": "ok",
  "message": "HackOrbit API is running",
  "version": "1.0.0"
}
```

---

### **2. Classify Single Text**
```bash
POST /classify
```
Classify one piece of text into a domain.

**Request:**
```json
{
  "text": "The landlord hasn't returned my security deposit",
  "top_k": 1
}
```

**Response:**
```json
[
  {
    "domain": "tenant",
    "confidence": 0.5474
  }
]
```

---

### **3. Classify Batch (Multiple Texts)**
```bash
POST /classify/batch
```
Classify multiple texts at once.

**Request:**
```json
{
  "texts": [
    "Tenant rights and security deposits",
    "Labor law and workplace safety",
    "Consumer protection regulations"
  ],
  "top_k": 1
}
```

**Response:**
```json
[
  {
    "text": "Tenant rights and security deposits",
    "predictions": [
      {"domain": "tenant", "confidence": 0.4120}
    ]
  },
  {
    "text": "Labor law and workplace safety",
    "predictions": [
      {"domain": "labor", "confidence": 0.3814}
    ]
  },
  {
    "text": "Consumer protection regulations",
    "predictions": [
      {"domain": "consumer", "confidence": 0.3737}
    ]
  }
]
```

---

### **4. Get Model Information**
```bash
GET /model/info
```
Get details about the loaded model.

**Response:**
```json
{
  "status": "loaded",
  "device": "cpu",
  "num_domains": 3,
  "domains": {
    "0": "consumer",
    "1": "labor",
    "2": "tenant"
  }
}
```

---

## 💻 Frontend Integration

### **React Component: DomainClassifier**

Located at: `frontend/src/components/DomainClassifier.jsx`

#### **Import and Use:**
```jsx
import DomainClassifier from './components/DomainClassifier';

function App() {
  const handleClassify = (domain, confidence) => {
    console.log(`Classified as: ${domain} (${confidence * 100}%)`);
    // Pass domain to next step (fact extraction)
  };

  return (
    <div>
      <DomainClassifier 
        onClassify={handleClassify}
        onError={(error) => console.error(error)}
      />
    </div>
  );
}
```

#### **Features:**
- Real-time text input
- Single/batch classification
- Confidence visualization
- Example texts
- Error handling
- Loading states

---

## 🚀 Using the Full Pipeline

### **Step 1: Classify Domain**
```javascript
// User enters text
const userText = "My landlord hasn't returned my deposit";

// Frontend calls API
const response = await fetch('http://localhost:8000/classify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: userText,
    top_k: 1
  })
});

const [prediction] = await response.json();
// Result: { domain: "tenant", confidence: 0.5474 }
```

### **Step 2: Extract Facts** (When ready)
```javascript
// Pass domain to extraction module
const domain = prediction.domain; // "tenant"

// Call extraction API (to be built)
const extractionResponse = await fetch('http://localhost:8000/extract', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: userText,
    domain: domain
  })
});
```

### **Step 3: Map Sections** (When ready)
```javascript
// Pass extracted facts to mapper
const facts = extractionResult;

// Call mapping API (to be built)
const mappingResponse = await fetch('http://localhost:8000/map-sections', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    facts: facts,
    domain: domain
  })
});
```

---

## 📊 Project Structure

```
HackOrbit/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   └── domain_classifier/      (✓ Model files extracted)
│   │   ├── domain_classifier.py        (✓ Classifier class)
│   │   ├── main.py                     (✓ FastAPI endpoints)
│   │   ├── schemas.py                  (For fact extraction - future)
│   │   ├── extraction.py               (For fact extraction - future)
│   │   └── section_mapper.py           (For section mapping - future)
│   ├── requirements-minimal.txt        (✓ Dependencies)
│   ├── test_domain_classifier.py       (✓ Model test)
│   ├── test_api.py                     (✓ API test - All passing!)
│   └── .venv/                          (✓ Virtual environment)
│
└── frontend/
    └── src/
        └── components/
            └── DomainClassifier.jsx    (✓ React component)
```

---

## 🧪 Testing

### **Test Domain Classifier Model**
```bash
cd backend
python test_domain_classifier.py
```

### **Test API Endpoints**
```bash
cd backend
python test_api.py
```

Expected output: **5/5 Tests Passed** ✓

---

## 🔧 Configuration

### **API Server Settings** (in `app/main.py`)
- Host: `0.0.0.0` (accessible from anywhere)
- Port: `8000`
- CORS: Enabled for frontend on `localhost:5173` and `localhost:3000`
- Reload: Enabled for development

### **Model Settings** (in `app/domain_classifier.py`)
- Model path: `app/models/domain_classifier/`
- Device: Auto-detects GPU; falls back to CPU
- Tokenizer: AutoTokenizer from HuggingFace
- Model: AutoModelForSequenceClassification

---

## 🎓 Understanding the Output

### **Domain Classification Result:**
```json
{
  "domain": "tenant",        // Predicted category
  "confidence": 0.5474       // 0.0-1.0 confidence score
}
```

### **What the domains mean:**
- **tenant**: Landlord-tenant disputes, deposits, evictions, leases
- **labor**: Employment, wages, discrimination, workplace safety
- **consumer**: Product defects, fraud, privacy, warranties

### **Confidence Interpretation:**
- **> 0.7**: High confidence (reliable)
- **0.5-0.7**: Medium confidence (reasonable)
- **< 0.5**: Low confidence (may need manual review)

---

## 🚦 Next Steps - Building Fact Extraction

Once domain classification is complete:

1. ✅ Domain classifier ready
2. ⏳ Fact extraction (extracts structured data from text)
3. ⏳ Section mapper (matches facts to legal sections)

To proceed with fact extraction, you'll need:
- `schemas.py`: Dynamic Pydantic models from JSON schemas
- `extraction.py`: LLM-based fact extraction using Claude
- `section_mapper.py`: Deterministic rule-based mapping

---

## 💡 Tips & Troubleshooting

### **Server Won't Start?**
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill the process if needed
taskkill /PID <PID> /F
```

### **CORS Errors in Frontend?**
The API is CORS-enabled. Make sure frontend is on:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (alternative)

### **Model Loading Slow?**
First load takes time as model is downloaded into memory. Subsequent calls are fast.

### **Classification Accuracy Issues?**
The model works best with:
- Clear, descriptive text
- Context about the legal issue
- Longer descriptions (vs. short phrases)

---

## 📚 Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `domain_classifier.py` | Model loader & classifier | ✓ Ready |
| `main.py` | FastAPI endpoints | ✓ Ready |
| `test_domain_classifier.py` | Model validation test | ✓ Ready |
| `test_api.py` | API endpoint tests | ✓ Ready (5/5 passing) |
| `DomainClassifier.jsx` | React UI component | ✓ Ready |
| `schemas.py` | (Future: fact schemas) | ⏳ Next |
| `extraction.py` | (Future: LLM extraction) | ⏳ Next |
| `section_mapper.py` | (Future: rule mapping) | ⏳ Next |

---

## ✨ Summary

**Domain Classification is fully operational!**

- Model: ✓ Loaded
- API Server: ✓ Running
- Endpoints: ✓ All 5 tests passing
- Frontend: ✓ React component ready
- Documentation: ✓ Complete

**Ready to use!** Start classifying legal documents now.

---

**Need help?** Check the test files for examples of API usage.
