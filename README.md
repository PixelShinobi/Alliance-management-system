# Alliance Management System

A full-stack web application for managing alliance members with Python FastAPI backend and React TypeScript frontend.

## Features

- **Member Management**: Add, edit, delete, and view alliance members
- **Member Details**: Track name, ID, power, merits, units killed, and units dead
- **Statistics Dashboard**: View total alliance statistics at a glance
- **Search & Filter**: Search members by name or member ID
- **Responsive Design**: Works on desktop and mobile devices
- **RESTful API**: Clean API endpoints for all operations

## Technology Stack

### Backend
- **Python 3.8+**
- **FastAPI**: Modern, fast web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **SQLite**: Lightweight database
- **Pydantic**: Data validation

### Frontend
- **React 18**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool
- **Axios**: HTTP client

## Project Structure

```
Alliance-management-system/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application
│   │   ├── models.py        # Database models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── crud.py          # CRUD operations
│   │   └── database.py      # Database configuration
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── package.json         # Node dependencies
│   └── vite.config.ts       # Vite configuration
└── README.md
```

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- **Linux/Mac**:
  ```bash
  source venv/bin/activate
  ```
- **Windows**:
  ```bash
  venv\Scripts\activate
  ```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run the backend server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at http://localhost:8000

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the frontend development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:3000

## Usage

1. **Access the Application**: Open http://localhost:3000 in your browser

2. **View Statistics**: See alliance totals at the top of the page

3. **Add a Member**:
   - Click the "Add Member" button
   - Fill in the member details
   - Click "Add Member" to save

4. **Edit a Member**:
   - Click "Edit" on any member row
   - Update the information
   - Click "Update Member" to save

5. **Delete a Member**:
   - Click "Delete" on any member row
   - Confirm the deletion

6. **Search Members**:
   - Enter a name or member ID in the search box
   - Click "Search" or press Enter
   - Click "Clear" to reset the search

## API Endpoints

### GET /api/members
Get all alliance members
- Query params: `search` (optional), `skip`, `limit`
- Response: List of members

### GET /api/members/{id}
Get a specific member by ID
- Response: Member object

### POST /api/members
Create a new member
- Body: Member data (name, member_id, power, merits, units_killed, units_dead)
- Response: Created member

### PUT /api/members/{id}
Update a member
- Body: Updated member data (all fields optional)
- Response: Updated member

### DELETE /api/members/{id}
Delete a member
- Response: 204 No Content

### GET /api/stats
Get alliance statistics
- Response: Total stats (members, power, merits, units killed, units dead)

## API Documentation

When the backend is running, you can access the interactive API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database Schema

### AllianceMember Table
| Field        | Type    | Description                |
|--------------|---------|----------------------------|
| id           | Integer | Primary key (auto)         |
| name         | String  | Member name                |
| member_id    | Integer | Unique member identifier   |
| power        | Integer | Power level                |
| merits       | Integer | Merit points               |
| units_killed | Integer | Number of units killed     |
| units_dead   | Integer | Number of units lost       |

## Development

### Backend Development
- The backend uses SQLite for simplicity
- Database file: `alliance.db` (created automatically)
- Run with `--reload` flag for auto-restart on code changes

### Frontend Development
- Uses Vite for fast HMR (Hot Module Replacement)
- TypeScript for type safety
- Axios for API calls with automatic proxy configuration

## Building for Production

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## Troubleshooting

### Port already in use
If port 8000 or 3000 is already in use, you can change the port:
- Backend: Add `--port 8001` to the uvicorn command
- Frontend: Update `server.port` in `vite.config.ts`

### CORS errors
Make sure both backend and frontend are running and the CORS configuration in `backend/app/main.py` includes your frontend URL.

### Database issues
Delete the `alliance.db` file to reset the database. It will be recreated on next startup.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
