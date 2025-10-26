from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import io
import csv

from . import models, schemas, crud
from .database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Alliance Management System",
    description="API for managing alliance members",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "https://gray-emu-154188.hostingersite.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    """Root endpoint"""
    return {"message": "Alliance Management System API", "version": "1.0.0"}


@app.get("/api/members", response_model=List[schemas.AllianceMember])
def get_all_members(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all alliance members with optional search"""
    return crud.get_members_with_calculations(db, skip=skip, limit=limit, search=search)


@app.get("/api/members/{member_id}", response_model=schemas.AllianceMember)
def get_member(member_id: int, db: Session = Depends(get_db)):
    """Get a specific alliance member by ID"""
    db_member = crud.get_member(db, member_id=member_id)
    if db_member is None:
        raise HTTPException(status_code=404, detail="Member not found")
    total_merits = sum(m.merits for m in crud.get_members(db))
    return crud.add_calculated_fields(db_member, total_merits)


@app.post("/api/members", response_model=schemas.AllianceMember, status_code=201)
def create_member(member: schemas.AllianceMemberCreate, db: Session = Depends(get_db)):
    """Create a new alliance member"""
    # Check if member_id already exists
    existing_member = crud.get_member_by_member_id(db, member_id=member.member_id)
    if existing_member:
        raise HTTPException(status_code=400, detail="Member ID already exists")

    db_member = crud.create_member(db=db, member=member)
    total_merits = sum(m.merits for m in crud.get_members(db))
    return crud.add_calculated_fields(db_member, total_merits)


@app.put("/api/members/{member_id}", response_model=schemas.AllianceMember)
def update_member(
    member_id: int,
    member_update: schemas.AllianceMemberUpdate,
    db: Session = Depends(get_db)
):
    """Update an alliance member"""
    # If updating member_id, check for conflicts
    if member_update.member_id is not None:
        existing = crud.get_member_by_member_id(db, member_id=member_update.member_id)
        if existing and existing.id != member_id:
            raise HTTPException(status_code=400, detail="Member ID already exists")

    db_member = crud.update_member(db, member_id=member_id, member_update=member_update)
    if db_member is None:
        raise HTTPException(status_code=404, detail="Member not found")
    total_merits = sum(m.merits for m in crud.get_members(db))
    return crud.add_calculated_fields(db_member, total_merits)


@app.delete("/api/members/{member_id}", status_code=204)
def delete_member(member_id: int, db: Session = Depends(get_db)):
    """Delete an alliance member"""
    success = crud.delete_member(db, member_id=member_id)
    if not success:
        raise HTTPException(status_code=404, detail="Member not found")
    return None


@app.get("/api/stats")
def get_statistics(db: Session = Depends(get_db)):
    """Get alliance statistics"""
    return crud.get_total_stats(db)


@app.get("/api/export-csv")
def export_to_csv(db: Session = Depends(get_db)):
    """Export all members to CSV file"""
    members = crud.get_members_with_calculations(db, skip=0, limit=10000)

    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow([
        'name', 'member_id', 'power', 'merits', 'units_killed', 'units_dead',
        'role', 'notes', 'merit_to_power_ratio', 'kd_ratio', 'contribution_percentage', 'last_updated'
    ])

    # Write data
    for member in members:
        writer.writerow([
            member.get('name', ''),
            member.get('member_id', ''),
            member.get('power', 0),
            member.get('merits', 0),
            member.get('units_killed', 0),
            member.get('units_dead', 0),
            member.get('role', 'Member'),
            member.get('notes', ''),
            f"{member.get('merit_to_power_ratio', 0):.2f}" if member.get('merit_to_power_ratio') else '',
            f"{member.get('kd_ratio', 0):.2f}" if member.get('kd_ratio') else '',
            f"{member.get('contribution_percentage', 0):.2f}" if member.get('contribution_percentage') else '',
            member.get('last_updated', '')
        ])

    # Return as downloadable file
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=alliance_members.csv"}
    )


@app.post("/api/members/bulk-delete")
def bulk_delete_members(member_ids: List[int], db: Session = Depends(get_db)):
    """Delete multiple members by their database IDs"""
    deleted_count = 0
    failed_ids = []

    for member_id in member_ids:
        if crud.delete_member(db, member_id=member_id):
            deleted_count += 1
        else:
            failed_ids.append(member_id)

    return {
        "deleted_count": deleted_count,
        "failed_count": len(failed_ids),
        "failed_ids": failed_ids
    }
