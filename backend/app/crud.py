from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from . import models, schemas


def add_calculated_fields(member: models.AllianceMember, total_merits: int = None) -> dict:
    """Calculate and add all calculated fields to member data"""
    member_dict = {
        "id": member.id,
        "name": member.name,
        "member_id": member.member_id,
        "power": member.power,
        "merits": member.merits,
        "units_killed": member.units_killed,
        "units_dead": member.units_dead,
        "role": member.role,
        "notes": member.notes,
        "last_updated": member.last_updated,
        "merit_to_power_ratio": (member.merits / member.power * 100) if member.power > 0 else None,
        "kd_ratio": (member.units_killed / member.units_dead) if member.units_dead > 0 else None,
        "contribution_percentage": (member.merits / total_merits * 100) if total_merits and total_merits > 0 else None
    }
    return member_dict


def add_merit_to_power_ratio(member: models.AllianceMember) -> dict:
    """Backwards compatibility wrapper"""
    return add_calculated_fields(member)


def get_member(db: Session, member_id: int) -> Optional[models.AllianceMember]:
    """Get a single alliance member by database ID"""
    return db.query(models.AllianceMember).filter(models.AllianceMember.id == member_id).first()


def get_member_by_member_id(db: Session, member_id: int) -> Optional[models.AllianceMember]:
    """Get a single alliance member by their member ID"""
    return db.query(models.AllianceMember).filter(models.AllianceMember.member_id == member_id).first()


def get_members(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None) -> List[models.AllianceMember]:
    """Get all alliance members with optional search"""
    query = db.query(models.AllianceMember)

    if search:
        search_filter = or_(
            models.AllianceMember.name.contains(search),
            models.AllianceMember.member_id.like(f"%{search}%")
        )
        query = query.filter(search_filter)

    return query.offset(skip).limit(limit).all()


def get_members_with_calculations(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None) -> List[dict]:
    """Get all alliance members with calculated fields"""
    members = get_members(db, skip, limit, search)
    total_merits = sum(m.merits for m in db.query(models.AllianceMember).all())
    return [add_calculated_fields(member, total_merits) for member in members]


def create_member(db: Session, member: schemas.AllianceMemberCreate) -> models.AllianceMember:
    """Create a new alliance member"""
    db_member = models.AllianceMember(
        name=member.name,
        member_id=member.member_id,
        power=member.power,
        merits=member.merits,
        units_killed=member.units_killed,
        units_dead=member.units_dead,
        role=member.role or "Member",
        notes=member.notes or ""
    )
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member


def update_member(db: Session, member_id: int, member_update: schemas.AllianceMemberUpdate) -> Optional[models.AllianceMember]:
    """Update an alliance member"""
    db_member = get_member(db, member_id)
    if not db_member:
        return None

    update_data = member_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_member, field, value)

    db.commit()
    db.refresh(db_member)
    return db_member


def delete_member(db: Session, member_id: int) -> bool:
    """Delete an alliance member"""
    db_member = get_member(db, member_id)
    if not db_member:
        return False

    db.delete(db_member)
    db.commit()
    return True


def get_total_stats(db: Session) -> dict:
    """Get total statistics for all members"""
    members = db.query(models.AllianceMember).all()

    return {
        "total_members": len(members),
        "total_power": sum(m.power for m in members),
        "total_merits": sum(m.merits for m in members),
        "total_units_killed": sum(m.units_killed for m in members),
        "total_units_dead": sum(m.units_dead for m in members),
    }
