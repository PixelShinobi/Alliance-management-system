from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AllianceMemberBase(BaseModel):
    """Base schema for alliance member"""
    name: str = Field(..., description="Member name (can be text or numbers)")
    member_id: int = Field(..., description="Unique member ID")
    power: int = Field(default=0, ge=0, description="Member power level")
    merits: int = Field(default=0, ge=0, description="Member merits")
    units_killed: int = Field(default=0, ge=0, description="Units killed by member")
    units_dead: int = Field(default=0, ge=0, description="Units dead for member")
    role: Optional[str] = Field(default="Member", description="Member role: Leader, R4, or Member")
    notes: Optional[str] = Field(default="", description="Admin notes about this member")


class AllianceMemberCreate(AllianceMemberBase):
    """Schema for creating a new alliance member"""
    pass


class AllianceMemberUpdate(BaseModel):
    """Schema for updating an alliance member (all fields optional)"""
    name: Optional[str] = None
    member_id: Optional[int] = None
    power: Optional[int] = Field(default=None, ge=0)
    merits: Optional[int] = Field(default=None, ge=0)
    units_killed: Optional[int] = Field(default=None, ge=0)
    units_dead: Optional[int] = Field(default=None, ge=0)
    role: Optional[str] = None
    notes: Optional[str] = None


class AllianceMember(AllianceMemberBase):
    """Schema for alliance member response"""
    id: int
    last_updated: Optional[datetime] = Field(default=None, description="Last updated timestamp")
    merit_to_power_ratio: Optional[float] = Field(default=None, description="Merits to power percentage")
    kd_ratio: Optional[float] = Field(default=None, description="Kill/Death ratio")
    contribution_percentage: Optional[float] = Field(default=None, description="Contribution to total merits")

    class Config:
        from_attributes = True
