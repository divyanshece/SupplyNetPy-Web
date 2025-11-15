# SupplyNet Web

A professional web-based platform for designing, simulating, and analyzing supply chain networks using discrete-event simulation.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://supply-net-web.vercel.app)
[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/react-18.x-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Overview

SupplyNet Web transforms complex supply chain simulation from a command-line Python library into an accessible, visual web application. Built on SupplyNetPy, it enables supply chain professionals to design multi-tier networks, configure inventory policies, and analyze performance metrics without programming expertise.

**Live Demo:** [supply-net-web.vercel.app](https://supply-net-web.vercel.app)

---

## Key Features

- **Visual Network Builder** - Drag-and-drop interface for designing supply chain topologies
- **Discrete-Event Simulation** - Powered by SupplyNetPy for accurate modeling
- **Multiple Inventory Policies** - Support for (s,S) and (R,Q) policies
- **Real-Time Analytics** - Comprehensive dashboards with financial and operational metrics
- **Scenario Comparison** - Compare multiple configurations for optimization
- **Cloud Integration** - Save and load networks using Supabase
- **Authentication** - Email/password and Google OAuth support
- **Dark Mode** - Full theme support with persistent preferences

---

## Technology Stack

**Frontend**
- React 18.x with Material-UI
- ReactFlow for network visualization
- Recharts for analytics
- Supabase client for authentication

**Backend**
- FastAPI (Python 3.8+)
- SupplyNetPy simulation engine
- Supabase for database
- CORS-enabled REST API

**Infrastructure**
- Vercel (Frontend hosting)
- Supabase (Backend as a Service)
- GitHub Actions (CI/CD)

---

## Quick Start

### Prerequisites

- Node.js 16.x or higher
- Python 3.8 or higher
- Supabase account (free tier)

### Installation

1. **Clone repository**
```bash
git clone https://github.com/divyanshece/SupplyNetWeb.git
cd SupplyNetWeb
```

2. **Setup Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
```

4. **Configure Environment**

Create `frontend/.env`:
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

Create `backend/.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_role_key
```

5. **Run Application**

Backend:
```bash
cd backend
python app.py
```

Frontend:
```bash
cd frontend
npm start
```

Access at `http://localhost:3000`

---

## Usage

### Basic Workflow

1. **Sign In** - Use email/password or Google OAuth
2. **Build Network** - Add nodes (Suppliers, Factories, Distributors, Retailers)
3. **Configure** - Set inventory policies and demand patterns
4. **Simulate** - Run discrete-event simulation
5. **Analyze** - Review metrics and visualizations
6. **Compare** - Save scenarios and compare results

### Example Network
```
Supplier → Factory → Distributor → Retailer → Customer Demand
```

---

## Project Structure
```
SupplyNetWeb/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── App.js
│   └── package.json
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── .env
├── docs/
│   ├── USER_GUIDE.md
│   ├── API_REFERENCE.md
│   └── DEPLOYMENT.md
└── README.md
```

---

## API Example

### Run Simulation
```http
POST /api/simulate
Authorization: Bearer {token}
Content-Type: application/json

{
  "network": {
    "nodes": [...],
    "links": [...],
    "demands": [...]
  },
  "simTime": 365
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "totalCost": 45230.50,
    "fillRate": 0.98,
    "avgInventory": 85.3,
    "stockouts": 5
  }
}
```

Full API documentation: [docs/API_REFERENCE.md](docs/API_REFERENCE.md)

---

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Backend (Heroku/Railway)
1. Create new app
2. Configure environment
3. Deploy from GitHub

Detailed guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## Database Schema
```sql
CREATE TABLE networks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255),
  data JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE scenarios (
  id UUID PRIMARY KEY,
  network_id UUID REFERENCES networks(id),
  name VARCHAR(255),
  results JSONB,
  created_at TIMESTAMP
);
```

---

## Performance

- Initial page load: < 2 seconds
- Network rendering: < 1 second
- Simulation execution: < 5 seconds (typical)
- Analytics rendering: < 500ms

---

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open Pull Request

---

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

## Author

**Divyansh Pandey**
- GitHub: [@divyanshece](https://github.com/divyanshece)
- LinkedIn: [divyanshece](https://linkedin.com/in/divyanshece)
- Email: divyanshece242@gmail.com

---

## Acknowledgments

- [SupplyNetPy](https://supplychainsimulation.github.io/SupplyNetPy/) - Simulation engine
- [Material-UI](https://mui.com/) - Component library
- [ReactFlow](https://reactflow.dev/) - Network visualization
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Vercel](https://vercel.com/) - Frontend hosting

---

## Documentation

- [User Guide](docs/USER_GUIDE.md)
- [API Reference](docs/API_REFERENCE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

---

## Support

- **Issues:** [GitHub Issues](https://github.com/divyanshece/SupplyNetWeb/issues)
- **Email:** divyanshece242@gmail.com
- **Documentation:** [docs/](docs/)

---

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Status:** Production Ready
