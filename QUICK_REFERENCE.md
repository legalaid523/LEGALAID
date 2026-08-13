# 🚀 QUICK REFERENCE CARD - Domain Classification

## Server Status
✓ **Running at:** http://localhost:8000  
✓ **Docs at:** http://localhost:8000/docs  
✓ **Port:** 8000

---

## 🔗 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Health check |
| `/classify` | POST | Classify single text |
| `/classify/batch` | POST | Classify multiple texts |
| `/model/info` | GET | Model details |

---

## 💡 Example Requests

### Single Classification
```json
POST /classify
{
  "text": "The landlord hasn't returned my security deposit",
  "top_k": 1
}
```

### Batch Classification
```json
POST /classify/batch
{
  "texts": [
    "Tenant rights issue",
    "Labor law issue"
  ],
  "top_k": 1
}
```

---

## 📊 Domains

| Domain | Type | Example |
|--------|------|---------|
| **tenant** | Housing disputes | Security deposits, evictions |
| **labor** | Employment issues | Wages, discrimination |
| **consumer** | Product/service | Defects, fraud, warranty |

---

## ✨ Response Format

```json
{
  "domain": "tenant",
  "confidence": 0.5474
}
```

---

## 🧪 Quick Test

```bash
# Terminal 1: Start server
cd e:\HackOrbit\backend
python -m uvicorn app.main:app --reload

# Terminal 2: Run tests
python test_api.py
```

Expected: **5/5 Tests Passed** ✓

---

## 💻 Frontend Usage

```javascript
import DomainClassifier from './components/DomainClassifier';

<DomainClassifier 
  onClassify={(domain, confidence) => {
    console.log(`${domain}: ${confidence * 100}%`);
  }}
/>
```

---

## 📁 Key Files

```
backend/
├── app/domain_classifier.py      ← Model loader
├── app/main.py                   ← API server
├── test_api.py                   ← API tests
└── test_domain_classifier.py     ← Model tests

frontend/
└── src/components/
    └── DomainClassifier.jsx      ← React component
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 8000 in use | `netstat -ano \| findstr :8000` then kill |
| Model not found | Check `app/models/domain_classifier/` |
| CORS error | Frontend must be on localhost |
| Server won't start | Check terminal for error message |

---

## 📚 Full Documentation

See: `DOMAIN_CLASSIFICATION_GUIDE.md` & `SETUP_COMPLETE.md`

---

## Status: ✅ READY

All components tested and working!
